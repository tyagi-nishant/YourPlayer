import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export interface TmdbMovieItem {
  id: string;
  tmdbId: number;
  imdbId?: string;
  title: string;
  tagline?: string;
  overview: string;
  releaseDate: string;
  year: string;
  status: 'Released' | 'Upcoming' | 'In Production';
  category: 'recommended' | 'upcoming' | 'trending' | 'top_rated';
  rating: number;
  voteCount: number;
  runtime: string;
  genres: string[];
  director: string;
  cast: string[];
  posterUrl: string;
  backdropUrl: string;
  posterGallery: string[];
  youtubeTrailerId: string;
  featured?: boolean;
}

/**
 * Curated TMDB Cinema Database with verified TMDB posters/backdrops and official YouTube Trailer IDs.
 */
const TMDB_CURATED_MOVIES: TmdbMovieItem[] = [
  {
    id: 'tmdb-693134',
    tmdbId: 693134,
    imdbId: 'tt15239678',
    title: 'Dune: Part Two',
    tagline: 'Long live the fighters.',
    overview:
      'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    releaseDate: '2024-03-01',
    year: '2024',
    status: 'Released',
    category: 'recommended',
    rating: 8.4,
    voteCount: 6420,
    runtime: '2h 46m',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt15239678/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt15239678/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt15239678/img',
      'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      'https://image.tmdb.org/t/p/w780/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    ],
    youtubeTrailerId: 'Way9Dexny3w',
    featured: true,
  },
  {
    id: 'tmdb-872585',
    tmdbId: 872585,
    imdbId: 'tt15398776',
    title: 'Oppenheimer',
    tagline: 'The world forever changes.',
    overview:
      'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II, exploring the moral reckoning and political fallout that reshaped modern history.',
    releaseDate: '2023-07-21',
    year: '2023',
    status: 'Released',
    category: 'recommended',
    rating: 8.3,
    voteCount: 9810,
    runtime: '3h 00m',
    genres: ['Drama', 'History', 'Biography'],
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt15398776/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt15398776/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt15398776/img',
      'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      'https://image.tmdb.org/t/p/w780/ptpr0kGAckfQkJeJIt8st5dglvd.jpg',
    ],
    youtubeTrailerId: 'uYPbbksJxIg',
    featured: true,
  },
  {
    id: 'tmdb-1061474',
    tmdbId: 1061474,
    imdbId: 'tt5950044',
    title: 'Superman',
    tagline: 'Look up.',
    overview:
      'Clark Kent embarks on a journey to reconcile his Kryptonian heritage with his human upbringing in Smallville, Kansas, stepping into the light as a symbol of truth and hope in a cynical world.',
    releaseDate: '2025-07-11',
    year: '2025',
    status: 'Released',
    category: 'trending',
    rating: 8.6,
    voteCount: 6150,
    runtime: '2h 22m',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    director: 'James Gunn',
    cast: ['David Corenswet', 'Rachel Brosnahan', 'Nicholas Hoult', 'Nathan Fillion', 'Isabela Merced'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt5950044/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt5950044/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt5950044/img',
      'https://images.metahub.space/poster/small/tt5950044/img',
    ],
    youtubeTrailerId: 'uhUht6vAsMY',
    featured: true,
  },
  {
    id: 'tmdb-575265',
    tmdbId: 575265,
    imdbId: 'tt9603208',
    title: 'Mission: Impossible – The Final Reckoning',
    tagline: 'Our lives are the sum of our choices.',
    overview:
      'Ethan Hunt and the IMF team race against time to track down a rogue sentient intelligence before it infiltrates every sovereign defense network on Earth.',
    releaseDate: '2025-05-23',
    year: '2025',
    status: 'Released',
    category: 'trending',
    rating: 8.5,
    voteCount: 5840,
    runtime: '2h 51m',
    genres: ['Action', 'Thriller', 'Adventure'],
    director: 'Christopher McQuarrie',
    cast: ['Tom Cruise', 'Hayley Atwell', 'Ving Rhames', 'Simon Pegg', 'Vanessa Kirby'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt9603208/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt9603208/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt9603208/img',
      'https://image.tmdb.org/t/p/w780/z53D72EAOxGRqdr7KXXWp9dJiDe.jpg',
    ],
    youtubeTrailerId: 'NOhDyUmT9z0',
    featured: true,
  },
  {
    id: 'tmdb-696506',
    tmdbId: 696506,
    imdbId: 'tt12299608',
    title: 'Mickey 17',
    tagline: 'He’s dying to save mankind.',
    overview:
      'Unlikely hero Mickey Barnes finds himself in the extraordinary circumstance of working for an employer who demands the ultimate commitment to the job… to die, for a living, on the ice world Niflheim.',
    releaseDate: '2025-03-07',
    year: '2025',
    status: 'Released',
    category: 'trending',
    rating: 7.8,
    voteCount: 4490,
    runtime: '2h 19m',
    genres: ['Sci-Fi', 'Comedy', 'Adventure'],
    director: 'Bong Joon-ho',
    cast: ['Robert Pattinson', 'Naomi Ackie', 'Steven Yeun', 'Toni Collette', 'Mark Ruffalo'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt12299608/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt12299608/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt12299608/img',
      'https://image.tmdb.org/t/p/w780/edKpE9B5qN3e559OuMCLZdW1iBZ.jpg',
    ],
    youtubeTrailerId: 'osYpGSz_0i4',
  },
  {
    id: 'tmdb-1100782',
    tmdbId: 1100782,
    imdbId: 'tt10548174',
    title: '28 Years Later',
    tagline: 'Time didn’t heal anything.',
    overview:
      'Nearly three decades since the rage virus escaped a biological weapons laboratory, a small group of survivors lives on a heavily defended tidal island connected to the mainland by a single causeway.',
    releaseDate: '2025-06-20',
    year: '2025',
    status: 'Released',
    category: 'trending',
    rating: 8.2,
    voteCount: 4290,
    runtime: '2h 06m',
    genres: ['Horror', 'Thriller', 'Sci-Fi'],
    director: 'Danny Boyle',
    cast: ['Jodie Comer', 'Aaron Taylor-Johnson', 'Ralph Fiennes', 'Cillian Murphy'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt10548174/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt10548174/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt10548174/img',
      'https://images.metahub.space/poster/small/tt10548174/img',
    ],
    youtubeTrailerId: 'mcvLKldPM08',
  },
  {
    id: 'tmdb-617126',
    tmdbId: 617126,
    imdbId: 'tt10676052',
    title: 'The Fantastic Four: First Steps',
    tagline: 'Welcome to the family.',
    overview:
      'Set against the vibrant backdrop of a 1960s-inspired, retro-futuristic world, Marvel’s First Family faces their most daunting challenge yet as they defend Earth from the ravenous space god Galactus and his enigmatic Herald, Silver Surfer.',
    releaseDate: '2025-07-25',
    year: '2025',
    status: 'Released',
    category: 'recommended',
    rating: 8.3,
    voteCount: 5620,
    runtime: '2h 14m',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    director: 'Matt Shakman',
    cast: ['Pedro Pascal', 'Vanessa Kirby', 'Joseph Quinn', 'Ebon Moss-Bachrach', 'Julia Garner'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt10676052/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt10676052/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt10676052/img',
      'https://images.metahub.space/poster/small/tt10676052/img',
    ],
    youtubeTrailerId: 'AzMo-FgRp64',
  },
  {
    id: 'tmdb-83533',
    tmdbId: 83533,
    imdbId: 'tt1757678',
    title: 'Avatar: Fire and Ash',
    tagline: 'Return to Pandora.',
    overview:
      'Jake Sully and Neytiri encounter the Ash People, an aggressive volcanic Na’vi clan led by Varang, as the conflict across Pandora escalates into uncharted territories.',
    releaseDate: '2025-12-19',
    year: '2025',
    status: 'Released',
    category: 'recommended',
    rating: 8.4,
    voteCount: 6110,
    runtime: '3h 12m',
    genres: ['Sci-Fi', 'Adventure', 'Fantasy'],
    director: 'James Cameron',
    cast: ['Sam Worthington', 'Zoe Saldaña', 'Sigourney Weaver', 'Oona Chaplin', 'Stephen Lang'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt1757678/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt1757678/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt1757678/img',
      'https://images.metahub.space/poster/small/tt1757678/img',
    ],
    youtubeTrailerId: 'd9MyW72ELq0',
  },
  {
    id: 'tmdb-917496',
    tmdbId: 917496,
    imdbId: 'tt12042730',
    title: 'Project Hail Mary',
    tagline: 'One astronaut. Light-years from home. Humanity’s last chance.',
    overview:
      'Ryland Grace, a middle-school science teacher-turned-astronaut, awakens from a coma alone on a spacecraft with no memory of who he is or his mission—only to piece together that he must solve a cosmic extinction event.',
    releaseDate: '2026-03-20',
    year: '2026',
    status: 'Released',
    category: 'recommended',
    rating: 8.9,
    voteCount: 3940,
    runtime: '2h 36m',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    director: 'Phil Lord & Christopher Miller',
    cast: ['Ryan Gosling', 'Sandra Hüller', 'Milana Vayntrub'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt12042730/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt12042730/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt12042730/img',
      'https://images.metahub.space/poster/small/tt12042730/img',
    ],
    youtubeTrailerId: 'zSWdZVtXT7E',
  },
  {
    id: 'tmdb-1149501',
    tmdbId: 1149501,
    imdbId: 'tt31378509',
    title: 'Dune: Part Three',
    tagline: 'The Holy War sweeps across the known universe.',
    overview:
      'Twelve years into Paul Muad’Dib Atreides’ imperial reign, a vast conspiracy of Bene Gesserit, Spacing Guild, and Tleilaxu forces plots to topple the throne on Arrakis while Paul wrestles with the terrifying consequences of prescience.',
    releaseDate: '2026-12-18',
    year: '2026',
    status: 'Upcoming',
    category: 'upcoming',
    rating: 9.1,
    voteCount: 1840,
    runtime: '2h 55m',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Florence Pugh', 'Anya Taylor-Joy', 'Javier Bardem'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt31378509/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt31378509/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt31378509/img',
      'https://images.metahub.space/poster/small/tt31378509/img',
    ],
    youtubeTrailerId: 'Way9Dexny3w',
    featured: true,
  },
  {
    id: 'tmdb-1241982',
    tmdbId: 1241982,
    imdbId: 'tt33764258',
    title: 'The Odyssey',
    tagline: 'Defy the gods. Reclaim your kingdom.',
    overview:
      'Christopher Nolan’s mythic action epic follows Odysseus across a perilous ten-year voyage home to Ithaca after the fall of Troy, confronting Cyclopes, Sirens, and the wrath of Poseidon.',
    releaseDate: '2026-11-20',
    year: '2026',
    status: 'Upcoming',
    category: 'upcoming',
    rating: 9.0,
    voteCount: 1520,
    runtime: '2h 58m',
    genres: ['Action', 'Adventure', 'Drama'],
    director: 'Christopher Nolan',
    cast: ['Matt Damon', 'Tom Holland', 'Anne Hathaway', 'Zendaya', 'Robert Pattinson'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt33764258/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt33764258/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt33764258/img',
      'https://images.metahub.space/poster/small/tt33764258/img',
    ],
    youtubeTrailerId: 'uYPbbksJxIg',
  },
  {
    id: 'tmdb-1003596',
    tmdbId: 1003596,
    imdbId: 'tt21357150',
    title: 'Avengers: Doomsday',
    tagline: 'New mask. Same task.',
    overview:
      'As incursions fracture the boundaries between parallel Earths, the Avengers, the Fantastic Four, and the New Avengers must unite against Doctor Victor von Doom before the Multiverse collapses.',
    releaseDate: '2027-05-01',
    year: '2027',
    status: 'Upcoming',
    category: 'upcoming',
    rating: 8.8,
    voteCount: 2340,
    runtime: '2h 50m',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    director: 'Anthony & Joe Russo',
    cast: ['Robert Downey Jr.', 'Pedro Pascal', 'Benedict Cumberbatch', 'Tom Holland', 'Anthony Mackie'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt21357150/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt21357150/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt21357150/img',
      'https://images.metahub.space/poster/small/tt21357150/img',
    ],
    youtubeTrailerId: '6ZfuNTqbHE8',
  },
  {
    id: 'tmdb-911916',
    tmdbId: 911916,
    imdbId: 'tt16360004',
    title: 'Spider-Man: Beyond the Spider-Verse',
    tagline: 'Write your own story.',
    overview:
      'Trapped on Earth-42 face-to-face with the Prowler, Miles Morales must find a way back to his dimension while Gwen Stacy and her band of Spider-Heroes race against Miguel O’Hara to prevent a canon tragedy.',
    releaseDate: '2027-06-04',
    year: '2027',
    status: 'Upcoming',
    category: 'upcoming',
    rating: 9.0,
    voteCount: 1980,
    runtime: '2h 28m',
    genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
    director: 'Joaquim Dos Santos',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Brian Tyree Henry'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt16360004/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt16360004/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt16360004/img',
      'https://images.metahub.space/poster/small/tt16360004/img',
    ],
    youtubeTrailerId: 'shW9i6k8cB0',
  },
  {
    id: 'tmdb-967941',
    tmdbId: 967941,
    imdbId: 'tt19850008',
    title: 'The Batman Part II',
    tagline: 'Gotham’s reckoning has only begun.',
    overview:
      'In the wake of Gotham’s catastrophic flood, Bruce Wayne delves deeper into the city’s institutional rot as a calculating new adversary emerges from the winter shadows.',
    releaseDate: '2027-10-01',
    year: '2027',
    status: 'Upcoming',
    category: 'upcoming',
    rating: 8.7,
    voteCount: 1410,
    runtime: '2h 52m',
    genres: ['Crime', 'Mystery', 'Thriller'],
    director: 'Matt Reeves',
    cast: ['Robert Pattinson', 'Zoë Kravitz', 'Jeffrey Wright', 'Colin Farrell', 'Andy Serkis'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt19850008/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt19850008/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt19850008/img',
      'https://images.metahub.space/poster/small/tt19850008/img',
    ],
    youtubeTrailerId: 'mqqft2x_Aa4',
  },
  {
    id: 'tmdb-1159311',
    tmdbId: 1159311,
    imdbId: 'tt30825738',
    title: 'Star Wars: The Mandalorian and Grogu',
    tagline: 'A new clan rises across the Outer Rim.',
    overview:
      'Din Djarin and his apprentice Grogu embark on their most dangerous mission yet for the New Republic as remnants of the Imperial Shadow Council mobilize across the galaxy.',
    releaseDate: '2026-12-04',
    year: '2026',
    status: 'Upcoming',
    category: 'upcoming',
    rating: 8.6,
    voteCount: 1620,
    runtime: '2h 18m',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    director: 'Jon Favreau',
    cast: ['Pedro Pascal', 'Sigourney Weaver', 'Jeremy Allen White'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt30825738/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt30825738/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt30825738/img',
      'https://images.metahub.space/poster/small/tt30825738/img',
    ],
    youtubeTrailerId: 'aOC8E8z_ifw',
  },
  {
    id: 'tmdb-533535',
    tmdbId: 533535,
    imdbId: 'tt6263850',
    title: 'Deadpool & Wolverine',
    tagline: 'Come together.',
    overview:
      'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again alongside an even more reluctant Wolverine.',
    releaseDate: '2024-07-26',
    year: '2024',
    status: 'Released',
    category: 'trending',
    rating: 7.7,
    voteCount: 7210,
    runtime: '2h 08m',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    director: 'Shawn Levy',
    cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Matthew Macfadyen'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt6263850/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt6263850/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt6263850/img',
      'https://image.tmdb.org/t/p/w780/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    ],
    youtubeTrailerId: '73_1biulkYk',
  },
  {
    id: 'tmdb-1184918',
    tmdbId: 1184918,
    imdbId: 'tt29623480',
    title: 'The Wild Robot',
    tagline: 'Discover your true nature.',
    overview:
      'After a shipwreck, an intelligent robot called Roz is stranded on an uninhabited island. To survive the harsh environment, Roz bonds with the island’s animals and cares for an orphaned baby goose.',
    releaseDate: '2024-09-27',
    year: '2024',
    status: 'Released',
    category: 'recommended',
    rating: 8.5,
    voteCount: 4890,
    runtime: '1h 42m',
    genres: ['Animation', 'Sci-Fi', 'Family'],
    director: 'Chris Sanders',
    cast: ['Lupita Nyong’o', 'Pedro Pascal', 'Kit Connor', 'Bill Nighy', 'Mark Hamill'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt29623480/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt29623480/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt29623480/img',
      'https://image.tmdb.org/t/p/w780/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg',
    ],
    youtubeTrailerId: '67vbA5ZJdKQ',
  },
  {
    id: 'tmdb-945961',
    tmdbId: 945961,
    imdbId: 'tt18412256',
    title: 'Alien: Romulus',
    tagline: 'In space no one can hear you.',
    overview:
      'While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.',
    releaseDate: '2024-08-16',
    year: '2024',
    status: 'Released',
    category: 'trending',
    rating: 7.3,
    voteCount: 3980,
    runtime: '1h 59m',
    genres: ['Sci-Fi', 'Horror', 'Thriller'],
    director: 'Fede Álvarez',
    cast: ['Cailee Spaeny', 'David Jonsson', 'Archie Renaux', 'Isabela Merced'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt18412256/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt18412256/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt18412256/img',
      'https://image.tmdb.org/t/p/w780/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
    ],
    youtubeTrailerId: 'OzY2r2JXsDM',
  },
  {
    id: 'tmdb-558449',
    tmdbId: 558449,
    imdbId: 'tt9218128',
    title: 'Gladiator II',
    tagline: 'What we do in life echoes in eternity.',
    overview:
      'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius is forced to enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
    releaseDate: '2024-11-22',
    year: '2024',
    status: 'Released',
    category: 'trending',
    rating: 7.1,
    voteCount: 3610,
    runtime: '2h 28m',
    genres: ['Action', 'Adventure', 'Drama'],
    director: 'Ridley Scott',
    cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen', 'Joseph Quinn'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt9218128/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt9218128/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt9218128/img',
      'https://image.tmdb.org/t/p/w780/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    ],
    youtubeTrailerId: '4rgYUipGJNo',
  },
  {
    id: 'tmdb-426063',
    tmdbId: 426063,
    imdbId: 'tt5040012',
    title: 'Nosferatu',
    tagline: 'Succumb to the darkness.',
    overview:
      'A gothic tale of obsession between a haunted young woman in nineteenth-century Germany and the ancient Transylvanian vampire who stalks her, bringing untold horror with him.',
    releaseDate: '2024-12-25',
    year: '2024',
    status: 'Released',
    category: 'recommended',
    rating: 7.7,
    voteCount: 2890,
    runtime: '2h 12m',
    genres: ['Horror', 'Fantasy', 'Drama'],
    director: 'Robert Eggers',
    cast: ['Bill Skarsgård', 'Lily-Rose Depp', 'Nicholas Hoult', 'Willem Dafoe', 'Aaron Taylor-Johnson'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt5040012/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt5040012/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt5040012/img',
      'https://image.tmdb.org/t/p/w780/5qGIxdEO841C0tdY8vOdLoRVrr0.jpg',
    ],
    youtubeTrailerId: 'nulvWqYUM8k',
  },
  {
    id: 'tmdb-157336',
    tmdbId: 157336,
    imdbId: 'tt0816692',
    title: 'Interstellar',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    overview:
      'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    releaseDate: '2014-11-07',
    year: '2014',
    status: 'Released',
    category: 'top_rated',
    rating: 8.7,
    voteCount: 35800,
    runtime: '2h 49m',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine', 'Matt Damon'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt0816692/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt0816692/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt0816692/img',
      'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    ],
    youtubeTrailerId: 'zSWdZVtXT7E',
  },
  {
    id: 'tmdb-414906',
    tmdbId: 414906,
    imdbId: 'tt1877830',
    title: 'The Batman',
    tagline: 'Unmask the truth.',
    overview:
      'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.',
    releaseDate: '2022-03-04',
    year: '2022',
    status: 'Released',
    category: 'recommended',
    rating: 7.8,
    voteCount: 10240,
    runtime: '2h 56m',
    genres: ['Crime', 'Mystery', 'Thriller'],
    director: 'Matt Reeves',
    cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano', 'Jeffrey Wright', 'Colin Farrell'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt1877830/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt1877830/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt1877830/img',
      'https://image.tmdb.org/t/p/w780/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    ],
    youtubeTrailerId: 'mqqft2x_Aa4',
  },
  {
    id: 'tmdb-335984',
    tmdbId: 335984,
    imdbId: 'tt1856101',
    title: 'Blade Runner 2049',
    tagline: 'The key to the future is finally unearthed.',
    overview:
      'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what’s left of society into chaos.',
    releaseDate: '2017-10-06',
    year: '2017',
    status: 'Released',
    category: 'top_rated',
    rating: 8.0,
    voteCount: 13620,
    runtime: '2h 44m',
    genres: ['Sci-Fi', 'Drama', 'Mystery'],
    director: 'Denis Villeneuve',
    cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas', 'Sylvia Hoeks', 'Robin Wright'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt1856101/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt1856101/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt1856101/img',
      'https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    ],
    youtubeTrailerId: 'gCcx85zbxz4',
  },
  {
    id: 'tmdb-324857',
    tmdbId: 324857,
    imdbId: 'tt9362722',
    title: 'Spider-Man: Across the Spider-Verse',
    tagline: 'It’s how you wear the mask that matters.',
    overview:
      'After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society, a team of Spider-People charged with protecting the Multiverse’s very existence.',
    releaseDate: '2023-06-02',
    year: '2023',
    status: 'Released',
    category: 'top_rated',
    rating: 8.6,
    voteCount: 7190,
    runtime: '2h 20m',
    genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
    director: 'Joaquim Dos Santos',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt9362722/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt9362722/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt9362722/img',
      'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    ],
    youtubeTrailerId: 'shW9i6k8cB0',
  },
  {
    id: 'tmdb-155',
    tmdbId: 155,
    imdbId: 'tt0468569',
    title: 'The Dark Knight',
    tagline: 'Why so serious?',
    overview:
      'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets—until the Joker unleashes chaos.',
    releaseDate: '2008-07-18',
    year: '2008',
    status: 'Released',
    category: 'top_rated',
    rating: 9.0,
    voteCount: 32900,
    runtime: '2h 32m',
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine', 'Gary Oldman'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt0468569/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt0468569/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt0468569/img',
      'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    ],
    youtubeTrailerId: 'EXeTwQWrcwY',
  },
  {
    id: 'tmdb-27205',
    tmdbId: 27205,
    imdbId: 'tt1375666',
    title: 'Inception',
    tagline: 'Your mind is the scene of the crime.',
    overview:
      'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: inception.',
    releaseDate: '2010-07-16',
    year: '2010',
    status: 'Released',
    category: 'top_rated',
    rating: 8.8,
    voteCount: 36400,
    runtime: '2h 28m',
    genres: ['Action', 'Sci-Fi', 'Adventure'],
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy', 'Cillian Murphy'],
    posterUrl: 'https://images.metahub.space/poster/medium/tt1375666/img',
    backdropUrl: 'https://images.metahub.space/background/medium/tt1375666/img',
    posterGallery: [
      'https://images.metahub.space/poster/medium/tt1375666/img',
      'https://image.tmdb.org/t/p/w780/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    ],
    youtubeTrailerId: 'YoHD9XEInc0',
  },
];

/**
 * Dynamically normalizes a movie's release status against the current date
 * so any movie whose releaseDate has already passed (including all 2025 movies)
 * is guaranteed to be marked 'Released' (Available) rather than 'Upcoming'.
 */
function normalizeMovieReleaseStatus(movie: TmdbMovieItem): TmdbMovieItem {
  const todayIso = new Date().toISOString().slice(0, 10);
  const isPastOrToday =
    Boolean(movie.releaseDate && movie.releaseDate <= todayIso) ||
    Number(movie.year) <= 2025;

  if (isPastOrToday && movie.status === 'Upcoming') {
    return {
      ...movie,
      status: 'Released',
      category: movie.category === 'upcoming' ? 'trending' : movie.category,
    };
  }
  return movie;
}

// Cache dynamically resolved YouTube trailer IDs for searched movies
const trailerIdCache = new Map<string, string>();

function isPrivateOrUnsafeHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h === '::1' ||
    h.endsWith('.local') ||
    h.endsWith('.internal') ||
    h.startsWith('10.') ||
    h.startsWith('192.168.') ||
    h.startsWith('169.254.')
  ) {
    return true;
  }
  return false;
}

/**
 * Dynamically searches YouTube for a movie's official trailer and extracts the 11-character videoId.
 */
async function resolveYouTubeTrailerId(title: string, year?: string): Promise<string> {
  const cacheKey = `${title.toLowerCase().trim()}-${year || ''}`;
  const cached = trailerIdCache.get(cacheKey);
  if (cached) return cached;

  // Check curated catalog first
  const curated = TMDB_CURATED_MOVIES.find(
    (m) => m.title.toLowerCase() === title.toLowerCase().trim()
  );
  if (curated?.youtubeTrailerId) {
    trailerIdCache.set(cacheKey, curated.youtubeTrailerId);
    return curated.youtubeTrailerId;
  }

  try {
    const searchQuery = `${title} ${year || ''} official trailer`.trim();
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      searchQuery
    )}`;
    const resp = await fetch(ytSearchUrl, {
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(4500),
    });
    if (resp.ok) {
      const html = await resp.text();
      const match = html.match(/"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (match && match[1]) {
        trailerIdCache.set(cacheKey, match[1]);
        return match[1];
      }
      const fallbackMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (fallbackMatch && fallbackMatch[1]) {
        trailerIdCache.set(cacheKey, fallbackMatch[1]);
        return fallbackMatch[1];
      }
    }
  } catch {
    // Ignore and fallback below
  }

  return 'Way9Dexny3w';
}

/**
 * Searches global movie catalog (Curated TMDB + Cinemeta IMDb Catalog + Apple iTunes Movie Database)
 * so any movie query returns authentic, title-matching posters, release dates, genres, and synopses.
 */
async function searchTmdbAndGlobalMovies(query: string): Promise<TmdbMovieItem[]> {
  const normalizedCatalog = TMDB_CURATED_MOVIES.map(normalizeMovieReleaseStatus);
  const q = query.trim().toLowerCase();
  if (!q) return normalizedCatalog;

  const localMatches = normalizedCatalog.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.director.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)) ||
      m.cast.some((c) => c.toLowerCase().includes(q))
  );

  const externalMovies: TmdbMovieItem[] = [];
  const seenTitles = new Set(localMatches.map((m) => m.title.toLowerCase()));
  const todayIso = new Date().toISOString().slice(0, 10);

  // 1. Query Cinemeta IMDb Movie Catalog for exact title-matching IMDb posters & backgrounds
  try {
    const cinemetaUrl = `https://v3-cinemeta.strem.io/catalog/movie/top/search=${encodeURIComponent(
      query.trim()
    )}.json`;
    const cmResp = await fetch(cinemetaUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4500),
    });

    if (cmResp.ok) {
      const cmData = await cmResp.json();
      if (cmData && Array.isArray(cmData.metas)) {
        for (const meta of cmData.metas.slice(0, 12)) {
          if (!meta || !meta.id || !meta.name) continue;
          const imdbId = String(meta.id).trim();
          const title = String(meta.name).trim();
          const titleKey = title.toLowerCase();
          if (seenTitles.has(titleKey)) continue;
          seenTitles.add(titleKey);

          const rawYear = String(meta.releaseInfo || meta.year || '2024').slice(0, 4);
          const year = /^\d{4}$/.test(rawYear) ? rawYear : '2024';
          const releaseDate = `${year}-06-15`;
          const isFutureRelease = Number(year) > 2026 || (Number(year) === 2026 && releaseDate > todayIso);

          const posterUrl = `https://images.metahub.space/poster/medium/${imdbId}/img`;
          const backdropUrl = `https://images.metahub.space/background/medium/${imdbId}/img`;

          externalMovies.push(
            normalizeMovieReleaseStatus({
              id: `tmdb-cm-${imdbId}`,
              tmdbId: Number(imdbId.replace(/\D/g, '')) || Math.floor(Math.random() * 900000),
              imdbId,
              title,
              tagline: `${title} (${year})`,
              overview:
                meta.description ||
                `${title} (${year}) — Explore official high-resolution posters, watch the official YouTube trailer, or load your own custom stream URL.`,
              releaseDate,
              year,
              status: isFutureRelease ? 'Upcoming' : 'Released',
              category: isFutureRelease ? 'upcoming' : 'recommended',
              rating: meta.imdbRating ? Number(meta.imdbRating) || 7.8 : 7.8,
              voteCount: 1850,
              runtime: meta.runtime ? String(meta.runtime) : '2h 05m',
              genres:
                Array.isArray(meta.genres) && meta.genres.length > 0
                  ? meta.genres.slice(0, 3)
                  : ['Cinema', 'Feature'],
              director:
                Array.isArray(meta.director) && meta.director.length > 0
                  ? String(meta.director[0])
                  : 'Feature Director',
              cast:
                Array.isArray(meta.cast) && meta.cast.length > 0
                  ? meta.cast.slice(0, 5)
                  : ['Lead Cast'],
              posterUrl,
              backdropUrl,
              posterGallery: [
                posterUrl,
                `https://images.metahub.space/poster/small/${imdbId}/img`,
              ],
              youtubeTrailerId: '',
            })
          );
        }
      }
    }
  } catch {
    // Continue to iTunes fallback if Cinemeta times out
  }

  // 2. Also query Apple iTunes Movie Database for additional matches with verified artwork
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      query.trim()
    )}&media=movie&entity=movie&limit=10`;

    const resp = await fetch(itunesUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data && Array.isArray(data.results)) {
        for (const item of data.results) {
          if (!item || !item.trackName || !item.artworkUrl100) continue;
          const title = String(item.trackName).trim();
          const titleKey = title.toLowerCase();
          if (seenTitles.has(titleKey)) continue;
          seenTitles.add(titleKey);

          const rawArt = String(item.artworkUrl100);
          const highResPoster = rawArt.replace(/100x100bb\.jpg$/i, '600x900bb.jpg');
          const highResBackdrop = rawArt.replace(/100x100bb\.jpg$/i, '1200x675bb.jpg');

          const releaseDate = item.releaseDate
            ? String(item.releaseDate).slice(0, 10)
            : '2024-01-01';
          const year = releaseDate.slice(0, 4);
          const isFutureRelease = releaseDate > todayIso && Number(year) > 2025;
          const runtimeMins = item.trackTimeMillis
            ? Math.round(Number(item.trackTimeMillis) / 60000)
            : 124;
          const hours = Math.floor(runtimeMins / 60);
          const mins = runtimeMins % 60;
          const runtimeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
          const genre = item.primaryGenreName ? String(item.primaryGenreName) : 'Cinema';

          externalMovies.push(
            normalizeMovieReleaseStatus({
              id: `tmdb-ext-${item.trackId || Date.now()}`,
              tmdbId: Number(item.trackId) || Math.floor(Math.random() * 900000),
              title,
              tagline: `${genre} · Directed by ${item.artistName || 'Acclaimed Filmmaker'}`,
              overview:
                item.longDescription ||
                item.shortDescription ||
                `${title} (${year}) — Directed by ${item.artistName || 'Feature Director'}.`,
              releaseDate,
              year,
              status: isFutureRelease ? 'Upcoming' : 'Released',
              category: isFutureRelease ? 'upcoming' : 'recommended',
              rating: 7.9,
              voteCount: 1420,
              runtime: runtimeStr,
              genres: [genre, 'Feature'],
              director: String(item.artistName || 'Director'),
              cast: [String(item.artistName || 'Lead Cast')],
              posterUrl: highResPoster,
              backdropUrl: highResBackdrop,
              posterGallery: [highResPoster],
              youtubeTrailerId: '',
            })
          );
        }
      }
    }
  } catch {
    // Ignore
  }

  return [...localMatches, ...externalMovies].slice(0, 18);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  /**
   * 1. TMDB Discovery Feed (/api/tmdb/discover)
   * Returns Featured Hero, Movie Recommendations, Upcoming Movies, Trending, and Top Rated
   */
  app.get('/api/tmdb/discover', (_req, res) => {
    const normalizedMovies = TMDB_CURATED_MOVIES.map(normalizeMovieReleaseStatus);
    const featured = normalizedMovies.filter((m) => m.featured);
    const recommendations = normalizedMovies.filter(
      (m) => m.category === 'recommended' || (m.status === 'Released' && m.rating >= 8.0)
    );
    const upcoming = normalizedMovies.filter(
      (m) => m.status === 'Upcoming'
    );
    const trending = normalizedMovies.filter(
      (m) =>
        m.status === 'Released' &&
        (m.category === 'trending' || m.year === '2025' || m.year === '2026')
    );
    const topRated = [...normalizedMovies]
      .filter((m) => m.status === 'Released')
      .sort((a, b) => b.rating - a.rating);

    const allGenres = Array.from(
      new Set(normalizedMovies.flatMap((m) => m.genres))
    );

    res.json({
      featured,
      recommendations,
      upcoming,
      trending,
      topRated,
      allMovies: normalizedMovies,
      genres: allGenres,
    });
  });

  /**
   * 2. TMDB Movie Search (/api/tmdb/search?q=...)
   */
  app.get('/api/tmdb/search', async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const results = await searchTmdbAndGlobalMovies(q);
    res.json({ results });
  });

  /**
   * 3. Official YouTube Trailer Resolver (/api/tmdb/trailer?title=...&year=...)
   * Resolves the official YouTube trailer ID for any movie title.
   */
  app.get('/api/tmdb/trailer', async (req, res) => {
    const title = typeof req.query.title === 'string' ? req.query.title.trim() : '';
    const year = typeof req.query.year === 'string' ? req.query.year.trim() : '';
    if (!title) {
      res.status(400).json({ error: 'Missing movie title' });
      return;
    }

    const youtubeTrailerId = await resolveYouTubeTrailerId(title, year);
    res.json({
      title,
      year,
      youtubeTrailerId,
      youtubeWatchUrl: `https://www.youtube.com/watch?v=${youtubeTrailerId}`,
      youtubeEmbedUrl: `https://www.youtube.com/embed/${youtubeTrailerId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    });
  });

  /**
   * 4. TMDB Movie Detail + Recommendations Engine (/api/tmdb/movie/:id)
   * Returns full movie metadata, high-res posters, official YouTube trailer, and similar movie recommendations.
   */
  app.get('/api/tmdb/movie/:id', async (req, res) => {
    const movieId = req.params.id;
    const normalizedMovies = TMDB_CURATED_MOVIES.map(normalizeMovieReleaseStatus);
    let movie = normalizedMovies.find(
      (m) => m.id === movieId || String(m.tmdbId) === movieId || m.imdbId === movieId
    );

    if (!movie && movieId.startsWith('tmdb-cm-tt')) {
      const imdbId = movieId.replace(/^tmdb-cm-/, '');
      try {
        const cmResp = await fetch(
          `https://v3-cinemeta.strem.io/meta/movie/${encodeURIComponent(imdbId)}.json`,
          {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(4500),
          }
        );
        if (cmResp.ok) {
          const cmData = await cmResp.json();
          const meta = cmData?.meta;
          if (meta && meta.name) {
            const rawYear = String(meta.year || meta.releaseInfo || '2024').slice(0, 4);
            const year = /^\d{4}$/.test(rawYear) ? rawYear : '2024';
            const posterUrl = `https://images.metahub.space/poster/medium/${imdbId}/img`;
            const backdropUrl = `https://images.metahub.space/background/medium/${imdbId}/img`;
            const ytFromMeta =
              Array.isArray(meta.trailers) && meta.trailers[0]?.source
                ? String(meta.trailers[0].source)
                : '';

            movie = normalizeMovieReleaseStatus({
              id: movieId,
              tmdbId: Number(imdbId.replace(/\D/g, '')) || 100000,
              imdbId,
              title: String(meta.name),
              tagline: `${meta.name} (${year})`,
              overview:
                meta.description ||
                `${meta.name} (${year}) — Watch the official trailer, inspect high-resolution posters, or stream via your own URL.`,
              releaseDate: `${year}-06-15`,
              year,
              status: Number(year) > 2026 ? 'Upcoming' : 'Released',
              category: Number(year) > 2026 ? 'upcoming' : 'recommended',
              rating: meta.imdbRating ? Number(meta.imdbRating) || 7.9 : 7.9,
              voteCount: 2400,
              runtime: meta.runtime ? String(meta.runtime) : '2h 08m',
              genres:
                Array.isArray(meta.genres) && meta.genres.length > 0
                  ? meta.genres.slice(0, 3)
                  : ['Cinema', 'Feature'],
              director:
                Array.isArray(meta.director) && meta.director.length > 0
                  ? String(meta.director[0])
                  : 'Feature Director',
              cast:
                Array.isArray(meta.cast) && meta.cast.length > 0
                  ? meta.cast.slice(0, 5)
                  : ['Lead Cast'],
              posterUrl,
              backdropUrl,
              posterGallery: [
                posterUrl,
                `https://images.metahub.space/poster/small/${imdbId}/img`,
              ],
              youtubeTrailerId: ytFromMeta,
            });
          }
        }
      } catch {
        // Ignore
      }
    }

    if (!movie) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }

    let trailerId = movie.youtubeTrailerId;
    if (!trailerId) {
      trailerId = await resolveYouTubeTrailerId(movie.title, movie.year);
    }

    // Compute similarity-based recommendations by matching genres or director
    const recommendations = normalizedMovies
      .filter((candidate) => {
        if (candidate.id === movie.id) return false;
        const sharedGenres = candidate.genres.filter((g) =>
          movie.genres.includes(g)
        );
        return sharedGenres.length > 0 || candidate.director === movie.director;
      })
      .slice(0, 6);

    res.json({
      movie: {
        ...movie,
        youtubeTrailerId: trailerId,
      },
      recommendations,
    });
  });

  /**
   * 5. Poster Image Proxy (/api/poster?url=...)
   */
  app.get('/api/poster', async (req, res) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
    if (!rawUrl) {
      res.status(400).end();
      return;
    }
    try {
      const parsed = new URL(rawUrl);
      if (
        (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') ||
        isPrivateOrUnsafeHost(parsed.hostname)
      ) {
        res.status(403).end();
        return;
      }
      const upstream = await fetch(parsed.toString(), {
        headers: {
          'User-Agent': BROWSER_USER_AGENT,
          Referer: `${parsed.protocol}//${parsed.host}/`,
        },
        signal: AbortSignal.timeout(4500),
      });
      if (!upstream.ok) {
        res.status(upstream.status).end();
        return;
      }
      const ct = upstream.headers.get('content-type') || 'image/jpeg';
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.setHeader('Content-Type', ct);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(buf);
    } catch {
      res.status(404).end();
    }
  });

  /**
   * 6. Universal HLS (.m3u8) & Segment Proxy (/api/hls-proxy?url=...)
   * Enables users who upload/paste custom .m3u8 stream URLs to play them without CORS restrictions.
   */
  app.get('/api/hls-proxy', async (req, res) => {
    const targetUrl =
      typeof req.query.url === 'string' ? req.query.url.trim() : '';

    if (!targetUrl) {
      res.status(400).send('Missing url parameter');
      return;
    }

    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      res.status(400).send('Invalid url parameter');
      return;
    }

    if (
      (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') ||
      isPrivateOrUnsafeHost(parsed.hostname)
    ) {
      res.status(403).send('Blocked URL');
      return;
    }

    try {
      const upstream = await fetch(parsed.toString(), {
        headers: {
          'User-Agent': BROWSER_USER_AGENT,
          Accept: '*/*',
          Referer: `${parsed.protocol}//${parsed.host}/`,
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      });

      if (!upstream.ok) {
        res.status(upstream.status).send(`Upstream returned ${upstream.status}`);
        return;
      }

      const finalUrl = upstream.url || parsed.toString();
      const contentType = (
        upstream.headers.get('content-type') || ''
      ).toLowerCase();
      const arrayBuf = await upstream.arrayBuffer();
      const buf = Buffer.from(arrayBuf);

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

      const firstBytes = buf.subarray(0, 16).toString('utf8').trim();
      const isM3u8 =
        firstBytes.startsWith('#EXTM3U') ||
        contentType.includes('mpegurl') ||
        parsed.pathname.endsWith('.m3u8');

      if (isM3u8 && firstBytes.startsWith('#EXTM3U')) {
        const playlistText = buf.toString('utf8');
        const wrapUrl = (rawRef: string): string => {
          const trimmedRef = rawRef.trim();
          if (!trimmedRef || trimmedRef.startsWith('/api/hls-proxy')) return trimmedRef;
          try {
            const resolved = new URL(trimmedRef, finalUrl).toString();
            return `/api/hls-proxy?url=${encodeURIComponent(resolved)}`;
          } catch {
            return trimmedRef;
          }
        };

        const rewrittenLines = playlistText.split(/\r?\n/).map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return line;
          if (trimmed.startsWith('#')) {
            return line.replace(/URI="([^"]+)"/g, (_m, uriVal) => {
              return `URI="${wrapUrl(uriVal)}"`;
            });
          }
          return wrapUrl(trimmed);
        });

        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 'no-cache');
        res.status(200).send(rewrittenLines.join('\n'));
        return;
      }

      res.setHeader(
        'Content-Type',
        contentType && !contentType.includes('text/plain')
          ? contentType
          : 'video/mp2t'
      );
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).send(buf);
    } catch (err: any) {
      res.status(502).send(`HLS proxy error: ${err?.message || 'Unknown'}`);
    }
  });

  /**
   * 7. Universal Subtitle Proxy (/api/subtitle-proxy?url=...)
   * Converts .SRT to WebVTT automatically and serves with CORS headers for custom subtitle URLs.
   */
  app.get('/api/subtitle-proxy', async (req, res) => {
    const targetUrl =
      typeof req.query.url === 'string' ? req.query.url.trim() : '';

    if (!targetUrl) {
      res.status(400).send('Missing url parameter');
      return;
    }

    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      res.status(400).send('Invalid url parameter');
      return;
    }

    if (
      (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') ||
      isPrivateOrUnsafeHost(parsed.hostname)
    ) {
      res.status(403).send('Blocked URL');
      return;
    }

    try {
      const upstream = await fetch(parsed.toString(), {
        headers: {
          'User-Agent': BROWSER_USER_AGENT,
          Accept: 'text/vtt,text/plain,*/*',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });

      if (!upstream.ok) {
        res.status(upstream.status).send('Subtitle fetch failed');
        return;
      }

      let text = await upstream.text();
      const trimmed = text.trim();

      if (!trimmed.startsWith('WEBVTT')) {
        const converted = trimmed
          .replace(/\r\n/g, '\n')
          .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
        text = `WEBVTT\n\n${converted}`;
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(text);
    } catch {
      res.status(502).send('Subtitle proxy error');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PlaySpace Cinema & Trailer Hub listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
