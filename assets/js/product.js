document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id"); // string if your IDs are strings
  const product = products.find(p => p.id === productId);

  const titleEl = document.getElementById("product-title");
  const galleryEl = document.getElementById("product-gallery");
  const descEl = document.getElementById("product-description");
  const cartBtn = document.getElementById("add-to-cart");

  if (!product) {
    // Product not found
    titleEl.textContent = "Product not found.";
    galleryEl.innerHTML = "";
    descEl.innerHTML = `<p class="text-muted">This product doesn't exist.</p>`;
    cartBtn.outerHTML = `<a href="products.html" class="btn btn-secondary">&larr; Products</a>`;
    return;
  }

  // Normal product rendering
  titleEl.textContent = product.name;

  // Gallery example (try loading images)
  const basePath = `assets/img/${product.id}/`;
  for (let i = 1; i <= 5; i++) {
    const imgPath = `${basePath}${i}.webp`;
    const img = new Image();
    img.src = imgPath;
    img.alt = `${product.name} image ${i}`;
    img.className = "col-md-4 mb-3 img-fluid";
    img.onload = () => galleryEl.appendChild(img);
  }

  // Description from partials
  fetch(`partials/products/${product.id}.html`)
    .then(res => res.text())
    .then(html => {
      descEl.innerHTML = html;
    })
    .catch(() => {
      descEl.innerHTML = "<p class='text-muted'>No description available.</p>";
    });

  // Add to cart
  cartBtn.addEventListener("click", () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  });
});
