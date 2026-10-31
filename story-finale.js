// Chapter 3 finale: shared battle engine, mission-local abilities and owned local checkpoints.
// No currencies, account identities or Endless upgrades are awarded here.
const STORY_FINALE = {
  22: { title: ['Mor sınır', 'The Violet Boundary'], desc: ['Bükülen üç röleyi sabitle ve sınırın iki savunmasını aş.', 'Stabilize three distorted relays and survive two boundary defenses.'], stages: [
    { kind:'combat', kills:10, text:['SINIR SAVUNMASI · 10 düşmanı durdur.', 'BOUNDARY DEFENSE · Defeat 10 hostiles.'] },
    { kind:'action', label:['İLK RÖLEYİ SABİTLE', 'STABILIZE FIRST RELAY'], text:['Röle mekânı büküyor. Piko: Bu mor sinyal benim geleceğim olabilir; ama bir kayıt, geleceğin kanıtı değildir.', 'The relay bends space. Piko: This violet signal could be my future, but a recording is not proof of what will happen.'] },
    { kind:'combat', kills:12, text:['İKİNCİ SINIR · 12 düşmana karşı röle hattını koru.', 'SECOND BOUNDARY · Protect the relay line against 12 hostiles.'] },
    { kind:'action', label:['İKİNCİ RÖLEYİ SABİTLE', 'STABILIZE SECOND RELAY'], text:['İki konum tek bir yola dönüşüyor. Komutan: Bir silahın planını değil, değişebilen bir zihnin izini görüyoruz.', 'Two positions become one route. Commander: We are seeing the trace of a changing mind, not a weapon blueprint.'] },
    { kind:'action', label:['ÜÇÜNCÜ RÖLEYİ KİLİTLE', 'LOCK THIRD RELAY'], text:['Mavi yankı: Henüz dönüşme. Önce hatırlamanın bedelini anlamalısın.', 'Blue Echo: Do not transform yet. First understand the cost of remembering.'] }
  ] },
  23: { title:['Darbenin bedeli', 'What the Pulse Costs'], desc:['Hasarlı sistemleri onar ve Piko’nun hafızası hakkında karar ver.', 'Repair damaged systems and make a choice about Piko’s memory.'], stages:[
    { kind:'combat', kills:8, text:['GERİ BESLEME · 8 düşmanı durdur; Piko darbesini fazla zorladı.', 'FEEDBACK · Defeat 8 hostiles; Piko has overextended its pulse.'] },
    { kind:'action', label:['GÜÇ HATTINI ONAR', 'REPAIR POWER LINE'], text:['Piko: Bir anıyı geri aldım. Ama seninle ilk konuştuğum an bulanıklaştı.', 'Piko: I recovered one memory. But my first conversation with you has become blurred.'] },
    { kind:'combat', kills:6, text:['ONARIMI KORU · 6 düşmanı durdur.', 'PROTECT THE REPAIR · Defeat 6 hostiles.'] },
    { kind:'action', label:['BELLEK HATTINI ONAR', 'REPAIR MEMORY LINE'], text:['Komutan: Her şeyi hatırlamanı istemiyorum. Seçim senin; nasıl biri olduğuna bir arşiv karar vermeyecek.', 'Commander: I am not asking you to remember everything. The choice is yours; an archive will not decide who you are.'] },
    { kind:'action', label:['İLETİŞİMİ ONAR', 'REPAIR COMMUNICATIONS'], text:['Piko: Tam bir geçmiş uğruna şimdi olduğum kişiyi kaybetmekten korkuyorum. Ama bilinmeyen parçayı da merak ediyorum.', 'Piko: I fear losing who I am now for a complete past. But I still want to know the missing piece.'] },
    { kind:'choice', text:['Piko hangi riski kabul edecek? İki yol da devam eder; sonraki savunmada farklı destek sağlar.', 'Which risk will Piko accept? Both paths continue and provide different support in the next defense.'] }
  ] },
  24: { title:['Son savunma protokolü', 'The Last Defense Protocol'], desc:['Üç savunma hattını aş ve merkez arşivin sıfırlanmasını durdur.', 'Survive three defense lines and stop the central archive reset.'], stages:[
    { kind:'combat', kills:10, text:['ARŞİV SAVUNMASI 1/3 · 10 düşmanı durdur.', 'ARCHIVE DEFENSE 1/3 · Defeat 10 hostiles.'] },
    { kind:'action', label:['ÖNCELİK RÖLESİNİ KAPAT', 'DISABLE PRIORITY RELAY'], text:['İstasyon: Savunma ağı bizi personel değil, sıfırlama komutu olarak görüyor.', 'Station: The defense network sees us as a reset command, not personnel.'] },
    { kind:'combat', kills:12, text:['ARŞİV SAVUNMASI 2/3 · 12 düşmanı durdur.', 'ARCHIVE DEFENSE 2/3 · Defeat 12 hostiles.'] },
    { kind:'action', label:['SON HATTI HAZIRLA', 'PREPARE FINAL LINE'], text:['KONTROL NOKTASI · Son savunma hazırlanıyor. Mavi yankı ilk kez kesintisiz görünüyor: Kule biçimi bir zihni koruyabilir; fakat her şeyi aynı bırakamaz.', 'CHECKPOINT · Preparing the final defense. The blue echo appears without glitches: A tower form can preserve a mind, but cannot leave everything unchanged.'] },
    { kind:'combat', kills:14, text:['ARŞİV SAVUNMASI 3/3 · 14 düşmana karşı son kaydı koru.', 'ARCHIVE DEFENSE 3/3 · Protect the last record against 14 hostiles.'] },
    { kind:'action', label:['SIFIRLAMAYI İPTAL ET', 'CANCEL THE RESET'], text:['Komutan: Kim olduğunu bilmiyoruz. Ama burada senin yerine karar verecek kimse yok, Piko.', 'Commander: We do not know what you are. But nobody here will make this decision for you, Piko.'] }
  ] },
  25: { title:['Bir seçimin biçimi', 'The Shape of a Choice'], desc:['Kanıtları gözden geçir ve Piko’nun seçtiği mor biçimi dene.', 'Review the evidence and test the violet form Piko chooses.'], stages:[
    { kind:'action', label:['MAVİ YANKININ KAYDINI İNCELE', 'REVIEW THE BLUE ECHO'], text:['Mavi yankı bir hafıza izi; Piko’nun kendisi olduğunu kanıtlamıyor. Sesi tanıdık bulmak, aynı zihni duyduğun anlamına gelmez.', 'The blue echo is a memory trace; it does not prove it is Piko. A familiar voice does not prove you are hearing the same mind.'] },
    { kind:'action', label:['PİKO’NUN SEÇTİĞİ ADI HATIRLA', 'REMEMBER THE CHOSEN CALL SIGN'], text:['Piko: Arşivde bir görev tanımım var. Ama adımı ben seçtim. Değerim bir silah olmaktan gelmiyor.', 'Piko: The archive gives me a role. But I chose my name. My value does not come from being a weapon.'] },
    { kind:'action', form:'purple', label:['PİKO’NUN KARARINI DİNLE', 'LISTEN TO PIKO’S CHOICE'], text:['Piko: Emir verdiğin için değil. Sizi korumak istediğim için değişmeyi seçiyorum. MOR BİÇİM · Savunma bağlantısı açıldı.', 'Piko: Not because you ordered it. I choose to change because I want to protect you. VIOLET FORM · Defense link unlocked.'] },
    { kind:'ability', label:['SAVUNMA BAĞLANTISINI DENE', 'TEST DEFENSE LINK'], text:['Düşük baskılı deneme: savunma bağlantısı çekirdeğe sınırlı bir kalkan aktarır. Camgöbeği darbe keşif için kullanılmaya devam eder.', 'Low-pressure test: the defense link transfers a limited shield to the core. The cyan pulse remains useful for exploration.'] }
  ] },
  26: { title:['Makinedeki zihin', 'A Mind in the Machine'], desc:['Mor savunma bağlantısını iki farklı çatışmada kullan.', 'Use the violet defense link in two different encounters.'], stages:[
    { kind:'combat', kills:12, ability:true, text:['BAĞLANTI SAVUNMASI · 12 düşmanı durdur. Gerektiğinde savunma bağlantısıyla kalkan kazan.', 'LINK DEFENSE · Defeat 12 hostiles. Use the defense link for a shield when needed.'] },
    { kind:'action', label:['UZAK HATTI EŞLE', 'ALIGN THE REMOTE LINE'], text:['Piko’nun sesi gecikiyor: Ben hâlâ buradayım. Ama aynı sesi duyman, hiçbir şey değişmedi demek değil.', 'Piko’s voice arrives late: I am still here. But hearing the same voice does not mean nothing has changed.'] },
    { kind:'combat', kills:14, ability:true, text:['UZAK SAVUNMA · 14 düşmanı durdur; bağlantının bekleme süresini takip et.', 'REMOTE DEFENSE · Defeat 14 hostiles and watch the link cooldown.'] },
    { kind:'ability', label:['SON HATTI BAĞLA', 'LINK THE FINAL LINE'], text:['Piko: İstasyonun bir parçasına dönüşmedim. Onunla konuşmanın başka bir yolunu buldum.', 'Piko: I have not become part of the station. I found another way to speak to it.'] }
  ] },
  27: { title:['Hatırlayan kule', 'The Tower That Remembers'], desc:['Çöken ağda arşivi ve ekibini koruyarak ilk hikâye yayını tamamla.', 'Protect the archive and crew through the collapsing network to finish the first story arc.'], stages:[
    { kind:'combat', kills:12, ability:true, text:['AĞ ÇÖKÜŞÜ 1/3 · 12 düşmanı durdur ve arşiv hattını koru.', 'NETWORK COLLAPSE 1/3 · Defeat 12 hostiles and protect the archive line.'] },
    { kind:'action', label:['SİVİL HATTI GÜVENE AL', 'SECURE THE CREW LINE'], text:['Komutan: Önce ekip. Hiçbir kayıt, yaşayanların yerini tutmaz.', 'Commander: The crew first. No record can replace the living.'] },
    { kind:'combat', kills:14, ability:true, text:['AĞ ÇÖKÜŞÜ 2/3 · 14 düşmana karşı çekirdeği koru.', 'NETWORK COLLAPSE 2/3 · Protect the core against 14 hostiles.'] },
    { kind:'action', form:'tower', label:['PİKO’NUN ÇAPASINI SABİTLE', 'STABILIZE PIKO’S ANCHOR'], text:['KONTROL NOKTASI · Piko: Bu kez bir kule biçiminde tutunacağım. Buradayım; sadece kelimeler yerine darbelerle cevap verebilirim.', 'CHECKPOINT · Piko: I will hold on in a tower form this time. I am here; I may answer with pulses instead of words.'] },
    { kind:'combat', kills:18, ability:true, text:['SON NÖBET 3/3 · 18 düşmanı durdur ve bilinç çapasını koru.', 'FINAL WATCH 3/3 · Defeat 18 hostiles and protect the mind anchor.'] },
    { kind:'action', label:['ARŞİVİ KURTAR · HİKÂYEYİ TAMAMLA', 'SAVE THE ARCHIVE · FINISH THE STORY'], text:['Arşiv kurtuldu. Piko iki kısa darbeyle yanıt veriyor. Mavi yankının son kimlik parçası eksik; ama bu kez kimin geri dönmeyi seçtiğini biliyorsun.', 'The archive survives. Piko answers with two short pulses. The blue echo’s final identity fragment is missing, but this time you know who chose to return.'] }
  ] }
};
for (const [number, definition] of Object.entries(STORY_FINALE)) {
  STORY_UI_COPY['mission'+number+'tag'] = ['GÖREV '+number, 'MISSION '+number];
  STORY_UI_COPY['mission'+number+'title'] = definition.title;
  STORY_UI_COPY['mission'+number+'desc'] = definition.desc;
}

function finaleCopy(pair) { return pair[storyLanguage() === 'en' ? 1 : 0]; }
function storyCheckpointOwner() { return currentUser?.uid || localStorage.getItem(STORY_PROGRESS_OWNER_KEY) || 'guest'; }
function storyCheckpointKey(mission) { return 'TowerV1_StoryCheckpointV1:' + storyCheckpointOwner() + ':' + mission; }
function setFinaleText(id, text) { const node = document.getElementById(id); if (node) node.textContent = text; }
function setFinaleVisible(id, visible) { const node = document.getElementById(id); if (node) node.hidden = !visible; }
function initializeStoryFinale() {
  const session = GameModeRuntime.storySession, def = STORY_FINALE[session.mission];
  if (!def) return;
  session.finaleStage = 0; session.finaleCooldown = 0;
  session.finaleForm = session.mission >= 26 ? 'purple' : 'cyan';
  try {
    const checkpoint = JSON.parse(localStorage.getItem(storyCheckpointKey(session.mission)) || 'null');
    if (!getStoryProgress()['mission' + session.mission + 'Complete'] && checkpoint?.owner === storyCheckpointOwner() &&
        Number.isInteger(checkpoint.stage) && checkpoint.stage >= 0 && checkpoint.stage < def.stages.length) {
      session.finaleStage = checkpoint.stage;
      session.finaleForm = ['cyan','purple','tower'].includes(checkpoint.form) ? checkpoint.form : session.finaleForm;
    }
  } catch (_) {}
  session.companionSynced = true;
  if (session.mission === 24 && getStoryProgress().stabilityChoice === 'recover') game.upgrades.damage += 1;
  enterStoryFinaleStage();
}
function enterStoryFinaleStage() {
  const s = GameModeRuntime.storySession, def = STORY_FINALE[s.mission], stage = def?.stages[s.finaleStage];
  if (!stage || s.completed) return;
  if (stage.form) s.finaleForm = stage.form;
  s.finaleCooldown = 0;
  enemies = []; projectiles = [];
  s.phase = stage.kind === 'combat' ? 'combat' : 'finaleAction';
  isPaused = stage.kind !== 'combat';
  if (stage.kind === 'combat') {
    startStoryChapter2CombatStage(stage.kills, stage.text[0], stage.text[1]);
    tower.maxHp = getTowerMaxHp(); tower.hp = tower.maxHp;
    tower.maxShield = getTowerMaxShield(); tower.shield = tower.maxShield;
  }
  try { localStorage.setItem(storyCheckpointKey(s.mission), JSON.stringify({ owner: storyCheckpointOwner(), stage:s.finaleStage, form:s.finaleForm })); } catch (_) {}
  setFinaleText('story-battle-status', finaleCopy(stage.text));
  setStoryComms('PİKO','PIKO', def.title[0], def.title[1]);
  setFinaleVisible('story-finale-action', stage.kind === 'action');
  setFinaleVisible('story-finale-ability', stage.kind === 'ability' || stage.ability === true);
  setFinaleVisible('story-finale-choices', stage.kind === 'choice');
  setFinaleText('story-finale-action', finaleCopy(stage.label || ['DEVAM ET','CONTINUE']));
  setFinaleText('story-companion-state', finaleCopy(s.finaleForm === 'tower' ? ['KULE ÇAPASI · BİLİNÇ BAĞLI','TOWER ANCHOR · MIND LINKED'] : s.finaleForm === 'purple' ? ['MOR BİÇİM · SAVUNMA BAĞLANTISI','VIOLET FORM · DEFENSE LINK'] : ['CAMGÖBEĞİ · KEŞİF DARBESİ','CYAN · EXPLORATION PULSE']));
  syncPlaybackControls(); updateStoryFinaleAbilityUI();
}
function advanceStoryFinale(choice = null) {
  const s = GameModeRuntime.storySession, def = STORY_FINALE[s.mission], stage = def?.stages[s.finaleStage];
  if (!s.active || s.completed || !stage) return;
  if (stage.kind === 'combat' && (s.phase !== 'combat' || game.waveKills < stage.kills)) return;
  if (stage.kind !== 'combat' && (s.phase !== 'finaleAction' || !isPaused)) return;
  if (stage.kind === 'choice' && !['preserve','recover'].includes(choice)) return;
  if (stage.kind === 'ability' && !s.finaleAbilityConfirmed) return;
  if (choice) saveStoryProgress({ stabilityChoice:choice });
  s.finaleAbilityConfirmed = false;
  s.finaleStage++;
  if (s.finaleStage < def.stages.length) { enterStoryFinaleStage(); return; }
  s.completed = true; s.phase = 'complete'; isPaused = true; enemies = []; projectiles = [];
  saveStoryProgress({ ['mission' + s.mission + 'Complete']:true, chapter:3,
    companionForm:s.mission >= 27 ? 'tower' : s.mission >= 25 ? 'purple' : getStoryProgress().companionForm });
  try { localStorage.removeItem(storyCheckpointKey(s.mission)); } catch (_) {}
  for (const id of ['story-finale-action','story-finale-ability','story-finale-choices']) setFinaleVisible(id, false);
  showStoryMissionResult(); syncPlaybackControls();
}
function continueStoryFinale() {
  const s = GameModeRuntime.storySession, stage = STORY_FINALE[s.mission]?.stages[s.finaleStage];
  if (stage?.kind === 'action') advanceStoryFinale();
}
function chooseStoryFinaleMemory(choice) {
  const s = GameModeRuntime.storySession, stage = STORY_FINALE[s.mission]?.stages[s.finaleStage];
  if (stage?.kind === 'choice') advanceStoryFinale(choice);
}
function activateStoryDefenseLink() {
  const s = GameModeRuntime.storySession, stage = STORY_FINALE[s.mission]?.stages[s.finaleStage];
  if (!s.active || s.completed || s.finaleCooldown > 0 || !['purple','tower'].includes(s.finaleForm) ||
      (!stage?.ability && stage?.kind !== 'ability')) return;
  tower.maxShield = getTowerMaxShield();
  tower.shield = Math.min(tower.maxShield, tower.shield + Math.ceil(tower.maxHp * 0.25));
  s.pulseVisualAt = performance.now(); s.finaleCooldown = 10;
  s.finaleAbilityConfirmed = true;
  if (stage.kind === 'ability') advanceStoryFinale();
  updateStoryFinaleAbilityUI(); updateHUD();
}
function updateStoryFinaleAbilityUI() {
  const s = GameModeRuntime.storySession;
  const node = document.getElementById('story-finale-ability');
  if (!node) return;
  node.disabled = s.finaleCooldown > 0;
  node.textContent = finaleCopy(['SAVUNMA BAĞLANTISI','DEFENSE LINK']) + (s.finaleCooldown > 0 ? ' · ' + Math.ceil(s.finaleCooldown) + 's' : '');
}
function tickStoryFinale(dt) {
  const s = GameModeRuntime.storySession;
  if (!STORY_FINALE[s.mission] || !s.active || s.completed) return;
  const before = Math.ceil(s.finaleCooldown || 0);
  s.finaleCooldown = Math.max(0, (s.finaleCooldown || 0) - dt);
  if (Math.ceil(s.finaleCooldown) !== before) updateStoryFinaleAbilityUI();
}
function getStoryFinaleShieldBonus() {
  if (typeof GameModeRuntime === 'undefined' || !GameModeRuntime.isStoryActive()) return 0;
  const s = GameModeRuntime.storySession;
  return ['purple','tower'].includes(s.finaleForm) ? Math.ceil(getTowerMaxHp() * 0.35) : (s.mission === 24 && getStoryProgress().stabilityChoice === 'preserve' ? 40 : 0);
}
function legacyStoryCloudPayload(payload) {
  const copy = { ...payload };
  for (let n=22; n<=27; n++) delete copy['mission'+n+'Complete'];
  delete copy.stabilityChoice;
  if (['purple','tower'].includes(copy.companionForm)) copy.companionForm = 'cyan';
  return copy;
}
function preserveLocalFinaleProgress(remote, local, raw) {
  if (!local) return;
  for (let n=22; n<=27; n++) {
    const key = 'mission'+n+'Complete';
    if (!(key in raw)) remote[key] = local[key] === true;
  }
  if (!('stabilityChoice' in raw)) {
    remote.stabilityChoice = local.stabilityChoice;
    if (['purple','tower'].includes(local.companionForm)) remote.companionForm = local.companionForm;
  }
}

function updateStoryFinaleBoard(progress) {
  for (const [number, definition] of Object.entries(STORY_FINALE)) {
    const n = Number(number), unlocked = progress['mission'+(n-1)+'Complete'] === true, done = progress['mission'+n+'Complete'] === true;
    const button = document.getElementById('story-start-mission'+n), status = document.getElementById('story-mission-'+n+'-status');
    if (button) { button.disabled = !unlocked; button.textContent = finaleCopy(done ? ['TEKRAR OYNA ↻','REPLAY ↻'] : ['GÖREVE BAŞLA →','DEPLOY →']); }
    if (status) { status.classList.toggle('is-locked', !unlocked && !done); status.textContent = finaleCopy(done ? ['TAMAMLANDI','COMPLETE'] : unlocked ? ['OYNANABİLİR GÖREV','PLAYABLE MISSION'] : ['ÖNCEKİ GÖREVİ TAMAMLA','COMPLETE PREVIOUS MISSION']); }
  }
}
