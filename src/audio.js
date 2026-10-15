/**
 * @fileoverview Complete Procedural Audio System for Fuga Magnética: A Queda do Cientista
 * 100% synthesized in real-time via Web Audio API - ZERO external audio files.
 * 
 * Features:
 * - FluidCleb Interactive Official Audio Brand Sequence (Intro, Fusion, Eject)
 * - Master, SFX, and BGM volume controls with smooth ramping
 * - CrazyGames SDK v3 audio compliance (automatic ad muting & unmuting)
 * - Safe user-gesture audio context unlock
 * - Comprehensive Electromagnetic & Ragdoll SFX:
 *     * Polarity switches (North, South, Neutral)
 *     * Magnetic repulsion pulse & tractor attraction
 *     * EMP Shockwave detonation with electric crackle
 *     * MagLev platform levitation glide
 *     * Ferromagnetic crate & girder metal impacts
 *     * Reinforced glass door shattering
 *     * Inverted gravity anomaly transition
 *     * Matter Stabilizer recharge & revival chords
 *     * Dimensional Portal extraction chimes
 * - Generative Sci-Fi Laboratory Ambient Drone & Sub-bass synthesizer
 */

import { storage } from './storage.js';

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;

    this.isMuted = false;
    this.isAdMuted = false;
    this.isUnlocked = false;

    // Volume values from saved storage
    const savedAudio = storage.getAudioSettings();
    this.masterVolumeVal = savedAudio.master ?? 0.85;
    this.sfxVolumeVal = savedAudio.sfx ?? 0.9;
    this.bgmVolumeVal = savedAudio.bgm ?? 0.45;
    this.isMuted = savedAudio.muted ?? false;

    // Ambient Synthesizer nodes
    this.bgmRunning = false;
    this.bgmTimer = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneLfo = null;
    this.droneFilter = null;
    this.droneGain = null;

    // Noise buffer for impacts and EMP bursts
    this._noiseBuffer = null;
  }

  /**
   * Initializes Web Audio Context on first interaction
   */
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted || this.isAdMuted ? 0 : this.masterVolumeVal, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolumeVal, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // BGM Gain
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolumeVal, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this._initNoiseBuffer();
      this.isUnlocked = true;

      // Start generative background music if unlocked
      this.startBGM();
    } catch (e) {
      console.warn('[Audio] Web Audio initialization deferred or unsupported:', e);
    }
  }

  _initNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of white noise
    this._noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this._noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // ==========================================================
  // VOLUME & MUTING (CRAZYGAMES SDK COMPLIANCE)
  // ==========================================================

  setMasterVolume(val) {
    this.masterVolumeVal = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted && !this.isAdMuted) {
      this.masterGain.gain.setTargetAtTime(this.masterVolumeVal, this.ctx.currentTime, 0.05);
    }
    storage.setAudioSettings({ master: this.masterVolumeVal });
  }

  setSFXVolume(val) {
    this.sfxVolumeVal = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolumeVal, this.ctx.currentTime, 0.05);
    }
    storage.setAudioSettings({ sfx: this.sfxVolumeVal });
  }

  setBGMVolume(val) {
    this.bgmVolumeVal = Math.max(0, Math.min(1, val));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(this.bgmVolumeVal, this.ctx.currentTime, 0.05);
    }
    storage.setAudioSettings({ bgm: this.bgmVolumeVal });
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted || this.isAdMuted ? 0 : this.masterVolumeVal;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    storage.setAudioSettings({ muted: this.isMuted });
  }

  /**
   * Called by CrazyGames bridge when an ad starts or concludes.
   * Completely silences audio context without affecting user's saved volume.
   */
  setAdMuted(adMuted) {
    this.isAdMuted = adMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted || this.isAdMuted ? 0 : this.masterVolumeVal;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.03);
    }
  }

  // ==========================================================
  // FLUIDCLEB INTERACTIVE BRAND VINHETA (0.0s a 2.8s)
  // ==========================================================

  playFluidClebIntro() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Harmonic upward sweep: 220Hz -> 660Hz with lowpass filter
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(196, t);
    osc.frequency.exponentialRampToValueAtTime(587.33, t + 0.45);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(3200, t + 0.45);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.52);
  }

  playFluidFusion() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Deep sub-resonance & shockwave pop
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(45, t + 0.35);

    subGain.gain.setValueAtTime(0.4, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(t);
    subOsc.stop(t + 0.42);

    // Crystalline chime overlay
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(880, t);
    chime.frequency.exponentialRampToValueAtTime(1760, t + 0.3);

    chimeGain.gain.setValueAtTime(0.18, t);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    chime.connect(chimeGain);
    chimeGain.connect(this.sfxGain);
    chime.start(t);
    chime.stop(t + 0.38);
  }

  playFluidEject() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // High shimmer drop: 1318Hz -> 1046Hz -> 1567Hz
    [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.15, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.45);
    });
  }

  // ==========================================================
  // GAMEPLAY SOUND EFFECTS
  // ==========================================================

  playPolaritySwitch(polarity) {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (polarity === 1) {
      // NORTH (+): High, crisp ascending pulse (660Hz -> 880Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    } else if (polarity === -1) {
      // SOUTH (-): Smooth, resonant descending pulse (523Hz -> 392Hz)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, t);
      osc.frequency.exponentialRampToValueAtTime(392, t + 0.12);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    } else {
      // NEUTRAL (0): Soft dual click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    }

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  playMagneticRepulsion() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.22);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.22);

    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  playEMPBlast() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Sub-bass detonation
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(110, t);
    sub.frequency.exponentialRampToValueAtTime(30, t + 0.45);
    subGain.gain.setValueAtTime(0.5, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(t);
    sub.stop(t + 0.55);

    // Electrical noise fizzle
    if (this._noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this._noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.exponentialRampToValueAtTime(2400, t + 0.3);
      filter.Q.value = 4;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(t);
      noise.stop(t + 0.4);
    }
  }

  playMagLevGlide() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, t);
    osc.frequency.linearRampToValueAtTime(480, t + 0.15);
    osc.frequency.linearRampToValueAtTime(280, t + 0.3);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  playGlassShatter() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // High frequency crystalline snap
    [1760, 2637, 3520, 4186].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f + (Math.random() * 200 - 100), t + i * 0.02);

      gain.gain.setValueAtTime(0.2, t + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.02 + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.02);
      osc.stop(t + i * 0.02 + 0.25);
    });

    // Impact burst
    if (this._noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this._noiseBuffer;
      const nFilter = this.ctx.createBiquadFilter();
      nFilter.type = 'highpass';
      nFilter.frequency.setValueAtTime(3200, t);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.3, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      noise.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(this.sfxGain);
      noise.start(t);
      noise.stop(t + 0.28);
    }
  }

  playMetalClank() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Metallic ring with random micro pitch variation
    const pitchMod = 0.95 + Math.random() * 0.1;
    [440, 784, 1174].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * pitchMod, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  playSwitchTrigger() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.setValueAtTime(280, t + 0.08);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  playGravityWarp() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.25);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.45);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  playPortalChime() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.2, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.55);
    });
  }

  playDamage() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.24);
  }

  playRevive() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Majestic ascending quantum chord
    [392.0, 493.88, 587.33, 783.99, 987.77].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + i * 0.07);

      gain.gain.setValueAtTime(0.24, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.65);
    });
  }

  playVictory() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);

      gain.gain.setValueAtTime(0.25, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.5);
    });
  }

  playGameOver() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const notes = [440, 415.3, 392, 349.23];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, t);

      gain.gain.setValueAtTime(0.22, t + idx * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.2 + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.2);
      osc.stop(t + idx * 0.2 + 0.4);
    });
  }

  playUIClick() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(920 + Math.random() * 80, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // ==========================================================
  // PROCEDURAL SCI-FI BACKGROUND MUSIC (BGM)
  // ==========================================================

  startBGM() {
    if (this.bgmRunning || !this.ctx || !this.bgmGain) return;
    this.bgmRunning = true;

    try {
      const t = this.ctx.currentTime;

      // Resonant Lowpass Filter for Dark Sci-Fi Ambience
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(380, t);
      this.droneFilter.Q.value = 3.5;

      // Main Drone Oscillator (Root: C2 = 65.41 Hz)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sawtooth';
      this.droneOsc1.frequency.setValueAtTime(65.41, t);

      // Sub-Fifth Drone Oscillator (G1 = 49.0 Hz)
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(49.0, t);

      // Slow LFO for filter breathing (0.15 Hz)
      this.droneLfo = this.ctx.createOscillator();
      this.droneLfo.frequency.setValueAtTime(0.15, t);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(140, t);
      this.droneLfo.connect(lfoGain);
      lfoGain.connect(this.droneFilter.frequency);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.16, t);

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.bgmGain);

      this.droneOsc1.start(t);
      this.droneOsc2.start(t);
      this.droneLfo.start(t);

      // Generative Sub-synth Arpeggiator loop
      this._scheduleArpNotes();
    } catch (e) {
      console.warn('[Audio] Error starting procedural BGM:', e);
    }
  }

  _scheduleArpNotes() {
    if (!this.bgmRunning) return;
    const notes = [130.81, 155.56, 174.61, 196.0, 233.08]; // C minor pentatonic
    const note = notes[Math.floor(Math.random() * notes.length)];

    if (this.ctx && this.bgmGain && !this.isMuted && !this.isAdMuted) {
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(t);
        osc.stop(t + 1.25);
      } catch (e) {}
    }

    const nextDelay = 1200 + Math.random() * 1600;
    this.bgmTimer = setTimeout(() => this._scheduleArpNotes(), nextDelay);
  }

  stopBGM() {
    this.bgmRunning = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    try {
      if (this.droneOsc1) { this.droneOsc1.stop(); this.droneOsc1.disconnect(); }
      if (this.droneOsc2) { this.droneOsc2.stop(); this.droneOsc2.disconnect(); }
      if (this.droneLfo) { this.droneLfo.stop(); this.droneLfo.disconnect(); }
    } catch (e) {}
  }
}

export const sound = new SoundSystem();
