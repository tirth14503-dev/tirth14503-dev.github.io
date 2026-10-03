/* Shared visitor guide for the startup page and public workspace. */
(() => {
  'use strict';
  const inApp = document.body.dataset.guideContext === 'workspace';
  const overview = [
    {title:'Welcome to MarginGuard', text:'A quick introduction to the decisions you can explore here. Start with synthetic sample data, then follow the evidence behind a result.', label:'YOUR FIRST VISIT', example:['Review','Understand','Plan'], note:'You can skip this guide and reopen it with Quick tour.'},
    {title:'Review invoices with evidence', text:'Compare invoices with purchase orders to spot price differences, excess quantities, and possible duplicates. Open a finding to inspect the original rows before deciding what to do.', label:'01 / INVOICE REVIEW', example:['Purchase order → Invoice','Finding → Source rows'], note:'A flagged difference needs review. It is not a confirmed saving.'},
    {title:'Understand stock and test a plan', text:'Check inventory coverage and excess stock, then explore production plans using materials, bills of materials, and capacity. Compare scenarios to see how an assumption changes the result.', label:'02 / INVENTORY & PLANNING', example:['Stock + demand → Coverage','Materials + capacity → Plan'], note:'Results depend on the data and assumptions you provide.'},
    {title:'Try the sample workspace', text:'Choose Try MarginGuard, then Create an account. Your account starts with its own workspace and a synthetic sample audit. A second guide will explain the tools inside.', label:'03 / GET STARTED', example:['Create an account','Explore the sample','Record a reviewed decision'], note:'The prototype runs while the host PC is awake and connected.'}
  ];
  const workspace = [
    {title:'Start with the sample audit', text:'Your new workspace includes synthetic industrial-parts data. The Overview brings invoice differences, stock exposure, and review progress together.', label:'OVERVIEW', view:'overview', example:['Open the sample audit','Read a metric','Follow it to a finding'], note:'Potential overcharges and excess stock value are not realized savings.'},
    {title:'Look behind a finding', text:'In Findings, open an item and inspect its evidence and source rows. Review the assumptions before preparing a draft for the next step.', label:'FINDINGS', view:'findings', example:['Select a finding','Inspect the source rows','Prepare a review draft'], note:'Possible duplicates and other flags need your judgment.'},
    {title:'Explore the production planner', text:'Use the Production planner to explore demand, shared materials, bills of materials, and capacity. Compare scenarios before choosing a plan.', label:'PRODUCTION PLANNER', view:'planning', example:['Explore the planner','Change an assumption','Compare the results'], note:'Planning scenarios do not place orders or run production.'},
    {title:'Record what happens next', text:'The Action center brings review drafts and decisions together. Approve, reject, or mark a reviewed action complete to keep a record of the outcome.', label:'ACTION CENTER', view:'actions', example:['Review the draft','Record a decision','Track its status'], note:'These records do not automatically send emails or change an ERP system.'},
    {title:'Bring your own data when ready', text:'Use Audit library to upload CSV or Excel files. Settings controls your workspace assumptions. The Analyst can explain audit results; cloud AI is optional and requires your own API key.', label:'YOUR NEXT STEP', view:'audits', example:['Start with synthetic data','Upload files when ready','Keep assumptions visible'], note:'Enabling cloud AI sends relevant audit data to the selected AI service.'}
  ];
  let steps = inApp ? workspace : overview;
  let storageKey = 'marginguard:guide:landing:v1', index = 0, lastFocus = null;
  const memorySeen = new Set();
  const seen = () => {try{return localStorage.getItem(storageKey) === 'seen' || memorySeen.has(storageKey);}catch{return memorySeen.has(storageKey);}};
  const markSeen = () => {memorySeen.add(storageKey);try{localStorage.setItem(storageKey,'seen');}catch{/* Guide still works with browser storage disabled. */}};
  const dialog = document.createElement('dialog');
  dialog.id = 'mg-guide';
  dialog.setAttribute('aria-labelledby','mg-guide-title');
  dialog.setAttribute('aria-describedby','mg-guide-copy');
  dialog.innerHTML = `<div class="mg-guide-head"><span class="mg-guide-brand">MarginGuard / Quick tour</span><button type="button" class="mg-guide-close" aria-label="Skip tutorial">×</button></div><div class="mg-guide-body"><p class="mg-guide-label"></p><h2 id="mg-guide-title"></h2><p id="mg-guide-copy"></p><ol class="mg-guide-example" aria-label="Suggested workflow"></ol><p class="mg-guide-note"></p><button type="button" class="mg-guide-feature" hidden></button></div><div class="mg-guide-foot"><button type="button" class="mg-guide-skip">Skip tour</button><span class="mg-guide-count" role="status" aria-live="polite"></span><div class="mg-guide-controls"><button type="button" class="mg-guide-back">Back</button><button type="button" class="mg-guide-next">Next →</button></div></div>`;
  document.body.append(dialog);
  const q = selector => dialog.querySelector(selector);
  function paint(){
    const step=steps[index];
    q('.mg-guide-label').textContent=step.label;
    q('#mg-guide-title').textContent=step.title;
    q('#mg-guide-copy').textContent=step.text;
    q('.mg-guide-example').replaceChildren(...step.example.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
    q('.mg-guide-note').textContent=step.note;
    q('.mg-guide-count').textContent=`${index+1} of ${steps.length}`;
    q('.mg-guide-back').disabled=index===0;
    q('.mg-guide-next').textContent=index===steps.length-1?'Start exploring':'Next →';
    const target=step.view && document.querySelector(`[data-do="nav"][data-view="${step.view}"]`);
    q('.mg-guide-feature').hidden=!target;
    q('.mg-guide-feature').textContent=target?`Open ${target.textContent.trim()} ↗`:'';
  }
  function open(){
    if(dialog.open || document.querySelector('dialog[open]'))return;
    lastFocus=document.activeElement;
    index=0;paint();dialog.showModal();
    q('.mg-guide-next').focus();
  }
  function dismiss(){markSeen();dialog.close();if(lastFocus?.isConnected)lastFocus.focus();}
  q('.mg-guide-close').addEventListener('click',dismiss);
  q('.mg-guide-skip').addEventListener('click',dismiss);
  q('.mg-guide-back').addEventListener('click',()=>{if(index>0){index--;paint();}});
  q('.mg-guide-next').addEventListener('click',()=>{if(index===steps.length-1)dismiss();else{index++;paint();}});
  q('.mg-guide-feature').addEventListener('click',()=>{
    const target=document.querySelector(`[data-do="nav"][data-view="${steps[index].view}"]`);
    dismiss();if(target){target.click();document.querySelector('#main-content')?.focus();}
  });
  dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
  document.addEventListener('click',event=>{if(event.target.closest('[data-guide-start]'))open();});
  document.addEventListener('marginguard:render',event=>{
    const id=event.detail?.userId;
    if(!id){if(dialog.open)dismiss();storageKey='marginguard:guide:landing:v1';steps=overview;return;}
    storageKey=`marginguard:guide:workspace:v1:${id}`;
    steps=workspace;
    // Scoped supplier accounts only expose the Enterprise workspace.
    if(event.detail.scoped){
      steps=[{title:'Your shared workspace',text:'Use Enterprise workspace to review the records and coordination tools available to your role. Your workspace owner controls which sites and records you can access.',label:'ENTERPRISE WORKSPACE',view:'enterprise',example:['Open Enterprise workspace','Review your assigned records'],note:'Contact your workspace owner if you need additional access.'}];
      return;
    }
    if(!seen())open();
  });
  if(!inApp && !seen())open();
})();
