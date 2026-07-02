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
    UI.setTabs([{id:'zalozone',n:'Założone'},{id:'przedmioty',n:'Przedmioty'},{id:'runy',n:'Runy'},{id:'mikstury',n:'Mikstury'},{id:'specjalne',n:'Specjalne'},{id:'surowce',n:'Surowce'},{id:'staty',n:'Statystyki'}],tab,(t)=>UI.renderPanel('eq',t));
    if(tab==='zalozone'){
      let h='<div class="equipGrid">';
      for(const slot of D.EQUIP_SLOTS){
        const it=s.equip[slot];const m=D.SLOT_META[slot];
        h+='<div class="eqSlot" data-slot="'+slot+'"><div class="sl">'+m.n+'</div><div class="ei"><img src="'+(it?D.itemIconURL(it):D.slotIconURL(slot))+'" style="width:34px;height:34px;border-radius:8px;'+(it?'':'opacity:.45;')+'"></div><div class="en">'+(it?('<span class="q-'+it.rar+'">'+it.n+(it.up?' +'+it.up:'')+'</span>'):'—')+'</div></div>';
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
        row.innerHTML='<div class="ic">'+D.icoImg(it)+'</div><div class="info"><div class="nm"><span class="q-'+it.rar+'">'+it.n+(it.up?' +'+it.up:'')+'</span></div>'+
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
        row.innerHTML='<div class="ic">'+D.icoImg(r)+'</div><div class="info"><div class="nm"><span class="q-'+r.rar+'">'+r.n+(r.up?' +'+r.up:'')+'</span>'+(inSlot?' <span style="color:#7dffc7">[SLOT]</span>':'')+'</div>'+
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
        row.innerHTML='<div class="ic">'+D.icoImg(p)+'</div><div class="info"><div class="nm">'+p.n+'</div><div class="ds">'+(p.heal?'Leczy '+p.heal+' HP':'')+(p.mana?'+'+p.mana+' many':'')+(p.buff?'Wzmocnienie na '+p.dur+'s':'')+'</div></div>'+
          '<div class="act"><button class="sbtn gold">Użyj</button></div>';
        row.querySelector('button').addEventListener('click',()=>{Sys.usePotion(p.uid);UI.renderPanel('eq','mikstury');UI.refreshTop();});
        B.appendChild(row);
      }
    } else if(tab==='specjalne'){
      const sp=s.inv.filter(i=>i.t==='seal'||i.kind);
      B.innerHTML=sp.length?'':'<i>Brak przedmiotów specjalnych. Pieczęcie bogów wykuwasz w Świątyni, bomby i zwoje kupisz w sklepie.</i>';
      for(const c of sp){
        const row=document.createElement('div');row.className='rowItem';
        const isSeal=c.t==='seal';
        const icn=isSeal?D.iconFor('rune','secret',D.FACTIONS[D.GODS[c.god].fac].css):D.iconFor(c.kind==='bomb'?'gold':c.kind==='tp'?'scroll':c.kind==='revive'?'amulet':c.kind==='xp'?'scroll':'potion',null,'#ffb13b');
        row.innerHTML='<div class="ic"><img src="'+icn+'" style="width:34px;height:34px;border-radius:8px;"></div><div class="info"><div class="nm">'+c.n+'</div><div class="ds">'+(c.d||'')+'</div></div>'+
          '<div class="act"><button class="sbtn gold">Użyj</button></div>';
        row.querySelector('button').addEventListener('click',()=>{
          if(isSeal)Sys.useSeal(c.uid);else{Sys.useConsumable(c.uid);UI.renderPanel('eq','specjalne');}
        });
        B.appendChild(row);
      }
    } else if(tab==='surowce'){
      const keys=Object.keys(s.resBag);
      B.innerHTML=keys.length?'':'<i>Brak surowców. Zbieraj je w regionach (⛏️) i z wrogów.</i>';
      for(const k of keys){
        const row=document.createElement('div');row.className='rowItem';
        row.innerHTML='<div class="ic"><img src="'+D.iconFor('res',null,'#7dffc7')+'" style="width:34px;height:34px;border-radius:8px;"></div><div class="info"><div class="nm">'+k+'</div></div><div class="act"><b>×'+s.resBag[k]+'</b></div>';
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
    h+='<div class="secH">Osiągnięcia ('+Object.keys(s.achievements||{}).length+'/'+D.ACHIEVEMENTS.length+')</div>';
    for(const a of D.ACHIEVEMENTS){
      const got=s.achievements&&s.achievements[a.id];
      h+='<div class="rowItem" style="'+(got?'border-color:#7dffc7;':'opacity:.7;')+'"><div class="ic">'+(got?'🏆':'▫️')+'</div><div class="info"><div class="nm">'+a.n+'</div><div class="ds">'+a.d+' · '+a.gold+'🪙</div></div></div>';
    }
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
    for(const c of D.CONSUMABLES){
      const row=document.createElement('div');row.className='rowItem';
      const icn=D.iconFor(c.kind==='bomb'?'gold':c.kind==='tp'||c.kind==='xp'?'scroll':c.kind==='revive'?'amulet':'potion',null,'#ffb13b');
      row.innerHTML='<div class="ic"><img src="'+icn+'" style="width:34px;height:34px;border-radius:8px;"></div><div class="info"><div class="nm">'+c.n+'</div><div class="ds">'+c.d+'</div></div>'+
        '<div class="act"><button class="sbtn gold">'+c.price+'🪙</button></div>';
      row.querySelector('button').addEventListener('click',()=>{
        if(Sys.spendGold(c.price)){s.inv.push(Object.assign({},c,{uid:'c'+(Math.random()*1e9|0)}));Sys.save();UI.toast('✅ '+c.n,'green');}
      });
      B.appendChild(row);
    }
    for(const st of D.SHOP_STOCK){
      let n,icurl,price,buy;
      if(st.t==='potion'){const p=D.POTIONS.find(x=>x.id===st.id);n=p.n;icurl=D.itemIconURL(Object.assign({t:'potion'},p));price=p.price;
        buy=()=>{s.inv.push(Object.assign({},p,{t:'potion',uid:'p'+(Math.random()*1e9|0)}));};}
      else if(st.t==='item'){n=D.RARITY[st.rar].name+' przedmiot: '+D.SLOT_META[st.slot].n;icurl=D.iconFor(st.slot==='weapon'?(D.WEAPON_KIND[s.faction]||'sword'):st.slot==='helm'?'helm':st.slot==='chest'?'chest':'ring',st.rar,D.FACTIONS[s.faction].css);price=st.price;
        buy=()=>{s.inv.push(D.makeItem(st.slot,st.rar,s.lvl,s.faction));};}
      else {n='Runa losowa ('+D.RARITY[st.rar].name+')';icurl=D.iconFor('rune',st.rar,D.RUNE_CATS[D.FACTIONS[s.faction].runeCat].col);price=st.price;
        buy=()=>{s.inv.push(D.makeRune(D.FACTIONS[s.faction].runeCat,st.rar));};}
      price=Math.round(price*(1-disc/100));
      const row=document.createElement('div');row.className='rowItem';
      row.innerHTML='<div class="ic"><img src="'+icurl+'" style="width:34px;height:34px;border-radius:8px;"></div><div class="info"><div class="nm">'+n+'</div></div><div class="act"><button class="sbtn gold">'+price+'🪙</button></div>';
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
        row.innerHTML='<div class="ic">'+D.icoImg(it)+'</div><div class="info"><div class="nm"><span class="q-'+it.rar+'">'+it.n+' +'+(it.up||0)+'</span></div>'+
          '<div class="ds">'+(it.dmg?'⚔️'+Math.round(it.dmg*(1+(it.up||0)*0.12))+' → '+Math.round(it.dmg*(1+((it.up||0)+1)*0.12)):'🛡️'+Math.round(it.def*(1+(it.up||0)*0.12))+' → '+Math.round(it.def*(1+((it.up||0)+1)*0.12)))+'</div></div>'+
          '<div class="act"><button class="sbtn gold">'+cost+'🪙 + '+res+'⛏️</button></div>';
        row.querySelector('button').addEventListener('click',()=>{Sys.smithUpgrade(slot);UI.renderPanel('kowal');UI.refreshTop();});
      } else row.innerHTML='<div class="ic"><img src="'+D.slotIconURL(slot)+'" style="width:34px;height:34px;border-radius:8px;opacity:.45;"></div><div class="info"><div class="nm">'+m.n+'</div><div class="ds"><i>pusty slot</i></div></div>';
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
      row.innerHTML='<div class="ic">'+D.icoImg(r)+'</div><div class="info"><div class="nm"><span class="q-'+r.rar+'">'+r.n+'</span></div><div class="ds">Kategoria: '+r.cat+'</div></div>'+
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
    tab=tab||'bogowie';
    UI.setTabs([{id:'bogowie',n:'Bogowie'},{id:'pieczecie',n:'Pieczęcie'},{id:'panteon',n:'Panteon (trofea)'}],tab,(t)=>UI.renderPanel('swiatynia',t));
    const myGod=D.FACTIONS[s.faction].god;
    if(tab==='bogowie'){
      let h='';
      if(s.isGod){h+='<div class="rowItem"><div class="ic">🔱</div><div class="info"><div class="nm">Jesteś bogiem.</div><div class="ds">Wyznawcy: '+s.followers+' · Pieczęciami możesz przywoływać INNYCH bogów po łup!</div></div></div>';}
      else if(!s.godSlain){
        h+='<div class="rowItem" style="border-color:#ffd56b;"><div class="ic">'+D.GODS[myGod].ic+'</div><div class="info"><div class="nm">Wyzwij SWOJEGO boga: '+D.GODS[myGod].name+'</div>'+
          '<div class="ds">Pokonaj go, by zdobyć jego ducha i móc się przemienić. Zalecany poz. 25+.</div></div>'+
          '<div class="act"><button class="sbtn red" id="challengeGod">WYZWIJ</button></div></div>';
      } else {
        h+='<div class="rowItem" style="border-color:#7dffc7;"><div class="ic">👻</div><div class="info"><div class="nm">Duch boga w twoim władaniu</div>'+
          '<div class="ds">Poświęć postacie klanu ('+s.clan.length+') — staną się wyznawcami, a ty bogiem.</div></div>'+
          '<div class="act"><button class="sbtn gold" id="ascendBtn">PRZEMIANA</button></div></div>';
      }
      h+='<div class="secH">Prawa boskiej wojny</div>'+
        '<div class="rowItem"><div class="ic">⚖️</div><div class="info"><div class="ds">'+
        '• Pokonanie <b>własnego</b> boga → jego duch → przemiana w boga.<br>'+
        '• Pokonanie <b>obcego</b> boga (pieczęcią) → sekretne relikty, sekretna runa i trofeum (+4% obrażeń i HP na stałe).<br>'+
        '• Pieczęcie wykuwa się w zakładce Pieczęcie (złoto + surowce).</div></div></div>';
      h+='<div class="rowItem"><div class="ic">🙏</div><div class="info"><div class="ds">Ofiara 200🪙 — błogosławieństwo (+20% obrażeń na 5 min).</div></div>'+
        '<div class="act"><button class="sbtn" id="blessBtn">Ofiaruj</button></div></div>';
      B.innerHTML=h;
      const cg=UI.el('challengeGod');
      if(cg)cg.addEventListener('click',()=>{UI.closePanel();Game.startGodFight(false);});
      const ab=UI.el('ascendBtn');
      if(ab)ab.addEventListener('click',()=>{if(Sys.ascend()){UI.closePanel();Game.onAscend();}});
      const bb=UI.el('blessBtn');
      if(bb)bb.addEventListener('click',()=>{if(Sys.spendGold(200)){Game.player.buffs.dmg={t:300};UI.refreshBuffs();UI.toast('🙏 Błogosławieństwo!','gold');}});
    } else if(tab==='pieczecie'){
      B.innerHTML='<div class="hint" style="color:#8a78ad;margin-bottom:8px;">Pieczęć przywołuje boga do walki w dowolnym miejscu (użyj z Ekwipunek → Specjalne). Koszt: 1200🪙 + 3 surowce.</div>';
      for(const gk of Object.keys(D.GODS)){
        const g=D.GODS[gk];const fac=D.FACTIONS[g.fac];
        const own=g.fac===s.faction;
        const have=s.inv.filter(i=>i.t==='seal'&&i.god===gk).length;
        const row=document.createElement('div');row.className='rowItem';
        row.innerHTML='<div class="ic"><img src="'+D.iconFor('rune','secret',fac.css)+'" style="width:34px;height:34px;border-radius:8px;"></div>'+
          '<div class="info"><div class="nm" style="color:'+fac.css+'">'+g.ic+' '+g.name+(own?' (twój bóg)':'')+(s.godTrophies&&s.godTrophies[gk]?' 🏆':'')+'</div>'+
          '<div class="ds">'+g.lore+(have?' · Posiadasz: '+have:'')+'</div></div>'+
          '<div class="act"><button class="sbtn gold">Wykuj 1200🪙+3⛏️</button></div>';
        row.querySelector('button').addEventListener('click',()=>{Sys.craftSeal(gk);UI.renderPanel('swiatynia','pieczecie');});
        B.appendChild(row);
      }
    } else if(tab==='panteon'){
      const tr=s.godTrophies||{};const n=Object.keys(tr).length;
      B.innerHTML='<div class="hint" style="color:#8a78ad;margin-bottom:8px;">Trofea bogów: <b style="color:#ffd56b">'+n+'/8</b> · Każde daje +4% obrażeń i HP na stałe.</div>';
      for(const gk of Object.keys(D.GODS)){
        const g=D.GODS[gk];const fac=D.FACTIONS[g.fac];const got=!!tr[gk];
        const row=document.createElement('div');row.className='rowItem';
        if(got)row.style.borderColor='#ffd56b';
        row.innerHTML='<div class="ic">'+(got?'🏆':'❔')+'</div><div class="info"><div class="nm" style="color:'+(got?fac.css:'#5a4a70')+'">'+g.name+'</div>'+
          '<div class="ds">'+(got?'Pokonany! Relikty: '+(D.GOD_RELICS[gk]||[]).map(r=>r.n).join(', '):'Jeszcze niepokonany — wykuj pieczęć i wyzwij go.')+'</div></div>';
        B.appendChild(row);
      }
    }
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

  // ===== MAPA ŚWIATA =====
  else if(id==='mapa'){
    T.textContent='🗺️ Mapa Świata';
    B.innerHTML='<canvas id="worldMap" width="620" height="470" style="width:100%;border-radius:12px;cursor:pointer;"></canvas>'+
      '<div class="hint" style="color:#8a78ad;font-size:10.5px;margin-top:6px;">Dotknij regionu, aby podróżować. 🔒 = zablokowany.</div>';
    const cv=UI.el('worldMap');const x=cv.getContext('2d');
    const NODES={wioska:[310,235],las_cieni:[180,160],pustynia_pustki:[450,140],gory_nocy:[150,300],
      otchlan_bestii:[470,300],ruiny_chaosu:[240,70],krainy_popiolu:[380,390],krolestwo_snow:[180,410],
      wymiar_bogow:[520,60],piekielna_otchlan:[540,420]};
    // tło mapy
    const bg=x.createRadialGradient(310,235,40,310,235,340);
    bg.addColorStop(0,'#241a3e');bg.addColorStop(1,'#0c0818');
    x.fillStyle=bg;x.fillRect(0,0,620,470);
    // dekoracyjna siatka
    x.strokeStyle='rgba(120,90,180,.08)';x.lineWidth=1;
    for(let i=0;i<620;i+=40){x.beginPath();x.moveTo(i,0);x.lineTo(i,470);x.stroke();}
    for(let i=0;i<470;i+=40){x.beginPath();x.moveTo(0,i);x.lineTo(620,i);x.stroke();}
    // drogi z wioski
    for(const rid of D.REGION_LIST){ if(rid==='wioska')continue;
      const [nx,ny]=NODES[rid];const [wx2,wy2]=NODES.wioska;
      x.strokeStyle='rgba(150,120,200,.25)';x.lineWidth=2;x.setLineDash([6,6]);
      x.beginPath();x.moveTo(wx2,wy2);x.quadraticCurveTo((wx2+nx)/2+(ny-wy2)*0.12,(wy2+ny)/2-(nx-wx2)*0.12,nx,ny);x.stroke();x.setLineDash([]);
    }
    // węzły regionów
    const hit=[];
    for(const rid of D.REGION_LIST){
      const r=D.REGIONS[rid];const [nx,ny]=NODES[rid];
      const cur=Game.regionId===rid;
      const locked=(r.godOnly&&!s.isGod)||(rid==='piekielna_otchlan'&&s.lvl<50&&!s.isGod);
      const col=r.fac?D.FACTIONS[r.fac].css:'#ffd56b';
      const rad=rid==='wioska'?26:21;
      const g2=x.createRadialGradient(nx,ny,2,nx,ny,rad+8);
      g2.addColorStop(0,col+'');g2.addColorStop(1,'rgba(0,0,0,0)');
      x.save();x.globalAlpha=locked?0.25:0.5;x.fillStyle=g2;x.beginPath();x.arc(nx,ny,rad+8,0,7);x.fill();x.restore();
      x.fillStyle=locked?'#241a30':'#1a1230';x.beginPath();x.arc(nx,ny,rad,0,7);x.fill();
      x.strokeStyle=cur?'#ffd56b':col;x.lineWidth=cur?3.5:2;x.beginPath();x.arc(nx,ny,rad,0,7);x.stroke();
      x.font=(rid==='wioska'?'22px':'18px')+' sans-serif';x.textAlign='center';x.textBaseline='middle';
      x.fillText(locked?'🔒':r.icon,nx,ny);
      x.font='bold 10px sans-serif';x.fillStyle=locked?'#6a5a80':'#e2d6f7';
      x.fillText(r.name,nx,ny+rad+11);
      x.font='8.5px sans-serif';x.fillStyle='#8a78ad';
      x.fillText('poz. '+r.lvl[0]+'–'+r.lvl[1],nx,ny+rad+22);
      if(cur){x.font='8.5px sans-serif';x.fillStyle='#ffd56b';x.fillText('◈ TU JESTEŚ',nx,ny-rad-8);}
      hit.push({rid:rid,x:nx,y:ny,r:rad+6,locked:locked,cur:cur});
    }
    cv.addEventListener('click',(ev)=>{
      const rect=cv.getBoundingClientRect();
      const mx=(ev.clientX-rect.left)*(620/rect.width), my=(ev.clientY-rect.top)*(470/rect.height);
      for(const h of hit){ if(Math.hypot(mx-h.x,my-h.y)<=h.r){
        if(h.cur)return; if(h.locked){UI.toast('Region zablokowany!','red');return;}
        UI.closePanel();Game.travel(h.rid);return; } }
    });
  }
  // ===== OPCJE =====
  else if(id==='opcje'){
    T.textContent='⚙️ Opcje';
    B.innerHTML='<div class="rowItem"><div class="ic">💾</div><div class="info"><div class="nm">Zapis gry</div><div class="ds">Gra zapisuje się automatycznie.</div></div><div class="act"><button class="sbtn gold" id="saveNow">Zapisz teraz</button></div></div>'+
      '<div class="rowItem"><div class="ic">✨</div><div class="info"><div class="nm">Bloom (poświata)</div></div><div class="act"><button class="sbtn" id="bloomTgl">'+(W.bloomOn!==false?'WŁ':'WYŁ')+'</button></div></div>'+
      '<div class="rowItem"><div class="ic">🧪</div><div class="info"><div class="nm">Auto-mikstura</div><div class="ds">Pij miksturę HP automatycznie poniżej 30%</div></div><div class="act"><button class="sbtn" id="apTgl">'+(s.autoPotion?'WŁ':'WYŁ')+'</button></div></div>'+
      '<div class="rowItem"><div class="ic">🔊</div><div class="info"><div class="nm">Dźwięk</div></div><div class="act"><button class="sbtn" id="sndTgl">'+(typeof SND!=='undefined'&&SND.on?'WŁ':'WYŁ')+'</button></div></div>'+
      '<div class="rowItem"><div class="ic">🎵</div><div class="info"><div class="nm">Muzyka</div></div><div class="act"><button class="sbtn" id="musTgl">'+(typeof SND!=='undefined'&&SND.music.on?'WŁ':'WYŁ')+'</button></div></div>'+
      '<div class="rowItem"><div class="ic">⛶</div><div class="info"><div class="nm">Pełny ekran</div></div><div class="act"><button class="sbtn" id="fsTgl">Przełącz</button></div></div>'+
      '<div class="rowItem"><div class="ic">🗑️</div><div class="info"><div class="nm">Nowa gra</div><div class="ds">Kasuje CAŁY postęp!</div></div><div class="act"><button class="sbtn red" id="wipeBtn">Resetuj</button></div></div>'+
      '<div class="hint" style="color:#6e5d8c;font-size:10px;margin-top:10px;">Kroniki Bogów — wersja robocza. Sterowanie: WASD/strzałki + myszka lub joystick + przyciski (mobile). Spacja/⚔️ = atak, 1–7 = zaklęcia, E = interakcja.</div>';
    UI.el('saveNow').addEventListener('click',()=>{Sys.save();UI.toast('💾 Zapisano!','green');});
    UI.el('bloomTgl').addEventListener('click',()=>{W.bloomOn=W.bloomOn===false?true:false;UI.renderPanel('opcje');});
    UI.el('sndTgl').addEventListener('click',()=>{if(typeof SND!=='undefined'){SND.on=!SND.on;}UI.renderPanel('opcje');});
    UI.el('apTgl').addEventListener('click',()=>{s.autoPotion=!s.autoPotion;Sys.save();UI.renderPanel('opcje');});
    UI.el('musTgl').addEventListener('click',()=>{if(typeof SND!=='undefined')SND.music.on=!SND.music.on;UI.renderPanel('opcje');});
    UI.el('fsTgl').addEventListener('click',()=>Game.toggleFullscreen());
    UI.el('wipeBtn').addEventListener('click',()=>{if(confirm('Na pewno skasować cały postęp?')){Sys.wipe();location.reload();}});
  }
};


// ---------- MINIMAPA ----------
UI.drawMinimap=function(){
  const cv=UI.el('minimap');if(!cv)return;
  const x=cv.getContext('2d');const S=132, half=S/2;
  x.clearRect(0,0,S,S);
  const P=Game.player;if(!P)return;
  const range=(Game.regionId==='wioska')?36:(W.regionSize/2+8);
  const sc=(half-8)/range;
  x.save();x.beginPath();x.arc(half,half,half-3,0,7);x.clip();
  x.fillStyle='rgba(12,8,22,.85)';x.fillRect(0,0,S,S);
  const w2m=(wx,wz)=>[half+(wx-P.pos.x)*sc, half+(wz-P.pos.z)*sc];
  // interakcje (złote) / portale (turkus)
  for(const it of W.interactables){
    const [mx,my]=w2m(it.x,it.z);
    x.fillStyle=it.icon==='🌀'?'#3df0dc':'#ffd56b';
    x.beginPath();x.arc(mx,my,2.4,0,7);x.fill();
  }
  // wrogowie
  for(const e of E.enemies){
    const [mx,my]=w2m(e.grp.position.x,e.grp.position.z);
    x.fillStyle=Sys.isHostileTo(e.def.fac)?(e.boss?'#ff2a3c':'#ff7a8a'):'#7dffc7';
    x.beginPath();x.arc(mx,my,e.boss?3.4:2,0,7);x.fill();
  }
  // gracz — strzałka
  x.translate(half,half);x.rotate(P.rot);
  x.fillStyle='#fff';x.beginPath();x.moveTo(0,-5.5);x.lineTo(4,4.5);x.lineTo(-4,4.5);x.closePath();x.fill();
  x.restore();
};


UI.comboShow=function(n){
  const b=UI.el('comboBox');
  if(!n||n<3){b.style.display='none';return;}
  b.style.display='block';UI.el('comboN').textContent='×'+n;
  b.style.transform='scale('+Math.min(1.5,1+n*0.04)+')';
};
UI.lowHp=function(frac){
  const v=UI.el('lowHpVig');
  v.style.opacity=frac<0.3?String(0.4+(0.3-frac)*2):'0';
};
// ---------- DIALOGI NPC ----------
UI.dialog=function(name,text,opts){
  UI.el('dlgName').textContent=name;
  UI.el('dlgText').textContent=text;
  const box=UI.el('dlgOpts');box.innerHTML='';
  (opts||[]).forEach(o=>{const b=document.createElement('button');b.className='sbtn gold';b.textContent=o.t;
    b.addEventListener('click',()=>{o.fn&&o.fn();});box.appendChild(b);});
  UI.el('dlg').style.display='block';
  clearTimeout(UI._dlgT);UI._dlgT=setTimeout(()=>UI.closeDialog(),9000);
};
UI.closeDialog=function(){UI.el('dlg').style.display='none';};
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
