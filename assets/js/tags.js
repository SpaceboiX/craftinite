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
            window.activeTag = null;
            badge.style.display = 'none';
            applyFilters();
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
    window.activeTag = tag;
    applyFilters();
}