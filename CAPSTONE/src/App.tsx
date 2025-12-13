// src/App.tsx

import React, { useState } from 'react';

// ===================== IMPORTS =====================
// Pastikan path import ini sesuai dengan struktur folder Anda
import WelcomePage from './components/WelcomePage'; // Sesuaikan path jika file ada di folder lain
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { DetailPage } from './components/DetailPage';
import { AdminManagementPage } from './components/AdminManagementPage';
import { AdminUserPage } from './components/AdminUserPage';
import { SalesPerformancePage } from './components/SalesPerformancePage';
import { ThemeLanguageProvider } from './contexts/ThemeLanguageContext';
import { SettingsToggle } from './components/SettingsToggle';

// ===================== INTERFACES =====================
export interface Lead {
  id: string;
  name: string;
  age: number;
  job: string;
  marital: string;
  education: string;
  balance: number;
  phone: string;
  email: string;
  contact?: string;
  campaign: number;
  previousOutcome: string;
  predictedScore: number;
  status: 'pending' | 'contacted' | 'converted' | 'rejected';
  contactedAt?: string;
  notes?: string;
  housing: string;
  loan: string;
  userId?: string;
  contactedByName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// 1. DEFINISI TIPE HALAMAN
// Menambahkan 'welcome' sebagai salah satu opsi halaman
type Page = 'welcome' | 'login' | 'dashboard' | 'detail' | 'admin' | 'adminUsers' | 'salesPerf';

function AppContent() {
  // 2. DEFAULT STATE
  // Set default ke 'welcome' agar halaman ini muncul pertama kali saat aplikasi dibuka
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  
  const [user, setUser] = useState<User | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // ===================== HANDLERS (NAVIGASI) =====================

  // Dari Welcome Page -> Masuk ke Login Page
  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  // Dari Login Page -> Kembali ke Welcome Page (Tombol Back)
  const handleBackToWelcome = () => {
    setCurrentPage('welcome');
  };

  // Login Berhasil -> Masuk Dashboard
  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  // Logout -> Kembali ke Login
  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login'); 
  };

  // Dashboard -> Lihat Detail Lead
  const handleViewDetail = (leadId: string) => {
    setSelectedLeadId(leadId);
    setCurrentPage('detail');
  };

  // Detail/Admin -> Kembali ke Dashboard
  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setSelectedLeadId(null);
  };

  // Navigasi ke Halaman Admin (Manage Leads)
  const handleNavigateToAdmin = () => {
    setCurrentPage('admin');
  };
  
  // Navigasi ke Halaman Admin (Manage Users)
  const handleOpenAdminUsers = () => {
    setCurrentPage('adminUsers');
  };

  // Navigasi ke Halaman Sales Performance
  const handleNavigateToSales = () => {
    setCurrentPage('salesPerf');
  };

  // ===================== RENDER UTAMA =====================
  return (
    <>
      {/* Tombol Pengaturan Tema & Bahasa (Muncul di semua halaman) */}
      <SettingsToggle />
      
      {/* Container Utama dengan Background Responsif Dark Mode */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        
        {/* 1. HALAMAN WELCOME */}
        {currentPage === 'welcome' && (
          <WelcomePage onNavigateToLogin={handleNavigateToLogin} />
        )}

        {/* 2. HALAMAN LOGIN */}
        {currentPage === 'login' && (
          <LoginPage 
            onLogin={handleLogin} 
            onBack={handleBackToWelcome} // <-- Props penting untuk tombol kembali
          />
        )}
        
        {/* 3. HALAMAN DASHBOARD */}
        {currentPage === 'dashboard' && user && (
          <DashboardPage 
            user={user}
            onLogout={handleLogout}
            onViewDetail={handleViewDetail}
            onNavigateToAdmin={handleNavigateToAdmin}
            onOpenAdminUsers={handleOpenAdminUsers}
            onNavigateToSales={handleNavigateToSales}
          />
        )}
        
        {/* 4. HALAMAN DETAIL LEAD */}
        {currentPage === 'detail' && user && selectedLeadId && (
          <DetailPage 
            leadId={selectedLeadId}
            user={user}
            onBack={handleBackToDashboard}
          />
        )}

        {/* 5. HALAMAN ADMIN MANAGE LEADS */}
        {currentPage === 'admin' && user && (
          <AdminManagementPage 
            user={user}
            onBack={handleBackToDashboard}
          />
        )}
        
        {/* 6. HALAMAN ADMIN MANAGE USERS */}
        {currentPage === 'adminUsers' && user && (
          <AdminUserPage
            user={user}
            onLogout={handleLogout}
            onBackToDashboard={handleBackToDashboard}
          />
        )}

        {/* 7. HALAMAN SALES PERFORMANCE */}
        {currentPage === 'salesPerf' && user && (
          <SalesPerformancePage
            user={user}
            onBack={handleBackToDashboard}
            onViewDetail={handleViewDetail}
          />
        )}
      </div>
    </>
  );
}

// Export default App yang membungkus AppContent dengan Provider Context
export default function App() {
  return (
    <ThemeLanguageProvider>
      <AppContent />
    </ThemeLanguageProvider>
  );
}