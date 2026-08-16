// -----------------------------
// Update the cart header
// -----------------------------
function updateCartHeader() {
    const cart = JSON.parse(localStorage.getItem("cart") || "{}");

    const navbar = document.querySelector("nav.navbar");
    if (!navbar) return;

    const countEl  = navbar.querySelector("#cart-count");
    const preview  = navbar.querySelector("#cart-preview");
    const totalEl  = navbar.querySelector("#cart-total");

    if (!countEl || !preview || !totalEl) return;

    const count = Object.values(cart).reduce((a, b) => a + b, 0);
    countEl.textContent = count;

    preview.innerHTML = "";
    let total = 0;

    Object.keys(cart).forEach(id => {
        const qty = cart[id];
        const product = (window.allProducts || []).find(p => String(p.id) === String(id));
        if (!product) return;

        const price = (Number(product.price) || 0) * qty;
        total += price;

        let imgSrc = "";
        try { imgSrc = (typeof getGalleryImage === 'function') ? getGalleryImage(product) : ""; } catch {}

        const item = document.createElement("div");
        item.className = "cart-item";
        item.innerHTML = `
            <div class="cart-item-row">
                <img src="${imgSrc}" class="cart-thumb" alt="${product.name || ''}">
                <div class="cart-item-info">
                    <span>${product.name || ''}</span>
                    <span>£${price.toFixed(2)} (${qty})</span>
                </div>
            </div>
        `;
        preview.appendChild(item);
    });

    totalEl.textContent = total.toFixed(2);
}

function onProductsLoadedUpdateCart() {
    try { updateCartHeader(); } catch (e) { console.warn('updateCartHeader failed after products:loaded', e); }
}
window.addEventListener('products:loaded', onProductsLoadedUpdateCart, { once: true });

function updateCart(id, qty) {
    let cart = JSON.parse(localStorage.getItem("cart") || "{}");
    cart[id] = qty;
    localStorage.setItem("cart", JSON.stringify(cart));
    try { updateCartHeader(); } catch (e) { console.warn('updateCartHeader error on updateCart', e); }
}

try { updateCartHeader(); } catch (e) { /* ignore */ }