fetch("header.html?v=3")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-placeholder").innerHTML = html;
  });
