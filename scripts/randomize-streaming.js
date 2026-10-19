import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../data/movies.json');

// Probability each service has the movie (30% chance)
const AVAILABILITY_PROBABILITY = 0.3;

function randomBoolean(probability = 0.5) {
  return Math.random() < probability;
}

async function randomizeStreaming() {
  console.log('Randomizing streaming availability...\n');

  // Load movies data
  let data;
  try {
    const fileContent = await fs.readFile(DATA_PATH, 'utf-8');
    data = JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading ${DATA_PATH}:`, error.message);
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];

  // Randomize streaming for each movie
  data.movies.forEach(movie => {
    movie.streaming = {
      netflix: randomBoolean(AVAILABILITY_PROBABILITY),
      prime: randomBoolean(AVAILABILITY_PROBABILITY),
      disney: randomBoolean(AVAILABILITY_PROBABILITY),
      hulu: randomBoolean(AVAILABILITY_PROBABILITY),
      max: randomBoolean(AVAILABILITY_PROBABILITY),
      lastChecked: today
    };
  });

  // Update metadata
  data.metadata.lastStreamingUpdate = new Date().toISOString();

  // Save updated data
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✓ Successfully randomized streaming data for ${data.movies.length} movies`);
    console.log(`  Output: ${DATA_PATH}`);
  } catch (error) {
    console.error(`Error writing ${DATA_PATH}:`, error.message);
    process.exit(1);
  }
}

randomizeStreaming().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
