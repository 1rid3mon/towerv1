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
