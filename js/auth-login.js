// File: js/auth-login.js

import { auth, db } from "./config/firebase.js";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Import Jenis-Jenis Alert Baru
import {
  showSuccess,
  showError,
  showWarningAutoClose,
  showConfirm,
  showLoading,
} from "./config/swal-custom.js";

const formLogin = document.getElementById("formLogin");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const linkLupaSandi = document.getElementById("linkLupaSandi"); // Kita tangkap Linknya langsung

// ============================================================
// 1. LOGIKA LOGIN
// ============================================================
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passInput.value;

    showLoading("Memeriksa akun...");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists() && userSnap.data().role === "admin") {
        await showSuccess("Login Berhasil!", "Mengalihkan ke Dashboard...");
        window.location.replace("index.html");
      } else {
        await signOut(auth);
        throw new Error("Akses ditolak. Bukan akun Admin.");
      }
    } catch (error) {
      console.error(error);
      let pesan = "Terjadi kesalahan sistem.";
      if (error.code === "auth/invalid-credential")
        pesan = "Email atau Kata Sandi salah.";
      showError("Gagal Masuk", pesan);
    }
  });
}

// ============================================================
// 2. LOGIKA LUPA SANDI (FULL SWEETALERT FLOW)
// ============================================================
if (linkLupaSandi) {
  linkLupaSandi.addEventListener("click", async (e) => {
    e.preventDefault(); // Jangan refresh / scroll

    const email = emailInput.value.trim();

    // KASUS A: Email Belum Diisi
    if (!email) {
      // Popup simpel, tutup sendiri 2 detik
      showWarningAutoClose("Mohon isi email terlebih dahulu!");

      // Fokus & Kasih tanda merah
      emailInput.focus();
      emailInput.classList.add("border-red-500", "ring-1", "ring-red-500");
      emailInput.addEventListener(
        "input",
        () => {
          emailInput.classList.remove(
            "border-red-500",
            "ring-1",
            "ring-red-500"
          );
        },
        { once: true }
      );
      return;
    }

    // KASUS B: Email Terisi -> Minta Konfirmasi via SweetAlert
    const yakin = await showConfirm(
      "Kirim Reset Password?",
      `Kami akan mengirimkan link reset ke: <br><b>${email}</b>`
    );

    if (yakin) {
      showLoading("Mengirim email reset...");

      try {
        await sendPasswordResetEmail(auth, email);

        // SUKSES
        showSuccess("Terkirim!", "Silakan cek Inbox/Spam email Anda.");
      } catch (error) {
        console.error(error);
        let pesan = "Gagal mengirim email.";
        if (error.code === "auth/user-not-found")
          pesan = "Email tidak terdaftar sebagai Admin.";
        if (error.code === "auth/invalid-email")
          pesan = "Format email tidak valid.";

        showError("Gagal", pesan);
      }
    }
  });
}
