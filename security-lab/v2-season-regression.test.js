const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const ui = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');
const data = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf8');
const render = fs.readFileSync(path.join(__dirname, '..', 'render.js'), 'utf8');

test('v2 season adds a selectable aurora theme without external art assets', () => {
  assert.match(data, /aurora:\s*\{\s*id: 'aurora'/);
  assert.match(data, /activeTheme: 'aurora'/);
  assert.match(render, /if \(theme === 'aurora'\)/);
  assert.match(render, /rgba\(45,212,191,0\.23\)/);
  assert.match(index, /v2\.0\.0/);
});

test('daily missions have per-day state, bounded progress, and one-time claims', () => {
  assert.match(ui, /const DAILY_MISSION_KEY/);
  assert.match(ui, /function getLocalDayKey\(\)/);
  assert.match(ui, /function getDailyMissionDefinitions\(/);
  assert.match(ui, /function claimDailyMission\(missionId\)/);
  assert.match(ui, /state\.claimed\.includes\(mission\.id\)/);
  assert.match(ui, /state\.claimed\.push\(mission\.id\)/);
  assert.match(index, /id="daily-missions-modal"/);
  assert.match(index, /onclick="openDailyMissionsModal\(\)"/);
});

test('season music is original Web Audio synthesis, user-initiated, and switchable', () => {
  assert.match(ui, /async function toggleSeasonMusic\(\)/);
  assert.match(ui, /window\.AudioContext \|\| window\.webkitAudioContext/);
  assert.match(ui, /await audio\.resume\(\)/);
  assert.match(ui, /if \(seasonMusicOn\)/);
  assert.match(index, /id="btn-season-music"/);
  assert.doesNotMatch(index, /\.mp3|\.ogg|\.wav/i);
});

test('v1.3 achievements and leaderboard badges remain included in v2', () => {
  assert.match(ui, /function getAchievementDefinitions\(\)/);
  assert.match(ui, /function getCommanderBadge\(/);
  assert.match(index, /id="achievements-modal"/);
  assert.match(ui, /getCommanderBadge\(p\.highestWave, p\.prestiges\)/);
});
