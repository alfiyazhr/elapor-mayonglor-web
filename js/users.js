// File: js/users.js

import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Import Config Firebase (Pastikan path sesuai)
import { db } from "./config/firebase.js";

// Import Custom Alert (Swal)
import {
  showSuccess,
  showError,
  showConfirm,
  showLoading,
} from "./config/swal-custom.js";

// DOM Elements
const tabelUser = document.getElementById("tabel-user");
const searchInput = document.getElementById("searchUser");
const tabButtons = document.querySelectorAll("#userTabs button");

// Variabel Global untuk menampung data agar tidak fetch bolak-balik
let allUsersData = [];
let currentFilter = "all";

// ==========================================
// 1. LOAD DATA USER DARI FIRESTORE
// ==========================================
async function loadUsers() {
  try {
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);

    allUsersData = [];
    querySnapshot.forEach((doc) => {
      // ID dokumen adalah NIK atau UID sesuai hasil registrasi Android
      allUsersData.push({ id: doc.id, ...doc.data() });
    });

    renderTable(allUsersData);
  } catch (error) {
    console.error("Error load users:", error);
    showError("Gagal", "Gagal mengambil data user dari database.");
  }
}

// ==========================================
// 2. RENDER TABEL (AKSI SEJAJAR / HORIZONTAL)
// ==========================================
function renderTable(data) {
  tabelUser.innerHTML = "";
  let no = 1;

  if (data.length === 0) {
    tabelUser.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-gray-400 font-medium italic">Data tidak ditemukan.</td></tr>`;
    return;
  }

  data.forEach((user) => {
    const isWarga = user.role === "warga";

    // Badge Role yang Rapi
    const roleBadge = isWarga
      ? `<span class="bg-gray-100 text-gray-600 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Warga</span>`
      : `<span class="bg-blue-100 text-blue-700 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Admin</span>`;

    // Avatar Initial
    const avatarInitial = user.nama ? user.nama.charAt(0) : "U";

    // LOGIKA TOMBOL HAPUS: Jika Admin, tombol disabled (mati)
    const deleteButton = !isWarga
      ? `<button disabled class="text-gray-200 cursor-not-allowed p-2 text-sm" title="Admin tidak dapat dihapus">
                <i class="fas fa-trash-alt"></i>
               </button>`
      : `<button class="btn-delete text-gray-400 hover:text-red-600 transition p-2 text-sm" 
                       data-id="${user.id}" data-nama="${user.nama}">
                <i class="fas fa-trash-alt"></i>
               </button>`;

    const row = `
            <tr class="bg-white border-b hover:bg-slate-50 transition">
                <td class="px-6 py-4 font-medium text-gray-400 text-center">${no++}</td>
                <td class="px-6 py-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-700 border border-slate-200 uppercase text-sm">${avatarInitial}</div>
                    <div>
                        <div class="font-bold text-gray-800 text-sm leading-tight">${
                          user.nama || "User"
                        }</div>
                        <div class="text-[11px] text-gray-400">${
                          user.email || "-"
                        }</div>
                    </div>
                </td>
                <td class="px-6 py-4">${roleBadge}</td>
                <td class="px-6 py-4 text-[11px] text-gray-500 font-medium">${
                  user.createdAt || user.created_at || "-"
                }</td>
                <td class="px-6 py-4 text-center">
                    <div class="flex justify-center items-center gap-1">
                        <button class="btn-detail text-gray-400 hover:text-blue-600 transition p-2" 
                                data-id="${
                                  user.id
                                }" title="Lihat Detail Identitas">
                            <i class="fas fa-info-circle text-lg"></i>
                        </button>
                        ${deleteButton}
                    </div>
                </td>
            </tr>
        `;
    tabelUser.innerHTML += row;
  });

  // Pasang Event Listeners setelah render
  attachEventListeners();
}

// ==========================================
// 3. ATTACH EVENT LISTENERS
// ==========================================
function attachEventListeners() {
  // Tombol Detail
  document.querySelectorAll(".btn-detail").forEach((btn) => {
    btn.addEventListener("click", () => showDetail(btn.dataset.id));
  });

  // Tombol Delete
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      const nama = btn.dataset.nama;
      hapusUser(id, nama);
    });
  });
}

// ==========================================
// 4. LOGIKA DETAIL (MODAL)
// ==========================================
function showDetail(userId) {
  const user = allUsersData.find((u) => u.id === userId);
  if (!user) return;

  // Isi data ke Modal
  document.getElementById("detailAvatar").innerText = user.nama
    ? user.nama.charAt(0)
    : "?";
  document.getElementById("detailNama").innerText = user.nama || "-";
  document.getElementById("detailNik").innerText = user.nik || "-";
  document.getElementById("detailEmail").innerText = user.email || "-";
  document.getElementById("detailAlamat").innerText =
    user.alamat || "Alamat tidak tersedia";

  // Atur Badge di Modal
  const badge = document.getElementById("detailBadge");
  badge.innerText = user.role;
  if (user.role === "admin") {
    badge.className =
      "px-3 py-1 text-[10px] font-bold rounded-full uppercase bg-blue-100 text-blue-700";
  } else {
    badge.className =
      "px-3 py-1 text-[10px] font-bold rounded-full uppercase bg-gray-100 text-gray-500";
  }

  // Munculkan Modal secara manual (Tailwind class)
  const modal = document.getElementById("modalDetailUser");
  modal.classList.remove("hidden");
}

// Fungsi tutup modal (di luar tombol X)
document
  .querySelectorAll('[data-modal-hide="modalDetailUser"]')
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("modalDetailUser").classList.add("hidden");
    });
  });

// ==========================================
// 5. FILTER & SEARCH
// ==========================================
function filterAndRender() {
  const keyword = searchInput.value.toLowerCase();
  const filtered = allUsersData.filter((user) => {
    const matchRole = currentFilter === "all" || user.role === currentFilter;
    const nama = (user.nama || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const nik = (user.nik || "").toLowerCase();
    const matchSearch =
      nama.includes(keyword) ||
      email.includes(keyword) ||
      nik.includes(keyword);
    return matchRole && matchSearch;
  });
  renderTable(filtered);
}

searchInput.addEventListener("input", filterAndRender);

tabButtons.forEach((btn) => {
  btn.addEventListener("click", function () {
    tabButtons.forEach((b) => {
      b.classList.remove("text-primary", "border-primary", "active");
      b.classList.add("border-transparent");
    });
    this.classList.add("text-primary", "border-primary", "active");
    this.classList.remove("border-transparent");
    currentFilter = this.getAttribute("data-filter");
    filterAndRender();
  });
});

// ==========================================
// 6. HAPUS USER (FIRESTORE)
// ==========================================
async function hapusUser(id, nama) {
  const confirm = await showConfirm(
    "Hapus User?",
    `Apakah Anda yakin menghapus <b>${nama}</b>? Warga ini tidak akan bisa login kembali ke aplikasi.`
  );

  if (confirm) {
    showLoading("Menghapus data...");
    try {
      await deleteDoc(doc(db, "users", id));
      showSuccess("Berhasil", "Data pengguna telah dihapus.");
      loadUsers(); // Refresh data
    } catch (error) {
      console.error(error);
      showError("Gagal", "Terjadi kesalahan saat menghapus data.");
    }
  }
}

// Inisialisasi awal
document.addEventListener("DOMContentLoaded", loadUsers);
