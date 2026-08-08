document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();

        // Defensive: use window.allProducts
        const productsList = Array.isArray(window.allProducts) ? window.allProducts : [];

        let filtered = productsList;

        // Tag filter first
        if (typeof activeTag !== 'undefined' && activeTag) {
            filtered = filtered.filter(p => p.tags && p.tags.includes(activeTag));
        }

        // Category filter second
        if (typeof activeCategory !== 'undefined' && activeCategory && activeCategory !== "All") {
            filtered = filtered.filter(p => p.type === activeCategory);
        }

        // Search filter last
        if (query) {
            filtered = filtered.filter(p => {
                const fields = [
                    p.name || '',
                    p.id || '',
                    p.description || '',
                    ...(p.tags || [])
                ].join(' ').toLowerCase();

                return fields.includes(query);
            });
        }

        if (typeof renderProducts === 'function') renderProducts(filtered);
    });
});