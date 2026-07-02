// ================= SYSTEMY GRY =================
"use strict";
const Sys = {};

// ---------- STAN ----------
Sys.newState=function(faction,heroName){
  return {
    ver:1, faction:faction, heroName:heroName,
    lvl:1, xp:0, gold:150,
    inv:[],           // przedmioty, runy, mikstury, surowce {t:'item'|'rune'|'potion'|'res',...}
    equip:{},         // slot->item
    runeSlots:D.RUNE_SLOTS_BASE, activeRunes:[], // uid aktywnych run (z zaklęciem)
    clan:[],          // {uid,name,fac,tier,lvl,shadow?,onMission?}
    clanLvl:1, clanMissionsDone:0, missions:[], // aktywne misje klanu {mid,units:[uid],end}
    rep:{}, ally:null, allyBroken:{},
    quests:[], mainQuestIdx:0, questProgress:{},
    stats:{kills:0,deaths:0,bossKills:0,runesActivated:0,recruited:0,resources:0},
    isGod:false, godLvl:1, godXp:0, godSkills:{}, godPoints:0, sacrificed:[],
    godSlain:false, fallenSlain:false, followers:0,
    unlockedSlots:0, potBelt:{}, resBag:{},
    seenIntro:false, playT:0, lastDaily:0,
    godTrophies:{}, achievements:{}, pity:0, combo:0, comboT:0, arenaBest:0, autoPotion:false, lastChest:0,
  };
};
Sys.S=null; // referencja ustawiana przez Game

// ---------- STATYSTYKI ----------
Sys.totalStats=function(){
  const s=Sys.S; const P=Game.player;
  const base=D.PLAYER_BASE, gain=D.LEVEL_GAIN;
  let st={
    maxHp: base.hp+gain.hp*(s.lvl-1),
    maxMana: base.mana+gain.mana*(s.lvl-1),
    dmg: base.dmg+gain.dmg*(s.lvl-1),
    def: base.def+gain.def*(s.lvl-1),
    spd: base.spd, crit: base.crit, leech:0, thorns:false, manaRegen:6, hpRegen:1.2,
  };
  // ekwipunek
  for(const k in s.equip){const it=s.equip[k];if(!it)continue;
    const upMul=1+(it.up||0)*0.12;
    if(it.dmg)st.dmg+=it.dmg*upMul; if(it.def)st.def+=it.def*upMul;
    for(const a of (it.aff||[])){
      if(a.k==='crit')st.crit+=a.v; else if(a.k==='spd')st.spd*=(1+a.v/100);
      else if(a.k==='hp')st.maxHp+=a.v; else if(a.k==='mana')st.maxMana+=a.v;
      else if(a.k==='leech')st.leech+=a.v; else if(a.k==='def')st.def+=a.v;
    }
    if(it.fx==='mana_soul'){st.maxMana*=1.4;st.manaRegen*=1.5;}
    if(it.fx==='thorns')st.thorns=true;
    if(it.fx==='backstab')st.crit+=35;
    if(it.fx==='demon_lord')st.dmg*=1.15;
  }
  // klan — bonusy poziomu
  const cl=D.CLAN_LEVELS[s.clanLvl-1];
  st.dmg*=(1+cl.dmg/100); st.maxHp*=(1+cl.hp/100);
  // bóg
  if(s.isGod){
    st.maxHp*=D.GOD_BASE.hpMul*(1+(s.godLvl-1)*0.12);
    st.dmg*=D.GOD_BASE.dmgMul*(1+(s.godLvl-1)*0.10);
    st.maxDE=D.GOD_BASE.de*(1+(s.godLvl-1)*0.08);
    st.deRegen=D.GOD_BASE.deRegen;
    // pasywy boga
    if(s.godSkills.p_hp)st.maxHp*=1.25;
    if(s.godSkills.p_dmg)st.dmg*=1.20;
    if(s.godSkills.p_de){st.maxDE*=1.3;st.deRegen*=1.3;}
    if(s.godSkills.p_spd)st.spd*=1.15;
    const fBonus=(s.godSkills.p_wyzn?2:1)*s.followers;
    st.dmg*=(1+fBonus/100); st.maxHp*=(1+fBonus/100);
    // węzły ulepszeń
    for(const k in s.godSkills){
      if(k.startsWith('n_dmg'))st.dmg*=1.04;
      if(k.startsWith('n_hp'))st.maxHp*=1.04;
      if(k.startsWith('n_de'))st.maxDE*=1.05;
      if(k.startsWith('n_spd'))st.spd*=1.02;
      if(k.startsWith('n_crit'))st.crit+=2;
    }
  }
  // trofea bogów: +4% obrażeń i HP za każde
  const trof=Object.keys(s.godTrophies||{}).length;
  if(trof>0){st.dmg*=(1+trof*0.04);st.maxHp*=(1+trof*0.04);}
  // zestawy frakcyjne
  st.setBonus={};
  const setCount={};
  for(const k in s.equip){const it=s.equip[k];if(it&&it.set)setCount[it.set]=(setCount[it.set]||0)+1;}
  for(const fac in setCount){
    const n=setCount[fac];const def=D.SETS[fac];if(!def)continue;
    if(n>=2){const b=def.s2;
      if(b.dmg)st.dmg*=(1+b.dmg/100); if(b.mana)st.maxMana*=(1+b.mana/100); if(b.crit)st.crit+=b.crit;
      if(b.hp)st.maxHp*=(1+b.hp/100); if(b.spell)st.spellPow=(st.spellPow||0)+b.spell; if(b.def)st.def+=b.def; if(b.xp)st.xpBonus=(st.xpBonus||0)+b.xp;
      st.setBonus[fac]=2;}
    if(n>=3){const b=def.s3;
      if(b.dodge)st.dodge=(st.dodge||0)+b.dodge; if(b.cdr)st.cdr=(st.cdr||0)+b.cdr; if(b.heal)st.healBonus=(st.healBonus||0)+b.heal;
      st.setBonus[fac]=3;}
  }
  // efekty reliktów
  for(const k in s.equip){const it=s.equip[k];if(!it)continue;
    if(it.fx==='void_calm')st.manaRegen*=1.8;
    if(it.fx==='beast_heart')st.maxHp*=1.25;
    if(it.fx==='rune_eye')st.manaCost=(st.manaCost||1)*0.75;
    if(it.fx==='ash_plate')st.dmgReduce=(st.dmgReduce||0)+20;
    if(it.fx==='crusade')st.dmg*=1.2;
    if(it.fx==='soul_scale'){st.xpBonus=(st.xpBonus||0)+15;st.goldBonus=(st.goldBonus||0)+15;}
    if(it.fx==='abyss_crown')st.dmg*=1.3;
    if(it.fx==='fallen_heart')st.maxHp*=1.4;
    if(it.fx==='phase')st.dodge=(st.dodge||0)+15;
    if(it.fx==='dream_veil')st.dodge=(st.dodge||0)+10;
  }
  // buffy chwilowe
  if(P&&P.buffs.spd)st.spd*=1.5;
  st.maxHp=Math.round(st.maxHp);st.maxMana=Math.round(st.maxMana);st.dmg=Math.round(st.dmg);st.def=Math.round(st.def);
  return st;
};
Sys.weaponFx=function(){const w=Sys.S.equip.weapon;return w?w.fx:null;};

// ---------- ZASOBY GRACZA ----------
Sys.addGold=function(g){if(g>0){const st=Game.player?Sys.totalStats():null;if(st&&st.goldBonus)g=Math.round(g*(1+st.goldBonus/100));}Sys.S.gold+=g;UI.refreshTop();if(g>0)UI.toast('🪙 +'+D.fmt(g),'gold');};
Sys.spendGold=function(g){if(Sys.S.gold<g){UI.toast('Za mało złota!','red');return false;}Sys.S.gold-=g;UI.refreshTop();return true;};
Sys.addXp=function(x){
  const s=Sys.S;
  {const st=Game.player?Sys.totalStats():null;if(st&&st.xpBonus)x=Math.round(x*(1+st.xpBonus/100));}
  if(s.combo>=5)x=Math.round(x*1.25);
  if(s.isGod){
    s.godXp+=x;
    while(s.godXp>=D.GOD_XP_FOR(s.godLvl)){s.godXp-=D.GOD_XP_FOR(s.godLvl);s.godLvl++;s.godPoints+=2;
      UI.toast('🔱 Boski poziom '+s.godLvl+'! +2 pkt boskie','gold');Sys.healFull();if(typeof SND!=='undefined')SND.lvl();}
  } else {
    s.xp+=x;
    while(s.xp>=D.XP_FOR(s.lvl)){s.xp-=D.XP_FOR(s.lvl);s.lvl++;
      UI.toast('⬆️ Poziom '+s.lvl+'!','gold');Sys.healFull();if(typeof SND!=='undefined')SND.lvl();
      if(s.lvl%10===0&&s.runeSlots<8){s.runeSlots++;UI.toast('✨ Nowy slot na runę! ('+s.runeSlots+')','green');}}
  }
  UI.refreshTop();
};
Sys.heal=function(h){const P=Game.player;if(!P)return;P.hp=Math.min(Sys.totalStats().maxHp,P.hp+h);};
Sys.healFull=function(){const P=Game.player;if(!P)return;const st=Sys.totalStats();P.hp=st.maxHp;P.mana=st.maxMana;};

// ---------- REPUTACJA / SOJUSZE ----------
Sys.addRep=function(fac,v){
  const s=Sys.S;s.rep[fac]=(s.rep[fac]||0)+v;
  Sys.questEvent('rep',null,s.rep[s.faction]||0);
  UI.refreshTop();
};
Sys.repLevel=function(fac){const r=Sys.S.rep[fac]||0;let L=D.REP_LEVELS[0];for(const x of D.REP_LEVELS)if(r>=x.min)L=x;return L;};
Sys.isAllied=function(fac){return Sys.S&&(Sys.S.ally===fac||Sys.S.faction===fac);};
Sys.isHostileTo=function(fac){
  if(!Sys.S)return true;
  if(fac==='demony')return true;
  if(fac===Sys.S.faction)return false;
  if(Sys.S.ally===fac)return false;
  return true;
};
Sys.makeAlliance=function(fac){
  const s=Sys.S;
  if(s.ally){UI.toast('Masz już sojusz z frakcją '+D.FACTIONS[s.ally].name+'!','red');return false;}
  const need=s.allyBroken[fac]?300:100;
  if((s.rep[fac]||0)<need){UI.toast('Potrzebujesz '+need+' reputacji '+D.FACTIONS[fac].name+'.','red');return false;}
  s.ally=fac;UI.toast('🤝 Sojusz z frakcją '+D.FACTIONS[fac].name+'!','green');Sys.save();return true;
};
Sys.breakAlliance=function(){
  const s=Sys.S;if(!s.ally)return;
  s.allyBroken[s.ally]=true;UI.toast('💔 Zerwano sojusz z '+D.FACTIONS[s.ally].name+'.','red');
  s.ally=null;Sys.save();
};

// ---------- EKWIPUNEK ----------
Sys.pickup=function(p){
  const s=Sys.S;
  if(typeof SND!=='undefined')SND.pickup();
  if(p.type==='rune'){s.inv.push(Object.assign(p.data,{t:'rune'}));UI.toast(p.data.ic+' Runa: '+p.data.n+' ('+D.RARITY[p.data.rar].name+')');}
  else if(p.type==='item'){s.inv.push(Object.assign(p.data,{t:'item'}));UI.toast(p.data.ic+' '+p.data.n);}
  else if(p.type==='potion'){s.inv.push(Object.assign(p.data,{t:'potion',uid:'p'+(Math.random()*1e9|0)}));UI.toast(p.data.ic+' '+p.data.n);}
  else if(p.type==='res'){s.resBag[p.data.n]=(s.resBag[p.data.n]||0)+1;s.stats.resources++;Sys.questEvent('collect',p.data.n);UI.toast('⛏️ '+p.data.n);}
  Sys.save();
};
Sys.equipItem=function(uid){
  const s=Sys.S;const idx=s.inv.findIndex(i=>i.uid===uid);if(idx<0)return;
  const it=s.inv[idx];if(it.t!=='item')return;
  const old=s.equip[it.slot];
  s.equip[it.slot]=it;s.inv.splice(idx,1);
  if(old)s.inv.push(old);
  Sys.save();UI.toast('✅ Założono: '+it.n,'green');
};
Sys.unequip=function(slot){
  const s=Sys.S;const it=s.equip[slot];if(!it)return;
  s.inv.push(it);delete s.equip[slot];Sys.save();
};
Sys.sellItem=function(uid){
  const s=Sys.S;const idx=s.inv.findIndex(i=>i.uid===uid);if(idx<0)return;
  const it=s.inv[idx];const val=Math.round((it.price||100)*D.SELL_MUL);
  s.inv.splice(idx,1);Sys.addGold(val);Sys.save();
};
Sys.usePotion=function(uid){
  const s=Sys.S;const idx=s.inv.findIndex(i=>i.uid===uid);if(idx<0)return;
  const p=s.inv[idx];const P=Game.player;const st=Sys.totalStats();
  if(p.heal)Sys.heal(p.heal);
  if(p.mana)P.mana=Math.min(st.maxMana,P.mana+p.mana);
  if(p.buff){P.buffs[p.buff]={t:p.dur||30};UI.refreshBuffs();}
  s.inv.splice(idx,1);Sys.save();UI.toast(p.ic+' Użyto: '+p.n,'green');
};
Sys.smithUpgrade=function(slot){
  const s=Sys.S;const it=s.equip[slot];if(!it){UI.toast('Brak przedmiotu w tym slocie.','red');return;}
  const cost=D.SMITH_COST(it.up||0);const resNeed=D.SMITH_RES(it.up||0);
  const resTotal=Object.values(s.resBag).reduce((a,b)=>a+b,0);
  if(resTotal<resNeed){UI.toast('Potrzeba '+resNeed+' surowców (masz '+resTotal+').','red');return;}
  if(!Sys.spendGold(cost))return;
  let left=resNeed;
  for(const k in s.resBag){const take=Math.min(left,s.resBag[k]);s.resBag[k]-=take;left-=take;if(s.resBag[k]<=0)delete s.resBag[k];if(!left)break;}
  it.up=(it.up||0)+1;Sys.save();
  UI.toast('⚒️ '+it.n+' ulepszono do +'+it.up+'!','gold');
};

// ---------- RUNY ----------
Sys.activateRune=function(uid){
  const s=Sys.S;const r=s.inv.find(i=>i.uid===uid&&i.t==='rune');if(!r)return;
  const cost=80*(D.RARITY[r.rar].ord+1);
  if(!Sys.spendGold(cost))return;
  r.active=true;r.spell=D.rollSpell(r);
  s.stats.runesActivated++;Sys.questEvent('activateRune');
  Sys.save();
  UI.toast('🔮 Runa aktywowana: '+r.spell.ic+' '+r.spell.n+'!','gold');
};
Sys.slotRune=function(uid){
  const s=Sys.S;
  if(s.activeRunes.includes(uid)){s.activeRunes=s.activeRunes.filter(u=>u!==uid);Sys.save();UI.buildAbilBar();return;}
  if(s.activeRunes.length>=s.runeSlots){UI.toast('Brak wolnych slotów ('+s.runeSlots+').','red');return;}
  const r=s.inv.find(i=>i.uid===uid);if(!r||!r.spell){UI.toast('Najpierw aktywuj runę u Runologa.','red');return;}
  s.activeRunes.push(uid);Sys.save();UI.buildAbilBar();
  UI.toast('✨ '+r.spell.n+' w slocie!','green');
};
Sys.upgradeRune=function(uid){
  const s=Sys.S;const r=s.inv.find(i=>i.uid===uid);if(!r)return;
  // zużyj 2 runy tej samej kategorii i rzadkości
  const fodder=s.inv.filter(i=>i.t==='rune'&&i.uid!==uid&&i.cat===r.cat&&i.rar===r.rar&&!s.activeRunes.includes(i.uid));
  if(fodder.length<2){UI.toast('Potrzeba 2 dodatkowych run '+r.n+' ('+D.RARITY[r.rar].name+').','red');return;}
  for(let i=0;i<2;i++){const idx=s.inv.findIndex(x=>x.uid===fodder[i].uid);s.inv.splice(idx,1);}
  r.up=(r.up||0)+1;
  // szansa na awans rzadkości
  if(r.up>=3&&D.RARITY[r.rar].ord<5){const ni=D.RARITY[r.rar].ord+1;r.rar=D.RAR_LIST[ni];r.up=0;
    UI.toast('🌟 Runa awansowała na '+D.RARITY[r.rar].name+'!','gold');}
  else UI.toast('🔺 Runa ulepszona (+'+r.up+').','green');
  Sys.save();
};

// ---------- KLAN ----------
Sys.clanCap=function(){return D.CLAN_LEVELS[Sys.S.clanLvl-1].cap;};
Sys.tryRecruit=function(e){
  const s=Sys.S;
  if(e.def.fac==='demony')return false;
  if(s.clan.length>=Sys.clanCap())return false;
  const ch = e.def.tier>=3?0.10 : e.def.tier===2?0.16 : 0.22;
  if(!D.chance(ch))return false;
  const u={uid:'c'+(Math.random()*1e9|0),name:e.def.name,fac:e.def.fac,tier:e.def.tier,lvl:e.def.lvl,up:0};
  s.clan.push(u);s.stats.recruited++;Sys.questEvent('recruit');
  UI.toast('👥 '+u.name+' dołącza do klanu!','gold');UI.dot('klanDot',true);
  Sys.checkClanLevel();Sys.save();return true;
};
Sys.shadowRecruit=function(e){ // specjalna Shadow Goda
  const s=Sys.S;
  if(s.clan.length>=Sys.clanCap()){UI.toast('Klan pełny!','red');return false;}
  const u={uid:'c'+(Math.random()*1e9|0),name:'Cień: '+e.def.name,fac:'cien',tier:e.def.tier,lvl:e.def.lvl,up:0,shadow:true};
  s.clan.push(u);UI.toast('👥 '+u.name+' (60% mocy) dołącza jako cień!','gold');
  Sys.checkClanLevel();Sys.save();return true;
};
Sys.checkClanLevel=function(){
  const s=Sys.S;
  const next=D.CLAN_LEVELS[s.clanLvl];if(!next||!next.need)return;
  if(s.stats.recruited>=next.need.units&&s.clanMissionsDone>=next.need.missions){
    s.clanLvl++;UI.toast('🏰 Klan awansował na poziom '+s.clanLvl+'!','gold');
  }
};
Sys.upgradeClanUnit=function(uid){
  const s=Sys.S;const u=s.clan.find(c=>c.uid===uid);if(!u)return;
  const cost=Math.round(80*Math.pow(1.5,u.up||0)*u.tier);
  if(!Sys.spendGold(cost))return;
  u.up=(u.up||0)+1;u.lvl+=1;Sys.save();
  UI.toast('⬆️ '+u.name+' → poz. '+u.lvl,'green');
};
Sys.startClanMission=function(mid,unitIds){
  const s=Sys.S;const m=D.CLAN_MISSIONS.find(x=>x.id===mid);if(!m)return;
  if(unitIds.length<m.min){UI.toast('Potrzeba min. '+m.min+' postaci.','red');return;}
  for(const uid of unitIds){const u=s.clan.find(c=>c.uid===uid);if(!u||u.onMission){UI.toast('Postać niedostępna.','red');return;}}
  for(const uid of unitIds){s.clan.find(c=>c.uid===uid).onMission=true;}
  s.missions.push({mid:mid,units:unitIds,end:D.now()+m.dur*1000});
  Sys.save();UI.toast('📜 Misja rozpoczęta: '+m.n,'green');
};
Sys.tickMissions=function(){
  const s=Sys.S;if(!s)return;
  for(let i=s.missions.length-1;i>=0;i--){
    const mi=s.missions[i];
    if(D.now()>=mi.end){
      const m=D.CLAN_MISSIONS.find(x=>x.id===mi.mid);
      const power=mi.units.reduce((a,uid)=>{const u=s.clan.find(c=>c.uid===uid);return a+(u?u.tier+u.lvl*0.1:0);},0);
      const mul=1+power*0.05;
      const gold=Math.round(D.rnd(m.gold[0],m.gold[1])*mul);
      s.gold+=gold; Sys.addXp(Math.round(m.xp*mul));
      let extra='';
      if(m.rune&&D.chance(m.rune)){s.inv.push(D.makeRune(null,D.pick(['common','rare','rare','epic'])));extra+=' +runa';}
      if(m.res){for(let r=0;r<m.res;r++){const rn=D.pick(D.RESOURCES.slice(0,14));s.resBag[rn]=(s.resBag[rn]||0)+1;}extra+=' +surowce';}
      if(m.divRes){s.resBag['Boska Esencja']=(s.resBag['Boska Esencja']||0)+1;extra+=' +Boska Esencja';}
      for(const uid of mi.units){const u=s.clan.find(c=>c.uid===uid);if(u)u.onMission=false;}
      s.missions.splice(i,1);s.clanMissionsDone++;
      Sys.checkClanLevel();
      UI.toast('✅ Misja "'+m.n+'" ukończona! +'+gold+'🪙'+extra,'gold');UI.dot('misjeDot',true);
      Sys.save();
    }
  }
};

// ---------- ZADANIA ----------
Sys.genDailyQuests=function(){
  const s=Sys.S;
  const day=Math.floor(D.now()/86400000);
  if(s.lastDaily===day&&s.quests.length)return;
  s.lastDaily=day;s.quests=[];
  for(let i=0;i<3;i++){
    const t=D.pick(D.QUEST_TEMPLATES);
    const regs=D.REGION_LIST.filter(r=>!D.REGIONS[r].safe&&!D.REGIONS[r].godOnly);
    const reg=D.pick(regs);const rd=D.REGIONS[reg];
    const count=D.rndi(t.count[0],t.count[1]);
    const res=rd.res?D.pick(rd.res):'Kamień';
    s.quests.push({uid:'q'+(Math.random()*1e9|0),tid:t.id,type:t.type,region:reg,fac:t.fac,res:res,count:count,prog:0,
      n:t.n.replace('{r}',rd.name).replace('{res}',res),
      d:t.d.replace('{c}',count).replace('{r}',rd.name).replace('{res}',res),
      gold:count*t.goldMul,xp:count*t.xpMul,done:false,claimed:false});
  }
  Sys.save();
};
Sys.questEvent=function(type,arg,val){
  const s=Sys.S;if(!s)return;
  // dzienne
  for(const q of s.quests){
    if(q.done)continue;
    if(q.type==='kill'&&type==='kill'&&Game.regionId===q.region)q.prog++;
    else if(q.type==='killElite'&&type==='killElite'&&Game.regionId===q.region)q.prog++;
    else if(q.type==='killFac'&&type==='killFac'&&arg===q.fac)q.prog++;
    else if(q.type==='collect'&&type==='collect'&&arg===q.res)q.prog++;
    if(q.prog>=q.count&&!q.done){q.done=true;UI.toast('📜 Zlecenie gotowe: '+q.n,'gold');UI.dot('misjeDot',true);}
  }
  // główne
  const mq=D.MAIN_QUESTS[s.mainQuestIdx];
  if(mq){
    let p=s.questProgress[mq.id]||0;
    if(mq.type==='kill'&&type==='kill'&&(!mq.region||Game.regionId===mq.region))p++;
    else if(mq.type==='recruit'&&type==='recruit')p++;
    else if(mq.type==='activateRune'&&type==='activateRune')p++;
    else if(mq.type==='rep'&&type==='rep')p=val;
    else if(mq.type==='godSlain'&&type==='godSlain')p=1;
    else if(mq.type==='ascend'&&type==='ascend')p=1;
    else if(mq.type==='fallenSlain'&&type==='fallenSlain')p=1;
    s.questProgress[mq.id]=p;
    if(p>=mq.count){
      s.mainQuestIdx++;
      if(mq.gold)s.gold+=mq.gold; if(mq.xp)Sys.addXp(mq.xp);
      UI.toast('🏆 GŁÓWNE ZADANIE: '+mq.n+' ukończone!','gold');
    }
  }
  UI.refreshQuestTrack();
};
Sys.claimQuest=function(uid){
  const s=Sys.S;const q=s.quests.find(x=>x.uid===uid);if(!q||!q.done||q.claimed)return;
  q.claimed=true;Sys.addGold(q.gold);Sys.addXp(q.xp);Sys.addRep(s.faction,15);Sys.save();
};

// ---------- ZABÓJSTWA ----------
Sys.onKill=function(e){
  const s=Sys.S;s.stats.kills++;
  s.pity=(s.pity||0)+1;
  s.combo=(s.combo||0)+1;s.comboT=4;
  if(s.combo>=3)UI.comboShow(s.combo);
  if(s.pity>=12){s.pity=0;E.spawnPickup(e.grp.position,'rune',D.makeRune(D.FACTIONS[e.def.fac].runeCat||'cien',D.pick(['rare','rare','epic'])));}
  Sys.checkAchievements();
  Sys.questEvent('kill');
  if(e.elite){s.stats.bossKills+=e.boss?1:0;Sys.questEvent('killElite');}
  Sys.questEvent('killFac',e.def.fac);
  Sys.addRep(s.faction, e.def.fac==='demony'?4:2);
  if(e.def.fac!=='demony'&&e.def.fac!==s.faction)Sys.addRep(e.def.fac,-3);
  // rekrutacja (Shadow God special aktywna → gwarantowana rejestracja w Game)
  if(Game.shadowFormActive&&e.def.fac!=='demony'){Sys.shadowRecruit(e);Game.shadowFormActive=false;}
  else Sys.tryRecruit(e);
};

// ---------- BÓG ----------
Sys.godSkillTree=function(){
  const s=Sys.S;const god=D.GODS[D.FACTIONS[s.faction].god];
  const nodes=[];
  D.GOD_PASSIVES_T.forEach(p=>nodes.push(Object.assign({cat:'Pasywna',cost:2},p)));
  D.GOD_ACTIVES_T.forEach((a,i)=>nodes.push(Object.assign({cat:'Aktywna',cost:1+Math.floor(i/5)},a,{k:'a_'+a.k})));
  (D.GOD_SPECIALS[god.id]||[]).forEach(sp=>nodes.push({k:sp.id,n:sp.n,ic:sp.ic,d:sp.d,cat:'Specjalna',cost:4,special:true}));
  // 28 węzłów ulepszeń
  const ups=[['n_dmg','+4% obrażeń','⚔️',8],['n_hp','+4% HP','❤️',8],['n_de','+5% Boskiej Energii','🔷',5],['n_spd','+2% szybkości','💨',4],['n_crit','+2% kryt.','✦',3]];
  ups.forEach(u=>{for(let i=1;i<=u[3];i++)nodes.push({k:u[0]+i,n:u[1],ic:u[2],d:'Boskie ulepszenie ('+i+'/'+u[3]+')',cat:'Ulepszenie',cost:1});});
  return nodes;
};
Sys.buyGodSkill=function(k){
  const s=Sys.S;const node=Sys.godSkillTree().find(n=>n.k===k);if(!node)return;
  if(s.godSkills[k]){UI.toast('Już posiadasz.','red');return;}
  if(s.godPoints<node.cost){UI.toast('Za mało punktów boskich ('+node.cost+').','red');return;}
  s.godPoints-=node.cost;s.godSkills[k]=true;Sys.save();
  UI.toast('🔱 Odblokowano: '+node.n,'gold');
  UI.buildAbilBar();
};
Sys.ascend=function(){
  const s=Sys.S;
  if(!s.godSlain){UI.toast('Najpierw pokonaj boga swojej frakcji!','red');return false;}
  if(s.isGod)return false;
  // poświęcenie klanu
  s.sacrificed=s.clan.map(c=>c.uid);
  s.followers=s.clan.length;
  s.clan=[];
  s.isGod=true;s.godLvl=1;s.godXp=0;s.godPoints=6;
  s.godSkills={a_strike:true};
  Sys.questEvent('ascend');
  Sys.save();
  return true;
};
Sys.reclaimSacrificed=function(){ // odzyskanie postaci (w Wymiarze Bogów za Boską Esencję)
  const s=Sys.S;
  if(!s.sacrificed.length){UI.toast('Nie masz duchów do odzyskania.','red');return;}
  if((s.resBag['Boska Esencja']||0)<2){UI.toast('Potrzeba 2× Boska Esencja.','red');return;}
  s.resBag['Boska Esencja']-=2;
  s.sacrificed.pop();
  const facs=D.PLAYABLE;const fac=D.pick(facs);
  const names=D.UNIT_NAMES[fac].filter(n=>n[1]<=2);const nm=D.pick(names);
  s.clan.push({uid:'c'+(Math.random()*1e9|0),name:'Odzyskany: '+nm[0],fac:fac,tier:nm[1],lvl:s.lvl,up:0});
  s.followers=Math.max(0,s.followers); // wyznawcy zostają
  Sys.save();UI.toast('👻 Odzyskano ducha postaci!','gold');
};

// ---------- ZAPIS ----------
Sys.save=function(){
  try{localStorage.setItem('kroniki_save',JSON.stringify(Sys.S));}catch(e){}
};
Sys.load=function(){
  try{const raw=localStorage.getItem('kroniki_save');if(!raw)return null;return JSON.parse(raw);}catch(e){return null;}
};
Sys.wipe=function(){try{localStorage.removeItem('kroniki_save');}catch(e){}};

// ---------- OSIĄGNIĘCIA ----------
Sys.checkAchievements=function(){
  const s=Sys.S;if(!s)return;
  for(const a of D.ACHIEVEMENTS){
    if(s.achievements[a.id])continue;
    if(a.need(s)){s.achievements[a.id]=true;s.gold+=a.gold;
      UI.toast('🏆 Osiągnięcie: '+a.n+' (+'+a.gold+'🪙)','gold');
      if(typeof SND!=='undefined')SND.lvl();}
  }
};
// ---------- PIECZĘCIE / TROFEA ----------
Sys.craftSeal=function(godKey){
  const s=Sys.S;const seal=D.SEALS[godKey];
  const resTotal=Object.values(s.resBag).reduce((a,b)=>a+b,0);
  if(resTotal<seal.cost.res){UI.toast('Potrzeba '+seal.cost.res+' surowców.','red');return;}
  if(!Sys.spendGold(seal.cost.gold))return;
  let left=seal.cost.res;
  for(const k in s.resBag){const take=Math.min(left,s.resBag[k]);s.resBag[k]-=take;left-=take;if(s.resBag[k]<=0)delete s.resBag[k];if(!left)break;}
  s.inv.push({uid:'s'+(Math.random()*1e9|0),t:'seal',god:godKey,n:seal.n,d:seal.d});
  Sys.save();UI.toast('✨ Wykuto: '+seal.n+'!','gold');
};
Sys.useSeal=function(uid){
  const s=Sys.S;const idx=s.inv.findIndex(i=>i.uid===uid);if(idx<0)return;
  const seal=s.inv[idx];
  if(Game.godFight){UI.toast('Już trwa walka z bogiem!','red');return;}
  s.inv.splice(idx,1);Sys.save();
  UI.closePanel();
  Game.summonGod(seal.god);
};
Sys.grantGodLoot=function(godKey){
  const s=Sys.S;const god=D.GODS[godKey];
  s.godTrophies=s.godTrophies||{};
  const first=!s.godTrophies[godKey];
  s.godTrophies[godKey]=true;
  // relikty
  const relics=D.GOD_RELICS[godKey]||[];
  for(const r of relics){
    if(first||D.chance(0.5)){
      const it=Object.assign({uid:'gr'+(Math.random()*1e9|0),t:'item',rar:'secret',fac:god.fac,lvl:s.lvl,up:0,aff:[],price:8000},r);
      s.inv.push(it);UI.toast('▓ RELIKT: '+r.n+'!','gold');
    }
  }
  s.inv.push(D.makeRune(D.FACTIONS[god.fac].runeCat,'secret'));
  UI.toast('🏆 Trofeum boga: '+god.name+' (+4% obrażeń i HP na stałe)','gold');
  Sys.checkAchievements();Sys.save();
};
// ---------- KONSUMPCYJNE ----------
Sys.useConsumable=function(uid){
  const s=Sys.S;const idx=s.inv.findIndex(i=>i.uid===uid);if(idx<0)return;
  const c=s.inv[idx];const P=Game.player;
  if(c.kind==='bomb'){const pd=C.playerDmg(c.dmg);C.ringFx({x:P.pos.x,z:P.pos.z},0xff7a2b,c.r);
    for(const e of E.enemies){const d=Math.hypot(e.grp.position.x-P.pos.x,e.grp.position.z-P.pos.z);
      if(d<=c.r&&Sys.isHostileTo(e.def.fac))C.damageEnemy(e,pd.dmg,pd.crit);}}
  else if(c.kind==='tp'){Game.travel('wioska');}
  else if(c.kind==='revive'){P.buffs.phoenix={t:9999};UI.refreshBuffs();UI.toast('🪶 Pióro Feniksa aktywne!','gold');}
  else if(c.kind==='food'){P.buffs.regen={t:c.dur||120};UI.refreshBuffs();}
  else if(c.kind==='xp'){Sys.addXp(c.xp||300);}
  else if(c.kind==='de'){if(!s.isGod){UI.toast('Tylko bóg może tego użyć!','red');return;}P.de=Math.min(Sys.totalStats().maxDE,P.de+(c.de||50));}
  s.inv.splice(idx,1);Sys.save();UI.refreshTop();
};
