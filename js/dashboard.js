import { db } from "./config/firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// DOM Elements
const statTotal = document.getElementById("stat-total");
const statPending = document.getElementById("stat-pending");
const statSelesai = document.getElementById("stat-selesai");
const statUsers = document.getElementById("stat-users");
const tabelBody = document.getElementById("tabel-dashboard-preview");
const emptyState = document.getElementById("empty-state");

// ==========================================
// 1. FUNGSI BANTUAN: AMBIL NAMA USER (FIXED)
// ==========================================
async function getUserName(uid) {
  if (!uid) return "Tanpa Identitas";
  try {
    // REVISI: Karena ID dokumen adalah NIK, kita cari berdasarkan field 'uid'
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", uid), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      return data.nama || "User Tanpa Nama";
    }

    return "User Tidak Dikenal";
  } catch (error) {
    console.error("Gagal ambil user:", error);
    return "Error Load User";
  }
}

// ==========================================
// 2. LOAD DASHBOARD DATA
// ==========================================
async function loadDashboard() {
  try {
    const reportsRef = collection(db, "reports");
    const usersRef = collection(db, "users");

    // --- A. HITUNG STATISTIK ---
    const [allReportsSnap, usersSnap] = await Promise.all([
      getDocs(query(reportsRef)),
      getDocs(query(usersRef)),
    ]);

    const totalReports = allReportsSnap.size;
    const totalUsers = usersSnap.size;

    let pendingCount = 0;
    let doneCount = 0;

    allReportsSnap.forEach((doc) => {
      const data = doc.data();
      const status = data.status ? data.status.toLowerCase() : "";

      // Logika status sesuai Android (Terkirim, Diproses, Selesai)
      if (
        status === "terkirim" ||
        status === "menunggu" ||
        status === "proses" ||
        status === "diproses"
      )
        pendingCount++;
      if (status === "selesai") doneCount++;
    });

    // Update UI Angka Statistik
    if (statTotal) statTotal.innerText = totalReports;
    if (statPending) statPending.innerText = pendingCount;
    if (statSelesai) statSelesai.innerText = doneCount;
    if (statUsers) statUsers.innerText = totalUsers;

    // --- B. LOAD TABEL (5 TERBARU) ---
    // Sesuaikan field order dengan 'created_at' dari Android
    const recentQuery = query(
      reportsRef,
      orderBy("created_at", "desc"),
      limit(5)
    );

    const recentSnap = await getDocs(recentQuery);

    if (tabelBody) tabelBody.innerHTML = "";

    // Cek jika kosong
    if (recentSnap.empty) {
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    } else {
      if (emptyState) emptyState.classList.add("hidden");
    }

    // --- C. RENDER DATA KE TABEL ---
    for (const reportDoc of recentSnap.docs) {
      const data = reportDoc.data();

      // Ambil Nama Pelapor (Async)
      const pelaporName = await getUserName(data.userId);

      // Format Tanggal (Support String format dd-MM-yyyy HH:mm dari Android)
      let dateDisplay = data.created_at || "-";

      // Jika formatnya dd-MM-yyyy, kita rapikan tampilannya
      if (typeof dateDisplay === "string" && dateDisplay.includes("-")) {
        // Hanya ambil bagian tanggal saja (dd-MM-yyyy)
        dateDisplay = dateDisplay.split(" ")[0];
      }

      // Badge Status
      let statusBadge = "";
      const st = data.status ? data.status.toLowerCase() : "";

      if (st === "selesai") {
        statusBadge =
          '<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-200">Selesai</span>';
      } else if (st === "proses" || st === "diproses") {
        statusBadge =
          '<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-200">Diproses</span>';
      } else if (st === "ditolak") {
        statusBadge =
          '<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-200">Ditolak</span>';
      } else {
        statusBadge = `<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded border border-yellow-200 capitalize">${
          data.status || "Terkirim"
        }</span>`;
      }

      const row = `
                <tr class="bg-white border-b hover:bg-gray-50 transition">
                    <td class="px-6 py-4 font-medium text-gray-500">
                        ${dateDisplay}
                    </td>
                    <td class="px-6 py-4 font-bold text-gray-800">
                        ${pelaporName}
                    </td>
                    <td class="px-6 py-4 truncate max-w-[200px]" title="${
                      data.judul
                    }">
                        ${data.judul || "Tanpa Judul"}
                    </td>
                    <td class="px-6 py-4">
                        <span class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200">
                            ${data.kategori || "Umum"}
                        </span>
                    </td>
                    <td class="px-6 py-4">${statusBadge}</td>
                    <td class="px-6 py-4 text-center">
                        <a href="reports.html?open=${reportDoc.id}" 
                           class="text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-3 py-2 transition inline-flex items-center">
                            <i class="fas fa-search-plus mr-1"></i> Detail
                        </a>
                    </td>
                </tr>
            `;
      if (tabelBody) tabelBody.innerHTML += row;
    }
  } catch (error) {
    console.error("Dashboard Error:", error);
    if (tabelBody)
      tabelBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-4 font-medium">Gagal memuat data. Periksa koneksi atau console.</td></tr>`;
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);
