// src/pages/WelcomePage.tsx

import React from 'react';

// 1. Definisikan tipe Props yang diterima komponen ini
interface WelcomePageProps {
  onNavigateToLogin: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onNavigateToLogin }) => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 overflow-x-hidden">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-gradient-to-br from-blue-800 to-blue-900 text-white py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Smart Banking Sales Portal
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Tingkatkan konversi penjualan nasabah dengan kekuatan 
            Artificial Intelligence. Prioritaskan prospek terbaik, 
            hemat waktu, dan capai target lebih cepat.
          </p>
          <button 
            onClick={onNavigateToLogin}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-10 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
          >
            Masuk ke Portal
          </button>
        </div>
        
        {/* Dekorasi Background (Opsional) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-10">
           <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
           <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* ================= FITUR UTAMA ================= */}
      <section className="py-20 px-6 bg-white relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
            Mengapa Menggunakan Aplikasi Ini?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🚀" 
              title="AI Lead Scoring" 
              desc="Sistem otomatis menghitung skor probabilitas nasabah yang akan closing berdasarkan data historis." 
            />
            <FeatureCard 
              icon="📊" 
              title="Manajemen Terpusat" 
              desc="Kelola data nasabah, status penawaran, dan catatan interaksi dalam satu dashboard yang terintegrasi." 
            />
            <FeatureCard 
              icon="📈" 
              title="Monitoring Kinerja" 
              desc="Pantau riwayat interaksi dan KPI sales secara real-time untuk evaluasi strategi yang lebih baik." 
            />
          </div>
        </div>
      </section>

      {/* ================= TATA CARA PENGGUNAAN ================= */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
            Tata Cara Penggunaan
          </h2>
          
          <div className="space-y-6">
            <StepItem 
              number={1} 
              title="Login Sistem" 
              desc="Masuk menggunakan akun Sales atau Admin yang telah terdaftar untuk mengakses dashboard utama." 
            />
            <StepItem 
              number={2} 
              title="Cek Prediksi Skor" 
              desc="Lihat kolom 'Predicted Score'. Fokuslah pada nasabah dengan skor tertinggi karena mereka memiliki peluang closing terbesar." 
            />
            <StepItem 
              number={3} 
              title="Hubungi & Update Status" 
              desc="Lakukan panggilan/kontak, lalu update status nasabah (Contacted/Converted/Rejected) agar data selalu aktual." 
            />
          </div>
        </div>
      </section>

      {/* ================= ABOUT US ================= */}
      <section className="py-20 px-6 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-8">Tentang Kami</h2>
          <div className="text-gray-600 leading-relaxed space-y-4 text-lg">
            <p>
              Aplikasi ini dikembangkan sebagai bagian dari <strong>Capstone Project</strong>. 
              Tujuan kami adalah membantu industri perbankan dalam mengefisiensikan 
              proses telemarketing dengan memanfaatkan teknologi Machine Learning 
              untuk memprediksi perilaku nasabah secara akurat.
            </p>
            <p className="font-semibold text-gray-800 pt-4">
              Developed by Setya Adjie & Team
            </p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center text-sm border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} Banking Sales Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

// =================================================================
// SUB-COMPONENTS (Agar kode lebih rapi dan modular dalam satu file)
// =================================================================

interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-300 group h-full">
      <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {desc}
      </p>
    </div>
  );
};

interface StepItemProps {
  number: number;
  title: string;
  desc: string;
}

const StepItem: React.FC<StepItemProps> = ({ number, title, desc }) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-transform hover:scale-[1.01] duration-200">
      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4 md:mb-0 md:mr-6 shadow-md">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

export default WelcomePage;