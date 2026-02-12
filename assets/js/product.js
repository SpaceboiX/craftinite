document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const product = products.find(p => p.id === productId);

  if (!product) {
    document.getElementById("product-title").textContent = "Product not found.";
    return;
  }

  // Title + Description
  document.getElementById("product-title").textContent = product.name || "";
  document.getElementById("product-subtext").textContent = product.subtext || "";
  document.getElementById("product-description").textContent = product.description || "";

  // GALLERY SYSTEM
  const galleryContainer = document.getElementById("product-gallery");

  galleryContainer.innerHTML = `
    <div id="productCarousel" class="carousel slide mb-4" data-bs-ride="carousel">
      <div class="carousel-inner" id="carousel-inner"></div>

      <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
      </button>

      <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
      </button>
    </div>

    <div class="row mt-3" id="thumbnail-row"></div>
  `;

  const carouselInner = document.getElementById("carousel-inner");
  const thumbnailRow = document.getElementById("thumbnail-row");

  // Load main image first
  const images = [product.image];

  // Load gallery images if folder exists
  if (product.gallery) {
    for (let i = 1; i <= 10; i++) {
      const imgPath = `${product.gallery}${i}.webp`;
      const img = new Image();
      img.src = imgPath;

      img.onload = () => {
        images.push(imgPath);
        buildGallery(images);
      };
    }
  } else {
    buildGallery(images);
  }

  function buildGallery(imgList) {
    carouselInner.innerHTML = "";
    thumbnailRow.innerHTML = "";

    imgList.forEach((src, index) => {
      // Carousel slide
      const slide = document.createElement("div");
      slide.className = `carousel-item ${index === 0 ? "active" : ""}`;
      slide.innerHTML = `<img src="${src}" class="d-block w-100 rounded">`;
      carouselInner.appendChild(slide);

      // Thumbnails
      const thumb = document.createElement("div");
      thumb.className = "col-3 col-md-2 mb-2";
      thumb.innerHTML = `
        <img src="${src}" class="img-fluid rounded thumb-img" style="cursor:pointer;">
      `;
      thumb.addEventListener("click", () => {
        const carousel = new bootstrap.Carousel(document.getElementById("productCarousel"));
        carousel.to(index);
      });
      thumbnailRow.appendChild(thumb);
    });
  }

  // ADD TO CART
  document.getElementById("add-to-cart").addEventListener("click", () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Push the product
    cart.push(product);

    // Save
    localStorage.setItem("cart", JSON.stringify(cart));

    // Auto-refresh the cart dropdown
    if (typeof updateCartDropdown === "function") {
      updateCartDropdown();
    }

    // Feedback
    alert(`${product.name} added to cart!`);
  });
});
