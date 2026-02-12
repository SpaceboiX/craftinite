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

    // QUANTITY SELECTOR
    const qtyInput = document.getElementById("qty-input");
    const qtyMinus = document.getElementById("qty-minus");
    const qtyPlus = document.getElementById("qty-plus");

    // Load existing quantity from cart
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingQty = cart.filter(i => i.id === product.id).length;

    qtyInput.value = existingQty; // default 0 if not in cart

    qtyMinus.addEventListener("click", () => {
        let val = parseInt(qtyInput.value);
        if (val > 0) qtyInput.value = val - 1;
        updateCartQuantity();
    });

    qtyPlus.addEventListener("click", () => {
        qtyInput.value = parseInt(qtyInput.value) + 1;
        updateCartQuantity();
    });

    qtyInput.addEventListener("change", () => {
        if (qtyInput.value < 0) qtyInput.value = 0;
        updateCartQuantity();
    });

    function updateCartQuantity() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const newQty = parseInt(qtyInput.value);

        const oldQty = cart.filter(i => i.id === product.id).length;

        // Remove all existing entries
        cart = cart.filter(i => i.id !== product.id);

        // Add new quantity
        for (let i = 0; i < newQty; i++) {
            cart.push(product);
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        // Toast only when going from 0 → 1
        if (oldQty === 0 && newQty > 0) {
            const toastEl = document.getElementById("cart-toast");
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
        }

        if (typeof updateCartDropdown === "function") updateCartDropdown();
    }

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

    const images = [product.image];

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
            const slide = document.createElement("div");
            slide.className = `carousel-item ${index === 0 ? "active" : ""}`;
            slide.innerHTML = `<img src="${src}" class="d-block w-100 rounded">`;
            carouselInner.appendChild(slide);

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
});
