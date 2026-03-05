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

                        <div class="mt-auto">
                            <a href="${product.etsy}" target="_blank" class="btn btn-primary w-100">
                                Buy on Etsy
                            </a>
                        </div>
                    </div>
                </div>
            `;

            productList.appendChild(col);
        });
    }

    // Category filter
    categorySelect.addEventListener("change", () => {
        renderProducts(categorySelect.value);
    });

    // Initial load
    renderProducts();
});
