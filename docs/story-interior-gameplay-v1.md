# LOST SIGNAL · İç İstasyon Hikâye Modu — Uygulama Sözleşmesi

## Vizyon
Sonsuz mod yüzeydeki kule savunmasıdır. Hikâye modu aynı kulenin devasa iç istasyonunda, yukarıdan bakışlı keşif ve savunma deneyimidir. Görev 1–27 tek bir devamlı maceradır; her görevin ayrı gerilimi ve amacı vardır. Yoldaşlar hikâyenin ilerleyen bölümlerinde tanıtılır.

## Görev 1: Uyanış — ilk oynanabilir dilim
- Komutan istasyonun karanlık komuta/uyku bölümünde başlar; karakter görünür, kamera takip eder.
- iPad dokunmatik sanal joystick ve büyük ETKİLEŞ düğmesi; masaüstü WASD/ok ve E.
- İlk hedef: bozuk enerji hattını bulmak. Odayı keşfetmeden görev tamamlanamaz.
- Reaktör konsolunda üç sigorta/enerji bağlantısı vardır. Oyuncu doğru devreyi kurar; yanlış bağlantı geri alınabilir, ücretsiz otomatik tamamlanma yoktur.
- Enerji gelince güvenlik kapısı açılır; oyuncu yeni koridora yürür.
- Güvenlik alarmı savunma savaşını tetikler. Mevcut kule savunma motoru burada kullanılır.
- Savaştan sonra istasyonun enerji durumu dünyaya işlenir ve görev 2 aynı dünyadan devam eder.
- Kayıtlar ve bölüm ilerlemesi korunur; sonsuz modun ilerlemesine dokunulmaz.
- İlk bölümde yoldaş eşleşmesi yoktur; eski görevin otomatik yoldaş kazanma kuralı yeni hikâyede uygulanmamalıdır.

## Dünya modeli
- Kat/oda/kapı/terminal/enerji durumu ve ipuçları, sürümlü hikâye kayıt şemasında tutulur.
- Her oda giriş/çıkış, etkileşim alanları, çarpışma ve hikâye tetikleyicileriyle tanımlanır.
- Kilitli kapı fiziksel olarak engeldir; sadece görev metniyle kilitlenmez.
- Kamera, karakteri izler; görev paneli varsayılan olarak kapalı küçük bir takipçidir.
- Her görevin zorunlu bir mekânsal eylemi ve sonucunu gösteren bir dünya değişimi olmalıdır.
- Görev 3: Anten dizisi, yönlendirilebilir enerji ve açılabilir kapılarla keşif bulmacası.
- Görev 8: Tanıdık oda, üç farklı fiziksel ipucu ve kanıt karşılaştırma/çıkarım.
- Tıklama sayacı veya tek düğmeyle ilerleme ana görev tamamlama mekanizması olamaz.

## Teknik güvenlik
- Yeni keşif motoru mevcut story runtime iframe sınırında çalışır; sonsuz mod state'ini değiştirmez.
- Eski hikâye kayıtları okunabilir kalır; yeni şema eksikse güvenli varsayılanlar kullanılır.
- Sahne geçişleri, kaydetme, başarısızlık/yeniden deneme, iPad yatay/dikey, klavye ve dokunma testleri gereklidir.
- Main'e birleştirme ve Vercel yayını ancak çalışan prototip ve test doğrulamasından sonra.
