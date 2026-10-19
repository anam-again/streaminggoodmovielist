# Streaming Good Movie List

Minimalist tracker for IMDb Top 250 with real-time US streaming availability.

## For Users

This site shows you which of the top-rated movies are currently available on your streaming services.

**How to use:**

1. **Select your services** - At the top, check which streaming platforms you have (Netflix, Prime Video, Disney+, Hulu, Max)
2. **Check the colors:**
   - **Green rows** = Unwatched movies available on your services
   - **Greyish red rows** = Unwatched movies not on your services
   - **Light grey** = Watched movies available on your services
   - **Dark grey** = Watched movies not on your services
3. **Track what you've watched** - Click the checkmark (✓) next to any movie you've seen. Your choices save automatically in your browser.
4. **Updates daily** - Streaming availability refreshes every night at midnight UTC

**Features:**
- All 250 movies ranked by IMDb rating
- Real-time streaming availability for US region only
- Your watched list and service preferences stay private (never leave your browser)
- Click any movie title to view it on IMDb

---

## For Developers

## Features

- IMDb Top 250 movies with ratings
- Daily streaming updates via TMDB API (Netflix, Prime, Disney+, Hulu, Max)
- Client-side watched tracking (localStorage)
- Service filtering with color-coded availability
- Automated updates via GitHub Actions

## Setup

```bash
npm install
cp .env.template .env
# Add TMDB API key to .env
npm run update-streaming
npm run generate-html
```

## Deployment

### GitHub Secret
Add `TMDB_API_KEY` in repo Settings → Secrets → Actions

### GitHub Pages
Settings → Pages → Deploy from branch `main` (root)

### Workflow
- Runs daily at midnight UTC
- Manual trigger: Actions → "Update Streaming Availability" → Run workflow

## Architecture

**Local:**
- `.env` file (gitignored) contains `TMDB_API_KEY`
- Scripts use `dotenv` to load key

**GitHub Actions:**
- Reads `TMDB_API_KEY` from repository secrets
- Workflow injects as environment variable
- Updates run automatically, no `.env` file committed

**Storage:**
- Watched state: localStorage (~2KB JSON)
- Service preferences: localStorage (~100 bytes)
- No cookies, fully client-side

## Scripts

```bash
npm run update-streaming  # Query TMDB, update movies.json
npm run generate-html     # Build static index.html
npm run build             # Both in sequence
```

## Color States

- Green: Unwatched + available
- Greyish red: Unwatched + unavailable
- Light grey: Watched + available
- Grey: Watched + unavailable

## Structure

```
├── .github/workflows/update-streaming.yml  # Daily cron
├── assets/
│   ├── logos/           # Service PNGs (active/inactive)
│   ├── app.js           # Client interactivity
│   └── styles.css       # Minimal styling
├── data/movies.json     # Movie data + streaming
├── scripts/
│   ├── update-streaming.js
│   └── generate-html.js
└── index.html           # Generated output
```

## API

- TMDB free tier: 40 req/10s
- This app: 250ms delay (4 req/s)
- Daily update: ~250 requests

## License

MIT
