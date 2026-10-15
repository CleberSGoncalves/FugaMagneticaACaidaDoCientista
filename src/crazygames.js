/**
 * @fileoverview CrazyGames SDK v3 Integration Bridge for Fuga Magnética: A Queda do Cientista
 * Complies with CrazyGames publishing guidelines:
 * - Proper gameplayStart / gameplayStop lifecycle management
 * - Rewarded Ads: Mandatory audio muting and gameplay pause
 * - Rewarded Ad 1: Revive 1x per attempt with Matter Stabilizer + 3s invulnerability
 * - Rewarded Ad 2: Double Energy Cores on chamber victory
 * - Midgame Ads: 180s - 240s cooldown, strictly during logical breaks (victory/game over)
 * - Never award rewards on adError or AdBlocker dismissal
 * - Robust mock mode for local testing without the live SDK
 */

export class CrazyGamesBridge {
  constructor() {
    this.sdk = null;
    this.isInitialized = false;
    this.hasAdblock = false;
    this.inGameplay = false;
    this.lastMidgameTime = performance.now();
    this.levelsCompletedSinceLastAd = 0;
    this.onAdPauseCallback = null;
    this.onAdResumeCallback = null;
  }

  /**
   * Registers global pause and resume callbacks to freeze game physics and mute audio during ads.
   * @param {() => void} onPause
   * @param {() => void} onResume
   */
  setAdCallbacks(onPause, onResume) {
    this.onAdPauseCallback = onPause;
    this.onAdResumeCallback = onResume;
  }

  /**
   * Initializes the CrazyGames SDK v3.
   * Handles SDK presence, asynchronous initialization, and AdBlocker detection.
   * @returns {Promise<boolean>}
   */
  async init() {
    if (this.isInitialized) return true;

    try {
      if (typeof window !== 'undefined' && window.CrazyGames && window.CrazyGames.SDK) {
        this.sdk = window.CrazyGames.SDK;
        if (typeof this.sdk.init === 'function') {
          await this.sdk.init();
        }
        this.isInitialized = true;
        this.hasAdblock = false;
        console.log('[CrazyGames] SDK v3 initialized successfully.');
        return true;
      } else {
        console.warn('[CrazyGames] SDK v3 not detected in window (Local dev / fallback mode active).');
        this.isInitialized = false;
        return false;
      }
    } catch (err) {
      console.warn('[CrazyGames] SDK v3 initialization failed (likely AdBlock active):', err);
      this.hasAdblock = true;
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Notifies CrazyGames that active gameplay has started.
   * Must be called when user enters active physics simulation.
   */
  gameplayStart() {
    if (this.inGameplay) return;
    this.inGameplay = true;
    try {
      if (this.sdk && this.sdk.game && typeof this.sdk.game.gameplayStart === 'function') {
        this.sdk.game.gameplayStart();
        console.log('[CrazyGames] Event gameplayStart dispatched.');
      }
    } catch (err) {
      console.debug('[CrazyGames] Error triggering gameplayStart:', err);
    }
  }

  /**
   * Notifies CrazyGames that active gameplay has stopped.
   * Must be called when opening menus, modals, level select, pause, victory, or game over.
   */
  gameplayStop() {
    if (!this.inGameplay) return;
    this.inGameplay = false;
    try {
      if (this.sdk && this.sdk.game && typeof this.sdk.game.gameplayStop === 'function') {
        this.sdk.game.gameplayStop();
        console.log('[CrazyGames] Event gameplayStop dispatched.');
      }
    } catch (err) {
      console.debug('[CrazyGames] Error triggering gameplayStop:', err);
    }
  }

  /**
   * Notifies CrazyGames of a celebratory milestone (e.g. chamber cleared, high score).
   */
  happyTime() {
    try {
      if (this.sdk && this.sdk.game && typeof this.sdk.game.happytime === 'function') {
        this.sdk.game.happytime();
      } else if (this.sdk && this.sdk.game && typeof this.sdk.game.happyTime === 'function') {
        this.sdk.game.happyTime();
      }
    } catch (err) {
      console.debug('[CrazyGames] Error triggering happyTime:', err);
    }
  }

  /**
   * Requests a Rewarded Ad (video ad with player-opted reward).
   * Strict CrazyGames guidelines:
   * - Must freeze gameplay and mute audio before ad opens
   * - Must resume gameplay and restore audio when finished or errored
   * - MUST NEVER award the reward on error or AdBlock dismissal
   *
   * @param {'revive' | 'double_cores'} rewardType - Type of reward requested
   * @param {() => void} onRewarded - Invoked ONLY if the video is watched completely
   * @param {(error?: any) => void} [onError] - Invoked if closed early, blocked, or failed
   */
  async requestRewardedAd(rewardType, onRewarded, onError) {
    console.log(`[CrazyGames] Requesting Rewarded Ad for: ${rewardType}`);

    // Pause physics and mute audio before ad begins
    if (this.onAdPauseCallback) this.onAdPauseCallback();
    this.gameplayStop();

    if (this.sdk && this.sdk.ad && typeof this.sdk.ad.requestAd === 'function') {
      try {
        await this.sdk.ad.requestAd('rewarded', {
          adStarted: () => {
            console.log('[CrazyGames] Rewarded Ad started.');
            if (this.onAdPauseCallback) this.onAdPauseCallback();
          },
          adFinished: () => {
            console.log('[CrazyGames] Rewarded Ad finished successfully.');
            if (this.onAdResumeCallback) this.onAdResumeCallback();
            if (onRewarded) onRewarded();
          },
          adError: (err) => {
            console.warn('[CrazyGames] Rewarded Ad error / blocked by AdBlock:', err);
            // STRICT CRAZYGAMES RULE: Never give reward on error or AdBlock!
            if (this.onAdResumeCallback) this.onAdResumeCallback();
            if (onError) onError(err);
          }
        });
      } catch (err) {
        console.warn('[CrazyGames] Exception requesting Rewarded Ad:', err);
        if (this.onAdResumeCallback) this.onAdResumeCallback();
        if (onError) onError(err);
      }
    } else {
      // Mock mode for local dev environment
      console.log('[CrazyGames MOCK] Dev environment without SDK. Simulating Rewarded Ad prompt...');
      const userApproved = typeof window !== 'undefined' && typeof window.confirm === 'function'
        ? window.confirm(`[CrazyGames Mock Mode]\nRewarded Ad requested: "${rewardType}".\n\nSimulate complete ad watch to grant reward?`)
        : true;

      if (this.onAdResumeCallback) this.onAdResumeCallback();
      if (userApproved) {
        if (onRewarded) onRewarded();
      } else {
        if (onError) onError('ad_dismissed');
      }
    }
  }

  /**
   * Requests a Midgame Ad (interstitial video ad).
   * Guidelines:
   * - Triggered only during logical pauses (between chambers, victory/failure screens)
   * - Never during active gameplay
   * - Cooldown of 180 seconds OR at least 3 levels completed
   *
   * @param {() => void} [onComplete] - Invoked after ad concludes or immediately if on cooldown
   */
  async requestMidgameAd(onComplete) {
    const now = performance.now();
    const elapsedSec = (now - this.lastMidgameTime) / 1000;
    const cooldownMet = elapsedSec >= 180 || this.levelsCompletedSinceLastAd >= 3;

    if (!cooldownMet) {
      console.log(`[CrazyGames] Midgame Ad skipped (cooldown: ${Math.round(elapsedSec)}s / levels: ${this.levelsCompletedSinceLastAd}).`);
      if (onComplete) onComplete();
      return;
    }

    console.log('[CrazyGames] Requesting Midgame Ad at logical pause point...');
    if (this.onAdPauseCallback) this.onAdPauseCallback();
    this.gameplayStop();

    if (this.sdk && this.sdk.ad && typeof this.sdk.ad.requestAd === 'function') {
      try {
        await this.sdk.ad.requestAd('midgame', {
          adStarted: () => {
            console.log('[CrazyGames] Midgame Ad started.');
            if (this.onAdPauseCallback) this.onAdPauseCallback();
          },
          adFinished: () => {
            console.log('[CrazyGames] Midgame Ad finished.');
            this.lastMidgameTime = performance.now();
            this.levelsCompletedSinceLastAd = 0;
            if (this.onAdResumeCallback) this.onAdResumeCallback();
            if (onComplete) onComplete();
          },
          adError: (err) => {
            console.warn('[CrazyGames] Midgame Ad error:', err);
            this.lastMidgameTime = performance.now();
            if (this.onAdResumeCallback) this.onAdResumeCallback();
            if (onComplete) onComplete();
          }
        });
      } catch (err) {
        console.warn('[CrazyGames] Exception in Midgame Ad:', err);
        if (this.onAdResumeCallback) this.onAdResumeCallback();
        if (onComplete) onComplete();
      }
    } else {
      console.log('[CrazyGames MOCK] Dev mode Midgame Ad simulated.');
      this.lastMidgameTime = performance.now();
      this.levelsCompletedSinceLastAd = 0;
      if (this.onAdResumeCallback) this.onAdResumeCallback();
      if (onComplete) onComplete();
    }
  }

  notifyLevelCompleted() {
    this.levelsCompletedSinceLastAd++;
  }
}

export const crazyGames = new CrazyGamesBridge();
