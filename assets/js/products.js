document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('product-list');

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'col-md-4 mb-4';

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
          <button class="btn btn-primary">Add to Cart</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
});
