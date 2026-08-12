// -----------------------------
// categories.js (uses window.allProducts)
// -----------------------------

let activeCategory = "All";

document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('[data-category]');

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');

            // Remove active class from all buttons
            categoryButtons.forEach(b => b.classList.remove('active'));

            // Add active class to the clicked button
            btn.classList.add('active');

            // Apply category filter
            filterByCategory(category);
        });
    });

    // Make "All" active on page load
    const allBtn = document.querySelector('[data-category="All"]');
    if (allBtn) allBtn.classList.add('active');
});

function filterByCategory(category) {
    activeCategory = category;

    // Use window.allProducts (defensive)
    const productsList = Array.isArray(window.allProducts) ? window.allProducts : [];

    let list;

    if (category === "All") {
        list = productsList;
    } else {
        list = productsList.filter(p => p.type === category);
    }

    // ⭐ FIRST: re-render products
    renderProducts(list);

    // ⭐ SECOND: re-attach cart UI (only if function exists)
    if (typeof setupIndexCartButtons === 'function') {
        setupIndexCartButtons();
    }

    // ⭐ THIRD: toggle gallery/vertical mode
    const sections = document.querySelectorAll('.product-section');

    if (category === "All") {
        sections.forEach(sec => {
            sec.style.display = 'block';
            sec.classList.remove('vertical-mode');
            sec.classList.add('gallery-mode');

            const scrollWrapper = sec.querySelector('.scroll-wrapper');
            const verticalContainer = sec.querySelector('.vertical-container');
            if (scrollWrapper) scrollWrapper.style.display = 'flex';
            if (verticalContainer) verticalContainer.style.display = 'none';
        });
        return;
    }

    sections.forEach(sec => {
        const type = sec.getAttribute('data-type');

        if (type === category) {
            sec.style.display = 'block';

            sec.classList.remove('gallery-mode');
            sec.classList.add('vertical-mode');

            const scrollWrapper = sec.querySelector('.scroll-wrapper');
            const verticalContainer = sec.querySelector('.vertical-container');
            if (scrollWrapper) scrollWrapper.style.display = 'none';
            if (verticalContainer) verticalContainer.style.display = 'flex';
        } else {
            sec.style.display = 'none';
        }
    });
}