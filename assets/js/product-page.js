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
        <div class="quantity-selector d-flex align-items-center">
            <button class="btn btn-secondary minus">-</button>

            <input type="number"
                   class="index-qty-input mx-2"
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
        let current = parseInt(input.value, 10);

        if (current > 1) {
            current--;
            input.value = current;
            updateCart(id, current);
        } else {
            showRemoveConfirmation(id, container);
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
        let newQty = parseInt(input.value, 10);

        if (isNaN(newQty) || newQty < 1) {
            newQty = 1;
            input.value = 1;
        }

        updateCart(id, newQty);
    });
}

function showRemoveConfirmation(id, container) {
    let cart = JSON.parse(localStorage.getItem("cart") || "{}");
    delete cart[id];
    localStorage.setItem("cart", JSON.stringify(cart));
    try { updateCartHeader(); } catch (e) {}

    container.innerHTML = `
        <button class="btn btn-primary add-to-cart-btn">Add to Cart</button>
    `;

    const btn = container.querySelector(".add-to-cart-btn");
    if (btn) {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            cart[id] = 1;
            localStorage.setItem("cart", JSON.stringify(cart));
            try { updateCartHeader(); } catch (e) {}
            renderProductQtySelector(id, 1);
        });
    }
}

// -----------------------------
// Dynamic Meta Tags (Discord / Twitter)
// -----------------------------
const ogTitle   = document.querySelector('meta[property="og:title"]');
const ogDesc    = document.querySelector('meta[property="og:description"]');
const ogImage   = document.querySelector('meta[property="og:image"]');
const ogUrl     = document.querySelector('meta[property="og:url"]');

const twTitle   = document.querySelector('meta[name="twitter:title"]');
const twDesc    = document.querySelector('meta[name="twitter:description"]');
const twImage   = document.querySelector('meta[name="twitter:image"]');

// Use your existing image helper if available
let imgSrc = "";
try {
    imgSrc = (typeof getGalleryImage === "function")
        ? getGalleryImage(product)
        : `assets/img/products/${String(product.type).toLowerCase().replace(/\s+/g,'')}/${String(product.id).toLowerCase()}_1.webp`;
} catch {
    imgSrc = "";
}

if (ogTitle) ogTitle.setAttribute("content", product.name);
if (ogDesc)  ogDesc.setAttribute("content", product.description);
if (ogImage) ogImage.setAttribute("content", imgSrc);
if (ogUrl)   ogUrl.setAttribute("content", window.location.href);

if (twTitle) twTitle.setAttribute("content", product.name);
if (twDesc)  twDesc.setAttribute("content", product.description);
if (twImage) twImage.setAttribute("content", imgSrc);