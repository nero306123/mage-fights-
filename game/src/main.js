import * as THREE from 'three';

// ── Config ──────────────────────────────────────────────────────────
const WORLD_SZ    = 300;
const EYE_H       = 1.75;
const WALK_SPD    = 6;
const SPRINT_MUL  = 1.6;
const GRAVITY     = 20;
const JUMP_VEL    = 8;
const MOUSE_SENS  = 0.002;
const TOUCH_SENS  = 0.004;
const isMobile    = 'ontouchstart' in window || navigator.maxTouchPoints > 1;
const T_SEGS      = isMobile ? 64 : 100;

// ── State ───────────────────────────────────────────────────────────
const keys = {};
let pitch = 0;
let yaw   = 0;
let velY  = 0;
let onGround = true;
let sprinting = false;

const joyState = { active: false, dx: 0, dy: 0, id: null };
const lookState = { active: false, id: null, lastX: 0, lastY: 0 };

// ── Terrain height ──────────────────────────────────────────────────
function terrainHeight(x, z) {
  let h = 0;
  h += Math.sin(x * 0.02) * 4;
  h += Math.cos(z * 0.015) * 3.5;
  h += Math.sin(x * 0.05 + z * 0.04) * 2;
  h += Math.cos(x * 0.03 - z * 0.06) * 1.5;
  h += Math.sin(x * 0.1) * Math.cos(z * 0.08) * 1.2;
  h += Math.sin((x + z) * 0.007) * 8;
  return h;
}

// ── Build terrain mesh ──────────────────────────────────────────────
function buildTerrain(scene) {
  const geo = new THREE.PlaneGeometry(WORLD_SZ, WORLD_SZ, T_SEGS, T_SEGS);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = terrainHeight(x, z);
    pos.setY(i, h);

    const t = THREE.MathUtils.clamp((h + 5) / 20, 0, 1);
    colors[i * 3]     = 0.15 + t * 0.12;
    colors[i * 3 + 1] = 0.35 + t * 0.25;
    colors[i * 3 + 2] = 0.12 + t * 0.08;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// ── Water plane ─────────────────────────────────────────────────────
function buildWater(scene) {
  const geo = new THREE.PlaneGeometry(WORLD_SZ * 1.5, WORLD_SZ * 1.5);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a3a4a,
    transparent: true,
    opacity: 0.65,
    roughness: 0.3,
    metalness: 0.4
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.5;
  scene.add(mesh);
}

// ── Trees ───────────────────────────────────────────────────────────
function buildTrees(scene) {
  const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 2.5, 6);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });

  const leafGeos = [
    new THREE.ConeGeometry(1.4, 2.2, 6),
    new THREE.ConeGeometry(1.1, 1.8, 6),
    new THREE.ConeGeometry(0.8, 1.5, 6)
  ];
  const leafColors = [0x2d5a1e, 0x1e4a14, 0x3a6b2a, 0x1a3f12];

  const treeCount = isMobile ? 200 : 350;

  for (let i = 0; i < treeCount; i++) {
    const x = (Math.random() - 0.5) * WORLD_SZ * 0.9;
    const z = (Math.random() - 0.5) * WORLD_SZ * 0.9;
    const h = terrainHeight(x, z);

    if (h < 1.5) continue;

    const group = new THREE.Group();
    group.position.set(x, h, z);

    const scale = 0.8 + Math.random() * 0.6;
    group.scale.setScalar(scale);

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    group.add(trunk);

    const leafMat = new THREE.MeshStandardMaterial({
      color: leafColors[Math.floor(Math.random() * leafColors.length)],
      roughness: 0.8,
      flatShading: true
    });

    for (let j = 0; j < 3; j++) {
      const leaf = new THREE.Mesh(leafGeos[j], leafMat);
      leaf.position.y = 2.8 + j * 1.2;
      leaf.castShadow = true;
      group.add(leaf);
    }

    const ry = Math.random() * Math.PI * 2;
    group.rotation.y = ry;

    scene.add(group);
  }
}

// ── Rocks ───────────────────────────────────────────────────────────
function buildRocks(scene) {
  const rockGeo = new THREE.DodecahedronGeometry(1, 0);
  const rockColors = [0x5a5a5a, 0x6b6b6b, 0x4a4a4a, 0x555555];
  const rockCount = isMobile ? 60 : 100;

  for (let i = 0; i < rockCount; i++) {
    const x = (Math.random() - 0.5) * WORLD_SZ * 0.9;
    const z = (Math.random() - 0.5) * WORLD_SZ * 0.9;
    const h = terrainHeight(x, z);

    if (h < 0.5) continue;

    const mat = new THREE.MeshStandardMaterial({
      color: rockColors[Math.floor(Math.random() * rockColors.length)],
      roughness: 0.9,
      flatShading: true
    });

    const mesh = new THREE.Mesh(rockGeo, mat);
    const s = 0.3 + Math.random() * 0.8;
    mesh.scale.set(s, s * (0.5 + Math.random() * 0.5), s);
    mesh.position.set(x, h + s * 0.3, z);
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }
}

// ── Lighting ────────────────────────────────────────────────────────
function setupLighting(scene) {
  const ambient = new THREE.AmbientLight(0x4a5568, 0.6);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffeedd, 1.0);
  sun.position.set(50, 80, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
  sun.shadow.camera.left   = -60;
  sun.shadow.camera.right  =  60;
  sun.shadow.camera.top    =  60;
  sun.shadow.camera.bottom = -60;
  sun.shadow.camera.near   = 0.5;
  sun.shadow.camera.far    = 200;
  sun.shadow.bias = -0.001;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x8899bb, 0.3);
  fill.position.set(-30, 40, -20);
  scene.add(fill);
}

// ── Atmosphere ──────────────────────────────────────────────────────
function setupAtmosphere(scene) {
  scene.background = new THREE.Color(0x3a4a6b);
  scene.fog = new THREE.FogExp2(0x3a4a6b, isMobile ? 0.012 : 0.008);
}

// ── Input: Desktop ──────────────────────────────────────────────────
function setupDesktopInput(camera) {
  const overlay = document.getElementById('overlay');

  document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'ShiftLeft') sprinting = true;

    if (e.code >= 'Digit1' && e.code <= 'Digit7') {
      const idx = parseInt(e.code.replace('Digit', '')) - 1;
      document.querySelectorAll('.slot').forEach((s, i) => {
        s.classList.toggle('active', i === idx);
      });
    }
  });

  document.addEventListener('keyup', e => {
    keys[e.code] = false;
    if (e.code === 'ShiftLeft') sprinting = false;
  });

  overlay.addEventListener('click', () => {
    document.body.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    overlay.classList.toggle('hidden', !!document.pointerLockElement);
  });

  document.addEventListener('mousemove', e => {
    if (!document.pointerLockElement) return;
    yaw   -= e.movementX * MOUSE_SENS;
    pitch -= e.movementY * MOUSE_SENS;
    pitch  = THREE.MathUtils.clamp(pitch, -Math.PI / 2 + 0.05, Math.PI / 2 - 0.05);
  });
}

// ── Input: Mobile ───────────────────────────────────────────────────
function setupMobileInput(camera) {
  const overlay = document.getElementById('overlay');
  overlay.classList.add('hidden');

  const joyZone = document.getElementById('joystick-zone');
  const joyBase = document.getElementById('joystick-base');
  const joyKnob = document.getElementById('joystick-knob');
  const jumpBtn = document.getElementById('jump-btn');

  jumpBtn.style.display = 'flex';

  const JOY_MAX = 40;
  let joyOriginX = 0, joyOriginY = 0;

  joyZone.addEventListener('touchstart', e => {
    for (const t of e.changedTouches) {
      if (!joyState.active) {
        joyState.active = true;
        joyState.id = t.identifier;
        joyOriginX = t.clientX;
        joyOriginY = t.clientY;

        joyBase.style.display = 'block';
        joyKnob.style.display = 'block';
        joyBase.style.left = (joyOriginX - 55) + 'px';
        joyBase.style.top  = (joyOriginY - 55) + 'px';
        joyKnob.style.left = (joyOriginX - 23) + 'px';
        joyKnob.style.top  = (joyOriginY - 23) + 'px';
      }
    }
  }, { passive: true });

  joyZone.addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      if (t.identifier === joyState.id) {
        let dx = t.clientX - joyOriginX;
        let dy = t.clientY - joyOriginY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > JOY_MAX) {
          dx = dx / dist * JOY_MAX;
          dy = dy / dist * JOY_MAX;
        }
        joyState.dx = dx / JOY_MAX;
        joyState.dy = dy / JOY_MAX;
        joyKnob.style.left = (joyOriginX + dx - 23) + 'px';
        joyKnob.style.top  = (joyOriginY + dy - 23) + 'px';
      }
    }
  }, { passive: true });

  const endJoy = e => {
    for (const t of e.changedTouches) {
      if (t.identifier === joyState.id) {
        joyState.active = false;
        joyState.dx = 0;
        joyState.dy = 0;
        joyState.id = null;
        joyBase.style.display = 'none';
        joyKnob.style.display = 'none';
      }
    }
  };
  joyZone.addEventListener('touchend', endJoy, { passive: true });
  joyZone.addEventListener('touchcancel', endJoy, { passive: true });

  // Look (right half of screen)
  document.addEventListener('touchstart', e => {
    for (const t of e.changedTouches) {
      if (t.clientX > window.innerWidth * 0.44 && !lookState.active) {
        if (t.target === jumpBtn) continue;
        lookState.active = true;
        lookState.id = t.identifier;
        lookState.lastX = t.clientX;
        lookState.lastY = t.clientY;
      }
    }
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      if (t.identifier === lookState.id) {
        const dx = t.clientX - lookState.lastX;
        const dy = t.clientY - lookState.lastY;
        yaw   -= dx * TOUCH_SENS;
        pitch -= dy * TOUCH_SENS;
        pitch  = THREE.MathUtils.clamp(pitch, -Math.PI / 2 + 0.05, Math.PI / 2 - 0.05);
        lookState.lastX = t.clientX;
        lookState.lastY = t.clientY;
      }
    }
  }, { passive: true });

  const endLook = e => {
    for (const t of e.changedTouches) {
      if (t.identifier === lookState.id) {
        lookState.active = false;
        lookState.id = null;
      }
    }
  };
  document.addEventListener('touchend', endLook, { passive: true });
  document.addEventListener('touchcancel', endLook, { passive: true });

  // Jump button
  jumpBtn.addEventListener('touchstart', e => {
    e.stopPropagation();
    if (onGround) {
      velY = JUMP_VEL;
      onGround = false;
    }
  }, { passive: false });
}

// ── Player update ───────────────────────────────────────────────────
function updatePlayer(dt, camera) {
  let moveX = 0, moveZ = 0;

  if (isMobile) {
    moveX = joyState.dx;
    moveZ = joyState.dy;
  } else {
    if (keys['KeyW'] || keys['ArrowUp'])    moveZ -= 1;
    if (keys['KeyS'] || keys['ArrowDown'])  moveZ += 1;
    if (keys['KeyA'] || keys['ArrowLeft'])  moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

    if (keys['Space'] && onGround) {
      velY = JUMP_VEL;
      onGround = false;
    }
  }

  const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
  if (len > 0.01) {
    moveX /= len;
    moveZ /= len;
  }

  const spd = WALK_SPD * (sprinting ? SPRINT_MUL : 1) * dt;

  const sinY = Math.sin(yaw);
  const cosY = Math.cos(yaw);

  const worldX = moveX * cosY - moveZ * sinY;
  const worldZ = moveX * sinY + moveZ * cosY;

  let px = camera.position.x + worldX * spd;
  let pz = camera.position.z + worldZ * spd;

  const halfW = WORLD_SZ * 0.48;
  px = THREE.MathUtils.clamp(px, -halfW, halfW);
  pz = THREE.MathUtils.clamp(pz, -halfW, halfW);

  velY -= GRAVITY * dt;
  let py = camera.position.y + velY * dt;

  const groundH = terrainHeight(px, pz) + EYE_H;

  if (py <= groundH) {
    py = groundH;
    velY = 0;
    onGround = true;
  } else {
    onGround = false;
  }

  camera.position.set(px, py, pz);

  const quat = new THREE.Quaternion();
  const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
  quat.setFromEuler(euler);
  camera.quaternion.copy(quat);
}

// ── HUD update ──────────────────────────────────────────────────────
function updateHUD(camera) {
  const dirs = ['N', 'NW', 'W', 'SW', 'S', 'SE', 'E', 'NE'];
  let angle = ((yaw * 180 / Math.PI) % 360 + 360) % 360;
  const idx = Math.round(angle / 45) % 8;
  document.getElementById('compass').textContent = dirs[idx];

  const p = camera.position;
  document.getElementById('coords').textContent =
    `${Math.round(p.x)}, ${Math.round(p.y)}, ${Math.round(p.z)}`;
}

// ── Init & game loop ────────────────────────────────────────────────
function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: !isMobile });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 2 : 3));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  document.body.prepend(renderer.domElement);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    isMobile ? 65 : 70,
    window.innerWidth / window.innerHeight,
    0.1, 500
  );

  // Spawn at world center
  const spawnX = 0, spawnZ = 0;
  const spawnH = terrainHeight(spawnX, spawnZ) + EYE_H;
  camera.position.set(spawnX, spawnH, spawnZ);

  setupAtmosphere(scene);
  setupLighting(scene);
  buildTerrain(scene);
  buildWater(scene);
  buildTrees(scene);
  buildRocks(scene);

  if (isMobile) {
    setupMobileInput(camera);
  } else {
    setupDesktopInput(camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let lastTime = performance.now();

  function loop(now) {
    requestAnimationFrame(loop);
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > 0.05) dt = 0.05;

    updatePlayer(dt, camera);
    updateHUD(camera);
    renderer.render(scene, camera);
  }

  requestAnimationFrame(loop);
}

init();
