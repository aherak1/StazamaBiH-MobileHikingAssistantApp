export const routesData = {
  'trebević': [
    {
      id: '1',
      naziv: 'Ravne - Dobra Voda',
      lokacija: 'Trebević',
      tip: 'Pješačke staze',
      tezina: 'Srednja',
      udaljenost: '10km',
      uspon: 'do 500m',
      trajanje: '1-2h',
      koordinate: {
        start: { latitude: 43.8475, longitude: 18.4269 }, // Ravne (prigušeni položaj)
        end: { latitude: 43.8328, longitude: 18.4583 }    // Dobra Voda (pomereno bliže drugim stazama)
      },
      opis: 'Prekrasna staza sa fantastičnim pogledima na okolne planine. Ova ruta prolazi kroz guste šume i nudi brojne prilike za fotografisanje. Idealna je za ljubitelje prirode i rekreativce srednje kondicije. Na kraju staze nalazi se vidikovac koji pruža spektakularan pogled.',
      sigurnosneNapomene: {
        obaveznaOprema: [
          'Čvrste planinarske cipele',
          'Najmanje 2L vode po osobi',
          'GPS uređaj ili mapa'
        ],
        preporuke: [
          'Početak šetnje prije 10h',
          'Pratite oznake staze',
          'Obavijestite nekog o planu puta'
        ],
        upozorenja: [
          'Klizišta tokom kišnog perioda',
          'Ograničena mobilna signalizacija',
          'Divlje životinje u području'
        ]
      },
      slike: [
        require('../assets/treb2.jpg'),
        require('../assets/treb4.jpg'),
        require('../assets/treb6.jpg')
      ],
      komentari: [
        { id: '1', korisnik: 'Korisnik1', tekst: 'Odlična staza!', rating: 4, timestamp: '2025-01-01 10:00:00' },
        { id: '2', korisnik: 'Korisnik2', tekst: 'Predivni pogledi.', rating: 3,timestamp: '2025-01-02 11:15:00' },
        { id: '3', korisnik: 'Korisnik3', tekst: 'Vratit ću se opet!', rating: 3, timestamp: '2025-01-03 12:30:00' },
        { id: '4', korisnik: 'Korisnik4', tekst: 'Dosta zahtjevno, ali vrijedno truda.', rating: 5, timestamp: '2025-01-04 14:45:00' }
      ],
    },
    {
      id: '2',
      naziv: 'Vratnik - Sedlo - Pištalina',
      tip: 'Biciklističke staze',
      lokacija: 'Trebević',
      tezina: 'Lahka',
      udaljenost: '8km',
      uspon: '500m-1000m',
      trajanje: '2-4h',
      koordinate: {
        start: { latitude: 43.862500, longitude: 18.431944 },
        end: { latitude: 43.841667, longitude: 18.481944 }
      },
      opis: 'Opis staze 2...',
      sigurnosneNapomene: {
        obaveznaOprema: [
          'Full-face kaciga',
          'Zaštitni štitnici za koljena i laktove',
          'Kočioni sistem za disk kocnice',
          'Rezervna unutrašnjica'
        ],
        preporuke: [
          'Servisirati bicikl prije vožnje',
          'Vozite samo u dnevnom svjetlu',
          'Odmah prestati s vožnjom prije prvih znakova umora'
        ],
        upozorenja: [
          'Strmi padovi do 45° nagiba',
          'Kameniti teren sa oštrim izbočinama',
          'Mogućnost susreta sa motorima na dijelovima staze'
        ]
      },
      slike: [
        require('../assets/treb1.jpg'),
        require('../assets/treb9.jpg'),
        require('../assets/treb8.jpg')
      ],
      komentari: [
        { id: '1', korisnik: 'Korisnik1', tekst: 'Super staza za bicikliste!', rating: 4, timestamp: '2025-01-01 10:00:00' },
        { id: '2', korisnik: 'Korisnik2', tekst: 'Uživao sam u vožnji.', rating:4, timestamp: '2025-01-02 11:15:00' },
        { id: '3', korisnik: 'Korisnik3', tekst: 'Preporučujem svima.', rating: 4, timestamp: '2025-01-03 12:30:00' },
        { id: '4', korisnik: 'Korisnik4', tekst: 'Odlična ruta za rekreaciju.', rating: 4, timestamp: '2025-01-04 14:45:00' }
      ],
    },
    {
      id: '3',
      naziv: 'Jekovac - Pištaline',
      lokacija: 'Trebević',
      tip: 'Pješačke staze',
      tezina: 'Teška',
      udaljenost: '15km',
      trajanje: '5h',
      uspon: 'do 500m',
      koordinate: {
        start: { latitude: 43.8186, longitude: 18.4458 }, // Jekovac (pomereno za logičniji raspored)
        end: { latitude: 43.8250, longitude: 18.4825 }     // Pištalina (isti kao gornji kraj)
      },
      opis: 'Za iskusne planinare.Izazovna staza kroz gustu šumu sa strmim usponima.',
      sigurnosneNapomene: {
        obaveznaOprema: [
          'Via ferrata set (pojas + karabineri)',
          'Zaštitna kaciga',
          'Alpinističke rukavice',
          'Prva pomoć kit sa tourniquet-om'
        ],
        preporuke: [
          'Penjanje samo u parovima',
          'Provjerite čvrstoću fiksnih užadi prije korištenja',
          'Ograničite težinu ruksaka na max 8kg'
        ],
        upozorenja: [
          'Visina iznad 1500m n/m - rizik od visinske bolesti',
          'Metalni elementi mogu biti vrući pri visokim temperaturama',
          'Apsolutna zabrana penjanja pri brzini vjetra preko 60km/h'
        ]
      },
      slike: [
        require('../assets/treb3.jpg'),
        require('../assets/treb9.jpg'),
        require('../assets/treb10.jpg')
      ],
      komentari: [
        { id: '1', korisnik: 'Korisnik1', tekst: 'Zahtjevna staza, ali prelijepa.', rating: 4, timestamp: '2025-01-01 10:00:00' },
        { id: '2', korisnik: 'Korisnik2', tekst: 'Izazovna, ali nagrada su pogledi s vrha.', rating: 5, timestamp: '2025-01-02 11:15:00' },
        { id: '3', korisnik: 'Korisnik3', tekst: 'Odlična za iskusne planinare.', rating: 3, timestamp: '2025-01-03 12:30:00' },
        { id: '4', korisnik: 'Korisnik4', tekst: 'Fantastičan doživljaj.', rating: 4, timestamp: '2025-01-04 14:45:00' }
      ],
    },
    {
      id: '4',
      naziv: 'Bobslej staza - Vidikovac - Brus',
      lokacija: 'Trebević',
      tip: 'Snježne staze',
      tezina: 'Srednja',
      udaljenost: '12km',
      trajanje: '4h',
      uspon: 'do 400m',
      koordinate: {
        start: { latitude: 43.856259, longitude: 18.413076 },
        end: { latitude: 43.843611, longitude: 18.472222 }
      },
      opis: 'Odlična zimska avantura.',
      sigurnosneNapomene: {
        obaveznaOprema: [
          'Termo odjeća sa više slojeva',
          'Svjetiljka sa rezervnim baterijama',
          'Avalanški transceiver',
          'Snježne raketice'
        ],
        preporuke: [
          'Provjerite vremensku prognozu prije polaska',
          'Koristite GPS uređaj sa topografskom kartom',
          'Ponesite visokokalorične grickalice'
        ],
        upozorenja: [
          'Visok rizik od lavina u ovom području',
          'Temperatura može pasti ispod -20°C noću',
          'Zabranjeno skijanje izvan označenih staza'
        ]
      },
      slike: [
        require('../assets/treb5.jpg'),
        require('../assets/treb4.jpg'),
        require('../assets/treb9.jpg')
      ],
      komentari: [
        { id: '1', korisnik: 'Korisnik1', tekst: 'Prekrasna zimska staza.', rating: 4, timestamp: '2025-01-01 10:00:00' },
        { id: '2', korisnik: 'Korisnik2', tekst: 'Uživali smo u snijegu.', rating: 3, timestamp: '2025-01-02 11:15:00' },
        { id: '3', korisnik: 'Korisnik3', tekst: 'Preporučujem za zimske avanture.', rating: 4, timestamp: '2025-01-03 12:30:00' },
        { id: '4', korisnik: 'Korisnik4', tekst: 'Odlično održavana staza.', rating: 3, timestamp: '2025-01-04 14:45:00' }
      ],
    },
  ],
  'ozren': [
    {
      id: '1',
      naziv: 'Planinarska staza Ozren',
      tip: 'Plješačke staze',
      lokacija: 'Ozren',
      tezina: 'Lahka',
      udaljenost: '5km',
      uspon: '300m',
      trajanje: '1-2h',
      koordinate: { // DODAJTE OVO
        start: { latitude: 44.6256, longitude: 18.1417 },
        end: { latitude: 44.6200, longitude: 18.1350 }
      },
      opis: 'Lagana planinarska staza sa predivnim pogledima.',
      sigurnosneNapomene: {
        obaveznaOprema: [
          'Čvrste planinarske cipele',
          'Najmanje 2L vode po osobi',
          'GPS uređaj ili mapa'
        ],
        preporuke: [
          'Početak šetnje prije 10h',
          'Pratite oznake staze',
          'Obavijestite nekog o planu puta'
        ],
        upozorenja: [
          'Klizišta tokom kišnog perioda',
          'Ograničena mobilna signalizacija',
          'Divlje životinje u području'
        ]
      },
      slike: [
        require('../assets/bjelasnica.jpg'),
        require('../assets/treb4.jpg'),
        require('../assets/treb6.jpg')
      ],
      komentari: [
        { id: '1', korisnik: 'Korisnik1', tekst: 'Lagana i lijepa staza.', rating: 4, timestamp: '2025-01-01 10:00:00' },
        { id: '2', korisnik: 'Korisnik2', tekst: 'Savršeno za opuštanje.', rating: 4, timestamp: '2025-01-02 11:15:00' },
        { id: '3', korisnik: 'Korisnik3', tekst: 'Uživao sam u svakom koraku.',rating: 4, timestamp: '2025-01-03 12:30:00' },
        { id: '4', korisnik: 'Korisnik4', tekst: 'Odlična staza za početnike.', rating: 4,timestamp: '2025-01-04 14:45:00' }
      ],
    },
    {
      id: '2',
      naziv: 'Zimska staza Ozren',
      tip: 'Snježne staze',
      lokacija: 'Ozren',
      tezina: 'Srednja',
      udaljenost: '7km',
      uspon: '400m',
      trajanje: '2-3h',
      koordinate: {
        start: { latitude: 44.6256, longitude: 18.1417 },
        end: { latitude: 44.6200, longitude: 18.1350 }
      },
      opis: 'Zimska staza za uživanje u snježnim čarolijama.',
      sigurnosneNapomene: {
        obaveznaOprema: [
          'Čvrste planinarske cipele',
          'Najmanje 2L vode po osobi',
          'GPS uređaj ili mapa'
        ],
        preporuke: [
          'Početak šetnje prije 10h',
          'Pratite oznake staze',
          'Obavijestite nekog o planu puta'
        ],
        upozorenja: [
          'Klizišta tokom kišnog perioda',
          'Ograničena mobilna signalizacija',
          'Divlje životinje u području'
        ]
      },
      slike: [
        require('../assets/jahorina.jpg'),
        require('../assets/treb4.jpg'),
        require('../assets/treb6.jpg')
      ],
      komentari: [
        { id: '1', korisnik: 'Korisnik1', tekst: 'Prekrasna zimska staza.', rating: 4, timestamp: '2025-01-01 10:00:00' },
        { id: '2', korisnik: 'Korisnik2', tekst: 'Uživali smo u snijegu.', rating: 4, timestamp: '2025-01-02 11:15:00' },
        { id: '3', korisnik: 'Korisnik3', tekst: 'Preporučujem za zimske avanture.', rating: 4,  timestamp: '2025-01-03 12:30:00' },
        { id: '4', korisnik: 'Korisnik4', tekst: 'Odlično održavana staza.', rating: 4, timestamp: '2025-01-04 14:45:00' }
      ],
    },
  ],
  'jahorina': [
    {
      id: '1',
      naziv: 'Planinarska staza Jahorina',
      lokacija: 'Jahorina',
      tip: 'Pješačke staze',
      tezina: 'Srednja',
      udaljenost: '10km',
      uspon: '600m',
      trajanje: '3-4h',
      koordinate: { // DODAJTE OVO
        start: { latitude: 43.7311, longitude: 18.5697 },
        end: { latitude: 43.7350, longitude: 18.5750 }
      },
      opis: 'Planinarska staza kroz šumske predjele Jahorine.',
      sigurnosneNapomene: {
        obaveznaOprema: [
          'Čvrste planinarske cipele',
          'Najmanje 2L vode po osobi',
          'GPS uređaj ili mapa'
        ],
        preporuke: [
          'Početak šetnje prije 10h',
          'Pratite oznake staze',
          'Obavijestite nekog o planu puta'
        ],
        upozorenja: [
          'Klizišta tokom kišnog perioda',
          'Ograničena mobilna signalizacija',
          'Divlje životinje u području'
        ]
      },
      slike: [
        require('../assets/jahorina.jpg'),
        require('../assets/treb4.jpg'),
        require('../assets/treb6.jpg')
      ],
      komentari: [
        { id: '1', korisnik: 'Korisnik1', tekst: 'Prekrasna staza.', rating: 4, timestamp: '2025-01-01 10:00:00' },
        { id: '2', korisnik: 'Korisnik2', tekst: 'Uživao sam u prirodi.', rating: 4, timestamp: '2025-01-02 11:15:00' },
        { id: '3', korisnik: 'Korisnik3', tekst: 'Odlična za vikend izlet.', rating: 4, timestamp: '2025-01-03 12:30:00' },
        { id: '4', korisnik: 'Korisnik4', tekst: 'Nevjerojatni pogledi.', rating: 4, timestamp: '2025-01-04 14:45:00' }
      ],
    },
    {
      id: '2',
      naziv: 'Zimska staza Jahorina 1',
      lokacija: 'Jahorina',
      tip: 'Snježne staze',
      tezina: 'Teška',
      udaljenost: '8km',
      uspon: '500m',
      trajanje: '2-3h',
      koordinate: {
        start: { latitude: 43.7266, longitude: 18.5726 },
        end: { latitude: 43.7350, longitude: 18.5750 }
      },
      opis: 'Izazovna zimska staza za iskusne planinare.',
      sigurnosneNapomene: {
        obaveznaOprema: [
          'Čvrste planinarske cipele',
          'Najmanje 2L vode po osobi',
          'GPS uređaj ili mapa'
        ],
        preporuke: [
          'Početak šetnje prije 10h',
          'Pratite oznake staze',
          'Obavijestite nekog o planu puta'
        ],
        upozorenja: [
          'Klizišta tokom kišnog perioda',
          'Ograničena mobilna signalizacija',
          'Divlje životinje u području'
        ]
      },
      slike: [
        require('../assets/treb2.jpg'),
        require('../assets/treb4.jpg'),
        require('../assets/treb6.jpg')
      ],
      komentari: [
        { id: '1', korisnik: 'Korisnik1', tekst: 'Izazovna staza.', rating: 4, timestamp: '2025-01-01 10:00:00' },
        { id: '2', korisnik: 'Korisnik2', tekst: 'Za iskusne planinare.', rating: 4, timestamp: '2025-01-02 11:15:00' },
        { id: '3', korisnik: 'Korisnik3', tekst: 'Prekrasna zimi.', rating: 4, timestamp: '2025-01-03 12:30:00' },
        { id: '4', korisnik: 'Korisnik4', tekst: 'Vrijedno truda.', rating: 3, timestamp: '2025-01-04 14:45:00' }
      ],
    },
    {
      id: '3',
      naziv: 'Zimska staza Jahorina 2',
      tip: 'Snježne staze',
      lokacija: 'Jahorina',
      tezina: 'Lahka',
      udaljenost: '6km',
      uspon: '300m',
      trajanje: '1-2h',
      koordinate: {
        start: { latitude: 43.7266, longitude: 18.5726 },
        end: { latitude: 43.7350, longitude: 18.5750 }
      },
      opis: 'Lagana zimska staza idealna za porodične izlete.',
      sigurnosneNapomene: {
        obaveznaOprema: [
          'Čvrste planinarske cipele',
          'Najmanje 2L vode po osobi',
          'GPS uređaj ili mapa'
        ],
        preporuke: [
          'Početak šetnje prije 10h',
          'Pratite oznake staze',
          'Obavijestite nekog o planu puta'
        ],
        upozorenja: [
          'Klizišta tokom kišnog perioda',
          'Ograničena mobilna signalizacija',
          'Divlje životinje u području'
        ]
      },
      slike: [
        require('../assets/treb2.jpg'),
        require('../assets/treb4.jpg'),
        require('../assets/treb6.jpg')
      ],
      komentari: [
        { id: '1', korisnik: 'Korisnik1', tekst: 'Savršena za obitelj.', rating: 4, timestamp: '2025-01-01 10:00:00' },
        { id: '2', korisnik: 'Korisnik2', tekst: 'Lagana i ugodna.', rating: 4, timestamp: '2025-01-02 11:15:00' },
        { id: '3', korisnik: 'Korisnik3', tekst: 'Djeca su uživala.', rating: 4, timestamp: '2025-01-03 12:30:00' },
        { id: '4', korisnik: 'Korisnik4', tekst: 'Preporučujem svima.', rating: 5, timestamp: '2025-01-04 14:45:00' }
      ],
    },
  ],
};