// ================= JEDNOSTKI =================
"use strict";
const E = {};
E.enemies=[]; E.allies=[]; E.pickups=[];

// ---------- budowa modelu humanoida (proceduralny, kolor frakcji) ----------
E.buildHumanoid=function(col,col2,tier,scale){
  const g=new THREE.Group(); scale=scale||1;
  const robe=new THREE.Mesh(new THREE.ConeGeometry(0.42,1.1,8,1),W.mat(col2,{rough:0.9,flat:true}));
  robe.position.y=0.55;g.add(robe);
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(0.26,0.34,4,8),W.mat(col,{rough:0.8}));
  torso.position.y=1.28;g.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.2,10,10),W.mat(col,{rough:0.75}));
  head.position.y=1.78;g.add(head);
  const eL=new THREE.Mesh(new THREE.SphereGeometry(0.035,6,6),W.glow(0xffffff,2));eL.position.set(0.07,1.8,0.16);g.add(eL);
  const eR=eL.clone();eR.position.x=-0.07;g.add(eR);
  const aL=new THREE.Mesh(new THREE.CapsuleGeometry(0.07,0.4,4,6),W.mat(col,{rough:0.85}));
  aL.position.set(0.34,1.24,0);aL.rotation.z=0.5;g.add(aL);
  const aR=aL.clone();aR.position.x=-0.34;aR.rotation.z=-0.5;g.add(aR);
  if(tier>=2){const sh=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.26,5),W.glow(col,1.2));sh.position.set(0.32,1.56,0);g.add(sh);
    const sh2=sh.clone();sh2.position.x=-0.32;g.add(sh2);}
  if(tier>=3){const halo=new THREE.Mesh(new THREE.TorusGeometry(0.26,0.02,6,20),W.glow(col,2));halo.position.y=2.06;halo.rotation.x=Math.PI/2;g.add(halo);}
  if(tier>=4){const crown=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.3,5),W.glow(0xffd56b,2.2));crown.position.y=2.1;g.add(crown);}
  g.scale.setScalar(scale*(0.85+tier*0.09));
  return g;
};
E.buildBeastModel=function(col,tier,scale){
  const g=new THREE.Group();scale=scale||1;
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.42,10,8),W.mat(col,{rough:0.8,flat:true}));
  body.scale.set(1,0.8,1.5);body.position.y=0.55;g.add(body);
  const head=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.5,7),W.mat(col,{rough:0.8,flat:true}));
  head.position.set(0,0.75,-0.75);head.rotation.x=-Math.PI/2.1;g.add(head);
  const eL=new THREE.Mesh(new THREE.SphereGeometry(0.04,6,6),W.glow(0xff4444,3));eL.position.set(0.08,0.82,-0.9);g.add(eL);
  const eR=eL.clone();eR.position.x=-0.08;g.add(eR);
  [[0.25,-0.25],[-0.25,-0.25],[0.25,0.35],[-0.25,0.35]].forEach(p=>{
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(0.08,0.3,3,6),W.mat(col,{rough:0.85}));
    leg.position.set(p[0],0.25,p[1]);g.add(leg);});
  for(let i=0;i<3;i++){const sp=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.24,5),W.glow(col,1));
    sp.position.set(0,0.9-i*0.04,-0.3+i*0.3);g.add(sp);}
  if(tier>=3){const horn=new THREE.Mesh(new THREE.ConeGeometry(0.05,0.3,5),W.glow(0xffd56b,2));horn.position.set(0,1.0,-0.8);horn.rotation.x=-0.5;g.add(horn);}
  g.scale.setScalar(scale*(0.9+tier*0.14));
  return g;
};
E.buildDemonModel=function(tier,scale){
  const g=E.buildHumanoid(0x5a1018,0x2a060a,tier,scale);
  const hL=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.3,5),W.glow(0xff2a3c,2.4));hL.position.set(0.12,2.02,0);hL.rotation.z=0.5;g.add(hL);
  const hR=hL.clone();hR.position.x=-0.12;hR.rotation.z=-0.5;g.add(hR);
  g.traverse(o=>{if(o.material&&o.material.emissive&&o.material.emissiveIntensity===2)o.material=W.glow(0xff2a3c,3);});
  return g;
};

// pasek HP nad głową (sprite canvas)
E.makeHpBar=function(){
  const cv=document.createElement('canvas');cv.width=64;cv.height=10;
  const tex=new THREE.CanvasTexture(cv);
  const mat=new THREE.SpriteMaterial({map:tex,depthTest:false});
  const s=new THREE.Sprite(mat);s.scale.set(1.4,0.2,1);
  s.userData={cv:cv,tex:tex};
  return s;
};
E.updateHpBar=function(s,frac,col){
  const x=s.userData.cv.getContext('2d');
  x.clearRect(0,0,64,10);x.fillStyle='rgba(0,0,0,.65)';x.fillRect(0,0,64,10);
  x.fillStyle=col||'#e33';x.fillRect(1,1,62*Math.max(0,frac),8);
  s.userData.tex.needsUpdate=true;
};

// ---------- SPAWN WROGÓW ----------
E.clear=function(){
  for(const e of E.enemies) if(e.grp.parent) e.grp.parent.remove(e.grp);
  for(const a of E.allies) if(a.grp.parent) a.grp.parent.remove(a.grp);
  for(const p of E.pickups) if(p.m.parent) p.m.parent.remove(p.m);
  E.enemies=[];E.allies=[];E.pickups=[];
};

E.rollUnit=function(facId,regionLvl){
  const names=D.UNIT_NAMES[facId];
  // ważone tierami: dużo t1, mniej wyższych
  const r=Math.random(); let tier = r<0.55?1 : r<0.82?2 : r<0.96?3 : 4;
  const pool=names.filter(n=>n[1]===tier);
  const pickN=D.pick(pool);
  const tt = facId==='demony'? D.DEMON_TIER[tier] : D.TIER_STATS[tier];
  const lvl=D.rndi(regionLvl[0],regionLvl[1]);
  const lm=1+ (lvl-1)*0.09;
  return {name:pickN[0],tier:tier,lvl:lvl,fac:facId,
    hp:Math.round(D.rnd(tt.hp[0],tt.hp[1])*lm), dmg:Math.round(D.rnd(tt.dmg[0],tt.dmg[1])*lm),
    xp:Math.round(tt.xp*lm), gold:[Math.round(tt.gold[0]*lm),Math.round(tt.gold[1]*lm)]};
};

E.spawnEnemy=function(def,x,z,opts){
  opts=opts||{};
  const fac=D.FACTIONS[def.fac];
  let model;
  if(def.fac==='bestie'&&D.chance(0.6)) model=E.buildBeastModel(fac.col,def.tier,opts.scale);
  else if(def.fac==='demony') model=E.buildDemonModel(def.tier,opts.scale);
  else model=E.buildHumanoid(fac.col,fac.col2,def.tier,opts.scale);
  const grp=new THREE.Group();grp.add(model);grp.position.set(x,0,z);
  const bar=E.makeHpBar();bar.position.y=2.4*(opts.scale||1);grp.add(bar);E.updateHpBar(bar,1);
  W.current.add(grp);
  const e={grp:grp,model:model,bar:bar,def:def,hp:def.hp,maxHp:def.hp,
    state:'idle',aggro:8+def.tier*1.5,speed:2.6+def.tier*0.25+Math.random()*0.5,
    atkR:def.fac==='bestie'?1.9:(['cien','chaos','sen','pustka'].includes(def.fac)?7:1.7),
    atkCd:0, atkRate:1.6-def.tier*0.08, wanderT:0, home:{x:x,z:z},
    elite:def.tier>=3, boss:!!opts.boss, stun:0, slow:0, fear:0, dots:[], mark:0};
  if(opts.boss){e.aggro=50;grp.scale.setScalar(1.6);bar.visible=false;}
  E.enemies.push(e);
  return e;
};

E.populateRegion=function(id){
  const def=D.REGIONS[id]; if(def.safe) return;
  const half=W.regionSize/2;
  const mainFac=def.fac||'demony';
  const n = id==='piekielna_otchlan'?26 : id==='wymiar_bogow'?22 : 20;
  for(let i=0;i<n;i++){
    const a=D.rnd(0,6.283), r=D.rnd(10,half*0.95);
    const x=Math.cos(a)*r, z=Math.sin(a)*r;
    // 15% szans na wroga z innej wrogiej frakcji (poza demonami zawsze swoja + demony)
    let facId=mainFac;
    if(mainFac!=='demony'&&D.chance(0.18)) facId=D.chance(0.5)?'demony':D.pick(D.PLAYABLE.filter(f=>f!==mainFac&&f!==Game.state.faction));
    if(Sys.isAllied(facId)&&D.chance(0.7)) facId=mainFac; // sojusznicy rzadziej
    const u=E.rollUnit(facId,def.lvl);
    E.spawnEnemy(u,x,z);
  }
  // boss regionu (elitarny strażnik)
  if(!def.godOnly&&!def.finalBoss){
    const bu=E.rollUnit(mainFac,[def.lvl[1],def.lvl[1]+2]);bu.tier=4;bu.hp=Math.round(D.rnd(5000,15000)*(1+def.lvl[0]*0.04));bu.dmg=Math.round(D.rnd(200,500));
    bu.name='⭐ '+bu.name+' (Boss)';bu.xp*=6;bu.gold=[bu.gold[0]*8,bu.gold[1]*8];
    E.spawnEnemy(bu,0,half*0.7,{boss:true,scale:1.2});
  }
};

// ---------- AI ----------
E.updateEnemies=function(dt,t){
  const P=Game.player; if(!P)return;
  for(let i=E.enemies.length-1;i>=0;i--){
    const e=E.enemies[i];
    if(e.hp<=0){E.killEnemy(e,i);continue;}
    // dots
    for(let d=e.dots.length-1;d>=0;d--){const dot=e.dots[d];dot.t-=dt;dot.tick-=dt;
      if(dot.tick<=0){dot.tick=0.5;C.damageEnemy(e,dot.dps*0.5,false,true);}
      if(dot.t<=0)e.dots.splice(d,1);}
    if(e.stun>0){e.stun-=dt;continue;}
    const dx=P.pos.x-e.grp.position.x, dz=P.pos.z-e.grp.position.z;
    const dist=Math.hypot(dx,dz);
    const hostile = Sys.isHostileTo(e.def.fac);
    let sp=e.speed*(e.slow>0?0.45:1); if(e.slow>0)e.slow-=dt;
    if(e.fear>0){e.fear-=dt; // ucieczka
      e.grp.position.x-=dx/dist*sp*dt; e.grp.position.z-=dz/dist*sp*dt;
      e.grp.rotation.y=Math.atan2(-dx,-dz);
    } else if(hostile&&dist<e.aggro&&!P.dead&&!P.stealth){
      e.state='chase';
      if(dist>e.atkR*0.9){
        e.grp.position.x+=dx/dist*sp*dt; e.grp.position.z+=dz/dist*sp*dt;
      }
      e.grp.rotation.y=Math.atan2(dx,dz);
      e.atkCd-=dt;
      if(dist<=e.atkR&&e.atkCd<=0){
        e.atkCd=e.atkRate;
        if(e.atkR>3){ C.enemyProjectile(e,P); } else { C.enemyMelee(e,P); }
      }
    } else {
      e.state='idle'; e.wanderT-=dt;
      if(e.wanderT<=0){e.wanderT=D.rnd(2,5);e.wDir=D.rnd(0,6.283);e.wMove=D.chance(0.6);}
      if(e.wMove){
        e.grp.position.x+=Math.sin(e.wDir)*sp*0.3*dt; e.grp.position.z+=Math.cos(e.wDir)*sp*0.3*dt;
        const hd=Math.hypot(e.grp.position.x-e.home.x,e.grp.position.z-e.home.z);
        if(hd>10){e.wDir=Math.atan2(e.home.x-e.grp.position.x,e.home.z-e.grp.position.z);}
        e.grp.rotation.y=e.wDir;
      }
    }
    W.collide(e.grp.position,0.5);
    // bob animacja
    e.model.position.y=Math.abs(Math.sin(t*6+i))* (e.state==='chase'?0.09:0.03);
    // pasek HP do kamery
    if(!e.boss)E.updateHpBar(e.bar,e.hp/e.maxHp, e.elite?'#ffb13b':'#e33');
    else{const bd=Math.hypot(P.pos.x-e.grp.position.x,P.pos.z-e.grp.position.z);if(bd<32)UI.setBoss(e.def.name,e.hp/e.maxHp);else UI.hideBoss();}
  }
};

E.killEnemy=function(e,idx){
  // nagrody
  const g=D.rndi(e.def.gold[0],e.def.gold[1]);
  Sys.addGold(g); Sys.addXp(e.def.xp);
  Sys.onKill(e);
  C.deathBurst(e.grp.position, D.FACTIONS[e.def.fac].col);
  // dropy
  E.dropLoot(e);
  if(e.boss)UI.hideBoss();
  if(e.grp.parent)e.grp.parent.remove(e.grp);
  E.enemies.splice(idx,1);
};

E.dropLoot=function(e){
  const p=e.grp.position;
  const lvl=e.def.lvl;
  // runa
  const runeCh = e.boss?1.0 : e.elite?0.35 : 0.08;
  if(D.chance(runeCh)){
    const rar = e.boss? D.pick(['epic','mythic','legend']) : e.elite? D.pick(['rare','epic']) : D.pick(['common','common','rare']);
    const cat = D.FACTIONS[e.def.fac].runeCat;
    E.spawnPickup(p,'rune',D.makeRune(cat,rar));
  }
  // przedmiot
  const itCh = e.boss?1.0 : e.elite?0.3 : 0.1;
  if(D.chance(itCh)){
    const rar = e.boss? D.pick(['epic','mythic','legend']) : e.elite? D.pick(['rare','rare','epic']) : D.pick(['common','common','common','rare']);
    let it;
    if(e.boss&&D.chance(0.25)){ const u=D.pick(D.UNIQUES); it=Object.assign({uid:'u'+(Math.random()*1e9|0),up:0,aff:[]},u); it.price=4000; }
    else it=D.makeItem(D.pick(D.EQUIP_SLOTS),rar,lvl,e.def.fac);
    E.spawnPickup(p,'item',it);
  }
  // mikstura
  if(D.chance(0.12)) E.spawnPickup(p,'potion',Object.assign({},D.pick(D.POTIONS)));
  // surowiec regionu
  const reg=D.REGIONS[Game.regionId];
  if(reg.res&&D.chance(0.2)) E.spawnPickup(p,'res',{n:D.pick(reg.res)});
  if(reg.id==='wymiar_bogow'&&D.chance(0.3)) E.spawnPickup(p,'res',{n:D.pick(['Boska Esencja','Gwiezdny Metal'])});
};

E.spawnPickup=function(pos,type,data){
  const cols={rune:0x9b59ff,item:0xffd56b,potion:0xff6a8a,res:0x7dffc7,gold:0xffd56b};
  const m=new THREE.Mesh(
    type==='item'?new THREE.OctahedronGeometry(0.26,0):type==='rune'?new THREE.TetrahedronGeometry(0.3):new THREE.SphereGeometry(0.2,8,8),
    W.glow(data.rar?parseInt(D.RARITY[data.rar].col.slice(1),16):cols[type],1.8));
  m.position.set(pos.x+D.rnd(-0.7,0.7),0.5,pos.z+D.rnd(-0.7,0.7));
  W.current.add(m);
  E.pickups.push({m:m,type:type,data:data,t:0});
};

E.updatePickups=function(dt,t){
  const P=Game.player;if(!P)return;
  for(let i=E.pickups.length-1;i>=0;i--){
    const p=E.pickups[i];p.t+=dt;
    p.m.rotation.y+=dt*2;p.m.position.y=0.5+Math.sin(t*3+i)*0.12;
    const d=Math.hypot(P.pos.x-p.m.position.x,P.pos.z-p.m.position.z);
    if(d<1.6){ Sys.pickup(p); if(p.m.parent)p.m.parent.remove(p.m); E.pickups.splice(i,1); }
    else if(d<5){ // przyciąganie
      p.m.position.x+=(P.pos.x-p.m.position.x)*dt*3; p.m.position.z+=(P.pos.z-p.m.position.z)*dt*3;
    }
    if(p.t>90){if(p.m.parent)p.m.parent.remove(p.m);E.pickups.splice(i,1);}
  }
};

// ---------- SOJUSZNICY / PRZYWOŁAŃCY ----------
E.spawnAlly=function(name,dmg,dur,col){
  const model=E.buildHumanoid(col||0x9b59ff,0x241a3e,1,0.85);
  model.traverse(o=>{if(o.material&&o.material.opacity!==undefined){o.material.transparent=true;o.material.opacity=0.75;}});
  const grp=new THREE.Group();grp.add(model);
  const P=Game.player;grp.position.set(P.pos.x+D.rnd(-1.5,1.5),0,P.pos.z+D.rnd(-1.5,1.5));
  W.current.add(grp);
  const a={grp:grp,model:model,name:name,dmg:dmg,t:dur,atkCd:0,speed:4.5};
  E.allies.push(a);return a;
};
E.updateAllies=function(dt,t){
  const P=Game.player;if(!P)return;
  for(let i=E.allies.length-1;i>=0;i--){
    const a=E.allies[i];a.t-=dt;
    if(a.t<=0){C.deathBurst(a.grp.position,0x9b59ff);if(a.grp.parent)a.grp.parent.remove(a.grp);E.allies.splice(i,1);continue;}
    // znajdź cel
    let best=null,bd=12;
    for(const e of E.enemies){if(!Sys.isHostileTo(e.def.fac))continue;
      const d=Math.hypot(e.grp.position.x-a.grp.position.x,e.grp.position.z-a.grp.position.z);
      if(d<bd){bd=d;best=e;}}
    if(best){
      const dx=best.grp.position.x-a.grp.position.x,dz=best.grp.position.z-a.grp.position.z;const d=Math.hypot(dx,dz);
      if(d>1.6){a.grp.position.x+=dx/d*a.speed*dt;a.grp.position.z+=dz/d*a.speed*dt;}
      a.grp.rotation.y=Math.atan2(dx,dz);
      a.atkCd-=dt;
      if(d<=1.8&&a.atkCd<=0){a.atkCd=1.1;C.damageEnemy(best,a.dmg,false);}
    } else {
      // podążaj za graczem
      const dx=P.pos.x-a.grp.position.x,dz=P.pos.z-a.grp.position.z;const d=Math.hypot(dx,dz);
      if(d>2.5){a.grp.position.x+=dx/d*a.speed*dt;a.grp.position.z+=dz/d*a.speed*dt;a.grp.rotation.y=Math.atan2(dx,dz);}
    }
    a.model.position.y=Math.abs(Math.sin(t*7+i))*0.07;
  }
};
