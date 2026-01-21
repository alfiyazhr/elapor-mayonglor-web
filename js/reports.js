// File: js/reports.js
import { db, storage } from "./config/firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { showSuccess, showError, showLoading } from "./config/swal-custom.js";

const tabelLaporan = document.getElementById("tabel-laporan");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("searchReport");
const tabButtons = document.querySelectorAll("#reportTabs button");
const sortSelect = document.getElementById("sortReport");

let allReports = [];
let currentFilter = "all";
let currentSort = "date_desc";
let currentReportId = null;

// ==========================================
// 1. FUNGSI LOAD DATA
// ==========================================
async function loadReports() {
  try {
    tabelLaporan.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400 animate-pulse"><i class="fas fa-circle-notch fa-spin mr-2"></i> Memuat data...</td></tr>`;

    const q = query(collection(db, "reports"), orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);

    allReports = [];
    snapshot.forEach((doc) => {
      allReports.push({ id: doc.id, ...doc.data() });
    });

    await resolveUserNames();
    processData();
  } catch (error) {
    console.error("Error:", error);
    tabelLaporan.innerHTML = `<tr><td colspan="7" class="text-center text-red-500 py-4">Gagal memuat data.</td></tr>`;
  }
}

async function resolveUserNames() {
  const userIds = [
    ...new Set(allReports.map((r) => r.userId).filter((uid) => uid)),
  ];
  const userMap = {};
  await Promise.all(
    userIds.map(async (uid) => {
      const q = query(collection(db, "users"), where("uid", "==", uid));
      const snap = await getDocs(q);
      userMap[uid] = !snap.empty ? snap.docs[0].data().nama : "Warga Anonim";
    })
  );
  allReports = allReports.map((r) => ({
    ...r,
    pelaporName: userMap[r.userId] || "Warga Anonim",
  }));
}

// ==========================================
// 2. LOGIKA SORTIR & FILTER
// ==========================================
function processData() {
  const keyword = searchInput.value.toLowerCase();

  let result = allReports.filter((r) => {
    let matchStatus = true;
    const st = (r.status || "terkirim").toLowerCase();
    if (currentFilter === "terkirim")
      matchStatus = st !== "selesai" && st !== "ditolak";
    else if (currentFilter === "selesai") matchStatus = st === "selesai";
    return (
      matchStatus &&
      (r.judul?.toLowerCase().includes(keyword) ||
        r.pelaporName?.toLowerCase().includes(keyword))
    );
  });

  result.sort((a, b) => {
    const countA = a.pendukung ? a.pendukung.length : 0;
    const countB = b.pendukung ? b.pendukung.length : 0;
    const dateA = parseDate(a.created_at);
    const dateB = parseDate(b.created_at);

    switch (currentSort) {
      case "date_asc":
        return dateA - dateB;
      case "support_desc":
        return countB - countA;
      case "support_asc":
        return countA - countB;
      default:
        return dateB - dateA;
    }
  });

  renderTable(result);
}

function parseDate(dateStr) {
  if (!dateStr) return 0;
  const [d, t] = dateStr.split(" ");
  const [day, month, year] = d.split("-");
  return new Date(`${year}-${month}-${day}T${t || "00:00"}`).getTime();
}

// ==========================================
// 3. RENDER TABEL
// ==========================================
function renderTable(data) {
  tabelLaporan.innerHTML = "";
  data.forEach((report) => {
    const dukunganCount = report.pendukung ? report.pendukung.length : 0;
    const row = `
        <tr class="bg-white border-b hover:bg-gray-50 transition">
            <td class="px-6 py-4 text-xs">${report.created_at || "-"}</td>
            <td class="px-6 py-4 font-bold text-gray-800">${
              report.pelaporName
            }</td>
            <td class="px-6 py-4 truncate max-w-[150px]">${
              report.judul || "Tanpa Judul"
            }</td>
            <td class="px-6 py-4 text-center">
                <div class="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                    <i class="fas fa-thumbs-up"></i> ${dukunganCount}
                </div>
            </td>
            <td class="px-6 py-4 text-xs">${report.kategori || "Umum"}</td>
            <td class="px-6 py-4"><span class="capitalize px-2 py-0.5 rounded text-[10px] border border-gray-300 font-medium">${
              report.status || "Terkirim"
            }</span></td>
            <td class="px-6 py-4 text-center">
                <button class="btn-detail bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs" data-id="${
                  report.id
                }">Detail</button>
            </td>
        </tr>`;
    tabelLaporan.innerHTML += row;
  });
  document
    .querySelectorAll(".btn-detail")
    .forEach((btn) => (btn.onclick = () => openDetail(btn.dataset.id)));
}

// ==========================================
// 4. MODAL DETAIL (PERBAIKAN MAPS DI SINI)
// ==========================================
function closeDetailModal() {
  document.getElementById("modalDetail").classList.replace("flex", "hidden");
  document.getElementById("formUpdateStatus").reset();
  document.getElementById("previewFotoRespon").classList.add("hidden");
}

async function openDetail(id) {
  currentReportId = id;
  const data = allReports.find((r) => r.id === id);
  if (!data) return;

  document.getElementById("detailId").innerText = `#${id.substring(0, 8)}`;
  document.getElementById("detailJudul").innerText = data.judul;
  document.getElementById("detailDeskripsi").innerText = data.deskripsi;
  document.getElementById("detailNama").innerText = data.pelaporName;
  document.getElementById("detailFoto").src = data.foto_url || data.fotoUrl;
  document.getElementById("detailDukungan").innerText = data.pendukung
    ? data.pendukung.length
    : 0;
  document.getElementById("detailLokasi").innerText =
    data.alamat_lokasi || data.alamatLokasi || "Alamat tidak tersedia";

  // --- LOGIKA MAPS FIXED ---
  const lat = data.latitude;
  const lng = data.longitude;

  if (lat && lng) {
    // Link ke Google Maps App
    document.getElementById(
      "linkMaps"
    ).href = `https://www.google.com/maps?q=${lat},${lng}`;
    // Iframe Embed (Fixed URL)
    document.getElementById(
      "mapsFrame"
    ).src = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  } else {
    document.getElementById("mapsFrame").src = "";
  }

  document.getElementById("inputStatus").value = data.status || "Terkirim";
  document.getElementById("inputTanggapan").value =
    data.catatan_admin || data.catatanAdmin || "";

  const previewRespon = document.getElementById("previewFotoRespon");
  const containerPreview = document.getElementById("containerPreviewRespon");
  if (data.fotoResponAdmin) {
    previewRespon.src = data.fotoResponAdmin;
    containerPreview.classList.remove("hidden");
    previewRespon.classList.remove("hidden");
  } else {
    containerPreview.classList.add("hidden");
  }

  document.getElementById("modalDetail").classList.replace("hidden", "flex");
}

const formUpdate = document.getElementById("formUpdateStatus");
if (formUpdate) {
  formUpdate.onsubmit = async (e) => {
    e.preventDefault();
    showLoading("Menyimpan...");
    try {
      let updateData = {
        status: document.getElementById("inputStatus").value,
        catatan_admin: document.getElementById("inputTanggapan").value,
        updatedAt: new Date().toLocaleString("id-ID"),
      };

      const file = document.getElementById("inputFotoRespon").files[0];
      if (file) {
        const storageRef = ref(
          storage,
          `respon_admin/${currentReportId}_${Date.now()}`
        );
        await uploadBytes(storageRef, file);
        updateData.fotoResponAdmin = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, "reports", currentReportId), updateData);
      showSuccess("Berhasil", "Laporan diperbarui.");
      closeDetailModal();
      await loadReports();
    } catch (error) {
      showError("Gagal", error.message);
    }
  };
}

// ==========================================
// 5. FITUR CETAK
// ==========================================
window.printReport = function () {
  const range = document.getElementById("printRange").value;
  const now = new Date();
  const filtered = allReports.filter((r) => {
    const d = parseDate(r.created_at);
    const diff = (now.getTime() - d) / (1000 * 60 * 60 * 24 * 30);
    return diff < parseInt(range);
  });

  if (filtered.length === 0)
    return showError("Kosong", "Data periode ini tidak ada.");

  const win = window.open("", "_blank");
  win.document.write(`
        <html>
        <head>
            <style>
                body { font-family: serif; padding: 40px; }
                .kop { display: flex; align-items: center; border-bottom: 4px double black; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
                .kop-text { flex-grow: 1; margin-right: 50px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid black; padding: 6px; font-size: 11px; }
                .ttd { margin-top: 40px; float: right; text-align: center; width: 220px; }
            </style>
        </head>
        <body>
            <div class="kop" style="display:flex; align-items:center; gap:15px;">
    <img src="assets/img/logojepara.png" width="80"
         onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/3/3e/Lambang_Kabupaten_Jepara.png'">

    <div class="kop-text" style="text-align:center;">
        <h1 style="margin:0; font-size:22px; text-transform:uppercase;">
            Pemerintah Desa Mayonglor
        </h1>
        <p style="margin:0; font-size:11px; font-style:italic;">
            Balai Desa Mayonglor, Karang Panggung, Desa Mayonglor, Kec. Mayong,<br>
            Kabupaten Jepara, Kode Pos 59465
        </p>
    </div>
</div>
            <h3 style="text-align:center">REKAPITULASI LAPORAN</h3>
            <table>
                <thead>
                    <tr><th>No</th><th>Tanggal</th><th>Nama</th><th>Judul</th><th>Kategori</th><th>Dukungan</th><th>Status</th></tr>
                </thead>
                <tbody>
                    ${filtered
                      .map(
                        (r, i) =>
                          `<tr><td>${i + 1}</td><td>${r.created_at}</td><td>${
                            r.pelaporName
                          }</td><td>${r.judul}</td><td>${r.kategori}</td><td>${
                            r.pendukung?.length || 0
                          }</td><td>${r.status}</td></tr>`
                      )
                      .join("")}
                </tbody>
            </table>
            <div class="ttd">
                <p>Mayong Lor, ${now.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}</p>
                <p>Petinggi Desa,</p>
                <br><br><br>
                <p><b>( ............................ )</b></p>
            </div>
        </body>
        </html>
    `);
  win.document.close();
  win.print();
};

// ==========================================
// 6. EVENT LISTENERS
// ==========================================
document.addEventListener("DOMContentLoaded", loadReports);
document.querySelectorAll('[data-modal-hide="modalDetail"]').forEach((btn) => {
  btn.onclick = (e) => {
    e.preventDefault();
    closeDetailModal();
  };
});
searchInput.oninput = processData;
sortSelect.onchange = (e) => {
  currentSort = e.target.value;
  processData();
};
tabButtons.forEach((btn) => {
  btn.onclick = function () {
    tabButtons.forEach((b) =>
      b.classList.remove("text-blue-600", "border-blue-600", "active")
    );
    this.classList.add("text-blue-600", "border-blue-600", "active");
    currentFilter = this.dataset.filter;
    processData();
  };
});
