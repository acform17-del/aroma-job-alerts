AROMA JOB ALERTS — AUTOMATED GOVERNMENT NOTICE MONITOR
======================================================

WHAT THIS PACKAGE DOES
----------------------
- Daily scheduled checks of configured official recruitment pages.
- Collects possible recruitment/advertisement links into data/candidates.json.
- Creates/updates a GitHub Pull Request for admin review.
- The public website displays ONLY data/published.json.
- Admin must verify the official notice and approve it before publication.
- When approved changes are merged to the connected GitHub branch, Netlify can
  automatically redeploy the public site.

THIS IS A REVIEW-FIRST MONITOR, NOT A GOVERNMENT API
----------------------------------------------------
Government recruitment sites do not share one standard public jobs API.
Page layouts can change, some sites may block automated requests, and this
basic link scanner can miss notices or flag irrelevant links. It does not
guarantee complete coverage. It does not bypass CAPTCHAs, logins, or access
controls. Respect each website's terms, robots rules and rate limits.

OFFICIAL SOURCE PAGES CONFIGURED
--------------------------------
All India:
- UPSC: https://upsc.gov.in/whats-new
- SSC: https://ssc.gov.in/
- Railway Recruitment Board (one sample regional board): https://www.rrbcdg.gov.in/employment-notices.php
- IBPS: https://www.ibps.in/
- India Post: https://www.indiapost.gov.in/vacancies

Maharashtra:
- MPSC: https://mpsc.gov.in/adv_notification/8
- Maharashtra Police: https://www.mahapolice.gov.in/police-recruitment

These are official source starting points. Check the source directory regularly
and add more official state departments/PSUs as needed. The Railway source is a
sample RRB board; it is not a complete list of all regional RRB sites.

PUBLISHING / DEPLOYMENT SETUP
-----------------------------
A. Create a GitHub repository
1. Sign in at https://github.com/
2. Create a new repository named aroma-job-alerts.
3. Upload ALL files and folders from this project, including the hidden
   .github folder. On a computer, the easiest method is GitHub Desktop or git.
4. In repository Settings > Actions > General, allow GitHub Actions if asked.
5. Open Actions and enable the workflow if it is disabled.

B. Connect Netlify
1. Sign in at https://app.netlify.com/
2. Choose Add new site > Import an existing project.
3. Choose GitHub and authorize access to the aroma-job-alerts repository.
4. Set the publish directory to "." (the repository root); no build command.
5. Deploy. Netlify should redeploy after approved commits are pushed to main.
6. In Netlify Site configuration > Domain management, set the site name to
   aromajobalerts if it is available. This creates aromajobalerts.netlify.app.

C. Run the first check
1. Open the repository's Actions tab.
2. Choose "Check official recruitment pages".
3. Click "Run workflow".
4. Wait for the workflow to finish. If any candidate links are found, the
   workflow opens a Pull Request named "Review detected government recruitment
   notices".

ADMIN APPROVAL — HOW TO PUBLISH A JOB
-------------------------------------
1. Open the Pull Request created by the scanner.
2. Open data/candidates.json and inspect each candidate.
3. Click every official_url. Verify the notice on the official recruitment
   website. Confirm that it is a recruitment notice, not just an exam result,
   general news, old notice, or unrelated page.
4. Copy only verified items into data/published.json using this structure:

[
  {
    "title": "Exact title from the official notice",
    "organisation": "Recruiting department/organisation",
    "category": "Government",
    "deadline": "Only if confirmed; otherwise leave blank",
    "officialUrl": "https://official-government-domain/notice"
  }
]

5. Keep valid JSON syntax (double quotes, commas between records).
6. Commit the approved published.json change to the same Pull Request.
7. Merge the Pull Request only after review. The website then reads the approved
   list and Netlify deploys the change.

IMPORTANT: Do not copy all candidates automatically. The admin approval step
is deliberate. It prevents incorrect or misleading job information from going
live. Keep original official URLs, and never invent salary, vacancy count,
qualification, age limit or application deadline.

WHATSAPP
--------
The website contact button is configured for +91 7020008745.

LIMITATIONS / NEXT PHASE
------------------------
This package does not include a private admin login, database, email/SMS/push
alerts, or automatic extraction of full notification PDFs. Admin approval is
done securely through access-controlled GitHub Pull Requests. Only trusted
repository collaborators should have write/merge access.

For a production system with a browser-based admin panel, role-based access,
database, WhatsApp broadcast or email notifications, build a backend (for
example Supabase/Firebase plus server-side scheduled functions) and secure
authentication. Never put admin passwords, API keys, or service-role keys in
front-end JavaScript or public GitHub files.

WHATSAPP JOB SHARING
- Each published job card includes separate "Share to WhatsApp Channel" and "Share to WhatsApp Group" buttons.
- Both buttons prepare the job title, organisation, category, deadline, official notice link and website link in WhatsApp.
- WhatsApp opens its share flow. The administrator must select the intended Channel or Group and press Send/Post.
- These buttons do not publish automatically. Direct automated posting requires an approved WhatsApp Business/API integration and the required permissions; WhatsApp Channel posting availability depends on the account and app.


PRIVATE ADMIN WHATSAPP SHARING
------------------------------
- Public job cards do NOT show WhatsApp Channel/Group sharing buttons.
- Open /admin.html to reach the private admin login page.
- In Netlify site configuration, add environment variables: ADMIN_PASSWORD
  (choose a long unique password) and ADMIN_SESSION_SECRET (a separate
  random secret, at least 32 characters). Do not put either secret in GitHub.
- Redeploy after setting the environment variables. Admin sessions expire
  after 8 hours and use an HttpOnly, Secure, SameSite=Strict cookie.
- The admin page lists jobs from data/published.json. Share buttons open
  WhatsApp's share composer; choose your Channel or Group in WhatsApp and
  confirm manually. This starter does not post automatically.
- Keep the repository and Netlify environment variables private where possible.

ADMIN JOB POSTINGS APPROVAL AREA
--------------------------------
- After signing in at /admin.html, use "Job postings approval" to review
  detected records from data/candidates.json.
- Open each official notice and verify that it is a current recruitment notice.
  Select only verified records, then choose "Approve selected & download
  published.json".
- Review the downloaded JSON. Replace data/published.json in the GitHub
  repository with it and commit the change. Netlify will then deploy the
  approved jobs to the public website.
- This approval panel prepares the approved JSON file; it does not write to
  GitHub automatically. Keep admin credentials in Netlify environment
  variables, never in public files.
