// Storage keys
const WATCHED_KEY = 'watchedMovies';
const SERVICES_KEY = 'selectedServices';

// Get watched movies from localStorage
function getWatchedMovies() {
  const stored = localStorage.getItem(WATCHED_KEY);
  return stored ? JSON.parse(stored) : {};
}

// Save watched movies to localStorage
function saveWatchedMovies(watchedMovies) {
  localStorage.setItem(WATCHED_KEY, JSON.stringify(watchedMovies));
}

// Get selected services from localStorage
function getSelectedServices() {
  const stored = localStorage.getItem(SERVICES_KEY);
  // Default: all services selected
  return stored ? JSON.parse(stored) : {
    netflix: true,
    prime: true,
    disney: true,
    hulu: true,
    max: true
  };
}

// Save selected services to localStorage
function saveSelectedServices(services) {
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
}

// Check if a movie is available on any of the user's selected services
function isAvailableOnSelectedServices(row, selectedServices) {
  // Get the streaming data from the row's data attribute
  const streamingData = JSON.parse(row.dataset.streaming);

  // Check if available on any selected service
  for (const service in selectedServices) {
    if (selectedServices[service] && streamingData[service]) {
      return true;
    }
  }
  return false;
}

// Update row styling based on watched state and availability
function updateRowState(row) {
  const imdbId = row.dataset.imdbId;
  const watchedMovies = getWatchedMovies();
  const selectedServices = getSelectedServices();

  const isWatched = watchedMovies[imdbId] || false;
  const isAvailable = isAvailableOnSelectedServices(row, selectedServices);

  // Remove all state classes
  row.classList.remove('unwatched-unavailable', 'unwatched-available', 'watched-unavailable', 'watched-available');

  // Add appropriate state class
  if (!isWatched && !isAvailable) {
    row.classList.add('unwatched-unavailable');
  } else if (!isWatched && isAvailable) {
    row.classList.add('unwatched-available');
  } else if (isWatched && !isAvailable) {
    row.classList.add('watched-unavailable');
  } else if (isWatched && isAvailable) {
    row.classList.add('watched-available');
  }
}

// Update all row states
function updateAllRowStates() {
  const rows = document.querySelectorAll('tr[data-imdb-id]');
  rows.forEach(updateRowState);
}

// Initialize checkboxes from localStorage
function initializeCheckboxes() {
  const watchedMovies = getWatchedMovies();
  const checkboxes = document.querySelectorAll('.watched-checkbox');

  checkboxes.forEach(checkbox => {
    const imdbId = checkbox.dataset.imdbId;
    checkbox.checked = watchedMovies[imdbId] || false;
  });
}

// Initialize service selector from localStorage
function initializeServiceSelector() {
  const selectedServices = getSelectedServices();

  for (const service in selectedServices) {
    const checkbox = document.getElementById(`service-${service}`);
    if (checkbox) {
      checkbox.checked = selectedServices[service];
    }
  }
}

// Handle watched checkbox change
function handleWatchedChange(event) {
  const checkbox = event.target;
  const imdbId = checkbox.dataset.imdbId;
  const watchedMovies = getWatchedMovies();

  watchedMovies[imdbId] = checkbox.checked;
  saveWatchedMovies(watchedMovies);

  // Update the row's state
  const row = checkbox.closest('tr');
  updateRowState(row);
}

// Handle service checkbox change
function handleServiceChange(event) {
  const checkbox = event.target;
  const service = checkbox.dataset.service;
  const selectedServices = getSelectedServices();

  selectedServices[service] = checkbox.checked;
  saveSelectedServices(selectedServices);

  // Update all row states
  updateAllRowStates();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize checkboxes
  initializeCheckboxes();
  initializeServiceSelector();

  // Add event listeners to watched checkboxes
  const watchedCheckboxes = document.querySelectorAll('.watched-checkbox');
  watchedCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleWatchedChange);
  });

  // Add event listeners to service checkboxes
  const serviceCheckboxes = document.querySelectorAll('.service-checkbox');
  serviceCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleServiceChange);
  });

  // Initialize all row states
  updateAllRowStates();
});
