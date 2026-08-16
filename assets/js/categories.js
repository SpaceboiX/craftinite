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
    activeCategory = category;

    const productsList = Array.isArray(window.allProducts) ? window.allProducts : [];

    let list = (category === "All")
        ? productsList
        : productsList.filter(p => p.type === category);

    renderProducts(list);
    setupIndexCartButtons();

    const sections = document.querySelectorAll('.product-section');

    if (category === "All") {
        sections.forEach(sec => sec.style.display = 'block');
        return;
    }

    sections.forEach(sec => {
        const type = sec.getAttribute('data-type');
        sec.style.display = (type === category) ? 'block' : 'none';
    });
}