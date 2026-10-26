# Hikâye / Sonsuz Mod Bağımlılık Haritası

**Dal:** `experiment/story-mode-separation-draft`  
**İnceleme tabanı:** `38cac2b954ea2c766caebfcc9db8b9d40d92428e`  
**Durum:** Kaynak taramasına dayalı ilk harita; henüz çalışma zamanı / mobil uçtan uca test değildir.

## Özet

Hikâye Modu yalnızca `ui.js` içindeki bir ekran değildir. Görev akışı ve kayıt kontrolü ağırlıkla `ui.js` içindedir; savaş simülasyonu `engine.js` ile paylaşılır; bazı hikâye efektleri ve bakım yoldaşı görselleri `render.js` içindedir; ekipman bonuslarının kapatılması `data.js` içindeki oyun modu bağlamına bağlıdır. Hikâye arayüzü, görev panosu, HUD ve Piko'nun ana görseli `index.html` içinde yer alır.

Bu yüzden ilk güvenli ayrım, ortak savaş motorunu veya Piko SVG'sini kopyalamak değil; Hikâye Modu denetleyicisini kendi dosyasına almak ve ortak modüllerle açık sınır kurmaktır. `story.html` ayrı sayfası bu ilk adımın parçası değildir: mevcut savaş tuvali, HUD ve motor başlangıç sırası ile bağlantıları test edilmeden HTML'i kopyalamak çift başlatma / durum ayrışması riski taşır.

## Dosya ve sorumluluk haritası

| Dosya | Ortak / Hikâye sorumluluğu | Ayrıştırma riski |
|---|---|---|
| `index.html` | Ana menü (`#mode-main-menu`), mod kartları, Hikâye intro/görev panosu/HUD, savaş tuvali, Piko'nun inline SVG'si; script yükleme sırası | Hikâye HTML/CSS'ini çıkarmak, canvas/HUD ve Piko görünürlüğüyle birlikte ele alınmalı |
| `ui.js` | Ana menü/mod geçişi; Story ilerleme ve bulut kaydı; diyalog; görev panosu; görev başlatma/bitirme/çıkış; Piko'nun ortak etkileşim altyapısı ve hikâye replikleri | En büyük ayrışma alanı; Endless UI, auth, Firebase ve global oyun durumuyla yoğun bağımlılık |
| `engine.js` | Ortak savaş döngüsü, dalga bitişi ve düşman/ödül işleme; `completeWave()` aktif Story oturumunu algılayıp `finishStoryBattleEncounter()` çağırır; Endless anti-cheat gölgesinde Story istisnası | Story'yi ayrı sayfaya almak, bu hook ve motorun tek kez çalışmasını korumalı |
| `render.js` | Ortak canvas çizimi; Story Mission 10 darbe efekti ve Story'ye özel güçsüz bakım yoldaşı görseli | Story görselleri ayrılabilir, fakat ortak çizim ve animasyon döngüsü kopyalanmamalı |
| `data.js` | Ortak yükseltme/eşya verisi; `body.dataset.gameMode === 'story'` iken ekipman bonusunu sıfırlayan koruma | Mod bağlamı kaybolursa Endless ekipmanı Story savaşına sızabilir |
| `security-lab/progression-guard-regression.test.js` ve ilgili testler | Kaynak metninden Story guard/fonksiyonlarını çıkarıp kontrol eden regresyon testleri | Fonksiyon başka dosyaya taşınırsa test kaynak dosyası ve test kapsamı da güncellenmeli |

## Story controller sınırları (mevcut `ui.js`)

- **Mod geçişi:** `enterGameMode('endless')`, `returnToMainMenu()`; `openStoryMode()`, `closeStoryMode()`.
- **İlerleme/kayıt:** `STORY_PROGRESS_KEY`, `STORY_PROGRESS_OWNER_KEY`, `getStoryProgress()`, `saveStoryProgress()`, `pushStoryProgressToCloud()`, `pullStoryProgressFromCloud()`, `getValidatedStoryProgress()`.
- **UI/diyalog:** `STORY_DIALOGUES`, `STORY_UI_COPY`, `showStoryDialogue()`, `advanceStoryDialogue()`, `skipStoryIntro()`, `applyStoryUiLanguage()`, `updateStoryMissionBoard()`.
- **Görev yaşam döngüsü:** `startStoryMission()`, `finishStoryBattleEncounter()`, `exitStoryBattle()`, `finishStoryTyping()` ve görev-özel eylemler (tarama, darbe, kayıt inceleme, seçim, onarım).
- **Piko entegrasyonu:** `pikoReactEvent` genel olay tepkisi; `pikoStoryEvent` hikâye olaylarını yalnızca Story modunda gösterir. Ana Piko SVG'si ve sürükle/tık etkileşimi ortak kalmalıdır.

## Durum ve bağımlılık sözleşmesi

Story controller şu ortak global alanlarla çalışıyor veya onlara çağrı yapıyor: `game`, `tower`, `enemies`, `projectiles`, `particles`, `floatingTexts`, `rings`, `cargoDrones`, `spawnTimer`, `playTimeAccum`, `waveFrostSpawns`, `cargoSpawnTimer`, `gameSpeed`, `isPaused`, `isDefeated`, `defeatTimer`; ayrıca `resizeCanvas`, `updateHUD`, `refreshUpgradeButtonsState`, `updateHoldWaveButton`, `saveGame`, `showToast`, Firebase/auth alanları ve HTML ID'leri.

Görev başlatırken Endless runtime durumunun snapshot'ı alınır, Story sandbox durumu kurulur ve `document.body.dataset.gameMode = 'story'` yapılır. Çıkışta snapshot geri yüklenir. Bu kritik sınır mevcut davranışın parçasıdır; yeniden yazılmamalı, taşınırken aynen korunup regresyon testleriyle doğrulanmalıdır.

## Kayıtlar

- Story yerel anahtarı: `towerDefenseStoryProgressV1`
- Story kullanıcı sahibi anahtarı: `towerDefenseStoryProgressOwnerV1`
- Bulut koleksiyonu: `storyProgress/{uid}`
- Endless kaydı ve ekonomi farklı akışlarda yönetilir. Story ilerlemesi / görev seçimleri Endless dalga, altın, kristal, yükseltme, ekipman, yoldaş veya leaderboard verisine yazılmamalıdır.
- PR #50 kullanıcı değişimi ve bulut sahipliği akışını etkiliyor; bu sınırla çakışabilecek değişikliklerden önce gözden geçirilmeli.

## Sıralı ayrıştırma planı

1. Bu haritayı ve ayrıştırma öncesi yedeği koru.
2. Story controller bloğunu (ilerleme, görev akışı, Story UI eylemleri) `story.js` dosyasına taşı; `ui.js` içindeki Endless/auth/ortak Piko ve ana menü kodunu yerinde bırak.
3. `index.html` içinde `story.js` dosyasını `ui.js` sonrasında, `render.js` ve `engine.js` öncesinde yükle; böylece global fonksiyonlar DOMContentLoaded öncesinde tanımlı olur ve ortak motor tek kalır.
4. Testlerin `ui.js` varsayımlarını güncelle; fonksiyon gövdelerinin `story.js` içinden test edilmesini sağla. JavaScript syntax ve mevcut regresyon/Firestore testlerini çalıştır.
5. Sonraki ayrı aşamada Story CSS/HTML'ini modül sınırına göre ayırmayı ve `story.html` prototipini değerlendirmeyi ancak runtime bağımlılıkları çözüldükten sonra yap.
6. Manuel testler: Endless aç → ana menü → Story intro → görev başlat → kazan/kaybet/tekrar dene → görev panosuna dön → ana menü → Endless; aynı zamanda kullanıcı değişimi, kayıt yeniden yükleme, mobil portre/yatay ve Android geri tuşu.

## Bilinçli olarak henüz yapılmayanlar

- `story.html` oluşturulmadı; bu ilk kod ayrımının güvenli sonucu olduğu varsayılmıyor.
- Story ve Endless motorları çoğaltılmadı.
- Piko SVG'si kopyalanmadı.
- Mobil/Android uçtan uca test veya canlı dağıtım doğrulaması yapılmış sayılmaz.
