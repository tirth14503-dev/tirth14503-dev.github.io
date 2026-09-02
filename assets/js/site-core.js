
'use strict';

/* ═══════════════════════════════════
   LOADER
═══════════════════════════════════ */
document.getElementById('loader').style.display='none';
document.getElementById('topnav').classList.add('vis');
document.getElementById('ctrl-panel').classList.add('vis');

/* ═══════════════════════════════════
   CURSOR — Apple spring physics
═══════════════════════════════════ */
const cur=document.getElementById('cur');
const curR=document.getElementById('cur-r');
let cx=0,cy=0,rx=0,ry=0,curAngle=0;
/* Plane cursor: top-down 737 silhouette, nose always facing direction of travel.
   SVG nose points up (y=0); CSS rotate(0rad)=up, rotate(π/2)=right → atan2(dx,-dy) */
cur.innerHTML=`<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="14" cy="14" rx="2.4" ry="9.5" fill="#d4a840"/>
  <ellipse cx="14" cy="5"  rx="2.4" ry="2.8" fill="#e8bc50"/>
  <polygon points="14,10 2,18 14,16 26,18" fill="#c89828"/>
  <polygon points="14,21 8,26 14,24 20,26" fill="#b08820"/>
</svg>`;
document.addEventListener('mousemove',e=>{
  var dx=e.clientX-cx, dy=e.clientY-cy;
  if(dx*dx+dy*dy>9) curAngle=Math.atan2(dx,-dy); /* nose=up at 0rad */
  cx=e.clientX; cy=e.clientY;
  cur.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%) rotate(${curAngle}rad)`;
});
document.addEventListener('mousedown',()=>curR.classList.add('click'));
document.addEventListener('mouseup',()=>curR.classList.remove('click'));

// Spring-based cursor ring
(function animCursor(){
  const k=0.1; // spring constant
  rx+=(cx-rx)*k;
  ry+=(cy-ry)*k;
  curR.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
  requestAnimationFrame(animCursor);
})();

// Hover states
document.querySelectorAll('button,a,.exp-item,.ct-link-item,.aip-chip,.ctrl-btn,.nav-link,.nav-logo').forEach(el=>{
  el.addEventListener('mouseenter',()=>curR.classList.add('big'));
  el.addEventListener('mouseleave',()=>{curR.classList.remove('big');curR.classList.remove('text');});
});
document.querySelectorAll('input,textarea').forEach(el=>{
  el.addEventListener('mouseenter',()=>curR.classList.add('text'));
  el.addEventListener('mouseleave',()=>curR.classList.remove('text'));
});

/* hero 3D globe lives in a separate <script> below, loaded via the
   classic global THREE build so it also works when this file is
   opened directly (file://) and not just served over http(s) */

/* ═══════════════════════════════════
   SCROLL REVEALS + NAV ACTIVE
═══════════════════════════════════ */
const io=new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('up');});},{threshold:.1});
document.querySelectorAll('.reveal,.reveal-l,.reveal-r,.reveal-scale').forEach(el=>io.observe(el));
const secIO=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting)
      document.querySelectorAll('.nav-link').forEach(n=>n.classList.toggle('on',n.dataset.sec===e.target.id));
  });
},{threshold:.4});
document.querySelectorAll('section[id]').forEach(s=>secIO.observe(s));
document.querySelectorAll('.nav-link').forEach(n=>n.addEventListener('click',()=>document.getElementById(n.dataset.sec)?.scrollIntoView({behavior:'smooth'})));
document.querySelectorAll('.nav-link').forEach(n=>n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();document.getElementById(n.dataset.sec)?.scrollIntoView({behavior:'smooth'});}}));

/* ═══════════════════════════════════
   EXPERIENCE ACCORDION
═══════════════════════════════════ */
document.querySelectorAll('.exp-item').forEach(item=>{
  item.addEventListener('click',()=>{
    const wasOpen=item.classList.contains('open');
    document.querySelectorAll('.exp-item').forEach(i=>i.classList.remove('open'));
    if(!wasOpen)item.classList.add('open');
  });
});

/* ═══════════════════════════════════
   CONTACT FORM
═══════════════════════════════════ */
document.getElementById('contact-form').addEventListener('submit',(event)=>{
  event.preventDefault();
  const n=document.getElementById('ct-name').value||'';
  const e=document.getElementById('ct-email').value||'';
  const m=document.getElementById('ct-msg').value||'';
  if(!n.trim()||!e.trim()||!m.trim())return;
  window.location.href=`mailto:tirth14503@gmail.com?subject=Portfolio Enquiry from ${encodeURIComponent(n)}&body=${encodeURIComponent(m+'\n\nFrom: '+n+'\nEmail: '+e)}`;
  const ok=document.getElementById('ct-ok');ok.style.display='block';
  setTimeout(()=>ok.style.display='none',4500);
});

document.getElementById('ct-copy-email').addEventListener('click',async function(){
  const email='tirth14503@gmail.com';
  const button=this;
  function confirmed(){
    button.textContent='Email copied';
    setTimeout(()=>button.textContent='Copy email address',1800);
  }
  try{
    await navigator.clipboard.writeText(email);
    confirmed();
  }catch(error){
    const field=document.createElement('textarea');
    field.value=email; field.setAttribute('readonly','');
    field.style.position='fixed'; field.style.opacity='0';
    document.body.appendChild(field); field.select();
    try{document.execCommand('copy');confirmed();}catch(copyError){button.textContent=email;}
    field.remove();
  }
});

/* ═══════════════════════════════════
   TIRTHAL AI v2 — ELITE EDITION
   Actions + Streaming + Contextual chips
═══════════════════════════════════ */
(()=>{
'use strict';

/* ── SITE SECTION MAP ─────────────────────────────────── */
var SECT={
  home:'hero',top:'hero',hero:'hero',
  about:'about',me:'about',profile:'about','who are you':'about',
  experience:'experience',work:'experience',jobs:'experience',career:'experience',history:'experience',
  projects:'projects',portfolio:'projects',built:'projects',shipped:'projects',
  skills:'skills',tools:'skills',tech:'skills',
  contact:'contact',reach:'contact',hire:'contact',
  writing:'writing',blog:'writing',articles:'writing',publications:'writing',
  game:'game',fun:'game','ship game':'game',
  voices:'voices',testimonials:'voices',recommendations:'voices',
  stats:'stats',numbers:'stats',achievements:'stats',metrics:'stats',
  matcher:'matcher','job match':'matcher',
  simulator:'simulator',ddmrp:'simulator',disruption:'simulator','supply chain sim':'simulator',
};

/* ── ACTION EXECUTORS ────────────────────────────────── */
function flashEl(el){
  if(!el)return;
  var prev=el.style.boxShadow||'';
  el.style.transition='box-shadow 0.5s ease';
  el.style.boxShadow='inset 0 0 0 2px rgba(28,58,94,0.35),0 0 0 8px rgba(28,58,94,0.07)';
  setTimeout(function(){el.style.boxShadow=prev;},1800);
}

function gotoSection(id){
  if(id==='ai-panel'){
    if(!panel.classList.contains('open')) btn.click();
    return;
  }
  var el=document.getElementById(id); if(!el)return;
  setTimeout(function(){
    el.scrollIntoView({behavior:'smooth',block:'start'});
    flashEl(el);
  },300);
}

function openExpItem(n){
  gotoSection('experience');
  setTimeout(function(){
    var items=document.querySelectorAll('#experience .exp-item');
    var item=items[n-1]; if(!item)return;
    if(!item.classList.contains('open')){
      item.classList.add('open');
      var body=item.querySelector('.exp-body');
      if(body) body.style.maxHeight='600px';
      var icon=item.querySelector('.exp-toggle-icon');
      if(icon) icon.style.transform='rotate(45deg)';
    }
    setTimeout(function(){item.scrollIntoView({behavior:'smooth',block:'center'});},500);
  },800);
}

function openProject(caseId){
  gotoSection('projects');
  setTimeout(function(){
    var card=document.querySelector('.pj-card[data-case="'+caseId+'"]');
    if(!card)return;
    card.style.transition='box-shadow 0.35s,transform 0.35s';
    card.style.boxShadow='0 0 0 2.5px rgba(28,58,94,0.5),0 24px 60px rgba(28,58,94,0.22)';
    card.style.transform='translateY(-9px)';
    card.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(function(){
      card.style.boxShadow='';card.style.transform='';
      card.click();
    },600);
  },900);
}

function copyEmail(){
  var em='tirth14503@gmail.com';
  if(navigator.clipboard){
    navigator.clipboard.writeText(em).catch(function(){});
  } else {
    var ta=document.createElement('textarea');
    ta.value=em;document.body.appendChild(ta);ta.select();
    document.execCommand('copy');document.body.removeChild(ta);
  }
}

/* ── INTENT DETECTION ─────────────────────────────────── */
var NAV_LABELS={
  hero:'the top of the page',
  about:'the About section',
  experience:'the Experience section',
  projects:'the Projects section',
  skills:'the Skills section',
  contact:'the Contact section',
  writing:'the Writing section',
  voices:'the Recommendations section',
  game:'the Ship Game',
  stats:'the Stats section',
  matcher:'the Job Matcher',
  simulator:'the SC Disruption Simulator',
};

function detectIntent(q){
  var ql=q.toLowerCase().trim();

  /* navigation verbs */
  var navRx=/\b(?:go|take|show|scroll|navigate|jump|bring|open|see|view|visit)\s+(?:me\s+)?(?:to|over|at|the\s+)?\s*(?:the\s+)?([a-z\s]+?)(?:\s+section|\s+page|\s+tab)?\s*$/i;
  var nm=ql.match(navRx);
  if(nm){
    var kw=nm[1].trim().replace(/\s+/g,' ');
    var id=SECT[kw]||SECT[kw.split(' ')[0]];
    if(id) return {type:'nav',id:id,kw:kw};
  }

  /* bare "X section" */
  for(var k in SECT){
    if(new RegExp('\\b'+k+'\\s+section\\b','i').test(ql)) return {type:'nav',id:SECT[k],kw:k};
  }

  /* open specific experience item */
  var expRx=/\b(?:open|show|expand)\s+(?:experience\s+)?(?:number\s*|no\s*|#\s*)?([1-6])\b/i;
  var em=ql.match(expRx); if(em) return {type:'exp',n:parseInt(em[1])};

  /* company name → open exp */
  if(/kothari\s+electronics|family\s+business/i.test(ql)&&/show|open|see|take/i.test(ql)) return {type:'exp',n:3};
  if(/\biscm\b|research\s+analyst/i.test(ql)&&/show|open|see|take/i.test(ql)) return {type:'exp',n:4};
  if(/\bmentone\b|concrete/i.test(ql)&&/show|open|see|take/i.test(ql)) return {type:'exp',n:6};
  if(/student\s+ambassador|kellstadt\s+ambassador/i.test(ql)&&/show|open|see|take/i.test(ql)) return {type:'exp',n:2};

  /* open specific project */
  if(/show|open|see|take/i.test(ql)){
    if(/\berp\b|\bdjango\b/i.test(ql)) return {type:'proj',id:'automation'};
    if(/\bkehe\b|\btruckload\b|\brfp\b/i.test(ql)) return {type:'proj',id:'kehe'};
    if(/demand\s+forecast|retail\s+forecast/i.test(ql)) return {type:'proj',id:'forecast'};
    if(/\bsegment/i.test(ql)) return {type:'proj',id:'segmentation'};
    if(/\bchurn\b/i.test(ql)) return {type:'proj',id:'churn'};
    if(/optim|linear\s+program|excel\s+solver/i.test(ql)) return {type:'proj',id:'optimization'};
  }

  /* copy email */
  if(/\bcopy\s+(the\s+)?email\b|\bcopy\s+(the\s+)?address\b/i.test(ql)) return {type:'copyemail'};

  /* job matcher */
  if(/\b(try|open|use)\s+(the\s+)?matcher\b|match\s+(my\s+)?role\b|job\s+match\b/i.test(ql)) return {type:'nav',id:'matcher',kw:'matcher'};

  /* ship game */
  if(/play.*game|ship\s+game|load.*ship/i.test(ql)) return {type:'nav',id:'game',kw:'game'};

  /* easter eggs */
  if(/surprise\s+(me|tirthal)|random\s+fact/i.test(ql)) return {type:'surprise'};
  /* cover letter / JD detection */
  if(/cover.?letter|write.*(?:a|my|the)?\s*letter|generate.*letter|letter.*for/i.test(ql)) return {type:'coverletter',rawText:q,explicit:true};
  if(q.length>120 && /(?:years?\s+of\s+exp|bachelor|master|degree|required|preferred|responsibilities|qualifications|supply chain|logistics|procurement|analyst|planner|coordinator|specialist|manager)/i.test(q)) return {type:'coverletter',rawText:q,explicit:false};
  if(/hire\s+(tirthal|you|him)|want\s+to\s+hire|make\s+you\s+an\s+offer/i.test(ql)) return {type:'hire'};
  if(/what\s+can\s+you\s+do|your\s+capabilities|list\s+commands|^help\s*$/i.test(ql)) return {type:'help'};

  return null;
}

/* ── SURPRISE FACTS ────────────────────────────────────── */
var SURPRISE=[
  "I analyzed 1,500+ public companies to build **India's first national supply chain index** — a methodology that improved efficiency scoring by 40% vs. what existed before. That took 12 months of R, Excel, and Tableau work.",
  "At 22 I was managing **end-to-end operations** for a family manufacturing business: procurement, production, QC, inventory, distribution — all simultaneously. Most grad students have read about this. I've done it.",
  "I built a **live ERP from scratch** — Django, Python, SQL — in my personal time. It runs at tirthalkothari.pythonanywhere.com right now, with multi-user login, RBAC, inventory tracking, AI insights, and a barcode scanner.",
  "The KeHE Distributors RFP I worked on was a **real 2024 carrier bid** — not a textbook simulation. I was analyzing actual lane-level pricing data for one of the US's top food distributors.",
  "I grew an Instagram community by **10,000 followers in a single month** using organic content strategy and SEO — skills you rarely see on a supply chain resume, but extremely useful in stakeholder communication.",
  "My certifications include **GE Aerospace Supply Chain** (Forage), **Tata Group Data Visualisation** (Forage), **Six Sigma Green Belt**, and **DDMRP** (Demand Driven Institute) — one of the most progressive inventory philosophies in practice today.",
  "I speak **three languages** — English, Hindi, and Gujarati — which was directly useful negotiating with suppliers across India's textile and electronics supply chains.",
  "I personally hosted **Chief Supply Chain Officers from Fortune 500 companies** through the Supply Chain Dialogue Series at ISCM. I was 22, they were running multi-billion-dollar supply chains. Great conversations.",
  "I wrote a piece on **sustainable finance and ESG supply chain metrics** that was published as part of DePaul coursework and referenced in industry circles.",
  "The PVC wire salvage project at Kothari Electronics saved **₹90,000 annually** from what was being straight-line scrapped. That came from asking 'why?' about a process everyone had accepted as waste.",
];

/* ── KNOWLEDGE BASE ────────────────────────────────────── */
var KB=[
  /* No KB entry answered contact questions - 'How do I contact you?' is an
     offered chip and hit the generic fallback. */
  {k:['how do i contact','how to contact','contact you','get in touch','reach you','how can i reach','best way to reach','contact details'],
   r:"Easiest is email: **tirth14503@gmail.com** \u2014 I reply within a day.\n\nYou can also find me on LinkedIn at **linkedin.com/in/tirthalkothari**, and the Contact section has a QR code and my phone number.\n\nI\u2019m in **Chicago** and graduate in **June 2026**, so I\u2019m actively speaking with teams now.",
   chips:['Copy email address','Take me to Contact','Open to opportunities?']},

  /* Self-introduction. 'Tell me about yourself' is the default chip shown on
     open and in most SECTION_CHIPS, but no KB entry matched it: 'tell' and
     'about' are stop-words, leaving only 'yourself', which appears in no FACTS
     string. The flagship suggested question therefore hit the generic
     "I'm not certain" fallback. */
  {k:['tell me about yourself','about yourself','yourself','who are you','who is tirthal','introduce','elevator pitch','tell me about you'],
   r:`Short version: I learned supply chain before I had textbook words for it.

I grew up in my family’s electronics business in **Mumbai**, where supply chain wasn’t a subject — it was whether the shipment showed up and whether we got paid. I ran procurement, QC, inventory and distribution there, and strategic sourcing delivered **₹200,000 in FY24 cost savings**.

The research side came later: a year at ISCM analyzing **1,500+ companies across 24 sectors** to build India’s first national supply chain index.

Now I’m finishing my **MS in Supply Chain Management at DePaul’s Kellstadt School** in Chicago, graduating **June 2026**. Six roles, two countries. These days I’m as happy writing SQL as I am on the phone with a supplier — I think that mix is the whole point.`,
   chips:['Why supply chain?','Show me Projects','Take me to Experience','Open to opportunities?']},

  {k:['kehe','truckload','rfp','carrier bid','practicum','industry project','transportation project'],
   r:"In DePaul's transportation practicum I worked a **real 2024 inbound truckload RFP for KeHE Distributors** — not a simulation, an actual carrier bid across major US corridors.\n\nI evaluated bids across rate, service reliability, and capacity, then built a recommendation framework. The key insight: **the cheapest lane bid is rarely the cheapest lane** once you factor in detention risk, carrier reliability scores, and fuel-surcharge volatility. I wrote that up in a Field Notes piece too.",
   chips:['Open KeHE project','Take me to Writing','What transportation tools?']},

  {k:['lpc','office assistant','college of communication','campus job','current job'],
   r:"Alongside the ambassador role I work as an **LPC Office Assistant** at DePaul's College of Communication (Sept 2025–June 2026): coordinating faculty schedules, managing event logistics, administrative operations. Light by design — keeps bandwidth free for academics and job searching.",
   chips:['Take me to Experience','Tell me about the Ambassador role','When do you graduate?']},

  {k:['blog','article','wrote','day in the life','kellstadt blog','published','writing'],
   r:"I've published in two places:\n\n• **DePaul Inside Kellstadt** — 'A Day in the Life of an MS in Supply Chain Management Student.' Covers the Loop campus commute, collaborative study culture, what the coursework really involves.\n\n• **Supply Chain Champions** — co-authored India's first national SC ranking report (1,500+ companies, national press coverage).\n\nAlso three **Field Notes** essays here on the portfolio: the KeHE RFP, the SC index methodology, and why I built my own ERP.",
   chips:['Take me to Writing','Tell me about the index','Show me KeHE project']},

  {k:['erp','about erp','erp project','tell me about erp','the erp','system','built','django','pythonanywhere','app','software'],
   r:"I built a **full-stack ERP entirely solo** — Django, Python, SQL — because I wanted to understand what I'd be managing in supply chain roles, not just how to operate it.\n\n**Features:** multi-user auth with RBAC, stock ledger, financial KPIs (revenue, COGS, gross margin), AI demand forecasting, supplier risk scoring, anomaly detection, a barcode scanner with camera integration.\n\nLive at **tirthalkothari.pythonanywhere.com**. Most supply chain people can drive an ERP. I know what's under the hood.",
   chips:['Open that project','Take me to Projects','Technical skills?']},

  {k:['iscm','about iscm','tell me about iscm','sc index','the index','national index','research analyst','supply chain index','india supply chain','1500','champions'],
   r:"At ISCM I built **India's first national supply chain index** — analyzing 1,500+ public companies across 24 sectors in R, Excel, and Tableau. No standardized methodology existed before this to compare pharma cold chains against cement dispatch networks.\n\nI improved the methodology by **40%**, authored the flagship industry report ('Top 20 Supply Chain Champions of India'), and led the **Supply Chain Dialogue Series** — hosting CSCOs from Fortune 500 companies.",
   chips:['Open ISCM experience','Take me to Projects','Take me to Writing']},

  {k:['kothari electronics','family business','operations','manufacturing'],
   r:"Kothari Electronics is the family business where I had **real operational ownership**: procurement, manufacturing, QC, inventory, and wholesale distribution — not as a project, as the actual daily job for three years.\n\nKey outcomes: **₹200,000 in FY24 procurement savings** through strategic sourcing. **₹90,000 annual savings** by redesigning PVC wire reprocessing that was previously written off as scrap.\n\nRunning a manufacturing/distribution operation while studying gives me P&L intuition most MS grads don't have.",
   chips:['Open that experience','What were the savings?','Operations skills?']},

  {k:['mentone','concrete','mrp','material requirements','intern'],
   r:"**Mentone Concretes** (May–Jul 2022, Mumbai) — my first supply chain internship. Applied MRP discipline to cement production: material availability improved **30%**. Built supplier scorecards and flagged two underperforming vendors for removal. Managed 20+ weekly shipment schedules.\n\nSmall operation, real problem, real fix. That's where MRP stopped being a textbook term for me.",
   chips:['Open that experience','What is DDMRP?','Take me to Experience']},

  {k:['student ambassador','kellstadt','recruitment','prospective students'],
   r:"As **Student Ambassador at DePaul's Kellstadt School of Business** (Feb 2025–Present): leading recruitment events, advising 100+ prospective students on the MS SCM program, 24-hour SLA on all applicant communications via Slate CRM.\n\nI chose this partly because I was exactly that prospective student 18 months ago — asking the same questions. I know what actually helps people decide.",
   chips:['Open that experience','Take me to Experience','Tell me about DePaul']},

  {k:['depaul','ms','program','coursework','school','university','kellstadt'],
   r:"I'm in the **MS Supply Chain Management program at DePaul's Kellstadt Graduate School**, Chicago, graduating June 2026.\n\nStandout coursework: Transportation & Logistics, Global Sourcing & Procurement, Decision Making for Managers, Machine Learning for Business (real projects, not toy datasets), Operations Management.\n\nThe program integrates live industry exposure — the KeHE RFP was a real practicum project. I also serve as Student Ambassador for the program.",
   chips:['Tell me about projects','Take me to Experience','When do you graduate?']},

  {k:['python','sql','r','tableau','excel','data','analytics','technical skills','tools','tech stack'],
   r:"**Technical toolkit:**\n\n• **Languages:** Python (pandas, scikit-learn, matplotlib), R, SQL\n• **BI & Viz:** Tableau, Power BI, Advanced Excel (Solver, pivots, VBA basics)\n• **SC Software:** AnyLogistix, Slate CRM, MRP systems\n• **Dev:** Django, Git, HTML/CSS (built this portfolio)\n• **ML:** scikit-learn — regression, classification, clustering\n\nAll used in actual projects: ERP (Django + SQL), index (R + Tableau), ML models (Python + scikit-learn).",
   chips:['Show me the ERP project','Machine learning projects?','Show me Projects']},

  {k:['machine learning','ml','forecasting model','churn','segmentation','clustering','ai'],
   r:"Three ML projects I can walk you through:\n\n**1. Retail Demand Forecasting** — EDA + feature engineering on retail inventory data; regression models to forecast store-level demand.\n\n**2. Customer Churn Prediction** — Decision-tree classifier on telecom data (tenure, charges, support calls, contract type); hyperparameter-tuned for accuracy vs. recall.\n\n**3. Customer Segmentation** — K-Means clustering on income, spending score, and channel mix to identify distinct customer personas.\n\nAll in Python + scikit-learn, documented in Projects.",
   chips:['Show me Projects','Open demand forecasting','Technical skills?']},

  {k:['procurement','sourcing','vendor','supplier','purchasing','strategic sourcing'],
   r:"Procurement is probably my **strongest single skill** — I have real P&L experience here, not just coursework.\n\nAt Kothari Electronics: vendor renegotiation → **₹200K FY24 savings**.\nAt Mentone Concretes: supplier scorecards → removed 2 underperforming vendors.\nAcademically: Global Sourcing & Procurement (DePaul), live KeHE RFP, DDMRP certification.\n\nI think about procurement as a strategic function, not a cost-cutting exercise.",
   chips:['Show me Experience','What is DDMRP?','Take me to Voices']},

  {k:['ddmrp','demand driven','buffer','inventory policy'],
   r:"DDMRP — Demand Driven MRP — replaces traditional push-based MRP with **strategically-positioned buffers and pull signals**. I'm certified through the Demand Driven Institute.\n\nWhy it matters: in high-variability supply chains (which is almost all of them post-2020), traditional MRP overplans and underdelivers. DDMRP positions inventory where variability is highest and lets actual demand pull replenishment. I applied the concepts at Mentone Concretes and in simulation coursework.",
   chips:['Tell me about Mentone','Operations skills?','What certifications do you have?']},

  {k:['six sigma','lean','continuous improvement','process improvement'],
   r:"**Six Sigma Green Belt certified** — I can structure a DMAIC improvement project, run root-cause analysis, and validate improvements with statistical tools (control charts, regression, hypothesis testing).\n\nIn practice: at Kothari Electronics we used structured problem-solving to identify the root cause of PVC wire scrapping, then redesigned reprocessing to recover **₹90,000 annually**. That's the problem Six Sigma is actually built for.",
   chips:['Kothari Electronics details','Operations skills?','Take me to Experience']},

  {k:['risk','resilience','disruption','uncertainty','geopolitical'],
   r:"Risk and resilience became real to me during 2020–21: watching vendor shutdowns, transport delays, and demand volatility hit Kothari Electronics simultaneously was a live case study in supply chain fragility.\n\nWhat I built: basic supplier scorecards, buffer recommendations, and alternative sourcing contacts that helped navigate the worst of it.\n\nAcademically: quantitative risk modeling, demand/capacity uncertainty, cost-risk tradeoffs, supply chain resilience strategy.",
   chips:['Kothari Electronics details','Take me to Experience','Show me Projects']},

  {k:['sustainability','esg','green','carbon','environment','climate'],
   r:"ESG in supply chains is something I **genuinely care about** — not just a keywords line.\n\nI completed DePaul's Sustainable Finance coursework and co-authored a published piece on ESG supply chain metrics. What's actually hard: Scope 3 accounting requires your entire supplier network to report emissions data most of them don't track. The interesting work is building measurement frameworks that are **actionable**, not just compliant.",
   chips:['Why supply chain?','Tell me about yourself','Take me to About']},

  {k:['salary','compensation','pay','rate','money','expect'],
   r:"Better handled in a direct conversation — I'm not putting a number in a chatbot that's visible to everyone.\n\nBroadly: looking for something competitive with Chicago-market junior analyst roles in supply chain/operations. I'm more focused on **role fit, growth trajectory, and sector** than the opening number.",
   chips:['How do I contact you?','Open to opportunities?','Copy email address']},

  {k:['resume','cv','download','pdf'],
   r:"Email me at **tirth14503@gmail.com** and I'll send a tailored version — I keep role-specific variants for analytics-heavy vs. operational/procurement vs. consulting roles.\n\nOr LinkedIn: **linkedin.com/in/tirthalkothari** has the full profile.",
   chips:['Copy email address','Take me to Contact','Open to opportunities?']},

  {k:['linkedin','connect','profile','social'],
   r:"**linkedin.com/in/tirthalkothari** — I'm active there and it has the most complete version of my experience. Recommendations from Aaron Krupp, Sina Ansari, and Mike Ozmeral are all visible (and in the Voices section of this portfolio too).",
   chips:['Take me to Voices','Copy email address','Take me to Contact']},

  {k:['open to','available','hiring','job','role','position','looking for','full time','full-time'],
   r:"**Yes, fully open.** Available for full-time roles starting **June 2026** after MS graduation.\n\n**Targeting:**\n• Supply chain analyst / operations analyst\n• Procurement / sourcing specialist\n• Logistics analyst\n• Supply chain consulting (operations-focused)\n\n**Preferred sectors:** manufacturing, retail/e-commerce, consulting, technology SC.\n\n**Location:** open to Chicago and anywhere in the US.\n\nEmail **tirth14503@gmail.com** to start a conversation.",
   chips:['Copy email address','Take me to Contact','What makes you unique?']},

  {k:['unique','stand out','different','why you','value proposition','differentiate'],
   r:"Three things that don't usually travel together:\n\n**1. Real P&L ownership** — not an internship, but three years running a manufacturing/distribution business with actual financial outcomes (₹200K+ savings).\n\n**2. Research-grade analysis** — built India's first national SC index from scratch; published; 1,500+ companies in the dataset.\n\n**3. Technical depth** — full-stack ERP solo in Django, fluent in Python/R/SQL, real ML projects.\n\nMost candidates have one of these. I have all three, plus US grad school with live industry exposure.",
   chips:['Tell me about ERP','Show me Experience','Why supply chain?']},

  {k:['why supply chain','passion','interest','chose','career path'],
   r:"I grew up inside a supply chain — literally. The family business was manufacturing and distribution: watching shipments arrive, components move through production, orders go out. The operational problems were real and daily.\n\nWhat deepened it: at ISCM I saw how little rigorous data existed to even **measure** supply chain performance at scale. That gap led to the index project. The intersection of operational complexity and analytical opportunity is what I want to work on long-term.",
   chips:['Tell me about ISCM','Take me to Experience','What makes you unique?']},

  {k:['mumbai','india','background','where are you from','origin','grew up'],
   r:"I grew up in Mumbai — a city that runs on logistics as much as relationships. My early career happened there: family business at Kothari Electronics, internship at Mentone Concretes, research at ISCM.\n\nI moved to Chicago in 2024 for the DePaul MS program. Different scale, different complexity — US logistics infrastructure vs. India's last-mile challenges are genuinely different engineering problems.",
   chips:['Tell me about family business','Take me to About','Kothari Electronics']},

  {k:['consulting','mckinsey','deloitte','accenture','kpmg','bain','bcg','strategy'],
   r:"Consulting is one of the paths I'm actively considering — case-based analytical work, operational problem-solving, and client exposure across sectors align well with what I've done.\n\nI've completed **Tata Group** (data visualization) and **GE Aerospace** (supply chain) job simulations through Forage, which gave me a realistic sense of how those environments work. Happy to discuss how my background translates to specific consulting contexts.",
   chips:['What are your certifications?','What makes you unique?','How do I contact you?']},

  {k:['chicago','illinois','location','relocate','where'],
   r:"Based in Chicago right now — DePaul's Loop Campus is my main campus. Happy to commute downtown for on-site interviews or roles.\n\nLong-term: **open to relocating anywhere in the US**. The right role matters more than the city.",
   chips:['Open to opportunities?','How do I contact you?','Take me to Contact']},

  {k:['strength','strong','makes you strong','what makes you strong','best at','good at','excel at'],
   r:"I can **build the model and explain it to a supplier** who doesn't care about the model — that combination is rarer than it sounds.\n\n• Translating data into operational decisions\n• Communicating at both executive and factory-floor level\n• Starting from scratch on ambiguous problems (built the index, the ERP, from zero)\n• Cross-cultural, cross-organizational contexts",
   chips:['Why supply chain?','What makes you unique?','Technical skills?']},

  {k:['weakness','challenge','growth area','improve'],
   r:"My **US professional network** is still thinner than my India one — that's the honest limitation of being two years into Chicago. I'm actively working on it: ambassador role, DePaul events, LinkedIn.\n\nAlso: I'm better at deep dives than quick surface-level coverage. I've learned to timebox my analysis when the situation calls for it.",
   chips:['What makes you strong?','Open to opportunities?','Take me to Contact']},

  {k:['certifications','certified','qualifications','credentials'],
   r:"**Certifications:**\n• **GE Aerospace Supply Chain Job Simulation** (Forage)\n• **Tata Group Data Visualisation Programme** (Forage)\n• **Six Sigma Green Belt** (Lean Six Sigma)\n• **DDMRP Certification** (Demand Driven Institute / DD Brix Factory)\n\nCurrent coursework: Machine Learning for Business, Transportation & Logistics, Global Sourcing & Procurement, Decision Making for Managers.",
   chips:['What is DDMRP?','Technical skills?','Tell me about yourself']},

  {k:['erp live','is it live','running','deployed','pythonanywhere','can i try it'],
   r:"Yes, it's live right now at **tirthalkothari.pythonanywhere.com** — you can log in and explore it.\n\nFeatures: multi-user auth with RBAC, stock ledger, financial KPIs (revenue, COGS, gross margin), AI demand forecasting, supplier risk scoring, anomaly detection, barcode scanner with camera integration.\n\nBuilt solo in Django, Python, SQL. No tutorials, no boilerplate kit — started from scratch.",
   chips:['Tell me about the ERP project','Technical skills?','Show me Projects']},
  {k:['professors','professor','recommendation','what do they say','testimonial','endorsement','what professors'],
   r:"Three recommendations that I think represent the full picture:\n\n**Aaron Krupp** (DePaul, College of Communication): _'Strong organizational skills, maturity, integrity, and professionalism in every interaction.'_\n\n**Sina Ansari** (Decision Making for Managers): _'His ability to translate data into clear, actionable insights... combining quantitative analysis with practical business intuition.'_\n\n**Mike Ozmeral** (Global Sourcing & Procurement): _'One of my best students... the intellectual curiosity, passion and work ethic to be very successful in the Procurement and Supply Chain field.'_",
   chips:['Take me to Voices','Why supply chain?','What makes you unique?']},
  {k:['200k','200000','savings','cost savings','procurement savings','rs 200','rupees'],
   r:"The Rs 200K figure is FY24 documented savings at **Kothari Electronics**, achieved through two main levers:\n\n**1. Strategic vendor renegotiation** — I analyzed our top suppliers by spend and lead time, identified where we had leverage, and renegotiated terms. Some vendors we dropped entirely after scorecarding.\n\n**2. PVC wire reprocessing** — We were scrapping defective PVC wire as waste. I identified that 60%+ of it could be reprocessed and reused. That alone was Rs 90K/year.\n\nThe rest came from better demand planning, which reduced emergency buys at premium prices.",
   chips:['Tell me about Kothari Electronics','Open experience 3','What was your biggest impact?']},
  {k:['hobby','interest','personal','outside work','fun','free time'],
   r:"Outside of work I still end up reading about how systems work — logistics networks, operations theory, but also how any complex system (cities, markets, ecosystems) adapts to disruption.\n\nIn Chicago: still finding the city. The food is great. The winters are not.",
   chips:['Why supply chain?','Tell me about yourself','Surprise me']},

  {k:['work experience','experience section','that experience','open that experience','your career','all your jobs','career history','all your roles','your roles','your background'],
   r:"Here's a quick overview of my **6 roles across 2 countries**:\n\n**01** LPC Office Assistant · DePaul (Sep 2025–Jun 2026, Chicago)\n**02** Student Ambassador · DePaul Kellstadt (Feb 2025–Present, Chicago)\n**03** Operations & SC Consultant · Kothari Electronics (Jun 2021–Jul 2024, Mumbai)\n**04** Research Analyst · ISCM (Jul 2023–Jul 2024, Mumbai)\n**05** Content & Social Media Intern · Career Launcher (Feb–Apr 2023, Mumbai)\n**06** Supply Chain Intern · Mentone Concretes (May–Jul 2022, Mumbai)\n\nThe highest-impact role is **#03** — three years, end-to-end manufacturing ops, over Rs 200K in documented savings.",
   chips:['Open experience 3 (Kothari Electronics)','Open experience 4 (ISCM)','Open experience 6 (Mentone)','What was your biggest impact?']},
  {k:['hello','hi','hey','howdy','greetings'],
   r:"Hey! I'm **Tirthal** — supply chain & analytics, finishing my MS at DePaul in Chicago in June 2026.\n\nI can answer questions about my background **and** navigate this portfolio for you. Try _\"take me to Projects\"_, _\"open experience 3\"_, _\"show me the ERP project\"_, or _\"surprise me\"_.\n\nWhat do you want to explore?",
   chips:['Tell me about yourself','Show me Projects','Take me to Experience','What can you do?']},

  {k:['biggest impact','biggest achievement','most proud','best result','top achievement','biggest win'],
   r:"Three I come back to:\n\n**1. Rs 200K+ in documented savings** at Kothari Electronics through vendor renegotiation and process redesign — not a classroom projection, actual FY24 numbers.\n\n**2. India's first national supply chain index** — 1,500+ companies, published, 40% methodology improvement over prior attempts. Built from scratch.\n\n**3. A live ERP system** — Django, Python, SQL — running at tirthalkothari.pythonanywhere.com. Built solo because I wanted to understand what I'd manage, not just operate.",
   chips:['Tell me about Kothari Electronics','Tell me about the SC index','Tell me about the ERP project']},
  {k:['thank','thanks','appreciate','great answer'],
   r:"Thanks. If you want to keep the conversation going, email **tirth14503@gmail.com** or find me on LinkedIn at **linkedin.com/in/tirthalkothari**.",
   chips:['Copy email address','Take me to Contact','Open to opportunities?']},

  {k:['what can you do','tell me more','more please','commands','capabilities','features','help'],
   r:"I can do a lot more than answer questions:\n\n**Navigate the site:**\n• _\"Take me to Experience\"_\n• _\"Show me Projects\"_\n• _\"Go to Contact\"_ / _\"Writing\"_ / _\"Voices\"_\n\n**Open specific content:**\n• _\"Open experience 3\"_ (Kothari Electronics)\n• _\"Show me the ERP project\"_\n• _\"Open the KeHE RFP\"_\n\n**Actions:**\n• _\"Copy email address\"_\n• _\"Open the job matcher\"_\n• _\"Surprise me\"_ (random fact about Tirthal)\n• _\"Hire Tirthal\"_ 😉",
   chips:['Take me to Experience','Show me Projects','Copy email address','Surprise me']},
];

/* ── CONVO PATTERNS ─────────────────────────────────────── */
var CONVO=[
  [/^(hi|hey|hello|yo|sup)\s*[!.]?\s*$/i,
   ["Hey! I'm Tirthal — supply chain & analytics, DePaul MS graduating June 2026. Ask me anything, or say **\"take me to [section]\"** to navigate anywhere on this site. What's on your mind?"]],
  [/what('s| is) your name|^name\??$|who are you/i,
   ["Tirthal Kothari — MS Supply Chain Management candidate at DePaul, Chicago. Graduating June 2026 and actively looking for full-time supply chain and operations roles."]],
  [/how old|your age/i,
   ["Early career, but with more hands-on operational experience than most — three years running a family manufacturing business before grad school tends to accelerate that."]],
  [/(weather|time is it|sports|movie|music|song|recipe)/i,
   ["That's outside what I have loaded — I've got Tirthal's professional background, not the outside world. Ask about supply chain, operations, analytics, or say 'take me to [section]'."]],
  [/\bemail\s+address\b|\bwhat('s| is) your email\b/i,
   ["**tirth14503@gmail.com** — or say _\"copy email address\"_ and I'll put it in your clipboard."]],
  [/phone|call|number/i,
   ["**(773) 654-8682** — but email is faster. tirth14503@gmail.com."]],
];

/* ── FACTS FALLBACK ──────────────────────────────────────── */
var FACTS=[
  "Tirthal is completing his MS in Supply Chain Management at DePaul University's Kellstadt Graduate School in Chicago, graduating June 2026.",
  "He built India's first national supply chain index at ISCM, analyzing 1,500+ public companies across 24 sectors.",
  "He generated ₹200,000 in FY24 procurement savings at Kothari Electronics through strategic sourcing.",
  "He built a full ERP system solo in Django, Python, and SQL — live at tirthalkothari.pythonanywhere.com — with AI forecasting and barcode scanning.",
  "Technical tools: Python (pandas, scikit-learn), R, SQL, Tableau, Excel, AnyLogistix, MRP systems, Django.",
  "Certifications: Six Sigma Green Belt, DDMRP (Demand Driven Institute), GE Aerospace Supply Chain (Forage), Tata Data Visualisation (Forage).",
  "At Mentone Concretes he applied MRP to improve material availability by 30% and removed two underperforming vendors.",
  "He is a Student Ambassador at DePaul, advising 100+ prospective SCM students with a 24-hour response SLA.",
  "He led the Supply Chain Dialogue Series at ISCM, hosting Chief Supply Chain Officers from India's top companies.",
  "He grew an Instagram community by 10,000+ followers in one month at Career Launcher.",
  "He speaks English, Hindi, and Gujarati.",
  "Open to full-time supply chain roles anywhere in the US from June 2026. Email: tirth14503@gmail.com.",
  "His ML projects include retail demand forecasting, customer churn prediction (decision trees), and customer segmentation (K-Means).",
  "He worked a real 2024 inbound truckload RFP for KeHE Distributors in DePaul's transportation practicum.",
  "He holds a Bachelor of Management Studies in E-Commerce Operations from Nagindas Khandwala College, University of Mumbai.",
];

/* ── REPLY BUILDER ────────────────────────────────────────── */
function buildReply(q){
  var ql=q.toLowerCase().trim().replace(/[!?.]+$/,'');

  /* CONVO patterns first */
  for(var ci=0;ci<CONVO.length;ci++){
    if(CONVO[ci][0].test(ql)){
      var rr=CONVO[ci][1];
      return {text:rr[Math.floor(Math.random()*rr.length)],chips:null};
    }
  }

  /* KB keyword scoring */
  var best=null,bestScore=0,bestChips=null;
  var spaced=' '+ql+' ';
  for(var ki=0;ki<KB.length;ki++){
    var score=0;
    for(var kj=0;kj<KB[ki].k.length;kj++){
      var kw=KB[ki].k[kj];
      if(spaced.indexOf(' '+kw+' ')>=0||ql.indexOf(kw)>=0)
        score+=kw.length>=9?3:kw.length>=5?2:1;
    }
    if(score>bestScore){bestScore=score;best=KB[ki].r;bestChips=KB[ki].chips||null;}
  }
  if(bestScore>=2) return {text:best,chips:bestChips};

  /* FACTS word-overlap fallback */
  var STOP={what:1,your:1,about:1,tell:1,does:1,have:1,with:1,that:1,this:1,they:1,them:1,then:1,were:1,been:1,will:1,from:1,into:1,just:1,like:1,more:1,some:1,also:1,know:1,want:1,make:1,when:1,here:1,much:1,only:1,over:1,such:1,give:1,most:1,than:1,both:1,each:1,even:1,back:1,good:1,come:1,work:1,take:1,show:1,open:1};
  var words=(spaced.match(/[a-z]{4,}/g)||[]).filter(function(w){return !STOP[w];});
  var bf=null,bs=1.5;
  for(var fi=0;fi<FACTS.length;fi++){
    var fl=FACTS[fi].toLowerCase(); var s=0;
    for(var wi=0;wi<words.length;wi++){if(fl.indexOf(words[wi])>=0) s+=words[wi].length>=6?2:1;}
    if(s>bs){bs=s;bf=FACTS[fi];}
  }
  if(bf) return {text:bf+'\n\n**Want more?** Email **tirth14503@gmail.com**.',chips:['Tell me more','Copy email address','Take me to Contact']};

  return {text:"I'm not certain I have the right detail for that — Tirthal will answer directly at **tirth14503@gmail.com** or on LinkedIn at **linkedin.com/in/tirthalkothari**.",chips:['Copy email address','Take me to Contact','Tell me about yourself']};
}

/* ── DOM REFS ─────────────────────────────────────────────── */
var panel=document.getElementById('ai-panel');
var closeBtn=document.getElementById('aip-x');
var msgs=document.getElementById('aip-msgs');
var input=document.getElementById('aip-in');
var send=document.getElementById('aip-send');
var chips=document.getElementById('aip-chips');
var btn=document.getElementById('btn-ai');
var isOpen=false,isStreaming=false,lastSection=null;

/* ── SECTION-SPECIFIC FOLLOW-UP CHIPS ────────────────────────────────────── */
var SECTION_CHIPS={
  hero:       ['Tell me about yourself','Why supply chain?','Show me Projects','What can you do?'],
  about:      ['Tell me about yourself','Why supply chain?','Where are you from?','What makes you unique?'],
  experience: ['Tell me about your work experience','Tell me about Kothari Electronics','Open experience 4 (ISCM)','What was your biggest impact?'],
  projects:   ['Tell me about the ERP project','Open KeHE project','Open demand forecasting','Technical skills?'],
  skills:     ['What are your technical skills?','What is DDMRP?','What certifications do you have?','Machine learning projects?'],
  contact:    ['Copy email address','Open to opportunities?','What makes you unique?','Tell me about yourself'],
  writing:    ['Tell me about the SC index','Tell me about the KeHE article','Show me Projects','Take me to Experience'],
  voices:     ['What do your professors say about you?','Why supply chain?','Take me to Projects'],
  stats:      ['Tell me about the Rs 200K savings','Tell me about the SC index','What makes you unique?'],
  matcher:    ['Technical skills?','Open to opportunities?','What makes you unique?'],
  game:       ['Take me to Projects','Tell me about yourself','Surprise me'],
  simulator:  ['What is DDMRP?','Tell me about demand planning','Tell me about the ERP project','Technical skills?'],
};

/* ── CHIP MANAGEMENT ──────────────────────────────────────── */
var DEFAULT_CHIPS=['Tell me about yourself','Show me Projects','Take me to Experience','What can you do?'];
function setChips(arr){
  arr=arr||DEFAULT_CHIPS;
  chips.innerHTML=arr.map(function(t){return '<span class="aip-chip">'+t+'</span>';}).join('');
  chips.style.display='';
  chips.querySelectorAll('.aip-chip').forEach(function(c){
    c.addEventListener('click',function(){
      if(isStreaming)return;
      input.value=c.textContent; doSend();
    });
  });
}

/* ── STREAMING TYPEWRITER ─────────────────────────────────── */
async function streamInto(rawText,bubble){
  bubble.innerHTML='';
  /* markdown→HTML */
  var html=rawText
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/__(.*?)__/g,'<em>$1</em>')
    .replace(/_(.*?)_/g,'<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g,'<br><br>')
    .replace(/\n/g,'<br>');

  /* tokenize tags vs text */
  var tokens=[],buf='',inTag=false;
  for(var i=0;i<html.length;i++){
    var ch=html[i];
    if(ch==='<'){if(buf)tokens.push({t:'txt',v:buf});buf='<';inTag=true;}
    else if(ch==='>'){buf+=ch;tokens.push({t:'tag',v:buf});buf='';inTag=false;}
    else buf+=ch;
  }
  if(buf)tokens.push({t:'txt',v:buf});

  var displayed='';
  for(var ti=0;ti<tokens.length;ti++){
    var tok=tokens[ti];
    if(tok.t==='tag'){
      displayed+=tok.v; bubble.innerHTML=displayed;
    } else {
      var chars=tok.v.split('');
      for(var ci2=0;ci2<chars.length;ci2++){
        displayed+=chars[ci2]; bubble.innerHTML=displayed;
        msgs.scrollTop=msgs.scrollHeight;
        var delay=chars[ci2]===' '||chars[ci2]==='\n'?0:8+Math.random()*14;
        if(delay>0) await new Promise(function(r){setTimeout(r,delay);});
      }
    }
  }
  bubble.innerHTML=displayed;
  msgs.scrollTop=msgs.scrollHeight;
}

/* ── MESSAGE HELPERS ─────────────────────────────────────── */
function addBotBubble(){
  var d=document.createElement('div');
  d.className='ai-m b';
  d.innerHTML='<div class="ai-ico">TK</div><div class="ai-mb"></div>';
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
  return d.querySelector('.ai-mb');
}
function addUser(t){
  var d=document.createElement('div');
  d.className='ai-m u';
  var safe=t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  d.innerHTML='<div class="ai-ico">You</div><div class="ai-mb">'+safe+'</div>';
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}
function showTyping(){
  var d=document.createElement('div');
  d.className='ai-m b';d.id='ai-typ';
  d.innerHTML='<div class="ai-ico">TK</div><div class="ai-mb ai-typ"><span></span><span></span><span></span></div>';
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}

/* ── VOICE READBACK ─────────────────────────────────────── */
var voiceToggle=document.getElementById('aip-voice-toggle');
var voiceOn=false;
if(voiceToggle){
  voiceToggle.addEventListener('click',function(){
    voiceOn=!voiceOn;
    voiceToggle.classList.toggle('on',voiceOn);
    voiceToggle.title=voiceOn?'🔊 Spoken replies on':'🔇 Spoken replies off';
  });
}
function speak(text){
  if(!voiceOn||!window.speechSynthesis)return;
  window.speechSynthesis.cancel();
  var plain=text.replace(/<[^>]+>/g,'').replace(/\*\*(.*?)\*\*/g,'$1').replace(/__?(.*?)__?/g,'$1').replace(/\n/g,' ');
  var u=new SpeechSynthesisUtterance(plain);
  u.rate=1.06;u.pitch=1.0;
  var voices=speechSynthesis.getVoices();
  var pref=voices.find(function(v){return /en-US/i.test(v.lang)&&(/natural|premium|enhanced/i.test(v.name));})
           ||voices.find(function(v){return /en-US/i.test(v.lang);})
           ||voices.find(function(v){return /en/i.test(v.lang);});
  if(pref)u.voice=pref;
  speechSynthesis.speak(u);
}

/* ── PANEL TOGGLE ────────────────────────────────────────── */
function toggle(){
  isOpen=!isOpen;panel.classList.toggle('open',isOpen);
  btn.classList.toggle('on',isOpen);
  panel.setAttribute('aria-hidden',isOpen?'false':'true');
  btn.setAttribute('aria-expanded',isOpen?'true':'false');
  if(isOpen&&!msgs.children.length){
    var bubble=addBotBubble();
    var welcome="Hey! I’m **Tirthal** — supply chain & analytics, MS candidate at DePaul, Chicago.\n\nI can answer questions about my background **and** navigate this portfolio for you. Try:\n• _\"Take me to Projects\"_\n• _\"Open experience 3\"_ (Kothari Electronics)\n• _\"Show me the ERP project\"_\n• _\"Surprise me\"_\n\nWhat do you want to explore?";
    streamInto(welcome,bubble).then(function(){
      setChips(['Tell me about yourself','Show me Projects','Take me to Experience','What can you do?']);
    });
  }
  if(isOpen)setTimeout(function(){input.focus();},350);
  else btn.focus();
}
btn.addEventListener('click',toggle);
closeBtn.addEventListener('click',toggle);
setChips(null);

/* ── MAIN SEND HANDLER ────────────────────────────────────── */
async function doSend(){
  var txt=input.value.trim(); if(!txt||isStreaming)return;
  input.value=''; send.disabled=true; chips.style.display='none';
  isStreaming=true;
  addUser(txt);
  showTyping();
  var thinkMs=350+Math.floor(Math.random()*350);
  await new Promise(function(r){setTimeout(r,thinkMs);});
  document.getElementById('ai-typ')?.remove();
  var bubble=addBotBubble();

  var intent=detectIntent(txt);

  if(intent){
    switch(intent.type){

      case 'nav':{
        lastSection=intent.id;
        var label=NAV_LABELS[intent.id]||intent.kw||intent.id;
        var navMsg='Navigating to **'+label+'**…';
        await streamInto(navMsg,bubble);
        gotoSection(intent.id);
        setChips(SECTION_CHIPS[intent.id]||['Tell me about yourself','Show me Projects','Surprise me']);
        break;
      }

      case 'exp':{
        var EXPNAMES=['LPC Office Assistant (DePaul)','Student Ambassador (DePaul)','Operations & SC Consultant (Kothari Electronics)','Research Analyst (ISCM)','Content & Social Media Intern (Career Launcher)','Supply Chain Intern (Mentone Concretes)'];
        var ename=EXPNAMES[intent.n-1]||'that experience';
        var emsg='Opening **'+ename+'** in the Experience section…';
        await streamInto(emsg,bubble);
        speak(emsg.replace(/\*\*/g,''));
        openExpItem(intent.n);
        var EXP_ROLE_CHIPS=[
              ['Tell me about your work experience','Tell me about Student Ambassador role','Take me to Projects','When do you graduate?'],
              ['Tell me about Student Ambassador role','Tell me about Kothari Electronics','DePaul coursework?','Take me to Projects'],
              ['Tell me about Kothari Electronics','What were the Rs 200K savings?','Operations skills?','Tell me about ISCM'],
              ['Tell me about the SC index','Tell me about Kothari Electronics','What certifications do you have?','Take me to Projects'],
              ['Tell me about your work experience','Show me Projects','Technical skills?'],
              ['Tell me about Mentone Concretes','What is DDMRP?','Take me to Experience','Take me to Projects'],
            ];
            setChips(EXP_ROLE_CHIPS[intent.n-1]||['Tell me about your work experience','Other experiences?','Take me to Projects']);
        break;
      }

      case 'proj':{
        var PNAMES={forecast:'Retail Demand Forecasting',kehe:'KeHE Truckload RFP',automation:'AI-Automated SC Analytics (ERP)',segmentation:'Customer Segmentation',churn:'Churn Prediction Model',optimization:'Optimization in Excel'};
        var pmsg='Opening **'+(PNAMES[intent.id]||intent.id)+'**…';
        await streamInto(pmsg,bubble);
        speak(pmsg.replace(/\*\*/g,''));
        openProject(intent.id);
        var PROJ_ROLE_CHIPS={
              forecast:['What ML tools did you use?','Tell me about the ERP project','Open KeHE project','Technical skills?'],
              kehe:['Tell me about the KeHE article','What transportation tools?','Open demand forecasting','Take me to Writing'],
              automation:['Tell me about the ERP project','Is the ERP live?','Technical skills?','Open demand forecasting'],
              segmentation:['Tell me about machine learning','Open churn prediction','Technical skills?'],
              churn:['Tell me about machine learning','Open demand forecasting','Technical skills?'],
              optimization:['What tools for optimization?','Open KeHE project','Technical skills?'],
            };
            setChips(PROJ_ROLE_CHIPS[intent.id]||['Technical skills?','Other projects?','Take me to Experience']);
        break;
      }

      case 'copyemail':{
        copyEmail();
        await streamInto('✅ Copied **tirth14503@gmail.com** to your clipboard.',bubble);
        setChips(['Take me to Contact','Open to opportunities?','Hire Tirthal']);
        break;
      }

      case 'surprise':{
        var fact=SURPRISE[Math.floor(Math.random()*SURPRISE.length)];
        await streamInto(fact,bubble);
        speak(fact.replace(/\*\*(.*?)\*\*/g,'$1'));
        setChips(['Tell me more about that','Another surprise!','Show me Experience','Show me Projects']);
        break;
      }

      case 'coverletter':{
        var jd=intent.rawText||'';
        var explicit=intent.explicit;
        if(!explicit && jd.length<120){ var r2=buildReply(jd); await streamInto(r2.text,bubble); setChips(r2.chips); break; }
        var roleRx=/(supply chain|logistics|procurement|operations|sourcing|planning|analyst|coordinator|specialist|planner|manager|director|intern)\s*\w*/gi;
        var roleM=jd.match(roleRx); var role=(roleM&&roleM[0]?roleM[0].trim():'Supply Chain Analyst');
        var coM=jd.match(/(?:at|with|join(?:ing)?|for)\s+([A-Z][A-Za-z0-9\s&,\.]{2,30?})(?:\s+(?:is|are|we|the|our|–|-|,|\.|!|\n))/);
        var company=coM&&coM[1]?coM[1].trim():'your organization';
        var hasDDMRP=/ddmrp|demand.driven/i.test(jd);
        var hasERP=/erp|sap|netsuite|oracle|dynamics/i.test(jd);
        var hasPy=/python|sql|tableau|analytics|data\s+analysis/i.test(jd);
        var hasProc=/procurement|sourcing|purchasing|vendor|supplier|strategic\s+sourcing/i.test(jd);
        var hasOps=/operations|warehouse|distribution|logistics|3pl/i.test(jd);
        var detected=!explicit?'**Looks like a job description — generating your tailored cover letter:**\n\n':'';
        var cl=detected+
          'Dear '+company+' Hiring Team,\n\n'+
          'I am writing to express my strong interest in the **'+role+'** role. As an MS Supply Chain Management candidate at DePaul University (graduating June 2026) with three years of hands-on experience in manufacturing procurement and operations, I bring both academic foundation and real-world P&L accountability that most early-career candidates cannot.\n\n'+
          (hasProc||hasOps?'**Procurement impact you can verify:** At Kothari Electronics, I renegotiated vendor terms and redesigned a PVC wire reprocessing workflow, delivering **₹200,000 in documented FY24 savings** — not projected, not estimated, actual finance-team-confirmed numbers.\n\n':'')+
          (hasERP?'**Built a live ERP from scratch:** Django, Python, SQL — multi-user authentication, inventory management, financial KPIs, AI demand forecasting, barcode scanner with camera. Running now at tirthalkothari.pythonanywhere.com. I built it to understand what I\'d eventually manage, not to pad a resume.\n\n':'')+
          (hasPy?'**Analytical depth:** I built India\'s first national supply chain index analyzing **1,500+ public companies** across 24 sectors in R, Excel, and Tableau — improving efficiency methodology by 40% over prior frameworks. The results were published as the Top 20 Supply Chain Champions of India report.\n\n':'')+
          (hasDDMRP?'**DDMRP Certified:** I hold a Demand Driven Planner certification and apply DDMRP buffer logic in both academic and research contexts.\n\n':'')+
          'I would welcome the opportunity to discuss how this background maps to '+company+'\'s needs.\n\n'+
          '**Tirthal Kothari** | tirth14503@gmail.com | Chicago, IL\n'+
          'tirthalkothari.pythonanywhere.com (live ERP · login available)';
        await streamInto(cl,bubble);
        var copyBtn=document.createElement('button');
        copyBtn.textContent='Copy cover letter';
        copyBtn.style.cssText='margin-top:14px;padding:7px 18px;background:rgba(28,58,94,.9);color:#e0eeff;border:none;border-radius:20px;font-size:.78rem;cursor:pointer;font-weight:600;transition:opacity .2s;display:block;';
        copyBtn.onclick=function(){
          var txt=bubble.innerText.replace('Copy cover letter','').replace('Copied! ✓','').trim();
          navigator.clipboard.writeText(txt).then(function(){copyBtn.textContent='Copied! \u2713';setTimeout(function(){copyBtn.textContent='Copy cover letter';},2500);});
        };
        bubble.appendChild(copyBtn);
        setChips(['Customise for another role','Make it shorter','Add more DDMRP focus','Tell me about Kothari Electronics']);
        break;
      }
      case 'hire':{
        var hmsg='**Excellent decision.** 🎯\n\nEmail **tirth14503@gmail.com** — I’ll respond within 24 hours with my resume and availability for a call.\n\nLinkedIn also works: **linkedin.com/in/tirthalkothari**';
        await streamInto(hmsg,bubble);
        speak("Excellent decision. Email tirth14503@gmail.com and I'll get back to you within 24 hours.");
        setChips(['Copy email address','Take me to Contact','What makes you unique?']);
        break;
      }

      case 'help':{
        var helpreply=buildReply('what can you do');
        await streamInto(helpreply.text,bubble);
        speak(helpreply.text.replace(/<[^>]+>/g,'').replace(/\*\*(.*?)\*\*/g,'$1'));
        setChips(helpreply.chips||['Take me to Experience','Show me Projects','Surprise me']);
        break;
      }

      default:{
        var dr=buildReply(txt);
        await streamInto(dr.text,bubble);
        speak(dr.text.replace(/\*\*(.*?)\*\*/g,'$1'));
        setChips(dr.chips);
      }
    }
  } else {
    var reply=buildReply(txt);
    await streamInto(reply.text,bubble);
    speak(reply.text.replace(/\*\*(.*?)\*\*/g,'$1'));
    setChips(reply.chips);
  }

  send.disabled=false; isStreaming=false; input.focus();
}

send.addEventListener('click',doSend);
input.addEventListener('keydown',function(e){
  e.stopPropagation();
  if(e.key==='Enter'&&!isStreaming)doSend();
});

/* ── MIC INSIDE CHAT ─────────────────────────────────────── */
var mic=document.getElementById('aip-mic');
if(mic&&(window.SpeechRecognition||window.webkitSpeechRecognition)){
  mic.removeAttribute('hidden');
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  var sr=null;
  mic.addEventListener('click',function(){
    if(isStreaming)return;
    if(sr){sr.stop();return;}
    sr=new SR();sr.lang='en-US';sr.interimResults=false;sr.maxAlternatives=1;
    mic.classList.add('listening');
    sr.onresult=function(e){
      input.value=e.results[0][0].transcript;
      doSend();
    };
    sr.onerror=function(){mic.classList.remove('listening');sr=null;};
    sr.onend=function(){mic.classList.remove('listening');sr=null;};
    sr.start();
  });
}

})(); /* end TirthalAI v2 */

/* ═══════════════════════════════════
   CAREER TIMELINE — drag scroll
═══════════════════════════════════ */
(()=>{
  const wrap=document.getElementById('tl-scroll');
  if(!wrap)return;
  let isDown=false,startX,scrollL;
  wrap.addEventListener('mousedown',e=>{isDown=true;startX=e.pageX-wrap.offsetLeft;scrollL=wrap.scrollLeft;wrap.style.cursor='grabbing';});
  wrap.addEventListener('mouseleave',()=>{isDown=false;wrap.style.cursor='grab';});
  wrap.addEventListener('mouseup',()=>{isDown=false;wrap.style.cursor='grab';});
  wrap.addEventListener('mousemove',e=>{if(!isDown)return;e.preventDefault();const x=e.pageX-wrap.offsetLeft;wrap.scrollLeft=scrollL-(x-startX)*1.2;});
})();

/* ═══════════════════════════════════
   SUPPLY CHAIN METRICS REVEAL
   (the 3 scroll-triggered 3D scenes live in
   a separate <script> below, near )
═══════════════════════════════════ */
(()=>{
  const sec=document.getElementById('scflow');
  if(!sec) return;
  let shown=false;
  const sio=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting && !shown){
        shown=true;
        document.querySelectorAll('.scf-met').forEach((m,i)=>setTimeout(()=>m.classList.add('show'),400+i*150));
      }
    });
  },{threshold:.3});
  // caption reveal is independent of WebGL/3D availability so it still
  // works on mobile or if the Three.js CDN is blocked
  document.querySelectorAll('.scm-caption').forEach(cap=>{
    new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)cap.classList.add('vis');}),{threshold:.3}).observe(cap);
  });
  sio.observe(sec);
})();

/* ═══════════════════════════════════
   IMPACT CALCULATOR
═══════════════════════════════════ */
(()=>{
  const slVend=document.getElementById('sl-vendors');
  const slSpend=document.getElementById('sl-spend');
  const slDef=document.getElementById('sl-defect');
  const slInv=document.getElementById('sl-inv');
  if(!slVend)return;

  function fmt(n){
    if(n>=1000000) return '$'+(n/1000000).toFixed(1)+'M';
    if(n>=1000) return '$'+(n/1000).toFixed(0)+'K';
    return '$'+n.toFixed(0);
  }

  function calc(){
    const vendors=+slVend.value,spend=+slSpend.value;
    const defect=+slDef.value/100,inv=+slInv.value/100;

    // Procurement savings: ~8% of spend via strategic sourcing
    const procSave=spend*0.08;
    // Defect reduction: reduce defect rate by 40%, defect cost = 3% of spend per defect %
    const defSave=spend*defect*0.4*0.15;
    // Inventory optimization: reduce carrying cost 15% via DDMRP
    const invSave=spend*0.35*inv*0.15;
    // Vendor consolidation: $800/vendor removed (admin, audit, risk)
    const vendorsToRemove=Math.max(0,Math.floor(vendors*0.1));
    const vendSave=vendorsToRemove*1200;
    const total=procSave+defSave+invSave+vendSave;

    document.getElementById('cv-vendors').textContent=vendors;
    document.getElementById('cv-spend').textContent=fmt(spend);
    document.getElementById('cv-defect').textContent=defect*100+'%';
    document.getElementById('cv-inv').textContent=(inv*100)+'%';
    document.getElementById('calc-total').innerHTML=fmt(total);
    document.getElementById('calc-proc').textContent=fmt(procSave);
    document.getElementById('calc-def').textContent=fmt(defSave);
    document.getElementById('calc-inv').textContent=fmt(invSave);
    document.getElementById('calc-vend').textContent=fmt(vendSave);
  }
  [slVend,slSpend,slDef,slInv].forEach(s=>s.addEventListener('input',calc));
  calc();
})();

/* ═══════════════════════════════════
   SMART RESUME MATCHER (AI-powered)
═══════════════════════════════════ */
(()=>{
  const btn=document.getElementById('matcher-btn');
  const ta=document.getElementById('matcher-ta');
  const out=document.getElementById('matcher-out');
  const typing=document.getElementById('matcher-typing');
  const result=document.getElementById('matcher-result');
  const ctrlBtn=document.getElementById('btn-matcher');
  if(!btn)return;

  // Also wire up the control panel button
  ctrlBtn?.addEventListener('click',()=>{
    document.getElementById('matcher').scrollIntoView({behavior:'smooth'});
    setTimeout(()=>ta.focus(),600);
  });

  /* ── Verified skills matrix: [name, aliases, weight, hasIt, evidence] ── */
  const TAXO=[
    ['Demand Planning',['demand planning','demand forecast','forecasting','s&op','sales and operations planning'],3,1,'Led demand planning at Kothari Electronics; built AI forecasting into his ERP'],
    ['Procurement & Sourcing',['procurement','sourcing','strategic sourcing','purchasing','buyer','category management','rfp','rfq'],3,1,'Rs 200K FY24 sourcing savings; real KeHE truckload RFP practicum'],
    ['Supplier Management',['supplier','vendor management','supplier evaluation','vendor relations','scorecard','supplier performance'],3,1,'Supplier scorecards at Mentone; 3 years of vendor management'],
    ['Inventory Management',['inventory','replenishment','safety stock','reorder','stock levels','inventory optimization'],3,1,'MRP at Mentone (+30% availability); ERP stock ledger he built'],
    ['MRP / Materials Planning',['mrp','material requirements','materials planning','material planning'],2,1,'Daily MRP execution at Mentone Concretes'],
    ['Logistics & Transportation',['logistics','transportation','freight','truckload','carrier','3pl','shipping','fleet','last mile','ltl'],3,1,'20+ weekly shipments; transportation optimization model; KeHE RFP'],
    ['Warehouse / Distribution',['warehouse','distribution center','wms','fulfillment','fulfilment'],2,1,'E-commerce logistics coursework; ERP warehouse flows'],
    ['Data Analytics',['analytics','data analysis','data-driven','insights','kpi','dashboard','reporting','metrics'],3,1,'1,500+ company national index at ISCM; ERP KPI dashboards'],
    ['SQL',['sql'],2,1,'His ERP runs on SQL; database coursework'],
    ['Python',['python','pandas','scikit'],2,1,'Django ERP; ML projects: forecasting, churn, clustering'],
    ['R',['r programming',' r,','rstudio','r studio'],2,1,'India supply chain index built in R'],
    ['Excel',['excel','pivot','vlookup','spreadsheet','solver'],2,1,'Advanced Excel; LP optimization labs (M&D Chemicals)'],
    ['Tableau / BI',['tableau','power bi','powerbi','data visualization','data visualisation','looker'],2,1,'Tableau at ISCM; Tata data-viz simulation'],
    ['ERP Systems',['erp','sap','oracle','netsuite','dynamics','d365'],2,1,'Built a complete Django ERP solo; ERP concepts coursework'],
    ['Machine Learning',['machine learning','predictive model','predictive analytics','ml model'],2,1,'MGT594 demand-forecasting team project; churn and segmentation models'],
    ['Optimization / Modeling',['optimization','linear programming','network design','simulation','modeling','anylogistix'],2,1,'Transportation optimization model; AnyLogistix; Excel Solver LP'],
    ['Lean / Six Sigma',['six sigma','lean','continuous improvement','kaizen','process improvement'],2,1,'Six Sigma Green Belt; defect-waste reduction at Kothari Electronics'],
    ['DDMRP',['ddmrp','buffer management'],2,1,'DDMRP certified (DD Brix Factory)'],
    ['Risk Management',['risk','resilience','mitigation','disruption','contingency'],2,1,'Risk factors in the ISCM index; supplier-risk scoring in his ERP'],
    ['Sustainability / ESG',['esg','sustainability','net-zero','net zero','carbon','responsible sourcing'],2,1,'Integrated ESG into the national index methodology'],
    ['Stakeholder Communication',['stakeholder','presentation','cross-functional','communication skills','collaborat','executive'],2,1,'Hosted CSCOs in the Dialogue Series; 100+ students advised'],
    ['Project Coordination',['project management','project coordination','deadlines','multiple projects','organize','organis'],2,1,'7+ events led; multi-project office workflows at DePaul'],
    ['CRM Tools',['crm','salesforce','slate'],1,1,'Slate CRM with a 24-hour SLA at DePaul'],
    ['Negotiation',['negotiation','contract'],2,1,'Vendor negotiations behind Rs 200K savings'],
    ['E-commerce',['e-commerce','ecommerce','marketplace','omnichannel'],2,1,'BMS in E-Commerce Operations; e-commerce logistics coursework'],
    ['Planning suites (Kinaxis/o9/BY)',['kinaxis','o9','blue yonder','jda','anaplan','sap ibp','sap apo'],2,0,''],
    ['SAP hands-on',['sap ecc','s/4','s4 hana','sap mm','sap sd'],2,0,''],
    ['People management',['direct reports','manage a team','people management','supervise staff'],2,0,''],
    ['Field certifications',['cdl','forklift'],1,0,'']
  ];
  const ROLE_TYPES=[
    [['supply chain'],95],[['procurement','sourcing','buyer','purchasing'],94],
    [['demand plan','forecast'],93],[['inventory','materials plan','replenish'],93],
    [['analyst','analytics'],95],[['logistics','transportation','freight'],90],
    [['operations'],89],[['data'],87],[['consultant'],85],[['coordinator','specialist'],90],[['planner'],93]
  ];

  /* CORE = the domain areas that genuinely signal a supply-chain / operations /
     analytics role. Generic overlaps (communication, risk, project coordination,
     Excel, etc.) are deliberately NOT core, so a random corporate JD full of
     buzzwords can't fake a high score. */
  const CORE=new Set(['Demand Planning','Procurement & Sourcing','Supplier Management','Inventory Management','MRP / Materials Planning','Logistics & Transportation','Warehouse / Distribution','Data Analytics','SQL','Python','R','Tableau / BI','ERP Systems','Machine Learning','Optimization / Modeling','DDMRP','Lean / Six Sigma','Planning suites (Kinaxis/o9/BY)','SAP hands-on']);

  /* word-boundary term match, so 'lean' doesn't match "clean", 'r' doesn't
     match random letters, etc. Naive includes() caused false positives. */
  function hasTerm(l,a){
    a=a.trim();
    var esc=a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return new RegExp('(^|[^a-z0-9])'+esc+'([^a-z0-9]|$)').test(l);
  }

  function analyse(jd){
    const l=(' '+jd.toLowerCase().replace(/\s+/g,' ')+' ');
    const matched=[],gaps=[];
    let wHave=0,wFound=0,coreMatched=0;
    TAXO.forEach(t=>{
      if(t[1].some(a=>hasTerm(l,a))){
        wFound+=t[2];
        if(CORE.has(t[0]))coreMatched++;
        if(t[3]){wHave+=t[2];matched.push(t);}else{gaps.push(t);}
      }
    });
    const skillPct=wFound?Math.round(100*wHave/wFound):40;
    let expFit=52,roleHit=false; /* default LOW; only a real role signal lifts it */
    for(const rt of ROLE_TYPES){ if(rt[0].some(a=>hasTerm(l,a))){expFit=rt[1];roleHit=true;break;} }
    const wantsMasters=l.includes('master')||l.includes(' ms ')||l.includes('m.s');
    const wantsBachelor=l.includes('bachelor')||l.includes(' bs ')||l.includes('b.s');
    const eduFit=wantsMasters?100:(wantsBachelor?95:82);
    const seniorReq=/(?:^|[^0-9])(?:[7-9]|1[0-9])\s*\+?\s*years/.test(l)||/\b(director|vice president|vp|head of|principal|senior manager)\b/.test(l);
    let score=Math.round(skillPct*0.55+expFit*0.30+eduFit*0.15);

    /* DOMAIN-RELEVANCE GATE: without genuine supply-chain / analytics content,
       the score is capped hard. Real SCM roles clear these easily. */
    let offTopic=false;
    if(coreMatched===0&&!roleHit){ score=Math.min(score,36); offTopic=true; }
    else if(coreMatched===0){ score=Math.min(score,50); }
    else if(coreMatched===1){ score=Math.min(score,64); }
    else if(coreMatched===2){ score=Math.min(score,80); }
    if(seniorReq)score=Math.min(score,74);
    score=Math.max(22,Math.min(97,score));

    const headline=offTopic?'Outside My Field'
      :score>=88?'Excellent Fit'
      :score>=78?'Strong Match'
      :score>=64?'Good Match'
      :score>=50?'Partial / Adjacent'
      :'Not a Fit';
    matched.sort((a,b)=>b[2]-a[2]);
    const strengths=matched.slice(0,4).map(t=>t[0]+' - '+t[4]);
    const gapList=gaps.slice(0,3).map(t=>t[0]+' (not yet hands-on - fast learner with adjacent experience)');
    if(seniorReq)gapList.unshift('Role signals senior-level tenure; Tirthal is early-career (strong for analyst/associate scope)');
    if(!gapList.length)gapList.push(offTopic?'This role sits outside his supply chain / analytics focus':'No major gaps against the requirements stated in this JD');
    const summary=offTopic
      ?'This doesn\'t read like a supply chain, operations, or analytics role - only generic overlaps were found, not genuine domain fit. Honest scoring, not a black box: paste an SCM, procurement, logistics, or analytics JD for a real read.'
      :'Detected '+(matched.length+gaps.length)+' requirement areas, '+coreMatched+' of them core supply-chain / analytics domains. Tirthal has verified, evidence-backed experience in '+matched.length+'. Scored deterministically against his skills matrix - no black box.';
    return {score,headline,summary,strengths,gaps:gapList,keywords:matched.slice(0,8).map(t=>t[0]),skillPct,expFit,eduFit};
  }

  function doMatch(){
    const jd=ta.value.trim();
    if(jd.length<30){ta.style.borderColor='rgba(255,59,48,.5)';setTimeout(()=>ta.style.borderColor='',1500);return;}
    btn.disabled=true;
    out.style.display='block';
    typing.style.display='flex';
    result.style.display='none';
    setTimeout(()=>{showResult(analyse(jd));btn.disabled=false;},900);
  }

  function showResult(data){
    typing.style.display='none';
    result.style.display='block';
    const circumference=188.5;
    const offset=circumference*(1-data.score/100);
    setTimeout(()=>{
      document.getElementById('score-arc').style.strokeDashoffset=offset;
      document.getElementById('score-text').textContent=data.score+'%';
    },100);
    document.getElementById('match-headline').textContent=data.headline||'Good Match';
    document.getElementById('match-summary').textContent=data.summary||'';
    const bar=(label,val)=>'<div style="margin-bottom:.7rem"><div style="display:flex;justify-content:space-between;font-family:var(--fm);font-size:.54rem;letter-spacing:.14em;text-transform:uppercase;color:var(--text3);margin-bottom:.3rem"><span>'+label+'</span><span style="color:var(--gold)">'+val+'%</span></div><div style="height:6px;background:rgba(0,0,0,.08);border-radius:3px;overflow:hidden"><i style="display:block;height:100%;width:'+val+'%;background:linear-gradient(90deg,var(--gold),var(--gold3));border-radius:3px"></i></div></div>';
    const sections=document.getElementById('match-sections');
    sections.innerHTML=
      '<div class="match-sec" style="grid-column:1/-1"><div class="match-sec-title">Score Breakdown</div>'
      +bar('Skills coverage',data.skillPct)+bar('Experience alignment',data.expFit)+bar('Education fit',data.eduFit)+'</div>'
      +'<div class="match-sec"><div class="match-sec-title">Strengths</div><ul class="match-list">'
      +(data.strengths||[]).map(s=>'<li>'+s+'</li>').join('')+'</ul></div>'
      +'<div class="match-sec"><div class="match-sec-title">Gaps / Notes</div><ul class="match-list">'
      +(data.gaps||[]).map(g=>'<li class="gap">'+g+'</li>').join('')+'</ul>'
      +((data.keywords&&data.keywords.length)?'<div style="margin-top:.8rem;display:flex;flex-wrap:wrap;gap:.3rem;">'+data.keywords.map(k=>'<span style="font-family:var(--fm);font-size:.5rem;padding:.2rem .6rem;background:var(--gold-t2);border:1px solid rgba(28,58,94,.2);color:var(--gold);border-radius:12px;text-transform:uppercase;letter-spacing:.1em">'+k+'</span>').join('')+'</div>':'')
      +'</div>';
    /* expose result + a share affordance (score-card overlay) */
    window.__matchData=data;
    window.__matchRole=(window.__extractRole?window.__extractRole(ta.value):'');
    var shareBtn=document.getElementById('match-share-btn');
    if(!shareBtn){
      shareBtn=document.createElement('button');
      shareBtn.id='match-share-btn'; shareBtn.className='btn-ghost';
      shareBtn.style.cssText='margin-top:1.4rem;font-size:.8rem;';
      shareBtn.textContent='Share this result →';
      shareBtn.addEventListener('click',function(){ if(window.openMatchShare) window.openMatchShare(); });
      sections.parentNode.appendChild(shareBtn);
    }
  }

  btn.addEventListener('click',doMatch);
  ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.ctrlKey)doMatch();});
})();

/* ═══════════════════════════════════
   COFFEE CHAT CALENDAR
═══════════════════════════════════ */
(()=>{
  const monthsEl=document.getElementById('cal-months');
  const gridEl=document.getElementById('cal-grid');
  const timesEl=document.getElementById('cal-times');
  const confirmEl=document.getElementById('cal-confirm');
  const confirmBtn=document.getElementById('cal-confirm-btn');
  const bookedEl=document.getElementById('cal-booked');
  if(!monthsEl)return;

  const today=new Date();
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days=['Su','Mo','Tu','We','Th','Fr','Sa'];
  const TIMES=['9:00 AM','9:30 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM','4:30 PM'];
  // Available days: Mon-Fri only, starting 3 days from today
  const AVAIL_DAYS=[1,2,3,4,5]; // Mon-Fri

  let selectedMonth=today.getMonth();
  let selectedYear=today.getFullYear();
  let selectedDay=null,selectedTime=null;

  // Render month tabs (current + next 2)
  for(let i=0;i<3;i++){
    const m=(today.getMonth()+i)%12;
    const y=today.getFullYear()+Math.floor((today.getMonth()+i)/12);
    const btn=document.createElement('button');
    btn.className='cal-month-btn'+(i===0?' active':'');
    btn.textContent=months[m];
    btn.dataset.m=m; btn.dataset.y=y;
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.cal-month-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      selectedMonth=+btn.dataset.m; selectedYear=+btn.dataset.y;
      selectedDay=null;selectedTime=null;
      renderGrid();renderTimes();
    });
    monthsEl.appendChild(btn);
  }

  function renderGrid(){
    gridEl.innerHTML='';
    // Day labels
    days.forEach(d=>{const el=document.createElement('div');el.className='cal-day-label';el.textContent=d;gridEl.appendChild(el);});
    const firstDay=new Date(selectedYear,selectedMonth,1).getDay();
    const daysInMonth=new Date(selectedYear,selectedMonth+1,0).getDate();
    const minDate=new Date(today);minDate.setDate(minDate.getDate()+3);

    for(let i=0;i<firstDay;i++){const el=document.createElement('div');el.className='cal-day empty';gridEl.appendChild(el);}
    for(let d=1;d<=daysInMonth;d++){
      const el=document.createElement('div');
      const date=new Date(selectedYear,selectedMonth,d);
      const dow=date.getDay();
      const isPast=date<minDate;
      if(!isPast&&AVAIL_DAYS.includes(dow)){
        el.className='cal-day avail'+(selectedDay===d?' selected':'');
        el.textContent=d;
        el.addEventListener('click',()=>{
          selectedDay=d;selectedTime=null;
          renderGrid();renderTimes();
        });
      } else {
        el.className='cal-day past';el.textContent=d;
      }
      gridEl.appendChild(el);
    }
  }

  function renderTimes(){
    timesEl.innerHTML='';
    confirmEl.style.display='none';
    if(!selectedDay){timesEl.innerHTML='<span style="font-family:var(--fm);font-size:.46rem;letter-spacing:.14em;color:var(--text3);text-transform:uppercase">Select a date first</span>';return;}
    TIMES.forEach(t=>{
      const el=document.createElement('span');
      el.className='cal-time'+(selectedTime===t?' selected':'');
      el.textContent=t;
      el.addEventListener('click',()=>{
        selectedTime=t;renderTimes();
        confirmEl.style.display='block';
        confirmBtn.textContent=`Confirm: ${months[selectedMonth]} ${selectedDay}, ${t} CT →`;
      });
      timesEl.appendChild(el);
    });
  }

  confirmBtn?.addEventListener('click',()=>{
    const subj=`Coffee Chat Request: ${months[selectedMonth]} ${selectedDay}, ${selectedTime} CT`;
    const body=`Hi Tirthal,\n\nI'd love to book a 15-minute coffee chat on ${months[selectedMonth]} ${selectedDay} at ${selectedTime} CT.\n\nLooking forward to connecting!\n\n[Your name & contact]`;
    window.location.href=`mailto:tirth14503@gmail.com?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    confirmEl.style.display='none';
    bookedEl.style.display='block';
  });

  renderGrid();renderTimes();
})();

