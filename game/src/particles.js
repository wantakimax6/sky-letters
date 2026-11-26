// Sky Letters — particles: cloud puffs, flower petals, letter sparkles,
// splash, smoke and rain. Screen-space, pooled, no allocation per frame
// after boot; the renderer asks for bursts and the system steps them.
export function createParticles() {
  const list = [];
  for (let i = 0; i < 220; i += 1) list.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 4, kind: 'puff', color: '#fff' });
  function spawn(kind, x, y, vx, vy, life, size, color) {
    for (const p of list) {
      if (p.active) continue;
      p.active = true; p.kind = kind; p.x = x; p.y = y; p.vx = vx; p.vy = vy;
      p.life = life; p.max = life; p.size = size; p.color = color;
      return;
    }
  }
  return {
    burst(kind, x, y, n, color) {
      for (let i = 0; i < n; i += 1) {
        const a = Math.random() * Math.PI * 2, sp = 20 + Math.random() * 90;
        spawn(kind, x, y, Math.cos(a) * sp, Math.sin(a) * sp - 30, 0.7 + Math.random() * 0.9, 3 + Math.random() * 6, color);
      }
    },
    petals(x, y, n) {
      for (let i = 0; i < n; i += 1) {
        spawn('petal', x + (Math.random() - 0.5) * 300, y - Math.random() * 60,
          (Math.random() - 0.5) * 30, 18 + Math.random() * 26, 2.5 + Math.random() * 2,
          4 + Math.random() * 4, Math.random() < 0.5 ? '#ffb7c9' : '#fff3d6');
      }
    },
    splash(x, y) { this.burst('splash', x, y, 26, '#bfe8f2'); },
    smoke(x, y) { this.burst('smoke', x, y, 18, '#8a8a8a'); },
    step(dt) {
      for (const p of list) {
        if (!p.active) continue;
        p.life -= dt;
        if (p.life <= 0) { p.active = false; continue; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.kind === 'petal') { p.vx += Math.sin(p.life * 6) * 12 * dt; p.vy *= 0.995; }
        if (p.kind === 'smoke') { p.vy -= 26 * dt; p.size += 14 * dt; }
        if (p.kind === 'splash') { p.vy += 160 * dt; }
      }
    },
    draw(ctx) {
      for (const p of list) {
        if (!p.active) continue;
        const a = Math.max(0, p.life / p.max);
        ctx.save(); ctx.globalAlpha = a * 0.9; ctx.fillStyle = p.color;
        if (p.kind === 'petal') {
          ctx.translate(p.x, p.y); ctx.rotate(p.life * 3);
          ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.kind === 'smoke' ? 1.4 : 1), 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
    },
    drawRain(ctx, strength, time) {
      if (strength <= 0) return;
      ctx.save(); ctx.strokeStyle = 'rgba(200,220,255,0.5)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 70 * strength; i += 1) {
        const x = ((i * 173 + time * 420) % 1400) - 60;
        const y = ((i * 269 + time * 900) % 800) - 40;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 18); ctx.stroke();
      }
      ctx.restore();
    },
  };
}
