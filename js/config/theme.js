// File: js/config/theme.js
// Fungsi: Mengatur konfigurasi Tailwind (Warna, Font, Shadow) secara global

tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
            colors: {
                primary: '#134574', // Biru Dongker Official (Ubah disini jika ingin ganti warna)
                secondary: '#64748b', // Abu-abu Slate Modern
            },
            boxShadow: {
                'soft': '0 20px 40px -10px rgba(19, 69, 116, 0.15)', // Shadow estetik custom
            }
        }
    }
};