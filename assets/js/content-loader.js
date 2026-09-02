
(function cmsLoad(){
  var RAW = new URL('content.json?v=' + Date.now(), window.location.href).href;
  fetch(RAW, {cache:'no-store'})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(d){ if(d) applyContent(d); })
    .catch(function(){/* silently fallback to hardcoded content */});

  function applyContent(d){
    try {
      // Hero
      if(d.hero){
        qi('.hero-tag', d.hero.tag);
        qi('.hero-sub', d.hero.bio);
      }
      // Stats
      if(d.stats && d.stats.length){
        var sc = document.querySelectorAll('.stat-card');
        d.stats.forEach(function(s,i){
          if(sc[i]){
            var n=sc[i].querySelector('.stat-n'), l=sc[i].querySelector('.stat-l');
            if(n && s.n) n.textContent=s.n;
            if(l && s.l) l.textContent=s.l;
          }
        });
      }
      // About text
      if(d.about){
        var ps=document.querySelectorAll('.about-text p');
        if(ps[0] && d.about.p1) ps[0].textContent=d.about.p1;
        if(ps[1] && d.about.p2) ps[1].textContent=d.about.p2;
        if(d.about.chips){
          var cr=document.querySelector('.chip-row');
          if(cr) cr.innerHTML=d.about.chips.map(function(c){ return '<span class="chip">'+esc(c)+'</span>'; }).join('');
        }
      }
      // Experience
      if(d.experience && d.experience.length){
        var el=document.getElementById('exp-list');
        if(el){ el.innerHTML=renderExp(d.experience); rewireExp(el); }
      }
      // Projects
      if(d.projects && d.projects.length){
        var pg=document.getElementById('proj-grid');
        if(pg){ pg.innerHTML=renderProj(d.projects); observeReveal(pg); }
      }
      // Writing
      if(d.writing && d.writing.length){
        var wg=document.getElementById('writing-grid');
        if(wg){ wg.innerHTML=renderWriting(d.writing); observeReveal(wg); }
      }
      // After all content replaced: refresh GSAP scroll positions so section
      // headings (sec-title, sec-eyebrow) animate in correctly after layout shift
      setTimeout(function(){
        if(typeof ScrollTrigger!=='undefined') ScrollTrigger.refresh();
      }, 100);
      // Contact links
      if(d.contact){
        if(d.contact.email){
          document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){
            a.href='mailto:'+d.contact.email;
          });
        }
        if(d.contact.linkedin){
          document.querySelectorAll('a[href^="https://"][href*="linkedin.com/in/"]').forEach(function(a){
            a.href=d.contact.linkedin;
          });
        }
        if(d.contact.erp){
          document.querySelectorAll('a[href*="pythonanywhere.com"]').forEach(function(a){
            a.href=d.contact.erp;
          });
        }
      }
      // Footer "last updated" is driven by content.json._updated, which the
      // dashboard stamps on every publish. Previously it was a hardcoded month
      // that silently went stale (it still read "July 2026" in August).
      if(d._updated){
        var su=document.getElementById('site-updated');
        if(su){
          var dt=new Date(d._updated+'T00:00:00');
          if(!isNaN(dt.getTime())){
            var MON=['January','February','March','April','May','June','July',
                     'August','September','October','November','December'];
            su.textContent='Site last updated '+MON[dt.getMonth()]+' '+dt.getFullYear();
          }
        }
      }
    } catch(e){}
  }

  function renderExp(exps){
    return exps.map(function(e,i){
      return '<div class="exp-item">'+
        '<div class="exp-header">'+
        '<div class="exp-num-badge">'+esc(e.n)+'</div>'+
        '<div class="exp-meta"><div class="exp-role">'+esc(e.role)+'</div><div class="exp-org">'+esc(e.org)+'</div></div>'+
        '<div class="exp-right"><div class="exp-date">'+esc(e.date)+'</div><div class="exp-loc-pill">'+esc(e.loc)+'</div></div>'+
        '<div class="exp-toggle-icon">+</div>'+
        '</div>'+
        '<div class="exp-body"><ul class="exp-bullets">'+
        (e.bullets||[]).map(function(b){ return '<li>'+b+'</li>'; }).join('')+
        '</ul></div></div>';
    }).join('');
  }

  function projectPreview(id){
    if(id==='forecast') return '<div class="project-preview"><div class="preview-kicker"><span>Demand signal</span><b>Forecast vs. actual</b></div><div class="forecast-chart"><i style="height:28%"></i><i style="height:47%"></i><i style="height:39%"></i><i style="height:66%"></i><i style="height:55%"></i><i style="height:78%"></i><i style="height:69%"></i><i style="height:88%"></i></div></div>';
    if(id==='kehe') return '<div class="project-preview"><div class="preview-kicker"><span>Carrier bid matrix</span><b>Lane award view</b></div><div class="bid-matrix"><span>Lane</span><span>A</span><span>B</span><span>C</span><span>Award</span><span>CHI–IND</span><span>$</span><span>$$</span><span>$$</span><span class="win">A</span><span>ATL–DAL</span><span>$$</span><span>$</span><span>$$</span><span class="win">B</span><span>PHL–CLE</span><span>$$</span><span>$$</span><span>$</span><span class="win">C</span></div></div>';
    if(id==='automation') return '<div class="project-preview"><div class="preview-kicker"><span>Automated pipeline</span><b>Signal to action</b></div><div class="workflow-mini"><b>SUPABASE<br>DATA</b><i></i><b>AI<br>ANALYSIS</b><i></i><b>GMAIL<br>ALERT</b></div></div>';
    return '';
  }

  function projectStory(id){
    var stories={
      forecast:{challenge:'Turn messy retail demand data into something planners can use.',approach:'Cleaned data, engineered features, and compared regression models.',outcome:'A pipeline that surfaces SKU replenishment risk early.'},
      kehe:{challenge:'Balance cost, coverage, and service across real carrier bids.',approach:'Analyzed KeHE’s 2024 inbound RFP lane by lane.',outcome:'A defensible carrier-award recommendation using live client data.'},
      automation:{challenge:'Replace a manual data-to-alert handoff with a repeatable flow.',approach:'Connected Postgres, AI-assisted analysis, n8n, and Gmail.',outcome:'An end-to-end pipeline from landed data to stakeholder alert.'}
    };
    return stories[id]||null;
  }

  function renderProj(projs){
    var delays=[.05,.12,.19,.05,.12,.19];
    return projs.map(function(p,i){
      var d=delays[i]!==undefined?delays[i]:.05;
      var story=projectStory(p.id);
      var featured=story?' pj-featured':'';
      var middle=story?'<div class="pj-story"><div><span>Challenge</span><p>'+esc(story.challenge)+'</p></div><div><span>Approach</span><p>'+esc(story.approach)+'</p></div><div><span>Outcome</span><p>'+esc(story.outcome)+'</p></div></div>':'<div class="pj-desc">'+p.desc+'</div>';
      return '<div class="pj-card reveal'+featured+'" style="transition-delay:'+d+'s" data-case="'+esc(p.id)+'" role="button" tabindex="0" aria-haspopup="dialog" aria-label="Open case study: '+esc(p.title)+'">'+
        projectPreview(p.id)+
        '<span class="pj-badge">'+esc(p.badge)+'</span>'+
        '<div class="pj-title">'+esc(p.title)+'</div>'+
        middle+
        '<div class="pj-tags">'+(p.tags||[]).map(function(t){ return '<span>'+esc(t)+'</span>'; }).join('')+'</div>'+
        '</div>';
    }).join('');
  }

  function renderWriting(arts){
    var delays=[.05,.12,.05,.1,.15];
    return arts.map(function(a,i){
      var d=delays[i]!==undefined?delays[i]:.05;
      var inner='<span class="pj-badge">'+esc(a.badge)+'</span>'+
        '<div class="pj-title">'+esc(a.title)+'</div>'+
        '<div class="pj-desc">'+a.desc+'</div>'+
        '<div class="pj-tags">'+(a.tags||[]).map(function(t){ return '<span>'+esc(t)+'</span>'; }).join('')+'</div>';
      if(a.external && a.link){
        return '<a class="pj-card reveal" style="text-decoration:none;transition-delay:'+d+'s" href="'+esc(a.link)+'" target="_blank" rel="noopener">'+inner+'</a>';
      }
      return '<div class="pj-card reveal" data-article="'+esc(a.id)+'" style="transition-delay:'+d+'s">'+inner+'</div>';
    }).join('');
  }

  function rewireExp(container){
    container.addEventListener('click', function(e){
      var hdr=e.target.closest('.exp-header');
      if(!hdr) return;
      var item=hdr.closest('.exp-item');
      if(!item) return;
      var isOpen=item.classList.contains('open');
      container.querySelectorAll('.exp-item.open').forEach(function(x){
        x.classList.remove('open');
        var icon=x.querySelector('.exp-toggle-icon');
        if(icon) icon.textContent='+';
      });
      if(!isOpen){
        item.classList.add('open');
        var icon=item.querySelector('.exp-toggle-icon');
        if(icon) icon.textContent='−';
      }
    });
  }

  /* CMS-injected cards are created after the page's own IntersectionObserver
     has already bound its targets, so they would never receive .up and would
     sit at opacity:0 forever. Observe them here, with a fallback that force-
     reveals anything still hidden — a card must never be permanently invisible. */
  function observeReveal(container){
    var els=[].slice.call(container.querySelectorAll('.reveal'));
    if(!els.length) return;
    function show(el){ el.classList.add('up'); }
    if(!('IntersectionObserver' in window)){ els.forEach(show); return; }
    var o=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ show(en.target); o.unobserve(en.target); }
      });
    },{threshold:.1});
    els.forEach(function(el){ o.observe(el); });
    setTimeout(function(){
      els.forEach(function(el){
        var r=el.getBoundingClientRect();
        if(r.top<window.innerHeight && r.bottom>0) show(el);
      });
    },2000);
  }

  function qi(sel,val){ var el=document.querySelector(sel); if(el&&val!==undefined&&val!==null) el.textContent=val; }
  function esc(s){ return String(s||'').replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]; }); }
})();
