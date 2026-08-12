// -------------------------
// products.js (patched to expose window.allProducts)
// -------------------------

window.allProducts = [];

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
    // Listen for the custom event
    window.addEventListener('products:loaded', function handler(e) {
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
            // assign to window.allProducts so other scripts can access it
            window.allProducts = Array.isArray(data) ? data : [];

            // Render gallery only on pages that have the gallery containers
            renderProducts(window.allProducts);

            // Only setup index cart buttons if product-actions exist
            if (document.querySelector('.product-actions')) {
                setupIndexCartButtons();
            }

            // Notify listeners that products are ready
            try {
                window.dispatchEvent(new Event('products:loaded'));
            } catch (err) {
                // fallback for older browsers
                const evt = document.createEvent('Event');
                evt.initEvent('products:loaded', true, true);
                window.dispatchEvent(evt);
            }

            // Now that products are loaded, update the cart header if available
            if (typeof updateCartHeader === 'function') {
                try { updateCartHeader(); } catch (err) { console.warn('updateCartHeader error', err); }
            }

            // If this is a product page, attempt to render the product details
            autoRenderProductPageIfPresent();
        })
        .catch(err => {
            console.error("Failed to load /assets/js/products.json:", err);
            // still dispatch so pages can handle gracefully
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

function getVerticalImage(product) {
    const folder = normalizeFolder(product.type);
    const id = normalizeId(product.id);
    return `assets/img/products/${folder}/${id}_1.webp`;
}

/* -------------------------
   Gallery rendering (defensive)
   ------------------------- */

function renderProducts(products) {
    const section3d = document.getElementById('section-3dprints');
    const sectionMugs = document.getElementById('section-mugs');
    const sectionCoasters = document.getElementById('section-coasters');

    const vert3d = document.getElementById('vertical-3dprints');
    const vertMugs = document.getElementById('vertical-mugs');
    const vertCoasters = document.getElementById('vertical-coasters');

    // If none of the gallery containers exist, exit quietly
    if (!section3d && !sectionMugs && !sectionCoasters &&
        !vert3d && !vertMugs && !vertCoasters) {
        return;
    }

    if (section3d) section3d.innerHTML = '';
    if (sectionMugs) sectionMugs.innerHTML = '';
    if (sectionCoasters) sectionCoasters.innerHTML = '';

    if (vert3d) vert3d.innerHTML = '';
    if (vertMugs) vertMugs.innerHTML = '';
    if (vertCoasters) vertCoasters.innerHTML = '';

    products.forEach(product => {
        const galleryImg = getGalleryImage(product);
        const verticalImg = getVerticalImage(product);

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
                <p class="card-text">${product.description}</p>
                <p class="card-price">£${(product.price ?? 0).toFixed(2)}</p>
                <div class="product-actions" data-product-id="${product.id}"></div>
            </div>
        `;

        galleryCard.addEventListener("click", (e) => {
            if (!e.target.closest(".product-actions")) {
                window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
            }
        });

        const verticalCard = document.createElement('div');
        verticalCard.className = 'card product-card';
        verticalCard.style.width = "240px";
        verticalCard.innerHTML = `
            <img src="${verticalImg}" class="card-img-top" alt="${product.name}">
            <div class="card-body">
                <div class="scroll-text-container">
                    <div class="scroll-text">
                        <span>${product.name}</span>
                        <span>${product.name}</span>
                    </div>
                </div>
                <p class="card-text">${product.description}</p>
                <p class="card-price">£${(product.price ?? 0).toFixed(2)}</p>
                <div class="product-actions" data-product-id="${product.id}"></div>
            </div>
        `;

        verticalCard.addEventListener("click", (e) => {
            if (!e.target.closest(".product-actions")) {
                window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
            }
        });

        let galleryTarget = null;
        let verticalTarget = null;

        if (product.type === "3D Print") {
            galleryTarget = section3d;
            verticalTarget = vert3d;
        }
        if (product.type === "Mug") {
            galleryTarget = sectionMugs;
            verticalTarget = vertMugs;
        }
        if (product.type === "Coaster") {
            galleryTarget = sectionCoasters;
            verticalTarget = vertCoasters;
        }

        if (galleryTarget) galleryTarget.appendChild(galleryCard);
        if (verticalTarget) verticalTarget.appendChild(verticalCard);
    });
}

/* -------------------------
   INDEX PAGE CART LOGIC
   (unchanged but defensive)
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
        <div class="quantity-selector">
            <button class="btn btn-secondary minus">-</button>
            <span class="qty">${qty}</span>
            <button class="btn btn-secondary plus">+</button>
        </div>
    `;
    const minus = container.querySelector(".minus");
    const plus = container.querySelector(".plus");
    const qtyDisplay = container.querySelector(".qty");

    if (minus) {
        minus.addEventListener("click", (e) => {
            e.stopPropagation();
            let current = parseInt(qtyDisplay.textContent, 10);
            if (current > 1) {
                current--;
                qtyDisplay.textContent = current;
                updateCart(id, current);
            } else {
                showRemoveConfirmation(id, container);
            }
        });
    }

    if (plus) {
        plus.addEventListener("click", (e) => {
            e.stopPropagation();
            let current = parseInt(qtyDisplay.textContent, 10);
            current++;
            qtyDisplay.textContent = current;
            updateCart(id, current);
        });
    }
}

function showRemoveConfirmation(id, container) {
    if (confirm("Remove this item from your basket?")) {
        let cart = JSON.parse(localStorage.getItem("cart") || "{}");
        delete cart[id];
        localStorage.setItem("cart", JSON.stringify(cart));
        if (typeof updateCartHeader === 'function') updateCartHeader();
        renderAddButton(container, id);
    } else {
        updateCart(id, 1);
        const q = container.querySelector(".qty");
        if (q) q.textContent = 1;
    }
}

/* -------------------------
   Scroll effect (defensive)
   ------------------------- */

const scrollWrappers = document.querySelectorAll('.scroll-wrapper');
if (scrollWrappers && scrollWrappers.length) {
    scrollWrappers.forEach(wrapper => {
        const row = wrapper.querySelector('.scroll-row');
        if (!row) return;
        wrapper.addEventListener('scroll', () => {
            if (wrapper.scrollLeft > 10) {
                row.classList.add('scrolling');
            } else {
                row.classList.remove('scrolling');
            }
        });
    });
}

/* -------------------------
   Product page rendering helpers
   ------------------------- */

function renderProductPage(productId) {
    const product = getProductById(productId);
    if (!product) {
        console.warn('Product not found for id', productId);
        return;
    }

    // Defensive selectors - update these IDs/classes to match your product.html
    const titleEl = document.querySelector('#product-title');
    const priceEl = document.querySelector('#product-price');
    const descEl = document.querySelector('#product-description');
    const imgEl = document.querySelector('#product-image');
    const actionsEl = document.querySelector('#product-actions'); // container for add/qty

    if (titleEl) titleEl.textContent = product.name || '';
    if (priceEl) priceEl.textContent = `£${(product.price ?? 0).toFixed(2)}`;
    if (descEl) descEl.textContent = product.description || '';
    if (imgEl) {
        const src = getGalleryImage(product);
        imgEl.setAttribute('src', src);
        imgEl.setAttribute('alt', product.name || '');
    }

    // Setup product page add/qty UI if container exists
    if (actionsEl) {
        const cart = JSON.parse(localStorage.getItem("cart") || "{}");
        if (cart[product.id]) {
            renderQtySelector(actionsEl, product.id, cart[product.id]);
        } else {
            renderAddButton(actionsEl, product.id);
        }
    }
}

function autoRenderProductPageIfPresent() {
    // If product page has an element with id 'product-page' or 'product-id', try to render
    const productPageRoot = document.getElementById('product-page') || document.querySelector('[data-product-page]');
    if (!productPageRoot) return;

    // Try to get id from data attribute or URL param
    let id = productPageRoot.dataset.productId;
    if (!id) {
        const params = new URLSearchParams(window.location.search);
        id = params.get('id');
    }
    if (!id) return;

    // If products already loaded, render immediately; otherwise wait
    if (Array.isArray(window.allProducts) && window.allProducts.length) {
        renderProductPage(id);
    } else {
        whenProductsLoaded(() => renderProductPage(id));
    }
}

/* -------------------------
   Start loading
   ------------------------- */

document.addEventListener('DOMContentLoaded', loadProducts);