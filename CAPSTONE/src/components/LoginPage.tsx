import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Building2, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react'; // Tambah ArrowLeft
import type { User } from '../App';
import Swal from 'sweetalert2';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

// 1. Update Interface untuk menerima prop onBack
interface LoginPageProps {
  onLogin: (user: User) => void;
  onBack: () => void; // <--- Tambahkan ini
}

const API_URL = 'http://localhost:5000/api'

// 2. Destructure onBack dari props
export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const { t, theme } = useThemeLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('loginFail'));
      }

      const userData: User = await response.json();

      await Swal.fire({
        icon: 'success',
        title: t('loginSuccess'),
        text: `${t('welcomeBack')}, ${userData.name}`,
        timer: 1500,
        showConfirmButton: false,
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000'
      });

      onLogin(userData);

    } catch (err: any) {
      const errorMessage = err.message || t('error');
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: t('loginFail'),
        text: errorMessage,
        confirmButtonColor: '#d33',
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300 relative
      bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 
      dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      
      {/* 3. TOMBOL KEMBALI (BACK BUTTON) */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center text-white/80 hover:text-white transition-all hover:-translate-x-1 group"
      >
        <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors mr-3 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="font-medium text-sm md:text-base">
           {/* Gunakan t('back') jika ada, atau hardcode */}
           Kembali
        </span>
      </button>

      <div className="w-full max-w-md mt-10 md:mt-0"> {/* Tambah mt agar tidak nabrak tombol back di HP */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-white mb-2 text-2xl font-bold">Bank Sales Dashboard</h1>
          <p className="text-blue-100 dark:text-slate-400">{t('dashSubtitle')}</p> 
        </div>

        <Card className="shadow-2xl dark:bg-slate-800 dark:border-slate-700 backdrop-blur-sm bg-white/95">
          <CardHeader>
            <CardTitle className="dark:text-white">{t('loginTitle')}</CardTitle>
            <CardDescription className="dark:text-slate-400">
              {t('loginDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="sales@bank.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold shadow-md transition-all hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin"/>
                    {t('processing')}...
                  </span>
                ) : t('loginBtn')}
              </Button>

              <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg dark:bg-slate-900/50 dark:border-slate-700">
                <p className="text-blue-900 dark:text-blue-300 font-medium text-xs uppercase tracking-wider mb-1">{t('demoCreds')}</p>
                <div className="text-sm space-y-1">
                  <p className="text-blue-700 dark:text-slate-400 flex justify-between">
                    <span>Email:</span> <span className="font-mono">sales@bank.com</span>
                  </p>
                  <p className="text-blue-700 dark:text-slate-400 flex justify-between">
                    <span>Pass:</span> <span className="font-mono">demo123</span>
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-blue-100/60 dark:text-slate-500 mt-8 text-sm">
          {t('footerRights')}
        </p>
      </div>
    </div>
  );
}
