// Sky Letters — drawing only: the world state and the current screen in,
// pixels out. The 1280x720 field is scaled to fit the window and centred.
// Chase camera, terrain, Pipit, particles, HUD, dialogue overlay, and the
// title, pause, crash, delivered and ending screens.
import { VIEW, FONT, PALETTE } from './config.js';
import { cameraFor, drawTerrain, islandById, MISSION_TARGETS, project } from './terrain.js';
import { drawPlane } from './plane.js';
import { drawHud } from './hud.js';
import { drawPortrait, CHARACTER_NAMES } from './characters.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CRASH = 'crash';
export const SCREEN_END = 'end';

function text(ctx, value, x, y, size, color, align, weight) {
  ctx.font = `${weight || 600} ${size}px ${FONT}`;
  ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}
function wrapText(ctx, value, x, y, maxWidth, lineHeight, size) {
  ctx.font = `500 ${size}px ${FONT}`;
  const words = value.split(' ');
  let line = ''; let yy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy); line = w; yy += lineHeight;
    } else line = test;
  }
  ctx.fillText(line, x, yy);
  return yy;
}

export function createRenderer(canvas, particles, clouds) {
  const ctx = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    view.scale = Math.min(canvas.width / VIEW.width, canvas.height / VIEW.height);
    view.x = (canvas.width - VIEW.width * view.scale) / 2;
    view.y = (canvas.height - VIEW.height * view.scale) / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  function drawDialogue(world) {
    const s = world.state;
    if (!s.dialogue) return;
    const line = s.dialogue.lines[s.dialogueIndex];
    if (!line) return;
    const m = world.mission();
    ctx.fillStyle = 'rgba(20,16,30,0.78)';
    ctx.beginPath(); ctx.roundRect(90, VIEW.height - 178, VIEW.width - 180, 158, 16); ctx.fill();
    ctx.strokeStyle = 'rgba(255,201,60,0.7)'; ctx.lineWidth = 2; ctx.stroke();
    drawPortrait(ctx, line.who, 168, VIEW.height - 100, 120, 'happy');
    text(ctx, CHARACTER_NAMES[line.who] || line.who, 250, VIEW.height - 138, 17, '#ffc93c', 'left', 800);
    text(ctx, `Letter ${m.id} — ${m.name}`, 250, VIEW.height - 114, 13, '#bfe8f2', 'left');
    ctx.fillStyle = '#fff';
    wrapText(ctx, line.text, 250, VIEW.height - 84, VIEW.width - 360, 26, 18);
    text(ctx, 'Press Enter to continue  ▸', VIEW.width - 130, VIEW.height - 34, 14, '#ffd9a0', 'right');
  }

  function drawTitle(world) {
    ctx.fillStyle = 'rgba(20,16,40,0.45)'; ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    text(ctx, 'SKY LETTERS', VIEW.width / 2, 150, 84, '#fff', 'center', 900);
    ctx.save(); ctx.shadowColor = '#ffc93c'; ctx.shadowBlur = 24;
    text(ctx, 'Every letter finds its sky.', VIEW.width / 2, 196, 26, '#ffe9b8', 'center');
    ctx.restore();
    text(ctx, 'Nara, 19, flies her little seaplane Pipit across a sunny archipelago,', VIEW.width / 2, 250, 19, '#fff', 'center');
    text(ctx, 'delivering handwritten letters after the radio network fails.', VIEW.width / 2, 278, 19, '#fff', 'center');
    text(ctx, 'Five letters. Five flights. One promise.', VIEW.width / 2, 312, 19, '#ffe9b8', 'center');
    text(ctx, '↑ ↓ pitch      ← → bank & turn      Shift / Ctrl throttle      Space brake', VIEW.width / 2, 380, 17, '#fff', 'center');
    text(ctx, 'Fly through the golden rings, then land gently on the water.', VIEW.width / 2, 412, 17, '#fff', 'center');
    text(ctx, 'Green rings refuel Pipit. Fly low and kind — hearts are for gentle flying.', VIEW.width / 2, 440, 17, '#fff', 'center');
    ctx.fillStyle = 'rgba(255,201,60,0.9)';
    ctx.beginPath(); ctx.roundRect(VIEW.width / 2 - 170, 480, 340, 56, 28); ctx.fill();
    text(ctx, 'Press Enter to fly  ✈', VIEW.width / 2, 516, 22, '#2b2118', 'center', 800);
    text(ctx, 'P pause    M mute    R restart    Mouse: hold and drag to steer', VIEW.width / 2, 580, 15, '#dfe8ff', 'center');
  }

  function drawCrash(world) {
    ctx.fillStyle = 'rgba(20,10,16,0.6)'; ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    text(ctx, 'Pipit is hurt', VIEW.width / 2, 280, 52, '#fff', 'center', 800);
    ctx.fillStyle = '#fff';
    wrapText(ctx, world.state.crashReason, VIEW.width / 2 - 320, 330, 640, 28, 19);
    text(ctx, 'Press Enter to try this letter again', VIEW.width / 2, 440, 20, '#ffc93c', 'center');
  }

  function drawEnd(world) {
    ctx.fillStyle = 'rgba(30,16,50,0.55)'; ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    text(ctx, 'Every letter finds its sky.', VIEW.width / 2, 220, 46, '#fff', 'center', 800);
    text(ctx, `All five letters delivered. Score ${world.state.score}.`, VIEW.width / 2, 280, 22, '#ffe9b8', 'center');
    text(ctx, 'Nara looks up at the sunset. Somewhere above the clouds,', VIEW.width / 2, 330, 19, '#fff', 'center');
    text(ctx, 'her mother is smiling. The sky keeps every promise.', VIEW.width / 2, 360, 19, '#fff', 'center');
    text(ctx, 'Thank you for flying with Pipit.  Press Enter to fly again.', VIEW.width / 2, 440, 18, '#ffc93c', 'center');
  }

  function drawPaused() {
    ctx.fillStyle = 'rgba(20,16,30,0.6)'; ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    text(ctx, 'Paused', VIEW.width / 2, 330, 56, '#fff', 'center', 800);
    text(ctx, 'Press P to keep flying', VIEW.width / 2, 380, 20, '#ffd9a0', 'center');
  }

  function draw(state, world, screen, best) {
    const s = world.state;
    const m = world.mission();
    const sky = m.sky;
    const cam = cameraFor(s.plane);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#101736';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    const target = world.targetIsland();
    drawTerrain(ctx, cam, sky, clouds, s.rings, target, s.time);
    // Target beacon: a small pulsing gold marker above the landing island.
    if (s.mode === 'fly' && s.ringIndex >= s.rings.length) {
      const bp = project(cam, target.x, 130, target.z);
      if (bp) {
        ctx.save(); ctx.globalAlpha = 0.6 + Math.sin(s.time * 3) * 0.3;
        ctx.fillStyle = '#ffc93c';
        ctx.beginPath();
        ctx.moveTo(bp.x, bp.y - 18); ctx.lineTo(bp.x + 11, bp.y); ctx.lineTo(bp.x, bp.y + 18); ctx.lineTo(bp.x - 11, bp.y);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
    particles.draw(ctx);
    if (sky === 'dusk' || sky === 'night') particles.drawRain(ctx, sky === 'dusk' ? 0.7 : 0.4, s.time);
    // Pipit, large in the lower centre, banking and pitching with the controls.
    // When dialogue is open the plane rides a little higher so it stays visible.
    const px = VIEW.width / 2;
    const py = VIEW.height - 190 + s.plane.pitch * 60 - (s.dialogue ? 80 : 0);
    drawPlane(ctx, px, py, 1.05, s.plane.bank, s.plane.pitch, s.plane.prop, Math.sin(s.time * 5), s.damage > 40);
    // Petals drift up on the final flight.
    if (m.id === 5 && s.mode === 'fly') particles.petals(px, py - 40, 1);
    if (screen !== SCREEN_TITLE) drawHud(ctx, world, screen);
    if (screen === SCREEN_PLAY) drawDialogue(world);
    if (screen === SCREEN_TITLE) drawTitle(world);
    else if (screen === SCREEN_CRASH) drawCrash(world);
    else if (screen === SCREEN_END) drawEnd(world);
    else if (screen === SCREEN_PAUSED) drawPaused();
  }
  return { draw };
}
