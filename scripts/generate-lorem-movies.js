import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../data/movies.json');

// Lorem ipsum word pools for generating titles
const adjectives = [
  'Silent', 'Dark', 'Eternal', 'Lost', 'Hidden', 'Final', 'Ancient', 'Forbidden',
  'Broken', 'Golden', 'Shadow', 'Crimson', 'Midnight', 'Frozen', 'Burning', 'Shattered',
  'Secret', 'Dying', 'Rising', 'Fallen', 'Forgotten', 'Sacred', 'Cursed', 'Blessed',
  'Wild', 'Distant', 'Empty', 'Infinite', 'Hollow', 'Bitter', 'Sweet', 'Iron'
];

const nouns = [
  'Dream', 'Night', 'City', 'Heart', 'Soul', 'Empire', 'Kingdom', 'Star',
  'Moon', 'Sun', 'River', 'Mountain', 'Ocean', 'Sky', 'Storm', 'Light',
  'Darkness', 'Memory', 'Truth', 'Lies', 'Hope', 'Fear', 'Love', 'War',
  'Peace', 'Journey', 'Destiny', 'Prophecy', 'Legend', 'Chronicle', 'Tale', 'Saga'
];

const verbs = [
  'Returns', 'Falls', 'Rises', 'Awakens', 'Sleeps', 'Whispers', 'Screams', 'Dies',
  'Lives', 'Fights', 'Surrenders', 'Escapes', 'Arrives', 'Departs', 'Remains', 'Vanishes'
];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTitle() {
  const patterns = [
    () => `The ${randomElement(adjectives)} ${randomElement(nouns)}`,
    () => `${randomElement(nouns)} of the ${randomElement(adjectives)} ${randomElement(nouns)}`,
    () => `The ${randomElement(nouns)} ${randomElement(verbs)}`,
    () => `${randomElement(adjectives)} ${randomElement(nouns)}: ${randomElement(nouns)} of ${randomElement(nouns)}`,
    () => `A ${randomElement(adjectives)} ${randomElement(nouns)}`,
    () => `The Last ${randomElement(nouns)}`,
    () => `${randomElement(adjectives)} ${randomElement(nouns)} ${randomElement(verbs)}`
  ];

  return randomElement(patterns)();
}

function generateYear() {
  // More recent movies skewed, but some classics
  const era = Math.random();
  if (era < 0.1) return Math.floor(Math.random() * 30) + 1930; // 1930-1959
  if (era < 0.2) return Math.floor(Math.random() * 20) + 1960; // 1960-1979
  if (era < 0.4) return Math.floor(Math.random() * 20) + 1980; // 1980-1999
  return Math.floor(Math.random() * 24) + 2000; // 2000-2023
}

function generateRating(rank) {
  // Higher ranks get higher ratings
  if (rank <= 10) return (9.0 + Math.random() * 0.3).toFixed(1);
  if (rank <= 50) return (8.7 + Math.random() * 0.3).toFixed(1);
  if (rank <= 100) return (8.5 + Math.random() * 0.3).toFixed(1);
  if (rank <= 250) return (8.2 + Math.random() * 0.3).toFixed(1);
  return (8.0 + Math.random() * 0.3).toFixed(1);
}

function generateImdbId() {
  // Generate random IMDb ID (tt + 7 digits)
  const num = Math.floor(Math.random() * 9000000) + 1000000;
  return `tt${num}`;
}

function generateMovie(rank) {
  return {
    rank,
    imdbId: generateImdbId(),
    title: generateTitle(),
    year: generateYear(),
    rating: parseFloat(generateRating(rank)),
    streaming: {
      netflix: false,
      prime: false,
      disney: false,
      hulu: false,
      max: false,
      lastChecked: null
    }
  };
}

async function generateMoviesList() {
  console.log('Generating 500 lorem ipsum movies...\n');

  const movies = [];
  for (let i = 1; i <= 500; i++) {
    movies.push(generateMovie(i));
  }

  const data = {
    metadata: {
      lastManualUpdate: new Date().toISOString().split('T')[0],
      lastStreamingUpdate: null,
      totalMovies: 500
    },
    movies
  };

  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✓ Successfully generated ${movies.length} movies`);
    console.log(`  Output: ${DATA_PATH}`);
  } catch (error) {
    console.error(`Error writing ${DATA_PATH}:`, error.message);
    process.exit(1);
  }
}

generateMoviesList().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
