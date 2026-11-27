/* Shared visitor guide for the startup page and public workspace. */
(() => {
  'use strict';
  const inApp = document.body.dataset.guideContext === 'workspace';
  // Labels are sentence case; page names match the live app's menu (Today, Add data, Findings, Before you pay, Decisions, Planner…).
  const overview = [
    {title:'Welcome to MarginGuard', text:'The example audit uses fictional records, so you can try reviewing a finding before you upload anything.', label:'Your first visit', example:['Open the example audit','Review a finding','Check the source records'], note:'You can reopen this tour from this page.'},
    {title:'Check supplier invoices', text:'Compare invoices with purchase orders and receipts. In Findings, open a finding to check the source rows behind a price difference, a quantity difference or a possible duplicate. Before you pay lists the invoices to check before paying them.', label:'Invoice checks', example:['Purchase order','Supplier invoice','Receipts and returns'], note:'Check the original documents before recording a decision.'},
    {title:'Check stock and try a plan', text:'See how long stock may last and where you hold more than your target. In Planner, try a production plan with your demand, materials and capacity.', label:'Stock and planning', example:['Check stock','Change an assumption','Compare plans'], note:'Results depend on the data and assumptions you enter.'},
    {title:'Get started', text:'Run the free overpayment scan, or create an account. New accounts join a short waitlist; once yours is open, the example audit is ready to try.', label:'Your next step', example:['Run the free scan','Create an account','Open the example audit'], note:'Free during early access. No card required.'}
  ];
  const workspace = [
    {title:'Start with the example audit', text:'Your new workspace includes example data from a fictional parts distributor. Today › Audit overview brings invoice differences, stock and review progress together.', label:'Today', view:'overview', example:['Open the example audit','Read a total','Follow it to a finding'], note:'Possible overcharges and excess stock are not savings until they are confirmed.'},
    {title:'Look behind a finding', text:'In Findings, open an item to see its evidence and source rows. Before you pay lists the invoices to check before you pay them.', label:'Findings', view:'findings', example:['Select a finding','Inspect the source rows','Prepare a review draft'], note:'Possible duplicates and other flags need your judgment.'},
    {title:'Try the production planner', text:'In Planner, explore demand, shared materials, bills of materials and capacity, and compare plans before choosing one.', label:'Planner', view:'planning', example:['Open the planner','Change an assumption','Compare the results'], note:'Plans do not place orders or run production.'},
    {title:'Record what happens next', text:'Decisions keeps review drafts and decisions together. Approve, reject or mark an action complete to keep a record of the outcome.', label:'Decisions', view:'actions', example:['Review the draft','Record a decision','Track its status'], note:'Decisions do not send emails or change an ERP system for you.'},
    {title:'Bring your own data when ready', text:'In Add data, import spreadsheets, PDFs or scans, or connect a mailbox. Workspace settings, in the account menu, holds your assumptions. The Assistant can explain results; cloud AI is optional and needs your own API key.', label:'Add data', view:'workflow', example:['Start with the example data','Add your files','Check the findings'], note:'If you turn on cloud AI, the relevant audit data is sent to the AI service you choose.'}
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
  dialog.innerHTML = `<div class="mg-guide-head"><span class="mg-guide-brand">MarginGuard · Quick tour</span><button type="button" class="mg-guide-close" aria-label="Skip tour">×</button></div><div class="mg-guide-body"><p class="mg-guide-label"></p><h2 id="mg-guide-title"></h2><p id="mg-guide-copy"></p><ol class="mg-guide-example" aria-label="Suggested workflow"></ol><p class="mg-guide-note"></p><button type="button" class="mg-guide-feature" hidden></button></div><div class="mg-guide-foot"><button type="button" class="mg-guide-skip">Skip tour</button><span class="mg-guide-count" role="status" aria-live="polite"></span><div class="mg-guide-controls"><button type="button" class="mg-guide-back">Back</button><button type="button" class="mg-guide-next">Next →</button></div></div>`;
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
      steps=[{title:'Your shared workspace',text:'Use Enterprise workspace to review the records and coordination tools available to your role. Your workspace owner controls which sites and records you can access.',label:'Enterprise workspace',view:'enterprise',example:['Open Enterprise workspace','Review your assigned records'],note:'Contact your workspace owner if you need additional access.'}];
      return;
    }
    if(!seen())open();
  });
  if(!inApp && document.body.dataset.guideAuto !== 'off' && !seen())open();
})();
