// ================= WALKA =================
"use strict";
const C = {};
C.projectiles=[]; C.clouds=[]; C.fx=[];

// liczby obrażeń (DOM, rzutowane z 3D)
C.dmgNum=function(pos3,txt,col){
  const v=pos3.clone();v.y+=1.8;v.project(W.camera);
  if(v.z>1)return;
  const x=(v.x*0.5+0.5)*innerWidth, y=(-v.y*0.5+0.5)*innerHeight;
  const el=document.createElement('div');el.className='dmgNum';el.textContent=txt;
  el.style.left=(x+D.rnd(-14,14))+'px';el.style.top=y+'px';el.style.color=col||'#ffd56b';
  document.getElementById('dmgLayer').appendChild(el);
  setTimeout(()=>el.remove(),820);
};

// efekt śmierci / trafienia — particle burst
C.deathBurst=function(pos,col,n){
  n=n||14;
  const geo=new THREE.BufferGeometry();
  const p=new Float32Array(n*3), vel=[];
  for(let i=0;i<n;i++){p[i*3]=pos.x;p[i*3+1]=pos.y+0.8;p[i*3+2]=pos.z;
    const a=D.rnd(0,6.283);vel.push({x:Math.cos(a)*D.rnd(1,4),y:D.rnd(1,4),z:Math.sin(a)*D.rnd(1,4)});}
  geo.setAttribute('position',new THREE.BufferAttribute(p,3));
  const m=new THREE.Points(geo,new THREE.PointsMaterial({color:col,size:0.22,map:W.dotTex,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false}));
  W.current.add(m);
  C.fx.push({m:m,vel:vel,t:0.7,type:'burst'});
};
C.ringFx=function(pos,col,r){
  const m=new THREE.Mesh(new THREE.RingGeometry(0.2,0.5,28),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.9,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.position.set(pos.x,0.15,pos.z);
  W.current.add(m);
  C.fx.push({m:m,t:0.4,type:'ring',maxR:r||4});
};

C.telegraph=function(x,z,r,delay,onHit){
  const m=new THREE.Mesh(new THREE.CircleGeometry(r,32),new THREE.MeshBasicMaterial({color:0xff2a3c,transparent:true,opacity:0.28,blending:THREE.AdditiveBlending,depthWrite:false}));
  m.rotation.x=-Math.PI/2;m.position.set(x,W.groundH(x,z)+0.1,z);W.current.add(m);
  const ring=new THREE.Mesh(new THREE.RingGeometry(r-0.15,r,32),new THREE.MeshBasicMaterial({color:0xff2a3c,transparent:true,opacity:0.8,side:THREE.DoubleSide,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.copy(m.position);W.current.add(ring);
  C.fx.push({m:m,t:delay,type:'tele',ring:ring,onHit:onHit,r:r,x:x,z:z});
};
C.updateFx=function(dt){
  for(let i=C.fx.length-1;i>=0;i--){
    const f=C.fx[i];f.t-=dt;
    if(f.type==='burst'){
      const pos=f.m.geometry.attributes.position;
      for(let j=0;j<f.vel.length;j++){const v=f.vel[j];
        pos.setX(j,pos.getX(j)+v.x*dt);pos.setY(j,pos.getY(j)+v.y*dt);pos.setZ(j,pos.getZ(j)+v.z*dt);v.y-=9*dt;}
      pos.needsUpdate=true;f.m.material.opacity=f.t/0.7;
    } else if(f.type==='tele'){
      f.m.material.opacity=0.28+Math.sin(f.t*20)*0.1;
      if(f.t<=0){C.ringFx({x:f.x,z:f.z},0xff2a3c,f.r);if(f.onHit)f.onHit();
        if(f.ring.parent)f.ring.parent.remove(f.ring);f.ring.geometry.dispose();f.ring.material.dispose();
        if(typeof SND!=='undefined')SND.noise(0.2,0.3,400);}
    } else if(f.type==='ring'){
      const k=1-(f.t/0.4);f.m.scale.setScalar(1+k*f.maxR*2);f.m.material.opacity=0.9*(1-k);
    }
    if(f.t<=0){if(f.m.parent)f.m.parent.remove(f.m);f.m.geometry.dispose();f.m.material.dispose();C.fx.splice(i,1);}
  }
};

// ---------- OBRAŻENIA ----------
C.playerDmg=function(mult){
  const P=Game.player;const S=Sys.totalStats();
  let dmg=S.dmg*(mult||1);
  let crit=D.chance(S.crit/100);
  if(P.stealthBonus){dmg*=2.5;P.stealthBonus=false;P.stealth=false;UI.refreshBuffs();}
  if(P.buffs.dmg)dmg*=1.4; if(P.buffs.bloodpact)dmg*=1.5;
  if(crit)dmg*=2;
  return {dmg:Math.round(dmg*D.rnd(0.9,1.1)),crit:crit};
};
C.damageEnemy=function(e,amount,crit,silent){
  if(e.hp<=0)return;
  if(!silent&&typeof SND!=='undefined')SND.hit();
  if(e.mark>0)amount*=1.4;
  amount=Math.round(amount);
  e.hp-=amount;
  if(!silent)C.dmgNum(e.grp.position,(crit?'✦':'')+D.fmt(amount),crit?'#ffd56b':'#fff');
  // aggro po ataku
  if(e.state==='idle')e.aggro=Math.max(e.aggro,14);
  // wampiryzm
  const S=Sys.totalStats();
  if(S.leech>0)Sys.heal(amount*S.leech/100);
};
C.damagePlayer=function(amount,srcName){
  const P=Game.player;if(P.dead)return;
  if(P.invuln>0)return;
  const S=Sys.totalStats();
  if(S.dodge&&D.chance(S.dodge/100)){C.dmgNum(new THREE.Vector3(P.pos.x,0,P.pos.z),'UNIK!','#7dffc7');return;}
  if(S.dmgReduce)amount*=(1-S.dmgReduce/100);
  let red=S.def/(S.def+120);
  amount=Math.round(amount*(1-red));
  if(P.buffs.def)amount=Math.round(amount*0.4);
  if(P.shield>0){const abs=Math.min(P.shield,amount);P.shield-=abs;amount-=abs;}
  if(amount<=0)return;
  P.hp-=amount;
  if(typeof SND!=='undefined')SND.hurt();
  C.dmgNum(new THREE.Vector3(P.pos.x,0,P.pos.z),'-'+D.fmt(amount),'#ff6a7a');
  // thorns
  if(S.thorns&&srcName&&srcName.e){C.damageEnemy(srcName.e,amount*0.15,false,true);}
  if(P.hp<=0){
    if(P.buffs.phoenix){delete P.buffs.phoenix;P.hp=Math.round(Sys.totalStats().maxHp*0.5);UI.toast('🐦‍🔥 Serce Feniksa cię wskrzesza!','gold');UI.refreshBuffs();return;}
    P.hp=0;Game.onDeath(srcName&&srcName.n||'wróg');
  }
};

// ---------- ATAKI WROGÓW ----------
C.enemyMelee=function(e,P){
  // krótki wypad
  C.ringFx(e.grp.position,0xff4d6d,1.2);
  C.damagePlayer(e.def.dmg*D.rnd(0.85,1.15),{n:e.def.name,e:e});
};
C.enemyProjectile=function(e,P){
  const col=D.FACTIONS[e.def.fac].col;
  const m=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,8),W.glow(col,2.5));
  m.position.copy(e.grp.position);m.position.y=1.4;
  W.current.add(m);
  const dx=P.pos.x-e.grp.position.x, dz=P.pos.z-e.grp.position.z;const d=Math.hypot(dx,dz);
  C.projectiles.push({m:m,vx:dx/d*10,vz:dz/d*10,t:2.4,dmg:e.def.dmg,hostile:true,src:e});
};

// ---------- ZAKLĘCIA GRACZA ----------
C.findTarget=function(range,arc){
  const P=Game.player;let best=null,bs=-1;
  for(const e of E.enemies){
    if(!Sys.isHostileTo(e.def.fac)&&!e.boss)continue;
    const dx=e.grp.position.x-P.pos.x,dz=e.grp.position.z-P.pos.z;const d=Math.hypot(dx,dz);
    if(d>range)continue;
    // preferuj cel przed graczem
    const fx=Math.sin(P.rot),fz=Math.cos(P.rot);
    const dot=(dx*fx+dz*fz)/(d||1);
    if(arc&&dot<arc)continue;
    const score=dot*2-d/range;
    if(score>bs){bs=score;best=e;}
  }
  return best;
};

C.castSpell=function(spell,power,isGod){
  const P=Game.player;const S=Sys.totalStats();
  power=power||1;
  if(S.spellPow)power*=(1+S.spellPow/100);
  const col=isGod?D.FACTIONS[Game.state.faction].col:0x9b59ff;
  const t=spell.type;
  if(t==='proj'){
    const target=C.findTarget(16);
    let dir;
    if(target){const dx=target.grp.position.x-P.pos.x,dz=target.grp.position.z-P.pos.z;const d=Math.hypot(dx,dz);dir={x:dx/d,z:dz/d};P.rot=Math.atan2(dx,dz);}
    else dir={x:Math.sin(P.rot),z:Math.cos(P.rot)};
    const count=spell.multi||1;
    for(let i=0;i<count;i++){
      const spread=(i-(count-1)/2)*0.22;
      const ca=Math.cos(spread),sa=Math.sin(spread);
      const dx=dir.x*ca-dir.z*sa, dz=dir.x*sa+dir.z*ca;
      const m=new THREE.Mesh(new THREE.SphereGeometry(0.22,10,10),W.glow(col,3));
      m.position.set(P.pos.x,1.4,P.pos.z);
      W.current.add(m);
      const pd=C.playerDmg(spell.dmg*power);
      C.projectiles.push({m:m,vx:dx*16,vz:dz*16,t:1.6,dmg:pd.dmg,crit:pd.crit,pierce:spell.pierce,chain:spell.chain,
        leech:spell.leech,manaSteal:spell.manaSteal,mark:spell.mark,dot:spell.dot,slow:spell.slow,stun:spell.stun,rand:spell.rand,hostile:false});
    }
  } else if(t==='nova'){
    C.ringFx({x:P.pos.x,z:P.pos.z},col,spell.r||5);
    const pd=C.playerDmg(spell.dmg*power);
    for(const e of E.enemies){
      if(!Sys.isHostileTo(e.def.fac))continue;
      const d=Math.hypot(e.grp.position.x-P.pos.x,e.grp.position.z-P.pos.z);
      if(d<=(spell.r||5)){
        C.damageEnemy(e,pd.dmg*D.rnd(0.9,1.1),pd.crit);
        if(spell.stun)e.stun=Math.max(e.stun,spell.stun);
        if(spell.slow)e.slow=Math.max(e.slow,spell.slow);
        if(spell.fear)e.fear=Math.max(e.fear,spell.fear);
      }
    }
  } else if(t==='cloud'){
    const target=C.findTarget(14);
    const cx=target?target.grp.position.x:P.pos.x+Math.sin(P.rot)*6;
    const cz=target?target.grp.position.z:P.pos.z+Math.cos(P.rot)*6;
    const m=new THREE.Mesh(new THREE.CylinderGeometry(spell.r||4,spell.r||4,0.1,24,1,true),
      new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.3,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
    m.position.set(cx,0.3,cz);W.current.add(m);
    const fl=new THREE.Mesh(new THREE.CircleGeometry(spell.r||4,24),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.18,blending:THREE.AdditiveBlending,depthWrite:false}));
    fl.rotation.x=-Math.PI/2;fl.position.y=0.05;m.add(fl);
    const pd=C.playerDmg(spell.dmg*power);
    C.clouds.push({m:m,x:cx,z:cz,r:spell.r||4,t:spell.dur||5,tick:0,dps:pd.dmg,slow:spell.slow});
  } else if(t==='heal'){
    {const hb=Sys.totalStats().healBonus||0;Sys.heal(Sys.totalStats().maxHp*(spell.heal*Math.min(power,1.8))*(1+hb/100));}
    C.ringFx({x:P.pos.x,z:P.pos.z},0x7dffc7,3);
  } else if(t==='shield'){
    P.shield=Math.round(Sys.totalStats().maxHp*spell.sh*Math.min(power,1.6));
    P.shieldT=spell.dur||8; UI.toast('🛡️ Tarcza: '+D.fmt(P.shield),'green');
  } else if(t==='blink'){
    const dx=Math.sin(P.rot),dz=Math.cos(P.rot);
    const pd=spell.dmg?C.playerDmg(spell.dmg*power):null;
    // obrażenia po drodze
    if(pd)for(const e of E.enemies){
      if(!Sys.isHostileTo(e.def.fac))continue;
      const ex=e.grp.position.x-P.pos.x,ez=e.grp.position.z-P.pos.z;
      const proj=ex*dx+ez*dz;
      if(proj>0&&proj<8&&Math.abs(ex*dz-ez*dx)<1.6)C.damageEnemy(e,pd.dmg,pd.crit);
    }
    P.pos.x+=dx*8;P.pos.z+=dz*8;W.collide(P.pos,0.5);
    C.ringFx({x:P.pos.x,z:P.pos.z},col,2);
  } else if(t==='summon'){
    const pd=C.playerDmg(spell.dmg*power);
    E.spawnAlly(spell.n,pd.dmg,spell.dur||18,col);
    UI.toast('👤 '+spell.n+' przyzwany!','green');
  } else if(t==='buff'){
    const P2=Game.player;
    if(spell.hpCost)P2.hp=Math.max(1,P2.hp-Math.round(Sys.totalStats().maxHp*spell.hpCost));
    P2.buffs[spell.buff]={t:spell.dur||10};
    if(spell.buff==='stealth'){P2.stealth=true;P2.stealthBonus=true;}
    UI.refreshBuffs();
    C.ringFx({x:P.pos.x,z:P.pos.z},0xffd56b,2.5);
  }
};

// atak podstawowy
C.basicAttack=function(){
  const P=Game.player;
  if(P.atkCd>0)return false;
  const S=Sys.totalStats();
  P.atkCd=Math.max(0.3, 0.55/(P.buffs.spd?1.5:1));
  const isRanged=['cien','chaos','sen','pustka'].includes(Game.state.faction)&&!Game.state.isGod;
  const target=C.findTarget(isRanged?13:2.6);
  if(Game.state.isGod){
    // bóg — potężny pocisk domeny
    C.castSpell({type:'proj',dmg:1.0,n:'Atak'},1,true);
    return true;
  }
  if(isRanged){ C.castSpell({type:'proj',dmg:1.0,n:'Atak'},1,false); return true; }
  // melee — półkole
  C.ringFx({x:P.pos.x+Math.sin(P.rot)*1.2,z:P.pos.z+Math.cos(P.rot)*1.2},0xffd56b,1.6);
  let hit=false;
  for(const e of E.enemies){
    if(!Sys.isHostileTo(e.def.fac))continue;
    const dx=e.grp.position.x-P.pos.x,dz=e.grp.position.z-P.pos.z;const d=Math.hypot(dx,dz);
    if(d<2.8){
      const dot=(dx*Math.sin(P.rot)+dz*Math.cos(P.rot))/(d||1);
      if(dot>0.2){const pd=C.playerDmg(1);C.damageEnemy(e,pd.dmg,pd.crit);hit=true;
        // efekty broni
        const wfx=Sys.weaponFx();
        if(wfx==='aoe_smash'){for(const e2 of E.enemies){if(e2===e||!Sys.isHostileTo(e2.def.fac))continue;
          const dd=Math.hypot(e2.grp.position.x-e.grp.position.x,e2.grp.position.z-e.grp.position.z);
          if(dd<3)C.damageEnemy(e2,pd.dmg*0.5,false,true);}}
        if(wfx==='summon_shadows'&&D.chance(0.1)){E.spawnAlly('Cień',pd.dmg*0.4,10,0x9b59ff);E.spawnAlly('Cień',pd.dmg*0.4,10,0x9b59ff);}
      }
    }
  }
  if(target&&!hit){P.rot=Math.atan2(target.grp.position.x-P.pos.x,target.grp.position.z-P.pos.z);}
  return true;
};

// ---------- UPDATE ----------
C.update=function(dt){
  const P=Game.player;
  // pociski
  for(let i=C.projectiles.length-1;i>=0;i--){
    const p=C.projectiles[i];p.t-=dt;
    p.m.position.x+=p.vx*dt;p.m.position.z+=p.vz*dt;
    let dead=p.t<=0;
    if(p.hostile){
      if(P&&!P.dead){const d=Math.hypot(P.pos.x-p.m.position.x,P.pos.z-p.m.position.z);
        if(d<0.9){C.damagePlayer(p.dmg*D.rnd(0.9,1.1),{n:p.src?p.src.def.name:'pocisk',e:p.src});dead=true;}}
    } else {
      for(const e of E.enemies){
        if(e.hp<=0||(!Sys.isHostileTo(e.def.fac)&&!e.boss))continue;
        const d=Math.hypot(e.grp.position.x-p.m.position.x,e.grp.position.z-p.m.position.z);
        if(d<1.0){
          let dmg=p.dmg; if(p.rand)dmg=Math.round(dmg*D.rnd(0.15,1.0)/0.55);
          C.damageEnemy(e,dmg,p.crit);
          if(p.leech)Sys.heal(dmg*p.leech*0.3);
          if(p.manaSteal){P.mana=Math.min(Sys.totalStats().maxMana,P.mana+p.manaSteal);}
          if(p.mark)e.mark=6;
          if(p.dot)e.dots.push({dps:dmg*p.dot,t:4,tick:0});
          if(p.slow)e.slow=Math.max(e.slow,p.slow);
          if(p.stun)e.stun=Math.max(e.stun,p.stun);
          if(p.chain&&p.chain>0){
            let next=null,nd=8;
            for(const e2 of E.enemies){if(e2===e||e2.hp<=0||!Sys.isHostileTo(e2.def.fac))continue;
              const dd=Math.hypot(e2.grp.position.x-e.grp.position.x,e2.grp.position.z-e.grp.position.z);
              if(dd<nd){nd=dd;next=e2;}}
            if(next){const dx=next.grp.position.x-p.m.position.x,dz=next.grp.position.z-p.m.position.z;const d2=Math.hypot(dx,dz);
              p.vx=dx/d2*16;p.vz=dz/d2*16;p.chain--;p.t=1;dead=false;break;}
          }
          if(!p.pierce){dead=true;}
          break;
        }
      }
    }
    if(dead){if(p.m.parent)p.m.parent.remove(p.m);p.m.geometry.dispose();p.m.material.dispose();C.projectiles.splice(i,1);}
  }
  // chmury
  for(let i=C.clouds.length-1;i>=0;i--){
    const c=C.clouds[i];c.t-=dt;c.tick-=dt;c.m.rotation.y+=dt*0.8;
    if(c.tick<=0){c.tick=0.5;
      for(const e of E.enemies){if(!Sys.isHostileTo(e.def.fac))continue;
        const d=Math.hypot(e.grp.position.x-c.x,e.grp.position.z-c.z);
        if(d<=c.r){C.damageEnemy(e,c.dps*0.5,false,true);if(c.slow)e.slow=Math.max(e.slow,c.slow);}}}
    if(c.t<=0){if(c.m.parent)c.m.parent.remove(c.m);C.clouds.splice(i,1);}
  }
  C.updateFx(dt);
};
C.clear=function(){
  for(const p of C.projectiles)if(p.m.parent)p.m.parent.remove(p.m);
  for(const c of C.clouds)if(c.m.parent)c.m.parent.remove(c.m);
  for(const f of C.fx)if(f.m.parent)f.m.parent.remove(f.m);
  C.projectiles=[];C.clouds=[];C.fx=[];
};
