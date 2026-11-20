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

test('dealer prefers the requested level', () => {
  const d = new Q.Dealer();
  for (let lvl = 1; lvl <= 4; lvl++) {
    for (let i = 0; i < 5; i++) {
      const q = d.next('history', lvl);
      const idx = +q.key.split('-s-')[1];
      assert.equal(Q.banks.history[idx].lvl, lvl, 'history level ' + lvl);
      assert.equal(q.level, lvl);
    }
  }
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
