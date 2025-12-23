fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;

    // Now the header exists — safe to query elements
    const loginBtn = document.getElementById("header-login");
    const profile = document.getElementById("header-profile");
    const avatar = document.getElementById("profile-avatar");
    const name = document.getElementById("profile-name");

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
  });