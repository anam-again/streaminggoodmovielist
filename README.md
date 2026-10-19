# Streaming Good Movie List

A minimalist, information-dense webpage displaying IMDb's Top 250 movies with real-time streaming availability across major US platforms.

## Features

- **IMDb Top 250** - Real movie data with titles, years, and ratings
- **Live Streaming Data** - Daily updates from TMDB API for Netflix, Prime Video, Disney+, Hulu, and Max
- **Interactive Tracking** - Check off watched movies (saved in browser localStorage)
- **Service Filtering** - Select which services you have, see availability color-coded
- **Static HTML/CSS** - Fast, simple, works everywhere
- **Auto-Updates** - GitHub Actions runs daily to refresh streaming data
- **Zero Cost Hosting** - Runs entirely on GitHub Pages

## Live Demo

Once deployed: `https://yourusername.github.io/streaminggoodmovielist`

## Color Coding

- **Green** - Unwatched & available on your services
- **Greyish Red** - Unwatched & not available on your services
- **Light Grey** - Watched & available
- **Grey** - Watched & not available

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/streaminggoodmovielist.git
cd streaminggoodmovielist
npm install
```

### 2. Get TMDB API Key

1. Create free account at [TMDB](https://www.themoviedb.org/signup)
2. Go to Settings → API
3. Request API key (choose "Developer")
4. Copy your API key

### 3. Local Development

```bash
# Copy template and add your API key
cp .env.template .env
# Edit .env and replace 'your_api_key_here' with your actual key

# Update streaming data (takes ~2 minutes for 250 movies)
npm run update-streaming

# Generate HTML
npm run generate-html

# Open index.html in browser
```

## GitHub Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/streaminggoodmovielist.git
git push -u origin main
```

### 2. Configure GitHub Secret

**Important:** Your `.env` file is NOT committed (it's in `.gitignore`). For GitHub Actions to work:

1. Go to your repository on GitHub
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Name: `TMDB_API_KEY`
5. Value: Paste your TMDB API key
6. Click **Add secret**

### 3. Enable GitHub Pages

1. Go to **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **main**
4. Folder: **/ (root)**
5. Click **Save**

Your site will be live at `https://yourusername.github.io/streaminggoodmovielist` in a few minutes!

## How .env Works with GitHub Actions

### Local Development
- You create a `.env` file locally (not committed)
- Contains: `TMDB_API_KEY=your_key_here`
- Scripts read from this file using `dotenv`

### GitHub Actions (Production)
- `.env` file is **NOT** in the repository (protected by `.gitignore`)
- Instead, the API key is stored as a **GitHub Secret**
- The workflow file (`.github/workflows/update-streaming.yml`) accesses it:
  ```yaml
  env:
    TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
  ```
- GitHub Actions creates a temporary `.env` file during the workflow
- This keeps your API key secure and never exposed in the repo

### Security Benefits
- ✓ API key never committed to Git history
- ✓ Key not visible in public repository
- ✓ Each developer uses their own key locally
- ✓ Production key stored securely in GitHub Secrets

## GitHub Actions Workflow

The workflow runs automatically:
- **Daily at midnight UTC** - Checks all 250 movies for streaming updates
- **Manual trigger** - Go to Actions tab → "Update Streaming Availability" → "Run workflow"

What it does:
1. Fetches latest code
2. Installs dependencies
3. Runs `update-streaming.js` using the secret API key
4. Generates new HTML
5. Commits changes if data changed
6. Pushes to repository (triggers GitHub Pages deployment)

## Project Structure

```
streaminggoodmovielist/
├── .github/
│   └── workflows/
│       └── update-streaming.yml    # Daily update workflow
├── assets/
│   ├── logos/                      # Streaming service PNGs (active/inactive)
│   ├── app.js                      # Client-side interactivity
│   └── styles.css                  # Minimal styling
├── data/
│   └── movies.json                 # Movie data + streaming availability
├── scripts/
│   ├── update-streaming.js         # Fetch from TMDB API
│   ├── generate-html.js            # Build static page
│   └── randomize-streaming.js      # For testing
├── index.html                      # Generated output (deployed)
├── package.json
├── .env.template                   # Template for local setup
├── .gitignore                      # Protects .env
└── README.md
```

## Scripts

```bash
npm run update-streaming  # Update streaming data from TMDB
npm run generate-html     # Generate static HTML page
npm run build             # Run both in sequence
```

## Data Sources

- **Movie List**: IMDb Top 250
- **Streaming Availability**: [The Movie Database (TMDB)](https://www.themoviedb.org/) API
- **Region**: United States

## Browser Storage

- **Watched movies**: Stored in `localStorage` as JSON (~2KB for 250 movies)
- **Service preferences**: Stored in `localStorage` (~100 bytes)
- **No cookies used**
- **Data persists** across browser sessions
- **Private**: Never leaves your browser

## Updating the Movie List

To refresh the IMDb Top 250 list (manual, ~yearly):

1. Download the list HTML from IMDb
2. Place in `/temp/imdb250.htm`
3. Run parser script
4. Commit changes

(Automation coming soon)

## API Rate Limits

- **TMDB Free Tier**: 40 requests/10 seconds
- **This app**: 250ms delay between requests (4/second)
- **Daily update**: ~250 requests, well within limits

## License

MIT

## Credits

- Movie data from [IMDb](https://www.imdb.com/)
- Streaming availability from [TMDB](https://www.themoviedb.org/)
