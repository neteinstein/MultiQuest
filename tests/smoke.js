// Browser smoke test: plays a real game in headless Chromium and checks the
// things unit tests can't see. Run with: node tests/smoke.js
const path = require('path');
const { chromium } = require('playwright');

const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const failures = [];
const fail = (msg) => { failures.push(msg); console.error('✗ ' + msg); };
const pass = (msg) => console.log('✓ ' + msg);

async function checkFits(page, label) {
  const r = await page.evaluate(() => {
    const d = document.documentElement;
    const board = document.getElementById('board').getBoundingClientRect();
    const bar = document.getElementById('turnCard').getBoundingClientRect();
    return { sw: d.scrollWidth, sh: d.scrollHeight, w: innerWidth, h: innerHeight, boardRight: board.right, boardBottom: board.bottom, barTop: bar.top, barBottom: bar.bottom };
  });
  const ok = r.sw <= r.w && r.sh <= r.h && r.boardRight <= r.w && r.boardBottom <= r.barTop && r.barBottom <= r.h;
  if (ok) pass(label + ': board and bar fit without scrolling');
  else fail(label + ': layout overflows ' + JSON.stringify(r));
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  // 1) Layout fits at common screen sizes.
  for (const [w, h, label] of [[1400, 900, 'desktop'], [390, 844, 'phone'], [844, 390, 'phone landscape']]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(URL);
    await page.click('.count-btn[data-count="6"]');
    await page.click('#startBtn');
    await page.waitForTimeout(300);
    await checkFits(page, label);
    await page.close();
  }

  // 2) Setup is a sideways carousel: it fits a phone screen and Next moves on one player.
  for (const [w, h, label] of [[390, 844, 'phone'], [375, 667, 'small phone']]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(URL);
    await page.click('.count-btn[data-count="6"]');
    const r = await page.evaluate(() => ({ sh: document.documentElement.scrollHeight, h: innerHeight, sw: document.documentElement.scrollWidth, w: innerWidth }));
    r.sh <= r.h && r.sw <= r.w ? pass(label + ': player setup fits without scrolling the page') : fail(label + ': setup overflows ' + JSON.stringify(r));
    const inView = () => page.$$eval('.player-row.in-view', (els) => els.map((e) => +e.dataset.slide));
    await page.click('.dot[data-slide="0"]');
    await page.click('#nextPlayer');
    await page.waitForTimeout(100);
    const v = await inView();
    v.length === 1 && v[0] === 1 ? pass(label + ': Next shows the next player') : fail(label + ': after Next the cards in view are ' + v);
    await page.close();
  }

  // 3) Setup rules: colours must be unique.
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL);
  await page.click('.lang-btn[data-lang=pt]');
  await page.click('.count-btn[data-count="4"]');
  const taken = await page.$eval('.swatch[data-player="1"][data-color="#e53935"]', (b) => b.disabled);
  taken ? pass('a colour taken by another player is disabled') : fail('taken colour can still be picked');
  for (let i = 0; i < 4; i++) await page.click(`.diff-btn[data-player="${i}"][data-diff="${i + 1}"]`);
  await page.click('#startBtn');

  // 4) Play until someone wins (or time runs out), using powers along the way.
  const levelMismatch = [];
  const powersUsed = new Set();
  let turns = 0, questions = 0, switched = false, drawerChecked = false, bonusOver = false;
  let steals = 0, duels = 0;
  const rnd = (n) => Math.floor(Math.random() * n);
  const start = Date.now();
  while (Date.now() - start < 300000) {
    const st = await page.evaluate(() => {
      const s = MQGame.state;
      return {
        phase: s.phase, winner: !!s.winner,
        q: s.question && { answered: s.question.answered, correct: s.question.q.correct, level: s.question.q.level, expect: s.question.level, bonus: s.question.p.bonus },
        duel: s.duel && { step: s.duel.step, correct: s.duel.q.correct },
        steal: !!s.stealOffer,
        powersOpen: !document.getElementById('powerOverlay').classList.contains('hidden'),
        canPower: !document.getElementById('powerBtn').disabled
      };
    });
    if (st.winner) break;
    if (st.steal) {
      steals++;
      await page.click(Math.random() < 0.7 ? '#stealYes' : '#stealNo');
    } else if (st.duel) {
      if (st.duel.step === 'pass') await page.click('#duelReady');
      else if (st.duel.step === 'answer') await page.click('[data-dopt="' + (Math.random() < 0.7 ? st.duel.correct : rnd(4)) + '"]');
      else { duels++; await page.click('#duelDone'); }
    } else if (st.q) {
      if (st.q.answered == null) {
        questions++;
        if (st.q.bonus > 3) bonusOver = true;
        if (st.q.level !== st.q.expect) levelMismatch.push(st.q);
        const pick = Math.random() < 0.85 ? st.q.correct : (st.q.correct + 1) % 4;
        await page.click('[data-opt="' + pick + '"]');
      } else {
        await page.click('#qContinue');
      }
    } else if (st.powersOpen) {
      const targets = await page.$$('.target-btn');
      const topics = await page.$$('.topic-pick');
      const cards = await page.$$('.power-card:not(:disabled)');
      if (targets.length) await targets[rnd(targets.length)].click();
      else if (topics.length) await topics[rnd(topics.length)].click();
      else if (cards.length) {
        const card = cards[rnd(cards.length)];
        powersUsed.add(await card.getAttribute('data-power'));
        await card.click();
      } else await page.click('[data-act="close"]');
    } else if (st.phase === 'trap') {
      const cells = await page.$$('.cell.trappable');
      await cells[rnd(cells.length)].click();
    } else if (st.phase === 'roll') {
      if (st.canPower && Math.random() < 0.6) { await page.click('#powerBtn'); continue; }
      turns++;
      if (turns === 10 && !switched) { await page.click('.lang-btn[data-lang=en]'); switched = true; }
      if (turns === 12 && !drawerChecked) {
        await page.click('#moreBtn');
        const rows = await page.$$eval('#playerList li', (li) => li.length);
        rows === 4 ? pass('details drawer lists all players') : fail('drawer shows ' + rows + ' players');
        await page.keyboard.press('Escape');
        drawerChecked = true;
      }
      await page.click('#rollBtn');
    }
    await page.waitForTimeout(30);
  }
  powersUsed.size >= 5 ? pass('powers used: ' + [...powersUsed].join(', ')) : fail('only these powers were used: ' + [...powersUsed].join(', '));
  steals > 0 ? pass(steals + ' chance(s) to steal a question') : fail('nobody was offered a steal');
  duels > 0 ? pass(duels + ' duel(s) fought') : fail('no duel was fought');
  const winner = await page.evaluate(() => MQGame.state.winner && MQGame.state.winner.idx);
  winner != null ? pass(`game finished: player ${winner + 1} won after ${turns} turns, ${questions} questions`)
    : fail(`no winner after ${turns} turns`);
  bonusOver ? fail('a player got more than 3 extra rolls in a row') : pass('extra rolls for right answers stay within 3 in a row');
  levelMismatch.length ? fail(levelMismatch.length + ' questions did not match the expected level') : pass('every question matched the expected difficulty');
  if (winner != null) {
    await page.waitForSelector('#winOverlay:not(.hidden)', { timeout: 5000 }).then(() => pass('winner screen shown'), () => fail('winner screen not shown'));
  }

  // 5) Running out of the 30 seconds counts as a wrong answer.
  {
    const tp = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    tp.on('pageerror', (e) => errors.push(e.message));
    await tp.clock.install();
    await tp.goto(URL);
    await tp.click('#startBtn');
    for (let i = 0; i < 40; i++) {
      const ph = await tp.evaluate(() => MQGame.state.question ? 'q' : MQGame.state.phase);
      if (ph === 'q') break;
      if (ph === 'roll') await tp.click('#rollBtn');
      await tp.clock.runFor(1000);
    }
    const before = await tp.evaluate(() => MQGame.state.question && MQGame.state.question.answered);
    await tp.clock.runFor(31000);
    const after = await tp.evaluate(() => MQGame.state.question && MQGame.state.question.answered);
    before === null && after === -1 ? pass('a question times out after 30 seconds as a wrong answer') : fail('timer: answered ' + before + ' -> ' + after);
    await tp.close();
  }

  errors.length ? fail('page errors: ' + errors.join(' | ')) : pass('no JavaScript errors');
  await browser.close();
  if (failures.length) { console.error(`\n${failures.length} check(s) failed`); process.exit(1); }
  console.log('\nAll smoke checks passed');
})().catch((e) => { console.error(e); process.exit(1); });
