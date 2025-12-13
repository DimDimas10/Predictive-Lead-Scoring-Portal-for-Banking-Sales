import { Target, Calendar } from 'lucide-react';
import React from 'react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext'; // Import

export function CampaignHeader() {
  const { t } = useThemeLanguage(); // Hook

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-6 transition-colors duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 p-3 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white mb-1">{t('campaignTitle')}</h1>
            <p className="text-gray-600 dark:text-slate-400">
              {t('campaignDesc')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 px-4 py-2 rounded-lg">
          <Calendar className="w-4 h-4" />
          <span>{t('currentDate')}</span>
        </div>
      </div>
    </div>
  );
}