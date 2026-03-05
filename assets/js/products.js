document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("product-list");
    const categorySelect = document.getElementById("category-select");

    function renderProducts(filter = "") {
        productList.innerHTML = "";

        const filtered = filter
            ? products.filter(p => p.category === filter)
            : products;

        filtered.forEach(product => {
            const col = document.createElement("div");
            col.className = "col-md-4 mb-4";

            col.innerHTML = `
                <div class="card h-100 product-card text-white">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}" onclick="window.location.href='product.html?id=${product.id}'">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="text-muted mb-2">${product.subtext || ""}</p>
                        <p class="fw-bold mb-3">£${product.price.toFixed(2)}</p>

                        <div class="mt-auto d-flex gap-2">
                            <a href="${product.etsy}" target="_blank" class="btn btn-primary w-50">
                                Buy on Etsy
                            </a>
                            <button class="btn btn-primary w-50 add-to-cart-btn" data-id="${product.id}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;

            productList.appendChild(col);
        });

        attachAddToCartEvents();
    }

    function attachAddToCartEvents() {
        document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const product = products.find(p => p.id === id);

                let cart = JSON.parse(localStorage.getItem("cart")) || [];

                // Add one more of this product
                cart.push(product);
                localStorage.setItem("cart", JSON.stringify(cart));

                // Update mini-cart
                if (typeof updateCartDropdown === "function") {
                    updateCartDropdown();
                }

                // Toast popup
                showToast(`${product.name} added to cart!`);
            });
        });
    }

    function showToast(message) {
        let container = document.getElementById("cart-toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "cart-toast-container";
            container.className = "position-fixed bottom-0 end-0 p-3";
            container.style.zIndex = "9999";
            document.body.appendChild(container);
        }

        const toastEl = document.createElement("div");
        toastEl.className = "toast text-bg-success border-0";
        toastEl.innerHTML = `<div class="toast-body">${message}</div>`;

        container.appendChild(toastEl);

        const toast = new bootstrap.Toast(toastEl);
        toast.show();

        toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
    }

    // FIXED: category filter listener
    categorySelect.addEventListener("change", () => {
        renderProducts(categorySelect.value);
    });

    // Initial load
    renderProducts();
});
