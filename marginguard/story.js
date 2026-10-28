// Scroll owns the scene pose. Render only on a scroll, resize or visibility change.
const root = document.querySelector('.narrative');
const mount = document.querySelector('#cash-scene');
const labels = ['Your working capital, in focus.', 'Find the difference. Follow the evidence.', 'See the capital behind your inventory.', 'Compare the tradeoff before the decision.', 'Keep the context. Review the outcome.'];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 640px)');
let frame = 0, renderScene = null, active = true, destroyed = false, paused = false;
const toggle = document.querySelector('#motion-toggle');
toggle.addEventListener('click',()=>{paused=!paused;toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=paused?'Resume 3D motion':'Pause 3D motion';invalidate();});
toggle.hidden=motion.matches;
function progress() {
  const rect = root.getBoundingClientRect();
  return Math.max(0, Math.min(4, -rect.top / Math.max(1, rect.height - innerHeight) * 4));
}
function draw() {
  frame = 0;
  if (document.hidden || !active || destroyed) return;
  const p = progress(), step = Math.min(4, Math.round(p));
  document.querySelector('#scene-label').textContent = labels[step];
  document.querySelector('#scene-index').textContent = `${String(step + 1).padStart(2, '0')} / 05`;
  renderScene?.(motion.matches || paused ? 0 : p);
}
function invalidate() { if (!frame && !destroyed) frame = requestAnimationFrame(draw); }
addEventListener('scroll', invalidate, {passive:true});
addEventListener('resize', invalidate, {passive:true});
document.addEventListener('visibilitychange', invalidate);
motion.addEventListener('change', () => {document.body.classList.toggle('reduced-motion', motion.matches);toggle.hidden=motion.matches;invalidate();});
document.body.classList.toggle('reduced-motion', motion.matches);
const observer = new IntersectionObserver(entries => { active = entries[0].isIntersecting; if (active) invalidate(); });
observer.observe(root);
invalidate();

async function initialize() {
  // Static artwork is the complete fallback for reduced motion or unavailable WebGL.
  if (motion.matches) return;
  const THREE = await import('./vendor/three.module.js');
  if (destroyed) return;
  const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  mount.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  const ambient = new THREE.HemisphereLight(0xe6f1cb, 0x29483c, 2.9);scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff2ca, 3.3);key.position.set(-3,8,5);scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fecc7, 2);rim.position.set(6,2,-4);scene.add(rim);

  function texture(painter, width=1536, height=672) {
    const canvas = document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d');painter(ctx,width,height);
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return tex;
  }
  const noteTexture=texture((ctx,w,h)=>{
    ctx.fillStyle='#c7d6b2';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#708a68';ctx.lineWidth=2;
    for(let i=0;i<8;i++){ctx.strokeRect(22+i*5,22+i*5,w-44-i*10,h-44-i*10);}
    ctx.save();ctx.beginPath();ctx.rect(70,70,w-140,h-140);ctx.clip();ctx.globalAlpha=.38;ctx.lineWidth=1;
    for(let line=0;line<100;line++){
      ctx.beginPath();for(let x=0;x<=w;x+=8){const y=line*9+Math.sin(x*.014+line*.28)*32+Math.sin(x*.005)*20;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle='#b5cba1';ctx.beginPath();ctx.ellipse(w*.48,h*.52,220,190,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#637e5b';ctx.lineWidth=2;
    for(let i=0;i<12;i++){ctx.beginPath();ctx.ellipse(w*.48,h*.52,200+i*3,150+i*3,0,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle='#355e45';ctx.textAlign='center';ctx.font='600 135px Georgia';ctx.fillText('MG',w*.48,h*.59);
    ctx.font='24px Arial';ctx.letterSpacing='5px';ctx.fillText('M A R G I N G U A R D',w*.5,113);
    ctx.font='15px Arial';ctx.fillText('W O R K I N G   C A P I T A L',w*.5,h-88);
    ctx.textAlign='left';ctx.font='italic 130px Georgia';ctx.fillText('100',90,h*.64);
    ctx.textAlign='right';ctx.fillText('100',w-90,h*.64);
    ctx.font='16px monospace';ctx.fillText('MG 001 / CONCEPT',w-85,h-115);
    ctx.textAlign='left';ctx.fillText('EVIDENCE · CONTEXT · DECISION',85,h-115);
    ctx.font='italic 22px Georgia';ctx.fillText('Follow the money.',100,180);
  });
  const edgeTexture=texture((ctx,w,h)=>{ctx.fillStyle='#c3c9aa';ctx.fillRect(0,0,w,h);for(let y=0;y<h;y+=8){ctx.fillStyle=y%16?'#798976':'#e6e2c2';ctx.fillRect(0,y,w,2);}},512,128);
  const bandTexture=texture((ctx,w,h)=>{ctx.fillStyle='#164f3c';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#9acaa2';ctx.lineWidth=3;ctx.strokeRect(16,16,w-32,h-32);ctx.fillStyle='#bed9b6';ctx.textAlign='center';ctx.font='500 55px Arial';ctx.fillText('M G',w/2,h*.5);ctx.font='18px monospace';ctx.fillText('WORKING CAPITAL',w/2,h*.68);},256,672);
  const paper=new THREE.MeshStandardMaterial({color:0xc6cdb0,roughness:.82});
  const edge=new THREE.MeshStandardMaterial({map:edgeTexture,roughness:.85});
  const face=new THREE.MeshStandardMaterial({map:noteTexture,roughness:.78});
  const band=new THREE.MeshStandardMaterial({color:0x205440,roughness:.65});
  const bandFace=new THREE.MeshStandardMaterial({map:bandTexture,roughness:.7});
  const cash=new THREE.Group();scene.add(cash);
  const bundles=[];
  for(let i=0;i<3;i++){
    const bundle=new THREE.Group();cash.add(bundle);bundles.push(bundle);
    const body=new THREE.Mesh(new THREE.BoxGeometry(4.8,.34,2.1),[edge,edge,paper,paper,edge,edge]);bundle.add(body);
    const top=new THREE.Mesh(new THREE.PlaneGeometry(4.8,2.1),face);top.rotation.x=-Math.PI/2;top.position.y=.174;bundle.add(top);
    const strap=new THREE.Mesh(new THREE.BoxGeometry(.76,.36,2.13),band);strap.position.x=.9;bundle.add(strap);
    const strapTop=new THREE.Mesh(new THREE.PlaneGeometry(.76,2.13),bandFace);strapTop.rotation.x=-Math.PI/2;strapTop.position.set(.9,.184,0);bundle.add(strapTop);
  }
  const loose=[];
  for(let i=0;i<3;i++){
    const note=new THREE.Mesh(new THREE.BoxGeometry(4.8,.012,2.1),[paper,paper,face,paper,edge,edge]);cash.add(note);loose.push(note);
  }
  const shadowTexture=texture((ctx,w,h)=>{const gradient=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gradient.addColorStop(0,'rgba(0,0,0,.6)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);},256,256);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(10,7),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.25;scene.add(shadow);
  let width=0,height=0;
  renderScene=p=>{
    const w=mount.clientWidth,h=mount.clientHeight;if(!w||!h)return;
    if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
    const mobile=narrow.matches;
    camera.position.set(mobile?6.8:6.5,mobile?7.5:6.6,mobile?10.8:10.2);camera.lookAt(0,.1,0);
    cash.scale.setScalar(mobile?.88:1);
    cash.rotation.set(.06*Math.sin(p),-.45+p*.4,-.1+Math.sin(p*1.3)*.08);
    cash.position.set(Math.sin(p*1.5)*.3,Math.cos(p*1.3)*.12,0);
    const open=Math.sin(Math.min(1,p/2)*Math.PI/2)*Math.sin(Math.max(0,(4-p)/4)*Math.PI/2);
    bundles.forEach((bundle,i)=>{
      bundle.position.set((i-1)*(.37+open*.46),i*.4-.4,(i-1)*(.18+open*.32));
      bundle.rotation.y=(i-1)*(.11+open*.22);
    });
    loose.forEach((note,i)=>{
      note.position.set(-.2-i*.13-open*(1.3+i*.27),.93+i*.07+open*(.32+i*.1),-.12+i*.1+open*.1);
      note.rotation.set(open*.06, -.1-i*.03-open*.16, -.02+open*(.03+i*.02));
    });
    renderer.render(scene,camera);
  };
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();document.body.classList.remove('webgl-ready');});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{document.body.classList.add('webgl-ready');invalidate();});
  document.body.classList.add('webgl-ready');invalidate();
  addEventListener('pagehide',event=>{
    if(event.persisted)return;
    destroyed=true;cancelAnimationFrame(frame);observer.disconnect();
    scene.traverse(object=>{object.geometry?.dispose();if(object.material){for(const mat of [].concat(object.material)){mat.map?.dispose();mat.dispose();}}});
    renderer.dispose();
  },{once:true});
}
initialize().catch(()=>{document.body.classList.remove('webgl-ready');});
