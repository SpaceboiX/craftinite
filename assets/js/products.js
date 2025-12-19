// products.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("product-list");
  const params = new URLSearchParams(window.location.search);
  const typeFilter = params.get("type"); // e.g. "Cards", "Mugs", "Bookmarks"

  // Function to render products
  function renderProducts(filterType) {
    container.innerHTML = ""; // clear existing cards

    products
      .filter(p => !filterType || p.type === filterType)
      .forEach(product => {
        const card = document.createElement("div");
        card.className = "col-md-4 mb-4";

        card.innerHTML = `
          <div class="card h-100">
            <a href="product.html?id=${product.id}">
              <img src="${product.image}" class="card-img-top" alt="${product.name}">
            </a>
            <div class="card-body">
              <h5 class="card-title">
                <a href="product.html?id=${product.id}" class="text-decoration-none text-light">
                  ${product.name}
                </a>
              </h5>
              <p class="card-text">${product.description}</p>
              <p class="fw-bold">£${product.price.toFixed(2)}</p>
              <p class="text-muted">Type: ${product.type}</p>
              <p class="text-muted">Category: ${product.category}</p>
              <p class="small">Tags: ${product.tags.join(", ")}</p>
              <button class="btn btn-primary">Add to Cart</button>
            </div>
          </div>
        `;

        container.appendChild(card);
      });

    if (container.innerHTML === "") {
      container.innerHTML = `<p class="text-muted">No products found for this category.</p>`;
    }
  }

  // Initial render based on query string
  renderProducts(typeFilter);

  // Handle dropdown change → redirect
  const select = document.getElementById("category-select");
  if (select) {
    select.value = typeFilter || "";
    select.addEventListener("change", e => {
      const selected = e.target.value;
      if (selected) {
        window.location.href = `products.html?type=${selected}`;
      } else {
        window.location.href = "products.html";
      }
    });
  }
});
