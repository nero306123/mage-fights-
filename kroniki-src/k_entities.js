// ================= JEDNOSTKI =================
"use strict";
const E = {};
E.enemies=[]; E.allies=[]; E.pickups=[];

// ---------- budowa modelu humanoida (proceduralny, kolor frakcji) ----------
E.buildHumanoid=function(col,col2,tier,scale){
  const g=new THREE.Group(); scale=scale||1;
  // nogi
  [-0.12,0.12].forEach(lx=>{const leg=new THREE.Mesh(new THREE.CapsuleGeometry(0.075,0.42,4,7),W.mat(col2,{rough:0.9}));
    leg.position.set(lx,0.36,0);g.add(leg);});
  // tułów + pancerz
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(0.24,0.4,4,10),W.mat(col,{rough:0.75}));
  torso.position.y=0.95;g.add(torso);
  const belt=new THREE.Mesh(new THREE.TorusGeometry(0.24,0.03,6,16),W.mat(0x2a2030,{rough:0.6,met:0.3}));
  belt.position.y=0.74;belt.rotation.x=Math.PI/2;g.add(belt);
  // peleryna
  const cape=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.85,3,5),W.mat(col2,{rough:0.95,side:THREE.DoubleSide,op:0.95}));
  cape.position.set(0,1.0,-0.2);cape.rotation.x=0.12;g.add(cape);
  // głowa + kaptur
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.17,12,12),W.mat(0xc9b8a0,{rough:0.7}));
  head.position.y=1.5;g.add(head);
  const hood=new THREE.Mesh(new THREE.ConeGeometry(0.21,0.4,10,1,true),W.mat(col,{rough:0.9,side:THREE.DoubleSide}));
  hood.position.y=1.62;g.add(hood);
  const eL=new THREE.Mesh(new THREE.SphereGeometry(0.026,6,6),W.glow(0xffffff,2));eL.position.set(0.06,1.52,0.14);g.add(eL);
  const eR=eL.clone();eR.position.x=-0.06;g.add(eR);
  // ramiona
  const aL=new THREE.Mesh(new THREE.CapsuleGeometry(0.06,0.36,4,7),W.mat(col,{rough:0.85}));
  aL.position.set(0.3,1.02,0.03);aL.rotation.z=0.4;g.add(aL);
  const aR=aL.clone();aR.position.x=-0.3;aR.rotation.z=-0.4;g.add(aR);
  // broń w prawej ręce (kostur ze świecącą kulą)
  const staff=new THREE.Group();
  const rod=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.03,1.1,6),W.mat(0x4a2c14,{rough:1}));
  staff.add(rod);
  const orb=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,8),W.glow(col,2));orb.position.y=0.62;staff.add(orb);
  staff.position.set(-0.38,0.95,0.12);staff.rotation.z=-0.12;g.add(staff);
  // odznaki tieru
  if(tier>=2){[-0.28,0.28].forEach(sx=>{const sh=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.2,5),W.glow(col,1.2));sh.position.set(sx,1.3,0);g.add(sh);});}
  if(tier>=3){const halo=new THREE.Mesh(new THREE.TorusGeometry(0.22,0.018,6,20),W.glow(col,2));halo.position.y=1.85;halo.rotation.x=Math.PI/2;g.add(halo);}
  if(tier>=4){const crown=new THREE.Mesh(new THREE.ConeGeometry(0.15,0.26,5),W.glow(0xffd56b,2.2));crown.position.y=1.9;g.add(crown);}
  g.scale.setScalar(scale*(0.88+tier*0.09));
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
    hp:Math.round(D.rnd(tt.hp[0],tt.hp[1])*lm*0.72), dmg:Math.round(D.rnd(tt.dmg[0],tt.dmg[1])*lm*0.82),
    xp:Math.round(tt.xp*lm), gold:[Math.round(tt.gold[0]*lm),Math.round(tt.gold[1]*lm)]};
};

E.spawnEnemy=function(def,x,z,opts){
  opts=opts||{};
  const fac=D.FACTIONS[def.fac];
  let model=W.charForFaction(def.fac,def.tier,false);
  if(model){
    if(def.tier>=3){const halo=new THREE.Mesh(new THREE.TorusGeometry(0.2,0.016,6,20),W.glow(fac.col,2));halo.position.y=1.35+def.tier*0.16;halo.rotation.x=Math.PI/2;model.add(halo);}
    const gl=new THREE.PointLight(fac.col,0.5,4,2);gl.position.y=1.2;model.add(gl);
  } else if(def.fac==='bestie'&&D.chance(0.6)) model=E.buildBeastModel(fac.col,def.tier,opts.scale);
  else if(def.fac==='demony') model=E.buildDemonModel(def.tier,opts.scale);
  else model=E.buildHumanoid(fac.col,fac.col2,def.tier,opts.scale);
  const grp=new THREE.Group();grp.add(model);grp.position.set(x,W.groundH(x,z),z);
  const bar=E.makeHpBar();bar.position.y=2.4*(opts.scale||1);grp.add(bar);E.updateHpBar(bar,1);
  W.current.add(grp);
  const e={grp:grp,model:model,bar:bar,def:def,hp:def.hp,maxHp:def.hp,
    state:'idle',aggro:8+def.tier*1.5,speed:2.6+def.tier*0.25+Math.random()*0.5,
    atkR:def.fac==='bestie'?1.9:(['cien','chaos','sen','pustka'].includes(def.fac)?7:1.7),
    atkCd:0, atkRate:1.6-def.tier*0.08, wanderT:0, home:{x:x,z:z},
    elite:def.tier>=3, boss:!!opts.boss, stun:0, slow:0, fear:0, dots:[], mark:0};
  if(opts.boss){e.aggro=50;grp.scale.setScalar(1.6);bar.visible=false;}
  // afiksy elit (tier 2+, 25% szans; nie boss)
  if(!opts.boss&&def.tier>=2&&D.chance(0.25)){
    const af=D.pick(D.ELITE_AFFIXES);e.affix=af;
    def.name=af.n+' '+def.name;
    if(af.spd)e.speed*=af.spd;
    if(af.hp){e.hp=Math.round(e.hp*af.hp);e.maxHp=e.hp;}
    if(af.gold)def.gold=[def.gold[0]*af.gold,def.gold[1]*af.gold];
    const glowM=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.03,6,22),W.glow(parseInt(af.col.slice(1),16),2));
    glowM.rotation.x=Math.PI/2;glowM.position.y=0.15;grp.add(glowM);
  }
  E.enemies.push(e);
  return e;
};

E.populateRegion=function(id){
  const def=D.REGIONS[id]; if(def.safe) return;
  const half=W.regionSize/2;
  const mainFac=def.fac||'demony';
  const n = id==='piekielna_otchlan'?24 : id==='wymiar_bogow'?20 : 16;
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
  // Skarbnik (rzadki uciekający skarb, 25% szans na region)
  if(D.chance(0.25)){
    const sk=E.rollUnit(mainFac,def.lvl);
    sk.name='💰 Skarbnik';sk.hp=Math.round(sk.hp*0.6);sk.gold=[sk.gold[0]*10,sk.gold[1]*15];sk.xp*=3;
    const e=E.spawnEnemy(sk,D.rnd(-10,10),D.rnd(-10,10));
    e.treasure=true;e.speed=5.2;e.aggro=0; // ucieka zamiast walczyć
  }
  // skrzynie skarbów (3-5 na region)
  const nCh=D.rndi(3,5);
  for(let ci=0;ci<nCh;ci++){
    const a=D.rnd(0,6.283),r=D.rnd(12,half*0.9);
    const x=Math.cos(a)*r,z=Math.sin(a)*r;
    const chest=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.45,0.5),W.mat(0x6a4a20,{rough:0.8}));
    body.position.y=0.22;chest.add(body);
    const lid=new THREE.Mesh(new THREE.BoxGeometry(0.72,0.2,0.52),W.mat(0x8a6230,{rough:0.75}));
    lid.position.y=0.52;chest.add(lid);
    const lock=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.14,0.06),W.glow(0xffd56b,1.6));
    lock.position.set(0,0.4,0.27);chest.add(lock);
    chest.position.set(x,W.groundH(x,z),z);
    W.current.add(chest);
    W.interactables.push({x:x,z:z,r:2,label:'Skrzynia Skarbów',icon:'🗝️',once:true,action:(self)=>{
      Sys.addGold(D.rndi(40,140)+Game.state.lvl*8);
      if(D.chance(0.5))E.spawnPickup(chest.position,'rune',D.makeRune(null,D.pick(['common','rare','rare','epic'])));
      if(D.chance(0.4))E.spawnPickup(chest.position,'item',D.makeItem(D.pick(D.EQUIP_SLOTS),D.pick(['rare','rare','epic']),Game.state.lvl));
      if(chest.parent)chest.parent.remove(chest);
      if(typeof SND!=='undefined')SND.gold();
    }});
  }
  // kapliczka błogosławieństw (1-2 na region)
  for(let si=0;si<D.rndi(1,2);si++){
    const a=D.rnd(0,6.283),r=D.rnd(14,half*0.8);
    const x=Math.cos(a)*r,z=Math.sin(a)*r;
    const sh=new THREE.Group();
    const pil=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.35,1.6,7),W.mat(0x4a4258,{rough:0.8}));
    pil.position.y=0.8;sh.add(pil);
    const orb=new THREE.Mesh(new THREE.SphereGeometry(0.25,10,10),W.glow(0x7dffc7,2));
    orb.position.y=1.9;orb.userData.bobber=true;sh.add(orb);
    sh.position.set(x,W.groundH(x,z),z);W.current.add(sh);
    W.interactables.push({x:x,z:z,r:2.2,label:'Kapliczka — dotknij po błogosławieństwo',icon:'✨',once:true,action:()=>{
      const P=Game.player;const roll=D.pick(['dmg','spd','def','regen']);
      P.buffs[roll]={t:90};UI.refreshBuffs();
      UI.toast('✨ Błogosławieństwo kapliczki: '+({dmg:'MOC',spd:'SZYBKOŚĆ',def:'OBRONA',regen:'REGENERACJA'})[roll]+' (90 s)!','gold');
      if(orb.parent)orb.parent.remove(orb);
    }});
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
    if(e.treasure){
      // Skarbnik: ucieka od gracza, znika po 25 s
      e.runT=(e.runT||25)-dt;
      if(e.runT<=0){C.deathBurst(e.grp.position,0xffd56b);if(e.grp.parent)e.grp.parent.remove(e.grp);E.enemies.splice(i,1);continue;}
      if(dist<14){e.grp.position.x-=dx/dist*4.8*dt;e.grp.position.z-=dz/dist*4.8*dt;e.grp.rotation.y=Math.atan2(-dx,-dz);}
      W.collide(e.grp.position,0.5);
      e.grp.position.y=W.groundH(e.grp.position.x,e.grp.position.z);
      E.updateHpBar(e.bar,e.hp/e.maxHp,'#ffd56b');
      continue;
    }
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
    e.grp.position.y=W.groundH(e.grp.position.x,e.grp.position.z);
    // bob animacja
    e.model.position.y=Math.abs(Math.sin(t*6+i))* (e.state==='chase'?0.09:0.03);
    // pasek HP do kamery
    if(!e.boss)E.updateHpBar(e.bar,e.hp/e.maxHp, e.elite?'#ffb13b':'#e33');
    else{const bd=Math.hypot(P.pos.x-e.grp.position.x,P.pos.z-e.grp.position.z);if(bd<32)UI.setBoss(e.def.name,e.hp/e.maxHp);else UI.hideBoss();}
  }
};

E.killEnemy=function(e,idx){
  // wybuchowy afiks
  if(e.affix&&e.affix.explode){
    C.ringFx(e.grp.position,0xff7a2b,3.5);
    const P=Game.player;const d=Math.hypot(P.pos.x-e.grp.position.x,P.pos.z-e.grp.position.z);
    if(d<3.5)C.damagePlayer(e.def.dmg*1.2,{n:'eksplozja',e:null});
  }
  // nagrody
  const g=D.rndi(e.def.gold[0],e.def.gold[1]);
  Sys.addGold(g); Sys.addXp(e.def.xp);
  Sys.onKill(e);
  C.deathBurst(e.grp.position, D.FACTIONS[e.def.fac].col);
  if(typeof SND!=='undefined')SND.kill();
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
    p.m.rotation.y+=dt*2;p.m.position.y=W.groundH(p.m.position.x,p.m.position.z)+0.5+Math.sin(t*3+i)*0.12;
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
    a.grp.position.y=W.groundH(a.grp.position.x,a.grp.position.z);
  }
};
