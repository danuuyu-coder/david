window.SFX = (() => {
  const KEY = 'david20.mute';
  let ctx = null;
  let master = null;
  let muted = localStorage.getItem(KEY) === '1';

  function ac() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(comp).connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ---------- Свои файлы из config.sounds ---------- */
  const files = {};
  Object.entries((window.GIFT_CONFIG && window.GIFT_CONFIG.sounds) || {}).forEach(([name, src]) => {
    const a = new Audio(src);
    a.preload = 'auto';
    a.addEventListener('error', () => delete files[name]);
    files[name] = a;
  });
  const fromFile = (name) => {
    const a = files[name];
    if (!a || muted) return false;
    const c = a.cloneNode();
    c.volume = 0.8;
    c.play().catch(() => {});
    return true;
  };

  /* ---------- Синтез ---------- */
  function tone(freq, dur = 0.12, type = 'square', vol = 0.06, when = 0, slideTo = null, attack = 0.005) {
    if (muted) return;
    const c = ac();
    const t = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function noise(dur = 0.2, vol = 0.15, when = 0, { type = 'lowpass', freq = 1200, to = null, q = 1 } = {}) {
    if (muted) return;
    const c = ac();
    const t = c.currentTime + when;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t);
  }

  function brass(freq, dur, when = 0, vol = 0.07) {
    if (muted) return;
    const c = ac();
    const t = c.currentTime + when;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(500, t);
    f.frequency.exponentialRampToValueAtTime(2600, t + 0.08);
    f.frequency.exponentialRampToValueAtTime(1200, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.04);
    g.gain.setValueAtTime(vol, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    [0, 7, -6].forEach((detune) => {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq;
      o.detune.value = detune;
      o.connect(f);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
    f.connect(g).connect(master);
  }

  const metal = (base, dur = 1.4, vol = 0.07, when = 0) =>
    [1, 2.76, 5.4, 8.93].forEach((m, i) => tone(base * m, dur / (i * 0.6 + 1), 'sine', vol / (i + 1), when, null, 0.002));

  const chord = (freqs, dur, when, vol) => freqs.forEach((f) => brass(f, dur, when, vol));

  const NOTES = [330, 392, 440, 523, 587, 659];

  const fx = {
    click: () => tone(520, 0.05, 'square', 0.035),
    tick: () => tone(1200, 0.03, 'square', 0.02),
    good: () => { tone(660, 0.1, 'square', 0.045); tone(990, 0.16, 'square', 0.045, 0.08); metal(1320, 0.5, 0.03, 0.08); },
    bad: () => { tone(220, 0.3, 'sawtooth', 0.05, 0, 80); noise(0.15, 0.05, 0, { freq: 600 }); },
    hit: () => { noise(0.08, 0.2, 0, { freq: 1400 }); tone(140, 0.12, 'sine', 0.22, 0, 50); },
    note: (i) => { tone(NOTES[i % NOTES.length], 0.5, 'triangle', 0.14); tone(NOTES[i % NOTES.length] * 2, 0.4, 'sine', 0.04); },
    swoosh: () => noise(0.35, 0.18, 0, { type: 'bandpass', freq: 400, to: 3500, q: 1.5 }),

    repulsor: () => fromFile('repulsor') || (
      tone(260, 0.12, 'sine', 0.1, 0, 1400),
      tone(1400, 0.35, 'sawtooth', 0.05, 0.12, 700),
      noise(0.4, 0.22, 0.1, { type: 'bandpass', freq: 3000, to: 800, q: 2 })
    ),
    thunder: () => fromFile('thunder') || (
      noise(0.06, 0.5, 0, { type: 'highpass', freq: 2500 }),
      noise(1.6, 0.45, 0.03, { freq: 900, to: 120 }),
      tone(70, 1.2, 'sawtooth', 0.12, 0.03, 35),
      [0.18, 0.31, 0.5].forEach((w) => noise(0.05, 0.25, w, { type: 'highpass', freq: 3000 }))
    ),
    shield: () => fromFile('shield') || (noise(0.05, 0.35, 0, { type: 'highpass', freq: 2000 }), metal(640, 1.6, 0.09)),
    portal: () => fromFile('portal') || (
      noise(1, 0.25, 0, { type: 'bandpass', freq: 200, to: 2600, q: 5 }),
      [0, 0.12, 0.24, 0.36].forEach((w, i) => tone(880 + i * 220, 0.5, 'sine', 0.035, w))
    ),
    glitch: () => { for (let i = 0; i < 9; i++) tone(200 + Math.random() * 1600, 0.04, 'square', 0.04, i * 0.035); noise(0.3, 0.12, 0, { type: 'bandpass', freq: 1500, q: 8 }); },
    timeWarp: () => { tone(1400, 0.7, 'triangle', 0.08, 0, 180); [0, 0.15, 0.3, 0.45].forEach((w) => tone(1800, 0.03, 'square', 0.03, w)); },
    chime: () => [880, 1320, 1760, 2640].forEach((f, i) => tone(f, 1.2, 'sine', 0.06, i * 0.07)),
    charge: () => { tone(70, 0.9, 'sawtooth', 0.08, 0, 260); noise(0.9, 0.1, 0, { freq: 200, to: 1800 }); },
    boom: () => fromFile('boom') || (noise(0.6, 0.5, 0, { freq: 700, to: 80 }), tone(90, 0.6, 'sine', 0.3, 0, 30)),
    pow: () => { noise(0.3, 0.3, 0, { freq: 900 }); tone(160, 0.3, 'triangle', 0.18, 0, 45); },
    snap: () => fromFile('snap') || (
      noise(0.03, 0.7, 0, { type: 'highpass', freq: 3500 }),
      tone(2200, 0.04, 'square', 0.05, 0, 900),
      noise(2.2, 0.1, 0.05, { type: 'bandpass', freq: 600, to: 150, q: 0.7 })
    ),
    win: () => fromFile('win') || (
      chord([262, 330, 392], 0.22, 0, 0.035),
      chord([392, 494, 587], 0.22, 0.22, 0.035),
      chord([523, 659, 784], 0.7, 0.44, 0.04),
      metal(1046, 1.2, 0.04, 0.44)
    ),
    fanfare: () => fromFile('fanfare') || (
      [[196, 0], [262, 0.16], [330, 0.32], [392, 0.48]].forEach(([f, w]) => brass(f, 0.18, w, 0.06)),
      chord([392, 494, 587], 0.3, 0.7, 0.04),
      chord([349, 440, 523], 0.3, 1.0, 0.04),
      chord([523, 659, 784, 1046], 1.4, 1.3, 0.045),
      tone(65, 1.6, 'sine', 0.25, 1.3),
      noise(1.2, 0.14, 1.3, { type: 'highpass', freq: 5000 })
    ),
  };

  return {
    ...fx,
    ability(id) {
      ({ space: fx.portal, mind: fx.repulsor, reality: fx.glitch, time: fx.timeWarp, power: fx.thunder, soul: fx.chime }[id] || fx.pow)();
    },
    get muted() { return muted; },
    toggle() {
      muted = !muted;
      localStorage.setItem(KEY, muted ? '1' : '0');
      return muted;
    },
    unlock() { if (!muted) ac(); },
  };
})();
