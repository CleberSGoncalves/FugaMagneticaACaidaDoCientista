/**
 * @fileoverview Complete Internationalization (i18n) Engine for Fuga Magnética: A Queda do Cientista
 * Supports English (default) and Portuguese (PT-BR) with auto-detection and runtime switching.
 */

export const TRANSLATIONS = {
  en: {
    // Title & Intro
    game_title: "Magnetic Escape: The Scientist's Fall",
    game_subtitle: 'Aethelgard Magnetic Research Facility',
    brand_title: 'FLUIDCLEB',
    brand_subtitle: 'INTERACTIVE',
    skip_intro: 'Skip Story ➔',
    continue_btn: 'Continue ➔',

    // Lore Acts
    lore_act1_title: 'ACT I: CONTAINMENT BREACH',
    lore_act1_body: 'Deep inside the subterranean Aethelgard Facility, Dr. Elara pushed electromagnetic compression beyond theoretical limits. The magnetic confinement sphere violently imploded.',
    
    lore_act2_title: 'ACT II: MOLECULAR DESTABILIZATION',
    lore_act2_body: 'The radioactive flux disintegrated Dr. Elara’s skeletal rigidity, leaving him as a fragile, maleable ragdoll entity deeply bound to dynamic electromagnetic fields.',

    lore_act3_title: 'ACT III: THE SCIENTIST’S ESCAPE',
    lore_act3_body: 'Facility safety protocols have locked all sectors! Dr. Elara must harness polarity reversal, maglev platforms, and EMP shockwaves to reach the dimensional extraction portal before energy collapse!',

    // HUD & Controls
    hud_level: 'CHAMBER',
    hud_sector: 'SECTOR',
    hud_stabilizer: 'MATTER STABILIZER',
    hud_polarity: 'POLARITY',
    polarity_north: 'NORTH (+)',
    polarity_south: 'SOUTH (-)',
    polarity_neutral: 'NEUTRAL (0)',
    hud_emp_burst: 'EMP PULSE',
    hud_cores: 'ENERGY CORES',
    hud_time: 'TIME',
    hud_score: 'SCORE',
    hud_trajectory_guide: 'Holographic Trajectory',
    hud_hint: 'Hint',

    // Desktop Controls
    ctrl_polarity_north: 'Q: North (+)',
    ctrl_polarity_south: 'E: South (-)',
    ctrl_polarity_neutral: 'Space: Neutral',
    ctrl_emp_pulse: 'F / Right-Click: EMP Burst',
    ctrl_aim_sling: 'Click + Drag: Magnetic Sling',
    ctrl_nudge: 'A / D: Nudge Body',

    // Mobile Action Buttons
    mobile_north: 'NORTH (+)',
    mobile_south: 'SOUTH (-)',
    mobile_neutral: 'NEUTRAL (0)',
    mobile_emp: 'EMP BLAST',

    // In-Game Feedback & Mechanics
    msg_glass_shattered: 'GLASS DOOR SHATTERED!',
    msg_switch_activated: 'MAGNETIC SWITCH ACTIVATED!',
    msg_portal_online: 'EXTRACTION PORTAL ONLINE!',
    msg_emp_ready: 'EMP READY!',
    msg_emp_charging: 'EMP CHARGING...',
    msg_inverted_gravity: 'INVERTED GRAVITY FIELD DETECTED!',
    msg_maglev_engaged: 'MAGLEV TRACK ENGAGED!',
    msg_like_poles_repel: 'LIKE POLES REPEL (+ / + or - / -)!',
    msg_opposite_attract: 'OPPOSITE POLES ATTRACT (+ / -)!',

    // Modals
    modal_pause_title: 'SIMULATION SUSPENDED',
    modal_resume: 'Resume Chamber',
    modal_restart: 'Restart Chamber',
    modal_level_select: 'Select Chamber',
    modal_settings: 'Settings',

    // Settings Modal
    settings_title: 'LABORATORY CONTROLS & AUDIO',
    settings_master_vol: 'Master Volume',
    settings_sfx_vol: 'SFX Volume',
    settings_bgm_vol: 'Synthesizer BGM',
    settings_mute_all: 'Mute All Audio',
    settings_trajectory_toggle: 'Holographic Trajectory Line',
    settings_screenshake_toggle: 'Screen Shake & Trauma',
    settings_language: 'Interface Language',
    settings_close: 'Close Settings',

    // Level Select Modal
    level_select_title: 'CHAMBERS ARCHIVE',
    level_locked: 'LOCKED',
    level_completed: 'CLEARED',
    level_stars: 'Stars',

    // Victory Modal
    victory_title: 'CHAMBER CONTAINED!',
    victory_subtitle: 'Extraction Portal Successfully Reached',
    victory_time: 'Completion Time',
    victory_cores: 'Energy Cores Recovered',
    victory_score: 'Chamber Score',
    victory_double_cores_ad: 'Double Energy Cores (Watch Ad)',
    victory_next: 'Next Chamber ➔',
    victory_retry: 'Play Again',

    // Game Over / Molecular Decay Modal
    gameover_title: 'MOLECULAR COHESION COLLAPSED!',
    gameover_subtitle: 'Dr. Elara’s matter stabilizer depleted',
    gameover_revive_ad: 'Recharge Matter Stabilizer (Revive 1x)',
    gameover_give_up: 'Restart Chamber',
    gameover_revive_desc: 'Instantly restore 100% cohesion with 3s Quantum Invulnerability shield!',

    // CrazyGames & Ads Status
    ad_loading: 'Loading Transmission...',
    ad_blocked: 'Transmission blocked or unavailable.',
    ad_reward_granted: 'Matter Stabilizer Recharged!'
  },

  pt: {
    // Título & Intro
    game_title: 'Fuga Magnética: A Queda do Cientista',
    game_subtitle: 'Complexo de Pesquisa Magnética Aethelgard',
    brand_title: 'FLUIDCLEB',
    brand_subtitle: 'INTERACTIVE',
    skip_intro: 'Pular História ➔',
    continue_btn: 'Continuar ➔',

    // Lore Atos
    lore_act1_title: 'ATO I: RUPTURA DE CONTENÇÃO',
    lore_act1_body: 'Nas profundezas do complexo subterrâneo Aethelgard, o Dr. Elara forçou a compressão eletromagnética além dos limites seguros. A esfera de confinamento colapsou em uma terrível explosão.',

    lore_act2_title: 'ATO II: DESESTABILIZAÇÃO MOLECULAR',
    lore_act2_body: 'O fluxo ionizante desfez a rigidez esquelética do cientista, transformando o Dr. Elara em uma entidade ragdoll maleável e vulnerável, à mercê dos campos magnéticos que ele mesmo liberou.',

    lore_act3_title: 'ATO III: A FUGA DO CIENTISTA',
    lore_act3_body: 'Os sistemas de segurança trancaram o complexo! O Dr. Elara precisa manipular polaridades, trilhos de levitação magnética e pulsos EMP para alcançar o portal de fuga antes do colapso térmico total!',

    // HUD & Controles
    hud_level: 'CÂMARA',
    hud_sector: 'SETOR',
    hud_stabilizer: 'ESTABILIZADOR DE MATÉRIA',
    hud_polarity: 'POLARIDADE',
    polarity_north: 'NORTE (+)',
    polarity_south: 'SUL (-)',
    polarity_neutral: 'NEUTRO (0)',
    hud_emp_burst: 'PULSO EMP',
    hud_cores: 'CÉLULAS DE ENERGIA',
    hud_time: 'TEMPO',
    hud_score: 'PONTUAÇÃO',
    hud_trajectory_guide: 'Guia de Trajetória',
    hud_hint: 'Dica',

    // Controles Desktop
    ctrl_polarity_north: 'Q: Norte (+)',
    ctrl_polarity_south: 'E: Sul (-)',
    ctrl_polarity_neutral: 'Espaço: Neutro',
    ctrl_emp_pulse: 'F / Botão Direito: Disparo EMP',
    ctrl_aim_sling: 'Clique + Arraste: Estilingue Magnético',
    ctrl_nudge: 'A / D: Impulso Leve',

    // Botões Mobile
    mobile_north: 'NORTE (+)',
    mobile_south: 'SUL (-)',
    mobile_neutral: 'NEUTRO (0)',
    mobile_emp: 'PULSO EMP',

    // Mensagens em Jogo
    msg_glass_shattered: 'PORTA DE VIDRO ESTILHAÇADA!',
    msg_switch_activated: 'INTERRUPTOR MAGNÉTICO ATIVADO!',
    msg_portal_online: 'PORTAL DE EXTRAÇÃO ATIVADO!',
    msg_emp_ready: 'EMP PRONTO!',
    msg_emp_charging: 'CARREGANDO EMP...',
    msg_inverted_gravity: 'ANOMALIA DE GRAVIDADE INVERTIDA!',
    msg_maglev_engaged: 'TRILHO MAGLEV ENERGIZADO!',
    msg_like_poles_repel: 'POLOS IGUAIS SE REPELEM (+ / + ou - / -)!',
    msg_opposite_attract: 'POLOS OPOSTOS SE ATRAEM (+ / -)!',

    // Modais
    modal_pause_title: 'SIMULAÇÃO PAUSADA',
    modal_resume: 'Retomar Câmara',
    modal_restart: 'Reiniciar Câmara',
    modal_level_select: 'Selecionar Câmara',
    modal_settings: 'Configurações',

    // Configurações
    settings_title: 'CONTROLES DO LABORATÓRIO & ÁUDIO',
    settings_master_vol: 'Volume Geral',
    settings_sfx_vol: 'Efeitos Sonoros (SFX)',
    settings_bgm_vol: 'Sintetizador BGM',
    settings_mute_all: 'Silenciar Todo o Áudio',
    settings_trajectory_toggle: 'Linha de Trajetória Holográfica',
    settings_screenshake_toggle: 'Tremor de Tela (Trauma)',
    settings_language: 'Idioma da Interface',
    settings_close: 'Fechar Configurações',

    // Seleção de Câmaras
    level_select_title: 'ARQUIVO DE CÂMARAS',
    level_locked: 'BLOQUEADO',
    level_completed: 'CONCLUÍDO',
    level_stars: 'Estrelas',

    // Modal de Vitória
    victory_title: 'CÂMARA CONCLUÍDA!',
    victory_subtitle: 'Portal de Extração Alcançado com Sucesso',
    victory_time: 'Tempo da Fuga',
    victory_cores: 'Células de Energia Resgatadas',
    victory_score: 'Pontuação da Câmara',
    victory_double_cores_ad: 'Dobrar Células de Energia (Ver Anúncio)',
    victory_next: 'Próxima Câmara ➔',
    victory_retry: 'Jogar Novamente',

    // Modal de Game Over
    gameover_title: 'COESÃO MOLECULAR COLAPSADA!',
    gameover_subtitle: 'O estabilizador de matéria do Dr. Elara esgotou',
    gameover_revive_ad: 'Recarregar Estabilizador de Matéria (Reviver 1x)',
    gameover_give_up: 'Reiniciar Câmara',
    gameover_revive_desc: 'Restaure 100% de coesão com 3s de Escudo Quântico de Invulnerabilidade!',

    // CrazyGames Anúncios
    ad_loading: 'Carregando Transmissão...',
    ad_blocked: 'Transmissão bloqueada ou indisponível.',
    ad_reward_granted: 'Estabilizador de Matéria Recarregado!'
  }
};

class I18nManager {
  constructor() {
    this.currentLang = this.detectInitialLanguage();
    this.listeners = new Set();
  }

  detectInitialLanguage() {
    try {
      const saved = localStorage.getItem('fuga_magnetica_lang');
      if (saved && (saved === 'en' || saved === 'pt')) {
        return saved;
      }
      const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (navLang.startsWith('pt')) {
        return 'pt';
      }
    } catch (e) {
      // Fallback
    }
    return 'en'; // Padrão CrazyGames: Inglês
  }

  setLanguage(lang) {
    if (lang !== 'en' && lang !== 'pt') return;
    this.currentLang = lang;
    try {
      localStorage.setItem('fuga_magnetica_lang', lang);
      document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    } catch (e) {}
    this.notify();
  }

  getLanguage() {
    return this.currentLang;
  }

  toggleLanguage() {
    this.setLanguage(this.currentLang === 'en' ? 'pt' : 'en');
  }

  t(key, fallback = '') {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
    if (dict[key] !== undefined) return dict[key];
    const enDict = TRANSLATIONS.en;
    if (enDict[key] !== undefined) return enDict[key];
    return fallback || key;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentLang);
      } catch (e) {
        console.error('[i18n] Listener error:', e);
      }
    }
  }
}

export const i18n = new I18nManager();
