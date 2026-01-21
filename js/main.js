// File: js/main.js
import { auth } from "./config/firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { showConfirm, showSuccess, showError } from "./config/swal-custom.js"; // IMPORT SWAL KITA

// 1. CEK LOGIN
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User Login OK
  } else {
    // Belum Login -> Tendang
    window.location.replace("login.html");
  }
});

// 2. LOGOUT DENGAN SWEETALERT
const btnLogout = document.getElementById("btnLogout");
const btnLogoutMobile = document.getElementById("btnLogoutMobile");

async function handleLogout() {
  // Panggil Custom Confirm kita
  const yakin = await showConfirm(
    "Keluar Aplikasi?",
    "Anda harus login kembali untuk mengakses dashboard.",
    "Ya, Keluar"
  );

  if (yakin) {
    try {
      await signOut(auth);
      // Optional: Tampilkan sukses sebentar sebelum pindah
      // await showSuccess("Berhasil Keluar", "Sampai jumpa lagi!");
      window.location.replace("login.html");
    } catch (error) {
      console.error("Logout Error:", error);
      showError("Gagal Keluar", "Terjadi kesalahan jaringan.");
    }
  }
}

if (btnLogout) btnLogout.addEventListener("click", handleLogout);
if (btnLogoutMobile) btnLogoutMobile.addEventListener("click", handleLogout);
