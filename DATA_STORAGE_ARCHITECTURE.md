# TowerV1 — Oyuncu Verisi ve Firebase Saklama Planı

Güncelleme: 2026-10-28

## Karar

- Kimlik doğrulama: Firebase Authentication.
- Kalıcı bulut verisi: Cloud Firestore.
- Cihaz içi kopya: `localStorage`, yalnızca yerel/önbellek ve geçici çevrimdışı kullanım için.
- Oyun içi para, dalga ve kayıt verileri için ikinci bir veritabanı açılmayacak.
- Firebase web yapılandırması istemci uygulamasında görünür olabilir; güvenlik, yapılandırma anahtarını gizlemekten değil Authentication ve Firestore Security Rules'dan gelir. Admin/service-account anahtarları istemciye asla konmaz.

## Veri haritası

| Koleksiyon / belge | Saklanan veri | Erişim |
| --- | --- | --- |
| `users/{uid}` | `username`, `saveData` (Sonsuz Mod oyun durumunun JSON metni), `highestWave`, `updatedAt` | Yalnızca aynı UID sahibi okuyup yazabilir |
| `storyProgress/{uid}` | Hikâye görev bayrakları, seçimler, bölüm ve güncelleme zamanı | Yalnızca aynı UID sahibi okuyup yazabilir |
| `usernameRegistry/{normalizedUsername}` | Kullanıcı adı sahipliği ve UID | Giriş yapmış kullanıcılar isim uygunluğunu kontrol edebilir; yazma kuralları tekil sahipliği korumalı |
| `leaderboard/{uid}` | Herkese açık sıralama için sınırlı profil/skor alanları | Okuma herkese açık; yazma aday kurallarda sahiplik ve oran/sınır kontrollerine bağlı |
| `leaderboardRateLimits/{uid}` | Skor yazım aralığını sınırlayan kalıcı metadata | Sahibinin okuması/yazması; silinmesi engellenir |
| `friendRequests/{fromUid_toUid}` | Arkadaş isteği, gönderen/alıcı, durum ve zamanlar | Yalnızca isteğe katılan kullanıcılar; geçiş kuralları ile |

Bu tablo, istemci kodu ve depodaki aday kuralların tasarlanan veri modelidir. Gerçek Firebase projesinde hâlihazırda bulunan koleksiyonların ve yayınlanmış kuralların birebir aynı olduğu henüz Firebase Console üzerinden doğrulanmış değildir.

## Kayıt akışı

1. Oyuncu Firebase Auth ile giriş yapar; UID ana veri sahipliği kimliğidir.
2. Endless kayıtları `users/{uid}` belgesine, Story ilerlemesi ayrı `storyProgress/{uid}` belgesine yazılır. Bir mod diğerinin kaydını güncellemez.
3. Cihaz içi kayıtlar açılışta kullanılabilir, ancak bulut oturumu yüklenirken başka UID'ye ait yerel kayıt içeri aktarılmaz.
4. Bulut yazımı başarısız olursa yerel kayıt korunur ve hata sessizce “buluta kaydedildi” gibi gösterilmez.
5. Hesap silme akışı ve saklama/silme kapsamı, mağaza yayınından önce Auth + ilgili kullanıcı belgeleri için uçtan uca doğrulanmalıdır.

## Önemli güvenlik sınırları

- Firestore Rules, UID sahipliğini ve alanların şeklini kontrol edebilir; istemciden gelen oyun içi altın, kristal, dalga veya hasarın gerçekten kazanıldığını kanıtlayamaz.
- `saveData` JSON metni olduğu için Firestore Rules içindeki doğrulama sınırlıdır. İstemci imzası değiştirilmiş istemciye karşı sunucu güveni sağlamaz.
- Liderlik tablosu şu an istemci tarafından bildirilen skorlara dayanır; sunucu otoritesi/gerçek oyun doğrulaması olmadan hileye dayanıklı kabul edilmemelidir.
- Gerçek üretim Firestore kuralları Firebase Console veya yetkili Firebase CLI üzerinden incelenip bu repodaki `firestore.rules` ile karşılaştırılmalıdır. Aday kuralların repoya eklenmesi onları üretime dağıtmaz.
- Üretim kuralları doğrulanmadan “veriler tamamen güvenli” veya “yayın kuralları kuruldu” denmemelidir.

## Bu değişiklikteki kuralların durumu

Kök dizindeki `firestore.rules`, önceki `security-lab/firestore.rules` test snapshot'ının sürümlenmiş adayıdır. Emulator testleri bundan sonra kök dosyayı okur; böylece test edilen kural dosyası dağıtım yapılandırmasında belirtilen dosyayla aynı olur.

**Bu dosya henüz üretim Firebase projesine dağıtılmış değildir.** Dağıtımdan önce mevcut üretim kurallarıyla karşılaştırma, Emulator testleri ve kullanıcı onayı gerekir. Bu PR otomatik olarak üretim verisine veya canlı kurallara dokunmaz.
