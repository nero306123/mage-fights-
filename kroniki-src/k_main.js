// ================= GRA — GŁÓWNA PĘTLA =================
"use strict";
const Game = {};
Game.state=null; Game.player=null; Game.regionId='wioska';
Game.input={x:0,z:0,attack:false,keys:{}};
Game.godFight=null; Game.raidT=D.rnd(180,300); Game.shadowFormActive=false;
Game.specialCd={};

// ---------- BOOT ----------
Game.boot=function(){
  const fill=UI.el('bootFill'), msg=UI.el('bootMsg');
  fill.style.width='30%'; msg.textContent='Otwieranie wrót światów…';
  // preload modeli bogów w tle (leniwe — tylko własny bóg od razu)
  setTimeout(()=>{
    fill.style.width='100%'; msg.textContent='Gotowe.';
    const save=Sys.load();
    UI.el('menuButtons').style.display='flex';
    UI.el('btnContinue').disabled=!save;
    UI.el('btnContinue').addEventListener('click',()=>{if(save){Game.startGame(save);}});
    UI.el('btnNew').addEventListener('click',()=>{
      if(save&&!confirm('Masz zapis gry. Nowa gra go nadpisze. Kontynuować?'))return;
      UI.el('boot').style.display='none';Game.showCreate();
    });
  },400);
};

// ---------- TWORZENIE POSTACI ----------
Game.showCreate=function(){
  const scr=UI.el('createScr');scr.style.display='flex';
  const grid=UI.el('facGrid');grid.innerHTML='';
  let selFac=null,selHero=null;
  D.PLAYABLE.forEach(fid=>{
    const f=D.FACTIONS[fid];
    const c=document.createElement('div');c.className='facCard';c.style.setProperty('--fc',f.css);
    c.innerHTML='<div class="fi">'+f.icon+'</div><div class="fn">'+f.name+'</div><div class="fd">'+f.desc+'</div><div class="fd" style="color:'+f.css+';margin-top:4px;">Bóg: '+f.godName+'</div>';
    c.addEventListener('click',()=>{
      grid.querySelectorAll('.facCard').forEach(x=>x.classList.remove('sel'));c.classList.add('sel');
      selFac=fid;selHero=null;
      const hs=UI.el('heroSec');hs.classList.remove('hidden');
      const hr=UI.el('heroRow');hr.innerHTML='';
      const heroes=D.UNIT_NAMES[fid].filter(u=>u[1]===1).slice(0,4);
      heroes.forEach(h=>{
        const hc=document.createElement('div');hc.className='heroCard';
        hc.innerHTML='<div class="hn">'+h[0]+'</div><div class="hs">'+f.style+'</div>';
        hc.addEventListener('click',()=>{hr.querySelectorAll('.heroCard').forEach(x=>x.classList.remove('sel'));hc.classList.add('sel');selHero=h[0];
          UI.el('createGo').classList.remove('hidden');});
        hr.appendChild(hc);
      });
      UI.el('createGo').classList.add('hidden');
    });
    grid.appendChild(c);
  });
  UI.el('createGo').addEventListener('click',()=>{
    if(!selFac||!selHero)return;
    const st=Sys.newState(selFac,selHero);
    scr.style.display='none';
    Game.startGame(st);
    UI.toast('⚔️ Witaj w Kronikach Bogów, '+selHero+'!','gold');
    UI.toast('Porozmawiaj z NPC w wiosce i wejdź w portal na południu.','green');
  });
};

// ---------- START ----------
Game.startGame=function(state){
  Game.state=state; Sys.S=state;
  W.loadSheet(function(){Game._start2();});
};
Game._start2=function(){
  const state=Game.state;
  UI.el('boot').style.display='none';
  UI.el('hud').classList.remove('hidden');
  Game.makePlayer();
  Game.travel('wioska',true);
  Sys.genDailyQuests();
  UI.buildAbilBar(); UI.refreshTop(); UI.refreshQuestTrack();
  Game.running=true;
};

// ---------- GRACZ ----------
Game.makePlayer=function(){
  const s=Game.state;const fac=D.FACTIONS[s.faction];
  const grp=new THREE.Group();
  let model;
  if(s.isGod){
    model=new THREE.Group(); // placeholder aż GLB się wczyta
    W.loadGod(fac.god,(m)=>{
      if(m){model.add(m);
        const aura=new THREE.PointLight(fac.col,1.6,7,2);aura.position.y=1.5;model.add(aura);
        const ring=new THREE.Mesh(new THREE.RingGeometry(0.9,1.4,36),W.ringMat(fac.col,0.55));
        ring.rotation.x=-Math.PI/2;ring.position.y=0.06;ring.userData.spin=0.4;model.add(ring);
      }
    });
  } else {
    model=W.charForFaction(s.faction,2,true);
    if(!model)model=E.buildHumanoid(fac.col,fac.col2,2,1.0);
    const l=new THREE.PointLight(fac.col,0.9,5,2);l.position.y=1.6;model.add(l);
    const ring=new THREE.Mesh(new THREE.RingGeometry(0.55,0.72,28),W.ringMat(fac.col,0.4));
    ring.rotation.x=-Math.PI/2;ring.position.y=0.05;ring.userData.spin=0.3;model.add(ring);
  }
  grp.add(model);
  const st=Sys.totalStats();
  Game.player={grp:grp,model:model,pos:grp.position,rot:0,
    hp:st.maxHp,mana:st.maxMana,stamina:100,de:s.isGod?st.maxDE*0.5:0,
    atkCd:0,buffs:{},shield:0,shieldT:0,invuln:0,stealth:false,stealthBonus:false,dead:false,dashCd:0};
  W.scene.add(grp);
};

Game.rebuildPlayerModel=function(){
  const P=Game.player;if(!P)return;
  const old=P.grp;const hp=P.hp,mana=P.mana,de=P.de,pos={x:P.pos.x,z:P.pos.z};
  W.scene.remove(old);
  Game.makePlayer();
  Game.player.hp=Math.min(hp,Sys.totalStats().maxHp);Game.player.mana=mana;Game.player.de=de;
  Game.player.pos.set(pos.x,0,pos.z);
};

// ---------- PODRÓŻE ----------
Game.travel=function(regionId,silent){
  const s=Game.state;const def=D.REGIONS[regionId];
  if(def.godOnly&&!s.isGod){UI.toast('🔱 Tylko bogowie mogą wejść do tego wymiaru!','red');return;}
  if(regionId==='piekielna_otchlan'&&s.lvl<50&&!s.isGod){UI.toast('🔥 Piekielna Otchłań: wymagany poziom 50 lub boskość!','red');return;}
  Game.regionId=regionId;
  E.clear();C.clear();UI.hideBoss();Game.godFight=null;
  W.buildRegion(regionId);
  E.populateRegion(regionId);
  const P=Game.player;
  if(regionId==='wioska'&&W.villageSpawn){P.pos.set(W.villageSpawn.x,0,W.villageSpawn.z);}
  else P.pos.set(0,0,regionId==='wioska'?3:(-W.regionSize/2+8));
  W.camTarget.set(P.pos.x,0,P.pos.z);
  UI.el('regionName').textContent=def.icon+' '+def.name;
  if(!silent)UI.toast('🌀 '+def.name,'green');
  // Wymiar bogów: NPC odzyskiwania duchów + spawn Upadłego w Otchłani
  if(regionId==='wymiar_bogow'){
    W.interactables.push({x:6,z:0,r:2.5,label:'Ołtarz Duchów (odzyskaj postać: 2× Boska Esencja)',icon:'👻',action:()=>Sys.reclaimSacrificed()});
    const alt=new THREE.Mesh(new THREE.CylinderGeometry(0.8,1.1,1.4,8),W.glow(0xffd56b,0.8));alt.position.set(6,0.7,0);W.current.add(alt);
  }
  if(regionId==='piekielna_otchlan'&&!s.fallenSlain){
    Game.spawnFallenGod();
  }
  Sys.save();
};

// ---------- INTERAKCJA ----------
Game.nearInteract=null;
Game.checkInteract=function(){
  const P=Game.player;let best=null,bd=1e9;
  for(const it of W.interactables){
    if(it.used)continue;
    const d=Math.hypot(P.pos.x-it.x,P.pos.z-it.z);
    if(d<it.r&&d<bd){bd=d;best=it;}
  }
  Game.nearInteract=best;
  if(best)UI.showInteract(best.label,best.icon);else UI.hideInteract();
};
Game.tryInteract=function(){
  const it=Game.nearInteract;if(!it)return;
  if(it.once)it.used=true;
  it.action(it);
};
Game.collectResource=function(name,node,it){
  Sys.S.resBag[name]=(Sys.S.resBag[name]||0)+D.rndi(1,3);
  Sys.S.stats.resources++;Sys.questEvent('collect',name);
  UI.toast('⛏️ Zebrano: '+name,'green');
  if(node&&node.parent)node.parent.remove(node);
  Sys.save();
};

// ---------- UMIEJĘTNOŚCI ----------
Game.useAbility=function(i){
  const a=UI.abils[i];if(!a)return;
  const P=Game.player;const s=Game.state;
  if(a.cd>0||P.dead)return;
  const def=a.ab.def;
  if(a.ab.kind==='rune'){
    if(P.mana<(def.mana||0)){UI.toast('Brak many!','red');return;}
    P.mana-=(def.mana||0);
    C.castSpell(def,D.spellPower(a.ab.rune),false);
    a.cd=def.cd||1;a.maxCd=a.cd;
  } else if(a.ab.kind==='god'){
    if(P.de<(def.de||0)){UI.toast('Brak Boskiej Energii!','red');return;}
    P.de-=(def.de||0);
    C.castSpell(def,1.5+s.godLvl*0.08,true);
    a.cd=def.cd||2;a.maxCd=a.cd;
  } else if(a.ab.kind==='special'){
    const now=D.now();const last=Game.specialCd[def.id]||0;
    const left=(last+def.cd*1000-now)/1000;
    if(left>0){UI.toast('⏳ '+def.n+': jeszcze '+Math.ceil(left)+'s','red');return;}
    if(def.de&&P.de<def.de){UI.toast('Brak Boskiej Energii!','red');return;}
    if(def.de)P.de-=def.de;
    Game.specialCd[def.id]=now;
    Game.useSpecial(def);
    a.cd=Math.min(def.cd,30);a.maxCd=a.cd; // wizualny cd
  }
  UI.refreshTop();
};

Game.useSpecial=function(def){
  const P=Game.player;const s=Game.state;
  UI.banner('🔱 '+def.n+'!');
  switch(def.id){
    case 'sp_shadowform': Game.shadowFormActive=true; UI.toast('Następny pokonany wróg dołączy do klanu jako cień!','gold'); break;
    case 'sp_eclipse': P.buffs.dmg={t:12}; for(const e of E.enemies){e.stun=Math.max(e.stun,2);} C.ringFx({x:P.pos.x,z:P.pos.z},0x9b59ff,10); break;
    case 'sp_balance': {const st=Sys.totalStats();const avg=(P.hp/st.maxHp+0.7)/2; Sys.heal(st.maxHp*avg-P.hp);
      for(const e of E.enemies){const d=Math.hypot(e.grp.position.x-P.pos.x,e.grp.position.z-P.pos.z);if(d<15)C.damageEnemy(e,e.maxHp*0.25,false);}break;}
    case 'sp_voidwalk': P.invuln=10; P.buffs.dmg={t:10}; UI.toast('Nietykalność 10 s!','gold'); break;
    case 'sp_deathmark': {const t=C.findTarget(18);if(t){UI.toast('⚰️ Wyrok na: '+t.def.name,'gold');
      setTimeout(()=>{if(t.hp>0)C.damageEnemy(t,t.maxHp*(t.boss?0.10:0.30),true);},3000);}break;}
    case 'sp_shadowclones': for(let i=0;i<3;i++)E.spawnAlly('Klon Cienia',Sys.totalStats().dmg*0.5,20,0xa24dff); break;
    case 'sp_apex': {const st=Sys.totalStats();P.hp=Math.min(st.maxHp*2,P.hp+st.maxHp);P.buffs.dmg={t:20};P.apex=20;UI.toast('🦖 Pradawna forma!','gold');break;}
    case 'sp_stampede': for(let i=0;i<5;i++)E.spawnAlly('Bestia Stada',Sys.totalStats().dmg*0.6,12,0xe7a83c); break;
    case 'sp_runeforge': {const rar=D.pick(['epic','epic','mythic','legend','secret']);const r=D.makeRune(D.FACTIONS[s.faction].runeCat,rar);
      s.inv.push(r);UI.toast('🔮 Stworzono runę: '+D.RARITY[rar].name+'!','gold');Sys.save();break;}
    case 'sp_nullzone': for(const e of E.enemies){const d=Math.hypot(e.grp.position.x-P.pos.x,e.grp.position.z-P.pos.z);
      if(d<10){e.stun=Math.max(e.stun,3);P.de=Math.min(Sys.totalStats().maxDE,P.de+8);}}C.ringFx({x:P.pos.x,z:P.pos.z},0x3df0dc,10);break;
    case 'sp_lastbastion': P.bastion=10; UI.toast('🏰 Nie spadniesz poniżej 1 HP przez 10 s!','gold'); break;
    case 'sp_ashstorm': C.castSpell({type:'cloud',dmg:1.2,dur:12,r:8,n:'Burza Popiołu'},2,true); break;
    case 'sp_dreamsteal': {P.buffs.dmg={t:60};P.buffs.spd={t:60};Sys.heal(Sys.totalStats().maxHp*0.3);UI.toast('🌙 Skradzione moce zasilają cię przez 60 s!','gold');break;}
    case 'sp_nightmare_realm': for(const e of E.enemies){const d=Math.hypot(e.grp.position.x-P.pos.x,e.grp.position.z-P.pos.z);
      if(d<12){e.stun=Math.max(e.stun,4);e.dots.push({dps:Sys.totalStats().dmg*0.5,t:6,tick:0});}}C.ringFx({x:P.pos.x,z:P.pos.z},0xc77dff,12);break;
  }
  UI.refreshBuffs();
};

// ---------- WALKA Z BOGIEM ----------
Game.startGodFight=function(isFallen){
  const s=Game.state;
  const godKey=isFallen?'fallen':D.FACTIONS[s.faction].god;
  const god=D.GODS[godKey];
  // arena — czyścimy wrogów wokół świątyni
  UI.banner(god.ic+' '+god.name+' ZSTĘPUJE!',5000);
  const hp=isFallen? D.rndi(50000,100000) : D.rndi(15000,30000);
  const dmg=isFallen? 800 : 320;
  const def={name:god.ic+' '+god.name,tier:5,lvl:isFallen?70:40,fac:god.fac,hp:hp,dmg:dmg,xp:isFallen?9000:3000,gold:isFallen?[4000,8000]:[1200,2400]};
  const P=Game.player;
  const spawnZ=P.pos.z+10;
  const e=E.spawnEnemy(def,P.pos.x,spawnZ,{boss:true,scale:1.0});
  // podmień model na GLB
  W.loadGod(god.glb,(m)=>{
    if(m&&e.grp.parent){
      e.grp.remove(e.model);e.model=m;e.grp.add(m);
      m.scale.setScalar(1.35);
      const l=new THREE.PointLight(D.FACTIONS[god.fac].col,2,10,2);l.position.y=2;e.grp.add(l);
      const ring=new THREE.Mesh(new THREE.RingGeometry(1.2,1.9,40),W.ringMat(D.FACTIONS[god.fac].col,0.6));
      ring.rotation.x=-Math.PI/2;ring.position.y=0.06;ring.userData.spin=0.3;e.grp.add(ring);
    }
  });
  e.speed=3.6; e.atkR=isFallen?9:8; e.atkRate=isFallen?0.9:1.2; e.isGodBoss=true; e.isFallen=!!isFallen;
  Game.godFight=e;
  UI.setBoss(def.name,1);
};

Game.spawnFallenGod=function(){
  const s=Game.state;
  UI.banner('😈 UPADŁY BÓG CZEKA W GŁĘBI OTCHŁANI…',5000);
  const def={name:'😈 Upadły Bóg',tier:5,lvl:70,fac:'demony',hp:D.rndi(60000,100000),dmg:900,xp:12000,gold:[5000,10000]};
  const e=E.spawnEnemy(def,0,W.regionSize/2-8,{boss:true,scale:1.1});
  W.loadGod('fallen',(m)=>{
    if(m&&e.grp.parent){e.grp.remove(e.model);e.model=m;e.grp.add(m);m.scale.setScalar(1.6);
      const l=new THREE.PointLight(0xff2a3c,2.4,12,2);l.position.y=2;e.grp.add(l);
      const ring=new THREE.Mesh(new THREE.RingGeometry(1.4,2.3,40),W.ringMat(0xff2a3c,0.7));
      ring.rotation.x=-Math.PI/2;ring.position.y=0.06;ring.userData.spin=0.35;e.grp.add(ring);}
  });
  e.speed=3.2;e.atkR=10;e.atkRate=0.8;e.isGodBoss=true;e.isFallen=true;e.aggro=26;
  Game.godFight=e;
};

Game.onGodKilled=function(e){
  const s=Game.state;
  if(e.isFallen){
    s.fallenSlain=true;Sys.questEvent('fallenSlain');
    UI.banner('🏆 UPADŁY BÓG POKONANY! ŚWIAT JEST BEZPIECZNY!',8000);
    UI.toast('Legendy będą opowiadać o tobie wieki.','gold');
    // nagroda: sekretna runa + unikat
    s.inv.push(D.makeRune('demon','secret'));
    const u=D.pick(D.UNIQUES);s.inv.push(Object.assign({uid:'u'+(Math.random()*1e9|0),up:0,aff:[]},u));
  } else {
    s.godSlain=true;Sys.questEvent('godSlain');
    UI.banner('👻 DUCH BOGA NALEŻY DO CIEBIE!',6000);
    UI.toast('Wróć do Świątyni, by dokonać przemiany.','gold');
  }
  Game.godFight=null;Sys.save();
};

Game.onAscend=function(){
  const s=Game.state;
  UI.banner('🔱 PRZEMIANA! JESTEŚ BOGIEM!',7000);
  UI.toast('Twoi wyznawcy ('+s.followers+') wzmacniają twoją moc.','gold');
  UI.toast('Wymiar Bogów stoi otworem. Odblokowano drzewko boskie!','green');
  Game.rebuildPlayerModel();
  const st=Sys.totalStats();Game.player.hp=st.maxHp;Game.player.de=st.maxDE;
  UI.buildAbilBar();UI.refreshTop();
  Sys.save();
};

// ---------- NAJAZD DEMONÓW ----------
Game.startRaid=function(){
  if(Game.regionId!=='wioska')return;
  UI.banner('😈 NAJAZD DEMONÓW NA WIOSKĘ!',6000);
  const s=Game.state;
  const n=4+Math.min(8,Math.floor(s.lvl/5));
  for(let i=0;i<n;i++){
    const a=D.rnd(0,6.283);
    const u=E.rollUnit('demony',[Math.max(1,s.lvl-3),s.lvl+2]);
    E.spawnEnemy(u,Math.cos(a)*26,Math.sin(a)*26);
  }
  Game.raidActive=true;
};

// ---------- ŚMIERĆ ----------
Game.onDeath=function(srcName){
  const P=Game.player;P.dead=true;
  Game.state.stats.deaths++;
  UI.el('deathScr').style.display='flex';
  UI.el('deathInfo').textContent='Pokonał cię: '+srcName+'. Tracisz 10% złota.';
  Game.state.gold=Math.floor(Game.state.gold*0.9);
  Sys.save();
};
UI.el('btnRespawn').addEventListener('click',()=>{
  UI.el('deathScr').style.display='none';
  const P=Game.player;P.dead=false;
  const st=Sys.totalStats();P.hp=st.maxHp;P.mana=st.maxMana;
  Game.travel('wioska',true);
  UI.refreshTop();
});

// ---------- INPUT ----------
addEventListener('keydown',(e)=>{
  Game.input.keys[e.code]=true;
  if(e.code==='KeyE')Game.tryInteract();
  if(e.code==='Space'){e.preventDefault();Game.input.attack=true;}
  if(e.code>='Digit1'&&e.code<='Digit9'){const i=parseInt(e.code.slice(5))-1;Game.useAbility(i);}
  if(e.code==='Escape')UI.closePanel();
  if(e.code==='KeyI')UI.openPanel('eq');
  if(e.code==='KeyK')UI.openPanel('klan');
  if(e.code==='ShiftLeft')Game.dash();
});
addEventListener('keyup',(e)=>{Game.input.keys[e.code]=false;if(e.code==='Space')Game.input.attack=false;});

Game.dash=function(){
  const P=Game.player;
  if(P.dashCd>0||P.stamina<25)return;
  P.stamina-=25;P.dashCd=0.9;
  const dx=Math.sin(P.rot),dz=Math.cos(P.rot);
  P.pos.x+=dx*4.5;P.pos.z+=dz*4.5;W.collide(P.pos,0.5);
  C.ringFx({x:P.pos.x,z:P.pos.z},0x7fd6ff,1.5);
};

// joystick mobilny
(function(){
  const zone=UI.el('joyZone'),base=UI.el('joyBase'),knob=UI.el('joyKnob');
  let active=false,cx=0,cy=0,pid=null;
  zone.addEventListener('pointerdown',(e)=>{
    active=true;pid=e.pointerId;cx=e.clientX;cy=e.clientY;
    base.style.display='block';knob.style.display='block';
    base.style.left=(cx-55)+'px';base.style.top=(cy-55)+'px';
    knob.style.left=(cx-24)+'px';knob.style.top=(cy-24)+'px';
    zone.setPointerCapture(pid);
  });
  zone.addEventListener('pointermove',(e)=>{
    if(!active||e.pointerId!==pid)return;
    let dx=e.clientX-cx,dy=e.clientY-cy;
    const d=Math.hypot(dx,dy),max=52;
    if(d>max){dx*=max/d;dy*=max/d;}
    knob.style.left=(cx+dx-24)+'px';knob.style.top=(cy+dy-24)+'px';
    Game.input.jx=dx/max;Game.input.jz=dy/max;
  });
  const end=(e)=>{if(e.pointerId!==pid)return;active=false;Game.input.jx=0;Game.input.jz=0;
    base.style.display='none';knob.style.display='none';};
  zone.addEventListener('pointerup',end);zone.addEventListener('pointercancel',end);
})();

// ---------- PĘTLA ----------
Game.clock=new THREE.Clock();
Game.loop=function(){
  requestAnimationFrame(Game.loop);
  const dt=Math.min(Game.clock.getDelta(),0.05);
  const t=Game.clock.elapsedTime;
  if(!Game.running){W.renderer.render(W.scene,W.camera);return;}
  const P=Game.player,s=Game.state,st=Sys.totalStats();
  s.playT+=dt;

  if(!P.dead&&!UI.currentPanel){
    // ruch
    let mx=0,mz=0;
    const k=Game.input.keys;
    if(k.KeyW||k.ArrowUp)mz-=1; if(k.KeyS||k.ArrowDown)mz+=1;
    if(k.KeyA||k.ArrowLeft)mx-=1; if(k.KeyD||k.ArrowRight)mx+=1;
    if(Game.input.jx||Game.input.jz){mx=Game.input.jx;mz=Game.input.jz;}
    const ml=Math.hypot(mx,mz);
    if(ml>0.1){
      // ruch względem kamery izometrycznej
      const ca=W.camAngle;
      const wx=(mx*Math.cos(ca)-mz*Math.sin(ca));
      const wz=(-mx*Math.sin(ca)-mz*Math.cos(ca));
      const sp=st.spd*(P.buffs.spd?1.5:1);
      const nx=P.pos.x+wx*sp*dt, nz=P.pos.z+wz*sp*dt;
      if(!W.grid||!W.blockedAt(nx,nz)){P.pos.x=nx;P.pos.z=nz;}
      else if(!W.blockedAt(nx,P.pos.z)){P.pos.x=nx;}
      else if(!W.blockedAt(P.pos.x,nz)){P.pos.z=nz;}
      P.rot=Math.atan2(wx,wz);
      P.grp.rotation.y=P.rot;
      W.collide(P.pos,0.5);
      P.model.position.y=Math.abs(Math.sin(t*8))*0.08;
      if(P.stealth&&!P.stealthBonus){} // ruch nie zdejmuje stealth
    } else P.model.position.y=Math.sin(t*1.6)*0.03;
    // atak
    P.atkCd-=dt;
    if(Game.input.attack)C.basicAttack();
    // regeneracja
    P.mana=Math.min(st.maxMana,P.mana+st.manaRegen*dt);
    P.hp=Math.min(st.maxHp,P.hp+ (P.buffs.regen?st.maxHp*0.04:st.hpRegen)*dt);
    P.stamina=Math.min(100,P.stamina+14*dt);
    if(s.isGod)P.de=Math.min(st.maxDE,P.de+st.deRegen*dt);
    P.dashCd-=dt;
    if(P.invuln>0)P.invuln-=dt;
    if(P.bastion>0){P.bastion-=dt;if(P.hp<1)P.hp=1;}
    if(P.shield>0){P.shieldT-=dt;if(P.shieldT<=0)P.shield=0;}
    // buffy
    let refreshB=false;
    for(const key in P.buffs){P.buffs[key].t-=dt;if(P.buffs[key].t<=0){delete P.buffs[key];if(key==='stealth'){P.stealth=false;P.stealthBonus=false;}refreshB=true;}}
    if(refreshB)UI.refreshBuffs();
    if((t*10|0)%3===0)UI.refreshBuffs();
    // aura żaru
    if(P.buffs.burn_aura){for(const e of E.enemies){const d=Math.hypot(e.grp.position.x-P.pos.x,e.grp.position.z-P.pos.z);
      if(d<4&&D.chance(dt*2))C.damageEnemy(e,st.dmg*0.3,false,true);}}
  }

  // świat
  E.updateEnemies(dt,t);
  E.updateAllies(dt,t);
  E.updatePickups(dt,t);
  C.update(dt);
  W.animateScene(t,dt);
  Game.checkInteract();
  UI.tickCooldowns(dt);
  Sys.tickMissions();
  if((t*10|0)%2===0)UI.drawMinimap();
  UI.refreshTop();

  // walka z bogiem — koniec
  if(Game.godFight&&Game.godFight.hp<=0){Game.onGodKilled(Game.godFight);}
  if(Game.godFight&&!E.enemies.includes(Game.godFight))Game.godFight=null;

  // najazdy demonów
  if(Game.regionId==='wioska'&&!Game.raidActive){
    Game.raidT-=dt;
    if(Game.raidT<=0){Game.raidT=D.rnd(240,420);Game.startRaid();}
  }
  if(Game.raidActive&&!E.enemies.some(e=>e.def.fac==='demony')){
    Game.raidActive=false;UI.banner('🏆 Wioska obroniona!',4000);
    Sys.addGold(150+s.lvl*10);Sys.addRep(s.faction,25);
  }

  if(W.grid){P.pos.y+=(W.walkY(P.pos.x,P.pos.z)-P.pos.y)*Math.min(1,dt*10);}else P.pos.y=0;
  // kamera + render
  W.updateCamera(P.pos,dt);
  if(W.composer&&W.bloomOn!==false)W.composer.render();else W.renderer.render(W.scene,W.camera);
};

// start
Game.boot();
Game.loop();
