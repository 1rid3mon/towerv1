// Hikâye Modu denetleyicisi.
// Ortak oyun motoru, Endless UI, Firebase altyapısı ve Piko'nun temel etkileşimi ui.js/engine.js/render.js içinde kalır.
// Bu dosya index.html'de ui.js sonrasında, render.js ve engine.js öncesinde yüklenir.

// Story progress is deliberately isolated from the existing Endless save.
const STORY_PROGRESS_KEY = 'towerDefenseStoryProgressV1';
const STORY_PROGRESS_OWNER_KEY = 'towerDefenseStoryProgressOwnerV1';
const STORY_DIALOGUES = [
 {speaker:{tr:'İSTASYON YAPAY ZEKÂSI',en:'STATION AI'},text:{tr:'Komutan, istasyona ulaştık. Yaşam belirtisi yok. Bütün sistemler biz yaklaşınca kapandı; sanki gelişimizi bekliyorlardı.',en:'Commander, we have reached the station. No life signs. Every system shut down as we approached—as if they were waiting for us.'}},
 {speaker:{tr:'MAVİ HOLOGRAM',en:'BLUE HOLOGRAM'},text:{tr:'Bağlantı… kuruldu. Sonunda geldiniz, komutan.',en:'Connection… established. You finally made it, Commander.'}},
 {speaker:{tr:'KOMUTAN',en:'COMMANDER'},text:{tr:'Beni tanıyor musun? Sen kimsin? Bu istasyonda ne oldu?',en:'Do you know me? Who are you? What happened here?'}},
 {speaker:{tr:'MAVİ HOLOGRAM',en:'BLUE HOLOGRAM'},text:{tr:'Ben… senin yanında… Sinyali takip etme. Çekirdek…',en:'I was… beside you… Do not follow the signal. The core…'}},
 {speaker:{tr:'İSTASYON YAPAY ZEKÂSI',en:'STATION AI'},text:{tr:'Görüntü kaynağı canlı değil. Bu, kayıtlarla eşleşmeyen bozuk bir hafıza yankısı. Kimden kaldığını belirleyemiyorum.',en:'The image source is not live. It is a corrupted memory echo with no matching identity record. I cannot determine whose memory it came from.'}},
 {speaker:{tr:'KOMUTAN',en:'COMMANDER'},text:{tr:'O zaman çekirdeğin yanındaki şey ne? Hareket ediyor.',en:'Then what is that thing beside the core? It is moving.'}},
 {speaker:{tr:'İSTASYON YAPAY ZEKÂSI',en:'STATION AI'},text:{tr:'Eski tip bakım yoldaşı. Gücü neredeyse tükenmiş; silah sistemi yok. Yine de çekirdek onu tanıdı… ve yeniden başlattı.',en:'An old maintenance companion. Almost out of power; no weapons installed. Yet the core recognized it… and restarted it.'}},
 {speaker:{tr:'MAVİ HOLOGRAM',en:'BLUE HOLOGRAM'},text:{tr:'Beni… hatırladığında… mor ışık… kuleler…',en:'When you… remember me… violet light… towers…'}},
 {speaker:{tr:'İSTASYON YAPAY ZEKÂSI',en:'STATION AI'},text:{tr:'Dış savunma hattında düşman teması! Bakım yoldaşı çekirdeğe bağlandı. Komutan, savunmayı şimdi etkinleştirmeliyiz.',en:'Hostile contacts on the outer defense line! The maintenance companion has linked to the core. Commander, we must activate the defenses now.'}}
];
const STORY_UI_COPY = {
 protocol:['HİKÂYE PROTOKOLÜ · 01','STORY PROTOCOL · 01'],
 return:['← ANA MENÜ','← MAIN MENU'], chapter:['BÖLÜM 01 · KAYIP SİNYAL','CHAPTER 01 · LOST SIGNAL'],
 heading:['Kayıp Sinyal','Lost Signal'],
 lead:['Uzak bir istasyon sessizliğe gömüldü. Son sinyal, savunma çekirdeğinin içinden geliyor.','A remote station has fallen silent. Its last signal is coming from inside the defense core.'],
 campaignsub:['İstasyonun gizemini adım adım çöz.','Unravel the station’s mystery, one mission at a time.'],
 mission1tag:['GÖREV 01','MISSION 01'], mission1title:['Savunmayı etkinleştir','Activate the defense'],
 mission1desc:['Kule çekirdeğini çevrimiçi duruma getir ve istasyonun savunma protokolünü öğren.','Bring the tower core online and learn the station’s defense protocol.'],
 mission2tag:['GÖREV 02','MISSION 02'], mission2title:['İlk temas','First contact'],
 mission2desc:['Devriye saldırısını durdur, ardından üç sinyal izini tara.','Stop the patrol, then scan three signal traces.'],
 mission3tag:['GÖREV 03','MISSION 03'], mission3title:['Sinyalin kaynağı','Source of the signal'],
 mission3desc:['Sinyalin kaynağını araştır: anten verisini mi, karakutu kaydını mı inceleyeceksin?','Investigate the signal source: will you inspect antenna data or the black-box log.'],
 arrayChoice:['ANTEN VERİSİ','ANTENNA DATA'], blackboxChoice:['KARAKUTU KAYDI','BLACK-BOX LOG'],
 mission4tag:['GÖREV 04','MISSION 04'], mission4title:['Güç dağıtımı','Power Priority'],
 mission4desc:['İki sistemden birine önce güç ver: savunma kalkanı mı, silah kalibrasyonu mu?','Prioritize one system: defensive shielding or weapon calibration?'],
 shieldChoice:['KALKANI ONAR','RESTORE SHIELDS'], weaponChoice:['SİLAHI KALİBRE ET','CALIBRATE WEAPONS'],
 mission5tag:['GÖREV 05','MISSION 05'], mission5title:['Kırık hat','The Broken Line'],
 mission5desc:['Seçtiğin sistemin avantajıyla koridoru savun ve sinyal rölesini devre dışı bırak.','Use your chosen system’s advantage to defend the corridor and disable the signal relay.'], relayAction:['SİNYAL RÖLESİNİ KAPAT','DISABLE SIGNAL RELAY'],
 mission6tag:['GÖREV 06','MISSION 06'], mission6title:['Bölmenin ötesinde','Beyond the Bulkhead'],
 mission6desc:['Yoldaşınla hasarlı bakım bölümünden geç ve üç bağlantıyı onar.','Cross the damaged maintenance sector with your companion and repair three connections.'],
 repairAction:['BAĞLANTIYI ONAR','REPAIR CONNECTION'],
 mission7tag:['GÖREV 07','MISSION 07'], mission7title:['Sinyal bükülüyor','The Signal Bends'],
 mission7desc:['Haberleşme dizisini savun ve sinyal yükselticisini sustur.','Defend the communications array and silence the signal amplifier.'],
 amplifierAction:['YÜKSELTİCİYİ DEVRE DIŞI BIRAK','DISABLE AMPLIFIER'],
 mission8tag:['GÖREV 08','MISSION 08'], mission8title:['Tanıdık oda','A Familiar Room'],
 mission8desc:['Başlangıç bölmesine dön ve bozuk yankıyla üç fiziksel izi karşılaştır.','Return to the opening chamber and compare three physical clues with the corrupted echo.'],
 memoryAction:['HAFIZA İZİNİ İNCELE','INSPECT MEMORY TRACE'],
 mission9tag:['GÖREV 09','MISSION 09'], mission9title:['Uyanmayı seçmek','The Choice to Wake'],
 mission9desc:['Çekirdeği koru, yoldaşla bağlantıyı yeniden kur ve gerçek biçimini uyandır.','Protect the core, reconnect with the companion, and awaken its true form.'],
 mission10tag:['GÖREV 10','MISSION 10'], mission10title:['Aşağıdaki kapı','The Door Below'],
 mission10desc:['İstasyonun planlarında olmayan kapıyı araştır; camgöbeği darbeyle iki gizli düğümü açığa çıkar.','Investigate a door missing from the station schematics; use the cyan pulse to reveal two hidden nodes.'],
 chapter2label:['BÖLÜM 02','CHAPTER 02'], chapter2title:['Sinyalin Altında','Beneath the Signal'], chapter2desc:['İstasyonun kayıtlarından eski bir şey uyanıyor.','Something older than the station records is waking.'],
 mission11tag:['GÖREV 11','MISSION 11'], mission11title:['Aşağıdaki istasyona iniş','Descent to the Lower Station'],
 mission11desc:['Alt ağın üç kadim rölesini bul ve Piko’nun çekirdeğiyle bağlantılarını çöz.','Find the three ancient relays in the lower network and uncover their link to Piko’s core.'],
  mission12tag:['GÖREV 12','MISSION 12'], mission12title:['İmkânsız arşiv','The Impossible Archive'],
  mission12desc:['Piko’nun çekirdeğinden eski üç kaydı incele; son kayıt geleceğe ait olabilir.','Inspect three records older than Piko’s core; the final file may come from the future.'],
 mission13tag:['GÖREV 13','MISSION 13'], mission13title:['İnsan sesi','The Human Voice'], mission13desc:['Piko’nun ses izinin insan kaydıyla eşleşmesini araştır ve çelişen iki kayıttan birine güven.','Investigate why Piko’s voiceprint matches a human recording and choose which conflicting record to trust.'],
 mission14tag:['GÖREV 14','MISSION 14'], mission14title:['Çekirdeğin ötesi','Beyond the Core'], mission14desc:['İstasyon savunmasını aş, çekirdek kilitlerini sırayla çöz ve Piko’ya ulaşan sinyalin kaynağını bul.','Break through the station defense, unlock the core seals, and trace the signal reaching Piko.'],
 mission15tag:['GÖREV 15','MISSION 15'], mission15title:['Dinlemenin bedeli','The Cost of Listening'], mission15desc:['Sinyal darbesinin Piko’da bıraktığı hasarı gider; kaybolan anıyı saklamadığına tanık ol.','Repair the feedback damage caused by the pulse and witness Piko admit the memory it lost.'],
 mission16tag:['GÖREV 16','MISSION 16'], mission16title:['Sahte çıkış','The False Exit'], mission16desc:['Aynı odaya dönen yolu çöz ve alt ağın döngüsünü kır.','Trace the looping route and break the lower network’s cycle.'],
 mission17tag:['GÖREV 17','MISSION 17'], mission17title:['Arşivdeki isim','The Name in the Archive'], mission17desc:['Çelişen kayıtları incele ve Piko’nun kendi çağrı adını seçmesine izin ver.','Inspect conflicting records and let Piko choose its own call sign.'],
 mission18tag:['GÖREV 18','MISSION 18'], mission18title:['Kilit seni tanıyor','The Lock That Knows You'], mission18desc:['Üç savunma aşamasını tamamla ve komutanın geçmişine açılan kilidi çöz.','Complete three defense stages and open the lock tied to the commander’s past.'], chapter3heading:['BÖLÜM 03 · HAFIZANIN BİÇİMİ','CHAPTER 03 · THE SHAPE OF MEMORY'], chapter3desc:['Mor sinyalin çağırdığı yapıya yaklaş. Piko’nun kimliği, kendi seçtiği adın ötesine uzanıyor.','Approach the structure answering the violet signal. Piko’s identity reaches beyond the name it chose.'], mission19tag:['GÖREV 19','MISSION 19'], mission19title:['İmkânsız yörünge','The Impossible Orbit'], mission19desc:['Mor sinyali takip et ve aynı anda iki yerde görünen yapının rotasını çöz.','Follow the violet signal and chart a structure appearing in two places at once.'], mission20tag:['GÖREV 20','MISSION 20'], mission20title:['Sessiz filo','The Quiet Fleet'], mission20desc:['Kadim savunma platformlarını uyandırmadan alanı geç; darbeyi seçerek kullan.','Cross dormant defense platforms without waking the field; use the pulse selectively.'], mission21tag:['GÖREV 21','MISSION 21'], mission21title:['Kaybettiğimiz isim','The Name We Lost'], mission21desc:['Arşiv parçalarını birleştir ve Piko’nun rolüyle kimliği arasındaki farkı keşfet.','Rebuild the archive fragments and discover the difference between Piko’s role and identity.'],
 pulseMission10Action:['SİNYAL DARBESİ','SIGNAL PULSE'],
 reconnectAction:['BAĞLANTIYI YENİDEN KUR','RECONNECT TO COMPANION'], awakenAction:['YOLDAŞI UYANDIR','AWAKEN COMPANION'], pulseAction:['SİNYAL DARBESİNİ DENE','TEST SIGNAL PULSE'],

 nextstep:['Sıradaki adım','Next step'], nextdesc:['Piko’nun geçmişiyle ilgili çelişkiler büyüyor. Sonraki görevlerde kararların, açılan kayıtların ve keşfedilen sırların izini sürmeye devam edeceksin.','Contradictions around Piko’s past are growing. Keep following your decisions, recovered records, and discoveries in the next missions.'],
 backmenu:['ANA MENÜYE DÖN','RETURN TO MAIN MENU'],
 'save-note':['Hikâye ilerlemesi ayrı kaydedilir. Sonsuz Mod kaydına ve savaş dengesine dokunulmaz.','Story progress is saved separately. Endless Mode saves and game balance remain untouched.'],
 continue:['DEVAM ET →','CONTINUE →'], start:['GÖREV PANOSU →','MISSION BRIEFING →'],
 progress:['HİKÂYE GİRİŞİ','STORY INTRODUCTION'], completed:['GİRİŞ TAMAMLANDI · GÖREV PANOSU AÇILDI','INTRO COMPLETE · MISSION BRIEFING UNLOCKED']
};
let storyDialogueIndex = 0;
let storyMissionViewOpen = false;

function getStoryProgress() {
    const defaults = { introSeen: false, chapter: 1, mission1Complete: false, mission2Complete: false, mission3Complete: false, mission4Complete: false, mission5Complete: false, mission6Complete: false, mission7Complete: false, mission8Complete: false, mission9Complete: false, mission10Complete: false, mission11Complete: false, mission12Complete: false, mission13Complete: false, mission14Complete: false, mission15Complete: false, mission16Complete: false, mission17Complete: false, mission18Complete: false, mission19Complete: false, mission20Complete: false, mission21Complete: false, voiceChoice: null, pulseTutorialComplete: false, companionForm: 'basic', repairChoiceCount: 0, routeChoice: null, powerChoice: null, callSignChoice: null, updatedAt: 0 };
    try {
        const saved = JSON.parse(localStorage.getItem(STORY_PROGRESS_KEY) || '{}');
        return { introSeen: saved.introSeen === true, chapter: Math.max(1, Math.min(3, Number(saved.chapter) || 1)), mission1Complete: saved.mission1Complete === true, mission2Complete: saved.mission2Complete === true, mission3Complete: saved.mission3Complete === true, mission4Complete: saved.mission4Complete === true, mission5Complete: saved.mission5Complete === true, mission6Complete: saved.mission6Complete === true, mission7Complete: saved.mission7Complete === true, mission8Complete: saved.mission8Complete === true, mission9Complete: saved.mission9Complete === true, mission10Complete: saved.mission10Complete === true, mission11Complete: saved.mission11Complete === true, mission12Complete: saved.mission12Complete === true, mission13Complete: saved.mission13Complete === true, mission14Complete: saved.mission14Complete === true, mission15Complete: saved.mission15Complete === true, mission16Complete: saved.mission16Complete === true, mission17Complete: saved.mission17Complete === true, mission18Complete: saved.mission18Complete === true, mission19Complete: saved.mission19Complete === true, mission20Complete: saved.mission20Complete === true, mission21Complete: saved.mission21Complete === true, voiceChoice: ['human','station'].includes(saved.voiceChoice) ? saved.voiceChoice : null, pulseTutorialComplete: saved.pulseTutorialComplete === true, companionForm: saved.companionForm === 'cyan' ? 'cyan' : 'basic', repairChoiceCount: Math.max(0, Math.min(3, Number(saved.repairChoiceCount) || 0)), routeChoice: ['array','blackbox'].includes(saved.routeChoice) ? saved.routeChoice : null, powerChoice: ['shield','weapon'].includes(saved.powerChoice) ? saved.powerChoice : null, callSignChoice: ['echo','piko'].includes(saved.callSignChoice) ? saved.callSignChoice : null, updatedAt: Math.max(0, Number(saved.updatedAt) || 0) };
    } catch (_) { return defaults; }
}
let storyCloudSaveTimer = null;
function saveStoryProgress(patch) {
    try {
        const next = { ...getStoryProgress(), ...patch, updatedAt: Date.now() };
        localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(next));
        if (currentUser && currentUser.isCloud && isFirebaseReady && fbDb) {
            clearTimeout(storyCloudSaveTimer);
            storyCloudSaveTimer = setTimeout(() => pushStoryProgressToCloud(true), 1200);
        }
    } catch (_) {}
}
function getValidatedStoryProgress(source) {
    let previous = null;
    try {
        previous = localStorage.getItem(STORY_PROGRESS_KEY);
        localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(source || {}));
        const normalized = getStoryProgress();
        if (previous === null) localStorage.removeItem(STORY_PROGRESS_KEY);
        else localStorage.setItem(STORY_PROGRESS_KEY, previous);
        return normalized;
    } catch (_) {
        try {
            if (previous === null) localStorage.removeItem(STORY_PROGRESS_KEY);
            else localStorage.setItem(STORY_PROGRESS_KEY, previous);
        } catch (_) {}
        return getStoryProgress();
    }
}
async function pushStoryProgressToCloud(silent = true) {
    if (!currentUser || !currentUser.isCloud || !isFirebaseReady || !fbDb) return false;
    try {
        const progress = getStoryProgress();
        const payload = { ...progress, updatedAt: Math.max(Date.now(), progress.updatedAt || 0) };
        await fbDb.collection('storyProgress').doc(currentUser.uid).set(payload);
        localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(payload));
        localStorage.setItem(STORY_PROGRESS_OWNER_KEY, currentUser.uid);
        if (!silent) showToast('☁️ Hikâye ilerlemen buluta kaydedildi.');
        return true;
    } catch (err) {
        console.error('[Story Cloud Save] failed:', err && err.code ? err.code : 'unknown', err);
        if (!silent) showToast('❌ Hikâye buluta kaydedilemedi; bu cihazdaki yerel kayıt korundu.');
        return false;
    }
}
async function pullStoryProgressFromCloud(silent = true) {
    if (!currentUser || !currentUser.isCloud || !isFirebaseReady || !fbDb) return false;
    try {
        const ref = fbDb.collection('storyProgress').doc(currentUser.uid);
        const snapshot = await ref.get();
        const localOwner = localStorage.getItem(STORY_PROGRESS_OWNER_KEY);
        const belongsToAnotherAccount = !!localOwner && localOwner !== currentUser.uid;
        const local = belongsToAnotherAccount ? null : getStoryProgress();
        if (!snapshot.exists) {
            if (local && local.updatedAt > 0) {
                await pushStoryProgressToCloud(true);
            } else if (belongsToAnotherAccount) {
                localStorage.removeItem(STORY_PROGRESS_KEY);
                localStorage.setItem(STORY_PROGRESS_OWNER_KEY, currentUser.uid);
                updateStoryMissionBoard();
            } else {
                localStorage.setItem(STORY_PROGRESS_OWNER_KEY, currentUser.uid);
            }
            return false;
        }
        const remote = getValidatedStoryProgress(snapshot.data());
        if (local && local.updatedAt > remote.updatedAt && local.updatedAt > 0) {
            await pushStoryProgressToCloud(true);
        } else {
            localStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(remote));
            localStorage.setItem(STORY_PROGRESS_OWNER_KEY, currentUser.uid);
            updateStoryMissionBoard();
        }
        return true;
    } catch (err) {
        console.error('[Story Cloud Pull] failed:', err && err.code ? err.code : 'unknown', err);
        if (!silent) showToast('❌ Hikâye bulut kaydı alınamadı; yerel ilerlemen korunuyor.');
        return false;
    }
}
function storyLanguage() { return getGameLanguage() === 'en' ? 'en' : 'tr'; }
function storyCopy(pair) { return pair[storyLanguage() === 'en' ? 1 : 0]; }
function applyStoryUiLanguage() {
    const en = storyLanguage() === 'en';
    document.querySelectorAll('[data-story-ui]').forEach(node => {
        const pair = STORY_UI_COPY[node.dataset.storyUi];
        if (pair) node.textContent = pair[en ? 1 : 0];
    });
    const chapterLabel = document.getElementById('story-chapter-label');
    if (chapterLabel && window.__storyBattle && window.__storyBattle.active && window.__storyBattle.mission >= 10) {
        chapterLabel.textContent = window.__storyBattle.mission >= 19 ? (en ? 'CHAPTER 03 · THE SHAPE OF MEMORY' : 'BÖLÜM 03 · HAFIZANIN BİÇİMİ') : (en ? 'CHAPTER 02 · BENEATH THE SIGNAL' : 'BÖLÜM 02 · SİNYALİN ALTINDA');
    }
    const next = document.getElementById('story-next');
    if (next) next.textContent = storyCopy(STORY_UI_COPY[storyMissionViewOpen ? 'start' : 'continue']);
    updateStoryMissionBoard();
}
let storyTypingTimer = null;
let storyTypingFullText = '';
function showStoryMissionResult() {
    const session = window.__storyBattle;
    const overlay = document.getElementById('story-mission-result');
    const title = document.getElementById('story-mission-result-title');
    const copy = document.getElementById('story-mission-result-copy');
    const action = document.getElementById('story-mission-result-action');
    if (!overlay || !session || !session.active || !session.completed) return;
    const en = storyLanguage() === 'en';
    if (title) title.textContent = en ? ('MISSION ' + String(session.mission).padStart(2, '0') + ' COMPLETE') : (String(session.mission).padStart(2, '0') + '. GÖREV TAMAMLANDI');
    if (copy) copy.textContent = en
        ? 'Your progress has been saved. Return to the chapter board when you are ready.'
        : 'İlerlemen kaydedildi. Hazır olduğunda görev panosuna dönebilirsin.';
    if (action) action.textContent = en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN';
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
}

function finishStoryTyping() {
    if (storyTypingTimer !== null) {
        clearInterval(storyTypingTimer);
        storyTypingTimer = null;
    }
    const copy = document.getElementById('story-dialogue-copy');
    if (copy) copy.textContent = storyTypingFullText;
}
function showStoryDialogue() {
    if (storyTypingTimer !== null) {
        clearInterval(storyTypingTimer);
        storyTypingTimer = null;
    }
    const line = STORY_DIALOGUES[storyDialogueIndex];
    if (!line) return;
    const en = storyLanguage() === 'en';
    const speaker = document.getElementById('story-speaker');
    const copy = document.getElementById('story-dialogue-copy');
    const progress = document.getElementById('story-progress');
    const next = document.getElementById('story-next');
    const bubble = document.getElementById('story-dialogue-bubble');
    const avatar = document.getElementById('story-avatar-glyph');
    const speakerText = line.speaker[en ? 'en' : 'tr'];
    storyTypingFullText = line.text[en ? 'en' : 'tr'];
    const isHologram = /HOLOGRAM|HOLOGRAMI|BLUE HOLOGRAM/.test(speakerText.toUpperCase());
    const isCommander = /KOMUTAN|COMMANDER/.test(speakerText.toUpperCase());
    const speakerKind = isHologram ? 'hologram' : (isCommander ? 'commander' : 'station');
    if (speaker) speaker.textContent = speakerText;
    if (bubble) bubble.dataset.speaker = speakerKind;
    if (avatar) avatar.textContent = isHologram ? '◈' : (isCommander ? '⌁' : '✦');
    if (copy) {
        copy.textContent = '';
        copy.setAttribute('aria-label', storyTypingFullText);
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            copy.textContent = storyTypingFullText;
        } else {
            let charIndex = 0;
            storyTypingTimer = setInterval(() => {
                if (!copy.isConnected) { clearInterval(storyTypingTimer); storyTypingTimer = null; return; }
                charIndex = Math.min(storyTypingFullText.length, charIndex + 2);
                copy.textContent = storyTypingFullText.slice(0, charIndex);
                if (charIndex >= storyTypingFullText.length) {
                    clearInterval(storyTypingTimer);
                    storyTypingTimer = null;
                }
            }, 18);
        }
    }
    if (progress) progress.textContent = String(storyDialogueIndex + 1).padStart(2, '0') + ' / ' + String(STORY_DIALOGUES.length).padStart(2, '0');
    if (next) {
        next.textContent = storyDialogueIndex === STORY_DIALOGUES.length - 1
            ? storyCopy(STORY_UI_COPY.start) : storyCopy(STORY_UI_COPY.continue);
        next.setAttribute('aria-label', en ? 'Continue dialogue' : 'Diyaloğu ilerlet');
    }
}
function showStoryMissionBriefing() {
    storyMissionViewOpen = true;
    const dialogue = document.getElementById('story-dialogue-view');
    const mission = document.getElementById('story-mission-view');
    const note = document.getElementById('story-prototype-note');
    if (dialogue) dialogue.hidden = true;
    if (mission) mission.hidden = false;
    if (note) note.classList.add('is-visible');
    const progress = document.getElementById('story-mission-progress');
    if (progress) progress.textContent = storyCopy(STORY_UI_COPY.completed);
    applyStoryUiLanguage();
    saveStoryProgress({ introSeen: true, chapter: 1 });
    updateStoryMissionBoard();
}
// The story encounter temporarily borrows the existing combat engine, but never its save.
// All mutable combat state is snapshotted and restored when the player leaves the mission.
window.__storyBattle = window.__storyBattle || { active: false };
function updateStoryMissionBoard() {
    const progress = getStoryProgress();
    const en = storyLanguage() === 'en';
    const m1 = document.getElementById('story-start-mission1');
    const s1 = document.getElementById('story-mission-1-status');
    if (m1) {
        m1.disabled = false;
        m1.textContent = progress.mission1Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'DEPLOY →' : 'GÖREVE BAŞLA →');
    }
    if (s1) s1.textContent = progress.mission1Complete ? (en ? 'CORE STABLE' : 'ÇEKİRDEK GÜVENDE') : (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV');
    const m2 = document.getElementById('story-start-mission2');
    const s2 = document.getElementById('story-mission-2-status');
    if (m2) {
        m2.disabled = !progress.mission1Complete;
        m2.textContent = progress.mission2Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'DEPLOY →' : 'GÖREVE BAŞLA →');
    }
    if (s2) {
        s2.classList.toggle('is-locked', !progress.mission1Complete && !progress.mission2Complete);
        s2.textContent = progress.mission2Complete ? (en ? 'SIGNAL TRACES RECOVERED' : 'SİNYAL İZLERİ KURTARILDI')
            : (progress.mission1Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV')
            : (en ? 'LOCKED · COMPLETE MISSION 01' : 'KİLİTLİ · 1. GÖREVİ TAMAMLA'));
    }
    const m3 = document.getElementById('story-start-mission3');
    const s3 = document.getElementById('story-mission-3-status');
    if (m3) {
        m3.disabled = !progress.mission2Complete;
        m3.textContent = progress.mission3Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'INVESTIGATE →' : 'İNCELE →');
    }
    if (s3) {
        s3.classList.toggle('is-locked', !progress.mission2Complete && !progress.mission3Complete);
        s3.textContent = progress.mission3Complete ? (en ? 'EVIDENCE LOGGED' : 'KANIT KAYDEDİLDİ')
            : (progress.mission2Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV')
            : (en ? 'LOCKED · COMPLETE MISSION 02' : 'KİLİTLİ · 2. GÖREVİ TAMAMLA'));
    }
    const m4 = document.getElementById('story-start-mission4');
    const s4 = document.getElementById('story-mission-4-status');
    if (m4) { m4.disabled = !progress.mission3Complete; m4.textContent = progress.mission4Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'RESTORE SYSTEMS →' : 'SİSTEMLERİ ONAR →'); }
    if (s4) { s4.classList.toggle('is-locked', !progress.mission3Complete && !progress.mission4Complete); s4.textContent = progress.mission4Complete ? (en ? 'POWER ROUTED' : 'GÜÇ YÖNLENDİRİLDİ') : (progress.mission3Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV') : (en ? 'LOCKED · COMPLETE MISSION 03' : 'KİLİTLİ · 3. GÖREVİ TAMAMLA')); }
    const m5 = document.getElementById('story-start-mission5');
    const s5 = document.getElementById('story-mission-5-status');
    if (m5) { m5.disabled = !progress.mission4Complete; m5.textContent = progress.mission5Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'DEPLOY →' : 'GÖREVE BAŞLA →'); }
    if (s5) { s5.classList.toggle('is-locked', !progress.mission4Complete && !progress.mission5Complete); s5.textContent = progress.mission5Complete ? (en ? 'RELAY DISABLED' : 'RÖLE KAPATILDI') : (progress.mission4Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV') : (en ? 'LOCKED · COMPLETE MISSION 04' : 'KİLİTLİ · 4. GÖREVİ TAMAMLA')); }
    const m6 = document.getElementById('story-start-mission6');
    const s6 = document.getElementById('story-mission-6-status');
    if (m6) { m6.disabled = !progress.mission5Complete; m6.textContent = progress.mission6Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'BEGIN REPAIRS →' : 'ONARIMA BAŞLA →'); }
    if (s6) { s6.classList.toggle('is-locked', !progress.mission5Complete && !progress.mission6Complete); s6.textContent = progress.mission6Complete ? (en ? 'COMPANION STABLE' : 'YOLDAŞ STABİL') : (progress.mission5Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV') : (en ? 'LOCKED · COMPLETE MISSION 05' : 'KİLİTLİ · 5. GÖREVİ TAMAMLA')); }
    const m7 = document.getElementById('story-start-mission7');
    const s7 = document.getElementById('story-mission-7-status');
    if (m7) { m7.disabled = !progress.mission6Complete; m7.textContent = progress.mission7Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'DEFEND ARRAY →' : 'DİZİYİ SAVUN →'); }
    if (s7) { s7.classList.toggle('is-locked', !progress.mission6Complete && !progress.mission7Complete); s7.textContent = progress.mission7Complete ? (en ? 'AMPLIFIER DISABLED' : 'YÜKSELTİCİ KAPATILDI') : (progress.mission6Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV') : (en ? 'LOCKED · COMPLETE MISSION 06' : 'KİLİTLİ · 6. GÖREVİ TAMAMLA')); }
    const m8 = document.getElementById('story-start-mission8');
    const s8 = document.getElementById('story-mission-8-status');
    if (m8) { m8.disabled = !progress.mission7Complete; m8.textContent = progress.mission8Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'INSPECT →' : 'İNCELE →'); }
    if (s8) { s8.classList.toggle('is-locked', !progress.mission7Complete && !progress.mission8Complete); s8.textContent = progress.mission8Complete ? (en ? 'ECHO CONTRADICTION FOUND' : 'YANKI ÇELİŞKİSİ BULUNDU') : (progress.mission7Complete ? (en ? 'PLAYABLE MISSION' : 'OYNANABİLİR GÖREV') : (en ? 'LOCKED · COMPLETE MISSION 07' : 'KİLİTLİ · 7. GÖREVİ TAMAMLA')); }
    const m9 = document.getElementById('story-start-mission9');
    const s9 = document.getElementById('story-mission-9-status');
    if (m9) { m9.disabled = !progress.mission8Complete; m9.textContent = progress.mission9Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'BEGIN AWAKENING →' : 'UYANIŞI BAŞLAT →'); }
    if (s9) { s9.classList.toggle('is-locked', !progress.mission8Complete && !progress.mission9Complete); s9.textContent = progress.mission9Complete ? (en ? 'CHAPTER 01 COMPLETE' : '1. BÖLÜM TAMAMLANDI') : (progress.mission8Complete ? (en ? 'PLAYABLE CLIMAX' : 'OYNANABİLİR FİNAL') : (en ? 'LOCKED · COMPLETE MISSION 08' : 'KİLİTLİ · 8. GÖREVİ TAMAMLA')); }
    const m10 = document.getElementById('story-start-mission10');
    const s10 = document.getElementById('story-mission-10-status');
    if (m10) { m10.disabled = !progress.mission9Complete; m10.textContent = progress.mission10Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'OPEN THE DOOR →' : 'KAPIYI AÇ →'); }
    if (s10) { s10.classList.toggle('is-locked', !progress.mission9Complete && !progress.mission10Complete); s10.textContent = progress.mission10Complete ? (en ? 'LIFT ACCESS VERIFIED' : 'ASANSÖR ERİŞİMİ DOĞRULANDI') : (progress.mission9Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR') : (en ? 'LOCKED · COMPLETE MISSION 09' : 'KİLİTLİ · 9. GÖREVİ TAMAMLA')); }
    const m11 = document.getElementById('story-start-mission11');
    const m12 = document.getElementById('story-start-mission12');
    const s12 = document.getElementById('story-mission-12-status');
    const m13 = document.getElementById('story-start-mission13');
    const s13 = document.getElementById('story-mission-13-status');
    const m14 = document.getElementById('story-start-mission14');
    const s14 = document.getElementById('story-mission-14-status');
    const s11 = document.getElementById('story-mission-11-status');
    if (m11) { m11.disabled = !progress.mission10Complete; m11.textContent = progress.mission11Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'DESCEND →' : 'AŞAĞI İN →'); }
    if (s11) {
        s11.classList.toggle('is-locked', !progress.mission10Complete && !progress.mission11Complete);
        s11.textContent = progress.mission11Complete ? (en ? 'LOWER NETWORK MAPPED' : 'ALT AĞ HARİTALANDI')
            : (progress.mission10Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR')
            : (en ? 'LOCKED · COMPLETE MISSION 10' : 'KİLİTLİ · 10. GÖREVİ TAMAMLA'));
    }
    if (m12) { m12.disabled = !progress.mission11Complete; m12.textContent = progress.mission12Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'OPEN THE ARCHIVE →' : 'ARŞİVİ AÇ →'); }
    if (s12) {
        s12.classList.toggle('is-locked', !progress.mission11Complete && !progress.mission12Complete);
        s12.textContent = progress.mission12Complete ? (en ? 'MEMORY CONFLICT CONFIRMED' : 'HAFIZA ÇELİŞKİSİ DOĞRULANDI')
            : (progress.mission11Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR')
            : (en ? 'LOCKED · COMPLETE MISSION 11' : 'KİLİTLİ · 11. GÖREVİ TAMAMLA'));
    }
    if (m13) { m13.disabled = !progress.mission12Complete; m13.textContent = progress.mission13Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'CHECK THE RECORDS →' : 'KAYITLARI İNCELE →'); }
    if (s13) { s13.classList.toggle('is-locked', !progress.mission12Complete && !progress.mission13Complete); s13.textContent = progress.mission13Complete ? (en ? 'VOICEPRINT DECISION RECORDED' : 'SES İZİ KARARI KAYDEDİLDİ') : (progress.mission12Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR') : (en ? 'LOCKED · COMPLETE MISSION 12' : 'KİLİTLİ · 12. GÖREVİ TAMAMLA')); }
    if (m14) { m14.disabled = !progress.mission13Complete; m14.textContent = progress.mission14Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'BREACH THE CORE →' : 'ÇEKİRDEĞE İLERLE →'); }
    if (s14) { s14.classList.toggle('is-locked', !progress.mission13Complete && !progress.mission14Complete); s14.textContent = progress.mission14Complete ? (en ? 'CORE SIGNAL TRACED' : 'ÇEKİRDEK SİNYALİ İZLENDİ') : (progress.mission13Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR') : (en ? 'LOCKED · COMPLETE MISSION 13' : 'KİLİTLİ · 13. GÖREVİ TAMAMLA')); }
    const m15 = document.getElementById('story-start-mission15');
    const s15 = document.getElementById('story-mission-15-status');
    if (m15) { m15.disabled = !progress.mission14Complete; m15.textContent = progress.mission15Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'STABILIZE PIKO →' : 'PİKO’YU DENGELE →'); }
    if (s15) { s15.classList.toggle('is-locked', !progress.mission14Complete && !progress.mission15Complete); s15.textContent = progress.mission15Complete ? (en ? 'MEMORY LOSS ACKNOWLEDGED' : 'KAYIP ANI KABUL EDİLDİ') : (progress.mission14Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR') : (en ? 'LOCKED · COMPLETE MISSION 14' : 'KİLİTLİ · 14. GÖREVİ TAMAMLA')); }
    const m16 = document.getElementById('story-start-mission16'); const s16 = document.getElementById('story-mission-16-status');
    if (m16) { m16.disabled = !progress.mission15Complete; m16.textContent = progress.mission16Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'TRACE THE LOOP →' : 'DÖNGÜYÜ İZLE →'); }
    if (s16) { s16.classList.toggle('is-locked', !progress.mission15Complete && !progress.mission16Complete); s16.textContent = progress.mission16Complete ? (en ? 'LOOP DISRUPTED' : 'DÖNGÜ KIRILDI') : (progress.mission15Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR') : (en ? 'LOCKED · COMPLETE MISSION 15' : 'KİLİTLİ · 15. GÖREVİ TAMAMLA')); }
    const m17 = document.getElementById('story-start-mission17'); const s17 = document.getElementById('story-mission-17-status');
    if (m17) { m17.disabled = !progress.mission16Complete; m17.textContent = progress.mission17Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'OPEN THE ARCHIVE →' : 'ARŞİVİ AÇ →'); }
    if (s17) { s17.classList.toggle('is-locked', !progress.mission16Complete && !progress.mission17Complete); s17.textContent = progress.mission17Complete ? (en ? 'CALL SIGN CHOSEN' : 'ÇAĞRI ADI SEÇİLDİ') : (progress.mission16Complete ? (en ? 'CHAPTER 02 · PLAYABLE' : '2. BÖLÜM · OYNANABİLİR') : (en ? 'LOCKED · COMPLETE MISSION 16' : 'KİLİTLİ · 16. GÖREVİ TAMAMLA')); }
    const m18 = document.getElementById('story-start-mission18'); const s18 = document.getElementById('story-mission-18-status');
    if (m18) { m18.disabled = !progress.mission17Complete; m18.textContent = progress.mission18Complete ? (en ? 'REPLAY ↻' : 'TEKRAR OYNA ↻') : (en ? 'OPEN THE LOCK →' : 'KİLİDİ AÇ →'); }
    if (s18) { s18.classList.toggle('is-locked', !progress.mission17Complete && !progress.mission18Complete); s18.textContent = progress.mission18Complete ? (en ? 'CHAPTER 02 COMPLETE' : '2. BÖLÜM TAMAMLANDI') : (progress.mission17Complete ? (en ? 'CHAPTER 02 · FINALE' : '2. BÖLÜM · FİNAL') : (en ? 'LOCKED · COMPLETE MISSION 17' : 'KİLİTLİ · 17. GÖREVİ TAMAMLA')); }
    for (const [n, prev, flag, enLabel, trLabel, enDone, trDone] of [[19,'mission18Complete','mission19Complete','CHART THE ORBIT →','YÖRÜNGEYİ ÇİZ →','ORBIT MAPPED','YÖRÜNGE HARİTALANDI'],[20,'mission19Complete','mission20Complete','CROSS THE FLEET →','FİLOYU GEÇ →','FLEET CROSSED','FİLO GEÇİLDİ'],[21,'mission20Complete','mission21Complete','REBUILD THE NAME →','İSMİ YENİDEN KUR →','IDENTITY RECOVERED','KİMLİK KURTARILDI']]) {
        const b=document.getElementById('story-start-mission'+n), st=document.getElementById('story-mission-'+n+'-status'), done=progress[flag]===true, unlocked=progress[prev]===true;
        if(b){b.disabled=!unlocked;b.textContent=done?(en?'REPLAY ↻':'TEKRAR OYNA ↻'):(en?enLabel:trLabel);}
        if(st){st.classList.toggle('is-locked',!unlocked&&!done);st.textContent=done?(en?enDone:trDone):(unlocked?(en?'CHAPTER 03 · PLAYABLE':'3. BÖLÜM · OYNANABİLİR'):(en?'LOCKED · COMPLETE MISSION '+(n-1):'KİLİTLİ · '+(n-1)+'. GÖREVİ TAMAMLA'));}
    }
    document.querySelectorAll('.story-mission-status.is-locked').forEach(node => {
        if (!['story-mission-2-status','story-mission-3-status','story-mission-4-status','story-mission-5-status','story-mission-6-status','story-mission-7-status','story-mission-8-status','story-mission-9-status','story-mission-10-status','story-mission-11-status','story-mission-12-status','story-mission-13-status','story-mission-14-status','story-mission-15-status','story-mission-16-status','story-mission-17-status','story-mission-18-status','story-mission-19-status','story-mission-20-status','story-mission-21-status'].includes(node.id)) node.textContent = en ? 'LOCKED · NEXT UPDATE' : 'KİLİTLİ · SONRAKİ AŞAMA';
    });

    // Campaign progress is presentation-only: it reads story flags and never mutates saves.
    const completedCount = Array.from({ length: 21 }, (_, index) => Boolean(progress['mission' + (index + 1) + 'Complete'])).filter(Boolean).length;
    const progressLabel = document.getElementById('story-campaign-progress-label');
    const progressCount = document.getElementById('story-campaign-progress-count');
    const progressFill = document.getElementById('story-campaign-progress-fill');
    const progressTrack = document.getElementById('story-campaign-progress-track');
    if (progressLabel) progressLabel.textContent = en ? 'CAMPAIGN SYNCHRONIZED' : 'HİKÂYE İLERLEMESİ';
    if (progressCount) progressCount.textContent = en ? (completedCount + ' / 21 MISSIONS') : (completedCount + ' / 21 GÖREV');
    if (progressFill) progressFill.style.width = ((completedCount / 21) * 100) + '%';
    if (progressTrack) progressTrack.setAttribute('aria-valuenow', String(completedCount));

    let nextMission = 0;
    for (let missionNumber = 1; missionNumber <= 21; missionNumber++) {
        if (!progress['mission' + missionNumber + 'Complete']) { nextMission = missionNumber; break; }
    }
    document.querySelectorAll('[id^="story-start-mission"]').forEach(button => {
        const match = button.id.match(/^story-start-mission(\d+)$/);
        if (!match) return;
        const missionNumber = Number(match[1]);
        const card = button.closest('.story-mission');
        if (!card) return;
        const complete = Boolean(progress['mission' + missionNumber + 'Complete']);
        card.classList.toggle('is-complete', complete);
        card.classList.toggle('is-current', !complete && missionNumber === nextMission && !button.disabled);
        card.classList.toggle('is-locked-card', button.disabled && !complete);
        if (complete) card.setAttribute('data-mission-state', en ? 'COMPLETE' : 'TAMAM');
        else if (!button.disabled) card.setAttribute('data-mission-state', en ? 'AVAILABLE' : 'HAZIR');
        else card.removeAttribute('data-mission-state');
    });
}
function setStoryComms(speakerTr, speakerEn, textTr, textEn) {
    const speaker = document.getElementById('story-comms-speaker');
    const line = document.getElementById('story-comms-line');
    const en = storyLanguage() === 'en';
    if (speaker) speaker.textContent = en ? speakerEn : speakerTr;
    if (line) line.textContent = en ? textEn : textTr;
}
function storyDeepCopy(value) { return JSON.parse(JSON.stringify(value)); }
function storyMissionPrerequisiteMet(missionNumber, progress) {
    const prerequisiteByMission = {
        2: 'mission1Complete',
        3: 'mission2Complete',
        4: 'mission3Complete',
        5: 'mission4Complete',
        6: 'mission5Complete',
        7: 'mission6Complete',
        8: 'mission7Complete',
        9: 'mission8Complete',
        10: 'mission9Complete',
        11: 'mission10Complete',
        12: 'mission11Complete',
        13: 'mission12Complete',
        14: 'mission13Complete',
        15: 'mission14Complete',
        16: 'mission15Complete',
        17: 'mission16Complete',
        18: 'mission17Complete', 19: 'mission18Complete', 20: 'mission19Complete', 21: 'mission20Complete'
    };
    const requiredProgressFlag = prerequisiteByMission[missionNumber];
    return !requiredProgressFlag || progress[requiredProgressFlag] === true;
}
function startStoryMission(missionNumber = 1) {
    const progress = getStoryProgress();
    if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].includes(missionNumber)) return;
    // Enforce mission order in the handler as well as the disabled UI buttons.
    // This prevents direct calls from bypassing the chapter's narrative gates.
    if (!storyMissionPrerequisiteMet(missionNumber, progress)) {
        showToast(storyLanguage() === 'en'
            ? 'Complete the previous mission before deploying this one.'
            : 'Bu göreve geçmeden önce bir önceki görevi tamamlamalısın.');
        return;
    }
    // Clean up a completed session before checking the Endless unlock requirement:
    // while the story sandbox is active, game.wave is the mission wave, not the saved Endless wave.
    // Never auto-abort an unfinished mission.
    if (window.__storyBattle?.active) {
        if (!window.__storyBattle.completed) return;
        exitStoryBattle(false);
    }
    if (!updateStoryUnlockUI()) {
        showToast(storyLanguage() === 'en' ? 'Clear 25 waves in Endless Mode first.' : 'Önce Sonsuz Mod’da 25 dalgayı tamamlamalısın.');
        return;
    }
    const session = {
        active: true, completed: false, companionSynced: false, mission: missionNumber, phase: missionNumber === 3 ? 'investigate' : (missionNumber === 4 ? 'powerChoice' : (missionNumber === 6 ? 'repair' : (missionNumber === 8 ? 'memory' : 'combat'))), scans: 0, repairs: 0, memories: 0, routeChoice: null,
        snapshot: {
            game: storyDeepCopy(game), tower: storyDeepCopy(tower),
            enemies: storyDeepCopy(enemies), projectiles: storyDeepCopy(projectiles),
            particles: storyDeepCopy(particles), floatingTexts: storyDeepCopy(floatingTexts),
            lightningBeams: storyDeepCopy(lightningBeams), rings: storyDeepCopy(rings),
            cargoDrones: storyDeepCopy(cargoDrones),
            spawnTimer, playTimeAccum, waveFrostSpawns, cargoSpawnTimer,
            gameSpeed, isPaused, isDefeated, defeatTimer,
            gameMode: document.body.dataset.gameMode || ''
        }
    };
    window.__storyBattle = session;
    const resultOverlay = document.getElementById('story-mission-result');
    if (resultOverlay) { resultOverlay.hidden = true; resultOverlay.setAttribute('aria-hidden', 'true'); }
    // Set the mode before deriving HP, shield, and damage so Endless bonuses cannot leak into this mission.
    document.body.dataset.gameMode = 'story';
    game = getDefaultState();
    game.wave = 1; game.highestWave = 1; game.gold = 180;
    game.waveKills = 0; game.waveTargetKills = missionNumber === 1 ? 8 : (missionNumber === 5 ? 8 : (missionNumber === 7 ? 8 : (missionNumber === 9 ? 10 : (missionNumber === 10 ? 6 : (missionNumber === 11 ? 8 : (missionNumber === 12 ? 6 : (missionNumber === 13 ? 7 : (missionNumber === 14 ? 12 : (missionNumber === 18 ? 8 : (missionNumber === 17 ? 6 : (missionNumber === 16 ? 8 : (missionNumber === 15 ? 6 : 5)))))))))))); game.holdWave = false;
    // Story missions use a deterministic loadout, never the endless-mode save's upgrades/items.
    game.upgrades.damage = 3; game.upgrades.attackSpeed = 2; game.upgrades.range = 3;
    game.upgrades.critChance = 0; game.upgrades.critMult = 1; game.upgrades.multishot = 0;
    game.upgrades.bounce = 0; game.upgrades.knockback = 0; game.upgrades.maxHp = 1;
    game.upgrades.hpRegen = 1; game.upgrades.armor = 0; game.upgrades.thorns = 0;
    game.upgrades.shield = 0; game.upgrades.lifesteal = 0; game.upgrades.goldBonus = 0;
    game.upgrades.waveGold = 0; game.upgrades.crystalChance = 0; game.upgrades.interest = 0;
    game.inventory = []; game.equippedItems = [];
    game.prestigeUpgrades = { permDamage: 0, permGold: 0, companionBoost: 0, costDiscount: 0, startWave: 0 };
    game.lootboxBonuses = { extraDamagePct: 0, extraGoldPct: 0, totalOpened: 0 };
    if (missionNumber === 5 && progress.powerChoice === 'weapon') game.upgrades.damage = 5;
    game.settings.activeTheme = 'space';
    tower = {
        x: canvas.width / 2, y: canvas.height / 2, hp: 100, maxHp: 100, shield: 0, maxShield: 0,
        fireCooldown: 0, angle: 0, recoil: 0, freezeTimer: 0, freezeImmunityTimer: 0,
        frostSlowTimer: 0, frostVisualTick: 0, overdriveTimer: 0, overdriveVisualTick: 0
    };
    tower.maxHp = getTowerMaxHp(); tower.hp = tower.maxHp;
    tower.maxShield = getTowerMaxShield(); tower.shield = tower.maxShield;
    if (missionNumber === 5 && progress.powerChoice === 'shield') { tower.maxShield += 30; tower.shield = tower.maxShield; }
    enemies = []; projectiles = []; particles = []; floatingTexts = [];
    lightningBeams = []; rings = []; cargoDrones = [];
    spawnTimer = 0; playTimeAccum = 0; waveFrostSpawns = 0; cargoSpawnTimer = 999999;
    gameSpeed = 1; isPaused = [3, 4, 6, 8].includes(missionNumber); isDefeated = false; defeatTimer = 0;
    document.body.dataset.gameMode = 'story';
    // Rebuild upgrade controls against the fresh mission state, not the previous Endless Mode save.
    if (typeof buildUpgradesUI === 'function') buildUpgradesUI();
    if (typeof buildInventoryUI === 'function') buildInventoryUI();
    if (typeof applyBodyClasses === 'function') applyBodyClasses();
    const screen = document.getElementById('story-mode-screen');
    if (screen) { screen.classList.remove('is-open'); screen.setAttribute('aria-hidden', 'true'); }
    const hud = document.getElementById('story-battle-hud');
    if (hud) { hud.hidden = false; hud.classList.add('is-active'); }
    const chapterLabel = document.getElementById('story-chapter-label');
    if (chapterLabel) chapterLabel.textContent = missionNumber >= 10
        ? (storyLanguage() === 'en' ? 'CHAPTER 02 · BENEATH THE SIGNAL' : 'BÖLÜM 02 · SİNYALİN ALTINDA')
        : (storyLanguage() === 'en' ? 'CHAPTER 01 · LOST SIGNAL' : 'BÖLÜM 01 · KAYIP SİNYAL');
    const commsByMission = {
        1: ['İSTASYON YAPAY ZEKÂSI','STATION AI','Savunma protokolü çöktü. Çekirdek yeniden güç kazanıyor; komutan, ilk teması karşıla.','Defense protocol has collapsed. The core is regaining power; Commander, prepare for first contact.'],
        2: ['PİKO','PIKO','Sinyal gövdede üç noktada yankılanıyor. Tehlike geçince izleri birlikte tarayalım.','The signal echoes at three points in the hull. Once the threat passes, let us scan the traces.'],
        3: ['KOMUTAN','COMMANDER','Anten sinyali mi tekrarlıyor, yoksa karakutu bunu daha önce mi duymuş? Bir kaydı seçmeliyiz.','Is the antenna repeating the signal, or did the black box hear it first? We need to inspect one record.'],
        4: ['İSTASYON YAPAY ZEKÂSI','STATION AI','Güç rezervi tek bir sistemi tam onarabilir. Kalkan daha güvenli, silah kalibrasyonu daha hızlı sonuç verir.','The reserve can fully restore only one system. Shields are safer; weapon calibration is faster.'],
        5: ['KOMUTAN','COMMANDER','Seçim yapıldı. Koridoru açıp röleyi susturacağız. Bu sinyalin başka bir yere yayılmasına izin veremeyiz.','The choice is made. We will clear the corridor and silence the relay. This signal cannot be allowed to spread.'],
        6: ['PİKO','PIKO','Burada üç bağlantı kopmuş. Ben panelleri işaretleyeceğim. Sen onarımı tamamla.','Three connections are severed here. I will mark the panels. You complete the repairs.'],
        7: ['İSTASYON YAPAY ZEKÂSI','STATION AI','Haberleşme dizisi sinyali güçlendiriyor. Savunmayı sürdür; yükselticiyi kapatırsak kaynağın yönünü bulabiliriz.','The communications array is amplifying the signal. Hold the defense; shutting down the amplifier may reveal its origin.'],
        8: ['KOMUTAN','COMMANDER','Bu oda aynı oda. Ama kayıtlar birbirini tutmuyor. Mavi görüntü bir şeyi hatırlıyor—istasyon ise bunun yaşanmadığını söylüyor.','This is the same room. But the records contradict each other. The blue image remembers something—the station insists it never happened.'],
        9: ['PİKO','PIKO','Bağlantı kopuyor… Komutan, çekirdeği koru. Bu kez kaçmayacağım. Ne olduğumu hatırlamaya hazırım.','The link is breaking… Commander, protect the core. I will not retreat this time. I am ready to remember what I am.'],
        10: ['İSTASYON YAPAY ZEKÂSI','STATION AI','Alt kat planlarda görünmüyor. Burada yalnızca taşıyıcı kiriş olması gerekiyordu.','There is no lower level on the schematics. This should be a load-bearing strut.'],
        11: ['PİKO','PIKO','Aşağıdaki ağ istasyondan eski. Lütfen bunun normal olduğunu söyle; ben söyleyemiyorum.','The network below predates the station. Please tell me that is normal; I cannot.'],
        12: ['PİKO','PIKO','Arşivde benim için bir kayıt var. Garip olan, kaydın tarihinin benim çekirdeğimden daha eski olması değil… içindeki sesin benim sesim olmaması.','There is a record for me in the archive. The strange part is not that it predates my core… it is that the voice inside is not mine.'],
        13: ['PİKO','PIKO','İnsan kaydındaki ses benim ses izimle eşleşiyor. Ama anılarımda o insan yok. Hangimize inanmalıyım?','The human recording matches my voiceprint. But that person is not in my memories. Which account should I believe?'],
        14: ['PİKO','PIKO','Sinyal çekirdeğin içinden geliyor. Ne olursa olsun bu kez gerçeği birlikte bulacağız.','The signal is coming from inside the core. Whatever happens, we will find the truth together this time.'],
        15: ['PİKO','PIKO','Sinyal darbesi hâlâ içimde yankılanıyor. Önce sistemi dengelemeliyiz; sonra sana neyi kaybettiğimi anlatacağım.','The pulse is still echoing inside me. We need to stabilize the systems first; then I will tell you what I lost.'],
        16: ['PİKO','PIKO','Bu koridorun sonunu hatırlıyorum. Ama her dönüşte aynı yere geliyoruz. Bir iz bırak; döngünün bizi nereden geri sardığını bulalım.','I remember the end of this corridor. But every turn brings us back here. Leave a trace so we can find where the loop resets.'],
        17: ['PİKO','PIKO','Arşivde bana ait bir kayıt var. İki dosya aynı anıyı anlatıyor ama birinde ben hiç var olmamışım. Bu kez adımı kendim seçmek istiyorum.','The archive has a record about me. Two files describe the same memory, but one says I never existed. This time, I want to choose my own name.'],
        18: ['BİLİNMEYEN KAYNAK','UNKNOWN SOURCE','Komutan. Bu kilit senin imzanı tanıyor. İstasyon inşa edilmeden önce kim adına emir verdin?','Commander. This lock recognizes your signature. In whose name did you issue orders before the station was built.']
    };
    const openingLine = commsByMission[missionNumber];
    if (openingLine) setStoryComms(...openingLine);
    // Piko is the same companion from the opening scene; make him speak as the mission begins.
    if (typeof window.pikoStoryEvent === 'function') window.pikoStoryEvent('missionStart', missionNumber);
    if (missionNumber === 14 && progress.voiceChoice === 'human') {
        setStoryComms('PİKO','PIKO','İnsan kaydına güvendiğin için bir şeyler hatırlıyorum. Bu sinyalin arkasında gerçekten biri var.','Because you trusted the human record, I am remembering something. Someone really is behind this signal.');
    } else if (missionNumber === 14 && progress.voiceChoice === 'station') {
        setStoryComms('PİKO','PIKO','İstasyon arşivini seçtin. O zaman önce sahte imzanın kaynağını bulalım.','You chose the station archive. Then let us find who forged its signature first.');
    }
    if (missionNumber === 5 && progress.routeChoice === 'array') {
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Anten kaydı sinyalin istasyonun içinden döndüğünü gösterdi. Röleyi susturursak döngüyü kesebiliriz.','The antenna log showed the signal looping from inside the station. Silencing the relay may break the loop.');
    } else if (missionNumber === 5 && progress.routeChoice === 'blackbox') {
        setStoryComms('PİKO','PIKO','Karakutudaki ses benim ses izimle eşleşiyor. Bu mümkün olmamalı…','The voice in the black box matches my voiceprint. That should not be possible…');
    }
    const status = document.getElementById('story-battle-status');
    if (status) {
        if (missionNumber === 1) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 8 hostiles and stabilize the core.' : 'GÖREV: 8 düşmanı durdur ve çekirdeği güvene al.';
        else if (missionNumber === 2) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Stop 5 patrol units, then scan 3 signal traces.' : 'GÖREV: 5 devriye birimini durdur, ardından 3 sinyal izini tara.';
        else if (missionNumber === 3) status.textContent = storyLanguage() === 'en' ? 'INVESTIGATION: Choose a data source to trace the signal.' : 'İNCELEME: Sinyalin izini sürmek için bir veri kaynağı seç.';
        else if (missionNumber === 4) status.textContent = storyLanguage() === 'en' ? 'POWER ROUTING: Choose shields or weapons. This affects your next defense.' : 'GÜÇ DAĞITIMI: Kalkanı veya silahı seç. Seçimin bir sonraki savunmayı etkileyecek.';
        else if (missionNumber === 5) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 8 hostiles, hold off 10 reinforcements, then disable the signal relay.' : 'GÖREV: 8 düşmanı durdur, 10 takviyeyi püskürt, ardından sinyal rölesini kapat.';
        else if (missionNumber === 6) status.textContent = storyLanguage() === 'en' ? 'REPAIR: Restore three connections while the companion guides you.' : 'ONARIM: Yoldaş sana rehberlik ederken üç bağlantıyı onar.';
        else if (missionNumber === 7) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 8 hostiles, hold off 10 reinforcements, then disable the signal amplifier.' : 'GÖREV: 8 düşmanı durdur, 10 takviyeyi püskürt, ardından sinyal yükselticisini kapat.';
        else if (missionNumber === 8) status.textContent = storyLanguage() === 'en' ? 'MEMORY REVIEW: Inspect three clues in the familiar room.' : 'HAFIZA İNCELEMESİ: Tanıdık odadaki üç ipucunu incele.';
        else if (missionNumber === 9) status.textContent = storyLanguage() === 'en' ? 'CLIMAX: Defeat 10 hostiles, reconnect with the companion, then awaken it.' : 'FİNAL: 10 düşmanı durdur, yoldaşla bağlantıyı kur ve onu uyandır.';
        else if (missionNumber === 10) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 6 hostiles, then use the cyan pulse to reveal and activate two hidden nodes.' : 'GÖREV: 6 düşmanı durdur, ardından camgöbeği darbeyle iki gizli düğümü açığa çıkarıp etkinleştir.';
        else if (missionNumber === 11) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 8 hostiles, then pulse three ancient relays to map the lower network.' : 'GÖREV: 8 düşmanı durdur, ardından üç kadim röleye sinyal darbesi göndererek alt ağı haritala.';
        else if (missionNumber === 12) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 6 hostiles, then inspect three conflicting archive records.' : 'GÖREV: 6 düşmanı durdur, ardından birbiriyle çelişen üç arşiv kaydını incele.';
        else if (missionNumber === 13) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 7 hostiles, listen to two conflicting testimonies, and choose which record to trust.' : 'GÖREV: 7 düşmanı durdur, çelişen iki tanıklığı dinle ve hangi kayda güveneceğini seç.';
        else if (missionNumber === 14) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 12 hostiles, then disarm three core seals.' : 'GÖREV: 12 düşmanı durdur, ardından çekirdeğin üç kilidini aç.';
        else if (missionNumber === 15) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 6 hostiles, then repair three systems damaged by signal feedback.' : 'GÖREV: 6 düşmanı durdur, ardından sinyal geri beslemesinin bozduğu üç sistemi onar.';
        else if (missionNumber === 16) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat 8 hostiles, trace the loop, then survive a second defense.' : 'GÖREV: 8 düşmanı durdur, döngünün izini sür ve ikinci savunmadan sağ çık.';
        else if (missionNumber === 17) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat the archive guards, inspect two records, then choose Piko’s call sign.' : 'GÖREV: Arşiv muhafızlarını durdur, iki kaydı incele ve Piko’nun çağrı adını seç.';
        else if (missionNumber === 18) status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Hold three defense stages and open the lock that recognizes the commander.' : 'GÖREV: Üç savunma aşamasını tamamla ve komutanı tanıyan kilidi aç.';
        else status.textContent = storyLanguage() === 'en' ? 'OBJECTIVE: Defeat the hostiles.' : 'GÖREV: Düşmanları durdur.';
    }
    const action = document.getElementById('story-scan-action');
    if (action) action.hidden = true;
    const investigation = document.getElementById('story-investigation-actions');
    if (investigation) investigation.hidden = missionNumber !== 3;
    const powerChoices = document.getElementById('story-power-actions');
    if (powerChoices) powerChoices.hidden = missionNumber !== 4;
    const relay = document.getElementById('story-relay-action');
    if (relay) relay.hidden = true;
    const repair = document.getElementById('story-repair-action'); if (repair) repair.hidden = missionNumber !== 6;
    const amplifier = document.getElementById('story-amplifier-action'); if (amplifier) amplifier.hidden = true;
    const memory = document.getElementById('story-memory-action'); if (memory) memory.hidden = missionNumber !== 8;
    const reconnect = document.getElementById('story-reconnect-action'); if (reconnect) reconnect.hidden = true;
    const awaken = document.getElementById('story-awaken-action'); if (awaken) awaken.hidden = true;
    const pulse = document.getElementById('story-pulse-action'); if (pulse) pulse.hidden = true;
    const mission10Pulse = document.getElementById('story-mission10-pulse-action'); if (mission10Pulse) mission10Pulse.hidden = true;
    const mission11Pulse = document.getElementById('story-mission11-pulse-action'); if (mission11Pulse) mission11Pulse.hidden = true;
    const archiveAction = document.getElementById('story-mission12-archive-action'); if (archiveAction) archiveAction.hidden = true;
    const voiceAction = document.getElementById('story-mission13-record-action'); if (voiceAction) voiceAction.hidden = true;
    const trustHuman = document.getElementById('story-mission13-trust-human'); if (trustHuman) trustHuman.hidden = true;
    const trustStation = document.getElementById('story-mission13-trust-station'); if (trustStation) trustStation.hidden = true;
    const coreSeal = document.getElementById('story-mission14-seal-action'); if (coreSeal) coreSeal.hidden = true;
    const mission15Repair = document.getElementById('story-mission15-repair-action'); if (mission15Repair) mission15Repair.hidden = true;
    const chapter2Action = document.getElementById('story-chapter2-action'); if (chapter2Action) chapter2Action.hidden = true;
    const chapter2Human = document.getElementById('story-chapter2-route-human'); if (chapter2Human) chapter2Human.hidden = true;
    const chapter2Archive = document.getElementById('story-chapter2-route-archive'); if (chapter2Archive) chapter2Archive.hidden = true;
    const companionChip = document.getElementById('story-companion-chip');
    const companionIcon = document.getElementById('story-companion-icon');
    const companionState = document.getElementById('story-companion-state');
    if (companionChip) companionChip.classList.remove('is-synced');
    if (companionIcon) companionIcon.textContent = '⚙';
    if (companionState) companionState.textContent = missionNumber === 1
        ? (storyLanguage() === 'en' ? 'LOW POWER · LINKING TO CORE' : 'DÜŞÜK GÜÇ · ÇEKİRDEĞE BAĞLANIYOR')
        : (storyLanguage() === 'en' ? 'SCANNING SUPPORT · LOW POWER' : 'TARAMA DESTEĞİ · DÜŞÜK GÜÇ');
    if (missionNumber === 10) {
        if (companionChip) companionChip.classList.add('is-synced');
        if (companionIcon) companionIcon.textContent = '✦';
        if (companionState) companionState.textContent = storyLanguage() === 'en' ? 'CYAN FORM · SIGNAL STABLE' : 'CAMGÖBEĞİ FORM · SİNYAL KARARLI';
    }
    const exit = document.getElementById('story-battle-exit');
    if (exit) exit.textContent = storyLanguage() === 'en' ? 'ABORT MISSION' : 'GÖREVDEN ÇIK';
    if (typeof resizeCanvas === 'function') resizeCanvas();
    if (typeof updateHUD === 'function') updateHUD();
    if (typeof refreshUpgradeButtonsState === 'function') refreshUpgradeButtonsState();
    if (typeof updateHoldWaveButton === 'function') updateHoldWaveButton();
    if (missionNumber === 1) showToast(storyLanguage() === 'en' ? 'Lost Signal · Mission 01. Your core fires automatically; use the upgrade panel if needed.' : 'Kayıp Sinyal · Görev 01. Çekirdeğin otomatik ateş ediyor; gerekirse yükseltme panelini kullan.');
    else if (missionNumber === 2) showToast(storyLanguage() === 'en' ? 'Mission 02 · Clear the patrol. The companion will help scan the signal traces.' : 'Görev 02 · Devriyeyi durdur. Yoldaş sinyal izlerini taramana yardım edecek.');
    else if (missionNumber === 3) showToast(storyLanguage() === 'en' ? 'Mission 03 · Choose which record to inspect.' : 'Görev 03 · Hangi kaydı inceleyeceğini seç.');
    else if (missionNumber === 4) showToast(storyLanguage() === 'en' ? 'Mission 04 · Route power to one subsystem.' : 'Görev 04 · Gücü iki sistemden birine yönlendir.');
    else if (missionNumber === 5) showToast(storyLanguage() === 'en' ? 'Mission 05 · Your power-routing choice changes this defense.' : 'Görev 05 · Güç dağıtımı kararın bu savunmayı değiştiriyor.');
    else if (missionNumber === 6) showToast(storyLanguage() === 'en' ? 'Mission 06 · Follow the companion’s repair markers.' : 'Görev 06 · Yoldaşın onarım işaretlerini takip et.');
    else if (missionNumber === 7) showToast(storyLanguage() === 'en' ? 'Mission 07 · Hold the communications array.' : 'Görev 07 · Haberleşme dizisini koru.');
    else if (missionNumber === 8) showToast(storyLanguage() === 'en' ? 'Mission 08 · Look for contradictions between memory and the room.' : 'Görev 08 · Hafıza ile oda arasındaki çelişkileri ara.');
    else if (missionNumber === 9) showToast(storyLanguage() === 'en' ? 'Mission 09 · This is the final defense of Chapter 01.' : 'Görev 09 · Bu, 1. bölümün son savunması.');
    else if (missionNumber === 10) showToast(storyLanguage() === 'en' ? 'Mission 10 · The door is reacting to the companion. Calibrate the pulse, then reveal the hidden nodes.' : 'Görev 10 · Kapı yoldaşa tepki veriyor. Darbeyi ayarla, sonra gizli düğümleri açığa çıkar.');
    else if (missionNumber === 11) showToast(storyLanguage() === 'en' ? 'Mission 11 · The lower network is awake. Clear the way, then map its three relays.' : 'Görev 11 · Alt ağ uyandı. Önce yolu temizle, sonra üç röleyi haritala.');
    else if (missionNumber === 12) showToast(storyLanguage() === 'en' ? 'Mission 12 · Clear the archive guards, then inspect all three records.' : 'Görev 12 · Arşiv muhafızlarını durdur, ardından üç kaydı incele.');
    else if (missionNumber === 15) showToast(storyLanguage() === 'en' ? 'Mission 15 · Stabilize Piko after the pulse feedback. The missing memory may not return.' : 'Görev 15 · Sinyal geri beslemesinden sonra Piko’yu dengele. Kayıp anı geri dönmeyebilir.');
}
function finishStoryBattleEncounter() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.completed) return;
    const en = storyLanguage() === 'en';
    const setStatus = text => { const el = document.getElementById('story-battle-status'); if (el) el.textContent = text; };
    const setAction = (id, hidden, label) => { const el = document.getElementById(id); if (el) { el.hidden = hidden; if (label) el.textContent = label; } };
    const setExit = label => { const el = document.getElementById('story-battle-exit'); if (el) el.textContent = label; };


    if (session.mission === 19 && session.phase === 'combat') {
        session.phase='navigationScan'; isPaused=true; enemies=[]; projectiles=[];
        setStatus(en?'IMPOSSIBLE ORBIT · The structure appears in two positions at once. Scan the pulse-aligned route.':'İMKÂNSIZ YÖRÜNGE · Yapı aynı anda iki konumda görünüyor. Darbeyle eşleşen rotayı tara.');
        setStoryComms('STATION AI','STATION AI','Classification failed: the object is not a ship, station, or natural body.','Sınıflandırma başarısız: nesne gemi, istasyon veya doğal bir gök cismi değil.');
        setAction('story-chapter2-action',false,en?'SCAN THE PULSE-ALIGNED ROUTE':'DARBEYLE EŞLEŞEN ROTAYI TARA'); setExit(en?'ABORT MISSION':'GÖREVDEN ÇIK'); return;
    }
    if (session.mission === 19 && session.phase === 'navigationScan') {
        session.completed=true; showStoryMissionResult(); isPaused=true; saveStoryProgress({introSeen:true,chapter:3,mission18Complete:true,mission19Complete:true});
        setStatus(en?'ORBIT MAPPED · Two positions resolve into one structure, but its shadow arrives before its light.':'YÖRÜNGE HARİTALANDI · İki konum tek yapıya dönüşüyor; ancak gölgesi ışığından önce ulaşıyor.');
        setStoryComms('PIKO','PIKO','Bu yer beni tanıyor. Ben ise onu hatırlamıyorum.','This place recognizes me. I do not remember it.');
        setAction('story-chapter2-action',true); setExit(en?'RETURN TO CHAPTER BOARD':'GÖREV PANOSUNA DÖN'); return;
    }
    if (session.mission === 20 && session.phase === 'combat') {
        session.phase='selectivePulse'; isPaused=true; enemies=[]; projectiles=[];
        setStatus(en?'QUIET FLEET · The cyan pulse can silence one platform group. Do not wake the whole field.':'SESSİZ FİLO · Camgöbeği darbe bir platform grubunu susturabilir. Tüm alanı uyandırma.');
        setStoryComms('PIKO','PIKO','Bu işaretler benim bakım dilime benziyor ama çok daha eski. Darbeyi seçerek kullanmalıyız.','These markings resemble my maintenance language, but they are much older. We must use the pulse selectively.');
        setAction('story-chapter2-action',false,en?'DISABLE THE MARKED PLATFORM GROUP':'İŞARETLİ PLATFORM GRUBUNU SUSTUR'); setExit(en?'ABORT MISSION':'GÖREVDEN ÇIK'); return;
    }
    if (session.mission === 20 && session.phase === 'selectivePulse') {
        session.completed=true; showStoryMissionResult(); isPaused=true; saveStoryProgress({introSeen:true,chapter:3,mission19Complete:true,mission20Complete:true});
        setStatus(en?'FLEET CROSSED · One platform goes dark; the others remain dormant.':'FİLO GEÇİLDİ · Bir platform söndü; diğerleri uykuda kaldı.');
        setStoryComms('COMMANDER','COMMANDER','Bu bir saldırı filosu değil. Birileri burayı uyandırmadan geçmeye çalışmış.','This is not an attack fleet. Someone tried to pass through without waking it.');
        setAction('story-chapter2-action',true); setExit(en?'RETURN TO CHAPTER BOARD':'GÖREV PANOSUNA DÖN'); return;
    }
    if (session.mission === 21 && session.phase === 'combat') {
        session.phase='fragmentScan'; isPaused=true; enemies=[]; projectiles=[];
        setStatus(en?'NAME FRAGMENTS · Rebuild the missing project designation from the archive shards.':'İSİM PARÇALARI · Eksik proje tanımını arşiv parçalarından yeniden kur.');
        setStoryComms('STATION AI','STATION AI','Three fragments recovered. The designation describes a shared role, not a personal identity.','Üç parça bulundu. Tanım bir kişisel kimliği değil, birden fazla birimin paylaştığı rolü anlatıyor.');
        setAction('story-chapter2-action',false,en?'RECONSTRUCT ARCHIVE FRAGMENT':'ARŞİV PARÇASINI BİRLEŞTİR'); setExit(en?'ABORT MISSION':'GÖREVDEN ÇIK'); return;
    }
    if (session.mission === 21 && session.phase === 'fragmentScan') {
        session.phase='combat2'; startStoryChapter2CombatStage(6,'ARŞİV SAVUNMASI · 6 düşmanı durdur ve son parçayı koru.','ARCHIVE DEFENSE · Defeat 6 hostiles and protect the final fragment.');
        setStoryComms('PIKO','PIKO','Bu tanım bana ait değil. Başkaları da bu görevi taşımış olabilir. Benim adım yine benim seçimim.','This designation is not my name. Others may have carried this role. My call sign is still my choice.'); return;
    }
    if (session.mission === 21 && session.phase === 'combat2') {
        session.phase='archiveRebuild'; isPaused=true; enemies=[]; projectiles=[];
        setStatus(en?'IDENTITY RECOVERED · The archive offers a role; the companion keeps its chosen call sign.':'KİMLİK KURTARILDI · Arşiv bir rol sunuyor; yoldaş seçtiği çağrı adını koruyor.');
        setAction('story-chapter2-action',false,en?'SEAL THE ARCHIVE RECORD':'ARŞİV KAYDINI KİLİTLE'); return;
    }
    if (session.mission === 21 && session.phase === 'archiveRebuild') {
        session.completed=true; showStoryMissionResult(); isPaused=true; saveStoryProgress({introSeen:true,chapter:3,mission20Complete:true,mission21Complete:true});
        setStatus(en?'CHAPTER 03 · IDENTITY RECOVERED. The designation is known; the blue echo remains unexplained.':'3. BÖLÜM · KİMLİK KURTARILDI. Tanım biliniyor; mavi yankı hâlâ açıklanamıyor.');
        setStoryComms('PIKO','PIKO','Bana bir görev adı vermişler. Ama ben bir görevden ibaret değilim.','They gave me a role designation. But I am more than a role.');
        setAction('story-chapter2-action',true); setExit(en?'RETURN TO CHAPTER BOARD':'GÖREV PANOSUNA DÖN'); return;
    }

    if (session.mission === 16 && session.phase === 'combat') {
        session.phase = 'routeScan1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'LOOP TRACE · The corridor folds back into the same chamber. Scan the seam in the signal.' : 'DÖNGÜ İZİ · Koridor aynı odaya kıvrılıyor. Sinyaldeki kırılmayı tara.');
        setStoryComms('PIKO','PIKO','Duvar değişti ama zemin izi aynı. Döngü mekânı değil, kayıt anını geri sarıyor olabilir.','The wall changed, but the floor marks did not. The loop may reset the recorded moment, not the room.');
        setAction('story-chapter2-action', false, en ? 'TRACE LOOP SEAM' : 'DÖNGÜ İZİNİ TARA');
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK'); return;
    }
    if (session.mission === 16 && session.phase === 'routeScan1') {
        session.phase = 'combat2';
        startStoryChapter2CombatStage(10, 'İKİNCİ SAVUNMA · 10 düşmanı durdur. Bu kez döngü savunma dizilimini değiştiriyor.', 'SECOND DEFENSE · Defeat 10 hostiles. This time the loop changes the defense pattern.');
        setStoryComms('KOMUTAN','COMMANDER','Döngü artık bizi değil, düşmanları yeniden konumlandırıyor. Piko, sinyal izini kaybetme.','The loop is repositioning the hostiles, not us. Piko, keep the signal trace alive.');
        return;
    }
    if (session.mission === 16 && session.phase === 'combat2') {
        session.phase = 'routeScan2'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'FALSE EXIT · The exit marker points inward. One last scan should expose the loop anchor.' : 'SAHTE ÇIKIŞ · Çıkış işareti içeriye dönüyor. Son bir tarama döngünün çıpasını açığa çıkarabilir.');
        setStoryComms('PIKO','PIKO','Mavi yankı korkuyor. Bizi durdurmaya çalışmıyor; sanki bu kapının açılmasından korkuyor.','The blue echo is afraid. It is not trying to stop us; it seems afraid of what happens when this door opens.');
        setAction('story-chapter2-action', false, en ? 'REVEAL LOOP ANCHOR' : 'DÖNGÜ ÇIPASINI AÇIĞA ÇIKAR'); return;
    }
    if (session.mission === 16 && session.phase === 'routeScan2') {
        session.phase = 'complete'; session.completed = true; showStoryMissionResult(); isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 2, mission15Complete: true, mission16Complete: true });
        setStatus(en ? 'LOOP DISRUPTED · The anchor lies below the station core.' : 'DÖNGÜ KIRILDI · Çıpa istasyon çekirdeğinin altında.');
        setStoryComms('UNKNOWN SOURCE','UNKNOWN SOURCE','Çıkış yoktu. Yalnızca sizi buraya getiren bir yol vardı.','There was no exit. Only a path designed to bring you here.');
        setAction('story-chapter2-action', true); setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
        showToast(en ? 'Mission 16 complete. The loop anchor is exposed.' : '16. görev tamamlandı. Döngü çıpası açığa çıkarıldı.'); return;
    }
    if (session.mission === 17 && session.phase === 'combat') {
        session.phase = 'archive1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'ARCHIVE ACCESS · Two records disagree about the companion’s origin.' : 'ARŞİV ERİŞİMİ · İki kayıt yoldaşın kökeni hakkında çelişiyor.');
        setStoryComms('PIKO','PIKO','Bir kayıtta bakım birimiyim. Diğerinde ise bu istasyon kurulmadan önce bir komutanın yanındayım.','One file says I am a maintenance unit. The other places me beside a commander before this station existed.');
        setAction('story-chapter2-action', false, en ? 'INSPECT ARCHIVE RECORD 1 / 2' : '1 / 2. ARŞİV KAYDINI İNCELE'); return;
    }
    if (session.mission === 17 && session.phase === 'archive1') {
        session.phase = 'archive2';
        setStatus(en ? 'RECORD 1 · The archive lists Piko as an unassigned prototype with no creation date.' : '1. KAYIT · Arşiv, Piko’yu üretim tarihi olmayan, atanmamış bir prototip olarak listeliyor.');
        setStoryComms('STATION AI','STATION AI','Bu kayıt, mevcut personel dizininden önce oluşturulmuş. İmza doğrulanamıyor.','This record predates the current personnel directory. Its signature cannot be verified.');
        setAction('story-chapter2-action', false, en ? 'INSPECT ARCHIVE RECORD 2 / 2' : '2 / 2. ARŞİV KAYDINI İNCELE'); return;
    }
    if (session.mission === 17 && session.phase === 'archive2') {
        session.phase = 'callSign'; isPaused = true;
        setStatus(en ? 'CALL SIGN · The archive has a designation, but Piko can choose what to carry forward.' : 'ÇAĞRI ADI · Arşivde bir unvan var; ama Piko geleceğe hangi adı taşıyacağını seçebilir.');
        setStoryComms('PIKO','PIKO','Bana bir ad verdiler. Ama adımın ne anlama geleceğine ben karar vermek istiyorum.','They gave me a designation. But I want to decide what my name means.');
        setAction('story-chapter2-action', true);
        const human = document.getElementById('story-chapter2-route-human'); if (human) { human.hidden = false; human.textContent = en ? 'CHOOSE “ECHO”' : '“YANKI” ADINI SEÇ'; }
        const archive = document.getElementById('story-chapter2-route-archive'); if (archive) { archive.hidden = false; archive.textContent = en ? 'KEEP “PIKO”' : '“PİKO” ADINI KORU'; } return;
    }
    if (session.mission === 18 && session.phase === 'combat') {
        session.phase = 'relay1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'LOCK DEFENSE · The first relay must be stabilized before the archive lock responds.' : 'KİLİT SAVUNMASI · Arşiv kilidi yanıt vermeden önce ilk röleyi sabitle.');
        setStoryComms('PIKO','PIKO','Kilit beni değil, seni tanıyor. İlk röleye ulaşalım; sana nedenini söyleyeceğini umuyorum.','The lock recognizes you, not me. Let’s reach the first relay. I hope it will tell us why.');
        setAction('story-chapter2-action', false, en ? 'STABILIZE RELAY 1' : '1. RÖLEYİ SABİTLE'); return;
    }
    if (session.mission === 18 && session.phase === 'relay1') {
        session.phase = 'combat2'; startStoryChapter2CombatStage(9, 'İKİNCİ SAVUNMA · 9 düşmanı durdur ve ikinci röleyi koru.', 'SECOND DEFENSE · Defeat 9 hostiles and protect the second relay.'); return;
    }
    if (session.mission === 18 && session.phase === 'combat2') {
        session.phase = 'relay2'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'RELAY 2 · A second signature matches the commander’s command key.' : '2. RÖLE · İkinci imza komutanın komut anahtarıyla eşleşiyor.');
        setStoryComms('KOMUTAN','COMMANDER','Ben bu istasyona hiç gelmedim. Bu imza bana ait olamaz.','I have never been to this station. That signature cannot be mine.');
        setAction('story-chapter2-action', false, en ? 'STABILIZE RELAY 2' : '2. RÖLEYİ SABİTLE'); return;
    }
    if (session.mission === 18 && session.phase === 'relay2') {
        session.phase = 'combat3'; startStoryChapter2CombatStage(10, 'FİNAL SAVUNMASI · 10 düşmanı durdur ve kilit alanını koru.', 'FINAL DEFENSE · Defeat 10 hostiles and hold the lock chamber.'); return;
    }
    if (session.mission === 18 && session.phase === 'combat3') {
        session.phase = 'finalLock'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'ARCHIVE LOCK · The lock opens for the commander alone.' : 'ARŞİV KİLİDİ · Kilit yalnızca komutan için açılıyor.');
        setStoryComms('UNKNOWN SOURCE','UNKNOWN SOURCE','Bu sistemin ilk emrini, istasyon kurulmadan önce sen verdin.','You issued the first command to this system before the station was built.');
        setAction('story-chapter2-action', false, en ? 'OPEN THE ARCHIVE LOCK' : 'ARŞİV KİLİDİNİ AÇ'); return;
    }
    if (session.mission === 18 && session.phase === 'finalLock') {
        session.phase = 'complete'; session.completed = true; showStoryMissionResult(); isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 2, mission17Complete: true, mission18Complete: true });
        setStatus(en ? 'CHAPTER 02 COMPLETE · A distant purple signal answers Piko’s cyan pulse.' : '2. BÖLÜM TAMAMLANDI · Uzak bir mor sinyal, Piko’nun camgöbeği darbesine yanıt veriyor.');
        setStoryComms('PIKO','PIKO','O sinyal bana cevap verdi. Ama bu kez peşimden gelmiyor… beni çağırıyor.','That signal answered me. But this time it is not following me… it is calling me.');
        setAction('story-chapter2-action', true); setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
        showToast(en ? 'Chapter 02 complete. The purple signal has answered.' : '2. bölüm tamamlandı. Mor sinyal yanıt verdi.'); return;
    }
    if (session.mission === 4 && session.phase === 'powerChoice') return;

    if (session.mission === 12 && session.phase === 'combat') {
        session.phase = 'archive1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'ARCHIVE ACCESS · Inspect the first record. Its timestamp is impossible.' : 'ARŞİV ERİŞİMİ · İlk kaydı incele. Zaman damgası imkânsız.');
        setStoryComms('PIKO','PIKO','Bu dosya benden eski. Ama neden kayıtta benimle konuşuyorlar?','This file is older than me. So why are they talking to me in it?');
        setAction('story-mission12-archive-action', false, en ? 'INSPECT RECORD 1 / 3' : 'KAYDI İNCELE 1 / 3');
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK');
        return;
    }
    if (session.mission === 12 && session.phase === 'archive1') {
        session.phase = 'archive2';
        setStatus(en ? 'RECORD 1 · The archive calls Piko “Operator Zero”, decades before the station was built.' : '1. KAYIT · Arşiv, istasyon kurulmadan onlarca yıl önce Piko’ya “Operatör Sıfır” diyor.');
        setStoryComms('STATION AI','STATION AI','Bu unvan mevcut personel kayıtlarında bulunmuyor.','That designation does not exist in current personnel records.');
        setAction('story-mission12-archive-action', false, en ? 'INSPECT RECORD 2 / 3' : 'KAYDI İNCELE 2 / 3');
        return;
    }
    if (session.mission === 12 && session.phase === 'archive2') {
        session.phase = 'archive3';
        setStatus(en ? 'RECORD 2 · A voiceprint matches Piko’s shell, but the speaker identifies as human.' : '2. KAYIT · Ses izi Piko’nun gövdesiyle eşleşiyor; ancak konuşan kendini insan olarak tanımlıyor.');
        setStoryComms('PIKO','PIKO','Benim sesim değil bu. Yani… öyle olmaması gerekiyor.','That is not my voice. I mean… it should not be.');
        setAction('story-mission12-archive-action', false, en ? 'INSPECT RECORD 3 / 3' : 'KAYDI İNCELE 3 / 3');
        return;
    }
    if (session.mission === 12 && session.phase === 'archive3') {
        session.phase = 'complete'; session.completed = true; showStoryMissionResult(); isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 2, mission11Complete: true, mission12Complete: true });
        setStatus(en ? 'CONTRADICTION CONFIRMED · The final file contains tomorrow’s date and Piko’s distress signal.' : 'ÇELİŞKİ DOĞRULANDI · Son dosyada yarının tarihi ve Piko’nun yardım sinyali var.');
        setStoryComms('BİLİNMEYEN KAYNAK','UNKNOWN SOURCE','Piko’yu bize kim gönderdi?','Who sent Piko to us?');
        setAction('story-mission12-archive-action', true);
        setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
        showToast(en ? 'Mission 12 complete. Archive contradiction recorded.' : '12. görev tamamlandı. Arşiv çelişkisi kaydedildi.');
        return;
    }
    if (session.mission === 13 && session.phase === 'combat') {
        session.phase = 'voice1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'VOICEPRINT MATCH · Two archived testimonies disagree about the human speaker.' : 'SES İZİ EŞLEŞTİ · İnsan konuşmacı hakkında iki arşiv kaydı çelişiyor.');
        setStoryComms('PIKO','PIKO','Bu sesin bana ait olamayacağını söylemek istiyorum. Ama sonundaki nefesi tanıyorum.','I want to say this voice cannot be mine. But I recognize the breath at the end.');
        setAction('story-mission13-record-action', false, en ? 'PLAY RECORD 1 / 2' : '1 / 2. KAYDI DİNLE');
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK'); return;
    }
    if (session.mission === 13 && session.phase === 'voice1') {
        session.phase = 'voice2';
        setStatus(en ? 'RECORD 1 · A human technician says Piko was built after the station incident.' : '1. KAYIT · İnsan teknisyen, Piko’nun istasyon kazasından sonra üretildiğini söylüyor.');
        setStoryComms('STATION AI','STATION AI','Bu ifade resmi zaman çizelgesiyle uyumlu. Ancak imza sonradan eklenmiş olabilir.','This matches the official timeline. However, the signature may have been added later.');
        setAction('story-mission13-record-action', false, en ? 'PLAY RECORD 2 / 2' : '2 / 2. KAYDI DİNLE'); return;
    }
    if (session.mission === 13 && session.phase === 'voice2') {
        session.phase = 'voiceChoice';
        setStatus(en ? 'RECORD 2 · The same voice claims Piko was the only survivor, before the station existed.' : '2. KAYIT · Aynı ses, Piko’nun istasyon kurulmadan önce tek kurtulan olduğunu söylüyor.');
        setStoryComms('PIKO','PIKO','İkisi birden doğru olamaz. Komutan… hangisine inanıyorsun?','They cannot both be true. Commander… which one do you believe?');
        setAction('story-mission13-record-action', true);
        setAction('story-mission13-trust-human', false, en ? 'TRUST THE HUMAN RECORD' : 'İNSAN KAYDINA GÜVEN');
        setAction('story-mission13-trust-station', false, en ? 'TRUST THE STATION ARCHIVE' : 'İSTASYON ARŞİVİNE GÜVEN'); return;
    }
    if (session.mission === 14 && session.phase === 'combat') {
        session.phase = 'coreSeal1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'CORE DEFENSE BROKEN · Three seals protect the signal source.' : 'ÇEKİRDEK SAVUNMASI AŞILDI · Sinyal kaynağını üç kilit koruyor.');
        setStoryComms('PIKO','PIKO','Bunlar savunma kilitleri değil. Bir şeyin içeride kalmasını sağlıyorlar.','These are not defense locks. They are keeping something inside.');
        setAction('story-mission14-seal-action', false, en ? 'DISARM SEAL 1 / 3' : '1 / 3. KİLİDİ AÇ');
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK'); return;
    }
    if (session.mission === 14 && session.phase === 'coreSeal1') {
        session.phase = 'coreSeal2'; setStatus(en ? 'SEAL 1 DISARMED · A pulse answers from inside the core.' : '1. KİLİT AÇILDI · Çekirdeğin içinden sinyal cevap veriyor.');
        setStoryComms('UNKNOWN SOURCE','UNKNOWN SOURCE','Piko… beni duyabiliyor musun?','Piko… can you hear me?');
        setAction('story-mission14-seal-action', false, en ? 'DISARM SEAL 2 / 3' : '2 / 3. KİLİDİ AÇ'); return;
    }
    if (session.mission === 14 && session.phase === 'coreSeal2') {
        session.phase = 'coreSeal3'; setStatus(en ? 'SEAL 2 DISARMED · The voiceprint matches the impossible archive.' : '2. KİLİT AÇILDI · Ses izi imkânsız arşivle eşleşiyor.');
        setStoryComms('PIKO','PIKO','Bu ses arşivdeki insan. Neden beni adıyla çağırıyor?','That is the human from the archive. Why are they calling me by name?');
        setAction('story-mission14-seal-action', false, en ? 'DISARM FINAL SEAL' : 'SON KİLİDİ AÇ'); return;
    }
    if (session.mission === 15 && session.phase === 'combat') {
        session.phase = 'repairSystem1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'FEEDBACK DAMAGE · Three systems are unstable. Repair the first before Piko loses more signal integrity.' : 'GERİ BESLEME HASARI · Üç sistem kararsız. Piko daha fazla sinyal bütünlüğü kaybetmeden ilkini onar.');
        setStoryComms('PIKO','PIKO','Sinyal bana bir anıyı geri verdi. Sonra başka bir şeyi aldı. İlk onarımı yapalım… sana söylemem gereken bir şey var.','The pulse gave me a memory for a moment. Then it took something else. Let’s repair the first system… there is something I need to tell you.');
        setAction('story-mission15-repair-action', false, en ? 'REPAIR SYSTEM 1 / 3' : '1 / 3. SİSTEMİ ONAR');
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK'); return;
    }
    if (session.mission === 15 && ['repairSystem1','repairSystem2','repairSystem3'].includes(session.phase)) {
        const repairIndex = Number(session.phase.slice(-1));
        if (repairIndex < 3) {
            session.phase = 'repairSystem' + (repairIndex + 1);
            const nextLabel = en ? 'REPAIR SYSTEM ' + (repairIndex + 1) + ' / 3' : (repairIndex + 1) + ' / 3. SİSTEMİ ONAR';
            setStatus(en ? 'SYSTEM ' + repairIndex + ' RESTORED · Feedback is falling, but one memory channel remains empty.' : repairIndex + '. SİSTEM ONARILDI · Geri besleme azalıyor ama bir hafıza kanalı boş kaldı.');
            setStoryComms('PIKO','PIKO','Hatırlamaya çalışıyorum… sesini duyuyorum ama yüzünü değil. Devam edelim.','I am trying to remember… I can hear the voice, but not the face. Keep going.');
            setAction('story-mission15-repair-action', false, nextLabel); return;
        }
        session.phase = 'complete'; session.completed = true; showStoryMissionResult(); isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 2, mission14Complete: true, mission15Complete: true });
        setStatus(en ? 'SYSTEMS STABLE · Piko has told you what the pulse cost. The missing memory remains missing.' : 'SİSTEMLER KARARLI · Piko, sinyal darbesinin bedelini sana anlattı. Kayıp anı hâlâ geri gelmedi.');
        setStoryComms('PIKO','PIKO','Bir anıyı kaybettim. Hangisi olduğunu bilmiyorum. Bunu senden saklayabilirdim… ama güven, sadece doğru cevapları vermek değil. Bazen neyi bilmediğini söylemektir.','I lost a memory. I do not know which one. I could have hidden that from you… but trust is not just giving the right answers. Sometimes it means admitting what you do not know.');
        setAction('story-mission15-repair-action', true); setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
        showToast(en ? 'Mission 15 complete. Piko’s memory loss is now part of Story Mode progress.' : '15. görev tamamlandı. Piko’nun hafıza kaybı hikâye kaydına işlendi.'); return;
    }
    if (session.mission === 14 && session.phase === 'coreSeal3') {
        session.phase = 'complete'; session.completed = true; showStoryMissionResult(); isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 2, mission13Complete: true, mission14Complete: true });
        setStatus(en ? 'SIGNAL SOURCE LOCATED · A reply comes from beyond the station.' : 'SİNYAL KAYNAĞI BULUNDU · İstasyonun ötesinden yanıt geliyor.');
        setStoryComms('UNKNOWN SOURCE','UNKNOWN SOURCE','Piko’yu geri getirmeyin. Henüz hazır değil.','Do not bring Piko back. It is not ready yet.');
        setAction('story-mission14-seal-action', true); setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
        showToast(en ? 'Mission 14 complete. Core signal traced.' : '14. görev tamamlandı. Çekirdek sinyali izlendi.'); return;
    }

    if (session.mission === 11 && session.phase === 'combat') {
        session.phase = 'relayNode1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'LOWER NETWORK EXPOSED · Send a pulse to the first ancient relay.' : 'ALT AĞ AÇIĞA ÇIKTI · İlk kadim röleye sinyal darbesi gönder.');
        setStoryComms('PİKO','PIKO','Üç röle var. Bunlar kablo değil… sanki istasyonun altına gömülmüş yıldız haritası. Birine dokun, bakalım ne hatırlıyorlar.','Three relays. These are not cables… they look like a star map buried beneath the station. Touch one and see what it remembers.');
        setAction('story-mission11-pulse-action', false, en ? 'PULSE · TRACE RELAY 1 / 3' : 'DARBE · 1 / 3 RÖLEYİ İZLE');
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK');
        return;
    }
    if (session.mission === 11 && session.phase === 'relayNode1') {
        session.phase = 'relayNode2'; session.pulseCount = 1;
        setStatus(en ? 'RELAY 1 MAPPED · The signal draws a constellation absent from every known chart.' : '1. RÖLE HARİTALANDI · Sinyal, bilinen tüm haritalarda bulunmayan bir takımyıldız çiziyor.');
        setStoryComms('KOMUTAN','COMMANDER','Bu bir koordinat değil. Bir şeyin… şeklini gösteriyor.','These are not coordinates. They show the shape of… something.');
        setAction('story-mission11-pulse-action', false, en ? 'PULSE · TRACE RELAY 2 / 3' : 'DARBE · 2 / 3 RÖLEYİ İZLE');
        return;
    }
    if (session.mission === 11 && session.phase === 'relayNode2') {
        session.phase = 'relayNode3'; session.pulseCount = 2;
        setStatus(en ? 'RELAY 2 MAPPED · A dormant signature matches the companion’s core.' : '2. RÖLE HARİTALANDI · Uyuyan bir imza, yoldaşın çekirdeğiyle eşleşiyor.');
        setStoryComms('PİKO','PIKO','Benim çekirdeğim bu istasyonun inşasından önce varmış. Bunu kimseye söylemediğim için değil… şimdiye kadar bilmiyordum.','My core existed before this station was built. Not because I kept it secret… I did not know until now.');
        setAction('story-mission11-pulse-action', false, en ? 'PULSE · TRACE RELAY 3 / 3' : 'DARBE · 3 / 3 RÖLEYİ İZLE');
        return;
    }
    if (session.mission === 11 && session.phase === 'relayNode3') {
        session.phase = 'complete'; session.completed = true; showStoryMissionResult(); isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 2, mission10Complete: true, mission11Complete: true, companionForm: 'cyan' });
        setStatus(en ? 'LOWER NETWORK MAPPED · A final signal answers from far beyond the station.' : 'ALT AĞ HARİTALANDI · Son bir sinyal istasyonun çok ötesinden cevap veriyor.');
        setStoryComms('BİLİNMEYEN SİNYAL','UNKNOWN SIGNAL','PİKO…','PIKO…');
        setAction('story-mission11-pulse-action', true);
        setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
        showToast(en ? 'Mission 11 complete. Lower network map saved.' : '11. görev tamamlandı. Alt ağ haritası kaydedildi.');
        return;
    }

    if (session.mission === 10 && session.phase === 'combat') {
        session.phase = 'pulseNode1'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'CALIBRATION WINDOW OPEN · Direct the pulse at the marked node.' : 'KALİBRASYON PENCERESİ AÇILDI · Darbeyi işaretli düğüme yönelt.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Düğüm görünür değil. Yoldaşın yeni darbesi onu açığa çıkarabilir.','The node is not visible. The companion’s new pulse may reveal it.');
        setAction('story-mission10-pulse-action', false, en ? 'SIGNAL PULSE · REVEAL NODE 1' : 'SİNYAL DARBESİ · 1. DÜĞÜMÜ AÇ');
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK');
        showToast(en ? 'Calibration ready. Use the pulse once to reveal the first node.' : 'Kalibrasyon hazır. İlk düğümü açığa çıkarmak için darbeyi bir kez kullan.');
        return;
    }
    if (session.mission === 10 && session.phase === 'pulseNode1') {
        session.phase = 'pulseNode2'; session.pulseCount = 1; isPaused = true;
        setStatus(en ? 'NODE 1 REVEALED · The pulse did not strike an enemy. It exposed a hidden connection. The lift interface is still sealed.' : '1. DÜĞÜM AÇIĞA ÇIKTI · Darbe düşmanı vurmadı; gizlenmiş bağlantıyı görünür kıldı. Asansör arayüzü hâlâ kapalı.');
        setStoryComms('PİKO','PIKO','Darbe düşmanı vurmadı. Gizlenmiş bağlantıyı görünür kıldı. İkinci düğüm asansörün kilidini tutuyor.','The pulse did not strike an enemy. It revealed a hidden connection. The second node is holding the lift lock.');
        setAction('story-mission10-pulse-action', false, en ? 'SIGNAL PULSE · STABILIZE LIFT' : 'SİNYAL DARBESİ · ASANSÖRÜ SABİTLE');
        showToast(en ? 'Node 1 activated. Node 2 is now traceable.' : '1. düğüm etkinleştirildi. 2. düğüm artık izlenebilir.');
        return;
    }
    if (session.mission === 10 && session.phase === 'pulseNode2') {
        // Let the discovery breathe: denial, impossible admin override, then the companion's memory.
        // Each delayed beat checks that this exact mission session is still active, so exiting
        // during the scene cannot mutate the restored Endless Mode or a later mission.
        session.phase = 'accessReveal'; session.pulseCount = 2; isPaused = true;
        setStatus(en ? 'LIFT OPEN · ACCESS DENIED. No identity record found.' : 'ASANSÖR AÇILDI · ERİŞİM REDDEDİLDİ. Kimlik kaydı bulunamadı.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Erişim reddedildi. Kimlik kaydı bulunamadı.','Access denied. No identity record found.');
        setAction('story-mission10-pulse-action', true);
        setExit(en ? 'ABORT MISSION' : 'GÖREVDEN ÇIK');
        window.setTimeout(() => {
            if (window.__storyBattle !== session || !session.active || session.phase !== 'accessReveal') return;
            session.phase = 'adminVerified';
            setStatus(en ? 'CORRECTION · ADMINISTRATOR ACCESS VERIFIED.' : 'DÜZELTME · YÖNETİCİ ERİŞİMİ DOĞRULANDI.');
            setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Düzeltme: yönetici erişimi doğrulandı.','Correction: administrator access verified.');
            window.setTimeout(() => {
                if (window.__storyBattle !== session || !session.active || session.phase !== 'adminVerified') return;
                session.phase = 'complete'; session.completed = true; showStoryMissionResult();
                setStatus(en ? 'LIFT STABLE · DESCENT ACCESS GRANTED.' : 'ASANSÖR SABİT · ALT KAT ERİŞİMİ AÇILDI.');
                setStoryComms('KOMUTAN','COMMANDER','Sistemde kaydın yok. Nasıl yönetici olabilirsin?','You have no identity record in this system. How can you be an administrator?');
                window.setTimeout(() => {
                    if (window.__storyBattle !== session || !session.active || session.phase !== 'complete') return;
                    setStoryComms('PİKO','PIKO','Bilmiyorum. Ama kapı açılınca… içimde bir şey hatırladı.','I don’t know. But when the door opened… something inside me remembered.');
                    saveStoryProgress({ introSeen: true, chapter: 2, mission10Complete: true, pulseTutorialComplete: true });
                    setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
                    showToast(en ? 'Mission 10 complete. Pulse tutorial progress saved.' : '10. görev tamamlandı. Darbe öğreticisi ilerlemesi kaydedildi.');
                }, 1500);
            }, 1300);
        }, 1000);
        return;
    }

    if (session.mission === 3 && session.phase === 'investigate') {
        session.completed = true; showStoryMissionResult(); isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 1, mission3Complete: true, routeChoice: session.routeChoice });
        if (session.routeChoice === 'array') {
            setStatus(en ? 'EVIDENCE RECOVERED · The antenna log shows the signal bouncing from inside the station.' : 'KANIT KURTARILDI · Anten kaydı, sinyalin istasyonun içinden yansıdığını gösteriyor.');
            setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Anten sinyali dışarıdan almamış. İstasyonun içindeki bir kaydı yeniden yayıyor.','The antenna did not receive the signal from outside. It is repeating a recording from inside the station.');
        } else {
            setStatus(en ? 'EVIDENCE RECOVERED · The black-box log contains a voice fragment recorded before shutdown.' : 'KANIT KURTARILDI · Karakutu kaydında kapanıştan önce kaydedilmiş bir ses parçası var.');
            setStoryComms('KOMUTAN','COMMANDER','Bu ses istasyon kapanmadan önce kaydedilmiş. Peki neden mavi görüntüyle aynı?','This voice was recorded before the station shut down. Then why does it match the blue image?');
        }
        setAction('story-investigation-actions', true);
        setExit(en ? 'CONTINUE' : 'DEVAM ET');
        showToast(en ? 'Mission 03 complete. Evidence saved separately.' : '3. görev tamamlandı. Kanıt ayrı kaydedildi.');
        return;
    }

    if (session.mission === 6 && session.phase === 'repair') {
        session.repairs = Math.min(3, (session.repairs || 0) + 1);
        if (session.repairs < 3) {
            setStatus(en ? 'CONNECTION ' + session.repairs + '/3 RESTORED · The companion found another damaged panel.' : 'BAĞLANTI ' + session.repairs + '/3 ONARILDI · Yoldaş başka bir hasarlı panel buldu.');
            setAction('story-repair-action', false, en ? 'REPAIR CONNECTION ' + (session.repairs + 1) + '/3' : 'BAĞLANTIYI ONAR ' + (session.repairs + 1) + '/3');
            setStoryComms('PİKO','PIKO','Bir bağlantı daha tamamlandı. Bu ses… tanıdık geliyor. Nedenini bilmiyorum.','One more connection restored. This sound… feels familiar. I do not know why.');
            showToast(en ? 'Connection restored (' + session.repairs + '/3).' : 'Bağlantı onarıldı (' + session.repairs + '/3).');
            return;
        }
        session.completed = true; showStoryMissionResult();
        saveStoryProgress({ introSeen: true, chapter: 1, mission6Complete: true });
        setStatus(en ? 'MISSION COMPLETE · The companion emits a brief cyan flicker while repairing the last panel, then returns to its dim maintenance state.' : 'GÖREV TAMAMLANDI · Yoldaş son paneli onarırken kısa bir camgöbeği ışık yayıyor, ardından yeniden sönük bakım hâline dönüyor.');
        setStoryComms('PİKO','PIKO','Ben bunu yapmayı nereden biliyorum? Bu hareket… benden önce de varmış gibi.','How do I know how to do this? This movement feels like it existed before me.');
        setAction('story-repair-action', true);
        setExit(en ? 'CONTINUE' : 'DEVAM ET');
        showToast(en ? 'Mission 06 complete. The flicker is logged, not an evolution.' : '6. görev tamamlandı. Işık kaydedildi; bu henüz evrim değil.');
        return;
    }

    if (session.mission === 8 && session.phase === 'memory') {
        session.memories = Math.min(3, (session.memories || 0) + 1);
        const clues = en
            ? ['Clue 1: the shutdown marks this room as empty, but the dust pattern shows recent movement.', 'Clue 2: the blue echo speaks before the station records the first incoming signal.', 'Clue 3: a violet silhouette stands beside the commander; the face and identity are missing.']
            : ['İpucu 1: kapanış kaydı odayı boş gösteriyor, ancak toz izi yakın zamanda hareket olduğunu söylüyor.', 'İpucu 2: mavi yankı, istasyonun ilk gelen sinyali kaydetmesinden önce konuşuyor.', 'İpucu 3: komutanın yanında mor bir siluet var; yüzü ve kimliği kayıp.'];
        if (session.memories < 3) {
            setStatus(clues[session.memories - 1] + (en ? ' Inspect the next trace.' : ' Sonraki izi incele.'));
            setAction('story-memory-action', false, en ? 'INSPECT MEMORY TRACE ' + (session.memories + 1) + '/3' : 'HAFIZA İZİNİ İNCELE ' + (session.memories + 1) + '/3');
            showToast(en ? 'Memory clue recovered (' + session.memories + '/3).' : 'Hafıza ipucu bulundu (' + session.memories + '/3).');
            return;
        }
        session.completed = true; showStoryMissionResult();
        saveStoryProgress({ introSeen: true, chapter: 1, mission8Complete: true });
        setStatus(en ? 'MISSION COMPLETE · The echo and the station log disagree. The violet silhouette remains unidentified.' : 'GÖREV TAMAMLANDI · Yankı ile istasyon kaydı çelişiyor. Mor siluetin kimliği hâlâ belirsiz.');
        setStoryComms('KOMUTAN','COMMANDER','O görüntü beni tanıyor olabilir. Ama onu tanıdığımı kanıtlayan hiçbir şey yok.','That image may know me. But nothing proves that I know it.');
        setAction('story-memory-action', true);
        setExit(en ? 'CONTINUE' : 'DEVAM ET');
        showToast(en ? 'Mission 08 complete. The contradiction is recorded.' : '8. görev tamamlandı. Çelişki kaydedildi.');
        return;
    }

    if (session.mission === 9 && session.phase === 'reconnect') {
        session.phase = 'awaken'; isPaused = true;
        setStatus(en ? 'CONNECTION RESTORED · The companion chooses to stay and protect the core. A dormant signal is responding.' : 'BAĞLANTI KURULDU · Yoldaş çekirdeği korumak için kalmayı seçiyor. Uyuyan bir sinyal cevap veriyor.');
        setStoryComms('KOMUTAN','COMMANDER','Seni kaybetmeyeceğim. Bağlantıyı yeniden kuruyoruz—şimdi!','I will not lose you. We are restoring the link—now!');
        setAction('story-reconnect-action', true);
        setAction('story-awaken-action', false);
        return;
    }
    if (session.mission === 9 && session.phase === 'awaken') {
        session.phase = 'pulseTest'; session.companionSynced = true; isPaused = true;
        setStatus(en ? 'CYAN FORM AWAKENED · The companion is no longer just a maintenance unit. Test its new signal pulse.' : 'CAMGÖBEĞİ FORM UYANDI · Yoldaş artık yalnızca bir bakım birimi değil. Yeni sinyal darbesini dene.');
        setStoryComms('PİKO','PIKO','Ben… bunu daha önce yaptım. Bu ışık benim değil. Bu ışık benim hatırladığım şey.','I… have done this before. This light is not mine. It is what I remember.');
        setAction('story-awaken-action', true);
        setAction('story-pulse-action', false);
        const companionChip = document.getElementById('story-companion-chip');
        const companionIcon = document.getElementById('story-companion-icon');
        const companionState = document.getElementById('story-companion-state');
        if (companionChip) companionChip.classList.add('is-synced');
        if (companionIcon) companionIcon.textContent = '✦';
        if (companionState) companionState.textContent = en ? 'CYAN FORM · SIGNAL STABLE' : 'CAMGÖBEĞİ FORM · SİNYAL KARARLI';
        return;
    }
    if (session.mission === 9 && session.phase === 'pulseTest') {
        session.completed = true; showStoryMissionResult(); session.companionSynced = true; isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 1, mission9Complete: true, companionForm: 'cyan' });
        setStatus(en ? 'CHAPTER COMPLETE · The pulse answers. For one frame, the blue echo and the companion share the same silhouette—then the recording breaks again.' : 'BÖLÜM TAMAMLANDI · Darbe cevap veriyor. Bir anlığına mavi yankı ile yoldaş aynı silueti paylaşıyor; ardından kayıt yeniden bozuluyor.');
        setStoryComms('MAVİ YANKI','BLUE ECHO','Uyanma. Henüz değil. Eğer beni duyabiliyorsan… istasyonun altında ne olduğunu unutma.','Do not wake. Not yet. If you can hear me… do not forget what lies beneath the station.');
        setAction('story-pulse-action', true);
        setExit(en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN');
        showToast(en ? 'Chapter 01 complete. Companion form saved.' : '1. bölüm tamamlandı. Yoldaşın formu kaydedildi.');
        return;
    }

    if (session.mission === 5 && session.phase === 'relay') {
        session.completed = true; showStoryMissionResult(); isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 1, mission5Complete: true });
        setStatus(en ? 'MISSION COMPLETE · The relay is silent. The recovered packet carries the same broken voice as the blue echo.' : 'GÖREV TAMAMLANDI · Röle sustu. Kurtarılan pakette mavi yankıyla aynı bozuk ses var.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Röle açığa çıktı. Paket, mavi yankıdaki ses örüntüsüyle eşleşiyor.','The relay is exposed. Its packet matches the voice pattern in the blue echo.');
        setAction('story-relay-action', true);
        setExit(en ? 'CONTINUE' : 'DEVAM ET');
        showToast(en ? 'Mission 05 complete. Story progress saved.' : '5. görev tamamlandı. Hikâye ilerlemesi kaydedildi.');
        return;
    }
    if (session.mission === 7 && session.phase === 'amplifier') {
        session.completed = true; showStoryMissionResult(); isPaused = true;
        saveStoryProgress({ introSeen: true, chapter: 1, mission7Complete: true });
        setStatus(en ? 'MISSION COMPLETE · The signal loops from inside the station. The antenna was not receiving it—it was repeating it.' : 'GÖREV TAMAMLANDI · Sinyal istasyonun içinden döngüye giriyor. Anten onu almıyordu; tekrar yayıyordu.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Sinyal dışarıdan gelmiyor. Döngü, istasyonun içinden besleniyor.','The signal is not coming from outside. The loop is being fed from inside the station.');
        setAction('story-amplifier-action', true);
        setExit(en ? 'CONTINUE' : 'DEVAM ET');
        showToast(en ? 'Mission 07 complete. Signal origin narrowed down.' : '7. görev tamamlandı. Sinyalin kaynağı daraltıldı.');
        return;
    }

    if (session.mission === 9 && session.phase === 'combat') {
        session.phase = 'combat2'; game.wave = 2; game.highestWave = 2; game.waveKills = 0; game.waveTargetKills = 12; spawnTimer = 0; isPaused = false; enemies = []; projectiles = [];
        setStatus(en ? 'SECOND CONTACT · The signal is adapting. Survive the next wave to reach the core link.' : 'İKİNCİ TEMAS · Sinyal uyum sağlıyor. Çekirdek bağlantısına ulaşmak için sonraki dalgayı atlat.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Tehdit örüntüsü değişti. İlk savunma yalnızca bir yoklamaydı.','Threat pattern changed. The first assault was only a probe.');
        showToast(en ? 'Final phase 2/3 · Threat pattern changed.' : 'Final aşaması 2/3 · Tehdit örüntüsü değişti.');
        return;
    }
    if (session.mission === 9 && session.phase === 'combat2') {
        session.phase = 'combat3'; game.wave = 3; game.highestWave = 3; game.waveKills = 0; game.waveTargetKills = 14; spawnTimer = 0; isPaused = false; enemies = []; projectiles = [];
        setStatus(en ? 'CORE BREACH · The hostile signal is forcing its way into the core. Hold the final line.' : 'ÇEKİRDEK İHLALİ · Düşman sinyali çekirdeğe girmeye çalışıyor. Son savunma hattını koru.');
        setStoryComms('PİKO','PIKO','Çekirdeğin önüne geçiyorum. Bu kez seni korumayı ben seçeceğim.','I am moving in front of the core. This time, I choose to protect you.');
        showToast(en ? 'Final phase 3/3 · Protect the core.' : 'Final aşaması 3/3 · Çekirdeği koru.');
        return;
    }
    if (session.mission === 9 && session.phase === 'combat3') {
        session.phase = 'reconnect'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'CORE UNDER PRESSURE · The hostile signal is trying to sever the companion’s link. Reconnect before the core fails.' : 'ÇEKİRDEK BASKI ALTINDA · Düşman sinyali yoldaşın bağlantısını kesmeye çalışıyor. Çekirdek düşmeden bağlantıyı kur.');
        setStoryComms('KOMUTAN','COMMANDER','Seni kaybetmeyeceğim. Bağlantıyı yeniden kuruyoruz—şimdi!','I will not lose you. We are restoring the link—now!');
        setAction('story-reconnect-action', false);
        showToast(en ? 'Final defense survived. Reconnect with the companion.' : 'Son savunmadan sağ çıktın. Yoldaşla bağlantıyı kur.');
        return;
    }
    if (session.mission === 7 && session.phase === 'combat') {
        session.phase = 'combat2'; game.wave = 2; game.highestWave = 2; game.waveKills = 0; game.waveTargetKills = 10; spawnTimer = 0; isPaused = false; enemies = []; projectiles = [];
        setStatus(en ? 'SECOND CONTACT · The array draws a heavier patrol. Keep the line stable.' : 'İKİNCİ TEMAS · Dizi daha ağır bir devriye çekiyor. Savunma hattını koru.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Yükselticiyi kapatmak için diziye birkaç saniye daha kazandır.','Buy the array a few more seconds so we can shut down the amplifier.');
        showToast(en ? 'Second defense phase · Reinforcements detected.' : 'İkinci savunma aşaması · Takviye tespit edildi.');
        return;
    }
    if (session.mission === 7 && session.phase === 'combat2') {
        session.phase = 'amplifier'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'ARRAY STABLE · The amplifier is exposed. Shut it down to trace the signal’s direction.' : 'DİZİ GÜVENDE · Yükseltici açığa çıktı. Sinyalin yönünü izlemek için onu kapat.');
        setAction('story-amplifier-action', false);
        showToast(en ? 'Amplifier exposed. Disable it to finish.' : 'Yükseltici açığa çıktı. Bitirmek için kapat.');
        return;
    }
    if (session.mission === 5 && session.phase === 'combat') {
        session.phase = 'combat2'; game.wave = 2; game.highestWave = 2; game.waveKills = 0; game.waveTargetKills = 10; spawnTimer = 0; isPaused = false; enemies = []; projectiles = [];
        setStatus(en ? 'RELAY GUARD · The signal is protecting its source. Defeat the reinforcements to expose the relay.' : 'RÖLE KORUMASI · Sinyal kaynağını koruyor. Röleyi açığa çıkarmak için takviyeleri durdur.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','İlk grup yalnızca öncüydü. Röleye erişim açılana kadar savunmayı sürdür.','The first group was only a vanguard. Hold the defense until the relay access opens.');
        showToast(en ? 'Second defense phase · Relay guards incoming.' : 'İkinci savunma aşaması · Röle muhafızları geliyor.');
        return;
    }
    if (session.mission === 5 && session.phase === 'combat2') {
        session.phase = 'relay'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'CORRIDOR SECURE · The relay is exposed. Shut it down before the signal loops again.' : 'KORİDOR GÜVENDE · Röle açığa çıktı. Sinyal yeniden döngüye girmeden kapat.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Röle açığa çıktı. Paket, mavi yankıdaki ses örüntüsüyle eşleşiyor.','The relay is exposed. Its packet matches the voice pattern in the blue echo.');
        setAction('story-relay-action', false);
        showToast(en ? 'Relay exposed. Disable it to finish the mission.' : 'Röle açığa çıktı. Görevi bitirmek için kapat.');
        return;
    }
    if (session.mission === 2 && session.phase === 'combat') {
        session.phase = 'scan'; isPaused = true; enemies = []; projectiles = [];
        setStatus(en ? 'PATROL CLEARED · Scan the three signal traces. The companion has marked the first trace.' : 'DEVRİYE TEMİZLENDİ · Üç sinyal izini tara. Yoldaş ilk izi işaretledi.');
        setStoryComms('PİKO','PIKO','İlk iz burada. Zaman damgası istasyonun kapanışından daha eski görünüyor.','The first trace is here. Its timestamp appears older than the station shutdown.');
        setAction('story-scan-action', false, en ? 'SCAN TRACE 1 / 3' : 'SİNYAL İZİNİ TARA 1 / 3');
        showToast(en ? 'Patrol cleared. Follow the companion’s scan markers.' : 'Devriye temizlendi. Yoldaşın tarama işaretlerini takip et.');
        return;
    }

    // Only missions 1 and 2 use the generic combat/scan completion path below.
    // Unknown or out-of-order phases must never fall through and falsely award mission 2.
    if (![1, 2].includes(session.mission)) return;

    session.completed = true; showStoryMissionResult(); isPaused = true; enemies = []; projectiles = [];
    if (session.mission === 1) {
        session.companionSynced = true;
        saveStoryProgress({ introSeen: true, chapter: 1, mission1Complete: true });
        setStatus(en ? 'MISSION COMPLETE · The core is stable. The maintenance companion has synchronized with you; one signal fragment recovered.' : 'GÖREV TAMAMLANDI · Çekirdek güvende. Bakım yoldaşı seninle eşitlendi; sinyalin bir parçası kurtarıldı.');
        setStoryComms('İSTASYON YAPAY ZEKÂSI','STATION AI','Çekirdek kararlı. Yoldaş bağlantı kurdu; fakat mavi yankının kimliği hâlâ bilinmiyor.','Core stable. The companion has linked, but the blue echo’s identity remains unknown.');
    } else {
        saveStoryProgress({ introSeen: true, chapter: 1, mission2Complete: true });
        setStatus(en ? 'MISSION COMPLETE · Three traces recovered. One timestamp predates the station shutdown.' : 'GÖREV TAMAMLANDI · Üç iz kurtarıldı. Zaman damgalarından biri istasyonun kapanmasından daha eski.');
        setStoryComms('PİKO','PIKO','Bu kayıt kapanıştan önceye ait. Sinyal neden buradaydı?','This record predates the shutdown. Why was the signal already here?');
    }
    setAction('story-scan-action', true);
    setExit(en ? 'CONTINUE' : 'DEVAM ET');
    const companionChip = document.getElementById('story-companion-chip');
    const companionState = document.getElementById('story-companion-state');
    const companionIcon = document.getElementById('story-companion-icon');
    if (companionChip) companionChip.classList.toggle('is-synced', session.mission === 1);
    if (companionState && session.mission === 1) companionState.textContent = en ? 'LINK ESTABLISHED · CORE STABLE' : 'BAĞLANTI KURULDU · ÇEKİRDEK GÜVENDE';
    if (companionIcon && session.mission === 1) companionIcon.textContent = '✦';
    showToast(en ? 'Mission complete. Story progress saved separately.' : 'Görev tamamlandı. Hikâye ilerlemesi ayrı kaydedildi.');
}
function scanStorySignal() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 2 || session.phase !== 'scan' || session.completed) return;
    session.scans = Math.min(3, (session.scans || 0) + 1);
    const en = storyLanguage() === 'en';
    const clues = en
        ? ['Trace 1: a weak pulse repeats every 4.2 seconds.', 'Trace 2: the timestamp predates the station shutdown.', 'Trace 3: the echo contains a voiceprint that matches the blue hologram.']
        : ['İz 1: zayıf bir sinyal her 4,2 saniyede bir tekrarlanıyor.', 'İz 2: zaman damgası istasyonun kapanışından daha eski.', 'İz 3: yankıda mavi hologramla eşleşen bir ses izi var.'];
    const status = document.getElementById('story-battle-status');
    if (session.scans >= 3) {
        if (status) status.textContent = clues[2] + (en ? ' All three traces are stored.' : ' Üç iz de kaydedildi.');
        setStoryComms('PİKO','PIKO','Bu ses… sanki benim içimden geliyor. Ama ben bu kaydı hiç yaşamadım.','This voice… it feels like it comes from inside me. But I have never lived this recording.');
        finishStoryBattleEncounter();
        return;
    }
    if (status) status.textContent = clues[session.scans - 1] + (en ? ' Continue scanning.' : ' Taramaya devam et.');
    const action = document.getElementById('story-scan-action');
    if (action) action.textContent = en ? 'SCAN TRACE ' + (session.scans + 1) + ' / 3' : 'SİNYAL İZİNİ TARA ' + (session.scans + 1) + ' / 3';
    setStoryComms('PİKO','PIKO','Bir iz daha. Bu sinyal kapanıştan önce varmış.','One more trace. This signal existed before the shutdown.');
    showToast(en ? 'Signal trace recovered (' + session.scans + '/3).' : 'Sinyal izi kurtarıldı (' + session.scans + '/3).');
}
function inspectStoryMemory() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 8 || session.phase !== 'memory' || session.completed) return;
    finishStoryBattleEncounter();
}
function inspectStoryVoiceRecord() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 13 || !['voice1','voice2'].includes(session.phase) || session.completed || isPaused !== true || session.voiceBusy) return;
    session.voiceBusy = true; const previousPhase = session.phase; finishStoryBattleEncounter();
    if (window.__storyBattle === session && session.phase !== previousPhase) session.voiceBusy = false;
}
function chooseStoryVoice(choice) {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 13 || session.phase !== 'voiceChoice' || session.completed || isPaused !== true || session.choiceBusy || !['human','station'].includes(choice)) return;
    session.choiceBusy = true; session.phase = 'complete'; session.completed = true; showStoryMissionResult();
    saveStoryProgress({ introSeen: true, chapter: 2, mission12Complete: true, mission13Complete: true, voiceChoice: choice });
    const en = storyLanguage() === 'en';
    const status = document.getElementById('story-battle-status');
    if (status) status.textContent = choice === 'human' ? (en ? 'DECISION SAVED · You trust the human testimony.' : 'KARAR KAYDEDİLDİ · İnsan tanıklığına güvendin.') : (en ? 'DECISION SAVED · You trust the station archive; a possible forgery is flagged.' : 'KARAR KAYDEDİLDİ · İstasyon arşivine güvendin; olası sahte imza işaretlendi.');
    setStoryComms('PIKO','PIKO', choice === 'human' ? 'Bir anı… sıcak ışık ve biri bana Piko diyor. Bu gerçek mi?' : 'Bana inanmadın. Belki haklısın. Ama arşivin imzası sahteyse biri bizi yönlendiriyor.', choice === 'human' ? 'A memory… warm light, and someone calling me Piko. Is it real?' : 'You did not believe me. Maybe you are right. But if the signature is forged, someone is steering us.');
    const h = document.getElementById('story-mission13-trust-human'); const s = document.getElementById('story-mission13-trust-station');
    if (h) h.hidden = true; if (s) s.hidden = true;
    const exit = document.getElementById('story-battle-exit'); if (exit) exit.textContent = en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN';
    showToast(en ? 'Mission 13 complete. Your choice has been saved.' : '13. görev tamamlandı. Seçimin kaydedildi.');
}
function inspectStoryArchive() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 12 || !['archive1','archive2','archive3'].includes(session.phase) || session.completed || isPaused !== true || session.archiveBusy) return;
    session.archiveBusy = true;
    const previousPhase = session.phase;
    finishStoryBattleEncounter();
    window.setTimeout(() => {
        if (window.__storyBattle !== session || !session.active) return;
        if (session.phase !== previousPhase) session.archiveBusy = false;
    }, 450);
}
function pulseStoryMission11() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 11 || !['relayNode1','relayNode2','relayNode3'].includes(session.phase) || session.completed || isPaused !== true || session.pulseBusy) return;
    session.pulseBusy = true;
    const previousPhase = session.phase;
    finishStoryBattleEncounter();
    window.setTimeout(() => {
        if (window.__storyBattle !== session || !session.active) return;
        if (session.phase !== previousPhase) session.pulseBusy = false;
    }, 350);
}
function pulseStoryMission10() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 10 || !['pulseNode1','pulseNode2'].includes(session.phase) || session.completed || isPaused !== true || session.pulseBusy) return;

    // A fast double-tap must never skip both tutorial nodes in one gesture.
    session.pulseBusy = true;
    session.pulseVisualAt = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const previousPhase = session.phase;
    finishStoryBattleEncounter();
    window.setTimeout(() => {
        if (window.__storyBattle !== session || !session.active) return;
        // Release only after the phase transition has settled.
        if (session.phase !== previousPhase) session.pulseBusy = false;
    }, 700);
}
function reconnectStoryCompanion() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 9 || session.phase !== 'reconnect' || session.completed) return;
    finishStoryBattleEncounter();
}
function awakenStoryCompanion() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 9 || session.phase !== 'awaken' || session.completed) return;
    finishStoryBattleEncounter();
}
function testStoryPulse() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 9 || session.phase !== 'pulseTest' || session.completed) return;
    finishStoryBattleEncounter();
}

function startStoryChapter2CombatStage(targetKills, statusTr, statusEn) {
    const session = window.__storyBattle;
    if (!session || !session.active || session.completed) return;
    enemies = []; projectiles = [];
    game.wave = 1; game.highestWave = 1; game.waveKills = 0; game.waveTargetKills = targetKills; game.holdWave = false;
    spawnTimer = 0; cargoSpawnTimer = 999999; isDefeated = false; defeatTimer = 0; gameSpeed = 1; isPaused = false;
    const action = document.getElementById('story-chapter2-action'); if (action) action.hidden = true;
    const human = document.getElementById('story-chapter2-route-human'); if (human) human.hidden = true;
    const archive = document.getElementById('story-chapter2-route-archive'); if (archive) archive.hidden = true;
    const status = document.getElementById('story-battle-status'); if (status) status.textContent = storyLanguage() === 'en' ? statusEn : statusTr;
    if (typeof updateHUD === 'function') updateHUD();
}
function continueStoryChapter2Mission() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.completed || isPaused !== true) return;
    if (session.mission === 19 && session.phase === 'navigationScan') return finishStoryBattleEncounter();
    if (session.mission === 20 && session.phase === 'selectivePulse') return finishStoryBattleEncounter();
    if (session.mission === 21 && ['fragmentScan','archiveRebuild'].includes(session.phase)) return finishStoryBattleEncounter();
    if (session.mission === 16 && ['routeScan1','routeScan2'].includes(session.phase)) return finishStoryBattleEncounter();
    if (session.mission === 17 && ['archive1','archive2'].includes(session.phase)) return finishStoryBattleEncounter();
    if (session.mission === 18 && ['relay1','relay2','finalLock'].includes(session.phase)) return finishStoryBattleEncounter();
}
function chooseStoryChapter2CallSign(choice) {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 17 || session.phase !== 'callSign' || session.completed || isPaused !== true) return;
    if (!['echo','piko'].includes(choice)) return;
    session.callSign = choice; session.phase = 'complete'; session.completed = true; showStoryMissionResult(); isPaused = true;
    saveStoryProgress({ introSeen: true, chapter: 2, mission16Complete: true, mission17Complete: true, callSignChoice: choice });
    const en = storyLanguage() === 'en';
    const status = document.getElementById('story-battle-status');
    if (status) status.textContent = choice === 'echo'
        ? (en ? 'CALL SIGN CHOSEN · Piko chooses Echo for the archive mission.' : 'ÇAĞRI ADI SEÇİLDİ · Piko arşiv görevi için Yankı adını seçti.')
        : (en ? 'CALL SIGN CHOSEN · Piko keeps its own name and refuses the archive designation.' : 'ÇAĞRI ADI SEÇİLDİ · Piko kendi adını korudu ve arşiv unvanını reddetti.');
    setStoryComms('PIKO','PIKO',
        choice === 'echo' ? 'Yankı. Kayıtlar beni ne olarak çağırırsa çağırsın, bu adı ben seçtim.' : 'Piko. Bu isim bana verilmiş olabilir, ama artık onu ben taşıyorum.',
        choice === 'echo' ? 'Echo. Whatever the archive calls me, I chose this name.' : 'Piko. Maybe this name was given to me, but I carry it by choice now.');
    const human = document.getElementById('story-chapter2-route-human'); if (human) human.hidden = true;
    const archive = document.getElementById('story-chapter2-route-archive'); if (archive) archive.hidden = true;
    const action = document.getElementById('story-chapter2-action'); if (action) action.hidden = true;
    const exit = document.getElementById('story-battle-exit'); if (exit) exit.textContent = en ? 'RETURN TO CHAPTER BOARD' : 'GÖREV PANOSUNA DÖN';
    showToast(en ? 'Mission 17 complete. Your call sign choice is saved in Story progress.' : '17. görev tamamlandı. Çağrı adı seçimin hikâye ilerlemesine kaydedildi.');
}

function repairStoryMission15System() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 15 || !['repairSystem1','repairSystem2','repairSystem3'].includes(session.phase) || session.completed) return;
    finishStoryBattleEncounter();
}
function repairStoryConnection() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 6 || session.phase !== 'repair' || session.completed) return;
    finishStoryBattleEncounter();
}
function disableStoryAmplifier() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 7 || session.phase !== 'amplifier' || session.completed) return;
    finishStoryBattleEncounter();
}
function chooseStoryPowerPriority(choice) {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 4 || session.phase !== 'powerChoice' || session.completed) return;
    if (choice !== 'shield' && choice !== 'weapon') return;
    session.completed = true; showStoryMissionResult(); isPaused = true;
    saveStoryProgress({ introSeen: true, chapter: 1, mission4Complete: true, powerChoice: choice });
    const status = document.getElementById('story-battle-status');
    if (status) status.textContent = choice === 'shield'
        ? (storyLanguage() === 'en' ? 'POWER ROUTED · The core shield is reinforced. The next corridor will be safer, but weapons remain standard.' : 'GÜÇ YÖNLENDİRİLDİ · Çekirdek kalkanı güçlendirildi. Sonraki koridor daha güvenli olacak, silahlar standart kalacak.')
        : (storyLanguage() === 'en' ? 'POWER ROUTED · Weapon calibration is improved. You will hit harder in the next corridor, but have no extra shield.' : 'GÜÇ YÖNLENDİRİLDİ · Silah kalibrasyonu iyileştirildi. Sonraki koridorda daha sert vuracaksın ama ek kalkanın olmayacak.');
    const choices = document.getElementById('story-power-actions'); if (choices) choices.hidden = true;
    const exit = document.getElementById('story-battle-exit'); if (exit) exit.textContent = storyLanguage() === 'en' ? 'CONTINUE' : 'DEVAM ET';
    showToast(storyLanguage() === 'en' ? 'Power priority saved. It affects Mission 05.' : 'Güç tercihi kaydedildi. 5. görevi etkileyecek.');
}
function disableStoryRelay() {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 5 || session.phase !== 'relay' || session.completed) return;
    finishStoryBattleEncounter();
}
function chooseStorySignalSource(source) {
    const session = window.__storyBattle;
    if (!session || !session.active || session.mission !== 3 || session.phase !== 'investigate' || session.completed) return;
    if (source !== 'array' && source !== 'blackbox') return;
    session.routeChoice = source;
    finishStoryBattleEncounter();
}
function exitStoryBattle(toMainMenu = false) {
    const session = window.__storyBattle;
    if (!session || !session.active || !session.snapshot) return;
    const s = session.snapshot;
    game = s.game; tower = s.tower; enemies = s.enemies; projectiles = s.projectiles;
    particles = s.particles; floatingTexts = s.floatingTexts; lightningBeams = s.lightningBeams;
    rings = s.rings; cargoDrones = s.cargoDrones;
    spawnTimer = s.spawnTimer; playTimeAccum = s.playTimeAccum; waveFrostSpawns = s.waveFrostSpawns;
    cargoSpawnTimer = s.cargoSpawnTimer; gameSpeed = s.gameSpeed; isPaused = s.isPaused;
    isDefeated = s.isDefeated; defeatTimer = s.defeatTimer;
    document.body.dataset.gameMode = s.gameMode;
    window.__storyBattle = { active: false, completed: session.completed };
    const resultOverlay = document.getElementById('story-mission-result');
    if (resultOverlay) { resultOverlay.hidden = true; resultOverlay.setAttribute('aria-hidden', 'true'); }
    const hud = document.getElementById('story-battle-hud');
    if (hud) { hud.hidden = true; hud.classList.remove('is-active'); }
    if (typeof updateHUD === 'function') updateHUD();
    if (typeof refreshUpgradeButtonsState === 'function') refreshUpgradeButtonsState();
    if (typeof updateHoldWaveButton === 'function') updateHoldWaveButton();
    if (typeof updateStoryUnlockUI === 'function') updateStoryUnlockUI();
    if (toMainMenu) {
        closeStoryMode();
        return;
    }
    const screen = document.getElementById('story-mode-screen');
    const menu = document.getElementById('mode-main-menu');
    if (menu) menu.classList.add('menu-hidden');
    if (screen) { screen.classList.add('is-open'); screen.setAttribute('aria-hidden', 'false'); }
    storyMissionViewOpen = true;
    const dialogue = document.getElementById('story-dialogue-view');
    const missions = document.getElementById('story-mission-view');
    const note = document.getElementById('story-prototype-note');
    if (dialogue) dialogue.hidden = true;
    if (missions) missions.hidden = false;
    if (note) note.classList.add('is-visible');
    const progress = document.getElementById('story-mission-progress');
    if (progress) progress.textContent = storyCopy(STORY_UI_COPY.completed);
    applyStoryUiLanguage();
    updateStoryMissionBoard();
}
function getStoryUnlockWave() {
    try {
        if (typeof game !== 'undefined' && game) return Math.max(Number(game.highestWave) || 1, Number(game.wave) || 1);
    } catch (_) {}
    return 1;
}
function updateStoryUnlockUI() {
    const wave = getStoryUnlockWave();
    const cleared = Math.max(0, wave - 1);
    const unlocked = cleared >= 25;
    const action = document.getElementById('mode-story-action');
    const button = document.getElementById('mode-story-button');
    if (action) action.innerHTML = unlocked
        ? (storyLanguage() === 'en' ? 'ENTER CHAPTER <span aria-hidden="true">→</span>' : 'BÖLÜME GİR <span aria-hidden="true">→</span>')
        : (storyLanguage() === 'en' ? `CLEAR 25 WAVES · ${Math.min(25, cleared)}/25 <span aria-hidden="true">🔒</span>` : `İLK 25 DALGAYI TAMAMLA · ${Math.min(25, cleared)}/25 <span aria-hidden="true">🔒</span>`);
    if (button) {
        button.setAttribute('aria-disabled', unlocked ? 'false' : 'true');
        button.classList.toggle('story-locked', !unlocked);
    }
    return unlocked;
}
function openStoryMode() {
    if (!updateStoryUnlockUI()) {
        const subtitle = document.getElementById('mode-menu-subtitle');
        if (subtitle) subtitle.textContent = storyLanguage() === 'en'
            ? `Clear the first 25 waves in Endless Mode to unlock Story Mode. Progress: ${Math.min(25, Math.max(0, getStoryUnlockWave() - 1))}/25.`
            : `Hikâye Modu’nu açmak için Sonsuz Mod’da ilk 25 dalgayı tamamla. İlerlemen: ${Math.min(25, Math.max(0, getStoryUnlockWave() - 1))}/25.`;
        if (typeof showToast === 'function') showToast(storyLanguage() === 'en' ? 'Clear 25 waves in Endless Mode to unlock Story Mode.' : 'Hikâye Modu, Sonsuz Mod’da ilk 25 dalgayı tamamlayınca açılır.');
        return;
    }
    const screen = document.getElementById('story-mode-screen');
    const menu = document.getElementById('mode-main-menu');
    if (!screen) return;
    if (menu) menu.classList.add('menu-hidden');
    if (typeof isPaused !== 'undefined') isPaused = true;
    finishStoryTyping();
    storyMissionViewOpen = false;
    storyDialogueIndex = 0;
    const dialogue = document.getElementById('story-dialogue-view');
    const mission = document.getElementById('story-mission-view');
    const note = document.getElementById('story-prototype-note');
    if (dialogue) dialogue.hidden = false;
    if (mission) mission.hidden = true;
    if (note) note.classList.remove('is-visible');
    screen.classList.add('is-open');
    screen.setAttribute('aria-hidden', 'false');
    applyStoryUiLanguage();
    showStoryDialogue();
    const exit = screen.querySelector('.story-exit');
    if (exit) exit.focus({ preventScroll: true });
}
function advanceStoryDialogue() {
    if (storyMissionViewOpen) return;
    // First tap reveals the rest of the current line; the next tap advances.
    if (storyTypingTimer !== null) { finishStoryTyping(); return; }
    if (storyDialogueIndex < STORY_DIALOGUES.length - 1) {
        storyDialogueIndex++;
        showStoryDialogue();
        return;
    }
    showStoryMissionBriefing();
}
function skipStoryIntro() {
    finishStoryTyping();
    showStoryMissionBriefing();
}
function closeStoryMode() {
    finishStoryTyping();
    const screen = document.getElementById('story-mode-screen');
    const menu = document.getElementById('mode-main-menu');
    if (screen) { screen.classList.remove('is-open'); screen.setAttribute('aria-hidden', 'true'); }
    if (menu) menu.classList.remove('menu-hidden');
    if (typeof isPaused !== 'undefined') isPaused = true;
    const subtitle = document.getElementById('mode-menu-subtitle');
    if (subtitle) subtitle.textContent = storyLanguage() === 'en'
        ? 'Choose your mission, Commander. The unknown signal is waiting.'
        : 'Görevini seç, komutan. Bilinmeyen sinyal bizi bekliyor.';
}
function showStoryModeComingSoon() { openStoryMode(); }
document.addEventListener('DOMContentLoaded', () => { updateStoryUnlockUI(); });
document.addEventListener('keydown', event => {
    const screen = document.getElementById('story-mode-screen');
    if (!screen || !screen.classList.contains('is-open')) return;
    if (event.key === 'Escape') { closeStoryMode(); return; }
    if (event.key === 'Enter' && !event.repeat && !storyMissionViewOpen) { event.preventDefault(); advanceStoryDialogue(); }
});



// ==========================================
