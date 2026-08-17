let activeCategory = "All";

document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('[data-category]');

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');

            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            filterByCategory(category);
        });
    });

    const allBtn = document.querySelector('[data-category="All"]');
    if (allBtn) allBtn.classList.add('active');
});

function filterByCategory(category) {
    window.activeCategory = category;
    applyFilters();
}