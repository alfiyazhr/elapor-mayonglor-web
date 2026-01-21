// File: js/config/swal-custom.js
// Fungsi: Mengatur Custom Alert standar aplikasi dengan Style Tailwind Penuh

// 1. CONFIG STYLE (Menggunakan Class Tailwind agar tombol selalu nyala)
const baseConfig = {
  fontFamily: "Poppins, sans-serif",
  allowOutsideClick: false,
  heightAuto: false,

  // PENTING: Matikan styling bawaan SweetAlert agar tidak bentrok
  buttonsStyling: false,

  // PENTING: Kita pasang class Tailwind secara manual disini
  customClass: {
    popup: "rounded-3xl shadow-soft border border-slate-100 p-4", // Gaya Card
    title: "text-slate-800 text-xl font-bold mb-2",
    htmlContainer: "text-slate-500 text-sm",

    // TOMBOL KONFIRMASI (Biru Dongker - Primary)
    confirmButton:
      "bg-[#134574] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-900 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-lg shadow-blue-900/20 ml-2",

    // TOMBOL BATAL (Merah/Abu - Disini saya buat Merah agar kontras)
    cancelButton:
      "bg-white text-slate-500 border border-slate-200 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 hover:text-red-500 focus:ring-4 focus:ring-slate-100 transition-all duration-300 mr-2",

    actions: "flex gap-3 mt-4", // Jarak antar tombol
  },
};

// ==========================================
// 2. KUMPULAN FUNGSI ALERT
// ==========================================

// A. POPUP SUKSES
export const showSuccess = (title, text) => {
  return Swal.fire({
    ...baseConfig,
    icon: "success",
    title: title,
    text: text,
    showConfirmButton: true,
    confirmButtonText: "Oke, Mengerti",
    timer: 3000,
    timerProgressBar: true,
  });
};

// B. POPUP ERROR
export const showError = (title, text) => {
  return Swal.fire({
    ...baseConfig,
    icon: "error",
    title: title,
    text: text,
    confirmButtonText: "Tutup",
    footer:
      '<a href="#" class="text-[#134574] font-medium hover:underline">Hubungi Admin jika masalah berlanjut</a>',
  });
};

// C. PERINGATAN OTOMATIS TUTUP (Untuk Validasi Ringan)
export const showWarningAutoClose = (text) => {
  return Swal.fire({
    ...baseConfig,
    icon: "warning",
    title: "Perhatian",
    text: text,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
};

// D. KONFIRMASI (Yes/No)
export const showConfirm = async (
  title,
  text,
  confirmText = "Ya, Lanjutkan"
) => {
  const result = await Swal.fire({
    ...baseConfig,
    title: title,
    html: text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    reverseButtons: true, // Tombol Batal di Kiri, Ya di Kanan
  });

  return result.isConfirmed;
};

// E. LOADING SPINNER
export const showLoading = (text = "Sedang memproses...") => {
  Swal.fire({
    ...baseConfig,
    title: text,
    text: "Mohon tunggu sebentar",
    showConfirmButton: false,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// F. TUTUP MANUAL
export const closePopup = () => {
  Swal.close();
};
