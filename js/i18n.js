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
        '<li>Há 4 opções e só 1 está certa. Acertou? Fica na casa e joga outra vez (até 3 vezes seguidas). Errou? Volta para onde estava e passa a vez.</li>' +
        '<li>Cada jogador escolhe a sua dificuldade (Fácil, Médio, Difícil ou Génio) e recebe perguntas desse nível.</li>' +
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
        '<li>There are 4 options and only 1 is right. Right? You stay and roll again (up to 3 times in a row). Wrong? You go back to where you were and the next player plays.</li>' +
        '<li>Each player picks their own difficulty (Easy, Medium, Hard or Genius) and gets questions at that level.</li>' +
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
        '<p>The board theme changes to match the avatar of whoever is playing.</p>' +
        '<p>Shortcuts: Space or Enter to roll, keys 1–4 to answer.</p>'
    }
  };

  root.MQI18n = { STRINGS: STRINGS, LANGS: ['pt', 'en'] };
})(this);
