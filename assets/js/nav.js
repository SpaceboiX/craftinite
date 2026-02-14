fetch("header.html?v=3")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;

    const loginBtn = document.getElementById("header-login");
    const profile = document.getElementById("header-profile");
    const avatar = document.getElementById("profile-avatar");
    const name = document.getElementById("profile-name");

    // Default state
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

      // ⭐ After auth state is applied, update cart + run checkout if needed
      updateCartDropdown();

      // ⭐ If checkout page defines runCheckout(), call it now
      if (typeof runCheckout === "function") {
        runCheckout();
      }
    });

    // Logout
    document.addEventListener("click", e => {
      if (e.target && e.target.id === "logout-btn") {
        auth.signOut().then(() => window.location.href = "index.html");
      }
    });
  });


// ---------------- CART DROPDOWN ----------------

function updateCartDropdown() {
  const dropdown = document.getElementById("cart-dropdown");
  const countBadge = document.getElementById("cart-count");

  if (!dropdown || !countBadge) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // GROUP ITEMS BY ID
  const grouped = {};
  cart.forEach(item => {
    if (!grouped[item.id]) {
      grouped[item.id] = { ...item, qty: 1 };
    } else {
      grouped[item.id].qty++;
    }
  });

  const items = Object.values(grouped);

  // Update badge count
  countBadge.textContent = cart.length;

  if (items.length === 0) {
    dropdown.innerHTML = `<p class="text-muted text-center mb-0">Your cart is empty</p>`;
    return;
  }

  dropdown.innerHTML = "";

  // Only show first 3 grouped items
  const visibleItems = items.slice(0, 3);

  visibleItems.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="flex-grow-1">
        <div class="cart-item-title">${item.qty}x ${item.name}</div>
        <div class="cart-item-subtext">${item.subtext || ""}</div>
        <div class="text-white">£${(item.price * item.qty).toFixed(2)}</div>
      </div>
      <div class="cart-remove" data-id="${item.id}">Remove</div>
    `;

    dropdown.appendChild(div);

    // Separator (except after last visible item)
    if (index < visibleItems.length - 1) {
      const sep = document.createElement("hr");
      sep.className = "my-2";
      dropdown.appendChild(sep);
    }
  });

  // If more items exist
  if (items.length > 3) {
    dropdown.innerHTML += `
      <p class="text-muted small mb-2">+${items.length - 3} more item(s)</p>
    `;
  }

  // Total price
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  dropdown.innerHTML += `
    <div class="d-flex justify-content-between fw-bold border-top pt-2 mb-2">
      <span>Total:</span>
      <span>£${total.toFixed(2)}</span>
    </div>
    <a href="checkout.html" class="btn btn-primary w-100">Checkout</a>
  `;

  // Remove handler (removes ALL of that item)
  dropdown.querySelectorAll(".cart-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart = cart.filter(i => i.id !== btn.dataset.id);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartDropdown();
    });
  });
}

window.addEventListener("storage", updateCartDropdown);
