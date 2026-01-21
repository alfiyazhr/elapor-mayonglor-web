# E-Lapor Mayong Lor (Web Admin Dashboard)

Pusat kendali (Centralized Dashboard) untuk ekosistem E-Lapor Mayong Lor. Dashboard ini dirancang khusus untuk administrator desa agar dapat mengelola laporan masyarakat, memvalidasi data, dan memantau statistik pengaduan secara real-time.

## Antarmuka Admin (Screenshots)

| Login Admin | Dashboard Utama | Manajemen Laporan |
| :---: | :---: | :---: |
| <img width="720" height="355" alt="image" src="https://github.com/user-attachments/assets/275fb06d-7143-4ded-934c-a73433b92c4e" width="400" /> | <img width="720" height="360" alt="image" src="https://github.com/user-attachments/assets/3c68284c-e9e7-44a9-a64b-12f632d20bf6" width="400" /> | <img width="720" height="360" alt="image" src="https://github.com/user-attachments/assets/5f288f15-f23a-49cd-b32a-7578cac26999" width="400" /> |

| Detail Laporan | Manajemen Pengguna | Pengaturan Profil |
| :---: | :---: | :---: |
| <img src="https://github.com/user-attachments/assets/LINK_FOTO_DETAIL_WEB" width="400" /> | <img src="https://github.com/user-attachments/assets/LINK_FOTO_USERS_WEB" width="400" /> | <img src="https://github.com/user-attachments/assets/LINK_FOTO_PROFIL_WEB" width="400" /> |

## Fitur Utama
- **Rekapitulasi Pengaduan:** Dashboard pusat yang menyajikan rekapan seluruh laporan masyarakat secara terstruktur.
- **Validasi Laporan:** Meninjau bukti foto dan koordinat lokasi pengaduan sebelum melakukan verifikasi data.
- **Update Status Real-time:** Manajemen status laporan (Menunggu, Diproses, Selesai) yang tersinkronisasi langsung ke aplikasi Android user.
- **Cetak Laporan:** Fitur ekspor data pengaduan ke format cetak untuk keperluan arsip fisik dan laporan pertanggungjawaban perangkat desa.
- **Manajemen Pengguna:** Kendali penuh atas data masyarakat dan hak akses akun administrator.
- **Filter Data:** Pencarian dan pengelompokan laporan berdasarkan kategori atau rentang waktu tertentu.

## Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.
- **Backend Logic:** JavaScript / Native PHP (REST API Integration).
- **Database:** Firebase Firestore (Real-time Database).
- **Security:** Firebase Authentication & Secure Config Management.

## Security & Configuration
Untuk alasan keamanan, file konfigurasi Firebase (`firebase.js`) tidak disertakan dalam repositori publik ini guna mencegah penyalahgunaan API Key. Pengaturan ini dikelola melalui file lokal yang telah dikecualikan oleh `.gitignore`.

---
*Dikembangkan sebagai bagian dari Tugas Akhir (Skripsi) - Teknik Informatika **Universitas Muria Kudus***.

*Maintainer: **Alfiya Zahrotul Jannah***
