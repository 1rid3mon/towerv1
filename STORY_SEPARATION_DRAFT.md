# Hikâye Modu Ayrıştırma Taslağı

**Durum:** Deneysel tasarım belgesi. Henüz oyun kodu ayrıştırılmadı; bu dosya canlı oyunun davranışını değiştirmez.

## 0. Güvenli geri dönüş noktası

Ayrıştırma öncesi mevcut `main` durumu şu dalda saklandı:

- `backup/pre-story-separation-2026-10-27`
- Baz commit: `38cac2b954ea2c766caebfcc9db8b9d40d92428e`

Bu dalı hikâye ayrıştırma denemeleriyle güncellemeyin. Geri karşılaştırma için sabit kalsın.

## 1. Oyuncunun göreceği ürün davranışı

- Ana menüden **Sonsuz Mod** veya **Hikâye Modu** seçilebilir.
- Oyuncu iki mod arasında ana menü üzerinden tekrar tekrar geçebilir.
- **Piko ortak bir karakterdir:** iki modda da görünür ve tanınır; ortak görsel/karakter kimliği tek kaynaktan gelir.
- Piko'nun hikâyeye özel diyalogları, görev durumları veya form açılımları Sonsuz Mod'un savaş yükseltmelerine/ekonomisine otomatik olarak taşınmaz. Ortak karakter olması, iki modun bütün oyun durumlarının ortak olması demek değildir.
- Mod değiştirmek yarım kalmış savaşın zamanlayıcılarını/olay dinleyicilerini temizler; kaydedilmiş hikâye ilerlemesi ve Sonsuz Mod kaydı birbirinden bağımsız kalır.

## 2. Önerilen geçici dosya sınırları

İlk taslakta mevcut ortak dosyalar kopyalanmayacak. Sınırlar davranışı güvenceye aldıktan sonra kademeli oluşturulacak:

- `index.html`: mevcut ana giriş; başlangıçta her iki moda erişim.
- `story.html`: ileride ayrı hikâye giriş noktası için prototip; ana menüden seçilen mod akışını bozmadan test edilecek.
- `data.js`: yalnızca iki modun gerçekten paylaştığı veri/ortak altyapı.
- `engine.js`: ortak savaş simülasyonu; hikâye görev kuralları engine'e dağınık biçimde eklenmek yerine kontrollü bir mod arayüzü üzerinden bağlanmalı.
- `render.js`: ortak dünya/kule/düşman çizimi ve Piko'nun paylaşılan temel görseli. Hikâyeye özgü sahne/efekt gerekirse ayrı katmana alınmalı.
- `ui.js`: önce bağımlılık haritası çıkarılacak; ardından sonsuz mod kontrolü ve hikâye kontrolü ayrı modüllere taşınacak.
- Olası yeni modüller: `story.js` (görev akışı/oturum), `story-data.js` (görev tanımları), gerekirse `story-render.js` (hikâyeye özel görseller).

## 3. Piko için mimari sözleşme

1. Piko'nun ortak kimliği, temel çizimi ve ortak animasyon dili tek bir yerde tanımlanır; her HTML'de ayrı kopya tutulmaz.
2. Her mod Piko'yu kendi mod bağlamında sunabilir. Hikâye sahnesi, diyalog veya hikâyeye özel form yalnızca Story Mode oturumuna ait olur.
3. Hikâyeye özel yoldaş yetenekleri/çoklu atış/ödül değişkenleri Sonsuz Mod'un `game.companions`, ekonomi veya yükseltmelerine sızamaz.
4. Sonsuz Mod'un ekipman/yükseltme değerleri hikâye görevlerini beklenmedik şekilde kolaylaştırmamalı.
5. Mod değişiminde Piko'nun görsel/karakter kimliği korunur; mod oturumuna ait geçici efektler ve yetenek durumları temizlenir.

## 4. Ayrıştırmadan önce cevaplanacak teknik sorular

- Hangi Story Mode fonksiyonları hangi global değişkenlere bağlı?
- Hangi hikâye DOM ID'leri mevcut `index.html` içinde; hangileri sonsuz mod arayüzüyle ortak?
- `engine.js` ve `render.js` içindeki hikâye dalları hangi fonksiyonlardan çağrılıyor?
- Hangi timer, animation frame, event listener ve async Firebase işlemleri mod değişiminde iptal edilmeli?
- Yerel hikâye kaydı ile bulut kaydı kullanıcı değiştiğinde nasıl eşleştiriliyor?
- `story.html` yüklenince Firebase SDK'sı ve ortak başlatma kodu iki kez çalışabilir mi?
- Android WebView'da ana menü, sayfa geçişi, geri tuşu ve portre/yatay düzen nasıl işleyecek?

## 5. Uygulama sırası

1. Story/Endless bağımlılık haritası ve mevcut testlerin incelemesi.
2. Hikâyeye giriş, görev başlatma, kazanma, kaybetme, tekrar deneme, çıkış ve moda geri dönme testleri.
3. Tek bir mod/oturum yaşam döngüsü ve merkezi temizlik fonksiyonları.
4. Hikâye controller'ının `story.js` içine küçük, test edilebilir adımlarla çıkarılması.
5. Ortak Piko çizimi ve ortak çekirdeğin kopyasız kaldığının doğrulanması.
6. Ayrı `story.html` prototipi ve masaüstü + mobil portre/yatay regresyon testleri.
7. Android/WebView paketleme davranışı ve Firebase giriş/kayıt kontrolleri.

## 6. Tamamlandı demek için gerekenler

- [ ] Ayrıştırma öncesi branch korunuyor ve değişmeden duruyor.
- [ ] Ana menüden her iki moda geçiş ve geri dönüş test edilmiş.
- [ ] Piko iki modda da mevcut ve ortak temel varlığı kullanıyor.
- [ ] Hikâye ve Sonsuz Mod ekonomisi/yükseltmeleri/yoldaş durumları birbirine karışmıyor.
- [ ] Mod değiştirme sonrasında timer/listener/savaş döngüsü sızıntısı yok.
- [ ] Hikâye bulut kaydı kullanıcılar arasında karışmıyor.
- [ ] JS syntax, regresyon testleri ve CI başarılı.
- [ ] Masaüstü, mobil portre, mobil yatay ve Android/WebView testleri raporlanmış.
- [ ] Canlı dağıtım ayrıca doğrulanmış.

**Not:** Bu taslak hedefi tanımlar; hiçbir testin yapılmış olduğu veya ayrı `story.html` dosyasının hazır olduğu anlamına gelmez.
