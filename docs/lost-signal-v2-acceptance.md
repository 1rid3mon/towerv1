# Lost Signal v2 kabul kaydı

19 Kasım 2026. Ana çalışma PR #137; v1 kayıt/ekonomi uygulaması main üzerindeki #136 ile korunuyor.

| Paket | Uygulanan davranış | Kanıt |
| --- | --- | --- |
| J0 | 72 px ray, bölünmeyen etiketler, atölye için 44 px hedefler | Üç boyutta gerçek DOM taşma/hedef denetimi |
| J1 | Havuz, yoğunluk, otomatik düşürme, sistem/kullanıcı hareket azaltma | FxDirector ve meta tercih testleri |
| J2 | Görsel veri damlaları, birleştirme, emilme, varış halkası, sürükleyerek erken toplama | Gerçek killEnemy ile 100 öldürmede FX açık/kapalı/azaltılmış aynı bakiye ve RNG tüketimi |
| J3 | Kritik duraklaması, boss sarsıntısı/yavaş çekimi, ses merdiveni, kontrollü titreşim, zincir | Süre, sınır, desteklenmeyen cihaz ve hata izolasyonu testleri |
| J4 | Kaynak hapları, can çubuğu, aşama/boss göstergesi, beceri halkaları, sezon çizgisi | 844×390, 740×360, 1180×820 savaş görüntüleri; tuval yüksekliği en az %85 |
| J5 | Sağ ayar paneli, tek açık akordeon, geri/ESC/kaydırma/odak, duraklama koruması | Gerçek tarayıcıda çalışan ve zaten durmuş savaş durumları |
| J6 | Tek Telsiz kartı, 6 saniye/2 saniye aralık, kayıtlı tekilleştirme, tarih/sürüm süzme, Yenilikler | Kuyruk testleri, hikâye girişinin üstüne popup açılmaması, canlı savaş kontrolü |
| J7 | Günlük sayı/kart/mühür/Piko/yazı animasyonu, hızlı geçiş, 3/7/14/30 gün vurgusu | Aynı gün tekrar, 6/7 gün ara, 30 günlük seri, görsel ödül uçuşu |
| J8 | 64 px genişlikte kompakt kutular, sınıf grupları, sabit Tak/Birleştir, çağırma/birleşim animasyonları | Üç boyutta görünür ana eylem ve 12 px altına düşmeyen metin |
| J9 | Masaüstü tarayıcı kabulü ve kısa performans örnekleri | Fiziksel cihaz kabulü aşağıda açık |

## Kanıtlar

- Mobil kabul: https://github.com/1rid3mon/towerv1/actions/runs/44474082806 — commit bac6b3b üzerinde geçti. Son tercih/kapanış düzeltmeleri PR'nin güncel CI koşusunda tekrar doğrulanır.
- Aynı koşunun `mobile-meta-evidence` çıktısında üç boyutta Arşiv, Protokol, İkmal, günlük giriş, sezon, geri dönüş, etkinlik, Yenilikler, ayar, savaş ve damla ekranları bulunur.
- Yerel tüm testler: 310 test, 309 geçti; tek yükleme hatası kurulu olmayan `@firebase/rules-unit-testing`. GitHub Firestore emulator işi ayrıca geçti. Sonraki yeni test/CI sonuçları PR açıklamasında tutulur.
- İlk kısa headless örnekte ortalama kare aralıkları: 844×390 16,56 ms; 740×360 16,56 ms; 1180×820 25,69 ms. Paylaşımlı CI makinesi ölçümüdür; Android performans kabulü değildir.

## Uygulama kararları ve sınırlar

- Ödül ölüm anında mevcut ekonomik koda yazılır. Uçuş yalnız gösterilen sayıyı etkiler; görünürlük değişimi, yenilgi ve hikâye geçişi görsel borcu temizler.
- Şartnamedeki 60 damla üst sınırı ile Yüksek=90 çelişkisinde güvenli sabit 60 seçildi. Düşük yoğunluk ve azaltılmış harekette bakiye hemen gösterilir.
- Orta yoğunlukta yeni/eskiden çizilen kozmetik öğeler ortak 150 çizim sınırını kullanır. Eski parçacık depolaması ve oynanış işaretleri aynı nesne sınırına zorlanmaz; RNG ve tehlike görünürlüğü korunur. 4 ms kozmetik çizim kesmesi vardır; her gerçek cihazda maliyet garantisi verilmez.
- Arşiv kutuları 64 px genişlik, okunabilir 48 px simge ve 12 px sayaç için 76 px yüksekliktedir. Her sınıfta yalnız iki mevcut ekipman olduğundan sınıf grupları seyrek olabilir; yeni içerik/ödül uydurulmadı.
- Sektör boss'u mevcut dalga mantığıyla otomatik gelir. HUD düğmesi bekleme/aktif/hazır durumunu gösterir ve hazırken aynı tekilleştirilmiş boss yolunu çağırır; ayrı bir boss veya ödül üretmez.
- FX tercihleri istasyon hesabında normalize edilir. Hikâye realm'inde tercihler cihaz sunumuna uygulanır; Sonsuz Mod ekonomik kaydına yazılmaz.

## Fiziksel cihazda kalan kabul

Bu ortam fiziksel Android cihazına erişmiyor. Orta/düşük cihazda 30 dakika FPS/ısı/pil, gerçek titreşim ve ses, arka plana alıp dönüş, döndürme ve Android geri jesti henüz doğrulanmadı. J9 fiziksel kabulü bu nedenle tamamlandı olarak işaretlenmez. Android paketleme sonraki aşamadır.
