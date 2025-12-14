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

**Catatan:**
- Backend saat ini masih menggunakan **mock data**
- Data user berada di `BE/src/data/users.js`
- Data nasabah berada di `BE/src/pages/leads.js`



### 3. Setup Database PostgreSQL

```bash
psql -U postgres -d nama_database -f nama_file.sql
```

Konfigurasi database backend:

```env
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
python hitung_skor_nasabah.py
```

Script ini akan:
1. Mengambil data nasabah dari database
2. Melakukan preprocessing dan feature engineering
3. Memuat model Machine Learning dari file `.pkl`
4. Menghitung probabilitas prediksi
5. Menyimpan hasil prediksi ke database

Hasil skor prediksi akan otomatis muncul di dashboard frontend.



## Petunjuk Penggunaan Aplikasi

### Login
Pengguna melakukan login menggunakan akun demo yang tersedia dan diarahkan ke dashboard sesuai role.



### Role Admin
- Melihat daftar nasabah dan skor prediksi
- Melihat ranking nasabah
- Mengelola akun Sales
- Mengelola data nasabah
- Melakukan refresh skor Machine Learning


### Role Sales
- Melihat daftar nasabah dan skor prediksi
- Menentukan prioritas follow up
- Mengubah status nasabah (Sudah Dihubungi / Terkonversi / Ditolak)
- Melihat riwayat kinerja pada halaman **Peforma Saya**



## Status Pengembangan

- Backend masih menggunakan mock data
- Model Machine Learning sudah selesai dilatih
- Integrasi database masih dalam tahap pengembangan

