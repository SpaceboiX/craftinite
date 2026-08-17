document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        window.searchQuery = searchInput.value.trim().toLowerCase();
        applyFilters();
    });
});