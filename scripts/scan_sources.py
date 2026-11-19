
#!/usr/bin/env python3
"""Find possible recruitment notices on configured official pages."""
import hashlib
import json
import os
import re
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCES_FILE = os.path.join(ROOT, "sources.json")
CANDIDATES_FILE = os.path.join(ROOT, "data", "candidates.json")
LOG_FILE = os.path.join(ROOT, "data", "scan-log.json")

KEYWORDS = re.compile(
    r"(recruit|vacan|advertisement|notification|employment|career|"
    r"भरती|जाहिरात|रिक्त|नियुक्ती|पदभरती|अर्ज)", re.I
)

USER_AGENT = "AROMA-JOB-ALERTS-NoticeMonitor/1.0"

def allowed_url(url, official_domain):
    p = urlparse(url)
    return p.scheme in ("http", "https") and (
        p.hostname == official_domain or
        (p.hostname or "").endswith("." + official_domain)
    )

def main():
    with open(SOURCES_FILE, encoding="utf-8") as f:
        sources = json.load(f)

    candidates, log = [], []
    seen = set()
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    for source in sources:
        result = {
            "source": source["name"],
            "url": source["url"],
            "checked_at": datetime.now(timezone.utc).isoformat()
        }
        try:
            response = session.get(source["url"], timeout=25)
            response.raise_for_status()

            if "html" not in response.headers.get("Content-Type", "").lower():
                result["status"] = "skipped_non_html"
                log.append(result)
                continue

            soup = BeautifulSoup(response.text, "html.parser")
            found = 0

            for a in soup.find_all("a", href=True):
                title = " ".join(a.get_text(" ", strip=True).split())
                if not title or len(title) < 8 or not KEYWORDS.search(title):
                    continue

                link = urljoin(response.url, a["href"]).split("#", 1)[0]
                if not allowed_url(link, source["official_domain"]):
                    continue

                key = hashlib.sha256(link.lower().encode("utf-8")).hexdigest()
                if key in seen:
                    continue
                seen.add(key)

                candidates.append({
                    "id": key[:16],
                    "title": title[:240],
                    "source": source["name"],
                    "region": source["region"],
                    "category": "Government",
                    "official_url": link,
                    "source_page": source["url"],
                    "detected_at": datetime.now(timezone.utc).isoformat(),
                    "status": "pending_review"
                })
                found += 1

            result["status"] = "ok"
            result["candidate_links_found"] = found

        except Exception as exc:
            result["status"] = "error"
            result["error"] = str(exc)[:300]

        log.append(result)

    candidates.sort(key=lambda x: (x["region"], x["source"], x["title"].lower()))

    with open(CANDIDATES_FILE, "w", encoding="utf-8") as f:
        json.dump(candidates, f, ensure_ascii=False, indent=2)
        f.write("\n")

    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Scan complete: {len(candidates)} candidate links found. Nothing was published.")

if __name__ == "__main__":
    main()
  
