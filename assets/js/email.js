document.addEventListener("DOMContentLoaded", function () {
    if (typeof emailjs !== "undefined") {
        emailjs.init("QrtwE4LJqNzj1yHjz");
        console.log("EmailJS initialized");
    } else {
        console.error("EmailJS SDK failed to load");
    }
});