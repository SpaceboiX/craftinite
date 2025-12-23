document.getElementById("google-signup").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => window.location.href = "index.html")
    .catch(err => alert(err.message));
});