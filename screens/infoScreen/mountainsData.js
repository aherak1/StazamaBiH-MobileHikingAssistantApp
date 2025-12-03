export const mountainsData = [
  {
    id: 1,
    name: 'Čvrsnica',
    area: 200,
    altitude: '2228',
    image: require('../../assets/images/cvrsnica.jpg'),
    trails: 10,
    description: 'Čvrsnica je jedna od najviših i najimpozantnijih planina u Hercegovini, poznata po spektakularnim kanjonima, vidikovcima i bogatoj flori i fauni. Jedan od njenih najpoznatijih dijelova je Hajdučka vrata, prirodni kameni luk koji privlači brojne posjetitelje.',
    accommodation: [
      'Planinarski dom Blidinje',
      'Eko-selo Risovac',
      'Motel Hajdučke Vrleti',
    ],
    dangers: [
      'Strme litice i kanjoni',
      'Nagla promjena vremena',
      'Teško prohodni tereni za početnike',
    ],
    facilities: [
      'Planinarske staze',
      'Vidikovci',
      'Odmorišta',
      'Prirodni izvori vode',
    ]
 },
 { 
    id: 2,
    name: 'Prenj',
    altitude: '2155 ',
    trails: 4,
    area: 500,
    image: require('../../assets/images/prenj.jpg'),
    description: 'Prenj se često naziva "hercegovačkim Himalajima" zbog svojih oštrih vrhova i zadivljujuće ljepote. Planina je raj za planinare i avanturiste te nudi brojne izazovne staze. Bogatstvo flore i faune čini Prenj nezaobilaznim za ljubitelje prirode.',
    accommodation: [
      'Planinarski dom Rujište',
      'Apartmani u blizini Mostara',
    ],
    dangers: [
      'Zahtjevni tereni',
      'Mogućnost odrona',
      'Nedostatak izvora vode na pojedinim stazama',
    ],
    facilities: [
      'Planinarske staze',
      'Odmorišta',
      'Izletišta',
    ]
  },
  {
    id: 3,
    name: 'Bjelašnica',
    altitude: '2067 ',
    area: 160,
    image: require('../../assets/images/bjelasnica.jpg'),
    trails: 28,
    description: 'Bjelašnica je najviša olimpijska planina u okolini Sarajeva, poznata po zahtjevnim ski stazama. Nudi spektakularne poglede na okolinu i bogatu kulturno-historijsku baštinu. Zimi je raj za skijaše, dok je ljeti idealna za planinarenje i istraživanje prirode. Svojom visinom i zahtjevnim terenima privlači avanturiste i profesionalne sportiste.',
    accommodation: [
      'Hotel Bjelašnica',
      'Apartmani Green',
      'Planinarski dom',
      'Hotel Han',
    ],
    dangers: [
      'Jake bure i vjetrovi',
      'Nagla promjena vremena',
      'Zahtjevne ski staze',
      'Mogućnost snježnih lavina',
    ],
    facilities: [
      'Ski liftovi',
      'Gondola',
      'Restorani',
      'Ski škola',
      'Rent-a-ski oprema',
    ]
  },
  {
    id: 4,
    name: 'Vlašić',
    altitude: '1943 ',
    trails: 28,
    area: 150,
    image: require('../../assets/images/vlasic.jpg'),
    description: 'Vlašić je poznata po svojoj prirodnoj ljepoti, čistom zraku i siru travničkom kajmaku. Ova planina je idealna za zimske sportove, a ljeti nudi brojne pješačke staze. Vlašić je popularno turističko odredište zbog svoje pristupačnosti i bogatih sadržaja.',
    accommodation: [
      'Hotel Blanca',
      'Vikendice na Babanovcu',
      'Apartmani Vlašić',
    ],
    dangers: [
      'Strmi tereni',
      'Moguće odrone kamenja',
      'Promjenjivi vremenski uslovi',
    ],
    facilities: [
      'Ski liftovi',
      'Planinarske staze',
      'Restorani',
      'Sportovi na otvorenom',
    ]
  },
  {
    id: 5,
    name: 'Trebević',
    altitude: '1627 ',
    trails: 28,
    area: 100,
    image: require('../../assets/images/trebevic.jpg'),
    description: 'Trebević je simbol Sarajeva i omiljeno izletište stanovnika glavnog grada. Poznat je po žičari koja nudi panoramski pogled na Sarajevo. Planina ima bogatu povijest i nudi raznolike aktivnosti poput planinarenja, biciklizma i istraživanja prirode.',
    accommodation: [
      'Hotel Pino Nature',
      'Planinarski dom Trebević',
    ],
    dangers: [
      'Gusta šuma može otežati navigaciju',
      'Ostaci vojnih objekata',
      'Magloviti uvjeti',
    ],
    facilities: [
      'Žičara',
      'Planinarske staze',
      'Izletišta',
      'Restorani',
    ]
  },
  {
    id: 6,
    name: 'Maglić',
    altitude: '2386 ',
    trails: 2,
    area: 100,
    image: require('../../assets/images/maglic.jpg'),
    description: 'Maglić je najviša planina u Bosni i Hercegovini, smještena na granici sa Crnom Gorom. Poznata je po divljoj prirodi i Nacionalnom parku Sutjeska. Penjanje na Maglić je izazov za iskusne planinare, a pogled s vrha je spektakularan.',
    accommodation: [
      'Planinarski dom Prijevor',
      'Kampovi u Nacionalnom parku Sutjeska',
    ],
    dangers: [
      'Zahtjevni usponi',
      'Opasnost od odrona',
      'Nagla promjena vremena',
    ],
    facilities: [
      'Planinarske staze',
      'Vodopadi',
      'Prirodni rezervati',
    ]
  },
  {
    id: 7,
    name: 'Jahorina',
    altitude: '1916 ',
    image: require('../../assets/images/jahorina.jpg'),
    trails: 25,
    area: 150,
    description: 'Jahorina je olimpijska planina poznata po ski centru i prekrasnoj prirodi. Osim zimskih sportova, ljeti nudi brojne biciklističke i planinarske staze. Planina je omiljena destinacija za porodice i avanturiste. Jahorina ima bogatu povijest kao dio Zimskih olimpijskih igara 1984. godine.',
    accommodation: [
      'Hotel Termag',
      'Hotel Bistrica',
      'Apartmani Vučko',
      'Mountain Resort',
    ],
    dangers: [
      'Jake zimske oluje',
      'Snježne lavine u zimskom periodu',
      'Strme padine na pojedinim stazama',
      'Magla koja se brzo formira',
    ],
    facilities: [
      'Ski liftovi',
      'Ski škola',
      'Restorani na stazi',
      'Rent-a-ski oprema',
    ]
  },
  {
    id: 8,
    name: 'Cincar',
    altitude: '2006 ',
    image: require('../../assets/images/cincar.jpg'),
    trails: 7,
    area: 180,
    description: 'Cincar je planina smještena u zapadnom dijelu Bosne i Hercegovine, poznata po prostranim pašnjacima i netaknutoj prirodi. Poznata je i po migracijama divljih konja koji su simbol ove planine. Ovdje možete uživati u šetnjama i biciklističkim turama.',
    accommodation: [
      'Planinarski dom Cincar',
      'Eko selo Orlovača',
      'Kampovi na obroncima',
    ],
    dangers: [
      'Jake vjetrovite zone',
      'Neobilježene staze',
      'Mogućnost susreta s divljim životinjama',
    ],
    facilities: [
      'Planinarske staze',
      'Vidikovci',
      'Tradicionalni restoran',
    ]
  },
  {
    id: 9,
    name: 'Velež',
    altitude: '1969 ',
    image: require('../../assets/images/velez.jpg'),
    trails: 6,
    area: 90,
    description: 'Velež je planina smještena u Hercegovini, nedaleko od Mostara. Poznata je po strmim liticama i prekrasnim vidikovcima na dolinu Neretve. Na planini se nalazi mnogo arheoloških nalazišta i ostataka iz prošlih epoha.',
    accommodation: [
      'Planinarski dom Podveležje',
      'Motel Mostar',
    ],
    dangers: [
      'Strme staze',
      'Mogućnost klizanja na kamenitim površinama',
      'Ograničen pristup tokom zime',
    ],
    facilities: [
      'Planinarske staze',
      'Izletišta',
      'Vodeni izvori',
    ]
  },
  {
    id: 10,
    name: 'Ozren',
    altitude: '918 ',
    image: require('../../assets/images/ozren.jpg'),
    trails: 12,
    area: 150,
    description: 'Ozren je pitoma planina u sjevernom dijelu Bosne i Hercegovine, idealna za rekreativne aktivnosti i planinarenje. Poznata je po bogatoj šumi i ljekovitim izvorima, posebno banji u Kiseljaku. Ima i kulturno-istorijske znamenitosti.',
    accommodation: [
      'Banjsko lječilište Kiseljak',
      'Planinarski dom Ozren',
    ],
    dangers: [
      'Klizave staze tokom kišnih dana',
      'Gusta šuma može otežati orijentaciju',
    ],
    facilities: [
      'Izvori ljekovite vode',
      'Planinarske staze',
      'Izletišta s klupama',
    ]
  },
  {
    id: 11,
    name: 'Manjača',
    altitude: '1236 ',
    image: require('../../assets/images/manjaca.jpg'),
    trails: 9,
    area: 150,
    description: 'Manjača je planina u blizini Banja Luke, poznata po velikim visoravnima i pašnjacima. Koristi se i za vojne vježbe, ali je popularna među lokalnim planinarima zbog svojih blagih staza i prirodnih ljepota.',
    accommodation: [
      'Planinarski dom Manjača',
      'Etno selo Manjača',
    ],
    dangers: [
      'Vojne zone s ograničenim pristupom',
      'Jake vjetrovite zone na vrhovima',
    ],
    facilities: [
      'Planinarske staze',
      'Tradicionalni restorani',
      'Vidikovci',
    ]
  },
 {
    id: 12,
    name: 'Igman',
    altitude: '1502 ',
    image: require('../../assets/images/igman.jpg'),
    trails: 15,
    area: 150,
    description: 'Igman je olimpijska planina poznata po skakaonicama i brojnim planinarskim stazama. Planina ima bogatu floru i faunu te je idealna za rekreaciju i opuštanje. Tokom Zimskih olimpijskih igara 1984. bila je domaćin biatlona i nordijskog skijanja. Ljeti je popularna destinacija za bicikliste i planinare.',
    accommodation: [
      'Hotel Igman',
      'Planinarski dom Veliko Polje',
      'Apartmani Malo Polje',
    ],
    dangers: [
      'Neobilježene vojne lokacije',
      'Strmi tereni na pojedinim stazama',
      'Gusta magla u jutarnjim satima',
    ],
    facilities: [
      'Planinarske staze',
      'Olimpijske skakaonice',
      'Skijaški tereni',
      'Parking prostor',
    ]
  },
 {
    id: 13,
    name: 'Grmeč',
    altitude: '1954 ',
    image: require('../../assets/images/grmec.jpg'),
    trails: 8,
    area: 210,
    description: 'Grmeč je planina smještena u središnjem dijelu Bosne i Hercegovine, poznata po divljim i netaknutim predjelima. Sa svojim visokim vrhovima i dubokim šumama, Grmeč je idealno odredište za ljubitelje prirode i planinarenja.',
    accommodation: [
      'Planinarski dom Grmeč',
      'Eko kamp Grmeč',
    ],
    dangers: [
      'Neobilježene staze',
      'Moguće susrete sa divljim životinjama',
      'Zimski uvjeti mogu otežati pristup',
    ],
    facilities: [
      'Planinarske staze',
      'Vidikovci',
      'Šumske staze za bicikliste',
    ]
  },
  {
    id: 14,
    name: 'Ivan planina',
    altitude: '1700 ',
    image: require('../../assets/images/ivan_planina.jpg'),
    trails: 6,
    area: 150,
    description: 'Ivan planina je planina smještena u istočnom dijelu Bosne i Hercegovine, poznata po blagim padinama i velikim pašnjacima. Idealna je za planinarenje i duže šetnje, a zimi se koristi za skijanje i zimske sportove.',
    accommodation: [
      'Planinarski dom Ivan Planina',
      'Bungalovi na Ivan planini',
    ],
    dangers: [
      'Moguće lavine u zimskim uvjetima',
      'Moguće magle u večernjim satima',
    ],
    facilities: [
      'Ski liftovi',
      'Planinarske staze',
      'Zimski kampovi',
    ]
  },
  {
    id: 15,
    name: 'Treskavica',
    altitude: '2088 ',
    image: require('../../assets/images/treskavica.jpg'),
    trails: 12,
    area: 150,
    description: 'Treskavica je visoka planina smještena jugoistočno od Sarajeva, poznata po svojih 2088 metara visine. Planina je prepoznatljiva po čistim jezerima, travnatim predjelima i šumama, te brojnim planiranim stazama.',
    accommodation: [
      'Planinarski dom Treskavica',
      'Etno selo Treskavica',
    ],
    dangers: [
      'Neobilježene staze',
      'Strmi padovi',
      'Zimske oluje',
    ],
    facilities: [
      'Planinarske staze',
      'Izletišta',
      'Kampovi',
    ]
  },
  {
    id: 16,
    name: 'Vitorog',
    altitude: '1510 ',
    image: require('../../assets/images/vitorog.jpg'),
    trails: 5,
    area: 150,
    description: 'Vitorog je planina u jugoistočnom dijelu Bosne i Hercegovine, poznata po blagim padinama i malim planinskim jezerima. Vitorog je idealno odredište za jednodnevne izlete i ljubitelje mirne prirode.',
    accommodation: [
      'Planinarski dom Vitorog',
      'Kamp na Vitorogu',
    ],
    dangers: [
      'Klizave staze nakon kiše',
      'Ograničen pristup tokom zime',
    ],
    facilities: [
      'Planinarske staze',
      'Vidikovci',
      'Izvori pitke vode',
    ]
  },
  {
    id: 17,
    name: 'Stožer',
    altitude: '1656 ',
    image: require('../../assets/images/stozer.jpg'),
    trails: 7,
    area: 150,
    description: 'Stožer je planina smještena u jugozapadnom dijelu Bosne i Hercegovine. Poznata je po svojoj strateškoj važnosti i borbenoj povijesti, ali i prelijepim šumama i visoravnima koje su pogodne za planinarenje.',
    accommodation: [
      'Planinarski dom Stožer',
      'Smeštaj u okolnim selima',
    ],
    dangers: [
      'Težak pristup u zimskoj sezoni',
      'Moguće susrete s divljim životinjama',
    ],
    facilities: [
      'Planinarske staze',
      'Izletišta',
      'Vodeni izvori',
    ]
  },
  {
    id: 18,
    name: 'Romanija',
    altitude: '1656 ',
    image: require('../../assets/images/romanija.jpg'),
    trails: 9,
    area: 150,
    description: 'Romanija je planina koja se prostire na istočnom dijelu Bosne i Hercegovine. Poznata je po prirodnim ljepotama, prelijepim šumama i mnogim jezerima. Idealna je za planinarenje, biciklizam i lov.',
    accommodation: [
      'Planinarski dom Romanija',
      'Eko selo Romanija',
    ],
    dangers: [
      'Strme staze',
      'Moguće lavine u zimskom periodu',
    ],
    facilities: [
      'Planinarske staze',
      'Vidikovci',
      'Biciklističke staze',
    ]
  }

];
