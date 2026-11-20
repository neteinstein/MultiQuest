# MultiQuest

Jogo de tabuleiro de perguntas para 2 a 6 jogadores, no mesmo dispositivo. Em português, com suporte para inglês.
*A quiz board game for 2–6 players on one device. Portuguese by default, with English support.*

## Como jogar / How to run

Abra `index.html` num browser — não é preciso instalar nada.
*Open `index.html` in a browser — no build or install needed.*

Online: https://neteinstein.github.io/MultiQuest/ (publicado automaticamente pelo GitHub Actions a cada push para `main`).

### Instalar no telemóvel / Install on your phone

Abra o link no browser do telemóvel e escolha **Instalar app** (Android/Chrome) ou **Partilhar → Adicionar ao ecrã principal** (iPhone/Safari). Depois de instalado abre em ecrã inteiro e funciona sem internet.
*Open the link in your phone's browser and choose **Install app** (Android/Chrome) or **Share → Add to Home Screen** (iPhone/Safari). It then opens full screen and works offline.*

## Regras

- O tabuleiro tem as casas 1 a 75; todos começam na casa 0.
- Na sua vez, o jogador lança o dado (1–6) e avança esse número de casas.
- Cada casa tem um tema aleatório: **Matemática, História de Portugal, Ciências, Português, Inglês**.
  A pergunta é sempre diferente (não se repete durante o jogo). 4 opções, só 1 certa.
  - Acertou → fica na casa e joga outra vez (até 3 vezes seguidas); cada pergunta extra é um nível mais difícil e tem menos 5 segundos (30, 25, 20, 15). Errou → volta para onde estava e passa a vez.
- Cada jogador escolhe a sua dificuldade: **Fácil, Médio, Difícil ou Génio**. As perguntas (e a matemática) seguem esse nível.
- Para ganhar é preciso chegar **exatamente** à casa 75 e acertar a pergunta. Se o dado passar da 75, recua o excesso a partir da 75.
- Se um jogador chegar a uma casa onde já está outro, **quem lá estava primeiro vai para a casa 25**.

### Poderes ⚡

Cada resposta certa dá 1 ⚡ de energia (até 3). Na sua vez, antes de lançar o dado, cada jogador pode usar um poder:

| Poder | Custo | Efeito |
|---|---|---|
| ⚔️ Duelo | 1 | Desafia um jogador até 6 casas de distância. Os dois respondem à mesma pergunta, à vez e sem espreitar (primeiro o desafiado). Ganha a resposta certa mais rápida; quem perde recua 3 casas. |
| ❄️ Congelar | 1 | Um jogador fica uma vez sem jogar. Ninguém é congelado duas vezes seguidas. |
| 🔄 Troca | 2 | Troca de lugar com o jogador logo à frente. |
| 🔥 Pergunta difícil | 1 | A próxima pergunta de um jogador é um nível acima. |
| 🛡️ Escudo | 1 | Bloqueia o próximo ataque e evita ir para a casa 25. |
| 🪤 Armadilha | 1 | Numa casa à escolha: quem lá cair responde a uma pergunta do tema escolhido, um nível acima. |
| 🕵️ Roubar a pergunta | 1 | Quando alguém erra, o jogador seguinte pode responder à mesma pergunta; se acertar, avança as casas que o outro perdeu. |

Cada pergunta tem 30 segundos; se o tempo acabar, conta como errada.

### Casas especiais

| Casa | Efeito |
|---|---|
| 13 | Avança 2 casas e responde à pergunta da nova casa |
| 55 | Avança 1 casa e responde à pergunta da nova casa |
| 27 | Joga outra vez |
| 10 | Fica 1 vez sem jogar |
| 7, 12, 73 | Teletransporte para a casa 21 |

### Avatares

Guerreiro, Lince, Árvore, Pedra, Luís de Camões, Shakespeare e Bola de futebol — cada um com o seu movimento
(marcha, salta, balança, rebola, navega, rodopia, quica). Cada jogador tem uma cor diferente.
O tema do tabuleiro muda conforme o avatar de quem está a jogar.

Durante o jogo o ecrã mostra só o tabuleiro (ajustado ao ecrã, sem scroll) e, em baixo, o jogador da vez com o dado.
O botão ☰ abre os jogadores, a legenda e o histórico.

Atalhos: **Espaço** para lançar o dado, **1–4** para responder.

## Estrutura

- `js/rules.js` — regras puras (movimento, ressalto na 75, casas especiais, colisões)
- `js/questions.js` — perguntas bilingues + geradores (matemática por dificuldade, vocabulário, antónimos)
- `js/avatars.js` — desenhos SVG, movimentos e temas
- `js/game.js` — interface e fluxo de turnos
- `manifest.webmanifest`, `sw.js`, `icons/` — app instalável (PWA) e modo offline
- `js/i18n.js` — textos PT/EN

## Testes

```sh
npm test              # regras e banco de perguntas
npm run test:smoke    # joga um jogo completo no Chromium (precisa do Playwright)
```

## Integração contínua e publicação

- **Pull requests** — `.github/workflows/ci.yml` valida cada PR: sintaxe, testes unitários e um jogo completo num browser headless.
- **Merge para `main`** — `.github/workflows/pages.yml` corre a mesma validação e, se passar, publica no GitHub Pages.
