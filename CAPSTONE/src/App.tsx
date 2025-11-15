import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { DetailPage } from './components/DetailPage';

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
  lastContact: string;
  campaign: number;
  previousOutcome: string;
  predictedScore: number;
  status: 'pending' | 'contacted' | 'converted' | 'rejected';
  contactedAt?: Date;
  notes?: string;
  housing: string;
  loan: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

type Page = 'login' | 'dashboard' | 'detail';

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
        />
      )}
      
      {currentPage === 'detail' && user && selectedLeadId && (
        <DetailPage 
          leadId={selectedLeadId}
          user={user}
          onBack={handleBackToDashboard}
        />
      )}
    </>
  );
}
