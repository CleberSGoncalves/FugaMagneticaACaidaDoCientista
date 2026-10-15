# 🧲 Fuga Magnética: A Queda do Cientista (*Magnetic Escape: The Scientist's Fall*)

> 🎮 Jogo WebGL / HTML5 de Física & Ragdoll Eletromagnético, desenvolvido sob o selo **FluidCleb Interactive** e 100% homologado para os requisitos oficiais do **CrazyGames**.

---

## 🌟 Visão Geral & Especificações

- **Título Comercial**: Fuga Magnética: A Queda do Cientista (*Magnetic Escape: The Scientist's Fall*)
- **URL Pública de Produção**: [https://fugamagneticaacaidadocientista.kinomuse.com.br](https://fugamagneticaacaidadocientista.kinomuse.com.br)
- **Repositório GitHub**: [https://github.com/CleberSGoncalves/FugaMagneticaACaidaDoCientista](https://github.com/CleberSGoncalves/FugaMagneticaACaidaDoCientista)
- **Gênero / Estilo**: Physics Puzzle / Ragdoll
- **Engine & Renderizador**: Canvas 2D / WebGL de Alta Fidelidade + Godot 4.7.2 2D (gl_compatibility)
- **Plataforma Alvo**: CrazyGames (Desktop & Mobile)
- **Resolução Lógica**: `960 x 540` (16:9 responsivo com Letterbox/Pillarbox centralizado)
- **Tamanho do Bundle de Produção**: `< 1 MB` (JS: ~140 KB, CSS: ~25 KB) — qualificado para Mobile Homepage (requisito ≤ 20MB)
- **Tempo de Carga**: `< 1 segundo` (Gráficos e áudio sintetizados proceduralmente em runtime via Web Audio API)

---

## 📖 Lore & Ambientação

Nas profundezas do complexo subterrâneo **Aethelgard Magnetic Research Facility**, experimentos avançados de confinamento quântico saíram terrivelmente de controle. O **Dr. Elara**, físico chefe da instalação, teve sua coesão molecular desfeita pela onda de choque, transformando-se em uma entidade ragdoll maleável e vulnerável, diretamente conectada às correntes magnéticas liberadas.

Agora, com o alarme de destruição iminente soando, ele precisa alternar polaridades dinâmicas, surfar trilhos de levitação magnética e disparar pulsos EMP para superar as defesas automatizadas e alcançar o portal de extração dimensional.

---

## 🎮 Controles & Jogabilidade

### Desktop (Teclado & Mouse)
- **Q**: Alternar para Polaridade **Norte (+)** [Vermelho]
- **E**: Alternar para Polaridade **Sul (-)** [Ciano]
- **Espaço**: Alternar para Polaridade **Neutra (0)** [Prata]
- **Clique + Arrastar**: Mira vetorial com **Linha Guia de Trajetória Holográfica** e disparo de estilingue magnético
- **F / Botão Direito**: Disparo de **Pulso EMP** radial (repele detritos e cientista)
- **A / D ou Setas**: Impulso leve no ar para estabilização corporal
- **R**: Reiniciar câmara atual
- **P / Esc**: Pausar simulação

### Dispositivos Móveis (Touchscreen)
- **Botões de Polaridade**: Seletores rápidos (+, -, 0) no canto inferior
- **Toque & Arraste**: Mira de estilingue com indicador de trajetória
- **Botão EMP**: Disparo de choque eletromagnético no canto inferior direito

---

## 🧩 Módulos & Features Implementadas

1. **Manipulação de Polaridade Dinâmica**:
   - Polos iguais se repelem ($+/+$ ou $-/-$), polos opostos se atraem ($+/-$). Força eletromagnética suave e inversamente proporcional à distância.
2. **Geradores de Pulso Eletromagnético (EMP Pulse)**:
   - Bobinas ativas que acumulam carga e liberam ondas de choque radiais periódicas com anéis de luz e partículas de alta energia.
3. **Plataformas de Levitação Magnética (MagLev)**:
   - Plataformas deslizantes sobre trilhos energizados que transportam Dr. Elara e caixas condutoras em alta velocidade quando alinhadas à mesma polaridade.
4. **Recarga de 'Estabilizador de Matéria' (Rewarded Ad)**:
   - Revive Dr. Elara 1x por tentativa restaurando 100% da integridade com 3 segundos de escudo de invulnerabilidade quântica.
5. **Anomalias de Campo Gravitacional Invertido**:
   - Zonas de distorção cósmica onde a gravidade atua para cima ou para os lados, permitindo manobras no teto.
6. **Objetos Ferromagnéticos Arremessáveis**:
   - Caixas condutoras e vigas de aço que podem ser lançadas para quebrar portas de vidro reforçado ou fixar interruptores distantes.
7. **Linha Guia de Trajetória Holográfica**:
   - Indicador visual pontilhado em neon que calcula e exibe em tempo real a curva parabólica e a força resultante antes do arremesso.
8. **15 Câmaras de Desafio Progressivo**:
   - Distribuídas em 5 setores de pesquisa (Cofre de Magnetismo, Baía Ferromagnética, Trânsito MagLev, Inversão Gravitacional e Núcleo Quântico).

---

## 💰 Integração CrazyGames SDK v3

- **Script Oficial CDN**: `<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>` no `<head>`.
- **Ciclo de Partida**: Chamadas estritas de `gameplayStart()` e `gameplayStop()`.
- **Mute & Pausa em Anúncios**: `setAdCallbacks()` congela a física e silencia o Web Audio durante a exibição de anúncios.
- **Rewarded Ad 1 (Reviver)**: Restaura o Estabilizador de Matéria e 3s de invulnerabilidade. Se o anúncio falhar ou for bloqueado por AdBlock (`adError`), nenhuma recompensa é concedida.
- **Rewarded Ad 2 (2x Células de Energia)**: Dobra a pontuação e os recursos coletados na vitória.
- **Midgame Ads**: Apenas em telas de pausa lógica (vitória/derrota) com intervalo mínimo de 180s ou a cada 3 fases.
- **Land in Gameplay**: Vinheta FluidCleb Interactive (0.0s a 2.8s) com botão **"Skip Story ➔"** presente para entrada no jogo em no máximo 1 clique.
- **Sem Botão de Fullscreen**: Nenhum botão customizado no canvas, respeitando as diretrizes do portal.

---

## 🛠️ Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Compilar build de produção (Vite)
npm run build

# Pré-visualizar build localmente
npm run preview

# Sincronizar com GitHub
backup_github.bat
```

---

## 🛡️ Protocolo de Validação por 2 Subagentes (QA)

- **Subagente 1 (Física & Delta Time)**: Validação de física invariante a 60Hz, 144Hz e 165Hz com fixed timestep (`FIXED_DT = 1/60s`), clamping anti-spiral-of-death e estabilidade do esqueleto Verlet/PBD. **Status: 100% APROVADO**.
- **Subagente 2 (CrazyGames SDK & UX)**: Validação de conformidade SDK v3, ciclos de gameplay, mute em anúncios, 1x revive seguro e responsividade. **Status: 100% APROVADO**.
