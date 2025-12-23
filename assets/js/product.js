document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const product = products.find(p => p.id === productId);

  if (!product) {
    document.getElementById("product-title").textContent = "Product not found.";
    return;
  }

  // Title
  document.getElementById("product-title").textContent = product.name;

  // Gallery: check if img/{id}/ exists
  const gallery = document.getElementById("product-gallery");
  const basePath = `assets/img/${product.id}/`;

  // Example: try loading up to 5 images
  for (let i = 1; i <= 5; i++) {
    const imgPath = `${basePath}${i}.webp`;
    const img = new Image();
    img.src = imgPath;
    img.alt = `${product.name} image ${i}`;
    img.className = "col-md-4 mb-3 img-fluid";

    img.onload = () => gallery.appendChild(img); // only append if it exists
  }

  // Description from partials/products/{id}.html
  fetch(`partials/products/${product.id}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById("product-description").innerHTML = html;
    })
    .catch(() => {
      document.getElementById("product-description").innerHTML =
        "<p class='text-muted'>No description available.</p>";
    });

  // Add to cart
  document.getElementById("add-to-cart").addEventListener("click", () => {
    // Simple cart array in localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  });
});
