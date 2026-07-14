const API_KEY = '39321ba3'; 
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&`;

// --- DOM ELEMENT REFERENCES ---
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const movieGrid = document.getElementById('movie-grid');
const sectionTitle = document.getElementById('section-title');
const statusMessage = document.getElementById('status-message');

// Modal Elements
const movieModal = document.getElementById('movie-modal');
const closeModal = document.getElementById('close-modal');
const modalBody = document.getElementById('modal-body');

// --- APP INITIALIZER (DEFAULT VALUE CALL) ---
document.addEventListener('DOMContentLoaded', () => {
    // Dynamically populate trending content on load so it's never hardcoded blank
    fetchMovies('Space', true); 
});

// --- EVENT ROUTING ---
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerms = searchInput.value.trim();
    if (searchTerms) {
        fetchMovies(searchTerms, false);
    }
});

// Close modal triggers
closeModal.addEventListener('click', () => movieModal.classList.add('hidden'));
movieModal.addEventListener('click', (e) => {
    if (e.target === movieModal) movieModal.classList.add('hidden');
});

// --- CORE ASYNC API FETCH ACTION ---
async function fetchMovies(query, isTrending = false) {
    try {
        statusMessage.textContent = 'Searching archive library...';
        movieGrid.innerHTML = ''; 

        const response = await fetch(`${BASE_URL}s=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Network error.');

        const data = await response.json();

        if (data.Response === "True") {
            statusMessage.textContent = '';
            // Dynamically alter header title safely
            sectionTitle.textContent = isTrending ? 'Trending Archive Collection' : `Search Results for "${query}"`;
            displayResults(data.Search);
        } else {
            statusMessage.textContent = `No results found for "${query}".`;
        }
    } catch (error) {
        console.error(error);
        statusMessage.textContent = 'System connection error. Please try again.';
    }
}

// --- RENDERING LAYER GRID ENGINE ---
function displayResults(movies) {
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        
        // Stash the imdbID on the element container dataset safely
        movieCard.dataset.id = movie.imdbID;

        const posterHTML = movie.Poster !== "N/A" 
            ? `<img src="${movie.Poster}" alt="${movie.Title}">`
            : `<div class="no-poster">No Image Available</div>`;

        movieCard.innerHTML = `
            <div class="poster-wrapper">
                ${posterHTML}
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <div class="movie-meta">
                    <span>${movie.Year}</span>
                    <span>${movie.Type.toUpperCase()}</span>
                </div>
            </div>
        `;

        // Click handler to load deep single item metadata specs
        movieCard.addEventListener('click', () => {
            fetchMovieDetails(movie.imdbID);
        });

        movieGrid.appendChild(movieCard);
    });
}

// --- SPECIFIC ITEM SINGLE LOOKUP BY IMDB ID ---
async function fetchMovieDetails(id) {
    try {
        statusMessage.textContent = 'Loading cinematic file entries...';
        
        // Call via "i=" target path instead of search bundle array parameters
        const response = await fetch(`${BASE_URL}i=${id}&plot=full`);
        if (!response.ok) throw new Error('Failed to retrieve specific content details.');

        const movie = await response.json();
        statusMessage.textContent = '';

        // Inject deep analytical detail metrics cleanly inside the view modal panel
        modalBody.innerHTML = `
            <div class="details-layout">
                <img class="details-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : ''}" alt="${movie.Title}" onerror="this.style.display='none'">
                <div class="details-info">
                    <h2 class="details-title">${movie.Title}</h2>
                    <div class="details-meta-line">
                        <span>Released: ${movie.Year}</span>
                        <span>Rating: ${movie.imdbRating}/10</span>
                        <span>Runtime: ${movie.Runtime}</span>
                    </div>
                    <p class="details-plot">${movie.Plot !== 'N/A' ? movie.Plot : 'No dynamic narrative plot descriptions filed.'}</p>
                    <div class="details-crew">
                        <p><strong>Director:</strong> ${movie.Director}</p>
                        <p><strong>Cast Stars:</strong> ${movie.Actors}</p>
                        <p><strong>Genre Tagging:</strong> ${movie.Genre}</p>
                    </div>
                </div>
            </div>
        `;

        // Unveil view visibility
        movieModal.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        statusMessage.textContent = 'Failed to load movie details file.';
    }
}
