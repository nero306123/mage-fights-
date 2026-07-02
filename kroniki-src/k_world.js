// ================= ŚWIAT 3D =================
"use strict";
const W = {};
W.canvas = document.getElementById('c');
W.renderer = new THREE.WebGLRenderer({canvas:W.canvas, antialias:true});
W.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
if('outputEncoding' in W.renderer && THREE.sRGBEncoding!=null) W.renderer.outputEncoding=THREE.sRGBEncoding;
W.renderer.toneMapping = THREE.ACESFilmicToneMapping;
W.renderer.toneMappingExposure = 0.92;

W.scene = new THREE.Scene();
W.scene.background = new THREE.Color(0x05030a);
W.scene.fog = new THREE.FogExp2(0x05030a, 0.03);

// kamera izometryczna (podąża za graczem)
W.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 300);
W.camDist = 16; W.camAngle = Math.PI*0.25; W.camPitch = 0.9; // pitch rad
W.camTarget = new THREE.Vector3();
W.updateCamera = function(target, dt){
  W.camTarget.lerp(target, Math.min(1, dt*6));
  const cx = W.camTarget.x + Math.sin(W.camAngle)*Math.cos(W.camPitch)*W.camDist;
  const cz = W.camTarget.z + Math.cos(W.camAngle)*Math.cos(W.camPitch)*W.camDist;
  const cy = W.camTarget.y + Math.sin(W.camPitch)*W.camDist;
  W.camera.position.set(cx,cy,cz);
  W.camera.lookAt(W.camTarget.x, W.camTarget.y+0.8, W.camTarget.z);
};

// światła
W.hemi = new THREE.HemisphereLight(0x8878aa, 0x0a0812, 0.3); W.scene.add(W.hemi);
W.sun = new THREE.DirectionalLight(0xfff0d8, 0.4); W.sun.position.set(20,32,14); W.scene.add(W.sun);
W.amb = new THREE.AmbientLight(0x222033, 0.18); W.scene.add(W.amb);

// odbicia
try{
  const pm = new THREE.PMREMGenerator(W.renderer); pm.compileEquirectangularShader();
  W.scene.environment = pm.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
}catch(e){}

// bloom
W.composer=null; W.bloom=null;
try{
  W.composer = new THREE.EffectComposer(W.renderer);
  W.composer.addPass(new THREE.RenderPass(W.scene, W.camera));
  W.bloom = new THREE.UnrealBloomPass(new THREE.Vector2(1,1), 0.42, 0.55, 0.88);
  W.composer.addPass(W.bloom);
}catch(e){ console.warn('bloom off', e); }

W.resize = function(){
  const w=innerWidth, h=innerHeight;
  W.renderer.setSize(w,h,false);
  if(W.composer) W.composer.setSize(w,h);
  W.camera.aspect=w/h; W.camera.updateProjectionMatrix();
};
addEventListener('resize', W.resize); W.resize();

// ---------- materiały pomocnicze ----------
W.mat=(c,o)=>{o=o||{};const m=new THREE.MeshStandardMaterial({color:c,roughness:o.rough??0.8,metalness:o.met??0.1,
  emissive:o.em??0,emissiveIntensity:o.emi??1,transparent:o.op!=null,opacity:o.op??1,side:o.side||THREE.FrontSide,flatShading:!!o.flat});
  m.envMapIntensity=o.env??0.05; return m;};
W.glow=(c,i)=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:i||2,roughness:.4,toneMapped:false});
W.dotTex=(function(){const s=64,cv=document.createElement('canvas');cv.width=cv.height=s;const x=cv.getContext('2d');
  const g=x.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.4,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,s,s);return new THREE.CanvasTexture(cv);})();
W.runeTexture=(function(){const s=256,cv=document.createElement('canvas');cv.width=cv.height=s;const x=cv.getContext('2d');
  x.strokeStyle='#fff';x.fillStyle='#fff';const cx=s/2,cy=s/2,R=s*.47;
  [0.95,0.75].forEach((r,i)=>{x.globalAlpha=i?0.5:0.9;x.lineWidth=i?2:4;x.beginPath();x.arc(cx,cy,r*R,0,7);x.stroke();});
  for(let i=0;i<16;i++){const a=i/16*6.283;x.globalAlpha=i%2?0.4:0.9;x.lineWidth=2.5;
    x.beginPath();x.moveTo(cx+Math.cos(a)*R*.58,cy+Math.sin(a)*R*.58);x.lineTo(cx+Math.cos(a)*R*.68,cy+Math.sin(a)*R*.68);x.stroke();}
  return new THREE.CanvasTexture(cv);})();
W.ringMat=(c,op)=>new THREE.MeshBasicMaterial({color:c,map:W.runeTexture,transparent:true,opacity:op??0.7,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false,toneMapped:false});

// ---------- GLB modele bogów ----------
W.godModels={}; W.loadGod=function(key,cb){
  if(W.godModels[key]){cb(W.godModels[key].clone(true));return;}
  const uri=(window.GLB_MODELS||{})[key];
  if(!uri||!THREE.GLTFLoader){cb(null);return;}
  new THREE.GLTFLoader().load(uri,(g)=>{
    const model=g.scene;
    const box=new THREE.Box3().setFromObject(model);const size=new THREE.Vector3();box.getSize(size);
    const maxd=Math.max(size.x,size.y,size.z)||1;model.scale.setScalar(1.9/maxd);
    box.setFromObject(model);const ctr=new THREE.Vector3();box.getCenter(ctr);
    model.position.x-=ctr.x;model.position.z-=ctr.z;model.position.y-=box.min.y;
    model.traverse(o=>{if(o.isMesh&&o.material){o.material.envMapIntensity=0.6;}});
    const wrap=new THREE.Group();wrap.add(model);
    W.godModels[key]=wrap;cb(wrap.clone(true));
  },undefined,()=>cb(null));
};

// ---------- SZUM TERENU (regiony poza wioską) ----------
W._nz=(function(){const p=[];for(let i=0;i<256;i++)p.push((Math.sin(i*127.1)*43758.5453)%1);
  function h(x,z){const n=Math.sin(x*12.9898+z*78.233)*43758.5453;return n-Math.floor(n);}
  function sm(x,z){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz;
    const a=h(ix,iz),b=h(ix+1,iz),c=h(ix,iz+1),d=h(ix+1,iz+1);
    const ux=fx*fx*(3-2*fx),uz=fz*fz*(3-2*fz);
    return a*(1-ux)*(1-uz)+b*ux*(1-uz)+c*(1-ux)*uz+d*ux*uz;}
  return function(x,z){return sm(x*0.05,z*0.05)*0.7+sm(x*0.13+7,z*0.13+3)*0.3;};
})();
W.terrainAmp=0; W.terrainY=function(x,z){return W.terrainAmp>0? (W._nz(x,z)-0.5)*2*W.terrainAmp : 0;};
W.groundH=function(x,z){ if(W.grid)return W.walkY(x,z); return W.terrainY(x,z); };

// ---------- POSTACIE Z ARKUSZA ----------
W.charProtos=null; W.CHAR_YAW=Math.PI/2;
W.loadSheet=function(cb){
  if(W.charProtos){cb();return;}
  const uri=(window.GLB_MODELS||{}).sheet;
  if(!uri||!THREE.GLTFLoader){W.charProtos=[];cb();return;}
  new THREE.GLTFLoader().load(uri,(g)=>{
    let src=null;g.scene.traverse(o=>{if(o.isMesh&&!src)src=o;});
    const geo=src.geometry.index?src.geometry.toNonIndexed():src.geometry;
    const pos=geo.attributes.position,uv=geo.attributes.uv,norm=geo.attributes.normal;
    const triCount=pos.count/3;const B=D.CHAR_BOXES;const buckets=B.map(()=>[]);
    for(let t=0;t<triCount;t++){
      const cx=(pos.getX(t*3)+pos.getX(t*3+1)+pos.getX(t*3+2))/3;
      const cz=(pos.getZ(t*3)+pos.getZ(t*3+1)+pos.getZ(t*3+2))/3;
      for(let b=0;b<B.length;b++){const bb=B[b];
        if(cx>=bb.x[0]&&cx<=bb.x[1]&&cz>=bb.z[0]&&cz<=bb.z[1]){buckets[b].push(t);break;}}
    }
    W.charProtos=buckets.map(tris=>{
      if(tris.length<60)return null;
      const g2=new THREE.BufferGeometry();
      const p=new Float32Array(tris.length*9),u=new Float32Array(tris.length*6),n=new Float32Array(tris.length*9);
      tris.forEach((t,i)=>{for(let k=0;k<3;k++){
        p[i*9+k*3]=pos.getX(t*3+k);p[i*9+k*3+1]=pos.getY(t*3+k);p[i*9+k*3+2]=pos.getZ(t*3+k);
        n[i*9+k*3]=norm.getX(t*3+k);n[i*9+k*3+1]=norm.getY(t*3+k);n[i*9+k*3+2]=norm.getZ(t*3+k);
        u[i*6+k*2]=uv.getX(t*3+k);u[i*6+k*2+1]=uv.getY(t*3+k);}});
      g2.setAttribute('position',new THREE.BufferAttribute(p,3));
      g2.setAttribute('normal',new THREE.BufferAttribute(n,3));
      g2.setAttribute('uv',new THREE.BufferAttribute(u,2));
      // normalizacja: środek XZ do 0, podłoga do 0, wysokość do 1
      g2.computeBoundingBox();const bb=g2.boundingBox;
      const h=bb.max.y-bb.min.y||1;
      const ox=(bb.min.x+bb.max.x)/2, oz=(bb.min.z+bb.max.z)/2, oy=bb.min.y;
      const arr=g2.attributes.position;
      for(let i=0;i<arr.count;i++){arr.setX(i,(arr.getX(i)-ox)/h);arr.setY(i,(arr.getY(i)-oy)/h);arr.setZ(i,(arr.getZ(i)-oz)/h);}
      arr.needsUpdate=true;g2.computeBoundingBox();
      return {geo:g2,mat:src.material};
    });
    cb();
  },undefined,()=>{W.charProtos=[];cb();});
};
W.makeChar=function(idx,height){
  if(!W.charProtos)return null;const pr=W.charProtos[idx];if(!pr)return null;
  const m=new THREE.Mesh(pr.geo,pr.mat);m.rotation.y=W.CHAR_YAW;
  const g=new THREE.Group();g.add(m);g.scale.setScalar(height||1.65);
  return g;
};
W.charForFaction=function(fac,tier,hero){
  const fc=D.FAC_CHARS&&D.FAC_CHARS[fac];if(!fc)return null;
  const idx=hero?fc.hero:fc.list[(Math.random()*fc.list.length)|0];
  const h=(hero?1.7:1.35+tier*0.16);
  return W.makeChar(idx,h);
};

// ---------- WIOSKA GLB: siatka wysokości + kolizje ----------
W.grid=null; // {min, cell, n, walk:Float32Array, block:Uint8Array}
W.walkY=function(x,z){
  const G=W.grid;if(!G)return 0;
  const gx=(x-G.min)/G.cell, gz=(z-G.min)/G.cell;
  const ix=Math.floor(gx), iz=Math.floor(gz);
  if(ix<0||iz<0||ix>=G.n-1||iz>=G.n-1)return 0;
  const fx=gx-ix, fz=gz-iz;
  const h00=G.walk[iz*G.n+ix],h10=G.walk[iz*G.n+ix+1],h01=G.walk[(iz+1)*G.n+ix],h11=G.walk[(iz+1)*G.n+ix+1];
  return h00*(1-fx)*(1-fz)+h10*fx*(1-fz)+h01*(1-fx)*fz+h11*fx*fz;
};
W.blockedAt=function(x,z){
  const G=W.grid;if(!G)return false;
  const ix=Math.round((x-G.min)/G.cell), iz=Math.round((z-G.min)/G.cell);
  if(ix<0||iz<0||ix>=G.n||iz>=G.n)return true;
  return G.block[iz*G.n+ix]===1;
};
W.findSpawn=function(nx,nz){
  const G=W.grid;if(!G)return {x:nx,z:nz};
  const ix0=Math.round((nx-G.min)/G.cell), iz0=Math.round((nz-G.min)/G.cell);
  const free=(ix,iz)=>{if(ix<1||iz<1||ix>=G.n-1||iz>=G.n-1)return false;
    for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(G.block[(iz+dz)*G.n+(ix+dx)])return false;}return true;};
  for(let r=0;r<40;r++){
    for(let a=0;a<Math.max(8,r*6);a++){
      const ang=a/Math.max(8,r*6)*6.283;
      const ix=ix0+Math.round(Math.cos(ang)*r), iz=iz0+Math.round(Math.sin(ang)*r);
      if(free(ix,iz))return {x:G.min+ix*G.cell,z:G.min+iz*G.cell};
    }
  }
  return {x:nx,z:nz};
};
W.buildHeightGrid=function(model,extent){
  const n=96, cell=extent*2/n, min=-extent;
  const hMin=new Float32Array(n*n).fill(1e9), hMax=new Float32Array(n*n).fill(-1e9);
  model.updateMatrixWorld(true);
  const v=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
  model.traverse(o=>{
    if(!o.isMesh)return;
    const geo=o.geometry;const pos=geo.attributes.position;const idx=geo.index;
    const mw=o.matrixWorld;
    const triN=idx?idx.count/3:pos.count/3;
    for(let t=0;t<triN;t++){
      for(let k=0;k<3;k++){const vi=idx?idx.getX(t*3+k):(t*3+k);v[k].fromBufferAttribute(pos,vi).applyMatrix4(mw);}
      const tminY=Math.min(v[0].y,v[1].y,v[2].y), tmaxY=Math.max(v[0].y,v[1].y,v[2].y);
      const x0=Math.max(0,Math.floor((Math.min(v[0].x,v[1].x,v[2].x)-min)/cell));
      const x1=Math.min(n-1,Math.floor((Math.max(v[0].x,v[1].x,v[2].x)-min)/cell));
      const z0=Math.max(0,Math.floor((Math.min(v[0].z,v[1].z,v[2].z)-min)/cell));
      const z1=Math.min(n-1,Math.floor((Math.max(v[0].z,v[1].z,v[2].z)-min)/cell));
      for(let iz=z0;iz<=z1;iz++)for(let ix=x0;ix<=x1;ix++){
        const q=iz*n+ix;
        if(tminY<hMin[q])hMin[q]=tminY; if(tmaxY>hMax[q])hMax[q]=tmaxY;
      }
    }
  });
  const walk=new Float32Array(n*n), block=new Uint8Array(n*n);
  for(let q=0;q<n*n;q++){
    if(hMin[q]>1e8){walk[q]=0;block[q]=1;continue;}
    walk[q]=hMin[q];
    block[q]=(hMax[q]-hMin[q]>2.6)?1:0;
  }
  // wygładź walk (1 pass box blur) i dopisz blokady stromizn
  const w2=new Float32Array(walk);
  for(let z=1;z<n-1;z++)for(let x=1;x<n-1;x++){
    const q=z*n+x;w2[q]=(walk[q]*2+walk[q-1]+walk[q+1]+walk[q-n]+walk[q+n])/6;
  }
  for(let z=1;z<n-1;z++)for(let x=1;x<n-1;x++){
    const q=z*n+x;
    const mx=Math.max(Math.abs(w2[q]-w2[q-1]),Math.abs(w2[q]-w2[q+1]),Math.abs(w2[q]-w2[q-n]),Math.abs(w2[q]-w2[q+n]));
    if(mx>1.15)block[q]=1;
  }
  W.grid={min:min,cell:cell,n:n,walk:w2,block:block};
};

// ---------- budowa regionu ----------
W.current=null;          // grupa aktualnego regionu
W.colliders=[];          // {x,z,r} przeszkody
W.interactables=[];      // {x,z,r,label,action,icon}
W.regionSize=84;

W.clearRegion=function(){
  if(W.current){W.scene.remove(W.current);
    W.current.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose&&m.dispose());}});}
  W.current=null;W.colliders=[];W.interactables=[];
};

W.addSkyDome=function(g,topCol,botCol){
  const geo=new THREE.SphereGeometry(160,24,16);
  const mat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
    uniforms:{top:{value:new THREE.Color(topCol)},bot:{value:new THREE.Color(botCol)}},
    vertexShader:'varying float vy;void main(){vy=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec3 top;uniform vec3 bot;varying float vy;void main(){gl_FragColor=vec4(mix(bot,top,clamp(vy*1.4+0.35,0.0,1.0)),1.0);}'});
  const m=new THREE.Mesh(geo,mat);g.add(m);
};
W.groundPlane=function(g,def,half){
  const geo=new THREE.PlaneGeometry(half*3,half*3,72,72);
  geo.rotateX(-Math.PI/2);
  if(W.terrainAmp>0){const pos=geo.attributes.position;
    for(let i=0;i<pos.count;i++){pos.setY(i,W.terrainY(pos.getX(i),pos.getZ(i)));}
    pos.needsUpdate=true;geo.computeVertexNormals();}
  const m=new THREE.Mesh(geo,W.mat(def.ground,{rough:0.95}));
  g.add(m);
  // siatka subtelna
  const grid=new THREE.GridHelper(half*2.4,Math.floor(half/1.5),0x3a2a55,0x18102a);
  grid.material.transparent=true;grid.material.opacity=0.16;grid.position.y=0.01;g.add(grid);
  return m;
};

W.addTree=function(g,x,z,col,h){
  h=h||D.rnd(2.4,4.2);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.22,h*0.5,6),W.mat(0x2a1c14,{rough:1}));
  const ty=W.terrainY(x,z);trunk.position.set(x,ty+h*0.25,z);g.add(trunk);
  const crown=new THREE.Mesh(new THREE.ConeGeometry(D.rnd(0.8,1.3),h*0.8,7),W.mat(col,{rough:0.95,flat:true}));
  crown.position.set(x,(typeof ty!=='undefined'?ty:0)+h*0.5+h*0.35,z);crown.rotation.y=Math.random()*3;g.add(crown);
  W.colliders.push({x:x,z:z,r:0.5});
};
W.addRock=function(g,x,z,s,col){
  s=s||D.rnd(0.5,1.6);
  const r=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),W.mat(col||0x4a4456,{rough:0.9,flat:true}));
  r.position.set(x,W.terrainY(x,z)+s*0.5,z);r.rotation.set(Math.random(),Math.random()*3,Math.random());g.add(r);
  W.colliders.push({x:x,z:z,r:s*0.8});
};
W.addCrystal=function(g,x,z,col){
  const c=new THREE.Mesh(new THREE.ConeGeometry(D.rnd(0.2,0.4),D.rnd(0.8,1.7),5),W.glow(col,1.4));
  c.position.set(x,W.terrainY(x,z)+0.4,z);c.rotation.z=D.rnd(-0.25,0.25);g.add(c);
};
W.addRuinPillar=function(g,x,z){
  const h=D.rnd(1.5,3.5);
  const p=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.42,h,8),W.mat(0x3a3648,{rough:0.9,flat:true}));
  p.position.set(x,W.terrainY(x,z)+h/2,z);p.rotation.z=D.rnd(-0.12,0.12);g.add(p);
  W.colliders.push({x:x,z:z,r:0.6});
};
W.addEmberVent=function(g,x,z){
  const v=new THREE.Mesh(new THREE.CircleGeometry(D.rnd(0.5,1.1),12),W.glow(0xff5a1c,1.2));
  v.rotation.x=-Math.PI/2;v.position.set(x,W.terrainY(x,z)+0.05,z);g.add(v);
};

// budynek wioski
W.addBuilding=function(g,x,z,w,d,h,col,roofCol,label,icon,action){
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),W.mat(col,{rough:0.85}));
  body.position.set(x,h/2,z);g.add(body);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*0.78,h*0.7,4),W.mat(roofCol,{rough:0.9,flat:true}));
  roof.position.set(x,h+h*0.34,z);roof.rotation.y=Math.PI/4;g.add(roof);
  const door=new THREE.Mesh(new THREE.BoxGeometry(w*0.24,h*0.5,0.08),W.mat(0x1a1026,{rough:1}));
  door.position.set(x,h*0.25,z+d/2+0.05);g.add(door);
  W.colliders.push({x:x,z:z,r:Math.max(w,d)*0.62});
  if(label){
    // świecący szyld
    const sign=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.5,0.08),W.glow(0xffd56b,0.8));
    sign.position.set(x,h+0.2,z+d/2+0.1);g.add(sign);
    W.interactables.push({x:x,z:z+d/2+1.4,r:2.2,label:label,icon:icon,action:action});
  }
};

W.addPortal=function(g,x,z,col,label,action,big){
  const r=big?2.2:1.35;
  if(W.grid){const sp=W.findSpawn(x,z);x=sp.x;z=sp.z;}
  const gy=W.grid?W.walkY(x,z):0;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(r,0.1,10,36),W.glow(col,2));
  ring.position.set(x,gy+r+0.4,z);g.add(ring);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(r*0.88,28),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.24,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
  disc.position.copy(ring.position);g.add(disc);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(r*0.8,r*1.0,0.28,10),W.mat(0x241a3e,{rough:0.7,met:0.3}));
  base.position.set(x,gy+0.14,z);g.add(base);
  const fr=new THREE.Mesh(new THREE.RingGeometry(r*0.7,r*1.25,36),W.ringMat(col,0.5));
  fr.rotation.x=-Math.PI/2;fr.position.set(x,gy+0.3,z);g.add(fr);
  ring.userData.spin=0.6; fr.userData.spin=-0.3;
  W.interactables.push({x:x,z:z,r:2.6,label:label,icon:'🌀',action:action});
};

W.addNPC=function(g,x,z,col,icon,name,action){
  const grp=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.32,0.7,4,10),W.mat(col,{rough:0.8}));
  body.position.y=0.85;grp.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.24,12,12),W.mat(0xd8c2a8,{rough:0.7}));
  head.position.y=1.62;grp.add(head);
  const hat=new THREE.Mesh(new THREE.ConeGeometry(0.3,0.5,8),W.mat(col,{rough:0.9}));
  hat.position.y=1.95;grp.add(hat);
  grp.position.set(x,0,z);g.add(grp);
  grp.userData.bob=Math.random()*6;
  W.colliders.push({x:x,z:z,r:0.6});
  W.interactables.push({x:x,z:z,r:2.2,label:name,icon:icon,action:action});
  return grp;
};

W.addCampfire=function(g,x,z){
  const logs=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.6,0.22,8),W.mat(0x2a1c12,{rough:1}));
  logs.position.set(x,0.11,z);g.add(logs);
  const fl=new THREE.Mesh(new THREE.ConeGeometry(0.3,0.9,7),W.glow(0xff7a2b,2.4));
  fl.position.set(x,0.6,z);fl.userData.flick=true;g.add(fl);
  const l=new THREE.PointLight(0xff8a3c,1.6,9,2);l.position.set(x,1.2,z);g.add(l);
};

// pyłki/cząsteczki regionu
W.addAmbientParticles=function(g,col,count,area,hmax){
  const n=count||120;const pos=new Float32Array(n*3);const sp=new Float32Array(n);
  for(let i=0;i<n;i++){pos[i*3]=D.rnd(-area,area);pos[i*3+1]=D.rnd(0.2,hmax||6);pos[i*3+2]=D.rnd(-area,area);sp[i]=D.rnd(0.06,0.3);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const m=new THREE.PointsMaterial({color:col,size:0.14,map:W.dotTex,transparent:true,opacity:0.7,blending:THREE.AdditiveBlending,depthWrite:false});
  const pts=new THREE.Points(geo,m);pts.userData={sp:sp,h:hmax||6,area:area};pts.userData.ambient=true;g.add(pts);
};

// ---------- WIOSKA ----------
W.buildVillage=function(g){
  const def=D.REGIONS.wioska;
  W.groundPlane(g,def,30);
  // rynek — plac centralny
  const plaza=new THREE.Mesh(new THREE.CircleGeometry(7,32),W.mat(0x241f16,{rough:0.95}));
  plaza.rotation.x=-Math.PI/2;plaza.position.y=0.02;g.add(plaza);
  const fountain=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.7,0.7,14),W.mat(0x5a5468,{rough:0.6,met:0.2}));
  fountain.position.set(0,0.35,0);g.add(fountain);
  const water=new THREE.Mesh(new THREE.CircleGeometry(1.15,20),W.glow(0x4aa3ff,0.7));
  water.rotation.x=-Math.PI/2;water.position.set(0,0.72,0);g.add(water);
  W.colliders.push({x:0,z:0,r:2});
  // budynki — usługi
  W.addBuilding(g,-9,-6, 4,3.4,2.6, 0x4a3a2a,0x6a2a1a,'Sklep','🛒',()=>UI.openPanel('sklep'));
  W.addBuilding(g, 9,-6, 4,3.6,2.8, 0x3a3f4a,0x22262e,'Kowal','⚒️',()=>UI.openPanel('kowal'));
  W.addBuilding(g,-10,4, 4,3.4,2.6, 0x3a2a4a,0x5a3a8a,'Runolog','🔮',()=>UI.openPanel('runolog'));
  W.addBuilding(g, 10,5, 4.6,3.8,2.7, 0x4a3222,0x2a1a10,'Tawerna','🍺',()=>UI.openPanel('tawerna'));
  W.addBuilding(g, 0,-12, 5,4,3.4, 0x3f3a52,0x6a5a9f,'Klan','👥',()=>UI.openPanel('klan'));
  W.addBuilding(g,-4,12, 3.4,3,2.4, 0x35404a,0x2a3038,'Magazyn','📦',()=>UI.openPanel('magazyn'));
  // świątynia — duża
  const tw=6;
  const temple=new THREE.Mesh(new THREE.CylinderGeometry(tw*0.55,tw*0.62,4.4,8),W.mat(0x2c2044,{rough:0.7,met:0.2}));
  temple.position.set(0,2.2,18);g.add(temple);
  const tdome=new THREE.Mesh(new THREE.SphereGeometry(tw*0.55,14,10,0,6.283,0,1.4),W.glow(0x9b59ff,0.5));
  tdome.position.set(0,4.4,18);g.add(tdome);
  const trune=new THREE.Mesh(new THREE.RingGeometry(2.6,4.4,40),W.ringMat(0x9b59ff,0.55));
  trune.rotation.x=-Math.PI/2;trune.position.set(0,0.05,14.4);trune.userData.spin=0.15;g.add(trune);
  W.colliders.push({x:0,z:18,r:4});
  W.interactables.push({x:0,z:13.6,r:2.6,label:'Świątynia Bogów',icon:'🔱',action:()=>UI.openPanel('swiatynia')});
  // tablica ogłoszeń
  const board=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.4,0.16),W.mat(0x4a3a22,{rough:1}));
  board.position.set(4.5,1.1,-2.5);g.add(board);
  const bpost=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,1.2,6),W.mat(0x2a1c12));bpost.position.set(4.5,0.5,-2.5);g.add(bpost);
  W.interactables.push({x:4.5,z:-1.6,r:2,label:'Tablica Ogłoszeń',icon:'📜',action:()=>UI.openPanel('tablica')});
  // NPC
  W.addNPC(g,-5,-2,0x6a4a2a,'🛒','Kupiec Bartuś',()=>UI.openPanel('sklep'));
  W.addNPC(g, 5, 2,0x3a3f4a,'⚒️','Kowal Gromir',()=>UI.openPanel('kowal'));
  W.addNPC(g,-6,6,0x5a3a8a,'🔮','Runolog Vex',()=>UI.openPanel('runolog'));
  W.addNPC(g, 2,8,0x8a2030,'🍺','Karczmarka Lila',()=>UI.openPanel('tawerna'));
  // ogniska + dekoracje
  W.addCampfire(g,-3,-8); W.addCampfire(g,7,10);
  for(let i=0;i<14;i++){const a=D.rnd(0,6.28),r=D.rnd(22,28);W.addTree(g,Math.cos(a)*r,Math.sin(a)*r,0x2a4a28);}
  // portale do regionów — łuk na południu
  const regs=['las_cieni','pustynia_pustki','gory_nocy','otchlan_bestii','ruiny_chaosu','krainy_popiolu','krolestwo_snow'];
  regs.forEach((rid,i)=>{
    const a=Math.PI*(0.62+0.09*i); // łuk
    const x=Math.cos(a)*24, z=Math.sin(a)*24*-1;
    const rd=D.REGIONS[rid]; const fc=rd.fac?D.FACTIONS[rd.fac].col:0x9b59ff;
    W.addPortal(g,x,z,fc,rd.icon+' '+rd.name+' (poz. '+rd.lvl[0]+'–'+rd.lvl[1]+')',()=>Game.travel(rid));
  });
  // portale specjalne
  W.addPortal(g,-24,14,0x6a4a9f,'🔱 Wymiar Bogów (tylko bóg)',()=>Game.travel('wymiar_bogow'),true);
  W.addPortal(g, 24,14,0xff2a3c,'🔥 Piekielna Otchłań (poz. 50+)',()=>Game.travel('piekielna_otchlan'),true);
  W.addAmbientParticles(g,0xffd56b,60,26,5);
};

// ---------- REGIONY BOJOWE ----------
W.buildCombatRegion=function(g,def){
  const half=W.regionSize/2;
  const hilly={gory_nocy:2.6,otchlan_bestii:1.4,krainy_popiolu:1.6,pustynia_pustki:1.1,las_cieni:0.8,ruiny_chaosu:0.9,krolestwo_snow:1.2,wymiar_bogow:1.5,piekielna_otchlan:1.8};
  W.terrainAmp=hilly[def.id]||1.0;
  W.groundPlane(g,def,half);
  W.addSkyDome(g,def.amb,def.fog);
  // pierścień gór na granicy
  for(let i=0;i<26;i++){const a=i/26*6.283+((i%3)*0.07);
    const rr=half+D.rnd(4,10);const x=Math.cos(a)*rr,z=Math.sin(a)*rr;
    const h=D.rnd(6,14);
    const mt=new THREE.Mesh(new THREE.ConeGeometry(D.rnd(3,6),h,6),W.mat(def.ground,{rough:1,flat:true}));
    mt.position.set(x,h*0.4+W.terrainY(x,z),z);mt.rotation.y=Math.random()*3;g.add(mt);
  }
  const fc=def.fac?D.FACTIONS[def.fac].col:0x9b59ff;
  // props wg typu
  const P=def.props;
  const count=42;
  for(let i=0;i<count;i++){
    const x=D.rnd(-half,half), z=D.rnd(-half,half);
    if(Math.hypot(x,z)<7) continue; // spawn wolny
    if(P==='trees') W.addTree(g,x,z,D.chance(0.7)?0x14282e:0x1c3a2a);
    else if(P==='rocks'){ D.chance(0.6)?W.addRock(g,x,z,D.rnd(0.5,1.4),0x5a4a34):W.addCrystal(g,x,z,fc); }
    else if(P==='peaks'){ W.addRock(g,x,z,D.rnd(0.9,2.4),0x3a3f4e); }
    else if(P==='bones'){ D.chance(0.5)?W.addRock(g,x,z,D.rnd(0.6,1.5),0x6a5a44):W.addTree(g,x,z,0x4a3a20,D.rnd(1.8,3)); }
    else if(P==='ruins'){ D.chance(0.55)?W.addRuinPillar(g,x,z):W.addRock(g,x,z,D.rnd(0.4,1),0x2c3a38); }
    else if(P==='embers'){ D.chance(0.4)?W.addEmberVent(g,x,z):W.addRock(g,x,z,D.rnd(0.5,1.3),0x3a241c); }
    else if(P==='dream'){ D.chance(0.5)?W.addCrystal(g,x,z,fc):W.addTree(g,x,z,0x3a2a5f,D.rnd(2,3.6)); }
    else if(P==='divine'){ D.chance(0.5)?W.addCrystal(g,x,z,0xffd56b):W.addRuinPillar(g,x,z); }
    else if(P==='hell'){ D.chance(0.45)?W.addEmberVent(g,x,z):W.addRock(g,x,z,D.rnd(0.6,1.8),0x3a1216); }
    else W.addRock(g,x,z);
  }
  // węzły surowców (interakcja zbierania)
  const resList=def.res||[];
  for(let i=0;i<6;i++){
    const x=D.rnd(-half*0.8,half*0.8), z=D.rnd(-half*0.8,half*0.8);
    if(Math.hypot(x,z)<8) continue;
    const node=new THREE.Mesh(new THREE.IcosahedronGeometry(0.42,0),W.glow(fc,1.5));
    node.position.set(x,0.42,z);node.userData.bobber=true;g.add(node);
    const rn=D.pick(resList.length?resList:['Kamień']);
    W.interactables.push({x:x,z:z,r:2,label:'Zbierz: '+rn,icon:'⛏️',action:(self)=>{Game.collectResource(rn,node,self);},once:true,node:node});
  }
  // portal powrotny
  W.addPortal(g,0,-half+4,0x7dffc7,'🏠 Powrót do Wioski',()=>Game.travel('wioska'));
  // mgła i cząsteczki
  W.addAmbientParticles(g,fc,140,half*0.9,7);
  // światło regionu
  W.hemi.color.setHex(def.amb); W.scene.fog.color.setHex(def.fog); W.scene.background=new THREE.Color(def.fog);
};

// ---------- WIOSKA Z MODELU GLB ----------
W.buildVillageGLB=function(g){
  const def=D.REGIONS.wioska;
  W.terrainAmp=0;
  W.addSkyDome(g,0x2a2444,0x08060e);
  // podkład
  const under=new THREE.Mesh(new THREE.CircleGeometry(80,48),W.mat(0x0a0f0a,{rough:1}));
  under.rotation.x=-Math.PI/2;under.position.y=-0.25;g.add(under);
  const uri=(window.GLB_MODELS||{}).village;
  const EXT=34; // promień świata wioski
  if(uri&&THREE.GLTFLoader){
    new THREE.GLTFLoader().load(uri,(vg)=>{
      const model=vg.scene;
      const box=new THREE.Box3().setFromObject(model);const size=new THREE.Vector3();box.getSize(size);
      const sc=(EXT*2)/Math.max(size.x,size.z);
      model.scale.setScalar(sc);
      box.setFromObject(model);const ctr=new THREE.Vector3();box.getCenter(ctr);
      model.position.x-=ctr.x;model.position.z-=ctr.z;model.position.y-=box.min.y+ (size.y*sc)*0.02;
      model.traverse(o=>{if(o.isMesh){o.material.envMapIntensity=0.15;}});
      g.add(model);
      W.buildHeightGrid(model,EXT+2);
      W.villageSpawn=W.findSpawn(0,3);
      W._villageDecor(g);
      if(Game.player&&Game.regionId==='wioska'){const P=Game.player;
        P.pos.x=W.villageSpawn.x;P.pos.z=W.villageSpawn.z;P.pos.y=W.walkY(P.pos.x,P.pos.z);
        W.camTarget.set(P.pos.x,P.pos.y,P.pos.z);}
    });
  }
};
W._villageDecor=function(g){
  W.villagers=[];
  W.addVillagers(g);
  // znaczniki usług — świecące beacon'y wokół placu
  const services=[
    ['Sklep','🛒',0x4aa3ff,()=>UI.openPanel('sklep')],
    ['Kowal','⚒️',0xff7a2b,()=>UI.openPanel('kowal')],
    ['Runolog','🔮',0x9b59ff,()=>UI.openPanel('runolog')],
    ['Tawerna','🍺',0xffb13b,()=>UI.openPanel('tawerna')],
    ['Klan','👥',0x7dffc7,()=>UI.openPanel('klan')],
    ['Magazyn','📦',0xb8a8dc,()=>UI.openPanel('magazyn')],
    ['Tablica Ogłoszeń','📜',0xffd56b,()=>UI.openPanel('tablica')],
  ];
  services.forEach((sv,i)=>{
    const a=(i/services.length)*Math.PI*2+0.35;
    const x=Math.cos(a)*10.5, z=Math.sin(a)*10.5;
    W.addBeacon(g,x,z,sv[2],sv[0],sv[1],sv[3]);
  });
  // Świątynia — wielki beacon przy wzgórzu (zachód)
  W.addBeacon(g,-16,-6,0x9b59ff,'Świątynia Bogów','🔱',()=>UI.openPanel('swiatynia'),1.6);
  // portale — południowy łuk
  const regs=['las_cieni','pustynia_pustki','gory_nocy','otchlan_bestii','ruiny_chaosu','krainy_popiolu','krolestwo_snow'];
  regs.forEach((rid,i)=>{
    const a=Math.PI*(0.66+0.078*i);
    const x=Math.cos(a)*23, z=-Math.sin(a)*23;
    const rd=D.REGIONS[rid];const fc=rd.fac?D.FACTIONS[rd.fac].col:0x9b59ff;
    W.addPortal(g,x,z,fc,rd.icon+' '+rd.name+' (poz. '+rd.lvl[0]+'–'+rd.lvl[1]+')',()=>Game.travel(rid));
  });
  W.addPortal(g,-26,12,0x6a4a9f,'🔱 Wymiar Bogów (tylko bóg)',()=>Game.travel('wymiar_bogow'),true);
  W.addPortal(g, 26,12,0xff2a3c,'🔥 Piekielna Otchłań (poz. 50+)',()=>Game.travel('piekielna_otchlan'),true);
  // świetliki + klimat
  W.addAmbientParticles(g,0xffd56b,90,30,6);
  W.addAmbientParticles(g,0x9b59ff,50,26,8);
};
W.addBeacon=function(g,x,z,col,label,icon,action,scale){
  scale=scale||1;
  if(W.grid){const sp=W.findSpawn(x,z);x=sp.x;z=sp.z;}
  const gy=W.grid?W.walkY(x,z):0;
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.12*scale,0.3*scale,7*scale,8,1,true),
    new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.24,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  beam.position.set(x,gy+3.5*scale,z);g.add(beam);
  const orb=new THREE.Mesh(new THREE.SphereGeometry(0.3*scale,12,12),W.glow(col,2.2));
  orb.position.set(x,gy+1.6*scale,z);orb.userData.beaconBob=Math.random()*6;g.add(orb);
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.7*scale,1.05*scale,32),W.ringMat(col,0.55));
  ring.rotation.x=-Math.PI/2;ring.position.set(x,gy+0.12,z);ring.userData.spin=0.4;g.add(ring);
  W.interactables.push({x:x,z:z,r:2.6*scale,label:label,icon:icon,action:action,beaconY:orb});
};


// mieszkańcy wioski — wędrują i gadają
W.villagers=[];
W.addVillagers=function(g){
  const lines=['Piękny wieczór, prawda?','Słyszałeś o demonach na południu?','Bogowie patrzą na nas z góry...','Kupiec Bartuś zawyża ceny!','Ostatnio widziałem cień na murach...','Runolog Vex znów coś wybuchł w pracowni.','Strzeż się nocą poza murami.','Mówią, że śmiertelnik może zostać bogiem...'];
  const names=['Mieszkaniec Jarek','Mieszkanka Wanda','Strażnik Borys','Dziewczyna Ola','Starzec Miron','Handlarka Zofia'];
  for(let i=0;i<6;i++){
    const sp=W.findSpawn(D.rnd(-14,14),D.rnd(-10,16));
    const cols=[0x6a4a2a,0x3a4a5f,0x5f3a4a,0x4a5f3a];
    const grp=new THREE.Group();
    const model=E.buildHumanoid(D.pick(cols),0x2a2030,1,0.92);
    grp.add(model);grp.position.set(sp.x,W.walkY(sp.x,sp.z),sp.z);
    g.add(grp);
    const name=names[i%names.length];
    W.villagers.push({grp:grp,model:model,t:D.rnd(1,4),dir:D.rnd(0,6.283),moving:false,speed:1.1});
    W.interactables.push({x:sp.x,z:sp.z,r:2,label:name,icon:'💬',action:()=>{UI.dialog(name,D.pick(lines),[{t:'Do widzenia',fn:()=>UI.closeDialog()}]);},npcRef:W.villagers[W.villagers.length-1]});
  }
};
W.updateVillagers=function(dt,t){
  for(const v of W.villagers){
    if(!v.grp.parent)continue;
    v.t-=dt;
    if(v.t<=0){v.t=D.rnd(2,6);v.moving=D.chance(0.6);v.dir=D.rnd(0,6.283);}
    if(v.moving){
      const nx=v.grp.position.x+Math.sin(v.dir)*v.speed*dt, nz=v.grp.position.z+Math.cos(v.dir)*v.speed*dt;
      if(!W.blockedAt(nx,nz)&&Math.hypot(nx,nz)<26){v.grp.position.x=nx;v.grp.position.z=nz;v.grp.rotation.y=v.dir;
        v.grp.position.y=W.walkY(nx,nz);
        // aktualizuj pozycję interakcji
        for(const it of W.interactables){if(it.npcRef===v){it.x=nx;it.z=nz;}}
      } else v.t=0.3;
      v.model.position.y=Math.abs(Math.sin(t*6))*0.05;
    }
  }
};
W.buildRegion=function(id){
  W.clearRegion();
  const def=D.REGIONS[id];
  const g=new THREE.Group(); W.current=g; W.scene.add(g);
  W.grid=null;
  if(id==='wioska'){
    W.hemi.color.setHex(0x565078); W.hemi.intensity=0.62; W.sun.intensity=0.85; W.scene.fog.color.setHex(0x08060e); W.scene.background=new THREE.Color(0x08060e);
    W.scene.fog.density=0.02; W.camPitch=1.02; W.camDist=17;
    W.buildVillageGLB(g);
  } else {
    W.hemi.intensity=0.3; W.sun.intensity=0.4; W.camPitch=0.9; W.camDist=16;
    W.scene.fog.density=0.042;
    W.buildCombatRegion(g,def);
  }
  return g;
};

// kolizje — proste odpychanie
W.collide=function(pos,r){
  if(W.grid){
    // nic — blokady per-ruch w Game (slide)
  }
  for(const c of W.colliders){
    const dx=pos.x-c.x, dz=pos.z-c.z; const d=Math.hypot(dx,dz); const min=r+c.r;
    if(d<min&&d>0.001){ pos.x=c.x+dx/d*min; pos.z=c.z+dz/d*min; }
  }
  const lim=(Game.regionId==='wioska')?28:(W.regionSize/2+6);
  const dd=Math.hypot(pos.x,pos.z); if(dd>lim){pos.x*=lim/dd;pos.z*=lim/dd;}
};

// animacje sceny (spin/bob/flicker)
W.animateScene=function(t,dt){
  if(!W.current)return;
  W.current.traverse(o=>{
    const u=o.userData;
    if(u.spin) o.rotation.z!==undefined && (o.rotation.z+=dt*u.spin);
    if(u.bob!==undefined){o.position.y=Math.sin(t*1.4+u.bob)*0.06;}
    if(u.bobber){o.position.y=0.42+Math.sin(t*2+o.position.x)*0.12;o.rotation.y+=dt;}
    if(u.beaconBob!==undefined){o.position.y+=Math.sin(t*2+u.beaconBob)*0.01;}
    if(u.flick){o.scale.setScalar(1+Math.sin(t*11+o.position.x*3)*0.14);}
    if(u.ambient){
      const pos=o.geometry.attributes.position;const sp=u.sp;
      for(let i=0;i<sp.length;i++){let y=pos.getY(i)+sp[i]*dt;if(y>u.h)y=0.1;pos.setY(i,y);}
      pos.needsUpdate=true;
    }
  });
};
