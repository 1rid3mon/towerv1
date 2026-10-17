data.js
const SAVE_KEY = 'CoreTowerDefense_Save_v11';

const THEME_DEFS = {
    cyber: { id: 'cyber', name: 'Siber Çekirdek', towerName: 'Siber Izgara Arka Planı', reqWave: 1, icon: 'fa-solid fa-microchip', color: 'text-blue-400', desc: 'Klasik siber savunma atmosferi.' },
    snow: { id: 'snow', name: 'Buzul Gezegeni (Kar)', towerName: 'Kar Yağışlı Arka Plan', reqWave: 30, icon: 'fa-solid fa-snowflake', color: 'text-sky-300', desc: '30. Dalgada açılır. Kar fırtınası atmosferi.' },
    space: { id: 'space', name: 'Derin Uzay Nebulası', towerName: 'Kozmik Nebula Arka Planı', reqWave: 60, icon: 'fa-solid fa-shuttle-space', color: 'text-purple-400', desc: '60. Dalgada açılır. Derin uzay atmosferi.' }
};

const SKIN_DATABASE = {
    default_cyber: { id: 'default_cyber', name: 'Plazma Kulesi', rarity: 'rare', emoji: '⚡', desc: 'Standart siber savunma kulesi.', projColor: '#60a5fa', critColor: '#c084fc' },
    kurt_kaan: { id: 'kurt_kaan', name: 'Kurt Kaan', rarity: 'legendary', emoji: '🐺', desc: 'Asil bozkurt ruhu taşıyan, uluyarak plazma pençesi fırlatan Efsanevi Kurt Kaan kulesi!', projColor: '#38bdf8', critColor: '#facc15' },
    dgdvrn: { id: 'dgdvrn', name: 'DGDVRN (Altın Kaplama)', rarity: 'legendary', emoji: '👑', desc: 'Özel üretim saf altın kaplamalı efsanevi kule!', projColor: '#facc15', critColor: '#fef08a' },
    black_hole: { id: 'black_hole', name: 'Kozmik Kara Delik', rarity: 'legendary', emoji: '🕳️', desc: 'Uzay-zamanı büken, etrafında olay ufku dönen efsanevi kara delik kulesi!', projColor: '#a855f7', critColor: '#f43f5e' },
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
    legendary_persona_masks: { id: 'legendary_persona_masks', name: 'Trajedi & Komedi Maskesi', rarity: 'legendary', type: 'damage_mult', val: 2.25, desc: 'İki yüzlü sahne tılsımı: Tüm kule hasarını +%225 (x3.25) katlar!', icon: 'fa-solid fa-masks-theater', customArt: 'masks' },
    mythic_sisyphus_boulder: { id: 'mythic_sisyphus_boulder', name: 'Sisifos\'un Ebedi Kayası', rarity: 'mythic', type: 'hp', val: 1.65, desc: 'Durmaksızın zirveye taşınan kaya: Maksimum canı +%165 artırır.', icon: 'fa-solid fa-mountain', customArt: 'sisyphus' },
    mythic_fate_typewriter: { id: 'mythic_fate_typewriter', name: 'Kader Daktilosu', rarity: 'mythic', type: 'critMult', val: 1.45, desc: 'Geleceği yazan yeşil daktilo: Kritik hasar çarpanını +1.45x artırır.', icon: 'fa-solid fa-keyboard', customArt: 'typewriter' },
    epic_crimson_hourglass: { id: 'epic_crimson_hourglass', name: 'Kanlı Kum Saati', rarity: 'epic', type: 'speed', val: 0.42, desc: 'Kızıl kumları çatlaklardan sızan saat: Atış hızını +0.42/sn artırır.', icon: 'fa-solid fa-hourglass-end', customArt: 'crimson_hourglass' },
    epic_crimson_archer: { id: 'epic_crimson_archer', name: 'Kızıl Yaylı Gölge Okçu', rarity: 'epic', type: 'damage', val: 0.80, desc: 'Uzun kızıl yaylı avcı ruhu: Tüm kule hasarını +%80 artırır.', icon: 'fa-solid fa-bow-arrow', customArt: 'archer' },
    epic_void_rope: { id: 'epic_void_rope', name: 'Hiçlik Çukuru İpi', rarity: 'epic', type: 'lifesteal', val: 0.03, desc: 'Karanlık delikten çıkış halatı: Can çalma oranını +%3 artırır.', icon: 'fa-solid fa-circle-dot', customArt: 'void_rope' },
    epic_future_letter: { id: 'epic_future_letter', name: 'Yırtık Gelecek Mektubu', rarity: 'epic', type: 'gold', val: 0.55, desc: 'Üzerinde "Gelecek" yazan kadim parşömen: Altın kazancını +%55 artırır.', icon: 'fa-solid fa-scroll', customArt: 'future_letter' },
    srare_tracker_steps: { id: 'srare_tracker_steps', name: 'İz Sürücü Adımları', rarity: 'super_rare', type: 'range', val: 35, desc: 'Gizemli ayak izleri: Kule radar menzilini +35 piksel artırır.', icon: 'fa-solid fa-shoe-prints', customArt: 'footsteps' },

    rare_bow_shard: { id: 'rare_bow_shard', name: 'Kırık Yay Parçası', rarity: 'rare', type: 'damage', val: 0.12, desc: 'Tüm kule hasarını +%12 artırır.', icon: 'fa-solid fa-feather' },
    rare_copper_coin: { id: 'rare_copper_coin', name: 'Bakır Ganimet', rarity: 'rare', type: 'gold', val: 0.15, desc: 'Altın kazancını +%15 artırır.', icon: 'fa-solid fa-coins' },
    rare_iron_nail: { id: 'rare_iron_nail', name: 'Demir Çivi', rarity: 'rare', type: 'armor', val: 0.12, desc: 'Zırh değerini +%12 artırır.', icon: 'fa-solid fa-hammer' },
    rare_soft_feather: { id: 'rare_soft_feather', name: 'Hafif Tüy', rarity: 'rare', type: 'speed', val: 0.08, desc: 'Atış hızını +0.08/sn artırır.', icon: 'fa-solid fa-wind' },
    rare_small_gem: { id: 'rare_small_gem', name: 'Minik Safir', rarity: 'rare', type: 'crit', val: 4, desc: 'Kritik şansını +%4 artırır.', icon: 'fa-solid fa-gem' },
    rare_sturdy_wood: { id: 'rare_sturdy_wood', name: 'Sağlam Meşe', rarity: 'rare', type: 'hp', val: 0.15, desc: 'Maksimum canı +%15 artırır.', icon: 'fa-solid fa-tree' },
    rare_rusty_gear: { id: 'rare_rusty_gear', name: 'Paslı Dişli', rarity: 'rare', type: 'regen', val: 0.15, desc: 'Can yenilemesini +%15 artırır.', icon: 'fa-solid fa-gear' },
    rare_sharp_arrow: { id: 'rare_sharp_arrow', name: 'Ucu Sivri Ok', rarity: 'rare', type: 'critMult', val: 0.25, desc: 'Kritik çarpanını +0.25x artırır.', icon: 'fa-solid fa-crosshairs' },
    rare_glass_shard: { id: 'rare_glass_shard', name: 'Kristal Parçası', rarity: 'rare', type: 'crystal', val: 0.015, desc: 'Kristal düşme şansını +%1.5 artırır.', icon: 'fa-solid fa-diamond' },
    rare_leather_grip: { id: 'rare_leather_grip', name: 'Deri Kabza', rarity: 'rare', type: 'range', val: 15, desc: 'Menzili +15 piksel artırır.', icon: 'fa-solid fa-hand-fist' },
    rare_wolf_fang: { id: 'rare_wolf_fang', name: 'Bozkurt Dişi', rarity: 'rare', type: 'crit', val: 5, desc: 'Kritik şansını +%5 artırır.', icon: 'fa-solid fa-tooth' },
    rare_radar_lens: { id: 'rare_radar_lens', name: 'Optik Radar Merceği', rarity: 'rare', type: 'range', val: 22, desc: 'Menzili +22 piksel artırır.', icon: 'fa-solid fa-magnifying-glass' },
    srare_silver_quiver: { id: 'srare_silver_quiver', name: 'Gümüş Sadak', rarity: 'super_rare', type: 'damage', val: 0.28, desc: 'Tüm kule hasarını +%28 artırır.', icon: 'fa-solid fa-bullseye' },
    srare_gold_ring: { id: 'srare_gold_ring', name: 'Tüccar Yüzüğü', rarity: 'super_rare', type: 'gold', val: 0.35, desc: 'Altın kazancını +%35 artırır.', icon: 'fa-solid fa-ring' },
    srare_titanium_plate: { id: 'srare_titanium_plate', name: 'Titanyum Levha', rarity: 'super_rare', type: 'armor', val: 0.28, desc: 'Zırh değerini +%28 artırır.', icon: 'fa-solid fa-shield-halved' },
    srare_wind_charm: { id: 'srare_wind_charm', name: 'Rüzgar Tılsımı', rarity: 'super_rare', type: 'speed', val: 0.18, desc: 'Atış hızını +0.18/sn artırır.', icon: 'fa-solid fa-tornado' },
    srare_ruby_eye: { id: 'srare_ruby_eye', name: 'Yakut Göz', rarity: 'super_rare', type: 'crit', val: 8, desc: 'Kritik şansını +%8 artırır.', icon: 'fa-solid fa-eye' },
    srare_energy_cell: { id: 'srare_energy_cell', name: 'Enerji Hücresi', rarity: 'super_rare', type: 'shield', val: 0.30, desc: 'Plazma kalkanını +%30 artırır.', icon: 'fa-solid fa-battery-full' },
    srare_frost_core: { id: 'srare_frost_core', name: 'Sıfır Noktası Modülü', rarity: 'super_rare', type: 'regen', val: 0.32, desc: 'Can yenilemesini +%32 artırır.', icon: 'fa-solid fa-snowflake' },
    srare_sniper_scope: { id: 'srare_sniper_scope', name: 'Termal Lazer Dürbünü', rarity: 'super_rare', type: 'critMult', val: 0.55, desc: 'Kritik çarpanını +0.55x artırır.', icon: 'fa-solid fa-crosshairs' },
    epic_shadow_bow: { id: 'epic_shadow_bow', name: 'Gölge Avcısı Yayı', rarity: 'epic', type: 'damage', val: 0.60, desc: 'Tüm kule hasarını +%60 artırır.', icon: 'fa-solid fa-bow-arrow', customArt: 'archer' },
    epic_dragon_scale: { id: 'epic_dragon_scale', name: 'Ejderha Pul Zırhı', rarity: 'epic', type: 'hp', val: 0.65, desc: 'Maksimum canı +%65 artırır.', icon: 'fa-solid fa-shield' },
    epic_chronos_sand: { id: 'epic_chronos_sand', name: 'Zaman Kumları', rarity: 'epic', type: 'speed', val: 0.35, desc: 'Atış hızını +0.35/sn artırır.', icon: 'fa-solid fa-hourglass-half', customArt: 'crimson_hourglass' },
    epic_vampire_fang: { id: 'epic_vampire_fang', name: 'Vampir Dişi', rarity: 'epic', type: 'lifesteal', val: 0.02, desc: 'Can çalma oranını +%2 artırır.', icon: 'fa-solid fa-droplet' },
    epic_plasma_core: { id: 'epic_plasma_core', name: 'Kararsız Plazma Çekirdeği', rarity: 'epic', type: 'critMult', val: 1.10, desc: 'Kritik çarpanını +1.10x artırır.', icon: 'fa-solid fa-atom' },
    epic_cyber_katana: { id: 'epic_cyber_katana', name: 'Muramasa Plazma Kılıcı', rarity: 'epic', type: 'damage', val: 0.75, desc: 'Tüm kule hasarını +%75 artırır.', icon: 'fa-solid fa-khanda' },
    epic_aegis_barrier: { id: 'epic_aegis_barrier', name: 'Aegis Yansıtıcı Kalkan', rarity: 'epic', type: 'shield', val: 0.70, desc: 'Plazma kalkanını +%70 artırır.', icon: 'fa-solid fa-user-shield' },
    epic_crystal_magnet: { id: 'epic_crystal_magnet', name: 'Kuantum Mıknatısı', rarity: 'epic', type: 'crystal', val: 0.035, desc: 'Kristal düşme şansını +%3.5 artırır.', icon: 'fa-solid fa-magnet' },
    mythic_valkyrie_wing: { id: 'mythic_valkyrie_wing', name: 'Valkür Kanadı', rarity: 'mythic', type: 'damage', val: 1.35, desc: 'Tüm kule hasarını +%135 artırır.', icon: 'fa-solid fa-feather-pointed' },
    mythic_eternal_heart: { id: 'mythic_eternal_heart', name: 'Ebedi Yaşam Kalbi', rarity: 'mythic', type: 'hp', val: 1.40, desc: 'Maksimum kule canını +%140 artırır.', icon: 'fa-solid fa-heart-pulse' },
    mythic_god_crown: { id: 'mythic_god_crown', name: 'Tanrısal Hükümdar Tacı', rarity: 'mythic', type: 'gold', val: 1.00, desc: 'Altın kazancını +%100 artırır.', icon: 'fa-solid fa-crown' },
    mythic_blood_chalice: { id: 'mythic_blood_chalice', name: 'Ölümsüzlük Kadehi', rarity: 'mythic', type: 'lifesteal', val: 0.045, desc: 'Can çalma oranını +%4.5 artırır.', icon: 'fa-solid fa-wine-glass' },
    mythic_hyper_turbine: { id: 'mythic_hyper_turbine', name: 'Hiper-Türbin Motoru', rarity: 'mythic', type: 'speed', val: 0.65, desc: 'Atış hızını +0.65/sn artırır.', icon: 'fa-solid fa-fan' },
    legendary_cosmos_shard: { id: 'legendary_cosmos_shard', name: 'Kozmik Tekillik Çekirdeği', rarity: 'legendary', type: 'damage_mult', val: 2.00, desc: 'Tüm kule hasarını +%200 (x3) çarpanla katlar!', icon: 'fa-solid fa-sun' },
    legendary_infinity_bow: { id: 'legendary_infinity_bow', name: 'Sonsuzluk Efsanevi Yayı', rarity: 'legendary', type: 'multishot_buff', val: 1, desc: 'Ekstra +1 Çoklu Atış hedefi sağlar!', icon: 'fa-solid fa-infinity' },
    legendary_kurt_totem: { id: 'legendary_kurt_totem', name: 'Kurt Kaan\'ın Ebedi Totemi', rarity: 'legendary', type: 'damage_mult', val: 2.50, desc: 'Tüm kule hasarını +%250 (x3.5) çarpanla katlar!', icon: 'fa-solid fa-paw' }
};

const UPGRADE_DEFS = {
    damage: { category: 'attack', name: 'Plazma Hasarı', icon: 'fa-solid fa-explosion', color: 'text-red-400', desc: 'Her 10 ve 25 Sv. ekstra çarpan verir.', baseCost: 10, costScale: 1.115, maxLevel: 9999, getValueText: (lvl) => `${formatNumber(getTowerDamage())} Hasar` },
    attackSpeed: { category: 'attack', name: 'Atış Hızı', icon: 'fa-solid fa-gauge-high', color: 'text-amber-400', desc: 'Saniyedeki mermi sayısı (Maks 60 Sv).', baseCost: 30, costScale: 1.14, maxLevel: 60, getValueText: (lvl) => `${getTowerFireRate().toFixed(2)}/sn` },
    range: { category: 'attack', name: 'Radar Menzili', icon: 'fa-solid fa-bullseye', color: 'text-blue-400', desc: 'Kule nişancı menzili.', baseCost: 24, costScale: 1.13, maxLevel: 45, getValueText: (lvl) => `${Math.round(getTowerRange())} px` },
    critChance: { category: 'attack', name: 'Kritik Şansı', icon: 'fa-solid fa-bolt', color: 'text-purple-400', desc: 'Her seviye +%2 kritik şansı (Maks %85).', baseCost: 35, costScale: 1.15, maxLevel: 35, getValueText: (lvl) => `%${getTowerCritChance()}` },
    critMult: { category: 'attack', name: 'Kritik Çarpanı', icon: 'fa-solid fa-skull-crossbones', color: 'text-pink-400', desc: 'Kritik vuruş hasar katı.', baseCost: 45, costScale: 1.135, maxLevel: 150, getValueText: (lvl) => `x${getTowerCritMult().toFixed(2)}` },
    multishot: { category: 'attack', name: 'Çoklu Atış', icon: 'fa-solid fa-arrows-split-up-and-left', color: 'text-cyan-400', desc: 'Aynı anda vurulan hedef sayısı.', baseCost: 600, costScale: 3.5, maxLevel: 5, getValueText: (lvl) => `${getEffectiveMultishot()} Hedef` },
    bounce: { category: 'attack', name: 'Sekme (Zincir)', icon: 'fa-solid fa-share-nodes', color: 'text-indigo-400', desc: 'Merminin yakındaki düşmana sekmesi.', baseCost: 450, costScale: 3.2, maxLevel: 5, getValueText: (lvl) => `${lvl} Sekme` },
    knockback: { category: 'attack', name: 'Şok Dalgası', icon: 'fa-solid fa-wind', color: 'text-teal-400', desc: 'Düşmanları geri iter.', baseCost: 1200, costScale: 4.0, maxLevel: 3, getValueText: (lvl) => lvl === 0 ? 'Kapalı' : `Sv.${lvl}` },

    maxHp: { category: 'defense', name: 'Titanyum Gövde', icon: 'fa-solid fa-heart', color: 'text-emerald-400', desc: 'Her 10 ve 25 Sv. ekstra can çarpanı.', baseCost: 10, costScale: 1.11, maxLevel: 9999, getValueText: (lvl) => `${formatNumber(getTowerMaxHp())} HP` },
    hpRegen: { category: 'defense', name: 'Nano Onarım', icon: 'fa-solid fa-notes-medical', color: 'text-green-400', desc: 'Saniyede otomatik can yenileme.', baseCost: 18, costScale: 1.115, maxLevel: 9999, getValueText: (lvl) => `${formatNumber(getTowerRegen())}/sn` },
    armor: { category: 'defense', name: 'Reaktif Zırh', icon: 'fa-solid fa-shield', color: 'text-slate-300', desc: 'Düşman hasarını doğrudan emer.', baseCost: 22, costScale: 1.115, maxLevel: 9999, getValueText: (lvl) => `-${formatNumber(getTowerArmor())} Hasar` },
    shield: { category: 'defense', name: 'Plazma Kalkanı', icon: 'fa-solid fa-shield-virus', color: 'text-sky-400', desc: 'Hızla yenilenen enerji kalkanı.', baseCost: 50, costScale: 1.12, maxLevel: 9999, getValueText: (lvl) => `${formatNumber(getTowerMaxShield())} Kalkan` },
    lifesteal: { category: 'defense', name: 'Can Çalma', icon: 'fa-solid fa-droplet', color: 'text-rose-500', desc: 'Verilen hasardan can yeniler.', baseCost: 150, costScale: 1.20, maxLevel: 25, getValueText: (lvl) => `%${(getTowerLifesteal()*100).toFixed(1)}` },
    thorns: { category: 'defense', name: 'Dikenli Zırh', icon: 'fa-solid fa-burst', color: 'text-rose-400', desc: 'Saldırana hasarı geri yansıtır.', baseCost: 40, costScale: 1.15, maxLevel: 30, getValueText: (lvl) => `%${getTowerThorns()}` },

    goldBonus: { category: 'economy', name: 'Ganimet Çarpanı', icon: 'fa-solid fa-sack-dollar', color: 'text-amber-400', desc: 'Tüm altın kazancını katlar (10 Sv. bonuslu).', baseCost: 25, costScale: 1.12, maxLevel: 9999, getValueText: (lvl) => `x${getGoldMultiplier().toFixed(2)} Altın` },
    waveGold: { category: 'economy', name: 'Dalga İkramiyesi', icon: 'fa-solid fa-award', color: 'text-yellow-400', desc: 'Dalga gücüne oranlı dev altın ödülü.', baseCost: 40, costScale: 1.13, maxLevel: 9999, getValueText: (lvl) => `+${formatNumber(getWaveBonusPreview(lvl))}` },
    crystalChance: { category: 'economy', name: 'Kristal Sondajı', icon: 'fa-solid fa-gem', color: 'text-cyan-400', desc: 'Kristal şansını ve miktarını artırır.', baseCost: 90, costScale: 1.18, maxLevel: 35, getValueText: (lvl) => `%${getCrystalDropChance(lvl).toFixed(1)} (x${getCrystalDropMult(lvl).toFixed(1)})` },
    interest: { category: 'economy', name: 'Kuantum Bankası', icon: 'fa-solid fa-piggy-bank', color: 'text-emerald-400', desc: 'Dalga sonu kasa faizi (Dalgayla büyür).', baseCost: 200, costScale: 1.25, maxLevel: 15, getValueText: (lvl) => `%${(lvl * 0.8).toFixed(1)} Faiz` }
};

const COMPANION_DEFS = {
    laserDrone: {
        name: 'Lazer Dronu', icon: 'fa-solid fa-crosshairs', badgeClass: 'text-red-400 bg-red-500/10 border-red-500/30',
        desc: 'Seri plazma lazeri (5★ kritik vurur).',
        starCosts: [100, 500, 1250, 2500, 5000],
        damageMults: [0.40, 0.75, 1.25, 2.00, 3.20],
        cooldowns: [0.60, 0.50, 0.42, 0.34, 0.25],
        orbitRadius: 65, orbitSpeed: 1.6,
        getStarSummary: (star) => star === 0 ? '1★: %40 Kule Hasarı (0.60sn)' : `%${Math.round([0.40, 0.75, 1.25, 2.00, 3.20][star-1]*100)} Hasar | ${[0.60, 0.50, 0.42, 0.34, 0.25][star-1]}sn`
    },
    frostOrb: {
        name: 'Buzul Küresi', icon: 'fa-solid fa-snowflake', badgeClass: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
        desc: 'Alan yavaşlatma ve dondurucu şok.',
        starCosts: [100, 500, 1250, 2500, 5000],
        slowPcts: [25, 35, 45, 55, 65],
        damageMults: [0.25, 0.50, 0.85, 1.35, 2.10],
        orbitRadius: 85, orbitSpeed: -1.1,
        getStarSummary: (star) => star === 0 ? '1★: %25 Yavaşlatma + %25 Alan Hasarı' : `%${[25, 35, 45, 55, 65][star-1]} Yavaşlatma | %${Math.round([0.25, 0.50, 0.85, 1.35, 2.10][star-1]*100)} Alan Hasarı`
    },
    missileBot: {
        name: 'Füze Bataryası', icon: 'fa-solid fa-rocket', badgeClass: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
        desc: 'Yüksek patlayıcılı alan (AoE) füzesi.',
        starCosts: [100, 500, 1250, 2500, 5000],
        damageMults: [0.85, 1.50, 2.40, 3.60, 5.50],
        splashRadii: [50, 62, 75, 90, 110],
        cooldowns: [2.0, 1.8, 1.6, 1.4, 1.15],
        orbitRadius: 105, orbitSpeed: 0.85,
        getStarSummary: (star) => star === 0 ? '1★: %85 AoE Hasar (50px Çap)' : `%${Math.round([0.85, 1.50, 2.40, 3.60, 5.50][star-1]*100)} AoE Hasar | ${[50, 62, 75, 90, 110][star-1]}px Patlama`
    },
    repairDrone: {
        name: 'Onarım Mekaniği', icon: 'fa-solid fa-screwdriver-wrench', badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        desc: 'Can ve Plazma Kalkanını yüzdelik onarır.',
        starCosts: [100, 500, 1250, 2500, 5000],
        healPcts: [3.0, 5.5, 8.5, 12.5, 18.0],
        orbitRadius: 48, orbitSpeed: -2.0,
        getStarSummary: (star) => star === 0 ? '1★: Her 2sn +%3 Can & Kalkan' : `Her 2sn +%${[3.0, 5.5, 8.5, 12.5, 18.0][star-1]} Can & Kalkan`
    },
    plasmaSatellite: {
        name: 'Plazma Uydusu', icon: 'fa-solid fa-satellite-dish', badgeClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        desc: 'Çoklu hedefe zincirleme yıldırım + %Can hasarı.',
        starCosts: [100, 500, 1250, 2500, 5000],
        damageMults: [0.65, 1.15, 1.85, 2.80, 4.25],
        chainCounts: [1, 2, 3, 4, 5],
        maxHpPcts: [0.5, 1.0, 1.5, 2.2, 3.5],
        orbitRadius: 125, orbitSpeed: 0.6,
        getStarSummary: (star) => star === 0 ? '1★: 1 Hedef | %65 Hasar + %0.5 MaksHP' : `${[1, 2, 3, 4, 5][star-1]} Hedef | %${Math.round([0.65, 1.15, 1.85, 2.80, 4.25][star-1]*100)} + %${[0.5, 1.0, 1.5, 2.2, 3.5][star-1]} MaksHP`
    }
};

const PRESTIGE_DEFS = {
    permDamage: { name: 'Antik Çekirdek', icon: 'fa-solid fa-fire', desc: 'Tüm kule ve yoldaş hasarını katlar.', baseCost: 1, costScale: 1.45, maxLevel: 999, getEffectText: (lvl) => `+%${lvl * 35}` },
    permGold: { name: 'Altın Simyası', icon: 'fa-solid fa-coins', desc: 'Tüm altın kazancını kalıcı artırır.', baseCost: 1, costScale: 1.45, maxLevel: 999, getEffectText: (lvl) => `+%${lvl * 40}` },
    companionBoost: { name: 'Senkronize Yörünge', icon: 'fa-solid fa-satellite', desc: 'Yıldızlı yoldaşların gücünü katlar.', baseCost: 2, costScale: 1.5, maxLevel: 999, getEffectText: (lvl) => `+%${lvl * 45}` },
    costDiscount: { name: 'Mühendislik Verimi', icon: 'fa-solid fa-tags', desc: 'Yükseltme altın maliyetini düşürür.', baseCost: 2, costScale: 1.65, maxLevel: 30, getEffectText: (lvl) => `-%${lvl * 2}` },
    startWave: { name: 'Zaman Sıçraması', icon: 'fa-solid fa-forward', desc: 'İleri dalgadan başla (Başlangıç altını verir).', baseCost: 4, costScale: 1.9, maxLevel: 40, getEffectText: (lvl) => `Başlangıç: Dalga ${getStartWaveLevel(lvl)}` }
};
