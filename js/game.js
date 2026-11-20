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
      return { name: '', avatar: A.ORDER[i % A.ORDER.length], color: c.hex, level: 2 };
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
    var keepScroll = rows.scrollLeft;
    rows.innerHTML = '';
    for (var i = 0; i < setup.count; i++) {
      var p = setup.players[i];
      var used = takenColors(i);
      var html = '<div class="player-row" data-slide="' + i + '" style="--pc:' + p.color + '" role="group" aria-label="' + esc(t('playerN', { n: i + 1 })) + '">' +
        '<div class="row-head">' +
        avatarHtml(p.avatar, p.color, 'preview') +
        '<label class="name-field"><span class="label">' + esc(t('playerN', { n: i + 1 })) + '</span>' +
        '<input type="text" maxlength="16" data-name-for="' + i + '" value="' + esc(p.name) + '" placeholder="' + esc(t('playerN', { n: i + 1 })) + '" aria-label="' + esc(t('name')) + '"></label>' +
        '<span class="row-sub">' + esc(t('avatar_' + p.avatar)) + ' · ' + esc(t('motion_' + p.avatar)) + '</span>' +
        '</div>' +
        '<div class="label">' + esc(t('avatar')) + '</div>' +
        '<div class="avatar-picker">';
      A.ORDER.forEach(function (av) {
        html += '<button type="button" class="avatar-opt' + (av === p.avatar ? ' active' : '') + '" data-player="' + i + '" data-avatar="' + av + '" aria-pressed="' + (av === p.avatar) + '" title="' + esc(t('avatar_' + av)) + ' — ' + esc(t('motion_' + av)) + '">' +
          avatarHtml(av, p.color) + '<span>' + esc(t('avatar_' + av)) + '</span></button>';
      });
      html += '</div><div class="label">' + esc(t('difficulty')) + '</div><div class="diff-picker" role="group" aria-label="' + esc(t('difficulty')) + '">';
      for (var lv = 1; lv <= 4; lv++) {
        html += '<button type="button" class="diff-btn lvl-' + lv + (lv === p.level ? ' active' : '') + '" data-player="' + i + '" data-diff="' + lv + '" aria-pressed="' + (lv === p.level) + '">' +
          '<span class="stars" aria-hidden="true">' + '★★★★'.slice(0, lv) + '</span>' + esc(t('diff_' + lv)) + '</button>';
      }
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
    rows.scrollLeft = keepScroll;
    if (focusedName != null) {
      var inp = rows.querySelector('[data-name-for="' + focusedName + '"]');
      if (inp) { inp.focus({ preventScroll: true }); inp.setSelectionRange(inp.value.length, inp.value.length); }
    }
    slide = Math.min(slide, maxSlide());
    renderNav();
  }

  // ------------------------------------------------------- player carousel
  // Players are set up one card at a time (two or three side by side on wider
  // screens): swipe, use the arrows or the dots to move between them.
  var slide = 0;
  var pendingSlide = null, pendingTimer = null;

  // How many cards fit side by side: set in CSS (--per) by screen width.
  function perView() {
    var first = $('playerRows').children[0];
    return first ? (parseInt(getComputedStyle(first).getPropertyValue('--per'), 10) || 1) : 1;
  }
  function maxSlide() { return Math.max(0, setup.count - perView()); }
  function slideStep() {
    var rows = $('playerRows');
    var a = rows.children[0], b = rows.children[1];
    if (!a) return 1;
    return b ? b.offsetLeft - a.offsetLeft : a.offsetWidth;
  }

  function goToSlide(i, instant) {
    slide = Math.max(0, Math.min(i, maxSlide()));
    // Ignore the scroll events of our own smooth scroll until it arrives.
    pendingSlide = instant || reduceMotion ? null : slide;
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(function () { pendingSlide = null; onRowsScroll(); }, 800);
    $('playerRows').scrollTo({ left: slide * slideStep(), behavior: instant || reduceMotion ? 'auto' : 'smooth' });
    renderNav();
  }

  function onRowsScroll() {
    var i = Math.max(0, Math.min(Math.round($('playerRows').scrollLeft / slideStep()), maxSlide()));
    if (pendingSlide != null) {
      if (i !== pendingSlide) return;
      pendingSlide = null;
    }
    if (i !== slide) { slide = i; renderNav(); }
  }

  function renderNav() {
    var pv = perView();
    var dots = $('playerDots');
    var html = '';
    for (var i = 0; i < setup.count; i++) {
      var on = i >= slide && i < slide + pv;
      html += '<button type="button" class="dot' + (on ? ' active' : '') + '" data-slide="' + i + '" style="--pc:' + setup.players[i].color + '"' +
        ' aria-label="' + esc(t('goToPlayer', { n: i + 1 })) + '"' + (on ? ' aria-current="true"' : '') + '>' +
        avatarHtml(setup.players[i].avatar, setup.players[i].color) + '</button>';
    }
    dots.innerHTML = html;
    $('prevPlayer').disabled = slide <= 0;
    $('nextPlayer').disabled = slide >= maxSlide();
    $('carouselNav').classList.toggle('all-visible', maxSlide() === 0);
    var rows = $('playerRows').children;
    for (var j = 0; j < rows.length; j++) rows[j].classList.toggle('in-view', j >= slide && j < slide + pv);
    // The background follows the player you are looking at.
    if (pv === 1 && setup.players[slide] && !state) setTheme(setup.players[slide].avatar);
  }

  // ------------------------------------------------------------ sparkles
  function burst(x, y, colors, n, spread) {
    if (reduceMotion) return;
    var fx = $('fx');
    var made = [];
    for (var i = 0; i < n; i++) {
      var s = document.createElement('i');
      var a = Math.random() * Math.PI * 2;
      var d = spread * (0.45 + Math.random() * 0.75);
      s.className = Math.random() < 0.45 ? 'star' : '';
      s.style.cssText = 'left:' + x + 'px;top:' + y + 'px;--dx:' + (Math.cos(a) * d).toFixed(1) + 'px;--dy:' + (Math.sin(a) * d).toFixed(1) +
        'px;--c:' + colors[i % colors.length] + ';animation-duration:' + (550 + Math.random() * 550).toFixed(0) + 'ms';
      fx.appendChild(s);
      made.push(s);
    }
    setTimeout(function () { made.forEach(function (s) { s.remove(); }); }, 1300);
  }

  function burstAt(el, colors, n, spread) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, colors, n, spread);
  }

  function onSetupClick(e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.count) {
      var grew = +b.dataset.count > setup.count;
      setup.count = +b.dataset.count;
      ensureUniqueColors();
      renderSetup();
      if (grew) goToSlide(setup.count - 1);
    } else if (b.classList.contains('avatar-opt')) {
      setup.players[+b.dataset.player].avatar = b.dataset.avatar;
      renderSetup();
      setTheme(b.dataset.avatar);
    } else if (b.classList.contains('diff-btn')) {
      setup.players[+b.dataset.player].level = +b.dataset.diff;
      renderSetup();
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
        return { idx: i, name: (p.name || '').trim(), avatar: p.avatar, color: p.color, level: p.level || 2, pos: 0, skip: 0, bonus: 0, energy: 0, shield: false, hardNext: false };
      }),
      current: 0,
      topics: R.assignTopics(),
      dealer: new Q.Dealer(),
      log: [],
      phase: 'idle',
      question: null,
      winner: null,
      traps: {},
      lastFrozen: null,
      powerUsed: false,
      powerView: null,
      duel: null,
      stealOffer: null
    };
    $('setup').classList.add('hidden');
    $('game').classList.remove('hidden');
    document.body.classList.add('in-game');
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

  // Pick the number of columns that gives the biggest square houses while the
  // whole board fits the free space (no scrolling in any direction).
  function fitBoard() {
    var area = $('boardArea');
    var W = area.clientWidth, H = area.clientHeight;
    if (!W || !H) return false;
    var small = Math.min(W, H) < 520;
    var gap = small ? 3 : 5, pad = small ? 5 : 10;
    var n = R.BOARD_SIZE + 1;
    var best = null;
    for (var c = 4; c <= 20; c++) {
      var r = Math.ceil(n / c);
      var cell = Math.floor(Math.min((W - 2 * pad - (c - 1) * gap) / c, (H - 2 * pad - (r - 1) * gap) / r));
      if (!best || cell > best.cell || (cell === best.cell && c * r - n < best.waste)) best = { c: c, cell: cell, waste: c * r - n };
    }
    var board = $('board');
    board.style.setProperty('--cs', Math.max(best.cell, 12) + 'px');
    board.style.setProperty('--gap', gap + 'px');
    board.style.setProperty('--pad', pad + 'px');
    var changed = best.c !== cols;
    cols = best.c;
    board.style.setProperty('--cols', cols);
    return changed;
  }

  function renderBoard() {
    var board = $('board');
    fitBoard();
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
      var trap = state.traps[h];
      if (trap) {
        cls += ' trapped';
        inner += '<span class="trap-mark" style="--pc:' + state.players[trap.owner].color + '" title="' + esc(t('power_trap')) + '">🪤</span>';
      }
      if (state.phase === 'trap' && R.canPlaceTrap(h, state.traps)) cls += ' trappable';
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
    burstAt(tok, [p.color, '#ffffff'], 10, 40);
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
    burstAt(tok, ['#d59cff', '#ffffff', '#8e44ad'], 18, 70);
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
    var td = $('turnDiff');
    td.className = 'diff-badge lvl-' + p.level;
    td.textContent = t('diff_' + p.level);
    $('turnCard').style.setProperty('--pc', p.color);
    renderEnergy();
    renderTurnPos();
    updateRollBtn();
  }

  function renderPlayers() {
    var html = '';
    state.players.forEach(function (p) {
      var active = p.idx === state.current;
      html += '<li class="' + (active ? 'active' : '') + '" style="--pc:' + p.color + '">' +
        avatarHtml(p.avatar, p.color, 'mini') +
        '<span class="pl-name">' + esc(nm(p)) + ' <span class="pl-status">' + statusIcons(p) + '</span></span>' +
        '<span class="diff-badge lvl-' + p.level + '">' + esc(t('diff_' + p.level)) + '</span>' +
        (p.skip > 0 ? '<span class="badge">' + esc(t('skipBadge')) + '</span>' : '') +
        '<span class="pl-pos">' + p.pos + '</span>' +
        '<span class="bar"><span style="width:' + (p.pos / R.BOARD_SIZE * 100) + '%"></span></span>' +
        '</li>';
    });
    $('playerList').innerHTML = html;
    renderStatus();
  }

  function statusIcons(p) {
    return (p.shield ? '<span title="' + esc(t('shielded')) + '">🛡️</span>' : '') +
      (p.hardNext ? '<span title="' + esc(t('cursed')) + '">🔥</span>' : '') +
      (p.energy ? '<span class="pl-energy" title="⚡">⚡' + p.energy + '</span>' : '');
  }

  // Shield, frost and curse show on the tokens too.
  function renderStatus() {
    state.players.forEach(function (p) {
      var tok = tokenEl(p);
      if (!tok) return;
      tok.classList.toggle('shielded', !!p.shield);
      tok.classList.toggle('frozen', p.skip > 0);
      tok.classList.toggle('cursed', !!p.hardNext);
    });
  }

  function renderEnergy() {
    var p = cur();
    var html = '';
    for (var i = 0; i < R.MAX_ENERGY; i++) html += '<i class="' + (i < p.energy ? 'on' : '') + '">⚡</i>';
    $('turnEnergy').innerHTML = html;
    $('turnEnergy').setAttribute('aria-label', '⚡ ' + p.energy + '/' + R.MAX_ENERGY);
  }

  function updateRollBtn() {
    var can = state && state.phase === 'roll';
    $('rollBtn').disabled = !can;
    $('rollBtn').classList.toggle('pulse', !!can);
    var pw = $('powerBtn');
    var canPower = can && !state.powerUsed && cur().energy > 0;
    pw.disabled = !canPower;
    pw.classList.toggle('ready', !!canPower);
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
    var topic = state.topics[p.pos];
    var level = p.level;
    var trap = state.traps[p.pos];
    if (trap && trap.owner !== p.idx) {
      delete state.traps[p.pos];
      renderBoard();
      if (!blocked(p)) {
        log('msg_trapSprung', { name: nameOf(p), owner: nameOf(state.players[trap.owner]) }, { toast: true, kind: 'bad' });
        flashCell(p.pos, 'boom');
        burstAt(tokenEl(p), ['#8d6e63', '#ffcc80', state.players[trap.owner].color], 16, 60);
        topic = trap.topic;
        level++;
        await sleep(reduceMotion ? 100 : 700);
      }
    }
    if (p.hardNext) {
      p.hardNext = false;
      level++;
      log('msg_hardNow', { name: nameOf(p) }, { toast: true, kind: 'warn' });
      renderPlayers();
    }
    level = Math.min(4, level);
    var q = state.dealer.next(topic, level);
    var ok = await showQuestion(q, p, level);
    state.phase = 'moving';
    if (ok) {
      p.energy = R.gainEnergy(p.energy);
      renderEnergy();
      burstAt($('turnEnergy'), ['#ffd54f', '#fff59d', '#ffffff'], 12, 50);
      log('msg_correct', { name: nameOf(p), n: p.pos }, { kind: 'good' });
      if (p.pos === R.BOARD_SIZE) return win(p);
      await settle(p);
      if (R.earnsBonusRoll(p.bonus)) {
        p.bonus++;
        log('msg_bonus', { name: nameOf(p), k: p.bonus, max: R.MAX_BONUS_ROLLS }, { toast: true, kind: 'good' });
        return endTurn(true);
      }
      log('msg_bonusMax', { name: nameOf(p), max: R.MAX_BONUS_ROLLS }, { kind: 'warn' });
    } else {
      var landed = p.pos;
      log('msg_wrong', { name: nameOf(p), n: from }, { kind: 'bad' });
      await slideTo(p, from, 'retreat', 750);
      await settle(p);
      await trySteal(p, q, R.stealGain(landed, from));
      if (state.winner) return;
    }
    return endTurn(false);
  }

  // Whoever was on the house first is sent to house 25.
  async function settle(p) {
    var victims = R.collisionVictims(state.players, p.idx);
    for (var i = 0; i < victims.length; i++) {
      var v = state.players[victims[i]];
      if (v.shield) {
        v.shield = false;
        log('msg_shieldSave', { name: nameOf(v) }, { toast: true, kind: 'magic' });
        burstAt(tokenEl(v), ['#80d8ff', '#ffffff'], 14, 50);
        continue;
      }
      log('msg_collision', { victim: nameOf(v), n: v.pos }, { toast: true, kind: 'bad' });
      flashCell(v.pos, 'boom');
      await slideTo(v, R.COLLISION_HOUSE, 'knocked', 950);
      flashCell(R.COLLISION_HOUSE);
    }
    renderPlayers();
  }

  async function endTurn(extra) {
    if (!state || state.winner) return;
    if (!extra) {
      cur().bonus = 0;
      state.powerUsed = false;
      state.current = (state.current + 1) % state.players.length;
    }
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
    burstAt(cellEl(R.BOARD_SIZE), ['#ffd54f', '#ffffff', p.color, '#ff8a65'], 40, 180);
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
  function showQuestion(q, p, level) {
    return new Promise(function (resolve) {
      state.question = { q: q, p: p, level: level || q.level, answered: null, resolve: resolve };
      renderQuestion();
      $('questionOverlay').classList.remove('hidden');
      startTimer($('qTimer'), $('qTimerNum'), function () { answer(-1); });
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
    document.querySelector('.question-modal').dataset.topic = q.topic;
    badge.textContent = TOPIC_ICON[q.topic] + ' ' + t('topic_' + q.topic);
    $('qHouse').textContent = t('house', { n: s.p.pos });
    $('qDiff').className = 'diff-badge lvl-' + s.p.level;
    $('qDiff').textContent = t('diff_' + s.p.level);
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
        ? t('msg_correct', { name: nameOf(s.p), n: s.p.pos })
        : (s.answered < 0 ? t('msg_timeout') : t('msg_wrongShort')) + ' ' + t('msg_rightWas', { a: q.options[q.correct] });
      $('qContinue').classList.remove('hidden');
    }
    renderContinue();
  }

  // After a correct answer the question closes by itself after a short countdown.
  var AUTO_CLOSE_SECONDS = 3;
  var autoTimer = null;

  function renderContinue() {
    var s = state && state.question;
    var btn = $('qContinue');
    var counting = !!(s && s.countdown != null);
    btn.textContent = counting ? t('continue') + ' (' + s.countdown + ')' : t('continue');
    btn.classList.toggle('counting', counting);
  }

  function startAutoClose() {
    var s = state.question;
    s.countdown = AUTO_CLOSE_SECONDS;
    var btn = $('qContinue');
    btn.style.setProperty('--auto-ms', AUTO_CLOSE_SECONDS * 1000 + 'ms');
    retrigger(btn, 'counting');
    renderContinue();
    autoTimer = setInterval(function () {
      if (!state || state.question !== s) return stopAutoClose();
      s.countdown--;
      if (s.countdown <= 0) closeQuestion();
      else renderContinue();
    }, 1000);
  }

  function stopAutoClose() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }

  function answer(i) {
    var s = state && state.question;
    if (!s || s.answered != null) return;
    s.answered = i;
    stopTimer();
    renderQuestion();
    var modal = document.querySelector('.question-modal');
    retrigger(modal, i === s.q.correct ? 'cheer' : 'shake');
    if (i === s.q.correct) {
      burstAt($('qOptions').querySelector('.correct'), ['#ffd54f', '#ffffff', s.p.color, '#7cf5c4'], 28, 140);
      startAutoClose();
    }
    $('qContinue').focus();
  }

  function closeQuestion() {
    var s = state && state.question;
    if (!s || s.answered == null) return;
    stopAutoClose();
    stopTimer();
    state.question = null;
    $('qContinue').classList.remove('counting');
    $('questionOverlay').classList.add('hidden');
    s.resolve(s.answered === s.q.correct);
  }

  // ----------------------------------------------------------------- timer
  // Every question has QUESTION_SECONDS; the bar empties and the number counts down.
  var qTimer = null;
  function startTimer(box, num, onExpire) {
    stopTimer();
    var total = R.QUESTION_SECONDS;
    var end = Date.now() + total * 1000;
    box.style.setProperty('--t-ms', total * 1000 + 'ms');
    box.classList.remove('urgent', 'stopped');
    retrigger(box, 'running');
    box.setAttribute('title', t('timeLeft'));
    num.textContent = total;
    qTimer = { box: box, id: setInterval(function () {
      var left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      num.textContent = left;
      box.classList.toggle('urgent', left <= 5);
      if (left <= 0) { stopTimer(); onExpire(); }
    }, 200) };
  }
  function stopTimer() {
    if (!qTimer) return;
    clearInterval(qTimer.id);
    qTimer.box.classList.add('stopped');
    qTimer = null;
  }

  // ---------------------------------------------------------------- powers
  var POWER_ICON = { duel: '⚔️', freeze: '❄️', swap: '🔄', hard: '🔥', shield: '🛡️', trap: '🪤', steal: '🕵️' };

  /** Who a power can hit right now, and why not when it can't. */
  function powerInfo(name, p) {
    var def = R.POWERS[name];
    var targets;
    if (name === 'duel') targets = R.duelTargets(state.players, p.idx);
    else if (name === 'freeze') targets = R.freezeTargets(state.players, p.idx, state.lastFrozen);
    else if (name === 'hard') targets = R.hardTargets(state.players, p.idx);
    else if (name === 'swap') { var s = R.swapTarget(state.players, p.idx); targets = s === null ? [] : [s]; }
    else if (name === 'shield') targets = p.shield ? [] : [p.idx];
    else targets = [p.idx];
    var why = '';
    if (state.powerUsed) why = t('why_used');
    else if (!targets.length) why = t(name === 'swap' ? 'why_noneAhead' : name === 'shield' ? 'why_hasShield' : 'why_noTarget');
    else if (p.energy < def.cost) why = t('why_energy', { n: def.cost });
    return { cost: def.cost, targets: targets, why: why };
  }

  function costHtml(n) { return '<span class="pc-cost">' + new Array(n + 1).join('⚡') + '</span>'; }

  function renderPowers() {
    var p = cur();
    var view = state.powerView;
    var html;
    if (view && view.pick === 'trapTopic') {
      html = '<h2>🪤 ' + esc(t('pickTrapTopic')) + '</h2><p class="hint">' + esc(t('house', { n: view.house })) + '</p><div class="topic-list">';
      R.TOPICS.forEach(function (tp) {
        html += '<button type="button" class="topic-pick topic-' + tp + '" data-topic="' + tp + '">' + TOPIC_ICON[tp] + ' ' + esc(t('topic_' + tp)) + '</button>';
      });
      html += '</div><div class="power-foot"><button type="button" class="ghost" data-act="cancelTrap">' + esc(t('cancel')) + '</button></div>';
    } else if (view && view.pick === 'target') {
      var info = powerInfo(view.power, p);
      html = '<h2>' + POWER_ICON[view.power] + ' ' + esc(t('power_' + view.power)) + '</h2><p class="hint">' + esc(t('pickTarget')) + '</p><div class="target-list">';
      info.targets.forEach(function (i) {
        var o = state.players[i];
        html += '<button type="button" class="target-btn" data-target="' + i + '" style="--pc:' + o.color + '">' + avatarHtml(o.avatar, o.color) +
          '<span class="tb-name">' + esc(nm(o)) + '</span><span class="tb-meta">' + esc(o.pos === 0 ? t('start0') : t('house', { n: o.pos })) + ' ' + statusIcons(o) + '</span></button>';
      });
      html += '</div><div class="power-foot"><button type="button" class="ghost" data-act="back">‹ ' + esc(t('back')) + '</button></div>';
    } else {
      html = '<h2>⚡ ' + esc(t('powersTitle', { name: nameOf(p) })) + '</h2>' +
        '<p class="hint">' + esc(t('powersHint')) + '</p><div class="power-grid">';
      R.POWER_ORDER.forEach(function (name) {
        var info = powerInfo(name, p);
        html += '<button type="button" class="power-card" data-power="' + name + '"' + (info.why ? ' disabled' : '') + '>' +
          '<span class="pc-icon" aria-hidden="true">' + POWER_ICON[name] + '</span>' +
          '<span class="pc-name">' + esc(t('power_' + name)) + '</span>' + costHtml(info.cost) +
          '<span class="pc-desc">' + esc(t('desc_' + name)) + '</span>' +
          (info.why ? '<span class="pc-why">' + esc(info.why) + '</span>' : '') + '</button>';
      });
      html += '</div><div class="power-foot"><button type="button" class="ghost" data-act="close">' + esc(t('close')) + '</button></div>';
    }
    $('powerBody').innerHTML = html;
  }

  function openPowers() {
    if (!state || state.phase !== 'roll' || state.powerUsed) return;
    state.powerView = null;
    renderPowers();
    $('powerOverlay').classList.remove('hidden');
    var first = $('powerBody').querySelector('.power-card:not(:disabled)');
    if (first) first.focus();
  }
  function closePowers() {
    if (state) state.powerView = null;
    $('powerOverlay').classList.add('hidden');
  }

  function onPowerClick(e) {
    if (e.target === $('powerOverlay')) {
      if (state && state.phase === 'trap') endTrapPick();
      return closePowers();
    }
    var b = e.target.closest('button');
    if (!b || b.disabled) return;
    var p = cur();
    if (b.dataset.act === 'close') return closePowers();
    if (b.dataset.act === 'back') { state.powerView = null; return renderPowers(); }
    if (b.dataset.act === 'cancelTrap') { closePowers(); return endTrapPick(); }
    if (b.dataset.topic) {
      var house = state.powerView.house;
      closePowers();
      endTrapPick();
      return usePower('trap', null, { house: house, topic: b.dataset.topic });
    }
    if (b.dataset.target != null) return usePower(state.powerView.power, +b.dataset.target);
    var name = b.dataset.power;
    if (!name) return;
    var def = R.POWERS[name];
    if (def.target === 'player') { state.powerView = { pick: 'target', power: name }; renderPowers(); }
    else if (def.target === 'ahead') usePower(name, powerInfo(name, p).targets[0]);
    else if (def.target === 'self') usePower(name, p.idx);
    else if (def.target === 'square') startTrapPick();
  }

  /** A shield soaks up an attack (and is used up). */
  function blocked(target) {
    if (!target.shield) return false;
    target.shield = false;
    log('msg_shieldBlock', { name: nameOf(target) }, { toast: true, kind: 'magic' });
    burstAt(tokenEl(target), ['#80d8ff', '#ffffff', '#b3e5fc'], 18, 70);
    renderPlayers();
    return true;
  }

  async function usePower(name, ti, extra) {
    closePowers();
    var p = cur();
    p.energy -= R.POWERS[name].cost;
    state.powerUsed = true;
    state.phase = 'power';
    renderPanel();
    var tg = ti != null ? state.players[ti] : null;
    if (tg && tg !== p && blocked(tg)) {
      // The attack bounced off a shield.
    } else if (name === 'shield') {
      p.shield = true;
      log('msg_shieldUp', { name: nameOf(p) }, { toast: true, kind: 'magic' });
      burstAt(tokenEl(p), ['#80d8ff', '#ffffff'], 16, 60);
    } else if (name === 'freeze') {
      tg.skip += 1;
      state.lastFrozen = tg.idx;
      log('msg_freeze', { name: nameOf(p), target: nameOf(tg) }, { toast: true, kind: 'magic' });
      burstAt(tokenEl(tg), ['#e1f5fe', '#81d4fa', '#ffffff'], 20, 70);
    } else if (name === 'hard') {
      tg.hardNext = true;
      log('msg_hard', { name: nameOf(p), target: nameOf(tg) }, { toast: true, kind: 'warn' });
      burstAt(tokenEl(tg), ['#ff7043', '#ffca28'], 16, 60);
    } else if (name === 'swap') {
      var a = p.pos, b = tg.pos;
      log('msg_swap', { name: nameOf(p), target: nameOf(tg) }, { toast: true, kind: 'magic' });
      await Promise.all([slideTo(p, b, 'knocked', 950), slideTo(tg, a, 'knocked', 950)]);
    } else if (name === 'trap') {
      state.traps[extra.house] = { owner: p.idx, topic: extra.topic };
      renderBoard();
      log('msg_trapSet', { name: nameOf(p), n: extra.house }, { toast: true, kind: 'warn' });
      flashCell(extra.house, 'boom');
    } else if (name === 'duel') {
      await runDuel(p, tg);
    }
    renderPlayers();
    if (!state || state.winner) return;
    state.phase = 'roll';
    renderPanel();
  }

  // ------------------------------------------------------------ trap pick
  function startTrapPick() {
    closePowers();
    state.phase = 'trap';
    $('trapBanner').classList.remove('hidden');
    renderBoard();
    updateRollBtn();
  }
  function endTrapPick() {
    if (!state || state.phase !== 'trap') return;
    state.phase = 'roll';
    $('trapBanner').classList.add('hidden');
    renderBoard();
    updateRollBtn();
  }
  function onBoardClick(e) {
    if (!state || state.phase !== 'trap') return;
    var cell = e.target.closest('.cell');
    if (!cell) return;
    var h = +cell.dataset.house;
    if (!R.canPlaceTrap(h, state.traps)) return;
    state.powerView = { pick: 'trapTopic', house: h };
    renderPowers();
    $('powerOverlay').classList.remove('hidden');
    $('powerBody').querySelector('.topic-pick').focus();
  }

  // ------------------------------------------------------------------ duel
  // One device: the challenged player answers first while the challenger looks
  // away, then the challenger. The fastest right answer wins.
  function runDuel(me, tg) {
    log('msg_duel', { name: nameOf(me), target: nameOf(tg) }, { toast: true, kind: 'warn' });
    var topic = R.TOPICS[Math.floor(Math.random() * R.TOPICS.length)];
    var level = Math.min(me.level, tg.level);
    var q = state.dealer.next(topic, level);
    return new Promise(function (resolve) {
      state.duel = { q: q, level: level, me: me, tg: tg, order: [tg, me], turn: 0, step: 'pass', answers: [], resolve: resolve };
      renderDuel();
      $('duelOverlay').classList.remove('hidden');
      $('duelReady').focus();
    });
  }

  function renderDuel() {
    var d = state && state.duel;
    if (!d) return;
    var q = d.q;
    var html = '<div class="duel-head"><span class="duel-title">⚔️ ' + esc(t('duelTitle')) + '</span>' +
      '<span class="duel-vs">' + avatarHtml(d.me.avatar, d.me.color, 'mini') + '<b>VS</b>' + avatarHtml(d.tg.avatar, d.tg.color, 'mini') + '</span></div>';
    if (d.step === 'pass') {
      var who = d.order[d.turn], other = d.order[1 - d.turn];
      html += '<div class="duel-pass" style="--pc:' + who.color + '">' + avatarHtml(who.avatar, who.color, 'idle') +
        '<p class="duel-sub">' + esc(t('duelVs', { name: nameOf(d.me), target: nameOf(d.tg) })) + '</p>' +
        '<p class="duel-hide">' + esc(t('duelPass', { name: nameOf(who), other: nameOf(other) })) + '</p>' +
        '<button type="button" class="primary big" id="duelReady">' + esc(t('duelReady', { name: nameOf(who) })) + '</button></div>';
    } else if (d.step === 'answer') {
      var p = d.order[d.turn];
      html += '<div class="q-head"><span class="topic-badge topic-' + q.topic + '">' + TOPIC_ICON[q.topic] + ' ' + esc(t('topic_' + q.topic)) + '</span>' +
        '<span class="diff-badge lvl-' + d.level + '">' + esc(t('diff_' + d.level)) + '</span></div>' +
        '<div class="q-timer" id="dTimer"><span class="q-timer-bar"></span><b class="q-timer-num" id="dTimerNum"></b></div>' +
        '<div class="q-player">' + avatarHtml(p.avatar, p.color, 'mini idle') + '<span>' + esc(nm(p)) + '</span></div>' +
        '<p class="q-text">' + esc(q.q[lang]) + '</p><div class="q-options">';
      q.options.forEach(function (o, i) {
        html += '<button type="button" class="q-opt" data-dopt="' + i + '"><span class="key">' + (i + 1) + '</span><span>' + esc(o[lang]) + '</span></button>';
      });
      html += '</div>';
    } else {
      html += '<p class="q-text">' + esc(q.q[lang]) + '</p><p class="duel-answer">✓ ' + esc(q.options[q.correct][lang]) + '</p><ul class="duel-results">';
      d.order.forEach(function (p, k) {
        var a = d.answers[k];
        html += '<li class="' + (a.correct ? 'good' : 'bad') + (d.winner === p ? ' winner' : '') + '" style="--pc:' + p.color + '">' + avatarHtml(p.avatar, p.color, 'mini') +
          '<span class="dr-name">' + esc(nm(p)) + '</span><span class="dr-ans">' + (a.correct ? '✓ ' : '✗ ') +
          esc(a.choice < 0 ? t('duelNoAnswer') : q.options[a.choice][lang]) + '</span><span class="dr-time">' + (a.ms / 1000).toFixed(1) + ' s</span></li>';
      });
      html += '</ul><p class="duel-verdict">' + esc(d.winner
        ? t('msg_duelWin', { winner: nameOf(d.winner), loser: nameOf(d.loser) })
        : t('msg_duelDraw')) + '</p><div class="power-foot"><button type="button" class="primary big" id="duelDone">' + esc(t('continue')) + '</button></div>';
    }
    $('duelBody').innerHTML = html;
    if (d.step === 'answer') startTimer($('dTimer'), $('dTimerNum'), function () { duelAnswer(-1); });
  }

  function duelAnswer(i) {
    var d = state.duel;
    if (!d || d.step !== 'answer') return;
    stopTimer();
    d.answers[d.turn] = { choice: i, correct: i === d.q.correct, ms: i < 0 ? R.QUESTION_SECONDS * 1000 : Math.round(performance.now() - d.start) };
    if (d.turn === 0) {
      d.turn = 1;
      d.step = 'pass';
    } else {
      d.step = 'result';
      var w = R.duelWinner(d.answers[0], d.answers[1]);
      d.winner = w === 'a' ? d.order[0] : w === 'b' ? d.order[1] : null;
      d.loser = w === 'a' ? d.order[1] : w === 'b' ? d.order[0] : null;
    }
    renderDuel();
    var focus = $('duelReady') || $('duelDone');
    if (focus) focus.focus();
    if (d.winner) burstAt(document.querySelector('.duel-results .winner'), ['#ffd54f', '#ffffff', d.winner.color], 24, 110);
  }

  async function finishDuel() {
    var d = state.duel;
    if (!d || d.step !== 'result') return;
    state.duel = null;
    $('duelOverlay').classList.add('hidden');
    if (d.loser) {
      log('msg_duelWin', { winner: nameOf(d.winner), loser: nameOf(d.loser) }, { toast: true, kind: 'bad' });
      await slideTo(d.loser, Math.max(0, d.loser.pos - R.DUEL_PENALTY), 'retreat', 750);
      await settle(d.loser);
    } else {
      log('msg_duelDraw', {}, { toast: true, kind: 'warn' });
    }
    d.resolve();
  }

  function onDuelClick(e) {
    var d = state && state.duel;
    if (!d) return;
    var b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'duelReady') {
      d.step = 'answer';
      renderDuel();
      d.start = performance.now();
      var first = $('duelBody').querySelector('[data-dopt]');
      if (first) first.focus();
    } else if (b.dataset.dopt != null) {
      duelAnswer(+b.dataset.dopt);
    } else if (b.id === 'duelDone') {
      finishDuel();
    }
  }

  // ----------------------------------------------------------------- steal
  // After a wrong answer the next player may spend ⚡ to answer the same question.
  async function trySteal(loser, q, gain) {
    var thief = state.players[(loser.idx + 1) % state.players.length];
    if (thief === loser || gain <= 0 || thief.energy < R.POWERS.steal.cost) return;
    var yes = await new Promise(function (resolve) {
      state.stealOffer = { loser: loser, thief: thief, gain: gain, resolve: resolve };
      renderSteal();
      $('stealOverlay').classList.remove('hidden');
      $('stealYes').focus();
    });
    if (!yes) return;
    thief.energy -= R.POWERS.steal.cost;
    renderPlayers();
    var ok = await showQuestion(q, thief, q.level);
    if (!ok) {
      log('msg_stealMiss', { name: nameOf(thief) }, { toast: true, kind: 'bad' });
      return;
    }
    log('msg_steal', { name: nameOf(thief), n: gain }, { toast: true, kind: 'good' });
    await walk(thief, R.buildPath(thief.pos, gain));
    if (thief.pos === R.BOARD_SIZE) return win(thief);
    await settle(thief);
  }

  function renderSteal() {
    var o = state && state.stealOffer;
    if (!o) return;
    $('stealBody').innerHTML = '<div class="steal-avatar">' + avatarHtml(o.thief.avatar, o.thief.color, 'idle') + '</div>' +
      '<h2>🕵️ ' + esc(t('stealTitle')) + '</h2>' +
      '<p>' + esc(t('stealText', { loser: nameOf(o.loser), name: nameOf(o.thief), n: o.gain })) + '</p>' +
      '<div class="win-actions"><button type="button" class="primary big" id="stealYes">' + esc(t('stealYes')) + '</button>' +
      '<button type="button" class="ghost" id="stealNo">' + esc(t('stealNo')) + '</button></div>';
  }

  function answerSteal(yes) {
    var o = state && state.stealOffer;
    if (!o) return;
    state.stealOffer = null;
    $('stealOverlay').classList.add('hidden');
    o.resolve(yes);
  }

  // ---------------------------------------------------------------- drawer
  function openDrawer() {
    if (!state) return;
    renderPlayers();
    $('drawer').classList.remove('hidden');
    $('drawerClose').focus();
  }
  function closeDrawer() {
    if ($('drawer').classList.contains('hidden')) return;
    $('drawer').classList.add('hidden');
    $('moreBtn').focus();
  }

  // ------------------------------------------------------------ language
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) { el.title = t(el.dataset.i18nTitle); });
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
      if (!$('powerOverlay').classList.contains('hidden')) renderPowers();
      renderDuel();
      renderSteal();
    }
  }

  function setLang(l) {
    lang = l;
    try { localStorage.setItem('mq-lang', l); } catch (e) { /* ignore */ }
    applyLang();
  }

  // ----------------------------------------------------------------- wiring
  function goToSetup() {
    stopAutoClose();
    state = null;
    $('game').classList.add('hidden');
    $('setup').classList.remove('hidden');
    document.body.classList.remove('in-game');
    closeDrawer();
    $('newGameBtn').classList.add('hidden');
    $('winOverlay').classList.add('hidden');
    $('questionOverlay').classList.add('hidden');
    ['powerOverlay', 'stealOverlay', 'duelOverlay'].forEach(function (id) { $(id).classList.add('hidden'); });
    $('trapBanner').classList.add('hidden');
    stopTimer();
    currentTheme = null;
    setTheme('default');
    renderSetup();
  }

  function init() {
    $('countPicker').addEventListener('click', onSetupClick);
    $('playerRows').addEventListener('click', onSetupClick);
    $('playerRows').addEventListener('input', onSetupInput);
    $('playerRows').addEventListener('scroll', onRowsScroll, { passive: true });
    $('playerRows').addEventListener('keydown', function (e) {
      // Enter in a name moves on to the next player.
      if (e.key !== 'Enter' || e.target.dataset.nameFor == null) return;
      e.preventDefault();
      var i = +e.target.dataset.nameFor;
      if (i < setup.count - 1) {
        goToSlide(Math.max(slide, i + 2 - perView()));
        var next = $('playerRows').querySelector('[data-name-for="' + (i + 1) + '"]');
        if (next) next.focus({ preventScroll: true });
      } else {
        $('startBtn').focus();
      }
    });
    $('prevPlayer').addEventListener('click', function () { goToSlide(slide - 1); });
    $('nextPlayer').addEventListener('click', function () { goToSlide(slide + 1); });
    $('playerDots').addEventListener('click', function (e) {
      var b = e.target.closest('[data-slide]');
      if (b) goToSlide(+b.dataset.slide);
    });
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
    $('moreBtn').addEventListener('click', openDrawer);
    $('powerBtn').addEventListener('click', openPowers);
    $('powerOverlay').addEventListener('click', onPowerClick);
    $('board').addEventListener('click', onBoardClick);
    $('trapCancel').addEventListener('click', endTrapPick);
    $('duelOverlay').addEventListener('click', onDuelClick);
    $('stealOverlay').addEventListener('click', function (e) {
      if (e.target.id === 'stealYes') answerSteal(true);
      else if (e.target.id === 'stealNo') answerSteal(false);
    });
    $('drawerClose').addEventListener('click', closeDrawer);
    $('drawer').addEventListener('click', function (e) { if (e.target === this) closeDrawer(); });
    $('rulesBtn').addEventListener('click', function () { $('rulesOverlay').classList.remove('hidden'); $('rulesClose').focus(); });
    $('rulesClose').addEventListener('click', function () { $('rulesOverlay').classList.add('hidden'); });
    $('rulesOverlay').addEventListener('click', function (e) { if (e.target === this) this.classList.add('hidden'); });
    $('newGameBtn').addEventListener('click', function () {
      if (!state || state.winner || window.confirm(t('confirmNew'))) goToSetup();
    });
    $('playAgainBtn').addEventListener('click', goToSetup);
    $('rematchBtn').addEventListener('click', function () {
      var players = state.players.map(function (p) { return { name: p.name, avatar: p.avatar, color: p.color, level: p.level }; });
      newGame(players);
    });

    document.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT') return;
      if (!$('drawer').classList.contains('hidden')) {
        if (e.key === 'Escape') closeDrawer();
        return;
      }
      if (!$('rulesOverlay').classList.contains('hidden')) {
        if (e.key === 'Escape') $('rulesOverlay').classList.add('hidden');
        return;
      }
      if (!$('powerOverlay').classList.contains('hidden')) {
        if (e.key === 'Escape') { if (state.phase === 'trap') endTrapPick(); closePowers(); }
        return;
      }
      if (state && state.phase === 'trap') {
        if (e.key === 'Escape') endTrapPick();
        return;
      }
      if (state && state.duel) {
        if (state.duel.step === 'answer' && /^[1-4]$/.test(e.key)) { e.preventDefault(); duelAnswer(+e.key - 1); }
        return;
      }
      if (state && state.stealOffer) return;
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
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (!state) { goToSlide(slide, true); return; }
        if (fitBoard()) renderBoard();
        layoutTokens(true);
      }, 80);
    }
    window.addEventListener('resize', onResize);
    if (window.ResizeObserver) new ResizeObserver(onResize).observe($('boardArea'));

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
