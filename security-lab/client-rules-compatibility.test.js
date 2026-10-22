const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const uiSource = fs.readFileSync(path.join(repoRoot, 'ui.js'), 'utf8');
const rulesSource = fs.readFileSync(path.join(__dirname, 'firestore.rules'), 'utf8');

test('leaderboard score and persistent rate-limit record are written in one atomic batch', () => {
  assert.match(uiSource, /const batch = fbDb\.batch\(\);/);
  assert.match(uiSource, /const serverTime = firebase\.firestore\.FieldValue\.serverTimestamp\(\);/);
  assert.match(uiSource, /batch\.set\(fbDb\.collection\('leaderboardRateLimits'\)\.doc\(uid\),\s*\{[\s\S]*?uid,[\s\S]*?highestWave: playerEntry\.highestWave,[\s\S]*?updatedAt: serverTime[\s\S]*?\}\s*,\s*\{ merge: true \}\s*\);/);
  assert.match(uiSource, /batch\.set\(fbDb\.collection\('leaderboard'\)\.doc\(uid\),\s*\{[\s\S]*?\.\.\.playerEntry,[\s\S]*?updatedAt: serverTime[\s\S]*?\}\s*,\s*\{ merge: true \}\s*\);/);
  assert.match(uiSource, /await batch\.commit\(\);/);
});

test('candidate rules require the paired documents to match the authenticated owner and timestamp', () => {
  assert.match(rulesSource, /function isOwner\(userId\)[\s\S]*?request\.auth\.uid == userId/);
  assert.match(rulesSource, /function rateLimitMatchesBoard\(userId\)[\s\S]*?boardAfter\.data\.updatedAt == request\.time[\s\S]*?boardAfter\.data\.highestWave == request\.resource\.data\.highestWave/);
  assert.match(rulesSource, /match \/leaderboard\/\{userId\}[\s\S]*?allow create,update: if isOwner\(userId\)&&validBoardDoc\(userId\)&&withinRateLimit\(userId\)/);
  assert.match(rulesSource, /match \/leaderboardRateLimits\/\{userId\}[\s\S]*?allow create: if isOwner\(userId\)[\s\S]*?rateLimitMatchesBoard\(userId\)/);
  assert.match(rulesSource, /allow delete: if false;/);
});

test('cloud save writes the required user document fields with compatible value types', () => {
  assert.match(uiSource, /fbDb\.collection\('users'\)\.doc\(currentUser\.uid\)\.set\(\{\s*username: currentUser\.username,\s*saveData: JSON\.stringify\(game\),\s*highestWave: Math\.max\(game\.highestWave \|\| 1, game\.wave \|\| 1\),\s*updatedAt: Date\.now\(\)/);
  assert.match(rulesSource, /function validUserDoc\(\)[\s\S]*?d\.get\('username','x'\) is string[\s\S]*?d\.get\('saveData',''\) is string[\s\S]*?validNum\(d\.get\('highestWave',1\),1,maxWave\(\)\)[\s\S]*?d\.get\('updatedAt',0\) is number/);
  assert.match(rulesSource, /match \/users\/\{userId\}[\s\S]*?allow create,update: if isOwner\(userId\)&&validUserDoc\(\)/);
});

test('account deletion intentionally leaves rate-limit metadata and documents that policy', () => {
  assert.match(uiSource, /fbDb\.collection\('leaderboard'\)\.doc\(uid\)\.delete\(\)/);
  assert.match(uiSource, /fbDb\.collection\('users'\)\.doc\(uid\)\.delete\(\)/);
  assert.doesNotMatch(uiSource, /fbDb\.collection\('leaderboardRateLimits'\)\.doc\(uid\)\.delete\(\)/);
  assert.match(rulesSource, /This record must survive leaderboard deletion/);
});
