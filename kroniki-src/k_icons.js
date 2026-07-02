// ================= RYSOWANE IKONY (canvas, bez emotek) =================
"use strict";
D._icoCache={};
D.iconFor=function(kind,rar,tint){
  const key=kind+'|'+(rar||'')+'|'+(tint||'');
  if(D._icoCache[key])return D._icoCache[key];
  const s=56, cv=document.createElement('canvas');cv.width=cv.height=s;const x=cv.getContext('2d');
  const rc=rar?D.RARITY[rar].col:'#8a78ad';
  const bg=x.createLinearGradient(0,0,s,s);bg.addColorStop(0,'#241a3e');bg.addColorStop(1,'#120a22');
  x.fillStyle=bg;rr(x,1,1,s-2,s-2,10);x.fill();
  x.strokeStyle=rc;x.lineWidth=2.4;rr(x,2,2,s-4,s-4,9);x.stroke();
  x.save();x.translate(s/2,s/2);
  const met=x.createLinearGradient(-14,-16,12,18);met.addColorStop(0,'#e8ecf4');met.addColorStop(.5,'#9aa6bb');met.addColorStop(1,'#5a6478');
  const gold=x.createLinearGradient(-10,-10,10,12);gold.addColorStop(0,'#ffe9a8');gold.addColorStop(1,'#b8862a');
  const wood=x.createLinearGradient(0,-16,0,16);wood.addColorStop(0,'#8a5a30');wood.addColorStop(1,'#4a2c14');
  const tcol=tint||rc;
  function glowDot(px,py,r,c){const g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');
    x.save();x.globalAlpha=0.55;x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill();x.restore();}
  function rr(ctx,px,py,w,h,r){ctx.beginPath();ctx.moveTo(px+r,py);ctx.arcTo(px+w,py,px+w,py+h,r);ctx.arcTo(px+w,py+h,px,py+h,r);ctx.arcTo(px,py+h,px,py,r);ctx.arcTo(px,py,px+w,py,r);ctx.closePath();}
  if(kind==='sword'){x.rotate(-0.7);x.fillStyle=met;x.beginPath();x.moveTo(-2.6,-20);x.lineTo(2.6,-20);x.lineTo(1.6,8);x.lineTo(-1.6,8);x.closePath();x.fill();
    x.fillStyle=gold;x.fillRect(-7,7,14,3.4);x.fillStyle=wood;x.fillRect(-1.8,10,3.6,8);x.fillStyle=gold;x.beginPath();x.arc(0,20,2.6,0,7);x.fill();
    x.fillStyle='rgba(255,255,255,.5)';x.fillRect(-0.5,-19,1,26);}
  else if(kind==='dagger'){x.rotate(-0.7);x.fillStyle=met;x.beginPath();x.moveTo(-2,-14);x.lineTo(2,-14);x.lineTo(0,6);x.closePath();x.fill();
    x.fillStyle=gold;x.fillRect(-5.4,4,10.8,2.8);x.fillStyle='#2a1c30';x.fillRect(-1.5,6.4,3,7);
    x.rotate(1.1);x.translate(10,-6);x.fillStyle=met;x.beginPath();x.moveTo(-1.6,-10);x.lineTo(1.6,-10);x.lineTo(0,5);x.closePath();x.fill();}
  else if(kind==='staff'){x.rotate(0.5);x.fillStyle=wood;x.fillRect(-1.8,-10,3.6,30);
    glowDot(0,-13,10,tcol);x.fillStyle=tcol;x.beginPath();x.arc(0,-13,5,0,7);x.fill();
    x.strokeStyle=gold;x.lineWidth=2;x.beginPath();x.arc(0,-13,7.4,0.6,4.2);x.stroke();}
  else if(kind==='hammer'){x.rotate(-0.6);x.fillStyle=wood;x.fillRect(-1.8,-6,3.6,24);
    x.fillStyle=met;rr(x,-12,-16,24,11,3);x.fill();
    x.fillStyle='rgba(255,120,40,.55)';x.fillRect(-12,-8,24,3);}
  else if(kind==='claw'){x.fillStyle=met;for(let i=-1;i<=1;i++){x.save();x.translate(i*7,2);x.rotate(i*0.22);
    x.beginPath();x.moveTo(-2.4,10);x.quadraticCurveTo(-4,-6,0,-16);x.quadraticCurveTo(1.6,-6,2.4,10);x.closePath();x.fill();x.restore();}
    x.fillStyle=wood;rr(x,-10,10,20,6,3);x.fill();}
  else if(kind==='helm'){x.fillStyle=met;x.beginPath();x.arc(0,-2,13,Math.PI,0);x.lineTo(13,8);x.lineTo(-13,8);x.closePath();x.fill();
    x.fillStyle='#14101e';x.fillRect(-9,-1,18,4.6);glowDot(-4,1,3.4,tcol);glowDot(4,1,3.4,tcol);
    x.fillStyle=gold;x.fillRect(-2,-16,4,7);}
  else if(kind==='chest'){x.fillStyle=met;x.beginPath();x.moveTo(-13,-12);x.lineTo(13,-12);x.lineTo(15,-4);x.lineTo(10,14);x.lineTo(-10,14);x.lineTo(-15,-4);x.closePath();x.fill();
    x.strokeStyle='#3a4254';x.lineWidth=1.6;x.beginPath();x.moveTo(0,-12);x.lineTo(0,14);x.stroke();
    x.fillStyle=gold;x.beginPath();x.arc(0,-2,3.4,0,7);x.fill();glowDot(0,-2,7,tcol);}
  else if(kind==='gloves'){x.fillStyle=met;rr(x,-12,-10,11,18,3);x.fill();rr(x,1,-10,11,18,3);x.fill();
    x.fillStyle=gold;x.fillRect(-12,-12,11,4);x.fillRect(1,-12,11,4);}
  else if(kind==='boots'){x.fillStyle=met;x.beginPath();x.moveTo(-11,-12);x.lineTo(-3,-12);x.lineTo(-3,4);x.lineTo(3,8);x.lineTo(-11,8);x.closePath();x.fill();
    x.save();x.translate(9,0);x.scale(-1,1);x.beginPath();x.moveTo(-5,-12);x.lineTo(3,-12);x.lineTo(3,4);x.lineTo(9,8);x.lineTo(-5,8);x.closePath();x.fill();x.restore();
    x.fillStyle=gold;x.fillRect(-11,6,14,3);}
  else if(kind==='ring'){x.strokeStyle=gold;x.lineWidth=5;x.beginPath();x.arc(0,3,9,0,7);x.stroke();
    x.fillStyle=tcol;x.beginPath();x.moveTo(0,-14);x.lineTo(5,-7);x.lineTo(0,0);x.lineTo(-5,-7);x.closePath();x.fill();glowDot(0,-7,8,tcol);}
  else if(kind==='amulet'){x.strokeStyle=gold;x.lineWidth=2.4;x.beginPath();x.arc(0,-6,10,Math.PI*0.15,Math.PI*0.85,true);x.stroke();
    x.fillStyle=tcol;x.beginPath();x.moveTo(0,-2);x.lineTo(7,6);x.lineTo(0,16);x.lineTo(-7,6);x.closePath();x.fill();glowDot(0,7,9,tcol);}
  else if(kind==='potion'){x.fillStyle='rgba(200,220,255,.3)';x.beginPath();x.arc(0,4,10,0,7);x.fill();
    x.fillStyle=tcol;x.beginPath();x.arc(0,4,10,Math.PI*0.02,Math.PI*0.98);x.closePath();x.fill();
    x.fillStyle='rgba(200,220,255,.35)';x.fillRect(-3.4,-12,6.8,9);x.fillStyle='#6a4a2a';x.fillRect(-4,-15,8,4);
    glowDot(0,5,10,tcol);}
  else if(kind==='rune'){x.fillStyle='#181228';x.beginPath();x.moveTo(0,-15);x.lineTo(12,-4);x.lineTo(8,13);x.lineTo(-8,13);x.lineTo(-12,-4);x.closePath();x.fill();
    x.strokeStyle=tcol;x.lineWidth=2.2;x.stroke();
    x.lineWidth=2.6;x.beginPath();x.moveTo(0,-9);x.lineTo(0,8);x.moveTo(-5,-3);x.lineTo(5,3);x.moveTo(5,-3);x.lineTo(-5,3);x.stroke();glowDot(0,0,12,tcol);}
  else if(kind==='res'){x.fillStyle=tcol;x.beginPath();x.moveTo(0,-14);x.lineTo(8,-2);x.lineTo(4,12);x.lineTo(-6,10);x.lineTo(-9,-4);x.closePath();x.fill();
    x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.moveTo(0,-14);x.lineTo(8,-2);x.lineTo(0,0);x.closePath();x.fill();glowDot(0,0,12,tcol);}
  else if(kind==='gold'){x.fillStyle=gold;[[-6,4],[6,4],[0,-4]].forEach(p=>{x.beginPath();x.ellipse(p[0],p[1],8,5.6,0,0,7);x.fill();
    x.strokeStyle='#8a6a1a';x.lineWidth=1.2;x.stroke();});}
  else if(kind==='scroll'){x.fillStyle='#d8c9a8';rr(x,-10,-13,20,26,3);x.fill();
    x.strokeStyle='#8a6a4a';x.lineWidth=1.4;for(let i=-7;i<=7;i+=4){x.beginPath();x.moveTo(-6,i);x.lineTo(6,i);x.stroke();}}
  else {x.fillStyle=tcol;x.beginPath();x.arc(0,0,10,0,7);x.fill();}
  x.restore();
  const url=cv.toDataURL();
  D._icoCache[key]=url;return url;
};
D.WEAPON_KIND={cien:'staff',pustka:'staff',ninja:'dagger',bestie:'claw',chaos:'staff',popiol:'sword',sen:'staff',demony:'sword'};
D.itemIconURL=function(it){
  if(it.t==='rune'||it.cat)return D.iconFor('rune',it.rar,D.RUNE_CATS[it.cat]?D.RUNE_CATS[it.cat].col:null);
  if(it.t==='potion'||it.heal||it.mana&&!it.slot){const map={pot_hp_s:'#ff4d6d',pot_hp_l:'#ff2a4c',pot_mp:'#4aa3ff',pot_spd:'#7dffc7',pot_str:'#ffb13b',pot_def:'#b8a8dc'};return D.iconFor('potion',null,map[it.id]||'#ff6a8a');}
  if(it.slot){
    const kind=it.slot==='weapon'?(D.WEAPON_KIND[it.fac]||'sword'):
      it.slot==='helm'?'helm':it.slot==='chest'?'chest':it.slot==='gloves'?'gloves':it.slot==='boots'?'boots':it.slot==='ring'?'ring':'amulet';
    return D.iconFor(kind,it.rar,D.FACTIONS[it.fac]?D.FACTIONS[it.fac].css:null);
  }
  return D.iconFor('res',null,'#7dffc7');
};
D.icoImg=function(it,size){return '<img src="'+D.itemIconURL(it)+'" style="width:'+(size||34)+'px;height:'+(size||34)+'px;border-radius:8px;">';};
D.slotIconURL=function(slot){
  const kind=slot==='weapon'?'sword':slot==='helm'?'helm':slot==='chest'?'chest':slot==='gloves'?'gloves':slot==='boots'?'boots':slot==='ring'?'ring':'amulet';
  return D.iconFor(kind,null,'#4a4258');
};
