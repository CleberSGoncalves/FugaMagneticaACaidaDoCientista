/**
 * @fileoverview Cinematic Intro & FluidCleb Interactive Splash Screen for Fuga Magnética: A Queda do Cientista
 * 
 * 1. Vinheta Oficial FluidCleb Interactive (0.0s a 2.8s)
 *    - Orbes cósmicos (#00f5ff, #38bdf8, #0284c7) convergindo com ondas suaves
 *    - Fusão central com anel de choque e partículas radiantes
 *    - Emblema da Gota Metálica Cromada (#94a3b8) com núcleo de fluido ciano líquido
 *    - Tipografia Neon Ciano 'FLUIDCLEB' (44px) e 'INTERACTIVE' (13px, tracking 7px)
 *    - Sincronização rigorosa dos áudios procedurais (intro, fusion, eject)
 * 2. Apresentação Dinâmica da Lore Interativa (3 Atos) com partículas eletromagnéticas
 * 3. Botão 'Skip Story / Pular História' bem visível para entrada imediata em gameplay (<= 1 clique)
 */

import { sound } from './audio.js';
import { i18n } from './i18n.js';
import { crazyGames } from './crazygames.js';

export class CinematicIntro {
  constructor(containerOrOptions, maybeOnComplete) {
    if (containerOrOptions && (containerOrOptions instanceof HTMLElement || containerOrOptions.nodeType === 1)) {
      this.container = containerOrOptions;
      this.onComplete = maybeOnComplete || null;
    } else if (containerOrOptions && typeof containerOrOptions === 'object') {
      this.container = containerOrOptions.container || document.getElementById('game-stage') || document.body;
      this.onComplete = containerOrOptions.onComplete || maybeOnComplete || null;
    } else {
      this.container = document.getElementById('game-stage') || document.body;
      this.onComplete = maybeOnComplete || null;
    }

    this.canvas = null;
    this.ctx = null;
    this.animId = null;
    this.startTime = null;
    this.finished = false;

    // Sincronização dos áudios da vinheta
    this.sound1Played = false;
    this.sound2Played = false;
    this.sound3Played = false;

    // Fases: 'splash' (0s a 2.8s) -> 'lore' (2.8s+)
    this.phase = 'splash';
    this.loreStartTime = null;
    this.loreAct = 1;

    // Partículas procedurais de laboratório eletromagnético
    this.particles = [];
    for (let i = 0; i < 75; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 2.5 + 0.8,
        speedX: (Math.random() - 0.5) * 0.05,
        speedY: (Math.random() - 0.5) * 0.05,
        color: ['#00f5ff', '#38bdf8', '#ef4444', '#94a3b8', '#a855f7'][Math.floor(Math.random() * 5)],
        alpha: Math.random() * 0.6 + 0.25,
        pulseSpeed: Math.random() * 2 + 1,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    this.initDOM();
  }

  initDOM() {
    this.wrapper = document.createElement('div');
    this.wrapper.id = 'cinematic-overlay';
    this.wrapper.style.position = 'fixed';
    this.wrapper.style.inset = '0';
    this.wrapper.style.width = '100vw';
    this.wrapper.style.height = '100vh';
    this.wrapper.style.zIndex = '99999';
    this.wrapper.style.background = '#030818';
    this.wrapper.style.display = 'flex';
    this.wrapper.style.flexDirection = 'column';
    this.wrapper.style.alignItems = 'center';
    this.wrapper.style.justifyContent = 'center';
    this.wrapper.style.userSelect = 'none';
    this.wrapper.style.touchAction = 'none';
    this.wrapper.style.overflow = 'hidden';

    // Canvas procedural de alta precisão
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.ctx = this.canvas.getContext('2d');
    this.wrapper.appendChild(this.canvas);

    // Barra de progresso da vinheta (0.0s a 2.8s)
    this.progressContainer = document.createElement('div');
    this.progressContainer.id = 'cinematic-progress-bar';
    this.progressContainer.style.position = 'absolute';
    this.progressContainer.style.bottom = '36px';
    this.progressContainer.style.width = '260px';
    this.progressContainer.style.height = '6px';
    this.progressContainer.style.background = 'rgba(255, 255, 255, 0.08)';
    this.progressContainer.style.borderRadius = '3px';
    this.progressContainer.style.overflow = 'hidden';
    this.progressContainer.style.backdropFilter = 'blur(6px)';
    this.progressContainer.style.border = '1px solid rgba(56, 189, 248, 0.25)';
    this.progressContainer.style.zIndex = '100001';

    this.progressFill = document.createElement('div');
    this.progressFill.style.width = '0%';
    this.progressFill.style.height = '100%';
    this.progressFill.style.background = 'linear-gradient(90deg, #0284c7, #00f5ff)';
    this.progressFill.style.borderRadius = '3px';
    this.progressFill.style.boxShadow = '0 0 10px #00f5ff';
    this.progressFill.style.transition = 'width 0.08s linear';
    this.progressContainer.appendChild(this.progressFill);
    this.wrapper.appendChild(this.progressContainer);

    // Botão Skip (Land in Gameplay com no máximo 1 clique - Regra Oficial CrazyGames)
    this.skipBtn = document.createElement('button');
    this.skipBtn.className = 'cinematic-skip-btn';
    this.skipBtn.innerHTML = `<span>${i18n.t('skip_intro')}</span>`;
    this.skipBtn.style.position = 'absolute';
    this.skipBtn.style.top = '22px';
    this.skipBtn.style.right = '22px';
    this.skipBtn.style.padding = '10px 24px';
    this.skipBtn.style.background = 'linear-gradient(135deg, rgba(14, 165, 233, 0.9), rgba(6, 182, 212, 0.9))';
    this.skipBtn.style.border = '2px solid #38bdf8';
    this.skipBtn.style.borderRadius = '24px';
    this.skipBtn.style.color = '#ffffff';
    this.skipBtn.style.fontFamily = "'Montserrat', sans-serif";
    this.skipBtn.style.fontSize = '14px';
    this.skipBtn.style.fontWeight = '800';
    this.skipBtn.style.letterSpacing = '1px';
    this.skipBtn.style.cursor = 'pointer';
    this.skipBtn.style.backdropFilter = 'blur(8px)';
    this.skipBtn.style.boxShadow = '0 0 20px rgba(0, 245, 255, 0.45)';
    this.skipBtn.style.transition = 'all 0.15s ease';
    this.skipBtn.style.zIndex = '100002';
    this.skipBtn.style.pointerEvents = 'auto';

    const triggerSkip = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.finish();
    };

    this.skipBtn.addEventListener('click', triggerSkip);
    this.skipBtn.addEventListener('touchend', triggerSkip);
    this.wrapper.appendChild(this.skipBtn);

    // Botão Continuar na Lore
    this.continueBtn = document.createElement('button');
    this.continueBtn.className = 'cinematic-continue-btn';
    this.continueBtn.innerHTML = `<span>${i18n.t('continue_btn')}</span>`;
    this.continueBtn.style.position = 'absolute';
    this.continueBtn.style.bottom = '36px';
    this.continueBtn.style.padding = '12px 32px';
    this.continueBtn.style.background = 'linear-gradient(135deg, #0284c7, #00f5ff)';
    this.continueBtn.style.border = '2px solid #38bdf8';
    this.continueBtn.style.borderRadius = '28px';
    this.continueBtn.style.color = '#ffffff';
    this.continueBtn.style.fontFamily = "'Montserrat', sans-serif";
    this.continueBtn.style.fontSize = '15px';
    this.continueBtn.style.fontWeight = '800';
    this.continueBtn.style.letterSpacing = '1.5px';
    this.continueBtn.style.cursor = 'pointer';
    this.continueBtn.style.boxShadow = '0 0 24px rgba(0, 245, 255, 0.5)';
    this.continueBtn.style.display = 'none';
    this.continueBtn.style.zIndex = '100002';
    this.continueBtn.style.pointerEvents = 'auto';

    const triggerAdvance = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.advanceLore();
    };

    this.continueBtn.addEventListener('click', triggerAdvance);
    this.continueBtn.addEventListener('touchend', triggerAdvance);
    this.wrapper.appendChild(this.continueBtn);

    // Pointer down on canvas advances lore
    this.wrapper.addEventListener('pointerdown', (e) => {
      if (e.target === this.skipBtn || e.target === this.continueBtn) return;
      if (this.phase === 'lore') {
        this.advanceLore();
      }
    });

    this.keyHandler = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (this.phase === 'splash') {
          this.startLorePhase();
        } else {
          this.advanceLore();
        }
      } else if (e.key === 'Escape') {
        this.finish();
      }
    };
    window.addEventListener('keydown', this.keyHandler);

    this.container.appendChild(this.wrapper);
    this.resize();
    this.resizeHandler = () => this.resize();
    window.addEventListener('resize', this.resizeHandler);
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    this.startTime = performance.now();
    const loop = (now) => {
      if (this.finished) return;
      this.update(now);
      this.render(now);
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  update(now) {
    const elapsed = now - this.startTime;

    for (const p of this.particles) {
      p.x += p.speedX * 0.016;
      p.y += p.speedY * 0.016;
      if (p.x < 0) p.x = 1;
      if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1;
      if (p.y > 1) p.y = 0;
    }

    if (this.phase === 'splash') {
      const SPLASH_DURATION = 2800; // 0.0s a 2.8s
      const pct = Math.min(100, Math.round((elapsed / SPLASH_DURATION) * 100));
      if (this.progressFill) {
        this.progressFill.style.width = `${pct}%`;
      }

      // Sincronização dos áudios sintéticos procedurais da FluidCleb
      if (elapsed >= 50 && !this.sound1Played) {
        this.sound1Played = true;
        sound.playFluidClebIntro();
      }
      if (elapsed >= 500 && !this.sound2Played) {
        this.sound2Played = true;
        sound.playFluidFusion();
      }
      if (elapsed >= 1800 && !this.sound3Played) {
        this.sound3Played = true;
        sound.playFluidEject();
      }

      if (elapsed >= SPLASH_DURATION) {
        this.startLorePhase();
      }
    } else if (this.phase === 'lore') {
      const loreElapsed = now - this.loreStartTime;
      if (loreElapsed > 3500 && this.loreAct === 1) {
        this.loreAct = 2;
        sound.playGravityWarp?.();
      } else if (loreElapsed > 7000 && this.loreAct === 2) {
        this.loreAct = 3;
        sound.playPolaritySwitch?.(1);
      } else if (loreElapsed > 10500 && this.loreAct === 3) {
        this.finish();
      }
    }
  }

  startLorePhase() {
    this.phase = 'lore';
    this.loreStartTime = performance.now();
    if (this.progressContainer) {
      this.progressContainer.style.display = 'none';
    }
    if (this.continueBtn) {
      this.continueBtn.style.display = 'block';
    }
    sound.playGravityWarp?.();
  }

  advanceLore() {
    if (this.loreAct < 3) {
      this.loreAct++;
      this.loreStartTime = performance.now() - (this.loreAct - 1) * 3500;
      sound.playUIClick?.();
    } else {
      this.finish();
    }
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('keydown', this.keyHandler);
    window.removeEventListener('resize', this.resizeHandler);

    this.wrapper.style.transition = 'opacity 0.4s ease';
    this.wrapper.style.opacity = '0';
    setTimeout(() => {
      try {
        this.wrapper.remove();
      } catch (e) {}
      crazyGames.gameplayStart();
      if (this.onComplete) this.onComplete();
    }, 400);
  }

  render(now) {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    this.ctx.clearRect(0, 0, w, h);

    if (this.phase === 'splash') {
      this.renderSplash(now, w, h, cx, cy);
    } else if (this.phase === 'lore') {
      this.renderLore(now, w, h, cx, cy);
    }
  }

  renderSplash(now, w, h, cx, cy) {
    const elapsed = now - this.startTime;

    const bgGrad = this.ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(w, h));
    bgGrad.addColorStop(0, '#0a1628');
    bgGrad.addColorStop(0.6, '#030818');
    bgGrad.addColorStop(1, '#01040a');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, w, h);

    // Partículas cósmicas flutuando suavemente
    this.ctx.save();
    for (const p of this.particles) {
      const px = p.x * w;
      const py = p.y * h;
      const pulse = Math.sin((elapsed / 1000) * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha * pulse;
      this.ctx.beginPath();
      this.ctx.arc(px, py, p.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();

    // FASE 1: (0 a 520ms) Três orbes cósmicos (#00f5ff, #38bdf8, #0284c7) convergindo
    if (elapsed < 520) {
      const t = elapsed / 520;
      const easeT = 1 - Math.pow(1 - t, 3);
      const orbs = [
        { sx: cx - 160, sy: h + 40, r: 24, col: '#38bdf8' },
        { sx: cx,       sy: h + 80, r: 32, col: '#00f5ff' },
        { sx: cx + 160, sy: h + 50, r: 26, col: '#0284c7' }
      ];
      orbs.forEach((orb, idx) => {
        const wave = Math.sin(t * Math.PI * 2 + idx * 2.0) * 18 * (1 - t);
        const ox = orb.sx + (cx - orb.sx) * easeT + wave;
        const oy = orb.sy + ((cy - 28) - orb.sy) * easeT;

        this.ctx.save();
        this.ctx.fillStyle = orb.col;
        this.ctx.globalAlpha = 0.35;
        this.ctx.beginPath();
        this.ctx.arc(ox, oy, orb.r * 2.2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(ox, oy, orb.r * 0.55, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = orb.col;
        this.ctx.beginPath();
        this.ctx.arc(ox, oy, orb.r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });
    }

    // FASE 2 e 3: (480ms a 2800ms) Fusão, Anel de Choque, Logo Cromado e Tipografia Neon
    if (elapsed >= 480) {
      this.ctx.save();
      let logoY = cy - 25;
      let logoScale = 1.0;
      let alpha = 1.0;

      if (elapsed < 900) {
        const tFuse = (elapsed - 480) / 420;
        const c4 = (2 * Math.PI) / 3;
        logoScale = tFuse === 0 ? 0 : tFuse === 1 ? 1 : Math.pow(2, -10 * tFuse) * Math.sin((tFuse * 10 - 0.75) * c4) + 1;

        const ringRadius = tFuse * 200;
        const ringAlpha = (1 - tFuse) * 0.85;
        this.ctx.strokeStyle = `rgba(0, 245, 255, ${ringAlpha})`;
        this.ctx.lineWidth = 4 * (1 - tFuse);
        this.ctx.beginPath();
        this.ctx.arc(cx, logoY, ringRadius, 0, Math.PI * 2);
        this.ctx.stroke();
      } else if (elapsed < 2000) {
        const tFloat = (elapsed - 900) / 1100;
        logoY += Math.sin(tFloat * Math.PI * 2) * 4;
        logoScale = 1.0;
      } else {
        const tFade = (elapsed - 2000) / 800;
        alpha = Math.max(0, 1 - tFade * 0.85);
      }

      this.ctx.globalAlpha = alpha;
      this.ctx.translate(cx, logoY);
      this.ctx.scale(logoScale, logoScale);

      const haloGrad = this.ctx.createRadialGradient(0, -20, 10, 0, -20, 220);
      haloGrad.addColorStop(0, 'rgba(0, 245, 255, 0.4)');
      haloGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.14)');
      haloGrad.addColorStop(1, 'rgba(3, 8, 24, 0)');
      this.ctx.fillStyle = haloGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, -20, 220, 0, Math.PI * 2);
      this.ctx.fill();

      // Emblema Gota Metálica Cromada com Fluido Neon (#94a3b8)
      const emblemY = -60;
      this.ctx.save();
      this.ctx.translate(0, emblemY);

      this.ctx.lineWidth = 6;
      const metalGrad = this.ctx.createLinearGradient(-42, -42, 42, 42);
      metalGrad.addColorStop(0, '#f8fafc');
      metalGrad.addColorStop(0.3, '#94a3b8');
      metalGrad.addColorStop(0.7, '#cbd5e1');
      metalGrad.addColorStop(1, '#475569');
      this.ctx.strokeStyle = metalGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 44, 0, Math.PI * 2);
      this.ctx.stroke();

      const fluidGrad = this.ctx.createRadialGradient(-8, -8, 4, 0, 0, 40);
      fluidGrad.addColorStop(0, '#e0f2fe');
      fluidGrad.addColorStop(0.3, '#38bdf8');
      fluidGrad.addColorStop(0.75, '#0284c7');
      fluidGrad.addColorStop(1, '#0369a1');
      this.ctx.fillStyle = fluidGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 40, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.moveTo(0, -22);
      this.ctx.bezierCurveTo(14, -8, 20, 6, 14, 18);
      this.ctx.bezierCurveTo(7, 26, -7, 26, -14, 18);
      this.ctx.bezierCurveTo(-20, 6, -14, -8, 0, -22);
      this.ctx.fill();

      this.ctx.restore();

      // TIPOGRAFIA NEON CIANO: FLUIDCLEB INTERACTIVE
      this.ctx.textAlign = 'center';
      this.ctx.font = '900 44px "Montserrat", sans-serif';
      const textGrad = this.ctx.createLinearGradient(-150, 10, 150, 40);
      textGrad.addColorStop(0, '#ffffff');
      textGrad.addColorStop(0.3, '#38bdf8');
      textGrad.addColorStop(0.7, '#00f5ff');
      textGrad.addColorStop(1, '#ffffff');

      this.ctx.fillStyle = 'rgba(0, 245, 255, 0.4)';
      this.ctx.fillText('FLUIDCLEB', 0, 36);
      this.ctx.fillStyle = textGrad;
      this.ctx.fillText('FLUIDCLEB', 0, 35);

      this.ctx.font = '700 13px "Montserrat", sans-serif';
      this.ctx.letterSpacing = '7px';
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.fillText('INTERACTIVE', 4, 68);

      this.ctx.restore();
    }
  }

  renderLore(now, w, h, cx, cy) {
    this.ctx.fillStyle = '#030818';
    this.ctx.fillRect(0, 0, w, h);

    const nebGrad = this.ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(w, h) * 0.75);
    nebGrad.addColorStop(0, 'rgba(14, 165, 233, 0.12)');
    nebGrad.addColorStop(0.5, 'rgba(3, 105, 161, 0.05)');
    nebGrad.addColorStop(1, 'rgba(3, 8, 24, 0)');
    this.ctx.fillStyle = nebGrad;
    this.ctx.fillRect(0, 0, w, h);

    // Partículas
    this.ctx.save();
    for (const p of this.particles) {
      const px = p.x * w;
      const py = p.y * h;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha * 0.75;
      this.ctx.beginPath();
      this.ctx.arc(px, py, p.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();

    // Textos do Ato Atual
    let actTitle = i18n.t('lore_act1_title');
    let actBody = i18n.t('lore_act1_body');
    let badgeColor = '#00f5ff';

    if (this.loreAct === 2) {
      actTitle = i18n.t('lore_act2_title');
      actBody = i18n.t('lore_act2_body');
      badgeColor = '#a855f7';
    } else if (this.loreAct === 3) {
      actTitle = i18n.t('lore_act3_title');
      actBody = i18n.t('lore_act3_body');
      badgeColor = '#ef4444';
    }

    this.ctx.save();
    this.ctx.textAlign = 'center';

    // Game Title Header
    this.ctx.font = '900 24px "Montserrat", sans-serif';
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillText(i18n.t('game_title').toUpperCase(), cx, cy - 130);

    // Act Badge
    this.ctx.font = '800 16px "Montserrat", sans-serif';
    this.ctx.fillStyle = badgeColor;
    this.ctx.fillText(actTitle, cx, cy - 70);

    // Act Body text wrap
    this.ctx.font = '500 17px "Montserrat", sans-serif';
    this.ctx.fillStyle = '#e2e8f0';
    this.wrapText(actBody, cx, cy - 20, Math.min(680, w - 60), 28);

    // Indicator dots
    for (let i = 1; i <= 3; i++) {
      this.ctx.beginPath();
      this.ctx.arc(cx - 30 + (i - 1) * 30, cy + 90, i === this.loreAct ? 6 : 4, 0, Math.PI * 2);
      this.ctx.fillStyle = i === this.loreAct ? '#00f5ff' : 'rgba(255,255,255,0.3)';
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = this.ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        this.ctx.fillText(line, x, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, x, curY);
  }
}
