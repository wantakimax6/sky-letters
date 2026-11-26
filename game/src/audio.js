// Sky Letters — all sound is synthesised with WebAudio; no audio files.
// Engine hum (two detuned oscillators through a low-pass), wind noise,
// a ring chime, a short letter-delivered melody and a soft landing thud.
export class SkyAudio {
  constructor() {
    this.ctx = null; this.muted = false; this.engine = null; this.wind = null;
    this.master = null;
  }
  ensure() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
    const osc1 = this.ctx.createOscillator(); osc1.type = 'sawtooth'; osc1.frequency.value = 58;
    const osc2 = this.ctx.createOscillator(); osc2.type = 'triangle'; osc2.frequency.value = 116;
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320;
    const g = this.ctx.createGain(); g.gain.value = 0.0;
    osc1.connect(lp); osc2.connect(lp); lp.connect(g); g.connect(this.master);
    osc1.start(); osc2.start();
    const len = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
    const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 480; bp.Q.value = 0.6;
    const wg = this.ctx.createGain(); wg.gain.value = 0.0;
    noise.connect(bp); bp.connect(wg); wg.connect(this.master); noise.start();
    this.engine = { osc1, osc2, gain: g }; this.wind = { gain: wg, filter: bp };
  }
  setEngine(throttle, speed, flying) {
    if (!this.ctx || !this.engine || this.muted) return;
    const t = this.ctx.currentTime;
    this.engine.gain.gain.setTargetAtTime(flying ? 0.05 + throttle * 0.09 : 0.0, t, 0.1);
    this.engine.osc1.frequency.setTargetAtTime(52 + throttle * 46, t, 0.1);
    this.engine.osc2.frequency.setTargetAtTime(104 + throttle * 92, t, 0.1);
    this.wind.gain.gain.setTargetAtTime(flying ? Math.min(0.12, speed / 1100) : 0, t, 0.2);
  }
  tone(freq, dur, type, vol, when = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator(); o.type = type || 'sine'; o.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
  }
  chime() { this.tone(880, 0.5, 'sine', 0.18); this.tone(1318, 0.7, 'sine', 0.12, 0.08); }
  deliveredMelody() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((n, i) => this.tone(n, 0.45, 'triangle', 0.15, i * 0.13));
  }
  thud() { this.tone(70, 0.35, 'sine', 0.3); this.tone(48, 0.4, 'sine', 0.22, 0.05); }
  toggleMute() { this.muted = !this.muted; if (this.master) this.master.gain.value = this.muted ? 0 : 0.5; return this.muted; }
}
