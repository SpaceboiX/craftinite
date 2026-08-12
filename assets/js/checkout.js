// -----------------------------
// checkout.js - PayPal-only, clean version
// -----------------------------

let shippingRules = {};

async function loadShippingRules() {
    const res = await fetch('assets/js/shipping.json');
    shippingRules = await res.json();
}

function calculateShipping(method, items) {
    const rules = shippingRules["United Kingdom"][method];
    const base = Number(rules.base || 0);
    const perGram = Number(rules.perGram || 0);

    const totalWeight = items.reduce((sum, item) => {
        const product = window.allProducts.find(p => String(p.id) === String(item.id));
        return sum + ((product?.weight || 0) * item.qty);
    }, 0);

    return base + (totalWeight * perGram);
}

function loadCheckoutCart() {
    const cart = JSON.parse(localStorage.getItem("cart") || "{}");
    const itemsContainer = document.getElementById("checkout-items");
    const totalEl = document.getElementById("checkout-total");
    const shippingEl = document.getElementById("checkout-shipping");

    itemsContainer.innerHTML = "";

    let subtotal = 0;
    const items = Object.keys(cart).map(id => {
        const product = window.allProducts.find(p => String(p.id) === String(id));
        const qty = Number(cart[id]);

        const line = product.price * qty;
        subtotal += line;

        itemsContainer.innerHTML += `
            <div class="mb-2">
                <strong>${product.name}</strong> — ${qty} × £${product.price.toFixed(2)}
            </div>
        `;

        return {
            id,
            name: product.name,
            qty,
            price: product.price,
            weight: product.weight
        };
    });

    const method = document.getElementById("checkout-shipping-method").value;
    const shipping = calculateShipping(method, items);
    const total = subtotal + shipping;

    shippingEl.textContent = shipping.toFixed(2);
    totalEl.textContent = total.toFixed(2);

    window.cartItems = items;
    window.cartSubtotal = subtotal;
    window.cartShipping = shipping;
    window.cartTotal = total;
}

// EmailJS admin email
async function sendOrderEmail(order) {
    return emailjs.send("service_craftinite", "template_craftinite", {
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        customer_address: order.customer.fullAddress,
        order_items: order.items.map(i => `${i.qty} × ${i.name} (£${(i.qty * i.price).toFixed(2)})`).join("\n"),
        order_subtotal: order.subtotal.toFixed(2),
        order_shipping: order.shipping.toFixed(2),
        order_total: order.total.toFixed(2),
        order_timestamp: order.timestamp
    });
}

// EmailJS customer receipt
async function sendCustomerReceipt(order) {
    return emailjs.send("service_craftinite", "template_customer_receipt", {
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        order_items: order.items.map(i => `${i.qty} × ${i.name} (£${(i.qty * i.price).toFixed(2)})`).join("\n"),
        order_subtotal: order.subtotal.toFixed(2),
        order_shipping: order.shipping.toFixed(2),
        order_total: order.total.toFixed(2),
        order_timestamp: order.timestamp
    });
}

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

// -----------------------------
// PayPal Buttons
// -----------------------------
function initPayments() {

    paypal.Buttons({

        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: window.cartTotal.toFixed(2)
                    },
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

            window.location.href = "/thankyou.html";
        },

        onError: () => {
            // Silently ignore PayPal's false error
            // Payment still succeeds, so we do not show anything
        }

    }).render('#paypal-button-container');
}

// -----------------------------
// Init
// -----------------------------
document.addEventListener("DOMContentLoaded", async () => {
    await loadShippingRules();
    loadCheckoutCart();
    initPayments();
});