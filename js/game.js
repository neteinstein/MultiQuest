/* MultiQuest — UI and turn flow. */
(function () {
  'use strict';

  var R = window.MQRules;
  var I = window.MQI18n;
  var A = window.MQAvatars;
  var Q = window.MQQuestions;

  var TOPIC_ICON = { math: '🧮', history: '🏰', science: '🔬', portuguese: '📖', english: '💬' };
  var SPECIAL_ICON = { advance: '⏩', again: '🎲', skip: '⏸️', teleport: '🌀' };

  var $ = function (id) { return document.getElementById(id); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------ i18n
  var lang = (function () {
    try { var l = localStorage.getItem('mq-lang'); if (l === 'pt' || l === 'en') return l; } catch (e) { /* ignore */ }
    return (navigator.language || 'pt').toLowerCase().indexOf('en') === 0 ? 'en' : 'pt';
  })();

  function t(key, vars) {
    var s = I.STRINGS[lang][key];
    if (s == null) s = I.STRINGS.pt[key];
    if (s == null) return key;
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (m, k) {
        var v = vars[k];
        if (v == null) return m;
        return typeof v === 'object' ? v[lang] : String(v);
      });
    }
    return s;
  }

  function nameOf(p) {
    if (p.name) return { pt: p.name, en: p.name };
    return { pt: I.STRINGS.pt.playerN.replace('{n}', p.idx + 1), en: I.STRINGS.en.playerN.replace('{n}', p.idx + 1) };
  }
  function nm(p) { return nameOf(p)[lang]; }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function avatarHtml(avatar, color, extraClass) {
    return '<div class="avatar ' + (extraClass || '') + '" data-avatar="' + avatar + '" style="--pc:' + color + '">' + A.SVG[avatar] + '</div>';
  }

  // ----------------------------------------------------------------- setup
  var setup = {
    count: 2,
    players: A.COLORS.slice(0, 6).map(function (c, i) {
      return { name: '', avatar: A.ORDER[i % A.ORDER.length], color: c.hex };
    })
  };

  function takenColors(exceptIndex) {
    var used = [];
    for (var i = 0; i < setup.count; i++) if (i !== exceptIndex) used.push(setup.players[i].color);
    return used;
  }

  function ensureUniqueColors() {
    for (var i = 0; i < setup.count; i++) {
      var used = [];
      for (var j = 0; j < i; j++) used.push(setup.players[j].color);
      if (used.indexOf(setup.players[i].color) >= 0) {
        var free = A.COLORS.filter(function (c) { return used.indexOf(c.hex) < 0; })[0];
        setup.players[i].color = free.hex;
      }
    }
  }

  function renderSetup() {
    var cp = $('countPicker');
    cp.innerHTML = '';
    for (var n = 2; n <= 6; n++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'count-btn' + (n === setup.count ? ' active' : '');
      b.textContent = n;
      b.setAttribute('aria-pressed', n === setup.count);
      b.dataset.count = n;
      cp.appendChild(b);
    }

    var rows = $('playerRows');
    var focusedName = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.nameFor;
    rows.innerHTML = '';
    for (var i = 0; i < setup.count; i++) {
      var p = setup.players[i];
      var used = takenColors(i);
      var html = '<div class="player-row" style="--pc:' + p.color + '">' +
        '<div class="row-head">' +
        avatarHtml(p.avatar, p.color, 'preview') +
        '<label class="name-field"><span class="label">' + esc(t('playerN', { n: i + 1 })) + '</span>' +
        '<input type="text" maxlength="16" data-name-for="' + i + '" value="' + esc(p.name) + '" placeholder="' + esc(t('playerN', { n: i + 1 })) + '" aria-label="' + esc(t('name')) + '"></label>' +
        '</div>' +
        '<div class="label">' + esc(t('avatar')) + '</div>' +
        '<div class="avatar-picker">';
      A.ORDER.forEach(function (av) {
        html += '<button type="button" class="avatar-opt' + (av === p.avatar ? ' active' : '') + '" data-player="' + i + '" data-avatar="' + av + '" aria-pressed="' + (av === p.avatar) + '" title="' + esc(t('avatar_' + av)) + ' — ' + esc(t('motion_' + av)) + '">' +
          avatarHtml(av, p.color) + '<span>' + esc(t('avatar_' + av)) + '</span></button>';
      });
      html += '</div><div class="label">' + esc(t('color')) + '</div><div class="color-picker">';
      A.COLORS.forEach(function (c) {
        var taken = used.indexOf(c.hex) >= 0;
        html += '<button type="button" class="swatch' + (c.hex === p.color ? ' active' : '') + '" style="--sw:' + c.hex + '" data-player="' + i + '" data-color="' + c.hex + '"' +
          (taken ? ' disabled title="' + esc(t('colorTaken')) + '"' : ' title="' + esc(c[lang]) + '"') +
          ' aria-label="' + esc(c[lang]) + '" aria-pressed="' + (c.hex === p.color) + '"></button>';
      });
      html += '</div></div>';
      rows.insertAdjacentHTML('beforeend', html);
    }
    if (focusedName != null) {
      var inp = rows.querySelector('[data-name-for="' + focusedName + '"]');
      if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    }
  }

  function onSetupClick(e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.count) {
      setup.count = +b.dataset.count;
      ensureUniqueColors();
      renderSetup();
    } else if (b.classList.contains('avatar-opt')) {
      setup.players[+b.dataset.player].avatar = b.dataset.avatar;
      renderSetup();
      setTheme(b.dataset.avatar);
    } else if (b.classList.contains('swatch') && !b.disabled) {
      setup.players[+b.dataset.player].color = b.dataset.color;
      renderSetup();
    }
  }

  function onSetupInput(e) {
    if (e.target.dataset.nameFor != null) setup.players[+e.target.dataset.nameFor].name = e.target.value;
  }

  // ------------------------------------------------------------------ theme
  var currentTheme = null;
  function setTheme(theme) {
    if (theme === currentTheme) return;
    currentTheme = theme;
    document.body.dataset.theme = theme;
    var decor = $('decor');
    var icons = A.DECOR[theme] || A.DECOR.default;
    var html = '';
    for (var i = 0; i < 18; i++) {
      var x = (i * 37 + 11) % 100;
      var y = (i * 53 + 7) % 100;
      var size = 18 + ((i * 7) % 22);
      var delay = (i % 6) * -2.5;
      html += '<span style="left:' + x + '%;top:' + y + '%;font-size:' + size + 'px;animation-delay:' + delay + 's">' + icons[i % icons.length] + '</span>';
    }
    decor.innerHTML = html;
  }

  // ------------------------------------------------------------------ game
  var state = null;

  function newGame(players) {
    state = {
      players: players.map(function (p, i) {
        return { idx: i, name: (p.name || '').trim(), avatar: p.avatar, color: p.color, pos: 0, skip: 0 };
      }),
      current: 0,
      topics: R.assignTopics(),
      dealer: new Q.Dealer(),
      log: [],
      phase: 'idle',
      question: null,
      winner: null
    };
    $('setup').classList.add('hidden');
    $('game').classList.remove('hidden');
    $('newGameBtn').classList.remove('hidden');
    $('winOverlay').classList.add('hidden');
    renderBoard();
    renderTokens();
    renderLegend();
    renderLog();
    renderDie(1);
    requestAnimationFrame(function () { layoutTokens(true); startTurn(); });
  }

  function cur() { return state.players[state.current]; }

  // ----------------------------------------------------------------- board
  var cols = 0;

  function pickCols() {
    var w = $('boardWrap').clientWidth || 800;
    return w >= 900 ? 13 : w >= 700 ? 11 : w >= 480 ? 9 : 7;
  }

  function renderBoard() {
    var board = $('board');
    cols = pickCols();
    board.style.setProperty('--cols', cols);
    var html = '';
    for (var h = 0; h <= R.BOARD_SIZE; h++) {
      var row = Math.floor(h / cols);
      var c = h % cols;
      var col = row % 2 === 0 ? c : cols - 1 - c;
      var sp = R.specialAt(h);
      var topic = state.topics[h];
      var cls = 'cell';
      var inner = '<span class="num">' + h + '</span>';
      var title;
      if (h === 0) {
        cls += ' start';
        inner = '<span class="num">0</span><span class="tag">' + esc(t('start0')) + '</span>';
        title = t('start0');
      } else if (sp) {
        cls += ' special special-' + sp.type;
        var label = sp.type === 'advance' ? t('special_advance', { n: sp.by }) : t('special_' + sp.type);
        inner += '<span class="icon">' + SPECIAL_ICON[sp.type] + '</span><span class="tag">' + esc(label) + '</span>';
        title = t('house', { n: h }) + ' — ' + label;
      } else {
        cls += ' topic-' + topic;
        inner += '<span class="icon">' + (h === R.BOARD_SIZE ? '🏆' : TOPIC_ICON[topic]) + '</span>';
        title = t('house', { n: h }) + ' — ' + t('topic_' + topic);
      }
      if (h === R.BOARD_SIZE) cls += ' finish';
      if (h === R.COLLISION_HOUSE) cls += ' refuge';
      if (h === R.TELEPORT_HOUSE) cls += ' portal';
      html += '<div class="' + cls + '" data-house="' + h + '" title="' + esc(title) + '" style="grid-row:' + (row + 1) + ';grid-column:' + (col + 1) + '">' + inner + '</div>';
    }
    board.innerHTML = html;
  }

  function cellEl(h) { return $('board').querySelector('[data-house="' + h + '"]'); }

  function renderLegend() {
    var html = '';
    R.TOPICS.forEach(function (tp) {
      html += '<li><span class="chip topic-' + tp + '">' + TOPIC_ICON[tp] + '</span>' + esc(t('topic_' + tp)) + '</li>';
    });
    html += '<li><span class="chip special">' + SPECIAL_ICON.advance + '</span>13 → +2 · 55 → +1</li>';
    html += '<li><span class="chip special">' + SPECIAL_ICON.again + '</span>27 — ' + esc(t('special_again')) + '</li>';
    html += '<li><span class="chip special">' + SPECIAL_ICON.skip + '</span>10 — ' + esc(t('special_skip')) + '</li>';
    html += '<li><span class="chip special">' + SPECIAL_ICON.teleport + '</span>7 · 12 · 73 → 21</li>';
    $('legend').innerHTML = html;
  }

  // ---------------------------------------------------------------- tokens
  function renderTokens() {
    var html = '';
    state.players.forEach(function (p) {
      html += '<div class="token" id="token-' + p.idx + '" data-avatar="' + p.avatar + '" style="--pc:' + p.color + '">' +
        '<div class="base"></div>' + avatarHtml(p.avatar, p.color) + '</div>';
    });
    $('tokens').innerHTML = html;
  }

  function tokenEl(p) { return $('token-' + p.idx); }

  function layoutTokens(instant) {
    if (!state) return;
    var groups = {};
    state.players.forEach(function (p) { (groups[p.pos] = groups[p.pos] || []).push(p); });
    Object.keys(groups).forEach(function (h) {
      var cell = cellEl(+h);
      if (!cell) return;
      var size = cell.offsetWidth;
      var list = groups[h];
      var n = list.length;
      var tokenSize = n === 1 ? size * 0.78 : size * (n <= 2 ? 0.6 : n <= 4 ? 0.52 : 0.46);
      var radius = n === 1 ? 0 : size * 0.22;
      list.forEach(function (p, i) {
        var ang = (i / n) * Math.PI * 2 - Math.PI / 2;
        var cx = cell.offsetLeft + size / 2 + Math.cos(ang) * radius;
        var cy = cell.offsetTop + cell.offsetHeight / 2 + Math.sin(ang) * radius;
        var el = tokenEl(p);
        if (instant) el.classList.add('no-anim');
        el.style.width = el.style.height = tokenSize + 'px';
        el.style.transform = 'translate(' + (cx - tokenSize / 2) + 'px,' + (cy - tokenSize / 2) + 'px)';
        if (instant) { void el.offsetWidth; el.classList.remove('no-anim'); }
      });
    });
    state.players.forEach(function (p) {
      tokenEl(p).classList.toggle('active', p.idx === state.current && !state.winner);
    });
  }

  function retrigger(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function flashCell(h, cls) {
    var c = cellEl(h);
    if (!c) return;
    retrigger(c, cls || 'flash');
  }

  async function walk(p, steps) {
    var av = A.AVATARS[p.avatar];
    var ms = reduceMotion ? 120 : av.stepMs;
    var tok = tokenEl(p);
    tok.style.setProperty('--step-ms', ms + 'ms');
    tok.style.setProperty('--ease', av.ease);
    tok.classList.add('walking');
    var avatar = tok.querySelector('.avatar');
    for (var i = 0; i < steps.length; i++) {
      p.pos = steps[i];
      retrigger(avatar, 'step');
      layoutTokens();
      flashCell(p.pos, 'trail');
      renderTurnPos();
      await sleep(ms);
    }
    avatar.classList.remove('step');
    tok.classList.remove('walking');
    tok.style.removeProperty('--step-ms');
    tok.style.removeProperty('--ease');
  }

  async function teleport(p, to) {
    var tok = tokenEl(p);
    tok.classList.add('vanish');
    await sleep(reduceMotion ? 50 : 500);
    p.pos = to;
    tok.classList.add('no-anim');
    layoutTokens();
    void tok.offsetWidth;
    tok.classList.remove('no-anim', 'vanish');
    retrigger(tok, 'appear');
    flashCell(to);
    renderTurnPos();
    await sleep(reduceMotion ? 50 : 550);
    tok.classList.remove('appear');
  }

  async function slideTo(p, to, cls, ms) {
    var tok = tokenEl(p);
    tok.classList.add(cls);
    p.pos = to;
    layoutTokens();
    renderTurnPos();
    await sleep(reduceMotion ? 100 : ms);
    tok.classList.remove(cls);
  }

  // ------------------------------------------------------------------ dice
  var PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function renderDie(n) {
    var html = '';
    for (var i = 0; i < 9; i++) html += '<span class="pip' + (PIPS[n].indexOf(i) >= 0 ? ' on' : '') + '"></span>';
    var d = $('die');
    d.innerHTML = html;
    d.setAttribute('aria-label', String(n));
  }

  async function animateDie() {
    var die = $('die');
    var result = R.rollDie();
    die.classList.add('rolling');
    var frames = reduceMotion ? 1 : 12;
    for (var i = 0; i < frames; i++) {
      renderDie(1 + Math.floor(Math.random() * 6));
      await sleep(55 + i * 6);
    }
    die.classList.remove('rolling');
    renderDie(result);
    retrigger(die, 'landed');
    await sleep(reduceMotion ? 100 : 350);
    return result;
  }

  // ------------------------------------------------------------- messages
  function log(key, vars, opts) {
    state.log.unshift({ key: key, vars: vars || {}, kind: (opts && opts.kind) || '' });
    if (state.log.length > 80) state.log.length = 80;
    renderLog();
    if (opts && opts.toast) toast(t(key, vars), opts.kind);
  }

  function renderLog() {
    if (!state) return;
    var html = '';
    state.log.forEach(function (e) {
      html += '<li class="' + e.kind + '">' + esc(t(e.key, e.vars)) + '</li>';
    });
    $('log').innerHTML = html;
    var last = state.log[0];
    $('message').textContent = last ? t(last.key, last.vars) : '';
    $('message').className = 'message ' + (last ? last.kind : '');
  }

  function toast(text, kind) {
    var el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.textContent = text;
    $('toasts').appendChild(el);
    setTimeout(function () { el.classList.add('out'); }, 2600);
    setTimeout(function () { el.remove(); }, 3100);
  }

  // ----------------------------------------------------------------- panel
  function renderTurnPos() {
    if (!state) return;
    var p = cur();
    $('turnPos').textContent = p.pos === 0 ? t('start0') : t('house', { n: p.pos });
    renderPlayers();
  }

  function renderPanel() {
    var p = cur();
    $('turnAvatar').innerHTML = avatarHtml(p.avatar, p.color, 'idle');
    $('turnName').textContent = nm(p);
    $('turnCard').style.setProperty('--pc', p.color);
    renderTurnPos();
    updateRollBtn();
  }

  function renderPlayers() {
    var html = '';
    state.players.forEach(function (p) {
      var active = p.idx === state.current;
      html += '<li class="' + (active ? 'active' : '') + '" style="--pc:' + p.color + '">' +
        avatarHtml(p.avatar, p.color, 'mini') +
        '<span class="pl-name">' + esc(nm(p)) + '</span>' +
        (p.skip > 0 ? '<span class="badge">' + esc(t('skipBadge')) + '</span>' : '') +
        '<span class="pl-pos">' + p.pos + '</span>' +
        '<span class="bar"><span style="width:' + (p.pos / R.BOARD_SIZE * 100) + '%"></span></span>' +
        '</li>';
    });
    $('playerList').innerHTML = html;
  }

  function updateRollBtn() {
    var can = state && state.phase === 'roll';
    $('rollBtn').disabled = !can;
    $('rollBtn').classList.toggle('pulse', !!can);
  }

  // ------------------------------------------------------------- turn flow
  async function startTurn() {
    if (!state || state.winner) return;
    var p = cur();
    setTheme(A.AVATARS[p.avatar].theme);
    layoutTokens();
    renderPanel();
    if (p.skip > 0) {
      p.skip--;
      state.phase = 'skipping';
      updateRollBtn();
      log('msg_skipped', { name: nameOf(p) }, { toast: true, kind: 'warn' });
      renderPlayers();
      await sleep(1600);
      return endTurn(false);
    }
    state.phase = 'roll';
    updateRollBtn();
  }

  async function onRoll() {
    if (!state || state.phase !== 'roll') return;
    state.phase = 'moving';
    updateRollBtn();
    var p = cur();
    var n = await animateDie();
    var from = p.pos;
    log('msg_rolled', { name: nameOf(p), n: n });
    if (R.bounced(from, n)) log('msg_bounce', { n: from + n - R.BOARD_SIZE }, { toast: true, kind: 'warn' });
    await walk(p, R.buildPath(from, n));
    await resolveLanding(p, from);
  }

  async function resolveLanding(p, from) {
    var sp = R.specialAt(p.pos);
    if (!sp) return ask(p, from);

    flashCell(p.pos, 'boom');
    var extra = false;
    if (sp.type === 'advance') {
      log('msg_advance', { house: p.pos, n: sp.by }, { toast: true, kind: 'good' });
      await sleep(450);
      await walk(p, R.buildPath(p.pos, sp.by));
      return ask(p, from);
    }
    if (sp.type === 'teleport') {
      log('msg_teleport', { house: p.pos }, { toast: true, kind: 'magic' });
      await sleep(350);
      await teleport(p, sp.to);
    } else if (sp.type === 'again') {
      log('msg_again', { name: nameOf(p) }, { toast: true, kind: 'good' });
      extra = true;
    } else if (sp.type === 'skip') {
      p.skip += sp.turns;
      log('msg_skip', { name: nameOf(p) }, { toast: true, kind: 'warn' });
    }
    await settle(p);
    return endTurn(extra);
  }

  async function ask(p, from) {
    state.phase = 'question';
    var q = state.dealer.next(state.topics[p.pos], p.pos);
    var ok = await showQuestion(q, p);
    state.phase = 'moving';
    if (ok) {
      log('msg_correct', { name: nameOf(p), n: p.pos }, { kind: 'good' });
      if (p.pos === R.BOARD_SIZE) return win(p);
      await settle(p);
    } else {
      log('msg_wrong', { name: nameOf(p), n: from }, { kind: 'bad' });
      await slideTo(p, from, 'retreat', 750);
      await settle(p);
    }
    return endTurn(false);
  }

  // Whoever was on the house first is sent to house 25.
  async function settle(p) {
    var victims = R.collisionVictims(state.players, p.idx);
    for (var i = 0; i < victims.length; i++) {
      var v = state.players[victims[i]];
      log('msg_collision', { victim: nameOf(v), n: v.pos }, { toast: true, kind: 'bad' });
      flashCell(v.pos, 'boom');
      await slideTo(v, R.COLLISION_HOUSE, 'knocked', 950);
      flashCell(R.COLLISION_HOUSE);
    }
    renderPlayers();
  }

  async function endTurn(extra) {
    if (!state || state.winner) return;
    if (!extra) state.current = (state.current + 1) % state.players.length;
    await sleep(250);
    startTurn();
  }

  function win(p) {
    state.winner = p;
    state.phase = 'over';
    updateRollBtn();
    layoutTokens();
    log('msg_win', { name: nameOf(p) }, { kind: 'good' });
    flashCell(R.BOARD_SIZE, 'boom');
    tokenEl(p).classList.add('champion');
    renderWin();
    var conf = $('confetti');
    var colors = state.players.map(function (x) { return x.color; });
    var html = '';
    for (var i = 0; i < 60; i++) {
      html += '<i style="left:' + (Math.random() * 100) + '%;background:' + colors[i % colors.length] +
        ';animation-delay:' + (Math.random() * 1.2) + 's;animation-duration:' + (2 + Math.random() * 2) + 's"></i>';
    }
    conf.innerHTML = html;
    setTimeout(function () { $('winOverlay').classList.remove('hidden'); $('rematchBtn').focus(); }, 700);
  }

  function renderWin() {
    if (!state || !state.winner) return;
    var p = state.winner;
    $('winAvatar').innerHTML = avatarHtml(p.avatar, p.color, 'idle');
    $('winText').textContent = t('winner', { name: nameOf(p) });
  }

  // -------------------------------------------------------------- question
  function showQuestion(q, p) {
    return new Promise(function (resolve) {
      state.question = { q: q, p: p, answered: null, resolve: resolve };
      renderQuestion();
      $('questionOverlay').classList.remove('hidden');
      var first = $('qOptions').querySelector('button');
      if (first) first.focus();
    });
  }

  function renderQuestion() {
    var s = state && state.question;
    if (!s) return;
    var q = s.q;
    var badge = $('qTopic');
    badge.className = 'topic-badge topic-' + q.topic;
    badge.textContent = TOPIC_ICON[q.topic] + ' ' + t('topic_' + q.topic);
    $('qHouse').textContent = t('house', { n: s.p.pos });
    $('qPlayer').innerHTML = avatarHtml(s.p.avatar, s.p.color, 'mini idle') + '<span>' + esc(nm(s.p)) + '</span>';
    $('qText').textContent = q.q[lang];
    var html = '';
    q.options.forEach(function (o, i) {
      var cls = 'q-opt';
      if (s.answered != null) {
        if (i === q.correct) cls += ' correct';
        else if (i === s.answered) cls += ' wrong';
        else cls += ' dim';
      }
      html += '<button type="button" class="' + cls + '" data-opt="' + i + '"' + (s.answered != null ? ' disabled' : '') + '>' +
        '<span class="key">' + (i + 1) + '</span><span>' + esc(o[lang]) + '</span></button>';
    });
    $('qOptions').innerHTML = html;
    var fb = $('qFeedback');
    if (s.answered == null) {
      fb.textContent = '';
      fb.className = 'q-feedback';
      $('qContinue').classList.add('hidden');
    } else {
      var ok = s.answered === q.correct;
      fb.className = 'q-feedback ' + (ok ? 'good' : 'bad');
      fb.textContent = ok
        ? t('msg_correctShort') + ' ' + t('msg_correct', { name: nameOf(s.p), n: s.p.pos })
        : t('msg_wrongShort') + ' ' + t('msg_rightWas', { a: q.options[q.correct] });
      $('qContinue').classList.remove('hidden');
    }
  }

  function answer(i) {
    var s = state && state.question;
    if (!s || s.answered != null) return;
    s.answered = i;
    renderQuestion();
    var modal = document.querySelector('.question-modal');
    retrigger(modal, i === s.q.correct ? 'cheer' : 'shake');
    $('qContinue').focus();
  }

  function closeQuestion() {
    var s = state && state.question;
    if (!s || s.answered == null) return;
    state.question = null;
    $('questionOverlay').classList.add('hidden');
    s.resolve(s.answered === s.q.correct);
  }

  // ------------------------------------------------------------ language
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
      b.setAttribute('aria-pressed', b.dataset.lang === lang);
    });
    $('rulesBody').innerHTML = t('rulesHtml');
    renderSetup();
    if (state) {
      renderBoard();
      layoutTokens(true);
      renderLegend();
      renderLog();
      renderPanel();
      renderQuestion();
      renderWin();
    }
  }

  function setLang(l) {
    lang = l;
    try { localStorage.setItem('mq-lang', l); } catch (e) { /* ignore */ }
    applyLang();
  }

  // ----------------------------------------------------------------- wiring
  function goToSetup() {
    state = null;
    $('game').classList.add('hidden');
    $('setup').classList.remove('hidden');
    $('newGameBtn').classList.add('hidden');
    $('winOverlay').classList.add('hidden');
    $('questionOverlay').classList.add('hidden');
    currentTheme = null;
    setTheme('default');
    renderSetup();
  }

  function init() {
    $('countPicker').addEventListener('click', onSetupClick);
    $('playerRows').addEventListener('click', onSetupClick);
    $('playerRows').addEventListener('input', onSetupInput);
    $('startBtn').addEventListener('click', function () { newGame(setup.players.slice(0, setup.count)); });
    $('rollBtn').addEventListener('click', onRoll);
    $('qOptions').addEventListener('click', function (e) {
      var b = e.target.closest('[data-opt]');
      if (b) answer(+b.dataset.opt);
    });
    $('qContinue').addEventListener('click', closeQuestion);
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.dataset.lang); });
    });
    $('rulesBtn').addEventListener('click', function () { $('rulesOverlay').classList.remove('hidden'); $('rulesClose').focus(); });
    $('rulesClose').addEventListener('click', function () { $('rulesOverlay').classList.add('hidden'); });
    $('rulesOverlay').addEventListener('click', function (e) { if (e.target === this) this.classList.add('hidden'); });
    $('newGameBtn').addEventListener('click', function () {
      if (!state || state.winner || window.confirm(t('confirmNew'))) goToSetup();
    });
    $('playAgainBtn').addEventListener('click', goToSetup);
    $('rematchBtn').addEventListener('click', function () {
      var players = state.players.map(function (p) { return { name: p.name, avatar: p.avatar, color: p.color }; });
      newGame(players);
    });

    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT') return;
      if (!$('rulesOverlay').classList.contains('hidden')) {
        if (e.key === 'Escape') $('rulesOverlay').classList.add('hidden');
        return;
      }
      if (state && state.question) {
        if (state.question.answered == null && /^[1-4]$/.test(e.key)) { e.preventDefault(); answer(+e.key - 1); }
        return;
      }
      if (state && state.phase === 'roll' && (e.key === ' ' || e.key === 'Enter') && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        onRoll();
      }
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!state) return;
        if (pickCols() !== cols) renderBoard();
        layoutTokens(true);
      }, 120);
    });

    setTheme('default');
    applyLang();
  }

  // Exposed for automated tests.
  window.MQGame = {
    get state() { return state; },
    setLang: setLang
  };

  init();
})();
