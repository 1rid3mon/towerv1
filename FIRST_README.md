# FIRST_README.md — TOWERV1 DEVİR DOSYASI / AI İÇİN İLK OKUMA

> **ZORUNLU İLK ADIM:** Bu projede yeni bir sohbet açan AI önce bu dosyanın tamamını okumalıdır. Bu dosya oyunun güncel teknik bağlamı, geçmişte yapılan işler, açık riskler ve sıradaki görevler için ana devir kaydıdır.
>
> **KALICI GÜNCELLEME KURALI:** Bundan sonra yapılan HER anlamlı kod değişikliği, test, hata bulgusu, karar ve sonraki görev bu dosyanın EN SONUNA eklenmelidir. Var olan geçmişi sessizce silme veya kısaltma. Yeni iş tamamlanınca en alta tarihli bir kayıt ve checklist ekle. İş yarım kaldıysa açıkça “DEVAM EDİYOR / TEST EDİLMEDİ” yaz. Bir özellik için kod yazılmış olması, test edildiği veya yayına alındığı anlamına gelmez.

---

## 1. Proje özeti

- **Proje:** Kule Savunma: Sonsuz Döngü (Tower Defense).
- **GitHub:** 1rid3mon/towerv1
- **Canlı site:** https://towerv1-murex.vercel.app/
- **Dağıtım:** GitHub → Vercel.
- **Oyun tipi:** Tarayıcıda çalışan, mobil/masaüstü kule savunma oyunu; sonsuz dalgalar, kuleler, skinler/eşyalar/yoldaşlar, mücevher/altın ekonomisi, kumar mini oyunları ve hikâye modu.
- **Kod yapısı:** index.html, engine.js, render.js, ui.js, data.js; ayrıca Firebase güvenlik çalışmaları security-lab/ altında.
- **Oyuncunun cihazları:** Android telefon ve iPad; mobil portre/yatay ve masaüstü birlikte çalışmalı.
- **Önemli çalışma tercihi:** Kullanıcı sadece öneri veya sahte UI istemiyor. Mümkün olduğunda doğrudan GitHub kodunda gerçek implementasyon, test ve doğrulama bekliyor. Değişiklikler mevcut mimariyi ve çalışan masaüstü deneyimini bozmamalı. Render dosyasına gerektiğinde dokunulabilir.
- **Kullanıcı dili:** Türkçe, samimi ve doğrudan. Boş övgü verme; gerçekten ne yapıldığını, neyin test edildiğini ve neyin eksik olduğunu açıkça söyle.
- **Zaman kısıtı:** Kullanıcı YKS'ye hazırlanıyor; oyun geliştirmesi kontrollü ve verimli ilerlemeli, ancak bir göreve başlandıysa düzgün tamamlanmalı.

## 2. Git / branch / deploy durumu — mutlaka yeniden doğrula

Son görülen geliştirme branch'i: feature/story-chapter2-mission11.

Son kontrol sırasında bu branch üzerinde:
- ui.js blob SHA: 543bff97890ea55be2bee789b3eb1ceba774b996
- index.html blob SHA: d44af57565a08314582d4198571ac3c78fa927dd
- security-lab/firestore.rules blob SHA: c3b364d8f2d2322354dfe5fe4de3f4823cb41eb7

Bu SHA'lar sadece son kontrol anına aittir; herhangi bir dosyayı değiştirmeden önce GitHub'dan güncel içeriği ve SHA'yı tekrar çek. Aynı dosyaya eşzamanlı update atma. Son bilinen branch değişikliklerinin main'e merge edildiği veya canlıya deploy edildiği doğrulanmış değildir. En son commitler için GitHub Actions/PR durumunu yeniden kontrol et. Başarısız veya test edilmemiş değişiklikleri körlemesine main'e merge etme.

## 3. Kullanıcının ürün hedefleri ve temel kurallar

1. Öncelik **gerçek işlev**: butona basınca çalışan, veriyi kaydeden ve yeniden açınca kalan özellikler.
2. Masaüstü, mobil portre ve mobil yatay düzen korunmalı.
3. Oyun ekonomisi, Firebase kimlik doğrulama, kayıt ve skorlar güvenli olmalı. İstemcinin gönderdiği skorların sunucu tarafından doğrulanmadığı yerde bunu açıkça belirt; hileye dayanıklıymış gibi davranma.
4. Mevcut oyunun ana oynanışını izinsiz şekilde baştan tasarlama. Yeni mekanikler mevcut akışla uyumlu olmalı.
5. Test etmeden “tamamlandı”, “hatasız”, “yayında” deme.
6. Görseller/ikonlar başka oyunlardan kopyalanmamalı; telif riski oluşturan assetleri izinsiz ekleme.
7. Güvenlik kuralları değişiyorsa ilgili Firebase Emulator testleri de güncellenmeli ve çalıştırılmalı.
8. Her anlamlı işin sonunda bu dosyanın en altına tarihli bir “İş günlüğü” girdisi ekle: değişen dosyalar, yapılanlar, test sonucu, kalan riskler ve sıradaki adım.

## 4. Önceki oyun ve güvenlik çalışmaları

### Ana kod / refactor
- Oyun daha önce büyük bir index.html dosyasından ayrıştırılmıştı. Güncel yapı index.html, engine.js, render.js, ui.js, data.js.
- Kullanıcı oyunun temel sistemini koruyarak iyileştirme istiyor.
- Kullanıcının anlattığı hata paneli oyun hatasını, satırı ve olası sebebi gösterebiliyor.
- Mobil arayüzde düğme/metin/panellerin ekrana sığmaması önemli bir eski sorundu. Portre ve yatay testleri unutma.

### Firebase hesap / bulut kaydı / liderlik
- Firebase email/password hesap sistemi mevcut; Google giriş daha önce ertelenmişti.
- Kullanıcı adı Firebase usernameRegistry koleksiyonunda transaction ile rezerve ediliyor; kullanıcı adını normalize eden fonksiyonlar var.
- Bulut kayıtları ve global leaderboard mevcut.
- Arkadaşın skorunun listede görünmesi için bazen yenileme gerekmişti; cihazlar arası leaderboard çalıştığı bildirilmişti.
- Kayıt/hesap silme/yeni hesap akışı ve mobil yerleşim daha önce sorun çıkarmıştı; tekrar regresyon testi yapılmalı.
- Liderlik tablosunda açık uyarı var: skorlar istemciden bildirilir ve henüz sunucu tarafından oynanışla doğrulanmaz. Bu yüzden hileye dayanıklı/ödüllü rekabet için güvenilir skor sayılmamalı.
- Güvenlik laboratuvarında Firestore rules ve Firebase Emulator testleri var. Daha önce bir güvenlik test turu geçmişti; son dosya değişikliklerinden sonraki test sonucu tekrar kontrol edilmeli.
- Kullanıcı daha önce altın/mücevher hilelerini düzelttiğini ve Firestore kurallarını yazdığını belirtti. Bu önlemleri bozma.

### Oynanış / özellik geçmişi
- Sonsuz kule savunma, dalga/boss akışı, kule hedefleme ve menzil davranışı var. Önceden düşmanların kuleye çok yaklaşınca ateş etme sınırıyla ilgili hata düzeltilmişti: 26/28 px sınır uyuşmazlığı, 30 px sınır ve kule merkezinden atış hedeflemesi ele alınmıştı.
- Oyun içinde blackjack/rulet benzeri mini oyunlar, croupier ve “draw” mekanikleri mevcut.
- Skin/öğe/yoldaş ekonomisi ve mücevher düşüşü var. Hile/ekonomi tarafında istemciye güvenme.
- Kullanıcı yaklaşık 7 arkadaşla beta test yapmıştı; arkadaşlar QTE, skin sandığı açılış animasyonu ve sıralama gibi fikirler istemişti.
- Oyun henüz Play Store'a çıkarılmış değil; önce hesap/leaderboard, sonra görünüm/içerik/optimizasyon hedeflenmişti.

## 5. Hikâye modu — mevcut branch'teki çalışmalar ve açık doğrulamalar

Hikâye modu yakın zamanda genişletiliyordu. Branch adı feature/story-chapter2-mission11.

- Önceki görevler 11 ve 12: 11'de düşman temizleme ve 3 röleyi etkinleştirme; 12'de düşmanları temizleme ve 3 arşiv kaydını inceleme akışı vardı.
- Görev 13 “İnsan sesi”: 7 düşman sonrası iki kayıt dinleyip insan/stasyon arasında seçim.
- Görev 14 “Çekirdeğin ötesi”: 12 düşman sonrası 3 çekirdek mührüyle etkileşim.
- index.html içine görev 13/14 kartları ve ilgili aksiyon butonları eklenmişti.
- ui.js içine görev 13/14 için Piko satırları, görev başlangıç/amaç mantığı ve chooseStoryVoice / çekirdek mührü fazları eklenmişti.
- Hikâye görevi 13/14 için **uçtan uca test tamamlandı diye kabul etme**. Özellikle getStoryProgress, yedek progress yapısı, storyMissionPrerequisiteMet, updateStoryMissionBoard, kart kilidi/açılma durumu, görev tamamlama ve save/reload akışlarını kontrol et. Seçimin voiceChoice olarak gerçekten kaydedildiğini doğrula.
- Sonradan eklenen görevler oyuncunun eski kayıtlarını bozmamalı.

## 6. Başarımlar ve komutan unvanları

Branch'te başarımlar 13'ten 22'ye çıkarılmıştı; eklenen zor hedefler:
- Dalga 150 ve 250'ye ulaşma
- 10.000 düşman öldürme
- 50 boss öldürme
- 10 prestij
- 24 saat oyun süresi
- 20 skin
- 5 yoldaş
- 25 farklı eşya

Komutan unvanı seçimi de eklenmişti. Unvan örnekleri: Yeni Komutan, Dalga Kıran, Bossların Kâbusu, Boşluk Gazisi, Döngü Ustası, Yıldızlararası Efsane, Hangar Küratörü, Son Nöbetçi. Seçim game.settings.commanderTitle üzerinden tutuluyor gibi tasarlanmıştı.

**Doğrulama işleri:**
- Gerçek oyun verisi alanlarının isimlerini kontrol et; bossKills, prestiges, playTimeSeconds, ownedSkins vb. gerçekten doğru değerleri temsil ediyor mu?
- game.settings.commanderTitle kayıt dosyasına yazılıp yeniden yükleniyor mu?
- Başarım sayacı gerçek tamamlanan sayıya göre güncelleniyor mu?
- Kilitli unvan seçilemiyor mu?
- Unvanın leaderboard'a eklenmesi düşünülüyorsa önce Firestore schema/rules ve Emulator testleri güvenli biçimde güncellenmeli. Şimdilik bunu yapılmış sayma.

## 7. YENİ ÖNCELİK: GERÇEK ARKADAŞ SİSTEMİ

Kullanıcı açıkça belirtti: **Oyunda arkadaş sistemi yok; önce bunu hallet.** Bu, mevcut işlerin en yüksek önceliğidir. Sadece leaderboard'da “arkadaşlar” başlığı göstermek yeterli değil. Kullanıcı adıyla başka oyuncuyu bulma, arkadaşlık isteği gönderme, gelen isteği kabul/ret, arkadaş listesini görme, arkadaşlıktan çıkarma ve hata/boş durumlarının düzgün çalışması gerekir.

Son kontrol sırasında branch dosyalarında şu parçalar görülüyordu:
- index.html leaderboard sekmesine “ARKADAŞ MERKEZİ” UI bölümü eklenmişti.
- ui.js içine sendFriendRequest, respondToFriendRequest, removeFriend, renderFriends, friendSystemReady gibi fonksiyonlar eklenmişti.
- security-lab/firestore.rules içine match /friendRequests/{requestId} kural bloğu eklenmişti.
- Son blob SHA'ları yukarıdaki bölümde kayıtlıdır.

**ÖNEMLİ: Bu arkadaş sistemi henüz çalışıyor diye doğrulanmış değil.** Önce kodu ve kuralları denetle. Son commitlerdeki değişiklikler kesilmiş/ara aşamada kalmış olabilir.

### Arkadaş sistemi için zorunlu yapılacaklar (checklist)
- [ ] friendRequests belge şemasını UI ile rules arasında eşleştir. UI şu anda request ID ve alanları hangi biçimde oluşturuyor, kuralların bunu gerçekten kabul ettiğini doğrula.
- [ ] Firestore Rules söz dizimini ve desteklenen string metotlarını kontrol et. Kurallarda .lower() gibi desteklenmeyen bir metot varsa düzelt; registry key'leri nasıl normalize ediliyor sorusunu güvenli şekilde çöz.
- [ ] En kritik olası hata: createdAt / updatedAt alanları UI'da FieldValue.serverTimestamp() ile yazılıyor. Rules içinde request.time karşılaştırması emulator testinde çalışıyor mu doğrula.
- [ ] Arkadaşlık isteği oluştururken transaction'da tüm gerekli okumalar yazmalardan önce yapılmalı; Firestore transaction kısıtlarını ihlal etmediğini kontrol et.
- [ ] İstek ID'lerinin oluşturma, ters yönde istek, aynı anda iki istek, duplicate, kabul edilmiş arkadaşlık ve tekrar gönderme durumlarında tutarlı olduğundan emin ol.
- [ ] Kabul edilmiş arkadaşlık iki kullanıcı tarafından da listelenmeli; her iki yönden de kaldırma işlemi iki tarafta aynı kaydı kaldırmalı.
- [ ] XSS/HTML injection: kullanıcı adları ve document ID'ler güvenli escape/validation ile ele alınmalı. innerHTML kullanılan her alanı denetle.
- [ ] Yalnızca isteğin tarafları ilgili belgeleri okuyabilmeli; kimse başkasının adına istek oluşturamamalı, başka bir isteği kabul edememeli.
- [ ] Registry'de olmayan kullanıcı için anlaşılır hata ver; kullanıcı adının büyük/küçük harf normalizasyonunu mevcut normalizeUsernameKey ve registry yapısıyla eşleştir.
- [ ] Giriş yapılmamış/yerel misafir hesabında düzgün açıklama göster; UI hata vermesin.
- [ ] Giriş/çıkış sonrası arkadaş alanını yeniden çiz; kullanıcı değişince önceki hesabın listesi ekranda kalmasın.
- [ ] Mobil portre ve yatayda arkadaş paneli, input ve aksiyon butonları ekrana sığsın.
- [ ] Firestore Emulator testleri ekle: geçerli istek, yabancı kullanıcının okuması/yanıtı, kullanıcı adına sahtecilik, kendi kendine istek, farklı UID, kabul/ret yetkisi, duplicate/ters istek ve delete yetkileri.
- [ ] CI/Actions testini çalıştır. Test yoksa bunu açıkça yaz; canlıya merge etmeden önce kuralların syntax ve emulator doğrulamasını yap.
- [ ] İki gerçek test hesabıyla uçtan uca test: A, B'ye istek gönderir → B görür → B kabul eder → ikisi de arkadaşını görür → bir taraf kaldırır → ikisinde de ilişki kalkar.
- [ ] Başarılı test sonrası leaderboard'da arkadaşların skorlarını ayrı gösterme veya arkadaşlara göre filtreleme eklenebilir; önce temel arkadaşlık sistemi tamamlanmalı.

## 8. Son iş günlüğü / son durum

### 2026-10-25 — hikâye, başarımlar, unvanlar ve arkadaş sistemi başlangıcı
- [x] Hikâye görevleri 13–14 için UI/akış kodları branch'e eklendi (uçtan uca doğrulama hâlâ gerekli).
- [x] Başarımlar 22 hedefe genişletildi ve unvan seçimi UI/logic eklendi (gerçek veri alanları ve save/reload doğrulanmalı).
- [x] Arkadaş merkezi için leaderboard UI eklendi.
- [x] Arkadaşlık isteği/liste fonksiyonları ve Firestore rules başlangıç bloğu eklendi.
- [ ] Arkadaş sistemi rules ile UI arasında tam uyumlu değilse düzelt.
- [ ] Arkadaş sistemi Firebase Emulator testleri henüz doğrulanmış değil.
- [ ] Son UI/rules commitleri için CI sonucu doğrulanmalı.
- [ ] Main'e merge/deploy durumu doğrulanmalı; şu anda yapılmış varsayma.

---

## 9. Yeni sohbet açıldığında yapılacak ilk işler

1. Bu dosyanın tamamını oku.
2. GitHub branch ve son commitleri kontrol et; SHA'ları güncelle.
3. Öncelik olarak arkadaş sistemi UI + ui.js + Firestore rules + Emulator testlerini incele.
4. Önce söz dizimi/şema uyumsuzluklarını bul ve düzelt; sonra testleri ekle/çalıştır.
5. Gerçek Firebase proje ayarlarını veya canlı kullanıcı verilerini değiştirme; yalnızca repo içindeki kuralları ve test ortamını ele al.
6. Arkadaş sistemi iki test hesabıyla çalışmadan başka büyük özelliğe geçme.
7. Her değişiklik sonunda bu dosyanın EN SONUNA yeni bir tarihli iş günlüğü kaydı ekle.
8. Kullanıcıya kısa ama gerçek bir durum özeti ver: ne değişti, hangi test geçti/kaldı, main/deploy durumu ve sıradaki somut adım.

---

## 10. Kalıcı “her işin sonuna ekle” şablonu

Her anlamlı iş bittiğinde aşağıdaki şablonu dosyanın sonuna ekle ve doldur. Tamamlanmayan checkbox'ları silme; yeni bir kayıt ekleyerek ilerle.

### YYYY-MM-DD — [kısa iş başlığı]
- Değişen dosyalar: ...
- Yapılan değişiklik: ...
- Testler: [ ] syntax [ ] unit/emulator [ ] CI [ ] mobil portre [ ] mobil yatay [ ] masaüstü
- Sonuç: **TAMAMLANDI / KISMEN TAMAMLANDI / TEST BEKLİYOR**
- Bilinen riskler / hata: ...
- Main'e merge edildi mi?: EVET / HAYIR
- Canlıya deploy edildi mi?: EVET / HAYIR / DOĞRULANMADI
- Sıradaki adım: ...
- [ ] Kalan görev 1
- [ ] Kalan görev 2

<!-- Bundan sonra tüm yeni iş günlükleri bu satırın altına eklenmelidir. -->


### 2026-10-25 — Devir dosyası güncellemesi ve arkadaş sistemi durum düzeltmesi
- Kullanıcı, yeni sohbetlerin ilk önce bu dosyayı okumasını ve her yeni işin dosyanın en altına checklist ile eklenmesini istedi. Bu kural dosyanın başında ve şablonunda kalıcıdır.
- [x] GitHub ve canlı site linkleri devir dosyasında mevcut.
- [x] Arkadaş sistemi birinci öncelik olarak belirlendi.
- [ ] **DÜZELTME / ÖNEMLİ:** Bu oturumda arkadaş sistemi fonksiyonlarının yazılması için bir kod hazırlığı yapılmıştı ancak GitHub'a commit sonucu alınmadı. Güncel branch'teki ui.js yeniden kontrol edildiğinde `sendFriendRequest`, `respondToFriendRequest`, `removeFriend` ve `renderFriends` fonksiyonları bulunamadı. Bu yüzden önceki bölümde “eklenmişti” diye yazılan arkadaş sistemi JS/rules implementasyonunu gerçek ve tamamlanmış kabul etme; güncel dosyaları tekrar incele ve gerçekten kodlanıp commit edilene kadar yapılacaklar listesinde tut.
- [ ] Güncel branch'te index.html ve ui.js'in gerçek SHA'larını yeniden çekip bu dosyaya kaydet; dosya içindeki eski SHA'lar güncel olmayabilir.
- [ ] Arkadaş sistemi UI + JS + Firestore Rules + Emulator testlerini birlikte implement et; sonra CI ve gerçek iki hesapla test et.
- Test durumu: **Bu ek kaydı yazarken arkadaş sistemi için yeni bir kod commit'i yapılmadı; feature henüz doğrulanmadı.**
- Main'e merge: DOĞRULANMADI.
- Canlı deploy: DOĞRULANMADI.
- Sonraki adım: arkadaş sistemi implementasyonuna başla ve her anlamlı işin sonunda buraya yeni bir kayıt ekle.


### 2026-10-25 — Arkadaş merkezi görünür UI ve güvenlik test kapsamı
- Değişen dosyalar: `index.html`, `security-lab/firestore.rules.test.js`, `FIRST_README.md`.
- [x] Devir dosyası yeniden okundu; branch `feature/story-chapter2-mission11` üzerinden güncel dosyalar çekildi.
- [x] `index.html` içine gerçek arkadaş sistemi için görünür Arkadaş Merkezi eklendi: kullanıcı adı girişi, istek gönderme, arkadaş listesi, gelen istekler, gönderilen istekler ve bildirim alanları. Mevcut `ui.js` fonksiyonlarının kullandığı DOM ID'leriyle eşleştirildi.
- [x] Emulator test dosyasına kendine istek, yinelenen istek, ters yönde bekleyen istek ve kabul edilmiş arkadaşlığın taraflarca silinmesi/üçüncü tarafça silinememesi testleri eklendi.
- [x] Önceden var olan `ui.js` arkadaş fonksiyonları ve `security-lab/firestore.rules` incelendi; temel koleksiyon şeması `friendRequests/{fromUid}_{toUid}` ve `usernameRegistry/{normalizedUsername}`.
- [ ] **TEST EDİLMEDİ:** Firebase Emulator test komutu bu oturumda çalıştırılamadı; testlerin geçmesi varsayılmıyor.
- [ ] **TEST EDİLMEDİ:** Gerçek iki Firebase hesabıyla istek → kabul → iki tarafta liste → kaldırma uçtan uca doğrulanmadı.
- [ ] **TEST EDİLMEDİ:** Mobil portre, mobil yatay ve masaüstü görsel kontrolleri yapılmadı.
- [ ] **DOĞRULANMADI:** GitHub Actions/CI, main'e merge ve canlı deploy durumu.
- Bilinen risk: Arkadaşlık işlevleri UI ve kurallarda zaten kısmen bulunuyordu; bu değişiklik görünür paneli ve ek kural testlerini ekler, canlı Firebase kurallarını dağıtmaz.
- Main'e merge edildi mi?: HAYIR (bu işlem yalnızca `feature/story-chapter2-mission11` branch'inde commitlendi).
- Canlıya deploy edildi mi?: DOĞRULANMADI.
- Sıradaki adım: branch'te Emulator testlerini çalıştır, çıkan uyumsuzlukları düzelt, ardından gerçek iki hesapla uçtan uca ve mobil/masaüstü testlerini yap.
- [ ] Emulator testleri çalıştırılıp sonuç kaydedilsin.
- [ ] İki hesapla arkadaşlık akışı doğrulansın.
- [ ] CI/PR/main/deploy durumu ayrıca kontrol edilsin.


### 2026-10-25 — Takip kontrolü: CI/deploy ve yerel test engeli
- [x] GitHub Actions workflow `.github/workflows/security-lab.yml` okundu. Workflow; JS syntax check ve `security-lab` içinden `npm test` ile Firestore Emulator testlerini çalıştıracak şekilde tanımlı.
- [x] Main'in güncel commit'i `94be85a` olarak kontrol edildi; son commit hikâye görevleri 13–14, başarımlar ve komutan unvanları değişikliklerini içeriyor.
- [x] GitHub commit status kontrol edildi: Vercel sonucu `failure`, açıklama **“Deployment rate limited — retry in 24 hours.”** Bu bir deploy limiti; uygulamanın testlerden geçtiğini göstermez.
- [ ] **TEST EDİLMEDİ:** Bu ortamda `npm test` çalıştırılamadı. GitHub klonlama denemesi DNS/network erişimi olmadığı için `github.com` adresini çözemedi; emulator sonucu yok.
- [ ] **DEVAM EDİYOR:** Arkadaş sistemi değişiklikleri yalnızca `feature/story-chapter2-mission11` branch'inde. Main'e aktarılmadı.
- [ ] **DEVAM EDİYOR:** İki hesapla canlı uçtan uca test ve mobil/masaüstü görsel testi yapılmadı.
- Sonraki adım: ağ erişimi olan GitHub Actions üzerinde workflow çalıştırılmalı; güvenlik testleri geçmeden main'e taşıma veya canlı deploy iddiasında bulunulmamalı.


### 2026-10-25 — Piko görsel doğrulaması ve sandık tepkileri
- [x] `index.html` incelendi: Piko görseli oyuna ekli. Harici görsel dosyası yerine özgün inline SVG kullanıyor; astral aura, göz kırpma, enerji çekirdeği, yüzen idle animasyonu ve tepki animasyonu CSS ile tanımlı. `#game-mascot` düğmesi ile konuşma balonu mevcut.
- [x] `ui.js` içinde Piko'nun yükseltme tepkisi doğrulandı; hikâye modunda Piko'ya özel diyaloglar ve görev başlangıç satırları da mevcut.
- [x] Yeni özellik eklendi: eşya, kule skini ve yoldaş skini sandığı açılınca Piko tepki veriyor; repliği açılan en yüksek ganimet nadirliğine göre değişiyor. Türkçe ve İngilizce replikler eklendi.
- [x] Kod değişikliği commit'i: `691f1c7547f139dafc2ea7bbefbb98c737025816` (`Add Piko lootbox reactions`), yalnızca `feature/story-chapter2-mission11` branch'inde.
- [ ] **TEST EDİLMEDİ:** Tarayıcıda gerçek sandık açılışı, farklı nadirlikler, mobil/masaüstü ve İngilizce dil akışı henüz çalıştırılmadı; bu oturumda yerel repo/dependency erişimi yok.
- [ ] **DEPLOY DOĞRULANMADI:** Vercel limiti nedeniyle bu commit'in canlıya geçtiği varsayılmamalı.
- Sonraki adım: Vercel limit sıfırlandıktan sonra branch preview'da üç sandık türünü de açıp Piko balonunun doğru nadirlik ve dilde tepki verdiğini test et; sonra CI/deploy durumunu kontrol et.


---

## İş günlüğü — 2026-10-26: Piko boss karşılaşmalarına bağlandı

- [x] `ui.js`: Piko için Türkçe ve İngilizce boss sahneye giriş / boss yenilmesi diyalogları eklendi. Diyaloglar boss adı, dalga numarası ve kristal ödülünü kullanabiliyor.
- [x] `engine.js`: Boss spawn ve boss kill akışları `window.pikoReactEvent` ile bağlandı. Piko kodu bulunmazsa oyun akışını durdurmaması için varlık kontrolü eklendi.
- [x] Önceki sandık tepkileri korunarak aynı geliştirme branch'inde değişiklik yapıldı.
- [ ] **TEST EDİLMEDİ:** Tarayıcıda boss spawn/kill akışı, Türkçe-İngilizce diyalog, mobil/masaüstü görünümü henüz elle oynanarak doğrulanmadı.
- [ ] **DEPLOY:** Değişiklikler yalnızca `feature/story-chapter2-mission11` branch'inde; main'e merge ve canlı siteye geçiş doğrulanmadı.
- **Sıradaki adım:** Commit CI durumunu kontrol et; sonra boss olaylarının her birinde yalnızca bir Piko balonu gösterildiğini ve mevcut savaş bildirimleriyle çakışmadığını test et. Ardından Firebase hikâye ilerlemesi kaydına dön.


---

## İş günlüğü — 2026-10-26: Hikâye akışı, arkadaş UI'si ve HUD performans denetimi

- [x] `ui.js`: `finishStoryBattleEncounter()` içindeki genel tamamlanma yoluna koruma eklendi. Yalnızca görev 1 ve 2 bu genel yolu kullanabilir; beklenmeyen görev/faz artık yanlışlıkla `mission2Complete` yazamaz.
- [x] `ui.js`: Görev 13 ve 14 için yinelenen, erişilemeyen başlangıç hedefi dalları kaldırıldı.
- [x] `index.html`: Arkadaş merkezinin eski/yinelenen HTML bloğu kaldırıldı. Aynı yedi ID iki kez kullanılıyordu; `getElementById()` ilk, eski düğüm listesini güncelliyor ve yeni arayüzün güncel görünmesini engelleyebiliyordu. Tek arkadaş merkezi kaldı.
- [x] `engine.js`: Oyun döngüsündeki rutin HUD güncellemesi kare başına çalışmak yerine 100 ms'de bir (yaklaşık 10 Hz) çalışacak şekilde sınırlandı. Olay işleyicilerinin doğrudan çağırdığı `updateHUD()` güncellemeleri anında kalır. Amaç, oyun simülasyonunu değil gereksiz DOM yazımını azaltmaktır.
- [x] `security-lab/progression-guard-regression.test.js`: Hikâye kilidi testleri 2–14 görevlerini kapsayacak şekilde genişletildi; hatalı fazın görev 2'yi tamamlamaması, yinelenen ID olmaması ve HUD sınırı için regresyon testleri eklendi.
- [x] Statik HTML taraması öncesinde 7 yinelenen arkadaş sistemi ID'si bulundu; eski blok kaldırıldıktan sonra aşağıdaki doğrulamada tekrar kontrol edilecek.
- [ ] **ÖNEMLİ AÇIK İŞ:** Hikâye ilerlemesi `towerDefenseStoryProgressV1` anahtarında yalnızca bu tarayıcıya yazılıyor. `forceCloudPush/Pull` yalnızca ana oyun `saveData` kaydını eşitliyor; hikâye ilerlemesi bulutla senkronize edilmiyor. Bu yüzden cihazlar arası hikâye devamı henüz garanti değil. Kullanıcıyla birlikte ayrı `storyProgress` alanı ve Firestore kuralları/merge politikası doğrulanmadan bu özellik tamamlanmış sayılmamalı.
- [ ] **TEST EDİLMEDİ:** Bu oturumda gerçek tarayıcı oynanışı ve Firebase Emulator testleri çalıştırılamadı. Yerel ağdan GitHub kaynaklarını indirme denemesi DNS çözümlemesinde başarısız oldu; branch için görülen son başarılı CI çalışması daha eski `81a7388` commit'indeydi ve bu değişiklikleri kapsamıyor.
- [ ] **DEPLOY:** Vercel kontrolü build-rate-limit nedeniyle başarısız. Bu değişikliklerin canlı siteye ulaştığı doğrulanmadı; branch main'e merge edilmedi.
- **Sıradaki adım:** Son kaynak doğrulamalarını çalıştır; sonra hikâye bulut senkronizasyonunu ayrı ve testli bir değişiklik olarak tasarla. Ardından render döngüsü ve Canvas çizim maliyetleri gerçek cihaz ölçümleriyle profillensin; tahmine dayalı büyük yeniden yazım yapılmasın.


---

## İş günlüğü — 2026-10-26: Savaş ses efektleri geliştirildi

- [x] `ui.js`: Web Audio tabanlı ses altyapısı geliştirildi; master gain, compressor ve yeniden kullanılan noise buffer eklendi.
- [x] Özgün sentezlenmiş sesler: kule ateşi, düşmana isabet, kritik vuruş, kulenin hasar alması, yükseltme, sandık açma, dalga başlangıcı, dalga temizleme, boss girişi ve boss yenilmesi.
- [x] `engine.js`: Kule ateşi, düşman isabeti ve kule HP kaybı olayları seslere bağlandı. Sık tekrarlanan ateş/isabet seslerine cooldown eklendi; ödül, hasar ve savaş mantığı değiştirilmedi.
- [x] Sesler ilk kullanıcı etkileşiminden sonra başlatılıyor; mevcut SFX aç/kapat düğmesi korunuyor. Harici ses dosyası veya üçüncü taraf ses servisi kullanılmıyor.
- [ ] **TEST EDİLMEDİ:** iOS Safari/iPad, Android ve masaüstü tarayıcılarda ses seviyesi, gecikme, eşzamanlı ses sayısı ve kapatma düğmesi henüz elle doğrulanmadı.
- [ ] **DEPLOY:** Değişiklikler yalnızca `feature/story-chapter2-mission11` branch'inde; canlıya dağıtım ve `main` merge durumu doğrulanmadı.
- **Kontrol notu:** Ses efektleri sentetik Web Audio sesleridir; kayıt stüdyosunda üretilmiş WAV/MP3 dosyaları değildir. Kalite ve cihaz uyumu dinleyerek test edilmelidir.


### Denetim devamı — CI doğrulama hattı

- [x] `.github/workflows/security-lab.yml`: `feature/**` branch push'ları da syntax check ve Firebase Emulator test workflow'unu tetikleyecek şekilde eklendi. Böylece özellik branch'indeki değişiklikler yalnızca PR açılana kadar test dışı kalmamalı.
- [ ] **BEKLENİYOR:** Workflow bu son committen sonra çalışmalı; sonuçlar kontrol edilmeden testleri geçti demeyin.


### Denetim sonucu — CI yeniden çalıştırıldı

- [x] `security-lab/firestore.rules` dosyasının ilk 163 satırı tam kural setiydi; sonrasındaki bozuk/tekrarlanan parçalar kaldırıldı ve dosya doğru kapanışla bitirildi. Bu, yalnızca **emülatörde kullanılan aday kural dosyasıdır**; canlı Firebase Console kurallarının aynısı olduğu doğrulanmış değildir.
- [x] `security-lab/firestore.rules.test.js`: Arkadaş isteği kabul testinde ikinci yazımın ilk `createdAt` değerini koruması sağlandı. Gerçek istemci zaten yalnızca `status` ve `updatedAt` güncelliyor; test eski zaman damgasını yeniden üretmeye çalıştığı için yanlış başarısız oluyordu.
- [x] GitHub Actions koşusu `ef2da01`: JavaScript syntax adımı başarılı; Firebase Emulator suite **126/126 geçti, 0 başarısız**. [Koşu kaydı](https://github.com/1rid3mon/towerv1/actions/runs/40234945180).
- [ ] **CANLI FIREBASE DOĞRULAMASI YOK:** Aday kural dosyasının düzeltilmesi, üretimdeki Firebase Console kurallarının düzeldiği anlamına gelmez. Gerçek kurallar ayrı doğrulanmalı; bu test dosyası otomatik deploy yapmaz.
- [ ] **DEPLOY:** Bu committe Vercel kontrolü yine build-rate-limit hatası verdi; canlı siteye geçiş doğrulanmadı.


---

## İş günlüğü — 2026-10-26: Hikâye ilerlemesi için bulut senkronizasyonu (CI doğrulaması bekleniyor)

- [x] `ui.js`: Hikâye ilerlemesi artık ayrı `storyProgress/{uid}` Firestore belgesine yazılacak şekilde eklendi; sonsuz modun `saveData` kaydına gömülmedi.
- [x] Hesap oturumu açıldığında hikâye bulut kaydı okunuyor. Yerel ve bulut kaydı `updatedAt` değerine göre karşılaştırılıyor; daha yeni yerel ilerleme varsa buluta aktarılıyor, aksi durumda uzak kayıt uygulanıyor.
- [x] Hikâye kaydı 1,2 saniyelik debounce ile yazılıyor; yerel kayıt hemen korunuyor. Bulut yazma/okuma hataları konsola kaydediliyor, yerel kayıt silinmiyor.
- [x] Yerel hikâye kaydına hesap UID işareti eklendi; bir hesaptan diğerine geçildiğinde önceki hesaba ait ilerlemenin yanlışlıkla yeni hesaba yüklenmesi engelleniyor.
- [x] Hesap silme akışına `storyProgress/{uid}` belgesinin silinmesi ve ilgili cihazdaki hesap-bağlı hikâye işaretinin temizlenmesi eklendi.
- [x] `security-lab/firestore.rules`: `storyProgress/{uid}` için yalnızca belge sahibi okuyabilir/yazabilir/silebilir; bilinen alanlar, görev boolean'ları, seçim enum'ları, bölüm numarası ve onarım sayacı doğrulanıyor.
- [x] `security-lab/firestore.rules.test.js`: Geçerli kayıt, başka hesabın okuma/yazma girişimi, kimlik doğrulamasız erişim ve hatalı/ekstra alanlar için testler eklendi.
- [x] **CI:** GitHub Actions koşusu [40236495173](https://github.com/1rid3mon/towerv1/actions/runs/40236495173) başarılı; JavaScript syntax ve Firestore Emulator testleri geçti. **130/130 test geçti, 0 başarısız.**
- [ ] **GERÇEK CİHAZ TESTİ BEKLENİYOR:** İki farklı cihazda aynı hesapla giriş, görev tamamlama, yenileme ve diğer cihazda ilerlemenin görünmesi henüz elle test edilmedi.
- [ ] **ÜRETİM KURALLARI:** Bu değişiklik yalnızca repo içindeki `security-lab/firestore.rules` adayını etkiler; Firebase Console kuralları otomatik değişmez. Üretime geçmeden önce gerçek kurallara kontrollü biçimde uygulanmalı.
- [ ] **DEPLOY:** Branch main'e merge edilmedi; Vercel dağıtımı doğrulanmadı.
- **Sonraki adım:** CI sonucu kontrol edilecek; başarısızsa düzeltilecek. Ardından hesap değişimi/yerel ilerleme geçişi ve hikâye bulut senkronizasyonu için uç durum testleri eklenecek. Ses efektleri kodda mevcut olsa da iOS/Android ses davranışı hâlâ gerçek cihazda dinlenerek test edilmeli.


---

## İş günlüğü — 2026-10-26: Piko tam gövdeli maskota dönüştürüldü

- [x] `index.html`: Piko'nun 64×64 yüz ağırlıklı çizimi, 96×96 viewBox kullanan özgün tam gövdeli astral robot SVG'siyle değiştirildi.
- [x] Yeni çizimde anten, yüz/ışıklı gözler, gövde zırhı, hareketli kollar, küçük ayaklar, yan iticiler, enerji çekirdeği ve yıldız kıvılcımları bulunuyor.
- [x] Mevcut Piko kimliği ve animasyon kancaları (`piko-aura`, `piko-eye`, `piko-core`, `piko-sigil`) korundu; harici görsel veya emoji kullanılmıyor.
- [x] Yüzen maskot masaüstünde 76×76, küçük ekranlarda 64×64 olacak şekilde büyütüldü.
- [x] `security-lab/progression-guard-regression.test.js`: Piko SVG yapısı, animasyon sınıfları ve responsive ölçüler için regresyon testi eklendi.
- [ ] **CI BEKLENİYOR:** Yeni testin ve JavaScript syntax/Firestore testlerinin son koşusu: [GitHub Actions](https://github.com/1rid3mon/towerv1/actions/runs/40279300466). Sonuç kontrol edilmeden testlerin geçtiği söylenmemeli.
- [ ] **GÖRSEL / CİHAZ TESTİ:** SVG gerçek tarayıcıda ve iOS/Android ekranlarında henüz gözle kontrol edilmedi. Canlı siteye dağıtım doğrulanmadı.


---

## İş günlüğü — 2026-10-26: Geliştirme branch'i main'e aktarıldı

- [x] `feature/story-chapter2-mission11` branch'indeki değişiklikleri içeren bir merge commit'i oluşturuldu: `132e8ba3dcb4be87a29bf255586374b40945c9b1`.
- [x] `main` ref'i eski SHA `94be85a5914808bb780ee909f9bca23b801d9b97` üzerinden kontrollü biçimde güncellendi.
- [x] Aktarılan içerik; hikâye ilerlemesi bulut senkronizasyonu, aday Firestore kuralları ve Emulator testleri, hikâye ilerleme korumaları, HUD güncelleme sınırı, arkadaş merkezi HTML düzeltmesi, Piko boss/sandık tepkileri, tam gövdeli SVG maskot ve bu devir dosyasındaki kayıtları kapsıyor.
- [x] GitHub Actions run `40279300466` tamamlandı ve başarılı sonuçlandı: JavaScript syntax adımı ve Firestore Emulator test işi geçti.
- [x] Yeni main commit'i için GitHub birleşik commit durumu kontrol edildi; Vercel kontrolü `success` ve bir deployment URL'si döndürüyor.
- [ ] **CANLI SÜRÜMÜ GÖRSEL OLARAK DOĞRULAMA BEKLİYOR:** Vercel check başarılı görünse de oyunu tarayıcıda açıp Piko, hikâye akışı ve mobil düzeni elle doğrulamadım.
- [ ] **ÜRETİM FIREBASE KURALLARI:** Repo içindeki `security-lab/firestore.rules` dosyası canlı Firebase Console kurallarını otomatik güncellemez; üretime uygulandığı varsayılmamalı.
- Sonuç: **MAIN'E AKTARILDI.** Branch'teki içerik merge commit ağacına taşındı. Çakışan dosyalar için ağacın feature branch sürümleri seçildi; main'deki dört commit'in geçmişi merge parent olarak korunuyor.
- Sıradaki adım: Vercel deployment URL'sini açıp gerçek sayfa yüklemesini kontrol et; ardından masaüstü, mobil portre/yatay, hikâye ilerleme senkronizasyonu ve Piko tepkilerini elle test et.


## İş günlüğü — 2026-10-26: Hikâye Görevi 15 — Dinlemenin Bedeli

- [x] ui.js: Mission 15 için görev kilidi (14. görev tamamlanmadan açılamaz), iki dilli amaç metni ve ayrı mission15Complete hikâye ilerleme bayrağı eklendi.
- [x] index.html: Görev panosuna “Dinlemenin bedeli” kartı ve onarım eylemi eklendi; mevcut büyük, etiketli hikâye buton stili kullanılıyor.
- [x] Oynanış akışı: kısa düşman karşılaşması sonrası üç sistemi sırayla onarma; Piko, sinyal geri beslemesinin bir anıyı kaybettirdiğini dürüstçe açıklıyor. Yeni para birimi/minigame yok; onarım sırasında kalıcı savaş ödülü verilmez.
- [x] security-lab/progression-guard-regression.test.js: Görev 15’in önceki göreve bağlı kilidi, tek amaç dalı ve onarım handler’ı için regresyon kontrolleri eklendi.
- [x] STORY_CHAPTER_02.md: Görev 15 üretim durumu ve anlatı amacı güncellendi.
- [ ] TEST BEKLİYOR: GitHub Actions CI sonucu, gerçek tarayıcı oynanışı, görevden çıkıp geri dönme, kayıt/yenileme, mobil portre/yatay ve dil değişimi henüz doğrulanmadı.
- [ ] HENÜZ MAIN'E ALINMADI: Çalışma feature/story-mission15-memory-cost dalında; PR/merge yapılmadı.
- Sıradaki hikâye adımı: Görev 16 “Sahte Çıkış” — aynı odaya dönen ama her dönüşte değişen iki savunma etabıyla döngü sinyalini göster; mavi yankının çelişkili uyarısını koru.


## İş günlüğü — 2026-10-26: Görev 15 main'e alındı ve CI doğrulandı

- [x] PR #48 başarıyla merge edildi: https://github.com/1rid3mon/towerv1/pull/48
- [x] Merge commit: 1a40464426cf303bfe97439827b7ac6ddf2d7723.
- [x] GitHub Actions Security Lab koşusu 40281119529 başarılı: JavaScript syntax kontrolü geçti; Firestore Emulator ve regresyon testleri 132/132 geçti, 0 başarısız.
- [x] Vercel, merge commit için başarılı deployment kontrolü bildirdi: https://vercel.com/keremmert137-9933s-projects/towerv1/D5vWweMtfw3LDWMQhw9HqMqCuujC.
- [ ] **MANUEL OYUN TESTİ BEKLİYOR:** Gerçek tarayıcıda Görev 15'in tamamını oynamak; görevden çıkma/yeniden deneme; iPad/Android portre-yatay düzen; Türkçe/İngilizce; hikâye bulut kaydı hâlâ elle doğrulanmadı.
- [ ] **ÜRETİM FIREBASE KURALLARI:** Aday kurallar yalnızca repo/emülatör testlerine güncellendi; Firebase Console'daki canlı kurallar otomatik değiştirilmedi.
- Sonraki hikâye işi: Görev 16 “Sahte Çıkış”ın iki farklı savunma etabı ve döngü mekânı değişimiyle uygulanması. Görev 15'in elle oynanış testleri de sonraki QA turunda yapılmalı.


## 2026-10-26 — Hikâye modu yükseltme izolasyonu düzeltmesi

- **Bulgu:** Sonsuz mod için çalışan anti-cheat gölge-kayıt denetimi, hikâye görevlerinin geçici oyun durumunu da kontrol ediyordu. Görev başında temiz durum kurulunca gölge kayıt yükseltmeleri/yoldaş seviyelerini geri yazabiliyordu; bu da çoklu atış ve ekonomi yükseltmelerinin hikâyeye taşınmasına yol açabilecek kök nedendi.
- **Düzeltme:** `engine.js` anti-cheat aralığı hikâye modu/aktif hikâye oturumu sırasında erken çıkıyor; Sonsuz modun güvenilir gölge kaydı değiştirilmeden korunuyor. `data.js` içinde hikâye modunda çoklu atış yalnızca görev yerel yükseltmesine dayanıyor, altın çarpanı ve yoldaş güç çarpanı 1x ile sınırlandırılıyor.
- **Test:** `security-lab/progression-guard-regression.test.js` içine anti-cheat atlama sırası ve çoklu atış/ekonomi/yoldaş çarpanlarının hikâyede izole edilmesi için regresyon testleri eklendi.
- **Durum:** Kod değişiklikleri PR dalında; otomatik CI ve canlı oyunda görev başlat/bitir + Sonsuz moda dönüş testi bekleniyor. Firebase kuralları veya kullanıcı kayıtları değiştirilmedi.


## İş günlüğü — 2026-10-26: Hikâye yükseltme izolasyonu ve tekrar oynama koruması

- Kullanıcı, can/hasar/ekonomi/yoldaş güçlendirmelerinin Sonsuz Moddan Hikâye Moduna sızdığını ve “Tekrar Oyna” akışının çalışmadığını bildirdi.
- `fix/story-upgrade-isolation` dalındaki mevcut çözüm; görev başında yeni `getDefaultState()` kurulmasını, yükseltme/envanter/prestij/ganimet değerlerinin hikâye için sıfırlanmasını, ekipman bonuslarının ve kalıcı hasar/altın/yoldaş çarpanlarının hikâyede devre dışı kalmasını ve anti-hile gölge geri yüklemesinin hikâye savaşına müdahale etmemesini içeriyor.
- Ek düzeltme: tamamlanmış bir karşılaşma oturumu hâlâ etkin görünüyorsa, tekrar başlatma tıklaması artık tamamlanmış oturumun Sonsuz Mod snapshot'ını geri yükleyip yeni görevi başlatabilir. Tamamlanmamış görevler otomatik kapatılmaz.
- Regresyon testi: tamamlanmış oturumun temizlenmesi ve bitmemiş görevin korunması için kaynak testi eklendi.
- Test durumu: [ ] Bu ek değişiklikten sonraki GitHub Actions koşusu tamamlanmalı. Önceki koşu `40282002446` başarılıydı; yeni commit için bu sonuç kanıt sayılmaz.
- Canlı doğrulama: [ ] Yüksek Sonsuz Mod can/hasar/ekonomi/eşya/yoldaş ilerlemesiyle Hikâye görevi başlat; değerleri doğrula; görevi tamamla; “Tekrar Oyna”yı kullan; görevden çıkıp Sonsuz Moda dönerek önceki kayıtların korunduğunu doğrula.
- Ana dala birleştirme ve canlı dağıtım: HAYIR / henüz doğrulanmadı.


## İş günlüğü — 2026-10-26: Oyun performansı denetimi ve hedef seçimi optimizasyonu

- Denetimde `engine.js` kule ateş ederken her ateşleme anında tüm düşmanlar için yeni bir `map` dizisi oluşturuyor, `filter` çalıştırıyor ve bütün uygun hedefleri `sort` ediyordu. Bu iş, sadece en yakın birkaç düşman vurulacak olsa bile tekrarlanıyordu.
- Optimizasyon: `getNearestEnemiesInRange()` eklendi. Artık yalnızca gereken en yakın hedef sayısı sıralı küçük bir listede tutuluyor; tüm düşman listesini her ateşlemede sıralamak ve ara dizileri oluşturmak gerekmiyor. Multishot değeri ateşleme başına bir kez hesaplanıyor.
- Beklenen etki: Özellikle düşman sayısı ve çoklu atış yükseldikçe daha az geçici nesne/array üretimi ve daha az sıralama işi. Gerçek cihazda FPS ölçümü henüz yapılmadı; performans kazancı sayısal olarak doğrulanmış değildir.
- Regresyon testi: en yakın hedef sırası, hedef sayısı sınırı, menzil + düşman yarıçapı sınırı ve sıfır hedef sınırı için test eklendi.
- Test durumu: [ ] GitHub Actions syntax ve Security Lab / Firestore Emulator testleri bu commit sonrasında çalışmalı.
- Kod incelemesinde ayrıca not edildi: hikâye görevleri 10–15 için gerçek tarayıcı/mobil QA bekliyor; 16–18 tasarım aşamasında; arkadaş sistemi henüz doğrulanmış değil; hikâye bulut senkronizasyonu ve canlı Firestore kuralları ayrıca doğrulanmalı; liderlik tablosu istemci tarafından bildirildiğinden sunucu otoritesi yok.
- Güvenlik sınırı: istemci anti-hile gölge kaydı değiştirilmiş istemciye karşı sunucu otoritesi değildir; hileye dayanıklı liderlik/ekonomi için güvenilir backend doğrulaması hâlâ eksik.
