// Preserve reviewed bilingual source copy over machine-generated English. Offline only.
// Usage: node extract-localization.cjs > /tmp/inventory.json
//        node refresh-locale-pairs.cjs /tmp/inventory.json
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const file = path.join(__dirname,'..','locales.js');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
const rows = context.window.GAME_LOCALES;
const inventory = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
let corrected = 0;
for (const [key,pair] of Object.entries(inventory)) {
  if (!pair.tr || !pair.en) continue;
  const existing = rows[key];
  const english = rows[pair.en];
  const row = {...existing,tr:pair.tr,en:pair.en};
  for (const lang of ['es','de']) row[lang] = english?.[lang] || existing?.[lang] || pair.en;
  rows[key] = row; corrected++;
}
// Product labels deliberately omit implementation details such as iframe isolation.
for (const values of [
  ['Hikâye Modu','Story Mode','Modo historia','Story-Modus'],
  ['Sonsuz Mod','Endless Mode','Modo infinito','Endlosmodus'],
  ['GÖREVE BAŞLA →','DEPLOY →','INICIAR MISIÓN →','MISSION STARTEN →'],
  ['TEKRAR OYNA ↻','REPLAY ↻','REPETIR ↻','ERNEUT SPIELEN ↻'],
  ['Yenile','Refresh','Actualizar','Aktualisieren'],
  ['Faiz','Interest','Interés','Zinsen'],
  ['Hız','Speed','Velocidad','Geschwindigkeit'],
  ['Ruh Taşı','Soul Stones','Piedras del alma','Seelensteine'],
  ['Prestij','Prestige','Prestigio','Prestige'],
  ['Giriş Yap','Log In','Iniciar sesión','Anmelden'],
  ['Kayıt Ol','Sign Up','Registrarse','Registrieren'],
  ['Liderlik Tablosu','Leaderboard','Clasificación','Bestenliste'],
  ['Unvanlar','Titles','Títulos','Titel'],
  ['Yoldaşlar','Companions','Compañeros','Begleiter'],
  ['Ekipman','Equipment','Equipo','Ausrüstung'],
  ['TAMAMLANDI','COMPLETE','COMPLETADO','ABGESCHLOSSEN'],
  ['🔽 Paneli Gizle','🔽 Hide Panel','🔽 Ocultar panel','🔽 Panel ausblenden'],
  ['🔼 Yükseltmeleri Aç','🔼 Open Upgrades','🔼 Abrir mejoras','🔼 Verbesserungen öffnen'],
  ['%{0} (x{1})','{0}% (x{1})','{0}% (x{1})','{0}% (x{1})'],
  ['%{0} AoE Hasar | {1}px Patlama','{0}% Area Damage | {1}px Blast','{0}% Daño de área | Explosión de {1}px','{0}% Flächenschaden | {1}px Explosion'],
  ['%{0} Faiz','{0}% Interest','{0}% Interés','{0}% Zinsen'],
  ['%{0} Hasar | {1}sn','{0}% Damage | {1}s','{0}% Daño | {1}s','{0}% Schaden | {1}s'],
  ['%{0} Yavaşlatma | %{1} Alan Hasarı','{0}% Slow | {1}% Area Damage','{0}% Ralentización | {1}% Daño de área','{0}% Verlangsamung | {1}% Flächenschaden'],
  ['FİNAL: Üç savunma hattını geç. 180 altını yükseltmelerde kullan.',
   'CLIMAX: Hold three defense lines. Spend your 180 gold on upgrades.',
   'FINAL: Resiste en tres líneas de defensa. Gasta tus 180 de oro en mejoras.',
   'FINALE: Halte drei Verteidigungslinien. Gib deine 180 Gold für Verbesserungen aus.'],
]) {
  const row=Object.fromEntries(['tr','en','es','de'].map((lang,i)=>[lang,values[i]]));
  for(const value of values) rows[value]=row;
}
for(let n=1;n<=27;n++) {
  const row={tr:'GÖREV '+n,en:'MISSION '+n,es:'MISIÓN '+n,de:'MISSION '+n};
  for(const text of Object.values(row)) rows[text]=row;
}
fs.writeFileSync(file,'// Offline public-text catalog. ES/DE prose is machine translated; native review pending.\nwindow.GAME_LOCALES = '+JSON.stringify(rows)+';\n');
console.log('Refreshed source pairs:',corrected);
