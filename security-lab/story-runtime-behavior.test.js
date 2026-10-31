const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the actual controllers and engine together. DOM/audio/network are adapters;
// mission transitions, combat gates, progress normalization and storage are production code.
function runtime(mission = 1) {
  const nodes = new Map();
  const storage = new Map();
  const timers = new Map();
  let nextTimer = 0;
  const listeners = new Map();
  let randomState = 123456789;
  const seededMath = Object.create(Math);
  seededMath.random = () => { randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0; return randomState / 4294967296; };
  const noop = () => {};
  function node(id) {
    if (!nodes.has(id)) {
      const classes = new Set();
      nodes.set(id, { hidden: true, textContent: '', style: {}, dataset: {}, width: 390, height: 700,
        clientWidth: 390, clientHeight: 700, attributes: {},
        setAttribute(key, value) { this.attributes[key] = value; },
        getAttribute(key) { return this.attributes[key]; },
        classList: { add: (...xs) => xs.forEach(x => classes.add(x)), remove: (...xs) => xs.forEach(x => classes.delete(x)),
          contains: x => classes.has(x), toggle(x, force) { const add = force ?? !classes.has(x); add ? classes.add(x) : classes.delete(x); return add; } },
        getContext: () => ({}), querySelector: () => null, querySelectorAll: () => [], appendChild: noop,
        focus: noop, addEventListener: noop, remove: noop });
    }
    return nodes.get(id);
  }
  const sandbox = { console, Math: seededMath, URL, URLSearchParams, performance: { now: () => 100 },
    location: { search: `?runtime=story&mission=${mission}&storyLaunch=parent`, origin: 'https://test.invalid' },
    parent: { postMessage: noop }, addEventListener: (name, callback) => {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(callback);
    }, setInterval: noop, clearInterval: noop,
    setTimeout: callback => { const id = ++nextTimer; timers.set(id, callback); return id; },
    clearTimeout: id => timers.delete(id),
    requestAnimationFrame: noop,
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)), removeItem: k => storage.delete(k) },
    document: { readyState: 'loading', body: node('body'), head: node('head'), getElementById: node,
      addEventListener: noop, querySelectorAll: () => [], createElement: () => node('new') },
    currentUser: null, isFirebaseReady: false, fbDb: null, getGameLanguage: () => 'tr',
    showToast: noop, buildUpgradesUI: noop, buildInventoryUI: noop, applyBodyClasses: noop,
    createParticles: noop, addFloatingText: noop,
    updateHUD: noop, refreshUpgradeButtonsState: noop, updatePrestigeUI: noop, saveGame: noop,
    setElText: (id, text) => { node(id).textContent = text; }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const file of ['mode-runtime.js', 'data.js', 'story.js', 'story-finale.js', 'engine.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), sandbox, { filename: file });
  }
  const ui = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');
  vm.runInContext(ui.slice(ui.indexOf('function toggleGameSpeed()'), ui.indexOf('function toggleRangeCircle()')), sandbox);
  const run = code => vm.runInContext(code, sandbox);
  run(`saveStoryProgress(Object.fromEntries(Array.from({length:21}, (_,i)=>['mission'+(i+1)+'Complete', false])));`);
  if (mission > 1) run(`saveStoryProgress({mission${mission - 1}Complete:true});`);
  run(`startStoryMission(${mission});`);
  return { sandbox, run, nodes, storage, listeners, flushTimers() {
    while (timers.size) { const [id, callback] = timers.entries().next().value; timers.delete(id); callback(); }
  } };
}

test('Mission 1 cannot finish on a stray completion call or by resuming the stabilization phase', () => {
  const { run } = runtime();
  run('completeWave()');
  assert.equal(run('GameModeRuntime.storySession.phase'), 'combat');
  run('game.waveKills = game.waveTargetKills; completeWave()');
  assert.equal(run('GameModeRuntime.storySession.phase'), 'stabilize');
  assert.equal(run('getStoryProgress().mission1Complete'), false);
  run('togglePause(); completeWave()');
  assert.equal(run('isPaused'), true);
  assert.equal(run('getStoryProgress().mission1Complete'), false);
  run('finishStoryBattleEncounter()');
  assert.equal(run('getStoryProgress().mission1Complete'), true);
});

test('Mission 2 requires all three explicit scans even after resuming or repeated wave callbacks', () => {
  const { run } = runtime(2);
  run('game.waveKills = game.waveTargetKills; completeWave(); togglePause(); completeWave()');
  assert.equal(run('getStoryProgress().mission2Complete'), false);
  run('finishStoryBattleEncounter()');
  assert.equal(run('getStoryProgress().mission2Complete'), false);
  run('scanStorySignal(); scanStorySignal()');
  assert.equal(run('getStoryProgress().mission2Complete'), false);
  run('scanStorySignal()');
  assert.equal(run('getStoryProgress().mission2Complete'), true);
});

test('Mission 10 tutorial nodes cannot be consumed by the combat engine', () => {
  const { run, flushTimers } = runtime(10);
  run('game.waveKills = game.waveTargetKills; completeWave()');
  assert.equal(run('GameModeRuntime.storySession.phase'), 'pulseNode1');
  run('isPaused = false; updateGame(0.1); completeWave()');
  assert.equal(run('GameModeRuntime.storySession.phase'), 'pulseNode1');
  assert.equal(run('getStoryProgress().mission10Complete'), false);
  run('pulseStoryMission10(); GameModeRuntime.storySession.pulseBusy = false; pulseStoryMission10()');
  flushTimers();
  assert.equal(run('getStoryProgress().mission10Complete'), true);
});

test('narrative phases never spawn enemies and controls reflect automatic pauses', () => {
  const { run, nodes } = runtime(3);
  run('togglePause(); updateGame(1)');
  assert.equal(run('isPaused'), true);
  assert.equal(run('enemies.length'), 0);
  const combat = runtime(16);
  combat.run('toggleGameSpeed(); toggleGameSpeed(); game.waveKills = game.waveTargetKills; completeWave()');
  assert.equal(combat.nodes.get('btn-pause').attributes['aria-pressed'], 'true');
  combat.run('continueStoryChapter2Mission()');
  assert.equal(combat.run('gameSpeed'), 1);
  assert.equal(combat.nodes.get('ui-speed').textContent, '1x');
  assert.equal(combat.nodes.get('btn-pause').attributes['aria-pressed'], 'false');
});

test('chapter 3 mission starts with the chapter 3 heading', () => {
  const { nodes } = runtime(19);
  assert.match(nodes.get('story-chapter-label').textContent, /03/);
});

test('Story unlock requires clearing wave 25, not merely entering it', () => {
  const { run } = runtime();
  run('game.highestWave = 25; game.wave = 25');
  assert.equal(run('updateStoryUnlockUI()'), false);
  run('game.highestWave = 26; game.wave = 26');
  assert.equal(run('updateStoryUnlockUI()'), true);
});

test('a delayed Story upload preserves newer local progress', async () => {
  const { sandbox, run, storage } = runtime();
  let finish;
  sandbox.currentUser = { uid: 'a', isCloud: true };
  sandbox.isFirebaseReady = true;
  sandbox.fbDb = { collection: () => ({ doc: () => ({ set: () => new Promise(resolve => { finish = resolve; }) }) }) };
  storage.set('towerDefenseStoryProgressOwnerV1', 'a');
  const pending = run('pushStoryProgressToCloud()');
  run('saveStoryProgress({mission1Complete:true})');
  const newer = storage.get('towerDefenseStoryProgressV1');
  finish();
  assert.equal(await pending, true);
  assert.equal(storage.get('towerDefenseStoryProgressV1'), newer);
});

test('delayed Story upload and download cannot modify a newly signed-in account', async () => {
  for (const operation of ['pushStoryProgressToCloud()', 'pullStoryProgressFromCloud()']) {
    const { sandbox, run, storage } = runtime();
    let finish;
    sandbox.currentUser = { uid: 'a', isCloud: true };
    sandbox.isFirebaseReady = true;
    const deferred = () => new Promise(resolve => { finish = resolve; });
    sandbox.fbDb = { collection: () => ({ doc: uid => {
      assert.equal(uid, 'a');
      return { set: deferred, get: deferred };
    } }) };
    storage.set('towerDefenseStoryProgressOwnerV1', 'a');
    const pending = run(operation);
    sandbox.currentUser = { uid: 'b', isCloud: true };
    storage.set('towerDefenseStoryProgressOwnerV1', 'b');
    storage.set('towerDefenseStoryProgressV1', '{"mission1Complete":false,"updatedAt":42}');
    finish({ exists: true, data: () => ({ mission1Complete: true, updatedAt: 999 }) });
    assert.equal(await pending, false);
    assert.equal(storage.get('towerDefenseStoryProgressOwnerV1'), 'b');
    assert.equal(storage.get('towerDefenseStoryProgressV1'), '{"mission1Complete":false,"updatedAt":42}');
  }
});

test('Story upload rejects a local save belonging to another account', async () => {
  const { sandbox, run, storage } = runtime();
  sandbox.currentUser = { uid: 'b', isCloud: true };
  sandbox.isFirebaseReady = true;
  sandbox.fbDb = { collection() { assert.fail('must not write unowned data'); } };
  storage.set('towerDefenseStoryProgressOwnerV1', 'a');
  assert.equal(await run('pushStoryProgressToCloud()'), false);
});

test('legacy production rules preserve both the old cloud save and new local finale progress', async () => {
  const { sandbox, run, storage } = runtime(27);
  sandbox.currentUser = { uid:'a', isCloud:true }; sandbox.isFirebaseReady = true;
  storage.set('towerDefenseStoryProgressOwnerV1', 'a');
  run("saveStoryProgress({mission27Complete:true,companionForm:'tower',stabilityChoice:'preserve'})");
  const writes = [];
  sandbox.fbDb = { collection: () => ({ doc: () => ({ set: async payload => {
    writes.push(payload);
    if ('mission27Complete' in payload) throw { code:'permission-denied' };
  } }) }) };
  assert.equal(await run('pushStoryProgressToCloud()'), true);
  assert.equal(writes.length, 2);
  assert.equal(writes[1].companionForm, 'cyan');
  assert.equal('mission27Complete' in writes[1], false);
  assert.equal(run('getStoryProgress().mission27Complete'), true);
  assert.equal(run('getStoryProgress().companionForm'), 'tower');
  assert.equal(sandbox.storyCloudExpansionPending, true);
});

test('legacy remote records cannot erase account-owned local finale flags', () => {
  const { run } = runtime(27);
  run("globalThis.remoteFixture={mission21Complete:true,companionForm:'cyan'}; preserveLocalFinaleProgress(remoteFixture, {mission27Complete:true,companionForm:'tower',stabilityChoice:'recover'}, {})");
  assert.equal(run('remoteFixture.mission27Complete'), true);
  assert.equal(run('remoteFixture.companionForm'), 'tower');
});

test('finale defense link has a bounded shield, cooldown, and no Endless bonus', () => {
  const { run } = runtime(26);
  run('tower.shield = 0; activateStoryDefenseLink()');
  const first = run('tower.shield');
  assert.ok(first > 0);
  assert.ok(first <= run('getTowerMaxShield()'));
  run('activateStoryDefenseLink()');
  assert.equal(run('tower.shield'), first);
  run('tickStoryFinale(11); activateStoryDefenseLink()');
  assert.ok(run('tower.shield') <= run('getTowerMaxShield()'));
  run('exitStoryBattle(false)');
  assert.equal(run('getStoryFinaleShieldBonus()'), 0);
  assert.equal(run('getTowerMaxShield()'), 0);
});

test('finale abort and reentry resume the last completed stage without awarding the mission', () => {
  const { run } = runtime(24);
  run('game.waveKills=game.waveTargetKills; completeWave()');
  assert.equal(run('GameModeRuntime.storySession.finaleStage'), 1);
  run('exitStoryBattle(false); startStoryMission(24)');
  assert.equal(run('GameModeRuntime.storySession.finaleStage'), 1);
  assert.equal(run('GameModeRuntime.storySession.phase'), 'finaleAction');
  assert.equal(run('getStoryProgress().mission24Complete'), false);
});

test('Story rendering reads the explicit runtime rather than the removed legacy session', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'render.js'), 'utf8');
  assert.doesNotMatch(source, /window\.__storyBattle/);
  assert.match(source, /GameModeRuntime\.storySession/);
});

test('only the active same-origin mission can request a parent-owned save that survives frame closure', async () => {
  const { sandbox, run, storage, listeners, flushTimers } = runtime();
  const source = {};
  sandbox.testFrame = { querySelector: () => ({ contentWindow: source }), remove() {} };
  sandbox.currentUser = { uid: 'a', isCloud: true };
  sandbox.isFirebaseReady = true;
  let writes = 0;
  sandbox.fbDb = { collection: () => ({ doc: uid => {
    assert.equal(uid, 'a');
    return { set: async () => { writes++; } };
  } }) };
  storage.set('towerDefenseStoryProgressOwnerV1', 'a');
  run('storyRuntimeFrameOverlay = testFrame');
  const dispatch = event => listeners.get('message').forEach(callback => callback(event));
  const valid = { source, origin: 'https://test.invalid', data: { type: 'tower-story-progress-saved', ownerUid: 'a' } };
  dispatch({ ...valid, origin: 'https://other.invalid' });
  dispatch({ ...valid, source: {} });
  dispatch({ ...valid, data: { ...valid.data, ownerUid: 'b' } });
  flushTimers();
  assert.equal(writes, 0);
  dispatch(valid);
  run('closeStoryRuntimeFrame()');
  flushTimers();
  await Promise.resolve();
  assert.equal(writes, 1);
});

test('closing the mission before its progress message arrives still schedules an owned cloud save', async () => {
  const { sandbox, run, storage, flushTimers } = runtime();
  sandbox.testFrame = { remove() {} };
  sandbox.currentUser = { uid: 'a', isCloud: true };
  sandbox.isFirebaseReady = true;
  let writes = 0;
  sandbox.fbDb = { collection: () => ({ doc: () => ({ set: async () => { writes++; } }) }) };
  storage.set('towerDefenseStoryProgressOwnerV1', 'a');
  run('storyRuntimeFrameOverlay = testFrame; closeStoryRuntimeFrame()');
  flushTimers();
  await Promise.resolve();
  assert.equal(writes, 1);
});

test('mission 1 combat reaches its objective through the real simulation without awarding completion', () => {
  const { run } = runtime();
  run('for (let tick=0; tick<60*180 && GameModeRuntime.isStoryCombatActive(); tick++) updateGame(1/60);');
  assert.equal(run('GameModeRuntime.storySession.phase'), 'stabilize');
  assert.equal(run('getStoryProgress().mission1Complete'), false);
  assert.ok(run('game.stats.totalKills') >= 8);
});

for (let mission = 1; mission <= 27; mission++) {
  test(`mission ${mission} controller reaches saved completion only after its combat and action stages`, () => {
    const { run, flushTimers } = runtime(mission);
    const actions = {
      stabilize: 'finishStoryBattleEncounter()', scan: 'scanStorySignal()',
      investigate: "chooseStorySignalSource('array')", powerChoice: "chooseStoryPowerPriority('shield')",
      repair: 'repairStoryConnection()', memory: 'inspectStoryMemory()',
      relay: 'disableStoryRelay()', amplifier: 'disableStoryAmplifier()',
      reconnect: 'reconnectStoryCompanion()', awaken: 'awakenStoryCompanion()', pulseTest: 'testStoryPulse()',
      pulseNode1: 'pulseStoryMission10()', pulseNode2: 'pulseStoryMission10()',
      relayNode1: 'pulseStoryMission11()', relayNode2: 'pulseStoryMission11()', relayNode3: 'pulseStoryMission11()',
      archive1: mission === 17 ? 'continueStoryChapter2Mission()' : 'inspectStoryArchive()',
      archive2: mission === 17 ? 'continueStoryChapter2Mission()' : 'inspectStoryArchive()', archive3: 'inspectStoryArchive()',
      voice1: 'inspectStoryVoiceRecord()', voice2: 'inspectStoryVoiceRecord()', voiceChoice: "chooseStoryVoice('human')",
      coreSeal1: 'finishStoryBattleEncounter()', coreSeal2: 'finishStoryBattleEncounter()', coreSeal3: 'finishStoryBattleEncounter()',
      repairSystem1: 'repairStoryMission15System()', repairSystem2: 'repairStoryMission15System()', repairSystem3: 'repairStoryMission15System()',
      routeScan1: 'continueStoryChapter2Mission()', routeScan2: 'continueStoryChapter2Mission()', callSign: "chooseStoryChapter2CallSign('piko')",
      relay1: 'continueStoryChapter2Mission()', relay2: 'continueStoryChapter2Mission()', finalLock: 'continueStoryChapter2Mission()',
      navigationScan: 'continueStoryChapter2Mission()', selectivePulse: 'continueStoryChapter2Mission()',
      fragmentScan: 'continueStoryChapter2Mission()', archiveRebuild: 'continueStoryChapter2Mission()'
    };
    for (let step=0; step<20 && !run('GameModeRuntime.storySession.completed'); step++) {
      const phase = run('GameModeRuntime.storySession.phase');
      assert.equal(run(`getStoryProgress().mission${mission}Complete`), false);
      if (run('GameModeRuntime.isStoryCombatActive()')) {
        // Supply a combat result for controller coverage; the simulation has a separate test.
        run('game.waveKills = game.waveTargetKills; completeWave()');
      } else {
        if (mission >= 22) {
          const kind = run('STORY_FINALE[GameModeRuntime.storySession.mission].stages[GameModeRuntime.storySession.finaleStage].kind');
          run(kind === 'choice' ? "chooseStoryFinaleMemory('preserve')" : kind === 'ability' ? 'activateStoryDefenseLink()' : 'continueStoryFinale()');
          flushTimers();
          continue;
        }
        assert.ok(actions[phase], `No action for ${phase}`);
        run(actions[phase]);
        flushTimers();
      }
    }
    assert.equal(run('GameModeRuntime.storySession.completed'), true);
    assert.equal(run(`getStoryProgress().mission${mission}Complete`), true);
    assert.equal(JSON.parse(run("localStorage.getItem('towerDefenseStoryProgressV1')"))[`mission${mission}Complete`], true);
  });
}
