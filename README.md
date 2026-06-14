<div align="center">

# 📱 LaundryPOS — Mobile App

![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-51.x-000020?style=for-the-badge&logo=expo&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Android](https://img.shields.io/badge/Android-Compatible-3DDC84?style=for-the-badge&logo=android&logoColor=white)

**Aplikasi Mobile Untuk Pelanggan Laundry**
Dibangun Dengan React Native + Expo

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur](#-fitur)
- [Teknologi](#-teknologi)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Struktur Folder](#-struktur-folder)
- [Screens](#-screens)

---

## 🎯 Tentang Proyek

LaundryPOS Mobile App Adalah Aplikasi Untuk Pelanggan Laundry Dalam Memantau Status Cucian Mereka Secara **Realtime** Langsung Dari Smartphone. Aplikasi Terhubung Ke **LaundryPOS Backend API** Menggunakan Token Autentikasi.

---

## ✨ Fitur

### 🎬 OnBoarding
- 3 Slide Animasi Sebelum Login
- Animasi **Float** Pada Ikon
- Swipe Horizontal Untuk Pindah Slide
- Hanya Muncul **Sekali** (Tersimpan Di AsyncStorage)

### 🔐 Autentikasi
- Login Dengan Email & Password
- Validasi Form Dengan Animasi Shake Saat Gagal
- Token Tersimpan Di AsyncStorage
- Auto Redirect Ke Login Saat Token Habis

### 📋 Dashboard (Cucian Saya)
- Kartu Transaksi Dengan **Warna Gradient** Per Status
- Progress Bar Mini Menampilkan Tahapan Cucian
- Badge Status & Status Pembayaran
- Pull-To-Refresh Untuk Update Data
- Animasi **Fade + Slide + Spring** Saat Kartu Muncul
- Empty State Jika Belum Ada Transaksi
- Summary Chip : Total, Aktif, Selesai
- Salam Dinamis Berdasarkan Jam (Pagi/Siang/Sore/Malam)

### 🔍 Detail Transaksi
- Banner Header Gradient Sesuai Warna Status
- Progress Tracker **Vertikal** 5 Tahapan
- Info Transaksi Lengkap (Invoice, Layanan, Jumlah, Harga, Pembayaran)
- Total Box Dengan Badge Lunas/Pending
- Tampilan **Foto Kondisi Baju** Jika Ada

### 👤 Profil
- Tampilan Info Akun Lengkap
- **Edit Profil** (Nama, Nomor HP, Alamat)
- Toggle **Show/Hide Password**
- Logout Dengan Konfirmasi Alert

### 🎨 UI/UX
- Dark Theme Premium Konsisten Di Semua Screen
- Animasi Halus Di Setiap Transisi
- Bottom Tab Bar Dengan Animasi Spring Saat Diklik
- Loading Screen Dengan Animasi Pulse
- Error Banner Dengan Tombol Retry

---

## 🛠 Teknologi

| Package | Versi | Kegunaan |
|---------|-------|----------|
| React Native | 0.74 | Framework Mobile |
| Expo | 51.x | Development Platform |
| React Navigation | 6.x | Navigasi Antar Screen |
| Expo Linear Gradient | - | Gradient Background & Card |
| Expo Font | - | Font Inter Kustom |
| Expo Splash Screen | - | Splash Screen Saat Loading |
| Axios | - | HTTP Client Ke API |
| AsyncStorage | - | Penyimpanan Lokal (Token, User) |
| Expo Vector Icons | - | Ikon (Ionicons) |
| Safe Area Context | - | Padding Aman (Notch/Navbar) |

---

## 📋 Prasyarat

- Node.js >= 18
- npm Atau yarn
- Expo Go (Di Smartphone) — Download Di Play Store / App Store
- Smartphone & Komputer Dalam **Jaringan WiFi Yang Sama**

---

## ⚙ Instalasi

**1. Clone Repository**
```bash
git clone https://github.com/username/laundrypos-mobile.git
cd laundrypos-mobile
```

**2. Install Dependencies**
```bash
npm install
```

**3. Install Expo Packages**
```bash
npx expo install expo-linear-gradient expo-font expo-splash-screen
npx expo install react-native-screens react-native-safe-area-context
npx expo install @expo/vector-icons @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install axios
```

---

## 🔧 Konfigurasi

Buka File `app/services/api.js`, Sesuaikan `BASE_URL` Dengan IP Komputer Anda :

```javascript
// Ganti Dengan IP Komputer Di Jaringan WiFi Anda
export const BASE_URL = 'http://192.168.1.x:8000/api';
```

**Cara Cek IP Komputer :**
- Windows : Buka CMD → Ketik `ipconfig` → Lihat **IPv4 Address** Di Bagian WiFi
- Mac/Linux : Buka Terminal → Ketik `ifconfig` → Lihat Bagian **en0**

> ⚠️ Jangan Gunakan `localhost` Karena Tidak Bisa Diakses Dari HP Fisik

---

## 🚀 Menjalankan Aplikasi

**1. Jalankan Backend API Terlebih Dahulu :**
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

**2. Jalankan Expo :**
```bash
npx expo start
```

**3. Scan QR Code** Yang Muncul Di Terminal Menggunakan Aplikasi **Expo Go** Di Smartphone.

---

## 📁 Struktur Folder

```
LaundryApp/
├── app/
│   ├── screens/
│   │   ├── OnBoardingScreen.jsx   → Halaman OnBoarding
│   │   ├── LoginScreen.jsx        → Halaman Login
│   │   ├── DashboardScreen.jsx    → Daftar Cucian
│   │   ├── DetailScreen.jsx       → Detail Transaksi
│   │   └── ProfileScreen.jsx      → Profil Pelanggan
│   ├── services/
│   │   ├── api.js                 → Konfigurasi Axios & Endpoints
│   │   └── storage.js             → Helper AsyncStorage
│   └── navigation/
│       └── AppNavigator.jsx       → Konfigurasi Navigasi
├── App.jsx                        → Entry Point Aplikasi
└── package.json
```

---

## 📱 Screens

| Screen | Deskripsi |
|--------|-----------|
| OnBoarding | 3 Slide Perkenalan Aplikasi |
| Login | Form Login Pelanggan |
| Dashboard | Daftar Kartu Status Cucian |
| Detail | Detail Lengkap Satu Transaksi |
| Profile | Info & Edit Profil Pelanggan |

---

## 👨‍💻 Developer

Dibuat Dengan ❤️ Untuk **Ujian Sertifikasi Kompetensi XI RPL**
Tahun Pelajaran 2025/2026
