/* MultiQuest — question generators.
 *
 * Each generator turns the fact tables in js/facts.js into questions:
 *   { id, topic, count, make(rand, level) -> question | null }
 * `count` is how many different questions it can produce. `make` returns a
 * question at exactly the requested level (1 easy … 4 genius), or null when it
 * has none at that level. Wrong answers always come from the same table, so
 * every option is a real word, name or date.
 */
(function (root) {
  'use strict';

  var F = (typeof module !== 'undefined' && module.exports) ? require('./facts.js') : root.MQFacts;

  // ---------------------------------------------------------------- helpers
  function rnd(rand, min, max) { return min + Math.floor(rand() * (max - min + 1)); }
  function pick(rand, arr) { return arr[Math.floor(rand() * arr.length)]; }
  function shuffle(arr, rand) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function both(s) { return { pt: String(s), en: String(s) }; }
  function T(pt, en) { return { pt: pt, en: en }; }
  function choose(n, k) {
    if (k > n) return 0;
    var r = 1;
    for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }
  function plain(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  /** Build a question; answers[0] is correct. */
  function build(key, topic, q, answers, rand) {
    var order = shuffle([0, 1, 2, 3], rand);
    return { key: key, topic: topic, q: q, options: order.map(function (i) { return answers[i]; }), correct: order.indexOf(0) };
  }

  /** Three wrong answers from `pool` (values, or {pt,en}), none equal to `right` in either language. */
  function wrongs(rand, pool, right, n) {
    n = n || 3;
    var r = typeof right === 'object' ? right : both(right);
    var out = [];
    var seenPt = [r.pt], seenEn = [r.en];
    var p = shuffle(pool, rand);
    for (var i = 0; i < p.length && out.length < n; i++) {
      var o = typeof p[i] === 'object' ? p[i] : both(p[i]);
      if (seenPt.indexOf(o.pt) >= 0 || seenEn.indexOf(o.en) >= 0) continue;
      seenPt.push(o.pt); seenEn.push(o.en);
      out.push(o);
    }
    return out.length === n ? out : null;
  }

  function ask(key, topic, q, right, pool, rand) {
    var w = wrongs(rand, pool, right);
    if (!w) return null;
    return build(key, topic, q, [typeof right === 'object' ? right : both(right)].concat(w), rand);
  }

  /** Numbers near `n` (distinct, within [min, max]). */
  function nearNumbers(rand, n, spread, min, max) {
    var out = [];
    var guard = 0;
    while (out.length < 3 && guard++ < 300) {
      var v = n + rnd(rand, 1, spread) * (rand() < 0.5 ? -1 : 1);
      if (v >= min && v <= max && v !== n && out.indexOf(v) < 0) out.push(v);
    }
    return out;
  }

  // A generator over a fixed list of items, each with its own level.
  // items: [{ id, level, make(rand) }]
  function listGen(id, topic, items) {
    var byLevel = { 1: [], 2: [], 3: [], 4: [] };
    items.forEach(function (it) { byLevel[it.level].push(it); });
    return {
      id: id, topic: topic, count: items.length,
      make: function (rand, level) {
        var list = byLevel[level];
        if (!list.length) return null;
        for (var t = 0; t < 6; t++) {
          var it = pick(rand, list);
          var q = it.make(rand);
          if (q) { q.key = 'g:' + id + ':' + it.id; return q; }
        }
        return null;
      }
    };
  }

  // A generator over combinations ("which of these…"): sample() returns a
  // question with its level, and is retried until the level matches.
  function comboGen(id, topic, count, sample) {
    return {
      id: id, topic: topic, count: count,
      make: function (rand, level) {
        for (var t = 0; t < 40; t++) {
          var r = sample(rand);
          if (r && r.level === level) { r.q.key = 'g:' + id + ':' + r.key; return r.q; }
        }
        return null;
      }
    };
  }

  function clampLevel(l) { return Math.max(1, Math.min(4, l)); }
  // How hard "which came first" is: the closer the dates, the harder.
  function gapLevel(gap) { return gap > 120 ? 1 : gap > 50 ? 2 : gap > 15 ? 3 : 4; }

  var GENS = [];
  var TEST_HOOKS = {};

  // ================================================================ history
  (function () {
    var M = F.MONARCHS.map(function (r, i) { return { i: i, name: r[0], dyn: +r[1], year: r[2] ? +r[2] : null, epithet: r[3], level: +r[4] }; });
    var withEpithet = M.filter(function (m) { return m.epithet; });
    var withYear = M.filter(function (m) { return m.year; });
    var items = [];
    withEpithet.forEach(function (m) {
      items.push({ id: 'ep-' + m.i, level: m.level, make: function (rand) {
        return ask('', 'history', T('Que monarca ficou conhecido como "' + m.epithet + '"?', 'Which Portuguese monarch was nicknamed "' + m.epithet + '"?'),
          m.name, withEpithet.map(function (o) { return o.name; }), rand);
      } });
      items.push({ id: 'epr-' + m.i, level: clampLevel(m.level + 1), make: function (rand) {
        return ask('', 'history', T('Qual era o cognome de ' + m.name + '?', 'What was the nickname (cognome) of ' + m.name + '?'),
          m.epithet, withEpithet.map(function (o) { return o.epithet; }), rand);
      } });
    });
    M.forEach(function (m) {
      items.push({ id: 'dyn-' + m.i, level: clampLevel(m.level), make: function (rand) {
        return build('', 'history', T('A que dinastia pertenceu ' + m.name + '?', 'Which dynasty did ' + m.name + ' belong to?'),
          [F.DYNASTIES[m.dyn]].concat([1, 2, 3, 4].filter(function (d) { return d !== m.dyn; }).map(function (d) { return F.DYNASTIES[d]; })), rand);
      } });
    });
    withYear.forEach(function (m) {
      items.push({ id: 'yr-' + m.i, level: clampLevel(m.level + 1), make: function (rand) {
        return ask('', 'history', T('Em que ano começou o reinado de ' + m.name + '?', 'In which year did the reign of ' + m.name + ' begin?'),
          String(m.year), withYear.map(function (o) { return String(o.year); }).filter(function (y) { return Math.abs(+y - m.year) < 120; }), rand);
      } });
      items.push({ id: 'yrr-' + m.i, level: clampLevel(m.level + 1), make: function (rand) {
        return ask('', 'history', T('Que monarca começou a reinar em ' + m.year + '?', 'Which monarch began to reign in ' + m.year + '?'),
          m.name, withYear.map(function (o) { return o.name; }), rand);
      } });
    });
    M.forEach(function (m, i) {
      var next = M[i + 1];
      if (!next || F.MONARCH_NO_SEQUENCE.indexOf(m.name) >= 0 || F.MONARCH_NO_SEQUENCE.indexOf(next.name) >= 0) return;
      var near = M.filter(function (o) { return Math.abs(o.i - i) <= 6; }).map(function (o) { return o.name; });
      items.push({ id: 'next-' + m.i, level: clampLevel(Math.max(m.level, next.level) + 1), make: function (rand) {
        return ask('', 'history', T('Quem reinou a seguir a ' + m.name + '?', 'Who reigned after ' + m.name + '?'),
          next.name, near.filter(function (n) { return n !== m.name; }), rand);
      } });
      items.push({ id: 'prev-' + next.i, level: clampLevel(Math.max(m.level, next.level) + 1), make: function (rand) {
        return ask('', 'history', T('Quem reinou antes de ' + next.name + '?', 'Who reigned before ' + next.name + '?'),
          m.name, near.filter(function (n) { return n !== next.name; }), rand);
      } });
    });
    GENS.push(listGen('mon', 'history', items));

    // Which of these monarchs reigned first?
    GENS.push(comboGen('mon-order', 'history', choose(withYear.length, 4) * 2, function (rand) {
      var four = shuffle(withYear, rand).slice(0, 4).sort(function (a, b) { return a.year - b.year; });
      var first = rand() < 0.5;
      var right = first ? four[0] : four[3];
      var gap = first ? four[1].year - four[0].year : four[3].year - four[2].year;
      return {
        key: (first ? 'f' : 'l') + four.map(function (m) { return m.i; }).join('.'),
        level: gapLevel(gap * 2),
        q: build('', 'history', first
          ? T('Qual destes monarcas reinou primeiro?', 'Which of these monarchs reigned first?')
          : T('Qual destes monarcas reinou mais tarde?', 'Which of these monarchs reigned last?'),
          [both(right.name)].concat(four.filter(function (m) { return m !== right; }).map(function (m) { return both(m.name); })), rand)
      };
    }));

    // Presidents
    var P = F.PRESIDENTS.map(function (r, i) { return { i: i, name: r[0], year: r[1] ? +r[1] : null, level: +r[2] }; });
    var yearCount = {};
    P.forEach(function (p) { if (p.year) yearCount[p.year] = (yearCount[p.year] || 0) + 1; });
    var pItems = [];
    P.forEach(function (p, i) {
      if (p.year && yearCount[p.year] === 1) {
        pItems.push({ id: 'py-' + i, level: clampLevel(p.level + 1), make: function (rand) {
          return ask('', 'history', T('Quem se tornou Presidente da República em ' + p.year + '?', 'Who became President of the Republic in ' + p.year + '?'),
            p.name, P.map(function (o) { return o.name; }), rand);
        } });
        pItems.push({ id: 'pyr-' + i, level: clampLevel(p.level + 1), make: function (rand) {
          return ask('', 'history', T('Em que ano ' + p.name + ' se tornou Presidente da República?', 'In which year did ' + p.name + ' become President of the Republic?'),
            String(p.year), P.filter(function (o) { return o.year; }).map(function (o) { return String(o.year); }), rand);
        } });
      }
      var next = P[i + 1];
      if (next) {
        pItems.push({ id: 'pn-' + i, level: clampLevel(Math.max(p.level, next.level) + 1), make: function (rand) {
          return ask('', 'history', T('Quem foi Presidente da República a seguir a ' + p.name + '?', 'Who was President of the Republic after ' + p.name + '?'),
            next.name, P.map(function (o) { return o.name; }).filter(function (n) { return n !== p.name; }), rand);
        } });
      }
    });
    pItems.push({ id: 'p-first', level: 2, make: function (rand) {
      return ask('', 'history', T('Quem foi o primeiro Presidente da República eleito?', 'Who was the first elected President of the Republic?'),
        P[0].name, P.slice(1).map(function (o) { return o.name; }), rand);
    } });
    GENS.push(listGen('pres', 'history', pItems));
    GENS.push(comboGen('pres-order', 'history', choose(P.length, 4) * 2, function (rand) {
      var four = shuffle(P, rand).slice(0, 4).sort(function (a, b) { return a.i - b.i; });
      var first = rand() < 0.5;
      var right = first ? four[0] : four[3];
      return {
        key: (first ? 'f' : 'l') + four.map(function (p) { return p.i; }).join('.'),
        level: clampLevel(Math.max.apply(null, four.map(function (p) { return p.level; }))),
        q: build('', 'history', first
          ? T('Qual destes foi Presidente da República primeiro?', 'Which of these was President of the Republic first?')
          : T('Qual destes foi Presidente da República mais recentemente?', 'Which of these was President of the Republic most recently?'),
          [both(right.name)].concat(four.filter(function (p) { return p !== right; }).map(function (p) { return both(p.name); })), rand)
      };
    }));

    // Events
    var E = F.EVENTS.map(function (r, i) { return { i: i, year: +r[0], pt: r[1], en: r[2], level: +r[3] }; });
    var eYears = {};
    E.forEach(function (e) { eYears[e.year] = (eYears[e.year] || 0) + 1; });
    function century(y) { return Math.floor((y - 1) / 100) + 1; }
    function roman(n) { return ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII'][n]; }
    function centuryText(c) {
      var sfx = c % 10 === 1 && c !== 11 ? 'st' : c % 10 === 2 && c !== 12 ? 'nd' : c % 10 === 3 && c !== 13 ? 'rd' : 'th';
      return T('século ' + roman(c), c + sfx + ' century');
    }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    var eItems = [];
    E.forEach(function (e) {
      eItems.push({ id: 'y-' + e.i, level: e.level, make: function (rand) {
        var near = nearNumbers(rand, e.year, e.level >= 3 ? 12 : 40, 1000, 2025);
        return build('', 'history', T('Em que ano foi ' + e.pt + '?', 'In which year did this happen: ' + e.en + '?'), [e.year].concat(near).map(both), rand);
      } });
      var c = century(e.year);
      eItems.push({ id: 'c-' + e.i, level: clampLevel(e.level), make: function (rand) {
        var cs = [c - 2, c - 1, c + 1, c + 2].filter(function (x) { return x >= 11 && x <= 21; });
        return ask('', 'history', T('Em que século foi ' + e.pt + '?', 'In which century did this happen: ' + e.en + '?'), centuryText(c), cs.map(centuryText), rand);
      } });
      if (eYears[e.year] === 1) {
        eItems.push({ id: 'ry-' + e.i, level: clampLevel(e.level + 1), make: function (rand) {
          var others = E.filter(function (o) { return o !== e && Math.abs(o.year - e.year) < 150; });
          return ask('', 'history', T('O que aconteceu em ' + e.year + '?', 'What happened in ' + e.year + '?'),
            T(cap(e.pt), cap(e.en)), others.map(function (o) { return T(cap(o.pt), cap(o.en)); }), rand);
        } });
      }
    });
    GENS.push(listGen('ev', 'history', eItems));
    GENS.push(comboGen('ev-order', 'history', choose(E.length, 4) * 2, function (rand) {
      var four = shuffle(E, rand).slice(0, 4).sort(function (a, b) { return a.year - b.year; });
      for (var k = 1; k < 4; k++) if (four[k].year === four[k - 1].year) return null;
      var first = rand() < 0.5;
      var right = first ? four[0] : four[3];
      var gap = first ? four[1].year - four[0].year : four[3].year - four[2].year;
      return {
        key: (first ? 'f' : 'l') + four.map(function (e) { return e.i; }).join('.'),
        level: gapLevel(gap),
        q: build('', 'history', first
          ? T('Qual destes acontecimentos foi o mais antigo?', 'Which of these events happened first?')
          : T('Qual destes acontecimentos foi o mais recente?', 'Which of these events happened most recently?'),
          [T(cap(right.pt), cap(right.en))].concat(four.filter(function (e) { return e !== right; }).map(function (e) { return T(cap(e.pt), cap(e.en)); })), rand)
      };
    }));

    // People
    var PE = F.PEOPLE.map(function (r, i) { return { i: i, name: r[0], pt: r[1], en: r[2], level: +r[3] }; });
    var peItems = [];
    PE.forEach(function (p) {
      peItems.push({ id: 'who-' + p.i, level: p.level, make: function (rand) {
        return ask('', 'history', T('Quem ' + p.pt + '?', 'Who ' + p.en + '?'), p.name, PE.map(function (o) { return o.name; }), rand);
      } });
      peItems.push({ id: 'what-' + p.i, level: clampLevel(p.level + 1), make: function (rand) {
        return ask('', 'history', T('Pelo que é conhecido(a) ' + p.name + '?', 'What is ' + p.name + ' known for?'),
          T(cap(p.pt), cap(p.en)), PE.map(function (o) { return T(cap(o.pt), cap(o.en)); }), rand);
      } });
    });
    var C = F.COLONIES.map(function (r, i) { return { i: i, country: r[0], capital: r[1], year: r[2] ? +r[2] : null, level: +r[3] }; });
    C.forEach(function (c) {
      peItems.push({ id: 'cap-' + c.i, level: c.level, make: function (rand) {
        return ask('', 'history', T('Qual é a capital de ' + c.country + ', antigo território português?', 'What is the capital of ' + c.country + ', a former Portuguese territory?'),
          c.capital, C.map(function (o) { return o.capital; }).concat(['Lisboa', 'Goa', 'Macau']), rand);
      } });
      if (c.year) {
        peItems.push({ id: 'ind-' + c.i, level: clampLevel(c.level + 1), make: function (rand) {
          return build('', 'history', T('Em que ano se tornou independente ' + c.country + '?', 'In which year did ' + c.country + ' become independent?'),
            [c.year].concat(nearNumbers(rand, c.year, c.year > 1900 ? 8 : 30, 1500, 2030)).map(both), rand);
        } });
      }
    });
    GENS.push(listGen('ppl', 'history', peItems));
  })();

  // ================================================================ science
  (function () {
    var EL = F.ELEMENTS.map(function (r, i) { return { i: i, z: +r[0], sym: r[1], pt: r[2], en: r[3], group: r[4], level: +r[5] }; });
    function nameOf(e) { return T(e.pt, e.en); }
    var items = [];
    EL.forEach(function (e) {
      items.push({ id: 'sym-' + e.i, level: e.level, make: function (rand) {
        return ask('', 'science', T('Qual é o símbolo químico do elemento ' + e.pt + '?', 'What is the chemical symbol for ' + e.en + '?'),
          e.sym, EL.map(function (o) { return o.sym; }).filter(function (s) { return s[0] === e.sym[0] || rand() < 0.3; }), rand);
      } });
      items.push({ id: 'el-' + e.i, level: e.level, make: function (rand) {
        return ask('', 'science', T('Que elemento químico tem o símbolo ' + e.sym + '?', 'Which chemical element has the symbol ' + e.sym + '?'),
          nameOf(e), EL.map(nameOf), rand);
      } });
      items.push({ id: 'z-' + e.i, level: clampLevel(e.level + 1), make: function (rand) {
        return build('', 'science', T('Qual é o número atómico do elemento ' + e.pt + '?', 'What is the atomic number of ' + e.en + '?'),
          [e.z].concat(nearNumbers(rand, e.z, 4, 1, 118)).map(both), rand);
      } });
      items.push({ id: 'zr-' + e.i, level: clampLevel(e.level + 1), make: function (rand) {
        return ask('', 'science', T('Que elemento tem o número atómico ' + e.z + '?', 'Which element has atomic number ' + e.z + '?'),
          nameOf(e), EL.filter(function (o) { return Math.abs(o.z - e.z) <= 10; }).map(nameOf), rand);
      } });
    });
    GENS.push(listGen('el', 'science', items));

    var groups = Object.keys(F.ELEMENT_GROUPS);
    var groupCount = 0;
    groups.forEach(function (g) {
      var n = EL.filter(function (e) { return e.group === g; }).length;
      groupCount += n * choose(EL.length - n, 3);
    });
    GENS.push(comboGen('el-group', 'science', groupCount, function (rand) {
      var g = pick(rand, groups);
      var right = pick(rand, EL.filter(function (e) { return e.group === g; }));
      var others = shuffle(EL.filter(function (e) { return e.group !== g; }), rand).slice(0, 3);
      return {
        key: g + right.i + '.' + others.map(function (e) { return e.i; }).sort().join('.'),
        level: clampLevel(Math.max(right.level, 2) + (rand() < 0.5 ? 0 : 1)),
        q: build('', 'science', T('Qual destes elementos é ' + F.ELEMENT_GROUPS[g].pt + '?', 'Which of these elements is ' + F.ELEMENT_GROUPS[g].en + '?'),
          [nameOf(right)].concat(others.map(nameOf)), rand)
      };
    }));
    GENS.push(comboGen('el-z', 'science', choose(EL.length, 4) * 2, function (rand) {
      var four = shuffle(EL, rand).slice(0, 4).sort(function (a, b) { return a.z - b.z; });
      var most = rand() < 0.5;
      var right = most ? four[3] : four[0];
      var gap = most ? four[3].z - four[2].z : four[1].z - four[0].z;
      return {
        key: (most ? 'm' : 'l') + four.map(function (e) { return e.i; }).join('.'),
        level: gap > 20 ? 2 : gap > 5 ? 3 : 4,
        q: build('', 'science', most
          ? T('Qual destes elementos tem mais protões (maior número atómico)?', 'Which of these elements has the most protons (highest atomic number)?')
          : T('Qual destes elementos tem menos protões (menor número atómico)?', 'Which of these elements has the fewest protons (lowest atomic number)?'),
          [nameOf(right)].concat(four.filter(function (e) { return e !== right; }).map(nameOf)), rand)
      };
    }));

    // Animals
    var A = F.ANIMALS.map(function (r, i) { return { i: i, pt: r[0], en: r[1], cls: r[2], level: +r[3] }; });
    var classes = Object.keys(F.ANIMAL_CLASSES);
    function clsName(c) { return T(F.ANIMAL_CLASSES[c].pt, F.ANIMAL_CLASSES[c].en); }
    var aItems = A.map(function (a) {
      return { id: 'cls-' + a.i, level: a.level, make: function (rand) {
        return ask('', 'science', T('Que tipo de animal é este: ' + a.pt + '?', 'What kind of animal is the ' + a.en + '?'),
          clsName(a.cls), classes.map(clsName), rand);
      } };
    });
    GENS.push(listGen('ani', 'science', aItems));
    var aCombo = 0;
    classes.forEach(function (c) {
      var n = A.filter(function (a) { return a.cls === c; }).length;
      aCombo += n * choose(A.length - n, 3);
    });
    GENS.push(comboGen('ani-which', 'science', aCombo, function (rand) {
      var c = pick(rand, classes);
      var right = pick(rand, A.filter(function (a) { return a.cls === c; }));
      var others = shuffle(A.filter(function (a) { return a.cls !== c; }), rand).slice(0, 3);
      var n = F.ANIMAL_CLASSES[c];
      return {
        key: c + right.i + '.' + others.map(function (a) { return a.i; }).sort().join('.'),
        level: right.level,
        q: build('', 'science', T('Qual destes animais é ' + n.apt + '?', 'Which of these animals is ' + n.aen + '?'),
          [T(right.pt, right.en)].concat(others.map(function (a) { return T(a.pt, a.en); })), rand)
      };
    }));

    // Body
    var B = F.BODY.map(function (r, i) { return { i: i, pt: r[0], en: r[1], fpt: r[2], fen: r[3], level: +r[4] }; });
    var bItems = [];
    B.forEach(function (b) {
      bItems.push({ id: 'part-' + b.i, level: b.level, make: function (rand) {
        return ask('', 'science', T('Que parte do corpo ' + b.fpt + '?', 'Which part of the body ' + b.fen + '?'),
          T(b.pt, b.en), B.map(function (o) { return T(o.pt, o.en); }), rand);
      } });
      bItems.push({ id: 'func-' + b.i, level: clampLevel(b.level + 1), make: function (rand) {
        function f(o) { return T(o.fpt.charAt(0).toUpperCase() + o.fpt.slice(1), o.fen.charAt(0).toUpperCase() + o.fen.slice(1)); }
        return ask('', 'science', T('Qual destas frases descreve: ' + b.pt + '?', 'Which of these describes the ' + b.en + '?'),
          f(b), B.map(f), rand);
      } });
    });
    GENS.push(listGen('body', 'science', bItems));

    // Planets
    var PL = F.PLANETS.map(function (r, i) { return { i: i, pt: r[0], en: r[1], size: +r[2], rocky: r[3] === '1', the: r[0] === 'Terra' ? 'a Terra' : r[0] }; });
    var ordPt = ['primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'sétimo', 'oitavo'];
    var ordEn = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
    var plItems = [];
    PL.forEach(function (p) {
      plItems.push({ id: 'nth-' + p.i, level: p.i < 4 ? 2 : 3, make: function (rand) {
        return ask('', 'science', T('Qual é o ' + ordPt[p.i] + ' planeta a contar do Sol?', 'Which is the ' + ordEn[p.i] + ' planet from the Sun?'),
          T(p.pt, p.en), PL.map(function (o) { return T(o.pt, o.en); }), rand);
      } });
      plItems.push({ id: 'pos-' + p.i, level: p.i === 2 ? 1 : 3, make: function (rand) {
        var cs = [0, 1, 2, 3, 4, 5, 6, 7].filter(function (k) { return k !== p.i && Math.abs(k - p.i) <= 3; });
        return ask('', 'science', T('A contar do Sol, que lugar ocupa ' + p.the + '?', 'Counting from the Sun, what place is ' + (p.en === 'Earth' ? 'the Earth' : p.en) + ' in?'),
          T(ordPt[p.i] + ' planeta', ordEn[p.i] + ' planet'), cs.map(function (k) { return T(ordPt[k] + ' planeta', ordEn[k] + ' planet'); }), rand);
      } });
    });
    GENS.push(listGen('pl', 'science', plItems));
    GENS.push(comboGen('pl-cmp', 'science', choose(8, 4) * 4, function (rand) {
      var four = shuffle(PL, rand).slice(0, 4);
      var mode = rnd(rand, 0, 3);
      var key = function (p) { return mode < 2 ? p.i : p.size; };
      four.sort(function (a, b) { return key(a) - key(b); });
      var right = mode === 0 || mode === 3 ? four[0] : four[3];
      var q = [
        T('Qual destes planetas está mais perto do Sol?', 'Which of these planets is closest to the Sun?'),
        T('Qual destes planetas está mais longe do Sol?', 'Which of these planets is farthest from the Sun?'),
        T('Qual destes planetas é o mais pequeno?', 'Which of these planets is the smallest?'),
        T('Qual destes planetas é o maior?', 'Which of these planets is the biggest?')
      ][mode];
      return {
        key: mode + ':' + four.map(function (p) { return p.i; }).sort().join('.'),
        level: mode < 2 ? 2 : 3,
        q: build('', 'science', q, [T(right.pt, right.en)].concat(four.filter(function (p) { return p !== right; }).map(function (p) { return T(p.pt, p.en); })), rand)
      };
    }));

    // Units
    var U = F.UNITS.map(function (r, i) { return { i: i, qpt: r[0], qen: r[1], unit: r[2], unitEn: r[3], sym: r[4], level: +r[5] }; });
    var uItems = [];
    U.forEach(function (u) {
      uItems.push({ id: 'u-' + u.i, level: u.level, make: function (rand) {
        return ask('', 'science', T('Qual é a unidade SI de ' + u.qpt + '?', 'What is the SI unit of ' + u.qen + '?'), T(u.unit, u.unitEn), U.map(function (o) { return T(o.unit, o.unitEn); }), rand);
      } });
      uItems.push({ id: 'ur-' + u.i, level: clampLevel(u.level + 1), make: function (rand) {
        return ask('', 'science', T('O ' + u.unit + ' é a unidade SI de…', 'The ' + u.unitEn + ' is the SI unit of…'),
          T(u.qpt, u.qen), U.map(function (o) { return T(o.qpt, o.qen); }), rand);
      } });
      uItems.push({ id: 'us-' + u.i, level: clampLevel(u.level + 1), make: function (rand) {
        return ask('', 'science', T('Qual é o símbolo do ' + u.unit + '?', 'What is the symbol of the ' + u.unitEn + '?'), u.sym, U.map(function (o) { return o.sym; }), rand);
      } });
    });
    GENS.push(listGen('units', 'science', uItems));

    // Unit conversions: [from pt, from en, to pt, to en, factor, min, max, level]
    var CONV = [
      ['quilómetros', 'kilometres', 'metros', 'metres', 1000, 1, 30, 1],
      ['metros', 'metres', 'centímetros', 'centimetres', 100, 1, 50, 1],
      ['centímetros', 'centimetres', 'milímetros', 'millimetres', 10, 1, 60, 2],
      ['quilogramas', 'kilograms', 'gramas', 'grams', 1000, 1, 30, 1],
      ['litros', 'litres', 'mililitros', 'millilitres', 1000, 1, 20, 2],
      ['horas', 'hours', 'minutos', 'minutes', 60, 1, 24, 2],
      ['minutos', 'minutes', 'segundos', 'seconds', 60, 1, 30, 2],
      ['dias', 'days', 'horas', 'hours', 24, 1, 14, 3],
      ['semanas', 'weeks', 'dias', 'days', 7, 1, 52, 2],
      ['toneladas', 'tonnes', 'quilogramas', 'kilograms', 1000, 1, 20, 3],
      ['horas', 'hours', 'segundos', 'seconds', 3600, 1, 10, 4],
      ['quilómetros', 'kilometres', 'centímetros', 'centimetres', 100000, 1, 10, 4]
    ];
    var cItems = [];
    CONV.forEach(function (c, ci) {
      for (var v = c[5]; v <= c[6]; v++) {
        (function (v) {
          var ans = v * c[4];
          cItems.push({ id: 'cv-' + ci + '-' + v, level: c[7], make: function (rand) {
            var opts = [ans, v * c[4] / 10, v * c[4] * 10, (v + 1) * c[4]];
            if (c[4] === 60 || c[4] === 24 || c[4] === 7 || c[4] === 3600) opts = [ans, v * 100, (v + 1) * c[4], (v - 1 || v + 2) * c[4]];
            var uniq = opts.filter(function (x, k) { return opts.indexOf(x) === k && x !== ans; });
            var fill = nearNumbers(rand, ans, Math.max(5, Math.round(ans / 4)), 1, ans * 3);
            uniq = uniq.concat(fill).filter(function (x, k, a) { return a.indexOf(x) === k; }).slice(0, 3);
            return build('', 'science', T('Quantos ' + c[2] + ' há em ' + v + ' ' + c[0] + '?', 'How many ' + c[3] + ' are there in ' + v + ' ' + c[1] + '?'),
              [ans].concat(uniq).map(function (x) { return both(String(x)); }), rand);
          } });
        })(v);
      }
    });
    for (var tc = -40; tc <= 100; tc += 5) {
      (function (tc) {
        var tf = tc * 9 / 5 + 32;
        cItems.push({ id: 'tf-' + tc, level: 4, make: function (rand) {
          return build('', 'science', T(tc + ' °C correspondem a quantos graus Fahrenheit?', 'How many degrees Fahrenheit is ' + tc + ' °C?'),
            [tf, tf + 9, tf - 9, tc + 32].filter(function (x, k, a) { return a.indexOf(x) === k; }).concat([tf + 18]).slice(0, 4).map(function (x) { return both(x + ' °F'); }), rand);
        } });
      })(tc);
    }
    GENS.push(listGen('conv', 'science', cItems));

    // Continents and oceans
    function bigGen(id, list, ptNoun, enNoun, ptNounPl, enNounPl) {
      var L = list.map(function (r, i) { return { i: i, pt: r[0], en: r[1] }; });
      return comboGen(id, 'science', choose(L.length, 4) * 2, function (rand) {
        var picked = shuffle(L, rand).slice(0, 4).sort(function (a, b) { return a.i - b.i; });
        var big = rand() < 0.5;
        var right = big ? picked[0] : picked[3];
        var answers = [T(right.pt, right.en)].concat(picked.filter(function (p) { return p !== right; }).map(function (p) { return T(p.pt, p.en); }));
        return {
          key: (big ? 'b' : 's') + picked.map(function (p) { return p.i; }).join('.'),
          level: big ? 2 : 3,
          q: build('', 'science', big
            ? T('Qual destes ' + ptNounPl + ' é o maior?', 'Which of these ' + enNounPl + ' is the biggest?')
            : T('Qual destes ' + ptNounPl + ' é o mais pequeno?', 'Which of these ' + enNounPl + ' is the smallest?'), answers, rand)
        };
      });
    }
    GENS.push(bigGen('cont', F.CONTINENTS, 'continente', 'continent', 'continentes', 'continents'));
    GENS.push(bigGen('ocean', F.OCEANS.map(function (r) { return ['Oceano ' + r[0], r[1] + ' Ocean']; }), 'oceano', 'ocean', 'oceanos', 'oceans'));

    // Discoveries
    var D = F.DISCOVERIES.map(function (r, i) { return { i: i, year: +r[0], who: r[1], whoEn: r[2], pt: r[3], en: r[4], level: +r[5] }; });
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    var dItems = [];
    D.forEach(function (d) {
      dItems.push({ id: 'who-' + d.i, level: d.level, make: function (rand) {
        return ask('', 'science', T('Quem ' + d.pt + '?', 'Who ' + d.en + '?'), T(cap(d.who), cap(d.whoEn)), D.map(function (o) { return T(cap(o.who), cap(o.whoEn)); }), rand);
      } });
      dItems.push({ id: 'yr-' + d.i, level: clampLevel(d.level + 1), make: function (rand) {
        return build('', 'science', T('Em que ano aconteceu isto: ' + d.who + ' ' + d.pt + '?', 'In which year did this happen: ' + d.whoEn + ' ' + d.en + '?'),
          [d.year].concat(nearNumbers(rand, d.year, 15, 1500, 2025)).map(both), rand);
      } });
    });
    GENS.push(listGen('disc', 'science', dItems));
    GENS.push(comboGen('disc-order', 'science', choose(D.length, 4) * 2, function (rand) {
      var four = shuffle(D, rand).slice(0, 4).sort(function (a, b) { return a.year - b.year; });
      var first = rand() < 0.5;
      var right = first ? four[0] : four[3];
      var gap = first ? four[1].year - four[0].year : four[3].year - four[2].year;
      function txt(d) { return T(cap(d.who) + ' ' + d.pt, cap(d.whoEn) + ' ' + d.en); }
      return {
        key: (first ? 'f' : 'l') + four.map(function (d) { return d.i; }).join('.'),
        level: gapLevel(gap),
        q: build('', 'science', first
          ? T('Qual destas descobertas aconteceu primeiro?', 'Which of these happened first?')
          : T('Qual destas descobertas aconteceu mais recentemente?', 'Which of these happened most recently?'),
          [txt(right)].concat(four.filter(function (d) { return d !== right; }).map(txt)), rand)
      };
    }));
  })();

  // ============================================================= portuguese
  (function () {
    var PERSONS = ['Eu', 'Tu', 'Ele', 'Nós', 'Eles'];
    var TENSES = {
      pres: { pt: 'presente do indicativo', en: 'present tense (presente do indicativo)' },
      perf: { pt: 'pretérito perfeito', en: 'simple past (pretérito perfeito)' },
      imp: { pt: 'pretérito imperfeito', en: 'past continuous (pretérito imperfeito)' },
      fut: { pt: 'futuro do indicativo', en: 'future tense (futuro do indicativo)' }
    };
    var END = {
      pres: { ar: ['o', 'as', 'a', 'amos', 'am'], er: ['o', 'es', 'e', 'emos', 'em'], ir: ['o', 'es', 'e', 'imos', 'em'] },
      perf: { ar: ['ei', 'aste', 'ou', 'ámos', 'aram'], er: ['i', 'este', 'eu', 'emos', 'eram'], ir: ['i', 'iste', 'iu', 'imos', 'iram'] },
      imp: { ar: ['ava', 'avas', 'ava', 'ávamos', 'avam'], er: ['ia', 'ias', 'ia', 'íamos', 'iam'], ir: ['ia', 'ias', 'ia', 'íamos', 'iam'] }
    };
    function conj(verb, tense) {
      if (tense === 'fut') return ['ei', 'ás', 'á', 'emos', 'ão'].map(function (e) { return verb + e; });
      var stem = verb.slice(0, -2), type = verb.slice(-2);
      return END[tense][type].map(function (e) { return stem + e; });
    }
    function conjQ(verb, tense, person, right, all, rand) {
      return ask('', 'portuguese',
        T('Completa no ' + TENSES[tense].pt + ': "' + PERSONS[person] + ' ___ (' + verb + ')."',
          'Complete in the Portuguese ' + TENSES[tense].en + ': "' + PERSONS[person] + ' ___ (' + verb + ')."'),
        right, all, rand);
    }
    TEST_HOOKS.conj = conj;
    var items = [];
    var LV = { pres: 1, fut: 2, perf: 2, imp: 3 };
    F.VERBS_AR.concat(F.VERBS_ER, F.VERBS_IR).forEach(function (verb) {
      var forms = {};
      Object.keys(TENSES).forEach(function (t) { forms[t] = conj(verb, t); });
      var all = [].concat(forms.pres, forms.perf, forms.imp, forms.fut);
      Object.keys(TENSES).forEach(function (t) {
        for (var p = 0; p < 5; p++) {
          (function (t, p) {
            items.push({ id: verb + '-' + t + p, level: clampLevel(LV[t] + (verb.slice(-2) === 'ar' ? 0 : 1) - (t === 'pres' ? 0 : 0)), make: function (rand) {
              return conjQ(verb, t, p, forms[t][p], all, rand);
            } });
          })(t, p);
        }
      });
    });
    F.VERBS_IRREGULAR.forEach(function (r) {
      var verb = r[0], pres = r[1].split(','), perf = r[2].split(',');
      var all = pres.concat(perf);
      for (var p = 0; p < 5; p++) {
        (function (p) {
          items.push({ id: verb + '-pres' + p, level: 3, make: function (rand) { return conjQ(verb, 'pres', p, pres[p], all, rand); } });
          items.push({ id: verb + '-perf' + p, level: 4, make: function (rand) { return conjQ(verb, 'perf', p, perf[p], all, rand); } });
        })(p);
      }
    });
    GENS.push(listGen('conj', 'portuguese', items));

    // Plurals: wrong answers are the plausible mistakes.
    function pluralMistakes(s) {
      var out = [];
      if (s.indexOf('-') > 0) {
        var parts = s.split('-');
        out.push(parts[0] + 's-' + parts.slice(1).join('-'), parts[0] + 's-' + parts.slice(1).join('-') + 's', s + 's', s + 'es');
      }
      if (/ão$/.test(s)) { var st = s.slice(0, -2); out.push(st + 'ões', st + 'ães', st + 'ãos', s + 'es'); }
      if (/el$/.test(s)) { var e = s.slice(0, -2); out.push(e + 'eis', e + 'éis', s + 's', s + 'es'); }
      if (/ol$/.test(s)) { var o = s.slice(0, -2); out.push(o + 'ois', o + 'óis', s + 's', s + 'es'); }
      if (/[ai]l$/.test(s)) { out.push(s.slice(0, -1) + 'is', s.slice(0, -1) + 'eis', s + 's', s + 'es'); }
      if (/ul$/.test(s)) { out.push(s + 's', s + 'es', s.slice(0, -1) + 'is'); }
      if (/m$/.test(s)) { out.push(s + 's', s.slice(0, -1) + 'ns', s + 'es'); }
      if (/[rzs]$/.test(s)) { out.push(s + 's', s + 'es', s + 'ses', s.replace(/[éêá]/, function (c) { return { 'é': 'e', 'ê': 'e', 'á': 'a' }[c]; }) + 'es'); }
      if (/[ueéi]$/.test(s)) { out.push(s + 's', s + 'es', s + 'is'); }
      out.push(s + 's', s + 'es', s + 'is', plain(s) + 's');
      return out;
    }
    var pItems = F.PLURALS.map(function (r, i) {
      var level = /ão$|il$|el$|ol$/.test(r[0]) ? 2 : r[0].indexOf('-') > 0 ? 4 : r[0] === r[1] ? 3 : 1;
      if (/ãos$|ães$/.test(r[1])) level = 3;
      return { id: 'pl-' + i, level: level, make: function (rand) {
        return ask('', 'portuguese', T('Qual é o plural de "' + r[0] + '"?', 'What is the plural of the Portuguese word "' + r[0] + '"?'),
          r[1], pluralMistakes(r[0]).filter(function (w) { return w !== r[1]; }), rand);
      } };
    });
    GENS.push(listGen('plural', 'portuguese', pItems));

    // Feminine and masculine
    var FEM = F.FEMININES;
    var fItems = [];
    FEM.forEach(function (r, i) {
      fItems.push({ id: 'fem-' + i, level: i < 20 ? 1 : 2, make: function (rand) {
        var naive = /[rlzão]$/.test(r[0]) ? [r[0] + 'a'] : [];
        return ask('', 'portuguese', T('Qual é o feminino de "' + r[0] + '"?', 'What is the feminine of the Portuguese word "' + r[0] + '"?'),
          r[1], naive.concat(FEM.map(function (x) { return x[1]; })), rand);
      } });
      fItems.push({ id: 'masc-' + i, level: i < 20 ? 2 : 3, make: function (rand) {
        return ask('', 'portuguese', T('Qual é o masculino de "' + r[1] + '"?', 'What is the masculine of the Portuguese word "' + r[1] + '"?'),
          r[0], FEM.map(function (x) { return x[0]; }), rand);
      } });
    });
    GENS.push(listGen('gender', 'portuguese', fItems));

    // Collective nouns
    var COL = F.COLLECTIVES;
    var colItems = [];
    COL.forEach(function (r, i) {
      colItems.push({ id: 'col-' + i, level: i < 12 ? 2 : 3, make: function (rand) {
        return ask('', 'portuguese', T('Como se chama um conjunto de ' + r[1] + '?', 'In Portuguese, what is the collective noun for a group of ' + r[2] + ' (' + r[1] + ')?'),
          r[0], COL.map(function (x) { return x[0]; }), rand);
      } });
      colItems.push({ id: 'colr-' + i, level: i < 12 ? 2 : 4, make: function (rand) {
        return ask('', 'portuguese', T('"' + r[0] + '" é um conjunto de…', 'In Portuguese, a "' + r[0] + '" is a group of…'),
          T(r[1], r[2]), COL.map(function (x) { return T(x[1], x[2]); }), rand);
      } });
    });
    GENS.push(listGen('collective', 'portuguese', colItems));

    // Synonyms: the wrong answers never share a stem with the group.
    var SYN = F.SYNONYMS;
    var sItems = [];
    SYN.forEach(function (g, gi) {
      var stems = g.map(function (w) { return plain(w).slice(0, 4); });
      var pool = [];
      SYN.forEach(function (o, oi) { if (oi !== gi) o.forEach(function (w) { if (stems.indexOf(plain(w).slice(0, 4)) < 0) pool.push(w); }); });
      g.forEach(function (w, wi) {
        g.forEach(function (s, si) {
          if (si === wi) return;
          sItems.push({ id: 'syn-' + gi + '-' + wi + '-' + si, level: wi === 0 ? 2 : wi + si >= 3 ? 4 : 3, make: function (rand) {
            return ask('', 'portuguese', T('Qual é o sinónimo de "' + w + '"?', 'Which Portuguese word is a synonym of "' + w + '"?'),
              s, pool, rand);
          } });
        });
      });
    });
    GENS.push(listGen('syn', 'portuguese', sItems));

    // Opposites (Portuguese and English share the logic)
    function oppositeGen(id, topic, pairs, clusters, qText, levelOf) {
      var words = [];
      pairs.forEach(function (p) { words.push(p[0], p[1]); });
      function clusterOf(w) {
        for (var c = 0; c < clusters.length; c++) if (clusters[c].indexOf(w) >= 0) return c;
        return -1;
      }
      var its = [];
      pairs.forEach(function (p, pi) {
        [[p[0], p[1]], [p[1], p[0]]].forEach(function (d, di) {
          var cw = clusterOf(d[0]), ca = clusterOf(d[1]);
          var pool = words.filter(function (w) {
            if (w === d[0] || w === d[1]) return false;
            var c = clusterOf(w);
            return c < 0 || (c !== cw && c !== ca);
          });
          its.push({ id: 'op-' + pi + '-' + di, level: levelOf(pi, di), make: function (rand) {
            return ask('', topic, qText(d[0]), d[1], pool, rand);
          } });
        });
      });
      return listGen(id, topic, its);
    }
    GENS.push(oppositeGen('ant', 'portuguese', F.ANTONYMS, F.ANTONYM_CLUSTERS, function (w) {
      return T('Qual é o antónimo (contrário) de "' + w + '"?', 'What is the antonym (opposite) of the Portuguese word "' + w + '"?');
    }, function (pi, di) { return pi < 30 ? 1 + di : pi < 60 ? 2 + di : 3 + di; }));

    // Word classes
    var WC = F.WORD_CLASSES;
    var classes = Object.keys(F.WORD_CLASS_NAMES);
    var wcItems = WC.map(function (r, i) {
      return { id: 'wc-' + i, level: r[1] === 'adv' ? 3 : 2, make: function (rand) {
        return build('', 'portuguese', T('A palavra "' + r[0] + '" é…', 'In Portuguese, the word "' + r[0] + '" is…'),
          [F.WORD_CLASS_NAMES[r[1]]].concat(classes.filter(function (c) { return c !== r[1]; }).map(function (c) { return F.WORD_CLASS_NAMES[c]; })), rand);
      } };
    });
    GENS.push(listGen('wc', 'portuguese', wcItems));
    var wcCount = 0;
    classes.forEach(function (c) {
      var n = WC.filter(function (r) { return r[1] === c; }).length;
      wcCount += n * choose(WC.length - n, 3);
    });
    GENS.push(comboGen('wc-which', 'portuguese', wcCount, function (rand) {
      var c = pick(rand, classes);
      var mine = WC.filter(function (r) { return r[1] === c; });
      var right = pick(rand, mine);
      var others = shuffle(WC.filter(function (r) { return r[1] !== c; }), rand).slice(0, 3);
      var n = F.WORD_CLASS_NAMES[c];
      return {
        key: c + WC.indexOf(right) + '.' + others.map(function (r) { return WC.indexOf(r); }).sort().join('.'),
        level: c === 'adv' ? 3 : c === 'noun' ? 1 : 2,
        q: build('', 'portuguese', T('Qual destas palavras é um ' + n.pt + '?', 'Which of these Portuguese words is ' + n.aen + '?'),
          [right[0]].concat(others.map(function (r) { return r[0]; })).map(both), rand)
      };
    }));

    // Spelling
    var spItems = F.SPELLING.map(function (r, i) {
      return { id: 'sp-' + i, level: +r[4], make: function (rand) {
        return build('', 'portuguese', T('Qual destas palavras está escrita corretamente?', 'Which of these Portuguese words is spelt correctly?'),
          r.slice(0, 4).map(both), rand);
      } };
    });
    GENS.push(listGen('spell', 'portuguese', spItems));
  })();

  // ================================================================ english
  (function () {
    // Vocabulary, both ways. Wrong answers come from the same category.
    var V = F.VOCAB.map(function (r, i) { return { i: i, cat: r[0], pt: r[1], en: r[2] }; });
    var EASY = ['animal', 'colour', 'family', 'body', 'school', 'food'];
    var HARD = ['weather', 'clothes', 'job', 'adj'];
    function vLevel(v, dir) { var b = EASY.indexOf(v.cat) >= 0 ? 1 : HARD.indexOf(v.cat) >= 0 ? 3 : 2; return clampLevel(b + dir); }
    var items = [];
    V.forEach(function (v) {
      var same = V.filter(function (o) { return o.cat === v.cat; });
      items.push({ id: 'te-' + v.i, level: vLevel(v, 0), make: function (rand) {
        return ask('', 'english', T('Como se diz "' + v.pt + '" em inglês?', 'What is the Portuguese word "' + v.pt + '" in English?'),
          v.en, same.map(function (o) { return o.en; }), rand);
      } });
      items.push({ id: 'tp-' + v.i, level: vLevel(v, 1), make: function (rand) {
        return ask('', 'english', T('O que significa "' + v.en + '" em português?', 'What does "' + v.en + '" mean in Portuguese?'),
          v.pt, same.map(function (o) { return o.pt; }), rand);
      } });
    });
    GENS.push(listGen('voc', 'english', items));

    var cats = Object.keys(F.VOCAB_CATEGORIES);
    // Categories that overlap (an "orange" is food and a colour): never mixed.
    var CLASH = { food: ['animal', 'colour'], animal: ['food'], colour: ['food'], place: ['house', 'school'], house: ['place'], school: ['job', 'place'], job: ['school', 'family'], family: ['job'] };
    var catCount = 0;
    cats.forEach(function (c) {
      var n = V.filter(function (v) { return v.cat === c; }).length;
      var m = V.filter(function (v) { return v.cat !== c && cats.indexOf(v.cat) >= 0 && (CLASH[c] || []).indexOf(v.cat) < 0; }).length;
      catCount += n * choose(m, 3);
    });
    GENS.push(comboGen('voc-cat', 'english', catCount, function (rand) {
      var c = pick(rand, cats);
      var right = pick(rand, V.filter(function (v) { return v.cat === c; }));
      var others = shuffle(V.filter(function (v) { return v.cat !== c && cats.indexOf(v.cat) >= 0 && (CLASH[c] || []).indexOf(v.cat) < 0; }), rand).slice(0, 3);
      var n = F.VOCAB_CATEGORIES[c];
      return {
        key: c + right.i + '.' + others.map(function (v) { return v.i; }).sort().join('.'),
        level: EASY.indexOf(c) >= 0 ? 1 : 2,
        q: build('', 'english', T('Qual destas palavras inglesas é ' + n.pt + '?', 'Which of these English words is ' + n.en + '?'),
          [right.en].concat(others.map(function (v) { return v.en; })).map(both), rand)
      };
    }));

    // Irregular verbs
    var IR = F.IRREGULAR.map(function (r, i) { return { i: i, base: r[0], past: r[1], pp: r[2], pt: r[3] }; });
    function regular(b) { return /e$/.test(b) ? b + 'd' : b + 'ed'; }
    var irItems = [];
    IR.forEach(function (v) {
      var common = ['go', 'eat', 'see', 'come', 'do', 'have', 'make', 'run', 'swim', 'drink', 'buy', 'write', 'read', 'say', 'take', 'give'].indexOf(v.base) >= 0;
      irItems.push({ id: 'past-' + v.i, level: common ? 2 : 3, make: function (rand) {
        var pool = [regular(v.base), v.pp, v.base, v.base + 's', regular(v.past)].concat(IR.map(function (o) { return o.past; }).filter(function () { return rand() < 0.1; }));
        return ask('', 'english', T('Qual é o passado (past simple) de "' + v.base + '"?', 'What is the past simple of "' + v.base + '"?'), v.past, pool, rand);
      } });
      irItems.push({ id: 'pp-' + v.i, level: common ? 3 : 4, make: function (rand) {
        var pool = [regular(v.base), v.past, v.base + 's', v.base + 'en', regular(v.pp)].concat(IR.map(function (o) { return o.pp; }).filter(function () { return rand() < 0.1; }));
        return ask('', 'english', T('Qual é o particípio passado de "' + v.base + '"?', 'What is the past participle of "' + v.base + '"?'), v.pp, pool, rand);
      } });
      irItems.push({ id: 'base-' + v.i, level: common ? 2 : 3, make: function (rand) {
        if (v.past === v.base) return null;
        return ask('', 'english', T('"' + v.past + '" é o passado de que verbo?', '"' + v.past + '" is the past simple of which verb?'), v.base,
          IR.filter(function (o) { return o.base !== v.past; }).map(function (o) { return o.base; }), rand);
      } });
      if (v.pt) {
        irItems.push({ id: 'mean-' + v.i, level: common ? 1 : 2, make: function (rand) {
          return ask('', 'english', T('O que significa o verbo "' + v.base + '"?', 'What does the verb "' + v.base + '" mean in Portuguese?'), v.pt,
            IR.filter(function (o) { return o.pt; }).map(function (o) { return o.pt; }), rand);
        } });
        irItems.push({ id: 'tr-' + v.i, level: common ? 1 : 2, make: function (rand) {
          return ask('', 'english', T('Como se diz "' + v.pt + '" em inglês?', 'What is "' + v.pt + '" in English?'), v.base,
            IR.filter(function (o) { return o.pt; }).map(function (o) { return o.base; }), rand);
        } });
      }
    });
    GENS.push(listGen('irr', 'english', irItems));

    // Numbers in words (British English)
    var ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
      'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    function words(n) {
      if (n < 20) return ONES[n];
      if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
      return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + words(n % 100) : '');
    }
    function numLevel(n) { return n <= 20 ? 1 : n < 100 ? 2 : n % 10 === 0 ? 3 : 4; }
    function nearNums(rand, n) {
      var c = [n + 1, n - 1, n + 10, n - 10, n + 100, n - 100, +String(n).split('').reverse().join('')];
      if (n % 10 === 0 && n < 100) c.push(n / 10 + 10);
      return shuffle(c.filter(function (x) { return x > 0 && x < 1000 && x !== n; }), rand);
    }
    TEST_HOOKS.words = words;
    TEST_HOOKS.ordinal = function (n) { return ordinal(n); };
    var numItems = [];
    for (var n = 1; n <= 999; n++) {
      (function (n) {
        numItems.push({ id: 'w-' + n, level: numLevel(n), make: function (rand) {
          return ask('', 'english', T('Como se escreve ' + n + ' em inglês?', 'How do you write ' + n + ' in words?'), words(n), nearNums(rand, n).map(words), rand);
        } });
        numItems.push({ id: 'n-' + n, level: numLevel(n), make: function (rand) {
          return ask('', 'english', T('Que número é "' + words(n) + '"?', 'Which number is "' + words(n) + '"?'), String(n), nearNums(rand, n).map(String), rand);
        } });
      })(n);
    }
    // Ordinals 1st–31st
    var ORD = { 1: 'first', 2: 'second', 3: 'third', 5: 'fifth', 8: 'eighth', 9: 'ninth', 12: 'twelfth' };
    function ordinal(n) {
      if (ORD[n]) return ORD[n];
      if (n < 20) return ONES[n] + 'th';
      if (n % 10 === 0) return TENS[n / 10].slice(0, -1) + 'ieth';
      return TENS[Math.floor(n / 10)] + '-' + ordinal(n % 10);
    }
    for (var o = 1; o <= 31; o++) {
      (function (o) {
        numItems.push({ id: 'o-' + o, level: o <= 3 ? 1 : o <= 12 ? 2 : 3, make: function (rand) {
          var c = [o + 1, o - 1, o + 10, o - 10, o + 2].filter(function (x) { return x > 0 && x <= 40 && x !== o; });
          return ask('', 'english', T('Como se diz o ' + o + '.º em inglês?', 'How do you write the ordinal number ' + o + ' in English?'), ordinal(o),
            c.map(ordinal).concat([words(o) + 'th']), rand);
        } });
      })(o);
    }
    GENS.push(listGen('num', 'english', numItems));

    // English opposites
    GENS.push(oppositeGenEn());
    function oppositeGenEn() {
      var pairs = F.EN_OPPOSITES, clusters = F.EN_OPPOSITE_CLUSTERS;
      var words = [];
      pairs.forEach(function (p) { words.push(p[0], p[1]); });
      function clusterOf(w) { for (var c = 0; c < clusters.length; c++) if (clusters[c].indexOf(w) >= 0) return c; return -1; }
      var its = [];
      pairs.forEach(function (p, pi) {
        [[p[0], p[1]], [p[1], p[0]]].forEach(function (d, di) {
          var cw = clusterOf(d[0]), ca = clusterOf(d[1]);
          var pool = words.filter(function (w) {
            if (w === d[0] || w === d[1]) return false;
            var c = clusterOf(w);
            return c < 0 || (c !== cw && c !== ca);
          });
          its.push({ id: 'op-' + pi + '-' + di, level: pi < 20 ? 1 + di : pi < 40 ? 2 + di : 3 + Math.min(di, 1), make: function (rand) {
            return ask('', 'english', T('Qual é o contrário de "' + d[0] + '" em inglês?', 'What is the opposite of "' + d[0] + '"?'), d[1], pool, rand);
          } });
        });
      });
      return listGen('enopp', 'english', its);
    }

    // Plurals
    var plItems = F.EN_PLURALS.map(function (r, i) {
      var s = r[0];
      var regular = /(s|x|ch|sh)$/.test(s) || /[^aeiou]y$/.test(s);
      return { id: 'pl-' + i, level: regular ? 2 : 3, make: function (rand) {
        var pool = [s + 's', s + 'es', s.replace(/y$/, 'ies'), s.replace(/fe?$/, 'ves'), s + 'en', s.replace(/f$/, 'fs'), r[1] + 's', s + 'ren', s.replace(/oo/, 'ee'), s.replace(/ou/, 'i')];
        return ask('', 'english', T('Qual é o plural de "' + s + '" em inglês?', 'What is the plural of "' + s + '"?'), r[1], pool.filter(function (w) { return w !== s; }), rand);
      } };
    });
    GENS.push(listGen('enpl', 'english', plItems));

    // Comparatives and superlatives
    var cmpItems = [];
    F.EN_COMPARE.forEach(function (r, i) {
      var a = r[0], more = /^more /.test(r[1]);
      var naiveC = a + 'er', naiveS = a + 'est';
      cmpItems.push({ id: 'cmp-' + i, level: more ? 3 : 2, make: function (rand) {
        return ask('', 'english', T('Qual é o comparativo de "' + a + '"?', 'What is the comparative of "' + a + '"?'), r[1],
          [r[2], more ? naiveC : 'more ' + a, naiveC, a + a.slice(-1) + 'er', 'most ' + a], rand);
      } });
      cmpItems.push({ id: 'sup-' + i, level: more ? 3 : 2, make: function (rand) {
        return ask('', 'english', T('Qual é o superlativo de "' + a + '"?', 'What is the superlative of "' + a + '"?'), r[2],
          [r[1], more ? naiveS : 'most ' + a, naiveS, 'more ' + a, a + a.slice(-1) + 'est'], rand);
      } });
    });
    GENS.push(listGen('cmp', 'english', cmpItems));
  })();

  // ===================================================== genius science
  // Physics and chemistry, dealt on Science squares at Genius level. Numeric
  // questions are computed, so every answer is exact.
  (function () {
    function num(x) { var r = Math.round(x * 100) / 100; return T(String(r).replace('.', ','), String(r)); }
    function withUnit(x, u) { var n = num(x); return T(n.pt + ' ' + u, n.en + ' ' + u); }
    /** Four distinct numeric options: the answer plus typical mistakes, topped up with near values. */
    function numOpts(rand, ans, mistakes, u) {
      var out = [ans];
      mistakes.concat(nearNumbers(rand, ans, Math.max(2, Math.round(Math.abs(ans) / 3)), 0, ans * 4 + 10)).forEach(function (m) {
        m = Math.round(m * 100) / 100;
        if (out.length < 4 && m > 0 && out.indexOf(m) < 0) out.push(m);
      });
      while (out.length < 4) out.push(ans + out.length * 7);
      return out.map(function (x) { return withUnit(x, u); });
    }
    function physics(id, items) { var g = listGen(id, 'science', items); g.sub = 'physics'; return g; }
    function chemistry(id, items) { var g = listGen(id, 'science', items); g.sub = 'chemistry'; return g; }
    function combo(id, sub, count, sample) { var g = comboGen(id, 'science', count, sample); g.sub = sub; return g; }
    function each(a, b, f) { var out = []; a.forEach(function (x) { b.forEach(function (y) { var it = f(x, y); if (it) out.push(it); }); }); return out; }
    function q4(id, qpt, qen, ans, mistakes, u) {
      return { id: id, level: 4, make: function (rand) { return build('', 'science', T(qpt, qen), numOpts(rand, ans, mistakes, u), rand); } };
    }
    var range = function (a, b, step) { var r = []; for (var x = a; x <= b; x += step || 1) r.push(x); return r; };

    // ---------------------------------------------------------- physics
    var P = [];
    P = P.concat(each(range(10, 120, 10), range(1, 5), function (v, t) {
      var d = v * t;
      return q4('vkm-' + v + '-' + t, 'Um carro percorre ' + d + ' km em ' + t + ' h. Qual é a sua velocidade média?',
        'A car travels ' + d + ' km in ' + t + ' h. What is its average speed?', v, [d * t, d + t, v + 10], 'km/h');
    }));
    P = P.concat(each(range(2, 15), [5, 10, 20, 50], function (v, t) {
      var d = v * t;
      return q4('vms-' + v + '-' + t, 'Um corpo percorre ' + d + ' m em ' + t + ' s. Qual é a sua velocidade média?',
        'A body travels ' + d + ' m in ' + t + ' s. What is its average speed?', v, [d * t, d - t, v * 10], 'm/s');
    }));
    P = P.concat(each([2, 5, 10, 20, 50], range(1, 10), function (m, a) {
      return q4('fma-' + m + '-' + a, 'Que força resultante dá a um corpo de ' + m + ' kg uma aceleração de ' + a + ' m/s²?',
        'What net force gives a ' + m + ' kg body an acceleration of ' + a + ' m/s²?', m * a, [m + a, m * a * 10, m / a], 'N');
    }));
    P = P.concat(range(1, 60).map(function (m) {
      return q4('w-' + m, 'Qual é o peso de um corpo de ' + m + ' kg na Terra? (g = 10 N/kg)',
        'What is the weight of a ' + m + ' kg body on Earth? (g = 10 N/kg)', m * 10, [m, m * 100, m + 10], 'N');
    }));
    P = P.concat(each([1, 2, 3, 7, 8, 11], [2, 5, 10, 20], function (rho, V) {
      var m = rho * V;
      return q4('rho-' + rho + '-' + V, 'Um objeto tem ' + m + ' g de massa e ' + V + ' cm³ de volume. Qual é a sua massa volúmica?',
        'An object has a mass of ' + m + ' g and a volume of ' + V + ' cm³. What is its density?', rho, [m * V, m + V, rho * 10], 'g/cm³');
    }));
    P = P.concat(each([2, 5, 10, 20, 50, 100], [1, 2, 3, 4, 5], function (R, I) {
      return q4('ohm-' + R + '-' + I, 'Uma resistência de ' + R + ' Ω é percorrida por uma corrente de ' + I + ' A. Qual é a tensão aos seus terminais?',
        'A current of ' + I + ' A flows through a ' + R + ' Ω resistor. What is the voltage across it?', R * I, [R + I, R / I, R * I * 10], 'V');
    }));
    P = P.concat(each([2, 5, 10, 20, 50, 100], [1, 2, 3, 4, 5], function (R, I) {
      var V = R * I;
      return q4('ohmi-' + R + '-' + I, 'Aplica-se uma tensão de ' + V + ' V a uma resistência de ' + R + ' Ω. Qual é a corrente?',
        'A voltage of ' + V + ' V is applied across a ' + R + ' Ω resistor. What is the current?', I, [V * R, V - R > 0 ? V - R : I + 2, I * 10], 'A');
    }));
    P = P.concat(each([6, 12, 230], range(1, 10), function (V, I) {
      return q4('pvi-' + V + '-' + I, 'Um aparelho ligado a ' + V + ' V é percorrido por ' + I + ' A. Qual é a sua potência?',
        'A device on ' + V + ' V draws ' + I + ' A. What is its power?', V * I, [V + I, V / I, V * I * 2], 'W');
    }));
    P = P.concat(each([2, 4, 6, 10, 20], range(1, 10), function (m, v) {
      return q4('ec-' + m + '-' + v, 'Qual é a energia cinética de um corpo de ' + m + ' kg a ' + v + ' m/s?',
        'What is the kinetic energy of a ' + m + ' kg body moving at ' + v + ' m/s?', m * v * v / 2, [m * v * v, m * v / 2, m * v], 'J');
    }));
    P = P.concat(each([1, 2, 5, 10], [1, 2, 5, 10, 20, 50], function (m, h) {
      return q4('ep-' + m + '-' + h, 'Qual é a energia potencial gravítica de um corpo de ' + m + ' kg a ' + h + ' m de altura? (g = 10 N/kg)',
        'What is the gravitational potential energy of a ' + m + ' kg body ' + h + ' m high? (g = 10 N/kg)', m * 10 * h, [m * h, m * 10 + h, m * h * 100], 'J');
    }));
    P = P.concat(each([100, 200, 500, 1000, 2000], [1, 2, 4, 5, 10], function (F, A) {
      return q4('p-' + F + '-' + A, 'Uma força de ' + F + ' N atua numa área de ' + A + ' m². Qual é a pressão?',
        'A force of ' + F + ' N acts on an area of ' + A + ' m². What is the pressure?', F / A, [F * A, F - A, F / A * 10], 'Pa');
    }));
    P = P.concat(each([2, 5, 10, 50, 100], [1, 2, 3, 4, 5], function (f, l) {
      return q4('wave-' + f + '-' + l, 'Uma onda tem frequência ' + f + ' Hz e comprimento de onda ' + l + ' m. Qual é a sua velocidade?',
        'A wave has a frequency of ' + f + ' Hz and a wavelength of ' + l + ' m. What is its speed?', f * l, [f + l, f / l, f * l * 10], 'm/s');
    }));
    P = P.concat(each([5, 10, 20, 50], [2, 3, 5, 10], function (F, d) {
      return q4('work-' + F + '-' + d, 'Uma força de ' + F + ' N desloca um corpo ' + d + ' m na sua direção. Que trabalho realiza?',
        'A ' + F + ' N force moves a body ' + d + ' m in its direction. How much work does it do?', F * d, [F + d, F / d, F * d * 10], 'J');
    }));
    P = P.concat(each([10, 20, 30, 40, 60], [2, 5, 10], function (dv, dt) {
      if (dv % dt) return null;
      return q4('acc-' + dv + '-' + dt, 'Um carro passa de 0 a ' + dv + ' m/s em ' + dt + ' s. Qual é a aceleração média?',
        'A car goes from 0 to ' + dv + ' m/s in ' + dt + ' s. What is its average acceleration?', dv / dt, [dv * dt, dv - dt, dv / dt * 10], 'm/s²');
    }));
    P = P.concat(each([1, 2, 3], range(1, 5), function (kw, h) {
      return q4('kwh-' + kw + '-' + h, 'Um aquecedor de ' + kw + ' kW está ligado ' + h + ' h. Quanta energia gasta?',
        'A ' + kw + ' kW heater is on for ' + h + ' h. How much energy does it use?', kw * h, [kw + h, kw * h * 1000, kw * h * 60], 'kWh');
    }));
    function factItems(rows, prefix) {
      return rows.map(function (r, i) {
        function bi(x) { var p = x.split('~'); return T(p[0], p[1]); }
        return { id: prefix + i, level: 4, make: function (rand) { return build('', 'science', T(r[0], r[1]), r.slice(2, 6).map(bi), rand); } };
      });
    }
    P = P.concat(factItems(F.PHYSICS_FACTS, 'pf-'));
    GENS.push(physics('phys', P));

    var CD = F.CONDUCTORS.map(function (r, i) { return { i: i, pt: r[0], en: r[1], c: r[2] === '1' }; });
    var nC = CD.filter(function (x) { return x.c; }).length, nI = CD.length - nC;
    GENS.push(combo('phys-cond', 'physics', nC * choose(nI, 3) + nI * choose(nC, 3), function (rand) {
      var want = rand() < 0.5;
      var right = pick(rand, CD.filter(function (x) { return x.c === want; }));
      var others = shuffle(CD.filter(function (x) { return x.c !== want; }), rand).slice(0, 3);
      return {
        key: (want ? 'c' : 'i') + right.i + '.' + others.map(function (x) { return x.i; }).sort().join('.'),
        level: 4,
        q: build('', 'science', want
          ? T('Qual destes materiais é um bom condutor elétrico?', 'Which of these materials is a good electrical conductor?')
          : T('Qual destes materiais é um isolador elétrico?', 'Which of these materials is an electrical insulator?'),
          [T(right.pt, right.en)].concat(others.map(function (x) { return T(x.pt, x.en); })), rand)
      };
    }));

    // -------------------------------------------------------- chemistry
    var EL = {};
    F.ELEMENTS.forEach(function (r) { EL[r[1]] = { z: +r[0], pt: r[2], en: r[3] }; });
    var CP = F.COMPOUNDS.map(function (r, i) {
      var comp = r[3].split(',').map(function (p) { var kv = p.split(':'); return [kv[0], +kv[1]]; });
      return { i: i, pt: r[0], en: r[1], f: r[2], comp: comp };
    });
    var C = [];
    CP.forEach(function (c) {
      C.push({ id: 'fname-' + c.i, level: 4, make: function (rand) {
        return ask('', 'science', T('Que substância tem a fórmula química ' + c.f + '?', 'Which substance has the chemical formula ' + c.f + '?'),
          T(c.pt, c.en), CP.map(function (o) { return T(o.pt, o.en); }), rand);
      } });
      C.push({ id: 'ff-' + c.i, level: 4, make: function (rand) {
        return ask('', 'science', T('Qual é a fórmula química de: ' + c.pt + '?', 'What is the chemical formula of ' + c.en + '?'),
          c.f, CP.map(function (o) { return o.f; }), rand);
      } });
      var atoms = c.comp.reduce(function (a, kv) { return a + kv[1]; }, 0);
      C.push(q4('atoms-' + c.i, 'Quantos átomos tem uma unidade de ' + c.f + '?', 'How many atoms are there in one unit of ' + c.f + '?',
        atoms, [c.comp.length, atoms + 1, atoms * 2], 'átomos'));
      var M = c.comp.reduce(function (a, kv) { return a + F.ATOMIC_MASS[kv[0]] * kv[1]; }, 0);
      var plainSum = c.comp.reduce(function (a, kv) { return a + F.ATOMIC_MASS[kv[0]]; }, 0);
      var given = c.comp.map(function (kv) { return kv[0] + ' = ' + String(F.ATOMIC_MASS[kv[0]]).replace('.', ','); }).join('; ');
      var givenEn = c.comp.map(function (kv) { return kv[0] + ' = ' + F.ATOMIC_MASS[kv[0]]; }).join('; ');
      C.push(q4('mm-' + c.i, 'Qual é a massa molar de ' + c.f + '? (' + given + ' g/mol)', 'What is the molar mass of ' + c.f + '? (' + givenEn + ' g/mol)',
        M, [plainSum, M + 2, M * 2], 'g/mol'));
    });
    // Atoms, isotopes and ions
    function sup(n) { return String(n).split('').map(function (d) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]; }).join(''); }
    F.ISOTOPES.forEach(function (r) {
      var e = EL[r[0]], A = +r[1], name = e.pt.toLowerCase() + '-' + A, nameEn = e.en.toLowerCase() + '-' + A;
      var label = name + ' (' + sup(A) + r[0] + ')', labelEn = nameEn + ' (' + sup(A) + r[0] + ')';
      C.push(q4('n-' + r[0] + A, 'Quantos neutrões tem o ' + label + '?', 'How many neutrons does ' + labelEn + ' have?', A - e.z, [A, e.z, A + e.z], ''));
      C.push(q4('p-' + r[0] + A, 'Quantos protões tem o ' + label + '?', 'How many protons does ' + labelEn + ' have?', e.z, [A, A - e.z, e.z + 1], ''));
    });
    F.IONS.forEach(function (r) {
      var e = EL[r[0]], q = +r[1];
      var ion = r[0] + (Math.abs(q) > 1 ? sup(Math.abs(q)) : '') + (q > 0 ? '⁺' : '⁻');
      C.push(q4('ion-' + r[0], 'Quantos eletrões tem o ião ' + ion + '?', 'How many electrons does the ' + ion + ' ion have?', e.z - q, [e.z, e.z + q, e.z - 2 * q], ''));
    });
    // Electron configuration and valence electrons, Z = 1–20
    function shells(z) { var caps = [2, 8, 8, 2], out = []; for (var k = 0; k < caps.length && z > 0; k++) { out.push(Math.min(z, caps[k])); z -= caps[k]; } return out; }
    Object.keys(EL).forEach(function (sym) {
      var e = EL[sym];
      if (e.z > 20) return;
      var sh = shells(e.z), conf = sh.join('-');
      C.push({ id: 'conf-' + sym, level: 4, make: function (rand) {
        var wrong = [shells(e.z + 1).join('-'), shells(Math.max(1, e.z - 1)).join('-'), sh.slice().reverse().join('-'), sh.concat([1]).join('-'), [2].concat(sh).join('-'), sh.concat([8]).join('-')];
        return ask('', 'science', T('Qual é a distribuição eletrónica do ' + e.pt.toLowerCase() + ' (Z = ' + e.z + ')?', 'What is the electron arrangement of ' + e.en.toLowerCase() + ' (Z = ' + e.z + ')?'),
          conf, wrong, rand);
      } });
      C.push(q4('val-' + sym, 'Quantos eletrões de valência tem o ' + e.pt.toLowerCase() + ' (Z = ' + e.z + ')?', 'How many valence electrons does ' + e.en.toLowerCase() + ' (Z = ' + e.z + ') have?',
        sh[sh.length - 1], [e.z, sh.length, 8 - sh[sh.length - 1] || 2], ''));
    });
    // Separation techniques
    var SEP = F.SEPARATION;
    SEP.forEach(function (r, i) {
      C.push({ id: 'sep-' + i, level: 4, make: function (rand) {
        return ask('', 'science', T('Que técnica separa: ' + r[0] + '?', 'Which technique separates ' + r[1] + '?'), T(r[2], r[3]), SEP.map(function (x) { return T(x[2], x[3]); }), rand);
      } });
    });
    C = C.concat(factItems(F.CHEMISTRY_FACTS, 'cf-'));
    // Numeric answers that are plain counts need no unit.
    C.forEach(function (it) { var mk = it.make; it.make = function (rand) { var q = mk(rand); if (q) q.options.forEach(function (o) { o.pt = o.pt.replace(/ $/, '').replace(/ átomos$/, ''); o.en = o.en.replace(/ $/, '').replace(/ átomos$/, ''); }); return q; }; });
    GENS.push(chemistry('chem', C));

    // Acids and bases, physical and chemical changes
    var PH = F.PH_SUBSTANCES.map(function (r, i) { return { i: i, pt: r[0], en: r[1], k: r[2] }; });
    GENS.push(combo('chem-ph', 'chemistry', 5 * choose(7, 3) + 6 * choose(6, 3), function (rand) {
      var k = rand() < 0.5 ? 'acid' : 'base';
      var right = pick(rand, PH.filter(function (x) { return x.k === k; }));
      var others = shuffle(PH.filter(function (x) { return x.k !== k; }), rand).slice(0, 3);
      return {
        key: k + right.i + '.' + others.map(function (x) { return x.i; }).sort().join('.'),
        level: 4,
        q: build('', 'science', T('Qual destas substâncias é ' + F.PH_NAMES[k].apt + '?', 'Which of these substances is ' + F.PH_NAMES[k].aen + '?'),
          [T(right.pt, right.en)].concat(others.map(function (x) { return T(x.pt, x.en); })), rand)
      };
    }));
    GENS.push(combo('chem-phval', 'chemistry', 7 * 8 * 7 * 6 / 6 * 2, function (rand) {
      var acid = rand() < 0.5;
      var right = acid ? rnd(rand, 0, 6) : rnd(rand, 8, 14);
      var pool = shuffle(range(0, 14).filter(function (x) { return acid ? x >= 7 : x <= 7; }), rand).slice(0, 3);
      return {
        key: (acid ? 'a' : 'b') + right + '.' + pool.slice().sort(function (a, b) { return a - b; }).join('.'),
        level: 4,
        q: build('', 'science', acid
          ? T('Qual destes valores de pH corresponde a uma solução ácida?', 'Which of these pH values is an acidic solution?')
          : T('Qual destes valores de pH corresponde a uma solução básica?', 'Which of these pH values is a basic solution?'),
          [right].concat(pool).map(function (x) { return both('pH ' + x); }), rand)
      };
    }));
    var CH = F.CHANGES.map(function (r, i) { return { i: i, pt: r[0], en: r[1], chem: r[2] === 'chemical' }; });
    function capi(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    GENS.push(combo('chem-change', 'chemistry', 9 * choose(9, 3) * 2, function (rand) {
      var chem = rand() < 0.5;
      var right = pick(rand, CH.filter(function (x) { return x.chem === chem; }));
      var others = shuffle(CH.filter(function (x) { return x.chem !== chem; }), rand).slice(0, 3);
      return {
        key: (chem ? 'c' : 'f') + right.i + '.' + others.map(function (x) { return x.i; }).sort().join('.'),
        level: 4,
        q: build('', 'science', chem
          ? T('Qual destas é uma transformação química?', 'Which of these is a chemical change?')
          : T('Qual destas é uma transformação física?', 'Which of these is a physical change?'),
          [T(capi(right.pt), capi(right.en))].concat(others.map(function (x) { return T(capi(x.pt), capi(x.en)); })), rand)
      };
    }));
  })();

  // --------------------------------------------------------------- picking
  var BY_TOPIC = {};
  GENS.forEach(function (g) { (BY_TOPIC[g.topic] = BY_TOPIC[g.topic] || []).push(g); });

  /**
   * A question for `topic` at `level` from one of its generators, picked with
   * weight √count (capped), so the huge "which of these" families add variety
   * without crowding out the rest. A generator with nothing at this level is
   * dropped and another one is tried.
   */
  var MAX_WEIGHT = 45;
  // Share of Genius-level Science questions drawn from physics and chemistry.
  var GENIUS_SCIENCE = 0.8;
  function make(topic, level, rand) {
    var all = BY_TOPIC[topic] || [];
    if (topic === 'science' && level === 4 && rand() < GENIUS_SCIENCE) {
      var q0 = pickFrom(all.filter(function (g) { return g.sub; }), level, rand);
      if (q0) return q0;
    }
    return pickFrom(all, level, rand);
  }
  function pickFrom(list, level, rand) {
    var gens = list.slice();
    while (gens.length) {
      var weights = gens.map(function (g) { return Math.min(MAX_WEIGHT, Math.sqrt(g.count)); });
      var r = rand() * weights.reduce(function (a, b) { return a + b; }, 0), k = 0;
      while (k < gens.length - 1 && r > weights[k]) { r -= weights[k]; k++; }
      var q = gens[k].make(rand, level);
      if (q) { if (gens[k].sub) q.sub = gens[k].sub; return q; }
      gens.splice(k, 1);
    }
    return null;
  }

  /** How many different questions each topic's generators can produce. */
  function counts() {
    var out = {};
    GENS.forEach(function (g) {
      var c = out[g.topic] = out[g.topic] || { total: 0, generators: {} };
      c.total += g.count;
      c.generators[g.id] = g.count;
    });
    return out;
  }

  var api = { GENS: GENS, make: make, counts: counts, _: TEST_HOOKS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MQGenerators = api;
})(this);
