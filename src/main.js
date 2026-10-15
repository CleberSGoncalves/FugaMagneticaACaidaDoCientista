/**
 * @fileoverview Main Entry Point for Fuga Magnética: A Queda do Cientista
 * Orchestrates CrazyGames SDK initialization, audio context setup,
 * FluidCleb Interactive intro / Lore sequence, HUD, and Game Engine.
 */

import './style.css';
import { crazyGames } from './crazygames.js';
import { sound } from './audio.js';
import { GameHUD } from './hud.js';
import { GameEngine } from './game.js';
import { CinematicIntro } from './splash.js';

window.addEventListener('DOMContentLoaded', async () => {
  console.log('[Main] Bootstrapping Fuga Magnética: A Queda do Cientista...');

  // 1. Initialize CrazyGames SDK v3 (resilient against AdBlock)
  await crazyGames.init();

  const canvas = document.getElementById('game-canvas');
  const stage = document.getElementById('game-stage');

  let engine = null;

  // 2. Instantiate HUD with callbacks
  const hud = new GameHUD(stage, {
    onPause: () => {
      if (engine) engine.isPaused = true;
    },
    onResume: () => {
      if (engine) engine.isPaused = false;
    },
    onRestart: () => {
      if (engine) {
        engine.isPaused = false;
        engine.loadLevel(engine.currentLevelIndex);
      }
    },
    onNextLevel: () => {
      if (engine) {
        engine.isPaused = false;
        engine.loadLevel(engine.currentLevelIndex + 1);
      }
    },
    onSelectLevel: (lvlId) => {
      if (engine) {
        engine.isPaused = false;
        engine.loadLevel(lvlId - 1);
      }
    },
    onSetPolarity: (polarity) => {
      if (engine && engine.player) {
        engine.player.setPolarity(polarity);
      }
    },
    onTriggerEMP: () => {
      if (engine) {
        engine.triggerPlayerEMP();
      }
    },
    onRevive: () => {
      if (engine && engine.player) {
        engine.isPaused = false;
        engine.isHandlingGameOver = false;
        engine.player.reviveWithStabilizer();
      }
    }
  });

  // 3. Register CrazyGames Ad callbacks for sound muting and physics freeze
  crazyGames.setAdCallbacks(
    // On Ad Pause:
    () => {
      sound.setAdMuted(true);
      if (engine) engine.isAdPaused = true;
    },
    // On Ad Resume:
    () => {
      sound.setAdMuted(false);
      if (engine) engine.isAdPaused = false;
    }
  );

  // 4. Instantiate Main Game Engine
  engine = new GameEngine(canvas, hud);

  // 5. Official FluidCleb Interactive Intro (0.0s to 2.8s) + Lore Presentation with Skip button
  const intro = new CinematicIntro(document.body, () => {
    console.log('[Main] Intro concluded or skipped. Starting chamber simulation...');
    engine.start();
  });

  intro.start();
});
