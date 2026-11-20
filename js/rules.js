/* MultiQuest — pure game rules (no DOM). Usable in the browser and in Node tests. */
(function (root) {
  'use strict';

  var BOARD_SIZE = 75;
  var COLLISION_HOUSE = 25;
  var TELEPORT_HOUSE = 21;
  // A right answer earns another roll, at most this many times in a row.
  var MAX_BONUS_ROLLS = 3;
  // Seconds to answer a question; running out counts as a wrong answer.
  var QUESTION_SECONDS = 30;

  // Special houses. These replace the question for that house.
  var SPECIAL = {
    7: { type: 'teleport', to: TELEPORT_HOUSE },
    10: { type: 'skip', turns: 1 },
    12: { type: 'teleport', to: TELEPORT_HOUSE },
    13: { type: 'advance', by: 2 },
    27: { type: 'again' },
    55: { type: 'advance', by: 1 },
    73: { type: 'teleport', to: TELEPORT_HOUSE }
  };

  var TOPICS = ['math', 'history', 'science', 'portuguese', 'english'];

  /**
   * Houses visited, one per step, when moving `roll` steps from `pos`.
   * Going beyond 75 bounces back by the excess.
   */
  function buildPath(pos, roll) {
    var steps = [];
    var cur = pos;
    var dir = 1;
    for (var i = 0; i < roll; i++) {
      if (cur === BOARD_SIZE) dir = -1;
      cur += dir;
      steps.push(cur);
    }
    return steps;
  }

  function targetFor(pos, roll) {
    var raw = pos + roll;
    return raw > BOARD_SIZE ? BOARD_SIZE - (raw - BOARD_SIZE) : raw;
  }

  function bounced(pos, roll) {
    return pos + roll > BOARD_SIZE;
  }

  function specialAt(house) {
    return SPECIAL[house] || null;
  }

  /**
   * When `moverIndex` settles on a house already taken by other players,
   * the players who were there first are sent to house 25.
   * House 0 (start) and house 25 itself are shared and never trigger this.
   */
  function collisionVictims(players, moverIndex) {
    var pos = players[moverIndex].pos;
    if (pos === 0 || pos === COLLISION_HOUSE) return [];
    var out = [];
    for (var i = 0; i < players.length; i++) {
      if (i !== moverIndex && players[i].pos === pos) out.push(i);
    }
    return out;
  }

  /** Random but balanced topic for every non-special house (1..75). */
  function assignTopics(rand) {
    rand = rand || Math.random;
    var houses = [];
    for (var h = 1; h <= BOARD_SIZE; h++) if (!SPECIAL[h]) houses.push(h);
    var pool = [];
    while (pool.length < houses.length) pool = pool.concat(TOPICS);
    pool = shuffle(pool.slice(0, houses.length), rand);
    var topics = {};
    houses.forEach(function (h, i) { topics[h] = pool[i]; });
    return topics;
  }

  function shuffle(arr, rand) {
    rand = rand || Math.random;
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /** Whether a right answer earns another roll, given the bonus rolls already taken this turn. */
  function earnsBonusRoll(bonusSoFar) {
    return bonusSoFar < MAX_BONUS_ROLLS;
  }

  // ---------------------------------------------------------------- powers
  // Every right answer earns ⚡ energy (banked up to MAX_ENERGY). On their turn,
  // before rolling, a player can spend it on one power.
  var MAX_ENERGY = 3;
  var DUEL_RANGE = 6;
  var DUEL_PENALTY = 3;
  var POWERS = {
    duel: { cost: 1, target: 'player' },
    freeze: { cost: 1, target: 'player' },
    swap: { cost: 2, target: 'ahead' },
    hard: { cost: 1, target: 'player' },
    shield: { cost: 1, target: 'self' },
    trap: { cost: 1, target: 'square' },
    steal: { cost: 1, target: 'question' }
  };
  /** The powers offered before rolling (Steal is offered after someone else's wrong answer). */
  var POWER_ORDER = ['duel', 'freeze', 'swap', 'hard', 'shield', 'trap'];

  function gainEnergy(energy) {
    return Math.min(MAX_ENERGY, energy + 1);
  }

  /** Players within DUEL_RANGE squares of `me` (either way). */
  function duelTargets(players, me) {
    var out = [];
    for (var i = 0; i < players.length; i++) {
      if (i !== me && Math.abs(players[i].pos - players[me].pos) <= DUEL_RANGE) out.push(i);
    }
    return out;
  }

  /** Anyone but me, and never the last player who was frozen. */
  function freezeTargets(players, me, lastFrozen) {
    var out = [];
    for (var i = 0; i < players.length; i++) if (i !== me && i !== lastFrozen) out.push(i);
    return out;
  }

  /** Anyone but me whose next question can still get harder. */
  function hardTargets(players, me) {
    var out = [];
    for (var i = 0; i < players.length; i++) if (i !== me && players[i].level < 4 && !players[i].hardNext) out.push(i);
    return out;
  }

  /** The player one place ahead of `me` in the race (the closest one in front), or null. */
  function swapTarget(players, me) {
    var best = null;
    for (var i = 0; i < players.length; i++) {
      if (i === me || players[i].pos <= players[me].pos) continue;
      if (best === null || players[i].pos < players[best].pos) best = i;
    }
    return best;
  }

  /** Traps go on ordinary question houses that have no trap yet. */
  function canPlaceTrap(house, traps) {
    return house > 0 && house < BOARD_SIZE && !SPECIAL[house] && !(traps && traps[house]);
  }

  /**
   * Who wins a duel: 'a', 'b' or null for a draw. Each side is { correct, ms }.
   * A right answer beats a wrong one; when both are right the faster one wins.
   */
  function duelWinner(a, b) {
    if (a.correct && !b.correct) return 'a';
    if (b.correct && !a.correct) return 'b';
    if (!a.correct) return null;
    if (a.ms === b.ms) return null;
    return a.ms < b.ms ? 'a' : 'b';
  }

  /** Squares a stealer moves forward: what the player who answered wrong lost. */
  function stealGain(landed, from) {
    return Math.max(0, landed - from);
  }

  function rollDie(rand) {
    rand = rand || Math.random;
    return 1 + Math.floor(rand() * 6);
  }

  var api = {
    BOARD_SIZE: BOARD_SIZE,
    COLLISION_HOUSE: COLLISION_HOUSE,
    TELEPORT_HOUSE: TELEPORT_HOUSE,
    MAX_BONUS_ROLLS: MAX_BONUS_ROLLS,
    QUESTION_SECONDS: QUESTION_SECONDS,
    earnsBonusRoll: earnsBonusRoll,
    MAX_ENERGY: MAX_ENERGY,
    DUEL_RANGE: DUEL_RANGE,
    DUEL_PENALTY: DUEL_PENALTY,
    POWERS: POWERS,
    POWER_ORDER: POWER_ORDER,
    gainEnergy: gainEnergy,
    duelTargets: duelTargets,
    freezeTargets: freezeTargets,
    hardTargets: hardTargets,
    swapTarget: swapTarget,
    canPlaceTrap: canPlaceTrap,
    duelWinner: duelWinner,
    stealGain: stealGain,
    SPECIAL: SPECIAL,
    TOPICS: TOPICS,
    buildPath: buildPath,
    targetFor: targetFor,
    bounced: bounced,
    specialAt: specialAt,
    collisionVictims: collisionVictims,
    assignTopics: assignTopics,
    shuffle: shuffle,
    rollDie: rollDie
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MQRules = api;
})(this);
