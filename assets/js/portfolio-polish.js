(function(){
  'use strict';
  var experience=document.getElementById('exp-list');
  var expand=document.getElementById('experience-expand');
  function updateExpandLabel(){
    var all=Array.from(experience.querySelectorAll('.exp-item')).every(function(item){return item.classList.contains('open');});
    expand.textContent=all?'Collapse all roles':'Expand all roles';
  }
  window.setExperienceOpen=function(item,open){
    item.classList.toggle('open',open);
    var header=item.querySelector('.exp-header'),body=item.querySelector('.exp-body');
    header.setAttribute('aria-expanded',String(open));body.hidden=!open;
    item.querySelector('.exp-toggle-icon').textContent=open?'−':'+';
    updateExpandLabel();
  };
  window.initializeExperience=function(){
    experience.querySelectorAll('.exp-item').forEach(function(item){window.setExperienceOpen(item,item.classList.contains('open'));});
  };
  experience.addEventListener('click',function(event){
    var header=event.target.closest('.exp-header');if(!header)return;
    var item=header.closest('.exp-item');window.setExperienceOpen(item,!item.classList.contains('open'));
  });
  expand.addEventListener('click',function(){
    var items=Array.from(experience.querySelectorAll('.exp-item'));
    var open=!items.every(function(item){return item.classList.contains('open');});
    items.forEach(function(item){window.setExperienceOpen(item,open);});
  });
  window.initializeExperience();

  var projectGroups={
    marginguard:['product','supply-chain'],forecast:['analytics','supply-chain'],
    kehe:['supply-chain'],automation:['analytics','supply-chain'],
    segmentation:['analytics'],churn:['analytics'],optimization:['analytics','supply-chain']
  };
  var projectGrid=document.getElementById('proj-grid');
  var browser=document.getElementById('project-browser');
  var count=document.getElementById('project-count');
  var selected='all';
  function projectKey(card){return card.dataset.case||(card.querySelector('.pj-title')?.textContent.trim()==='MarginGuard'?'marginguard':'');}
  function applyFilter(){
    var cards=Array.from(projectGrid.children),visible=0;
    cards.forEach(function(card){
      var groups=projectGroups[projectKey(card)]||[];
      card.hidden=selected!=='all'&&!groups.includes(selected);
      if(!card.hidden)visible++;
    });
    browser.querySelectorAll('button').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.projectFilter===selected));});
    var label={all:'All projects','supply-chain':'Supply chain',analytics:'Analytics',product:'Product building'}[selected];
    count.textContent=label+' · '+visible+' of '+cards.length+' projects';
    requestAnimationFrame(function(){if(window.ScrollTrigger)window.ScrollTrigger.refresh();});
  }
  browser.hidden=false;
  browser.addEventListener('click',function(event){
    var button=event.target.closest('[data-project-filter]');if(!button)return;
    selected=button.dataset.projectFilter;applyFilter();
  });
  window.revealPortfolioProject=function(key){
    var card=projectGrid.querySelector('[data-case="'+key+'"]');
    if(card&&card.hidden){selected='all';applyFilter();}
  };
  window.refreshPortfolioCards=function(){
    document.querySelectorAll('#writing [data-article]').forEach(function(card){
      if(card.querySelector('.article-action'))return;
      var actions=document.createElement('div');actions.className='project-actions';
      var button=document.createElement('button');button.type='button';button.className='project-action article-action';
      button.textContent='Read field note →';button.setAttribute('aria-haspopup','dialog');
      button.setAttribute('aria-label','Read '+card.querySelector('.pj-title').textContent.trim());
      actions.appendChild(button);card.appendChild(actions);
    });
    applyFilter();
  };
  window.refreshPortfolioCards();

  // Hidden dialogs are inert in the HTML. Opening routines remove inert before focus.
  // Trap Tab inside modal dialogs, including article and search overlays.
  document.addEventListener('keydown',function(event){
    if(event.key!=='Tab')return;
    var dialogs=Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]'));
    var active=dialogs.reverse().find(function(dialog){
      var host=dialog.closest('[aria-hidden]');
      return host&&host.getAttribute('aria-hidden')==='false'&&!host.inert;
    });
    if(!active)return;
    var controls=Array.from(active.querySelectorAll('button,a[href],input,textarea,select,[tabindex="0"]')).filter(function(el){return !el.disabled&&!el.hidden&&el.getClientRects().length>0;});
    if(!controls.length)return;
    var first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&(document.activeElement===first||!active.contains(document.activeElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||!active.contains(document.activeElement))){event.preventDefault();first.focus();}
  },true);
})();
