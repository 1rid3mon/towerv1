# Firebase — sabah devralma kontrolü

Bu belge canlı Firebase kurulumu tamamlandı demek değildir. Üretim hesabına erişim olmadan Auth, yayımlanmış kurallar ve gerçek cihazlar arası senkronizasyon doğrulanamadı. Hiçbir gerçek oyuncu kaydı silinmedi veya sıfırlanmadı.

1. Firebase Console'da **rid3mon-c311a** projesini aç. Yeni/boş projeye geçme. Firestore'daki mevcut koleksiyonları ve kullanıcıları koru. Mevcut yayımlanmış Rules metnini değişiklikten önce ayrı dosyaya kopyala.
2. Authentication → Sign-in method: oyunun kullandığı Email/Password ve Google sağlayıcılarını kontrol et. Settings → Authorized domains içinde `towerv1-murex.vercel.app` bulunmalı. Şifre/servis hesabı anahtarını sohbete yapıştırma.
3. Depodaki `firestore.rules` adayını mevcut üretim kurallarıyla karşılaştır. `security-lab/firestore.rules` bunun test kopyasıdır. Yerel doğrulama: Java 21 ve Node 22 ile `cd security-lab`, `npm install`, `npm test`. Demo emülatör gerçek projeye yazmaz.
4. Aday kuralların üretime alınması ayrı işlemdir. Console Rules ekranında diff'i inceleyip Publish kullanılabilir; Firebase CLI tercih edilirse doğru projeyi açıkça seç: `firebase deploy --only firestore:rules --project rid3mon-c311a`. Diğer servisleri, verileri veya indeksleri topluca sıfırlama.
5. İki kontrollü test hesabı kullan. Hesap A ve B aynı kullanıcı adını alamamalı; A, B'nin `users`/Story kaydını okuyup yazamamalı. Kendi kayıtları ve mevcut eski kayıtları yüklenebilmeli. Kurallar arkadaşlık/leaderboard akışını yanlışlıkla engellememeli.
6. A hesabında Sonsuz Mod kaydı, yükseltme, envanter, ekipman ve yoldaşı değiştir; çıkış/giriş ve ikinci cihazda kontrol et. B'ye geçince A'nın verileri görünmemeli. Hikâye'yi açmak için ilk 25 dalganın geçilmiş olması gerekir (26'ya ulaşmak).
7. Story görev 1, 10 ve 22–27'yi oyna; sonuçtan hemen çıkıp tekrar giriş yap. Görevler eylemsiz tamamlanmamalı; Endless kaydı korunmalı. Yeni aday şema 22–27 bayraklarını, `stabilityChoice` ve mor/kule biçimini kabul eder. Eski kurallar bu alanları reddederse istemci eski bulut şemasını kullanır ve yeni ilerlemeyi aynı cihazda tutar; uyarı gösterir. Bu durumda cihaz değiştirmeden önce kuralları güncelle ve bulut yüklemesini doğrula.
8. 22–27 ara sahne kontrol noktaları hesap anahtarıyla **yalnızca yerelde** tutulur; bulutta görev tamamlanma bayrakları taşınır. İkinci cihazda yarım görevin aynı sahneden başlaması garanti edilmez.
9. Arkadaşlık gönder/kabul/sil, unvan/başarımlar, liderlik tablosu güncellemesini test et. Başka UID'ye yazma ve bozuk skor şeması emülatör testlerinde reddedilir; bu, oyunun oynandığını kanıtlamaz.

## Açık güvenlik sınırı

Oyun savaşı ve ekonomi hâlâ istemcide hesaplanır. Kayıt checksum'u ve ödül günlüğü değiştirilmiş bir istemciye karşı güvenilir sunucu imzası değildir. Sahte ama biçimsel olarak geçerli skor/para kazanımını kesin önlemek için sunucu otoriteli oturum, ödül ve skor doğrulaması gerekir; yalnızca Firebase eklentisini bağlamak veya Rules yayımlamak bu mimariyi kurmaz. `SECURITY_BACKEND_DESIGN.md` içindeki tasarım bu nedenle bekleyen iş olarak korunur. Mevcut oyuncuları keyfî sert limitlerle kilitleme.

## Firebase'den bağımsız son kontroller

En son PR'nin Actions sonuçlarını ve Vercel'de o **commit** için READY durumunu kontrol et. Eski bir dağıtımın READY olması yeni sürümü doğrulamaz. Üretim asset eşleşmesi ve misafir Chromium testinin sonucu ayrı raporlanmalıdır. Gerçek iOS/iPad ve Android dokunma/ses/performans testi ayrıca gereklidir.
