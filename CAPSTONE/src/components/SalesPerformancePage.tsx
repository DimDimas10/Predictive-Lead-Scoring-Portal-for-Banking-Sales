import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { RefreshCw, ArrowLeft, Eye, Search, Filter } from 'lucide-react';
import type { User, Lead } from '../App';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext'; // [1] Import Hook

const API_URL = 'predictive-lead-scoring-portal-for-banking-sales-production.up.railway.app';
const PAGE_SIZE = 20;

interface SalesPerformancePageProps {
  user: User;
  onBack: () => void;
  onViewDetail: (leadId: string) => void;
}

export function SalesPerformancePage({ user, onBack, onViewDetail }: SalesPerformancePageProps) {
  const { t, language } = useThemeLanguage(); // [2] Gunakan Hook
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filtered, setFiltered] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'all' | 'contacted' | 'converted' | 'rejected'>('all');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMyLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyLeads = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${API_URL}/users/${encodeURIComponent(String(user.id))}/leads-history`
      );
      if (!res.ok) throw new Error(t('fetchError'));
      const data: Lead[] = await res.json();

      setLeads(data);
      setFiltered(data);
      setCurrentPage(1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  // derived metrics
  const totalHandled = leads.length;
  const converted = leads.filter(l => l.status === 'converted').length;
  const contacted = leads.length; // Asumsi history mencatat semua yg disentuh
  const conversionRate = contacted > 0 ? (converted / contacted) * 100 : 0;

  // search & filter
  useEffect(() => {
    let out = [...leads];

    if (search) {
      const q = search.toLowerCase();
      out = out.filter(l =>
        l.name.toLowerCase().includes(q) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q))
      );
    }

    if (statusFilter !== 'all') {
      out = out.filter(l => l.status === statusFilter);
    }

    setFiltered(out);
    setCurrentPage(1);
  }, [leads, search, statusFilter]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const formatDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleString(language === 'id' ? 'id-ID' : 'en-US') : '-';

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      contacted: { label: t('statusContacted'), className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' },
      converted: { label: t('statusConverted'), className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' },
      rejected: { label: t('statusRejected'), className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' },
      pending: { label: t('statusPending'), className: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300' }
    };
    const config = configs[status] || configs['pending'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-gray-900 dark:text-white text-xl font-bold">{t('myPerformance')}</h1>
            <p className="text-gray-600 dark:text-slate-400 text-sm">
              {t('leadsHistory')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backButton')}
            </Button>
            <Button variant="outline" onClick={fetchMyLeads} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('reset')}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-700 dark:text-slate-300 text-sm font-medium uppercase tracking-wide">{t('totalLeads')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalHandled}</div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                {t('contactedDesc')}
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-700 dark:text-slate-300 text-sm font-medium uppercase tracking-wide">{t('contacted')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{contacted}</div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                {t('leadsHistory')}
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-700 dark:text-slate-300 text-sm font-medium uppercase tracking-wide">{t('conversionRate')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{conversionRate.toFixed(1)}%</div>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                {converted} {t('of')} {contacted}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* TABLE SECTION */}
        <div className="mx-auto w-full max-w-7xl">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
                <CardTitle className="text-gray-900 dark:text-white">{t('leadsHistory')}</CardTitle>
                
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <Input
                      placeholder={t('searchPlaceholder')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
                    />
                  </div>
                  
                  <div className="relative w-full sm:w-40">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-200 bg-white text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 dark:text-white appearance-none"
                    >
                      <option value="all">{t('allStatus')}</option>
                      <option value="contacted">{t('statusContacted')}</option>
                      <option value="converted">{t('statusConverted')}</option>
                      <option value="rejected">{t('statusRejected')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
                  <div className="text-gray-600 dark:text-slate-400">{t('loadingData')}</div>
                </div>
              ) : error ? (
                <div className="py-12 text-center text-red-600 dark:text-red-400">
                  {error}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-gray-500 dark:text-slate-500">
                  {t('noDataFound')}
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-slate-300 w-12">#</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-slate-300">{t('colName')}</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-slate-300 w-56">{t('contact')}</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-slate-300 w-28">{t('campaign')}</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-slate-300 w-32">{t('colStatus')}</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-slate-300 w-48">{t('contactedAt')}</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-slate-300 w-28">{t('colAction')}</th>
                      </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700">
                      {pageItems.map((l, idx) => (
                        <tr
                          key={`${l.id}-${startIndex + idx}`}
                          className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                            {startIndex + idx + 1}
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-xs">
                              {l.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 truncate">
                              {l.age ?? '-'} {t('yearOld')} • {l.job ?? '-'}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="truncate text-gray-700 dark:text-slate-300 max-w-[150px]">
                              {l.email ?? '-'}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-slate-500 mt-1 truncate">
                              {l.phone ?? '-'}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                            {l.campaign ?? '-'}
                          </td>

                          <td className="px-4 py-3">
                            {getStatusBadge(l.status)}
                          </td>

                          <td className="px-4 py-3 text-gray-700 dark:text-slate-300 truncate">
                            {formatDate(l.contactedAt as any)}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onViewDetail(l.id)}
                              className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700 h-8"
                            >
                              <Eye className="w-4 h-4 mr-1" /> {t('detail')}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {filtered.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between px-4 py-4 border-t border-gray-100 dark:border-slate-700 gap-4">
                  <p className="text-gray-600 dark:text-slate-400 text-sm text-center md:text-left">
                    {t('showing')} {startIndex + 1}–
                    {Math.min(startIndex + PAGE_SIZE, filtered.length)} {t('of')} {filtered.length} {t('dataCount')}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      {t('prev')}
                    </Button>
                    <span className="text-gray-700 dark:text-slate-300 text-sm">
                      {t('page')} {currentPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                      {t('next')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

}
