// Sky Letters — the HUD: altitude, speed, heading, throttle, fuel,
// artificial horizon, compass strip, objective, letters and hearts.
// Instruments are lit and glowing, especially at dusk and night.
import { VIEW, FLIGHT } from './config.js';

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(20,16,30,0.62)';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5; ctx.stroke();
}
function label(ctx, text, x, y, size, color, align) {
  ctx.font = `700 ${size}px system-ui, sans-serif`;
  ctx.fillStyle = color || '#fff'; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x, y);
}
function value(ctx, text, x, y, size, color, align) {
  ctx.font = `800 ${size}px system-ui, sans-serif`;
  ctx.fillStyle = color || '#fff'; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(255,200,90,0.8)'; ctx.shadowBlur = 8;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
}
function compassLabel(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
}

export function drawHud(ctx, world, screen) {
  const s = world.state; const p = s.plane;
  const hdg = Math.round((((p.heading * 180) / Math.PI) % 360 + 360) % 360);
  const alt = Math.max(0, Math.round(p.alt * 10));
  const spd = Math.round(p.speed);
  // Top-left instruments: ALT, SPD, HDG.
  panel(ctx, 18, 16, 300, 92);
  label(ctx, 'ALTITUDE', 34, 40, 12, '#ffd9a0');
  value(ctx, `${alt} ft`, 34, 72, 30, '#fff');
  label(ctx, 'SPEED', 150, 40, 12, '#ffd9a0');
  value(ctx, `${spd} kt`, 150, 72, 30, '#fff');
  label(ctx, 'HEADING', 252, 40, 12, '#ffd9a0');
  value(ctx, `${String(hdg).padStart(3, '0')}°`, 252, 72, 30, '#fff');
  // Compass strip across the top centre.
  panel(ctx, 360, 16, 560, 44);
  ctx.save();
  ctx.beginPath(); ctx.roundRect(360, 16, 560, 44, 10); ctx.clip();
  for (let d = -120; d <= 120; d += 15) {
    const deg = (hdg + d + 360) % 360;
    const x = 640 + d * 2.1;
    ctx.strokeStyle = d === 0 ? '#ffc93c' : 'rgba(255,255,255,0.6)';
    ctx.lineWidth = d === 0 ? 3 : 1.5;
    ctx.beginPath(); ctx.moveTo(x, 22); ctx.lineTo(x, d % 45 === 0 ? 38 : 30); ctx.stroke();
    if (d % 45 === 0) label(ctx, deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : deg === 270 ? 'W' : String(deg), x, 54, 12, '#fff', 'center');
  }
  ctx.restore();
  label(ctx, compassLabel(hdg), 640, 14, 11, '#ffc93c', 'center');
  // Objective panel, top right.
  const m = world.mission();
  const tgt = world.nextTarget();
  const dist = Math.round(world.distanceToTarget() * 3.2);
  panel(ctx, VIEW.width - 338, 16, 320, 152);
  label(ctx, `LETTER ${m.id} OF 5`, VIEW.width - 322, 40, 12, '#ffc93c');
  ctx.font = '700 15px system-ui, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
  let name = m.name;
  while (ctx.measureText(name).width > 288 && name.length > 4) name = name.slice(0, -4) + '…';
  ctx.fillText(name, VIEW.width - 322, 64);
  ctx.font = '600 15px system-ui, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
  ctx.fillText(tgt.label, VIEW.width - 322, 90);
  label(ctx, `${dist} m ahead`, VIEW.width - 322, 114, 13, '#bfe8f2');
  // Letters delivered and hearts.
  label(ctx, `✉ Letters delivered: ${s.letters} / 5`, VIEW.width - 322, 140, 14, '#fff');
  let hearts = '';
  for (let i = 0; i < s.hearts; i += 1) hearts += '♥ ';
  label(ctx, hearts, VIEW.width - 322, 162, 16, '#ff6b81');
  // Throttle bar, left edge.
  panel(ctx, 18, 240, 46, 220);
  label(ctx, 'THR', 41, 232, 11, '#fff', 'center');
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.roundRect(32, 252, 18, 188, 8); ctx.fill();
  const th = p.throttle * 188;
  ctx.fillStyle = p.throttle > 0.75 ? '#ff7a2f' : '#ffc93c';
  ctx.beginPath(); ctx.roundRect(32, 252 + 188 - th, 18, th, 8); ctx.fill();
  label(ctx, `${Math.round(p.throttle * 100)}%`, 41, 462, 11, '#fff', 'center');
  // Fuel gauge, right edge.
  panel(ctx, VIEW.width - 64, 240, 46, 220);
  label(ctx, 'FUEL', VIEW.width - 41, 232, 11, '#fff', 'center');
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.roundRect(VIEW.width - 50, 252, 18, 188, 8); ctx.fill();
  const fh = (s.fuel / FLIGHT.fuelMax) * 188;
  ctx.fillStyle = s.fuel < 25 ? '#ff5a4e' : '#37d67a';
  ctx.beginPath(); ctx.roundRect(VIEW.width - 50, 252 + 188 - fh, 18, fh, 8); ctx.fill();
  label(ctx, `${Math.round(s.fuel)}%`, VIEW.width - 41, 462, 11, s.fuel < 25 ? '#ff8a80' : '#fff', 'center');
  if (s.fuel < 25) label(ctx, 'LOW FUEL — find a green ring!', VIEW.width / 2, 120, 16, '#ff8a80', 'center');
  // Artificial horizon, bottom left.
  const ax = 92, ay = VIEW.height - 92, ar = 56;
  ctx.save();
  ctx.beginPath(); ctx.arc(ax, ay, ar, 0, Math.PI * 2); ctx.clip();
  ctx.translate(ax, ay); ctx.rotate(-p.bank);
  ctx.fillStyle = '#7ec8e8'; ctx.fillRect(-ar, -ar - p.pitch * 90, ar * 2, ar * 2);
  ctx.fillStyle = '#8a6f4d'; ctx.fillRect(-ar, -p.pitch * 90, ar * 2, ar * 2);
  ctx.restore();
  ctx.beginPath(); ctx.arc(ax, ay, ar, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = '#ffc93c'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(ax - 30, ay); ctx.lineTo(ax + 30, ay); ctx.stroke();
  ctx.beginPath(); ctx.arc(ax, ay, 6, 0, Math.PI * 2); ctx.fillStyle = '#ffc93c'; ctx.fill();
  label(ctx, 'HORIZON', ax, ay + ar + 18, 11, '#fff', 'center');
  // Damage bar, bottom right.
  panel(ctx, VIEW.width - 238, VIEW.height - 66, 220, 48);
  label(ctx, 'PIPIT CONDITION', VIEW.width - 222, VIEW.height - 44, 11, '#ffd9a0');
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.roundRect(VIEW.width - 222, VIEW.height - 36, 188, 12, 6); ctx.fill();
  ctx.fillStyle = s.damage > 60 ? '#ff5a4e' : s.damage > 30 ? '#ffc93c' : '#37d67a';
  ctx.beginPath(); ctx.roundRect(VIEW.width - 222, VIEW.height - 36, 188 * (1 - s.damage / 100), 12, 6); ctx.fill();
  // Stall warning.
  if (s.stalled && screen === 'play') {
    ctx.save(); ctx.globalAlpha = 0.7 + Math.sin(s.time * 8) * 0.3;
    label(ctx, '⚠ STALL — ADD THROTTLE, NOSE DOWN', VIEW.width / 2, 150, 20, '#ff8a80', 'center');
    ctx.restore();
  }
  // Mission timer for the timed letter.
  if (m.timeLimit > 0) {
    const left = Math.max(0, Math.ceil(m.timeLimit - s.missionTime));
    label(ctx, `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} left`, VIEW.width / 2, 92, 18, left < 30 ? '#ff8a80' : '#fff', 'center');
  }
}
