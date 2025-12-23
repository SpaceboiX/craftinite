auth.onAuthStateChanged(user => {
  const loginBtn = document.getElementById("header-login");
  const profile = document.getElementById("header-profile");
  const avatar = document.getElementById("profile-avatar");
  const name = document.getElementById("profile-name");

  if (user) {
    // Show profile
    loginBtn.style.display = "none";
    profile.style.display = "flex";

    name.textContent = user.displayName || user.email;
    avatar.src = user.photoURL || "assets/img/icons/default-avatar.png";
  } else {
    // Show login button
    loginBtn.style.display = "block";
    profile.style.display = "none";
  }
});

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
});