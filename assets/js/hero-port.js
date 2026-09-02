
__glReady(function initHeroPort(){
  const canvas = document.getElementById('hero-canvas');
  const heroSec = document.getElementById('hero');
  if(!canvas || !heroSec) return;
  if(typeof THREE === 'undefined') return;
  if(matchMedia('(max-width:760px)').matches) return;

  const PAGE_BG = 0xf5f5f7;

  let renderer;
  try{ renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true}); }
  catch(e){ setTimeout(initHeroPort, 1200); return; }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PAGE_BG, 15, 36);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);

  /* ── lighting: warm key sun, cool sky fill, subtle rim ── */
  scene.add(new THREE.HemisphereLight(0xfdfbf6, 0x8a7648, 0.8));
  const sun = new THREE.DirectionalLight(0xffe9c4, 1.25);
  sun.position.set(9, 11, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -13; sun.shadow.camera.right = 13;
  sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -10;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 40;
  sun.shadow.bias = -0.0012;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xa8bcd8, 0.35);
  rim.position.set(-8, 5, -9);
  scene.add(rim);

  /* ══════════ canvas texture factory (no external images) ══════════ */
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

  /* corrugated container side */
  function texSide(hex, code){
    return cvs(384, 192, (ctx, w, h) => {
      ctx.fillStyle = shade(hex, 1); ctx.fillRect(0, 0, w, h);
      for(let x = 6; x < w - 6; x += 12){
        ctx.fillStyle = shade(hex, 0.78); ctx.fillRect(x, 8, 5, h - 16);
        ctx.fillStyle = shade(hex, 1.14); ctx.fillRect(x + 5, 8, 2, h - 16);
      }
      ctx.fillStyle = shade(hex, 0.62);                       /* rails + corner posts */
      ctx.fillRect(0, 0, w, 8); ctx.fillRect(0, h - 8, w, 8);
      ctx.fillRect(0, 0, 7, h); ctx.fillRect(w - 7, 0, 7, h);
      weather(ctx, w, h, 10, 0.13);
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.font = '700 11px Arial';
      ctx.fillText(code, 14, 26);
      ctx.font = '400 8px Arial';
      ctx.fillText('MAX GROSS 30,480 KG', 14, h - 16);
    });
  }
  /* container door end: panels, lock rods, handles */
  function texDoor(hex){
    return cvs(128, 160, (ctx, w, h) => {
      ctx.fillStyle = shade(hex, 0.94); ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = shade(hex, 0.7); ctx.fillRect(w / 2 - 1, 4, 2, h - 8);
      [0.14, 0.36, 0.64, 0.86].forEach(fx => {                /* lock rods */
        ctx.fillStyle = shade(hex, 1.3);
        ctx.fillRect(w * fx - 1.5, 6, 3, h - 12);
        ctx.fillStyle = shade(hex, 0.5);
        ctx.fillRect(w * fx - 4, h * 0.55, 8, 5);             /* handles */
      });
      ctx.fillStyle = shade(hex, 0.6);
      ctx.fillRect(0, 0, w, 6); ctx.fillRect(0, h - 6, w, 6);
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.fillRect(w - 26, h - 30, 18, 12);                    /* placard */
      weather(ctx, w, h, 6, 0.16);
    });
  }
  function texTop(hex){
    return cvs(192, 96, (ctx, w, h) => {
      ctx.fillStyle = shade(hex, 0.9); ctx.fillRect(0, 0, w, h);
      for(let x = 4; x < w; x += 10){ ctx.fillStyle = shade(hex, 0.76); ctx.fillRect(x, 3, 4, h - 6); }
      weather(ctx, w, h, 5, 0.1);
    });
  }
  /* quay concrete */
  const texConcrete = cvs(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#d9d8d4'; ctx.fillRect(0, 0, w, h);
    for(let i = 0; i < 1600; i++){
      ctx.fillStyle = 'rgba(' + (100 + Math.random() * 60 | 0) + ',' + (100 + Math.random() * 55 | 0) + ',' + (95 + Math.random() * 55 | 0) + ',.14)';
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.6, 1.6);
    }
    ctx.strokeStyle = 'rgba(70,70,66,.4)'; ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
    for(let i = 0; i < 5; i++){                               /* tyre scuffs */
      ctx.strokeStyle = 'rgba(40,38,34,.1)'; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.bezierCurveTo(Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h, Math.random() * w, Math.random() * h);
      ctx.stroke();
    }
  });
  texConcrete.wrapS = texConcrete.wrapT = THREE.RepeatWrapping;
  texConcrete.repeat.set(7, 2);
  /* bridge windows band */
  const texBridge = cvs(192, 64, (ctx, w, h) => {
    ctx.fillStyle = '#eceae2'; ctx.fillRect(0, 0, w, h);
    for(let x = 8; x < w - 8; x += 22){
      ctx.fillStyle = '#26313e';
      ctx.fillRect(x, 14, 16, 22);
      ctx.fillStyle = 'rgba(160,190,215,.55)';
      ctx.fillRect(x + 2, 16, 5, 18);
    }
  });
  /* ship name decal */
  const texName = cvs(512, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(245,242,232,.92)';
    ctx.font = '700 34px Arial';
    ctx.letterSpacing = '6px';
    ctx.fillText('TK NAVIGATOR', 12, 44);
  });
  /* draft marks */
  const texDraft = cvs(48, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(245,242,232,.85)';
    ctx.font = '700 13px Arial';
    for(let i = 0; i < 5; i++){
      ctx.fillText((8 - i) + 'M', 4, 18 + i * 24);
    }
  });
  const foamTex = cvs(256, 32, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    for(let i = 0; i < 300; i++){
      ctx.fillStyle = 'rgba(255,255,255,' + (0.25 + Math.random() * 0.5) + ')';
      const y = Math.abs(Math.random() + Math.random() - 1) * h;
      ctx.fillRect(Math.random() * w, y, 2 + Math.random() * 5, 1.6);
    }
  });
  foamTex.wrapS = THREE.RepeatWrapping; foamTex.repeat.set(4, 1);
  const glowTex = cvs(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
    g.addColorStop(0, 'rgba(255,250,235,.9)');
    g.addColorStop(0.4, 'rgba(245,200,110,.35)');
    g.addColorStop(1, 'rgba(245,200,110,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });

  /* ══════════ container factory — corrugated, weathered, coded ══════════ */
  const LINER_COLORS = [0x733a2f, 0x334f67, 0x405b4a, 0x35516e, 0x515357, 0x6c5138];
  const containerGeo = new THREE.BoxGeometry(1.16, 0.62, 0.78);
  const containerMats = LINER_COLORS.map((hex, i) => {
    const side = new THREE.MeshStandardMaterial({ map: texSide(hex, 'TKHU 2610' + (26 + i) + '-' + i), roughness: 0.68, metalness: 0.25 });
    const door = new THREE.MeshStandardMaterial({ map: texDoor(hex), roughness: 0.66, metalness: 0.25 });
    const top  = new THREE.MeshStandardMaterial({ map: texTop(hex), roughness: 0.72, metalness: 0.22 });
    const bot  = new THREE.MeshStandardMaterial({ color: shade(hex, 0.4), roughness: 0.8, metalness: 0.2 });
    return [door, side, top, bot, side, side]; /* +x door, -x end, +y, -y, +z, -z */
  });
  function makeContainer(ci){
    const m = new THREE.Mesh(containerGeo, containerMats[ci % containerMats.length]);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  /* ══════════ water ══════════ */
  const waterGeo = new THREE.PlaneGeometry(40, 22, 52, 30);
  waterGeo.rotateX(-Math.PI/2);
  const waterBase = waterGeo.attributes.position.array.slice();
  const water = new THREE.Mesh(waterGeo, new THREE.MeshStandardMaterial({
    color: 0xafc2c8, roughness: 0.3, metalness: 0.55, transparent: true, opacity: 0.96
  }));
  water.position.set(0, 0, -3);
  water.receiveShadow = true;
  scene.add(water);
  /* sun glint on the water */
  const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffedc8, transparent: true, opacity: 0.4, depthWrite: false }));
  glint.scale.set(9, 2.2, 1);
  glint.position.set(5.5, 0.06, -4.5);
  scene.add(glint);

  /* ══════════ quay ══════════ */
  const quay = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.55, 6.4),
    new THREE.MeshStandardMaterial({ map: texConcrete, roughness: 0.92, metalness: 0.05 })
  );
  quay.position.set(0, 0.275, 5.1);
  quay.receiveShadow = true; quay.castShadow = true;
  scene.add(quay);
  /* quay wall face + rubber fenders */
  const wall = new THREE.Mesh(new THREE.BoxGeometry(30, 1.2, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x9a978e, roughness: 0.9 }));
  wall.position.set(0, -0.05, 1.92);
  scene.add(wall);
  for(let fx = -13; fx <= 13; fx += 3.2){
    const fender = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.95 }));
    fender.position.set(fx, 0.18, 1.83);
    scene.add(fender);
  }
  /* yellow safety stripe + lane dashes */
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(30, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xd9b229, roughness: 0.85 }));
  stripe.rotation.x = -Math.PI/2;
  stripe.position.set(0, 0.556, 2.18);
  scene.add(stripe);
  for(let dx = -14; dx < 15; dx += 1.6){
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xeeeee8, roughness: 0.85 }));
    dash.rotation.x = -Math.PI/2;
    dash.position.set(dx, 0.556, 6.4);
    scene.add(dash);
  }
  /* bollards */
  const bolMat = new THREE.MeshStandardMaterial({ color: 0x33373d, roughness: 0.6, metalness: 0.5 });
  for(let bx = -13; bx <= 13; bx += 2.6){
    const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.24, 10), bolMat);
    b1.position.set(bx, 0.67, 2.35);
    const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.07, 10), bolMat);
    b2.position.set(bx, 0.81, 2.35);
    b1.castShadow = b2.castShadow = true;
    scene.add(b1, b2);
  }
  /* foam line along the quay wall */
  const foam = new THREE.Mesh(new THREE.PlaneGeometry(29, 0.5),
    new THREE.MeshBasicMaterial({ map: foamTex, transparent: true, opacity: 0.65, depthWrite: false }));
  foam.rotation.x = -Math.PI/2;
  foam.position.set(0, 0.02, 1.55);
  scene.add(foam);

  /* ══════════ the ship — curved hull, layered superstructure ══════════ */
  const ship = new THREE.Group();
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-5.5, -1.5);
  hullShape.lineTo(2.1, -1.62);
  hullShape.quadraticCurveTo(4.5, -1.38, 5.75, 0);       /* curved bow */
  hullShape.quadraticCurveTo(4.5, 1.38, 2.1, 1.62);
  hullShape.lineTo(-5.5, 1.5);
  hullShape.quadraticCurveTo(-6.15, 0, -5.5, -1.5);      /* rounded stern */
  const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 1.35, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.09, bevelSegments: 2 });
  hullGeo.rotateX(-Math.PI/2);
  const hull = new THREE.Mesh(hullGeo, new THREE.MeshStandardMaterial({ color: 0x1e2a38, roughness: 0.5, metalness: 0.35 }));
  hull.position.y = -0.28;
  hull.castShadow = true; hull.receiveShadow = true;
  ship.add(hull);
  /* red boot-top waterline band */
  const bandGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 0.2, bevelEnabled: false });
  bandGeo.rotateX(-Math.PI/2);
  const band = new THREE.Mesh(bandGeo, new THREE.MeshStandardMaterial({ color: 0x86301f, roughness: 0.7, metalness: 0.15 }));
  band.scale.set(1.012, 1, 1.03);
  band.position.y = -0.3;
  ship.add(band);
  /* deck plate */
  const deckGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 0.07, bevelEnabled: false });
  deckGeo.rotateX(-Math.PI/2);
  const deck = new THREE.Mesh(deckGeo, new THREE.MeshStandardMaterial({ color: 0x39434e, roughness: 0.85 }));
  deck.scale.set(0.965, 1, 0.93);
  deck.position.y = 1.08;
  deck.receiveShadow = true;
  ship.add(deck);
  /* name + draft marks */
  const nameDecal = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.32),
    new THREE.MeshBasicMaterial({ map: texName, transparent: true, depthWrite: false }));
  nameDecal.position.set(-3.6, 0.62, 1.63);
  ship.add(nameDecal);
  const draftDecal = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.0),
    new THREE.MeshBasicMaterial({ map: texDraft, transparent: true, depthWrite: false }));
  draftDecal.position.set(4.1, 0.35, 1.32);
  draftDecal.rotation.y = 0.18;
  ship.add(draftDecal);
  /* superstructure: three stepped decks + bridge wings + windows */
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf0eee6, roughness: 0.55, metalness: 0.1 });
  const ss1 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.95, 2.5), whiteMat);
  ss1.position.set(-4.35, 1.62, 0);
  const ss2 = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.5, 2.2), whiteMat);
  ss2.position.set(-4.3, 2.34, 0);
  const bridgeMats = [
    new THREE.MeshStandardMaterial({ map: texBridge, roughness: 0.5 }), whiteMat,
    whiteMat, whiteMat,
    new THREE.MeshStandardMaterial({ map: texBridge, roughness: 0.5 }),
    new THREE.MeshStandardMaterial({ map: texBridge, roughness: 0.5 })
  ];
  const ss3 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.42, 2.7), bridgeMats);
  ss3.position.set(-4.25, 2.8, 0);
  [ss1, ss2, ss3].forEach(s => { s.castShadow = true; s.receiveShadow = true; ship.add(s); });
  /* funnel with brand band */
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.85, 14),
    new THREE.MeshStandardMaterial({ color: 0x1c3a5e, roughness: 0.5, metalness: 0.3 }));
  funnel.position.set(-5.1, 2.35, 0);
  funnel.castShadow = true;
  const funnelCap = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.16, 14),
    new THREE.MeshStandardMaterial({ color: 0x1d1d1f, roughness: 0.6 }));
  funnelCap.position.set(-5.1, 2.85, 0);
  ship.add(funnel, funnelCap);
  /* bow mast */
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 1.2, 8), bolMat);
  mast.position.set(4.9, 1.75, 0);
  const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6), bolMat);
  yard.rotation.z = Math.PI/2;
  yard.position.set(4.9, 2.1, 0);
  ship.add(mast, yard);
  /* deck cargo: bays of textured containers. Color is assigned per BAY
     (whole column shares one shipping-line color) instead of per box, so
     the stack reads as organized blocks rather than a random-confetti mix.
     Low height variance keeps a tall stack from looming into a short
     neighbor at this camera angle. */
  for(let bay = 0; bay < 5; bay++){
    for(let row = 0; row < 3; row++){
      const stack = 1 + ((bay + row) % 2);
      for(let t = 0; t < stack; t++){
        const c = makeContainer(bay);
        c.position.set(-2.7 + bay * 1.5, 1.44 + t * 0.63, -0.95 + row * 1.15);
        ship.add(c);
      }
    }
  }
  ship.position.set(0.5, 0.05, -0.6);
  scene.add(ship);

  /* ══════════ STS crane — lattice portal, twin-girder boom, A-frame apex ══════════ */
  const craneGold = new THREE.MeshStandardMaterial({ color: 0x17324f, roughness: 0.55, metalness: 0.35 });
  const craneDark = new THREE.MeshStandardMaterial({ color: 0x33373d, roughness: 0.6, metalness: 0.45 });
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
  const hazardMat = new THREE.MeshStandardMaterial({ map: texHazard, roughness: 0.7 });
  const crane = new THREE.Group();
  function leg(x, z){
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.3, 0.3), craneGold);
    l.position.set(x, 2.7, z);
    l.castShadow = true;
    crane.add(l);
    const hz = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.55, 0.34), hazardMat);
    hz.position.set(x, 0.85, z);
    crane.add(hz);
  }
  leg(-1.15, 2.6); leg(1.15, 2.6); leg(-1.15, 4.6); leg(1.15, 4.6);
  /* lattice X-bracing on all four faces */
  function brace(x1, y1, z1, x2, y2, z2){
    const len = Math.hypot(x2 - x1, y2 - y1, z2 - z1);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, len, 6), craneGold);
    rod.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
    /* orient cylinder (Y-axis) along the segment */
    const dir = new THREE.Vector3(x2 - x1, y2 - y1, z2 - z1).normalize();
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    rod.castShadow = true;
    crane.add(rod);
  }
  brace(-1.15, 1.3, 2.6, 1.15, 3.9, 2.6); brace(1.15, 1.3, 2.6, -1.15, 3.9, 2.6);   /* waterside face */
  brace(-1.15, 1.3, 4.6, 1.15, 3.9, 4.6); brace(1.15, 1.3, 4.6, -1.15, 3.9, 4.6);   /* landside face */
  brace(-1.15, 1.3, 2.6, -1.15, 3.9, 4.6); brace(-1.15, 3.9, 2.6, -1.15, 1.3, 4.6); /* left face */
  brace(1.15, 1.3, 2.6, 1.15, 3.9, 4.6); brace(1.15, 3.9, 2.6, 1.15, 1.3, 4.6);     /* right face */
  /* portal beams */
  [[0, 4.72, 2.6, 2.5, 0.26, 0.26], [0, 4.72, 4.6, 2.5, 0.26, 0.26],
   [-1.15, 4.72, 3.6, 0.26, 0.26, 2.2], [1.15, 4.72, 3.6, 0.26, 0.26, 2.2],
   [0, 1.25, 2.6, 2.3, 0.16, 0.16], [0, 1.25, 4.6, 2.3, 0.16, 0.16]].forEach(p => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(p[3], p[4], p[5]), craneGold);
    b.position.set(p[0], p[1], p[2]);
    b.castShadow = true;
    crane.add(b);
  });
  /* twin-girder boom with cross ribs + trolley rail + end stop */
  [-0.19, 0.19].forEach(gx => {
    const girder = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.32, 9.4), craneGold);
    girder.position.set(gx, 5.02, 0.6);
    girder.castShadow = true;
    crane.add(girder);
  });
  for(let rz = -3.8; rz <= 5.0; rz += 1.1){
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.09, 0.14), craneGold);
    rib.position.set(0, 5.22, rz);
    crane.add(rib);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 9.4), craneDark);
  rail.position.set(0, 4.83, 0.6);
  crane.add(rail);
  const endStop = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.22, 0.16), hazardMat);
  endStop.position.set(0, 5.05, -4.05);
  crane.add(endStop);
  /* A-frame apex */
  brace(-0.55, 5.18, 3.6, 0, 6.6, 3.6);
  brace(0.55, 5.18, 3.6, 0, 6.6, 3.6);
  const apexCap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.3), craneGold);
  apexCap.position.set(0, 6.62, 3.6);
  crane.add(apexCap);
  /* forestays + backstay from apex */
  [[-3.9, 5.1], [-0.8, 5.1], [4.9, 5.1]].forEach(t => {
    const len = Math.hypot(t[0] - 3.6, 6.55 - t[1]);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, len, 6), craneDark);
    rod.position.set(0, (6.55 + t[1]) / 2, (3.6 + t[0]) / 2);
    const dir = new THREE.Vector3(0, t[1] - 6.55, t[0] - 3.6).normalize();
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    crane.add(rod);
  });
  /* counterweight, machinery house, glazed operator cab */
  const counter = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, 0.95), craneDark);
  counter.position.set(0, 4.5, 4.75);
  counter.castShadow = true;
  crane.add(counter);
  const house = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.85, 1.5), craneDark);
  house.position.set(0, 5.55, 3.9);
  house.castShadow = true;
  crane.add(house);
  const cabMats = [
    new THREE.MeshStandardMaterial({ map: texBridge, roughness: 0.45 }),
    new THREE.MeshStandardMaterial({ map: texBridge, roughness: 0.45 }),
    craneDark, craneDark,
    new THREE.MeshStandardMaterial({ map: texBridge, roughness: 0.45 }),
    new THREE.MeshStandardMaterial({ map: texBridge, roughness: 0.45 })
  ];
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.68), cabMats);
  cab.position.set(0, 4.42, 1.35);
  cab.rotation.x = -0.1;
  cab.castShadow = true;
  crane.add(cab);
  /* beacon on the apex */
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xff3b2f }));
  beacon.position.set(0, 6.8, 3.6);
  crane.add(beacon);
  const beaconGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff4a3a, transparent: true, opacity: 0.6, depthWrite: false }));
  beaconGlow.scale.set(0.7, 0.7, 1);
  beaconGlow.position.copy(beacon.position);
  crane.add(beaconGlow);
  /* trolley + cables + spreader + hanging container */
  const trolley = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.6), craneDark);
  trolley.position.set(0, 4.75, 0);
  trolley.castShadow = true;
  crane.add(trolley);
  const cableMat = new THREE.MeshBasicMaterial({ color: 0x2a2d33 });
  const cableL = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 4), cableMat);
  const cableR = cableL.clone();
  crane.add(cableL, cableR);
  const spreader = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.09, 0.72), craneGold);
  spreader.castShadow = true;
  crane.add(spreader);
  const hangBox = makeContainer(3);
  crane.add(hangBox);
  crane.position.set(3.6, 0, 0);
  scene.add(crane);

  /* ══════════ quay container stacks ══════════ */
  [[-11.8, 0], [-9.2, 1], [8.4, 2], [11.0, 0], [13.6, 4]].forEach((st, si) => {
    for(let r = 0; r < 2; r++){
      const stack = 1 + ((si * 2 + r * 3) % 3);
      for(let t = 0; t < stack; t++){
        const c = makeContainer(si);
        c.position.set(st[0], 0.87 + t * 0.63, 3.6 + r * 1.2);
        c.rotation.y = (Math.random() - 0.5) * 0.02;
        scene.add(c);
      }
    }
  });

  /* ══════════ semi truck — tractor cab, chassis rails, tandem axles ══════════ */
  const truck = new THREE.Group();
  const tyreMat = new THREE.MeshStandardMaterial({ color: 0x17181c, roughness: 0.9 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x8f939a, roughness: 0.5, metalness: 0.6 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x26313e, roughness: 0.25, metalness: 0.4 });
  /* chassis rails */
  [-0.16, 0.16].forEach(rz => {
    const railM = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.08, 0.07), craneDark);
    railM.position.set(-0.1, 0.36, rz);
    truck.add(railM);
  });
  /* tractor cab: body + windshield + side glass + grille + bumper + exhaust */
  const tcab = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.64),
    new THREE.MeshStandardMaterial({ color: 0x1c3a5e, roughness: 0.45, metalness: 0.35 }));
  tcab.position.set(0.92, 0.66, 0);
  tcab.castShadow = true;
  truck.add(tcab);
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.54), glassMat);
  windshield.position.set(1.19, 0.76, 0);
  windshield.rotation.z = -0.12;
  truck.add(windshield);
  [-0.325, 0.325].forEach(sz => {
    const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.02), glassMat);
    sideGlass.position.set(1.0, 0.78, sz);
    truck.add(sideGlass);
  });
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.5), craneDark);
  grille.position.set(1.19, 0.5, 0);
  truck.add(grille);
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.66), craneDark);
  bumper.position.set(1.2, 0.32, 0);
  truck.add(bumper);
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8), hubMat);
  exhaust.position.set(0.68, 0.7, 0.3);
  truck.add(exhaust);
  /* flatbed trailer + properly seated container */
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.74), craneDark);
  bed.position.set(-0.42, 0.43, 0);
  bed.castShadow = true;
  truck.add(bed);
  const tbox = makeContainer(1);
  tbox.position.set(-0.42, 0.77, 0);
  truck.add(tbox);
  /* wheels: steer axle, tractor tandem, trailer tandem — with hubs */
  const wheels = [];
  [0.95, 0.28, 0.02, -0.85, -1.11].forEach(wx => {
    [-0.31, 0.31].forEach(wz => {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.11, 14), tyreMat);
      wh.rotation.x = Math.PI / 2;
      wh.position.set(wx, 0.155, wz);
      wh.castShadow = true;
      truck.add(wh);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.115, 10), hubMat);
      hub.rotation.x = Math.PI / 2;
      hub.position.set(wx, 0.155, wz);
      truck.add(hub);
      wheels.push(wh, hub);
    });
  });
  truck.position.set(0, 0.555, 6.4);
  scene.add(truck);

  /* ══════════ cargo freighter overhead ══════════ */
  const plane = new THREE.Group();
  const fuselageMat = new THREE.MeshStandardMaterial({ color: 0xf3f2ec, roughness: 0.35, metalness: 0.25 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0x1c3a5e, roughness: 0.45, metalness: 0.35 });
  /* lathe-turned fuselage: tail cone → cabin → nose */
  const profile = [[0.02, -1.55], [0.1, -1.3], [0.2, -0.85], [0.23, -0.3], [0.23, 0.55], [0.185, 1.0], [0.09, 1.35], [0.001, 1.5]]
    .map(p => new THREE.Vector2(p[0], p[1]));
  const fuselage = new THREE.Mesh(new THREE.LatheGeometry(profile, 20), fuselageMat);
  fuselage.rotation.z = -Math.PI / 2;   /* nose along +x */
  plane.add(fuselage);
  /* cockpit glazing */
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.3), glassMat);
  cockpit.position.set(1.14, 0.08, 0);
  plane.add(cockpit);
  /* swept wings with two engines each + winglets */
  function mkWing(side){
    const wg = new THREE.Group();
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.035, 1.5), fuselageMat);
    panel.position.set(0, 0, side * 0.75);
    panel.castShadow = false;
    wg.add(panel);
    [0.5, 1.0].forEach(zi => {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.03), fuselageMat);
      pylon.position.set(0.1, -0.05, side * zi);
      wg.add(pylon);
      const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.26, 12), goldMat);
      nacelle.rotation.z = Math.PI / 2;
      nacelle.position.set(0.13, -0.1, side * zi);
      wg.add(nacelle);
      const intake = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.03, 12),
        new THREE.MeshStandardMaterial({ color: 0x1d1f24, roughness: 0.4, metalness: 0.6 }));
      intake.rotation.z = Math.PI / 2;
      intake.position.set(0.27, -0.1, side * zi);
      wg.add(intake);
    });
    const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.025), goldMat);
    winglet.position.set(-0.08, 0.08, side * 1.48);
    wg.add(winglet);
    wg.rotation.y = side * 0.42;      /* sweep back */
    wg.rotation.x = -side * 0.06;     /* dihedral */
    wg.position.set(0.1, -0.04, 0);
    return wg;
  }
  plane.add(mkWing(1), mkWing(-1));
  /* gold tail fin + swept stabilizers */
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.52, 0.035), goldMat);
  fin.position.set(-1.28, 0.34, 0);
  fin.rotation.z = 0.32;
  plane.add(fin);
  [-1, 1].forEach(side => {
    const stab = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.028, 0.5), fuselageMat);
    stab.position.set(-1.34, 0.12, side * 0.26);
    stab.rotation.y = side * 0.45;
    plane.add(stab);
  });
  /* strobe */
  const strobe = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }));
  strobe.scale.set(0.35, 0.35, 1);
  strobe.position.set(-1.5, 0.08, 0);
  plane.add(strobe);
  plane.scale.set(1.5, 1.5, 1.5);
  scene.add(plane);

  /* ══════════ camera + loop ══════════ */
  /* ── clickable port: every container carries a story ── */
  const CARGO_META=[
    ['CARGO MANIFEST','Rs 200K in savings','Strategic sourcing and vendor negotiation at Kothari Electronics delivered Rs 200,000 in FY24 procurement savings - real money, family business, real stakes.'],
    ['CARGO MANIFEST','1,500+ companies indexed','At ISCM I analyzed 1,500+ Indian public companies across 24 sectors in R, Excel and Tableau - producing India\'s first national supply chain index.'],
    ['CARGO MANIFEST','A live ERP system','I designed and built a complete ERP solo - Django, Python, SQL - with inventory, orders, finance, barcode scanning and AI insights. It\'s running right now at tirthalkothari.pythonanywhere.com.'],
    ['CARGO MANIFEST','+30% availability','Daily MRP discipline at Mentone Concretes prevented cement stockouts and lifted material availability by 30%.'],
    ['CARGO MANIFEST','KeHE truckload RFP','In DePaul\'s transportation practicum I analyzed lane-level carrier bids on a real 2024 inbound TL RFP for KeHE Distributors.'],
    ['CARGO MANIFEST','Six Sigma Green Belt','Certified in Six Sigma - and I applied it, cutting defect waste by reprocessing PVC wire from failed units.'],
    ['CARGO MANIFEST','DDMRP certified','Demand-driven MRP certification from DD Brix Factory - buffers over forecasts where it counts.'],
    ['CARGO MANIFEST','ML that ships','Retail demand forecasting, churn prediction, and K-Means segmentation - Python projects with scikit-learn, not just slideware.'],
    ['CARGO MANIFEST','Published writer','I write on DePaul\'s Inside Kellstadt blog - and co-published \'Top 20 Supply Chain Champions of India\'.'],
    ['CARGO MANIFEST','Three languages','Gujarati, Hindi, English - global supply chains need global communicators.']
  ];
  const CLICKS=[];
  let metaIdx=0;
  scene.traverse(o=>{
    if(o.isMesh && o.geometry===containerGeo){
      o.userData.pc=CARGO_META[metaIdx%CARGO_META.length];
      metaIdx++;
      CLICKS.push(o);
    }
  });
  hull.userData.pc=['TK NAVIGATOR','The flagship','Every element of this scene is my real record - the ship carries it the way I carry projects: loaded carefully, delivered on time. Ask the AI chat below anything about me.'];
  CLICKS.push(hull);
  tcab.userData.pc=['LAST MILE','The delivery mindset','From 20+ weekly shipments at Mentone to a scroll-driven delivery story further down this page - I think in terms of the final handoff.'];
  CLICKS.push(tcab);
  house.userData.pc=['SHIP-TO-SHORE','The heavy lift','Cranes turn chaos into sequence - my favorite metaphor for planning. I build the systems that decide which box moves when.'];
  CLICKS.push(house);
  fuselage.userData.pc=['AIR FREIGHT','The fast learner','When something needs to move fast, it flies. New tools, new domains, new cities - I onboard quickly and deliver.'];
  CLICKS.push(fuselage);

  const portCard=document.getElementById('port-card');
  const raycaster=new THREE.Raycaster();
  const clickNDC=new THREE.Vector2();
  function pickAt(clientX,clientY){
    camera.updateMatrixWorld();
    const r=canvas.getBoundingClientRect();
    clickNDC.x=((clientX-r.left)/r.width)*2-1;
    clickNDC.y=-((clientY-r.top)/r.height)*2+1;
    raycaster.setFromCamera(clickNDC,camera);
    const hits=raycaster.intersectObjects(CLICKS,false);
    return hits.length?hits[0].object:null;
  }
  heroSec.addEventListener('click',e=>{
    if(e.target.closest('.hero-inner,a,button,#port-card,nav'))return;
    const hit=pickAt(e.clientX,e.clientY);
    if(hit&&hit.userData.pc){
      const pc=hit.userData.pc;
      portCard.querySelector('.pc-tag').textContent=pc[0];
      portCard.querySelector('.pc-title').textContent=pc[1];
      portCard.querySelector('.pc-body').textContent=pc[2];
      portCard.classList.add('show');
    } else {
      portCard.classList.remove('show');
    }
  });
  document.getElementById('port-card-x').addEventListener('click',()=>portCard.classList.remove('show'));
  let hoverPending=false;
  heroSec.addEventListener('mousemove',e=>{
    if(hoverPending)return;
    hoverPending=true;
    requestAnimationFrame(()=>{
      hoverPending=false;
      if(e.target.closest&&e.target.closest('.hero-inner,a,button,#port-card,nav')){heroSec.style.cursor='';return;}
      heroSec.style.cursor=pickAt(e.clientX,e.clientY)?'pointer':'';
    });
  },{passive:true});

  /* ── day / night toggle: atmosphere without touching geometry ── */
  (function dayNight(){
    try{
      var hemi=scene.children.find(function(o){return o.isHemisphereLight;});
      var DAY={ fog:0xf5f5f7, sunI:sun.intensity, sunC:sun.color.getHex(), hemiI:hemi?hemi.intensity:0.8, exp:renderer.toneMappingExposure };
      var isNight=false;
      try{ isNight=localStorage.getItem('tk-port-night')==='1'; }catch(e){}

      var btn=document.createElement('button');
      btn.id='port-daynight';
      btn.setAttribute('aria-label','Toggle day and night');
      heroSec.appendChild(btn);

      function apply(n,skip){
        isNight=n;
        if(n){
          scene.fog.color.set(0x0b1622);
          sun.intensity=0.35; sun.color.set(0xbcd0f0);
          if(hemi){ hemi.intensity=0.35; hemi.color.set(0x2a3a52); hemi.groundColor.set(0x0a1018); }
          renderer.toneMappingExposure=1.25;
          heroSec.classList.add('is-night');
          btn.innerHTML='&#9788;';           /* sun icon => click for day */
          btn.title='Switch to day';
        } else {
          scene.fog.color.set(DAY.fog);
          sun.intensity=DAY.sunI; sun.color.set(DAY.sunC);
          if(hemi){ hemi.intensity=DAY.hemiI; hemi.color.set(0xfdfbf6); hemi.groundColor.set(0x8a7648); }
          renderer.toneMappingExposure=DAY.exp;
          heroSec.classList.remove('is-night');
          btn.innerHTML='&#9789;';           /* moon icon => click for night */
          btn.title='Switch to night';
        }
        if(!skip){ try{ localStorage.setItem('tk-port-night', n?'1':'0'); }catch(e){} }
      }
      btn.addEventListener('click',function(ev){ ev.stopPropagation(); apply(!isNight); });
      apply(isNight,true);
    }catch(e){ /* never break the port over a toggle */ }
  })();

  const camBase = new THREE.Vector3(9.4, 3.7, 10.6);
  const camTarget = new THREE.Vector3(0.8, 1.15, 1.2);
  camera.position.copy(camBase);
  camera.lookAt(camTarget);

  function resize(){
    const w = heroSec.clientWidth, h = heroSec.clientHeight;
    if(!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  let heroVisible = true;
  new IntersectionObserver(es => es.forEach(e => heroVisible = e.isIntersecting), { threshold: 0 }).observe(heroSec);

  const mouseT = { x: 0, y: 0 }, mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', e => {
    mouseT.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseT.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let clock = 0, waveT = 0;
  function frame(){
    requestAnimationFrame(frame);
    if(!heroVisible || document.hidden) return;
    clock += 0.016;

    mouse.x += (mouseT.x - mouse.x) * 0.04;
    mouse.y += (mouseT.y - mouse.y) * 0.04;
    camera.position.set(
      camBase.x + mouse.x * 0.9 + Math.sin(clock * 0.22) * 0.25,
      camBase.y - mouse.y * 0.5 + Math.sin(clock * 0.3) * 0.12,
      camBase.z
    );
    camera.lookAt(camTarget);

    /* waves */
    waveT += 0.02;
    const pos = waterGeo.attributes.position;
    for(let i = 0; i < pos.count; i++){
      const bx = waterBase[i * 3], bz = waterBase[i * 3 + 2];
      pos.setY(i, Math.sin(bx * 0.55 + waveT) * 0.05 + Math.cos(bz * 0.48 + waveT * 0.82) * 0.038);
    }
    pos.needsUpdate = true;
    waterGeo.computeVertexNormals();
    foam.material.map.offset.x = (foam.material.map.offset.x + 0.0012) % 1;
    glint.material.opacity = 0.32 + Math.sin(clock * 0.8) * 0.08;

    /* ship: gentle moored motion */
    ship.position.y = 0.05 + Math.sin(clock * 0.9) * 0.045;
    ship.rotation.z = Math.sin(clock * 0.7) * 0.008;
    ship.rotation.x = Math.sin(clock * 0.55 + 1) * 0.005;

    /* crane work cycle: trolley out over ship, lower, lift, return */
    const cyc = (clock * 0.12) % 1;
    let tz, hy, carrying = true;
    if(cyc < 0.3){        tz = 3.2 - (cyc / 0.3) * 4.4;          hy = 3.6; }
    else if(cyc < 0.5){   tz = -1.2;                             hy = 3.6 - ((cyc - 0.3) / 0.2) * 1.9; }
    else if(cyc < 0.7){   tz = -1.2;                             hy = 1.7 + ((cyc - 0.5) / 0.2) * 1.9; carrying = false; }
    else {                tz = -1.2 + ((cyc - 0.7) / 0.3) * 4.4; hy = 3.6; carrying = false; }
    trolley.position.z = tz;
    spreader.position.set(0, hy, tz);
    hangBox.visible = carrying;
    hangBox.position.set(0, hy - 0.36, tz);
    hangBox.rotation.y = Math.sin(clock * 1.3) * 0.02;
    const cableTop = 4.64, cableLen = Math.max(0.05, cableTop - hy);
    [cableL, cableR].forEach((cb, i) => {
      cb.position.set(i === 0 ? -0.28 : 0.28, (cableTop + hy) / 2, tz);
      cb.scale.y = cableLen;
    });

    /* truck run */
    truck.position.x = -14 + ((clock * 1.1) % 28);
    wheels.forEach(w => { w.rotation.y += 0.12; });

    /* cargo freighter: wide banked circuit over the port */
    const pa = clock * 0.09;
    plane.position.set(Math.cos(pa) * 11 + 6, 8.3 + Math.sin(clock * 0.5) * 0.25, Math.sin(pa) * 11 - 10);
    plane.rotation.set(0, -pa - Math.PI / 2, 0.16);
    strobe.material.opacity = Math.sin(clock * 8) > 0.72 ? 0.9 : 0.12;

    /* crane beacon pulse */
    beaconGlow.material.opacity = 0.25 + (Math.sin(clock * 2.6) > 0.4 ? 0.45 : 0);

    renderer.render(scene, camera);
  }
  frame();
});
