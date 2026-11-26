// Sky Letters — screenshot scenes behind ?shot=cover|storm|landing|sunset.
// Each one plays the real rules forward from a fresh world for a fixed
// number of steps, steered by a simple autopilot (turn toward the next
// ring or the landing island, hold a gentle altitude, keep the throttle
// in the cruise band), so the frame is what a real flight looks like and
// the same seed always gives the same frame.
import { STEP } from './config.js';
import { SCREEN_PLAY, SCREEN_TITLE } from './render.js';

function autopilotInput(world) {
  const s = world.state; const p = s.plane;
  const t = world.nextTarget();
  const dx = t.x - p.x, dz = t.z - p.z;
  const wantHeading = Math.atan2(dx, dz);
  let diff = wantHeading - p.heading;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const roll = Math.max(-1, Math.min(1, diff * 2.2));
  const wantAlt = t.y > 0 ? t.y : 55;
  const pitch = Math.max(-1, Math.min(1, (wantAlt - p.alt) / 60));
  const throttleDelta = p.speed < 72 ? 1 : p.speed > 88 ? -1 : 0;
  return { pitch, roll, throttleDelta, brake: false, mouseSteer: 0 };
}

function flyFor(world, seconds) {
  const steps = Math.floor(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    if (world.state.mode !== 'fly' && world.state.mode !== 'dialogue') break;
    if (world.state.dialogue) world.advanceDialogue();
    world.step(STEP, autopilotInput(world), false);
  }
}

// Stage the exact flight state a shot shows: letters delivered must
// match the mission (Letter 3 => 2 already delivered, and so on), and
// each shot reads at its own plausible speed and altitude.
function stageState(world, letters, speed, alt, throttle, pitch) {
  const p = world.state.plane;
  world.state.letters = letters;
  world.state.deliveredCount = letters;
  p.speed = speed; p.alt = alt; p.throttle = throttle;
  p.pitch = pitch || 0; p.vs = pitch ? -6 : 0;
}

export function stageShot(name, world) {
  const shot = name || 'cover';
  if (shot === 'cover') {
    world.startMission(0);
    world.advanceDialogue(); world.advanceDialogue();
    flyFor(world, 5.5);
    stageState(world, 0, 82, 85, 0.42, 0);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (shot === 'storm') {
    world.startMission(2);
    world.advanceDialogue(); world.advanceDialogue();
    flyFor(world, 15);
    stageState(world, 2, 68, 62, 0.26, 0);
    // A mid-flight word from Agus, as the canyon opens ahead: the
    // dialogue overlay is a real game state, shown while flying.
    world.state.dialogue = { lines: [{ who: 'agus', text: 'So my brother finally wrote... Fly low, little pilot. The canyon is narrow, but so is a grudge.' }], kind: 'mid' };
    world.state.dialogueIndex = 0;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (shot === 'landing') {
    world.startMission(3);
    world.advanceDialogue(); world.advanceDialogue();
    flyFor(world, 21);
    stageState(world, 3, 61, 48, 0.18, -0.15);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (shot === 'sunset') {
    world.startMission(4);
    world.advanceDialogue(); world.advanceDialogue();
    flyFor(world, 15);
    stageState(world, 4, 74, 120, 0.33, 0);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  world.startMission(0);
  return { screen: SCREEN_TITLE, best: 0 };
}
