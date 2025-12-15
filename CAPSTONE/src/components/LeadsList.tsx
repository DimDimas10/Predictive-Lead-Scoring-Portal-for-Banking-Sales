import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Phone, CheckCircle2, XCircle, Clock, TrendingUp, Briefcase, GraduationCap, Calendar, DollarSign } from 'lucide-react';
import type { Lead } from '../App';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface LeadsListProps {
  leads: Lead[];
  onStatusChange: (leadId: string, status: Lead['status']) => void;
}

export function LeadsList({ leads, onStatusChange }: LeadsListProps) {
  const { t } = useThemeLanguage();

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300';
    if (score >= 0.6) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300';
    if (score >= 0.4) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-300';
    return 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300';
  };

  const getStatusBadge = (status: Lead['status']) => {
    const configs = {
      pending: { label: t('statusPending'), variant: "secondary", className: "dark:bg-slate-700 dark:text-slate-200" }, 
      contacted: { label: t('statusContacted'), variant: "default", className: "dark:bg-blue-900 dark:text-blue-200" }, 
      converted: { label: t('statusConverted'), variant: "default", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      rejected: { label: t('statusRejected'), variant: "destructive", className: "dark:bg-red-900 dark:text-red-200" }
    };
    
    // @ts-ignore
    const config = configs[status];
    // @ts-ignore
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getEducationLabel = (education: string) => {
    const labels: Record<string, string> = {
      'primary': t('primaryEdu'),
      'secondary': t('secondaryEdu'),
      'tertiary': t('tertiaryEdu')
    };
    return labels[education] || education;
  };

  if (leads.length === 0) {
    return (
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="py-12 text-center">
          <p className="text-gray-500 dark:text-slate-400">{t('noData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-gray-900 dark:text-white text-lg font-semibold">{t('priorityListTitle')}</h2>
          <p className="text-gray-600 dark:text-slate-400">
            {t('showing')} {leads.length} {t('sortedByScore').toLowerCase()}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {leads.map((lead, index) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-5">
              {}
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                 {/* Priority Badge */}
                 <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-700 rounded-lg p-3 min-w-[60px]">
                    <TrendingUp className="w-5 h-5 text-gray-400 dark:text-slate-400 mb-1" />
                    <span className="text-gray-700 dark:text-slate-200">#{index + 1}</span>
                  </div>
                </div>

                {/* Lead Info */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-2 font-medium">{lead.name}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                        <Briefcase className="w-4 h-4" />
                        <span>{lead.job}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                        <GraduationCap className="w-4 h-4" />
                        <span>{getEducationLabel(lead.education)}</span>
                      </div>
                    </div>
                  </div>

                  {}
                   <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatCurrency(lead.balance)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{t('lastContact')}: {lead.lastContact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                      <Phone className="w-4 h-4" />
                      <span>{t('campaignHash')}{lead.campaign}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-600 dark:text-slate-400 mb-1 text-sm">{t('mlPredictionScore')}</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${getScoreColor(lead.predictedScore)}`}>
                        <span className="font-medium">{(lead.predictedScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(lead.status)}
                    </div>
                  </div>
                </div>

                 {/* Actions */}
                 <div className="flex flex-col gap-2 lg:min-w-[140px]">
                  {lead.status === 'pending' && (
                    <Button 
                      onClick={() => onStatusChange(lead.id, 'contacted')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {t('btnCall')}
                    </Button>
                  )}
                  {}
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
