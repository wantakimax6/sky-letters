// Sky Letters — boot and the one loop: input is read every frame, the
// world advances in fixed 1/60 s steps, and the renderer paints what is
// there. Screens: title, play, paused, crash, end. Dialogue pauses the
// flight while a letter is read, then flying resumes.
//
// ?seed=N fixes the archipelago. ?shot=cover|storm|landing|sunset (with
// &seed=N) stages that scene instead of running the loop, paints it
// twice and sets window.__shotReady for a screenshot.
import { STEP } from './config.js';
import { makeRng } from './random.js';
import { createWorld, EVENT_RING, EVENT_FUEL, EVENT_DELIVERED, EVENT_CRASH } from './world.js';
import { SkyInput } from './input.js';
import { SkyAudio } from './audio.js';
import { createParticles } from './particles.js';
import { buildClouds } from './terrain.js';
import { createRenderer, SCREEN_TITLE, SCREEN_PLAY, SCREEN_PAUSED, SCREEN_CRASH, SCREEN_END } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 1;

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(seed);
const clouds = buildClouds(seed);
const particles = createParticles();
const renderer = createRenderer(canvas, particles, clouds);
const audio = new SkyAudio();
makeRng(seed);

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, world, scene.screen, 0);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = new SkyInput(canvas);
  let screen = SCREEN_TITLE;
  let accumulator = 0;
  let last = performance.now();
  let lastRingAt = 0;

  function announce(message) { status.textContent = message; }

  function startFlying() {
    world.reset();
    screen = SCREEN_PLAY;
    announce('Flying. Letter 1 of 5: For Grandma Sari.');
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    const s = world.state;
    if (input.wasPressed('m')) { const muted = audio.toggleMute(); announce(muted ? 'Muted.' : 'Sound on.'); }
    if (input.wasPressed('r') && screen !== SCREEN_TITLE) { world.retryMission(); screen = SCREEN_PLAY; announce('Letter restarted.'); }
    if (input.wasPressed('enter') || input.wasPressed(' ')) {
      audio.ensure();
      if (screen === SCREEN_TITLE) startFlying();
      else if (screen === SCREEN_CRASH) { world.retryMission(); screen = SCREEN_PLAY; }
      else if (screen === SCREEN_END) startFlying();
      else if (s.dialogue) {
        const finished = world.advanceDialogue();
        if (finished && s.mode === 'complete') screen = SCREEN_END;
        else if (finished) screen = SCREEN_PLAY;
      }
    }
    if (input.wasPressed('p') && screen === SCREEN_PLAY) screen = SCREEN_PAUSED;
    else if (input.wasPressed('p') && screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
    if (screen === SCREEN_PLAY && !s.dialogue) {
      while (accumulator >= STEP) {
        const events = world.step(STEP, {
          pitch: input.pitch(),
          roll: input.roll(),
          throttleDelta: input.throttleDelta(),
          brake: input.brake(),
          mouseSteer: input.mouseSteer(canvas.clientWidth || 1280),
        }, false);
        accumulator -= STEP;
        if (events & EVENT_RING) {
          audio.chime();
          particles.burst('sparkle', 640, 300, 22, '#ffc93c');
          lastRingAt = s.time;
        }
        if (events & EVENT_FUEL) { audio.chime(); announce('Fuel ring! Pipit is refuelled.'); }
        if (events & EVENT_DELIVERED) {
          audio.deliveredMelody();
          particles.petals(640, 300, 30);
          announce('Letter delivered!');
        }
        if (events & EVENT_CRASH) {
          audio.thud();
          particles.splash(640, 560);
          screen = SCREEN_CRASH;
          announce('Pipit is hurt. Press Enter to try again.');
          break;
        }
        if (s.mode === 'complete') { screen = SCREEN_END; break; }
      }
    } else {
      accumulator = 0;
    }
    // Gentle idle drift on the title screen: the plane cruises by itself.
    if (screen === SCREEN_TITLE) {
      world.step(STEP, { pitch: 0, roll: Math.sin(s.time * 0.2) * 0.2, throttleDelta: 0, brake: false, mouseSteer: 0 }, true);
    }
    particles.step(STEP);
    audio.setEngine(s.plane.throttle, s.plane.speed, screen === SCREEN_PLAY && !s.dialogue);
    renderer.draw(s, world, screen, 0);
    input.endFrame();
  }
  announce('Sky Letters. Press Enter to fly.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
