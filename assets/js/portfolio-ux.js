(function(){
  'use strict';
  var ids=['game','simulator','impact','matcher'];
  var lab=document.getElementById('lab');
  var controls=lab.querySelector('.lab-controls');
  var tabs=Array.from(lab.querySelectorAll('[role=tab]'));
  var select=document.getElementById('lab-select');
  controls.hidden=false;
  lab.classList.add('lab-enhanced');
  function requestedTool(){
    var hash=location.hash.slice(1);
    if(ids.includes(hash))return hash;
    if(hash==='lab'||!hash){var query=new URLSearchParams(location.search).get('lab');if(ids.includes(query))return query;}
    return null;
  }
  function activate(id,updateUrl,focus){
    if(!ids.includes(id))return;
    tabs.forEach(function(tab){
      var on=tab.id==='lab-tab-'+id;
      tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1;
    });
    ids.forEach(function(key){
      var panel=document.getElementById(key);panel.hidden=key!==id;
      // Reveal observers must not leave text hidden inside a newly selected tool.
      if(key===id)panel.querySelectorAll('.reveal,.reveal-l,.reveal-r,.reveal-scale').forEach(function(el){el.classList.add('up');});
    });
    select.value=id;
    if(updateUrl){var url=new URL(location.href);url.searchParams.delete('lab');url.hash=id;history.pushState(null,'',url);}
    if(focus)document.getElementById('lab-tab-'+id).focus();
    requestAnimationFrame(function(){window.dispatchEvent(new Event('resize'));if(window.ScrollTrigger)window.ScrollTrigger.refresh();});
  }
  window.selectLabTool=function(id){activate(id,false,false);};
  tabs.forEach(function(tab,i){
    tab.addEventListener('click',function(){activate(ids[i],true,false);});
    tab.addEventListener('keydown',function(e){
      var n=i;
      if(e.key==='ArrowRight')n=(i+1)%ids.length;
      else if(e.key==='ArrowLeft')n=(i+ids.length-1)%ids.length;
      else if(e.key==='Home')n=0;
      else if(e.key==='End')n=ids.length-1;
      else return;
      e.preventDefault();activate(ids[n],true,true);
    });
  });
  select.addEventListener('change',function(){activate(select.value,true,false);});
  ['hashchange','popstate'].forEach(function(event){window.addEventListener(event,function(){var id=requestedTool();if(id)activate(id,false,false);});});
  document.addEventListener('click',function(e){
    var link=e.target.closest('a[href^="#"]');if(!link)return;
    var id=link.getAttribute('href').slice(1);if(ids.includes(id))activate(id,false,false);
  });
  var initial=requestedTool();activate(initial||'game',false,false);
  var initialHash=location.hash.slice(1),userNavigated=false;
  ['pointerdown','keydown','wheel','touchstart'].forEach(function(event){window.addEventListener(event,function(){userNavigated=true;},{once:true,passive:true});});
  function alignInitialAnchor(){
    if(userNavigated||!initialHash||initialHash.startsWith('case-'))return;
    var target=document.getElementById(ids.includes(initialHash)?'lab':initialHash);
    if(target)requestAnimationFrame(function(){target.scrollIntoView({behavior:'instant'});});
  }
  window.addEventListener('load',alignInitialAnchor,{once:true});
  window.addEventListener('tk:content-ready',alignInitialAnchor,{once:true});

  // Feature detection applies to every voice entry point, while text chat remains.
  var speechInput=!!(window.SpeechRecognition||window.webkitSpeechRecognition);
  var speechOutput=!!(window.speechSynthesis&&window.SpeechSynthesisUtterance);
  if(!speechInput)['aip-mic','btn-voice'].forEach(function(id){var el=document.getElementById(id);if(el)el.hidden=true;});
  if(!speechOutput){var toggle=document.getElementById('aip-voice-toggle');if(toggle)toggle.hidden=true;}

  var form=document.getElementById('contact-form');
  var status=document.getElementById('ct-ok');
  var submit=document.getElementById('ct-sub');
  function showStatus(message,state){status.textContent=message;status.dataset.state=state;status.style.display='block';}
  document.getElementById('coffee-request-link').addEventListener('click',function(){
    var message=document.getElementById('ct-msg');
    if(!message.value.trim())message.value='Hi Tirthal, I’d like to arrange a 15-minute coffee chat.\n\nTimes that work for me:\nMy time zone:\nWhat I’d like to discuss: ';
    form.querySelector('[name="_subject"]').value='Coffee chat request';
    requestAnimationFrame(function(){document.getElementById('ct-name').focus({preventScroll:true});});
  });
  form.addEventListener('submit',async function(event){
    event.preventDefault();
    if(submit.disabled||!form.reportValidity())return;
    if(form.querySelector('[name="_honey"]').value)return;
    var data=new FormData(form);
    ['name','email','message'].forEach(function(key){data.set(key,String(data.get(key)||'').trim());});
    if(!data.get('name')||!data.get('message')){showStatus('Please enter your name and a message.','error');return;}
    submit.disabled=true;submit.textContent='Sending…';form.setAttribute('aria-busy','true');
    showStatus('Sending your message…','pending');
    var controller=new AbortController();var timeout=setTimeout(function(){controller.abort();},20000);
    try{
      var response=await fetch('https://formsubmit.co/ajax/tirth14503@gmail.com',{
        method:'POST',headers:{Accept:'application/json'},body:data,signal:controller.signal
      });
      var result=await response.json();
      var message=String(result.message||'');
      if(/activat|confirm.*email/i.test(message)){
        showStatus('Direct messaging is awaiting email verification. Please use Copy email address below to contact me in the meantime. Your message is still here.','error');
      }else if(response.ok&&(result.success===true||result.success==='true')){
        showStatus('Your message was accepted for delivery. Thank you for getting in touch.','success');
        form.reset();
      }else{
        showStatus('The message could not be sent. Please try again or use Copy email address below. Your message is still here.','error');
      }
    }catch(error){
      showStatus('Delivery could not be confirmed. Your message is still here; please retry or use Copy email address below.','error');
    }finally{
      clearTimeout(timeout);submit.disabled=false;submit.textContent='Send Message →';form.removeAttribute('aria-busy');
    }
  });
})();
