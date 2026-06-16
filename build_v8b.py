#!/usr/bin/env python3
"""v8b: fix realm build — back to overworld y=220, phased progressive build queue"""
import os, json

BP='/tmp/addon/BP'; RP='/tmp/addon/RP'
def w(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if isinstance(content, (dict,list)): content=json.dumps(content,indent=2,ensure_ascii=False)
    open(path,'w',encoding='utf-8').write(content)

# Read existing main.js and patch the constants + build system
main = open(f'{BP}/scripts/main.js', encoding='utf-8').read()

# ── Patch 1: realm coordinates back to overworld ──
main = main.replace(
    '''const SOUL_DIM_ID = "minecraft:the_end";
const SOUL_X = 5000, SOUL_Y = 100, SOUL_Z = 5000;''',
    '''const SOUL_DIM_ID = "minecraft:overworld";
const SOUL_X = 100000, SOUL_Y = 220, SOUL_Z = 100000;'''
)

# ── Patch 2: getSoulDim + getOW fix ──
main = main.replace(
    'function getSoulDim() { return world.getDimension(SOUL_DIM_ID); }\nfunction getOW()      { return world.getDimension("minecraft:overworld"); }',
    'function getSoulDim() { return world.getDimension(SOUL_DIM_ID); }\nfunction getOW()      { return getSoulDim(); } // same dim in overworld mode'
)

# ── Patch 3: isInSoulRealm — overworld has no dim check needed ──
main = main.replace(
    '''function isInSoulRealm(p) {
  return p.dimension.id === SOUL_DIM_ID &&
    Math.abs(p.location.x - SOUL_X) < SOUL_RADIUS &&
    Math.abs(p.location.z - SOUL_Z) < SOUL_RADIUS;
}''',
    '''function isInSoulRealm(p) {
  return p.dimension.id === "minecraft:overworld" &&
    Math.abs(p.location.x - SOUL_X) < SOUL_RADIUS &&
    Math.abs(p.location.z - SOUL_Z) < SOUL_RADIUS;
}'''
)

# ── Patch 4: exit teleport fix — same dimension now, just teleport to spawn ──
main = main.replace(
    '''      if(isInSoulRealm(p)){
        const sp=world.getDefaultSpawnLocation();
        try{p.teleport({x:sp.x,y:sp.y+1,z:sp.z},{dimension:getOW()});}catch{}
        p.sendMessage("§6§lWróciłeś do świata żywych...");
        p.dimension.spawnParticle("minecraft:totem_particle",p.location);
        // exit is free — no item consumed
      } else {''',
    '''      if(isInSoulRealm(p)){
        const sp=world.getDefaultSpawnLocation();
        const ow=world.getDimension("minecraft:overworld");
        try{p.teleport({x:sp.x,y:sp.y+1,z:sp.z},{dimension:ow});}catch{}
        p.sendMessage("§6§lWróciłeś do świata żywych...");
        try{p.dimension.spawnParticle("minecraft:totem_particle",p.location);}catch{}
        // exit is free — no item consumed
      } else {'''
)

# ── Patch 5: enterRealm — back to overworld ticking area ──
main = main.replace(
    '''function enterRealm(p){
  const endDim=getSoulDim();
  try{endDim.runCommand(`tickingarea remove soulrealm`);}catch{}
  try{endDim.runCommand(`tickingarea add ${SOUL_X-55} ${TOP-25} ${SOUL_Z-55} ${SOUL_X+55} ${TOP+55} ${SOUL_Z+55} soulrealm`);}catch{}
  const holdY=TOP+20;
  try{p.teleport({x:SOUL_X+0.5,y:holdY,z:SPAWN_Z+0.5},{dimension:endDim});}catch{}''',
    '''function enterRealm(p){
  const dim=getSoulDim();
  try{dim.runCommand(`tickingarea remove soulrealm`);}catch{}
  try{dim.runCommand(`tickingarea add ${SOUL_X-60} ${TOP-30} ${SOUL_Z-60} ${SOUL_X+60} ${TOP+30} ${SOUL_Z+60} soulrealm`);}catch{}
  const holdY=TOP+20;
  try{p.teleport({x:SOUL_X+0.5,y:holdY,z:SPAWN_Z+0.5},{dimension:dim});}catch{}'''
)

# ── Patch 6: enterRealm interval — use dim instead of endDim ──
main = main.replace(
    '''  const ids=Object.keys(entering); if(!ids.length)return;
  const endDim=getSoulDim();
  for(const pid of ids){
    const st=entering[pid];
    const p=world.getAllPlayers().find(pp=>pp.id===pid);
    if(!p){delete entering[pid];continue;}
    st.ticks++;
    if(p.location.y<st.holdY-5){
      try{p.teleport({x:SOUL_X+0.5,y:st.holdY,z:SPAWN_Z+0.5},{dimension:endDim});}catch{}
    }''',
    '''  const ids=Object.keys(entering); if(!ids.length)return;
  const dim=getSoulDim();
  for(const pid of ids){
    const st=entering[pid];
    const p=world.getAllPlayers().find(pp=>pp.id===pid);
    if(!p){delete entering[pid];continue;}
    st.ticks++;
    if(p.location.y<st.holdY-5){
      try{p.teleport({x:SOUL_X+0.5,y:st.holdY,z:SPAWN_Z+0.5},{dimension:dim});}catch{}
    }'''
)

main = main.replace(
    '''    if(st.phase===0){
      if(realmLoaded(endDim)||st.ticks>200)st.phase=1;
    } else if(st.phase===1){
      buildRealm(endDim); st.phase=2; st.t2=0;
    } else {
      st.t2=(st.t2||0)+1;
      let ok=false;
      try{const b=endDim.getBlock({x:SOUL_X,y:TOP,z:SPAWN_Z});ok=!!b&&b.typeId!=="minecraft:air";}catch{}
      if(ok||st.t2>80){
        try{p.teleport({x:SOUL_X+0.5,y:TOP+2,z:SPAWN_Z+0.5},{dimension:endDim});}catch{}''',
    '''    if(st.phase===0){
      if(realmLoaded(dim)||st.ticks>300)st.phase=1;
    } else if(st.phase===1){
      buildRealm(dim); st.phase=2; st.t2=0;
    } else {
      st.t2=(st.t2||0)+1;
      let ok=false;
      try{const b=dim.getBlock({x:SOUL_X,y:TOP,z:SPAWN_Z});ok=!!b&&b.typeId!=="minecraft:air";}catch{}
      if(ok||st.t2>200){
        try{p.teleport({x:SOUL_X+0.5,y:TOP+2,z:SPAWN_Z+0.5},{dimension:dim});}catch{}'''
)

# ── Patch 7: REPLACE buildRealm with progressive queue system ──
OLD_BUILD = '''// ══ REALM BUILD ══
function buildRealm(dim){'''

NEW_BUILD = '''// ══ REALM BUILD — progressive queue (one fill per tick, retry on failure) ══
const BQ=[]; // {fn, tries}
let bqId=null;
function qfill(fn){ BQ.push({fn,tries:0}); }
function startBQ(onDone){
  if(bqId)return;
  bqId=system.runInterval(()=>{
    if(!BQ.length){system.clearRun(bqId);bqId=null;if(onDone)onDone();return;}
    const t=BQ[0];
    const ok=t.fn(); t.tries++;
    if(ok||t.tries>=20)BQ.shift(); // success OR gave up after 20 ticks
  },2); // one attempt every 2 ticks
}

function buildRealm(dim){'''

main = main.replace(OLD_BUILD, NEW_BUILD)

# ── Patch 8: Replace the body of buildRealm with queue-based version ──
# Find where buildRealm starts (after our replacement) and replace its content
import re

# Replace entire buildRealm function body
old_body = r'''function buildRealm\(dim\)\{
  const already=world\.getDynamicProperty\("realm_built"\);
  const cx=SOUL_X, cz=SOUL_Z;

  // Island body \(octagon, floating look with tapered underside\)
  bfill\(dim,cx-R_ISL,TOP-8,cz-R_ISL,cx\+R_ISL,TOP-1,cz\+R_ISL,B_STONE\);.*?if\(!already\)\{
    world\.setDynamicProperty\("realm_built",true\);
    populateRealm\(dim\);
  \}
\}'''

new_body = r'''function buildRealm(dim){
  const already=world.getDynamicProperty("realm_built");
  const cx=SOUL_X, cz=SOUL_Z;
  const R=14, base=TOP+1, topY=base+9, R2=7, keepTop=base+5;
  const f=(x1,y1,z1,x2,y2,z2,b)=>qfill(()=>bfill(dim,x1,y1,z1,x2,y2,z2,b));
  const s=(x,y,z,b)=>qfill(()=>{bset(dim,x,y,z,b);return true;});

  // ── ISLAND (R_ISL=22, octagon) ──
  f(cx-R_ISL,TOP-8,cz-R_ISL,cx+R_ISL,TOP-1,cz+R_ISL,B_STONE);
  f(cx-R_ISL,TOP,  cz-R_ISL,cx+R_ISL,TOP,  cz+R_ISL,B_GRASS);
  // corner cuts (octagon)
  const c=9;
  f(cx-R_ISL,TOP-8,cz-R_ISL,cx-R_ISL+c-1,TOP,cz-R_ISL+c-1,B_AIR);
  f(cx+R_ISL-c+1,TOP-8,cz-R_ISL,cx+R_ISL,TOP,cz-R_ISL+c-1,B_AIR);
  f(cx-R_ISL,TOP-8,cz+R_ISL-c+1,cx-R_ISL+c-1,TOP,cz+R_ISL,B_AIR);
  f(cx+R_ISL-c+1,TOP-8,cz+R_ISL-c+1,cx+R_ISL,TOP,cz+R_ISL,B_AIR);
  // tapered underside
  f(cx-17,TOP-11,cz-17,cx+17,TOP-9, cz+17,B_STONE);
  f(cx-11,TOP-14,cz-11,cx+11,TOP-12,cz+11,B_STONE);
  f(cx-5, TOP-17,cz-5, cx+5, TOP-15,cz+5, B_STONE);
  // barrier walls
  const BR=R_ISL+1;
  f(cx-R_ISL,TOP+1,cz+BR,cx+R_ISL,TOP+5,cz+BR,B_BARR);
  f(cx-R_ISL,TOP+1,cz-BR,cx+R_ISL,TOP+5,cz-BR,B_BARR);
  f(cx+BR,TOP+1,cz-R_ISL,cx+BR,TOP+5,cz+R_ISL,B_BARR);
  f(cx-BR,TOP+1,cz-R_ISL,cx-BR,TOP+5,cz+R_ISL,B_BARR);

  // ore veins
  if(!already){
    for(let i=0;i<60;i++){
      const a=Math.random()*Math.PI*2,r=Math.random()*(R_ISL-5);
      s(Math.floor(cx+Math.cos(a)*r),TOP-2-Math.floor(Math.random()*4),Math.floor(cz+Math.sin(a)*r),B_ORE);
    }
  }

  // ── CASTLE outer walls ──
  f(cx-R,TOP,cz-R,cx+R,TOP,cz+R,B_DARK);
  f(cx-R,base,cz-R,cx+R,topY,cz-R,B_BRICK);
  f(cx-R,base,cz+R,cx+R,topY,cz+R,B_BRICK);
  f(cx-R,base,cz-R,cx-R,topY,cz+R,B_BRICK);
  f(cx+R,base,cz-R,cx+R,topY,cz+R,B_BRICK);
  // south gate
  f(cx-2,base,cz+R,cx+2,base+3,cz+R,B_AIR);
  s(cx-3,topY+1,cz+R,B_LANT); s(cx+3,topY+1,cz+R,B_LANT);
  // bridge
  f(cx-2,TOP,cz+R+1,cx+2,TOP,cz+R_ISL,B_DARK);
  f(cx-3,TOP+1,cz+R+1,cx-3,TOP+2,cz+R_ISL,B_BRICK);
  f(cx+3,TOP+1,cz+R+1,cx+3,TOP+2,cz+R_ISL,B_BRICK);
  // battlements
  for(let i=-R;i<=R;i+=2){
    s(cx+i,topY+1,cz-R,B_DARK); s(cx+i,topY+1,cz+R,B_DARK);
    s(cx-R,topY+1,cz+i,B_DARK); s(cx+R,topY+1,cz+i,B_DARK);
  }
  // corner towers
  for(const[sx,sz]of[[-R,-R],[R,-R],[-R,R],[R,R]]){
    const tx=cx+sx,tz=cz+sz,th=topY+6;
    f(tx-2,base,tz-2,tx+2,th,  tz+2,B_DARK);
    f(tx-1,base,tz-1,tx+1,th-1,tz+1,B_AIR);
    s(tx,th+1,tz,B_LANT);
    for(const[ox,oz]of[[-2,0],[2,0],[0,-2],[0,2]])s(tx+ox,th+1,tz+oz,B_DARK);
  }
  // inner keep
  f(cx-R2,base,cz-R2,cx+R2,keepTop,cz-R2,B_DARK);
  f(cx-R2,base,cz+R2,cx+R2,keepTop,cz+R2,B_DARK);
  f(cx-R2,base,cz-R2,cx-R2,keepTop,cz+R2,B_DARK);
  f(cx+R2,base,cz-R2,cx+R2,keepTop,cz+R2,B_DARK);
  f(cx-R2+1,keepTop+1,cz-R2+1,cx+R2-1,keepTop+1,cz+R2-1,B_DARK);
  f(cx-R2+1,TOP,cz-R2+1,cx+R2-1,TOP,cz+R2-1,B_DARK);
  f(cx-1,base,cz+R2,cx+1,base+3,cz+R2,B_AIR);
  f(cx-1,base,cz-R2,cx+1,base+3,cz-R2,B_AIR);
  // throne niche
  f(cx-2,base,cz-R2+1,cx+2,base+3,cz-R2+1,B_DARK);
  s(cx,base+2,cz-R2+2,B_LANT);
  // boss dais
  f(cx-3,TOP,  cz-3,cx+3,TOP,  cz+3,B_PILLAR);
  f(cx-2,TOP+1,cz-2,cx+2,TOP+1,cz+2,B_DARK);
  s(cx,TOP+2,cz,B_LANT);
  // pillars
  for(const[px,pz]of[[-10,-10],[10,-10],[-10,10],[10,10],[-13,0],[13,0]]){
    f(cx+px,base,cz+pz,cx+px,topY-1,cz+pz,B_PILLAR);
    s(cx+px,topY,cz+pz,B_LANT);
  }
  // interior wall lanterns
  for(const i of[-10,-5,0,5,10]){
    s(cx+i,base+4,cz-R+1,B_LANT); s(cx+i,base+4,cz+R-1,B_LANT);
    s(cx-R+1,base+4,cz+i,B_LANT); s(cx+R-1,base+4,cz+i,B_LANT);
  }

  startBQ(!already?()=>{
    world.setDynamicProperty("realm_built",true);
    populateRealm(dim);
  }:undefined);
}'''

# Use a non-regex replacement since the body is complex
# Find the start and end of the old buildRealm body
start_marker = 'function buildRealm(dim){'
# Find where it starts (after our patch added startBQ)
# Use the fact that the old buildRealm ends with "}\n\nfunction populateRealm"
import re
# Replace using simple string operations

# Find the buildRealm function content and replace it
bri = main.find('function buildRealm(dim){')
if bri == -1:
    print("ERROR: buildRealm not found!")
else:
    # Find matching closing brace
    depth = 0
    i = bri
    while i < len(main):
        if main[i] == '{': depth += 1
        elif main[i] == '}':
            depth -= 1
            if depth == 0:
                break
        i += 1
    # Replace from bri to i+1
    main = main[:bri] + new_body + main[i+1:]
    print(f"✓ buildRealm replaced (was at pos {bri}, new body len {len(new_body)})")

# ── Patch 9: Update void protection to use getSoulDim() ──
main = main.replace(
    "try{p.teleport({x:SOUL_X+0.5,y:TOP+2,z:SPAWN_Z+0.5},{dimension:getSoulDim()});}catch{}",
    "try{p.teleport({x:SOUL_X+0.5,y:TOP+2,z:SPAWN_Z+0.5});}catch{}"
)

# ── Patch 10: boss warrior spawns use getSoulDim() ──
# (already correct in the code, no change needed)

# ── Patch 11: remove unused endDim refs in boss spawn interval ──
# Already correct - uses getSoulDim()

open(f'{BP}/scripts/main.js', 'w', encoding='utf-8').write(main)
print(f"✓ main.js patched ({len(main)//1024}KB, {main.count(chr(10))} lines)")

# Version → 1.8.1
for mf in [f'{BP}/manifest.json', f'{RP}/manifest.json']:
    m = json.load(open(mf))
    m['header']['version'] = [1,8,1]
    for mod in m['modules']: mod['version'] = [1,8,1]
    w(mf, m)
print("✓ Version → v1.8.1")
print("\n✓ Build v8b complete")
