/**
 * @fileoverview Complete Level Architecture for Fuga Magnética: A Queda do Cientista
 * 15 Progressive Chambers distributed across 5 Research Sectors of Aethelgard Facility:
 * 
 * - Sector 1 (Chambers 1-3): Magnetics Testing Vault (Polarity switching, basic attraction & repulsion)
 * - Sector 2 (Chambers 4-6): Ferromagnetic Debris Bay (Conductive Crates, Girders, Shattering Glass, Switches)
 * - Sector 3 (Chambers 7-9): MagLev Transit Sector (Levitating platforms, polarity track riding, laser grids)
 * - Sector 4 (Chambers 10-12): Gravity Inversion Lab (Inverted gravity anomalies, ceiling maneuvers)
 * - Sector 5 (Chambers 13-15): Quantum Core Containment (EMP shockwaves, full systemic synergy, facility escape)
 */

export const LEVELS = [
  // ==========================================================
  // SECTOR 1: MAGNETICS TESTING VAULT
  // ==========================================================
  {
    id: 1,
    titleEn: 'Polarity Awakening',
    titlePt: 'Despertar da Polaridade',
    sectorEn: 'Magnetics Vault',
    sectorPt: 'Cofre de Magnetismo',
    color: '#00f5ff',
    hintEn: 'Press Q / E to toggle polarity! Like poles repel, opposite poles attract.',
    hintPt: 'Pressione Q / E para alternar a polaridade! Polos iguais se repelem, polos opostos se atraem.',
    playerStart: { x: 140, y: 380 },
    portal: { x: 860, y: 380 },
    debris: [],
    glassDoors: [],
    empGenerators: [],
    magLevPlatforms: [],
    inversionZones: [],
    switches: [],
    gates: [],
    fixedMagnets: [
      { x: 380, y: 440, polarity: 1, radius: 28 }, // North pole floor repulsion pad
      { x: 620, y: 440, polarity: -1, radius: 28 }  // South pole floor repulsion pad
    ],
    energyCores: [
      { x: 380, y: 240, collected: false },
      { x: 620, y: 240, collected: false }
    ],
    starTimes: { threeStar: 20, twoStar: 35 }
  },
  {
    id: 2,
    titleEn: 'Opposite Attraction',
    titlePt: 'Atração Oposta',
    sectorEn: 'Magnetics Vault',
    sectorPt: 'Cofre de Magnetismo',
    color: '#00f5ff',
    hintEn: 'Match opposite polarities with ceiling magnets (+ and -) to pull yourself upward!',
    hintPt: 'Combine polaridades opostas (+ e -) com os ímãs do teto para se içar ao topo!',
    playerStart: { x: 120, y: 420 },
    portal: { x: 860, y: 160 },
    debris: [],
    glassDoors: [],
    empGenerators: [],
    magLevPlatforms: [],
    inversionZones: [],
    switches: [],
    gates: [],
    fixedMagnets: [
      { x: 300, y: 80, polarity: 1, radius: 30 },
      { x: 540, y: 80, polarity: -1, radius: 30 },
      { x: 740, y: 80, polarity: 1, radius: 30 }
    ],
    energyCores: [
      { x: 300, y: 160, collected: false },
      { x: 540, y: 160, collected: false },
      { x: 740, y: 160, collected: false }
    ],
    starTimes: { threeStar: 25, twoStar: 40 }
  },
  {
    id: 3,
    titleEn: 'Magnetic Slingshot',
    titlePt: 'Estilingue Magnético',
    sectorEn: 'Magnetics Vault',
    sectorPt: 'Cofre de Magnetismo',
    color: '#00f5ff',
    hintEn: 'Click & Drag from Dr. Elara to aim with the Holographic Trajectory line, then release!',
    hintPt: 'Clique e arraste a partir do Dr. Elara para mirar com a Linha Holográfica e solte!',
    playerStart: { x: 120, y: 440 },
    portal: { x: 860, y: 220 },
    debris: [],
    glassDoors: [],
    empGenerators: [],
    magLevPlatforms: [],
    inversionZones: [],
    switches: [],
    gates: [
      { id: 'gate_1', x: 480, y: 340, width: 14, height: 180, isOpen: false }
    ],
    fixedMagnets: [
      { x: 340, y: 440, polarity: 1, radius: 32 }
    ],
    energyCores: [
      { x: 340, y: 200, collected: false },
      { x: 620, y: 160, collected: false },
      { x: 740, y: 220, collected: false }
    ],
    starTimes: { threeStar: 22, twoStar: 38 }
  },

  // ==========================================================
  // SECTOR 2: FERROMAGNETIC DEBRIS BAY
  // ==========================================================
  {
    id: 4,
    titleEn: 'Breaching Glass',
    titlePt: 'Rompendo o Vidro',
    sectorEn: 'Ferromagnetic Bay',
    sectorPt: 'Baía Ferromagnética',
    color: '#38bdf8',
    hintEn: 'Use your magnetic field or sling to hurl the conductive crate into the reinforced glass door!',
    hintPt: 'Use o campo magnético para arremessar a caixa condutora na porta de vidro reforçado!',
    playerStart: { x: 120, y: 420 },
    portal: { x: 880, y: 420 },
    debris: [
      { type: 'crate', x: 260, y: 420, width: 36, height: 36, mass: 2.2, polarity: 1 }
    ],
    glassDoors: [
      { x: 560, y: 400, width: 18, height: 140 }
    ],
    empGenerators: [],
    magLevPlatforms: [],
    inversionZones: [],
    switches: [],
    gates: [],
    fixedMagnets: [],
    energyCores: [
      { x: 400, y: 280, collected: false },
      { x: 720, y: 380, collected: false }
    ],
    starTimes: { threeStar: 25, twoStar: 45 }
  },
  {
    id: 5,
    titleEn: 'Pressure Circuit',
    titlePt: 'Circuito de Pressão',
    sectorEn: 'Ferromagnetic Bay',
    sectorPt: 'Baía Ferromagnética',
    color: '#38bdf8',
    hintEn: 'Position a heavy conductive crate onto the floor switch to disable the laser barrier.',
    hintPt: 'Posicione a caixa condutora sobre o interruptor no chão para desligar a barreira laser.',
    playerStart: { x: 120, y: 420 },
    portal: { x: 880, y: 420 },
    debris: [
      { type: 'crate', x: 280, y: 420, width: 36, height: 36, mass: 2.5, polarity: 0 }
    ],
    glassDoors: [],
    empGenerators: [],
    magLevPlatforms: [],
    inversionZones: [],
    switches: [
      { x: 420, y: 480, width: 48, height: 14, targetGateId: 'gate_laser1' }
    ],
    gates: [
      { id: 'gate_laser1', x: 620, y: 400, width: 12, height: 160, isOpen: false }
    ],
    fixedMagnets: [],
    energyCores: [
      { x: 420, y: 340, collected: false },
      { x: 740, y: 360, collected: false }
    ],
    starTimes: { threeStar: 28, twoStar: 50 }
  },
  {
    id: 6,
    titleEn: 'Heavy Girder Throw',
    titlePt: 'Arremesso de Vigas',
    sectorEn: 'Ferromagnetic Bay',
    sectorPt: 'Baía Ferromagnética',
    color: '#38bdf8',
    hintEn: 'Steel girders have high momentum. Fling the girder to smash through the double glass barrier!',
    hintPt: 'Vigas de aço têm alto momento. Arremesse a viga para estilhaçar a barreira dupla de vidro!',
    playerStart: { x: 120, y: 420 },
    portal: { x: 880, y: 420 },
    debris: [
      { type: 'girder', x: 280, y: 420, width: 72, height: 20, mass: 4.0, polarity: 1 }
    ],
    glassDoors: [
      { x: 500, y: 400, width: 18, height: 140 },
      { x: 660, y: 400, width: 18, height: 140 }
    ],
    empGenerators: [],
    magLevPlatforms: [],
    inversionZones: [],
    switches: [],
    gates: [],
    fixedMagnets: [],
    energyCores: [
      { x: 380, y: 320, collected: false },
      { x: 580, y: 320, collected: false },
      { x: 760, y: 380, collected: false }
    ],
    starTimes: { threeStar: 30, twoStar: 55 }
  },

  // ==========================================================
  // SECTOR 3: MAGLEV TRANSIT SECTOR
  // ==========================================================
  {
    id: 7,
    titleEn: 'MagLev Express',
    titlePt: 'Expresso MagLev',
    sectorEn: 'MagLev Transit',
    sectorPt: 'Trânsito MagLev',
    color: '#fbbf24',
    hintEn: 'Step onto the MagLev platform and set matching polarity (North +) to activate high-speed levitation!',
    hintPt: 'Suba na plataforma MagLev e combine a polaridade (Norte +) para ativar o deslizamento rápido!',
    playerStart: { x: 100, y: 360 },
    portal: { x: 880, y: 360 },
    debris: [],
    glassDoors: [],
    empGenerators: [],
    magLevPlatforms: [
      { startX: 220, startY: 420, endX: 740, endY: 420, width: 90, height: 18, speed: 140, polarity: 1 }
    ],
    inversionZones: [],
    switches: [],
    gates: [],
    fixedMagnets: [],
    energyCores: [
      { x: 380, y: 320, collected: false },
      { x: 560, y: 320, collected: false }
    ],
    starTimes: { threeStar: 25, twoStar: 45 }
  },
  {
    id: 8,
    titleEn: 'Polarity Rail Hop',
    titlePt: 'Salto Entre Trilhos',
    sectorEn: 'MagLev Transit',
    sectorPt: 'Trânsito MagLev',
    color: '#fbbf24',
    hintEn: 'Switch from North (+) to South (-) mid-flight to transfer between opposing MagLev tracks!',
    hintPt: 'Mude de Norte (+) para Sul (-) em pleno voo para saltar entre trilhos MagLev opostos!',
    playerStart: { x: 100, y: 440 },
    portal: { x: 880, y: 180 },
    debris: [],
    glassDoors: [],
    empGenerators: [],
    magLevPlatforms: [
      { startX: 180, startY: 460, endX: 440, endY: 460, width: 80, height: 18, speed: 130, polarity: 1 },
      { startX: 460, startY: 260, endX: 760, endY: 260, width: 80, height: 18, speed: 150, polarity: -1 }
    ],
    inversionZones: [],
    switches: [],
    gates: [],
    fixedMagnets: [],
    energyCores: [
      { x: 300, y: 380, collected: false },
      { x: 580, y: 180, collected: false }
    ],
    starTimes: { threeStar: 28, twoStar: 50 }
  },
  {
    id: 9,
    titleEn: 'Cargo Rail Cannon',
    titlePt: 'Canhão de Carga',
    sectorEn: 'MagLev Transit',
    sectorPt: 'Trânsito MagLev',
    color: '#fbbf24',
    hintEn: 'Ride the MagLev platform while holding a crate, then release it to trigger the elevated switch!',
    hintPt: 'Pegue carona no MagLev segurando a caixa e arremesse-a para acionar o interruptor elevado!',
    playerStart: { x: 100, y: 420 },
    portal: { x: 880, y: 420 },
    debris: [
      { type: 'crate', x: 200, y: 420, width: 36, height: 36, mass: 2.2, polarity: 1 }
    ],
    glassDoors: [],
    empGenerators: [],
    magLevPlatforms: [
      { startX: 180, startY: 460, endX: 520, endY: 460, width: 85, height: 18, speed: 140, polarity: 1 }
    ],
    inversionZones: [],
    switches: [
      { x: 620, y: 160, width: 44, height: 14, targetGateId: 'gate_rail' }
    ],
    gates: [
      { id: 'gate_rail', x: 740, y: 380, width: 12, height: 160, isOpen: false }
    ],
    fixedMagnets: [],
    energyCores: [
      { x: 350, y: 340, collected: false },
      { x: 620, y: 240, collected: false }
    ],
    starTimes: { threeStar: 32, twoStar: 55 }
  },

  // ==========================================================
  // SECTOR 4: GRAVITY INVERSION LAB
  // ==========================================================
  {
    id: 10,
    titleEn: 'Inversion Threshold',
    titlePt: 'Limiar da Inversão',
    sectorEn: 'Gravity Inversion',
    sectorPt: 'Inversão Gravitacional',
    color: '#a855f7',
    hintEn: 'Enter the purple anomaly zone to fall UPWARD toward the ceiling!',
    hintPt: 'Entre na zona roxa de anomalia para cair PARA CIMA em direção ao teto!',
    playerStart: { x: 100, y: 440 },
    portal: { x: 860, y: 120 },
    debris: [],
    glassDoors: [],
    empGenerators: [],
    magLevPlatforms: [],
    inversionZones: [
      { x: 420, y: 270, width: 220, height: 360, gravityY: -700 }
    ],
    switches: [],
    gates: [],
    fixedMagnets: [],
    energyCores: [
      { x: 420, y: 160, collected: false },
      { x: 640, y: 120, collected: false }
    ],
    starTimes: { threeStar: 24, twoStar: 45 }
  },
  {
    id: 11,
    titleEn: 'Ceiling Slide',
    titlePt: 'Deslize no Teto',
    sectorEn: 'Gravity Inversion',
    sectorPt: 'Inversão Gravitacional',
    color: '#a855f7',
    hintEn: 'Inverted gravity lets you run along the ceiling and slide over floor laser hazards.',
    hintPt: 'A gravidade invertida permite correr pelo teto e ultrapassar os lasers do chão.',
    playerStart: { x: 100, y: 440 },
    portal: { x: 880, y: 440 },
    debris: [],
    glassDoors: [],
    empGenerators: [],
    magLevPlatforms: [],
    inversionZones: [
      { x: 360, y: 270, width: 240, height: 380, gravityY: -720 }
    ],
    switches: [],
    gates: [
      { id: 'gate_floor', x: 360, y: 450, width: 200, height: 16, isOpen: false }
    ],
    fixedMagnets: [],
    energyCores: [
      { x: 360, y: 100, collected: false },
      { x: 680, y: 260, collected: false }
    ],
    starTimes: { threeStar: 28, twoStar: 50 }
  },
  {
    id: 12,
    titleEn: 'Gravitational Slalom',
    titlePt: 'Eslalome Gravitacional',
    sectorEn: 'Gravity Inversion',
    sectorPt: 'Inversão Gravitacional',
    color: '#a855f7',
    hintEn: 'Alternate between normal gravity and inverted gravity corridors to navigate past security gates.',
    hintPt: 'Alterne entre corredores de gravidade normal e invertida para superar os portões.',
    playerStart: { x: 100, y: 440 },
    portal: { x: 880, y: 270 },
    debris: [
      { type: 'crate', x: 260, y: 440, width: 36, height: 36, mass: 2.2, polarity: 0 }
    ],
    glassDoors: [
      { x: 740, y: 270, width: 18, height: 160 }
    ],
    empGenerators: [],
    magLevPlatforms: [],
    inversionZones: [
      { x: 380, y: 270, width: 160, height: 380, gravityY: -700 }
    ],
    switches: [],
    gates: [],
    fixedMagnets: [],
    energyCores: [
      { x: 380, y: 120, collected: false },
      { x: 560, y: 380, collected: false }
    ],
    starTimes: { threeStar: 32, twoStar: 55 }
  },

  // ==========================================================
  // SECTOR 5: QUANTUM CORE CONTAINMENT
  // ==========================================================
  {
    id: 13,
    titleEn: 'EMP Resonance',
    titlePt: 'Ressonância EMP',
    sectorEn: 'Quantum Core',
    sectorPt: 'Núcleo Quântico',
    color: '#ef4444',
    hintEn: 'Time your maneuvers! EMP pulse generators emit high-intensity shockwaves that propel metal and ragdolls.',
    hintPt: 'Calcule seus movimentos! O gerador EMP emite ondas de choque que arremessam metal e cientistas.',
    playerStart: { x: 100, y: 440 },
    portal: { x: 880, y: 440 },
    debris: [
      { type: 'crate', x: 280, y: 440, width: 36, height: 36, mass: 2.2, polarity: 1 }
    ],
    glassDoors: [
      { x: 680, y: 400, width: 18, height: 140 }
    ],
    empGenerators: [
      { x: 440, y: 160, radius: 26, pulseInterval: 3.2, blastRadius: 280, strength: 700 }
    ],
    magLevPlatforms: [],
    inversionZones: [],
    switches: [],
    gates: [],
    fixedMagnets: [],
    energyCores: [
      { x: 440, y: 300, collected: false },
      { x: 600, y: 240, collected: false }
    ],
    starTimes: { threeStar: 30, twoStar: 55 }
  },
  {
    id: 14,
    titleEn: 'The Core Gauntlet',
    titlePt: 'O Desafio do Núcleo',
    sectorEn: 'Quantum Core',
    sectorPt: 'Núcleo Quântico',
    color: '#ef4444',
    hintEn: 'MagLev rail, EMP shockwave, and glass barrier combined! Harness the shockwave blast to smash the glass.',
    hintPt: 'Trilho MagLev, pulso EMP e vidro reforçado combinados! Use a onda de choque para quebrar o vidro.',
    playerStart: { x: 100, y: 440 },
    portal: { x: 880, y: 220 },
    debris: [
      { type: 'girder', x: 260, y: 440, width: 72, height: 20, mass: 3.8, polarity: 1 }
    ],
    glassDoors: [
      { x: 680, y: 240, width: 18, height: 160 }
    ],
    empGenerators: [
      { x: 460, y: 420, radius: 26, pulseInterval: 3.6, blastRadius: 260, strength: 680 }
    ],
    magLevPlatforms: [
      { startX: 180, startY: 300, endX: 520, endY: 300, width: 85, height: 18, speed: 130, polarity: 1 }
    ],
    inversionZones: [
      { x: 780, y: 270, width: 140, height: 380, gravityY: -650 }
    ],
    switches: [],
    gates: [],
    fixedMagnets: [],
    energyCores: [
      { x: 340, y: 220, collected: false },
      { x: 580, y: 160, collected: false }
    ],
    starTimes: { threeStar: 35, twoStar: 60 }
  },
  {
    id: 15,
    titleEn: 'Facility Extraction: The Final Fall',
    titlePt: 'Extração: A Queda Final',
    sectorEn: 'Quantum Core',
    sectorPt: 'Núcleo Quântico',
    color: '#ef4444',
    hintEn: 'The ultimate escape! Switch polarities, launch girders, ride MagLevs, and dive into the dimensional portal!',
    hintPt: 'A fuga definitiva! Alterne polaridades, lance vigas, viaje no MagLev e mergulhe no portal dimensional!',
    playerStart: { x: 80, y: 440 },
    portal: { x: 890, y: 120 },
    debris: [
      { type: 'crate', x: 180, y: 440, width: 36, height: 36, mass: 2.4, polarity: 1 },
      { type: 'girder', x: 280, y: 440, width: 72, height: 20, mass: 4.0, polarity: -1 }
    ],
    glassDoors: [
      { x: 480, y: 380, width: 18, height: 160 },
      { x: 740, y: 160, width: 18, height: 160 }
    ],
    empGenerators: [
      { x: 380, y: 160, radius: 28, pulseInterval: 3.0, blastRadius: 260, strength: 720 },
      { x: 620, y: 440, radius: 28, pulseInterval: 3.5, blastRadius: 260, strength: 720 }
    ],
    magLevPlatforms: [
      { startX: 200, startY: 300, endX: 420, endY: 300, width: 80, height: 18, speed: 140, polarity: 1 },
      { startX: 520, startY: 220, endX: 720, endY: 220, width: 80, height: 18, speed: 150, polarity: -1 }
    ],
    inversionZones: [
      { x: 840, y: 270, width: 160, height: 380, gravityY: -720 }
    ],
    switches: [
      { x: 320, y: 480, width: 44, height: 14, targetGateId: 'gate_final' }
    ],
    gates: [
      { id: 'gate_final', x: 440, y: 220, width: 14, height: 140, isOpen: false }
    ],
    fixedMagnets: [
      { x: 120, y: 180, polarity: 1, radius: 28 }
    ],
    energyCores: [
      { x: 200, y: 160, collected: false },
      { x: 500, y: 120, collected: false },
      { x: 680, y: 360, collected: false },
      { x: 840, y: 120, collected: false }
    ],
    starTimes: { threeStar: 45, twoStar: 75 }
  }
];
