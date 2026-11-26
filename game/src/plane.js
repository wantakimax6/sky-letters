// Sky Letters — drawing Pipit, the little orange-and-cream seaplane.
// Drawn in screen space, large in the lower centre, banking and pitching
// visibly with the controls: fuselage, wings, floats, spinning propeller
// blur, the red scarf trailing in the wind and an envelope emblem on the tail.
import { PALETTE } from './config.js';

export function drawPlane(ctx, cx, cy, scale, bank, pitch, propAngle, scarfWave, damaged) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(bank * 0.55);
  ctx.scale(scale, scale);
  // Scarf trailing behind (drawn first, behind the tail).
  ctx.strokeStyle = '#d93b2b'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-58, -6);
  ctx.quadraticCurveTo(-95, -14 + scarfWave * 8, -128, 2 + scarfWave * 14);
  ctx.quadraticCurveTo(-105, 8 + scarfWave * 10, -88, 4);
  ctx.stroke();
  ctx.strokeStyle = '#b02a1e'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-70, -4); ctx.quadraticCurveTo(-100, -8 + scarfWave * 8, -122, 4 + scarfWave * 12); ctx.stroke();
  // Tail.
  ctx.fillStyle = PALETTE.planeOrange;
  ctx.beginPath(); ctx.moveTo(-52, -14); ctx.lineTo(-86, -34); ctx.lineTo(-78, -6); ctx.lineTo(-52, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = PALETTE.planeCream;
  ctx.beginPath(); ctx.moveTo(-52, 2); ctx.lineTo(-84, 16); ctx.lineTo(-70, 6); ctx.lineTo(-52, 8); ctx.closePath(); ctx.fill();
  // Envelope emblem on the tail.
  ctx.fillStyle = '#fff3d6'; ctx.fillRect(-74, -26, 16, 11);
  ctx.strokeStyle = '#d93b2b'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-74, -26); ctx.lineTo(-66, -20); ctx.lineTo(-58, -26); ctx.stroke();
  // Rear wing.
  ctx.fillStyle = PALETTE.planeCream;
  ctx.beginPath(); ctx.ellipse(-38, 10, 34, 7, 0.25, 0, Math.PI * 2); ctx.fill();
  // Fuselage.
  const grad = ctx.createLinearGradient(0, -22, 0, 20);
  grad.addColorStop(0, '#ff9a4d'); grad.addColorStop(0.5, PALETTE.planeOrange); grad.addColorStop(1, '#e85d1a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(-56, -8);
  ctx.quadraticCurveTo(-20, -24, 42, -12);
  ctx.quadraticCurveTo(72, -4, 70, 4);
  ctx.quadraticCurveTo(40, 18, -10, 18);
  ctx.quadraticCurveTo(-48, 14, -56, -8);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(120,40,0,0.35)'; ctx.lineWidth = 2; ctx.stroke();
  // Cream belly stripe.
  ctx.fillStyle = PALETTE.planeCream;
  ctx.beginPath(); ctx.moveTo(-40, 10); ctx.quadraticCurveTo(10, 16, 58, 6); ctx.lineTo(52, 12); ctx.quadraticCurveTo(0, 20, -44, 14); ctx.closePath(); ctx.fill();
  // Cockpit canopy and Nara's helmet + scarf knot.
  ctx.fillStyle = 'rgba(190,235,250,0.95)';
  ctx.beginPath(); ctx.ellipse(18, -14, 20, 11, -0.12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#7a5230'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#6b4423';
  ctx.beginPath(); ctx.arc(16, -12, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d93b2b'; ctx.beginPath(); ctx.arc(8, -8, 4, 0, Math.PI * 2); ctx.fill();
  // Main wing (upper, near side) with roundel.
  ctx.fillStyle = PALETTE.planeCream;
  ctx.beginPath(); ctx.ellipse(6, 26, 62, 12, -0.08, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(120,40,0,0.3)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#d93b2b'; ctx.beginPath(); ctx.arc(6, 26, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6, 26, 3.5, 0, Math.PI * 2); ctx.fill();
  // Floats.
  ctx.fillStyle = '#fff3d6';
  ctx.beginPath(); ctx.roundRect(-18, 38, 56, 10, 5); ctx.fill();
  ctx.beginPath(); ctx.roundRect(-30, 34, 30, 8, 4); ctx.fill();
  ctx.strokeStyle = '#c98a5a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-6, 18); ctx.lineTo(-2, 38); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(26, 16); ctx.lineTo(30, 38); ctx.stroke();
  // Propeller: a translucent spinning blur disc, never a solid bar.
  // Two faint blades at propAngle inside a light-grey disc, so the
  // nose reads as a spinning prop, not a stick across the plane.
  ctx.save();
  ctx.translate(72, -2);
  ctx.fillStyle = 'rgba(235,242,248,0.30)';
  ctx.beginPath(); ctx.ellipse(0, 0, 13, 46, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, 13, 46, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.rotate(propAngle);
  ctx.fillStyle = 'rgba(90,70,55,0.28)';
  ctx.beginPath(); ctx.roundRect(-3, -42, 6, 84, 3); ctx.fill();
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = 'rgba(90,70,55,0.18)';
  ctx.beginPath(); ctx.roundRect(-2.5, -40, 5, 80, 2.5); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#d93b2b'; ctx.beginPath(); ctx.arc(72, -2, 7, 0, Math.PI * 2); ctx.fill();
  // Damage smoke puffs when hurt.
  if (damaged) {
    ctx.fillStyle = 'rgba(80,80,80,0.55)';
    ctx.beginPath(); ctx.arc(-30, -26, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-44, -34, 6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
