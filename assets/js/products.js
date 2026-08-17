// -------------------------
// products.js (Unified Hybrid Layout)
// -------------------------

window.allProducts = [];
window.activeTag = null; // ⭐ ensure tag is globally accessible
window.activeCategory = "All";
window.searchQuery = "";

function normalizeFolder(type) {
    return String(type || '').toLowerCase().replace(/\s+/g, '');
}

function normalizeId(id) {
    return String(id || '').toLowerCase();
}

/* -------------------------
   Public helpers
   ------------------------- */

function getProductById(id) {
    if (!id) return null;
    return (window.allProducts || []).find(p => String(p.id) === String(id)) || null;
}

function whenProductsLoaded(cb) {
    if (Array.isArray(window.allProducts) && window.allProducts.length) {
        cb(window.allProducts);
        return;
    }
    window.addEventListener('products:loaded', function handler() {
        window.removeEventListener('products:loaded', handler);
        cb(window.allProducts);
    });
}

/* -------------------------
   Load products
   ------------------------- */

function loadProducts() {
    fetch('/assets/js/products.json')
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            window.allProducts = Array.isArray(data) ? data : [];

            renderProducts(window.allProducts);
            setupIndexCartButtons();

            try {
                window.dispatchEvent(new Event('products:loaded'));
            } catch (err) {
                const evt = document.createEvent('Event');
                evt.initEvent('products:loaded', true, true);
                window.dispatchEvent(evt);
            }

            if (typeof updateCartHeader === 'function') {
                try { updateCartHeader(); } catch (err) { console.warn('updateCartHeader error', err); }
            }

            autoRenderProductPageIfPresent();
        })
        .catch(err => {
            console.error("Failed to load /assets/js/products.json:", err);
            try {
                window.dispatchEvent(new Event('products:loaded'));
            } catch (e) {
                const evt = document.createEvent('Event');
                evt.initEvent('products:loaded', true, true);
                window.dispatchEvent(evt);
            }
        });
}

/* -------------------------
   Image helpers
   ------------------------- */

function getGalleryImage(product) {
    const folder = normalizeFolder(product.type);
    const id = normalizeId(product.id);
    return `assets/img/products/${folder}/${id}_1.webp`;
}

function applyFilters() {
    let filtered = window.allProducts;

    // Category filter
    if (window.activeCategory && window.activeCategory !== "All") {
        filtered = filtered.filter(p => p.type === window.activeCategory);
        document.body.classList.add("vertical-active");
    } else {
        document.body.classList.remove("vertical-active");
    }

    // Tag filter
    if (window.activeTag) {
        filtered = filtered.filter(p => p.tags && p.tags.includes(window.activeTag));
    }

    // Search filter
    if (window.searchQuery) {
        const q = window.searchQuery.toLowerCase();
        filtered = filtered.filter(p => {
            const fields = [
                p.name || "",
                p.description || "",
                ...(p.tags || [])
            ].join(" ").toLowerCase();
            return fields.includes(q);
        });
    }

    renderProducts(filtered);
    setupIndexCartButtons();
}

/* -------------------------
   Unified gallery rendering
   ------------------------- */

function renderProducts(products) {
    const section3d = document.getElementById('section-3dprints');
    const sectionMugs = document.getElementById('section-mugs');
    const sectionCoasters = document.getElementById('section-coasters');
    
    const vertical3d = document.getElementById('vertical-3dprints');
    const verticalMugs = document.getElementById('vertical-mugs');
    const verticalCoasters = document.getElementById('vertical-coasters');

    if (vertical3d) vertical3d.innerHTML = '';
    if (verticalMugs) verticalMugs.innerHTML = '';
    if (verticalCoasters) verticalCoasters.innerHTML = '';

    if (section3d) section3d.innerHTML = '';
    if (sectionMugs) sectionMugs.innerHTML = '';
    if (sectionCoasters) sectionCoasters.innerHTML = '';

    products.forEach(product => {
        const galleryImg = getGalleryImage(product);

        const galleryCard = document.createElement('div');
        galleryCard.className = 'card product-card';
        galleryCard.style.width = "240px";
        galleryCard.innerHTML = `
            <img src="${galleryImg}" class="card-img-top" alt="${product.name}">
            <div class="card-body">
                <div class="scroll-text-container">
                    <div class="scroll-text">
                        <span>${product.name}</span>
                        <span>${product.name}</span>
                    </div>
                </div>
                <p class="product-card-description">${product.description}</p>
                <p class="card-price">£${(product.price ?? 0).toFixed(2)}</p>
                <div class="product-actions" data-product-id="${product.id}"></div>
            </div>
        `;

        galleryCard.addEventListener("click", (e) => {
            if (!e.target.closest(".product-actions")) {
                window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
            }
        });

        let galleryTarget = null;

        if (product.type === "3D Print") galleryTarget = section3d;
        if (product.type === "Mug") galleryTarget = sectionMugs;
        if (product.type === "Coaster") galleryTarget = sectionCoasters;

        if (galleryTarget) galleryTarget.appendChild(galleryCard);

        // Vertical grid population
        if (product.type === "3D Print" && vertical3d) vertical3d.appendChild(galleryCard.cloneNode(true));
        if (product.type === "Mug" && verticalMugs) verticalMugs.appendChild(galleryCard.cloneNode(true));
        if (product.type === "Coaster" && verticalCoasters) verticalCoasters.appendChild(galleryCard.cloneNode(true));
    });
}

/* -------------------------
   INDEX PAGE CART LOGIC
   ------------------------- */

function setupIndexCartButtons() {
    let cart = JSON.parse(localStorage.getItem("cart") || "{}");

    const actionContainers = document.querySelectorAll(".product-actions");
    if (!actionContainers || actionContainers.length === 0) return;

    actionContainers.forEach(container => {
        const id = container.dataset.productId;
        if (cart[id]) {
            renderQtySelector(container, id, cart[id]);
        } else {
            renderAddButton(container, id);
        }
    });
}

function renderAddButton(container, id) {
    container.innerHTML = `<button class="btn btn-primary add-to-cart-btn">Add to Cart</button>`;
    const btn = container.querySelector(".add-to-cart-btn");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        let cart = JSON.parse(localStorage.getItem("cart") || "{}");
        cart[id] = 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        if (typeof updateCartHeader === 'function') updateCartHeader();
        renderQtySelector(container, id, 1);
    });
}

function renderQtySelector(container, id, qty) {
    container.innerHTML = `
        <div class="quantity-selector d-flex align-items-center">
            <button class="btn btn-secondary minus">-</button>

            <input type="number"
                   class="index-qty-input mx-2"
                   data-id="${id}"
                   value="${qty}"
                   min="1">

            <button class="btn btn-secondary plus">+</button>
        </div>
    `;

    const minus = container.querySelector(".minus");
    const plus = container.querySelector(".plus");
    const input = container.querySelector(".index-qty-input");

    minus.addEventListener("click", (e) => {
        e.stopPropagation();
        let cart = JSON.parse(localStorage.getItem("cart") || "{}");
        let current = parseInt(input.value, 10);

        if (current > 1) {
            current--;
            input.value = current;
            updateCart(id, current);
        } else {
            delete cart[id];
            localStorage.setItem("cart", JSON.stringify(cart));
            if (typeof updateCartHeader === 'function') updateCartHeader();
            renderAddButton(container, id);
        }
    });

    plus.addEventListener("click", (e) => {
        e.stopPropagation();
        let current = parseInt(input.value, 10);
        current++;
        input.value = current;
        updateCart(id, current);
    });

    input.addEventListener("change", () => {
        let cart = JSON.parse(localStorage.getItem("cart") || "{}");
        let newQty = parseInt(input.value, 10);

        if (isNaN(newQty) || newQty < 1) {
            newQty = 1;
            input.value = 1;
        }

        cart[id] = newQty;
        localStorage.setItem("cart", JSON.stringify(cart));

        if (typeof updateCartHeader === 'function') updateCartHeader();
    });
}

/* -------------------------
   Product page rendering
   ------------------------- */

function renderProductPage(productId) {
    const product = getProductById(productId);
    if (!product) {
        console.warn('Product not found for id', productId);
        return;
    }

    const titleEl = document.querySelector('#product-title');
    const priceEl = document.querySelector('#product-price');
    const descEl = document.querySelector('#product-description');
    const imgEl = document.querySelector('#product-image');
    const actionsEl = document.querySelector('#product-actions');

    if (titleEl) titleEl.textContent = product.name || '';
    if (priceEl) priceEl.textContent = `£${(product.price ?? 0).toFixed(2)}`;
    if (descEl) descEl.textContent = product.description || '';
    if (imgEl) {
        const src = getGalleryImage(product);
        imgEl.setAttribute('src', src);
        imgEl.setAttribute('alt', product.name || '');
    }
}

function autoRenderProductPageIfPresent() {
    const productPageRoot = document.getElementById('product-page') || document.querySelector('[data-product-page]');
    if (!productPageRoot) return;

    let id = productPageRoot.dataset.productId;
    if (!id) {
        const params = new URLSearchParams(window.location.search);
        id = params.get('id');
    }
    if (!id) return;

    if (Array.isArray(window.allProducts) && window.allProducts.length) {
        renderProductPage(id);
    } else {
        whenProductsLoaded(() => renderProductPage(id));
    }
}

/* -------------------------
   Category + Tag Filtering (FINAL FIX)
   ------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-category]").forEach(btn => {
        btn.addEventListener("click", () => {
            const cat = btn.dataset.category;

            document.body.classList.remove("vertical-active");

            let filtered = window.allProducts;

            // Category filter
            if (cat !== "All") {
                document.body.classList.add("vertical-active");
                filtered = filtered.filter(p => p.type === cat);
            }

            // ⭐ Tag filter (fix)
            if (window.activeTag) {
                filtered = filtered.filter(p => p.tags && p.tags.includes(window.activeTag));
            }

            renderProducts(filtered);
            setupIndexCartButtons();
        });
    });
});

/* -------------------------
   Start loading
   ------------------------- */

document.addEventListener('DOMContentLoaded', loadProducts);