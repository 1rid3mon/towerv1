const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function runtime() {
  const s={localStorage:{getItem:()=> 'tr'}};s.window=s;vm.createContext(s);
  for(const name of ['locales.js','i18n.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),s);
  return s;
}
test('all four locales provide reviewed mode labels and preserve dynamic mission numbers',()=>{
  const s=runtime();
  for(const [language,expected] of Object.entries({tr:'Hikâye Modu',en:'Story Mode',es:'Modo historia',de:'Story-Modus'})) {
    assert.equal(s.GameLocale.translate('Hikâye Modu',language),expected);
    assert.ok(s.GameLocale.translate('MISSION 27 COMPLETE',language).includes('27'));
  }
});
test('language changes restore the original text rather than translating a previous output',()=>{
  const {GameLocale}=runtime();
  const node={nodeType:3,nodeValue:'Hikâye Modu',parentElement:{closest:()=>false}};
  for(const language of ['es','de','en','tr']) GameLocale.translateNode(node,language);
  assert.equal(node.nodeValue,'Hikâye Modu');
});
test('player names and typed input values are never translated',()=>{
  const {GameLocale}=runtime();
  const name={nodeType:3,nodeValue:'Kalkan',parentElement:{closest:()=>true}};
  GameLocale.translateNode(name,'de');assert.equal(name.nodeValue,'Kalkan');
  const input={nodeType:1,tagName:'INPUT',value:'Kalkan',hasAttribute:()=>false};
  GameLocale.translateNode(input,'de');assert.equal(input.value,'Kalkan');
});
test('translation templates retain the same dynamic placeholder set in every language',()=>{
  const s=runtime();
  for(const [key,row] of Object.entries(s.GAME_LOCALES)) {
    const expected=[...new Set(key.match(/\{\d+\}/g)||[])].sort();
    for(const language of ['tr','en','es','de']) {
      assert.equal(typeof row[language],'string',key+' '+language);
      assert.deepEqual([...new Set(row[language].match(/\{\d+\}/g)||[])].sort(),expected,key+' '+language);
    }
  }
});
