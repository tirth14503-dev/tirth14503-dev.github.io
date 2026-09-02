
__glReady(function initConnectiveWorld(){
  if(typeof THREE === 'undefined') return;
  if(matchMedia('(max-width:760px)').matches) return;
  if(!document.querySelector('.connective-canvas')) return;

  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PALETTE = [0x1c3a5e, 0x2f5a85, 0x2b2b2f, 0x6b7280];
  function pick(){ return PALETTE[Math.floor(Math.random()*PALETTE.length)]; }

  function radialTexture(stops,size){
    size = size||128;
    const cv=document.createElement('canvas'); cv.width=cv.height=size;
    const ctx=cv.getContext('2d');
    const g=ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
    stops.forEach(([s,c])=>g.addColorStop(s,c));
    ctx.fillStyle=g; ctx.fillRect(0,0,size,size);
    return new THREE.CanvasTexture(cv);
  }
  const shadowTex = radialTexture([[0,'rgba(20,16,8,.32)'],[.7,'rgba(20,16,8,.1)'],[1,'rgba(20,16,8,0)']]);
  function groundShadowMesh(w,d){
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d), new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));
    m.rotation.x=-Math.PI/2;
    m.userData.isFakeShadow=true;
    return m;
  }
  const glowTexCache={};
  function glowSprite(hex,scale){
    if(!glowTexCache[hex]) glowTexCache[hex]=radialTexture([[0,'rgba(255,255,255,.95)'],[.3,'#'+hex.toString(16).padStart(6,'0')],[1,'rgba(0,0,0,0)']]);
    const mat=new THREE.SpriteMaterial({map:glowTexCache[hex],transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.85});
    const spr=new THREE.Sprite(mat); spr.scale.set(scale,scale,1);
    return spr;
  }
  function box(w,h,d,color,rough,metal){
    return new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({color,roughness:rough==null?.6:rough,metalness:metal==null?.2:metal}));
  }
  function containerTexture(hex){
    const w=256,h=176,cv=document.createElement('canvas'); cv.width=w; cv.height=h;
    const ctx=cv.getContext('2d');
    const base='#'+hex.toString(16).padStart(6,'0');
    ctx.fillStyle=base; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(0,0,0,.16)'; ctx.lineWidth=2.4;
    for(let x=12;x<w;x+=15){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    ctx.fillStyle='rgba(255,255,255,.12)'; ctx.fillRect(0,0,w,8);
    ctx.fillStyle='rgba(0,0,0,.18)'; ctx.fillRect(0,h-16,w,16);
    ctx.fillStyle='rgba(255,255,255,.5)'; ctx.font='bold 22px monospace';
    ctx.fillText('TK'+Math.floor(100000+Math.random()*899999), 12, h*0.4);
    ctx.font='12px monospace'; ctx.fillStyle='rgba(255,255,255,.32)';
    ctx.fillText('20G1 · SCM', 12, h*0.62);
    return new THREE.CanvasTexture(cv);
  }
  function containerBox(w,h,d,color,rough,metal){
    const mat=new THREE.MeshStandardMaterial({map:containerTexture(color),color:0xffffff,roughness:rough==null?.55:rough,metalness:metal==null?.2:metal});
    return new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  }

  /* ── ZONE 1 — SOURCE: supply chain flow diagram ── */
  function buildSource(scene){
    /* node config: label, hex colour, box dims */
    var CFG=[
      {id:'SUPPLIER',   color:0x1e4a80, ew:0.44,eh:0.44,ed:0.44},
      {id:'FACTORY',    color:0xb87820, ew:0.38,eh:0.56,ed:0.38},
      {id:'WAREHOUSE',  color:0x1c3d70, ew:0.68,eh:0.32,ed:0.44},
      {id:'DISTRIBUTE', color:0x1e4a80, ew:0.44,eh:0.44,ed:0.44},
      {id:'CUSTOMER',   color:0x246040, ew:0.44,eh:0.44,ed:0.44}
    ];
    var SPACING=1.7, Y=0.5;

    /* canvas-text sprite helper */
    function makeLabel(text){
      var lc=document.createElement('canvas'); lc.width=256; lc.height=52;
      var lx=lc.getContext('2d');
      lx.fillStyle='rgba(160,200,255,0.78)';
      lx.font='bold 19px "Instrument Sans",sans-serif';
      lx.textAlign='center'; lx.textBaseline='middle';
      lx.fillText(text,128,26);
      var sp=new THREE.Sprite(new THREE.SpriteMaterial({
        map:new THREE.CanvasTexture(lc),transparent:true,opacity:0.80,depthWrite:false
      }));
      sp.scale.set(1.45,0.30,1);
      return sp;
    }

    /* ambient blue point light */
    var flowLight=new THREE.PointLight(0x4488dd,1.0,9);
    flowLight.position.set(0,2.0,1.2); scene.add(flowLight);

    /* build nodes */
    var nodeObjs=CFG.map(function(c,i){
      var x=(i-(CFG.length-1)/2)*SPACING;
      var mat=new THREE.MeshStandardMaterial({
        color:c.color, roughness:0.14, metalness:0.88,
        emissive:c.color, emissiveIntensity:0.32
      });
      var mesh=new THREE.Mesh(new THREE.BoxGeometry(c.ew,c.eh,c.ed),mat);
      mesh.position.set(x,Y,0); scene.add(mesh);
      /* soft glow halo */
      var gw=glowSprite(c.color,2.0); gw.position.set(x,Y,0); scene.add(gw);
      /* label sprite below box */
      var lbl=makeLabel(c.id); lbl.position.set(x,Y-0.50,0); scene.add(lbl);
      return {mesh:mesh,glow:gw,mat:mat,x:x,hw:c.ew/2};
    });

    /* connector lines between adjacent nodes */
    var SEG=CFG.length-1;
    var linePts=new Float32Array(SEG*6);
    var lineGeo=new THREE.BufferGeometry();
    lineGeo.setAttribute('position',new THREE.BufferAttribute(linePts,3));
    var lineMat=new THREE.LineBasicMaterial({color:0x4488cc,transparent:true,opacity:0.30});
    scene.add(new THREE.LineSegments(lineGeo,lineMat));

    /* small arrow cones pointing right between each pair */
    for(var ai=0;ai<SEG;ai++){
      var ax=(nodeObjs[ai].x+nodeObjs[ai+1].x)/2;
      var coneMesh=new THREE.Mesh(
        new THREE.ConeGeometry(0.052,0.14,6),
        new THREE.MeshStandardMaterial({color:0x5599dd,roughness:0.25,metalness:0.75,
          emissive:0x336699,emissiveIntensity:0.55})
      );
      coneMesh.position.set(ax,Y,0);
      coneMesh.rotation.z=-Math.PI/2; /* tip points +X = right */
      scene.add(coneMesh);
    }

    /* build static line pts (gap of 0.06 on each side of box face) */
    for(var s=0;s<SEG;s++){
      var x1=nodeObjs[s].x  +nodeObjs[s].hw  +0.06;
      var x2=nodeObjs[s+1].x-nodeObjs[s+1].hw-0.06;
      linePts[s*6]=x1; linePts[s*6+1]=Y; linePts[s*6+2]=0;
      linePts[s*6+3]=x2;linePts[s*6+4]=Y; linePts[s*6+5]=0;
    }
    lineGeo.attributes.position.needsUpdate=true;

    /* particle system: flows left -> right */
    var MAX_PT=96;
    var ptPos=new Float32Array(MAX_PT*3);
    var ptCol=new Float32Array(MAX_PT*3);
    var ptLife=new Float32Array(MAX_PT);
    var ptSeg =new Float32Array(MAX_PT);
    var ptT   =new Float32Array(MAX_PT);
    var ptSpd =new Float32Array(MAX_PT);
    for(var j=0;j<MAX_PT;j++){
      ptPos[j*3]=ptPos[j*3+1]=ptPos[j*3+2]=9999;
      ptLife[j]=0;
    }

    /* warm blue-white star texture */
    var ptCv=document.createElement('canvas'); ptCv.width=ptCv.height=32;
    var ptg=ptCv.getContext('2d');
    var ptGr=ptg.createRadialGradient(16,16,0,16,16,14);
    ptGr.addColorStop(0,'rgba(230,245,255,1)');
    ptGr.addColorStop(0.30,'rgba(110,190,255,0.9)');
    ptGr.addColorStop(0.70,'rgba(40,110,220,0.35)');
    ptGr.addColorStop(1,'rgba(20,60,180,0)');
    ptg.beginPath(); ptg.arc(16,16,14,0,Math.PI*2);
    ptg.fillStyle=ptGr; ptg.fill();

    var ptGeo=new THREE.BufferGeometry();
    ptGeo.setAttribute('position',new THREE.BufferAttribute(ptPos,3));
    ptGeo.setAttribute('color',new THREE.BufferAttribute(ptCol,3));
    var ptMat=new THREE.PointsMaterial({
      map:new THREE.CanvasTexture(ptCv),
      size:0.095, transparent:true, depthWrite:false,
      sizeAttenuation:true, vertexColors:true,
      blending:THREE.AdditiveBlending
    });
    scene.add(new THREE.Points(ptGeo,ptMat));

    var spawnTimer=0, nextPt=0, spawnPhase=0;

    return {
      camStart:new THREE.Vector3(-0.2,3.0,6.2), camStartTarget:new THREE.Vector3(0,Y,0),
      camEnd:new THREE.Vector3(-0.2,1.3,3.1),   camEndTarget:new THREE.Vector3(0,Y,0),
      update:function(dt,clock){
        /* breathe nodes */
        nodeObjs.forEach(function(n,i){
          n.mesh.rotation.y+=dt*0.30;
          n.mat.emissiveIntensity=0.26+Math.sin(clock*1.35+i*1.25)*0.12;
          n.glow.material.opacity=0.16+Math.sin(clock*1.35+i*1.25)*0.06;
        });
        flowLight.intensity=0.88+Math.sin(clock*0.75)*0.14;
        lineMat.opacity=0.22+Math.sin(clock*0.6)*0.07;

        /* spawn one particle per segment in round-robin */
        spawnTimer+=dt;
        if(spawnTimer>0.055){
          spawnTimer=0;
          var seg=spawnPhase%SEG; spawnPhase++;
          for(var k=0;k<MAX_PT;k++){
            var idx=(nextPt+k)%MAX_PT;
            if(ptLife[idx]<=0){
              ptLife[idx]=1; ptSeg[idx]=seg; ptT[idx]=0;
              ptSpd[idx]=0.11+Math.random()*0.15;
              nextPt=(idx+1)%MAX_PT; break;
            }
          }
        }

        /* update every particle */
        for(var p=0;p<MAX_PT;p++){
          if(ptLife[p]<=0){
            ptPos[p*3]=ptPos[p*3+1]=ptPos[p*3+2]=9999;
            ptCol[p*3]=ptCol[p*3+1]=ptCol[p*3+2]=0;
            continue;
          }
          ptT[p]+=dt*ptSpd[p];
          if(ptT[p]>=1){ ptLife[p]=0; continue; }
          var sg=ptSeg[p];
          var lx1=nodeObjs[sg].x  +nodeObjs[sg].hw  +0.06;
          var lx2=nodeObjs[sg+1].x-nodeObjs[sg+1].hw-0.06;
          var px=lx1+(lx2-lx1)*ptT[p];
          var py=Y+Math.sin(ptT[p]*Math.PI)*0.07; /* gentle arc */
          ptPos[p*3]=px; ptPos[p*3+1]=py; ptPos[p*3+2]=0;
          var a=Math.sin(ptT[p]*Math.PI);
          /* R:0.45 G:0.72 B:1.0 — blue-white */
          ptCol[p*3]=0.45*a; ptCol[p*3+1]=0.72*a; ptCol[p*3+2]=a;
        }
        ptGeo.attributes.position.needsUpdate=true;
        ptGeo.attributes.color.needsUpdate=true;
      }
    };
  }

  /* ── ZONE 2 — MAKE & STORE: racking, conveyor, robotic arm ── */
  function buildWarehouse(scene){
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(9,5.4), new THREE.MeshStandardMaterial({color:0xe7e1d2,roughness:.8,metalness:.05}));
    floor.rotation.x=-Math.PI/2; floor.userData.isGroundPlane=true; scene.add(floor);

    const rackMat=new THREE.MeshStandardMaterial({color:0x2b2b2f,roughness:.5,metalness:.4});
    const bays=3, levels=3, bayW=1.1, gap=0.28, levelH=0.62;
    const rackGroup=new THREE.Group();
    for(let b=0;b<bays;b++){
      const x=-((bays-1)*(bayW+gap))/2 + b*(bayW+gap);
      [[-bayW/2,-0.45],[bayW/2,-0.45],[-bayW/2,0.45],[bayW/2,0.45]].forEach(([dx,dz])=>{
        const post=new THREE.Mesh(new THREE.BoxGeometry(0.06,levels*levelH,0.06),rackMat);
        post.position.set(x+dx, levels*levelH/2, dz);
        rackGroup.add(post);
      });
      for(let l=0;l<=levels;l++){
        const shelf=new THREE.Mesh(new THREE.BoxGeometry(bayW,0.04,0.95),rackMat);
        shelf.position.set(x, l*levelH+0.05, 0);
        rackGroup.add(shelf);
        if(l<levels && Math.random()<0.85){
          const bx=containerBox(bayW*0.7, levelH*0.55, 0.7, pick(), .6, .15);
          bx.position.set(x, l*levelH+0.05+levelH*0.55/2+0.04, 0);
          rackGroup.add(bx);
        }
      }
    }
    rackGroup.position.set(0.7,0,-1.2);
    scene.add(rackGroup);
    const rackShadow=groundShadowMesh(4.3,1.7); rackShadow.position.set(0.7,0.01,-1.2); scene.add(rackShadow);

    const beltLen=5.6;
    const belt=new THREE.Mesh(new THREE.BoxGeometry(beltLen,0.14,0.6), new THREE.MeshStandardMaterial({color:0x1d1d1f,roughness:.6,metalness:.3}));
    belt.position.set(0,0.14,1.15); scene.add(belt);
    [[-beltLen/2+0.3,0],[beltLen/2-0.3,0]].forEach(([x])=>{
      const leg=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.14,0.62), new THREE.MeshStandardMaterial({color:0x2b2b2f}));
      leg.position.set(x,0.07,1.15); scene.add(leg);
    });
    const beltShadow=groundShadowMesh(beltLen+0.4,0.9); beltShadow.position.set(0,0.01,1.15); scene.add(beltShadow);

    const beltBoxes=Array.from({length:5},(_,i)=>{
      const bm=containerBox(0.34,0.3,0.34,pick(),.6,.15);
      scene.add(bm);
      return {mesh:bm, t:i/5};
    });

    const arm=new THREE.Group();
    const base=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.26,0.22,16), new THREE.MeshStandardMaterial({color:0x2b2b2f,roughness:.4,metalness:.5}));
    base.position.y=0.11; arm.add(base);
    const shoulder=new THREE.Group(); shoulder.position.set(0,0.22,0); arm.add(shoulder);
    const upperArm=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.9,0.16), new THREE.MeshStandardMaterial({color:0x2f5a85,roughness:.35,metalness:.55}));
    upperArm.position.y=0.45; shoulder.add(upperArm);
    const elbow=new THREE.Group(); elbow.position.set(0,0.9,0); shoulder.add(elbow);
    const foreArm=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.7,0.13), new THREE.MeshStandardMaterial({color:0x2b2b2f,roughness:.4,metalness:.5}));
    foreArm.position.y=0.35; elbow.add(foreArm);
    const gripper=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.14,0.22), new THREE.MeshStandardMaterial({color:0x8ca9c4,roughness:.3,metalness:.5}));
    gripper.position.y=0.72; elbow.add(gripper);
    arm.position.set(-2.9,0,1.15);
    scene.add(arm);
    const armShadow=groundShadowMesh(1.3,1.3); armShadow.position.set(-2.9,0.01,1.15); scene.add(armShadow);

    return {
      camStart:new THREE.Vector3(6.4,4.6,8.2), camStartTarget:new THREE.Vector3(-1.6,0.6,0.5),
      camEnd:new THREE.Vector3(1.9,2.1,4.1), camEndTarget:new THREE.Vector3(0.9,0.95,-0.4),
      update(dt,clock){
        beltBoxes.forEach(b=>{
          b.t += dt*0.09;
          if(b.t>1) b.t-=1;
          const x=-beltLen/2+0.4 + b.t*(beltLen-0.8);
          b.mesh.position.set(x,0.36,1.15);
        });
        shoulder.rotation.y = -0.5+((Math.sin(clock*0.8)+1)/2)*1.0;
        elbow.rotation.z = -0.3-Math.sin(clock*0.8)*0.35;
        gripper.scale.y = 0.8+((Math.sin(clock*1.6)+1)/2)*0.4;
      }
    };
  }

  /* ── ZONE 3 — INTERMODAL TRANSPORT: plane, ship, train, truck
       all converging on one transfer hub (Timeline) ── */
  function buildIntermodal(scene){
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(14,7), new THREE.MeshStandardMaterial({color:0xe7e1d2,roughness:.8,metalness:.05}));
    ground.rotation.x=-Math.PI/2; ground.userData.isGroundPlane=true; scene.add(ground);

    const road=new THREE.Mesh(new THREE.BoxGeometry(11,0.03,0.9), new THREE.MeshStandardMaterial({color:0x2b2b2f,roughness:.7,metalness:.1}));
    road.position.set(0,0.016,-2.1); scene.add(road);

    const railBed=new THREE.Mesh(new THREE.BoxGeometry(11,0.02,0.55), new THREE.MeshStandardMaterial({color:0x8a8478,roughness:.8,metalness:.15}));
    railBed.position.set(0,0.011,0); scene.add(railBed);
    [-0.2,0.2].forEach(dz=>{
      const r=new THREE.Mesh(new THREE.BoxGeometry(11,0.025,0.04), new THREE.MeshStandardMaterial({color:0x6b6459,roughness:.6,metalness:.3}));
      r.position.set(0,0.022,dz); scene.add(r);
    });

    const water=new THREE.Mesh(new THREE.PlaneGeometry(11,1.4), new THREE.MeshStandardMaterial({color:0xc9d5d9,roughness:.45,metalness:.3,transparent:true,opacity:.95}));
    water.rotation.x=-Math.PI/2; water.position.set(0,0.008,2.2); scene.add(water);

    const hub=new THREE.Group();
    const hubPole=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.09,1.8,10), new THREE.MeshStandardMaterial({color:0x2b2b2f,roughness:.4,metalness:.5}));
    hubPole.position.y=0.9; hub.add(hubPole);
    const hubCap=new THREE.Mesh(new THREE.SphereGeometry(0.16,14,14), new THREE.MeshStandardMaterial({color:0x8ca9c4,roughness:.3,metalness:.6}));
    hubCap.position.y=1.85; hub.add(hubCap);
    const hubGlow=glowSprite(0x8ca9c4,.6); hubGlow.position.y=1.85; hub.add(hubGlow);
    hub.position.set(4.6,0,0);
    scene.add(hub);
    const hubShadow=groundShadowMesh(1,1); hubShadow.position.set(4.6,0.02,0); scene.add(hubShadow);

    const truck=new THREE.Group();
    const cab=box(0.42,0.36,0.4,0x1c3a5e,.5,.2); cab.position.set(-0.46,0.3,0); truck.add(cab);
    const cabTop=box(0.34,0.18,0.34,0xe9e4d6,.6,.1); cabTop.position.set(-0.5,0.54,0); truck.add(cabTop);
    const trailer=box(1.3,0.42,0.42,0x2b2b2f,.6,.15); trailer.position.set(0.5,0.32,0); truck.add(trailer);
    const wheelGeo=new THREE.CylinderGeometry(0.12,0.12,0.1,12);
    [[-0.46,-0.21],[-0.46,0.21],[0.1,-0.21],[0.1,0.21],[0.85,-0.21],[0.85,0.21]].forEach(([wx,wz])=>{
      const w=new THREE.Mesh(wheelGeo,new THREE.MeshStandardMaterial({color:0x111111,roughness:.8}));
      w.rotation.z=Math.PI/2; w.position.set(wx,0.12,wz); truck.add(w);
    });
    scene.add(truck);
    const truckShadow=groundShadowMesh(1.9,0.8); scene.add(truckShadow);

    const train=new THREE.Group();
    for(let i=0;i<3;i++){
      const car=i===0 ? box(0.9,0.5,0.62,0x2b2b2f,.55,.2) : containerBox(0.9,0.5,0.62,pick(),.55,.2);
      car.position.set(i*1.05,0.29,0);
      train.add(car);
    }
    scene.add(train);
    const trainShadow=groundShadowMesh(3.4,0.8); scene.add(trainShadow);

    const ship=new THREE.Group();
    const hull=box(1.7,0.4,0.55,0x23232a,.5,.3); hull.position.y=0.2; ship.add(hull);
    const bridge=box(0.36,0.32,0.4,0x1d1d1f,.5,.2); bridge.position.set(-0.55,0.56,0); ship.add(bridge);
    [0,1].forEach(i=>{
      const c=containerBox(0.3,0.26,0.26,pick(),.6,.15);
      c.position.set(-0.1+i*0.4,0.56,0); ship.add(c);
    });
    scene.add(ship);
    const shipShadow=groundShadowMesh(2.1,0.9); scene.add(shipShadow);

    const plane=new THREE.Group();
    const fuselage=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,1.1,12), new THREE.MeshStandardMaterial({color:0xe9e4d6,roughness:.35,metalness:.3}));
    fuselage.rotation.z=Math.PI/2; plane.add(fuselage);
    const nose=new THREE.Mesh(new THREE.ConeGeometry(0.13,0.32,12), new THREE.MeshStandardMaterial({color:0xe9e4d6,roughness:.35,metalness:.3}));
    nose.rotation.z=-Math.PI/2; nose.position.x=0.71; plane.add(nose);
    const stripe=box(1.1,0.035,0.04,0x2f5a85,.3,.5); plane.add(stripe);
    const wing=box(0.15,0.03,1.5,0x2b2b2f,.4,.3); plane.add(wing);
    const tailFin=box(0.03,0.34,0.26,0x2b2b2f,.4,.3); tailFin.position.set(-0.62,0.16,0); plane.add(tailFin);
    const tailWing=box(0.03,0.05,0.5,0x2b2b2f,.4,.3); tailWing.position.set(-0.6,0.02,0); plane.add(tailWing);
    scene.add(plane);

    return {
      camStart:new THREE.Vector3(6.6,4.9,7.8), camStartTarget:new THREE.Vector3(0,0.7,0),
      camEnd:new THREE.Vector3(2.0,2.4,4.6), camEndTarget:new THREE.Vector3(3.0,0.8,0.3),
      update(dt,clock){
        const tt=(clock*0.09)%1;
        truck.position.set(-5.4+tt*9.6, 0, -2.1);
        truckShadow.position.set(truck.position.x, 0.02, -2.1);

        const rt=((clock*0.075)+0.3)%1;
        train.position.set(-5.6+rt*9.6, 0, 0);
        trainShadow.position.set(train.position.x+1.05, 0.02, 0);

        const st=((clock*0.05)+0.6)%1;
        ship.position.set(-5.2+st*9.2, 0.02+Math.sin(clock*1.3)*0.02, 2.2);
        shipShadow.position.set(ship.position.x, 0.02, 2.2);

        const pt=(clock*0.055)%1;
        plane.position.set(-6+pt*12, 3.0+Math.sin(pt*Math.PI*2)*0.15, -3+pt*6);
        plane.rotation.y = -0.35;
        plane.rotation.z = Math.sin(clock*0.6)*0.08;

        hubGlow.material.opacity = 0.6+Math.sin(clock*2)*0.2;
      }
    };
  }

  /* ── mount: same proven zone-crossfade pattern as the SCM journey,
     anchored to the About→Timeline document range instead of a
     dedicated pinned spacer (these sections scroll normally) ── */
  const startEl = document.getElementById('about');
  const endEl = document.getElementById('timeline');
  if(!startEl || !endEl) return;

  const ZONES = [
    {start:0.00, fadeIn:0.05, fadeOut:0.22, end:0.30},
    {start:0.24, fadeIn:0.34, fadeOut:0.66, end:0.76},
    {start:0.68, fadeIn:0.80, fadeOut:0.96, end:1.00},
  ];
  const WORLD_OPACITY_CAP = 0.46; // this layer is ambient texture behind dense text, not the main event
  function zoneOpacity(p,z){
    if(p<=z.start || p>=z.end) return 0;
    if(p<z.fadeIn) return (p-z.start)/(z.fadeIn-z.start)*WORLD_OPACITY_CAP;
    if(p>z.fadeOut) return (z.end-p)/(z.end-z.fadeOut)*WORLD_OPACITY_CAP;
    return WORLD_OPACITY_CAP;
  }
  function zoneLocalProgress(p,z){
    return Math.max(0, Math.min(1, (p-z.start)/(z.end-z.start)));
  }

  const chapters = [buildSource,buildWarehouse,buildIntermodal].map((build,i)=>{
    const canvas=document.getElementById('connective-canvas-'+i);
    if(!canvas) return null;
    let renderer;
    try{ renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true}); }
    catch(e){ return null; }
    renderer.setClearColor(0x000000,0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.15;
    renderer.outputEncoding=THREE.sRGBEncoding;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    const scene=new THREE.Scene();
    scene.fog=new THREE.Fog(0xf1efe6,9,18);
    const camera=new THREE.PerspectiveCamera(40,1,0.1,100);
    scene.add(new THREE.HemisphereLight(0xffffff,0x6b5a2c,1.0));
    const sun=new THREE.DirectionalLight(0xfff2d9,0.9); sun.position.set(5,8,4); sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024);
    sun.shadow.camera.left=-6; sun.shadow.camera.right=6; sun.shadow.camera.top=5; sun.shadow.camera.bottom=-5;
    sun.shadow.camera.near=1; sun.shadow.camera.far=16; sun.shadow.bias=-0.0015;
    scene.add(sun);
    const api=build(scene);
    scene.traverse(o=>{
      if(!o.isMesh) return;
      if(o.userData.isFakeShadow){ o.castShadow=false; o.receiveShadow=false; }
      else if(o.userData.isGroundPlane){ o.castShadow=false; o.receiveShadow=true; }
      else { o.castShadow=true; o.receiveShadow=true; }
    });
    return {canvas,renderer,scene,camera,api,curPos:api.camStart.clone(),curTarget:api.camStartTarget.clone(),clock:0};
  });

  function resize(){
    const w=window.innerWidth, h=window.innerHeight;
    chapters.forEach(c=>{ if(!c) return; c.renderer.setSize(w,h); c.camera.aspect=w/h; c.camera.updateProjectionMatrix(); });
  }
  window.addEventListener('resize', resize);
  resize();

  // derive both scroll-progress AND on-screen visibility from actual
  // section positions, refreshed on scroll/resize (no IntersectionObserver
  // dependency — see the sticky-positioning debugging notes for why)
  function computeState(){
    const sr=startEl.getBoundingClientRect(), er=endEl.getBoundingClientRect();
    const vh=window.innerHeight||1;
    const docStart=window.scrollY+sr.top;
    const docEnd=window.scrollY+er.bottom;
    const total=(docEnd-vh)-docStart;
    const p = total<=0 ? 0 : Math.max(0, Math.min(1, (window.scrollY-docStart)/total));
    const visible = er.bottom>0 && sr.top<vh;
    return {visible, p};
  }
  let cached=computeState(), ticking=false;
  function onScroll(){
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(()=>{ cached=computeState(); ticking=false; });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  (function __tick(){ onScroll(); requestAnimationFrame(__tick); })();
  window.addEventListener('resize', onScroll);

  function frame(){
    requestAnimationFrame(frame);
    if(!cached.visible || document.hidden) return;
    const dt = REDUCE ? 0 : 0.016;
    const p = REDUCE ? 0.15 : cached.p;

    chapters.forEach((c,i)=>{
      if(!c) return;
      const z=ZONES[i];
      const op=zoneOpacity(p,z);
      const relOp = Math.min(1, op/WORLD_OPACITY_CAP);
      c.canvas.style.opacity=op;
      c.canvas.style.filter='blur('+((1-relOp)*6)+'px)';
      if(op>0.015){
        c.clock+=dt;
        if(c.api.update) c.api.update(dt,c.clock);
        const lp=zoneLocalProgress(p,z);
        const wantPos=c.api.camStart.clone().lerp(c.api.camEnd,lp);
        const wantTarget=c.api.camStartTarget.clone().lerp(c.api.camEndTarget,lp);
        c.curPos.lerp(wantPos, REDUCE?1:0.14);
        c.curTarget.lerp(wantTarget, REDUCE?1:0.14);
        c.camera.position.copy(c.curPos);
        c.camera.lookAt(c.curTarget);
        c.renderer.render(c.scene,c.camera);
      }
    });
  }
  frame();
});
