/**
 * @fileoverview Main Game Engine for Fuga Magnética: A Queda do Cientista
 * Orchestrates fixed-timestep physics, player input, CrazyGames SDK v3 events,
 * and high-fidelity Canvas 2D rendering.
 */

import { sound } from './audio.js';
import { storage } from './storage.js';
import { crazyGames } from './crazygames.js';
import { i18n } from './i18n.js';
import { LEVELS } from './levels.js';
import {
  Vec2,
  CameraShaker,
  ParticleSystem,
  DrElaraRagdoll,
  FerromagneticDebris,
  ReinforcedGlassDoor,
  EMPGenerator,
  MagLevPlatform,
  InvertedGravityZone,
  MagneticSwitch,
  LaserBarrierGate,
  ExitPortal,
  TrajectoryPredictor
} from './physics.js';

export class GameEngine {
  constructor(canvasEl, hudInstance) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.hud = hudInstance;

    // Resolução Lógica Invariante (16:9)
    this.V_WIDTH = 960;
    this.V_HEIGHT = 540;

    // Fixed Timestep Rigoroso (60Hz invariante para 60Hz, 144Hz, 165Hz)
    this.FIXED_DT = 1 / 60;
    this.accumulator = 0;
    this.lastTime = performance.now();
    this.isPaused = false;
    this.isAdPaused = false;
    this.isRunning = false;
    this.animId = null;

    // Estado da Câmara / Partida
    this.currentLevelIndex = 0;
    this.currentLevel = LEVELS[0];
    this.levelTime = 0;
    this.score = 0;
    this.isHandlingVictory = false;
    this.isHandlingGameOver = false;

    // Entidades
    this.player = null;
    this.debris = [];
    this.glassDoors = [];
    this.empGenerators = [];
    this.magLevPlatforms = [];
    this.inversionZones = [];
    this.switches = [];
    this.gates = [];
    this.fixedMagnets = [];
    this.energyCores = [];
    this.portal = null;

    // Sistemas
    this.cameraShaker = new CameraShaker();
    this.particleSystem = new ParticleSystem(500);

    // Controles de Entrada
    this.keys = {};
    this.pointer = { isDown: false, startX: 0, startY: 0, currX: 0, currY: 0 };

    this.initCanvasResize();
    this.initInputs();
  }

  initCanvasResize() {
    const resize = () => {
      const windowW = window.innerWidth;
      const windowH = window.innerHeight;
      const scale = Math.min(windowW / this.V_WIDTH, windowH / this.V_HEIGHT);

      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = Math.round(this.V_WIDTH * scale * dpr);
      this.canvas.height = Math.round(this.V_HEIGHT * scale * dpr);
      this.canvas.style.width = `${Math.round(this.V_WIDTH * scale)}px`;
      this.canvas.style.height = `${Math.round(this.V_HEIGHT * scale)}px`;

      this.ctx.resetTransform?.();
      this.ctx.scale(scale * dpr, scale * dpr);
      this.currentScale = scale;
    };

    window.addEventListener('resize', resize);
    resize();
  }

  initInputs() {
    // Teclado Desktop
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;

      // Q: North (+)
      if (e.key === 'q' || e.key === 'Q') {
        this.player?.setPolarity(1);
      }
      // E: South (-)
      else if (e.key === 'e' || e.key === 'E') {
        this.player?.setPolarity(-1);
      }
      // Space: Neutral (0)
      else if (e.key === ' ') {
        this.player?.setPolarity(0);
      }
      // F: EMP Blast
      else if (e.key === 'f' || e.key === 'F') {
        this.triggerPlayerEMP();
      }
      // R: Restart
      else if (e.key === 'r' || e.key === 'R') {
        this.loadLevel(this.currentLevelIndex);
      }
      // P or Escape: Pause
      else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (!this.isPaused && !this.isHandlingGameOver && !this.isHandlingVictory) {
          this.isPaused = true;
          this.hud?.showPauseModal();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Pointer / Mouse / Touch
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      return {
        x: (clientX - rect.left) / (this.currentScale || 1),
        y: (clientY - rect.top) / (this.currentScale || 1)
      };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.isPaused || !this.player || !this.player.isAlive) return;
      sound.ensureContext();
      const pos = getPos(e);
      this.pointer.isDown = true;
      this.pointer.startX = pos.x;
      this.pointer.startY = pos.y;
      this.pointer.currX = pos.x;
      this.pointer.currY = pos.y;
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.pointer.isDown) return;
      const pos = getPos(e);
      this.pointer.currX = pos.x;
      this.pointer.currY = pos.y;
    });

    const onPointerUp = () => {
      if (!this.pointer.isDown || !this.player || !this.player.isAlive) {
        this.pointer.isDown = false;
        return;
      }
      this.pointer.isDown = false;

      // Calculate Sling Vector (Inverse of drag direction)
      const dx = this.pointer.startX - this.pointer.currX;
      const dy = this.pointer.startY - this.pointer.currY;
      const dist = Math.hypot(dx, dy);

      if (dist > 15) {
        const force = Math.min(680, dist * 3.6);
        const nx = dx / dist;
        const ny = dy / dist;
        this.player.applyImpulse(nx * force, ny * force);
        sound.playMagneticRepulsion();
        this.cameraShaker.addTrauma(0.25);
      }
    };

    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Right-click triggers EMP Blast
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.triggerPlayerEMP();
    });
  }

  triggerPlayerEMP() {
    if (!this.player || !this.player.isAlive || this.player.empEnergy < 40) return;
    this.player.empEnergy -= 40;
    sound.playEMPBlast();
    this.cameraShaker.addTrauma(0.5);
    this.particleSystem.emitEMPShockwave(this.player.x, this.player.y, 240);

    // Repel nearby debris
    for (const d of this.debris) {
      const dist = Vec2.dist(this.player.x, this.player.y, d.x, d.y);
      if (dist < 240 && dist > 1) {
        const force = (1 - dist / 240) * 600;
        const nx = (d.x - this.player.x) / dist;
        const ny = (d.y - this.player.y) / dist;
        d.applyImpulse(nx * force, ny * force);
      }
    }
  }

  loadLevel(index) {
    this.currentLevelIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
    this.currentLevel = LEVELS[this.currentLevelIndex];
    this.levelTime = 0;
    this.score = 0;
    this.isHandlingVictory = false;
    this.isHandlingGameOver = false;

    // Reset Entities
    const pStart = this.currentLevel.playerStart || { x: 140, y: 380 };
    this.player = new DrElaraRagdoll(pStart.x, pStart.y);

    this.debris = (this.currentLevel.debris || []).map((d) => new FerromagneticDebris(d));
    this.glassDoors = (this.currentLevel.glassDoors || []).map((g) => new ReinforcedGlassDoor(g));
    this.empGenerators = (this.currentLevel.empGenerators || []).map((e) => new EMPGenerator(e));
    this.magLevPlatforms = (this.currentLevel.magLevPlatforms || []).map((m) => new MagLevPlatform(m));
    this.inversionZones = (this.currentLevel.inversionZones || []).map((z) => new InvertedGravityZone(z));
    this.switches = (this.currentLevel.switches || []).map((s) => new MagneticSwitch(s));
    this.gates = (this.currentLevel.gates || []).map((gt) => new LaserBarrierGate(gt));
    this.fixedMagnets = (this.currentLevel.fixedMagnets || []).map((fm) => ({ ...fm }));
    this.energyCores = (this.currentLevel.energyCores || []).map((ec) => ({ ...ec, collected: false }));

    const pPos = this.currentLevel.portal || { x: 860, y: 380 };
    this.portal = new ExitPortal(pPos.x, pPos.y);

    this.hud?.updateLevel(this.currentLevel);
    this.hud?.closeModal();
    crazyGames.gameplayStart();
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loadLevel(0);

    const loop = (now) => {
      if (!this.isRunning) return;
      const frameTime = Math.min(0.1, (now - this.lastTime) / 1000); // Clamp to avoid spiral of death
      this.lastTime = now;

      if (!this.isPaused && !this.isAdPaused) {
        this.accumulator += frameTime;
        while (this.accumulator >= this.FIXED_DT) {
          this.fixedUpdate(this.FIXED_DT);
          this.accumulator -= this.FIXED_DT;
        }
      }

      this.render();
      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  fixedUpdate(dt) {
    if (!this.player) return;

    this.levelTime += dt;
    this.cameraShaker.update(dt);
    this.particleSystem.update(dt);

    // 1. Keyboard Body Nudge
    if (this.keys['a'] || this.keys['arrowleft']) {
      this.player.applyForce(-240 * dt, 0);
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      this.player.applyForce(240 * dt, 0);
    }

    // 2. Gravitational Zone Evaluation
    let gravityY = 650;
    let gravityX = 0;
    for (const zone of this.inversionZones) {
      if (zone.contains(this.player.x, this.player.y)) {
        gravityY = zone.gravityY;
        gravityX = zone.gravityX;
        break;
      }
    }

    // 3. Fixed Magnets Electromagnetic Force
    if (this.player.polarity !== 0) {
      for (const mag of this.fixedMagnets) {
        const dist = Vec2.dist(mag.x, mag.y, this.player.x, this.player.y);
        const maxRange = 260;
        if (dist < maxRange && dist > 15) {
          const forceMag = (1 - dist / maxRange) * 580;
          const nx = (this.player.x - mag.x) / dist;
          const ny = (this.player.y - mag.y) / dist;

          if (this.player.polarity === mag.polarity) {
            // Like poles: REPEL
            this.player.applyForce(nx * forceMag * dt, ny * forceMag * dt);
          } else {
            // Opposite poles: ATTRACT
            this.player.applyForce(-nx * forceMag * dt, -ny * forceMag * dt);
          }
        }
      }
    }

    // 4. Update Player Ragdoll
    this.player.update(dt, gravityY, gravityX);

    // Check Player Death / Molecular Cohesion
    if (!this.player.isAlive && !this.isHandlingGameOver) {
      this.isHandlingGameOver = true;
      sound.playGameOver();
      this.hud?.showGameOverModal();
    }

    // 5. Update Ferromagnetic Debris
    for (const d of this.debris) {
      // Inversion zones affect debris too
      let dGravY = 650;
      let dGravX = 0;
      for (const zone of this.inversionZones) {
        if (zone.contains(d.x, d.y)) {
          dGravY = zone.gravityY;
          dGravX = zone.gravityX;
          break;
        }
      }

      // Magnetic interaction between Dr. Elara and Ferromagnetic Debris
      if (this.player.polarity !== 0) {
        const distD = Vec2.dist(this.player.x, this.player.y, d.x, d.y);
        if (distD < 220 && distD > 10) {
          const force = (1 - distD / 220) * 440;
          const nx = (d.x - this.player.x) / distD;
          const ny = (d.y - this.player.y) / distD;
          // Ferromagnetic debris is drawn toward active poles
          d.applyImpulse(-nx * force * dt * 2, -ny * force * dt * 2);
        }
      }

      d.update(dt, dGravY, dGravX);

      // Check Glass Door Shatter
      for (const glass of this.glassDoors) {
        glass.checkCollision(d, this.particleSystem, this.cameraShaker);
      }
    }

    // 6. Update EMP Generators
    for (const emp of this.empGenerators) {
      emp.update(dt, this.player, this.debris, this.particleSystem, this.cameraShaker);
    }

    // 7. Update MagLev Platforms
    for (const maglev of this.magLevPlatforms) {
      maglev.update(dt, this.player);
    }

    // 8. Update Magnetic Switches & Laser Gates
    for (const sw of this.switches) {
      sw.update(this.debris, this.player);
      if (sw.isActivated) {
        const gate = this.gates.find((g) => g.id === sw.targetGateId);
        if (gate) gate.isOpen = true;
      }
    }

    // 9. Laser Gates Collision with Player
    for (const gate of this.gates) {
      gate.checkCollision(this.player);
    }

    // 10. Energy Cores Collection
    for (const core of this.energyCores) {
      if (!core.collected && Vec2.dist(this.player.x, this.player.y, core.x, core.y) < 28) {
        core.collected = true;
        this.score += 250;
        storage.addEnergyCores(1);
        sound.playPortalChime();
        this.particleSystem.emitGlassShards(core.x, core.y, 14);
      }
    }

    // 11. Exit Portal Check
    if (this.portal && this.portal.checkReached(this.player) && !this.isHandlingVictory) {
      this.isHandlingVictory = true;
      sound.playVictory();
      this.cameraShaker.addTrauma(0.5);

      // Calculate Stars
      let stars = 1;
      const t = this.levelTime;
      const th = this.currentLevel.starTimes || { threeStar: 30, twoStar: 50 };
      if (t <= th.threeStar) stars = 3;
      else if (t <= th.twoStar) stars = 2;

      storage.setLevelStars(this.currentLevel.id, stars);
      storage.recordLevelScore(this.currentLevel.id, this.score + Math.max(0, 1000 - Math.round(t * 10)));
      storage.unlockLevel(this.currentLevel.id + 1);

      const collectedCount = this.energyCores.filter((c) => c.collected).length;
      this.hud?.showVictoryModal(this.currentLevel.id, this.levelTime, collectedCount, this.score);
    }

    // Update HUD
    const coresCollected = this.energyCores.filter((c) => c.collected).length;
    this.hud?.updateStatus(
      this.player.cohesion,
      this.player.polarity,
      coresCollected,
      this.energyCores.length,
      this.levelTime
    );
  }

  render() {
    this.ctx.save();

    // Camera Trauma Shake
    this.ctx.translate(this.cameraShaker.offsetX, this.cameraShaker.offsetY);
    this.ctx.rotate(this.cameraShaker.angle);

    // Chamber Background
    this.ctx.fillStyle = '#030818';
    this.ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

    // Tech Grid Floor & Ceiling
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x <= this.V_WIDTH; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.V_HEIGHT);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.V_HEIGHT; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.V_WIDTH, y);
      this.ctx.stroke();
    }

    // Chamber Outer Border
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(10, 10, this.V_WIDTH - 20, this.V_HEIGHT - 20);

    // Inverted Gravity Zones
    for (const zone of this.inversionZones) {
      zone.draw(this.ctx);
    }

    // Fixed Magnets
    for (const mag of this.fixedMagnets) {
      this.drawFixedMagnet(mag);
    }

    // MagLev Platforms
    for (const maglev of this.magLevPlatforms) {
      maglev.draw(this.ctx);
    }

    // Magnetic Switches
    for (const sw of this.switches) {
      sw.draw(this.ctx);
    }

    // Laser Gates
    for (const gate of this.gates) {
      gate.draw(this.ctx);
    }

    // Destructible Glass Doors
    for (const glass of this.glassDoors) {
      glass.draw(this.ctx);
    }

    // Ferromagnetic Debris
    for (const d of this.debris) {
      d.draw(this.ctx);
    }

    // EMP Generators
    for (const emp of this.empGenerators) {
      emp.draw(this.ctx);
    }

    // Energy Cores (Collectibles)
    for (const core of this.energyCores) {
      if (!core.collected) {
        this.drawEnergyCore(core.x, core.y);
      }
    }

    // Exit Portal
    if (this.portal) {
      this.portal.draw(this.ctx);
    }

    // Dr. Elara Ragdoll
    if (this.player) {
      this.player.draw(this.ctx);
    }

    // Holographic Trajectory Guide (when dragging pointer)
    if (this.pointer.isDown && this.player && storage.getPreferences().showTrajectory) {
      const dx = this.pointer.startX - this.pointer.currX;
      const dy = this.pointer.startY - this.pointer.currY;
      const dist = Math.hypot(dx, dy);

      if (dist > 15) {
        const force = Math.min(680, dist * 3.6);
        const nx = dx / dist;
        const ny = dy / dist;
        const initVx = nx * force;
        const initVy = ny * force;

        const points = TrajectoryPredictor.predict(
          this.player.x,
          this.player.y,
          initVx,
          initVy,
          650,
          this.inversionZones,
          32,
          0.035
        );
        TrajectoryPredictor.draw(this.ctx, points, '#00f5ff');

        // Drag Aim Arrow
        this.ctx.strokeStyle = 'rgba(0, 245, 255, 0.7)';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x, this.player.y);
        this.ctx.lineTo(this.player.x + nx * Math.min(80, dist), this.player.y + ny * Math.min(80, dist));
        this.ctx.stroke();
      }
    }

    // Particles
    this.particleSystem.draw(this.ctx);

    this.ctx.restore();
  }

  drawFixedMagnet(mag) {
    this.ctx.save();
    this.ctx.translate(mag.x, mag.y);

    const color = mag.polarity === 1 ? '#ef4444' : '#00f5ff';
    const label = mag.polarity === 1 ? 'N (+)' : 'S (-)';

    // Pulsing field aura
    const pulse = Math.sin(performance.now() / 140) * 4;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([4, 4]);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, mag.radius + 8 + pulse, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Magnet Body
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, mag.radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Center Label
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '800 11px "Montserrat", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(label, 0, 0);

    this.ctx.restore();
  }

  drawEnergyCore(x, y) {
    this.ctx.save();
    this.ctx.translate(x, y);

    const floatY = Math.sin(performance.now() / 180) * 4;
    this.ctx.translate(0, floatY);

    // Glowing Diamond Core
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(0, -12);
    this.ctx.lineTo(10, 0);
    this.ctx.lineTo(0, 12);
    this.ctx.lineTo(-10, 0);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Glow Aura
    this.ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }
}
