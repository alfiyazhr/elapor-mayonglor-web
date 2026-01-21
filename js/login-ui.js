// File: js/login-ui.js
// Fungsi: Hanya mengurus UI murni (Toggle Password)

document.addEventListener("DOMContentLoaded", () => {
  // LOGIKA TOGGLE PASSWORD (MATA)
  const toggleBtn = document.querySelector("#togglePassword");
  const passInput = document.querySelector("#password");

  if (toggleBtn && passInput) {
    toggleBtn.addEventListener("click", function () {
      const type =
        passInput.getAttribute("type") === "password" ? "text" : "password";
      passInput.setAttribute("type", type);

      const icon = this.querySelector("i");
      if (type === "text") {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  }

  // Sisa logika Modal HTML DIHAPUS karena diganti SweetAlert di auth-login.js
});
