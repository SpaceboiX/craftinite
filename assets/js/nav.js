// Load header.html into the placeholder
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;

    // Wait for Firebase to be ready
    auth.onAuthStateChanged(user => {
      const loginBtn = document.getElementById("header-login");
      const profile = document.getElementById("header-profile");
      const avatar = document.getElementById("profile-avatar");
      const name = document.getElementById("profile-name");

      if (user) {
        // Logged in
        loginBtn.style.display = "none";
        profile.style.display = "flex";

        name.textContent = user.displayName || user.email;
        avatar.src = user.photoURL || "assets/img/icons/default-avatar.png";
      } else {
        // Logged out
        loginBtn.style.display = "block";
        profile.style.display = "none";
      }
    });

    // Logout button (exists only after header loads)
    document.addEventListener("click", e => {
      if (e.target && e.target.id === "logout-btn") {
        auth.signOut().then(() => {
          window.location.href = "index.html";
        });
      }
    });
  })
  .catch(err => console.error("Failed to load header:", err));