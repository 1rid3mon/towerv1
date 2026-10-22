const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const uiSource = fs.readFileSync(path.join(__dirname, '..', 'ui.js'), 'utf8');

test('local save loading fails closed if the verifier is missing or rejects the save', () => {
  assert.match(
    uiSource,
    /if \(typeof window\._verifySaveSignature !== 'function' \|\| !window\._verifySaveSignature\(parsed\)\)/
  );
});

test('save-code import requires a signature and an available passing verifier', () => {
  assert.match(
    uiSource,
    /if \(!parsed\._sig \|\| typeof window\._verifySaveSignature !== 'function' \|\| !window\._verifySaveSignature\(parsed\)\)/
  );
});

test('cloud save loading fails closed if the verifier is missing or rejects the save', () => {
  assert.match(
    uiSource,
    /if \(typeof window\._verifySaveSignature !== 'function' \|\| !window\._verifySaveSignature\(cloudGame\)\)/
  );
});
