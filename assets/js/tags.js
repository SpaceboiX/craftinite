let activeTag = null;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-tag]').forEach(item => {
        item.addEventListener('click', () => {
            activeTag = item.getAttribute('data-tag');
            showActiveTagBadge(activeTag);
            filterByTag(activeTag);
        });
    });

    // Badge click clears tag (defensive)
    const badge = document.getElementById('active-tag-badge');
    if (badge) {
        badge.addEventListener('click', () => {
            activeTag = null;
            badge.style.display = 'none';

            // Reset layout to gallery mode
            const sections = document.querySelectorAll('.product-section');
            sections.forEach(sec => {
                sec.style.display = 'block';
                sec.classList.remove('vertical-mode');
                sec.classList.add('gallery-mode');

                const scrollWrapper = sec.querySelector('.scroll-wrapper');
                const verticalContainer = sec.querySelector('.vertical-container');
                if (scrollWrapper) scrollWrapper.style.display = 'flex';
                if (verticalContainer) verticalContainer.style.display = 'none';
            });

            // Defensive: use window.allProducts
            const productsList = Array.isArray(window.allProducts) ? window.allProducts : [];
            if (typeof renderProducts === 'function') renderProducts(productsList);
        });
    }
});

function showActiveTagBadge(tag) {
    const badge = document.getElementById('active-tag-badge');
    if (!badge) return;
    badge.textContent = `Tag Active: ${tag}`;
    badge.style.display = 'inline-flex';
}

function filterByTag(tag) {
    const sections = document.querySelectorAll('.product-section');

    // Hide all sections first (defensive)
    sections.forEach(sec => {
        sec.style.display = 'none';
        const scrollWrapper = sec.querySelector('.scroll-wrapper');
        const verticalContainer = sec.querySelector('.vertical-container');
        if (scrollWrapper) scrollWrapper.style.display = 'none';
        if (verticalContainer) verticalContainer.style.display = 'none';
        sec.classList.remove('gallery-mode');
        sec.classList.add('vertical-mode');
    });

    // Defensive: use window.allProducts
    const productsList = Array.isArray(window.allProducts) ? window.allProducts : [];
    const filtered = productsList.filter(p => p.tags && p.tags.includes(tag));

    if (typeof renderProducts === 'function') renderProducts(filtered);

    if (filtered.length > 0) {
        const type = filtered[0].type;
        const section = document.querySelector(`.product-section[data-type="${type}"]`);

        if (section) {
            section.style.display = 'block';
            const scrollWrapper = section.querySelector('.scroll-wrapper');
            const verticalContainer = section.querySelector('.vertical-container');
            if (scrollWrapper) scrollWrapper.style.display = 'none';
            if (verticalContainer) verticalContainer.style.display = 'flex';
        }
    }
}