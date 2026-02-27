const house = document.getElementById("house");
const playerEl = document.getElementById("player");
const wsStatus = document.getElementById("wsStatus");
const roomStatus = document.getElementById("roomStatus");

const lightCanvas = document.getElementById("lightCanvas");
const lightCtx = lightCanvas.getContext("2d");

const debugCanvas = document.getElementById("debugCanvas");
const debugCtx = debugCanvas.getContext("2d");

// (crossfade)
const AMBIENT_DARK = 0.78;
const LIGHT_SOFTNESS = 0.95;   // forca da luz

const BLUR_PX = 18;            // blur das bordas
const INNER_BLUR_PX = 6;       // blur do meio

const ON_DELAY_MS = 80;        // delay pra acender
const OFF_DELAY_MS = 120;      // delay pra  apagar
const FADE_IN_MS = 240;
const FADE_OUT_MS = 420;

// player
const player = {x:402, y:581, size: 32, speed: 244 };
let keys = new Set();

// state
let currentRoomId = null;
let detectedRoomId = null;
let showDebug = false;

// light crossfade state
let fromRoomId = null;
let toRoomId = null;

let fromI = 0;
let toI = 0;
let targetTo = 0;

let pendingOnTimer = null;
let pendingOffTimer = null;

function setLightTarget(nextRoomId) {
  if (pendingOnTimer) clearTimeout(pendingOnTimer);
  if (pendingOffTimer) clearTimeout(pendingOffTimer);
  pendingOnTimer = null;
  pendingOffTimer = null;

  // apaga quando ta fora de casa
  if (!nextRoomId) {
    if (toRoomId) {
      fromRoomId = toRoomId;
      fromI = toI;
      toRoomId = null;
      toI = 0;
    }
    pendingOffTimer = setTimeout(() => {
      targetTo = 0;
    }, OFF_DELAY_MS);
    return;
  }

  // mesmo comodo = aceso
  if (toRoomId === nextRoomId) {
    pendingOnTimer = setTimeout(() => {
      targetTo = 1;
    }, ON_DELAY_MS);
    return;
  }

  // crossfade
  if (toRoomId) {
    fromRoomId = toRoomId;
    fromI = toI;
  }


  toRoomId = nextRoomId;
  toI = 0;

  // delay p acender
  pendingOnTimer = setTimeout(() => {
    targetTo = 1;
  }, ON_DELAY_MS);
}


// areas luminosas
const LIGHT_AREAS = [
  { roomId: "Sala", label: "Sala", x:250, y:335, w:239, h:205 },

  { roomId: "Banheiro", label: "Banheiro",  x:497, y:342, w:125, h:199 },

  { roomId: "Cozinha", label: "Cozinha",  x:442, y:149, w: 183, h: 185},

  { roomId: "Quarto", label: "Quarto", x:250, y:148, w:184, h:178 },
];

// hitbox das objetos do mapa
const WALLS = [
  { wallId: "parede-esquerda", label: "parede-esquerda", x:234, y:137, w:15, h:416 },
  { wallId: "quarto-sala", label: "quarto-sala", x:250, y:317, w:136, h:37 },
  { wallId: "tv", label: "tv", x:301, y:352, w:74, h:34 },
  { wallId: "sofa", label: "sofa", x:298, y:479, w:92, h:58},
  { wallId: "parede-sofa", label: "parede-sofa",x:237, y:532, w:160, h:19},
  { wallId: "parede-baixo-banheiro", label: "parede-baixo-banheiro",x:447, y:534, w:194, h:22},
  { wallId: "sala-banheiro", label: "sala-banheiro", x:486, y:407, w:14, h:134 },
  { wallId: "pia", label: "pia", x:504, y:496, w:40, h:46 },
  { wallId: "banheira", label: "banheira",  x:571, y:456, w:53, h:83 },
  { wallId: "privada", label: "privada",  x:589, y:400, w:32, h:35 },
  { wallId: "parede-direita", label: "parede-direita", x:624, y:134, w:17, h:423 },
  { wallId: "cozinha-banheiro", label: "cozinha-banheiro", x:489, y:334, w:136, h:29 },
  { wallId: "quina-cozinha", label: "quina-cozinha", x:489, y:304, w:9, h:58 },
  { wallId: "pia-cozinha", label: "pia-cozinha", x:585, y:240, w:39, h:94},
  { wallId: "pia-cozinha", label: "pia-cozinha",  x:489, y:302, w:136, h:33 },
  { wallId: "parede-cima", label: "parede-cima", x:234, y:119, w:408, h:32 },
  { wallId: "fogao-geladeira", label: "fogao-geladeira",  x:442, y:170, w:177, h:46 },
  { wallId: "cama", label: "cama", x:287, y:170, w:91, h:104},
  { wallId: "abajur", label: "abajur", x:255, y:164, w:32, h:35 },
  { wallId: "abajur", label: "abajur", x:380, y:172, w:18, h:21},
  { wallId: "parede-quartocozinha", label: "parede-quartocozinha",  x:433, y:142, w:8, h:211 },
  { roomId: "box-pia", label: "box-pia", x:489, y:293, w:98, h:11 },

  // limitacao do mapa (bordas)
  { wallId: "limite-baixo",    x:96, y:643, w:682, h:33  },
  { wallId: "limite-direita",   x:726, y:5, w:68, h:701 },
  { wallId: "limite-cima",     x:90, y:14, w:694, h:34 },
  { wallId: "limite-esquerda", x:71, y:-10, w:62, h:703 },
];


// WebSocket
const WS_SCHEME = window.location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${WS_SCHEME}://${window.location.host}/ws`);

ws.addEventListener("open", () => {
  wsStatus.textContent = "WS: conectado";
  wsStatus.style.color = "rgba(210,255,235,0.95)";
});

ws.addEventListener("close", () => {
  wsStatus.textContent = "WS: desconectado";
  wsStatus.style.color = "rgba(255,214,214,0.92)";
});

ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.type !== "COMMANDS") return;

  const turnOn = data.commands.find((c) => c.type === "TURN_ON");
  const turnOff = data.commands.find((c) => c.type === "TURN_OFF");

  // desliga tudo
  if (turnOff && !turnOn) {
    currentRoomId = null;
    roomStatus.textContent = "Cômodo: —";
    setLightTarget(null);
    return;
  }

  // entrou em casa
  if (turnOn?.roomId) {
    currentRoomId = turnOn.roomId;
    roomStatus.textContent = `Cômodo: ${currentRoomId}`;
    setLightTarget(currentRoomId);
  }
});

// config do awsd
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();

  if (k === "h") {
    showDebug = !showDebug;
    console.log(`[debug] ${showDebug ? "ON" : "OFF"}`);
    drawDebug();
    return;
  }

  if (k === "c") {
    calibrate = !calibrate;
    drag = null;
    console.log(`[calib] ${calibrate ? "ON" : "OFF"} (arraste no mapa e solte)`);
    drawDebug();
    return;
  }

  if (["w", "a", "s", "d"].includes(k)) {
    keys.add(k);
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

// utils
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function resizeCanvases() {
  const rect = house.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  for (const c of [lightCanvas, debugCanvas]) {
    c.width = Math.round(rect.width * dpr);
    c.height = Math.round(rect.height * dpr);
    c.style.width = `${rect.width}px`;
    c.style.height = `${rect.height}px`;
  }

  lightCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  debugCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawDebug();
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function collidesWithWalls(playerRect) {
  for (const wall of WALLS) {
    if (rectsOverlap(playerRect, wall)) return true;
  }
  return false;
}

// detector de comodos

function findRoomForPlayer() {
  const cx = player.x + player.size / 2;
  const cy = player.y + player.size / 2;

  for (const a of LIGHT_AREAS) {
    if (cx >= a.x && cx <= a.x + a.w && cy >= a.y && cy <= a.y + a.h) {
      return a.roomId;
    }
  }
  return null;
}

let lastSentRoom = "__init__";
let lastSentAt = 0;

function sendMotion(roomId) {
  const now = performance.now();
  if (roomId === lastSentRoom && now - lastSentAt < 250) return;

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: "MOTION_DETECTED",
      roomId: roomId ?? null,
      t: Date.now()
    }));
    lastSentRoom = roomId;
    lastSentAt = now;
  }
}

// hitbox
function tryMove(dx, dy) {
  const w = house.clientWidth;
  const h = house.clientHeight;

  if (dx !== 0) {
    const nextX = clamp(player.x + dx, 0, w - player.size);
    const rectX = { x: nextX, y: player.y, w: player.size, h: player.size };
    if (!collidesWithWalls(rectX)) player.x = nextX;
  }

  if (dy !== 0) {
    const nextY = clamp(player.y + dy, 0, h - player.size);
    const rectY = { x: player.x, y: nextY, w: player.size, h: player.size };
    if (!collidesWithWalls(rectY)) player.y = nextY;
  }
}

// ajuste de luzes
function cutLightForRoom(roomId, intensity) {
  if (!roomId || intensity <= 0.001) return;

  const pieces = LIGHT_AREAS.filter((a) => a.roomId === roomId);
  if (pieces.length === 0) return;

  // borda com blur
  lightCtx.filter = `blur(${BLUR_PX}px)`;

  for (const a of pieces) {
    const gx = a.x + a.w / 2;
    const gy = a.y + a.h / 2;
    const radius = Math.max(a.w, a.h) * 0.85;

    const grad = lightCtx.createRadialGradient(gx, gy, radius * 0.10, gx, gy, radius);
    const center = 0.95 * intensity * LIGHT_SOFTNESS;

    grad.addColorStop(0, `rgba(0,0,0,${center})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");

    lightCtx.fillStyle = grad;
    lightCtx.fillRect(a.x - 40, a.y - 40, a.w + 80, a.h + 80);
  }

  // meio
  lightCtx.filter = `blur(${INNER_BLUR_PX}px)`;
  for (const a of pieces) {
    lightCtx.fillStyle = `rgba(0,0,0,${0.55 * intensity})`;
    lightCtx.fillRect(a.x + 10, a.y + 10, a.w - 20, a.h - 20);
  }
}


// crossfade

function drawLighting(dt) {
  const w = house.clientWidth;
  const h = house.clientHeight;

  const inStep = dt / (FADE_IN_MS / 1000);
  const outStep = dt / (FADE_OUT_MS / 1000);

if (targetTo === 1) {
  toI = Math.min(1, toI + inStep);

} else {
  toI = Math.max(0, toI - outStep);

  if (toI === 0 && targetTo === 0 && !pendingOnTimer) {
    toRoomId = null;
  }
}

  if (fromRoomId) {
    fromI = Math.max(0, fromI - outStep);
    if (fromI === 0) fromRoomId = null;
  }

  // overlay escuro
  lightCtx.clearRect(0, 0, w, h);
  lightCtx.fillStyle = `rgba(0,0,0,${AMBIENT_DARK})`;
  lightCtx.fillRect(0, 0, w, h);

  lightCtx.save();
  lightCtx.globalCompositeOperation = "destination-out";

  cutLightForRoom(fromRoomId, fromI);
  cutLightForRoom(toRoomId, toI);

  lightCtx.restore();
  lightCtx.filter = "none";
}

// calibrador
let calibrate = false;
let drag = null;

function posOnHouse(e) {
  const rect = house.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return { x: Math.round(x), y: Math.round(y) };
}

function printRect(d) {
  const x = Math.min(d.x0, d.x1);
  const y = Math.min(d.y0, d.y1);
  const w = Math.abs(d.x1 - d.x0);
  const h = Math.abs(d.y1 - d.y0);

  console.log(`[rect] { x:${x}, y:${y}, w:${w}, h:${h} }`);
  console.log(`[LIGHT_AREAS] { roomId: "sala", label: "Sala", x:${x}, y:${y}, w:${w}, h:${h} }`);
  console.log(`[WALLS] { x:${x}, y:${y}, w:${w}, h:${h} }`);
}

house.addEventListener("pointerdown", (e) => {
  if (!calibrate) return;
  e.preventDefault();
  house.setPointerCapture(e.pointerId);
  const p = posOnHouse(e);
  drag = { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
});

house.addEventListener("pointermove", (e) => {
  if (!calibrate || !drag) return;
  e.preventDefault();
  const p = posOnHouse(e);
  drag.x1 = p.x;
  drag.y1 = p.y;
});

house.addEventListener("pointerup", () => {
  if (!calibrate || !drag) return;
  printRect(drag);
  drag = null;
  drawDebug();
});

house.addEventListener("pointercancel", () => {
  drag = null;
  drawDebug();
});

// Debug (H e/ou C)
function drawDebug() {
  const w = house.clientWidth;
  const h = house.clientHeight;

  debugCtx.clearRect(0, 0, w, h);
  if (!showDebug && !calibrate) return;

  debugCtx.save();
  debugCtx.lineWidth = 2;
  debugCtx.font = "bold 14px system-ui";

  // LIGHT_AREAS (verde)
  debugCtx.strokeStyle = "rgba(0,255,210,0.9)";
  debugCtx.fillStyle = "rgba(0,255,210,0.08)";
  for (const a of LIGHT_AREAS) {
    debugCtx.fillRect(a.x, a.y, a.w, a.h);
    debugCtx.strokeRect(a.x, a.y, a.w, a.h);
    debugCtx.fillStyle = "rgba(0,255,210,0.95)";
    debugCtx.fillText(a.label ?? a.roomId, a.x + 8, a.y + 18);
    debugCtx.fillStyle = "rgba(0,255,210,0.08)";
  }

  // WALLS (vermelho)
  debugCtx.strokeStyle = "rgba(255,80,80,0.95)";
  debugCtx.fillStyle = "rgba(255,80,80,0.18)";
  for (const wall of WALLS) {
    debugCtx.fillRect(wall.x, wall.y, wall.w, wall.h);
    debugCtx.strokeRect(wall.x, wall.y, wall.w, wall.h);
  }

  // HUD
  debugCtx.fillStyle = "rgba(0,0,0,0.60)";
  debugCtx.fillRect(10, 10, 700, 64);
  debugCtx.fillStyle = "rgba(255,255,255,0.95)";
  debugCtx.fillText(`Detectado: ${detectedRoomId ?? "— (fora)"}`, 18, 34);
  debugCtx.fillText(`UI: ${currentRoomId ?? "—"} | from: ${fromRoomId ?? "—"} (${fromI.toFixed(2)}) | to: ${toRoomId ?? "—"} (${toI.toFixed(2)})`, 18, 56);

  // texto calibrador
  if (calibrate) {
    debugCtx.fillStyle = "rgba(0,0,0,0.55)";
    debugCtx.fillRect(10, h - 44, 860, 34);
    debugCtx.fillStyle = "rgba(255,255,255,0.95)";
    debugCtx.fillText("CALIB ON: arraste e solte pra gerar {x,y,w,h} (Console). C desliga.", 18, h - 21);
  }

  // seleção amarela
  if (calibrate && drag) {
    const x = Math.min(drag.x0, drag.x1);
    const y = Math.min(drag.y0, drag.y1);
    const ww = Math.abs(drag.x1 - drag.x0);
    const hh = Math.abs(drag.y1 - drag.y0);

    debugCtx.strokeStyle = "rgba(255,255,0,0.95)";
    debugCtx.fillStyle = "rgba(255,255,0,0.15)";
    debugCtx.fillRect(x, y, ww, hh);
    debugCtx.strokeRect(x, y, ww, hh);
  }

  debugCtx.restore();
}

// Mdelta time
let lastT = performance.now();

function tick(t) {
  const dt = Math.min(0.032, (t - lastT) / 1000);
  lastT = t;

  let dx = 0, dy = 0;
  if (keys.has("w")) dy -= 1;
  if (keys.has("s")) dy += 1;
  if (keys.has("a")) dx -= 1;
  if (keys.has("d")) dx += 1;

  if (dx !== 0 && dy !== 0) {
    const inv = 1 / Math.sqrt(2);
    dx *= inv;
    dy *= inv;
  }

  const moveX = dx * player.speed * dt;
  const moveY = dy * player.speed * dt;

  if (moveX || moveY) {
    tryMove(moveX, moveY);
    playerEl.style.left = `${player.x}px`;
    playerEl.style.top = `${player.y}px`;
  }

  detectedRoomId = findRoomForPlayer();

  // manda só quando muda (inclui null)
  if (detectedRoomId !== lastSentRoom) {
    sendMotion(detectedRoomId);
  }

  drawLighting(dt);
  drawDebug();
  requestAnimationFrame(tick);
}

// boot
window.addEventListener("resize", resizeCanvases);
resizeCanvases();

// garante spawn visual
playerEl.style.left = `${player.x}px`;
playerEl.style.top = `${player.y}px`;

// começa apagado até receber comando
setLightTarget(null);

requestAnimationFrame(tick);