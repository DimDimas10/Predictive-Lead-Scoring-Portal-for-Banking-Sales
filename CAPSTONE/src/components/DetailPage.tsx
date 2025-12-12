import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  ArrowLeft, User, Mail, Phone, Briefcase, GraduationCap, Calendar,
  DollarSign, TrendingUp, Home, CreditCard, Target, CheckCircle2,
  XCircle, MessageSquare, Activity, RefreshCw, Save 
} from 'lucide-react';
import type { User as AppUser, Lead } from '../App';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import Swal from 'sweetalert2';

interface DetailPageProps {
  leadId: string;
  user: AppUser;
  onBack: () => void;
}

const API_URL = 'https://postgres-production-ec27.up.railway.app/api';

export function DetailPage({ leadId, user, onBack }: DetailPageProps) {
  const { t, language, theme } = useThemeLanguage();
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeadDetail = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_URL}/leads/${leadId}`);
        if (!response.ok) {
          throw new Error(t('fetchError'));
        }
        const data: Lead = await response.json();
        setLead(data);
        setNotes(data.notes || '');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeadDetail();
  }, [leadId, t]);

  const handleStatusChange = async (newStatus: Lead['status']) => {
    if (!lead) return;

    // SweetAlert Konfirmasi
    const confirmResult = await Swal.fire({
      title: t('confirmChange'),
      text: `${t('confirmChangeDesc')} "${t(newStatus === 'contacted' ? 'statusContacted' : newStatus === 'converted' ? 'statusConverted' : 'statusRejected')}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: t('yesChange'),
      cancelButtonText: t('cancel'),
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      background: theme === 'dark' ? '#1e293b' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#000000',
    });

    if (!confirmResult.isConfirmed) return;

    const oldLead = lead;
    setLead({ ...lead, status: newStatus });

    try {
      const res = await fetch(`${API_URL}/leads/${lead.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          userId: String(user.id),
        }),
      });

      if (!res.ok) throw new Error(t('updateError'));

      Swal.fire({
        icon: 'success',
        title: t('success'),
        text: t('statusUpdated'),
        timer: 1000,
        showConfirmButton: false,
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
      });

    } catch (err) {
      console.error('Gagal update status:', err);
      setLead(oldLead);
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('updateError'),
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!lead) return;
    setIsSaving(true);
    try {
      await fetch(`${API_URL}/leads/${lead.id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes }),
      });
      
      Swal.fire({
        icon: 'success',
        title: t('success'),
        text: t('dataUpdateSuccess'),
        timer: 1000,
        showConfirmButton: false,
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
      });
    } catch (err) {
      console.error('Gagal simpan catatan:', err);
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('saveError'),
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatYesNo = (val?: string | null) => {
    if (!val) return '-';
    if (val.toLowerCase() === 'yes') return t('yes');
    if (val.toLowerCase() === 'no') return t('no');
    return val;
  };

  const formatMarital = (val?: string | null) => {
    if (!val) return '-';
    switch (val.toLowerCase()) {
      case 'married': return t('married');
      case 'single': return t('single');
      case 'divorced': return t('divorced');
      default: return val;
    }
  };

  const formatEducation = (val?: string | null) => {
    if (!val) return '-';
    switch (val.toLowerCase()) {
      case 'primary': return t('primaryEdu');
      case 'secondary': return t('secondaryEdu');
      case 'tertiary': return t('tertiaryEdu');
      case 'unknown': return t('unknownEdu');
      default: return val;
    }
  };

  const formatContactType = (val?: string | null) => {
    if (!val) return '-';
    switch (val.toLowerCase()) {
      case 'cellular': return t('cellular');
      case 'telephone': return t('telephone');
      default: return val;
    }
  };

  const formatPoutcome = (val?: string | null) => {
    if (!val) return '-';
    switch (val.toLowerCase()) {
      case 'success': return t('successResult');
      case 'failure': return t('failureResult');
      case 'other': return t('otherResult');
      case 'nonexistent': return t('nonExistentResult');
      default: return val;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800';
    if (score >= 0.6) return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800';
    if (score >= 0.4) return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800';
    return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return t('veryHigh');
    if (score >= 0.6) return t('high');
    if (score >= 0.4) return t('medium');
    return t('low');
  };

  const getStatusBadge = (status: Lead['status']) => {
    const configs = {
      pending: { label: t('statusPending'), className: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200' },
      contacted: { label: t('statusContacted'), className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' },
      converted: { label: t('statusConverted'), className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' },
      rejected: { label: t('statusRejected'), className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' }
    };
    return <Badge className={configs[status].className}>{configs[status].label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <Activity className="w-8 h-8 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">{t('loadingCustomerDetail')}</p>
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={onBack} className="mt-4">{t('backToDash')}</Button>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <p className="text-gray-600 dark:text-slate-400">{t('customerNotFound')}</p>
          <Button onClick={onBack} className="mt-4">{t('backToDash')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />{t('backButton')}
            </Button>
            <div>
              <h1 className="text-gray-900 dark:text-white text-xl font-bold">{t('detailCustomer')}</h1>
              <p className="text-gray-600 dark:text-slate-400 text-sm">{t('detailSubtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 dark:text-white">{t('customerProfile')}</CardTitle>
                  {getStatusBadge(lead.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center pb-4 border-b border-gray-200 dark:border-slate-700">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-gray-900 dark:text-white font-medium mb-1">{lead.name}</h2>
                  <p className="text-gray-600 dark:text-slate-400">{lead.age} {t('yearOld')}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3"><Mail className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5" /><div><p className="text-gray-500 dark:text-slate-400 text-sm">{t('colEmail')}</p><p className="text-gray-900 dark:text-slate-200 break-all">{lead.email}</p></div></div>
                  <div className="flex items-start gap-3"><Phone className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5" /><div><p className="text-gray-500 dark:text-slate-400 text-sm">{t('phoneNumber')}</p><p className="text-gray-900 dark:text-slate-200">{lead.phone}</p></div></div>
                  <div className="flex items-start gap-3"><Briefcase className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5" /><div><p className="text-gray-500 dark:text-slate-400 text-sm">{t('colJob')}</p><p className="text-gray-900 dark:text-slate-200 capitalize">{lead.job}</p></div></div>
                  <div className="flex items-start gap-3"><GraduationCap className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5" /><div><p className="text-gray-500 dark:text-slate-400 text-sm">{t('education')}</p><p className="text-gray-900 dark:text-slate-200 capitalize">{formatEducation(lead.education)}</p></div></div>
                  <div className="flex items-start gap-3"><DollarSign className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5" /><div><p className="text-gray-500 dark:text-slate-400 text-sm">{t('colBalance')}</p><p className="text-gray-900 dark:text-slate-200">{formatCurrency(lead.balance)}</p></div></div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white"><TrendingUp className="w-5 h-5" />{t('mlPredictionScore')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`inline-flex flex-col items-center px-6 py-4 rounded-xl border-2 ${getScoreColor(lead.predictedScore)}`}>
                    <div className="mb-2 text-xl font-bold">{(lead.predictedScore * 100).toFixed(0)}%</div>
                    <p className="text-current font-medium">{getScoreLabel(lead.predictedScore)}</p>
                  </div>
                  <p className="text-gray-600 dark:text-slate-400 mt-4 text-sm">{t('mlDescription')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader><CardTitle className="text-gray-900 dark:text-white">{t('additionalInfo')}</CardTitle></CardHeader>
             <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3"><Home className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5" /><div><p className="text-gray-500 dark:text-slate-400 text-sm">{t('hasMortgage')}</p><p className="text-gray-900 dark:text-slate-200">{formatYesNo(lead.housing)}</p></div></div>
                  <div className="flex items-start gap-3"><CreditCard className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5" /><div><p className="text-gray-500 dark:text-slate-400 text-sm">{t('hasLoan')}</p><p className="text-gray-900 dark:text-slate-200">{formatYesNo(lead.loan)}</p></div></div>
                  <div className="flex items-start gap-3"><Calendar className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5" /><div><p className="text-gray-500 dark:text-slate-400 text-sm">{t('lastContact')}</p><p className="text-gray-900 dark:text-slate-200">{lead.contactedAt ? new Date(lead.contactedAt).toLocaleString(language === 'id' ? 'id-ID' : 'en-US') : '-'}</p></div></div>
                  <div className="flex items-start gap-3"><Target className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5" /><div><p className="text-gray-500 dark:text-slate-400 text-sm">{t('campaignHash')}</p><p className="text-gray-900 dark:text-slate-200">{lead.campaign ?? '-'}</p></div></div>
                  <div className="flex items-start gap-3"><Activity className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5" /><div><p className="text-gray-500 dark:text-slate-400 text-sm">{t('maritalStatus')}</p><p className="text-gray-900 dark:text-slate-200">{formatMarital(lead.marital)}</p></div></div>
                  <div className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5" /><div><p className="text-gray-500 dark:text-slate-400 text-sm">{t('previousCampaignResult')}</p><p className="text-gray-900 dark:text-slate-200">{formatPoutcome(lead.previousOutcome)}</p></div></div>
                  <div className="flex items-start gap-3"><Phone className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5" /><div><p className="text-gray-500 dark:text-slate-400 text-sm">{t('contactType')}</p><p className="text-gray-900 dark:text-slate-200">{formatContactType(lead.contact)}</p></div></div>
                  {user.role === 'admin' && (
                  <div className="flex items-start gap-3 mt-4"><Phone className="w-5 h-5 text-gray-400 dark:text-slate-500 mt-0.5" /><div><p className="text-gray-500 dark:text-slate-400 text-sm">{t('contactedBy')}</p><p className="text-gray-900 dark:text-slate-200">{lead.contactedByName || t('neverContacted')}</p></div></div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader><CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white"><MessageSquare className="w-5 h-5" />{t('salesNotes')}</CardTitle></CardHeader>
              <CardContent>
                <Textarea placeholder={t('additionalNotesPlaceholder')} value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} className="mb-4 dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"/>
                <Button onClick={handleSaveNotes} disabled={isSaving} className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500">{isSaving ? (<RefreshCw className="w-4 h-4 mr-2 animate-spin" />) : (<Save className="w-4 h-4 mr-2" />)}{isSaving ? t('saving') : t('saveNotes')}</Button>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardHeader><CardTitle className="text-gray-900 dark:text-white">{t('actions')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lead.status === 'pending' && (
                    <div className="flex gap-3"><Button onClick={() => handleStatusChange('contacted')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"><Phone className="w-4 h-4 mr-2" />{t('markAsContacted')}</Button></div>
                  )}
                  {lead.status === 'contacted' && (
                    <div className="flex gap-3">
                      <Button onClick={() => handleStatusChange('converted')} className="flex-1 bg-green-600 hover:bg-green-700 text-white"><CheckCircle2 className="w-4 h-4 mr-2" />{t('markAsConverted')}</Button>
                      <Button onClick={() => handleStatusChange('rejected')} variant="outline" className="flex-1 dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700"><XCircle className="w-4 h-4 mr-2" />{t('markAsRejected')}</Button>
                    </div>
                  )}
                  {(lead.status === 'converted' || lead.status === 'rejected') && (
                    <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center"><p className="text-gray-700 dark:text-slate-200">Status: {lead.status === 'converted' ? t('convertedSuccess') : t('rejectedFail')}</p></div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
