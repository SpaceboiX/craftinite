fetch("header.html?v=1")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;

    // Grab elements AFTER injection
    const loginBtn = document.getElementById("header-login");
    const profile = document.getElementById("header-profile");
    const avatar = document.getElementById("profile-avatar");
    const name = document.getElementById("profile-name");

    // Force-correct initial state BEFORE Firebase runs
    loginBtn.style.display = "block";
    profile.style.display = "none";

    // Now listen for Firebase auth state
    auth.onAuthStateChanged(user => {
      if (user) {
        loginBtn.style.display = "none";
        profile.style.display = "flex";

        name.textContent = user.displayName || user.email;
        avatar.src = user.photoURL || "assets/img/icons/default-avatar.png";
      } else {
        loginBtn.style.display = "block";
        profile.style.display = "none";
      }
    });

    // Logout handler
    document.addEventListener("click", e => {
      if (e.target && e.target.id === "logout-btn") {
        auth.signOut().then(() => window.location.href = "index.html");
      }
    });
  })
  .catch(err => console.error("Failed to load header:", err));