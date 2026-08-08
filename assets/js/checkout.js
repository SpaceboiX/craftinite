// -----------------------------
// checkout.js - robust init (with weight-based shipping + quantity controls + EmailJS)
// -----------------------------

let shippingRules = {};

// Load shipping.json
function loadShippingRules() {
    return fetch('/assets/js/shipping.json')
        .then(res => res.json())
        .then(data => shippingRules = data)
        .catch(err => console.error("Failed to load shipping.json:", err));
}

// Calculate shipping based on country + method + weight
function calculateShipping(country, method, items) {
    const rules = shippingRules[country]?.[method];
    if (!rules) return 0;

    const base = Number(rules.base || 0);
    const perGram = Number(rules.perGram || 0);

    const totalWeight = items.reduce((sum, item) => {
        const product = window.allProducts.find(p => String(p.id) === String(item.id));
        return sum + ((product?.weight || 0) * item.qty);
    }, 0);

    return base + (totalWeight * perGram);
}

// Render checkout items into the page
function loadCheckoutCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "{}");
    const itemsContainer = document.getElementById("checkout-items");
    const totalEl = document.getElementById("checkout-total");
    const shippingEl = document.getElementById("checkout-shipping");

    if (!itemsContainer || !totalEl || !shippingEl) return;

    itemsContainer.innerHTML = "";

    if (!Array.isArray(window.allProducts) || window.allProducts.length === 0) {
        itemsContainer.innerHTML = '<div class="text-muted">Loading order…</div>';
        totalEl.textContent = "0.00";
        shippingEl.textContent = "0.00";
        return;
    }

    let subtotal = 0;
    const ids = Object.keys(cart);

    if (ids.length === 0) {
        itemsContainer.innerHTML = '<div class="text-muted">Your cart is empty.</div>';
        totalEl.textContent = "0.00";
        shippingEl.textContent = "0.00";
        return;
    }

    const items = ids.map(id => {
        const product = window.allProducts.find(p => String(p.id) === String(id));
        const qty = Number(cart[id]) || 0;

        if (!product) return null;

        const price = Number(product.price) || 0;
        const line = price * qty;
        subtotal += line;

        const itemEl = document.createElement("div");
        itemEl.className = "checkout-item mb-3";
        itemEl.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <img src="${getGalleryImage(product)}" class="checkout-thumb" alt="${product.name}">
                <div>
                    <div><strong>${product.name}</strong></div>

                    <div class="checkout-qty mt-1">
                        <button class="btn btn-sm btn-secondary checkout-minus" data-id="${id}">-</button>
                        <span class="mx-2">${qty}</span>
                        <button class="btn btn-sm btn-secondary checkout-plus" data-id="${id}">+</button>
                    </div>

                    <div class="mt-1">£${line.toFixed(2)}</div>
                    <div class="text-muted small">Weight: ${product.weight || 0}g each</div>
                </div>
            </div>
        `;
        itemsContainer.appendChild(itemEl);

        return {
            id,
            qty,
            price,
            weight: Number(product.weight || 0)
        };
    }).filter(Boolean);

    setupCheckoutQtyControls();

    const country = document.getElementById("checkout-country").value;
    const method = document.getElementById("checkout-shipping-method").value;

    const shipping = calculateShipping(country, method, items);
    const finalTotal = subtotal + shipping;

    shippingEl.textContent = shipping.toFixed(2);
    totalEl.textContent = finalTotal.toFixed(2);
}

// Quantity controls
function setupCheckoutQtyControls() {
    document.querySelectorAll(".checkout-minus").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            let cart = JSON.parse(localStorage.getItem("cart") || "{}");

            if (cart[id] > 1) {
                cart[id]--;
            } else {
                if (confirm("Remove this item from your basket?")) {
                    delete cart[id];
                }
            }

            localStorage.setItem("cart", JSON.stringify(cart));
            loadCheckoutCart();
            updateCartHeader();
        });
    });

    document.querySelectorAll(".checkout-plus").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            let cart = JSON.parse(localStorage.getItem("cart") || "{}");

            cart[id] = (cart[id] || 0) + 1;

            localStorage.setItem("cart", JSON.stringify(cart));
            loadCheckoutCart();
            updateCartHeader();
        });
    });
}

// Build order object safely
function buildOrderObject(customer) {
    const cart = JSON.parse(localStorage.getItem("cart") || "{}");

    const items = Object.keys(cart).map(id => {
        const product = window.allProducts.find(p => String(p.id) === String(id));
        return {
            id,
            name: product?.name || null,
            qty: Number(cart[id]) || 0,
            price: Number(product?.price || 0),
            weight: Number(product?.weight || 0)
        };
    }).filter(i => i.name !== null);

    const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);

    const country = document.getElementById("checkout-country").value;
    const method = document.getElementById("checkout-shipping-method").value;
    const shipping = calculateShipping(country, method, items);

    return {
        customer,
        items,
        subtotal,
        shipping,
        total: subtotal + shipping,
        timestamp: new Date().toISOString()
    };
}

// Send order email via EmailJS
async function sendOrderEmail(order) {
    return emailjs.send("service_craftinite", "template_craftinite", {
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        customer_phone: order.customer.phone,
        customer_address: `${order.customer.address1}, ${order.customer.city}, ${order.customer.postcode}, ${order.customer.country}`,
        order_items: order.items.map(i => `${i.qty} × ${i.name} (£${(i.qty * i.price).toFixed(2)})`).join("\n"),
        order_subtotal: order.subtotal.toFixed(2),
        order_shipping: order.shipping.toFixed(2),
        order_total: order.total.toFixed(2),
        order_timestamp: order.timestamp
    });
}

// Validation
function validateCheckout() {
    const fields = {
        name: document.getElementById("checkout-name").value.trim(),
        email: document.getElementById("checkout-email").value.trim(),
        phone: document.getElementById("checkout-phone").value.trim(),
        address1: document.getElementById("checkout-address1").value.trim(),
        city: document.getElementById("checkout-city").value.trim(),
        postcode: document.getElementById("checkout-postcode").value.trim(),
        country: document.getElementById("checkout-country").value.trim()
    };

    for (const key in fields) {
        if (!fields[key]) {
            alert("Please fill out all required fields.");
            return false;
        }
    }

    if (!fields.email.includes("@")) {
        alert("Please enter a valid email address.");
        return false;
    }

    return fields;
}

function setupCheckoutSubmit() {
    const btn = document.getElementById("checkout-submit");
    if (!btn) return;

    btn.addEventListener("click", async () => {
        const customer = validateCheckout();
        if (!customer) return;

        const order = buildOrderObject(customer);
        console.log("ORDER OBJECT:", order);

        try {
            await sendOrderEmail(order);
            alert("Order sent! Payment integration coming next.");
        } catch (err) {
            console.error(err);
            alert("There was a problem sending the order email.");
        }
    });
}

// -----------------------------
// Initialization
// -----------------------------
(function initCheckout() {
    async function initOnce() {
        await loadShippingRules();
        updateCartHeader();
        loadCheckoutCart();
        setupCheckoutSubmit();
    }

    if (Array.isArray(window.allProducts) && window.allProducts.length) {
        document.addEventListener('DOMContentLoaded', initOnce, { once: true });
        if (document.readyState !== 'loading') initOnce();
    } else {
        window.addEventListener('products:loaded', () => {
            document.addEventListener('DOMContentLoaded', initOnce, { once: true });
            if (document.readyState !== 'loading') initOnce();
        }, { once: true });
    }

    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            loadCheckoutCart();
            updateCartHeader();
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.id === "checkout-country" || e.target.id === "checkout-shipping-method") {
            loadCheckoutCart();
        }
    });
})();