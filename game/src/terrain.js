// Sky Letters — the archipelago: islands, sky, sea, clouds, rings and
// runways, plus the chase-camera projection that turns world points into
// screen points. World axes: x east, z north (forward), y up in feet.
// The plane starts at (0, 60, 0) heading north; every island sits ahead.
import { PALETTE, CAMERA, VIEW } from './config.js';
import { makeRng, range } from './random.js';

export const ISLANDS = [
  { id: 'home', name: 'Home Bay', x: 0, z: -40, r: 150, kind: 'village', h: 26 },
  { id: 'senja', name: 'Pulau Senja', x: 0, z: 900, r: 130, kind: 'runway-water', h: 18 },
  { id: 'lighthouse', name: 'Lighthouse Island', x: 280, z: 1450, r: 95, kind: 'lighthouse', h: 30 },
  { id: 'canyon-west', name: 'Canyon West', x: -330, z: 1950, r: 170, kind: 'cliff', h: 90 },
  { id: 'canyon-east', name: 'Canyon East', x: 330, z: 2050, r: 170, kind: 'cliff', h: 95 },
  { id: 'mountain', name: 'Mount Api', x: 0, z: 2650, r: 150, kind: 'airstrip', h: 120 },
  { id: 'memorial', name: 'Memorial Hill', x: -90, z: 3250, r: 115, kind: 'memorial', h: 55 },
  { id: 'palm-a', name: 'Palm Cay', x: -560, z: 700, r: 80, kind: 'palm', h: 16 },
  { id: 'palm-b', name: 'Turtle Cay', x: 620, z: 1100, r: 85, kind: 'palm', h: 16 },
  { id: 'volcano', name: 'Ember Isle', x: -700, z: 2400, r: 130, kind: 'volcano', h: 110 },
  { id: 'palm-c', name: 'Coral Cay', x: 560, z: 2900, r: 75, kind: 'palm', h: 14 },
];
export function islandById(id) { return ISLANDS.find((i) => i.id === id); }

// Where each mission ends: the island and the kind of landing surface.
export const MISSION_TARGETS = {
  1: { island: 'senja', land: 'water' },
  2: { island: 'lighthouse', land: 'water' },
  3: { island: 'canyon-east', land: 'water' },
  4: { island: 'mountain', land: 'strip' },
  5: { island: 'memorial', land: 'hill' },
};

export function buildClouds(seed) {
  const rng = makeRng(seed);
  const clouds = [];
  for (let i = 0; i < 46; i += 1) {
    clouds.push({
      x: range(rng, -1400, 1400), y: range(rng, 180, 420),
      z: range(rng, 100, 3600), s: range(rng, 40, 130),
      storm: i % 9 === 4,
    });
  }
  return clouds;
}

export function cameraFor(plane) {
  const fx = Math.sin(plane.heading), fz = Math.cos(plane.heading);
  return {
    x: plane.x - fx * CAMERA.behind, y: plane.alt + CAMERA.above, z: plane.z - fz * CAMERA.behind,
    fx, fz, rx: fz, rz: -fx, heading: plane.heading,
  };
}

// Project a world point to screen space. Returns null when behind camera.
export function project(cam, wx, wy, wz) {
  const dx = wx - cam.x, dy = wy - cam.y, dz = wz - cam.z;
  const fwd = dx * cam.fx + dz * cam.fz;
  if (fwd < 8) return null;
  const right = dx * cam.rx + dz * cam.rz;
  const f = CAMERA.focal;
  return {
    x: VIEW.width / 2 + (right / fwd) * f,
    y: VIEW.height * CAMERA.horizonBase - (dy / fwd) * f,
    scale: f / fwd, depth: fwd,
  };
}

function skyColors(sky) {
  if (sky === 'dusk') return [PALETTE.skyTopDusk, PALETTE.skyMidDusk, PALETTE.skyLowDusk];
  if (sky === 'night') return [PALETTE.skyTopNight, PALETTE.skyMidNight, PALETTE.skyLowNight];
  if (sky === 'sunset') return ['#4a2a6e', '#e07856', '#ffc46b'];
  return [PALETTE.skyTopDay, PALETTE.skyMidDay, PALETTE.skyLowDay];
}
function seaColors(sky) {
  if (sky === 'dusk' || sky === 'sunset') return [PALETTE.seaDusk, '#8f4a3a'];
  if (sky === 'night') return [PALETTE.seaNight, '#101c3a'];
  return [PALETTE.seaDay, PALETTE.seaDeepDay];
}

export function drawSky(ctx, sky, time) {
  const [top, mid, low] = skyColors(sky);
  const g = ctx.createLinearGradient(0, 0, 0, VIEW.height * 0.55);
  g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, low);
  ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW.width, VIEW.height * 0.56);
  // Sun (or low moon glow at dusk): a big warm disc near the horizon.
  const sunX = VIEW.width * 0.68, sunY = VIEW.height * (sky === 'day' ? 0.16 : 0.34);
  const glow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 190);
  glow.addColorStop(0, 'rgba(255,236,170,0.95)');
  glow.addColorStop(0.25, 'rgba(255,200,90,0.55)');
  glow.addColorStop(1, 'rgba(255,200,90,0)');
  ctx.fillStyle = glow; ctx.fillRect(sunX - 200, sunY - 200, 400, 400);
  ctx.fillStyle = sky === 'day' ? '#fff3c4' : '#ffdf8a';
  ctx.beginPath(); ctx.arc(sunX, sunY, sky === 'day' ? 34 : 44, 0, Math.PI * 2); ctx.fill();
  if (sky === 'night' || sky === 'dusk') {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 26; i += 1) {
      const sx = (i * 173 + 41) % VIEW.width, sy = (i * 97 + 23) % 170;
      ctx.fillRect(sx, sy, 2.5, 2.5);
    }
  }
}

export function drawSea(ctx, sky, time) {
  const [top, deep] = seaColors(sky);
  const horizon = VIEW.height * CAMERA.horizonBase;
  const g = ctx.createLinearGradient(0, horizon, 0, VIEW.height);
  g.addColorStop(0, top); g.addColorStop(1, deep);
  ctx.fillStyle = g; ctx.fillRect(0, horizon, VIEW.width, VIEW.height - horizon);
  // Sun glitter: one soft wide glow on the water under the sun.
  ctx.save(); ctx.globalAlpha = 0.22;
  const gl = ctx.createRadialGradient(VIEW.width * 0.68, horizon + 90, 4, VIEW.width * 0.68, horizon + 90, 260);
  gl.addColorStop(0, 'rgba(255,233,168,0.9)');
  gl.addColorStop(1, 'rgba(255,233,168,0)');
  ctx.fillStyle = gl;
  ctx.beginPath(); ctx.ellipse(VIEW.width * 0.68, horizon + 90, 260, 90, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Gentle swell lines.
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const y = horizon + 40 + i * 62;
    ctx.beginPath();
    for (let x = 0; x <= VIEW.width; x += 40) {
      const yy = y + Math.sin(x * 0.01 + time * 0.8 + i * 2) * 4;
      if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
}

function drawPalm(ctx, x, y, s) {
  ctx.strokeStyle = '#7a5230'; ctx.lineWidth = Math.max(2, s * 0.09);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + s * 0.12, y - s * 0.5, x + s * 0.2, y - s * 0.85); ctx.stroke();
  ctx.strokeStyle = PALETTE.palm; ctx.lineWidth = Math.max(2, s * 0.07); ctx.lineCap = 'round';
  for (let a = 0; a < 5; a += 1) {
    const ang = -Math.PI * (0.15 + a * 0.17);
    ctx.beginPath(); ctx.moveTo(x + s * 0.2, y - s * 0.85);
    ctx.quadraticCurveTo(x + s * 0.2 + Math.cos(ang) * s * 0.45, y - s * 0.85 + Math.sin(ang) * s * 0.45,
      x + s * 0.2 + Math.cos(ang) * s * 0.7, y - s * 0.85 + Math.sin(ang) * s * 0.7 + s * 0.25);
    ctx.stroke();
  }
}

function drawIsland(ctx, cam, isl, sky, time) {
  const p = project(cam, isl.x, 0, isl.z);
  if (!p) return;
  const r = Math.max(4, isl.r * p.scale);
  if (p.x < -r * 2 || p.x > VIEW.width + r * 2) return;
  const topY = p.y - isl.h * p.scale;
  // Sand ring and grass top.
  ctx.fillStyle = PALETTE.sand;
  ctx.beginPath(); ctx.ellipse(p.x, p.y, r, r * 0.34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = isl.kind === 'cliff' || isl.kind === 'volcano' ? PALETTE.rock : PALETTE.grass;
  ctx.beginPath(); ctx.ellipse(p.x, topY + r * 0.1, r * 0.88, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PALETTE.grassDark;
  ctx.beginPath(); ctx.ellipse(p.x, topY + r * 0.08, r * 0.6, r * 0.2, 0, 0, Math.PI * 2); ctx.fill();
  if (isl.kind === 'volcano' || isl.kind === 'airstrip' || isl.kind === 'cliff') {
    ctx.fillStyle = isl.kind === 'volcano' ? PALETTE.volcano : '#7d8a7a';
    ctx.beginPath();
    ctx.moveTo(p.x - r * 0.62, topY + r * 0.12);
    ctx.lineTo(p.x, topY - isl.h * p.scale * 0.9);
    ctx.lineTo(p.x + r * 0.62, topY + r * 0.12);
    ctx.closePath(); ctx.fill();
    if (isl.kind === 'volcano') {
      ctx.fillStyle = '#ff9a3c';
      ctx.beginPath(); ctx.ellipse(p.x, topY - isl.h * p.scale * 0.9, r * 0.12, r * 0.05, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(200,200,200,0.7)';
      ctx.beginPath(); ctx.ellipse(p.x + Math.sin(time) * 4, topY - isl.h * p.scale * 1.15, r * 0.2, r * 0.09, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (isl.kind === 'airstrip') {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(p.x - r * 0.14, topY - isl.h * p.scale * 0.9); ctx.lineTo(p.x + r * 0.14, topY - isl.h * p.scale * 0.9); ctx.lineTo(p.x, topY - isl.h * p.scale * 0.55); ctx.closePath(); ctx.fill();
    }
  }
  if (isl.kind === 'lighthouse') {
    const lx = p.x + r * 0.3, baseY = topY + r * 0.05, hgt = r * 1.5;
    ctx.fillStyle = '#fff'; ctx.fillRect(lx - r * 0.09, baseY - hgt, r * 0.18, hgt);
    ctx.fillStyle = '#d93b2b'; ctx.fillRect(lx - r * 0.09, baseY - hgt * 0.66, r * 0.18, hgt * 0.16);
    ctx.fillRect(lx - r * 0.09, baseY - hgt * 0.33, r * 0.18, hgt * 0.16);
    ctx.fillStyle = '#2b2118'; ctx.fillRect(lx - r * 0.12, baseY - hgt - r * 0.12, r * 0.24, r * 0.12);
    const beam = (Math.sin(time * 0.7) + 1) / 2;
    ctx.save(); ctx.globalAlpha = 0.25 + beam * 0.3; ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.moveTo(lx, baseY - hgt);
    ctx.lineTo(lx + r * 2.4, baseY - hgt - r * 0.5); ctx.lineTo(lx + r * 2.4, baseY - hgt + r * 0.3);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  if (isl.kind === 'village') {
    ctx.fillStyle = '#fff3d6';
    for (let i = -2; i <= 2; i += 1) {
      const hx = p.x + i * r * 0.3, hy = topY - r * 0.06 + (i % 2) * r * 0.08;
      ctx.fillRect(hx - r * 0.07, hy - r * 0.1, r * 0.14, r * 0.1);
      ctx.fillStyle = '#d93b2b';
      ctx.beginPath(); ctx.moveTo(hx - r * 0.09, hy - r * 0.1); ctx.lineTo(hx, hy - r * 0.2); ctx.lineTo(hx + r * 0.09, hy - r * 0.1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff3d6';
    }
  }
  if (isl.kind === 'memorial') {
    ctx.strokeStyle = '#a34d2d'; ctx.lineWidth = Math.max(2, r * 0.05);
    const mx = p.x, my = topY - r * 0.1, mh = r * 0.7;
    ctx.beginPath(); ctx.moveTo(mx - r * 0.22, my); ctx.lineTo(mx - r * 0.22, my - mh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx + r * 0.22, my); ctx.lineTo(mx + r * 0.22, my - mh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx - r * 0.34, my - mh); ctx.lineTo(mx + r * 0.34, my - mh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx - r * 0.26, my - mh * 0.82); ctx.lineTo(mx + r * 0.26, my - mh * 0.82); ctx.stroke();
    ctx.fillStyle = '#ffd9a0';
    ctx.beginPath(); ctx.arc(mx, my - mh * 0.5, r * 0.06, 0, Math.PI * 2); ctx.fill();
  }
  if (isl.kind === 'palm' || isl.kind === 'village' || isl.kind === 'runway-water') {
    drawPalm(ctx, p.x - r * 0.45, topY + r * 0.05, r * 0.5);
    drawPalm(ctx, p.x + r * 0.4, topY + r * 0.02, r * 0.42);
  }
  // Island name tag when close enough to read and clear of the HUD edges.
  if (p.depth < 900 && p.x > 150 && p.x < VIEW.width - 150) {
    ctx.font = `600 ${Math.max(11, Math.round(r * 0.16))}px ${'system-ui, sans-serif'}`;
    ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillText(isl.name, p.x, topY - r * 0.28);
  }
}

export function drawRunway(ctx, cam, isl, sky) {
  // A pale water runway: two floating marker lines ahead of the island.
  const dir = { x: 0, z: 1 };
  const half = 26, len = 150;
  const corners = [
    [isl.x - half, 0, isl.z - 190], [isl.x + half, 0, isl.z - 190],
    [isl.x + half, 0, isl.z - 190 - len], [isl.x - half, 0, isl.z - 190 - len],
  ];
  const pts = corners.map(([x, y, z]) => project(cam, x, y, z));
  if (pts.some((p) => !p)) return;
  ctx.save();
  ctx.fillStyle = 'rgba(255,243,214,0.85)';
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#e89b0c'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#e89b0c';
  for (let i = 0; i < 3; i += 1) {
    const t = 0.25 + i * 0.25;
    const x = pts[0].x + (pts[3].x - pts[0].x) * t, y = pts[0].y + (pts[3].y - pts[0].y) * t;
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawRing(ctx, cam, ring, time) {
  const p = project(cam, ring.x, ring.y, ring.z);
  if (!p || p.depth < 45) return;
  const r = Math.min(170, Math.max(6, ring.r * p.scale * 1.6));
  const pulse = 1 + Math.sin(time * 3 + ring.z * 0.01) * 0.06;
  ctx.save();
  ctx.strokeStyle = ring.fuel ? '#37d67a' : PALETTE.gold;
  ctx.lineWidth = Math.max(3, r * 0.14);
  ctx.shadowColor = ring.fuel ? '#37d67a' : PALETTE.gold;
  ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.ellipse(p.x, p.y, r * pulse, r * 0.62 * pulse, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = ring.fuel ? '#37d67a' : PALETTE.gold;
  ctx.font = `700 ${Math.max(11, Math.min(18, Math.round(r * 0.3)))}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(ring.fuel ? 'FUEL' : '✦', p.x, p.y - r * 0.8);
  ctx.restore();
}

export function drawCloud(ctx, cam, cloud, sky, time) {
  const p = project(cam, cloud.x, cloud.y, cloud.z);
  if (!p || p.depth < 90) return;
  // Never paint a cloud over the HUD panels at the top corners.
  if (p.y < 140 && (p.x < 360 || p.x > 920)) return;
  const s = Math.min(90, Math.max(6, cloud.s * p.scale));
  ctx.save();
  ctx.globalAlpha = cloud.storm ? 0.92 : 0.85;
  ctx.fillStyle = cloud.storm ? '#4a4a5e' : sky === 'night' ? '#5a5a8a' : sky === 'sunset' || sky === 'dusk' ? '#ffe9c4' : '#ffffff';
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.ellipse(p.x + i * s * 0.55, p.y + (i === 0 ? -s * 0.18 : 0), s * 0.62, s * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawTerrain(ctx, cam, sky, clouds, rings, runwayIsland, time) {
  drawSky(ctx, sky, time);
  drawSea(ctx, sky, time);
  const sorted = [...ISLANDS].sort((a, b) => {
    const da = (a.x - cam.x) * cam.fx + (a.z - cam.z) * cam.fz;
    const db = (b.x - cam.x) * cam.fx + (b.z - cam.z) * cam.fz;
    return db - da;
  });
  for (const isl of sorted) drawIsland(ctx, cam, isl, sky, time);
  if (runwayIsland) drawRunway(ctx, cam, runwayIsland, sky);
  const farClouds = clouds.filter((c) => c.z > cam.z + 200);
  const nearClouds = clouds.filter((c) => c.z <= cam.z + 200);
  for (const c of farClouds) drawCloud(ctx, cam, c, sky, time);
  for (const ring of rings) if (!ring.done) drawRing(ctx, cam, ring, time);
  for (const c of nearClouds) drawCloud(ctx, cam, c, sky, time);
}
