# 🎮 GDD — Fuga Magnética: A Queda do Cientista

**Nome Comercial**: Fuga Magnética: A Queda do Cientista (Inédito e Inovador)  
**Gênero / Estilo**: Physics Puzzle / Ragdoll  
**Plataforma Alvo**: CrazyGames (HTML5 / WebGL)  
**URL de Entrega / Produção**: [https://fugamagneticaacaidadocientista.kinomuse.com.br](https://fugamagneticaacaidadocientista.kinomuse.com.br)  
**Stack Tecnológica**: Godot 4.7.2 2D (gl_compatibility) + WebGL Canvas + CrazyGames SDK v3  
**Data de Concepção**: 15/10/2026 10:55  
**Arquiteta Mestre de Criação**: Esmeralda (GLX Agent)  

---

## 🌟 1. Identidade de Marca & Introdução Obrigatória
1. **Intro FluidCleb Interactive (0.0s a 2.8s)**:
   - Splash Screen procedural obrigatória em Canvas idêntica aos títulos de referência (*Sobrevivente da Névoa* e *Hydrologic*).
   - Orbes de energia azul subindo (`#00f5ff`, `#38bdf8`, `#0284c7`), fusão central com áudio sintético procedural (`playFluidClebIntro()`), emblema da gota d'água metálica (`#94a3b8` / `#0284c7`), logo em neon `FLUIDCLEB` (38px) e subtítulo `INTERACTIVE` (13px), com barra de progresso suave.
2. **Apresentação em Animação Realista (Intro Narrativa / Lore Interativa)**:
   - Exibida imediatamente após a Splash Screen da FluidCleb.
   - Animação cinematográfica procedural em Canvas com partículas volumétricas, feixes de luz e transição dramática que narra os 3 atos da Lore em até 5 segundos com botões 'Continuar ➔' e 'Pular História'.

---

## 📖 2. Lore, Ambientação & Premissa
Preso em um laboratório secreto onde experimentos de magnetismo deram terrivelmente errado, o Dr. Elara se vê transformado em uma entidade ragdoll, à mercê das forças magnéticas que ele mesmo liberou. Agora, com seu corpo maleável e frágil, ele precisa manipular campos eletromagnéticos para escapar das instalações antes que a instabilidade energética o consuma.

---

## ⚡ 3. Core Gameplay Loop & Controles
O jogador entra em cada nível com o Dr. Elara (ragdoll) e deve manipular campos magnéticos para impulsioná-lo, atraí-lo ou repeli-lo através de obstáculos e armadilhas, alcançando o portal de saída para progredir. Cada fase superada desbloqueia novos desafios e ferramentas magnéticas, aumentando a complexidade e a satisfação da resolução de quebra-cabeças.

---

## 🧩 4. Módulos & Features Aprovados para o Jogo
- **Manipulação de Polaridade Dinâmica**
- **Geradores de Pulso Eletromagnético**
- **Plataformas de Levitação Magnética**
- **Recarga de 'Estabilizador de Matéria' (Rewarded Ad)**
- **Anomalias de Campo Gravitacional Invertido**
- **Objetos Ferromagnéticos Arremessáveis: Detritos de metal (vigas, caixas condutoras) que o Dr. Elara pode atrair ou repelir dinamicamente para quebrar portas de vidro reforçado ou fixar interruptores distantes.**
- **Linha Guia de Trajetória Holográfica: Um indicador visual subtil que mostra a curva física e a força resultante antes de o jogador disparar uma repulsão magnética de alta intensidade.**

---

## 💰 5. Estratégia de Monetização e Requisitos Oficiais CrazyGames
- Rewarded Ad 1: Reviver 1x por tentativa com bônus temático temporário.
- Rewarded Ad 2: Dobrar recursos especiais na tela de vitória.
- Midgame Ads: A cada 3 a 4 minutos estritamente em telas lógicas de intervalo.

### Requisitos Obrigatórios de Publicação CrazyGames (Docs Oficiais):
1. **Gameplay (Land in Gameplay & Física)**:
   - O jogador deve cair na ação em no máximo 1 clique (Play / Pular História direto na partida).
   - Física e movimentação com `deltaTime` (fixed timestep) consistente em 60Hz, 144Hz e 165Hz.
   - Proibido qualquer botão customizado de Fullscreen dentro do canvas (CrazyGames já fornece nativamente).
   - Localização em Inglês (EN) por padrão, com seletor/detecção PT-BR. PEGI 12.
2. **Técnico (Tamanho & Caminhos)**:
   - Bundle inicial ≤ 50MB (≤ 20MB para qualificar para mobile), total ≤ 250MB, máximo 1500 arquivos.
   - Caminhos estritamente relativos no build (`base: './'`), tempo de carga ≤ 20s.
3. **Anúncios & SDK v3 (CrazyGames Ads)**:
   - Chamadas de ciclo `gameplayStart()` e `gameplayStop()`.
   - Mute de áudio e pausa de jogo obrigatórios durante anúncios (`adStarted` -> mudo/pausa; `adFinished`/`adError` -> desmuta/retoma).
   - Rewarded Ads com ícone de vídeo, botão de recusar com mesma visibilidade; se der `adError` (AdBlock), NUNCA premiar.
   - Nunca disparar Midgame Ads durante gameplay ativa.

---

## 🛡️ 6. Protocolo de Validação de Qualidade por 2 Subagentes (QA)
- **Subagente 1 (Mecânica & Fluidez)**: Validação de 60 FPS constantes, física sem travamentos, movimentação precisa, colisão e conformidade com monitores de alta taxa de quadros (144Hz/165Hz).
- **Subagente 2 (Jogabilidade & CrazyGames SDK)**: Validação de interface/HUD responsiva sem sobreposição, efeitos visuais nítidos, localização em inglês e conformidade total com os requisitos oficiais do CrazyGames SDK v3 (mute em ads, pause, land in gameplay).
