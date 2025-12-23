document.getElementById("signup-submit").addEventListener("click", e => {
  e.preventDefault();

  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => window.location.href = "index.html")
    .catch(err => alert(err.message));
});