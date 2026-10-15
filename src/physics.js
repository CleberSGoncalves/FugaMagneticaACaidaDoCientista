/**
 * @fileoverview High-Precision 2D Physics Engine for Fuga Magnética: A Queda do Cientista
 * 
 * Implements:
 * - Fixed Timestep Accumulator (invariable 60Hz physics for 60Hz, 144Hz, 165Hz displays)
 * - Dr. Elara Multi-Segment Verlet Ragdoll (Head, Torso, Pelvis, Hands, Feet)
 * - Dynamic Polarity Manipulation: North (+1), South (-1), Neutral (0)
 * - Dynamic Coulomb/Lorentz-style electromagnetic attraction & repulsion
 * - EMP Pulse Generators (Radial shockwave blast with electric arc particles)
 * - MagLev Levitating Platforms & Rails (Polarity-driven track gliding)
 * - Inverted Gravity Anomaly Zones (Upward/sideways gravitational inversion)
 * - Ferromagnetic Debris (Conductive Crates, Steel Girders, Scrap Spheres)
 * - Destructible Reinforced Glass Doors (High-velocity shattering physics)
 * - Magnetic Switches & Laser Security Barriers
 * - Dimensional Extraction Portal
 * - Holographic Trajectory Arc Predictor
 * - Camera Trauma & Screen Shake System
 */

import { sound } from './audio.js';

export const Vec2 = {
  create: (x = 0, y = 0) => ({ x, y }),
  distSq: (x1, y1, x2, y2) => (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1),
  dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
  clamp: (val, min, max) => Math.max(min, Math.min(max, val)),
  lerp: (a, b, t) => a + (b - a) * t
};

// =============================================================================
// CAMERA TRAUMA & SCREEN SHAKE (GAME JUICE SKILL)
// =============================================================================

export class CameraShaker {
  constructor() {
    this.trauma = 0;
    this.decay = 1.6;
    this.maxOffset = 18;
    this.maxAngle = 0.06;
    this.offsetX = 0;
    this.offsetY = 0;
    this.angle = 0;
  }

  addTrauma(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  update(dt) {
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - this.decay * dt);
      const shake = this.trauma * this.trauma; // Exponential smooth curve
      this.offsetX = (Math.random() * 2 - 1) * this.maxOffset * shake;
      this.offsetY = (Math.random() * 2 - 1) * this.maxOffset * shake;
      this.angle = (Math.random() * 2 - 1) * this.maxAngle * shake;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
      this.angle = 0;
    }
  }
}

// =============================================================================
// PARTICLE SYSTEM (SPARKS, EMP RINGS, GLASS SHARDS, DEBRIS DUST)
// =============================================================================

export class ParticleSystem {
  constructor(maxParticles = 500) {
    this.max = maxParticles;
    this.particles = [];
  }

  emit(options) {
    if (this.particles.length >= this.max) {
      this.particles.shift();
    }
    this.particles.push({
      x: options.x,
      y: options.y,
      vx: options.vx || (Math.random() - 0.5) * 80,
      vy: options.vy || (Math.random() - 0.5) * 80,
      radius: options.radius || 3,
      color: options.color || '#00f5ff',
      alpha: options.alpha || 1.0,
      life: options.life || 0.6,
      maxLife: options.life || 0.6,
      gravity: options.gravity || 0,
      shape: options.shape || 'circle',
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 6
    });
  }

  emitGlassShards(x, y, count = 28) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 380;
      this.emit({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 5,
        color: ['#e0f2fe', '#bae6fd', '#38bdf8', '#ffffff'][Math.floor(Math.random() * 4)],
        life: 0.8 + Math.random() * 0.8,
        gravity: 400,
        shape: 'shard'
      });
    }
  }

  emitEMPShockwave(x, y, radius = 40) {
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const speed = 260 + Math.random() * 140;
      this.emit({
        x: x + Math.cos(angle) * 10,
        y: y + Math.sin(angle) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3.5,
        color: ['#00f5ff', '#38bdf8', '#818cf8', '#ef4444'][i % 4],
        life: 0.45,
        gravity: 0,
        shape: 'spark'
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.rotation += p.rotSpeed * dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === 'shard') {
        ctx.beginPath();
        ctx.moveTo(0, -p.radius);
        ctx.lineTo(p.radius * 0.8, p.radius);
        ctx.lineTo(-p.radius * 0.6, p.radius * 0.7);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'spark') {
        ctx.fillRect(-p.radius, -1, p.radius * 2, 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }
}

// =============================================================================
// VERLET RAGDOLL: DR. ELARA (THE SCIENTIST)
// =============================================================================

class DistanceConstraint {
  constructor(p1, p2, length, stiffness = 0.9) {
    this.p1 = p1;
    this.p2 = p2;
    this.length = length;
    this.stiffness = stiffness;
  }

  solve() {
    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    const diff = (dist - this.length) / dist;

    const totalMass = this.p1.mass + this.p2.mass;
    const m1Ratio = this.p2.mass / totalMass;
    const m2Ratio = this.p1.mass / totalMass;

    const offsetX = dx * diff * 0.5 * this.stiffness;
    const offsetY = dy * diff * 0.5 * this.stiffness;

    if (!this.p1.isPinned) {
      this.p1.x += offsetX * m1Ratio * 2;
      this.p1.y += offsetY * m1Ratio * 2;
    }
    if (!this.p2.isPinned) {
      this.p2.x -= offsetX * m2Ratio * 2;
      this.p2.y -= offsetY * m2Ratio * 2;
    }
  }
}

export class DrElaraRagdoll {
  constructor(startX = 200, startY = 270) {
    this.startX = startX;
    this.startY = startY;

    // Molecular Cohesion (Health / Stabilizer)
    this.cohesion = 100;
    this.maxCohesion = 100;
    this.isAlive = true;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;

    // Polarity: 1 = North (+), -1 = South (-), 0 = Neutral
    this.polarity = 0;

    // EMP Burst Cooldown
    this.empEnergy = 100;
    this.empCooldown = 0;

    // Magnetic Sling / Aiming State
    this.isAiming = false;
    this.aimStartX = 0;
    this.aimStartY = 0;
    this.aimCurrX = 0;
    this.aimCurrY = 0;

    // Grabbed Ferromagnetic Object
    this.grabbedObject = null;
    this.magneticReach = 90;

    // Ragdoll Nodes (Verlet Particles)
    this.nodes = {
      head:    { x: startX, y: startY - 26, oldX: startX, oldY: startY - 26, mass: 1.0, radius: 10, isPinned: false },
      torso:   { x: startX, y: startY - 10, oldX: startX, oldY: startY - 10, mass: 2.2, radius: 12, isPinned: false },
      pelvis:  { x: startX, y: startY + 8,  oldX: startX, oldY: startY + 8,  mass: 1.8, radius: 11, isPinned: false },
      leftHand:{ x: startX - 18, y: startY - 6, oldX: startX - 18, oldY: startY - 6, mass: 0.8, radius: 6, isPinned: false },
      rightHand:{ x: startX + 18, y: startY - 6, oldX: startX + 18, oldY: startY - 6, mass: 0.8, radius: 6, isPinned: false },
      leftFoot:{ x: startX - 12, y: startY + 30, oldX: startX - 12, oldY: startY + 30, mass: 1.0, radius: 7, isPinned: false },
      rightFoot:{ x: startX + 12, y: startY + 30, oldX: startX + 12, oldY: startY + 30, mass: 1.0, radius: 7, isPinned: false }
    };

    // Ragdoll Skeleton Distance Constraints
    this.constraints = [
      new DistanceConstraint(this.nodes.head, this.nodes.torso, 16, 0.95),
      new DistanceConstraint(this.nodes.torso, this.nodes.pelvis, 18, 0.95),
      new DistanceConstraint(this.nodes.torso, this.nodes.leftHand, 20, 0.85),
      new DistanceConstraint(this.nodes.torso, this.nodes.rightHand, 20, 0.85),
      new DistanceConstraint(this.nodes.pelvis, this.nodes.leftFoot, 24, 0.85),
      new DistanceConstraint(this.nodes.pelvis, this.nodes.rightFoot, 24, 0.85),
      // Cross support constraints for anatomical consistency
      new DistanceConstraint(this.nodes.head, this.nodes.pelvis, 34, 0.6),
      new DistanceConstraint(this.nodes.leftFoot, this.nodes.rightFoot, 22, 0.4)
    ];

    // Screen proxy
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
  }

  setPolarity(val) {
    if (this.polarity !== val) {
      this.polarity = val;
      sound.playPolaritySwitch(val);
    }
  }

  togglePolarityNext() {
    if (this.polarity === 0) {
      this.setPolarity(1);
    } else if (this.polarity === 1) {
      this.setPolarity(-1);
    } else {
      this.setPolarity(0);
    }
  }

  applyImpulse(ix, iy) {
    for (const key in this.nodes) {
      const n = this.nodes[key];
      n.oldX -= ix / n.mass;
      n.oldY -= iy / n.mass;
    }
  }

  applyForce(fx, fy) {
    for (const key in this.nodes) {
      const n = this.nodes[key];
      n.x += fx / n.mass;
      n.y += fy / n.mass;
    }
  }

  takeDamage(amount) {
    if (this.isInvulnerable || !this.isAlive) return;
    this.cohesion = Math.max(0, this.cohesion - amount);
    sound.playDamage();
    if (this.cohesion <= 0) {
      this.isAlive = false;
    }
  }

  reviveWithStabilizer() {
    this.cohesion = this.maxCohesion;
    this.isAlive = true;
    this.isInvulnerable = true;
    this.invulnerabilityTimer = 3.0; // 3 seconds invulnerability
    sound.playRevive();
    // EMP burst to clear immediately surrounding hazards
    this.applyImpulse(0, -280);
  }

  update(dt, gravityY = 650, gravityX = 0) {
    // Invulnerability countdown
    if (this.isInvulnerable) {
      this.invulnerabilityTimer -= dt;
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    // EMP Energy Recharge
    if (this.empEnergy < 100) {
      this.empEnergy = Math.min(100, this.empEnergy + 25 * dt);
    }
    if (this.empCooldown > 0) {
      this.empCooldown -= dt;
    }

    // Verlet Integration for all nodes
    const friction = 0.992;
    for (const key in this.nodes) {
      const n = this.nodes[key];
      if (n.isPinned) continue;

      const vx = (n.x - n.oldX) * friction;
      const vy = (n.y - n.oldY) * friction;

      n.oldX = n.x;
      n.oldY = n.y;

      n.x += vx + (gravityX * dt * dt);
      n.y += vy + (gravityY * dt * dt);
    }

    // Solve Distance Constraints (multiple iterations for stiffness)
    for (let iter = 0; iter < 4; iter++) {
      for (const c of this.constraints) {
        c.solve();
      }
    }

    // Update root center proxy position
    this.x = (this.nodes.torso.x + this.nodes.pelvis.x) * 0.5;
    this.y = (this.nodes.torso.y + this.nodes.pelvis.y) * 0.5;
    this.vx = (this.x - (this.nodes.torso.oldX + this.nodes.pelvis.oldX) * 0.5) / dt;
    this.vy = (this.y - (this.nodes.torso.oldY + this.nodes.pelvis.oldY) * 0.5) / dt;

    // Check bounds clamp against chamber screen
    for (const key in this.nodes) {
      const n = this.nodes[key];
      if (n.x < 16) { n.x = 16; n.oldX = n.x; }
      if (n.x > 944) { n.x = 944; n.oldX = n.x; }
      if (n.y < 16) { n.y = 16; n.oldY = n.y; }
      if (n.y > 524) { n.y = 524; n.oldY = n.y; }
    }
  }

  draw(ctx) {
    ctx.save();

    // 1. Quantum Invulnerability Aura
    if (this.isInvulnerable) {
      const auraPulse = Math.sin(performance.now() / 80) * 0.2 + 0.8;
      ctx.strokeStyle = `rgba(0, 245, 255, ${auraPulse * 0.8})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 34, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(0, 245, 255, ${auraPulse * 0.2})`;
      ctx.fill();
    }

    // 2. Dynamic Polarity Glow
    if (this.polarity !== 0) {
      const polColor = this.polarity === 1 ? 'rgba(239, 68, 68, 0.45)' : 'rgba(0, 245, 255, 0.45)';
      const polBorder = this.polarity === 1 ? '#ef4444' : '#00f5ff';
      const pulseR = 28 + Math.sin(performance.now() / 120) * 3;

      ctx.strokeStyle = polBorder;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(this.x, this.y, pulseR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = polColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, pulseR - 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw Limbs / Skeleton (Bones & Clothes)
    ctx.lineCap = 'round';
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#e2e8f0'; // Dr. Elara's lab coat

    // Arms
    ctx.beginPath();
    ctx.moveTo(this.nodes.leftHand.x, this.nodes.leftHand.y);
    ctx.lineTo(this.nodes.torso.x, this.nodes.torso.y);
    ctx.lineTo(this.nodes.rightHand.x, this.nodes.rightHand.y);
    ctx.stroke();

    // Legs
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#334155'; // Dark grey laboratory trousers
    ctx.beginPath();
    ctx.moveTo(this.nodes.leftFoot.x, this.nodes.leftFoot.y);
    ctx.lineTo(this.nodes.pelvis.x, this.nodes.pelvis.y);
    ctx.lineTo(this.nodes.rightFoot.x, this.nodes.rightFoot.y);
    ctx.stroke();

    // Torso (Lab Coat & Tie)
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(this.nodes.torso.x, this.nodes.torso.y);
    ctx.lineTo(this.nodes.pelvis.x, this.nodes.pelvis.y);
    ctx.stroke();

    // Torso Polarity Core Badge
    ctx.fillStyle = this.polarity === 1 ? '#ef4444' : this.polarity === -1 ? '#00f5ff' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(this.nodes.torso.x, this.nodes.torso.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Scientist Head, Hair & Safety Goggles
    const head = this.nodes.head;
    ctx.fillStyle = '#fed7aa'; // Skin tone
    ctx.beginPath();
    ctx.arc(head.x, head.y, head.radius, 0, Math.PI * 2);
    ctx.fill();

    // Wild Scientist Grey Hair
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(head.x - 5, head.y - 7, 5, 0, Math.PI * 2);
    ctx.arc(head.x, head.y - 10, 6, 0, Math.PI * 2);
    ctx.arc(head.x + 5, head.y - 7, 5, 0, Math.PI * 2);
    ctx.fill();

    // Cyan Safety Goggles
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(head.x - 8, head.y - 3, 16, 6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(head.x - 7, head.y - 2, 5, 4);
    ctx.fillRect(head.x + 2, head.y - 2, 5, 4);

    // Hands and Feet Details
    ctx.fillStyle = this.polarity === 1 ? '#ef4444' : this.polarity === -1 ? '#00f5ff' : '#cbd5e1';
    ctx.beginPath();
    ctx.arc(this.nodes.leftHand.x, this.nodes.leftHand.y, 4, 0, Math.PI * 2);
    ctx.arc(this.nodes.rightHand.x, this.nodes.rightHand.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(this.nodes.leftFoot.x, this.nodes.leftFoot.y, 5, 0, Math.PI * 2);
    ctx.arc(this.nodes.rightFoot.x, this.nodes.rightFoot.y, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// =============================================================================
// FERROMAGNETIC DEBRIS (CRATES, GIRDERS, SCRAP SPHERES)
// =============================================================================

export class FerromagneticDebris {
  constructor(options = {}) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.oldX = this.x;
    this.oldY = this.y;
    this.vx = 0;
    this.vy = 0;
    this.type = options.type || 'crate'; // 'crate' | 'girder' | 'sphere'
    this.width = options.width || (this.type === 'girder' ? 68 : 34);
    this.height = options.height || (this.type === 'girder' ? 18 : 34);
    this.radius = options.radius || 18;
    this.mass = options.mass || (this.type === 'girder' ? 3.5 : 2.0);
    this.polarity = options.polarity || 0; // Can be polarized or ferromagnetic neutral (attracted by both poles)
    this.color = options.color || '#64748b';
    this.angle = options.angle || 0;
    this.angularVelocity = 0;
  }

  applyImpulse(ix, iy) {
    this.oldX -= ix / this.mass;
    this.oldY -= iy / this.mass;
  }

  update(dt, gravityY = 650, gravityX = 0) {
    const friction = 0.99;
    const vx = (this.x - this.oldX) * friction;
    const vy = (this.y - this.oldY) * friction;

    this.oldX = this.x;
    this.oldY = this.y;

    this.x += vx + gravityX * dt * dt;
    this.y += vy + gravityY * dt * dt;

    this.vx = (this.x - this.oldX) / dt;
    this.vy = (this.y - this.oldY) / dt;

    // Chamber bounds
    const halfW = this.width * 0.5;
    const halfH = this.height * 0.5;
    if (this.x < 16 + halfW) { this.x = 16 + halfW; this.oldX = this.x; }
    if (this.x > 944 - halfW) { this.x = 944 - halfW; this.oldX = this.x; }
    if (this.y < 16 + halfH) { this.y = 16 + halfH; this.oldY = this.y; }
    if (this.y > 524 - halfH) { this.y = 524 - halfH; this.oldY = this.y; }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.type === 'crate') {
      // Conductive Steel Crate
      ctx.fillStyle = '#334155';
      ctx.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);

      ctx.strokeStyle = this.polarity === 1 ? '#ef4444' : this.polarity === -1 ? '#00f5ff' : '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);

      // Inner diagonal conductive cross
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-this.width * 0.5, -this.height * 0.5);
      ctx.lineTo(this.width * 0.5, this.height * 0.5);
      ctx.moveTo(this.width * 0.5, -this.height * 0.5);
      ctx.lineTo(-this.width * 0.5, this.height * 0.5);
      ctx.stroke();
    } else if (this.type === 'girder') {
      // Heavy Steel Girder
      ctx.fillStyle = '#475569';
      ctx.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);
      // Rivets
      ctx.fillStyle = '#94a3b8';
      for (let rx = -this.width * 0.5 + 8; rx <= this.width * 0.5 - 8; rx += 14) {
        ctx.beginPath();
        ctx.arc(rx, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Scrap Sphere
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }
}

// =============================================================================
// DESTRUCTIBLE REINFORCED GLASS DOOR
// =============================================================================

export class ReinforcedGlassDoor {
  constructor(options = {}) {
    this.x = options.x || 480;
    this.y = options.y || 270;
    this.width = options.width || 18;
    this.height = options.height || 120;
    this.isShattered = false;
    this.health = 100;
  }

  checkCollision(obj, particleSys, cameraShaker) {
    if (this.isShattered) return false;

    // AABB vs Circle/Box collision
    const halfW = this.width * 0.5;
    const halfH = this.height * 0.5;
    const objRadius = obj.radius || 16;

    const closestX = Vec2.clamp(obj.x, this.x - halfW, this.x + halfW);
    const closestY = Vec2.clamp(obj.y, this.y - halfH, this.y + halfH);

    const distSq = Vec2.distSq(obj.x, obj.y, closestX, closestY);

    if (distSq < objRadius * objRadius) {
      const speed = Math.hypot(obj.vx || 0, obj.vy || 0);

      // Impact with high velocity ferromagnetic debris shatters the glass!
      if (speed >= 240) {
        this.isShattered = true;
        sound.playGlassShatter();
        cameraShaker.addTrauma(0.55);
        particleSys.emitGlassShards(this.x, this.y, 36);
        return false;
      } else {
        // Elastic bounce against intact glass
        const dist = Math.sqrt(distSq) || 0.001;
        const nx = (obj.x - closestX) / dist;
        const ny = (obj.y - closestY) / dist;
        obj.x = closestX + nx * objRadius;
        obj.y = closestY + ny * objRadius;
        obj.oldX = obj.x + (obj.vx || 0) * 0.3;
        obj.oldY = obj.y + (obj.vy || 0) * 0.3;
        sound.playMetalClank();
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    if (this.isShattered) return;
    ctx.save();
    ctx.translate(this.x, this.y);

    // Glass panel with cyan transparency & reinforcing mesh
    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);

    // Internal reinforcement wires
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let py = -this.height * 0.5 + 15; py < this.height * 0.5; py += 20) {
      ctx.beginPath();
      ctx.moveTo(-this.width * 0.5, py);
      ctx.lineTo(this.width * 0.5, py);
      ctx.stroke();
    }

    // Danger / Reinforced Warning Stripe
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, 6);
    ctx.fillRect(-this.width * 0.5, this.height * 0.5 - 6, this.width, 6);

    ctx.restore();
  }
}

// =============================================================================
// GERADOR DE PULSO ELETROMAGNÉTICO (EMP PULSE GENERATOR)
// =============================================================================

export class EMPGenerator {
  constructor(options = {}) {
    this.x = options.x || 480;
    this.y = options.y || 120;
    this.radius = options.radius || 24;
    this.pulseInterval = options.pulseInterval || 3.5; // Seconds
    this.timer = options.pulseInterval || 3.5;
    this.blastRadius = options.blastRadius || 260;
    this.strength = options.strength || 650;
  }

  update(dt, ragdoll, debrisList, particleSys, cameraShaker) {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = this.pulseInterval;
      this.triggerBlast(ragdoll, debrisList, particleSys, cameraShaker);
    }
  }

  triggerBlast(ragdoll, debrisList, particleSys, cameraShaker) {
    sound.playEMPBlast();
    cameraShaker.addTrauma(0.6);
    particleSys.emitEMPShockwave(this.x, this.y, this.blastRadius);

    // Repel Dr. Elara
    const distPlayer = Vec2.dist(this.x, this.y, ragdoll.x, ragdoll.y);
    if (distPlayer < this.blastRadius && distPlayer > 1) {
      const forceRatio = 1 - distPlayer / this.blastRadius;
      const nx = (ragdoll.x - this.x) / distPlayer;
      const ny = (ragdoll.y - this.y) / distPlayer;
      ragdoll.applyImpulse(nx * this.strength * forceRatio, ny * this.strength * forceRatio);
    }

    // Repel all Ferromagnetic Debris
    for (const d of debrisList) {
      const distD = Vec2.dist(this.x, this.y, d.x, d.y);
      if (distD < this.blastRadius && distD > 1) {
        const forceRatio = 1 - distD / this.blastRadius;
        const nx = (d.x - this.x) / distD;
        const ny = (d.y - this.y) / distD;
        d.applyImpulse(nx * this.strength * forceRatio * 1.4, ny * this.strength * forceRatio * 1.4);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const chargeRatio = 1 - Math.max(0, this.timer / this.pulseInterval);

    // Radiating charge rings
    ctx.strokeStyle = `rgba(0, 245, 255, ${chargeRatio * 0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + chargeRatio * 16, 0, Math.PI * 2);
    ctx.stroke();

    // EMP Coil Body
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = chargeRatio > 0.8 ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Copper Coils
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    for (let r = 8; r <= this.radius - 4; r += 4) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Glowing Core
    ctx.fillStyle = chargeRatio > 0.8 ? '#ef4444' : '#00f5ff';
    ctx.beginPath();
    ctx.arc(0, 0, 6 + chargeRatio * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// =============================================================================
// PLATAFORMAS DE LEVITAÇÃO MAGNÉTICA (MAGLEV PLATFORMS & RAILS)
// =============================================================================

export class MagLevPlatform {
  constructor(options = {}) {
    this.startX = options.startX || 300;
    this.startY = options.startY || 400;
    this.endX = options.endX || 660;
    this.endY = options.endY || 400;
    this.width = options.width || 80;
    this.height = options.height || 18;
    this.speed = options.speed || 120;
    this.progress = 0; // 0 to 1
    this.direction = 1;
    this.polarity = options.polarity || 1; // North (+1) or South (-1)
    this.x = this.startX;
    this.y = this.startY;
  }

  update(dt, ragdoll) {
    this.progress += (this.speed * dt / Vec2.dist(this.startX, this.startY, this.endX, this.endY)) * this.direction;
    if (this.progress >= 1.0) {
      this.progress = 1.0;
      this.direction = -1;
    } else if (this.progress <= 0.0) {
      this.progress = 0.0;
      this.direction = 1;
    }

    const prevX = this.x;
    const prevY = this.y;
    this.x = Vec2.lerp(this.startX, this.endX, this.progress);
    this.y = Vec2.lerp(this.startY, this.endY, this.progress);
    const platVx = (this.x - prevX) / dt;
    const platVy = (this.y - prevY) / dt;

    // MagLev Carrier Force: if Dr. Elara stands atop or matches polarity
    const halfW = this.width * 0.5 + 16;
    const halfH = this.height * 0.5 + 24;

    if (Math.abs(ragdoll.x - this.x) < halfW && Math.abs(ragdoll.y - this.y) < halfH) {
      if (ragdoll.polarity === this.polarity) {
        // High-velocity levitation glide!
        ragdoll.applyForce(platVx * 0.8 * dt, -420 * dt);
        sound.playMagLevGlide();
      }
    }
  }

  draw(ctx) {
    ctx.save();

    // 1. Guide Rail
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.endX, this.endY);
    ctx.stroke();

    // 2. MagLev Car
    ctx.translate(this.x, this.y);
    const color = this.polarity === 1 ? '#ef4444' : '#00f5ff';

    // Levitating Glow Cushion
    ctx.fillStyle = this.polarity === 1 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 245, 255, 0.3)';
    ctx.fillRect(-this.width * 0.5, this.height * 0.5, this.width, 8);

    // Platform Body
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);

    // Indicator Light
    ctx.fillStyle = color;
    ctx.fillRect(-12, -3, 24, 6);

    ctx.restore();
  }
}

// =============================================================================
// ANOMALIAS DE CAMPO GRAVITACIONAL INVERTIDO (INVERTED GRAVITY ANOMALIES)
// =============================================================================

export class InvertedGravityZone {
  constructor(options = {}) {
    this.x = options.x || 480;
    this.y = options.y || 270;
    this.width = options.width || 180;
    this.height = options.height || 220;
    this.gravityY = options.gravityY ?? -650; // Inverted upward gravity
    this.gravityX = options.gravityX ?? 0;
  }

  contains(px, py) {
    const halfW = this.width * 0.5;
    const halfH = this.height * 0.5;
    return px >= this.x - halfW && px <= this.x + halfW &&
           py >= this.y - halfH && py <= this.y + halfH;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const halfW = this.width * 0.5;
    const halfH = this.height * 0.5;

    // Translucent quantum purple/violet anomaly field
    ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
    ctx.fillRect(-halfW, -halfH, this.width, this.height);

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(-halfW, -halfH, this.width, this.height);
    ctx.setLineDash([]);

    // Upward Floating Inversion Chevron Arrows
    ctx.fillStyle = 'rgba(192, 132, 252, 0.6)';
    const offset = (performance.now() / 25) % 24;
    for (let cy = halfH - offset; cy > -halfH; cy -= 28) {
      ctx.beginPath();
      ctx.moveTo(0, cy - 6);
      ctx.lineTo(8, cy + 4);
      ctx.lineTo(-8, cy + 4);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

// =============================================================================
// INTERRUPTORES MAGNÉTICOS & PORTÕES DE SEGURANÇA
// =============================================================================

export class MagneticSwitch {
  constructor(options = {}) {
    this.x = options.x || 300;
    this.y = options.y || 480;
    this.width = options.width || 44;
    this.height = options.height || 14;
    this.targetGateId = options.targetGateId || 'gate_1';
    this.isActivated = false;
  }

  update(debrisList, ragdoll) {
    let triggered = false;
    const halfW = this.width * 0.5 + 8;
    const halfH = this.height * 0.5 + 8;

    // Triggered by resting ferromagnetic debris
    for (const d of debrisList) {
      if (Math.abs(d.x - this.x) < halfW && Math.abs(d.y - this.y) < halfH) {
        triggered = true;
        break;
      }
    }

    // Or directly by Dr. Elara with matching polarity
    if (!triggered && ragdoll.polarity !== 0) {
      if (Math.abs(ragdoll.x - this.x) < halfW && Math.abs(ragdoll.y - this.y) < halfH) {
        triggered = true;
      }
    }

    if (triggered && !this.isActivated) {
      this.isActivated = true;
      sound.playSwitchTrigger();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = this.isActivated ? '#10b981' : '#f59e0b';
    ctx.fillRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.width * 0.5, -this.height * 0.5, this.width, this.height);

    // Indicator LED
    ctx.fillStyle = this.isActivated ? '#34d399' : '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export class LaserBarrierGate {
  constructor(options = {}) {
    this.id = options.id || 'gate_1';
    this.x = options.x || 600;
    this.y = options.y || 270;
    this.width = options.width || 12;
    this.height = options.height || 140;
    this.isOpen = false;
  }

  checkCollision(ragdoll) {
    if (this.isOpen) return;
    const halfW = this.width * 0.5 + 14;
    const halfH = this.height * 0.5 + 14;

    if (Math.abs(ragdoll.x - this.x) < halfW && Math.abs(ragdoll.y - this.y) < halfH) {
      // Repel and damage
      const sign = ragdoll.x < this.x ? -1 : 1;
      ragdoll.applyImpulse(sign * 380, 0);
      ragdoll.takeDamage(20);
    }
  }

  draw(ctx) {
    if (this.isOpen) return;
    ctx.save();
    ctx.translate(this.x, this.y);

    // Laser Beam with pulsating glow
    const glow = Math.sin(performance.now() / 60) * 0.25 + 0.75;
    ctx.strokeStyle = `rgba(239, 68, 68, ${glow})`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, -this.height * 0.5);
    ctx.lineTo(0, this.height * 0.5);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Laser Emitter Nodes Top/Bottom
    ctx.fillStyle = '#334155';
    ctx.fillRect(-8, -this.height * 0.5 - 10, 16, 12);
    ctx.fillRect(-8, this.height * 0.5 - 2, 16, 12);

    ctx.restore();
  }
}

// =============================================================================
// PORTAL DE SAÍDA (DIMENSIONAL EXTRACTION PORTAL)
// =============================================================================

export class ExitPortal {
  constructor(x = 880, y = 270) {
    this.x = x;
    this.y = y;
    this.radius = 28;
    this.rotation = 0;
  }

  checkReached(ragdoll) {
    const dist = Vec2.dist(this.x, this.y, ragdoll.x, ragdoll.y);
    return dist < this.radius + 18;
  }

  draw(ctx) {
    this.rotation += 0.04;
    ctx.save();
    ctx.translate(this.x, this.y);

    // Swirling Outer Vortex
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, this.radius + 12);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#00f5ff');
    grad.addColorStop(0.7, '#818cf8');
    grad.addColorStop(1, 'rgba(129, 140, 248, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Energy Spokes
    ctx.rotate(this.rotation);
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.quadraticCurveTo(this.radius * 0.7, 8, this.radius, 0);
      ctx.stroke();
      ctx.rotate(Math.PI / 3);
    }

    ctx.restore();
  }
}

// =============================================================================
// LINHA GUIA DE TRAJETÓRIA HOLOGRÁFICA (HOLOGRAPHIC TRAJECTORY ARC)
// =============================================================================

export class TrajectoryPredictor {
  /**
   * Projects simulated ballistic trajectory forward in time
   */
  static predict(startX, startY, initVx, initVy, gravityY, inversionZones, steps = 28, stepDt = 0.035) {
    const points = [];
    let curX = startX;
    let curY = startY;
    let curVx = initVx;
    let curVy = initVy;

    for (let i = 0; i < steps; i++) {
      points.push({ x: curX, y: curY });

      // Check Inverted Gravity Zones along trajectory
      let gY = gravityY;
      for (const zone of inversionZones) {
        if (zone.contains(curX, curY)) {
          gY = zone.gravityY;
          break;
        }
      }

      curVy += gY * stepDt;
      curX += curVx * stepDt;
      curY += curVy * stepDt;

      // Stop if hitting ground or ceiling
      if (curY >= 520 || curY <= 20 || curX <= 20 || curX >= 940) {
        points.push({ x: curX, y: curY });
        break;
      }
    }
    return points;
  }

  static draw(ctx, points, color = '#38bdf8') {
    if (!points || points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 5]);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Impact Crosshair at end of arc
    const last = points[points.length - 1];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
