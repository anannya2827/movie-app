const API_KEY = '39321ba3'; 
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&`;

// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const movieGrid = document.getElementById('movie-grid');
const statusMessage = document.getElementById('status-message');

const detailsModal = document.getElementById('details-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalBody = document.getElementById('modal-body');

// --- DYNAMIC HOME POPULATION ---
// Automatically triggers on load to pull fresh thematic matching datasets dynamically
document.addEventListener('DOMContentLoaded', () => {
    const initialQueries = ['Space', 'Vintage', 'Noir', 'Classic', 'Adventure'];
    const randomDefault = initialQueries[Math.floor(Math.random() * initialQueries.length)];
    fetchMovies(randomDefault);
});

// Search functionality
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerms = searchInput.value.trim();
    if (searchTerms) {
        fetchMovies(searchTerms);
    }
});

// Fetch search collection results
async function fetchMovies(query) {
    try {
        statusMessage.textContent = 'Searching archive library...';
        movieGrid.innerHTML = ''; 

        const response = await fetch(`${BASE_URL}s=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Network error.');

        const data = await response.json();

        if (data.Response === "True") {
            statusMessage.textContent = '';
            displayResults(data.Search);
        } else {
            statusMessage.textContent = `No results found for "${query}".`;
        }
    } catch (error) {
        console.error(error);
        statusMessage.textContent = 'System connection error. Please try again.';
    }
}

// Display search listing cards
function displayResults(movies) {
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        
        // Save the unique IMDb ID to the element's dataset for the details view lookup
        movieCard.dataset.imdbId = movie.imdbID;

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

        // Click Event: Open Detailed view
        movieCard.addEventListener('click', () => {
            fetchMovieDetails(movie.imdbID);
        });

        movieGrid.appendChild(movieCard);
    });
}

// --- DYNAMIC DETAILS VIEW CONTROLLER ---
async function fetchMovieDetails(imdbId) {
    try {
        // Query by specific IMDb ID ('i=') to get full structural detail records
        const response = await fetch(`${BASE_URL}i=${imdbId}&plot=full`);
        if (!response.ok) throw new Error('Details lookup failed.');

        const movie = await response.json();
        
        if (movie.Response === "True") {
            renderModalContent(movie);
            openModal();
        }
    } catch (error) {
        console.error("Error fetching movie details:", error);
    }
}

function renderModalContent(movie) {
    const posterHTML = movie.Poster !== "N/A" 
        ? `<img src="${movie.Poster}" alt="${movie.Title}">`
        : `<div class="no-poster">No Image Available</div>`;

    modalBody.innerHTML = `
        <div class="details-layout">
            <div class="details-poster">
                ${posterHTML}
            </div>
            <div class="details-info">
                <h2>${movie.Title}</h2>
                <p><strong>Released:</strong> ${movie.Released} (${movie.Runtime})</p>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>IMDb Rating:</strong> <span class="rating-badge">★ ${movie.imdbRating}</span></p>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Actors:</strong> ${movie.Actors}</p>
                <hr style="border: 0; border-top: 1px solid #3a352e; margin: 15px 0;">
                <p><strong>Plot Summary:</strong><br>${movie.Plot}</p>
            </div>
        </div>
    `;
}

// Modal Toggle Handlers
function openModal() {
    detailsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
}

function closeModal() {
    detailsModal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Re-enable background scrolling
}

closeModalBtn.addEventListener('click', closeModal);

// Close modal if user clicks outside the modal box container frame
window.addEventListener('click', (e) => {
    if (e.target === detailsModal) {
        closeModal();
    }
});
