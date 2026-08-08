// -----------------------------
// product-page.js (patched to use window.allProducts)
// -----------------------------

function initProductPage(products) {
    // Accept an optional products array, otherwise fall back to the global window.allProducts
    const productsList = (Array.isArray(products) && products.length) ? products : (window.allProducts || []);

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    const product = productsList.find(p => String(p.id) === String(productId));

    if (!product) {
        document.body.innerHTML = "<h1>Product not found</h1>";
        return;
    }

    // Update text
    const h1 = document.querySelector("h1");
    if (h1) h1.textContent = product.name;

    const typeEl = document.querySelector(".text-muted");
    if (typeEl) typeEl.textContent = `Type: ${product.type}`;

    const priceEl = document.querySelector(".price");
    if (priceEl) priceEl.textContent = `£${(Number(product.price) || 0).toFixed(2)}`;

    const descEl = document.querySelector(".description");
    if (descEl) descEl.textContent = product.description;

    // Build image carousel
    buildCarousel(product);

    // Setup cart button
    setupCart(product);
}

function buildCarousel(product) {
    const carouselInner = document.querySelector(".carousel-inner");
    const indicators = document.querySelector(".carousel-indicators");
    if (!carouselInner || !indicators) return;

    carouselInner.innerHTML = "";
    indicators.innerHTML = "";

    let index = 1;

    function tryLoad() {
        // Use the shared helpers if available, otherwise fallback to simple normalization
        const folder = (typeof normalizeFolder === 'function') ? normalizeFolder(product.type) : String(product.type || '').toLowerCase().replace(/\s+/g, '');
        const id = (typeof normalizeId === 'function') ? normalizeId(product.id) : String(product.id || '').toLowerCase();

        const img = new Image();
        img.src = `assets/img/products/${folder}/${id}_${index}.webp`;

        img.onload = () => {
            const item = document.createElement("div");
            item.className = `carousel-item ${index === 1 ? "active" : ""}`;
            item.innerHTML = `<img class="img-fluid w-100 d-block" src="${img.src}" />`;
            carouselInner.appendChild(item);

            const indicator = document.createElement("button");
            indicator.type = "button";
            indicator.dataset.bsTarget = "#carousel-1";
            indicator.dataset.bsSlideTo = index - 1;
            if (index === 1) indicator.classList.add("active");
            indicators.appendChild(indicator);

            index++;
            tryLoad();
        };

        img.onerror = () => {
            // stop loading further images when one fails (assumes sequential naming)
        };
    }

    tryLoad();
}

function setupCart(product) {
    const btn = document.querySelector(".add-to-cart-btn");
    if (!btn) return;

    // If already in cart, show quantity selector immediately
    let cart = JSON.parse(localStorage.getItem("cart") || "{}");
    if (cart[product.id]) {
        renderProductQtySelector(product.id, cart[product.id]);
        return;
    }

    // Otherwise show Add to Cart button
    btn.addEventListener("click", (e) => {
        e.stopPropagation();

        updateCart(product.id, 1);
        renderProductQtySelector(product.id, 1);
    });
}

function updateCart(id, qty) {
    let cart = JSON.parse(localStorage.getItem("cart") || "{}");
    cart[id] = qty;
    localStorage.setItem("cart", JSON.stringify(cart));
    try { updateCartHeader(); } catch (e) { /* ignore if header not present */ }
}

function updateCartHeader() {
    let cart = JSON.parse(localStorage.getItem("cart") || "{}");
    let totalQty = Object.values(cart).reduce((a, b) => a + b, 0);
    const el = document.getElementById("cart-count");
    if (el) el.textContent = totalQty;
}

function renderProductQtySelector(id, qty) {
    const container = document.querySelector(".add-to-cart-container");
    if (!container) return;

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
        try { updateCartHeader(); } catch (e) { /* ignore */ }

        // Restore Add to Cart button
        container.innerHTML = `
            <button class="btn btn-primary add-to-cart-btn">Add to Cart</button>
        `;

        const btn = container.querySelector(".add-to-cart-btn");
        if (btn) {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                cart[id] = 1;
                localStorage.setItem("cart", JSON.stringify(cart));
                try { updateCartHeader(); } catch (e) { /* ignore */ }
                renderProductQtySelector(id, 1);
            });
        }

    } else {
        // User said no → restore quantity to 1
        updateCart(id, 1);
        const q = container.querySelector(".qty");
        if (q) q.textContent = 1;
    }
}