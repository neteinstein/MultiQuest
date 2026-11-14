# MultiQuest

Jogo de tabuleiro de perguntas para 2 a 6 jogadores, no mesmo dispositivo. Em português, com suporte para inglês.
*A quiz board game for 2–6 players on one device. Portuguese by default, with English support.*

## Como jogar / How to run

Abra `index.html` num browser — não é preciso instalar nada.
*Open `index.html` in a browser — no build or install needed.*

## Regras

- O tabuleiro tem as casas 1 a 75; todos começam na casa 0.
- Na sua vez, o jogador lança o dado (1–6) e avança esse número de casas.
- Cada casa tem um tema aleatório: **Matemática, História de Portugal, Ciências, Português, Inglês**.
  A pergunta é sempre diferente (não se repete durante o jogo). 4 opções, só 1 certa.
  - Acertou → fica na casa. Errou → volta para onde estava. Depois passa a vez.
- Para ganhar é preciso chegar **exatamente** à casa 75 e acertar a pergunta. Se o dado passar da 75, recua o excesso a partir da 75.
- Se um jogador chegar a uma casa onde já está outro, **quem lá estava primeiro vai para a casa 25**.

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

Atalhos: **Espaço** para lançar o dado, **1–4** para responder.

## Estrutura

- `js/rules.js` — regras puras (movimento, ressalto na 75, casas especiais, colisões)
- `js/questions.js` — perguntas bilingues + geradores (matemática por dificuldade, vocabulário, antónimos)
- `js/avatars.js` — desenhos SVG, movimentos e temas
- `js/game.js` — interface e fluxo de turnos
- `js/i18n.js` — textos PT/EN

## Testes

```sh
node --test tests/*.test.js
```
