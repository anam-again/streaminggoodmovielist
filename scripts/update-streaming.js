import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const DATA_PATH = path.join(__dirname, '../data/movies.json');
const US_REGION = 'US'; // We're checking US streaming availability

// Streaming service provider IDs from TMDB (US region)
const PROVIDERS = {
  netflix: 8,
  prime: 9,      // Amazon Prime Video
  disney: 337,   // Disney+
  hulu: 15,
  max: 1899      // Max (formerly HBO Max)
};

// Rate limiting: delay between API calls (ms)
const API_DELAY = 250; // 4 requests per second (TMDB allows much more, but we're being polite)

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchFromTMDB(endpoint) {
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error.message);
    return null;
  }
}

async function getStreamingAvailability(imdbId) {
  // First, find the TMDB movie ID from IMDb ID
  const findResult = await fetchFromTMDB(`/find/${imdbId}?external_source=imdb_id`);

  if (!findResult || !findResult.movie_results || findResult.movie_results.length === 0) {
    console.warn(`No TMDB match found for IMDb ID: ${imdbId}`);
    return null;
  }

  const tmdbId = findResult.movie_results[0].id;

  // Get watch providers for this movie
  await sleep(API_DELAY); // Rate limiting
  const providersResult = await fetchFromTMDB(`/movie/${tmdbId}/watch/providers`);

  if (!providersResult || !providersResult.results) {
    console.warn(`No streaming data found for TMDB ID: ${tmdbId}`);
    return null;
  }

  // Get US streaming options
  const usProviders = providersResult.results[US_REGION];

  if (!usProviders || !usProviders.flatrate) {
    // No streaming available in the US
    return {
      netflix: false,
      prime: false,
      disney: false,
      hulu: false,
      max: false
    };
  }

  // Check which services have this movie
  const availableProviderIds = usProviders.flatrate.map(p => p.provider_id);

  return {
    netflix: availableProviderIds.includes(PROVIDERS.netflix),
    prime: availableProviderIds.includes(PROVIDERS.prime),
    disney: availableProviderIds.includes(PROVIDERS.disney),
    hulu: availableProviderIds.includes(PROVIDERS.hulu),
    max: availableProviderIds.includes(PROVIDERS.max)
  };
}

async function updateStreamingData() {
  console.log('Starting streaming availability update...\n');

  // Validate API key
  if (!TMDB_API_KEY || TMDB_API_KEY === 'your_api_key_here') {
    console.error('Error: TMDB_API_KEY not set in .env file');
    console.error('Please copy .env.example to .env and add your TMDB API key');
    process.exit(1);
  }

  // Load movies data
  let data;
  try {
    const fileContent = await fs.readFile(DATA_PATH, 'utf-8');
    data = JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading ${DATA_PATH}:`, error.message);
    process.exit(1);
  }

  if (!data.movies || !Array.isArray(data.movies)) {
    console.error('Invalid movies.json format: missing movies array');
    process.exit(1);
  }

  console.log(`Found ${data.movies.length} movies to check\n`);

  let successCount = 0;
  let errorCount = 0;

  // Process each movie
  for (let i = 0; i < data.movies.length; i++) {
    const movie = data.movies[i];
    console.log(`[${i + 1}/${data.movies.length}] Checking: ${movie.title}`);

    const streamingData = await getStreamingAvailability(movie.imdbId);

    if (streamingData) {
      // Update streaming availability
      movie.streaming = streamingData;
      successCount++;

      // Log which services have it
      const available = Object.entries(streamingData)
        .filter(([_, isAvailable]) => isAvailable)
        .map(([service, _]) => service);

      if (available.length > 0) {
        console.log(`  ✓ Available on: ${available.join(', ')}`);
      } else {
        console.log(`  ✓ Not available on tracked services`);
      }
    } else {
      // Keep previous data on error
      errorCount++;
      console.log(`  ✗ Failed to fetch data (keeping previous data)`);
    }

    console.log('');
  }

  // Update metadata
  data.metadata.lastStreamingUpdate = new Date().toISOString();

  // Save updated data
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n✓ Successfully updated movies.json`);
    console.log(`  Success: ${successCount} movies`);
    console.log(`  Errors: ${errorCount} movies`);
    console.log(`  Last update: ${data.metadata.lastStreamingUpdate}`);
  } catch (error) {
    console.error(`\nError writing ${DATA_PATH}:`, error.message);
    process.exit(1);
  }
}

// Run the update
updateStreamingData().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
