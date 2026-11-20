// Run with: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../js/rules.js');
const Q = require('../js/questions.js');

test('normal move', () => {
  assert.deepEqual(R.buildPath(0, 4), [1, 2, 3, 4]);
  assert.equal(R.targetFor(10, 6), 16);
  assert.equal(R.bounced(10, 6), false);
});

test('bounce back from 75 by the excess', () => {
  assert.deepEqual(R.buildPath(72, 5), [73, 74, 75, 74, 73]);
  assert.equal(R.targetFor(72, 5), 73);
  assert.equal(R.bounced(72, 5), true);
  assert.deepEqual(R.buildPath(70, 5), [71, 72, 73, 74, 75]);
  assert.equal(R.bounced(70, 5), false);
  assert.deepEqual(R.buildPath(75, 3), [74, 73, 72]);
  assert.equal(R.targetFor(74, 6), 70);
});

test('special houses', () => {
  assert.deepEqual(R.specialAt(13), { type: 'advance', by: 2 });
  assert.deepEqual(R.specialAt(55), { type: 'advance', by: 1 });
  assert.equal(R.specialAt(27).type, 'again');
  assert.equal(R.specialAt(10).type, 'skip');
  [7, 12, 73].forEach((h) => assert.deepEqual(R.specialAt(h), { type: 'teleport', to: 21 }));
  assert.equal(R.specialAt(21), null);
  assert.equal(R.specialAt(15), null);
  assert.equal(R.specialAt(56), null);
});

test('collision sends the player who was there first to 25', () => {
  const players = [{ pos: 30 }, { pos: 30 }, { pos: 5 }];
  assert.deepEqual(R.collisionVictims(players, 1), [0]);
  assert.deepEqual(R.collisionVictims([{ pos: 0 }, { pos: 0 }], 0), []);
  assert.deepEqual(R.collisionVictims([{ pos: 25 }, { pos: 25 }], 0), []);
  assert.deepEqual(R.collisionVictims([{ pos: 9 }, { pos: 40 }], 0), []);
});

test('every non-special house gets a topic, balanced', () => {
  const topics = R.assignTopics();
  const counts = {};
  for (let h = 1; h <= 75; h++) {
    if (R.specialAt(h)) assert.equal(topics[h], undefined);
    else { assert.ok(R.TOPICS.includes(topics[h])); counts[topics[h]] = (counts[topics[h]] || 0) + 1; }
  }
  const values = Object.values(counts);
  assert.equal(values.length, 5);
  assert.ok(Math.max(...values) - Math.min(...values) <= 1);
});

test('die is 1..6', () => {
  for (let i = 0; i < 500; i++) {
    const n = R.rollDie();
    assert.ok(n >= 1 && n <= 6);
  }
});

function checkQuestion(q) {
  assert.ok(q.q.pt && q.q.en, 'question text in both languages: ' + q.key);
  assert.equal(q.options.length, 4, q.key);
  assert.ok(q.correct >= 0 && q.correct < 4, q.key);
  ['pt', 'en'].forEach((l) => {
    const texts = q.options.map((o) => o[l]);
    texts.forEach((t) => assert.ok(t !== undefined && t !== '', 'empty option ' + q.key));
    assert.equal(new Set(texts).size, 4, 'duplicate options in ' + l + ': ' + q.key + ' ' + texts.join('|'));
  });
}

test('static banks are well formed', () => {
  ['history', 'science', 'portuguese', 'english'].forEach((topic) => {
    Q.banks[topic].forEach((e, i) => {
      assert.equal(e.ptA.length, 4, topic + ' #' + i);
      assert.equal(e.enA.length, 4, topic + ' #' + i);
      assert.equal(new Set(e.ptA).size, 4, topic + ' #' + i + ' ' + e.ptQ);
      assert.equal(new Set(e.enA).size, 4, topic + ' #' + i + ' ' + e.enQ);
      assert.ok([1, 2, 3, 4].includes(e.lvl), topic + ' #' + i + ' has no level');
    });
    for (let lvl = 1; lvl <= 4; lvl++) {
      assert.ok(Q.banks[topic].filter((e) => e.lvl === lvl).length >= 5, topic + ' needs questions at level ' + lvl);
    }
  });
});

test('dealer deals the requested level', () => {
  const d = new Q.Dealer();
  ['history', 'science', 'portuguese', 'english'].forEach((topic) => {
    for (let lvl = 1; lvl <= 4; lvl++) {
      for (let i = 0; i < 25; i++) {
        const q = d.next(topic, lvl);
        assert.equal(q.level, lvl);
        if (q.key.includes('-s-')) assert.equal(Q.banks[topic][+q.key.split('-s-')[1]].lvl, lvl, q.key);
      }
    }
  });
});

test('dealer never repeats a question within a game', () => {
  const d = new Q.Dealer();
  ['history', 'science', 'portuguese', 'english', 'math'].forEach((topic) => {
    const seen = new Set();
    const n = topic === 'math' ? 150 : Q.banks[topic].length;
    for (let i = 0; i < n; i++) {
      const q = d.next(topic, 1 + (i % 4));
      checkQuestion(q);
      assert.equal(q.topic, topic);
      assert.ok(!seen.has(q.key), 'repeated ' + q.key);
      seen.add(q.key);
    }
  });
});

test('maths answers are correct', () => {
  for (let i = 0; i < 4000; i++) {
    const q = Q.genMath(Math.random, 1 + (i % 4));
    checkQuestion(q);
    const text = q.q.en;
    const ans = Number(q.options[q.correct].en);
    let m;
    if ((m = text.match(/^What is \((\d+) \+ (\d+)\) × (\d+) − (\d+)\?$/))) assert.equal(ans, (+m[1] + +m[2]) * m[3] - m[4]);
    else if ((m = text.match(/^(\d+)x \+ (\d+) = (\d+)\. What is x\?$/))) assert.equal(m[1] * ans + +m[2], +m[3]);
    else if ((m = text.match(/^What is (\d+) \+ (\d+) × (\d+)\?$/))) assert.equal(ans, +m[1] + m[2] * m[3]);
    else if ((m = text.match(/^What is (\d+) \+ (\d+)\?$/))) assert.equal(ans, +m[1] + +m[2]);
    else if ((m = text.match(/^What is (\d+) − (\d+)\?$/))) assert.equal(ans, m[1] - m[2]);
    else if ((m = text.match(/^What is (\d+) × (\d+)\?$/))) assert.equal(ans, m[1] * m[2]);
    else if ((m = text.match(/^What is (\d+) ÷ (\d+)\?$/))) assert.equal(ans, m[1] / m[2]);
    else if ((m = text.match(/^What is (\d+)% of (\d+)\?$/))) assert.equal(ans, m[1] * m[2] / 100);
    else if ((m = text.match(/^What is (\d+)²\?$/))) assert.equal(ans, m[1] * m[1]);
    else if ((m = text.match(/^What is the square root of (\d+)\?$/))) assert.equal(ans * ans, +m[1]);
    else if ((m = text.match(/^What is (\d+) to the power of (\d+)\?$/))) assert.equal(ans, Math.pow(+m[1], +m[2]));
    else if ((m = text.match(/^What is half of (\d+)\?$/))) assert.equal(ans, m[1] / 2);
    else if ((m = text.match(/^\? \+ (\d+) = (\d+)\./))) assert.equal(ans, m[2] - m[1]);
    else if ((m = text.match(/^What number comes next: ([\d, ]+), …\?$/))) {
      const s = m[1].split(', ').map(Number);
      const arithmetic = s[1] - s[0] === s[2] - s[1];
      assert.equal(ans, arithmetic ? s[3] + (s[1] - s[0]) : s[3] * (s[1] / s[0]));
    } else if ((m = text.match(/^What is (one|\d+) (third|quarter|fifth|tenth)s? of (\d+)\?$/))) {
      const den = { third: 3, quarter: 4, fifth: 5, tenth: 10 }[m[2]];
      const num = m[1] === 'one' ? 1 : +m[1];
      assert.equal(ans, (+m[3] * num) / den);
    } else assert.fail('unrecognised maths question: ' + text);
  }
});

test('a right answer earns another roll, up to 3 in a row', () => {
  assert.equal(R.MAX_BONUS_ROLLS, 3);
  assert.equal(R.earnsBonusRoll(0), true);
  assert.equal(R.earnsBonusRoll(2), true);
  assert.equal(R.earnsBonusRoll(3), false);
});

test('energy is banked up to 3', () => {
  assert.equal(R.gainEnergy(0), 1);
  assert.equal(R.gainEnergy(3), 3);
});

const P = (...pos) => pos.map((p, i) => ({ pos: p, level: 2, idx: i }));

test('duels reach players within 6 squares, either way', () => {
  assert.deepEqual(R.duelTargets(P(10, 16, 4, 17, 3), 0), [1, 2]);
});

test('nobody can be frozen twice in a row', () => {
  assert.deepEqual(R.freezeTargets(P(1, 2, 3), 0, null), [1, 2]);
  assert.deepEqual(R.freezeTargets(P(1, 2, 3), 0, 2), [1]);
});

test('hard question skips genius players and ones already cursed', () => {
  const ps = P(1, 2, 3, 4);
  ps[1].level = 4;
  ps[2].hardNext = true;
  assert.deepEqual(R.hardTargets(ps, 0), [3]);
});

test('swap targets the closest player ahead', () => {
  assert.equal(R.swapTarget(P(10, 30, 14, 9), 0), 2);
  assert.equal(R.swapTarget(P(40, 30, 14), 0), null);
  assert.equal(R.swapTarget(P(10, 10), 0), null);
});

test('traps only go on free question houses', () => {
  assert.equal(R.canPlaceTrap(5, {}), true);
  assert.equal(R.canPlaceTrap(0, {}), false);
  assert.equal(R.canPlaceTrap(75, {}), false);
  assert.equal(R.canPlaceTrap(27, {}), false);
  assert.equal(R.canPlaceTrap(5, { 5: { owner: 1 } }), false);
});

test('duel winner: right beats wrong, then the faster answer', () => {
  assert.equal(R.duelWinner({ correct: true, ms: 9000 }, { correct: false, ms: 1000 }), 'a');
  assert.equal(R.duelWinner({ correct: false, ms: 1 }, { correct: true, ms: 9 }), 'b');
  assert.equal(R.duelWinner({ correct: true, ms: 3000 }, { correct: true, ms: 2000 }), 'b');
  assert.equal(R.duelWinner({ correct: false, ms: 1 }, { correct: false, ms: 2 }), null);
});

test('a steal moves forward what the wrong answer lost', () => {
  assert.equal(R.stealGain(14, 9), 5);
  assert.equal(R.stealGain(73, 73), 0);
});

test('a streak makes each question harder and shorter', () => {
  assert.equal(R.streakLevel(1, 0), 1);
  assert.equal(R.streakLevel(1, 2), 3);
  assert.equal(R.streakLevel(3, 3), 4);
  assert.deepEqual([0, 1, 2, 3].map(R.questionSeconds), [30, 25, 20, 15]);
});

// A small seeded random generator, so layout tests are repeatable.
function seeded(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

test('every game gets a different, valid board layout', () => {
  const seen = new Set();
  for (let seed = 1; seed <= 300; seed++) {
    const L = R.makeLayout(seeded(seed));
    assert.notEqual(L, R.CLASSIC, 'seed ' + seed + ' fell back to the classic board');
    const houses = Object.keys(L.special).map(Number);
    assert.equal(houses.length, 7);
    const types = houses.map((h) => L.special[h].type).sort();
    assert.deepEqual(types, ['advance', 'advance', 'again', 'skip', 'teleport', 'teleport', 'teleport']);
    houses.forEach((h) => {
      assert.ok(h > 0 && h < 75, 'special on ' + h);
      assert.notEqual(h, L.teleport);
      assert.notEqual(h, L.refuge);
      const sp = L.special[h];
      if (sp.type === 'teleport') assert.equal(sp.to, L.teleport);
      if (sp.type === 'advance') assert.ok(!L.special[h + sp.by] && h + sp.by < 75, 'advance lands on a special house');
    });
    const portals = houses.filter((h) => L.special[h].type === 'teleport');
    assert.ok(portals.some((h) => h < L.teleport) && portals.some((h) => h > L.teleport), 'portals both ways');
    const topics = R.assignTopics(seeded(seed), L);
    houses.forEach((h) => assert.equal(topics[h], undefined));
    seen.add(JSON.stringify(L));
  }
  assert.ok(seen.size > 290, 'layouts repeat too often: ' + seen.size);
});

test('earthquake throws other players 1-3 houses, never onto 75 or below 0', () => {
  const players = [{ pos: 10 }, { pos: 0 }, { pos: 74 }, { pos: 40, shield: true }, { pos: 30 }];
  for (let seed = 1; seed <= 200; seed++) {
    const moves = R.quakeMoves(players, 0, seeded(seed));
    assert.ok(moves.every((m) => m.idx !== 0 && m.idx !== 3), 'mover and shielded players stay');
    moves.forEach((m) => {
      assert.ok(m.to >= 0 && m.to <= 74, 'to ' + m.to);
      assert.ok(Math.abs(m.to - m.from) >= 1 && Math.abs(m.to - m.from) <= 3);
    });
    assert.equal(moves.length, 3);
  }
});
