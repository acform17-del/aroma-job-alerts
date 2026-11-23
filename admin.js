const endpoint='/.netlify/functions/admin-auth';
const loginArea=document.getElementById('loginArea'),panel=document.getElementById('panel'),error=document.getElementById('loginError');
async function auth(action,extra={}){const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({action,...extra})});const d=await r.json().catch(()=>({ok:false,message:'Server response error'}));if(!r.ok&&action!=='check')throw new Error(d.message||'Request failed');return d;}
function shareText(j){return [`📢 ${j.title_en||j.title||'Latest Job Update'}`,j.title_hi?`हिंदी: ${j.title_hi}`:'',j.organisation_en?`Organisation: ${j.organisation_en}`:(j.organisation?`Organisation: ${j.organisation}`:''),j.organisation_hi?`विभाग: ${j.organisation_hi}`:'',j.category?`Category: ${j.category}`:'',j.deadline?`Last date / अंतिम तिथि: ${j.deadline}`:'',j.details_en||'',j.details_hi||'',j.officialUrl?`Official notice: ${j.officialUrl}`:'',`More updates: ${location.origin}/`,'Please verify details on the official website before applying.'].filter(Boolean).join('\n');}
function shareLink(j){return 'https://api.whatsapp.com/send?text='+encodeURIComponent(shareText(j));}
async function loadJobs(){const host=document.getElementById('adminJobs');host.textContent='Loading published jobs…';try{const r=await fetch('data/published.json',{cache:'no-store'});const jobs=await r.json();if(!Array.isArray(jobs)||!jobs.length){host.textContent='No published jobs yet. Verify and publish a job first.';return;}host.innerHTML=jobs.map((j,i)=>`<article class="admin-job"><h3>${esc(j.title_en||j.title||'Untitled job')}</h3><p>${esc(j.organisation||'')}${j.deadline?' · Last date: '+esc(j.deadline):''}</p><div class="admin-actions"><a target="_blank" rel="noopener" href="${shareLink(j)}">Share to WhatsApp Channel</a><a class="group" target="_blank" rel="noopener" href="${shareLink(j)}">Share to WhatsApp Group</a></div></article>`).join('');}catch{host.textContent='Could not load data/published.json';}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function showPanel(){loginArea.classList.add('admin-hidden');panel.classList.remove('admin-hidden');await loadJobs();}
(async()=>{try{const d=await auth('check');if(d.ok)await showPanel();}catch(e){error.textContent=e.message;}})();
document.getElementById('loginForm').addEventListener('submit',async e=>{e.preventDefault();error.textContent='';try{await auth('login',{password:document.getElementById('adminPassword').value});document.getElementById('adminPassword').value='';await showPanel();}catch(err){error.textContent=err.message;}});
document.getElementById('logout').addEventListener('click',async()=>{try{await auth('logout');}finally{panel.classList.add('admin-hidden');loginArea.classList.remove('admin-hidden');}});

// Admin-only candidate review and approval export.
async function loadCandidates(){
  const host=document.getElementById('candidateJobs');
  try{
    const r=await fetch('data/candidates.json',{cache:'no-store'});
    const candidates=await r.json();
    if(!Array.isArray(candidates)||!candidates.length){host.textContent='No detected candidates right now. Run the scheduled GitHub scan to check official sources.';return;}
    host.innerHTML=candidates.map((c,i)=>`<article class="candidate-card"><label><input type="checkbox" class="candidate-approval" data-index="${i}"><span><strong>${esc(c.title||'Untitled detected link')}</strong><p>${esc(c.source||'')} ${c.discovered_at?' · '+esc(c.discovered_at):''}</p><a href="${safeUrl(c.official_url||c.url)}" target="_blank" rel="noopener">Open official notice for verification ↗</a></span></label></article>`).join('');
    host.dataset.candidates=JSON.stringify(candidates);
  }catch{host.textContent='Could not load data/candidates.json';}
}
function safeUrl(v){try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)?esc(u.href):'#';}catch{return '#';}}
document.getElementById('exportApproved').addEventListener('click',()=>{
  const host=document.getElementById('candidateJobs');
  let candidates=[];try{candidates=JSON.parse(host.dataset.candidates||'[]');}catch{}
  const selected=[...document.querySelectorAll('.candidate-approval:checked')].map(x=>candidates[Number(x.dataset.index)]).filter(Boolean);
  const msg=document.getElementById('approvalMessage');
  if(!selected.length){msg.textContent='Select at least one candidate after verifying its official notice.';return;}
  const approved=selected.map(c=>({title:c.title||'Verified recruitment notice',organisation:c.source||'',category:'Government',deadline:'',officialUrl:c.official_url||c.url||''}));
  const blob=new Blob([JSON.stringify(approved,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='published.json';a.click();URL.revokeObjectURL(url);
  msg.textContent='Approved selection exported. Review the downloaded file, then replace data/published.json in GitHub and commit it.';
});
const originalShowPanel=showPanel;
showPanel=async function(){await originalShowPanel();await loadCandidates();};

// Bilingual job approval: English and Hindi fields are required for titles.
let approvedJobs=[];
async function loadApprovedJobs(){try{const r=await fetch('data/published.json',{cache:'no-store'});const d=await r.json();approvedJobs=Array.isArray(d)?d:[];}catch{approvedJobs=[];}}
document.getElementById('bilingualJobForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const msg=document.getElementById('bilingualMessage');
  const job={
    title_en:document.getElementById('titleEn').value.trim(),
    title_hi:document.getElementById('titleHi').value.trim(),
    organisation_en:document.getElementById('orgEn').value.trim(),
    organisation_hi:document.getElementById('orgHi').value.trim(),
    category:document.getElementById('jobCategory').value,
    deadline:document.getElementById('jobDeadline').value.trim(),
    officialUrl:document.getElementById('jobUrl').value.trim(),
    details_en:document.getElementById('detailsEn').value.trim(),
    details_hi:document.getElementById('detailsHi').value.trim(),
    approved:true
  };
  if(!job.title_en||!job.title_hi||!job.officialUrl){msg.textContent='Enter both English and Hindi job titles and the official notice URL.';return;}
  try{const u=new URL(job.officialUrl);if(!['http:','https:'].includes(u.protocol))throw new Error();}catch{msg.textContent='Please enter a valid official http/https URL.';return;}
  await loadApprovedJobs();approvedJobs.unshift(job);msg.textContent='Job approved in English and Hindi. Download the JSON and replace data/published.json in GitHub to publish it.';
  e.target.reset();
});
document.getElementById('downloadPublished')?.addEventListener('click',async()=>{
  const blob=new Blob([JSON.stringify(approvedJobs,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='published.json';a.click();URL.revokeObjectURL(url);
  const msg=document.getElementById('bilingualMessage');if(msg)msg.textContent='Downloaded published.json. Upload it to the data folder in GitHub and commit to publish approved bilingual jobs.';
});
