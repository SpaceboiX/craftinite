let activeTag = null;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-tag]').forEach(item => {
        item.addEventListener('click', () => {
            activeTag = item.getAttribute('data-tag');
            showActiveTagBadge(activeTag);
            filterByTag(activeTag);
        });
    });

    const badge = document.getElementById('active-tag-badge');
    if (badge) {
        badge.addEventListener('click', () => {
            activeTag = null;
            badge.style.display = 'none';

            const productsList = Array.isArray(window.allProducts) ? window.allProducts : [];
            renderProducts(productsList);
            setupIndexCartButtons();

            const sections = document.querySelectorAll('.product-section');
            sections.forEach(sec => sec.style.display = 'block');
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
    const productsList = Array.isArray(window.allProducts) ? window.allProducts : [];
    const filtered = productsList.filter(p => p.tags && p.tags.includes(tag));

    renderProducts(filtered);
    setupIndexCartButtons();

    const sections = document.querySelectorAll('.product-section');
    sections.forEach(sec => {
        const type = sec.getAttribute('data-type');
        const hasType = filtered.some(p => p.type === type);
        sec.style.display = hasType ? 'block' : 'none';
    });
}