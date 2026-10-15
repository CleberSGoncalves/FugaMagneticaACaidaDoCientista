/**
 * @fileoverview Safe LocalStorage Persistence for Fuga Magnética: A Queda do Cientista
 * Manages level progress, stars, energy cores, high score, and player preferences with integrity checks.
 */

const STORAGE_KEY = 'fuga_magnetica_save_v1';

class StorageManager {
  constructor() {
    this.data = this.load();
  }

  getDefaultData() {
    return {
      version: 1,
      unlockedLevel: 1,
      levelStars: {},       // { [levelId]: number (1-3) }
      levelHighScores: {},  // { [levelId]: number }
      totalEnergyCores: 0,
      totalScore: 0,
      audio: {
        master: 0.85,
        sfx: 0.9,
        bgm: 0.45,
        muted: false
      },
      preferences: {
        showTrajectory: true,
        screenShake: true
      }
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.getDefaultData();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return this.getDefaultData();

      // Deep merge with defaults to ensure all keys exist
      const defaults = this.getDefaultData();
      return {
        ...defaults,
        ...parsed,
        audio: { ...defaults.audio, ...(parsed.audio || {}) },
        preferences: { ...defaults.preferences, ...(parsed.preferences || {}) },
        levelStars: parsed.levelStars || {},
        levelHighScores: parsed.levelHighScores || {}
      };
    } catch (err) {
      console.warn('[Storage] Error reading save, reverting to defaults:', err);
      return this.getDefaultData();
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.error('[Storage] Error persisting save to localStorage:', err);
    }
  }

  getUnlockedLevel() {
    return Math.max(1, this.data.unlockedLevel || 1);
  }

  unlockLevel(levelId) {
    if (levelId > this.data.unlockedLevel) {
      this.data.unlockedLevel = levelId;
      this.save();
    }
  }

  getLevelStars(levelId) {
    return this.data.levelStars[levelId] || 0;
  }

  setLevelStars(levelId, stars) {
    const prev = this.data.levelStars[levelId] || 0;
    if (stars > prev) {
      this.data.levelStars[levelId] = Math.min(3, Math.max(1, stars));
      this.save();
    }
  }

  recordLevelScore(levelId, score) {
    const prev = this.data.levelHighScores[levelId] || 0;
    if (score > prev) {
      this.data.levelHighScores[levelId] = score;
    }
    this.data.totalScore = Object.values(this.data.levelHighScores).reduce((a, b) => a + b, 0);
    this.save();
  }

  addEnergyCores(amount) {
    this.data.totalEnergyCores = Math.max(0, (this.data.totalEnergyCores || 0) + amount);
    this.save();
  }

  getTotalEnergyCores() {
    return this.data.totalEnergyCores || 0;
  }

  getTotalStars() {
    return Object.values(this.data.levelStars).reduce((sum, s) => sum + s, 0);
  }

  getAudioSettings() {
    return { ...this.data.audio };
  }

  setAudioSettings(settings) {
    this.data.audio = { ...this.data.audio, ...settings };
    this.save();
  }

  getPreferences() {
    return { ...this.data.preferences };
  }

  setPreferences(prefs) {
    this.data.preferences = { ...this.data.preferences, ...prefs };
    this.save();
  }
}

export const storage = new StorageManager();
