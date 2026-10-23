const SAVE_KEY = 'CoreTowerDefense_Save_v11';
// Bu tarayıcıda en az bir kez İMZALI kayıt üretildiğini gösterir (eski imzasız kayıtların geçiş kontrolü için)
const SIGNED_MARK_KEY = 'CoreTowerDefense_signedOnce';

const THEME_DEFS = {
    cyber: { id: 'cyber', name: 'Siber Çekirdek', towerName: 'Siber Izgara Arka Planı', reqWave: 1, icon: 'fa-solid fa-microchip', color: 'text-blue-400', desc: 'Klasik siber savunma atmosferi.' },
    aurora: { id: 'aurora', name: 'Kuzey Işıkları Sezonu', towerName: 'Aurora Borealis Sezon Alanı', reqWave: 1, icon: 'fa-solid fa-meteor', color: 'text-teal-300', desc: 'Dalgalanan kutup ışıkları, yıldız tozu ve özgün sentetik ambient müzik.' },
    cengiz: { id: 'cengiz', name: 'Cengiz Hakanlığı', towerName: 'Bozkır & Kızıl Tuğ Arka Planı', reqWave: 15, icon: 'fa-solid fa-khanda', color: 'text-red-400', desc: '15. Dalgada açılır. Destansı kılıçlar, kızıl korlar ve hakanlık mührü.' },
    snow: { id: 'snow', name: 'Buzul Gezegeni (Kar)', towerName: 'Kar & Kuzey Işıkları Arka Planı', reqWave: 30, icon: 'fa-solid fa-snowflake', color: 'text-sky-300', desc: '30. Dalgada açılır. Çam ağaçları, kuzey ışıkları ve kristal kar fırtınası.' },
    desert: { id: 'desert', name: 'Kızıl Çöl & Kaktüs', towerName: 'Çöl Kumulları Arka Planı', reqWave: 45, icon: 'fa-solid fa-sun', color: 'text-amber-400', desc: '45. Dalgada açılır. Dev kaktüsler, kum tepeleri ve çöl güneşi.' },
    space: { id: 'space', name: 'Derin Uzay Nebulası', towerName: 'Kozmik Nebula Arka Planı', reqWave: 60, icon: 'fa-solid fa-shuttle-space', color: 'text-purple-400', desc: '60. Dalgada açılır. Renkli nebulalar, halkalı gezegenler ve kayan yıldızlar.' },
    bubblegum: { id: 'bubblegum', name: 'Buubglegum Rüyası', towerName: 'Mavi-Pembe Kelebek Arka Planı', reqWave: 100, icon: 'fa-solid fa-wand-magic-sparkles', color: 'text-pink-400', desc: '100. Dalgada açılır. Mavi-pembe kelebekler ve uçuşan sakız balonları!' }
};

const SKIN_DATABASE = {
    default_cyber: { id: 'default_cyber', name: 'Plazma Kulesi', rarity: 'rare', emoji: '⚡', desc: 'Standart siber savunma kulesi.', projColor: '#60a5fa', critColor: '#c084fc' },
    kurt_kaan: { id: 'kurt_kaan', name: 'Kurt Kaan', rarity: 'legendary', emoji: '🐺', desc: 'Asil bozkurt ruhu taşıyan, uluyarak plazma pençesi fırlatan Efsanevi Kurt Kaan kulesi!', projColor: '#38bdf8', critColor: '#facc15' },
    dgdvrn: { id: 'dgdvrn', name: 'DGDVRN (Altın Kaplama)', rarity: 'legendary', emoji: '👑', desc: 'Özel üretim saf altın kaplamalı efsanevi kule!', projColor: '#facc15', critColor: '#fef08a' },
    black_hole: { id: 'black_hole', name: 'Kozmik Kara Delik', rarity: 'legendary', emoji: '🕳️', desc: 'Uzay-zamanı büken, etrafında olay ufku dönen efsanevi kara delik kulesi!', projColor: '#a855f7', critColor: '#f43f5e' },
    nane_tower: { id: 'nane_tower', name: 'Nane Kulesi', rarity: 'legendary', emoji: '🌿', desc: 'Buzlu nane yaprakları ve ferahlatıcı zümrüt kristaliyle düşmanları kesen efsanevi kule!', projColor: '#34d399', critColor: '#a7f3d0' },
    sunkas_tower: { id: 'sunkas_tower', name: 'Sunkas Kulesi', rarity: 'legendary', emoji: '☀️', desc: 'Altın güneş halesi ve siber imparatorluk çekirdeğiyle parlayan efsanevi Sunkas kulesi!', projColor: '#fbbf24', critColor: '#38bdf8' },
    ates_tower: { id: 'ates_tower', name: 'Ateş Kulesi', rarity: 'legendary', emoji: '🔥', desc: 'Volkanik magma çekirdeği ve dönen alev halkalarıyla her şeyi kül eden efsanevi kule!', projColor: '#f97316', critColor: '#fef08a' },
    teyzir_tower: { id: 'teyzir_tower', name: 'Teyzir Kulesi', rarity: 'legendary', emoji: '⚡', desc: 'Yüksek voltajlı Tesla bobinleri ve şok yıldırımları saçan efsanevi elektro-şok kulesi!', projColor: '#22d3ee', critColor: '#facc15' },
    bubblegum: { id: 'bubblegum', name: 'Balonlu Sakız', rarity: 'mythic', emoji: '🫧', desc: 'Şişip patlayan tatlı pembe balonlu sakız otomatı kulesi.', projColor: '#f472b6', critColor: '#c084fc' },
    cyber_samurai: { id: 'cyber_samurai', name: 'Siber Samuray', rarity: 'mythic', emoji: '🥷', desc: 'Çift katana namlulu, kızıl kabuto miğferli ölümsüz Shogun kulesi.', projColor: '#f43f5e', critColor: '#fde047' },
    snowman: { id: 'snowman', name: 'Kardan Adam Kulesi', rarity: 'mythic', emoji: '⛄', desc: 'Havuç burunlu efsanevi Kardan Adam kulesi.', projColor: '#bae6fd', critColor: '#38bdf8' },
    star_cruiser: { id: 'star_cruiser', name: 'Yıldız Kruvazörü', rarity: 'mythic', emoji: '🚀', desc: 'Galaktik uzay kruvazörü kule görünümü.', projColor: '#38bdf8', critColor: '#f43f5e' },
    dragon: { id: 'dragon', name: 'Kızıl Ejderha', rarity: 'mythic', emoji: '🐉', desc: 'Kanatlı ve boynuzlu ateş püskürten ejderha.', projColor: '#ef4444', critColor: '#f97316' },
    fighter_jet: { id: 'fighter_jet', name: 'Süpersonik Uçak', rarity: 'epic', emoji: '✈️', desc: 'Ses duvarını aşan çift türbinli F-22 avcı uçağı kulesi.', projColor: '#38bdf8', critColor: '#f97316' },
    lion: { id: 'lion', name: 'Ormanlar Kralı Aslan', rarity: 'epic', emoji: '🦁', desc: 'Kükreyen altın yeleli aslan kulesi.', projColor: '#f59e0b', critColor: '#fde047' },
    tiger: { id: 'tiger', name: 'Bengal Kaplanı', rarity: 'epic', emoji: '🐯', desc: 'Siyah çizgili keskin pençeli kaplan kulesi.', projColor: '#fb923c', critColor: '#fef08a' },
    sofa: { id: 'sofa', name: 'Kraliyet Koltuğu', rarity: 'epic', emoji: '🛋️', desc: 'Mor kadife ve altın varaklı kraliyet koltuğu.', projColor: '#c084fc', critColor: '#facc15' },
    robot: { id: 'robot', name: 'Siber Meka', rarity: 'epic', emoji: '🤖', desc: 'Kırmızı lazer vizörlü ağır çelik meka.', projColor: '#94a3b8', critColor: '#ef4444' },
    fire_demon: { id: 'fire_demon', name: 'Ateş İblisi', rarity: 'epic', emoji: '👹', desc: 'Lav çekirdekli ve boynuzlu ateş iblisi.', projColor: '#f97316', critColor: '#fef08a' },
    car: { id: 'car', name: 'Yarış Arabası', rarity: 'super_rare', emoji: '🚗', desc: 'Çift şeritli kırmızı spor yarış arabası.', projColor: '#ef4444', critColor: '#fde047' },
    monkey: { id: 'monkey', name: 'Çılgın Maymun', rarity: 'super_rare', emoji: '🐵', desc: 'Muz namlulu plazma fırlatan maymun.', projColor: '#facc15', critColor: '#a3e635' },
    tree: { id: 'tree', name: 'Kadim Ağaç', rarity: 'super_rare', emoji: '🌳', desc: 'Kök salmış yapraklı doğa koruyucusu.', projColor: '#4ade80', critColor: '#bef264' },
    sleep_emoji: { id: 'sleep_emoji', name: 'Uyku Emojisi', rarity: 'super_rare', emoji: '😴', desc: 'Zzz efektli uyurken bile tek atan kule.', projColor: '#818cf8', critColor: '#fde047' },
    alien: { id: 'alien', name: 'Bölge 51 Uzaylısı', rarity: 'super_rare', emoji: '👽', desc: 'UFO tabanlı yeşil uzaylı kulesi.', projColor: '#4ade80', critColor: '#22d3ee' },
    bird: { id: 'bird', name: 'Gökdoğan Kuşu', rarity: 'rare', emoji: '🐦', desc: 'Açık kanatlı çevik gökdoğan kulesi.', projColor: '#7dd3fc', critColor: '#facc15' },
    water_bottle: { id: 'water_bottle', name: 'Su Şişesi', rarity: 'rare', emoji: '🧴', desc: 'Buz gibi su dalgalı şişe kulesi.', projColor: '#38bdf8', critColor: '#e0f2fe' },
    chair: { id: 'chair', name: 'Oyuncu Sandalyesi', rarity: 'rare', emoji: '🪑', desc: 'RGB aydınlatmalı kırmızı-siyah oyuncu koltuğu.', projColor: '#f43f5e', critColor: '#22d3ee' },
    table: { id: 'table', name: 'Taktik Masası', rarity: 'rare', emoji: '🪵', desc: 'Üzerinde radar haritası olan meşe masa.', projColor: '#d97706', critColor: '#fde68a' },
    pizza: { id: 'pizza', name: 'Sıcak Pizza', rarity: 'rare', emoji: '🍕', desc: 'Sucuklu ve erimiş peynirli İtalyan pizzası.', projColor: '#f97316', critColor: '#ef4444' },
    toilet: { id: 'toilet', name: 'Altın Porselen', rarity: 'rare', emoji: '🚽', desc: 'Girdaplı porselen mizahi kule skini.', projColor: '#60a5fa', critColor: '#facc15' }
};


const COMPANION_SKIN_DATABASE = {
    default_tech: { id: 'default_tech', name: 'Siber Taktik Dronu', rarity: 'rare', emoji: '🛸', desc: 'Göz yormayan, zarif kanatlı standart taktik yoldaş dronu.' },
    origami_crane: { id: 'origami_crane', name: 'Origami Turna', rarity: 'rare', emoji: '🕊️', desc: 'Minimalist katlanmış kağıt turna kuşu yoldaş görünümü.' },
    cyber_prism: { id: 'cyber_prism', name: 'Kuantum Prizma', rarity: 'super_rare', emoji: '💠', desc: 'Yumuşak neon hatlı, sakin dönen geometrik enerji kristali.' },
    ghost_wisp: { id: 'ghost_wisp', name: 'Hayalet Ruh Küresi', rarity: 'super_rare', emoji: '👻', desc: 'Dingin mavi-mor ruh halkasıyla süzülen mistik küre.' },
    shadow_kunai: { id: 'shadow_kunai', name: 'Gölge Shuriken', rarity: 'epic', emoji: '🥷', desc: 'Yörüngede sessizce süzülen mat çelik ninja yıldızı.' },
    crimson_sand: { id: 'crimson_sand', name: 'Kızıl Kum Sarkacı', rarity: 'epic', emoji: '⏳', desc: 'Zamanı büken mini kızıl kum saati uyduları.' },
    drama_mask: { id: 'drama_mask', name: 'Tiyatro Maskeleri', rarity: 'epic', emoji: '🎭', desc: 'Trajedi ve Komedi sanatını yansıtan zarif ikili maske.' },
    valkyrie_halo: { id: 'valkyrie_halo', name: 'Valkür Kanatları', rarity: 'mythic', emoji: '🪽', desc: 'Altın halesi ve zarif tüylü kanatlarıyla koruyucu melek uydusu.' },
    eclipse_crescent: { id: 'eclipse_crescent', name: 'Tutulma Hilali', rarity: 'mythic', emoji: '🌙', desc: 'Karanlık güneş tutulması ve altın hilal yörünge uydusu.' },
    kurt_spirit: { id: 'kurt_spirit', name: 'Bozkurt Ruhu (Alfa)', rarity: 'legendary', emoji: '🐺', desc: 'Gök mavisi ve altın hilal izi bırakan efsanevi Bozkurt totemi.' }
};

const RARITY_ORDER = { legendary: 5, mythic: 4, epic: 3, super_rare: 2, rare: 1 };
let raritySortDescending = true;

const ITEM_DATABASE = {
    legendary_persona_masks: { id: 'legendary_persona_masks', name: 'Trajedi & Komedi Maskesi', rarity: 'legendary', type: 'damage_mult', val: 1.00, desc: 'İki yüzlü sahne tılsımı: Tüm kule hasarını +%100 (x2.0) katlar!', icon: 'fa-solid fa-masks-theater', customArt: 'masks' },
    mythic_sisyphus_boulder: { id: 'mythic_sisyphus_boulder', name: 'Sisifos\'un Ebedi Kayası', rarity: 'mythic', type: 'hp', val: 0.75, desc: 'Durmaksızın zirveye taşınan kaya: Maksimum canı +%75 artırır.', icon: 'fa-solid fa-mountain', customArt: 'sisyphus' },
    mythic_fate_typewriter: { id: 'mythic_fate_typewriter', name: 'Kader Daktilosu', rarity: 'mythic', type: 'critMult', val: 0.70, desc: 'Geleceği yazan yeşil daktilo: Kritik hasar çarpanını +0.70x artırır.', icon: 'fa-solid fa-keyboard', customArt: 'typewriter' },
    epic_crimson_hourglass: { id: 'epic_crimson_hourglass', name: 'Kanlı Kum Saati', rarity: 'epic', type: 'speed', val: 0.25, desc: 'Kızıl kumları çatlaklardan sızan saat: Atış hızını +0.25/sn artırır.', icon: 'fa-solid fa-hourglass-end', customArt: 'crimson_hourglass' },
    epic_crimson_archer: { id: 'epic_crimson_archer', name: 'Kızıl Yaylı Gölge Okçu', rarity: 'epic', type: 'damage', val: 0.38, desc: 'Uzun kızıl yaylı avcı ruhu: Tüm kule hasarını +%38 artırır.', icon: 'fa-solid fa-bow-arrow', customArt: 'archer' },
    epic_void_rope: { id: 'epic_void_rope', name: 'Hiçlik Çukuru İpi', rarity: 'epic', type: 'lifesteal', val: 0.018, desc: 'Karanlık delikten çıkış halatı: Can çalma oranını +%1.8 artırır.', icon: 'fa-solid fa-circle-dot', customArt: 'void_rope' },
    epic_future_letter: { id: 'epic_future_letter', name: 'Yırtık Gelecek Mektubu', rarity: 'epic', type: 'gold', val: 0.30, desc: 'Üzerinde "Gelecek" yazan kadim parşömen: Altın kazancını +%30 artırır.', icon: 'fa-solid fa-scroll', customArt: 'future_letter' },
    srare_tracker_steps: { id: 'srare_tracker_steps', name: 'İz Sürücü Adımları', rarity: 'super_rare', type: 'range', val: 25, desc: 'Gizemli ayak izleri: Kule radar menzilini +25 piksel artırır.', icon: 'fa-solid fa-shoe-prints', customArt: 'footsteps' },
    rare_bow_shard: { id: 'rare_bow_shard', name: 'Kırık Yay Parçası', rarity: 'rare', type: 'damage', val: 0.07, desc: 'Tüm kule hasarını +%7 artırır.', icon: 'fa-solid fa-feather' },
    rare_copper_coin: { id: 'rare_copper_coin', name: 'Bakır Ganimet', rarity: 'rare', type: 'gold', val: 0.08, desc: 'Altın kazancını +%8 artırır.', icon: 'fa-solid fa-coins' },
    rare_iron_nail: { id: 'rare_iron_nail', name: 'Demir Çivi', rarity: 'rare', type: 'armor', val: 0.08, desc: 'Zırh değerini +%8 artırır.', icon: 'fa-solid fa-hammer' },
    rare_soft_feather: { id: 'rare_soft_feather', name: 'Hafif Tüy', rarity: 'rare', type: 'speed', val: 0.05, desc: 'Atış hızını +0.05/sn artırır.', icon: 'fa-solid fa-wind' },
    rare_small_gem: { id: 'rare_small_gem', name: 'Minik Safir', rarity: 'rare', type: 'crit', val: 2.5, desc: 'Kritik şansını +%2.5 artırır.', icon: 'fa-solid fa-gem' },
    rare_sturdy_wood: { id: 'rare_sturdy_wood', name: 'Sağlam Meşe', rarity: 'rare', type: 'hp', val: 0.08, desc: 'Maksimum canı +%8 artırır.', icon: 'fa-solid fa-tree' },
    rare_rusty_gear: { id: 'rare_rusty_gear', name: 'Paslı Dişli', rarity: 'rare', type: 'regen', val: 0.08, desc: 'Can yenilemesini +%8 artırır.', icon: 'fa-solid fa-gear' },
    rare_sharp_arrow: { id: 'rare_sharp_arrow', name: 'Ucu Sivri Ok', rarity: 'rare', type: 'critMult', val: 0.12, desc: 'Kritik çarpanını +0.12x artırır.', icon: 'fa-solid fa-crosshairs' },
    rare_glass_shard: { id: 'rare_glass_shard', name: 'Kristal Parçası', rarity: 'rare', type: 'crystal', val: 0.01, desc: 'Kristal düşme şansını +%1.0 artırır.', icon: 'fa-solid fa-diamond' },
    rare_leather_grip: { id: 'rare_leather_grip', name: 'Deri Kabza', rarity: 'rare', type: 'range', val: 10, desc: 'Menzili +10 piksel artırır.', icon: 'fa-solid fa-hand-fist' },
    rare_wolf_fang: { id: 'rare_wolf_fang', name: 'Bozkurt Dişi', rarity: 'rare', type: 'crit', val: 3, desc: 'Kritik şansını +%3 artırır.', icon: 'fa-solid fa-tooth' },
    rare_radar_lens: { id: 'rare_radar_lens', name: 'Optik Radar Merceği', rarity: 'rare', type: 'range', val: 14, desc: 'Menzili +14 piksel artırır.', icon: 'fa-solid fa-magnifying-glass' },
    srare_silver_quiver: { id: 'srare_silver_quiver', name: 'Gümüş Sadak', rarity: 'super_rare', type: 'damage', val: 0.16, desc: 'Tüm kule hasarını +%16 artırır.', icon: 'fa-solid fa-bullseye' },
    srare_gold_ring: { id: 'srare_gold_ring', name: 'Tüccar Yüzüğü', rarity: 'super_rare', type: 'gold', val: 0.18, desc: 'Altın kazancını +%18 artırır.', icon: 'fa-solid fa-ring' },
    srare_titanium_plate: { id: 'srare_titanium_plate', name: 'Titanyum Levha', rarity: 'super_rare', type: 'armor', val: 0.16, desc: 'Zırh değerini +%16 artırır.', icon: 'fa-solid fa-shield-halved' },
    srare_wind_charm: { id: 'srare_wind_charm', name: 'Rüzgar Tılsımı', rarity: 'super_rare', type: 'speed', val: 0.12, desc: 'Atış hızını +0.12/sn artırır.', icon: 'fa-solid fa-tornado' },
    srare_ruby_eye: { id: 'srare_ruby_eye', name: 'Yakut Göz', rarity: 'super_rare', type: 'crit', val: 5, desc: 'Kritik şansını +%5 artırır.', icon: 'fa-solid fa-eye' },
    srare_energy_cell: { id: 'srare_energy_cell', name: 'Enerji Hücresi', rarity: 'super_rare', type: 'shield', val: 0.18, desc: 'Plazma kalkanını +%18 artırır.', icon: 'fa-solid fa-battery-full' },
    srare_frost_core: { id: 'srare_frost_core', name: 'Sıfır Noktası Modülü', rarity: 'super_rare', type: 'regen', val: 0.18, desc: 'Can yenilemesini +%18 artırır.', icon: 'fa-solid fa-snowflake' },
    srare_sniper_scope: { id: 'srare_sniper_scope', name: 'Termal Lazer Dürbünü', rarity: 'super_rare', type: 'critMult', val: 0.28, desc: 'Kritik çarpanını +0.28x artırır.', icon: 'fa-solid fa-crosshairs' },
    epic_shadow_bow: { id: 'epic_shadow_bow', name: 'Gölge Avcısı Yayı', rarity: 'epic', type: 'damage', val: 0.32, desc: 'Tüm kule hasarını +%32 artırır.', icon: 'fa-solid fa-bow-arrow', customArt: 'archer' },
    epic_dragon_scale: { id: 'epic_dragon_scale', name: 'Ejderha Pul Zırhı', rarity: 'epic', type: 'hp', val: 0.35, desc: 'Maksimum canı +%35 artırır.', icon: 'fa-solid fa-shield' },
    epic_chronos_sand: { id: 'epic_chronos_sand', name: 'Zaman Kumları', rarity: 'epic', type: 'speed', val: 0.22, desc: 'Atış hızını +0.22/sn artırır.', icon: 'fa-solid fa-hourglass-half', customArt: 'crimson_hourglass' },
    epic_vampire_fang: { id: 'epic_vampire_fang', name: 'Vampir Dişi', rarity: 'epic', type: 'lifesteal', val: 0.012, desc: 'Can çalma oranını +%1.2 artırır.', icon: 'fa-solid fa-droplet' },
    epic_plasma_core: { id: 'epic_plasma_core', name: 'Kararsız Plazma Çekirdeği', rarity: 'epic', type: 'critMult', val: 0.50, desc: 'Kritik çarpanını +0.50x artırır.', icon: 'fa-solid fa-atom' },
    epic_cyber_katana: { id: 'epic_cyber_katana', name: 'Muramasa Plazma Kılıcı', rarity: 'epic', type: 'damage', val: 0.36, desc: 'Tüm kule hasarını +%36 artırır.', icon: 'fa-solid fa-khanda' },
    epic_aegis_barrier: { id: 'epic_aegis_barrier', name: 'Aegis Yansıtıcı Kalkan', rarity: 'epic', type: 'shield', val: 0.35, desc: 'Plazma kalkanını +%35 artırır.', icon: 'fa-solid fa-user-shield' },
    epic_crystal_magnet: { id: 'epic_crystal_magnet', name: 'Kuantum Mıknatısı', rarity: 'epic', type: 'crystal', val: 0.02, desc: 'Kristal düşme şansını +%2.0 artırır.', icon: 'fa-solid fa-magnet' },
    mythic_valkyrie_wing: { id: 'mythic_valkyrie_wing', name: 'Valkür Kanadı', rarity: 'mythic', type: 'damage', val: 0.65, desc: 'Tüm kule hasarını +%65 artırır.', icon: 'fa-solid fa-feather-pointed' },
    mythic_eternal_heart: { id: 'mythic_eternal_heart', name: 'Ebedi Yaşam Kalbi', rarity: 'mythic', type: 'hp', val: 0.65, desc: 'Maksimum kule canını +%65 artırır.', icon: 'fa-solid fa-heart-pulse' },
    mythic_god_crown: { id: 'mythic_god_crown', name: 'Tanrısal Hükümdar Tacı', rarity: 'mythic', type: 'gold', val: 0.55, desc: 'Altın kazancını +%55 artırır.', icon: 'fa-solid fa-crown' },
    mythic_blood_chalice: { id: 'mythic_blood_chalice', name: 'Ölümsüzlük Kadehi', rarity: 'mythic', type: 'lifesteal', val: 0.025, desc: 'Can çalma oranını +%2.5 artırır.', icon: 'fa-solid fa-wine-glass' },
    mythic_hyper_turbine: { id: 'mythic_hyper_turbine', name: 'Hiper-Türbin Motoru', rarity: 'mythic', type: 'speed', val: 0.38, desc: 'Atış hızını +0.38/sn artırır.', icon: 'fa-solid fa-fan' },
    legendary_cosmos_shard: { id: 'legendary_cosmos_shard', name: 'Kozmik Tekillik Çekirdeği', rarity: 'legendary', type: 'damage_mult', val: 0.90, desc: 'Tüm kule hasarını +%90 (x1.9) çarpanla katlar!', icon: 'fa-solid fa-sun' },
    legendary_infinity_bow: { id: 'legendary_infinity_bow', name: 'Sonsuzluk Efsanevi Yayı', rarity: 'legendary', type: 'multishot_buff', val: 1, desc: 'Ekstra +1 Çoklu Atış hedefi sağlar!', icon: 'fa-solid fa-infinity' },
    legendary_kurt_totem: { id: 'legendary_kurt_totem', name: 'Kurt Kaan\'ın Ebedi Totemi', rarity: 'legendary', type: 'damage_mult', val: 1.15, desc: 'Tüm kule hasarını +%115 (x2.15) çarpanla katlar!', icon: 'fa-solid fa-paw' }
};

const UPGRADE_DEFS = {
    damage: { category: 'attack', name: 'Plazma Hasarı', icon: 'fa-solid fa-explosion', color: 'text-red-400', desc: 'Taban hasarı artırır. Her 10 ve 25 Sv. ekstra çarpan verir.', baseCost: 15, costScale: 1.165, maxLevel: 9999, getValueText: (lvl) => `${formatNumber(getTowerDamage())} Hasar` },
    attackSpeed: { category: 'attack', name: 'Atış Hızı', icon: 'fa-solid fa-gauge-high', color: 'text-amber-400', desc: 'Her Sv. +0.055/sn atış hızı (Maks 50 Sv: 3.60/sn).', baseCost: 35, costScale: 1.19, maxLevel: 50, getValueText: (lvl) => `${getTowerFireRate().toFixed(2)}/sn` },
    range: { category: 'attack', name: 'Radar Menzili', icon: 'fa-solid fa-bullseye', color: 'text-blue-400', desc: 'Her Sv. +4 px nişancı menzili (Maks 40 Sv: 286 px).', baseCost: 30, costScale: 1.17, maxLevel: 40, getValueText: (lvl) => `${Math.round(getTowerRange())} px` },
    critChance: { category: 'attack', name: 'Kritik Şansı', icon: 'fa-solid fa-bolt', color: 'text-purple-400', desc: 'Her seviye +%1.5 kritik şansı (Maks 48 Sv: %75).', baseCost: 45, costScale: 1.20, maxLevel: 48, getValueText: (lvl) => `%${Number(getTowerCritChance().toFixed(1))}` },
    critMult: { category: 'attack', name: 'Kritik Çarpanı', icon: 'fa-solid fa-skull-crossbones', color: 'text-pink-400', desc: 'Her Sv. +0.08x ve 15 Sv.de +0.15x kritik hasar (Maks 100 Sv).', baseCost: 55, costScale: 1.18, maxLevel: 100, getValueText: (lvl) => `x${getTowerCritMult().toFixed(2)}` },
    multishot: { category: 'attack', name: 'Çoklu Atış', icon: 'fa-solid fa-arrows-split-up-and-left', color: 'text-cyan-400', desc: 'Aynı anda vurulan hedef sayısı (Maks 5 Sv: +5 Hedef).', baseCost: 850, costScale: 4.2, maxLevel: 5, getValueText: (lvl) => `${getEffectiveMultishot()} Hedef` },
    bounce: { category: 'attack', name: 'Sekme (Zincir)', icon: 'fa-solid fa-share-nodes', color: 'text-indigo-400', desc: 'Merminin yakındaki düşmana sekmesi (%60 hasar, Maks 5 Sv).', baseCost: 600, costScale: 3.8, maxLevel: 5, getValueText: (lvl) => `${lvl} Sekme` },
    knockback: { category: 'attack', name: 'Şok Dalgası', icon: 'fa-solid fa-wind', color: 'text-teal-400', desc: 'Vurulan düşmanları geri iter (Maks 3 Sv).', baseCost: 1500, costScale: 4.5, maxLevel: 3, getValueText: (lvl) => lvl === 0 ? 'Kapalı' : `Sv.${lvl} (${getTowerKnockback()}px)` },

    maxHp: { category: 'defense', name: 'Titanyum Gövde', icon: 'fa-solid fa-heart', color: 'text-emerald-400', desc: 'Maksimum canı artırır. Her 10 ve 25 Sv. ekstra çarpan.', baseCost: 15, costScale: 1.155, maxLevel: 9999, getValueText: (lvl) => `${formatNumber(getTowerMaxHp())} HP` },
    hpRegen: { category: 'defense', name: 'Nano Onarım', icon: 'fa-solid fa-notes-medical', color: 'text-green-400', desc: 'Saniyede otomatik can yenileme (10 ve 25 Sv. çarpanlı).', baseCost: 25, costScale: 1.17, maxLevel: 9999, getValueText: (lvl) => `${formatNumber(getTowerRegen())}/sn` },
    armor: { category: 'defense', name: 'Reaktif Zırh', icon: 'fa-solid fa-shield', color: 'text-slate-300', desc: 'Düşman hasarını doğrudan emer (Maks %75 soğurma).', baseCost: 30, costScale: 1.175, maxLevel: 9999, getValueText: (lvl) => `-${formatNumber(getTowerArmor())} Hasar` },
    shield: { category: 'defense', name: 'Plazma Kalkanı', icon: 'fa-solid fa-shield-virus', color: 'text-sky-400', desc: 'Saniyede %5 otomatik yenilenen enerji kalkanı.', baseCost: 65, costScale: 1.18, maxLevel: 9999, getValueText: (lvl) => `${formatNumber(getTowerMaxShield())} Kalkan` },
    lifesteal: { category: 'defense', name: 'Can Çalma', icon: 'fa-solid fa-droplet', color: 'text-rose-500', desc: 'Her Sv. +%0.35 can çalma (Maks 20 Sv: %7.0).', baseCost: 250, costScale: 1.28, maxLevel: 20, getValueText: (lvl) => `%${(getTowerLifesteal()*100).toFixed(2)}` },
    thorns: { category: 'defense', name: 'Dikenli Zırh', icon: 'fa-solid fa-burst', color: 'text-rose-400', desc: 'Saldırana hasarı geri yansıtır (Her Sv. +%3, Maks %75).', baseCost: 50, costScale: 1.18, maxLevel: 25, getValueText: (lvl) => `%${getTowerThorns()}` },

    goldBonus: { category: 'economy', name: 'Ganimet Çarpanı', icon: 'fa-solid fa-sack-dollar', color: 'text-amber-400', desc: 'Her Sv. +%6 altın kazancı (Her 10 Sv. ekstra çarpan).', baseCost: 35, costScale: 1.19, maxLevel: 9999, getValueText: (lvl) => `x${getGoldMultiplier().toFixed(2)} Altın` },
    waveGold: { category: 'economy', name: 'Dalga İkramiyesi', icon: 'fa-solid fa-award', color: 'text-yellow-400', desc: 'Dalga geçildiğinde ekstra altın ödülü verir.', baseCost: 50, costScale: 1.20, maxLevel: 9999, getValueText: (lvl) => `+${formatNumber(getWaveBonusPreview(lvl))}` },
    crystalChance: { category: 'economy', name: 'Kristal Sondajı', icon: 'fa-solid fa-gem', color: 'text-cyan-400', desc: 'Her Sv. +%0.45 şans ve +%8 kristal çarpanı (Maks 30 Sv).', baseCost: 120, costScale: 1.24, maxLevel: 30, getValueText: (lvl) => `%${getCrystalDropChance(lvl).toFixed(1)} (x${getCrystalDropMult(lvl).toFixed(1)})` },
    interest: { category: 'economy', name: 'Kuantum Bankası', icon: 'fa-solid fa-piggy-bank', color: 'text-emerald-400', desc: 'Dalga sonu kasa faizi: Her Sv. +%0.4 (Maks 15 Sv: %6.0).', baseCost: 300, costScale: 1.35, maxLevel: 15, getValueText: (lvl) => `%${(lvl * 0.4).toFixed(1)} Faiz` }
};

const COMPANION_DEFS = {
    laserDrone: {
        name: 'Lazer Dronu', icon: 'fa-solid fa-crosshairs', badgeClass: 'text-red-400 bg-red-500/10 border-red-500/30',
        desc: 'Seri plazma lazeri ateşler (5★ olduğunda kritik vurabilir).',
        starCosts: [150, 600, 1500, 3200, 6500],
        damageMults: [0.30, 0.55, 0.90, 1.40, 2.20],
        cooldowns: [0.65, 0.55, 0.46, 0.38, 0.30],
        orbitRadius: 65, orbitSpeed: 1.6,
        getStarSummary: (star) => star === 0 ? '1★: %30 Kule Hasarı (0.65sn)' : `%${Math.round([0.30, 0.55, 0.90, 1.40, 2.20][star-1]*100)} Hasar | ${[0.65, 0.55, 0.46, 0.38, 0.30][star-1]}sn`
    },
    frostOrb: {
        name: 'Buzul Küresi', icon: 'fa-solid fa-snowflake', badgeClass: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
        desc: 'Alan yavaşlatma ve dondurucu şok dalgası yayar.',
        starCosts: [150, 600, 1500, 3200, 6500],
        slowPcts: [20, 28, 36, 45, 55],
        damageMults: [0.20, 0.38, 0.65, 1.00, 1.50],
        orbitRadius: 85, orbitSpeed: -1.1,
        getStarSummary: (star) => star === 0 ? '1★: %20 Yavaşlatma + %20 Alan Hasarı' : `%${[20, 28, 36, 45, 55][star-1]} Yavaşlatma | %${Math.round([0.20, 0.38, 0.65, 1.00, 1.50][star-1]*100)} Alan Hasarı`
    },
    missileBot: {
        name: 'Füze Bataryası', icon: 'fa-solid fa-rocket', badgeClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
        desc: 'Yüksek patlayıcılı alan (AoE) füzesi fırlatır.',
        starCosts: [150, 600, 1500, 3200, 6500],
        damageMults: [0.65, 1.10, 1.75, 2.60, 3.80],
        splashRadii: [48, 58, 70, 84, 100],
        cooldowns: [2.2, 1.95, 1.75, 1.55, 1.30],
        orbitRadius: 105, orbitSpeed: 0.85,
        getStarSummary: (star) => star === 0 ? '1★: %65 AoE Hasar (48px Çap)' : `%${Math.round([0.65, 1.10, 1.75, 2.60, 3.80][star-1]*100)} AoE Hasar | ${[48, 58, 70, 84, 100][star-1]}px Patlama`
    },
    repairDrone: {
        name: 'Onarım Mekaniği', icon: 'fa-solid fa-screwdriver-wrench', badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        desc: 'Kule Canını ve Plazma Kalkanını yüzdelik olarak onarır.',
        starCosts: [150, 600, 1500, 3200, 6500],
        healPcts: [2.0, 3.5, 5.5, 8.0, 12.0],
        orbitRadius: 48, orbitSpeed: -2.0,
        getStarSummary: (star) => star === 0 ? '1★: Her 2sn +%2 Can & Kalkan' : `Her 2sn +%${[2.0, 3.5, 5.5, 8.0, 12.0][star-1]} Can & Kalkan`
    },
    plasmaSatellite: {
        name: 'Plazma Uydusu', icon: 'fa-solid fa-satellite-dish', badgeClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        desc: 'Çoklu hedefe zincirleme yıldırım ve düşman MaksHP yüzdesi hasarı verir.',
        starCosts: [150, 600, 1500, 3200, 6500],
        damageMults: [0.50, 0.85, 1.35, 2.00, 3.00],
        chainCounts: [1, 2, 3, 4, 5],
        maxHpPcts: [0.3, 0.6, 1.0, 1.5, 2.2],
        orbitRadius: 125, orbitSpeed: 0.6,
        getStarSummary: (star) => star === 0 ? '1★: 1 Hedef | %50 Hasar + %0.3 MaksHP' : `${[1, 2, 3, 4, 5][star-1]} Hedef | %${Math.round([0.50, 0.85, 1.35, 2.00, 3.00][star-1]*100)} + %${[0.3, 0.6, 1.0, 1.5, 2.2][star-1]} MaksHP`
    }
};

const PRESTIGE_DEFS = {
    permDamage: { name: 'Antik Çekirdek', icon: 'fa-solid fa-fire', desc: 'Tüm kule ve yoldaş hasarını kalıcı olarak katlar (+%20/Sv).', baseCost: 1, costScale: 1.55, maxLevel: 999, getEffectText: (lvl) => `+%${lvl * 20}` },
    permGold: { name: 'Altın Simyası', icon: 'fa-solid fa-coins', desc: 'Tüm altın kazancını kalıcı olarak artırır (+%20/Sv).', baseCost: 1, costScale: 1.55, maxLevel: 999, getEffectText: (lvl) => `+%${lvl * 20}` },
    companionBoost: { name: 'Senkronize Yörünge', icon: 'fa-solid fa-satellite', desc: 'Yıldızlı yoldaşların tüm hasarını katlar (+%25/Sv).', baseCost: 2, costScale: 1.60, maxLevel: 999, getEffectText: (lvl) => `+%${lvl * 25}` },
    costDiscount: { name: 'Mühendislik Verimi', icon: 'fa-solid fa-tags', desc: 'Yükseltme altın maliyetini kalıcı düşürür (-%2/Sv, Maks -%50).', baseCost: 2, costScale: 1.75, maxLevel: 25, getEffectText: (lvl) => `-%${lvl * 2}` },
    startWave: { name: 'Zaman Sıçraması', icon: 'fa-solid fa-forward', desc: 'Prestij sonrası ileri dalgadan ve başlangıç altınıyla başlatır.', baseCost: 4, costScale: 2.0, maxLevel: 40, getEffectText: (lvl) => `Başlangıç: Dalga ${getStartWaveLevel(lvl)}` }
};

function getDefaultState() {
    return {
        gold: 25, crystals: 15, souls: 0, wave: 1, highestWave: 1, waveKills: 0, waveTargetKills: 15,
        holdWave: false, holdWaveTimer: 0, consecutiveDefeats: 0, consecutiveHoldWins: 0,
        deviceMode: 'pc',
        stats: { totalKills: 0, bossKills: 0, prestiges: 0, playTimeSeconds: 0 },
        settings: { showRange: true, showDamageText: true, activeTheme: 'cyber' },
        upgrades: {
            damage: 1, attackSpeed: 1, range: 1, critChance: 0, critMult: 1, multishot: 0, bounce: 0, knockback: 0,
            maxHp: 1, hpRegen: 1, armor: 0, thorns: 0, shield: 0, lifesteal: 0,
            goldBonus: 0, waveGold: 0, crystalChance: 0, interest: 0
        },
        companions: {
            laserDrone: { unlocked: false, level: 0 }, frostOrb: { unlocked: false, level: 0 },
            missileBot: { unlocked: false, level: 0 }, repairDrone: { unlocked: false, level: 0 }, plasmaSatellite: { unlocked: false, level: 0 }
        },
        inventory: [], equippedItems: [], ownedSkins: ['default_cyber'], activeSkin: 'default_cyber',
        ownedCompanionSkins: ['default_tech'], activeCompanionSkin: 'default_tech',
        lootboxBonuses: { extraDamagePct: 0, extraGoldPct: 0, totalOpened: 0 },
        prestigeUpgrades: { permDamage: 0, permGold: 0, companionBoost: 0, costDiscount: 0, startWave: 0 },
        lastSaveTime: Date.now()
    };
}

let game = getDefaultState();
let buyMultiplier = 1;
let currentTab = 'attack';
let gameSpeed = 1;
let isPaused = false;
let isDefeated = false;
let defeatTimer = 0;
let isDrawerOpen = false;

function getEnemyColors(type) {
    if (type === 'boss') return { color: '#a78bfa', secColor: '#ede9fe' };
    if (type === 'tank') return { color: '#64748b', secColor: '#e2e8f0' };
    if (type === 'frost') return { color: '#06b6d4', secColor: '#cffafe' };
    if (type === 'runner') return { color: '#f43f5e', secColor: '#fda4af' };
    if (type === 'teleporter') return { color: '#fbbf24', secColor: '#fef3c7' };
    if (type === 'ranged') return { color: '#60a5fa', secColor: '#dbeafe' };
    return { color: '#4ade80', secColor: '#dcfce7' };
}

function getStartWaveLevel(lvl = (game.prestigeUpgrades?.startWave || 0)) { return 1 + lvl * 3; }
function getMinPrestigeWave() { return Math.max(10, getStartWaveLevel() + 10); }
function getDiscountMultiplier() { return Math.max(0.5, 1 - (game.prestigeUpgrades.costDiscount * 0.02)); }
function getSingleUpgradeCost(key, level) {
    const def = UPGRADE_DEFS[key];
    return Math.max(1, Math.floor(def.baseCost * Math.pow(def.costScale, level) * (1 + level * 0.08) * getDiscountMultiplier()));
}

const MULTISHOT_WAVE_REQS = [12, 28, 50, 75, 105];
function getMultishotRequiredWave(nextLevelIndex) { return MULTISHOT_WAVE_REQS[nextLevelIndex] || 999; }

function getItemStatBonus(type) {
    let total = 0;
    // A malformed or cheat-edited save must never stack the same item multiple times.
    const equipped = new Set(Array.isArray(game.equippedItems) ? game.equippedItems : []);
    for (const itemId of equipped) {
        const item = ITEM_DATABASE[itemId];
        if (item && item.type === type) total += item.val;
    }
    return total;
}

function getEffectiveMultishot() {
    let base = 1 + game.upgrades.multishot;
    const equipped = new Set(Array.isArray(game.equippedItems) ? game.equippedItems : []);
    for (const itemId of equipped) {
        const item = ITEM_DATABASE[itemId];
        if (item && item.type === 'multishot_buff') base += item.val;
    }
    return base;
}

function getBulkUpgradeInfo(key) {
    const def = UPGRADE_DEFS[key];
    const currentLvl = game.upgrades[key];
    const maxLvl = def.maxLevel;
    if (currentLvl >= maxLvl) return { count: 0, totalCost: 0, maxed: true, lockedReason: null };

    if (key === 'multishot') {
        const reqWave = getMultishotRequiredWave(currentLvl);
        if (Math.max(game.wave, game.highestWave) < reqWave) {
            return { count: 1, totalCost: getSingleUpgradeCost(key, currentLvl), canAfford: false, maxed: false, lockedReason: `Dalga ${reqWave}` };
        }
    }

    let targetCount = buyMultiplier === 'MAX' ? 9999 : buyMultiplier;
    targetCount = Math.min(targetCount, maxLvl - currentLvl);
    let count = 0, totalCost = 0, tempGold = game.gold;
    
    for (let i = 0; i < targetCount; i++) {
        if (key === 'multishot' && Math.max(game.wave, game.highestWave) < getMultishotRequiredWave(currentLvl + i)) break;
        const stepCost = getSingleUpgradeCost(key, currentLvl + i);
        if (buyMultiplier === 'MAX') {
            if (tempGold >= stepCost) { tempGold -= stepCost; totalCost += stepCost; count++; } else break;
        } else { totalCost += stepCost; count++; }
    }
    if (count === 0) return { count: 1, totalCost: getSingleUpgradeCost(key, currentLvl), canAfford: false, maxed: false, lockedReason: null };
    return { count, totalCost, canAfford: game.gold >= totalCost && count > 0, maxed: false, lockedReason: null };
}

function getLevelMilestoneMult(lvl) {
    return Math.pow(1.10, Math.floor(lvl / 10)) * Math.pow(1.18, Math.floor(lvl / 25));
}

function getPermDamageMult() { 
    const itemMultBonus = (1 + getItemStatBonus('damage')) * (1 + getItemStatBonus('damage_mult'));
    return (1 + game.prestigeUpgrades.permDamage * 0.20) * (1 + game.souls * 0.03) * (1 + (game.lootboxBonuses.extraDamagePct || 0) / 100) * itemMultBonus; 
}

function getTowerDamage() {
    const lvl = Math.max(1, game.upgrades.damage);
    const base = (8 + (lvl - 1) * 2.2) * Math.pow(1.045, lvl - 1);
    const milestone = getLevelMilestoneMult(lvl);
    return Math.round(base * milestone * getPermDamageMult());
}

function getTowerFireRate() {
    const lvl = Math.min(50, Math.max(1, game.upgrades.attackSpeed));
    return 0.90 + (lvl - 1) * 0.055 + getItemStatBonus('speed');
}

function getTowerRange() {
    const lvl = Math.min(40, Math.max(1, game.upgrades.range));
    return 130 + (lvl - 1) * 4.0 + getItemStatBonus('range');
}

function getTowerCritChance() {
    // 48 Seviye * %1.5 = %72 + %3 Taban = Tam %75! (Eşya takılırsa eşya bonusu ile %90'a kadar çıkabilir)
    const lvl = Math.min(48, Math.max(0, game.upgrades.critChance || 0));
    const baseAndUpgrade = Math.min(75, 3 + lvl * 1.5);
    return Math.min(90, +(baseAndUpgrade + getItemStatBonus('crit')).toFixed(1));
}

function getTowerCritMult() {
    const lvl = Math.max(1, game.upgrades.critMult || 1);
    return 1.50 + (lvl - 1) * 0.08 + Math.floor(lvl / 15) * 0.15 + getItemStatBonus('critMult');
}

function getTowerKnockback() { const lvl = Math.min(3, game.upgrades.knockback || 0); return lvl <= 0 ? 0 : 6 + lvl * 3.0; }

function getTowerMaxHp() {
    const lvl = Math.max(1, game.upgrades.maxHp);
    const base = (100 + (lvl - 1) * 20) * Math.pow(1.042, lvl - 1);
    const milestone = getLevelMilestoneMult(lvl);
    return Math.round(base * milestone * (1 + getItemStatBonus('hp')));
}

function getTowerRegen() {
    const lvl = game.upgrades.hpRegen || 0;
    const itemRegenPct = getItemStatBonus('regen');
    if (lvl === 0 && itemRegenPct === 0) return 0;
    const base = (0.8 + lvl * 0.7) * Math.pow(1.038, Math.max(0, lvl - 1)) * getLevelMilestoneMult(lvl);
    return Math.round(base * (1 + itemRegenPct) * 10) / 10;
}

function getTowerArmor() {
    const lvl = game.upgrades.armor || 0;
    const itemArmorPct = getItemStatBonus('armor');
    if (lvl === 0 && itemArmorPct === 0) return 0;
    const base = (1.0 + lvl * 1.2) * Math.pow(1.038, Math.max(0, lvl - 1)) * Math.pow(1.08, Math.floor(lvl / 10));
    return Math.round(base * (1 + itemArmorPct));
}

function getTowerThorns() { return Math.min(25, game.upgrades.thorns || 0) * 3; }

function getTowerMaxShield() {
    const lvl = game.upgrades.shield || 0;
    const itemShieldPct = getItemStatBonus('shield');
    if (lvl === 0 && itemShieldPct === 0) return 0;
    const base = (35 + lvl * 14) * Math.pow(1.04, Math.max(0, lvl - 1)) * getLevelMilestoneMult(lvl);
    return Math.round(base * (1 + itemShieldPct));
}

function getTowerLifesteal() { return Math.min(20, game.upgrades.lifesteal || 0) * 0.0035 + getItemStatBonus('lifesteal'); }

function getWaveBaseGold(w = game.wave) {
    return (4 + w * 1.2) * Math.pow(1.055, w - 1) * Math.pow(1.08, Math.floor(w / 10));
}

function getGoldMultiplier() {
    const lvl = game.upgrades.goldBonus || 0;
    const upgMult = (1 + lvl * 0.06) * Math.pow(1.06, Math.floor(lvl / 10));
    return upgMult * (1 + getItemStatBonus('gold')) * (1 + game.prestigeUpgrades.permGold * 0.20) * (1 + (game.lootboxBonuses.extraGoldPct || 0) / 100) * (game.holdWave ? 0.35 : 1.0);
}

function getWaveBonusPreview(lvl) {
    if (lvl === 0 || game.holdWave) return 0;
    return Math.round(getWaveBaseGold(game.wave) * (0.8 + lvl * 0.45) * getGoldMultiplier());
}

function getCrystalDropChance(lvl = (game.upgrades.crystalChance || 0)) {
    return Math.min(25, 2.0 + lvl * 0.45 + getItemStatBonus('crystal') * 100);
}

function getCrystalDropMult(lvl = (game.upgrades.crystalChance || 0)) {
    return (1 + Math.floor(game.wave / 20) * 0.35) * (1 + lvl * 0.08);
}

function getCompanionBoost() { return (1 + game.prestigeUpgrades.companionBoost * 0.25) * (1 + Math.floor(game.wave / 25) * 0.10); }

function calculatePendingSouls() {
    if (game.wave < getMinPrestigeWave()) return 0;
    return Math.max(1, Math.floor(Math.pow(game.wave - 8, 1.22) * (1 + Math.floor(game.wave / 30) * 0.25)));
}

// Yedek sürüm: ui_8.js'deki (daha gelişmiş) formatNumber varsa o kullanılır, dosya sırası fark etmez.
window.formatNumber = window.formatNumber || function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (!Number.isFinite(num)) return '∞';
    const abs = Math.abs(num);
    if (abs >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (abs >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
};

// =======================================================
// ÜSTÜNE TIKLAYINCA AÇIKLAMA GÖSTERME (INSPECTOR) SİSTEMİ
// (Yükseltme, Eşya, Skin, Yoldaş ve Prestij kartlarına tıklayınca tam detay açar)
// =======================================================
(function initClickInspector() {
    const RARITY_LABELS = {
        legendary: { name: 'EFSANEVİ', color: '#facc15' },
        mythic: { name: 'MİTİK', color: '#f472b6' },
        epic: { name: 'EPİK', color: '#c084fc' },
        super_rare: { name: 'SÜPER NADİR', color: '#22d3ee' },
        rare: { name: 'NADİR', color: '#60a5fa' }
    };

    function setupInspectorDOM() {
        if (document.getElementById('cyber-inspect-popup')) return;

        // Kesilen (...) açıklama metinlerinin tam görünmesini sağlayan CSS
        const st = document.createElement('style');
        st.textContent = `
            /* Kartlardaki ... ile kesilen açıklamaları 2 satır olarak tam göster */
            .truncate, .line-clamp-1 {
                white-space: normal !important;
                overflow: visible !important;
                text-overflow: unset !important;
                display: block !important;
                line-height: 1.25 !important;
            }
            #cyber-inspect-popup {
                position: fixed;
                top: 62px;
                left: 50%;
                transform: translateX(-50%) translateY(-10px);
                z-index: 10000;
                width: min(92vw, 370px);
                background: rgba(15, 23, 42, 0.97);
                border: 1.5px solid #38bdf8;
                border-radius: 14px;
                padding: 11px 14px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.85);
                backdrop-filter: blur(8px);
                color: #f8fafc;
                font-family: 'Rajdhani', sans-serif;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.18s ease, transform 0.18s ease;
            }
            #cyber-inspect-popup.active {
                opacity: 1;
                pointer-events: auto;
                transform: translateX(-50%) translateY(0);
            }
        `;
        document.head.appendChild(st);

        const popup = document.createElement('div');
        popup.id = 'cyber-inspect-popup';
        popup.addEventListener('click', () => popup.classList.remove('active'));
        document.body.appendChild(popup);
    }

    let hideTimer = null;
    window.showInspectPopup = function(title, subtitle, desc, extraBadge = '', accentColor = '#38bdf8') {
        setupInspectorDOM();
        const popup = document.getElementById('cyber-inspect-popup');
        if (!popup) return;
        popup.style.borderColor = accentColor;
        popup.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:4px;">
                <div style="font-weight:800; font-size:15px; color:${accentColor};">${title}</div>
                ${extraBadge ? `<span style="font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; background:rgba(255,255,255,0.08); color:#fef08a;">${extraBadge}</span>` : ''}
            </div>
            ${subtitle ? `<div style="font-size:12px; color:#94a3b8; font-weight:600; margin-bottom:4px;">${subtitle}</div>` : ''}
            <div style="font-size:13.5px; color:#e2e8f0; line-height:1.35;">${desc}</div>
        `;
        popup.classList.add('active');
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => popup.classList.remove('active'), 4500);
    };

    document.addEventListener('click', (e) => {
        // Satın alma butonuna doğrudan basıldıysa popup açma, sadece kartın/eşyanın gövdesine basılınca aç
        if (e.target.closest && e.target.closest('#cyber-inspect-popup')) return;
        const card = e.target.closest('div, li, article');
        if (!card) return;
        // Büyük kapsayıcılarda pahalı innerText (yeniden düzen hesabı) çalışmasın
        if ((card.textContent || '').length > 900) return;

        const text = (card.innerText || '').trim();
        if (!text || text.length > 260) return;

        // 1. Yükseltme Kartı Kontrolü
        for (const [key, def] of Object.entries(UPGRADE_DEFS)) {
            if (text.includes(def.name) && (text.includes('Sv.') || text.includes(def.desc.slice(0, 12)))) {
                // Eğer doğrudan mavi fiyat butonuna tıklandıysa bile kısa bilgi göster
                const lvl = game.upgrades[key] || 0;
                const maxText = def.maxLevel >= 9999 ? 'Sınırsız' : `Maks Sv.${def.maxLevel}`;
                const valNow = def.getValueText(lvl);
                window.showInspectPopup(
                    def.name,
                    `Mevcut: Sv.${lvl} (${valNow}) • Sınır: ${maxText}`,
                    def.desc,
                    `Maliyet: ${formatNumber(getSingleUpgradeCost(key, lvl))} 🪙`,
                    '#60a5fa'
                );
                return;
            }
        }

        // 2. Envanter Eşyası Kontrolü
        for (const item of Object.values(ITEM_DATABASE)) {
            if (text.includes(item.name) || card.innerHTML.includes(item.id)) {
                const rInfo = RARITY_LABELS[item.rarity] || { name: 'EŞYA', color: '#60a5fa' };
                window.showInspectPopup(item.name, `${rInfo.name} EŞYA`, item.desc, rInfo.name, rInfo.color);
                return;
            }
        }

        // 3. Yoldaş Kontrolü
        for (const [key, comp] of Object.entries(COMPANION_DEFS)) {
            if (text.includes(comp.name)) {
                const star = game.companions[key]?.unlocked ? (game.companions[key].level || 1) : 0;
                window.showInspectPopup(comp.name, comp.getStarSummary(star), comp.desc, `${star}★ / 5★`, '#38bdf8');
                return;
            }
        }

        // 4. Kule ve Yoldaş Skinleri Kontrolü
        for (const skin of [...Object.values(SKIN_DATABASE), ...Object.values(COMPANION_SKIN_DATABASE)]) {
            if (text.includes(skin.name)) {
                const rInfo = RARITY_LABELS[skin.rarity] || { name: 'KOZMETİK', color: '#c084fc' };
                window.showInspectPopup(`${skin.emoji || ''} ${skin.name}`, `${rInfo.name} GÖRÜNÜM`, skin.desc, rInfo.name, rInfo.color);
                return;
            }
        }

        // 5. Prestij Kontrolü
        for (const [key, pDef] of Object.entries(PRESTIGE_DEFS)) {
            if (text.includes(pDef.name)) {
                const lvl = game.prestigeUpgrades[key] || 0;
                window.showInspectPopup(pDef.name, `Seviye: ${lvl} (${pDef.getEffectText(lvl)})`, pDef.desc, `Maks Sv.${pDef.maxLevel}`, '#a855f7');
                return;
            }
        }
    }, true);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupInspectorDOM);
    } else {
        setupInspectorDOM();
    }
})();
