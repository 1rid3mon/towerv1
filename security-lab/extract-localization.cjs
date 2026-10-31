// Build a public-text inventory; no account data or runtime saves are read.
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const root = path.resolve(__dirname, '..');
const entries = new Map();
const normalize = text => text.replace(/\s+/g, ' ').trim();
function useful(text) {
  return typeof text === 'string' && /\p{L}/u.test(text) && text.length < 1800 &&
    !/https?:|=>|querySelector|\b(?:rgba|padding|position|display|function|return)\s*[:(]/.test(text) &&
    !/[<>]|^[.#]|[a-z][A-Z][a-z]/.test(text) &&
    (/\s|[çğıöşüÇĞİÖŞÜ]/.test(text) || /^\p{Lu}[\p{L}\p{P}\p{S}\d -]+$/u.test(text) || /^[A-Z\d\p{P}\p{S} ]+$/u.test(text));
}
function add(text, pair) {
  if (!useful(text)) return;
  const key = normalize(text);
  if (pair) entries.set(key, { tr:normalize(pair.tr), en:normalize(pair.en) });
  else if (!entries.has(key)) entries.set(key, { source:key });
}
function pair(tr, en) {
  if (!tr || !en) return;
  if (/[çğıöşüÇĞİÖŞÜ]/.test(en) && !/[çğıöşüÇĞİÖŞÜ]/.test(tr)) [tr,en] = [en,tr];
  add(tr, {tr,en}); add(en, {tr,en});
}
function value(node) {
  if (node?.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node?.type === 'TemplateLiteral') return node.quasis.map((q,i) => q.value.cooked + (i < node.expressions.length ? '{'+i+'}' : '')).join('');
  return null;
}
function visit(node, source) {
  if (!node || typeof node !== 'object') return;
  const text = value(node);
  if (text) {
    if (text.includes('<')) {
      for (const part of text.replace(/<[^>]*>/g,'\n').split('\n')) add(part);
    } else add(text);
  }
  if (node.type === 'ArrayExpression' && node.elements.length === 2) pair(value(node.elements[0]),value(node.elements[1]));
  if (node.type === 'ArrayExpression' && node.elements.length === 4) {
    pair(value(node.elements[0]),value(node.elements[1]));
    pair(value(node.elements[2]),value(node.elements[3]));
  }
  if (node.type === 'ArrayExpression' && node.elements.length === 7 && typeof node.elements[0]?.value === 'number') {
    pair(value(node.elements[4]),value(node.elements[3]));
    pair(value(node.elements[6]),value(node.elements[5]));
  }
  if (node.type === 'ObjectExpression') {
    const props = Object.fromEntries(node.properties.filter(p => p.type === 'Property').map(p => [p.key.name || p.key.value,value(p.value)]));
    if (props.tr && props.en) pair(props.tr,props.en);
    for (const p of node.properties) if (p.type === 'Property' && typeof p.key.value === 'string' && value(p.value)) pair(p.key.value,value(p.value));
  }
  if (node.type === 'ConditionalExpression' && /(?:===|!==)\s*['"]en['"]/.test(source.slice(node.test.start,node.test.end))) {
    pair(value(node.alternate),value(node.consequent));
  }
  if (node.type === 'CallExpression' && node.callee?.name === 'setStoryComms' && node.arguments.length === 4) {
    pair(value(node.arguments[0]),value(node.arguments[1]));pair(value(node.arguments[2]),value(node.arguments[3]));
  }
  for (const [key, child] of Object.entries(node)) {
    if ((key === 'value' && node.type === 'Literal') || key === 'regex') continue;
    if (Array.isArray(child)) child.forEach(n => visit(n,source));
    else if (child && typeof child === 'object') visit(child,source);
  }
}
for (const name of ['data.js','ui.js','story.js','story-finale.js','engine.js','render.js']) {
  const source = fs.readFileSync(path.join(root,name),'utf8');
  visit(acorn.parse(source,{ecmaVersion:'latest'}),source);
}
const html = fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g,'');
for (const text of html.replace(/<[^>]*>/g,'\n').split('\n')) add(text.replace(/&amp;/g,'&'));
for (const match of html.matchAll(/(?:aria-label|title|placeholder)="([^"]+)"/g)) add(match[1]);
process.stdout.write(JSON.stringify(Object.fromEntries([...entries].sort()),null,2));
