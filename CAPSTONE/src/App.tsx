import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { DetailPage } from './components/DetailPage';
import { AdminManagementPage } from './components/AdminManagementPage';
import { AdminUserPage } from './components/AdminUserPage';
import { SalesPerformancePage } from './components/SalesPerformancePage'; // <-- new

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

type Page = 'login' | 'dashboard' | 'detail' | 'admin' | 'adminUsers' | 'salesPerf'; // added salesPerf

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const handleViewDetail = (leadId: string) => {
    setSelectedLeadId(leadId);
    setCurrentPage('detail');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setSelectedLeadId(null);
  };

  const handleNavigateToAdmin = () => {
    setCurrentPage('admin');
  };
  
  const handleOpenAdminUsers = () => {
    setCurrentPage('adminUsers');
  };

  // New: navigate to Sales Performance (visible only for sales users)
  const handleNavigateToSales = () => {
    setCurrentPage('salesPerf');
  };

  return (
    <>
      {currentPage === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}
      
      {currentPage === 'dashboard' && user && (
        <DashboardPage 
          user={user}
          onLogout={handleLogout}
          onViewDetail={handleViewDetail}
          onNavigateToAdmin={handleNavigateToAdmin}
          onOpenAdminUsers={handleOpenAdminUsers}
          onNavigateToSales={handleNavigateToSales} // pass the new callback
        />
      )}
      
      {currentPage === 'detail' && user && selectedLeadId && (
        <DetailPage 
          leadId={selectedLeadId}
          user={user}
          onBack={handleBackToDashboard}
        />
      )}

      {currentPage === 'admin' && user && (
        <AdminManagementPage 
          user={user}
          onBack={handleBackToDashboard}
        />
      )}
      
      {currentPage === 'adminUsers' && user && (
        <AdminUserPage
          user={user}
          onLogout={handleLogout}
          onBackToDashboard={handleBackToDashboard}
        />
      )}

      {currentPage === 'salesPerf' && user && (
        <SalesPerformancePage
          user={user}
          onBack={handleBackToDashboard}
          onViewDetail={handleViewDetail}
        />
      )}
    </>
  );
}
