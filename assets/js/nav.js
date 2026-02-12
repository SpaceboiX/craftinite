fetch("header.html?v=3")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;

    const loginBtn = document.getElementById("header-login");
    const profile = document.getElementById("header-profile");
    const avatar = document.getElementById("profile-avatar");
    const name = document.getElementById("profile-name");

    // Force default state
    loginBtn.style.display = "block";
    profile.style.display = "none";

    // Firebase auth listener
    auth.onAuthStateChanged(user => {
      if (user) {
        loginBtn.style.display = "none";
        profile.classList.add("show-profile");

        name.textContent = user.displayName || user.email;
        avatar.src = user.photoURL || "assets/img/icons/profile.webp";
      } else {
        loginBtn.style.display = "block";
        profile.classList.remove("show-profile");
      }
    });

    // Logout
    document.addEventListener("click", e => {
      if (e.target && e.target.id === "logout-btn") {
        auth.signOut().then(() => window.location.href = "index.html");
      }
    });

    // ⭐ RUN CART DROPDOWN UPDATE *AFTER* HEADER LOADS
    updateCartDropdown();
  });


// ---------------- CART DROPDOWN ----------------

function updateCartDropdown() {
  const dropdown = document.getElementById("cart-dropdown");
  const countBadge = document.getElementById("cart-count");

  if (!dropdown || !countBadge) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  countBadge.textContent = cart.length;

  if (cart.length === 0) {
    dropdown.innerHTML = `<p class="text-muted text-center mb-0">Your cart is empty</p>`;
    return;
  }

  dropdown.innerHTML = "";

  // Show only first 3 items
  const visibleItems = cart.slice(0, 3);

  visibleItems.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="flex-grow-1">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-subtext">${item.subtext || ""}</div>
        <div class="text-white">£${item.price.toFixed(2)}</div>
      </div>
      <div class="cart-remove" data-index="${index}">Remove</div>
    `;

    dropdown.appendChild(div);
  });

  // If more items exist
  if (cart.length > 3) {
    const extra = document.createElement("p");
    extra.className = "text-muted small mb-2";
    extra.textContent = `+${cart.length - 3} more item(s)`;
    dropdown.appendChild(extra);
  }

  // Total price
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const totalDiv = document.createElement("div");
  totalDiv.className = "d-flex justify-content-between fw-bold border-top pt-2 mb-2";
  totalDiv.innerHTML = `
    <span>Total:</span>
    <span>£${total.toFixed(2)}</span>
  `;
  dropdown.appendChild(totalDiv);

  // Checkout button
  const checkoutBtn = document.createElement("a");
  checkoutBtn.href = "checkout.html";
  checkoutBtn.className = "btn btn-primary w-100";
  checkoutBtn.textContent = "Checkout";
  dropdown.appendChild(checkoutBtn);

  // Remove handler
  dropdown.querySelectorAll(".cart-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart.splice(btn.dataset.index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartDropdown();
    });
  });
}
