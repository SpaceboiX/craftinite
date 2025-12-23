document.getElementById("login-submit").addEventListener("click", e => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  auth.signInWithWithEmailAndPassword(email, password)
    .then(() => window.location.href = "index.html")
    .catch(err => alert(err.message));
});