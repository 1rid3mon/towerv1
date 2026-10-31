// Static, offline localization. No translation requests or player data leave the browser.
(function attachGameLocale(root) {
  'use strict';
  const languages = ['tr','en','es','de'];
  const originals = new WeakMap();
  const cache = new Map();
  let templates = null;
  const normalize = value => value.replace(/\s+/g, ' ').trim();
  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function current() {
    try { const language = root.localStorage.getItem('towerDefenseLanguage'); return languages.includes(language) ? language : 'tr'; }
    catch (_) { return 'tr'; }
  }
  function catalog() { return root.GAME_LOCALES || {}; }
  function compileTemplates() {
    return Object.entries(catalog()).filter(([key]) => /\{\d+\}/.test(key)).map(([key, row]) => {
      const slots = [];
      const pattern = key.split(/(\{\d+\})/).map(part => {
        if (/^\{\d+\}$/.test(part)) { slots.push(part); return '(.+?)'; }
        return escape(part);
      }).join('');
      return { pattern:new RegExp('^'+pattern+'$','u'), slots, row, length:key.length };
    }).sort((a,b) => b.length-a.length);
  }
  function translate(value, language = current()) {
    if (typeof value !== 'string' || !languages.includes(language)) return value;
    const text = normalize(value), key = language+'|'+text;
    if (!text || !/\p{L}/u.test(text)) return value;
    if (cache.has(key)) return cache.get(key);
    const rows = catalog();
    let output = Object.prototype.hasOwnProperty.call(rows,text) ? rows[text][language] : null;
    if (!output) {
      templates ||= compileTemplates();
      for (const template of templates) {
        const match = text.match(template.pattern);
        if (!match) continue;
        output = template.row[language];
        if (!output) break;
        template.slots.forEach((slot,index) => { output = output.split(slot).join(match[index+1]); });
        break;
      }
    }
    if (!output && language !== 'tr') {
      output = text.replace(/\p{L}+(?:['’]\p{L}+)*/gu, word => {
        const row = rows[word]; return row && Object.prototype.hasOwnProperty.call(rows,word) ? (row[language] || word) : word;
      });
    }
    output ||= value;
    if (cache.size > 3000) cache.clear();
    cache.set(key, output);
    return output;
  }
  function translateNode(node, language) {
    if (!node) return;
    if (node.nodeType === 3) {
      if (node.parentElement?.closest('[data-no-i18n], #ui-account-name, #language-select')) return;
      const previous = originals.get(node);
      const source = previous && node.nodeValue === previous.output ? previous.source : node.nodeValue;
      if (!source.trim()) return;
      const output = source.match(/^\s*/)[0] + translate(source.trim(),language) + source.match(/\s*$/)[0];
      originals.set(node,{source,output});
      if (node.nodeValue !== output) node.nodeValue = output;
      return;
    }
    if (node.nodeType !== 1 || ['SCRIPT','STYLE','NOSCRIPT','OPTION'].includes(node.tagName) || node.hasAttribute('data-no-i18n')) return;
    for (const attribute of ['placeholder','title','aria-label']) {
      if (!node.hasAttribute(attribute)) continue;
      const key = '__locale_' + attribute;
      const previous = originals.get(node) || {};
      const now = node.getAttribute(attribute);
      const record = previous[key];
      const source = record && record.output === now ? record.source : now;
      const output = translate(source,language);
      previous[key] = {source,output}; originals.set(node,previous);
      if (now !== output) node.setAttribute(attribute,output);
    }
    if (!['INPUT','TEXTAREA'].includes(node.tagName)) for (const child of node.childNodes) translateNode(child,language);
  }
  root.GameLocale = Object.freeze({ languages, current, translate, translateNode });
  for (const method of ['alert','confirm','prompt']) {
    if (typeof root[method] !== 'function') continue;
    const native = root[method].bind(root);
    root[method] = (text,...args) => native(translate(text),...args);
  }
  if (root.CanvasRenderingContext2D) {
    for (const method of ['fillText','strokeText','measureText']) {
      const native = root.CanvasRenderingContext2D.prototype[method];
      root.CanvasRenderingContext2D.prototype[method] = function(text,...args) {
        return native.call(this,translate(text),...args);
      };
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
