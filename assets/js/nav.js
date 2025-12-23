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
        avatar.src = user.photoURL || "assets/img/icons/default-avatar.png";
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
  });