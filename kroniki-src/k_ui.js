// ================= UI =================
"use strict";
const UI = {};
UI.el=(id)=>document.getElementById(id);

// ---------- TOASTY ----------
UI.toast=function(msg,cls){
  const t=document.createElement('div');t.className='toast'+(cls?' '+cls:'');t.textContent=msg;
  const box=UI.el('toasts');box.appendChild(t);
  while(box.children.length>4)box.firstChild.remove();
  setTimeout(()=>t.remove(),3200);
};
UI.dot=function(id,on){const d=UI.el(id);if(d)d.style.display=on?'block':'none';};

// ---------- HUD ----------
UI.refreshTop=function(){
  const s=Sys.S;if(!s)return;const P=Game.player;if(!P)return;
  const st=Sys.totalStats();
  UI.el('hpF').style.width=(100*P.hp/st.maxHp)+'%';
  UI.el('hpT').textContent=D.fmt(P.hp)+' / '+D.fmt(st.maxHp);
  UI.el('mpF').style.width=(100*P.mana/st.maxMana)+'%';
  UI.el('mpT').textContent=D.fmt(P.mana)+' / '+D.fmt(st.maxMana);
  UI.el('stF').style.width=(100*P.stamina/100)+'%';
  UI.el('goldPill').textContent='🪙 '+D.fmt(s.gold);
  UI.el('repPill').textContent='⭐ '+D.fmt(s.rep[s.faction]||0)+' · '+Sys.repLevel(s.faction).n;
  if(s.isGod){
    UI.el('deBar').style.display='block';
    UI.el('deF').style.width=(100*P.de/st.maxDE)+'%';
    UI.el('deT').textContent='⚡ '+Math.floor(P.de)+' / '+Math.floor(st.maxDE);
    UI.el('lvlBadge').textContent='B'+s.godLvl;
    UI.el('xpF').style.width=(100*s.godXp/D.GOD_XP_FOR(s.godLvl))+'%';
    UI.el('portrait').firstChild.textContent=D.GODS[D.FACTIONS[s.faction].god].ic;
  } else {
    UI.el('deBar').style.display='none';
    UI.el('lvlBadge').textContent=s.lvl;
    UI.el('xpF').style.width=(100*s.xp/D.XP_FOR(s.lvl))+'%';
  }
};
UI.refreshBuffs=function(){
  const P=Game.player;if(!P)return;
  const box=UI.el('buffRow');box.innerHTML='';
  const icons={spd:'💨',dmg:'💪',def:'🪨',regen:'💚',stealth:'🌫️',burn_aura:'♨️',phoenix:'🐦‍🔥',bloodpact:'🩸'};
  for(const k in P.buffs){
    const b=document.createElement('div');b.className='buffIco';
    b.innerHTML=(icons[k]||'✨')+'<span class="bt">'+Math.ceil(P.buffs[k].t)+'</span>';
    box.appendChild(b);
  }
  if(P.shield>0){const b=document.createElement('div');b.className='buffIco';b.innerHTML='🛡️<span class="bt">'+D.fmt(P.shield)+'</span>';box.appendChild(b);}
};
UI.setBoss=function(name,frac){
  UI.el('bossBar').style.display='block';
  UI.el('bossName').textContent=name;
  UI.el('bossF').style.width=(100*Math.max(0,frac))+'%';
};
UI.hideBoss=function(){UI.el('bossBar').style.display='none';};
UI.refreshQuestTrack=function(){
  const s=Sys.S;if(!s)return;
  const mq=D.MAIN_QUESTS[s.mainQuestIdx];
  let html='';
  if(mq){const p=s.questProgress[mq.id]||0;
    html+='<b style="color:#ffd56b;">★ '+mq.n+'</b><br>'+mq.d+' <b>('+Math.min(p,mq.count)+'/'+mq.count+')</b>';}
  else html+='<b style="color:#7dffc7;">Wszystkie główne zadania ukończone!</b>';
  UI.el('questTrack').innerHTML=html;
};

// ---------- PASEK UMIEJĘTNOŚCI ----------
UI.abils=[];
UI.buildAbilBar=function(){
  const s=Sys.S;if(!s)return;
  const bar=UI.el('abilBar');bar.innerHTML='';UI.abils=[];
  // przycisk ataku
  const atk=document.createElement('button');atk.className='abtn big';atk.innerHTML='⚔️';
  atk.addEventListener('pointerdown',(ev)=>{ev.preventDefault();Game.input.attack=true;});
  atk.addEventListener('pointerup',()=>{Game.input.attack=false;});
  atk.addEventListener('pointerleave',()=>{Game.input.attack=false;});
  bar.appendChild(atk);
  let abilities=[];
  if(s.isGod){
    // umiejętności boga: aktywne + specjalne odblokowane
    const tree=Sys.godSkillTree();
    for(const n of tree){
      if(!s.godSkills[n.k])continue;
      if(n.cat==='Aktywna'){const t=D.GOD_ACTIVES_T.find(a=>'a_'+a.k===n.k);if(t)abilities.push({kind:'god',def:t,key:n.k});}
      if(n.cat==='Specjalna'){const g=D.GODS[D.FACTIONS[s.faction].god];const sp=(D.GOD_SPECIALS[g.id]||[]).find(x=>x.id===n.k);
        if(sp)abilities.push({kind:'special',def:sp,key:n.k});}
    }
    abilities=abilities.slice(0,7);
  } else {
    for(const uid of s.activeRunes){
      const r=s.inv.find(i=>i.uid===uid);
      if(r&&r.spell)abilities.push({kind:'rune',def:r.spell,rune:r,key:uid});
    }
  }
  abilities.forEach((ab,i)=>{
    const b=document.createElement('button');b.className='abtn';
    b.innerHTML=ab.def.ic+'<div class="cd" style="display:none;"></div><div class="cost">'+(ab.def.mana?ab.def.mana+'💧':ab.def.de?ab.def.de+'⚡':'')+'</div><div class="key">'+(i+1)+'</div>';
    b.addEventListener('pointerdown',(ev)=>{ev.preventDefault();Game.useAbility(i);});
    bar.appendChild(b);
    UI.abils.push({el:b,ab:ab,cd:0,maxCd:ab.def.cd||1});
  });
  // puste sloty (podpowiedź)
  if(!s.isGod){
    for(let i=abilities.length;i<s.runeSlots;i++){
      const b=document.createElement('button');b.className='abtn empty';b.innerHTML='＋';
      b.addEventListener('click',()=>UI.openPanel('eq','runy'));
      bar.appendChild(b);
    }
  }
};
UI.tickCooldowns=function(dt){
  for(const a of UI.abils){
    if(a.cd>0){a.cd-=dt;
      const cdEl=a.el.querySelector('.cd');
      if(a.cd<=0){cdEl.style.display='none';}
      else{cdEl.style.display='flex';cdEl.textContent=a.cd>10?Math.ceil(a.cd):a.cd.toFixed(1);}
    }
  }
};

// ---------- PANELE ----------
UI.currentPanel=null;
UI.openPanel=function(id,tab){
  UI.currentPanel=id;
  UI.el('panelWrap').style.display='flex';
  UI.renderPanel(id,tab);
};
UI.closePanel=function(){UI.el('panelWrap').style.display='none';UI.currentPanel=null;};
UI.el('panelClose').addEventListener('click',()=>UI.closePanel());
UI.el('panelWrap').addEventListener('click',(e)=>{if(e.target===UI.el('panelWrap'))UI.closePanel();});
document.querySelectorAll('.mBtn').forEach(b=>{
  b.addEventListener('click',()=>{UI.openPanel(b.dataset.panel);
    if(b.dataset.panel==='klan')UI.dot('klanDot',false);
    if(b.dataset.panel==='misje')UI.dot('misjeDot',false);});
});

UI.setTabs=function(tabs,active,cb){
  const box=UI.el('panelTabs');box.innerHTML='';
  tabs.forEach(t=>{
    const b=document.createElement('button');b.className='ptab'+(t.id===active?' on':'');b.textContent=t.n;
    b.addEventListener('click',()=>cb(t.id));box.appendChild(b);
  });
};
UI.rarSpan=(rar)=>'<span class="q-'+rar+'">'+D.RARITY[rar].name+'</span>';

UI.renderPanel=function(id,tab){
  const s=Sys.S;const B=UI.el('panelBody');const T=UI.el('panelTitle');
  UI.el('panelTabs').innerHTML='';
  // ===== EKWIPUNEK =====
  if(id==='eq'){
    T.textContent='🎒 Ekwipunek';
    tab=tab||'zalozone';
    UI.setTabs([{id:'zalozone',n:'Założone'},{id:'przedmioty',n:'Przedmioty'},{id:'runy',n:'Runy'},{id:'mikstury',n:'Mikstury'},{id:'surowce',n:'Surowce'},{id:'staty',n:'Statystyki'}],tab,(t)=>UI.renderPanel('eq',t));
    if(tab==='zalozone'){
      let h='<div class="equipGrid">';
      for(const slot of D.EQUIP_SLOTS){
        const it=s.equip[slot];const m=D.SLOT_META[slot];
        h+='<div class="eqSlot" data-slot="'+slot+'"><div class="sl">'+m.n+'</div><div class="ei">'+(it?it.ic:m.ic)+'</div><div class="en">'+(it?('<span class="q-'+it.rar+'">'+it.n+(it.up?' +'+it.up:'')+'</span>'):'—')+'</div></div>';
      }
      h+='</div><div class="hint" style="color:#8a78ad;font-size:10.5px;margin-top:8px;">Dotknij slotu, aby zdjąć przedmiot.</div>';
      B.innerHTML=h;
      B.querySelectorAll('.eqSlot').forEach(el=>el.addEventListener('click',()=>{Sys.unequip(el.dataset.slot);UI.renderPanel('eq','zalozone');}));
    } else if(tab==='przedmioty'){
      const items=s.inv.filter(i=>i.t==='item');
      B.innerHTML=items.length?'':'<i>Brak przedmiotów. Zdobywaj je w walce!</i>';
      items.sort((a,b)=>D.RARITY[b.rar].ord-D.RARITY[a.rar].ord);
      for(const it of items){
        const row=document.createElement('div');row.className='rowItem';
        row.innerHTML='<div class="ic">'+it.ic+'</div><div class="info"><div class="nm"><span class="q-'+it.rar+'">'+it.n+(it.up?' +'+it.up:'')+'</span></div>'+
          '<div class="ds">'+D.SLOT_META[it.slot].n+' · '+(it.dmg?'⚔️'+Math.round(it.dmg*(1+(it.up||0)*0.12)):'')+(it.def?'🛡️'+Math.round(it.def*(1+(it.up||0)*0.12)):'')+
          (it.aff&&it.aff.length?' · '+it.aff.map(a=>a.txt).join(', '):'')+(it.fxd?' · <span style="color:#ffd56b">'+it.fxd+'</span>':'')+'</div></div>'+
          '<div class="act"><button class="sbtn gold" data-a="eq">Załóż</button><button class="sbtn red" data-a="sell">'+Math.round((it.price||100)*D.SELL_MUL)+'🪙</button></div>';
        row.querySelector('[data-a=eq]').addEventListener('click',()=>{Sys.equipItem(it.uid);UI.renderPanel('eq','przedmioty');UI.refreshTop();});
        row.querySelector('[data-a=sell]').addEventListener('click',()=>{Sys.sellItem(it.uid);UI.renderPanel('eq','przedmioty');});
        B.appendChild(row);
      }
    } else if(tab==='runy'){
      const runes=s.inv.filter(i=>i.t==='rune');
      let h='<div class="hint" style="color:#8a78ad;font-size:11px;margin-bottom:8px;">Sloty: '+s.activeRunes.length+'/'+s.runeSlots+' · Nieaktywne runy aktywuj u Runologa w wiosce.</div>';
      B.innerHTML=h+(runes.length?'':'<i>Brak run. Wypadają z wrogów!</i>');
      runes.sort((a,b)=>D.RARITY[b.rar].ord-D.RARITY[a.rar].ord);
      for(const r of runes){
        const inSlot=s.activeRunes.includes(r.uid);
        const row=document.createElement('div');row.className='rowItem';
        row.innerHTML='<div class="ic">'+r.ic+'</div><div class="info"><div class="nm"><span class="q-'+r.rar+'">'+r.n+(r.up?' +'+r.up:'')+'</span>'+(inSlot?' <span style="color:#7dffc7">[SLOT]</span>':'')+'</div>'+
          '<div class="ds">'+(r.spell?(r.spell.ic+' '+r.spell.n+' — '+r.spell.d+' Moc ×'+D.spellPower(r).toFixed(2)):'<i>Nieaktywowana</i>')+'</div></div>'+
          '<div class="act">'+(r.spell?'<button class="sbtn gold" data-a="slot">'+(inSlot?'Zdejmij':'Do slotu')+'</button>':'')+
          '<button class="sbtn" data-a="up">Ulepsz</button></div>';
        const sb=row.querySelector('[data-a=slot]');
        if(sb)sb.addEventListener('click',()=>{Sys.slotRune(r.uid);UI.renderPanel('eq','runy');});
        row.querySelector('[data-a=up]').addEventListener('click',()=>{Sys.upgradeRune(r.uid);UI.renderPanel('eq','runy');});
        B.appendChild(row);
      }
    } else if(tab==='mikstury'){
      const pots=s.inv.filter(i=>i.t==='potion');
      B.innerHTML=pots.length?'':'<i>Brak mikstur.</i>';
      for(const p of pots){
        const row=document.createElement('div');row.className='rowItem';
        row.innerHTML='<div class="ic">'+p.ic+'</div><div class="info"><div class="nm">'+p.n+'</div><div class="ds">'+(p.heal?'Leczy '+p.heal+' HP':'')+(p.mana?'+'+p.mana+' many':'')+(p.buff?'Wzmocnienie na '+p.dur+'s':'')+'</div></div>'+
          '<div class="act"><button class="sbtn gold">Użyj</button></div>';
        row.querySelector('button').addEventListener('click',()=>{Sys.usePotion(p.uid);UI.renderPanel('eq','mikstury');UI.refreshTop();});
        B.appendChild(row);
      }
    } else if(tab==='surowce'){
      const keys=Object.keys(s.resBag);
      B.innerHTML=keys.length?'':'<i>Brak surowców. Zbieraj je w regionach (⛏️) i z wrogów.</i>';
      for(const k of keys){
        const row=document.createElement('div');row.className='rowItem';
        row.innerHTML='<div class="ic">⛏️</div><div class="info"><div class="nm">'+k+'</div></div><div class="act"><b>×'+s.resBag[k]+'</b></div>';
        B.appendChild(row);
      }
    } else if(tab==='staty'){
      const st=Sys.totalStats();
      B.innerHTML='<div class="statGrid">'+
        '<div><span>❤️ HP</span><b>'+D.fmt(st.maxHp)+'</b></div><div><span>⚔️ Obrażenia</span><b>'+D.fmt(st.dmg)+'</b></div>'+
        '<div><span>🛡️ Obrona</span><b>'+st.def+'</b></div><div><span>💧 Mana</span><b>'+D.fmt(st.maxMana)+'</b></div>'+
        '<div><span>✦ Kryt.</span><b>'+st.crit.toFixed(0)+'%</b></div><div><span>💨 Szybkość</span><b>'+st.spd.toFixed(1)+'</b></div>'+
        '<div><span>🩸 Wampiryzm</span><b>'+st.leech+'%</b></div><div><span>⭐ Reputacja</span><b>'+(s.rep[s.faction]||0)+'</b></div></div>'+
        '<div class="secH">Postępy</div><div class="statGrid">'+
        '<div><span>Zabójstwa</span><b>'+s.stats.kills+'</b></div><div><span>Bossowie</span><b>'+s.stats.bossKills+'</b></div>'+
        '<div><span>Rekrutacje</span><b>'+s.stats.recruited+'</b></div><div><span>Runy aktywowane</span><b>'+s.stats.runesActivated+'</b></div>'+
        '<div><span>Surowce</span><b>'+s.stats.resources+'</b></div><div><span>Śmierci</span><b>'+s.stats.deaths+'</b></div></div>';
    }
  }
  // ===== KLAN =====
  else if(id==='klan'){
    T.textContent='👥 Klan — poziom '+s.clanLvl;
    tab=tab||'postacie';
    UI.setTabs([{id:'postacie',n:'Postacie ('+s.clan.length+'/'+Sys.clanCap()+')'},{id:'misjeKlanu',n:'Misje'},{id:'rozwoj',n:'Rozwój klanu'}],tab,(t)=>UI.renderPanel('klan',t));
    if(tab==='postacie'){
      B.innerHTML=s.clan.length?'':'<i>Klan pusty. Pokonani wrogowie mają szansę dołączyć (im niższy tier, tym łatwiej).</i>';
      for(const u of s.clan){
        const fac=D.FACTIONS[u.fac];
        const row=document.createElement('div');row.className='rowItem';
        row.innerHTML='<div class="ic">'+fac.icon+'</div><div class="info"><div class="nm" style="color:'+fac.css+'">'+u.name+(u.shadow?' 👤':'')+'</div>'+
          '<div class="ds">'+fac.name+' · Tier '+u.tier+' · Poz. '+u.lvl+(u.onMission?' · <span style="color:#ffd56b">NA MISJI</span>':'')+'</div></div>'+
          '<div class="act"><button class="sbtn" '+(u.onMission?'disabled':'')+'>Ulepsz '+Math.round(80*Math.pow(1.5,u.up||0)*u.tier)+'🪙</button></div>';
        row.querySelector('button').addEventListener('click',()=>{Sys.upgradeClanUnit(u.uid);UI.renderPanel('klan','postacie');});
        B.appendChild(row);
      }
    } else if(tab==='misjeKlanu'){
      let h='';
      // aktywne misje
      if(s.missions.length){h+='<div class="secH">W toku</div>';
        for(const mi of s.missions){const m=D.CLAN_MISSIONS.find(x=>x.id===mi.mid);
          const left=Math.max(0,Math.ceil((mi.end-D.now())/1000));
          h+='<div class="rowItem"><div class="ic">'+m.ic+'</div><div class="info"><div class="nm">'+m.n+'</div><div class="ds">'+mi.units.length+' postaci · pozostało '+Math.floor(left/60)+'m '+(left%60)+'s</div></div></div>';}}
      B.innerHTML=h+'<div class="secH">Dostępne misje</div>';
      for(const m of D.CLAN_MISSIONS){
        const row=document.createElement('div');row.className='rowItem';
        row.innerHTML='<div class="ic">'+m.ic+'</div><div class="info"><div class="nm">'+m.n+'</div>'+
          '<div class="ds">'+m.d+' · min. '+m.min+' postaci · '+Math.floor(m.dur/60)+' min · '+m.gold[0]+'–'+m.gold[1]+'🪙</div></div>'+
          '<div class="act"><button class="sbtn gold">Wyślij</button></div>';
        row.querySelector('button').addEventListener('click',()=>{
          const free=s.clan.filter(c=>!c.onMission).slice(0,Math.max(m.min,3)).map(c=>c.uid);
          Sys.startClanMission(m.id,free);UI.renderPanel('klan','misjeKlanu');
        });
        B.appendChild(row);
      }
    } else if(tab==='rozwoj'){
      let h='';
      D.CLAN_LEVELS.forEach(cl=>{
        const cur=cl.lvl===s.clanLvl;
        h+='<div class="rowItem" style="'+(cur?'border-color:#ffd56b;':'')+'"><div class="ic">'+(cl.lvl<=s.clanLvl?'✅':'🔒')+'</div>'+
        '<div class="info"><div class="nm">Poziom '+cl.lvl+'</div><div class="ds">'+cl.req+' · '+cl.cap+' miejsc'+(cl.dmg?' · +'+cl.dmg+'% obr.':'')+(cl.hp?' · +'+cl.hp+'% HP':'')+'</div></div></div>';
      });
      h+='<div class="hint" style="color:#8a78ad;font-size:11px;">Rekrutacje: '+s.stats.recruited+' · Misje ukończone: '+s.clanMissionsDone+'</div>';
      B.innerHTML=h;
    }
  }
  // ===== MISJE / TABLICA =====
  else if(id==='misje'||id==='tablica'){
    T.textContent='📜 Zadania';
    Sys.genDailyQuests();
    let h='<div class="secH">★ Główna ścieżka</div>';
    D.MAIN_QUESTS.forEach((mq,i)=>{
      const done=i<s.mainQuestIdx;const cur=i===s.mainQuestIdx;
      if(i>s.mainQuestIdx+1)return;
      h+='<div class="rowItem" style="'+(cur?'border-color:#ffd56b;':'')+'"><div class="ic">'+(done?'✅':cur?'⭐':'🔒')+'</div><div class="info"><div class="nm">'+mq.n+'</div><div class="ds">'+mq.d+(cur?' ('+(s.questProgress[mq.id]||0)+'/'+mq.count+')':'')+'</div></div></div>';
    });
    h+='<div class="secH">Zlecenia dzienne</div>';
    B.innerHTML=h;
    for(const q of s.quests){
      const row=document.createElement('div');row.className='rowItem';
      row.innerHTML='<div class="ic">'+(q.claimed?'✅':q.done?'🎁':'📜')+'</div><div class="info"><div class="nm">'+q.n+'</div>'+
        '<div class="ds">'+q.d+' ('+Math.min(q.prog,q.count)+'/'+q.count+') · '+q.gold+'🪙 · '+q.xp+' XP</div></div>'+
        '<div class="act">'+(q.done&&!q.claimed?'<button class="sbtn gold">Odbierz</button>':'')+'</div>';
      const btn=row.querySelector('button');
      if(btn)btn.addEventListener('click',()=>{Sys.claimQuest(q.uid);UI.renderPanel('misje');});
      B.appendChild(row);
    }
  }
  // ===== SKLEP =====
  else if(id==='sklep'){
    T.textContent='🛒 Sklep — Kupiec Bartuś';
    const disc=Sys.repLevel(s.faction).shopDiscount;
    B.innerHTML='<div class="hint" style="color:#8a78ad;margin-bottom:8px;">Zniżka za reputację: '+disc+'%</div>';
    for(const st of D.SHOP_STOCK){
      let n,ic,price,buy;
      if(st.t==='potion'){const p=D.POTIONS.find(x=>x.id===st.id);n=p.n;ic=p.ic;price=p.price;
        buy=()=>{s.inv.push(Object.assign({},p,{t:'potion',uid:'p'+(Math.random()*1e9|0)}));};}
      else if(st.t==='item'){n=D.RARITY[st.rar].name+' przedmiot: '+D.SLOT_META[st.slot].n;ic=D.SLOT_META[st.slot].ic;price=st.price;
        buy=()=>{s.inv.push(D.makeItem(st.slot,st.rar,s.lvl,s.faction));};}
      else {n='Runa losowa ('+D.RARITY[st.rar].name+')';ic='🌀';price=st.price;
        buy=()=>{s.inv.push(D.makeRune(D.FACTIONS[s.faction].runeCat,st.rar));};}
      price=Math.round(price*(1-disc/100));
      const row=document.createElement('div');row.className='rowItem';
      row.innerHTML='<div class="ic">'+ic+'</div><div class="info"><div class="nm">'+n+'</div></div><div class="act"><button class="sbtn gold">'+price+'🪙</button></div>';
      row.querySelector('button').addEventListener('click',()=>{if(Sys.spendGold(price)){buy();Sys.save();UI.toast('✅ Kupiono: '+n,'green');}});
      B.appendChild(row);
    }
  }
  // ===== KOWAL =====
  else if(id==='kowal'){
    T.textContent='⚒️ Kowal Gromir';
    B.innerHTML='<div class="hint" style="color:#8a78ad;margin-bottom:8px;">Ulepszanie założonych przedmiotów: koszt złota + surowce (dowolne).</div>';
    for(const slot of D.EQUIP_SLOTS){
      const it=s.equip[slot];const m=D.SLOT_META[slot];
      const row=document.createElement('div');row.className='rowItem';
      if(it){
        const cost=D.SMITH_COST(it.up||0),res=D.SMITH_RES(it.up||0);
        row.innerHTML='<div class="ic">'+it.ic+'</div><div class="info"><div class="nm"><span class="q-'+it.rar+'">'+it.n+' +'+(it.up||0)+'</span></div>'+
          '<div class="ds">'+(it.dmg?'⚔️'+Math.round(it.dmg*(1+(it.up||0)*0.12))+' → '+Math.round(it.dmg*(1+((it.up||0)+1)*0.12)):'🛡️'+Math.round(it.def*(1+(it.up||0)*0.12))+' → '+Math.round(it.def*(1+((it.up||0)+1)*0.12)))+'</div></div>'+
          '<div class="act"><button class="sbtn gold">'+cost+'🪙 + '+res+'⛏️</button></div>';
        row.querySelector('button').addEventListener('click',()=>{Sys.smithUpgrade(slot);UI.renderPanel('kowal');UI.refreshTop();});
      } else row.innerHTML='<div class="ic">'+m.ic+'</div><div class="info"><div class="nm">'+m.n+'</div><div class="ds"><i>pusty slot</i></div></div>';
      B.appendChild(row);
    }
  }
  // ===== RUNOLOG =====
  else if(id==='runolog'){
    T.textContent='🔮 Runolog Vex';
    const runes=s.inv.filter(i=>i.t==='rune'&&!i.spell);
    B.innerHTML='<div class="hint" style="color:#8a78ad;margin-bottom:8px;">Aktywacja zamienia runę w losowe zaklęcie z jej kategorii. Koszt zależy od rzadkości.</div>';
    if(!runes.length)B.innerHTML+='<i>Brak nieaktywowanych run.</i>';
    for(const r of runes){
      const cost=80*(D.RARITY[r.rar].ord+1);
      const row=document.createElement('div');row.className='rowItem';
      row.innerHTML='<div class="ic">'+r.ic+'</div><div class="info"><div class="nm"><span class="q-'+r.rar+'">'+r.n+'</span></div><div class="ds">Kategoria: '+r.cat+'</div></div>'+
        '<div class="act"><button class="sbtn gold">Aktywuj '+cost+'🪙</button></div>';
      row.querySelector('button').addEventListener('click',()=>{Sys.activateRune(r.uid);UI.renderPanel('runolog');});
      B.appendChild(row);
    }
  }
  // ===== TAWERNA =====
  else if(id==='tawerna'){
    T.textContent='🍺 Tawerna „Pod Śpiącym Smokiem"';
    tab=tab||'sojusze';
    UI.setTabs([{id:'sojusze',n:'Sojusze'},{id:'plotki',n:'Plotki'}],tab,(t)=>UI.renderPanel('tawerna',t));
    if(tab==='sojusze'){
      B.innerHTML='<div class="hint" style="color:#8a78ad;margin-bottom:8px;">Możesz mieć 1 sojusz. Sojusznicza frakcja nie atakuje, daje dostęp do misji. Zerwanie utrudnia odnowienie (300 rep.).</div>';
      for(const f of D.PLAYABLE){
        if(f===s.faction)continue;
        const fac=D.FACTIONS[f];const rep=s.rep[f]||0;const isAlly=s.ally===f;
        const row=document.createElement('div');row.className='rowItem';
        row.innerHTML='<div class="ic">'+fac.icon+'</div><div class="info"><div class="nm" style="color:'+fac.css+'">'+fac.name+'</div>'+
          '<div class="ds">Reputacja: '+rep+(s.allyBroken[f]?' · <span style="color:#ff8da3">zerwany sojusz</span>':'')+'</div></div>'+
          '<div class="act">'+(isAlly?'<button class="sbtn red">Zerwij</button>':'<button class="sbtn gold">Sojusz</button>')+'</div>';
        row.querySelector('button').addEventListener('click',()=>{
          if(isAlly)Sys.breakAlliance();else Sys.makeAlliance(f);
          UI.renderPanel('tawerna','sojusze');
        });
        B.appendChild(row);
      }
    } else {
      B.innerHTML='<div class="rowItem"><div class="ic">🗣️</div><div class="info"><div class="ds">„Mówią, że kto pokona boga swojej frakcji w Świątyni, może przejąć jego moc… ale cena jest straszna."</div></div></div>'+
        '<div class="rowItem"><div class="ic">🗣️</div><div class="info"><div class="ds">„Demony atakują wioskę coraz częściej. Ich pan, Upadły, czeka w Piekielnej Otchłani."</div></div></div>'+
        '<div class="rowItem"><div class="ic">🗣️</div><div class="info"><div class="ds">„Runolog Vex potrafi obudzić moc uśpioną w runach. Im rzadsza runa, tym potężniejsze zaklęcie."</div></div></div>'+
        '<div class="rowItem"><div class="ic">🗣️</div><div class="info"><div class="ds">„Bossowie regionów zawsze coś przy sobie mają. Zawsze."</div></div></div>';
    }
  }
  // ===== MAGAZYN =====
  else if(id==='magazyn'){
    T.textContent='📦 Magazyn';
    B.innerHTML='<div class="hint" style="color:#8a78ad;">Wszystkie twoje zapasy w jednym miejscu (podgląd).</div>'+
      '<div class="secH">Podsumowanie</div><div class="statGrid">'+
      '<div><span>Przedmioty</span><b>'+s.inv.filter(i=>i.t==='item').length+'</b></div>'+
      '<div><span>Runy</span><b>'+s.inv.filter(i=>i.t==='rune').length+'</b></div>'+
      '<div><span>Mikstury</span><b>'+s.inv.filter(i=>i.t==='potion').length+'</b></div>'+
      '<div><span>Surowce</span><b>'+Object.values(s.resBag).reduce((a,b)=>a+b,0)+'</b></div></div>';
  }
  // ===== ŚWIĄTYNIA =====
  else if(id==='swiatynia'){
    T.textContent='🔱 Świątynia Bogów';
    const god=D.GODS[D.FACTIONS[s.faction].god];
    let h='<div style="text-align:center;padding:6px;"><div style="font-size:44px;">'+god.ic+'</div>'+
      '<div style="font-size:16px;font-weight:800;color:'+D.FACTIONS[s.faction].css+';">'+god.name+'</div>'+
      '<div style="font-size:11px;color:#9d8fc0;margin:6px 0 12px;">'+god.lore+'</div></div>';
    if(s.isGod){
      h+='<div class="rowItem"><div class="ic">🔱</div><div class="info"><div class="nm">Jesteś bogiem.</div><div class="ds">Twoja domena czeka w Wymiarze Bogów. Wyznawcy: '+s.followers+'</div></div></div>';
      B.innerHTML=h;return;
    }
    if(!s.godSlain){
      h+='<div class="rowItem"><div class="ic">⚔️</div><div class="info"><div class="nm">Wyzwij boga swojej frakcji</div>'+
        '<div class="ds">Bóg zstąpi w osłabionej formie ('+D.fmt(20000)+' HP). Pokonaj go, by zdobyć jego ducha. Zalecany poziom 25+.</div></div>'+
        '<div class="act"><button class="sbtn red" id="challengeGod">WYZWIJ</button></div></div>';
    } else {
      h+='<div class="rowItem"><div class="ic">👻</div><div class="info"><div class="nm">Duch boga w twoim władaniu</div>'+
        '<div class="ds">Poświęć WSZYSTKIE postacie z klanu ('+s.clan.length+') — staną się twoimi wyznawcami. Twoja postać przemieni się w boga.</div></div>'+
        '<div class="act"><button class="sbtn gold" id="ascendBtn">PRZEMIANA</button></div></div>';
    }
    h+='<div class="secH">Łaska boga</div><div class="rowItem"><div class="ic">🙏</div><div class="info"><div class="ds">Ofiara 200🪙 — błogosławieństwo (+20% obrażeń na 5 min).</div></div>'+
      '<div class="act"><button class="sbtn" id="blessBtn">Ofiaruj</button></div></div>';
    B.innerHTML=h;
    const cg=UI.el('challengeGod');
    if(cg)cg.addEventListener('click',()=>{UI.closePanel();Game.startGodFight(false);});
    const ab=UI.el('ascendBtn');
    if(ab)ab.addEventListener('click',()=>{
      if(Sys.ascend()){UI.closePanel();Game.onAscend();}
    });
    const bb=UI.el('blessBtn');
    if(bb)bb.addEventListener('click',()=>{
      if(Sys.spendGold(200)){Game.player.buffs.dmg={t:300};UI.refreshBuffs();UI.toast('🙏 Błogosławieństwo boga!','gold');}
    });
  }
  // ===== BÓG (drzewko) =====
  else if(id==='bog'){
    const god=D.GODS[D.FACTIONS[s.faction].god];
    if(!s.isGod){
      T.textContent='🔱 Droga Boga';
      B.innerHTML='<div style="text-align:center;padding:14px;"><div style="font-size:44px;">'+god.ic+'</div>'+
        '<div style="font-size:15px;font-weight:800;">'+god.name+'</div>'+
        '<div style="font-size:11.5px;color:#9d8fc0;margin:8px 0;">'+god.lore+'</div>'+
        '<div class="secH">Jak zostać bogiem?</div>'+
        '<div style="text-align:left;font-size:12px;line-height:1.8;">1. Osiągnij potęgę (zalecany poz. 25+).<br>2. Pokonaj boga frakcji w Świątyni — zdobądź jego ducha.<br>3. Poświęć wszystkie postacie klanu (staną się wyznawcami).<br>4. Dokonaj przemiany. Twoja postać stanie się bogiem z ~50 umiejętnościami.<br>5. Wejdź do Wymiaru Bogów i rzuć wyzwanie Upadłemu.</div></div>';
      return;
    }
    T.textContent='🔱 '+god.name+' — poz. '+s.godLvl+' · Punkty: '+s.godPoints;
    tab=tab||'Aktywna';
    UI.setTabs([{id:'Aktywna',n:'Aktywne'},{id:'Pasywna',n:'Pasywne'},{id:'Specjalna',n:'Specjalne'},{id:'Ulepszenie',n:'Ulepszenia'}],tab,(t)=>UI.renderPanel('bog',t));
    const nodes=Sys.godSkillTree().filter(n=>n.cat===tab);
    B.innerHTML='<div class="hint" style="color:#8a78ad;margin-bottom:6px;">Punkty boskie: <b style="color:#ffd56b">'+s.godPoints+'</b> (+2 za poziom boga) · Wyznawcy: '+s.followers+'</div>';
    for(const n of nodes){
      const owned=!!s.godSkills[n.k];
      const div=document.createElement('div');div.className='skillNode '+(owned?'owned':s.godPoints>=n.cost?'avail':'locked');
      div.innerHTML='<div class="si">'+n.ic+'</div><div class="sn">'+n.n+'</div><div class="sd">'+n.d+'</div><div class="sd" style="color:#ffd56b">'+(owned?'✓ posiadane':'koszt: '+n.cost)+'</div>';
      div.addEventListener('click',()=>{if(!owned){Sys.buyGodSkill(n.k);UI.renderPanel('bog',tab);}});
      B.appendChild(div);
    }
  }
  // ===== OPCJE =====
  else if(id==='opcje'){
    T.textContent='⚙️ Opcje';
    B.innerHTML='<div class="rowItem"><div class="ic">💾</div><div class="info"><div class="nm">Zapis gry</div><div class="ds">Gra zapisuje się automatycznie.</div></div><div class="act"><button class="sbtn gold" id="saveNow">Zapisz teraz</button></div></div>'+
      '<div class="rowItem"><div class="ic">✨</div><div class="info"><div class="nm">Bloom (poświata)</div></div><div class="act"><button class="sbtn" id="bloomTgl">'+(W.bloomOn!==false?'WŁ':'WYŁ')+'</button></div></div>'+
      '<div class="rowItem"><div class="ic">🗑️</div><div class="info"><div class="nm">Nowa gra</div><div class="ds">Kasuje CAŁY postęp!</div></div><div class="act"><button class="sbtn red" id="wipeBtn">Resetuj</button></div></div>'+
      '<div class="hint" style="color:#6e5d8c;font-size:10px;margin-top:10px;">Kroniki Bogów — wersja robocza. Sterowanie: WASD/strzałki + myszka lub joystick + przyciski (mobile). Spacja/⚔️ = atak, 1–7 = zaklęcia, E = interakcja.</div>';
    UI.el('saveNow').addEventListener('click',()=>{Sys.save();UI.toast('💾 Zapisano!','green');});
    UI.el('bloomTgl').addEventListener('click',()=>{W.bloomOn=W.bloomOn===false?true:false;UI.renderPanel('opcje');});
    UI.el('wipeBtn').addEventListener('click',()=>{if(confirm('Na pewno skasować cały postęp?')){Sys.wipe();location.reload();}});
  }
};

// ---------- INTERAKCJA ----------
UI.showInteract=function(label,icon){
  const el=UI.el('interactHint');el.style.display='block';el.textContent=(icon||'')+' '+label+' — [E]';
};
UI.hideInteract=function(){UI.el('interactHint').style.display='none';};
UI.el('interactHint').addEventListener('pointerdown',(e)=>{e.preventDefault();Game.tryInteract();});

// ---------- BANERY ----------
UI.banner=function(msg,ms){
  const b=UI.el('eventBanner');b.textContent=msg;b.style.display='block';
  clearTimeout(UI._bt);UI._bt=setTimeout(()=>{b.style.display='none';},ms||4000);
};
