# Sky Letters

[![make.fun bounty](https://make.fun/badge/best-flight-game-20261126-0057.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)

A flight game about delivering handwritten letters across a sunny Indonesian
archipelago. Built for the make.fun bounty
[Make the best flight game](https://make.fun/bounty/best-flight-game-20261126-0057).

## The story

The radio network has failed. Nineteen-year-old pilot **Nara** flies her
little orange-and-cream seaplane **Pipit** (sparrow) from island to island,
carrying the letters no one else can deliver. Five letters, five flights,
one promise: *every letter finds its sky.*

## Characters

- **Nara, 19** — pilot of Pipit. Red scarf, brown hair in a bun, warm and
  determined. Her late mother taught her to fly.
- **Grandma Sari** — has waited three years for news of her grandson.
- **Mika, 12** — the lighthouse keeper's son, turning twelve today.
- **Pak Budi and Pak Agus** — fisherman brothers who have not spoken in a year.

## The five letters

1. **For Grandma Sari** — tutorial: fly through 3 golden rings, then land on
   the water runway at Pulau Senja.
2. **Birthday at the Lighthouse** — a timed delivery to Mika, with a gentle
   east wind.
3. **Two Brothers** — carry Budi's apology low through the canyon between the
   islands, clear of the storm clouds.
4. **A Love Letter, Unsent for Ten Years** — a dusk flight in the rain to the
   mountain airstrip. Fuel matters: green rings refuel Pipit.
5. **The Last Letter** — Nara's own letter to her late mother. A sunset flight
   to the memorial hill, the rings arcing like a heart across the sky.

Each mission has a different goal (rings, timed delivery, low flight, fuel
management, landing), fuel that drains and can be refuelled, damage from hard
landings and storm clouds, and hearts for kind, gentle flying.

## Controls

- **Up / Down** — pitch (climb / descend)
- **Left / Right** or **A / D** — bank and turn
- **Shift / Ctrl** — throttle up / down
- **Space** — flaps / brake
- **Mouse** — hold and drag to steer
- **Enter** — start / continue dialogue
- **P** — pause, **M** — mute, **R** — restart the letter

Land gently: slow, lined up with the runway, and settled onto the water.
Come in too fast or too steep and Pipit is hurt — try again, gently.

## How to run

```sh
node serve.ts
```

Then open <http://localhost:8080> in a desktop browser. No build step, no
network request, no libraries: pure canvas 2D with WebAudio synth sound.

## Screenshots

Real renders of the game's own code, taken in a headless browser from
`?shot=cover|storm|landing|sunset&seed=1`:

- `1-cover.jpg` — golden sunset chase, ring and water runway ahead
- `2-storm.jpg` — the canyon run, lighthouse island, dialogue with Pak Agus
- `3-landing.jpg` — dusk rain approach to Mount Api, instruments lit
- `4-sunset.jpg` — the last letter, memorial hill ahead at sunset

## Files

| File | Job |
| --- | --- |
| `game/index.html` | Page shell, loads the game |
| `game/src/main.js` | Boot and the fixed-step loop |
| `game/src/config.js` | Constants, palette, flight tuning |
| `game/src/random.js` | Seeded random numbers |
| `game/src/audio.js` | WebAudio synth: engine, wind, chimes |
| `game/src/world.js` | Flight model, missions, landings, crashes |
| `game/src/missions.js` | The five letters and their dialogue |
| `game/src/characters.js` | Anime-style portraits drawn in canvas |
| `game/src/terrain.js` | Archipelago, sky, sea, rings, projection |
| `game/src/plane.js` | Drawing Pipit, scarf and propeller |
| `game/src/particles.js` | Petals, sparkles, splash, smoke, rain |
| `game/src/render.js` | Chase camera, screens, dialogue overlay |
| `game/src/hud.js` | Altitude, speed, heading, fuel, horizon |
| `game/src/input.js` | Keyboard and mouse input |
| `game/src/shots.js` | Deterministic screenshot scenes |
| `main.ts` | Hands the game in to `/output` |
| `serve.ts` | Tiny static server for local play |

## License

MIT — see `LICENSE`.
