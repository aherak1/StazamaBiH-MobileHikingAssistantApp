const accommodationsData = [
  {
    id: 1,
    name: 'Planinska kuća Jahorina',
    type: 'Kuća',
    price: 150,
    rating: 4.5,
    location: 'Jahorina',
    images: [require('../assets/room/ledena-kraljica.jpg')],
    amenities: ['Wi-Fi', 'Parking', 'Pogled na planinu', 'Obiteljske sobe', 'Spa centar', 'Restoran', 'Bar', 'Fitness-centar', 'Doručak', 'Skijanje', 'Dvorist', 'Kućni ljubimci', 'Igraonice', 'Usluge čisćenja'],
    longDescription: 'Ovaj studio apartman se nalazi u srcu Sarajeva, blizu svih popularnih znamenitosti...',
    contact: 'kontakt@example.com',
    reviews: [
      { username: 'Marko', rating: 5, comment: 'Odličan smještaj!' },
      { username: 'Marija', rating: 4, comment: 'Odličan smještaj!' },
      { username: 'Fatima', rating: 5, comment: 'Odličan smještaj!' },
      { username: 'Johan', rating: 3, comment: 'Dobro!' },
      { username: 'Marko', rating: 5, comment: 'Odličan smještaj!' },
      { username: 'Ana', rating: 4, comment: 'Vrlo prijatno iskustvo.' }
    ],
    availabilityDates: [
      { date: '2025-03-19', status: 'reserved' },
      { date: '2025-03-26', status: 'available' },
    ],
    available: 0,
    reserved: 10,
  },
  {
    id: 2,
    name: 'Hotel Jahorina',
    type: 'Hotel',
    price: 200,
    rating: 4.7,
    location: 'Jahorina',
    comments: 30,
    images: [require('../assets/room/praska-zima.jpg')],
    amenities: ['Wi-Fi', 'Bazen', 'Restoran', 'Bar', 'Spa centar', 'Fitness-centar', 'Doručak', 'Skijanje', 'Dvorist', 'Kućni ljubimci', 'Igraonice', 'Usluge čisćenja'],
    longDescription: 'Hotel Jahorina nudi udobnost i savršen odmor na planini, idealan za ljubitelje skijanja i prirode. Smješten je u neposrednoj blizini ski staza i pruža izvanredan pogled na okolne pejzaže.',
    contact: 'kontakt@example.com',
    reviews: [
      { username: 'Marko', rating: 5, comment: 'Odličan smještaj!' },
      { username: 'Ana', rating: 4, comment: 'Vrlo prijatno iskustvo.' }
    ],
    availabilityDates: [
      { date: '2025-03-19', status: 'available' },
      { date: '2025-04-20', status: 'reserved' }
    ],
    available: 0,
    reserved: 5,
  },
  {
    id: 3,
    name: 'Apartman Jahorina Relax',
    type: 'Apartman',
    price: 170,
    rating: 4.2,
    location: 'Jahorina',
    comments: 20,
    images: [require('../assets/room/limone.jpg')],
    amenities: ['Wi-Fi', 'Parking', 'Obiteljske sobe', 'Dvorist', 'Kućni ljubimci', 'Igraonice'],
    longDescription: 'Apartman Jahorina Relax je moderan i udoban prostor, savršen za obitelji i grupe prijatelja. Nalazi se na mirnoj lokaciji, ali u blizini svih važnih sadržaja na Jahorini.',
    contact: 'kontakt@example.com',
    reviews: [
      { username: 'Marko', rating: 5, comment: 'Odličan smještaj!' },
      { username: 'Ana', rating: 4, comment: 'Vrlo prijatno iskustvo.' }
    ],
    availabilityDates: [
      { date: '2025-03-19', status: 'available' },
      { date: '2025-03-20', status: 'reserved' },
      { date: '2025-03-21', status: 'reserved' },
      { date: '2025-03-22', status: 'reserved' },
      { date: '2025-03-23', status: 'reserved' },
      { date: '2025-03-24', status: 'reserved' },
      { date: '2025-03-25', status: 'reserved' },
      { date: '2025-03-26', status: 'available' },
      { date: '2025-03-22', status: 'reserved' },
      { date: '2025-03-23', status: 'reserved' },
      { date: '2025-03-24', status: 'reserved' }
    ],
    available: 8,
    reserved: 2,
  },
  {
    id: 4,
    name: 'Hotel Igman',
    type: 'Hotel',
    price: 130,
    rating: 4.3,
    location: 'Igman',
    comments: 15,
    images: [require('../assets/room/malak.jpg')],
    amenities: ['Wi-Fi', 'Parking', 'Restoran', 'Bar', 'Spa centar', 'Fitness-centar', 'Doručak', 'Skijanje', 'Dvorist', 'Kućni ljubimci', 'Igraonice', 'Usluge čisćenja'],
    longDescription: 'Hotel Igman je smješten na atraktivnoj planinskoj lokaciji, idealnoj za zimske sportove i rekreaciju. Gosti mogu uživati u toplom ambijentu hotela i jedinstvenim prirodnim ljepotama Igmana.',
    contact: 'kontakt@example.com',
    reviews: [
      { username: 'Marko', rating: 5, comment: 'Odličan smještaj!' },
      { username: 'Ana', rating: 4, comment: 'Vrlo prijatno iskustvo.' }
    ],
    availabilityDates: [
      { date: '2025-03-19', status: 'available' },
      { date: '2025-05-20', status: 'reserved' }
    ],
    available: 12,
    reserved: 4,
  },
  {
    id: 5,
    name: 'Apartman Igman',
    type: 'Apartman',
    price: 160,
    rating: 4.6,
    location: 'Igman',
    comments: 12,
    images: [require('../assets/room/zan.jpg')],
    amenities: ['Wi-Fi', 'Parking', 'Pogled na planinu', 'Obiteljske sobe', 'Dvorist', 'Kućni ljubimci', 'Igraonice'],
    longDescription: 'Apartman Igman pruža savršenu oazu mira i opuštanja, daleko od gradske buke. Nalazi se u blizini ski staza i planinskih staza za šetnju.',
    contact: 'kontakt@example.com',
    reviews: [
      { username: 'Marko', rating: 5, comment: 'Odličan smještaj!' },
      { username: 'Ana', rating: 4, comment: 'Vrlo prijatno iskustvo.' }
    ],
    availabilityDates: [
      { date: '2025-03-19', status: 'available' },
      { date: '2025-04-20', status: 'reserved' }
    ],
    available: 6,
    reserved: 1,
  },
  {
    id: 6,
    name: 'Planinska kuća Igman',
    type: 'Kuća',
    price: 180,
    rating: 4.8,
    location: 'Igman',
    comments: 22,
    images: [require('../assets/room/monti.jpg')],
    amenities: ['Wi-Fi', 'Parking', 'Obiteljske sobe', 'Dvorist', 'Kućni ljubimci', 'Igraonice'],
    longDescription: 'Planinska kuća Igman je autentičan rustikalni smještaj koji pruža toplinu i ugodnost. Smještena je u prirodnom okruženju, savršena za odmor i istraživanje planinskih ljepota.',
    contact: 'kontakt@example.com',
    reviews: [
      { username: 'Marko', rating: 5, comment: 'Odličan smještaj!' },
      { username: 'Ana', rating: 4, comment: 'Vrlo prijatno iskustvo.' }
    ],
    availabilityDates: [
      { date: '2025-01-19', status: 'available' },
      { date: '2025-01-20', status: 'reserved' }
    ],
    available: 10,
    reserved: 3,
  },
  {
    id: 7,
    name: 'Hotel Bjelašnica',
    type: 'Hotel',
    price: 220,
    rating: 4.9,
    location: 'Bjelašnica',
    comments: 40,
    images: [require('../assets/room/han.jpg')],
    amenities: ['Wi-Fi', 'Bazen', 'Restoran', 'Bar', 'Spa centar', 'Fitness-centar', 'Doručak', 'Skijanje', 'Dvorist', 'Kućni ljubimci', 'Igraonice', 'Usluge čisćenja'],
    longDescription: 'Hotel Bjelašnica nudi luksuz i udobnost na jednoj od najpopularnijih planina u regiji. Savršena destinacija za ljubitelje zimskih sportova i planinskih avantura.',
    contact: 'kontakt@example.com',
    reviews: [
      { username: 'Marko', rating: 5, comment: 'Odličan smještaj!' },
      { username: 'Ana', rating: 4, comment: 'Vrlo prijatno iskustvo.' }
    ],
    availabilityDates: [
      { date: '2025-01-19', status: 'available' },
      { date: '2025-01-20', status: 'reserved' }
    ],
    available: 4,
    reserved: 1,
  },
  {
    id: 8,
    name: 'Apartman Bjelašnica',
    type: 'Apartman',
    price: 250,
    rating: 4.7,
    location: 'Bjelašnica',
    comments: 35,
    images: [require('../assets/room/nomad.jpg')],
    amenities: ['Wi-Fi', 'Parking', 'Bazen', 'Obiteljske sobe', 'Dvorist', 'Kućni ljubimci', 'Igraonice'],
    longDescription: 'Apartman Bjelašnica je moderan i prostran smještaj idealan za porodice i grupe. Nalazi se u blizini ski staza i pruža jedinstven doživljaj prirode.',
    contact: 'kontakt@example.com',
    reviews: [
      { username: 'Marko', rating: 5, comment: 'Odličan smještaj!' },
      { username: 'Ana', rating: 4, comment: 'Vrlo prijatno iskustvo.' }
    ],
    availabilityDates: [
      { date: '2025-01-19', status: 'available' },
      { date: '2025-01-20', status: 'reserved' }
    ],
    available: 0,
    reserved: 7,
  },
  {
    id: 9,
    name: 'Planinska kuća Bjelašnica',
    type: 'Kuća',
    price: 200,
    rating: 4.3,
    location: 'Bjelašnica',
    comments: 28,
    images: [require('../assets/room/pahuljica.jpg')],
    amenities: ['Wi-Fi', 'Parking', 'Pogled na planinu', 'Obiteljske sobe', 'Dvorist', 'Kućni ljubimci', 'Igraonice'],
    longDescription: 'Planinska kuća Bjelašnica nudi šarmantan i autentičan smještaj u mirnom okruženju. Idealan izbor za one koji traže bijeg u prirodu i uživanje u planinskom ambijentu.',
    contact: 'kontakt@example.com',
    reviews: [
      { username: 'Marko', rating: 5, comment: 'Odličan smještaj!' },
      { username: 'Ana', rating: 4, comment: 'Vrlo prijatno iskustvo.' }
    ],
    availabilityDates: [
      { date: '2025-01-19', status: 'available' },
      { date: '2025-01-20', status: 'reserved' }
    ],
    available: 0,
    reserved: 3,
  },
];

export default accommodationsData;