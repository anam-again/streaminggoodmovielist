import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../data/movies.json');
const OUTPUT_PATH = path.join(__dirname, '../index.html');

const STREAMING_SERVICES = {
  netflix: 'Netflix',
  prime: 'Prime Video',
  disney: 'Disney+',
  hulu: 'Hulu',
  max: 'Max'
};

function generateMovieRow(movie) {
  // Always show all streaming services in order, active or inactive
  const streamingIcons = Object.entries(STREAMING_SERVICES)
    .map(([key, name]) => {
      const isActive = movie.streaming && movie.streaming[key];
      const state = isActive ? 'active' : 'inactive';
      return `<img src="assets/logos/${key}-${state}.png" alt="${name}" title="${name}" class="service-logo ${state}">`;
    })
    .join('\n            ');

  // Serialize streaming data for JavaScript
  const streamingData = JSON.stringify(movie.streaming).replace(/"/g, '&quot;');

  return `      <tr data-imdb-id="${movie.imdbId}" data-streaming="${streamingData}">
        <td class="watched">
          <input type="checkbox" class="watched-checkbox" data-imdb-id="${movie.imdbId}">
        </td>
        <td class="rank">${movie.rank}</td>
        <td class="title">
          <a href="https://www.imdb.com/title/${movie.imdbId}/" target="_blank" rel="noopener noreferrer">
            ${movie.title}
          </a>
        </td>
        <td class="rating">${movie.rating}</td>
        <td class="streaming">
          ${streamingIcons}
        </td>
      </tr>`;
}

function generateHTML(data) {
  const ROWS_PER_TABLE = 50;
  const numTables = Math.ceil(data.movies.length / ROWS_PER_TABLE);

  // Generate multiple tables that will wrap naturally
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const startIdx = i * ROWS_PER_TABLE;
    const endIdx = Math.min(startIdx + ROWS_PER_TABLE, data.movies.length);
    const tableMovies = data.movies.slice(startIdx, endIdx);
    const rows = tableMovies.map(generateMovieRow).join('\n');

    tables.push(`      <table class="movies-table">
        <thead>
          <tr>
            <th class="watched">✓</th>
            <th class="rank">#</th>
            <th class="title">Title</th>
            <th class="rating">Rating</th>
            <th class="streaming">Streaming On</th>
          </tr>
        </thead>
        <tbody>
${rows}
        </tbody>
      </table>`);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="IMDb's top 500 movies with current streaming availability on Netflix, Prime Video, Disney+, Hulu, and Max">
  <title>streaminggoodmovielist</title>
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <header>
    <h1>streaminggoodmovielist<br><span class="subtitle">2026</span></h1>
  </header>

  <div class="service-selector">
    <span class="service-label">Services I have:</span>
    <label><input type="checkbox" class="service-checkbox" id="service-netflix" data-service="netflix" checked> Netflix</label>
    <label><input type="checkbox" class="service-checkbox" id="service-prime" data-service="prime" checked> Prime Video</label>
    <label><input type="checkbox" class="service-checkbox" id="service-disney" data-service="disney" checked> Disney+</label>
    <label><input type="checkbox" class="service-checkbox" id="service-hulu" data-service="hulu" checked> Hulu</label>
    <label><input type="checkbox" class="service-checkbox" id="service-max" data-service="max" checked> Max</label>
  </div>

  <main>
    <div class="table-container">
${tables.join('\n\n')}
    </div>
  </main>

  <script src="assets/app.js"></script>
</body>
</html>`;
}

async function generatePage() {
  console.log('Generating HTML page...\n');

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

  console.log(`Loaded ${data.movies.length} movies`);

  // Generate HTML
  const html = generateHTML(data);

  // Write to file
  try {
    await fs.writeFile(OUTPUT_PATH, html, 'utf-8');
    console.log(`\n✓ Successfully generated index.html`);
    console.log(`  Output: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error(`\nError writing ${OUTPUT_PATH}:`, error.message);
    process.exit(1);
  }
}

// Run the generator
generatePage().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
