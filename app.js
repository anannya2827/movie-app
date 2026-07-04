const API_KEY = '39321ba3'; 
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&`;

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const movieGrid = document.getElementById('movie-grid');
const statusMessage = document.getElementById('status-message');

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerms = searchInput.value.trim();
    if (searchTerms) {
        fetchMovies(searchTerms);
    }
});

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

function displayResults(movies) {
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

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
        movieGrid.appendChild(movieCard);
    });
}