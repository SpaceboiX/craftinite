// -----------------------------
// checkout.js - Shipping (country + method) + PayPal
// -----------------------------

let shippingRules = {};

// Load shipping.json
async function loadShippingRules() {
    try {
        const res = await fetch('assets/js/shipping.json');
        shippingRules = await res.json();
    } catch (err) {
        console.error("Failed to load shipping.json:", err);
    }
}

// Calculate shipping using country + method + weight
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

// Render checkout items
function loadCheckoutCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "{}");
    const itemsContainer = document.getElementById("checkout-items");
    const totalEl = document.getElementById("checkout-total");
    const shippingEl = document.getElementById("checkout-shipping");

    itemsContainer.innerHTML = "";

    if (!window.allProducts || window.allProducts.length === 0) {
        itemsContainer.innerHTML = '<div class="text-muted">Loading order…</div>';
        totalEl.textContent = "0.00";
        shippingEl.textContent = "0.00";
        return;
    }

    const ids = Object.keys(cart);
    if (ids.length === 0) {
        itemsContainer.innerHTML = '<div class="text-muted">Your cart is empty.</div>';
        totalEl.textContent = "0.00";
        shippingEl.textContent = "0.00";
        return;
    }

    let subtotal = 0;

    const items = ids.map(id => {
        const product = window.allProducts.find(p => String(p.id) === String(id));
        const qty = Number(cart[id]);

        if (!product) return null;

        const line = product.price * qty;
        subtotal += line;

        itemsContainer.innerHTML += `
            <div class="checkout-item mb-3">
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
            </div>
        `;

        return {
            id,
            qty,
            price: product.price,
            weight: product.weight
        };
    }).filter(Boolean);

    setupCheckoutQtyControls();

    const country = document.getElementById("checkout-country").value;
    const method = document.getElementById("checkout-shipping-method").value;

    const shipping = calculateShipping(country, method, items);
    const finalTotal = subtotal + shipping;

    shippingEl.textContent = shipping.toFixed(2);
    totalEl.textContent = finalTotal.toFixed(2);

    window.cartItems = items;
    window.cartSubtotal = subtotal;
    window.cartShipping = shipping;
    window.cartTotal = finalTotal;
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
                delete cart[id];
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

// Build order object using PayPal data
function buildOrderObjectFromPayPal(orderData) {
    const payer = orderData.payer;
    const shipping = orderData.purchase_units[0].shipping.address;

    return {
        customer: {
            name: `${payer.name.given_name} ${payer.name.surname}`,
            email: payer.email_address,
            fullAddress: `${shipping.address_line_1}, ${shipping.admin_area_2}, ${shipping.postal_code}, ${shipping.country_code}`
        },
        items: window.cartItems,
        subtotal: window.cartSubtotal,
        shipping: window.cartShipping,
        total: window.cartTotal,
        timestamp: new Date().toISOString()
    };
}

// Admin Email
async function sendOrderEmail(order) {
    return emailjs.send("service_craftinite", "template_craftinite", {
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        customer_address: order.customer.fullAddress,
        order_items: order.items.map(i => `${i.qty} × ${i.name}`).join("\n"),
        order_subtotal: order.subtotal.toFixed(2),
        order_shipping: order.shipping.toFixed(2),
        order_total: order.total.toFixed(2),
        order_timestamp: order.timestamp
    });
}

// Customer Receipt Email
async function sendCustomerReceipt(order) {
    return emailjs.send("service_craftinite", "template_customer_receipt", {
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        order_items: order.items.map(i => `${i.qty} × ${i.name}`).join("\n"),
        order_subtotal: order.subtotal.toFixed(2),
        order_shipping: order.shipping.toFixed(2),
        order_total: order.total.toFixed(2),
        order_timestamp: order.timestamp
    });
}

// PayPal Buttons
function initPayments() {

    paypal.Buttons({

        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{
                    amount: { value: window.cartTotal.toFixed(2) },
                    description: window.cartItems.map(i => `${i.qty}× ${i.name}`).join(", ")
                }]
            });
        },

        onApprove: async (data, actions) => {
            const orderData = await actions.order.capture();
            const order = buildOrderObjectFromPayPal(orderData);

            await sendOrderEmail(order);
            await sendCustomerReceipt(order);

            localStorage.removeItem("cart");
            window.location.href = "/thank-you.html";
        },

        onError: (err) => {
            console.error("PayPal error:", err);
        }

    }).render('#paypal-button-container');
}

// Wait for products.js to load
function waitForProducts() {
    return new Promise(resolve => {
        const check = () => {
            if (window.allProducts && window.allProducts.length > 0) resolve();
            else setTimeout(check, 50);
        };
        check();
    });
}

// Init
document.addEventListener("DOMContentLoaded", async () => {

    await loadShippingRules();
    await waitForProducts();

    updateCartHeader();
    loadCheckoutCart();
    initPayments();

    // ⭐ Recalculate shipping when user changes country or method
    document.getElementById("checkout-country").addEventListener("change", loadCheckoutCart);
    document.getElementById("checkout-shipping-method").addEventListener("change", loadCheckoutCart);
});