// Fact tables and question generators. Run with: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const F = require('../js/facts.js');
const G = require('../js/generators.js');
const Q = require('../js/questions.js');

function checkQuestion(q) {
  assert.ok(q.q.pt && q.q.en, 'question text in both languages: ' + q.key);
  assert.equal(q.options.length, 4, q.key);
  assert.ok(q.correct >= 0 && q.correct < 4, q.key);
  ['pt', 'en'].forEach((l) => {
    const texts = q.options.map((o) => o[l]);
    texts.forEach((t) => assert.ok(t !== undefined && t !== '' && !/undefined|NaN/.test(t), 'bad option ' + q.key + ': ' + t));
    assert.equal(new Set(texts).size, 4, 'duplicate options in ' + l + ': ' + q.key + ' ' + texts.join('|'));
  });
  assert.ok(!/undefined|NaN/.test(q.q.pt + q.q.en), 'bad text ' + q.key);
}
const right = (q, l = 'pt') => q.options[q.correct][l];
const rest = (q, l = 'pt') => q.options.filter((_, i) => i !== q.correct).map((o) => o[l]);
const unique = (arr, what) => {
  const seen = new Set();
  arr.forEach((x) => { assert.ok(!seen.has(x), 'duplicate ' + what + ': ' + x); seen.add(x); });
};

/** Up to `n` questions of one generator, across all levels. */
function sample(id, n = 400) {
  const g = G.GENS.find((x) => x.id === id);
  const out = [];
  for (let i = 0; i < n; i++) {
    const q = g.make(Math.random, 1 + (i % 4));
    if (q) out.push(q);
  }
  return out;
}

test('fact tables have no duplicates that would make two answers right', () => {
  unique(F.MONARCHS.map((r) => r[0]), 'monarch');
  unique(F.MONARCHS.map((r) => r[3]).filter(Boolean), 'epithet');
  unique(F.EVENTS.map((r) => r[1]), 'event');
  unique(F.PEOPLE.map((r) => r[0]), 'person');
  unique(F.ELEMENTS.map((r) => r[1]), 'element symbol');
  unique(F.ELEMENTS.map((r) => r[2]), 'element name');
  unique(F.ANIMALS.map((r) => r[0]), 'animal');
  unique(F.VOCAB.map((r) => r[1]), 'vocab (pt)');
  unique(F.VOCAB.map((r) => r[2]), 'vocab (en)');
  unique(F.IRREGULAR.map((r) => r[0]), 'irregular verb');
  unique(F.IRREGULAR.map((r) => r[3]).filter(Boolean), 'irregular verb meaning');
  unique(F.PLURALS.map((r) => r[0]), 'plural');
  unique(F.FEMININES.map((r) => r[0]), 'masculine');
  unique(F.FEMININES.map((r) => r[1]), 'feminine');
  unique(F.COLLECTIVES.map((r) => r[0]), 'collective');
  unique(F.COLLECTIVES.map((r) => r[1]), 'collective group');
  unique([].concat(...F.SYNONYMS), 'synonym');
  unique([].concat(...F.ANTONYMS), 'antonym');
  unique([].concat(...F.EN_OPPOSITES), 'English opposite');
  unique(F.WORD_CLASSES.map((r) => r[0]), 'word');
  unique(F.SPELLING.map((r) => r[0]), 'spelling');
  F.SPELLING.forEach((r) => assert.equal(new Set(r.slice(0, 4)).size, 4, 'spelling options ' + r[0]));
  unique(F.VERBS_AR.concat(F.VERBS_ER, F.VERBS_IR), 'regular verb');
});

test('every generator makes well-formed questions at the levels it offers', () => {
  const byTopic = {};
  G.GENS.forEach((g) => {
    const levels = new Set();
    for (let i = 0; i < 200; i++) {
      const lvl = 1 + (i % 4);
      const q = g.make(Math.random, lvl);
      if (!q) continue;
      levels.add(lvl);
      checkQuestion(q);
      assert.equal(q.topic, g.topic, g.id);
      assert.ok(q.key.startsWith('g:' + g.id + ':'), q.key);
    }
    assert.ok(levels.size > 0, g.id + ' made no questions');
    (byTopic[g.topic] = byTopic[g.topic] || new Set());
    levels.forEach((l) => byTopic[g.topic].add(l));
  });
  ['history', 'science', 'portuguese', 'english'].forEach((t) => assert.equal(byTopic[t].size, 4, t + ' covers every level'));
});

test('each topic has at least 100× the original hand-written questions', () => {
  const c = G.counts();
  const original = { history: 61, science: 55, portuguese: 68, english: 46 };
  Object.keys(original).forEach((t) => assert.ok(c[t].total >= original[t] * 100, t + ': ' + c[t].total));
});

test('Portuguese conjugations', () => {
  const c = G._.conj;
  assert.deepEqual(c('falar', 'pres'), ['falo', 'falas', 'fala', 'falamos', 'falam']);
  assert.deepEqual(c('falar', 'perf'), ['falei', 'falaste', 'falou', 'falámos', 'falaram']);
  assert.deepEqual(c('comer', 'perf'), ['comi', 'comeste', 'comeu', 'comemos', 'comeram']);
  assert.deepEqual(c('partir', 'imp'), ['partia', 'partias', 'partia', 'partíamos', 'partiam']);
  assert.deepEqual(c('viver', 'fut'), ['viverei', 'viverás', 'viverá', 'viveremos', 'viverão']);
  sample('conj', 600).forEach((q) => {
    const [, person, verb] = q.q.pt.match(/"(\S+) ___ \((\S+)\)\."/u) || [];
    assert.ok(person && verb, q.q.pt);
  });
});

test('English numbers and ordinals', () => {
  const w = G._.words;
  assert.equal(w(7), 'seven');
  assert.equal(w(40), 'forty');
  assert.equal(w(347), 'three hundred and forty-seven');
  assert.equal(w(910), 'nine hundred and ten');
  assert.equal(w(500), 'five hundred');
  const o = G._.ordinal;
  assert.deepEqual([1, 2, 3, 4, 5, 8, 9, 12, 20, 21, 22, 30, 31].map(o),
    ['first', 'second', 'third', 'fourth', 'fifth', 'eighth', 'ninth', 'twelfth', 'twentieth', 'twenty-first', 'twenty-second', 'thirtieth', 'thirty-first']);
  sample('num', 600).filter((q) => q.key.includes(':n-')).forEach((q) => {
    assert.equal(w(+right(q)), q.q.en.match(/"(.+)"/)[1]);
  });
});

test('"which came first" answers really are the earliest or latest', () => {
  const year = {};
  F.EVENTS.forEach((r) => { year[r[1].charAt(0).toUpperCase() + r[1].slice(1)] = +r[0]; });
  sample('ev-order', 600).forEach((q) => {
    const ys = q.options.map((o) => year[o.pt]);
    ys.forEach((y, i) => assert.ok(y, 'unknown event ' + q.options[i].pt));
    const target = q.q.pt.includes('antigo') ? Math.min(...ys) : Math.max(...ys);
    assert.equal(year[right(q)], target, q.q.pt + ' ' + right(q));
    assert.equal(ys.filter((y) => y === target).length, 1);
  });
  const z = {};
  F.ELEMENTS.forEach((r) => { z[r[2]] = +r[0]; });
  sample('el-z', 400).forEach((q) => {
    const zs = q.options.map((o) => z[o.pt]);
    assert.equal(z[right(q)], q.q.pt.includes('mais') ? Math.max(...zs) : Math.min(...zs));
  });
});

test('"which of these is a…" answers are the only one in their group', () => {
  const cls = {};
  F.ANIMALS.forEach((r) => { cls[r[0]] = r[2]; });
  sample('ani-which', 400).forEach((q) => {
    const want = Object.keys(F.ANIMAL_CLASSES).find((c) => q.q.pt.endsWith(F.ANIMAL_CLASSES[c].apt + '?'));
    assert.equal(cls[right(q)], want, q.q.pt);
    rest(q).forEach((a) => assert.notEqual(cls[a], want));
  });
  const wc = {};
  F.WORD_CLASSES.forEach((r) => { wc[r[0]] = r[1]; });
  sample('wc-which', 400).forEach((q) => {
    const c = Object.keys(F.WORD_CLASS_NAMES).find((k) => q.q.pt.includes('um ' + F.WORD_CLASS_NAMES[k].pt + '?'));
    assert.equal(wc[right(q)], c);
    rest(q).forEach((a) => assert.notEqual(wc[a], c));
  });
  const cat = {};
  F.VOCAB.forEach((r) => { cat[r[2]] = r[0]; });
  sample('voc-cat', 400).forEach((q) => {
    const c = Object.keys(F.VOCAB_CATEGORIES).find((k) => q.q.pt.endsWith(F.VOCAB_CATEGORIES[k].pt + '?'));
    assert.equal(cat[right(q)], c, q.q.pt);
    rest(q).forEach((a) => assert.notEqual(cat[a], c));
  });
});

test('opposites and synonyms have exactly one right answer', () => {
  const partner = {};
  F.ANTONYMS.forEach(([a, b]) => { partner[a] = b; partner[b] = a; });
  sample('ant', 400).forEach((q) => {
    const w = q.q.pt.match(/"(.+)"/)[1];
    assert.equal(right(q), partner[w]);
    rest(q).forEach((a) => assert.notEqual(partner[a], w));
  });
  const group = {};
  F.SYNONYMS.forEach((g, i) => g.forEach((w) => { group[w] = i; }));
  sample('syn', 400).forEach((q) => {
    const w = q.q.pt.match(/"(.+)"/)[1];
    assert.equal(group[right(q)], group[w]);
    rest(q).forEach((a) => assert.notEqual(group[a], group[w]));
  });
});

test('the dealer never repeats a question in a long game', () => {
  const d = new Q.Dealer();
  ['history', 'science', 'portuguese', 'english'].forEach((topic) => {
    const seen = new Set();
    for (let i = 0; i < 1500; i++) {
      const q = d.next(topic, 1 + (i % 4));
      checkQuestion(q);
      assert.ok(!seen.has(q.key), 'repeated ' + q.key);
      seen.add(q.key);
    }
  });
});
