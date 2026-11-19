/*
  JOB ALERTS SITE SETTINGS
  1. Replace the WhatsApp placeholder with your country code + number,
     digits only. Example format: 91XXXXXXXXXX (do not include + or spaces).
  2. Add only verified job notices to the JOBS array below.
*/
const SITE_SETTINGS = {
  whatsappNumber: "917020008745", // India country code + business WhatsApp number
  whatsappMessage: "Hello, I have an enquiry about Job Alerts."
};

// Add verified job records here. Keep this empty until you have real notices.
// Example structure:
// { title: "Exact vacancy title", organisation: "Organisation name",
//   category: "Government", deadline: "DD Month YYYY", officialUrl: "https://official-site.example" }
let JOBS = [];

const jobList = document.getElementById("jobList");
const searchInput = document.getElementById("jobSearch");
const categoryFilter = document.getElementById("categoryFilter");

function renderJobs() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const filtered = JOBS.filter(job => {
    const matchesText = [job.title, job.organisation, job.category].join(" ").toLowerCase().includes(query);
    const matchesCategory = category === "All" || job.category === category;
    return matchesText && matchesCategory;
  });

  if (!filtered.length) {
    jobList.innerHTML = '<div class="empty-state"><strong>No job updates published yet</strong><span>New verified opportunities will appear here when the site administrator adds them.</span></div>';
    return;
  }

  jobList.innerHTML = filtered.map(job => `
    <article class="job-card">
      <div>
        <h3>${escapeHTML(job.title)}</h3>
        <p>${escapeHTML(job.organisation || "")}${job.deadline ? " · Deadline: " + escapeHTML(job.deadline) : ""}</p>
        ${job.officialUrl ? `<p><a class="text-link" href="${safeURL(job.officialUrl)}" target="_blank" rel="noopener">Official notification ↗</a></p>` : ""}
      </div>
      <span class="job-tag">${escapeHTML(job.category)}</span>
    </article>`).join("");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function safeURL(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "#";
  } catch { return "#"; }
}
searchInput.addEventListener("input", renderJobs);
categoryFilter.addEventListener("change", renderJobs);
document.querySelectorAll("[data-filter]").forEach(link => link.addEventListener("click", () => {
  categoryFilter.value = link.dataset.filter;
  renderJobs();
}));

const whatsappLink = document.getElementById("whatsappLink");
whatsappLink.addEventListener("click", event => {
  if (!/^\d{8,15}$/.test(SITE_SETTINGS.whatsappNumber)) {
    event.preventDefault();
    alert("The website owner needs to add the official WhatsApp number in script.js before this button can be used.");
    return;
  }
  whatsappLink.href = `https://wa.me/${SITE_SETTINGS.whatsappNumber}?text=${encodeURIComponent(SITE_SETTINGS.whatsappMessage)}`;
});

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

let activeTab = "register";
document.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => {
  activeTab = button.dataset.tab;
  document.querySelectorAll("[data-tab]").forEach(tab => tab.classList.toggle("active", tab === button));
  document.getElementById("accountName").closest("label").style.display = activeTab === "register" ? "grid" : "none";
  const submit = document.getElementById("accountSubmit");
  submit.textContent = activeTab === "register" ? "Register" : "Login";
  document.getElementById("accountMessage").textContent = "Demo form only — connect a secure authentication service before accepting real accounts.";
}));
document.getElementById("accountForm").addEventListener("submit", event => {
  event.preventDefault();
  document.getElementById("accountMessage").textContent =
    activeTab === "register"
      ? "This is a visual demo. No account has been created. Add a secure backend before launch."
      : "This is a visual demo. Login is not connected yet.";
});

document.getElementById("year").textContent = new Date().getFullYear();
fetch("data/published.json")
  .then(response => response.ok ? response.json() : [])
  .then(data => { JOBS = Array.isArray(data) ? data : []; renderJobs(); })
  .catch(() => { JOBS = []; renderJobs(); });
