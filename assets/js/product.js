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

  // Subtext
  document.getElementById("product-subtext").textContent = product.subtext;
  
  // Description
  document.getElementById("product-description").textContent = product.description;

  // Main Image (from product-data.js)
  const gallery = document.getElementById("product-gallery");

  const mainImg = new Image();
  mainImg.src = product.image;
  mainImg.alt = product.name;
  mainImg.className = "col-md-4 mb-3 img-fluid";
  gallery.appendChild(mainImg);

  // OPTIONAL: Additional gallery images (if you add folders later)
  const basePath = `assets/img/${product.id}/`;

  for (let i = 1; i <= 5; i++) {
    const imgPath = `${basePath}${i}.webp`;
    const img = new Image();
    img.src = imgPath;
    img.alt = `${product.name} image ${i}`;
    img.className = "col-md-4 mb-3 img-fluid";

    img.onload = () => gallery.appendChild(img);
  }

  // Add to cart
  document.getElementById("add-to-cart").addEventListener("click", () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  });
});