// Sky Letters — shared constants: field size, palette, flight tuning.
// One warm painterly anime style across sky, sea and land: sunset gold,
// teal sea, cream clouds. All numbers here are the single source of truth.
export const VIEW = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const PALETTE = {
  skyTopDay: '#7ec8e8', skyMidDay: '#bfe8f2', skyLowDay: '#ffe9b8',
  skyTopDusk: '#3d2b63', skyMidDusk: '#e07856', skyLowDusk: '#ffc46b',
  skyTopNight: '#101736', skyMidNight: '#2c3a6e', skyLowNight: '#7a5a8f',
  seaDay: '#2fa8a0', seaDeepDay: '#1b7f8e', seaDusk: '#c96a4e', seaNight: '#1c2b52',
  sand: '#f2d8a0', grass: '#7cc46a', grassDark: '#4f9e57', palm: '#2f8f4e',
  volcano: '#8a6f5c', rock: '#9a8a76', gold: '#ffc93c', goldDeep: '#e89b0c',
  planeOrange: '#ff7a2f', planeCream: '#fff3d6', planeRed: '#d93b2b',
  ink: '#2b2118', panel: 'rgba(24,20,32,0.72)', panelLight: 'rgba(255,248,230,0.92)',
};
export const FLIGHT = {
  minSpeed: 46, cruiseSpeed: 78, maxSpeed: 132, stallSpeed: 42,
  climbRate: 26, sinkRate: 18, turnRate: 1.15, bankMax: 0.62,
  fuelMax: 100, fuelDrain: 0.55, fuelRingBonus: 34,
  safeLandSpeed: 62, safeLandSink: 12, damageHard: 26, damageStall: 12,
};
export const CAMERA = { behind: 26, above: 9, focal: 620, horizonBase: 0.42 };
export const MISSION_NAMES = [
  'For Grandma Sari', 'Birthday at the Lighthouse', 'Two Brothers',
  'A Love Letter, Unsent for Ten Years', 'The Last Letter',
];
export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
