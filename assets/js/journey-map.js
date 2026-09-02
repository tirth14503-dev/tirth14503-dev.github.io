
(function lazyJourneyMap(){
  var lazyHost=document.getElementById('journeymap');
  var lazyStarted=false;
  function launchJourneyMap(){
    if(lazyStarted) return;
    lazyStarted=true;
    (function journeyMap(){
  /* ── City detail panel data ── */
  var DATA={
    mumbai:{
      badge:'Mumbai, India',
      title:'Where the instincts came from',
      city:'Mumbai',
      coords:'18.9433° N · 72.8234° E',
      landmark:'Marine Drive · Back Bay skyline',
      image:'assets/journey/mumbai-marine-drive.jpg',
      alt:'Mumbai skyline and Back Bay illuminated at night from Marine Drive',
      map:'https://www.openstreetmap.org/?mlat=18.9433&mlon=72.8234#map=15/18.9433/72.8234',
      credit:'Photo: <a href="https://commons.wikimedia.org/wiki/File:Mumbai_Skyline_Marine_Drive_Night.jpg" target="_blank" rel="noopener">Av9 / Wikimedia Commons</a> · CC BY-SA 4.0',
      body:'<p>I grew up inside my family’s electronics business, running <strong>procurement, quality control, inventory, and distribution</strong> for three years. Renegotiated vendor terms for ₹200K in FY24 savings and salvaged defective PVC wire for another ₹90K a year.</p>'
          +'<p>Then <strong>national-level research at ISCM</strong> — building India’s first supply chain index across 1,500+ companies, and hosting CSCOs from the country’s biggest firms.</p>'
    },

    chicago:{
      badge:'Chicago, Illinois',
      title:'Where the analytics came in',
      city:'Chicago',
      coords:'41.8818° N · 87.6232° W',
      landmark:'Lake Michigan · Downtown skyline',
      image:'assets/journey/chicago-skyline.jpg',
      alt:'Chicago skyline photographed from Lake Michigan',
      map:'https://www.openstreetmap.org/?mlat=41.8818&mlon=-87.6232#map=13/41.8818/-87.6232',
      credit:'Photo: <a href="https://commons.wikimedia.org/wiki/File:Chicago_Skyline_from_Lake_Michigan.jpg" target="_blank" rel="noopener">Bladerunner2019 / Wikimedia Commons</a> · CC BY-SA 3.0',
      body:'<p>An <strong>MS in Supply Chain Management at DePaul’s Kellstadt Graduate School</strong>, graduating June 2026 — predictive analytics, procurement strategy, inventory optimization.</p>'
          +'<p>Alongside it, two campus roles and a full <strong>ERP system I built solo</strong>. The operational instincts came from Mumbai; Chicago is where I paired them with the tools.</p>'
    }
  };

  /* ── City button click handlers ── */
  var detail=document.getElementById('jm-detail');
  var badge=document.getElementById('jm-badge');
  var titleEl=document.getElementById('jm-title');
  var bodyEl=document.getElementById('jm-body');
  var placeVisual=document.getElementById('jm-place-visual');
  var placeImage=document.getElementById('jm-place-image');
  var placeCoords=document.getElementById('jm-place-coords');
  var placeCity=document.getElementById('jm-place-city');
  var placeLandmark=document.getElementById('jm-place-landmark');
  var mapLink=document.getElementById('jm-map-link');
  var photoCredit=document.getElementById('jm-photo-credit');
  var current=null;

  function showCity(city){
    var d=DATA[city]; if(!d||city===current) return;
    current=city;
    document.querySelectorAll('.jm-city-btn').forEach(function(b){
      b.classList.toggle('jm-city-active', b.getAttribute('data-city')===city);
    });
    if(detail) detail.classList.add('swap');
    if(placeVisual) placeVisual.classList.add('swap');
    setTimeout(function(){
      if(badge) badge.textContent=d.badge;
      if(titleEl) titleEl.textContent=d.title;
      if(bodyEl) bodyEl.innerHTML=d.body;
      if(placeImage){ placeImage.src=d.image; placeImage.alt=d.alt; }
      if(placeCoords) placeCoords.textContent=d.coords;
      if(placeCity) placeCity.textContent=d.city;
      if(placeLandmark) placeLandmark.textContent=d.landmark;
      if(mapLink) mapLink.href=d.map;
      if(photoCredit) photoCredit.innerHTML=d.credit;
      if(detail) detail.classList.remove('swap');
      if(placeVisual) placeVisual.classList.remove('swap');
    },220);
  }
  document.querySelectorAll('.jm-city-btn').forEach(function(btn){
    btn.addEventListener('click',function(){ showCity(btn.getAttribute('data-city')); });
  });
  showCity('mumbai');

  /* ── 3-D Globe ── */
  var canvas=document.getElementById('jm-globe');
  if(!canvas||typeof THREE==='undefined') return;

  /* helpers */
  function latLon3(lat,lon,r){
    var phi=lat*Math.PI/180, th=lon*Math.PI/180;
    return new THREE.Vector3(r*Math.cos(phi)*Math.cos(th), r*Math.sin(phi), -r*Math.cos(phi)*Math.sin(th));
  }
  function greatCircle(p1,p2,n,r){
    var v1=latLon3(p1[0],p1[1],1).normalize();
    var v2=latLon3(p2[0],p2[1],1).normalize();
    var om=Math.acos(Math.max(-1,Math.min(1,v1.dot(v2))));
    var sinO=Math.sin(om), pts=[];
    for(var i=0;i<=n;i++){
      var t=i/n;
      var s1=sinO>1e-5?Math.sin((1-t)*om)/sinO:1-t;
      var s2=sinO>1e-5?Math.sin(t*om)/sinO:t;
      pts.push(new THREE.Vector3((v1.x*s1+v2.x*s2)*r,(v1.y*s1+v2.y*s2)*r,(v1.z*s1+v2.z*s2)*r));
    }
    return pts;
  }

  var W=canvas.parentElement.offsetWidth||700;
  var H=Math.max(300,canvas.parentElement.offsetHeight||Math.min(Math.round(W*0.58),620));
  canvas.width=W; canvas.height=H;

  var renderer,scene,camera,globeGroup,planeGroup,planeSprite,routePts,animating=true;
  var sparkPos,sparkColors,sparkLife,sparkVel,spkGeo,spkMat,spkPoints,spkEmitN=0,spkNextIdx=0,MAX_SPARKS=100;
  try{
    renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true});
    renderer.setSize(W,H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.05;
  }catch(e){ return; }

  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(46,W/H,0.05,100);
  camera.position.set(0,0.8,2.28);
  camera.lookAt(0,0.08,0);

  /* lighting */
  scene.add(new THREE.AmbientLight(0x99aacc,0.55));
  var sun=new THREE.DirectionalLight(0xfff5e0,1.3);
  sun.position.set(5,4,4); scene.add(sun);
  var fillLight=new THREE.DirectionalLight(0x2244aa,0.25); fillLight.position.set(-4,-2,-3); scene.add(fillLight);

  /* globe group — everything rotates together */
  globeGroup=new THREE.Group(); scene.add(globeGroup);

  /* ocean sphere — canvas texture with subtle continental shading */
  (function buildEarth(){
    /* Use NASA's real Blue Marble satellite mosaic. Keep the file local so the
       globe remains reliable and does not depend on a third-party request. */
    var earthMat=new THREE.MeshPhongMaterial({
      color:0xffffff,
      specular:0x284766,
      shininess:7,
      emissive:0x010205
    });
    var realEarth=new THREE.Mesh(new THREE.SphereGeometry(1,96,96),earthMat);
    globeGroup.add(realEarth);
    new THREE.TextureLoader().load('assets/journey/earth-blue-marble.png',function(map){
      map.encoding=THREE.sRGBEncoding;
      map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      earthMat.map=map;
      earthMat.needsUpdate=true;
    });
    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.025,64,64),
      new THREE.MeshPhongMaterial({color:0x5aa7ff,transparent:true,opacity:0.08,side:THREE.FrontSide,depthWrite:false})
    ));
    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.075,64,64),
      new THREE.MeshBasicMaterial({color:0x4d9dff,transparent:true,opacity:0.055,side:THREE.BackSide,depthWrite:false})
    ));
    return;

    var tc=document.createElement('canvas'); tc.width=2048; tc.height=1024;
    var ctx=tc.getContext('2d');
    /* ocean gradient */
    var grd=ctx.createLinearGradient(0,0,0,512);
    grd.addColorStop(0,'#061225'); grd.addColorStop(0.5,'#0a1e3d'); grd.addColorStop(1,'#061225');
    ctx.fillStyle=grd; ctx.fillRect(0,0,2048,1024);

    /* rough continent fills — equirectangular [lon,lat] -> [x,y] */
    function ll2xy(lon,lat){ return [(lon+180)/360*2048,(90-lat)/180*1024]; }
    function poly(pts,fill){
      ctx.beginPath();
      var p0=ll2xy(pts[0][0],pts[0][1]); ctx.moveTo(p0[0],p0[1]);
      for(var i=1;i<pts.length;i++){var p=ll2xy(pts[i][0],pts[i][1]);ctx.lineTo(p[0],p[1]);}
      ctx.closePath(); ctx.fillStyle=fill; ctx.fill();
    }
    var land='#1b3522', land2='#162d1e';

    /* ── North America ── (outer coast CCW: Pacific south, Gulf east, Atlantic north, Arctic west) */
    poly([
      [-168,70],[-152,58],[-133,54],[-126,48],[-124,46],[-124,37],[-118,34],
      [-115,30],[-110,24],[-105,20],[-92,16],[-85,10],[-77,8],  // Pacific & Cntrl Am.
      [-76,9],[-75,11],[-75,20],[-80,23],         // Caribbean coast N
      [-80,25],[-82,29],[-81,31],                  // Florida
      [-80,32],[-75,35],[-72,41],[-66,44],[-60,46],[-53,46],  // E coast
      [-56,52],[-60,60],[-64,63],[-78,65],         // Labrador
      [-85,66],[-92,72],[-105,72],[-120,72],[-140,68],[-155,60],[-168,70]  // Arctic
    ], land);

    /* ── South America ── (outer coast CCW) */
    poly([
      [-78,8],[-77,4],[-76,0],[-75,-4],[-78,-8],  // Colombia/Ecuador
      [-80,-2],[-81,-5],[-80,-10],                 // Peru coast
      [-77,-14],[-75,-15],[-72,-17],[-70,-18],     // Peru/Bolivia border
      [-68,-22],[-67,-24],[-68,-30],[-70,-32],
      [-71,-36],[-72,-40],[-65,-46],[-66,-52],
      [-68,-55],[-66,-55],[-63,-53],[-60,-53],     // Tierra del Fuego
      [-56,-50],[-52,-46],[-50,-38],[-48,-28],
      [-48,-16],[-45,-12],[-44,-8],[-40,-2],[-35,5],  // E coast N
      [-38,8],[-42,10],[-50,12],[-60,12],
      [-68,10],[-73,8],[-76,5],[-78,8]             // Back to Panama/Colombia
    ], land);

    /* ── Europe + UK ── */
    poly([
      [-9,37],[-8,44],[-9,48],[-5,48],[0,50],[2,51],[4,53],[8,55],[10,58],
      [5,62],[6,62],[15,70],[20,70],[28,72],[30,70],[28,65],[24,62],
      [28,60],[30,60],[28,56],[22,54],[18,54],[15,55],[10,55],[8,58],
      [5,55],[5,50],[7,44],[10,44],[14,42],[16,38],[14,38],[12,36],
      [5,37],[0,37],[-6,37],[-9,37]
    ], land);

    /* ── Africa ── (outer coast CCW: W Atlantic, S Indian, E Red Sea, N Mediterranean) */
    poly([
      [-5,36],[-6,33],[-8,29],[-12,23],[-17,20],[-16,14],[-14,10],[-10,8],
      [-5,5],[0,5],[3,5],[5,4],[8,5],[9,3],[9,2],
      [10,-2],[11,-6],[10,-14],[12,-18],[14,-23],[16,-28],[18,-30],[20,-35],
      [26,-34],[28,-32],[32,-28],[36,-22],[40,-12],[40,-8],[40,2],[42,11],
      [50,11],[43,14],[38,16],[37,20],[34,27],[32,31],  // Horn + Red Sea
      [24,31],[12,30],[9,37],[3,37],[-5,36]             // N coast Mediterranean
    ], land);

    /* ── Arabian Peninsula ── */
    poly([
      [33,30],[37,22],[38,16],[42,14],[44,11],[48,14],[50,14],
      [54,16],[56,18],[58,22],[60,25],[58,28],[55,28],
      [52,26],[48,22],[44,18],[42,14],[38,16],[36,22],[34,28],[33,30]
    ], land);

    /* ── Indian Subcontinent ── */
    poly([
      [67,23],[68,22],[70,21],[72,20],[73,17],[75,14],[77,9],[77,8],
      [78,8],[80,9],[80,13],[82,15],[82,18],[84,20],[87,21],[88,22],
      [90,22],[91,23],[92,22],[97,28],[95,27],[90,27],[87,27],
      [80,28],[77,32],[75,34],[73,33],[71,28],[68,24],[67,23]
    ], land);

    /* ── Russia / Northern Asia ── */
    poly([
      [30,50],[25,55],[20,58],[22,65],[28,70],[35,72],[50,73],[70,73],
      [90,73],[110,72],[130,70],[150,68],[160,65],[168,65],
      [170,60],[165,58],[155,52],[150,48],[140,46],[132,44],
      [122,40],[115,38],[112,40],[105,50],[100,50],[90,50],[80,50],
      [70,52],[60,52],[50,50],[40,50],[30,50]
    ], land);

    /* ── China / East Asia ── */
    poly([
      [73,35],[80,32],[85,28],[90,26],[95,22],[100,18],[105,20],
      [108,20],[110,18],[114,18],[118,22],[122,24],[120,26],[124,28],
      [128,30],[130,34],[128,40],[122,42],[120,40],[115,40],[110,42],
      [105,45],[100,48],[96,50],[90,47],[85,44],[80,40],[75,38],[73,35]
    ], land);

    /* ── Southeast Asia (mainland + peninsula) ── */
    poly([
      [92,22],[95,20],[98,18],[100,14],[100,8],[102,4],[104,2],
      [103,2],[100,4],[100,6],[103,8],[104,10],[102,14],[100,18],
      [98,18],[96,20],[92,22]
    ], land);

    /* ── Australia ── */
    poly([
      [114,-22],[114,-26],[114,-34],[118,-34],[122,-34],[125,-32],
      [128,-34],[132,-32],[134,-32],[136,-32],[138,-32],[140,-30],
      [142,-38],[144,-38],[146,-38],[148,-38],[150,-36],[152,-30],
      [153,-26],[153,-22],[150,-18],[148,-14],[144,-12],[138,-12],
      [132,-14],[128,-18],[124,-20],[120,-22],[117,-20],[114,-22]
    ], land);

    /* ── Greenland ── */
    poly([
      [-68,76],[-50,78],[-24,78],[-18,72],[-22,68],[-28,64],
      [-42,60],[-52,62],[-62,65],[-68,72],[-68,76]
    ], land);

    /* ── Japan (simplified) ── */
    poly([[130,30],[132,32],[134,34],[136,36],[138,38],[140,40],[142,42],
          [140,44],[136,44],[132,40],[130,38],[128,34],[130,30]], land);

    var tex=new THREE.CanvasTexture(tc);
    var earth=new THREE.Mesh(
      new THREE.SphereGeometry(1,64,64),
      new THREE.MeshPhongMaterial({map:tex,specular:0x1a3a5e,shininess:18,emissive:0x020508})
    );
    globeGroup.add(earth);

    /* atmosphere */
    globeGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.018,32,32),
      new THREE.MeshPhongMaterial({color:0x2255bb,transparent:true,opacity:0.10,side:THREE.FrontSide,depthWrite:false})
    ));
    /* outer rim glow */
    var rim=new THREE.Mesh(
      new THREE.SphereGeometry(1.06,32,32),
      new THREE.MeshPhongMaterial({color:0x1133aa,transparent:true,opacity:0.045,side:THREE.BackSide,depthWrite:false})
    );
    globeGroup.add(rim);
  })();

  /* graticule */
  (function buildGraticule(){
    var mat=new THREE.LineBasicMaterial({color:0x88b4dc,transparent:true,opacity:0.12});
    function line(pts){ globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat)); }
    var R=1.001;
    for(var lat=-60;lat<=60;lat+=30){
      var p=[]; for(var lo=0;lo<=360;lo+=4) p.push(latLon3(lat,lo,R)); line(p);
    }
    for(var lon=0;lon<360;lon+=30){
      var p=[]; for(var la=-85;la<=85;la+=4) p.push(latLon3(la,lon,R)); line(p);
    }
  })();

  /* ── City Lights: major supply-chain hub cities glow on globe surface ── */
  (function buildCityLights(){
    /* [lat, lon] — key global logistics hubs */
    var HUBS=[
      [18.97,72.87],   /* Mumbai */
      [41.88,-87.63],  /* Chicago */
      [31.23,121.47],  /* Shanghai */
      [1.35,103.82],   /* Singapore */
      [25.20,55.27],   /* Dubai */
      [51.90,4.48],    /* Rotterdam */
      [34.05,-118.24], /* Los Angeles */
      [40.71,-74.01],  /* New York */
      [35.68,139.69],  /* Tokyo */
      [51.51,-0.13],   /* London */
      [22.32,114.17],  /* Hong Kong */
      [37.57,126.98],  /* Seoul */
      [50.11,8.68],    /* Frankfurt */
      [-33.87,151.21], /* Sydney */
      [-23.55,-46.63], /* Sao Paulo */
      [48.85,2.35],    /* Paris */
      [55.75,37.62],   /* Moscow */
      [28.63,77.22],   /* Delhi */
      [23.13,113.26],  /* Guangzhou */
      [13.76,100.50]   /* Bangkok */
    ];
    var N=HUBS.length;
    var ptPos=new Float32Array(N*3);
    HUBS.forEach(function(c,i){
      var v=latLon3(c[0],c[1],1.008);
      ptPos[i*3]=v.x; ptPos[i*3+1]=v.y; ptPos[i*3+2]=v.z;
    });
    /* Amber glow texture for each city dot */
    var cc=document.createElement('canvas'); cc.width=cc.height=32;
    var cg=cc.getContext('2d');
    var cgr=cg.createRadialGradient(16,16,0,16,16,14);
    cgr.addColorStop(0,'rgba(255,230,120,1)');
    cgr.addColorStop(0.35,'rgba(255,180,50,0.8)');
    cgr.addColorStop(0.7,'rgba(255,120,20,0.3)');
    cgr.addColorStop(1,'rgba(255,80,0,0)');
    cg.beginPath(); cg.arc(16,16,14,0,Math.PI*2);
    cg.fillStyle=cgr; cg.fill();
    var cityGeo=new THREE.BufferGeometry();
    cityGeo.setAttribute('position',new THREE.BufferAttribute(ptPos,3));
    var cityMat=new THREE.PointsMaterial({
      map:new THREE.CanvasTexture(cc),
      size:0.065,transparent:true,opacity:0.88,
      sizeAttenuation:true,depthWrite:false,
      blending:THREE.AdditiveBlending
    });
    globeGroup.add(new THREE.Points(cityGeo,cityMat));
  })();

  /* route: Mumbai -> Chicago great-circle */
  var MUM=[18.97,72.87], ORD=[41.88,-87.63];
  routePts=greatCircle(MUM,ORD,90,1.003);

  /* route tube — ghost track (full path, dim) */
  var curve=new THREE.CatmullRomCurve3(routePts);
  var tube=new THREE.Mesh(
    new THREE.TubeGeometry(curve,300,0.0025,5,false),
    new THREE.MeshBasicMaterial({color:0x8b6914,transparent:true,opacity:0.45})
  );
  globeGroup.add(tube);

  /* live trail — bright gold line that grows from Mumbai to plane */
  var trailGeo=new THREE.BufferGeometry().setFromPoints([routePts[0],routePts[0]]);
  var trailLine=new THREE.Line(trailGeo,
    new THREE.LineBasicMaterial({color:0xffd060,linewidth:2})
  );
  globeGroup.add(trailLine);

  /* dashed progress indicator (thin black tube, masked by progress) */

  /* city dots */
  function cityDot(lat,lon,col,r){
    r=r||0.021;
    var pos=latLon3(lat,lon,1.023);
    var dot=new THREE.Mesh(new THREE.SphereGeometry(r,10,10),new THREE.MeshPhongMaterial({color:col,emissive:col,emissiveIntensity:0.55}));
    dot.position.copy(pos); globeGroup.add(dot);
    var halo=new THREE.Mesh(new THREE.SphereGeometry(r*1.8,10,10),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.18}));
    halo.position.copy(pos); globeGroup.add(halo);
  }
  cityDot(MUM[0],MUM[1],0xd4a017);
  cityDot(ORD[0],ORD[1],0x4488ff);

  /* ═══════════════════════════════════════════════════════════════
     AIRCRAFT SPRITE  —  canvas-drawn Boeing 737-800 top-down view
     THREE.Sprite always faces camera → always shows a clear silhouette.
     Perspective (sizeAttenuation) makes it grow as it approaches.

     Canvas layout (256×256):
       Y axis = nose-to-tail (nose at y≈12, tail at y≈242)
       X axis = wingspan     (center at x=128, tips at x≈18 and x≈238)
     ═══════════════════════════════════════════════════════════════ */
  (function buildAircraftSprite(){
    var SZ=256, cx=128;
    var ac=document.createElement('canvas');
    ac.width=ac.height=SZ;
    var g=ac.getContext('2d');

    /* ── helper: fill a closed path ── */
    function fillPath(fn,color){
      g.beginPath(); fn(); g.closePath(); g.fillStyle=color; g.fill();
    }
    function fillStrokePath(fn,fill,stroke,lw){
      g.beginPath(); fn(); g.closePath();
      g.fillStyle=fill; g.fill();
      g.strokeStyle=stroke; g.lineWidth=lw||1; g.stroke();
    }

    /* ── LEFT WING  (mirror of right, drawn first so fuselage overlaps) ──
       Root LE(18,100)→Root TE(18,140)→Tip TE(22,157)→Tip LE(22,145)
       Mapped: x mirrored to left side of cx=128                      */
    fillStrokePath(function(){
      g.moveTo(cx-15,100); g.lineTo(cx-15,140);   // root
      g.lineTo(cx-115,157); g.lineTo(cx-110,145); // tip
    },'#bcc4cc','#8c949c',1);

    /* ── RIGHT WING ── */
    fillStrokePath(function(){
      g.moveTo(cx+15,100); g.lineTo(cx+15,140);
      g.lineTo(cx+115,157); g.lineTo(cx+110,145);
    },'#bcc4cc','#8c949c',1);

    /* ── LEFT ENGINE (at ~33% half-span, x=cx-51) ── */
    fillStrokePath(function(){
      g.ellipse(cx-51,124,8,18,0,0,Math.PI*2);
    },'#6a7280','#4a5260');
    fillPath(function(){   /* dark inlet */
      g.ellipse(cx-51,110,6,5.5,0,0,Math.PI*2);
    },'#151920');

    /* ── RIGHT ENGINE ── */
    fillStrokePath(function(){
      g.ellipse(cx+51,124,8,18,0,0,Math.PI*2);
    },'#6a7280','#4a5260');
    fillPath(function(){
      g.ellipse(cx+51,110,6,5.5,0,0,Math.PI*2);
    },'#151920');

    /* ── FUSELAGE (main body drawn over wing roots) ── */
    var fGrad=g.createLinearGradient(cx-15,12,cx+15,12);
    fGrad.addColorStop(0,'#c8ced6');
    fGrad.addColorStop(0.25,'#e4e8ee');
    fGrad.addColorStop(0.55,'#d8dce4');
    fGrad.addColorStop(1,'#b8bec8');
    fillStrokePath(function(){
      g.moveTo(cx,12);                                          /* nose tip */
      g.bezierCurveTo(cx+14,14, cx+15,32, cx+15,55);           /* nose→body R */
      g.lineTo(cx+15,185);                                      /* body R */
      g.bezierCurveTo(cx+15,218, cx+8,232, cx,242);            /* tail taper R */
      g.bezierCurveTo(cx-8,232, cx-15,218, cx-15,185);         /* tail taper L */
      g.lineTo(cx-15,55);                                       /* body L */
      g.bezierCurveTo(cx-15,32, cx-14,14, cx,12);              /* nose→body L */
    },fGrad,'#90979f',1.5);

    /* ── FUSELAGE HIGHLIGHT (specular stripe on left side) ── */
    var hiGrad=g.createLinearGradient(cx-15,0,cx+15,0);
    hiGrad.addColorStop(0,'rgba(255,255,255,0)');
    hiGrad.addColorStop(0.2,'rgba(255,255,255,0.42)');
    hiGrad.addColorStop(0.5,'rgba(255,255,255,0.08)');
    hiGrad.addColorStop(1,'rgba(255,255,255,0)');
    fillPath(function(){
      g.moveTo(cx,12);
      g.bezierCurveTo(cx+14,14, cx+15,32, cx+15,55);
      g.lineTo(cx+15,185);
      g.bezierCurveTo(cx+15,218, cx+8,232, cx,242);
      g.bezierCurveTo(cx-8,232, cx-15,218, cx-15,185);
      g.lineTo(cx-15,55);
      g.bezierCurveTo(cx-15,32, cx-14,14, cx,12);
    },hiGrad);

    /* ── HORIZONTAL STABILIZERS ── */
    fillStrokePath(function(){
      g.moveTo(cx-13,208); g.lineTo(cx-13,220);
      g.lineTo(cx-55,228); g.lineTo(cx-50,215);
    },'#aab2bc','#8a929c');
    fillStrokePath(function(){
      g.moveTo(cx+13,208); g.lineTo(cx+13,220);
      g.lineTo(cx+55,228); g.lineTo(cx+50,215);
    },'#aab2bc','#8a929c');

    /* ── COCKPIT WINDOWS ── */
    fillPath(function(){ g.ellipse(cx-5,52,3,5.5,-0.12,0,Math.PI*2); },
      'rgba(70,140,215,0.72)');
    fillPath(function(){ g.ellipse(cx+5,52,3,5.5, 0.12,0,Math.PI*2); },
      'rgba(70,140,215,0.72)');

    /* ── WINGLETS (small fence at each tip) ── */
    fillPath(function(){
      g.moveTo(cx-110,145); g.lineTo(cx-115,157);
      g.lineTo(cx-119,155); g.lineTo(cx-113,143);
    },'#9098a4');
    fillPath(function(){
      g.moveTo(cx+110,145); g.lineTo(cx+115,157);
      g.lineTo(cx+119,155); g.lineTo(cx+113,143);
    },'#9098a4');

    /* ── ENGINE EXHAUST NOZZLES ── */
    fillPath(function(){ g.ellipse(cx-51,140,5,4,0,0,Math.PI*2); },'#484e58');
    fillPath(function(){ g.ellipse(cx+51,140,5,4,0,0,Math.PI*2); },'#484e58');

    /* ── GLOW HALO (soft amber behind plane) ── */
    var glowGrad=g.createRadialGradient(cx,128,10,cx,128,100);
    glowGrad.addColorStop(0,'rgba(255,210,100,0.22)');
    glowGrad.addColorStop(0.5,'rgba(255,210,100,0.08)');
    glowGrad.addColorStop(1,'rgba(255,210,100,0)');
    fillPath(function(){ g.arc(cx,128,100,0,Math.PI*2); },glowGrad);

    /* ── Build THREE.Sprite ── */
    var tex=new THREE.CanvasTexture(ac);
    var mat=new THREE.SpriteMaterial({
      map:tex, transparent:true, depthWrite:false,depthTest:false,
      sizeAttenuation:true   /* grows/shrinks with camera distance */
    });
    planeSprite=new THREE.Sprite(mat);
    planeSprite.scale.set(0.17,0.17,1);
    /* This is a route indicator, so it must remain legible even when the
       great-circle path passes close to the globe's horizon. */
    planeSprite.renderOrder=50;
    planeSprite.visible=false;
    scene.add(planeSprite);
  })();

  /* ═══════════════════════════════════════════════════════════════
     SPARKLE TRAIL — golden particles stream off the plane
     Uses THREE.Points with vertex colors + AdditiveBlending.
     Particles are emitted at plane world position each frame, drift
     backward along flight direction, and fade gold→invisible in ~35 frames.
     ═══════════════════════════════════════════════════════════════ */
  (function initSparkles(){
    sparkPos=new Float32Array(MAX_SPARKS*3);
    sparkColors=new Float32Array(MAX_SPARKS*3);
    sparkLife=new Float32Array(MAX_SPARKS);
    sparkVel=[];
    for(var _i=0;_i<MAX_SPARKS;_i++){
      sparkPos[_i*3]=sparkPos[_i*3+1]=sparkPos[_i*3+2]=9999; /* off-screen until alive */
      sparkColors[_i*3]=sparkColors[_i*3+1]=sparkColors[_i*3+2]=0;
      sparkLife[_i]=0;
      sparkVel.push(new THREE.Vector3());
    }
    /* Star texture: bright center, warm amber fade */
    var _sc=document.createElement('canvas'); _sc.width=_sc.height=32;
    var _sg=_sc.getContext('2d');
    var _gr=_sg.createRadialGradient(16,16,0,16,16,14);
    _gr.addColorStop(0,'rgba(255,248,200,1)');
    _gr.addColorStop(0.25,'rgba(255,210,80,0.9)');
    _gr.addColorStop(0.6,'rgba(255,160,20,0.5)');
    _gr.addColorStop(1,'rgba(255,120,0,0)');
    _sg.beginPath(); _sg.arc(16,16,14,0,Math.PI*2);
    _sg.fillStyle=_gr; _sg.fill();
    spkGeo=new THREE.BufferGeometry();
    spkGeo.setAttribute('position',new THREE.BufferAttribute(sparkPos,3));
    spkGeo.setAttribute('color',new THREE.BufferAttribute(sparkColors,3));
    spkMat=new THREE.PointsMaterial({
      map:new THREE.CanvasTexture(_sc),
      size:0.07, transparent:true, depthWrite:false,
      sizeAttenuation:true, vertexColors:true,
      blending:THREE.AdditiveBlending
    });
    spkPoints=new THREE.Points(spkGeo,spkMat);
    scene.add(spkPoints);
  })();

  /* initial globe orientation: Mumbai facing camera.
     With camera at +Z, a point at lon λ faces forward when globeGroup.rotation.y = -π/2 - λ.
     Mumbai λ=72.87° -> y_start = -π/2 - 1.272 = -2.843
     Chicago λ=-87.63° -> y_end = -π/2 - (-1.529) = -0.042  */
  var Y_START=-2.843, Y_END=-0.042;
  globeGroup.rotation.y=Y_START;
  globeGroup.rotation.x=-0.22; /* tilt Northern Hemisphere toward camera — both cities are ~20-42°N */

  /* city label DOM elements (positioned over canvas in rAF) */
  var lblMum=document.getElementById('jm-lbl-mumbai');
  var lblOrd=document.getElementById('jm-lbl-chicago');

  function projectLabel(lbl,lat,lon){
    if(!lbl) return;
    var worldPos=latLon3(lat,lon,1.06).applyMatrix4(globeGroup.matrixWorld);
    var camPos=camera.position.clone();
    var toCam=camPos.clone().sub(worldPos).normalize();
    var normal=worldPos.clone().normalize();
    /* hide labels on the back of the globe */
    if(toCam.dot(normal)<0.08){ lbl.style.display='none'; return; }
    worldPos.project(camera);
    var x=(worldPos.x*0.5+0.5)*W;
    var y=(-worldPos.y*0.5+0.5)*H;
    lbl.style.display='block';
    lbl.style.left=x+'px';
    lbl.style.top=y+'px';
  }

  /* scroll scrubbing */
  var progress=0, targetProgress=0;
  var section=document.getElementById('journeymap');
  var hintEl=document.getElementById('jm-scroll-hint');
  var hintHidden=false;

  function getRoutePt(t){
    var n=routePts.length-1;
    var idx=t*n, i=Math.floor(idx), f=idx-i;
    var a=routePts[Math.min(i,n)], b=routePts[Math.min(i+1,n)];
    return a.clone().lerp(b,f).normalize().multiplyScalar(1.04);
  }
  function getRouteTangent(t){
    var dt=0.006;
    var a=getRoutePt(Math.max(0,t-dt)), b=getRoutePt(Math.min(1,t+dt));
    return b.clone().sub(a).normalize();
  }

  function tick(){
    requestAnimationFrame(tick);
    if(!animating) return;

    if(section){
      var rect=section.getBoundingClientRect();
      var vh=window.innerHeight||document.documentElement.clientHeight;
      if(rect.bottom>0&&rect.top<vh){
        var raw=(vh*0.65-rect.top)/(rect.height*0.72);
        targetProgress=Math.max(0,Math.min(1,raw));
      }
    }
    progress+=(targetProgress-progress)*0.04;

    /* rotate globe to follow flight path */
    globeGroup.rotation.y=Y_START+(Y_END-Y_START)*progress;

    /* Update matrices NOW so plane can read current globe world-space positions */
    globeGroup.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);

    /* ─── CINEMATIC AIRCRAFT SPRITE: flies toward viewer ─── */
    if(progress>0.015&&planeSprite){
      planeSprite.visible=true;

      /* Route position: globe LOCAL → world space */
      var localPos=getRoutePt(progress);
      var worldPos=localPos.clone().applyMatrix4(globeGroup.matrixWorld);

      /* Keep the aircraft close to the planet and visually to scale. The old
         camera fly-toward made it become a giant illustration at arrival. */
      var flyP=0;
      var finalPos=worldPos.clone();
      planeSprite.position.copy(finalPos);

      /* A restrained route marker, not the subject of the scene. */
      var sc=0.075;
      planeSprite.scale.set(sc,sc,1);

      /* Sprite rotation: nose follows projected flight direction on screen.
         Canvas nose is at top (canvas -Y → screen +Y at rotation=0).
         formula: rotation = atan2(screen_dx, screen_dy)               */
      var localFwd=getRouteTangent(progress);
      var worldFwd=localFwd.clone().transformDirection(globeGroup.matrixWorld);
      /* blend forward toward camera as plane approaches */
      var towardCam=camera.position.clone().sub(finalPos).normalize();
      var blendFwd=worldFwd.clone().lerp(towardCam,Math.pow(flyP,0.5)).normalize();
      var p0=finalPos.clone().project(camera);
      var p1=finalPos.clone().addScaledVector(blendFwd,0.04).project(camera);
      var fdx=p1.x-p0.x, fdy=p1.y-p0.y;
      if(fdx*fdx+fdy*fdy>1e-8){
        planeSprite.material.rotation=Math.atan2(fdx,fdy);
      }

      /* Trail stays on globe surface (globeGroup local space) */
      var trailEnd=Math.max(1,Math.floor(progress*(routePts.length-1))+1);
      var trailSlice=routePts.slice(0,trailEnd);
      trailGeo.dispose();
      trailGeo=new THREE.BufferGeometry().setFromPoints(trailSlice);
      trailLine.geometry=trailGeo;

      /* ── Sparkle emit: 2 new particles every other frame ── */
      if(spkGeo){
        spkEmitN++;
        if(spkEmitN%2===0){
          for(var _e=0;_e<2;_e++){
            var _si=spkNextIdx%MAX_SPARKS; spkNextIdx++;
            sparkPos[_si*3  ]=finalPos.x+(Math.random()-.5)*0.012;
            sparkPos[_si*3+1]=finalPos.y+(Math.random()-.5)*0.012;
            sparkPos[_si*3+2]=finalPos.z+(Math.random()-.5)*0.012;
            var _bk=blendFwd.clone().negate().multiplyScalar(0.003+Math.random()*0.005);
            sparkVel[_si].set(
              _bk.x+(Math.random()-.5)*0.003,
              _bk.y+(Math.random()-.5)*0.003,
              _bk.z+(Math.random()-.5)*0.003
            );
            sparkLife[_si]=1.0;
          }
        }
        /* ── Update positions + colors for all particles ── */
        for(var _s=0;_s<MAX_SPARKS;_s++){
          if(sparkLife[_s]<=0){
            sparkPos[_s*3]=sparkPos[_s*3+1]=sparkPos[_s*3+2]=9999;
            sparkColors[_s*3]=sparkColors[_s*3+1]=sparkColors[_s*3+2]=0;
            continue;
          }
          sparkLife[_s]-=0.026;
          var _a=sparkLife[_s]*sparkLife[_s]; /* quadratic fade */
          sparkColors[_s*3  ]=_a;             /* R: full for warm gold */
          sparkColors[_s*3+1]=_a*0.70;        /* G */
          sparkColors[_s*3+2]=_a*0.06;        /* B: very little */
          sparkPos[_s*3  ]+=sparkVel[_s].x;
          sparkPos[_s*3+1]+=sparkVel[_s].y;
          sparkPos[_s*3+2]+=sparkVel[_s].z;
        }
        spkGeo.attributes.position.needsUpdate=true;
        spkGeo.attributes.color.needsUpdate=true;
      }
    } else {
      if(planeSprite) planeSprite.visible=false;
      /* Kill all sparkles when plane is hidden */
      if(spkGeo){
        for(var _s=0;_s<MAX_SPARKS;_s++){
          sparkLife[_s]=0;
          sparkPos[_s*3]=sparkPos[_s*3+1]=sparkPos[_s*3+2]=9999;
          sparkColors[_s*3]=sparkColors[_s*3+1]=sparkColors[_s*3+2]=0;
        }
        spkGeo.attributes.position.needsUpdate=true;
        spkGeo.attributes.color.needsUpdate=true;
      }
    }

    /* city labels */
    projectLabel(lblMum,MUM[0],MUM[1]);
    projectLabel(lblOrd,ORD[0],ORD[1]);

    /* hide scroll hint once user starts scrolling */
    if(!hintHidden&&progress>0.05&&hintEl){ hintEl.classList.add('hide'); hintHidden=true; }

    /* ── Cockpit HUD: update flight telemetry ── */
    (function updateHUD(){
      var hud=document.getElementById('jm-hud');
      if(!hud) return;
      if(progress>0.018){
        hud.classList.add('show');
        /* Altitude: parabolic 0 -> 35,000 -> 0 ft */
        var altFt=Math.round(35000*Math.sin(Math.max(0,Math.min(1,progress))*Math.PI));
        /* Speed: cruise ~490 kts, slight variation */
        var spdKts=Math.round(490+28*Math.sin(progress*Math.PI));
        /* ETA: total MUM->ORD ~840 min (14h) */
        var etaMin=Math.round((1-progress)*840);
        var etaH=Math.floor(etaMin/60), etaM=etaMin%60;
        var altEl=document.getElementById('hud-alt');
        var spdEl=document.getElementById('hud-spd');
        var etaEl=document.getElementById('hud-eta');
        var barEl=document.getElementById('hud-bar-fill');
        if(altEl) altEl.textContent=altFt.toLocaleString();
        if(spdEl) spdEl.textContent=spdKts;
        if(etaEl) etaEl.textContent=etaH+'h '+String(etaM).padStart(2,'0')+'m';
        if(barEl) barEl.style.width=Math.round(progress*100)+'%';
      } else {
        hud.classList.remove('show');
      }
    })();

    renderer.render(scene,camera);
  }
  tick();

  /* resize */
  window.addEventListener('resize',function(){
    var nW=canvas.parentElement.offsetWidth||700;
    var nH=Math.max(300,canvas.parentElement.offsetHeight||Math.min(Math.round(nW*0.58),620));
    W=nW; H=nH;
    renderer.setSize(nW,nH);
    camera.aspect=nW/nH;
    camera.updateProjectionMatrix();
  });
    })();
  }
  if(!lazyHost) return;
  if(!('IntersectionObserver' in window)){ launchJourneyMap(); return; }
  var lazyObserver=new IntersectionObserver(function(entries){
    if(entries.some(function(entry){return entry.isIntersecting;})){
      lazyObserver.disconnect();
      launchJourneyMap();
    }
  },{rootMargin:'700px 0px'});
  lazyObserver.observe(lazyHost);
})();
