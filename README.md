# Predictive Lead Scoring Portal for Banking Sales

Predictive Lead Scoring Portal for Banking Sales adalah aplikasi yang membantu tim sales perbankan dalam menentukan prioritas nasabah berdasarkan skor probabilitas hasil Machine Learning.  
Aplikasi ini dikembangkan sebagai bagian dari **Capstone Project (Dicoding x Accenture)** dan terdiri dari tiga komponen utama: **Frontend**, **Backend**, dan **Model Machine Learning**.



## Gambaran Umum Sistem

Sistem Predictive Lead Scoring Portal for Banking Sales terdiri dari:

1. **Model Machine Learning**  
   Digunakan untuk memproses data nasabah, melakukan preprocessing, menghitung skor probabilitas, dan menyimpan hasil prediksi ke database.

2. **Backend API**  
   Menghubungkan aplikasi dengan database serta menangani proses penyimpanan dan pengelolaan data.

3. **Frontend**  
   Portal lead scoring yang digunakan oleh tim sales bank untuk melihat daftar nasabah dan skor prediksi hasil Machine Learning.



## Teknologi yang Digunakan

### Frontend
- Framework: React + TypeScript  
- UI: TailwindCSS / Component Library  
- Fungsi:
  - Menampilkan dashboard
  - Menampilkan data nasabah
  - Menampilkan skor prediksi Machine Learning

### Backend API
- Framework: Node.js (Hapi.js / Express)
- Database: PostgreSQL
- Fungsi:
  - CRUD data nasabah
  - Menyimpan skor prediksi
  - Integrasi dengan model Machine Learning

### Machine Learning Model
- Bahasa: Python 3.10+
- Model akhir: Gradient Boosting / LightGBM (SMOTE Tuned)
- Pipeline: preprocessing + model + encoding
- Library utama:
  - scikit-learn
  - pandas
  - numpy
  - joblib
  - imbalanced-learn
  - lightgbm



## Cara Instalasi dan Penyiapan Proyek

### 1. Instalasi Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikasi frontend akan berjalan di:

```
http://localhost:3000
```

### 2. Instalasi Backend

```bash
cd backend
npm install
npm start
```

Backend akan berjalan di:

```
http://localhost:5000
```

### 3. Setup Database PostgreSQL

```bash
psql -U postgres -d nama_database -f nama_file.sql
```

Konfigurasi database backend:

```db.js
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=nama_database
```

### 4. Instalasi Model Machine Learning

```bash
cd ml
pip install -r requirements.txt
```

### 5. Menjalankan Prediksi Machine Learning

```bash
python app.py
```

Script ini akan:
1. Mengambil data nasabah dari database
2. Melakukan preprocessing dan feature engineering
3. Memuat model Machine Learning dari file `.joblib`
4. Menghitung probabilitas prediksi
5. Menyimpan hasil prediksi ke database

Hasil skor prediksi akan otomatis muncul di dashboard frontend.

## Petunjuk Penggunaan Aplikasi

### Login
Saat aplikasi dijalankan, pengguna akan diarahkan ke Landing Page. Untuk mulai menggunakan
aplikasi, klik tombol Login. Pada tahap ini, pengguna dapat melakukan simulasi login menggunakan
akun demo Admin yang telah disediakan. Setelah login berhasil, pengguna akan masuk ke dashboard
sesuai dengan role akun tersebut. silahkan buat sales baru untuk login sebagai sales

### Role Admin
- Melihat daftar nasabah dan skor prediksi
- Melihat ranking nasabah
- Mengelola akun Sales
- Mengelola data nasabah
- Melakukan refresh skor Machine Learning
- monitoring aktifitas setiap sales

### Role Sales
- Melihat daftar nasabah dan skor prediksi
- Menentukan prioritas follow up
- Mengubah status nasabah (Sudah Dihubungi / Terkonversi / Ditolak)
- Melihat riwayat kinerja pada halaman **Peforma Saya**
 ## Saat status nasabah diperbarui:
   1. Jika nasabah dikategorikan sebagai Terkonversi, maka nasabah tersebut tidak akan lagi
   muncul di daftar nasabah pada Sales lainnya. Hal ini dilakukan untuk memastikan bahwa
   nasabah yang sudah berhasil dikonversi tidak dihubungi dua kali.
   2. Jika nasabah diberi status Ditolak, maka nasabah tersebut juga tidak akan ditampilkan di
   dashboard Sales lain guna menghindari telepon berulang (spam calling).
   Nasabah dengan status Ditolak akan kembali menjadi Pending otomatis setelah 1 hari,
   sehingga dapat muncul kembali di daftar Sales untuk dilakukan follow up ulang.

## Role Admin
### 2. Dashboard Admin
Pada Dashboard Admin, sistem menampilkan:
- Daftar nasabah
- Skor probabilitas hasil prediksi Machine Learning
- Ranking nasabah berdasarkan skor tertinggi

Admin dapat melihat prioritas nasabah, namun tidak dapat mengubah status follow up.  
Admin juga dapat menekan tombol **“Refresh Skor ML”** untuk menjalankan ulang proses prediksi dan memperbarui skor seluruh nasabah.

---

### 3. Mengelola Akun Sales (Halaman *Admin User*)
Pada halaman ini, Admin dapat:
- Membuat akun Sales baru
- melihat daftar Sales yang sudah terdaftar
- Mengelola atau menghapus akun Sales
- Memantau nasabah yang telah dihubungi oleh masing-masing Sales

Fitur ini membantu Admin memonitor kinerja Sales secara menyeluruh.

---

### 4. Mengelola Data Nasabah (Halaman *Kelola Data*)
Admin dapat:
- Melihat data nasabah
- Menambahkan data nasabah baru
- Mengedit data nasabah
- Menghapus data nasabah
Seluruh data disimpan di PostgreSQL dan akan diproses oleh model Machine Learning.
---

## Role Sales
### 5. Dashboard Sales
Pada Dashboard Sales, sistem menampilkan:
- daftar nasabah
- skor probabilitas yang telah dihitung menggunakan model ML
- urutan ranking nasabah berdasarkan skor tertinggi
- informasi yang digunakan untuk proses follow up
- tombol “sudah dihubungi” untuk mengubah status nasabah

Sales menggunakan ranking ini untuk menentukan prioritas panggilan.  
Sales juga dapat menekan tombol **“Refresh Skor ML”** untuk mendapatkan skor terbaru.

---

### 6. Update Status Nasabah (Halaman Detail Nasabah)
Pada halaman detail nasabah, Sales dapat mengubah status menjadi:
- **Sudah Dihubungi**
- **Terkonversi**
- **Ditolak**

Aturan sistem:
- Status **Terkonversi** → nasabah tidak muncul lagi di Sales lain.
- Status **Ditolak** → nasabah disembunyikan sementara untuk menghindari spam calling. otomatis kembali menjadi **Pending** setelah 1 hari.
---

### 7. Melihat Riwayat Kinerja (Halaman *Peforma Saya*)
Sales dapat melihat riwayat nasabah yang telah dihubungi beserta statusnya.  
Fitur ini membantu Sales memantau progres dan performa kerja mereka.

---


