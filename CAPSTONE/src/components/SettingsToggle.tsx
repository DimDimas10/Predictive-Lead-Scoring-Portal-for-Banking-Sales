// src/components/SettingsToggle.tsx
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Button } from './ui/button';

export function SettingsToggle() {
  const { theme, toggleTheme, language, setLanguage } = useThemeLanguage();

  return (
    // POSISI: fixed bottom-4 right-4 (Pojok Kanan Bawah)
    // Z-INDEX: z-50 agar selalu di atas elemen lain
    <div className="fixed bottom-4 right-4 z-50 flex gap-2 items-center">
      
      {/* CONTAINER BAHASA 
        Background berubah: bg-white (Light) -> dark:bg-slate-800 (Dark)
      */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 flex transition-colors duration-300">
        <Button 
          variant="ghost" 
          size="sm"
          className={`h-8 px-3 text-xs font-medium transition-colors ${
            language === 'id' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
          onClick={() => setLanguage('id')}
        >
          ID
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className={`h-8 px-3 text-xs font-medium transition-colors ${
            language === 'en' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
          onClick={() => setLanguage('en')}
        >
          EN
        </Button>
      </div>

      {/* TOMBOL TEMA 
        Background berubah: bg-white (Light) -> dark:bg-slate-800 (Dark)
      */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="h-10 w-10 rounded-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-300"
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5 text-slate-700 transition-all dark:scale-0" />
        ) : (
          <Sun className="h-5 w-5 text-yellow-400 transition-all" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}