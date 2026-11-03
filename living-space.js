/* LOST SIGNAL V6 - decorative background, no combat state changes */
(function () {
  'use strict';
  const STORE = 'towerv1_living_space_quality_v1';
  const OPTIONS = ['off', 'low', 'high'];
  let quality = 'low';
  try { const saved = localStorage.getItem(STORE); if (OPTIONS.includes(saved)) quality = saved; } catch (_) {}
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  const particles = [];
  let seed = 41873, lastWidth = 0, lastHeight = 0, lastQuality = '';
  const rand = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const reset = (w, h, q) => {
    particles.length = 0; seed = 41873;
    const count = q === 'high' ? Math.min(80, Math.floor(w * h / 12000)) : Math.min(28, Math.floor(w * h / 25000));
    for (let i = 0; i < count; i++) particles.push({ x: rand(), y: rand(), r: .35 + rand() * .85, a: .14 + rand() * .28, drift: .6 + rand() * .9 });
    lastWidth = w; lastHeight = h; lastQuality = q;
  };
  const colorFor = theme => ({snow:'#b6d4e3', frost:'#b6d4e3', desert:'#d8b88e', space:'#b9a6d6', nebula:'#b9a6d6', bubblegum:'#e8b4d0', aurora:'#a2c8cb', cyber:'#9eafbc'})[theme] || '#aab7c2';
  const draw = (c, w, h, theme, wave, timestamp) => {
    if (quality === 'off' || w <= 0 || h <= 0) return;
    const motion = !(reduced && reduced.matches);
    if (w !== lastWidth || h !== lastHeight || quality !== lastQuality) reset(w, h, quality);
    const t = motion ? timestamp / 1000 : 0;
    const hue = colorFor(theme);
    c.save();
    // Distant points are muted and do not compete with enemies.
    for (const p of particles) {
      const x = ((p.x * w + t * p.drift * .75) % w + w) % w;
      const y = p.y * h;
      c.globalAlpha = p.a;
      c.fillStyle = hue;
      c.fillRect(x, y, p.r, p.r);
    }
    // One small wreck silhouette; only in the outer 16% of the battlefield.
    if (quality === 'high' && w > 480 && h > 340) {
      const x = w * .89 + (motion ? Math.sin(t * .016) * 4 : 0), y = h * .18;
      c.translate(x, y); c.rotate(-.25);
      c.globalAlpha = .15; c.fillStyle = '#70828d'; c.strokeStyle = '#a6b5bd'; c.lineWidth = 1;
      c.fillRect(-15,-6,30,12); c.strokeRect(-15,-6,30,12);
      c.fillRect(-37,-12,16,24); c.fillRect(21,-12,16,24);
      c.beginPath(); c.moveTo(-21,0); c.lineTo(21,0); c.stroke();
      c.beginPath(); c.arc(0,0,4,0,Math.PI*2); c.stroke();
    }
    c.restore();
  };
  const setQuality = q => {
    if (!OPTIONS.includes(q)) return;
    quality = q;
    try { localStorage.setItem(STORE, q); } catch (_) {}
    const el = document.getElementById('ls-space-quality'); if (el) el.value = q;
  };
  const mountControl = () => {
    if (document.getElementById('ls-space-quality')) return;
    const settings = document.getElementById('mode-main-menu');
    if (!settings) return;
    const bar = document.createElement('label');
    bar.id = 'ls-space-setting';
    bar.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;margin:10px auto;color:#aab9c5;font:500 12px system-ui,sans-serif;';
    bar.textContent = 'Uzay arka planı';
    const select = document.createElement('select');
    select.id = 'ls-space-quality';
    select.setAttribute('aria-label','Uzay arka planı detay seviyesi');
    select.style.cssText = 'background:#1a2530;color:#e0e8ec;border:1px solid #53606a;border-radius:4px;padding:5px;';
    [['off','Kapalı'],['low','Düşük'],['high','Yüksek']].forEach(([value, name]) => { const option = document.createElement('option'); option.value = value; option.textContent = name; select.appendChild(option); });
    select.value = quality;
    select.addEventListener('change', () => setQuality(select.value));
    bar.appendChild(select);
    const tools = settings.querySelector('.mode-menu-tools');
    if (tools) tools.insertAdjacentElement('afterend',bar); else settings.appendChild(bar);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountControl, {once:true}); else mountControl();
  window.LostSignalLivingSpace = Object.freeze({ draw, setQuality, getQuality: () => quality });
})();
