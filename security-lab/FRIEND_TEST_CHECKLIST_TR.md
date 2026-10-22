# Arkadaş Testi — Kule Savunma

Bu kontrol listesi, oyunun mevcut canlı sürümünü oynayarak oynanış ve mobil arayüz sorunlarını bulmak içindir. **Güvenlik dalındaki değişiklikleri test etmiş sayılmaz**; bu dal henüz birleştirilmedi ve canlı Firebase kuralları değiştirilmedi.

## Test öncesi güvenlik

- [ ] Oyuncuya bunun canlı oyun mu yoksa önizleme bağlantısı mı olduğunu açıkça söyle.
- [ ] Canlı oyunda hesap silme, oyunu sıfırlama, kayıt kodu içe aktarma veya güvenlik/anti-cheat denemeleri yapma.
- [ ] Değerli ilerlemesi olan ana hesabı kullanmak yerine mümkünse test için yeni bir hesap kullan.
- [ ] İlerleme kaybolmuş görünürse yenilemeden, çıkış yapmadan ve yeni kayıt oluşturmadan önce ekran görüntüsü al ve haber ver.
- [ ] Şifre, doğrulama kodu veya Firebase yapılandırma anahtarlarını paylaşma.

## Kısa oynanış testi

- [ ] Oyunu aç; yükleme hatası, boş/siyah ekran veya donma var mı?
- [ ] Birkaç dalga oyna; düşmanlar kuleye ulaştığında can ve yenilgi doğru çalışıyor mu?
- [ ] Kule yükseltmesi satın al; altın doğru azalıyor ve seviye/hasar etkisi görünüyor mu?
- [ ] Oyunu yenile ve dalga, altın, yükseltmeler ile kozmetiklerin tutarlı kaldığını kontrol et.
- [ ] Telefon dikey ve yatay konumda menüler, dalga sayısı ve düğmeler ekrana sığıyor mu?
- [ ] Liderlik tablosunu aç; adlar ve dalga bilgileri düzgün mü? Beklenmeyen hata veya sürekli yükleme var mı?

## Hesap / bulut testi (yalnızca test hesabıyla)

- [ ] Yeni test hesabı oluşturulabiliyor mu?
- [ ] Aynı kullanıcı adını tekrar kaydetmeye çalışınca anlaşılır hata gösteriliyor mu?
- [ ] Çıkış yapıp aynı hesapla giriş yapınca ilerleme geri geliyor mu?
- [ ] Aynı test hesabını ikinci cihazda açınca bulut ilerlemesi beklenen şekilde geliyor mu?
- [ ] Ağ kesilince oyun yanlışlıkla “buluta kaydedildi” başarı mesajı gösteriyor mu?

## Sorun raporu şablonu

- Tarih/saat:
- Cihaz ve tarayıcı:
- Açılan bağlantı: canlı / önizleme
- Hesap akışı: yerel / Firebase
- Beklenen sonuç:
- Gerçekte olan:
- Tekrarlama adımları:
- Ekrandaki hata metni:
- Dalga ve ilerleme etkisi:

Şüpheli bir kayıt kaybında oyunu kapatıp açmaya veya tekrar giriş yapmaya devam etme; önce mevcut durumu raporla.
