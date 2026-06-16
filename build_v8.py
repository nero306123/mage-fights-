#!/usr/bin/env python3
"""v8: The End realm (void below), bigger castle, neutral mobs, 7 staff spells, dragon fly fix, ore drops, dog fix"""
import os, json

BP='/tmp/addon/BP'; RP='/tmp/addon/RP'
def w(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if isinstance(content, (dict,list)): content=json.dumps(content,indent=2,ensure_ascii=False)
    open(path,'w',encoding='utf-8').write(content)

# ══════════════════════════════════════════════════════════════════
# 1. MAIN.JS — complete rewrite
# ══════════════════════════════════════════════════════════════════
MAIN = r'''import { world, system, EquipmentSlot, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

const NS = "krainadura";

// ══ SOUL REALM: floating island in The End (natural void below) ══
const SOUL_DIM_ID = "minecraft:the_end";
const SOUL_X = 5000, SOUL_Y = 100, SOUL_Z = 5000;
const SOUL_RADIUS = 200;
const R_ISL = 35;
const TOP = SOUL_Y;
const SPAWN_Z = SOUL_Z + 22;

function getSoulDim() { return world.getDimension(SOUL_DIM_ID); }
function getOW()      { return world.getDimension("minecraft:overworld"); }
function isInSoulRealm(p) {
  return p.dimension.id === SOUL_DIM_ID &&
    Math.abs(p.location.x - SOUL_X) < SOUL_RADIUS &&
    Math.abs(p.location.z - SOUL_Z) < SOUL_RADIUS;
}

// ══ SOUL ITEMS ══
const SOUL_ITEM_MAP = {
  [`${NS}:dusza_wojownik`]:`${NS}:soul_wojownik`, [`${NS}:dusza_mag`]:`${NS}:soul_mag`,
  [`${NS}:dusza_general`]:`${NS}:soul_general`,   [`${NS}:dusza_gigant`]:`${NS}:soul_gigant`,
  [`${NS}:dusza_elf`]:`${NS}:soul_elf`,           [`${NS}:dusza_demon`]:`${NS}:soul_demon`,
  [`${NS}:dusza_aniol`]:`${NS}:soul_aniol`,       [`${NS}:dusza_cien`]:`${NS}:soul_cien`,
};
const SOUL_NAMES = {
  [`${NS}:dusza_wojownik`]:"Wojownik",  [`${NS}:dusza_mag`]:"Mag",
  [`${NS}:dusza_general`]:"Generał",   [`${NS}:dusza_gigant`]:"Gigant",
  [`${NS}:dusza_elf`]:"Elf z Łukiem", [`${NS}:dusza_demon`]:"Demon",
  [`${NS}:dusza_aniol`]:"Anioł",       [`${NS}:dusza_cien`]:"Cień",
};
const ELEMENTAL_SPELLS = {
  [`${NS}:laska_ognia`]:{spells:[
    {name:"Kula Ognia",   effect:"minecraft:weakness",      power:3,dur:60, msg:"§c🔥 Kula Ognia!",   fire:true},
    {name:"Ściana Ognia", effect:"minecraft:mining_fatigue",power:2,dur:100,msg:"§c🔥 Ściana Ognia!", fire:true},
    {name:"Wybuch Lawy",  effect:"minecraft:slowness",      power:4,dur:80, msg:"§c🔥 Wybuch Lawy!",  fire:true},
  ]},
  [`${NS}:laska_wody`]:{spells:[
    {name:"Fala Wodna",   effect:"minecraft:slowness",      power:3,dur:100,msg:"§9💧 Fala Wodna!"},
    {name:"Ulewa",        effect:"minecraft:mining_fatigue",power:1,dur:80, msg:"§9💧 Ulewa!"},
    {name:"Wodne Więzy",  effect:"minecraft:slowness",      power:5,dur:60, msg:"§9💧 Wodne Więzy!"},
  ]},
  [`${NS}:laska_lodu`]:{spells:[
    {name:"Lód",          effect:"minecraft:slowness",power:4,dur:60, msg:"§b❄ Lód!"},
    {name:"Mróz",         effect:"minecraft:weakness",power:3,dur:100,msg:"§b❄ Mróz!"},
    {name:"Lodowe Kopie", effect:"minecraft:poison",  power:1,dur:40, msg:"§b❄ Lodowe Kopie!"},
  ]},
  [`${NS}:laska_ziemi`]:{spells:[
    {name:"Trzęsienie", effect:"minecraft:weakness",      power:3,dur:80, msg:"§2🌿 Trzęsienie Ziemi!"},
    {name:"Głazy",      effect:"minecraft:mining_fatigue",power:3,dur:60, msg:"§2🌿 Głazy!"},
    {name:"Kolce",      effect:"minecraft:poison",        power:2,dur:100,msg:"§2🌿 Kolce Natury!"},
  ]},
  [`${NS}:laska_wiatru`]:{spells:[
    {name:"Podmuch",effect:"minecraft:levitation",power:3,dur:20,msg:"§7💨 Podmuch!",   knock:true},
    {name:"Tornado", effect:"minecraft:levitation",power:5,dur:30,msg:"§7💨 Tornado!",  knock:true},
    {name:"Wichura", effect:"minecraft:slowness",  power:2,dur:200,msg:"§7💨 Wichura!", knock:true},
  ]},
};
const PROP_SOULS = `${NS}:souls`;

function consumeItem(p,typeId){
  const inv=p.getComponent("minecraft:inventory").container;
  for(let i=0;i<inv.size;i++){const s=inv.getItem(i);
    if(s&&s.typeId===typeId){if(s.amount>1){const n=s.clone();n.amount--;inv.setItem(i,n);}else inv.setItem(i,undefined);return true;}}
  return false;
}
function getStaffSouls(it){try{return JSON.parse(it.getDynamicProperty(PROP_SOULS)||"[]");}catch{return [];}}
function setStaffSouls(it,s){it.setDynamicProperty(PROP_SOULS,JSON.stringify(s));}

// ══ BLOCK CONSTANTS ══
const B_STONE="krainadura:soul_stone", B_GRASS="krainadura:soul_grass",
      B_BRICK="krainadura:soul_brick", B_DARK="krainadura:soul_brick_dark",
      B_PILLAR="krainadura:soul_pillar", B_LANT="krainadura:soul_lantern",
      B_ORE="krainadura:ruda_dusz", B_AIR="minecraft:air", B_BARR="minecraft:barrier";

function bfill(dim,x1,y1,z1,x2,y2,z2,block){
  try{dim.fillBlocks({x:x1,y:y1,z:z1},{x:x2,y:y2,z:z2},{type:block});return true;}catch{return false;}
}
function bset(dim,x,y,z,block){
  try{const b=dim.getBlock({x,y,z});if(b){b.setType(block);return true;}}catch{}return false;
}

function realmLoaded(dim){
  const pts=[[0,0],[30,0],[-30,0],[0,30],[0,-30],[35,0],[-35,0],[0,35],[0,-35],[0,22]];
  for(const[dx,dz]of pts){try{if(!dim.getBlock({x:SOUL_X+dx,y:TOP,z:SOUL_Z+dz}))return false;}catch{return false;}}
  return true;
}

// ══ REALM ENTRY ══
const entering={};
function enterRealm(p){
  const endDim=getSoulDim();
  try{endDim.runCommand(`tickingarea remove soulrealm`);}catch{}
  try{endDim.runCommand(`tickingarea add ${SOUL_X-55} ${TOP-25} ${SOUL_Z-55} ${SOUL_X+55} ${TOP+55} ${SOUL_Z+55} soulrealm`);}catch{}
  const holdY=TOP+20;
  try{p.teleport({x:SOUL_X+0.5,y:holdY,z:SPAWN_Z+0.5},{dimension:endDim});}catch{}
  p.addEffect("minecraft:slow_falling",2400,{showParticles:false});
  p.addEffect("minecraft:resistance",2400,{amplifier:4,showParticles:false});
  p.addEffect("minecraft:regeneration",2400,{amplifier:3,showParticles:false});
  p.sendMessage("§5§l✦ Wkraczasz do Krainy Dusz... ✦");
  p.sendMessage("§7Budowanie krainy, poczekaj chwilę...");
  entering[p.id]={ticks:0,holdY,phase:0};
}

system.runInterval(()=>{
  const ids=Object.keys(entering); if(!ids.length)return;
  const endDim=getSoulDim();
  for(const pid of ids){
    const st=entering[pid];
    const p=world.getAllPlayers().find(pp=>pp.id===pid);
    if(!p){delete entering[pid];continue;}
    st.ticks++;
    if(p.location.y<st.holdY-5){
      try{p.teleport({x:SOUL_X+0.5,y:st.holdY,z:SPAWN_Z+0.5},{dimension:endDim});}catch{}
    }
    if(st.phase===0){
      if(realmLoaded(endDim)||st.ticks>200)st.phase=1;
    } else if(st.phase===1){
      buildRealm(endDim); st.phase=2; st.t2=0;
    } else {
      st.t2=(st.t2||0)+1;
      let ok=false;
      try{const b=endDim.getBlock({x:SOUL_X,y:TOP,z:SPAWN_Z});ok=!!b&&b.typeId!=="minecraft:air";}catch{}
      if(ok||st.t2>80){
        try{p.teleport({x:SOUL_X+0.5,y:TOP+2,z:SPAWN_Z+0.5},{dimension:endDim});}catch{}
        p.addEffect("minecraft:slow_falling",40,{showParticles:false});
        p.sendMessage("§5§l✦ Witaj w Krainie Dusz! ✦\n§7Zamek przed tobą — pokonaj Boga Dusz!");
        delete entering[pid];
      }
    }
  }
},5);

// ══ REALM BUILD ══
function buildRealm(dim){
  const already=world.getDynamicProperty("realm_built");
  const cx=SOUL_X, cz=SOUL_Z;

  // Island body (octagon, floating look with tapered underside)
  bfill(dim,cx-R_ISL,TOP-8,cz-R_ISL,cx+R_ISL,TOP-1,cz+R_ISL,B_STONE);
  bfill(dim,cx-R_ISL,TOP,  cz-R_ISL,cx+R_ISL,TOP,  cz+R_ISL,B_GRASS);
  const c=12; // corner cut
  bfill(dim,cx-R_ISL,TOP-8,cz-R_ISL,cx-R_ISL+c-1,TOP,cz-R_ISL+c-1,B_AIR);
  bfill(dim,cx+R_ISL-c+1,TOP-8,cz-R_ISL,cx+R_ISL,TOP,cz-R_ISL+c-1,B_AIR);
  bfill(dim,cx-R_ISL,TOP-8,cz+R_ISL-c+1,cx-R_ISL+c-1,TOP,cz+R_ISL,B_AIR);
  bfill(dim,cx+R_ISL-c+1,TOP-8,cz+R_ISL-c+1,cx+R_ISL,TOP,cz+R_ISL,B_AIR);
  // Tapered underside
  bfill(dim,cx-26,TOP-11,cz-26,cx+26,TOP-9, cz+26,B_STONE);
  bfill(dim,cx-18,TOP-14,cz-18,cx+18,TOP-12,cz+18,B_STONE);
  bfill(dim,cx-10,TOP-17,cz-10,cx+10,TOP-15,cz+10,B_STONE);
  bfill(dim,cx-4, TOP-20,cz-4, cx+4, TOP-18,cz+4, B_STONE);

  // Invisible barrier wall (prevents falling off)
  const BR=R_ISL+1;
  bfill(dim,cx-R_ISL,TOP+1,cz+BR,cx+R_ISL,TOP+5,cz+BR,B_BARR); // south
  bfill(dim,cx-R_ISL,TOP+1,cz-BR,cx+R_ISL,TOP+5,cz-BR,B_BARR); // north
  bfill(dim,cx+BR,TOP+1,cz-R_ISL,cx+BR,TOP+5,cz+R_ISL,B_BARR); // east
  bfill(dim,cx-BR,TOP+1,cz-R_ISL,cx-BR,TOP+5,cz+R_ISL,B_BARR); // west
  // Barrier overhead (stop jumping over)
  bfill(dim,cx-R_ISL,TOP+5,cz+BR,cx+R_ISL,TOP+5,cz+BR,B_BARR);
  bfill(dim,cx-R_ISL,TOP+5,cz-BR,cx+R_ISL,TOP+5,cz-BR,B_BARR);
  bfill(dim,cx+BR,TOP+5,cz-R_ISL,cx+BR,TOP+5,cz+R_ISL,B_BARR);
  bfill(dim,cx-BR,TOP+5,cz-R_ISL,cx-BR,TOP+5,cz+R_ISL,B_BARR);

  // Soul ore veins in island body
  if(!already){
    for(let i=0;i<90;i++){
      const a=Math.random()*Math.PI*2, r=Math.random()*(R_ISL-6);
      bset(dim,Math.floor(cx+Math.cos(a)*r),TOP-2-Math.floor(Math.random()*5),Math.floor(cz+Math.sin(a)*r),B_ORE);
    }
  }

  // ══ CASTLE (outer R=18, inner keep R=8) ══
  const R=18, base=TOP+1, topY=base+10;

  // Courtyard floor
  bfill(dim,cx-R,TOP,cz-R,cx+R,TOP,cz+R,B_DARK);

  // Outer walls
  bfill(dim,cx-R,base,cz-R,cx+R,topY,cz-R,B_BRICK); // north
  bfill(dim,cx-R,base,cz+R,cx+R,topY,cz+R,B_BRICK); // south
  bfill(dim,cx-R,base,cz-R,cx-R,topY,cz+R,B_BRICK); // west
  bfill(dim,cx+R,base,cz-R,cx+R,topY,cz+R,B_BRICK); // east

  // South gate (5 wide, 5 tall)
  bfill(dim,cx-2,base,cz+R,cx+2,base+4,cz+R,B_AIR);
  // Gate torches
  bset(dim,cx-3,topY+1,cz+R,B_LANT); bset(dim,cx+3,topY+1,cz+R,B_LANT);

  // Bridge: south gate → island edge
  bfill(dim,cx-2,TOP,cz+R+1,cx+2,TOP,cz+R_ISL,B_DARK);
  bfill(dim,cx-3,TOP+1,cz+R+1,cx-3,TOP+2,cz+R_ISL,B_BRICK); // west railing
  bfill(dim,cx+3,TOP+1,cz+R+1,cx+3,TOP+2,cz+R_ISL,B_BRICK); // east railing

  // Battlements
  for(let i=-R;i<=R;i+=2){
    bset(dim,cx+i,topY+1,cz-R,B_DARK); bset(dim,cx+i,topY+1,cz+R,B_DARK);
    bset(dim,cx-R,topY+1,cz+i,B_DARK); bset(dim,cx+R,topY+1,cz+i,B_DARK);
  }

  // Corner towers (6x6, height topY+8)
  for(const[sx,sz]of[[-R,-R],[R,-R],[-R,R],[R,R]]){
    const tx=cx+sx,tz=cz+sz,th=topY+8;
    bfill(dim,tx-3,base,tz-3,tx+3,th,  tz+3,B_DARK);
    bfill(dim,tx-2,base,tz-2,tx+2,th-1,tz+2,B_AIR);
    bset(dim,tx,th+1,tz,B_LANT);
    for(const[ox,oz]of[[-3,0],[3,0],[0,-3],[0,3],[-3,-3],[3,-3],[-3,3],[3,3]])
      bset(dim,tx+ox,th+1,tz+oz,B_DARK);
  }

  // Inner keep (R2=8)
  const R2=8,keepTop=base+6;
  bfill(dim,cx-R2,base,cz-R2,cx+R2,keepTop,cz-R2,B_DARK); // north
  bfill(dim,cx-R2,base,cz+R2,cx+R2,keepTop,cz+R2,B_DARK); // south
  bfill(dim,cx-R2,base,cz-R2,cx-R2,keepTop,cz+R2,B_DARK); // west
  bfill(dim,cx+R2,base,cz-R2,cx+R2,keepTop,cz+R2,B_DARK); // east
  bfill(dim,cx-R2+1,TOP,cz-R2+1,cx+R2-1,TOP,cz+R2-1,B_DARK); // keep floor
  // Keep ceiling
  bfill(dim,cx-R2+1,keepTop+1,cz-R2+1,cx+R2-1,keepTop+1,cz+R2-1,B_DARK);
  // Keep south gate
  bfill(dim,cx-2,base,cz+R2,cx+2,base+3,cz+R2,B_AIR);
  // Keep north throne door
  bfill(dim,cx-2,base,cz-R2,cx+2,base+3,cz-R2,B_AIR);

  // Throne niche (north wall of keep)
  bfill(dim,cx-2,base,cz-R2+1,cx+2,base+4,cz-R2+1,B_DARK);
  bset(dim,cx,base+2,cz-R2+2,B_LANT);
  for(let lx=-1;lx<=1;lx++) bset(dim,cx+lx,base+4,cz-R2+1,B_DARK);

  // Boss dais at center
  bfill(dim,cx-4,TOP,  cz-4,cx+4,TOP,  cz+4,B_PILLAR);
  bfill(dim,cx-3,TOP+1,cz-3,cx+3,TOP+1,cz+3,B_DARK);
  bset(dim,cx,TOP+2,cz,B_LANT);

  // Pillars in outer courtyard
  for(const[px,pz]of[[-12,-12],[12,-12],[-12,12],[12,12],[-15,0],[15,0],[0,-15]]){
    bfill(dim,cx+px,base,cz+pz,cx+px,topY-1,cz+pz,B_PILLAR);
    bset(dim,cx+px,topY,cz+pz,B_LANT);
  }

  // Wall lanterns interior
  for(const i of[-12,-6,0,6,12]){
    bset(dim,cx+i,base+4,cz-R+1,B_LANT); bset(dim,cx+i,base+4,cz+R-1,B_LANT);
    bset(dim,cx-R+1,base+4,cz+i,B_LANT); bset(dim,cx+R-1,base+4,cz+i,B_LANT);
  }

  if(!already){
    world.setDynamicProperty("realm_built",true);
    populateRealm(dim);
  }
}

function populateRealm(dim){
  const cx=SOUL_X,cz=SOUL_Z;
  try{
    dim.spawnEntity(`${NS}:bog_dusz`,{x:cx+0.5,y:TOP+3,z:cz+0.5});
    dim.spawnEntity(`${NS}:shadow_general`,{x:cx+0.5,y:TOP+2,z:cz-5});
    for(const[mx,mz]of[[-9,-9],[9,-9],[-9,7],[9,7],[-13,0],[13,0]])
      dim.spawnEntity(`${NS}:shadow_mage`,{x:cx+mx+0.5,y:TOP+2,z:cz+mz+0.5});
    for(let i=0;i<15;i++){
      const a=i/15*Math.PI*2, r=9+(i%3)*2;
      dim.spawnEntity(`${NS}:shadow_warrior`,{x:cx+Math.cos(a)*r+0.5,y:TOP+2,z:cz+Math.sin(a)*r+0.5});
    }
    for(const[cx2,cz2]of[[-13,-13],[13,-13],[-13,13],[13,13]])
      placeChest(dim,SOUL_X+cx2,TOP+1,SOUL_Z+cz2);
  }catch{}
  world.sendMessage("§5§l✦ Kraina Dusz powstała! Bóg Dusz czeka! ✦");
}

function placeChest(dim,x,y,z){
  try{
    const b=dim.getBlock({x,y,z});if(!b)return;b.setType("minecraft:chest");
    const inv=b.getComponent("minecraft:inventory")?.container;
    if(inv){
      const loot=[`${NS}:dusza_wojownik`,`${NS}:dusza_mag`,`${NS}:dusza_demon`,`${NS}:ruda_dusz_item`,
                  `${NS}:dusza_gigant`,`${NS}:ksiega_sily`,`${NS}:dusza_cien`,`${NS}:dusza_aniol`,
                  `${NS}:dusza_elf`,`${NS}:ksiega_burzy`,`${NS}:ring_sily`,`${NS}:ring_obrony`,
                  `${NS}:zbroja_dusz_helm`,`${NS}:zbroja_dusz_chest`];
      for(let i=0;i<9;i++){const id=loot[Math.floor(Math.random()*loot.length)];
        try{inv.addItem(new ItemStack(id,1+Math.floor(Math.random()*2)));}catch{}}
      if(Math.random()<0.12) try{inv.addItem(new ItemStack(`${NS}:dusza_smok`,1));}catch{}
    }
  }catch{}
}

// ══ ITEM USE ══
world.beforeEvents.itemUse.subscribe(ev=>{
  const p=ev.source,item=ev.itemStack; if(!item)return;

  if(item.typeId===`${NS}:kula_dusz`){
    ev.cancel=true;
    system.run(()=>{
      if(isInSoulRealm(p)){
        const sp=world.getDefaultSpawnLocation();
        try{p.teleport({x:sp.x,y:sp.y+1,z:sp.z},{dimension:getOW()});}catch{}
        p.sendMessage("§6§lWróciłeś do świata żywych...");
        p.dimension.spawnParticle("minecraft:totem_particle",p.location);
        // exit is free — no item consumed
      } else {
        if(!consumeItem(p,`${NS}:kula_dusz`)){p.sendMessage("§cBrak Kuli Dusz!");return;}
        enterRealm(p);
      }
    }); return;
  }

  if(item.typeId===`${NS}:berlo_dusz`){ev.cancel=true;system.run(()=>openStaffMenu(p));return;}

  if(ELEMENTAL_SPELLS[item.typeId]){
    ev.cancel=true;
    if(p.isSneaking){
      system.run(()=>{
        const sp=ELEMENTAL_SPELLS[item.typeId].spells;
        const key=`${NS}:${item.typeId.split(":")[1]}_spell`;
        const cur=Number(item.getDynamicProperty(key)||0),nx=(cur+1)%sp.length;
        const eq=p.getComponent("minecraft:equippable"),mh=eq.getEquipment(EquipmentSlot.Mainhand);
        if(mh){mh.setDynamicProperty(key,nx);eq.setEquipment(EquipmentSlot.Mainhand,mh);p.sendMessage(`§6Zaklęcie: §e${sp[nx].name}`);}
      });
    } else system.run(()=>castElementalSpell(p,item));
    return;
  }

  if(item.typeId.startsWith(`${NS}:ksiega_`)){ev.cancel=true;system.run(()=>useSpellBook(p,item));return;}
});

// ══ BERŁO DUSZ — 7 zaklęć + armia ══
const spawnCd={};
async function openStaffMenu(player){
  const eq=player.getComponent("minecraft:equippable");
  let staff=eq.getEquipment(EquipmentSlot.Mainhand);
  if(!staff||staff.typeId!==`${NS}:berlo_dusz`){player.sendMessage("§cTrzymaj Berło Dusz!");return;}
  const souls=getStaffSouls(staff),MAX=20;
  const cd=spawnCd[player.id]?Math.max(0,Math.ceil((600000-(Date.now()-spawnCd[player.id]))/1000)):0;
  const f=new ActionFormData();
  f.title("§5§l☠ Berło Dusz ☠");
  let body=`§7Dusze: §e${souls.length}§7/§e${MAX}  §9Mana: §b${Math.floor(getMana(player))}§7/§b${getManaMax(player)}\n`;
  body+=cd>0?`§cOdnowienie armii: §e${Math.floor(cd/60)}m ${cd%60}s\n\n`:`§aArmia gotowa!\n\n`;
  if(!souls.length)body+="§7Brak dusz. Dodaj poniżej.";
  else{const cnt={};for(const s of souls)cnt[s]=(cnt[s]||0)+1;for(const[k,v]of Object.entries(cnt))body+=`§f${SOUL_NAMES[k]||k}: §e${v}\n`;}
  f.body(body);
  f.button("§a⚔ PRZYWOŁAJ ARMIĘ");
  f.button("§e🔄 Przypomnij Armię (teleportuj do mnie)");
  f.button("§f☠ Kolce z Kości §8[15 many]");
  f.button("§5⚡ Burza Dusz §8[25 many]");
  f.button("§c💀 Aura Śmierci §8[30 many]");
  f.button("§9🌀 Wysysanie Dusz §8[20 many]");
  f.button("§b🌪 Wir Dusz §8[20 many]");
  f.button("§e🛡 Tarcza Widm §8[25 many, 3 ciosy]");
  f.button("§d🔮 Klątwa Cienia §8[25 many]");
  f.button("§c✗ Usuń wszystkie dusze");
  f.button("§8✗ Zamknij");
  const inv=player.getComponent("minecraft:inventory").container;
  const invSouls=[];
  for(let i=0;i<inv.size;i++){const s=inv.getItem(i);if(s&&SOUL_ITEM_MAP[s.typeId]&&souls.length<MAX)invSouls.push({idx:i,item:s});}
  for(const{item}of invSouls)f.button(`§e+ Dodaj ${SOUL_NAMES[item.typeId]}`);
  const r=await f.show(player); if(r.canceled)return;
  switch(r.selection){
    case 0: summonArmy(player); break;
    case 1: recallArmy(player); break;
    case 2: boneSpikes(player); break;
    case 3: soulStorm(player); break;
    case 4: deathAura(player); break;
    case 5: soulDrain(player); break;
    case 6: soulVortex(player); break;
    case 7: spectralShield(player); break;
    case 8: curseShadow(player); break;
    case 9:
      staff=eq.getEquipment(EquipmentSlot.Mainhand);
      if(staff){setStaffSouls(staff,[]);eq.setEquipment(EquipmentSlot.Mainhand,staff);}
      player.sendMessage("§7Dusze usunięte."); break;
    case 10: break;
    default:{
      const si=r.selection-11;
      if(si>=0&&si<invSouls.length){
        const{idx,item}=invSouls[si]; souls.push(item.typeId);
        staff=eq.getEquipment(EquipmentSlot.Mainhand);if(!staff)break;
        setStaffSouls(staff,souls);eq.setEquipment(EquipmentSlot.Mainhand,staff);
        const s=inv.getItem(idx);if(s){if(s.amount>1){const n=s.clone();n.amount--;inv.setItem(idx,n);}else inv.setItem(idx,undefined);}
        player.sendMessage(`§a${SOUL_NAMES[item.typeId]} dodana! (${souls.length}/${MAX})`);
      }
    }
  }
}

function summonArmy(player){
  const now=Date.now();
  if(spawnCd[player.id]&&now-spawnCd[player.id]<600000){
    const rem=Math.ceil((600000-(now-spawnCd[player.id]))/1000);
    player.sendMessage(`§cOdnowienie armii: ${Math.floor(rem/60)}m ${rem%60}s`);return;
  }
  const eq=player.getComponent("minecraft:equippable"),mh=eq.getEquipment(EquipmentSlot.Mainhand);
  const souls=mh?getStaffSouls(mh):[];
  if(!souls.length){player.sendMessage("§cBerło puste!");return;}
  const dim=player.dimension;
  const old=dim.getEntities({location:player.location,maxDistance:80,families:["soul"]});
  for(const e of old){try{if(e.getDynamicProperty("owner")===player.id)e.remove();}catch{}}
  spawnCd[player.id]=now;
  const pos=player.location,vd=player.getViewDirection();
  const bx=-vd.x,bz=-vd.z,len=Math.sqrt(bx*bx+bz*bz)||1;
  let n=0;
  for(let i=0;i<Math.min(souls.length,20);i++){
    const eid=SOUL_ITEM_MAP[souls[i]];if(!eid)continue;
    const a=((i%5)-2)*(Math.PI/5),cos=Math.cos(a),sin=Math.sin(a);
    const rx=bx/len*cos-bz/len*sin,rz=bx/len*sin+bz/len*cos;
    const sp={x:pos.x+rx*(2.5+Math.floor(i/5)*2.5),y:pos.y+0.5,z:pos.z+rz*(2.5+Math.floor(i/5)*2.5)};
    try{const e=dim.spawnEntity(eid,sp);e.setDynamicProperty("owner",player.id);n++;}catch{}
  }
  player.sendMessage(`§5§l✦ Przywołano ${n} dusz za plecami! ✦`);
  dim.spawnParticle("minecraft:totem_particle",pos);
}

function recallArmy(player){
  const dim=player.dimension;
  const all=dim.getEntities({location:player.location,maxDistance:500,families:["soul"]});
  const vd=player.getViewDirection(),bx=-vd.x,bz=-vd.z,len=Math.sqrt(bx*bx+bz*bz)||1;
  let n=0;
  for(const e of all){
    if(e.getDynamicProperty("owner")!==player.id)continue;
    const i=n++;
    const a=((i%5)-2)*(Math.PI/5),cos=Math.cos(a),sin=Math.sin(a);
    const rx=bx/len*cos-bz/len*sin,rz=bx/len*sin+bz/len*cos;
    try{e.teleport({x:player.location.x+rx*3,y:player.location.y+0.5,z:player.location.z+rz*3});}catch{}
  }
  player.sendMessage(n>0?`§5✦ Armia ${n} dusz przypomniana! ✦`:"§7Brak dusz do przypomnięcia.");
}

// ══ CD HELPER ══
function checkCd(cdMap,player,ms,name){
  const now=Date.now();
  if(cdMap[player.id]&&now-cdMap[player.id]<ms){
    player.sendMessage(`§c${name}: ${Math.ceil((ms-(now-cdMap[player.id]))/1000)}s`);return false;
  }
  return true;
}

// ══ STAFF SPELLS ══
const boneCd={},stormCd={},auraCd={},drainCd={},vortexCd={},shieldCd={},curseCd={};
const shieldActive={};

function boneSpikes(player){
  if(!checkCd(boneCd,player,6000,"Kolce"))return;
  if(!useMana(player,15))return;
  boneCd[player.id]=Date.now();
  const dim=player.dimension,head=player.getHeadLocation(),dir=player.getViewDirection();
  for(let i=1;i<=14;i++)try{dim.spawnParticle("minecraft:basic_crit_particle",{x:head.x+dir.x*i,y:head.y-0.3+Math.sin(i*0.4)*0.2,z:head.z+dir.z*i});}catch{}
  const tgts=player.getEntitiesFromViewDirection({maxDistance:15}).map(r=>r.entity).filter(e=>e&&e.typeId!=="minecraft:player");
  let n=0;for(const e of tgts.slice(0,5)){try{e.applyDamage(9,{cause:"entityAttack",damagingEntity:player});e.addEffect("minecraft:slowness",60,{amplifier:2});n++;}catch{}}
  player.sendMessage(n>0?`§f☠ Kolce z Kości! Trafiono ${n}`:"§f☠ Kolce z Kości!");
}

function soulStorm(player){
  if(!checkCd(stormCd,player,8000,"Burza"))return;
  if(!useMana(player,25))return;
  stormCd[player.id]=Date.now();
  const near=player.dimension.getEntities({location:player.location,maxDistance:18,excludeFamilies:["player","soul",NS]});
  let n=0;
  for(const e of near.slice(0,6)){
    try{player.dimension.spawnEntity("minecraft:lightning_bolt",e.location);e.applyDamage(8,{cause:"lightning",damagingEntity:player});n++;}catch{}
  }
  player.sendMessage(`§5⚡ Burza Dusz! Pioruny uderzyły ${n} wrogów!`);
}

function deathAura(player){
  if(!checkCd(auraCd,player,10000,"Aura"))return;
  if(!useMana(player,30))return;
  auraCd[player.id]=Date.now();
  const near=player.dimension.getEntities({location:player.location,maxDistance:10,excludeFamilies:["player","soul",NS]});
  let n=0;
  for(const e of near){
    try{e.applyDamage(15,{cause:"entityAttack",damagingEntity:player});e.addEffect("minecraft:wither",100,{amplifier:2});e.addEffect("minecraft:weakness",100,{amplifier:3});n++;}catch{}
  }
  for(let a=0;a<16;a++){const ang=a/16*Math.PI*2;try{player.dimension.spawnParticle("minecraft:basic_crit_particle",{x:player.location.x+Math.cos(ang)*6,y:player.location.y+1,z:player.location.z+Math.sin(ang)*6});}catch{}}
  player.sendMessage(`§c💀 Aura Śmierci! Zniszczono ${n} wrogów!`);
}

function soulDrain(player){
  if(!checkCd(drainCd,player,7000,"Wysysanie"))return;
  if(!useMana(player,20))return;
  drainCd[player.id]=Date.now();
  const tgts=player.getEntitiesFromViewDirection({maxDistance:14}).map(r=>r.entity).filter(e=>e&&e.typeId!=="minecraft:player");
  let heal=0;
  for(const e of tgts.slice(0,4)){try{e.applyDamage(10,{cause:"entityAttack",damagingEntity:player});heal+=5;}catch{}}
  if(heal>0){
    const hp=player.getComponent("minecraft:health");if(hp)hp.setCurrentValue(Math.min(hp.effectiveMax,hp.currentValue+heal));
    player.sendMessage(`§9🌀 Wysysanie Dusz! +${heal} HP!`);
  } else player.sendMessage("§9🌀 Brak celu do wysysania!");
}

function soulVortex(player){
  if(!checkCd(vortexCd,player,8000,"Wir"))return;
  if(!useMana(player,20))return;
  vortexCd[player.id]=Date.now();
  const near=player.dimension.getEntities({location:player.location,maxDistance:16,excludeFamilies:["player","soul",NS]});
  let n=0;
  for(const e of near){
    try{const dx=player.location.x-e.location.x,dz=player.location.z-e.location.z,d=Math.sqrt(dx*dx+dz*dz)||1;
      e.applyKnockback(dx/d,dz/d,5,0.5);n++;}catch{}
  }
  for(let i=0;i<20;i++){const a=i/20*Math.PI*2,r=3+i*0.3;try{player.dimension.spawnParticle("minecraft:totem_particle",{x:player.location.x+Math.cos(a)*r,y:player.location.y+i*0.2,z:player.location.z+Math.sin(a)*r});}catch{}}
  player.sendMessage(`§b🌪 Wir Dusz! Wciągnięto ${n} wrogów!`);
}

function spectralShield(player){
  if(!checkCd(shieldCd,player,15000,"Tarcza"))return;
  if(!useMana(player,25))return;
  shieldCd[player.id]=Date.now();
  shieldActive[player.id]={charges:3};
  player.addEffect("minecraft:resistance",120,{amplifier:3,showParticles:false});
  player.sendMessage("§e🛡 Tarcza Widm aktywna! Blokuje 3 ciosy.");
}

function curseShadow(player){
  if(!checkCd(curseCd,player,8000,"Klątwa"))return;
  if(!useMana(player,25))return;
  curseCd[player.id]=Date.now();
  const tgts=player.getEntitiesFromViewDirection({maxDistance:22}).map(r=>r.entity).filter(e=>e&&e.typeId!=="minecraft:player");
  let n=0;
  for(const e of tgts.slice(0,5)){
    try{e.addEffect("minecraft:poison",200,{amplifier:2});e.addEffect("minecraft:blindness",100,{amplifier:2});
      e.addEffect("minecraft:weakness",200,{amplifier:3});e.addEffect("minecraft:slowness",200,{amplifier:2});n++;}catch{}
  }
  player.sendMessage(`§d🔮 Klątwa Cienia! ${n} wrogów przeklętych!`);
}

// ══ DAMAGE INTERCEPTORS ══
world.afterEvents.entityHurt.subscribe(ev=>{
  const e=ev.hurtEntity; if(!e||!e.isValid())return;
  // Spectral shield
  if(e.typeId==="minecraft:player"&&shieldActive[e.id]){
    const sh=shieldActive[e.id]; sh.charges--;
    const hp=e.getComponent("minecraft:health");
    if(hp)hp.setCurrentValue(Math.min(hp.effectiveMax,hp.currentValue+ev.damage));
    e.dimension.spawnParticle("minecraft:totem_particle",e.location);
    e.onScreenDisplay.setActionBar(`§e🛡 Tarcza Widm! ${sh.charges} ładunki`);
    if(sh.charges<=0){delete shieldActive[e.id];e.sendMessage("§7Tarcza rozpadła się.");}
    return;
  }
  // Spider-Man player dodge
  if(e.typeId==="minecraft:player"&&wornCostume(e)==="pajak"){
    const proj=ev.damageSource?.cause==="projectile";
    if(proj||Math.random()<0.40){
      try{const hp=e.getComponent("minecraft:health");hp.setCurrentValue(Math.min(hp.effectiveMax,hp.currentValue+ev.damage));
        e.dimension.spawnParticle("minecraft:basic_smoke_particle",e.location);
        e.onScreenDisplay.setActionBar(proj?"§c🕸 UNIK (strzała)":"§c🕸 UNIK!");}catch{}
    }
    return;
  }
  // Hero Spider-Man dodge
  if(e.typeId===`${NS}:hero_pajak`){
    const proj=ev.damageSource?.cause==="projectile";
    if(proj||Math.random()<0.40)try{const hp=e.getComponent("minecraft:health");hp.setCurrentValue(Math.min(hp.effectiveMax,hp.currentValue+ev.damage));}catch{}
  }
});

// ══ ELEMENTAL SPELLS ══
const elemCd={};
function castElementalSpell(player,item){
  const k=`${player.id}_${item.typeId}`,now=Date.now();
  if(elemCd[k]&&now-elemCd[k]<5000){player.sendMessage(`§cOdnowienie: ${Math.ceil((5000-(now-elemCd[k]))/1000)}s`);return;}
  if(!useMana(player,20))return;
  elemCd[k]=now;
  const sd=ELEMENTAL_SPELLS[item.typeId];if(!sd)return;
  const key=`${NS}:${item.typeId.split(":")[1]}_spell`;
  const idx=Number(item.getDynamicProperty(key)||0),spell=sd.spells[idx%sd.spells.length];
  player.sendMessage(spell.msg);
  const dim=player.dimension,head=player.getHeadLocation(),dir=player.getViewDirection();
  const pcol=item.typeId===`${NS}:laska_ognia`?"minecraft:basic_flame_particle":
             item.typeId===`${NS}:laska_lodu`?"minecraft:basic_smoke_particle":"minecraft:totem_particle";
  for(let i=1;i<=16;i++)try{dim.spawnParticle(pcol,{x:head.x+dir.x*i,y:head.y+dir.y*i,z:head.z+dir.z*i});}catch{}
  const near=dim.getEntities({location:player.location,maxDistance:14,excludeFamilies:["player","soul",NS]});
  for(const e of near){
    try{e.addEffect(spell.effect,spell.dur,{amplifier:spell.power-1,showParticles:true});}catch{}
    if(spell.fire){try{e.setOnFire(4,true);e.applyDamage(4,{cause:"fire",damagingEntity:player});}catch{}}
    if(spell.knock){try{const dx=e.location.x-player.location.x,dz=e.location.z-player.location.z,d=Math.sqrt(dx*dx+dz*dz)||1;e.applyKnockback(dx/d,dz/d,3+spell.power,0.6);}catch{}}
  }
}

// ══ SPELL BOOKS ══
function useSpellBook(player,item){
  const id=item.typeId; player.dimension.spawnParticle("minecraft:totem_particle",player.location);
  if(id===`${NS}:ksiega_regeneracji`){player.addEffect("minecraft:regeneration",40,{amplifier:9});player.sendMessage("§a§l✦ Regeneracja! ✦");}
  else if(id===`${NS}:ksiega_lewitacji`){player.addEffect("minecraft:levitation",200,{amplifier:4});player.sendMessage("§b§l✦ Lewitacja! ✦");}
  else if(id===`${NS}:ksiega_sily`){player.addEffect("minecraft:strength",600,{amplifier:4});player.sendMessage("§c§l✦ SIŁA! ✦");}
  else if(id===`${NS}:ksiega_oslepienia`){const n=player.dimension.getEntities({location:player.location,maxDistance:15,excludeFamilies:["player","soul",NS]});for(const e of n)try{e.addEffect("minecraft:blindness",300,{amplifier:3});}catch{}player.sendMessage("§8§l✦ Wrogowie zaślepieni! ✦");}
  else if(id===`${NS}:ksiega_burzy`){const pos=player.location;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;try{player.dimension.spawnEntity("minecraft:lightning_bolt",{x:pos.x+Math.cos(a)*5,y:pos.y,z:pos.z+Math.sin(a)*5});}catch{}}player.sendMessage("§e§l✦ ⚡ BURZA! ⚡ ✦");}
  consumeItem(player,id);
}

// ══ ENTITY DEATH EVENTS ══
world.afterEvents.entityDie.subscribe(ev=>{
  const e=ev.deadEntity;if(!e)return;const pos=e.location,dim=e.dimension;
  if(e.typeId==="minecraft:warden")try{dim.spawnItem(new ItemStack(`${NS}:fragment_warden`,1),pos);}catch{}
  else if(e.typeId==="minecraft:ender_dragon")try{dim.spawnItem(new ItemStack(`${NS}:fragment_dragon`,1),pos);}catch{}
  else if(e.typeId==="minecraft:wither")try{dim.spawnItem(new ItemStack(`${NS}:fragment_wither`,1),pos);}catch{}
  if(e.typeId===`${NS}:bog_dusz`){
    dim.spawnParticle("minecraft:huge_explosion_emitter",pos);
    world.sendMessage("§5§l☠ BÓG DUSZ POKONANY! WIELKA CHWAŁA! ☠");
    try{dim.spawnItem(new ItemStack(`${NS}:berlo_dusz`,1),pos);}catch{}
    try{dim.spawnItem(new ItemStack(`${NS}:kula_dusz`,3),pos);}catch{}
    try{dim.spawnItem(new ItemStack(`${NS}:zbroja_dusz_helm`,1),pos);}catch{}
    world.setDynamicProperty("realm_built",undefined); // allow realm rebuild for next visit
  }
  if(e.typeId===`${NS}:cien_smok`){
    const owner=e.getDynamicProperty("owner");
    if(owner){dragonCd[owner]=Date.now();const p=world.getAllPlayers().find(pp=>pp.id===owner);if(p)p.sendMessage("§cTwój smok zginął! Odnowienie 5 min.");}
  }
});

// General spawns on skeleton horse
world.afterEvents.entitySpawn.subscribe(ev=>{
  const e=ev.entity;if(!e||!e.isValid())return;
  if(e.typeId===`${NS}:shadow_general`){
    if(e.hasTag("mounted"))return;
    e.addTag("mounted");e.addTag("the_general");
    system.runTimeout(()=>{
      try{
        const horse=e.dimension.spawnEntity("minecraft:skeleton_horse",e.location);
        horse.addTag("general_mount");horse.triggerEvent("minecraft:on_tame");
        e.dimension.runCommand(`ride @e[tag=the_general,c=1] start_riding @e[tag=general_mount,c=1] teleport_ride`);
      }catch{}
    },6);
  }
});

// Boss spawns extra warriors periodically
let wt=0;
system.runInterval(()=>{
  wt++;if(wt%200!==0)return;
  const endDim=getSoulDim();
  for(const boss of endDim.getEntities({type:`${NS}:bog_dusz`})){
    const ws=endDim.getEntities({type:`${NS}:shadow_warrior`,location:boss.location,maxDistance:30});
    if(ws.length<10){const a=Math.random()*Math.PI*2;try{endDim.spawnEntity(`${NS}:shadow_warrior`,{x:boss.location.x+Math.cos(a)*4,y:boss.location.y,z:boss.location.z+Math.sin(a)*4});}catch{}}
  }
},1);

// ══ VOID PROTECTION (in soul realm) ══
system.runInterval(()=>{
  for(const p of world.getPlayers()){
    if(!isInSoulRealm(p))continue;
    // Renew slow falling continuously
    p.addEffect("minecraft:slow_falling",120,{amplifier:0,showParticles:false});
    // Rescue if fallen below island
    if(p.location.y<TOP-15){
      try{p.teleport({x:SOUL_X+0.5,y:TOP+2,z:SPAWN_Z+0.5},{dimension:getSoulDim()});}catch{}
      p.sendMessage("§c§l✦ Ochrona Pustki aktywna! ✦");
    }
  }
},20);

// ══ MYSTERY DOG SPAWN ══
system.runTimeout(()=>{system.runInterval(()=>{
  if(Math.random()>0.001)return;
  for(const p of world.getPlayers()){
    if(p.dimension.id!=="minecraft:overworld")continue;
    if(p.dimension.getEntities({type:`${NS}:mystery_dog`,location:p.location,maxDistance:200}).length>0)continue;
    const a=Math.random()*Math.PI*2,d=20+Math.random()*30;
    try{p.dimension.spawnEntity(`${NS}:mystery_dog`,{x:p.location.x+Math.cos(a)*d,y:p.location.y,z:p.location.z+Math.sin(a)*d});}catch{}
    break;
  }
},20);},100);

// ══ HERO NPCs ══
const HERO_TYPES=["pajak","stalowy","techno","kapitan","mag_sz"];
system.runTimeout(()=>{system.runInterval(()=>{
  if(Math.random()>0.004)return;
  const ow=getOW(); let total=0;
  for(const h of HERO_TYPES)total+=ow.getEntities({type:`${NS}:hero_${h}`}).length;
  if(total>=2)return;
  const players=world.getPlayers().filter(p=>p.dimension.id==="minecraft:overworld");
  if(!players.length)return;
  const p=players[Math.floor(Math.random()*players.length)];
  const a=Math.random()*Math.PI*2,dist=80+Math.random()*60;
  const x=Math.floor(p.location.x+Math.cos(a)*dist),z=Math.floor(p.location.z+Math.sin(a)*dist);
  const hero=HERO_TYPES[Math.floor(Math.random()*HERO_TYPES.length)];
  try{ow.spawnEntity(`${NS}:hero_${hero}`,{x:x+0.5,y:p.location.y+1,z:z+0.5});p.sendMessage(`§e⚡ Gdzieś w pobliżu pojawił się bohater... §7(${hero})`);}catch{}
},200);},200);

// ══ SUPERHERO POWERS ══
const HERO_COSTUMES={
  [`${NS}:kostium_pajak`]:"pajak",[`${NS}:kostium_stalowy`]:"stalowy",[`${NS}:kostium_techno`]:"techno",
  [`${NS}:kostium_kapitan`]:"kapitan",[`${NS}:kostium_mag_sz`]:"mag_sz",
};
function wornCostume(p){try{const c=p.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Chest);return c?HERO_COSTUMES[c.typeId]:null;}catch{return null;}}

system.runInterval(()=>{
  for(const p of world.getPlayers()){
    const h=wornCostume(p);if(!h)continue;
    const e=(id,amp)=>{try{p.addEffect(id,60,{amplifier:amp,showParticles:false});}catch{}};
    if(h==="pajak"){e("minecraft:speed",2);e("minecraft:jump_boost",3);e("minecraft:slow_falling",0);}
    else if(h==="stalowy"){e("minecraft:strength",2);e("minecraft:resistance",2);e("minecraft:jump_boost",4);e("minecraft:slow_falling",0);e("minecraft:fire_resistance",0);e("minecraft:night_vision",0);}
    else if(h==="techno"){e("minecraft:resistance",2);e("minecraft:jump_boost",4);e("minecraft:slow_falling",0);e("minecraft:fire_resistance",0);}
    else if(h==="kapitan"){e("minecraft:resistance",3);e("minecraft:strength",1);e("minecraft:health_boost",2);}
    else if(h==="mag_sz"){e("minecraft:regeneration",0);e("minecraft:strength",1);e("minecraft:night_vision",0);}
  }
},20);

const sneakPrev={},powerCd={};
system.runInterval(()=>{
  for(const p of world.getPlayers()){
    const h=wornCostume(p),now=p.isSneaking,was=sneakPrev[p.id]||false;
    sneakPrev[p.id]=now;
    if(!h||!now||was)continue;
    const t=Date.now();if(powerCd[p.id]&&t-powerCd[p.id]<4000)continue;
    powerCd[p.id]=t;useHeroPower(p,h);
  }
},2);

function useHeroPower(p,h){
  const dim=p.dimension,head=p.getHeadLocation(),dir=p.getViewDirection();
  if(h==="pajak"){
    const ts=p.getEntitiesFromViewDirection({maxDistance:18}).map(r=>r.entity).filter(e=>e&&e.typeId!=="minecraft:player");
    let n=0;for(const e of ts.slice(0,4)){try{e.addEffect("minecraft:slowness",100,{amplifier:4});const dx=p.location.x-e.location.x,dz=p.location.z-e.location.z,d=Math.sqrt(dx*dx+dz*dz)||1;e.applyKnockback(dx/d,dz/d,1.5,0.1);n++;}catch{}}
    for(let i=1;i<=18;i++)try{dim.spawnParticle("minecraft:basic_smoke_particle",{x:head.x+dir.x*i,y:head.y+dir.y*i,z:head.z+dir.z*i});}catch{}
    p.onScreenDisplay.setActionBar(n>0?`§c🕸 Sieć! Złapano ${n}`:"§c🕸 Sieć!");
  } else if(h==="stalowy"){
    const ts=p.getEntitiesFromViewDirection({maxDistance:24}).map(r=>r.entity).filter(e=>e&&e.typeId!=="minecraft:player");
    for(let i=1;i<=24;i++)try{dim.spawnParticle("minecraft:basic_flame_particle",{x:head.x+dir.x*i,y:head.y+dir.y*i,z:head.z+dir.z*i});}catch{}
    let n=0;for(const e of ts.slice(0,3)){try{e.applyDamage(12,{cause:"fire",damagingEntity:p});e.setOnFire(5,true);n++;}catch{}}
    p.onScreenDisplay.setActionBar(n>0?`§9🔥 Laser! Trafiono ${n}`:"§9🔥 Laser!");
  } else if(h==="techno"){
    const near=dim.getEntities({location:p.location,maxDistance:7,excludeTypes:["minecraft:player","minecraft:item"]});
    let n=0;for(const e of near){try{const dx=e.location.x-p.location.x,dz=e.location.z-p.location.z,d=Math.sqrt(dx*dx+dz*dz)||1;e.applyKnockback(dx/d,dz/d,3.5,0.7);e.applyDamage(8,{cause:"entityAttack",damagingEntity:p});n++;}catch{}}
    for(let a=0;a<12;a++){const ang=a/12*Math.PI*2;try{dim.spawnParticle("minecraft:basic_flame_particle",{x:p.location.x+Math.cos(ang)*3,y:p.location.y+1,z:p.location.z+Math.sin(ang)*3});}catch{}}
    p.onScreenDisplay.setActionBar(`§6💥 Repulsor! ${n}`);
  } else if(h==="kapitan"){
    const near=dim.getEntities({location:p.location,maxDistance:9,excludeTypes:["minecraft:player","minecraft:item"]});
    let n=0;for(const e of near){try{e.applyDamage(10,{cause:"entityAttack",damagingEntity:p});n++;}catch{}}
    for(let a=0;a<16;a++){const ang=a/16*Math.PI*2;try{dim.spawnParticle("minecraft:totem_particle",{x:p.location.x+Math.cos(ang)*5,y:p.location.y+1,z:p.location.z+Math.sin(ang)*5});}catch{}}
    p.onScreenDisplay.setActionBar(`§b🛡 Rzut tarczą! ${n}`);
  } else if(h==="mag_sz"){
    const dest={x:head.x+dir.x*8,y:p.location.y+0.2,z:head.z+dir.z*8};
    try{dim.spawnParticle("minecraft:totem_particle",p.location);p.teleport(dest,{dimension:dim});dim.spawnParticle("minecraft:totem_particle",dest);}catch{}
    p.onScreenDisplay.setActionBar("§d✦ Teleportacja!");
  }
}

// ══ SOUL ORE DROP (script-based for reliability) ══
world.afterEvents.playerBreakBlock.subscribe(ev=>{
  if(ev.brokenBlockPermutation?.type?.id===`${NS}:ruda_dusz`){
    const drops=1+Math.floor(Math.random()*2);
    const loc=ev.block.location;
    try{ev.dimension.spawnItem(new ItemStack(`${NS}:ruda_dusz_item`,drops),{x:loc.x+0.5,y:loc.y+0.5,z:loc.z+0.5});}catch{}
  }
});

// ══ MANA SYSTEM ══
const P_MANA="krainadura:mana";
const P_RING1="krainadura:ring1",P_RING2="krainadura:ring2",P_GLOVE="krainadura:glove";
const ACC_NAMES={
  "krainadura:ring_many":"Pierścień Many","krainadura:ring_sily":"Pierścień Siły",
  "krainadura:ring_szybkosci":"Pierścień Szybkości","krainadura:ring_obrony":"Pierścień Obrony",
  "krainadura:ring_cienia":"Pierścień Cienia","krainadura:rekawice_mocy":"Rękawice Mocy",
  "krainadura:rekawice_zywiolow":"Rękawice Żywiołów",
};
function isRing(id){return id&&id.startsWith("krainadura:ring_");}
function isGlove(id){return id&&id.startsWith("krainadura:rekawice_");}
function getMana(p){const v=p.getDynamicProperty(P_MANA);return v===undefined?100:Number(v);}
function getManaMax(p){let m=100;if(p.getDynamicProperty(P_RING1)==="krainadura:ring_many")m+=80;if(p.getDynamicProperty(P_RING2)==="krainadura:ring_many")m+=80;return m;}
function setMana(p,v){p.setDynamicProperty(P_MANA,Math.max(0,Math.min(getManaMax(p),v)));}
function useMana(p,cost){const m=getMana(p);if(m<cost){try{p.onScreenDisplay.setActionBar(`§9Brak many! (${Math.floor(m)}/${cost})`);}catch{}return false;}setMana(p,m-cost);return true;}

system.runInterval(()=>{
  for(const p of world.getPlayers()){
    const max=getManaMax(p);let m=getMana(p);if(m>max)m=max;let regen=2;
    for(const slot of[P_RING1,P_RING2,P_GLOVE]){
      const a=p.getDynamicProperty(slot);
      if(a==="krainadura:ring_sily")   try{p.addEffect("minecraft:strength",60,{amplifier:1,showParticles:false});}catch{}
      if(a==="krainadura:ring_szybkosci")try{p.addEffect("minecraft:speed",60,{amplifier:1,showParticles:false});}catch{}
      if(a==="krainadura:ring_obrony") try{p.addEffect("minecraft:resistance",60,{amplifier:1,showParticles:false});}catch{}
      if(a==="krainadura:ring_cienia") try{p.addEffect("minecraft:night_vision",60,{showParticles:false});}catch{}
      if(a==="krainadura:ring_many")regen+=2;
      if(a==="krainadura:rekawice_zywiolow")regen+=1;
    }
    setMana(p,m+regen);
  }
},20);

system.runInterval(()=>{
  for(const p of world.getPlayers()){
    let held=null;
    try{held=p.getComponent("minecraft:equippable").getEquipment(EquipmentSlot.Mainhand)?.typeId;}catch{}
    if(held!==`${NS}:berlo_dusz`&&!(held&&ELEMENTAL_SPELLS[held]))continue;
    const m=Math.floor(getMana(p)),mx=getManaMax(p);
    const bars=Math.round(m/mx*10);
    const bar="§b"+"|".repeat(bars)+"§8"+"|".repeat(10-bars);
    try{p.onScreenDisplay.setActionBar(`§9Mana: ${bar} §7${m}/${mx}`);}catch{}
  }
},10);

world.beforeEvents.itemUse.subscribe(ev=>{
  const p=ev.source,it=ev.itemStack;if(!it)return;
  if(isRing(it.typeId)||isGlove(it.typeId)){ev.cancel=true;system.run(()=>openAccessoryMenu(p));}
});

async function openAccessoryMenu(player){
  const r1=player.getDynamicProperty(P_RING1),r2=player.getDynamicProperty(P_RING2),g=player.getDynamicProperty(P_GLOVE);
  const f=new ActionFormData();
  f.title("§5§l✦ Ekwipunek Magiczny ✦");
  f.body(`§9Mana: §b${Math.floor(getMana(player))}§7/§b${getManaMax(player)}\n\n`+
    `§7Pierścień 1: §f${r1?ACC_NAMES[r1]:"§8(pusty)"}\n`+
    `§7Pierścień 2: §f${r2?ACC_NAMES[r2]:"§8(pusty)"}\n`+
    `§7Rękawice: §f${g?ACC_NAMES[g]:"§8(pusty)"}\n`);
  f.button("§aZałóż akcesorium z ręki");
  f.button("§cZdejmij Pierścień 1");
  f.button("§cZdejmij Pierścień 2");
  f.button("§cZdejmij Rękawice");
  f.button("§8Zamknij");
  const res=await f.show(player);if(res.canceled||res.selection===4)return;
  const eq=player.getComponent("minecraft:equippable"),mh=eq.getEquipment(EquipmentSlot.Mainhand);
  if(res.selection===0){
    if(!mh||!(isRing(mh.typeId)||isGlove(mh.typeId))){player.sendMessage("§cTrzymaj pierścień/rękawice w ręce.");return;}
    if(isGlove(mh.typeId))player.setDynamicProperty(P_GLOVE,mh.typeId);
    else if(!player.getDynamicProperty(P_RING1))player.setDynamicProperty(P_RING1,mh.typeId);
    else if(!player.getDynamicProperty(P_RING2))player.setDynamicProperty(P_RING2,mh.typeId);
    else{player.sendMessage("§cOba sloty pierścieni zajęte!");return;}
    consumeItem(player,mh.typeId);player.sendMessage(`§aZałożono: §f${ACC_NAMES[mh.typeId]}`);return;
  }
  const slot=[null,P_RING1,P_RING2,P_GLOVE][res.selection];
  const cur=player.getDynamicProperty(slot);
  if(cur){player.setDynamicProperty(slot,undefined);try{player.getComponent("minecraft:inventory").container.addItem(new ItemStack(cur,1));}catch{}player.sendMessage(`§7Zdjęto: §f${ACC_NAMES[cur]}`);}
}

// ══ SHADOW DRAGON PET ══
const dragonCd={},dragonAtkCd={};
const DRAGON_RESUMMON=300000;

function playerDragon(p){
  const ds=p.dimension.getEntities({type:`${NS}:cien_smok`});
  for(const d of ds){if(d.getDynamicProperty("owner")===p.id)return d;}
  return null;
}

function summonDragon(p){
  if(playerDragon(p)){p.sendMessage("§5Twój smok już istnieje!");return;}
  const now=Date.now();
  if(dragonCd[p.id]&&now-dragonCd[p.id]<DRAGON_RESUMMON){
    const rem=Math.ceil((DRAGON_RESUMMON-(now-dragonCd[p.id]))/1000);
    p.sendMessage(`§cSmok odnawia się: ${Math.floor(rem/60)}m ${rem%60}s`);return;
  }
  const vd=p.getViewDirection();
  const sp={x:p.location.x-vd.x*3,y:p.location.y+1,z:p.location.z-vd.z*3};
  try{
    const d=p.dimension.spawnEntity(`${NS}:cien_smok`,sp);
    d.setDynamicProperty("owner",p.id);
    try{d.nameTag=`§5Smok ${p.name}`;}catch{}
    p.dimension.spawnParticle("minecraft:totem_particle",sp);
    p.sendMessage("§5§l✦ Cienisty Smok przybywa!\n§7Wsiądź i kucnij aby strzelać Kulami Cienia (10 many). ✦");
  }catch{p.sendMessage("§cNie udało się przywołać smoka.");}
}

function dismissDragon(p){
  const d=playerDragon(p);if(!d){p.sendMessage("§7Nie masz przywołanego smoka.");return;}
  try{d.dimension.spawnParticle("minecraft:totem_particle",d.location);d.remove();}catch{}
  dragonCd[p.id]=Date.now();p.sendMessage("§5Smok odesłany. (odnowienie 5 min)");
}

world.beforeEvents.itemUse.subscribe(ev=>{
  const p=ev.source,it=ev.itemStack;if(!it)return;
  if(it.typeId===`${NS}:dusza_smok`){ev.cancel=true;system.run(()=>{if(p.isSneaking)dismissDragon(p);else summonDragon(p);});}
});

system.runInterval(()=>{
  for(const p of world.getPlayers()){
    const d=playerDragon(p);if(!d)continue;
    let riding=false;
    try{const rc=d.getComponent("minecraft:rideable");riding=rc&&rc.getRiders&&rc.getRiders().some(r=>r.id===p.id);}catch{}
    if(!riding||!p.isSneaking)continue;
    const now=Date.now();if(dragonAtkCd[p.id]&&now-dragonAtkCd[p.id]<1500)continue;
    dragonAtkCd[p.id]=now;shootShadowBall(p,d);
  }
},3);

function shootShadowBall(p,d){
  if(!useMana(p,10))return;
  const head=p.getHeadLocation(),dir=p.getViewDirection();
  const sp={x:head.x+dir.x*3,y:head.y+dir.y*3,z:head.z+dir.z*3};
  try{
    const proj=d.dimension.spawnEntity(`${NS}:kula_cieni_proj`,sp);
    const projc=proj.getComponent("minecraft:projectile");
    if(projc&&projc.shoot)projc.shoot({x:dir.x,y:dir.y,z:dir.z});
    else try{proj.applyImpulse({x:dir.x*2.5,y:dir.y*2.5,z:dir.z*2.5});}catch{}
    for(let i=1;i<=4;i++)try{d.dimension.spawnParticle("minecraft:basic_smoke_particle",{x:sp.x+dir.x*i,y:sp.y+dir.y*i,z:sp.z+dir.z*i});}catch{}
    p.onScreenDisplay.setActionBar("§5🐉 Kula Cieni!");
  }catch{}
}

world.afterEvents.worldInitialize.subscribe(()=>{
  world.sendMessage("§5[Kraina Dusz v8] §aZaładowano! §eUżyj Kuli Dusz aby wejść do Krainy Dusz.");
});
'''

open(f'{BP}/scripts/main.js','w',encoding='utf-8').write(MAIN)
print(f"✓ main.js ({len(MAIN)//1024}KB)")

# ══════════════════════════════════════════════════════════════════
# 2. ENTITY JSON UPDATES
# ══════════════════════════════════════════════════════════════════

# shadow_warrior — neutral (no player target), shadow_guard family
w(f'{BP}/entities/shadow_warrior.json',{
  "format_version":"1.21.0",
  "minecraft:entity":{
    "description":{"identifier":"krainadura:shadow_warrior","is_spawnable":True,"is_summonable":True,"is_experimental":False},
    "component_groups":{},
    "components":{
      "minecraft:type_family":{"family":["krainadura","shadow_guard","monster"]},
      "minecraft:health":{"value":60,"max":60},
      "minecraft:movement":{"value":0.32},
      "minecraft:collision_box":{"width":0.6,"height":1.8},
      "minecraft:attack":{"damage":10},
      "minecraft:nameable":{},
      "minecraft:physics":{},
      "minecraft:pushable":{"is_pushable":True,"is_pushable_by_piston":True},
      "minecraft:navigation.walk":{"can_path_over_water":False,"avoid_water":True},
      "minecraft:movement.basic":{},
      "minecraft:jump.static":{},
      "minecraft:can_climb":{},
      "minecraft:persistent":{},
      "minecraft:behavior.hurt_by_target":{"priority":1},
      "minecraft:behavior.melee_attack":{"priority":2,"speed_multiplier":1.2,"track_target":True,"attack_once":False},
      "minecraft:behavior.look_at_player":{"priority":7,"look_distance":12},
      "minecraft:behavior.random_stroll":{"priority":9,"speed_multiplier":0.5,"xz_dist":8,"y_dist":3},
      "minecraft:loot":{"table":"loot_tables/entities/shadow_warrior.json"},
      "minecraft:equipment":{"table":"loot_tables/entities/shadow_warrior.json"}
    },
    "events":{}
  }
})

# shadow_mage — neutral, ranged only
w(f'{BP}/entities/shadow_mage.json',{
  "format_version":"1.21.0",
  "minecraft:entity":{
    "description":{"identifier":"krainadura:shadow_mage","is_spawnable":True,"is_summonable":True,"is_experimental":False},
    "component_groups":{},
    "components":{
      "minecraft:type_family":{"family":["krainadura","shadow_guard","monster"]},
      "minecraft:health":{"value":35,"max":35},
      "minecraft:movement":{"value":0.25},
      "minecraft:collision_box":{"width":0.6,"height":1.8},
      "minecraft:attack":{"damage":6},
      "minecraft:nameable":{},
      "minecraft:physics":{},
      "minecraft:pushable":{"is_pushable":True,"is_pushable_by_piston":True},
      "minecraft:navigation.walk":{"can_path_over_water":False,"avoid_water":True},
      "minecraft:movement.basic":{},
      "minecraft:jump.static":{},
      "minecraft:can_climb":{},
      "minecraft:persistent":{},
      "minecraft:behavior.hurt_by_target":{"priority":1},
      "minecraft:behavior.ranged_attack":{"priority":2,"speed_multiplier":0.7,"attack_interval_min":2.5,"attack_interval_max":4.0,"attack_radius":22},
      "minecraft:shooter":{"def":"minecraft:small_fireball","aux_val":-1,"power":1.6},
      "minecraft:behavior.look_at_player":{"priority":7,"look_distance":14},
      "minecraft:behavior.random_stroll":{"priority":9,"speed_multiplier":0.5,"xz_dist":6,"y_dist":3},
      "minecraft:loot":{"table":"loot_tables/entities/shadow_mage.json"}
    },
    "events":{}
  }
})

# shadow_general — neutral
w(f'{BP}/entities/shadow_general.json',{
  "format_version":"1.21.0",
  "minecraft:entity":{
    "description":{"identifier":"krainadura:shadow_general","is_spawnable":True,"is_summonable":True,"is_experimental":False},
    "component_groups":{},
    "components":{
      "minecraft:type_family":{"family":["krainadura","shadow_guard","general","monster"]},
      "minecraft:health":{"value":150,"max":150},
      "minecraft:movement":{"value":0.38},
      "minecraft:collision_box":{"width":0.6,"height":1.8},
      "minecraft:attack":{"damage":16},
      "minecraft:nameable":{},
      "minecraft:physics":{},
      "minecraft:pushable":{"is_pushable":True,"is_pushable_by_piston":True},
      "minecraft:navigation.walk":{"can_path_over_water":False,"avoid_water":True},
      "minecraft:movement.basic":{},
      "minecraft:jump.static":{},
      "minecraft:can_climb":{},
      "minecraft:persistent":{},
      "minecraft:behavior.hurt_by_target":{"priority":1},
      "minecraft:behavior.melee_attack":{"priority":2,"speed_multiplier":1.3,"track_target":True,"attack_once":False},
      "minecraft:behavior.look_at_player":{"priority":7,"look_distance":14},
      "minecraft:behavior.random_stroll":{"priority":9,"speed_multiplier":0.5,"xz_dist":8,"y_dist":3},
      "minecraft:loot":{"table":"loot_tables/entities/shadow_general.json"},
      "minecraft:equipment":{"table":"loot_tables/entities/shadow_general.json"}
    },
    "events":{}
  }
})

# mystery_dog — fixed: removed interact component, fixed family, fixed display_name
w(f'{BP}/entities/mystery_dog.json',{
  "format_version":"1.21.0",
  "minecraft:entity":{
    "description":{"identifier":"krainadura:mystery_dog","is_spawnable":True,"is_summonable":True,"is_experimental":False},
    "component_groups":{},
    "components":{
      "minecraft:type_family":{"family":["krainadura","mystery_dog","npc"]},
      "minecraft:health":{"value":10000,"max":10000},
      "minecraft:movement":{"value":0.25},
      "minecraft:collision_box":{"width":0.9,"height":1.4},
      "minecraft:nameable":{},
      "minecraft:physics":{},
      "minecraft:pushable":{"is_pushable":True,"is_pushable_by_piston":True},
      "minecraft:navigation.walk":{"can_path_over_water":False,"avoid_water":True},
      "minecraft:movement.basic":{},
      "minecraft:jump.static":{},
      "minecraft:can_climb":{},
      "minecraft:behavior.look_at_player":{"priority":7,"look_distance":10},
      "minecraft:behavior.random_stroll":{"priority":9,"speed_multiplier":0.4},
      "minecraft:economy_trade_table":{
        "display_name":"Tajemniczy Piesek",
        "table":"trading/mystery_dog.json",
        "new_sound_event":"ambient",
        "use_economy":False
      },
      "minecraft:damage_sensor":{"triggers":{"on_damage":{"filters":{"test":"has_damage","value":"any"},"deals_damage":False}}}
    },
    "events":{}
  }
})

# cien_smok — fixed: navigation.fly instead of navigation.walk
w(f'{BP}/entities/cien_smok.json',{
  "format_version":"1.21.0",
  "minecraft:entity":{
    "description":{"identifier":"krainadura:cien_smok","is_spawnable":False,"is_summonable":True,"is_experimental":False},
    "component_groups":{},
    "components":{
      "minecraft:type_family":{"family":["krainadura","dragon","cien_smok"]},
      "minecraft:health":{"value":300,"max":300},
      "minecraft:movement":{"value":0.4},
      "minecraft:movement.fly":{},
      "minecraft:navigation.fly":{
        "can_path_over_water":True,
        "can_path_from_air":True,
        "can_pass_doors":False,
        "can_open_doors":False
      },
      "minecraft:can_fly":{},
      "minecraft:collision_box":{"width":2.4,"height":2.4},
      "minecraft:scale":{"value":2.2},
      "minecraft:knockback_resistance":{"value":1.0},
      "minecraft:attack":{"damage":16},
      "minecraft:follow_range":{"value":48},
      "minecraft:nameable":{},
      "minecraft:persistent":{},
      "minecraft:physics":{},
      "minecraft:rideable":{
        "seat_count":1,
        "family_types":["player"],
        "seats":[{"position":[0,1.6,0],"lock_rider_rotation":0,"min_rider_count":0,"max_rider_count":1,"rotate_rider_by":-90}]
      },
      "minecraft:input_ground_controlled":{},
      "minecraft:behavior.float":{"priority":0},
      "minecraft:behavior.player_ride_tamed":{"priority":1},
      "minecraft:behavior.follow_owner":{"priority":3,"speed_multiplier":1.2,"start_distance":10,"stop_distance":3},
      "minecraft:behavior.look_at_player":{"priority":8,"look_distance":12},
      "minecraft:is_tamed":{},
      "minecraft:behavior.nearest_attackable_target":{
        "priority":4,"reselect_targets":True,"within_radius":24,
        "entity_types":[{"filters":{"all_of":[
          {"test":"is_family","subject":"other","value":"monster"},
          {"test":"is_family","subject":"other","operator":"not","value":"krainadura"}
        ]}}]
      },
      "minecraft:behavior.melee_attack":{"priority":5,"speed_multiplier":1.3,"track_target":True}
    },
    "events":{}
  }
})
print("✓ Entity JSONs updated (neutral guards, fixed dog, dragon fly)")

# ══════════════════════════════════════════════════════════════════
# 3. SOUL ORE BLOCK — remove loot (script handles drops now)
# ══════════════════════════════════════════════════════════════════
w(f'{BP}/blocks/ruda_dusz.json',{
  "format_version":"1.21.0",
  "minecraft:block":{
    "description":{"identifier":"krainadura:ruda_dusz","category":"nature"},
    "components":{
      "minecraft:display_name":"Ruda Dusz",
      "minecraft:destructible_by_mining":{"seconds_to_destroy":4.5},
      "minecraft:destructible_by_explosion":{"explosion_resistance":9},
      "minecraft:material_instances":{"*":{"texture":"krainadura:ruda_dusz","render_method":"opaque"}}
    }
  }
})
print("✓ Soul ore block: drops handled by script")

# ══════════════════════════════════════════════════════════════════
# 4. VERSION BUMP → v1.8.0
# ══════════════════════════════════════════════════════════════════
for mf in [f'{BP}/manifest.json',f'{RP}/manifest.json']:
    m=json.load(open(mf)); m['header']['version']=[1,8,0]
    for mod in m['modules']: mod['version']=[1,8,0]
    w(mf,m)
print("✓ Version → v1.8.0")
print("\n✓ Build v8 complete")
