// ================= KRONIKI BOGÓW — DANE =================
"use strict";
const D = {};

// ---------- FRAKCJE (8) ----------
D.FACTIONS = {
  cien:   {id:'cien',   name:'Cień',        icon:'🌑', col:0x9b59ff, col2:0x6a2cff, css:'#9b59ff', god:'shadow',   godName:'Shadow God',            region:'las_cieni',
           desc:'Nekromanci i cienie. Mroczna magia, przywoływanie, kontrola pola walki.', style:'mag', runeCat:'cien'},
  pustka: {id:'pustka', name:'Pustka',      icon:'🌀', col:0x7fd6ff, col2:0x3aa0ff, css:'#7fd6ff', god:'monk',     godName:'Pradawny Mnich Pustki', region:'pustynia_pustki',
           desc:'Mnisi równowagi. Energia, leczenie, ochrona sojuszników.', style:'wsparcie', runeCat:'pustka'},
  ninja:  {id:'ninja',  name:'Asasyni',     icon:'🗡️', col:0xa24dff, col2:0x4a2c8f, css:'#a24dff', god:'wraith',   godName:'Wraith Assassin',       region:'gory_nocy',
           desc:'Szybkie ataki, niewidzialność, krytyczne ciosy z cienia.', style:'zwinny', runeCat:'ostrze'},
  bestie: {id:'bestie', name:'Bestie',      icon:'🐉', col:0xe7a83c, col2:0x9b6a1c, css:'#e7a83c', god:'beast',    godName:'Abyssal Beast',         region:'otchlan_bestii',
           desc:'Siła fizyczna, żywioły, tankowanie. Smoki i pradawne bestie.', style:'tank', runeCat:'bestia'},
  chaos:  {id:'chaos',  name:'Chaos',       icon:'🕳️', col:0x3df0dc, col2:0x18b6c8, css:'#3df0dc', god:'devourer', godName:'Rune Devourer',         region:'ruiny_chaosu',
           desc:'Magia run, zniszczenie, pożeranie cudzej magii.', style:'mag', runeCat:'chaos'},
  popiol: {id:'popiol', name:'Popiół',      icon:'🛡️', col:0xff7a2b, col2:0xb84a10, css:'#ff7a2b', god:'knight',   godName:'Ashen Crusader',        region:'krainy_popiolu',
           desc:'Ciężka zbroja i wielkie miecze. Ogień, wojna, niezłomność.', style:'wojownik', runeCat:'popiol'},
  sen:    {id:'sen',    name:'Sen',         icon:'⚖️', col:0xc77dff, col2:0x8a5cff, css:'#c77dff', god:'thief',    godName:'Dream Thief',           region:'krolestwo_snow',
           desc:'Iluzje i kontrola umysłu. Kradzież snów i wspomnień.', style:'mag', runeCat:'sen'},
  demony: {id:'demony', name:'Demony',      icon:'😈', col:0xff2a3c, col2:0x8f0a18, css:'#ff2a3c', god:'fallen',   godName:'Upadły Bóg',            region:'piekielna_otchlan',
           desc:'Wygnana frakcja chaosu i zniszczenia. Zawsze wrogie.', style:'demon', runeCat:'demon', hostile:true},
};
D.FACTION_LIST = ['cien','pustka','ninja','bestie','chaos','popiol','sen','demony'];
D.PLAYABLE = ['cien','pustka','ninja','bestie','chaos','popiol','sen'];

// ---------- JEDNOSTKI: 16 na frakcję ----------
// tier: 1 podstawowa, 2 zaawansowana, 3 elitarna, 4 czempion
D.UNIT_NAMES = {
  cien:   [['Adept Mroku',1],['Grabarz',1],['Cienisty Sługa',1],['Kultysta Nocy',1],['Widmo',1],['Mroczny Uczeń',1],
           ['Nekromanta',2],['Władca Kości',2],['Cień Wojny',2],['Mistrz Rytuałów',2],
           ['Lisz',3],['Pożeracz Dusz',3],['Arcynekromanta',3],
           ['Pan Śmierci',4],['Królowa Cieni',4],['Wieczny Mrok',4]],
  pustka: [['Nowicjusz Pustki',1],['Pielgrzym',1],['Strażnik Ciszy',1],['Uczeń Równowagi',1],['Medytujący',1],['Wędrowiec',1],
           ['Mnich Pustki',2],['Strażnik Harmonii',2],['Tkacz Energii',2],['Mistrz Chi',2],
           ['Oświecony',3],['Arcymnich',3],['Głos Pustki',3],
           ['Wniebowstąpiony',4],['Serce Pustki',4],['Pradawny Uczeń',4]],
  ninja:  [['Zwiadowca',1],['Rzezimieszek',1],['Nocny Łotr',1],['Cichy Nóż',1],['Tropiciel',1],['Zabójca Najemny',1],
           ['Asasyn',2],['Nocne Ostrze',2],['Duszący Cień',2],['Mistrz Sztyletów',2],
           ['Cichy Zabójca',3],['Mistrz Cieni',3],['Wdowi Szept',3],
           ['Ostrze Nocy',4],['Widmowy Kat',4],['Ostatni Oddech',4]],
  bestie: [['Wilczy Pomiot',1],['Jaszczur',1],['Dzikus',1],['Kły Otchłani',1],['Skalny Niedźwiedź',1],['Młody Drakon',1],
           ['Berserker Bestii',2],['Smoczy Strażnik',2],['Behemot',2],['Władca Wilków',2],
           ['Starszy Smok',3],['Tytan Otchłani',3],['Pradawna Bestia',3],
           ['Smoczy Patriarcha',4],['Lewiatan',4],['Kość Świata',4]],
  chaos:  [['Adept Chaosu',1],['Runiczny Uczeń',1],['Szalony Skryba',1],['Pęknięty Mag',1],['Zjadacz Iskier',1],['Kultysta Ruin',1],
           ['Mag Chaosu',2],['Runopisarz',2],['Wichrzyciel',2],['Łamacz Zaklęć',2],
           ['Arcymag Ruin',3],['Pożeracz Many',3],['Tkacz Chaosu',3],
           ['Awatar Entropii',4],['Runiczny Tyran',4],['Ostatnie Równanie',4]],
  popiol: [['Rekrut Popiołu',1],['Giermek',1],['Tarczownik',1],['Płomienny Pachołek',1],['Strażnik Żaru',1],['Weteran Pogorzelisk',1],
           ['Rycerz Popiołu',2],['Krzyżowiec',2],['Płomienna Pięść',2],['Kapitan Żaru',2],
           ['Czempion Popiołu',3],['Generał Pogorzelisk',3],['Święty Płomień',3],
           ['Niezłomny',4],['Ostatni Bastion',4],['Serce Wulkanu',4]],
  sen:    [['Śniący Adept',1],['Iluzjonista',1],['Łapacz Snów',1],['Szept Nocy',1],['Mglisty Uczeń',1],['Hipnotyzer',1],
           ['Złodziej Snów',2],['Tkacz Iluzji',2],['Koszmarnik',2],['Władca Miraży',2],
           ['Arcyiluzjonista',3],['Strażnik Bram Snu',3],['Pożeracz Koszmarów',3],
           ['Pan Snów',4],['Wieczny Sen',4],['Lustrzany Król',4]],
  demony: [['Chochlik',1],['Diablik',1],['Ognisty Pomiot',1],['Rogaty Sługa',1],['Piekielny Ogar',1],['Skrzydlaty Zwiastun',1],
           ['Demon Wojny',2],['Piekielny Rycerz',2],['Sukkub',2],['Władca Ognia',2],
           ['Arcydemon',3],['Baron Piekieł',3],['Pożeracz Światów',3],
           ['Książę Otchłani',4],['Herold Upadku',4],['Prawa Ręka Upadłego',4]],
};

// statystyki wg tieru (bazowe, skalowane poziomem regionu)
D.TIER_STATS = {1:{hp:[100,300],dmg:[20,50],xp:14,gold:[4,12]},2:{hp:[300,600],dmg:[50,100],xp:34,gold:[10,26]},
                3:{hp:[600,1200],dmg:[100,200],xp:80,gold:[24,60]},4:{hp:[1200,2400],dmg:[160,320],xp:180,gold:[60,140]}};
D.DEMON_TIER = {1:{hp:[300,800],dmg:[50,150],xp:30,gold:[10,30]},2:{hp:[800,1600],dmg:[120,260],xp:70,gold:[24,60]},
                3:{hp:[1000,3000],dmg:[150,400],xp:150,gold:[50,120]},4:{hp:[2500,5000],dmg:[300,600],xp:320,gold:[110,260]}};

// ---------- REGIONY (10) ----------
D.REGIONS = {
  wioska:           {id:'wioska', name:'Centralna Wioska', icon:'🏠', ground:0x121c12, fog:0x0a1408, amb:0x1a281a, lvl:[1,1], safe:true,
                     desc:'Bezpieczna baza — sklepy, portale, NPC.'},
  las_cieni:        {id:'las_cieni', name:'Las Cieni', icon:'🌲', ground:0x090e12, fog:0x060a12, amb:0x121a2a, lvl:[1,10], fac:'cien',
                     desc:'Mroczny las nekromantów.', props:'trees', res:['Pył Cienia','Czarne Drewno']},
  pustynia_pustki:  {id:'pustynia_pustki', name:'Pustynia Pustki', icon:'🏜️', ground:0x211b12, fog:0x1a140a, amb:0x2f281a, lvl:[4,14], fac:'pustka',
                     desc:'Jałowa kraina mnichów pustki.', props:'rocks', res:['Kryształ Pustki','Piasek Wieczności']},
  gory_nocy:        {id:'gory_nocy', name:'Góry Nocy', icon:'⛰️', ground:0x111218, fog:0x0a0c14, amb:0x1a1c2b, lvl:[8,18], fac:'ninja',
                     desc:'Skaliste szczyty asasynów.', props:'peaks', res:['Nocna Ruda','Górski Kryształ']},
  otchlan_bestii:   {id:'otchlan_bestii', name:'Otchłań Bestii', icon:'🦴', ground:0x1a140c, fog:0x140e06, amb:0x282112, lvl:[12,24], fac:'bestie',
                     desc:'Dzikie tereny bestii i smoków.', props:'bones', res:['Smocza Łuska','Kość Bestii']},
  ruiny_chaosu:     {id:'ruiny_chaosu', name:'Ruiny Chaosu', icon:'🏚️', ground:0x0c1615, fog:0x061210, amb:0x122826, lvl:[16,30], fac:'chaos',
                     desc:'Zniszczone miasto magów chaosu.', props:'ruins', res:['Odłamek Runy','Esencja Chaosu']},
  krainy_popiolu:   {id:'krainy_popiolu', name:'Krainy Popiołu', icon:'🌋', ground:0x190e0b, fog:0x140806, amb:0x2f150e, lvl:[22,38], fac:'popiol',
                     desc:'Spalona ziemia rycerzy popiołu.', props:'embers', res:['Żarowy Kryształ','Popielna Stal']},
  krolestwo_snow:   {id:'krolestwo_snow', name:'Królestwo Snów', icon:'🌙', ground:0x130e1e, fog:0x0e0820, amb:0x28213e, lvl:[28,46], fac:'sen',
                     desc:'Iluzoryczna kraina złodziei snów.', props:'dream', res:['Nić Snu','Lustrzany Pył']},
  wymiar_bogow:     {id:'wymiar_bogow', name:'Wymiar Bogów', icon:'🔱', ground:0x100b1b, fog:0x0c0618, amb:0x2f2147, lvl:[40,60], godOnly:true, fac:'demony',
                     desc:'Przestrzeń dostępna tylko dla bogów.', props:'divine', res:['Boska Esencja','Gwiezdny Metal']},
  piekielna_otchlan:{id:'piekielna_otchlan', name:'Piekielna Otchłań', icon:'🔥', ground:0x1a0608, fog:0x180406, amb:0x3e0e15, lvl:[50,70], fac:'demony', finalBoss:true,
                     desc:'Dom demonów i Upadłego Boga.', props:'hell', res:['Serce Demona','Piekielny Obsydian']},
};
D.REGION_LIST = ['wioska','las_cieni','pustynia_pustki','gory_nocy','otchlan_bestii','ruiny_chaosu','krainy_popiolu','krolestwo_snow','wymiar_bogow','piekielna_otchlan'];

// ---------- RZADKOŚCI ----------
D.RARITY = {
  common:{id:'common',name:'Zwykła',col:'#9aa6b2',mul:1.0,ord:0}, rare:{id:'rare',name:'Rzadka',col:'#4aa3ff',mul:1.35,ord:1},
  epic:{id:'epic',name:'Epicka',col:'#b85cff',mul:1.8,ord:2},   mythic:{id:'mythic',name:'Mityczna',col:'#ff4d6d',mul:2.4,ord:3},
  legend:{id:'legend',name:'Legendarna',col:'#ffb13b',mul:3.2,ord:4}, secret:{id:'secret',name:'Sekretna',col:'#7dffc7',mul:4.5,ord:5},
};
D.RAR_LIST = ['common','rare','epic','mythic','legend','secret'];

// ---------- PRZEDMIOTY ----------
D.WEAPON_TYPES = {
  cien:{n:'Berło Cieni',ic:'🪄'}, pustka:{n:'Kostur Równowagi',ic:'🥢'}, ninja:{n:'Sztylety',ic:'🗡️'},
  bestie:{n:'Pazury',ic:'🐾'}, chaos:{n:'Berło Run',ic:'🔮'}, popiol:{n:'Miecz Popiołu',ic:'⚔️'}, sen:{n:'Berło Iluzji',ic:'🌙'}, demony:{n:'Piekielna Klinga',ic:'🔥'} };
D.ARMOR_SLOTS = [ {id:'helm',n:'Hełm',ic:'🪖'},{id:'chest',n:'Zbroja',ic:'🛡️'},{id:'gloves',n:'Rękawice',ic:'🧤'},{id:'boots',n:'Buty',ic:'👢'} ];
D.ACC_SLOTS = [ {id:'ring',n:'Pierścień',ic:'💍'},{id:'amulet',n:'Amulet',ic:'📿'} ];
D.EQUIP_SLOTS = ['weapon','helm','chest','gloves','boots','ring','amulet'];
D.SLOT_META = {weapon:{n:'Broń',ic:'⚔️'},helm:{n:'Hełm',ic:'🪖'},chest:{n:'Zbroja',ic:'🛡️'},gloves:{n:'Rękawice',ic:'🧤'},boots:{n:'Buty',ic:'👢'},ring:{n:'Pierścień',ic:'💍'},amulet:{n:'Amulet',ic:'📿'}};
D.ITEM_PREFIX = {common:['Prosty','Zużyty','Stary'],rare:['Solidny','Hartowany','Runiczny'],epic:['Mistrzowski','Przeklęty','Świetlisty'],
  mythic:['Pradawny','Krwawy','Widmowy'],legend:['Boski','Wieczny','Tytaniczny'],secret:['Zakazany','Pierwotny','Ostateczny']};

// unikaty ze specyfikacji + rozszerzenia
D.UNIQUES = [
  {id:'berlo_cieni',n:'Berło Cieni',slot:'weapon',fac:'cien',rar:'legend',ic:'🪄',dmg:150,fx:'summon_shadows',fxd:'Przyzywa 2 cienie przy trafieniu (10% szans)'},
  {id:'berlo_rownowagi',n:'Berło Równowagi',slot:'weapon',fac:'pustka',rar:'epic',ic:'🥢',dmg:80,fx:'heal_aura',fxd:'Leczy sojuszników w promieniu 5 m (2%/s)'},
  {id:'smoczy_miecz',n:'Smoczy Miecz',slot:'weapon',fac:'bestie',rar:'legend',ic:'🐲',dmg:140,fx:'dragon_slayer',fxd:'+20% obrażeń przeciw smokom i bestiom'},
  {id:'berlo_chaosu',n:'Berło Chaosu',slot:'weapon',fac:'chaos',rar:'legend',ic:'🔮',dmg:135,fx:'double_cast',fxd:'25% szansy na podwójne zaklęcie'},
  {id:'mlot_plomieni',n:'Młot Płomieni',slot:'weapon',fac:'popiol',rar:'epic',ic:'🔨',dmg:95,fx:'aoe_smash',fxd:'Ataki zadają obrażenia obszarowe (3 m)'},
  {id:'berlo_iluzji',n:'Berło Iluzji',slot:'weapon',fac:'sen',rar:'legend',ic:'🌙',dmg:130,fx:'decoy',fxd:'Tworzy sobowtóra na 10 s (raz na 60 s)'},
  {id:'klinga_nocy',n:'Klinga Bezgłośnej Nocy',slot:'weapon',fac:'ninja',rar:'legend',ic:'🗡️',dmg:145,fx:'backstab',fxd:'+35% szansy na trafienie krytyczne'},
  {id:'korona_upadlego',n:'Korona Upadłego',slot:'helm',fac:'demony',rar:'secret',ic:'👑',def:120,fx:'demon_lord',fxd:'+15% obrażeń, demony tier 1 są neutralne'},
  {id:'serce_pustki',n:'Serce Pustki',slot:'amulet',fac:'pustka',rar:'mythic',ic:'💠',def:40,fx:'mana_soul',fxd:'+40% many, regeneracja many +50%'},
  {id:'luska_lewiatana',n:'Łuska Lewiatana',slot:'chest',fac:'bestie',rar:'mythic',ic:'🛡️',def:150,fx:'thorns',fxd:'Odbija 15% otrzymanych obrażeń'},
];

// mikstury i surowce
D.POTIONS = [
  {id:'pot_hp_s',n:'Mała Mikstura Życia',ic:'🧪',heal:120,price:25},
  {id:'pot_hp_l',n:'Wielka Mikstura Życia',ic:'⚗️',heal:450,price:90},
  {id:'pot_mp',n:'Mikstura Many',ic:'🔵',mana:200,price:40},
  {id:'pot_spd',n:'Eliksir Szybkości',ic:'💨',buff:'spd',dur:30,price:60},
  {id:'pot_str',n:'Eliksir Mocy',ic:'💪',buff:'dmg',dur:30,price:80},
  {id:'pot_def',n:'Eliksir Kamiennej Skóry',ic:'🪨',buff:'def',dur:30,price:70},
];
D.RESOURCES = ['Pył Cienia','Czarne Drewno','Kryształ Pustki','Piasek Wieczności','Nocna Ruda','Górski Kryształ','Smocza Łuska','Kość Bestii',
  'Odłamek Runy','Esencja Chaosu','Żarowy Kryształ','Popielna Stal','Nić Snu','Lustrzany Pył','Boska Esencja','Gwiezdny Metal','Serce Demona','Piekielny Obsydian'];

// ---------- RUNY I ZAKLĘCIA ----------
// kategorie run — każda frakcja ma kategorię; aktywacja u Runologa losuje zaklęcie
D.RUNE_CATS = {
  cien:  {n:'Runa Cienia', ic:'🌑', col:'#9b59ff'},
  pustka:{n:'Runa Pustki', ic:'🌀', col:'#7fd6ff'},
  ostrze:{n:'Runa Ostrza', ic:'🗡️', col:'#a24dff'},
  bestia:{n:'Runa Bestii', ic:'🐉', col:'#e7a83c'},
  chaos: {n:'Runa Chaosu', ic:'🕳️', col:'#3df0dc'},
  popiol:{n:'Runa Popiołu',ic:'🔥', col:'#ff7a2b'},
  sen:   {n:'Runa Snów',   ic:'🌙', col:'#c77dff'},
  demon: {n:'Runa Demona', ic:'😈', col:'#ff2a3c'},
};
// zaklęcia: type: proj|nova|beamdash|summon|buff|heal|shield|cloud|blink
D.SPELLS = {
  cien: [
    {id:'cien_pocisk',n:'Pocisk Cienia',ic:'🟣',type:'proj',dmg:1.1,mana:14,cd:1.2,d:'Mroczny pocisk przebijający cel.'},
    {id:'cien_lanc',n:'Łańcuch Dusz',ic:'⛓️',type:'proj',dmg:0.8,mana:20,cd:3,chain:3,d:'Przeskakuje między 3 wrogami.'},
    {id:'cien_nova',n:'Nowa Mroku',ic:'💥',type:'nova',dmg:1.4,mana:32,cd:6,r:5,d:'Eksplozja cienia wokół ciebie.'},
    {id:'cien_summon',n:'Przyzwanie Cienia',ic:'👤',type:'summon',dmg:0.5,mana:40,cd:14,dur:20,d:'Przyzywa cień walczący u twego boku.'},
    {id:'cien_drain',n:'Drenaż Życia',ic:'🩸',type:'proj',dmg:0.9,mana:22,cd:4,leech:0.6,d:'Kradnie życie wroga.'},
    {id:'cien_cloud',n:'Mgła Grobowa',ic:'☁️',type:'cloud',dmg:0.4,mana:28,cd:8,dur:6,r:4,d:'Chmura zadająca obrażenia co sekundę.'},
    {id:'cien_fear',n:'Krzyk Grozy',ic:'😱',type:'nova',dmg:0.3,mana:26,cd:10,r:6,fear:2.5,d:'Wrogowie uciekają w panice.'},
  ],
  pustka: [
    {id:'pu_orb',n:'Kula Pustki',ic:'🔵',type:'proj',dmg:1.0,mana:12,cd:1.1,d:'Kula czystej energii.'},
    {id:'pu_heal',n:'Dotyk Równowagi',ic:'💚',type:'heal',heal:0.35,mana:30,cd:6,d:'Leczy 35% maks. HP.'},
    {id:'pu_shield',n:'Bariera Pustki',ic:'🛡️',type:'shield',sh:0.4,mana:28,cd:10,dur:8,d:'Tarcza pochłaniająca obrażenia.'},
    {id:'pu_beam',n:'Promień Ciszy',ic:'⚡',type:'proj',dmg:1.5,mana:26,cd:4,pierce:true,d:'Przeszywający promień energii.'},
    {id:'pu_nova',n:'Fala Harmonii',ic:'🌊',type:'nova',dmg:1.1,mana:30,cd:7,r:5,slow:2,d:'Fala spowalniająca wrogów.'},
    {id:'pu_blink',n:'Krok Pustki',ic:'✨',type:'blink',mana:18,cd:5,d:'Teleport 8 m do przodu.'},
    {id:'pu_regen',n:'Medytacja',ic:'🧘',type:'buff',buff:'regen',mana:24,cd:14,dur:10,d:'Silna regeneracja HP przez 10 s.'},
  ],
  ostrze: [
    {id:'os_rzut',n:'Rzut Sztyletem',ic:'🔪',type:'proj',dmg:1.2,mana:10,cd:0.9,d:'Szybki rzut zatrutym ostrzem.'},
    {id:'os_dash',n:'Cięcie Widmowe',ic:'💨',type:'blink',dmg:1.3,mana:20,cd:4,d:'Doskok z cięciem przez wrogów.'},
    {id:'os_fan',n:'Wachlarz Ostrzy',ic:'🌪️',type:'nova',dmg:1.0,mana:24,cd:5,r:4,d:'Ostrza we wszystkich kierunkach.'},
    {id:'os_stealth',n:'Zasłona Dymna',ic:'🌫️',type:'buff',buff:'stealth',mana:26,cd:16,dur:5,d:'Niewidzialność, następny atak +150%.'},
    {id:'os_mark',n:'Znak Śmierci',ic:'☠️',type:'proj',dmg:0.6,mana:18,cd:8,mark:1.4,d:'Oznaczony wróg otrzymuje +40% obrażeń.'},
    {id:'os_shuriken',n:'Burza Shurikenów',ic:'⭐',type:'proj',dmg:0.55,mana:22,cd:3,multi:5,d:'5 gwiazdek w stożku.'},
  ],
  bestia: [
    {id:'be_klask',n:'Uderzenie Łapy',ic:'🐾',type:'nova',dmg:1.3,mana:14,cd:2,r:3,d:'Potężny zamach obszarowy.'},
    {id:'be_ryk',n:'Ryk Otchłani',ic:'📢',type:'nova',dmg:0.4,mana:22,cd:9,r:6,stun:1.5,d:'Ogłusza wrogów w pobliżu.'},
    {id:'be_szarza',n:'Szarża',ic:'🏃',type:'blink',dmg:1.1,mana:18,cd:5,d:'Taranujący doskok.'},
    {id:'be_skora',n:'Kamienna Skóra',ic:'🪨',type:'buff',buff:'def',mana:24,cd:12,dur:8,d:'+60% obrony przez 8 s.'},
    {id:'be_plomien',n:'Oddech Ognia',ic:'🔥',type:'cloud',dmg:0.6,mana:26,cd:7,dur:4,r:4,d:'Stożek ognia przed tobą.'},
    {id:'be_przywolanie',n:'Zew Bestii',ic:'🐺',type:'summon',dmg:0.6,mana:38,cd:16,dur:18,d:'Przyzywa wilka bojowego.'},
  ],
  chaos: [
    {id:'ch_pocisk',n:'Runiczny Pocisk',ic:'🔷',type:'proj',dmg:1.15,mana:13,cd:1.1,d:'Niestabilny pocisk chaosu.'},
    {id:'ch_wybuch',n:'Implozja Run',ic:'💠',type:'nova',dmg:1.6,mana:34,cd:7,r:4.5,d:'Zapadająca się energia run.'},
    {id:'ch_pozarcie',n:'Pożarcie Magii',ic:'🕳️',type:'proj',dmg:0.7,mana:8,cd:5,manaSteal:40,d:'Kradnie manę i wzmacnia ciebie.'},
    {id:'ch_meteor',n:'Deszcz Odłamków',ic:'☄️',type:'cloud',dmg:0.8,mana:36,cd:10,dur:5,r:5,d:'Odłamki run spadają z nieba.'},
    {id:'ch_los',n:'Rzut Kośćmi Losu',ic:'🎲',type:'proj',dmg:2.2,mana:30,cd:6,rand:true,d:'Losowe obrażenia 30–220%.'},
    {id:'ch_polimorf',n:'Chaotyczna Mutacja',ic:'🐸',type:'proj',dmg:0.2,mana:28,cd:14,stun:3,d:'Zamienia wroga w nieszkodliwą formę na 3 s.'},
  ],
  popiol: [
    {id:'po_ciecie',n:'Płonące Cięcie',ic:'🗡️',type:'nova',dmg:1.25,mana:14,cd:1.8,r:3,d:'Ogniste cięcie półkolem.'},
    {id:'po_mlot',n:'Młot Sprawiedliwości',ic:'🔨',type:'nova',dmg:1.7,mana:30,cd:7,r:4,stun:1,d:'Uderzenie ogłuszające wrogów.'},
    {id:'po_tarcza',n:'Mur Popiołu',ic:'🛡️',type:'shield',sh:0.5,mana:26,cd:11,dur:8,d:'Potężna tarcza z żaru.'},
    {id:'po_skok',n:'Ognisty Skok',ic:'🌋',type:'blink',dmg:1.2,mana:22,cd:6,d:'Skok z eksplozją przy lądowaniu.'},
    {id:'po_aura',n:'Aura Żaru',ic:'♨️',type:'buff',buff:'burn_aura',mana:28,cd:14,dur:10,d:'Podpalasz wrogów w pobliżu.'},
    {id:'po_feniks',n:'Serce Feniksa',ic:'🐦‍🔥',type:'buff',buff:'phoenix',mana:44,cd:60,dur:30,d:'Raz: śmierć = odrodzenie z 50% HP.'},
  ],
  sen: [
    {id:'se_pocisk',n:'Senny Pocisk',ic:'💜',type:'proj',dmg:1.05,mana:12,cd:1.1,d:'Pocisk utkanego snu.'},
    {id:'se_luster',n:'Sobowtór',ic:'🪞',type:'summon',dmg:0.45,mana:34,cd:14,dur:12,d:'Iluzja przyciągająca wrogów.'},
    {id:'se_sen',n:'Uśpienie',ic:'😴',type:'nova',dmg:0.1,mana:26,cd:10,r:5,stun:3,d:'Usypia wrogów wokół (3 s).'},
    {id:'se_koszmar',n:'Koszmar',ic:'👁️',type:'proj',dmg:1.5,mana:26,cd:5,dot:0.4,d:'Obrażenia + koszmar przez 4 s.'},
    {id:'se_kradziez',n:'Kradzież Snu',ic:'🌙',type:'proj',dmg:0.8,mana:20,cd:6,leech:0.8,slow:2,d:'Kradnie życie i spowalnia.'},
    {id:'se_mgla',n:'Mgła Miraży',ic:'🌫️',type:'cloud',dmg:0.35,mana:30,cd:9,dur:6,r:5,slow:1.5,d:'Wrogowie błądzą we mgle.'},
  ],
  demon: [
    {id:'de_ogien',n:'Piekielny Ogień',ic:'🔥',type:'proj',dmg:1.6,mana:20,cd:1.6,d:'Pocisk piekielnego płomienia.'},
    {id:'de_nova',n:'Erupcja Otchłani',ic:'💥',type:'nova',dmg:2.0,mana:40,cd:8,r:5.5,d:'Piekło wybucha wokół ciebie.'},
    {id:'de_lancuch',n:'Piekielne Łańcuchy',ic:'⛓️',type:'nova',dmg:0.6,mana:32,cd:10,r:6,stun:2,d:'Przykuwa wrogów do ziemi.'},
    {id:'de_pakt',n:'Krwawy Pakt',ic:'🩸',type:'buff',buff:'bloodpact',mana:0,hpCost:0.2,cd:20,dur:12,d:'-20% HP, +50% obrażeń na 12 s.'},
    {id:'de_przyzw',n:'Wrota Piekieł',ic:'😈',type:'summon',dmg:0.8,mana:50,cd:22,dur:20,d:'Przyzywa demona bojowego.'},
  ],
};
D.RUNE_SLOTS_BASE = 5; // do 8 (odblokowywane)

// ---------- BOGOWIE ----------
D.GODS = {
  shadow:  {id:'shadow',  fac:'cien',   name:'Shadow God',            ic:'🌑', glb:'shadow',
    lore:'Dobrotliwy władca cienia — jego mrok chroni, nie niszczy.'},
  monk:    {id:'monk',    fac:'pustka', name:'Pradawny Mnich Pustki', ic:'🌀', glb:'monk',
    lore:'Medytuje w ciszy poza czasem, strażnik równowagi światów.'},
  wraith:  {id:'wraith',  fac:'ninja',  name:'Wraith Assassin',       ic:'🗡️', glb:'wraith',
    lore:'Cichy żniwiarz — uderza tam, gdzie nikt się nie spodziewa.'},
  beast:   {id:'beast',   fac:'bestie', name:'Abyssal Beast',         ic:'🐉', glb:'beast',
    lore:'Pradawna bestia otchłani owinięta złotym ogniem furii.'},
  devourer:{id:'devourer',fac:'chaos',  name:'Rune Devourer',         ic:'🕳️', glb:'devourer',
    lore:'Istota z pochłoniętych run, wiecznie głodna mocy zaklęć.'},
  knight:  {id:'knight',  fac:'popiol', name:'Ashen Crusader',        ic:'🛡️', glb:'knight',
    lore:'Spopielały rycerz, który nie złoży broni nawet w popiele świata.'},
  thief:   {id:'thief',   fac:'sen',    name:'Dream Thief',           ic:'⚖️', glb:'thief',
    lore:'Waży dusze na srebrnej wadze, kradnie sny i wspomnienia.'},
  fallen:  {id:'fallen',  fac:'demony', name:'Upadły Bóg',            ic:'😈', glb:'fallen',
    lore:'Wygnany z panteonu. Jego nienawiść zrodziła demony.', hostileOnly:true},
};

// Umiejętności bogów: 5 pasywnych + 15 aktywnych + 2 specjalne + 28 węzłów boskich ulepszeń = 50
// Aktywne generowane z szablonów tematycznych; specjalne wg specyfikacji.
D.GOD_SPECIALS = {
  shadow:  [{id:'sp_shadowform',n:'Przemiana w Cień',ic:'👥',cd:1800,d:'Pokonany wróg (nie bóg) dołącza do klanu jako cienisty sojusznik (60% statystyk). Ładunek co 30 min.'},
            {id:'sp_eclipse',n:'Zaćmienie',ic:'🌚',cd:300,de:80,d:'Na 12 s świat pogrąża się w mroku: twoje obrażenia +80%, wrogowie oślepieni.'}],
  monk:    [{id:'sp_balance',n:'Absolutna Równowaga',ic:'☯️',cd:600,de:60,d:'Wyrównuje HP wszystkich istot w promieniu 15 m do średniej — potężne leczenie lub kara.'},
            {id:'sp_voidwalk',n:'Spacer Pustką',ic:'🌌',cd:240,de:50,d:'10 s nietykalności i przenikania przez wrogów; ataki z pustki +100%.'}],
  wraith:  [{id:'sp_deathmark',n:'Wyrok',ic:'⚰️',cd:600,de:70,d:'Oznacza wroga: po 3 s otrzymuje 30% maks. HP obrażeń. Bossowie: 10%.'},
            {id:'sp_shadowclones',n:'Armia Cieni',ic:'🥷',cd:420,de:80,d:'3 klony walczące jak ty (50% obrażeń) przez 20 s.'}],
  beast:   [{id:'sp_apex',n:'Szczyt Łańcucha',ic:'🦖',cd:600,de:80,d:'Przemiana w pradawną formę: +100% HP, ataki AOE, 20 s.'},
            {id:'sp_stampede',n:'Panika Stada',ic:'🐃',cd:360,de:60,d:'Przyzywa stado bestii tratujące wszystko na drodze.'}],
  devourer:[{id:'sp_runeforge',n:'Tworzenie Run',ic:'🔮',cd:600,de:60,d:'Tworzy losową runę (Epicka–Sekretna) z Boskiej Energii. Ładunek co 10 min.'},
            {id:'sp_nullzone',n:'Strefa Zero',ic:'⭕',cd:420,de:80,d:'Pole 10 m: wrogowie nie mogą rzucać zaklęć, ty pożerasz ich manę.'}],
  knight:  [{id:'sp_lastbastion',n:'Ostatni Bastion',ic:'🏰',cd:600,de:70,d:'10 s: nie możesz spaść poniżej 1 HP, odbijasz 50% obrażeń.'},
            {id:'sp_ashstorm',n:'Burza Popiołu',ic:'🌪️',cd:360,de:80,d:'Ognista burza wokół ciebie przez 12 s (potężne AOE).'}],
  thief:   [{id:'sp_dreamsteal',n:'Kradzież Jaźni',ic:'🌙',cd:900,de:80,d:'Kopiujesz 3 losowe umiejętności trafionego wroga na 60 s.'},
            {id:'sp_nightmare_realm',n:'Domena Koszmaru',ic:'👁️',cd:420,de:90,d:'Wciąga wrogów do wymiaru snów: uśpieni 4 s, potem koszmar (DOT).'}],
  fallen:  [{id:'sp_apocalypse',n:'Apokalipsa',ic:'☄️',cd:600,de:100,d:'Deszcz ognia niszczący wszystko.'},
            {id:'sp_corruption',n:'Korupcja',ic:'🖤',cd:300,de:60,d:'Zaraża wrogów mrokiem, który się rozprzestrzenia.'}],
};
// szablony aktywnych umiejętności boga (15 szt. — skalowane z drzewkiem)
D.GOD_ACTIVES_T = [
  {k:'strike',n:'Boskie Uderzenie',ic:'⚡',de:10,cd:2,dmg:2.0,type:'proj',d:'Potężny pocisk boskiej mocy.'},
  {k:'nova',n:'Gniew Boga',ic:'💥',de:25,cd:6,dmg:2.6,type:'nova',r:6,d:'Eksplozja domeny wokół ciebie.'},
  {k:'storm',n:'Burza Domeny',ic:'🌩️',de:35,cd:12,dmg:1.0,type:'cloud',dur:8,r:6,d:'Żywioł domeny szaleje w obszarze.'},
  {k:'summon',n:'Awatar',ic:'👤',de:45,cd:20,dmg:1.2,type:'summon',dur:25,d:'Przyzywa awatara twojej domeny.'},
  {k:'heal',n:'Boska Odnowa',ic:'💚',de:30,cd:10,heal:0.5,type:'heal',d:'Odnawia 50% zdrowia.'},
  {k:'shield',n:'Egida',ic:'🛡️',de:25,cd:12,sh:0.6,type:'shield',dur:10,d:'Boska tarcza pochłaniająca obrażenia.'},
  {k:'blink',n:'Krok Boga',ic:'✨',de:15,cd:4,type:'blink',dmg:1.0,d:'Błyskawiczny przeskok z uderzeniem.'},
  {k:'beam',n:'Promień Sądu',ic:'🔆',de:30,cd:8,dmg:3.0,type:'proj',pierce:true,d:'Przeszywający promień boskiego sądu.'},
  {k:'chains',n:'Okowy Niebios',ic:'⛓️',de:28,cd:10,dmg:0.8,type:'nova',r:7,stun:2,d:'Unieruchamia wrogów wokół.'},
  {k:'meteor',n:'Gwiazdozbiór',ic:'☄️',de:40,cd:14,dmg:1.4,type:'cloud',dur:5,r:7,d:'Fragmenty nieba spadają na wrogów.'},
  {k:'drain',n:'Pochłonięcie',ic:'🩸',de:20,cd:6,dmg:1.6,type:'proj',leech:0.8,d:'Wysysa esencję życia wroga.'},
  {k:'fear',n:'Trwoga',ic:'😱',de:22,cd:12,dmg:0.4,type:'nova',r:8,fear:3,d:'Śmiertelni drżą przed bogiem.'},
  {k:'haste',n:'Boski Impet',ic:'💨',de:18,cd:14,type:'buff',buff:'spd',dur:12,d:'+50% szybkości ruchu i ataku.'},
  {k:'wrathbuff',n:'Domena Mocy',ic:'🔥',de:26,cd:18,type:'buff',buff:'dmg',dur:15,d:'+40% obrażeń na 15 s.'},
  {k:'judgement',n:'Wyrok Ostateczny',ic:'⚖️',de:50,cd:25,dmg:4.5,type:'proj',d:'Niszczycielski cios w pojedynczy cel.'},
];
D.GOD_PASSIVES_T = [
  {k:'p_hp',n:'Boska Witalność',ic:'❤️',d:'+25% maksymalnego HP.'},
  {k:'p_dmg',n:'Domena Mocy',ic:'⚔️',d:'+20% obrażeń.'},
  {k:'p_de',n:'Studnia Energii',ic:'🔷',d:'+30% Boskiej Energii i jej regeneracji.'},
  {k:'p_spd',n:'Nieziemska Lekkość',ic:'💨',d:'+15% szybkości ruchu.'},
  {k:'p_wyzn',n:'Głos Wyznawców',ic:'🙏',d:'Każdy wyznawca daje +2% obrażeń i HP (zamiast +1%).'},
];
// 28 węzłów boskich ulepszeń (generowane w kodzie systemu bogów)

// ---------- MISJE KLANOWE ----------
D.CLAN_MISSIONS = [
  {id:'cm_patrol',n:'Patrol Granic',ic:'🚶',min:1,dur:120,gold:[40,90],xp:30,d:'Patrol wokół wioski.'},
  {id:'cm_hunt',n:'Polowanie',ic:'🏹',min:1,dur:300,gold:[90,180],xp:70,res:1,d:'Polowanie na dzikie bestie.'},
  {id:'cm_escort',n:'Eskorta Karawany',ic:'🐫',min:2,dur:600,gold:[220,420],xp:160,d:'Ochrona kupców w drodze.'},
  {id:'cm_ruins',n:'Wyprawa do Ruin',ic:'🏚️',min:2,dur:900,gold:[300,600],xp:260,rune:0.5,res:2,d:'Przeszukanie starych ruin.'},
  {id:'cm_deep',n:'Zejście w Otchłań',ic:'🕳️',min:3,dur:1800,gold:[700,1400],xp:600,rune:1,res:3,d:'Niebezpieczna misja w głębiny.'},
  {id:'cm_divine',n:'Pielgrzymka Boska',ic:'🔱',min:3,dur:3600,gold:[1500,3000],xp:1400,rune:1,divRes:1,d:'Wyprawa ku śladom bogów.'},
];
// poziomy klanu
D.CLAN_LEVELS = [
  {lvl:1,cap:5, bonus:{},              req:'Start',                        dmg:0,hp:0},
  {lvl:2,cap:6, bonus:{dmg:5},         req:'5 postaci + 5 misji',          need:{units:5,missions:5},   dmg:5,hp:0},
  {lvl:3,cap:8, bonus:{hp:10},         req:'10 postaci + 10 misji',        need:{units:10,missions:10}, dmg:5,hp:10},
  {lvl:4,cap:11,bonus:{facDmg:15},     req:'20 postaci + 20 misji',        need:{units:20,missions:20}, dmg:5,hp:10},
  {lvl:5,cap:16,bonus:{dmg:20,hp:20},  req:'30 postaci + 30 misji',        need:{units:30,missions:30}, dmg:20,hp:20},
];

// ---------- ZADANIA (tablica ogłoszeń + główne) ----------
D.QUEST_TEMPLATES = [
  {id:'q_kill',n:'Oczyść region: {r}',type:'kill',count:[6,14],goldMul:14,xpMul:20,d:'Pokonaj {c} wrogów w regionie {r}.'},
  {id:'q_elite',n:'Zabij elity: {r}',type:'killElite',count:[2,4],goldMul:60,xpMul:70,d:'Pokonaj {c} elitarnych wrogów w {r}.'},
  {id:'q_collect',n:'Zbierz surowce: {res}',type:'collect',count:[3,8],goldMul:25,xpMul:18,d:'Zbierz {c}× {res}.'},
  {id:'q_demon',n:'Łowca demonów',type:'killFac',fac:'demony',count:[5,10],goldMul:30,xpMul:35,d:'Pokonaj {c} demonów.'},
];
D.MAIN_QUESTS = [
  {id:'mq1',n:'Pierwsza krew',d:'Pokonaj 5 wrogów (dowolny region).',type:'kill',count:5,gold:120,xp:80},
  {id:'mq2',n:'Rekrutacja',d:'Zrekrutuj 2 postacie do klanu.',type:'recruit',count:2,gold:200,xp:150},
  {id:'mq3',n:'Moc run',d:'Aktywuj runę u Runologa.',type:'activateRune',count:1,gold:150,xp:120},
  {id:'mq4',n:'Głos frakcji',d:'Osiągnij 100 reputacji swojej frakcji.',type:'rep',count:100,gold:400,xp:300},
  {id:'mq5',n:'Wyzwanie śmiertelnika',d:'Pokonaj boga swojej frakcji w Świątyni.',type:'godSlain',count:1,gold:2000,xp:1500},
  {id:'mq6',n:'Przebudzenie',d:'Dokonaj przemiany w boga.',type:'ascend',count:1,gold:0,xp:0},
  {id:'mq7',n:'Zemsta panteonu',d:'Pokonaj Upadłego Boga w Piekielnej Otchłani.',type:'fallenSlain',count:1,gold:10000,xp:9999},
];

// ---------- EKONOMIA / SKLEP ----------
D.SHOP_STOCK = [
  {t:'potion',id:'pot_hp_s'},{t:'potion',id:'pot_hp_l'},{t:'potion',id:'pot_mp'},
  {t:'potion',id:'pot_spd'},{t:'potion',id:'pot_str'},{t:'potion',id:'pot_def'},
  {t:'item',slot:'weapon',rar:'common',price:80},{t:'item',slot:'chest',rar:'common',price:70},
  {t:'item',slot:'helm',rar:'rare',price:260},{t:'item',slot:'weapon',rar:'rare',price:320},
  {t:'rune',rar:'common',price:150},{t:'rune',rar:'rare',price:450},
];
D.SELL_MUL = 0.4;      // sprzedaż = 40% wartości
D.SMITH_COST = (lvl)=>Math.floor(60*Math.pow(1.6,lvl)); // koszt ulepszenia +1
D.SMITH_RES = (lvl)=>1+Math.floor(lvl/2);

// ---------- SOJUSZE / REPUTACJA ----------
D.REP_LEVELS = [
  {min:0,n:'Obcy',shopDiscount:0},{min:100,n:'Znajomy',shopDiscount:5},{min:300,n:'Przyjaciel',shopDiscount:10},
  {min:700,n:'Zaufany',shopDiscount:15},{min:1500,n:'Bohater Frakcji',shopDiscount:25},
];

// ---------- POZIOMY GRACZA ----------
D.XP_FOR = (lvl)=>Math.floor(62*Math.pow(lvl,1.55));
D.PLAYER_BASE = {hp:240,mana:130,stamina:100,dmg:30,def:6,spd:8.2,crit:5};
D.LEVEL_GAIN = {hp:30,mana:11,dmg:4.4,def:1.2};

// bóg — statystyki
D.GOD_BASE = {hpMul:6, dmgMul:4, de:100, deRegen:2.2};
D.GOD_XP_FOR = (lvl)=>Math.floor(400*Math.pow(lvl,1.7));


// ---------- MODELE POSTACI Z ARKUSZA (Tripo) ----------
D.CHAR_BOXES=[{"x":[-0.34717262744903565,-0.23827352166175841],"z":[0.42291666666666666,0.55],"col":"L"},{"x":[-0.34717262744903565,-0.23827352166175841],"z":[0.3520833333333333,0.42291666666666666],"col":"L"},{"x":[-0.34717262744903565,-0.23827352166175841],"z":[0.27499999999999997,0.3520833333333333],"col":"L"},{"x":[-0.33407275187117713,-0.2742711316261973],"z":[0.1958333333333333,0.27499999999999997],"col":"L"},{"x":[-0.34717262744903565,-0.23827352166175841],"z":[0.12916666666666665,0.1958333333333333],"col":"L"},{"x":[-0.34717262744903565,-0.23827352166175841],"z":[0.052083333333333315,0.12916666666666665],"col":"L"},{"x":[-0.34717262744903565,-0.23827352166175841],"z":[-0.018750000000000017,0.052083333333333315],"col":"L"},{"x":[-0.34717262744903565,-0.23827352166175841],"z":[-0.07708333333333334,-0.018750000000000017],"col":"L"},{"x":[-0.34717262744903565,-0.23827352166175841],"z":[-0.13958333333333334,-0.07708333333333334],"col":"L"},{"x":[-0.3198893831244537,-0.26823626086115837],"z":[-0.2625,-0.13958333333333334],"col":"L"},{"x":[-0.34717262744903565,-0.23827352166175841],"z":[-0.32499999999999996,-0.2625],"col":"L"},{"x":[-0.34717262744903565,-0.23827352166175841],"z":[-0.38541666666666663,-0.32499999999999996],"col":"L"},{"x":[-0.34717262744903565,-0.23827352166175841],"z":[-0.4395833333333333,-0.38541666666666663],"col":"L"},{"x":[-0.34717262744903565,-0.23827352166175841],"z":[-0.55,-0.4395833333333333],"col":"L"},{"x":[0.020966785848140716,0.10834845632314682],"z":[0.3728012692928314,0.4583972144126892],"col":"M"},{"x":[0.020994941756129266,0.12525336718559266],"z":[0.26055380757898094,0.32225196305662396],"col":"M"},{"x":[0.020994941756129266,0.12525336718559266],"z":[0.1577235484495759,0.23422926124185323],"col":"M"},{"x":[0.021635825634002685,0.11035157471895218],"z":[-0.0010131789557635785,0.1082610833644867],"col":"M"},{"x":[0.02123298391699791,0.10741150856018067],"z":[-0.12511538445949555,-0.015247355103492736],"col":"M"},{"x":[0.021308763936161997,0.1264795390367508],"z":[-0.21908090269813935,-0.16205646035571897],"col":"M"},{"x":[0.021308763936161997,0.1264795390367508],"z":[-0.3297998929396272,-0.27568910823514065],"col":"M"},{"x":[0.022042003348469733,0.10838959842920304],"z":[-0.4615730094909668,-0.36045443534851074],"col":"M"},{"x":[0.2587298107147217,0.34217262744903565],"z":[0.3603395175933838,0.4525427567958832],"col":"R"},{"x":[0.2582688879966736,0.3365845727920532],"z":[0.2315470975637436,0.3310694146156311],"col":"R"},{"x":[0.2597329866886139,0.3413247513771057],"z":[0.10005764186382293,0.19877651810646058],"col":"R"},{"x":[0.25950327038764953,0.3360113847255707],"z":[-0.0501844148337841,0.05903148755431175],"col":"R"},{"x":[0.2581675899028778,0.33565152168273926],"z":[-0.16626209497451783,-0.07438268035650253],"col":"R"},{"x":[0.25995465636253356,0.34146640181541443],"z":[-0.3153235960006714,-0.21247447550296783],"col":"R"},{"x":[0.25965606689453125,0.3363846290111542],"z":[-0.45136136293411255,-0.34654989361763],"col":"R"}];
D.FAC_CHARS={ // arkusz zawiera TYLKO Cień i Asasynów (od użytkownika)
  cien:  {list:[0,1,2,4,5,6,7,8,10,11,12,13], hero:5},
  ninja: {list:[14,15,17,18,19,20,21,22,23,24,26], hero:17},
};
// ---------- POMOCNICZE ----------
D.rnd=(a,b)=>a+Math.random()*(b-a);
D.rndi=(a,b)=>Math.floor(D.rnd(a,b+1));
D.pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
D.chance=(p)=>Math.random()<p;
D.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
D.fmt=(n)=>{n=Math.floor(n);return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e4?(n/1e3).toFixed(1)+'k':''+n;};
D.now=()=>Date.now();

// generator przedmiotu
D.makeItem = function(slot, rar, lvl, fac){
  lvl=lvl||1; const R=D.RARITY[rar];
  const isW = slot==='weapon';
  const facKey = fac||D.pick(D.PLAYABLE);
  const wt = D.WEAPON_TYPES[facKey];
  const sm = D.SLOT_META[slot];
  const base = isW? (18+lvl*4.5) : (8+lvl*2.6);
  const val = Math.round(base*R.mul*D.rnd(0.85,1.15));
  const name = D.pick(D.ITEM_PREFIX[rar])+' '+(isW? wt.n : sm.n);
  const it = {uid:'i'+(Math.random()*1e9|0), n:name, slot:slot, rar:rar, ic:isW?wt.ic:sm.ic, lvl:lvl, fac:facKey, up:0};
  if(isW) it.dmg=val; else it.def=val;
  // afiksy
  const aff=[]; const nAff = R.ord>=2 ? (R.ord-1) : (R.ord>=1&&D.chance(0.5)?1:0);
  const pool=[['crit','+{v}% kryt.',2,7],['spd','+{v}% szybkość',3,8],['hp','+{v} HP',20,90],['mana','+{v} many',15,70],['leech','{v}% wampiryzm',2,6],['def','+{v} obrona',5,25]];
  for(let i=0;i<nAff;i++){const a=D.pick(pool); const v=Math.round(D.rnd(a[2],a[3])*(1+R.ord*0.3)); aff.push({k:a[0],v:v,txt:a[1].replace('{v}',v)});}
  it.aff=aff;
  // części zestawów frakcyjnych (epic+, 22% szans)
  if(R.ord>=2&&D.chance(0.22)&&D.SETS[facKey]&&slot!=='ring'&&slot!=='amulet'){
    it.set=facKey;it.n=D.SETS[facKey].n+': '+(isW?wt.n:sm.n);
  }
  it.price=Math.round(val*(6+R.ord*8));
  return it;
};
// generator runy
D.makeRune = function(cat, rar){
  cat=cat||D.pick(Object.keys(D.RUNE_CATS)); rar=rar||'common';
  const c=D.RUNE_CATS[cat];
  return {uid:'r'+(Math.random()*1e9|0), t:'rune', cat:cat, rar:rar, n:c.n, ic:c.ic, active:false, spell:null, up:0};
};
// aktywacja runy => losowe zaklęcie z kategorii
D.rollSpell = function(rune){
  const pool=D.SPELLS[rune.cat]||D.SPELLS.cien;
  const sp=D.pick(pool);
  return Object.assign({}, sp, {rar:rune.rar});
};
// skala zaklęcia wg rzadkości runy i ulepszeń
D.spellPower = (rune)=> D.RARITY[rune.rar].mul * (1+ (rune.up||0)*0.15);

// ---------- PIECZĘCIE PRZYWOŁANIA BOGÓW ----------
D.SEALS={};
Object.keys(D.GODS).forEach(gk=>{
  const g=D.GODS[gk];
  D.SEALS[gk]={id:'seal_'+gk,god:gk,n:'Pieczęć: '+g.name,t:'seal',
    cost:{gold:1200,res:3},d:'Przywołuje '+g.name+' do walki. Pokonaj własnego boga = przemiana. Obcego = potężny łup!'};
});
// relikty bogów (łup za pokonanie OBCEGO boga)
D.GOD_RELICS={
  shadow:  [{n:'Całun Cienia',slot:'chest',ic:'▓',def:180,fx:'shadow_veil',fxd:'Po zabójstwie: niewidzialność 2 s'},
            {n:'Kosa Zmierzchu',slot:'weapon',ic:'▓',dmg:210,fx:'reap',fxd:'+30% obrażeń wobec wrogów <30% HP'}],
  monk:    [{n:'Paciorki Pustki',slot:'amulet',ic:'▓',def:60,fx:'void_calm',fxd:'Regeneracja many +80%'},
            {n:'Pięści Równowagi',slot:'gloves',ic:'▓',def:120,fx:'balance_fist',fxd:'Ataki leczą 3% maks. HP'}],
  wraith:  [{n:'Płaszcz Widma',slot:'chest',ic:'▓',def:160,fx:'phase',fxd:'15% szans na unik każdego ataku'},
            {n:'Kły Nocy',slot:'weapon',ic:'▓',dmg:190,fx:'nightfangs',fxd:'Krytyki zadają dodatkowe 50% jako DOT'}],
  beast:   [{n:'Serce Bestii',slot:'amulet',ic:'▓',def:80,fx:'beast_heart',fxd:'+25% maks. HP'},
            {n:'Łapa Otchłani',slot:'weapon',ic:'▓',dmg:200,fx:'maul',fxd:'Ataki odrzucają wrogów'}],
  devourer:[{n:'Oko Run',slot:'helm',ic:'▓',def:140,fx:'rune_eye',fxd:'Zaklęcia kosztują 25% mniej many'},
            {n:'Trzewia Chaosu',slot:'chest',ic:'▓',def:170,fx:'chaos_gut',fxd:'10% szans na darmowe zaklęcie'}],
  knight:  [{n:'Pancerz Popiołów',slot:'chest',ic:'▓',def:220,fx:'ash_plate',fxd:'-20% otrzymywanych obrażeń'},
            {n:'Ostrze Krucjaty',slot:'weapon',ic:'▓',dmg:230,fx:'crusade',fxd:'+20% obrażeń, ataki palą wrogów'}],
  thief:   [{n:'Welon Snów',slot:'helm',ic:'▓',def:130,fx:'dream_veil',fxd:'Wrogowie czasem atakują iluzję (10%)'},
            {n:'Srebrna Waga',slot:'amulet',ic:'▓',def:70,fx:'soul_scale',fxd:'+15% złota i XP'}],
  fallen:  [{n:'Korona Otchłani',slot:'helm',ic:'▓',def:260,fx:'abyss_crown',fxd:'+30% obrażeń, demony tier 1-2 neutralne'},
            {n:'Serce Upadłego',slot:'amulet',ic:'▓',def:120,fx:'fallen_heart',fxd:'+40% HP, aura strachu (wrogowie wolniejsi)'}],
};
// zestawy frakcyjne (2/3 części = bonusy)
D.SETS={
  cien:{n:'Zestaw Mroku',b2:'+10% obrażeń',b3:'Przywołania +50% mocy',s2:{dmg:10},s3:{summon:50}},
  pustka:{n:'Zestaw Równowagi',b2:'+15% many',b3:'Leczenie +40%',s2:{mana:15},s3:{heal:40}},
  ninja:{n:'Zestaw Nocy',b2:'+8% kryt.',b3:'Uniki +10%',s2:{crit:8},s3:{dodge:10}},
  bestie:{n:'Zestaw Dziczy',b2:'+12% HP',b3:'Odrzucenie przy trafieniu',s2:{hp:12},s3:{knock:1}},
  chaos:{n:'Zestaw Entropii',b2:'+10% mocy zaklęć',b3:'-20% cooldownów',s2:{spell:10},s3:{cdr:20}},
  popiol:{n:'Zestaw Żaru',b2:'+15 obrony',b3:'Aura ognia',s2:{def:15},s3:{burn:1}},
  sen:{n:'Zestaw Miraży',b2:'+10% XP',b3:'Sobowtór przy niskim HP',s2:{xp:10},s3:{decoy:1}},
};
// konsumpcyjne nowe
D.CONSUMABLES=[
  {id:'bomba',n:'Bomba Runiczna',kind:'bomb',dmg:3.0,r:5,price:120,d:'Rzuca bombę: potężne obrażenia obszarowe.'},
  {id:'zwoj_tp',n:'Zwój Powrotu',kind:'tp',price:60,d:'Natychmiast wraca do wioski.'},
  {id:'pioro',n:'Pióro Feniksa',kind:'revive',price:800,d:'Automatyczne wskrzeszenie przy śmierci (50% HP).'},
  {id:'chleb',n:'Chleb Podróżnika',kind:'food',dur:120,price:45,d:'+50% regeneracji HP przez 2 min.'},
  {id:'tom_xp',n:'Tom Wiedzy',kind:'xp',xp:300,price:400,d:'Natychmiast +300 XP.'},
  {id:'elixir_boski',n:'Boski Eliksir',kind:'de',de:50,price:600,d:'+50 Boskiej Energii (tylko bóg).'},
];
// afiksy elit
D.ELITE_AFFIXES=[
  {id:'szybki',n:'Szybki',col:'#7dffc7',spd:1.6},
  {id:'opancerzony',n:'Opancerzony',col:'#9aa6b2',hp:1.8},
  {id:'wampiryczny',n:'Wampiryczny',col:'#ff4d6d',leech:1},
  {id:'wybuchowy',n:'Wybuchowy',col:'#ff7a2b',explode:1},
  {id:'zloty',n:'Złoty',col:'#ffd56b',gold:5},
];
// osiągnięcia
D.ACHIEVEMENTS=[
  {id:'a_kill10',n:'Pierwsza dziesiątka',d:'Pokonaj 10 wrogów',need:s=>s.stats.kills>=10,gold:100},
  {id:'a_kill100',n:'Setka na koncie',d:'Pokonaj 100 wrogów',need:s=>s.stats.kills>=100,gold:500},
  {id:'a_kill500',n:'Machina wojny',d:'Pokonaj 500 wrogów',need:s=>s.stats.kills>=500,gold:2000},
  {id:'a_lvl10',n:'Weteran',d:'Osiągnij poziom 10',need:s=>s.lvl>=10||s.isGod,gold:200},
  {id:'a_lvl25',n:'Mistrz',d:'Osiągnij poziom 25',need:s=>s.lvl>=25||s.isGod,gold:800},
  {id:'a_clan5',n:'Przywódca',d:'Zbierz 5 postaci w klanie',need:s=>s.stats.recruited>=5,gold:300},
  {id:'a_runes5',n:'Runoznawca',d:'Aktywuj 5 run',need:s=>s.stats.runesActivated>=5,gold:250},
  {id:'a_boss3',n:'Pogromca',d:'Pokonaj 3 bossów',need:s=>s.stats.bossKills>=3,gold:600},
  {id:'a_god',n:'Boskość',d:'Zostań bogiem',need:s=>s.isGod,gold:3000},
  {id:'a_trophy3',n:'Kolekcjoner',d:'Zdobądź 3 trofea bogów',need:s=>Object.keys(s.godTrophies||{}).length>=3,gold:2500},
  {id:'a_fallen',n:'Zbawca światów',d:'Pokonaj Upadłego Boga',need:s=>s.fallenSlain,gold:10000},
  {id:'a_gold10k',n:'Bogacz',d:'Zbierz 10 000 złota',need:s=>s.gold>=10000,gold:1000},
  {id:'a_arena10',n:'Gladiator',d:'Przetrwaj 10 fal na Arenie',need:s=>(s.arenaBest||0)>=10,gold:1500},
];
