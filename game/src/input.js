// Sky Letters — keyboard and mouse input. Arrows/WASD pitch and bank,
// W/S or Shift/Ctrl throttle, Space flaps/brake, P pause, M mute,
// R restart, Enter start/continue. Mouse steer: hold and drag sideways.
export class SkyInput {
  constructor(canvas) {
    this.keys = new Set();
    this.mouseX = null; this.mouseDown = false;
    this.pressed = new Set();
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.key.toLowerCase());
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => { this.keys.clear(); this.mouseDown = false; });
    canvas.addEventListener('pointerdown', (e) => { this.mouseDown = true; this.mouseX = e.clientX; });
    window.addEventListener('pointerup', () => { this.mouseDown = false; this.mouseX = null; });
    window.addEventListener('pointermove', (e) => { if (this.mouseDown) this.mouseX = e.clientX; });
  }
  down(...names) { return names.some((n) => this.keys.has(n)); }
  wasPressed(name) { return this.pressed.has(name); }
  endFrame() { this.pressed.clear(); }
  pitch() {
    let p = 0;
    if (this.down('arrowup')) p += 1;
    if (this.down('arrowdown')) p -= 1;
    return p;
  }
  roll() {
    let r = 0;
    if (this.down('arrowleft', 'a')) r -= 1;
    if (this.down('arrowright', 'd')) r += 1;
    return r;
  }
  throttleDelta() {
    let d = 0;
    if (this.down('shift')) d += 1;
    if (this.down('control')) d -= 1;
    return d;
  }
  brake() { return this.down(' '); }
  mouseSteer(canvasWidth) {
    if (!this.mouseDown || this.mouseX === null) return 0;
    return Math.max(-1, Math.min(1, (this.mouseX / canvasWidth - 0.5) * 2.4));
  }
}
