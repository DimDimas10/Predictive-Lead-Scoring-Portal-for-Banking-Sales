import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { DetailPage } from './components/DetailPage';
import { AdminManagementPage } from './components/AdminManagementPage';
import { AdminUserPage } from './components/AdminUserPage';

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
  
  // Field dari Backend
  contact?: string;
  campaign: number;
  previousOutcome: string;
  predictedScore: number;
  status: 'pending' | 'contacted' | 'converted' | 'rejected';
  contactedAt?: string; // Backend mengirim string ISO date
  notes?: string;
  housing: string;
  loan: string;
  
  // Opsional (untuk UI)
  userId?: string;
  contactedByName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

type Page = 'login' | 'dashboard' | 'detail' | 'admin' | 'adminUsers';

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
    </>
  );
}