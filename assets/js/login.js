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
