/**
 * @fileoverview Complete HUD and Modal UI System for Fuga Magnética: A Queda do Cientista
 * Orchestrates HUD indicators, polarity selectors, stabilizer bar, mobile touch buttons,
 * and CrazyGames v3 compliant rewarded ad modals.
 */

import { i18n } from './i18n.js';
import { sound } from './audio.js';
import { storage } from './storage.js';
import { crazyGames } from './crazygames.js';
import { LEVELS } from './levels.js';

export class GameHUD {
  constructor(containerOrOptions, maybeCallbacks) {
    if (containerOrOptions && (containerOrOptions instanceof HTMLElement || containerOrOptions.nodeType === 1)) {
      this.container = containerOrOptions;
      this.cb = maybeCallbacks || {};
    } else if (containerOrOptions && typeof containerOrOptions === 'object') {
      this.container = containerOrOptions.container || document.getElementById('game-stage') || document.body;
      this.cb = containerOrOptions;
    } else {
      this.container = document.getElementById('game-stage') || document.body;
      this.cb = maybeCallbacks || {};
    }

    this.activeModal = null;
    this.currentLevel = LEVELS[0];
    this.timer = 0;
    this.score = 0;
    this.cohesion = 100;
    this.polarity = 0;
    this.coresCollected = 0;
    this.totalCores = 0;

    this.initDOM();
    this.unsubscribeI18n = i18n.subscribe(() => this.updateText());
  }

  initDOM() {
    this.root = document.createElement('div');
    this.root.id = 'hud-root';
    this.root.style.position = 'absolute';
    this.root.style.inset = '0';
    this.root.style.pointerEvents = 'none';
    this.root.style.zIndex = '100';

    this.root.innerHTML = `
      <!-- Top Navigation & Status Bar -->
      <div id="hud-top">
        <div class="hud-group">
          <div class="hud-card">
            <span class="hud-label" data-i18n="hud_level">CHAMBER</span>
            <span class="hud-val" id="hud-val-level">01</span>
          </div>
          <div class="hud-card" style="display:none;" id="hud-sector-card">
            <span class="hud-label" data-i18n="hud_sector">SECTOR</span>
            <span class="hud-val" id="hud-val-sector" style="font-size:14px; color:#38bdf8;">Vault</span>
          </div>
          <div class="hud-card">
            <span class="hud-label">⚡</span>
            <span class="hud-val" id="hud-val-cores">0 / 0</span>
          </div>
        </div>

        <div class="hud-group">
          <div class="hud-card">
            <span class="hud-label" data-i18n="hud_time">TIME</span>
            <span class="hud-val" id="hud-val-time">00:00</span>
          </div>
          <button class="hud-btn" id="btn-pause" title="Pause">⏸</button>
          <button class="hud-btn" id="btn-levels" title="Chambers Archive">🗂</button>
          <button class="hud-btn" id="btn-settings" title="Settings">⚙️</button>
        </div>
      </div>

      <!-- Floating Hint Toast -->
      <div id="hint-toast" style="display: none;"></div>

      <!-- Bottom Status & Controls Bar -->
      <div id="hud-bottom">
        <!-- Matter Stabilizer Health Widget -->
        <div class="stabilizer-widget">
          <div class="stabilizer-header">
            <span class="hud-label" data-i18n="hud_stabilizer">MATTER STABILIZER</span>
            <span class="hud-val" id="hud-val-cohesion" style="font-size:14px;">100%</span>
          </div>
          <div class="stabilizer-bar-track">
            <div class="stabilizer-bar-fill" id="stabilizer-bar-fill"></div>
          </div>
        </div>

        <!-- Dynamic Polarity Selection Dock -->
        <div class="polarity-dock">
          <button class="polarity-btn north" id="btn-pol-north" title="Q: North (+)">
            + <span data-i18n="polarity_north">NORTH</span>
          </button>
          <button class="polarity-btn neutral active" id="btn-pol-neutral" title="Space: Neutral">
            0 <span data-i18n="polarity_neutral">NEUTRAL</span>
          </button>
          <button class="polarity-btn south" id="btn-pol-south" title="E: South (-)">
            - <span data-i18n="polarity_south">SOUTH</span>
          </button>
        </div>
      </div>

      <!-- Mobile Touch Controls Overlay -->
      <div id="mobile-controls">
        <div class="mobile-action-bar">
          <button class="mobile-emp-btn" id="btn-mobile-emp">
            EMP
          </button>
        </div>
      </div>
    `;

    this.container.appendChild(this.root);
    this.bindEvents();
    this.updateText();
  }

  bindEvents() {
    const btnPause = this.root.querySelector('#btn-pause');
    const btnLevels = this.root.querySelector('#btn-levels');
    const btnSettings = this.root.querySelector('#btn-settings');

    btnPause?.addEventListener('click', () => {
      sound.playUIClick();
      if (this.cb.onPause) this.cb.onPause();
      this.showPauseModal();
    });

    btnLevels?.addEventListener('click', () => {
      sound.playUIClick();
      if (this.cb.onPause) this.cb.onPause();
      this.showLevelSelectModal();
    });

    btnSettings?.addEventListener('click', () => {
      sound.playUIClick();
      if (this.cb.onPause) this.cb.onPause();
      this.showSettingsModal();
    });

    // Polarity Buttons
    const btnNorth = this.root.querySelector('#btn-pol-north');
    const btnSouth = this.root.querySelector('#btn-pol-south');
    const btnNeutral = this.root.querySelector('#btn-pol-neutral');

    btnNorth?.addEventListener('click', () => {
      if (this.cb.onSetPolarity) this.cb.onSetPolarity(1);
    });
    btnSouth?.addEventListener('click', () => {
      if (this.cb.onSetPolarity) this.cb.onSetPolarity(-1);
    });
    btnNeutral?.addEventListener('click', () => {
      if (this.cb.onSetPolarity) this.cb.onSetPolarity(0);
    });

    // Mobile EMP Button
    const btnMobileEmp = this.root.querySelector('#btn-mobile-emp');
    btnMobileEmp?.addEventListener('click', () => {
      if (this.cb.onTriggerEMP) this.cb.onTriggerEMP();
    });
  }

  updateLevel(level) {
    this.currentLevel = level;
    const lvlEl = this.root.querySelector('#hud-val-level');
    const sectorEl = this.root.querySelector('#hud-val-sector');
    if (lvlEl) lvlEl.textContent = String(level.id).padStart(2, '0');
    if (sectorEl) {
      sectorEl.textContent = i18n.getLanguage() === 'pt' ? level.sectorPt : level.sectorEn;
    }
    this.showHint(i18n.getLanguage() === 'pt' ? level.hintPt : level.hintEn);
  }

  showHint(text) {
    const toast = this.root.querySelector('#hint-toast');
    if (!toast || !text) return;
    toast.textContent = text;
    toast.style.display = 'block';
    toast.style.opacity = '1';

    if (this._hintTimeout) clearTimeout(this._hintTimeout);
    this._hintTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 6000);
  }

  updateStatus(cohesion, polarity, coresCollected, totalCores, time) {
    this.cohesion = cohesion;
    this.polarity = polarity;
    this.coresCollected = coresCollected;
    this.totalCores = totalCores;
    this.timer = time;

    // Cohesion Bar
    const cohVal = this.root.querySelector('#hud-val-cohesion');
    const barFill = this.root.querySelector('#stabilizer-bar-fill');
    if (cohVal) cohVal.textContent = `${Math.round(cohesion)}%`;
    if (barFill) {
      barFill.style.width = `${Math.max(0, Math.min(100, cohesion))}%`;
      if (cohesion <= 25) {
        barFill.style.background = 'linear-gradient(90deg, #ef4444, #f97316)';
        barFill.style.boxShadow = '0 0 10px #ef4444';
      } else {
        barFill.style.background = 'linear-gradient(90deg, #10b981, #00f5ff)';
        barFill.style.boxShadow = '0 0 8px #00f5ff';
      }
    }

    // Polarity Buttons Highlight
    const btnNorth = this.root.querySelector('#btn-pol-north');
    const btnSouth = this.root.querySelector('#btn-pol-south');
    const btnNeutral = this.root.querySelector('#btn-pol-neutral');

    btnNorth?.classList.toggle('active', polarity === 1);
    btnSouth?.classList.toggle('active', polarity === -1);
    btnNeutral?.classList.toggle('active', polarity === 0);

    // Cores & Time
    const coresEl = this.root.querySelector('#hud-val-cores');
    if (coresEl) coresEl.textContent = `${coresCollected} / ${totalCores}`;

    const timeEl = this.root.querySelector('#hud-val-time');
    if (timeEl) {
      const mins = Math.floor(time / 60);
      const secs = Math.floor(time % 60);
      timeEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }

  updateText() {
    const elements = this.root.querySelectorAll('[data-i18n]');
    elements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = i18n.t(key);
    });

    if (this.currentLevel) {
      const sectorEl = this.root.querySelector('#hud-val-sector');
      if (sectorEl) {
        sectorEl.textContent = i18n.getLanguage() === 'pt' ? this.currentLevel.sectorPt : this.currentLevel.sectorEn;
      }
    }
  }

  // ==========================================================
  // MODALS
  // ==========================================================

  closeModal() {
    if (this.activeModal) {
      this.activeModal.remove();
      this.activeModal = null;
    }
  }

  showPauseModal() {
    this.closeModal();
    crazyGames.gameplayStop();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <h2 class="modal-title">${i18n.t('modal_pause_title')}</h2>
        <p class="modal-subtitle">${i18n.t('game_subtitle')}</p>
        <div class="modal-btn-row">
          <button class="btn-primary" id="modal-resume">${i18n.t('modal_resume')}</button>
          <button class="btn-secondary" id="modal-restart">${i18n.t('modal_restart')}</button>
          <button class="btn-secondary" id="modal-levels">${i18n.t('modal_level_select')}</button>
          <button class="btn-secondary" id="modal-settings">${i18n.t('modal_settings')}</button>
        </div>
      </div>
    `;

    overlay.querySelector('#modal-resume')?.addEventListener('click', () => {
      sound.playUIClick();
      this.closeModal();
      crazyGames.gameplayStart();
      if (this.cb.onResume) this.cb.onResume();
    });

    overlay.querySelector('#modal-restart')?.addEventListener('click', () => {
      sound.playUIClick();
      this.closeModal();
      crazyGames.gameplayStart();
      if (this.cb.onRestart) this.cb.onRestart();
    });

    overlay.querySelector('#modal-levels')?.addEventListener('click', () => {
      sound.playUIClick();
      this.showLevelSelectModal();
    });

    overlay.querySelector('#modal-settings')?.addEventListener('click', () => {
      sound.playUIClick();
      this.showSettingsModal();
    });

    this.container.appendChild(overlay);
    this.activeModal = overlay;
  }

  showVictoryModal(levelId, completionTime, coresCollected, score) {
    this.closeModal();
    crazyGames.gameplayStop();
    crazyGames.happyTime();
    crazyGames.notifyLevelCompleted();

    const mins = Math.floor(completionTime / 60);
    const secs = Math.floor(completionTime % 60);
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    let rewardedUsed = false;
    let finalCores = coresCollected;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <h2 class="modal-title" style="color:#10b981;">${i18n.t('victory_title')}</h2>
        <p class="modal-subtitle">${i18n.t('victory_subtitle')}</p>

        <div style="background:rgba(30,41,59,0.7); padding:14px; border-radius:10px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="color:#94a3b8;">${i18n.t('victory_time')}:</span>
            <span style="color:#00f5ff; font-weight:700;">${timeFormatted}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="color:#94a3b8;">${i18n.t('victory_cores')}:</span>
            <span style="color:#fbbf24; font-weight:700;" id="victory-cores-val">⚡ ${finalCores}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#94a3b8;">${i18n.t('victory_score')}:</span>
            <span style="color:#ffffff; font-weight:700;">${score}</span>
          </div>
        </div>

        <div class="modal-btn-row">
          <button class="btn-rewarded" id="btn-double-cores">
            🎬 ${i18n.t('victory_double_cores_ad')}
          </button>
          <button class="btn-primary" id="btn-next-level">
            ${i18n.t('victory_next')}
          </button>
          <button class="btn-secondary" id="btn-retry-level">
            ${i18n.t('victory_retry')}
          </button>
        </div>
      </div>
    `;

    // Rewarded Ad 2: Double Cores
    const btnDouble = overlay.querySelector('#btn-double-cores');
    btnDouble?.addEventListener('click', () => {
      if (rewardedUsed) return;
      crazyGames.requestRewardedAd('double_cores', () => {
        rewardedUsed = true;
        finalCores *= 2;
        storage.addEnergyCores(coresCollected); // add extra batch
        sound.playRevive();
        const coreEl = overlay.querySelector('#victory-cores-val');
        if (coreEl) coreEl.textContent = `⚡ ${finalCores} (2X BONUS!)`;
        btnDouble.style.display = 'none';
      }, (err) => {
        alert(i18n.t('ad_blocked'));
      });
    });

    overlay.querySelector('#btn-next-level')?.addEventListener('click', () => {
      sound.playUIClick();
      this.closeModal();
      // Midgame ad check on chamber completion (CrazyGames SDK v3 requirement)
      crazyGames.requestMidgameAd(() => {
        crazyGames.gameplayStart();
        if (this.cb.onNextLevel) this.cb.onNextLevel();
      });
    });

    overlay.querySelector('#btn-retry-level')?.addEventListener('click', () => {
      sound.playUIClick();
      this.closeModal();
      crazyGames.gameplayStart();
      if (this.cb.onRestart) this.cb.onRestart();
    });

    this.container.appendChild(overlay);
    this.activeModal = overlay;
  }

  showGameOverModal() {
    this.closeModal();
    crazyGames.gameplayStop();

    let hasRevived = false;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <h2 class="modal-title" style="color:#ef4444;">${i18n.t('gameover_title')}</h2>
        <p class="modal-subtitle">${i18n.t('gameover_subtitle')}</p>
        <p style="font-size:12px; color:#cbd5e1; margin-bottom:16px;">
          ${i18n.t('gameover_revive_desc')}
        </p>

        <div class="modal-btn-row">
          <button class="btn-rewarded" id="btn-revive-ad">
            🎬 ${i18n.t('gameover_revive_ad')}
          </button>
          <button class="btn-secondary" id="btn-give-up">
            ${i18n.t('gameover_give_up')}
          </button>
        </div>
      </div>
    `;

    // Rewarded Ad 1: Revive with Matter Stabilizer + 3s Invulnerability
    const btnRevive = overlay.querySelector('#btn-revive-ad');
    btnRevive?.addEventListener('click', () => {
      if (hasRevived) return;
      crazyGames.requestRewardedAd('revive', () => {
        hasRevived = true;
        this.closeModal();
        crazyGames.gameplayStart();
        if (this.cb.onRevive) this.cb.onRevive();
      }, (err) => {
        alert(i18n.t('ad_blocked'));
      });
    });

    overlay.querySelector('#btn-give-up')?.addEventListener('click', () => {
      sound.playUIClick();
      this.closeModal();
      // Midgame ad check on logical game over break
      crazyGames.requestMidgameAd(() => {
        crazyGames.gameplayStart();
        if (this.cb.onRestart) this.cb.onRestart();
      });
    });

    this.container.appendChild(overlay);
    this.activeModal = overlay;
  }

  showSettingsModal() {
    this.closeModal();
    crazyGames.gameplayStop();

    const audio = storage.getAudioSettings();
    const prefs = storage.getPreferences();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content" style="max-width:480px;">
        <h2 class="modal-title">${i18n.t('settings_title')}</h2>
        
        <div style="text-align:left; display:flex; flex-direction:column; gap:14px; margin-top:16px;">
          <div>
            <label style="font-size:12px; color:#94a3b8;">${i18n.t('settings_master_vol')}</label>
            <input type="range" id="vol-master" min="0" max="1" step="0.05" value="${audio.master}" style="width:100%;">
          </div>
          <div>
            <label style="font-size:12px; color:#94a3b8;">${i18n.t('settings_sfx_vol')}</label>
            <input type="range" id="vol-sfx" min="0" max="1" step="0.05" value="${audio.sfx}" style="width:100%;">
          </div>
          <div>
            <label style="font-size:12px; color:#94a3b8;">${i18n.t('settings_bgm_vol')}</label>
            <input type="range" id="vol-bgm" min="0" max="1" step="0.05" value="${audio.bgm}" style="width:100%;">
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label style="font-size:13px; color:#e2e8f0;">${i18n.t('settings_trajectory_toggle')}</label>
            <input type="checkbox" id="check-traj" ${prefs.showTrajectory ? 'checked' : ''}>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <label style="font-size:13px; color:#e2e8f0;">${i18n.t('settings_language')}</label>
            <button class="hud-btn" id="btn-lang-toggle">${i18n.getLanguage() === 'pt' ? '🇧🇷 PT-BR' : '🇺🇸 English'}</button>
          </div>
        </div>

        <div class="modal-btn-row">
          <button class="btn-primary" id="btn-settings-close">${i18n.t('settings_close')}</button>
        </div>
      </div>
    `;

    overlay.querySelector('#vol-master')?.addEventListener('input', (e) => {
      sound.setMasterVolume(parseFloat(e.target.value));
    });
    overlay.querySelector('#vol-sfx')?.addEventListener('input', (e) => {
      sound.setSFXVolume(parseFloat(e.target.value));
    });
    overlay.querySelector('#vol-bgm')?.addEventListener('input', (e) => {
      sound.setBGMVolume(parseFloat(e.target.value));
    });
    overlay.querySelector('#check-traj')?.addEventListener('change', (e) => {
      storage.setPreferences({ showTrajectory: e.target.checked });
      if (this.cb.onPreferenceChanged) this.cb.onPreferenceChanged();
    });

    const langBtn = overlay.querySelector('#btn-lang-toggle');
    langBtn?.addEventListener('click', () => {
      i18n.toggleLanguage();
      langBtn.textContent = i18n.getLanguage() === 'pt' ? '🇧🇷 PT-BR' : '🇺🇸 English';
      this.updateText();
    });

    overlay.querySelector('#btn-settings-close')?.addEventListener('click', () => {
      sound.playUIClick();
      this.closeModal();
      crazyGames.gameplayStart();
      if (this.cb.onResume) this.cb.onResume();
    });

    this.container.appendChild(overlay);
    this.activeModal = overlay;
  }

  showLevelSelectModal() {
    this.closeModal();
    crazyGames.gameplayStop();

    const unlocked = storage.getUnlockedLevel();

    let gridHtml = '';
    LEVELS.forEach((lvl) => {
      const isLocked = lvl.id > unlocked;
      const stars = storage.getLevelStars(lvl.id);
      const starIcons = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

      gridHtml += `
        <div class="level-card ${isLocked ? 'locked' : ''}" data-lvl="${lvl.id}">
          <span class="level-num">${lvl.id}</span>
          <span class="level-stars">${isLocked ? '🔒' : starIcons}</span>
        </div>
      `;
    });

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content" style="max-width:580px;">
        <h2 class="modal-title">${i18n.t('level_select_title')}</h2>
        <p class="modal-subtitle">${i18n.t('game_subtitle')}</p>
        
        <div class="level-grid">
          ${gridHtml}
        </div>

        <div class="modal-btn-row">
          <button class="btn-secondary" id="btn-levels-close">${i18n.t('settings_close')}</button>
        </div>
      </div>
    `;

    overlay.querySelectorAll('.level-card:not(.locked)').forEach((card) => {
      card.addEventListener('click', () => {
        const id = parseInt(card.getAttribute('data-lvl'), 10);
        sound.playUIClick();
        this.closeModal();
        crazyGames.gameplayStart();
        if (this.cb.onSelectLevel) this.cb.onSelectLevel(id);
      });
    });

    overlay.querySelector('#btn-levels-close')?.addEventListener('click', () => {
      sound.playUIClick();
      this.closeModal();
      crazyGames.gameplayStart();
      if (this.cb.onResume) this.cb.onResume();
    });

    this.container.appendChild(overlay);
    this.activeModal = overlay;
  }
}
