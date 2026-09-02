
(function lazyScmJourney(){
  var lazyHost=document.getElementById('scflow');
  var lazyStarted=false;
  function launchScmJourney(){
    if(lazyStarted) return;
    lazyStarted=true;
    __glReady(function initScmActs(){
  const journey = document.getElementById('scm-journey');
  const sticky = document.getElementById('scm-sticky');
  const canvas = document.getElementById('scm-canvas-0');
  const progressBar = document.getElementById('scm-progress');
  if(!journey || !sticky || !canvas) return;
  const captions = Array.prototype.slice.call(document.querySelectorAll('.scm-caption'));
  const dotItems = Array.prototype.slice.call(document.querySelectorAll('.scm-dot-item'));

  /* mobile: no 3D, captions reveal on scroll */
  if(matchMedia('(max-width:760px)').matches){
    captions.forEach(cap=>{
      new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)cap.classList.add('vis');}),{threshold:.3}).observe(cap);
    });
    return;
  }
  if(typeof THREE === 'undefined') return;

  const PAGE_BG = 0xf5f5f7;
  let renderer;
  try{ renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true}); }
  catch(e){ setTimeout(initScmActs, 1200); return; }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvas.style.opacity = 1;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PAGE_BG, 20, 52);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 140);

  scene.add(new THREE.HemisphereLight(0xfdfbf6, 0x8a7648, 0.8));
  const sun = new THREE.DirectionalLight(0xffe9c4, 1.2);
  sun.position.set(10, 14, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 60;
  sun.shadow.bias = -0.0012;
  scene.add(sun);
  const sunTarget = new THREE.Object3D();
  scene.add(sunTarget);
  sun.target = sunTarget;
  const rim = new THREE.DirectionalLight(0xa8bcd8, 0.32);
  rim.position.set(-9, 6, -10);
  scene.add(rim);

  /* ══════════ shared texture kit (canvas-painted, no external images) ══════════ */
  function cvs(w, h, draw){
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  }
  function shade(hex, f){
    const r = Math.min(255, Math.max(0, ((hex >> 16) & 255) * f)) | 0;
    const g = Math.min(255, Math.max(0, ((hex >> 8) & 255) * f)) | 0;
    const b = Math.min(255, Math.max(0, (hex & 255) * f)) | 0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  function weather(ctx, w, h, n, dark){
    for(let i = 0; i < n; i++){
      const x = Math.random() * w, y0 = Math.random() * h * 0.4, len = h * (0.2 + Math.random() * 0.55);
      const g = ctx.createLinearGradient(0, y0, 0, y0 + len);
      g.addColorStop(0, 'rgba(30,20,10,' + (dark * (0.5 + Math.random() * 0.5)) + ')');
      g.addColorStop(1, 'rgba(30,20,10,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x, y0, 1 + Math.random() * 3, len);
    }
  }
  function texSide(hex, code){
    return cvs(384, 192, (ctx, w, h) => {
      ctx.fillStyle = shade(hex, 1); ctx.fillRect(0, 0, w, h);
      for(let x = 6; x < w - 6; x += 12){
        ctx.fillStyle = shade(hex, 0.78); ctx.fillRect(x, 8, 5, h - 16);
        ctx.fillStyle = shade(hex, 1.14); ctx.fillRect(x + 5, 8, 2, h - 16);
      }
      ctx.fillStyle = shade(hex, 0.62);
      ctx.fillRect(0, 0, w, 8); ctx.fillRect(0, h - 8, w, 8);
      ctx.fillRect(0, 0, 7, h); ctx.fillRect(w - 7, 0, 7, h);
      weather(ctx, w, h, 10, 0.13);
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.font = '700 11px Arial';
      ctx.fillText(code, 14, 26);
    });
  }
  function texDoor(hex){
    return cvs(128, 160, (ctx, w, h) => {
      ctx.fillStyle = shade(hex, 0.94); ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = shade(hex, 0.7); ctx.fillRect(w / 2 - 1, 4, 2, h - 8);
      [0.14, 0.36, 0.64, 0.86].forEach(fx => {
        ctx.fillStyle = shade(hex, 1.3);
        ctx.fillRect(w * fx - 1.5, 6, 3, h - 12);
        ctx.fillStyle = shade(hex, 0.5);
        ctx.fillRect(w * fx - 4, h * 0.55, 8, 5);
      });
      ctx.fillStyle = shade(hex, 0.6);
      ctx.fillRect(0, 0, w, 6); ctx.fillRect(0, h - 6, w, 6);
      weather(ctx, w, h, 6, 0.16);
    });
  }
  function texTop(hex){
    return cvs(192, 96, (ctx, w, h) => {
      ctx.fillStyle = shade(hex, 0.9); ctx.fillRect(0, 0, w, h);
      for(let x = 4; x < w; x += 10){ ctx.fillStyle = shade(hex, 0.76); ctx.fillRect(x, 3, 4, h - 6); }
    });
  }
  function texText(str, px, color, w, h, ls){
    return cvs(w, h, (ctx) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.font = '700 ' + px + 'px Arial';
      if(ls) ctx.letterSpacing = ls + 'px';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(str, w / 2, h / 2);
    });
  }
  const texHazard = cvs(64, 64, (ctx, w, h) => {
    ctx.fillStyle = '#d9b229'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1d1d1f';
    for(let i = -1; i < 5; i++){
      ctx.beginPath();
      ctx.moveTo(i * 24, 0); ctx.lineTo(i * 24 + 12, 0);
      ctx.lineTo(i * 24 - 12 + 24, h); ctx.lineTo(i * 24 - 24 + 24, h);
      ctx.closePath(); ctx.fill();
    }
  });
  const glowTex = cvs(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
    g.addColorStop(0, 'rgba(255,250,235,.9)');
    g.addColorStop(0.4, 'rgba(245,200,110,.35)');
    g.addColorStop(1, 'rgba(245,200,110,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  const smokeTex = cvs(96, 96, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
    g.addColorStop(0, 'rgba(210,205,196,.55)');
    g.addColorStop(1, 'rgba(210,205,196,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
  const texAwning = cvs(128, 64, (ctx, w, h) => {
    for(let x = 0; x < w; x += 16){
      ctx.fillStyle = (x / 16) % 2 ? '#f4f1e8' : '#c09018';
      ctx.fillRect(x, 0, 16, h);
    }
  });

  /* ══════════ materials ══════════ */
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x33373d, roughness: 0.6, metalness: 0.45 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0x1c3a5e, roughness: 0.5, metalness: 0.3 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x26313e, roughness: 0.25, metalness: 0.4 });
  const hazardMat = new THREE.MeshStandardMaterial({ map: texHazard, roughness: 0.7 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x8f939a, roughness: 0.5, metalness: 0.6 });
  const tyreMat = new THREE.MeshStandardMaterial({ color: 0x17181c, roughness: 0.9 });
  const warmWin = new THREE.MeshBasicMaterial({ color: 0xffc478 });

  /* ══════════ containers ══════════ */
  const LINER_COLORS = [0x733a2f, 0x334f67, 0x405b4a, 0x35516e, 0x515357];
  const containerGeo = new THREE.BoxGeometry(1.16, 0.62, 0.78);
  const containerMats = LINER_COLORS.map((hex, i) => {
    const side = new THREE.MeshStandardMaterial({ map: texSide(hex, 'TKHU 2610' + (30 + i)), roughness: 0.68, metalness: 0.25 });
    const door = new THREE.MeshStandardMaterial({ map: texDoor(hex), roughness: 0.66, metalness: 0.25 });
    const top  = new THREE.MeshStandardMaterial({ map: texTop(hex), roughness: 0.72, metalness: 0.22 });
    const bot  = new THREE.MeshStandardMaterial({ color: shade(hex, 0.4), roughness: 0.8 });
    return [door, side, top, bot, side, side];
  });
  function makeContainer(ci){
    const m = new THREE.Mesh(containerGeo, containerMats[ci % containerMats.length]);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  /* ══════════ ground ══════════ */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 80),
    new THREE.MeshStandardMaterial({ color: 0xdbd9d3, roughness: 0.95 }));
  ground.rotation.x = -Math.PI/2;
  ground.position.set(4, -0.02, 0);
  ground.receiveShadow = true;
  scene.add(ground);

  /* ══════════ the road — S-curve through four stops ══════════ */
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-30, 0, 4),
    new THREE.Vector3(-22, 0, 6),
    new THREE.Vector3(-12, 0, 1),
    new THREE.Vector3(-5, 0, -4.5),
    new THREE.Vector3(1, 0, -6),
    new THREE.Vector3(8, 0, -5),
    new THREE.Vector3(15, 0, -1),
    new THREE.Vector3(22, 0, 3),
    new THREE.Vector3(29, 0, 3),
    new THREE.Vector3(35, 0, -0.5),
    new THREE.Vector3(41, 0, -2)
  ]);
  const roadShape = new THREE.Shape();
  roadShape.moveTo(0, -1.7); roadShape.lineTo(0.05, -1.7);
  roadShape.lineTo(0.05, 1.7); roadShape.lineTo(0, 1.7);
  roadShape.closePath();
  const road = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roadShape, { extrudePath: curve, steps: 180, bevelEnabled: false }),
    new THREE.MeshStandardMaterial({ color: 0x2c2e33, roughness: 0.95 })
  );
  road.receiveShadow = true;
  scene.add(road);
  /* centre dashes */
  for(let d = 0.01; d < 1; d += 0.012){
    const pt = curve.getPointAt(d);
    const tn = curve.getTangentAt(d);
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.09),
      new THREE.MeshBasicMaterial({ color: 0xeeeee8, transparent: true, opacity: 0.75 }));
    dash.rotation.x = -Math.PI/2;
    dash.rotation.z = -Math.atan2(tn.z, tn.x);
    dash.position.set(pt.x, 0.075, pt.z);
    scene.add(dash);
  }

  /* stop anchors on the curve */
  const T_STOPS = [0, 0.36, 0.66, 1];
  function sideFrame(t, side, dist){
    const pt = curve.getPointAt(t);
    const tn = curve.getTangentAt(t);
    const nx = tn.z * side, nz = -tn.x * side;
    return {
      pos: new THREE.Vector3(pt.x + nx * dist, 0, pt.z + nz * dist),
      /* local +z points back toward the road, so building fronts face it */
      face: Math.atan2(-nx, -nz),
      road: pt
    };
  }

  function box(w, h, d, mat, x, y, z, parent){
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    (parent || scene).add(m);
    return m;
  }
  function decal(tex, w, h, x, y, z, ry, parent){
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.position.set(x, y, z);
    if(ry) m.rotation.y = ry;
    (parent || scene).add(m);
    return m;
  }
  function pad(w, d, x, z, col){
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.92 }));
    m.rotation.x = -Math.PI/2;
    m.position.set(x, 0.005, z);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  }

  /* ══════════ STOP 1 — MANUFACTURING HUB ══════════ */
  const fFrame = sideFrame(0.004, 1, 6.4);
  const factory = new THREE.Group();
  factory.position.copy(fFrame.pos);
  factory.rotation.y = fFrame.face;
  scene.add(factory);
  pad(16, 12, fFrame.pos.x, fFrame.pos.z, 0xcfccc4);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd8d5cd, roughness: 0.85 });
  box(10, 3.4, 6, wallMat, 0, 1.7, -1.5, factory);
  /* sawtooth roof */
  const toothShape = new THREE.Shape();
  toothShape.moveTo(0, 0); toothShape.lineTo(2.5, 0); toothShape.lineTo(2.5, 1.2); toothShape.closePath();
  for(let tt = 0; tt < 4; tt++){
    const tooth = new THREE.Mesh(
      new THREE.ExtrudeGeometry(toothShape, { depth: 6, bevelEnabled: false }),
      new THREE.MeshStandardMaterial({ color: 0xc4c1b8, roughness: 0.8 }));
    tooth.rotation.y = Math.PI/2;
    tooth.position.set(-5 + tt * 2.5, 3.4, 1.5);
    tooth.castShadow = true;
    factory.add(tooth);
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x9fb2c4, roughness: 0.3, metalness: 0.4 }));
    sky.rotation.y = -Math.PI/2;
    sky.position.set(-5 + tt * 2.5 + 0.01, 4.0, -1.5);
    factory.add(sky);
  }
  /* chimneys + smoke */
  const chimneys = [];
  [[-3.4], [-1.2]].forEach(cx => {
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 3.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x9a978e, roughness: 0.8 }));
    ch.position.set(cx[0], 4.9, -3.2);
    ch.castShadow = true;
    factory.add(ch);
    chimneys.push(ch);
  });
  const smokes = [];
  chimneys.forEach((ch, ci) => {
    for(let s = 0; s < 5; s++){
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0.4, depthWrite: false }));
      factory.add(sp);
      smokes.push({ sp, bx: ch.position.x, bz: ch.position.z, ph: s / 5 + ci * 0.4 });
    }
  });
  decal(texText('TK MANUFACTURING', 22, 'rgba(28,58,94,.95)', 512, 48), 6.4, 0.6, 0, 2.6, 1.52, 0, factory);
  /* loading dock + mini hoist over the road side */
  box(4.6, 0.5, 1.6, new THREE.MeshStandardMaterial({ color: 0xa8a49a, roughness: 0.9 }), 0, 0.25, 2.4, factory);
  const hzStrip = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 0.1), hazardMat);
  hzStrip.position.set(0, 0.5, 3.2);
  factory.add(hzStrip);
  [-2, 2].forEach(px => box(0.18, 3.1, 0.18, goldMat, px, 1.55, 3.0, factory));
  box(4.4, 0.22, 0.3, goldMat, 0, 3.15, 3.0, factory);
  /* container stacks in the yard */
  for(let st = 0; st < 3; st++){
    const c1 = makeContainer(st); c1.position.set(3.4 + (st % 2) * 1.34, 0.31, -0.5 - st * 0.94); factory.add(c1);
    if(st < 2){ const c2 = makeContainer(st); c2.position.set(3.4 + (st % 2) * 1.34, 0.94, -0.5 - st * 0.94); factory.add(c2); }
  }
  /* world-space hoist anchor (computed after transforms) */
  factory.updateMatrixWorld(true);
  const hoistTop = new THREE.Vector3(0, 3.05, 3.0).applyMatrix4(factory.matrixWorld);

  /* ══════════ STOP 2 — WAREHOUSE ══════════ */
  const wFrame = sideFrame(0.36, -1, 6.8);
  const wh = new THREE.Group();
  wh.position.copy(wFrame.pos);
  wh.rotation.y = wFrame.face;
  scene.add(wh);
  pad(18, 12, wFrame.pos.x, wFrame.pos.z, 0xd2cfc7);
  box(14, 4.2, 8, new THREE.MeshStandardMaterial({ color: 0xe6e3da, roughness: 0.85 }), 0, 2.1, -2, wh);
  box(14.2, 0.35, 8.2, goldMat, 0, 4.35, -2, wh); /* gold roofline band */
  [[-1.5], [1.5], [4.5]].forEach((dx, di) => {
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.3),
      new THREE.MeshStandardMaterial({ color: di === 0 ? 0x1d2026 : 0x484c55, roughness: 0.6 }));
    door.position.set(dx[0], 1.15, 2.02);
    wh.add(door);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.06), hazardMat);
    strip.position.set(dx[0], 2.4, 2.03);
    wh.add(strip);
  });
  [[-4, 0], [-1, 1], [2, 0]].forEach(hv => box(1.4, 0.5, 1.1, hubMat, hv[0], 4.75, -2 + hv[1], wh));
  decal(texText('TK WAREHOUSE', 24, 'rgba(51,55,61,.9)', 512, 48), 7, 0.7, -3.2, 3.4, 2.03, 0, wh);
  for(let st = 0; st < 4; st++){
    const c = makeContainer(st + 1);
    c.position.set(-5.6 - (st % 2) * 1.34, 0.31 + Math.floor(st / 2) * 0.63, 1.2);
    wh.add(c);
  }
  wh.updateMatrixWorld(true);
  const whDoorA = new THREE.Vector3(-1.5, 0.4, 2.6).applyMatrix4(wh.matrixWorld);
  const whDoorB = new THREE.Vector3(1.5, 0.4, 2.6).applyMatrix4(wh.matrixWorld);

  /* ══════════ STOP 3 — RETAIL STORE ══════════ */
  const rFrame = sideFrame(0.66, 1, 6.2);
  const shop = new THREE.Group();
  shop.position.copy(rFrame.pos);
  shop.rotation.y = rFrame.face;
  scene.add(shop);
  pad(14, 10, rFrame.pos.x, rFrame.pos.z, 0xd6d3cb);
  box(8, 3.2, 5, new THREE.MeshStandardMaterial({ color: 0xefece4, roughness: 0.85 }), 0, 1.6, -1, shop);
  /* glass front with warm interior */
  const storefront = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 1.9), glassMat);
  storefront.position.set(0, 1.15, 1.52);
  shop.add(storefront);
  for(let g = 0; g < 3; g++){
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.2), warmWin);
    glow.position.set(-2.2 + g * 2.2, 1.1, 1.51);
    shop.add(glow);
    const shelf = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x8a5a2e }));
    shelf.position.set(-2.2 + g * 2.2, 1.0, 1.515);
    shop.add(shelf);
  }
  /* striped awning */
  const awning = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 1.1),
    new THREE.MeshStandardMaterial({ map: texAwning, roughness: 0.8, side: THREE.DoubleSide }));
  awning.position.set(0, 2.45, 2.05);
  awning.rotation.x = 0.5;
  awning.castShadow = true;
  shop.add(awning);
  decal(texText('TK MART', 30, 'rgba(28,58,94,.95)', 384, 56), 3.4, 0.55, 0, 2.95, 1.52, 0, shop);
  /* parked cars */
  [[-4.6, 0x55606c], [4.6, 0x8a4a3a]].forEach(cv2 => {
    const car = new THREE.Group();
    const bodyM = new THREE.MeshStandardMaterial({ color: cv2[1], roughness: 0.4, metalness: 0.4 });
    box(1.9, 0.42, 0.85, bodyM, 0, 0.42, 0, car);
    box(1.0, 0.36, 0.8, glassMat, -0.1, 0.8, 0, car);
    [[-0.6], [0.6]].forEach(wx => [-0.45, 0.45].forEach(wz => {
      const whl = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 12), tyreMat);
      whl.rotation.x = Math.PI/2;
      whl.position.set(wx[0], 0.17, wz);
      car.add(whl);
    }));
    car.position.set(shop.position.x, 0, shop.position.z);
    car.rotation.y = shop.rotation.y;
    car.translateX(cv2[0]); car.translateZ(2.6);
    car.traverse(o => { o.castShadow = true; });
    scene.add(car);
  });
  shop.updateMatrixWorld(true);
  const shopPad = new THREE.Vector3(2.8, 0.31, 2.6).applyMatrix4(shop.matrixWorld);

  /* ══════════ STOP 4 — HOME ══════════ */
  const hFrame = sideFrame(0.985, -1, 5.6);
  const home = new THREE.Group();
  home.position.copy(hFrame.pos);
  home.rotation.y = hFrame.face;
  scene.add(home);
  pad(11, 9, hFrame.pos.x, hFrame.pos.z, 0xb9c4a4);
  box(5, 2.4, 4.2, new THREE.MeshStandardMaterial({ color: 0xf1ede2, roughness: 0.85 }), 0, 1.2, -0.8, home);
  /* pitched roof */
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-2.9, 0); roofShape.lineTo(0, 1.6); roofShape.lineTo(2.9, 0);
  roofShape.lineTo(2.55, -0.12); roofShape.lineTo(0, 1.32); roofShape.lineTo(-2.55, -0.12);
  roofShape.closePath();
  const roof = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roofShape, { depth: 4.8, bevelEnabled: false }),
    new THREE.MeshStandardMaterial({ color: 0x55606c, roughness: 0.75 }));
  roof.position.set(0, 2.4, -3.2);
  roof.castShadow = true;
  home.add(roof);
  box(0.5, 1.0, 0.5, new THREE.MeshStandardMaterial({ color: 0x9a978e, roughness: 0.85 }), 1.6, 3.1, -1.6, home);
  /* door + windows */
  const doorM = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.5), goldMat);
  doorM.position.set(0, 0.75, 1.32);
  home.add(doorM);
  [[-1.5], [1.5]].forEach(wx => {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.8), warmWin);
    win.position.set(wx[0], 1.25, 1.32);
    home.add(win);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.06),
      new THREE.MeshBasicMaterial({ color: 0xffffff }));
    frame.position.set(wx[0], 1.25, 1.325);
    home.add(frame);
  });
  /* front path + mailbox + tree */
  const path = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 3.4),
    new THREE.MeshStandardMaterial({ color: 0xd9d6ce, roughness: 0.9 }));
  path.rotation.x = -Math.PI/2;
  path.position.set(0, 0.012, 3.0);
  home.add(path);
  box(0.08, 0.9, 0.08, darkMat, 1.2, 0.45, 4.4, home);
  box(0.4, 0.26, 0.24, goldMat, 1.2, 1.0, 4.4, home);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x6b5138, roughness: 0.9 }));
  trunk.position.set(-2.8, 0.7, 1.8);
  trunk.castShadow = true;
  home.add(trunk);
  [[0, 1.9, 0, 0.85], [0.5, 1.5, 0.3, 0.6], [-0.45, 1.55, -0.2, 0.55]].forEach(bl => {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(bl[3], 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x7f9463, roughness: 0.9 }));
    blob.position.set(-2.8 + bl[0], bl[1], 1.8 + bl[2]);
    blob.castShadow = true;
    home.add(blob);
  });
  home.updateMatrixWorld(true);
  const doorstep = new THREE.Vector3(0, 0.16, 1.9).applyMatrix4(home.matrixWorld);
  const deliveredPos = new THREE.Vector3(0, 2.0, 1.6).applyMatrix4(home.matrixWorld);

  /* ══════════ roadside dressing: trees + lampposts ══════════ */
  for(let dt = 0.08; dt < 0.95; dt += 0.075){
    let nearStop = false;
    T_STOPS.forEach(ts => { if(Math.abs(dt - ts) < 0.07) nearStop = true; });
    if(nearStop) continue;
    const side = (Math.round(dt * 13) % 2) ? 1 : -1;
    const fr = sideFrame(dt, side, 3.4 + (dt * 37 % 1) * 1.6);
    if((Math.round(dt * 100) % 3) === 0){
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.6, 8), darkMat);
      pole.position.set(fr.pos.x, 1.3, fr.pos.z);
      pole.castShadow = true;
      scene.add(pole);
      const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe9c0, transparent: true, opacity: 0.5, depthWrite: false }));
      lamp.scale.set(0.6, 0.6, 1);
      lamp.position.set(fr.pos.x, 2.65, fr.pos.z);
      scene.add(lamp);
    } else {
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 1.1, 8),
        new THREE.MeshStandardMaterial({ color: 0x6b5138, roughness: 0.9 }));
      tr.position.set(fr.pos.x, 0.55, fr.pos.z);
      tr.castShadow = true;
      scene.add(tr);
      const fol = new THREE.Mesh(new THREE.SphereGeometry(0.65 + (dt * 53 % 1) * 0.3, 12, 10),
        new THREE.MeshStandardMaterial({ color: (Math.round(dt * 200) % 2) ? 0x7f9463 : 0x8fa370, roughness: 0.9 }));
      fol.position.set(fr.pos.x, 1.55, fr.pos.z);
      fol.castShadow = true;
      scene.add(fol);
    }
  }

  /* ══════════ the semi truck ══════════ */
  const truck = new THREE.Group();
  [-0.16, 0.16].forEach(rz => {
    const railM = box(2.15, 0.08, 0.07, darkMat, -0.1, 0.36, rz, truck);
  });
  box(0.52, 0.52, 0.64, new THREE.MeshStandardMaterial({ color: 0x1c3a5e, roughness: 0.45, metalness: 0.35 }), 0.92, 0.66, 0, truck);
  const windsh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.54), glassMat);
  windsh.position.set(1.19, 0.76, 0);
  windsh.rotation.z = -0.12;
  truck.add(windsh);
  [-0.325, 0.325].forEach(sz => box(0.24, 0.16, 0.02, glassMat, 1.0, 0.78, sz, truck));
  box(0.03, 0.2, 0.5, darkMat, 1.19, 0.5, 0, truck);
  box(0.08, 0.09, 0.66, darkMat, 1.2, 0.32, 0, truck);
  const exh = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8), hubMat);
  exh.position.set(0.68, 0.7, 0.3);
  truck.add(exh);
  box(1.5, 0.06, 0.74, darkMat, -0.42, 0.43, 0, truck);
  const wheels = [];
  [0.95, 0.28, 0.02, -0.85, -1.11].forEach(wx => {
    [-0.31, 0.31].forEach(wz => {
      const whl = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.11, 14), tyreMat);
      whl.rotation.x = Math.PI/2;
      whl.position.set(wx, 0.155, wz);
      whl.castShadow = true;
      truck.add(whl);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.115, 10), hubMat);
      hub.rotation.x = Math.PI/2;
      hub.position.set(wx, 0.155, wz);
      truck.add(hub);
      wheels.push(whl, hub);
    });
  });
  truck.traverse(o => { if(o.isMesh) { o.castShadow = true; } });
  scene.add(truck);

  /* cargo actors — positions are pure functions of scroll, fully reversible */
  const cargoGold = makeContainer(3); scene.add(cargoGold);
  const cargoBlue = makeContainer(1); scene.add(cargoBlue);
  const parcel = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x8a6a42, roughness: 0.85 }));
  parcel.castShadow = true;
  scene.add(parcel);
  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.27, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xcbb389, roughness: 0.8 }));
  parcel.add(tape);
  const hoistCable = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 4),
    new THREE.MeshBasicMaterial({ color: 0x2a2d33 }));
  scene.add(hoistCable);
  /* delivered! */
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.45, 32),
    new THREE.MeshBasicMaterial({ color: 0x1c3a5e, transparent: true, opacity: 0, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI/2;
  ring.position.set(doorstep.x, 0.06, doorstep.z);
  scene.add(ring);
  const delivered = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texText('✓ DELIVERED', 34, 'rgba(28,58,94,.98)', 384, 96), transparent: true, opacity: 0, depthWrite: false }));
  delivered.scale.set(2.6, 0.65, 1);
  delivered.position.copy(deliveredPos);
  scene.add(delivered);

  /* ══════════ scroll → drive mapping (with dwells at each stop) ══════════ */
  function sstep(u){ return u * u * (3 - 2 * u); }
  const SEGS = [
    [0.00, 0.10, 0.00, 0.00],
    [0.10, 0.34, 0.00, 0.36],
    [0.34, 0.42, 0.36, 0.36],
    [0.42, 0.62, 0.36, 0.66],
    [0.62, 0.70, 0.66, 0.66],
    [0.70, 0.92, 0.66, 1.00],
    [0.92, 1.00, 1.00, 1.00]
  ];
  function mapT(p){
    for(let i = 0; i < SEGS.length; i++){
      const s = SEGS[i];
      if(p <= s[1] || i === SEGS.length - 1){
        const u = s[1] > s[0] ? Math.min(1, Math.max(0, (p - s[0]) / (s[1] - s[0]))) : 0;
        return s[2] + (s[3] - s[2]) * sstep(u);
      }
    }
    return 1;
  }
  function seg(p, a, b){ return Math.min(1, Math.max(0, (p - a) / (b - a))); }

  const _pt = new THREE.Vector3(), _tn = new THREE.Vector3();
  function truckPose(t){
    curve.getPointAt(Math.min(0.9999, Math.max(0, t)), _pt);
    curve.getTangentAt(Math.min(0.9999, Math.max(0, t)), _tn);
    return { x: _pt.x, z: _pt.z, yaw: Math.atan2(_tn.x, _tn.z) - Math.PI/2 };
  }
  function bedWorld(t, out){
    const tp = truckPose(t);
    out.set(tp.x - 0.42 * Math.cos(tp.yaw), 0.77, tp.z + 0.42 * Math.sin(tp.yaw));
    return out;
  }

  /* camera keyframes: offsets in truck-heading space [right, up, behind] */
  const CAM_KEYS = [
    [0.00,  5.2, 2.1,  6.5],
    [0.10,  3.6, 1.8,  7.5],
    [0.22,  4.6, 2.2,  1.2],
    [0.34, -5.0, 3.2,  5.5],
    [0.52,  0.2, 2.6,  9.0],
    [0.62, -4.6, 1.9, -5.5],
    [0.80,  1.5, 7.5,  9.5],
    [0.92,  5.5, 2.1,  6.0],
    [1.00,  6.8, 2.5,  8.5]
  ];
  function camOffset(p){
    let i = 0;
    while(i < CAM_KEYS.length - 2 && p > CAM_KEYS[i + 1][0]) i++;
    const A = CAM_KEYS[i], B = CAM_KEYS[i + 1];
    const u = sstep(Math.min(1, Math.max(0, (p - A[0]) / (B[0] - A[0] || 1))));
    return [A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u, A[3] + (B[3] - A[3]) * u];
  }

  const MOODS = [
    'linear-gradient(160deg,#f8f3e7,#efe4c9)',
    'linear-gradient(160deg,#eef0f2,#dde2e6)',
    'linear-gradient(160deg,#f7f0e4,#f0dfc0)',
    'linear-gradient(160deg,#e9e7f0,#f3e2d6)'
  ];
  const CH_CENTERS = [0.05, 0.38, 0.66, 0.96];
  let lastMood = -1;

  function resize(){
    const w = sticky.clientWidth, h = sticky.clientHeight;
    if(!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const mouseT = { x: 0, y: 0 }, mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', e => {
    mouseT.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseT.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  const _bed = new THREE.Vector3(), _a = new THREE.Vector3(), _look = new THREE.Vector3();
  let clock = 0, lastT = 0, pS = 0;

  function frame(){
    requestAnimationFrame(frame);
    if(document.hidden) return;
    /* scroll state measured every frame (artifact-safe) */
    const r = journey.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const visible = r.bottom > 0 && r.top < vh;
    if(!visible) return;
    const total = r.height - vh;
    const pT = total <= 0 ? 0 : Math.max(0, Math.min(1, -r.top / total));
    pS += (pT - pS) * 0.1;
    if(Math.abs(pT - pS) < 0.0004) pS = pT;
    const p = pS;
    clock += 0.016;

    mouse.x += (mouseT.x - mouse.x) * 0.04;
    mouse.y += (mouseT.y - mouse.y) * 0.04;

    /* drive */
    const t = mapT(p);
    const tp = truckPose(t);
    truck.position.set(tp.x, 0.005 + Math.sin(clock * 2.2) * 0.008, tp.z);
    truck.rotation.y = tp.yaw;
    const dT = t - lastT; lastT = t;
    wheels.forEach(w => { w.rotation.y += dT * 260; });

    /* cargo choreography — pure functions of p */
    bedWorld(t, _bed);
    /* gold: hoist → bed → warehouse door A */
    if(p < 0.09){
      const s = sstep(seg(p, 0.015, 0.09));
      bedWorld(0, _a);
      cargoGold.position.set(
        hoistTop.x + (_a.x - hoistTop.x) * s,
        2.55 + (_a.y - 2.55) * s,
        hoistTop.z + (_a.z - hoistTop.z) * s);
      cargoGold.visible = true;
      hoistCable.visible = true;
      const cy = (hoistTop.y + cargoGold.position.y + 0.31) / 2;
      hoistCable.position.set(hoistTop.x, cy, hoistTop.z);
      hoistCable.scale.y = Math.max(0.05, hoistTop.y - cargoGold.position.y - 0.31);
    } else if(p < 0.35){
      cargoGold.position.copy(_bed);
      cargoGold.visible = true;
      hoistCable.visible = false;
    } else if(p < 0.41){
      const s = sstep(seg(p, 0.35, 0.41));
      cargoGold.position.lerpVectors(_bed, whDoorA, s);
      cargoGold.position.y = _bed.y + Math.sin(s * Math.PI) * 0.4 - s * 0.35;
      cargoGold.visible = true;
      hoistCable.visible = false;
    } else {
      cargoGold.visible = false;
      hoistCable.visible = false;
    }
    cargoGold.rotation.y = tp.yaw;
    /* blue: warehouse door B → bed → retail pad */
    if(p < 0.36){
      cargoBlue.visible = false;
    } else if(p < 0.42){
      const s = sstep(seg(p, 0.36, 0.42));
      cargoBlue.position.lerpVectors(whDoorB, _bed, s);
      cargoBlue.position.y = _bed.y + Math.sin(s * Math.PI) * 0.4;
      cargoBlue.visible = true;
    } else if(p < 0.63){
      cargoBlue.position.copy(_bed);
      cargoBlue.visible = true;
    } else if(p < 0.69){
      const s = sstep(seg(p, 0.63, 0.69));
      cargoBlue.position.lerpVectors(_bed, shopPad, s);
      cargoBlue.position.y = _bed.y + Math.sin(s * Math.PI) * 0.4 - s * 0.46;
      cargoBlue.visible = true;
    } else {
      cargoBlue.position.copy(shopPad);
      cargoBlue.visible = true;
    }
    cargoBlue.rotation.y = tp.yaw;
    /* parcel: bed → doorstep */
    if(p < 0.71){
      parcel.visible = false;
    } else if(p < 0.93){
      parcel.position.set(_bed.x, _bed.y - 0.14, _bed.z);
      parcel.visible = true;
    } else if(p < 0.975){
      const s = sstep(seg(p, 0.93, 0.975));
      parcel.position.lerpVectors(_bed, doorstep, s);
      parcel.position.y = _bed.y + Math.sin(s * Math.PI) * 0.7 - s * 0.45;
      parcel.visible = true;
    } else {
      parcel.position.copy(doorstep);
      parcel.visible = true;
    }
    parcel.rotation.y = tp.yaw;
    /* delivered beat */
    const dv = seg(p, 0.965, 0.995);
    const pulse = 0.5 + 0.5 * Math.sin(clock * 3);
    ring.material.opacity = dv * (0.35 + pulse * 0.35);
    ring.scale.setScalar(1 + dv * pulse * 0.35);
    delivered.material.opacity = dv * 0.95;
    delivered.position.y = deliveredPos.y + dv * 0.25;

    /* smoke */
    smokes.forEach(sm => {
      const lp = (clock * 0.08 + sm.ph) % 1;
      sm.sp.position.set(sm.bx + Math.sin(lp * 5 + sm.ph * 9) * 0.3, 6.4 + lp * 2.6, sm.bz);
      const sc = 0.5 + lp * 1.6;
      sm.sp.scale.set(sc, sc, 1);
      sm.sp.material.opacity = 0.35 * Math.sin(lp * Math.PI);
    });

    /* cinematic camera: keyed offsets in truck-heading space + drift + mouse */
    const off = camOffset(p);
    const cy2 = Math.cos(tp.yaw), sy2 = Math.sin(tp.yaw);
    camera.position.set(
      tp.x - cy2 * off[2] + sy2 * off[0] + Math.sin(clock * 0.3) * 0.15 + mouse.x * 0.6,
      0.005 + off[1] - mouse.y * 0.35 + Math.sin(clock * 0.24) * 0.08,
      tp.z + sy2 * off[2] + cy2 * off[0]
    );
    _look.set(tp.x, 1.1, tp.z);
    if(p > 0.94){
      const s = seg(p, 0.94, 1);
      _look.lerp(new THREE.Vector3(doorstep.x, 0.9, doorstep.z), s * 0.6);
    }
    camera.lookAt(_look);

    /* sun follows the action so shadows stay crisp */
    sun.position.set(tp.x + 10, 14, tp.z + 8);
    sunTarget.position.set(tp.x, 0, tp.z);

    /* captions / dots / progress / mood */
    progressBar.style.width = (p * 100).toFixed(2) + '%';
    let active = 0, bestD = 9;
    CH_CENTERS.forEach((c, i) => {
      const d = Math.abs(p - c);
      if(d < bestD){ bestD = d; active = i; }
      const wgt = Math.max(0, 1 - d / 0.15);
      const cap = captions[i];
      if(cap){
        cap.style.opacity = wgt.toFixed(3);
        cap.style.filter = 'blur(' + ((1 - wgt) * 14).toFixed(1) + 'px)';
        cap.style.transform = 'translateY(' + ((1 - wgt) * 40).toFixed(1) + 'px) scale(' + (0.96 + wgt * 0.04).toFixed(3) + ')';
      }
    });
    dotItems.forEach((d, i) => d.classList.toggle('on', i === active));
    if(active !== lastMood){ lastMood = active; sticky.style.background = MOODS[active]; }

    renderer.render(scene, camera);
  }
  frame();
    });
  }
  if(!lazyHost) return;
  if(!('IntersectionObserver' in window)){ launchScmJourney(); return; }
  var lazyObserver=new IntersectionObserver(function(entries){
    if(entries.some(function(entry){return entry.isIntersecting;})){
      lazyObserver.disconnect();
      launchScmJourney();
    }
  },{rootMargin:'700px 0px'});
  lazyObserver.observe(lazyHost);
})();
