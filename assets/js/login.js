document.getElementById("login-submit").addEventListener("click", e => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(user => {
      localStorage.setItem("user", JSON.stringify(user.user));
      window.location.href = "index.html";
    })
    .catch(err => {
      alert(err.message);
    });
});

document.getElementById("forgot-password").addEventListener("click", () => {
  const email = document.getElementById("login-email").value;

  if (!email) {
    alert("Please enter your email first.");
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => {
      alert("Password reset email sent. Check your inbox.");
    })
    .catch(err => {
      alert(err.message);
    });
});
