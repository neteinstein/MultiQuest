/* MultiQuest — interface text in Portuguese (default) and English. */
(function (root) {
  'use strict';

  var STRINGS = {
    pt: {
      subtitle: 'O jogo de tabuleiro das perguntas',
      language: 'Idioma',
      rules: 'Regras',
      newGame: 'Novo jogo',
      setupTitle: 'Preparar o jogo',
      numPlayers: 'Número de jogadores',
      playerN: 'Jogador {n}',
      name: 'Nome',
      avatar: 'Avatar',
      color: 'Cor',
      colorTaken: 'Esta cor já foi escolhida',
      start: 'Começar o jogo',
      powers: 'Poderes',
      streakBadge: '🔥 Série {n} · {s} s',
      msg_powerHint: '{name} ganhou ⚡! Na tua vez, toca em ⚡ Poderes antes de lançar o dado.',
      msg_timeout: 'O tempo acabou!',
      timeLeft: 'Tempo restante',
      powersTitle: 'Poderes de {name}',
      powersHint: 'Cada resposta certa dá 1 ⚡ (máx. 3). Usa um poder por vez, antes de lançar o dado.',
      power_duel: 'Duelo',
      power_freeze: 'Congelar',
      power_swap: 'Troca',
      power_hard: 'Pergunta difícil',
      power_shield: 'Escudo',
      power_trap: 'Armadilha',
      power_steal: 'Roubar a pergunta',
      desc_duel: 'Desafia um jogador até 6 casas de distância. A mesma pergunta para os dois: ganha a resposta certa mais rápida e quem perde recua 3 casas.',
      desc_freeze: 'Um jogador fica uma vez sem jogar. Ninguém é congelado duas vezes seguidas.',
      desc_swap: 'Troca de lugar com o jogador logo à tua frente.',
      desc_hard: 'A próxima pergunta de um jogador é um nível mais difícil.',
      desc_shield: 'Bloqueia o próximo ataque e protege-te de ir para a casa 25.',
      desc_trap: 'Põe uma armadilha numa casa: quem lá cair responde a uma pergunta do tema que escolheres, um nível mais difícil.',
      why_energy: 'Precisas de {n} ⚡',
      why_noTarget: 'Ninguém ao alcance',
      why_hasShield: 'Já tens escudo',
      why_noneAhead: 'Ninguém à tua frente',
      why_used: 'Já usaste um poder nesta vez',
      pickTarget: 'Escolhe o alvo',
      back: 'Voltar',
      cancel: 'Cancelar',
      pickTrapSquare: 'Toca numa casa para pôr a armadilha 🪤',
      pickTrapTopic: 'Que tema terá a armadilha?',
      shielded: 'Escudo',
      frozen: 'Congelado',
      cursed: 'Pergunta difícil',
      msg_shieldUp: '{name} ergue um escudo 🛡️',
      msg_shieldBlock: 'O escudo de {name} bloqueou o ataque! 🛡️',
      msg_shieldSave: 'O escudo de {name} evitou a casa 25! 🛡️',
      msg_freeze: '{name} congelou {target} ❄️: perde a próxima vez.',
      msg_swap: '{name} trocou de lugar com {target} 🔄',
      msg_hard: '{name} preparou uma pergunta difícil para {target} 🔥',
      msg_hardNow: 'Pergunta difícil para {name}! 🔥',
      msg_trapSet: '{name} pôs uma armadilha na casa {n} 🪤',
      msg_trapSprung: '{name} caiu na armadilha de {owner}! 🪤',
      msg_duel: '{name} desafiou {target} para um duelo ⚔️',
      msg_duelWin: '{winner} ganhou o duelo! {loser} recua 3 casas.',
      msg_duelDraw: 'Duelo empatado: ninguém recua.',
      msg_steal: '{name} roubou a pergunta e avança {n} casas!',
      msg_stealMiss: '{name} tentou roubar a pergunta, mas errou.',
      stealTitle: 'Roubar a pergunta?',
      stealText: '{loser} errou. {name}, gastas 1 ⚡ para responder? Se acertares, avanças {n} casas.',
      stealYes: 'Roubar (1 ⚡)',
      stealNo: 'Não',
      duelTitle: 'Duelo!',
      duelVs: '{name} desafia {target}',
      duelPass: 'Passa o dispositivo a {name}. {other}, não espreites!',
      duelReady: 'Sou {name}: estou pronto',
      duelResult: 'Resultado do duelo',
      duelNoAnswer: 'sem resposta',
      nextPlayer: 'Seguinte',
      prevPlayer: 'Jogador anterior',
      goToPlayer: 'Ir para o jogador {n}',
      roll: 'Lançar o dado',
      rollHint: 'Espaço para lançar',
      turnOf: 'Vez de',
      house: 'Casa {n}',
      start0: 'Partida',
      skipBadge: 'Sem jogar',
      players: 'Jogadores',
      legend: 'Legenda',
      log: 'Histórico',
      continue: 'Continuar',
      answerHint: 'Teclas 1–4 para responder',
      playAgain: 'Jogar outra vez',
      samePlayers: 'Mesmos jogadores',
      winnerTitle: 'Temos um vencedor!',
      winner: '{name} chegou à casa 75 e venceu!',
      confirmNew: 'Começar um novo jogo? O jogo atual será perdido.',
      close: 'Fechar',
      more: 'Ver jogadores, legenda e histórico',
      details: 'Detalhes do jogo',
      difficulty: 'Dificuldade',
      diff_1: 'Fácil',
      diff_2: 'Médio',
      diff_3: 'Difícil',
      diff_4: 'Génio',

      topic_math: 'Matemática',
      topic_history: 'História de Portugal',
      topic_science: 'Ciências',
      topic_physics: 'Física',
      topic_chemistry: 'Química',
      topic_portuguese: 'Português',
      topic_english: 'Inglês',

      avatar_warrior: 'Guerreiro',
      avatar_lynx: 'Lince',
      avatar_tree: 'Árvore',
      avatar_rock: 'Pedra',
      avatar_camoes: 'Luís de Camões',
      avatar_shakespeare: 'Shakespeare',
      avatar_ball: 'Bola de futebol',

      motion_warrior: 'Marcha',
      motion_lynx: 'Salta',
      motion_tree: 'Balança',
      motion_rock: 'Rebola',
      motion_camoes: 'Navega',
      motion_shakespeare: 'Rodopia',
      motion_ball: 'Quica',

      special_advance: '+{n}',
      special_again: 'Joga outra vez',
      special_skip: '1 vez sem jogar',
      special_teleport: '→ 21',

      msg_rolled: '{name} tirou {n}.',
      msg_bounce: 'Passou da casa 75! Recua {n}.',
      msg_advance: 'Casa {house}: avança {n} e responde!',
      msg_again: 'Casa 27: {name} joga outra vez!',
      msg_skip: 'Casa 10: {name} fica uma vez sem jogar.',
      msg_teleport: 'Casa {house}: teletransporte para a casa 21!',
      msg_correct: 'Certo! {name} fica na casa {n}.',
      msg_bonus: 'Certo! {name} joga outra vez ({k}/{max}).',
      msg_bonusMax: '{name} já jogou {max} vezes extra seguidas — passa a vez.',
      msg_wrong: 'Errado! {name} volta para a casa {n}.',
      msg_rightWas: 'A resposta certa era: {a}',
      msg_collision: '{victim} estava na casa {n} primeiro e vai para a casa 25!',
      msg_skipped: '{name} perde a vez.',
      msg_turn: 'Vez de {name}.',
      msg_win: '{name} venceu!',
      msg_correctShort: 'Certo!',
      msg_wrongShort: 'Errado!',

      rulesTitle: 'Como jogar',
      rulesHtml:
        '<ul>' +
        '<li>2 a 6 jogadores, no mesmo dispositivo. Todos começam na casa 0.</li>' +
        '<li>Na sua vez, cada jogador lança o dado (1–6) e avança esse número de casas.</li>' +
        '<li>Cada casa tem um tema: Matemática, História de Portugal, Ciências, Português ou Inglês. A pergunta é sempre diferente.</li>' +
        '<li>Há 4 opções e só 1 está certa. Acertou? Fica na casa e joga outra vez (até 3 vezes seguidas), mas cada pergunta extra é um nível mais difícil e tem menos 5 segundos. Errou? Volta para onde estava e passa a vez.</li>' +
        '<li>Tens 30 segundos para responder; se o tempo acabar, conta como errado.</li>' +
        '<li>Cada jogador escolhe a sua dificuldade (Fácil, Médio, Difícil ou Génio) e recebe perguntas desse nível. No nível Génio, as casas de Ciências trazem sobretudo perguntas de Física e Química.</li>' +
        '<li>Para ganhar é preciso chegar exatamente à casa 75 e acertar a pergunta. Se o dado passar da 75, recua o excesso a partir da 75.</li>' +
        '<li>Se chegar a uma casa onde já está outro jogador, quem lá estava primeiro vai para a casa 25.</li>' +
        '</ul>' +
        '<h3>Casas especiais</h3>' +
        '<ul>' +
        '<li><b>13</b> — avança 2 casas e responde à pergunta.</li>' +
        '<li><b>55</b> — avança 1 casa e responde à pergunta.</li>' +
        '<li><b>27</b> — joga outra vez.</li>' +
        '<li><b>10</b> — fica 1 vez sem jogar.</li>' +
        '<li><b>7, 12 e 73</b> — teletransporte para a casa 21.</li>' +
        '</ul>' +
        '<h3>Poderes ⚡</h3>' +
        '<p>Cada resposta certa dá 1 ⚡ de energia (guardas até 3). Na tua vez, antes de lançar o dado, podes usar um poder:</p>' +
        '<ul>' +
        '<li><b>⚔️ Duelo (1 ⚡)</b> — desafia um jogador até 6 casas de distância. Os dois respondem à mesma pergunta, à vez e sem espreitar (primeiro o desafiado). Ganha a resposta certa mais rápida; quem perde recua 3 casas.</li>' +
        '<li><b>❄️ Congelar (1 ⚡)</b> — um jogador fica uma vez sem jogar. Ninguém é congelado duas vezes seguidas.</li>' +
        '<li><b>🔄 Troca (2 ⚡)</b> — trocas de lugar com o jogador logo à tua frente.</li>' +
        '<li><b>🔥 Pergunta difícil (1 ⚡)</b> — a próxima pergunta de um jogador é um nível acima.</li>' +
        '<li><b>🛡️ Escudo (1 ⚡)</b> — bloqueia o próximo ataque e protege-te de ir para a casa 25.</li>' +
        '<li><b>🪤 Armadilha (1 ⚡)</b> — escolhes uma casa e um tema. Quem lá cair a seguir responde a uma pergunta desse tema, um nível acima.</li>' +
        '<li><b>🕵️ Roubar a pergunta (1 ⚡)</b> — quando alguém erra, o jogador seguinte pode responder à mesma pergunta. Se acertar, avança as casas que o outro perdeu.</li>' +
        '</ul>' +
        '<p>O tema do tabuleiro muda conforme o avatar de quem está a jogar.</p>' +
        '<p>Atalhos: Espaço ou Enter para lançar o dado, teclas 1–4 para responder.</p>'
    },
    en: {
      subtitle: 'The quiz board game',
      language: 'Language',
      rules: 'Rules',
      newGame: 'New game',
      setupTitle: 'Set up the game',
      numPlayers: 'Number of players',
      playerN: 'Player {n}',
      name: 'Name',
      avatar: 'Avatar',
      color: 'Colour',
      colorTaken: 'This colour is already taken',
      start: 'Start game',
      powers: 'Powers',
      streakBadge: '🔥 Streak {n} · {s} s',
      msg_powerHint: '{name} earned ⚡! On your turn, tap ⚡ Powers before you roll.',
      msg_timeout: "Time's up!",
      timeLeft: 'Time left',
      powersTitle: "{name}'s powers",
      powersHint: 'Every right answer earns 1 ⚡ (up to 3). Use one power per turn, before you roll.',
      power_duel: 'Duel',
      power_freeze: 'Freeze',
      power_swap: 'Swap',
      power_hard: 'Hard question',
      power_shield: 'Shield',
      power_trap: 'Trap',
      power_steal: 'Steal the question',
      desc_duel: 'Challenge a player within 6 squares. Same question for both: the fastest right answer wins and the loser goes back 3 squares.',
      desc_freeze: 'A player misses their next turn. Nobody can be frozen twice in a row.',
      desc_swap: 'Swap places with the player just ahead of you.',
      desc_hard: "A player's next question is one level harder.",
      desc_shield: 'Blocks the next attack and saves you from being sent to square 25.',
      desc_trap: 'Set a trap on a square: whoever lands there next answers a question on the subject you pick, one level harder.',
      why_energy: 'Needs {n} ⚡',
      why_noTarget: 'Nobody in range',
      why_hasShield: 'Already shielded',
      why_noneAhead: 'Nobody ahead of you',
      why_used: 'One power per turn',
      pickTarget: 'Pick a target',
      back: 'Back',
      cancel: 'Cancel',
      pickTrapSquare: 'Tap a square to set your trap 🪤',
      pickTrapTopic: 'Which subject for the trap?',
      shielded: 'Shield',
      frozen: 'Frozen',
      cursed: 'Hard question',
      msg_shieldUp: '{name} raises a shield 🛡️',
      msg_shieldBlock: "{name}'s shield blocked the attack! 🛡️",
      msg_shieldSave: "{name}'s shield saved them from house 25! 🛡️",
      msg_freeze: '{name} froze {target} ❄️: they miss their next turn.',
      msg_swap: '{name} swapped places with {target} 🔄',
      msg_hard: '{name} set up a hard question for {target} 🔥',
      msg_hardNow: 'Hard question for {name}! 🔥',
      msg_trapSet: '{name} set a trap on house {n} 🪤',
      msg_trapSprung: "{name} fell into {owner}'s trap! 🪤",
      msg_duel: '{name} challenged {target} to a duel ⚔️',
      msg_duelWin: '{winner} won the duel! {loser} goes back 3 squares.',
      msg_duelDraw: 'The duel is a draw: nobody moves.',
      msg_steal: '{name} stole the question and moves {n} forward!',
      msg_stealMiss: '{name} tried to steal the question but got it wrong.',
      stealTitle: 'Steal the question?',
      stealText: '{loser} got it wrong. {name}, spend 1 ⚡ to answer it? Get it right and you move {n} forward.',
      stealYes: 'Steal (1 ⚡)',
      stealNo: 'No thanks',
      duelTitle: 'Duel!',
      duelVs: '{name} challenges {target}',
      duelPass: 'Pass the device to {name}. {other}, no peeking!',
      duelReady: "I'm {name}: ready",
      duelResult: 'Duel result',
      duelNoAnswer: 'no answer',
      nextPlayer: 'Next',
      prevPlayer: 'Previous player',
      goToPlayer: 'Go to player {n}',
      roll: 'Roll the die',
      rollHint: 'Space to roll',
      turnOf: 'Turn of',
      house: 'House {n}',
      start0: 'Start',
      skipBadge: 'Skips turn',
      players: 'Players',
      legend: 'Legend',
      log: 'History',
      continue: 'Continue',
      answerHint: 'Keys 1–4 to answer',
      playAgain: 'Play again',
      samePlayers: 'Same players',
      winnerTitle: 'We have a winner!',
      winner: '{name} reached house 75 and won!',
      confirmNew: 'Start a new game? The current game will be lost.',
      close: 'Close',
      more: 'Show players, legend and history',
      details: 'Game details',
      difficulty: 'Difficulty',
      diff_1: 'Easy',
      diff_2: 'Medium',
      diff_3: 'Hard',
      diff_4: 'Genius',

      topic_math: 'Maths',
      topic_history: 'Portuguese History',
      topic_science: 'Science',
      topic_physics: 'Physics',
      topic_chemistry: 'Chemistry',
      topic_portuguese: 'Portuguese',
      topic_english: 'English',

      avatar_warrior: 'Warrior',
      avatar_lynx: 'Lynx',
      avatar_tree: 'Tree',
      avatar_rock: 'Rock',
      avatar_camoes: 'Luís de Camões',
      avatar_shakespeare: 'Shakespeare',
      avatar_ball: 'Football',

      motion_warrior: 'Marches',
      motion_lynx: 'Pounces',
      motion_tree: 'Sways',
      motion_rock: 'Rolls',
      motion_camoes: 'Sails',
      motion_shakespeare: 'Twirls',
      motion_ball: 'Bounces',

      special_advance: '+{n}',
      special_again: 'Play again',
      special_skip: 'Miss 1 turn',
      special_teleport: '→ 21',

      msg_rolled: '{name} rolled {n}.',
      msg_bounce: 'Went past house 75! Back {n}.',
      msg_advance: 'House {house}: move {n} forward and answer!',
      msg_again: 'House 27: {name} plays again!',
      msg_skip: 'House 10: {name} misses the next turn.',
      msg_teleport: 'House {house}: teleport to house 21!',
      msg_correct: 'Correct! {name} stays on house {n}.',
      msg_bonus: 'Correct! {name} rolls again ({k}/{max}).',
      msg_bonusMax: '{name} has had {max} extra rolls in a row — next player.',
      msg_wrong: 'Wrong! {name} goes back to house {n}.',
      msg_rightWas: 'The right answer was: {a}',
      msg_collision: '{victim} was on house {n} first and goes to house 25!',
      msg_skipped: '{name} misses this turn.',
      msg_turn: '{name}’s turn.',
      msg_win: '{name} won!',
      msg_correctShort: 'Correct!',
      msg_wrongShort: 'Wrong!',

      rulesTitle: 'How to play',
      rulesHtml:
        '<ul>' +
        '<li>2 to 6 players on the same device. Everyone starts on house 0.</li>' +
        '<li>On your turn, roll the die (1–6) and move that many houses forward.</li>' +
        '<li>Every house has a topic: Maths, Portuguese History, Science, Portuguese or English. The question is always a new one.</li>' +
        '<li>There are 4 options and only 1 is right. Right? You stay and roll again (up to 3 times in a row), but each extra question is one level harder with 5 seconds less. Wrong? You go back to where you were and the next player plays.</li>' +
        '<li>You have 30 seconds to answer; running out of time counts as wrong.</li>' +
        '<li>Each player picks their own difficulty (Easy, Medium, Hard or Genius) and gets questions at that level. At Genius level, Science squares mostly ask Physics and Chemistry.</li>' +
        '<li>To win you must land exactly on house 75 and answer correctly. If the roll goes past 75 you move back the excess from 75.</li>' +
        '<li>If you land on a house where another player already is, the player who was there first goes to house 25.</li>' +
        '</ul>' +
        '<h3>Special houses</h3>' +
        '<ul>' +
        '<li><b>13</b> — move 2 forward, then answer the question.</li>' +
        '<li><b>55</b> — move 1 forward, then answer the question.</li>' +
        '<li><b>27</b> — play again.</li>' +
        '<li><b>10</b> — miss 1 turn.</li>' +
        '<li><b>7, 12 and 73</b> — teleport to house 21.</li>' +
        '</ul>' +
        '<h3>Powers ⚡</h3>' +
        '<p>Every right answer earns 1 ⚡ energy (you can bank up to 3). On your turn, before you roll, you can use one power:</p>' +
        '<ul>' +
        '<li><b>⚔️ Duel (1 ⚡)</b> — challenge a player within 6 squares. You both answer the same question in turn, without peeking (the challenged player first). The fastest right answer wins; the loser goes back 3 squares.</li>' +
        '<li><b>❄️ Freeze (1 ⚡)</b> — a player misses their next turn. Nobody can be frozen twice in a row.</li>' +
        '<li><b>🔄 Swap (2 ⚡)</b> — trade places with the player just ahead of you.</li>' +
        '<li><b>🔥 Hard question (1 ⚡)</b> — a player\'s next question is one level harder.</li>' +
        '<li><b>🛡️ Shield (1 ⚡)</b> — blocks the next attack and saves you from being sent to house 25.</li>' +
        '<li><b>🪤 Trap (1 ⚡)</b> — pick a square and a subject. Whoever lands there next answers a question on that subject, one level harder.</li>' +
        '<li><b>🕵️ Steal the question (1 ⚡)</b> — when someone answers wrong, the next player can answer the same question. Get it right and you move forward the squares they lost.</li>' +
        '</ul>' +
        '<p>The board theme changes to match the avatar of whoever is playing.</p>' +
        '<p>Shortcuts: Space or Enter to roll, keys 1–4 to answer.</p>'
    }
  };

  root.MQI18n = { STRINGS: STRINGS, LANGS: ['pt', 'en'] };
})(this);
