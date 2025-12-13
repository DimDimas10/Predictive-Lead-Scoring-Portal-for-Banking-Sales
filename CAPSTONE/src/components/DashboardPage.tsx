import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  LogOut, Search, TrendingUp, Users, Phone, Target, ArrowUpDown, ArrowUp, ArrowDown, Eye, RefreshCw, Settings
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { User, Lead } from '../App';
import Swal from 'sweetalert2';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
  onViewDetail: (leadId: string) => void;
  onNavigateToAdmin?: () => void;
  onOpenAdminUsers?: () => void;
  onNavigateToSales?: () => void;
}

import { API_URL } from '../config/api';
const PAGE_SIZE = 20;

export function DashboardPage({ 
  user, onLogout, onViewDetail, onNavigateToAdmin, onOpenAdminUsers, onNavigateToSales
}: DashboardPageProps) {
  
  const { t, theme } = useThemeLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'balance'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${API_URL}/leads?userId=${encodeURIComponent(user.id)}&role=${encodeURIComponent(user.role)}`
      );
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data: Lead[] = await response.json();
      setLeads(data);
      setFilteredLeads(data);
      setCurrentPage(1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLeadsWithMLScores = async () => {
    document.body.style.pointerEvents = '';
    setIsLoading(true);
    setError('');

    Swal.fire({
      title: t('processML'),
      text: t('wait'),
      allowOutsideClick: false,
      background: theme === 'dark' ? '#1e293b' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#000000',
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const response = await fetch(`${API_URL}/leads/refresh-ml`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to refresh ML');
      await fetchLeads();
      
      Swal.fire({
        icon: 'success',
        title: t('success'),
        text: t('mlSuccess'),
        timer: 1500,
        showConfirmButton: false,
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
      });

    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: err.message || t('mlFail'),
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
      });
      setError(err.message || t('mlFail'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = [...leads];

    if (searchTerm) {
      result = result.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lead.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(lead => lead.status === statusFilter);
    }

    result.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'score': compareValue = a.predictedScore - b.predictedScore; break;
        case 'name': compareValue = a.name.localeCompare(b.name); break;
        case 'balance': compareValue = a.balance - b.balance; break;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredLeads(result);
    setCurrentPage(1);
  }, [leads, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    if (user.role === 'admin') return;

    const result = await Swal.fire({
      title: t('confirmChange'),
      text: `${t('confirmChangeDesc')} "${t(newStatus === 'contacted' ? 'statusContacted' : newStatus)}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: t('yesChange'),
      cancelButtonText: t('cancel'),
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      background: theme === 'dark' ? '#1e293b' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#000000',
    });

    if (!result.isConfirmed) return;

    const prevLeads = [...leads];
    setLeads(leads.map((lead) =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));

    try {
      const res = await fetch(`${API_URL}/leads/${leadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, userId: String(user.id) }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      Swal.fire({
        icon: 'success',
        title: t('success'),
        text: t('statusUpdated'),
        timer: 1000,
        showConfirmButton: false,
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
      });

    } catch (err: any) {
      console.error(err);
      setLeads(prevLeads);
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('error'),
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
      });
    }
  };

  const handleLogoutConfirm = () => {
    Swal.fire({
      title: t('confirmLogout'),
      text: t('confirmLogoutDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('yesLogout'),
      cancelButtonText: t('cancel'),
      background: theme === 'dark' ? '#1e293b' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#000000',
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout();
      }
    });
  };

  const toggleSort = (field: 'score' | 'name' | 'balance') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700';
    if (score >= 0.6) return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700';
    if (score >= 0.4) return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-700';
    return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-100 dark:border-red-700';
  };

  const getStatusBadge = (status: Lead['status']) => {
    const configs = {
      pending: { label: t('statusPending'), className: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200' },
      contacted: { label: t('statusContacted'), className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      converted: { label: t('statusConverted'), className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      rejected: { label: t('statusRejected'), className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
    };
    return <Badge className={configs[status].className}>{configs[status].label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const totalLeads = leads.length;
  const highPriorityLeads = leads.filter(l => Math.round(l.predictedScore * 100) >= 70 && l.status === 'pending').length;
  const contacted = leads.filter(l => l.status === 'contacted' || l.status === 'converted' || l.status === 'rejected').length;
  const converted = leads.filter(l => l.status === 'converted').length;
  const conversionRate = contacted > 0 ? (converted / contacted) * 100 : 0;

  const SortIcon = ({ field }: { field: 'score' | 'name' | 'balance' }) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };
  
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg"><Target className="w-6 h-6 text-white" /></div>
              <div>
                <h1 className="text-gray-900 dark:text-white font-bold">{t('dashTitle')}</h1>
                <p className="text-gray-600 dark:text-slate-400">{t('dashSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm">{user.role}</p>
              </div>

               {user.role === 'sales' && onNavigateToSales && (
                <Button variant="outline" onClick={onNavigateToSales} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
                  {t('myPerformance')}
                </Button>
              )}
              
              {user.role === 'admin' && (
                <>
                  {onOpenAdminUsers && (
                    <Button variant="outline" onClick={onOpenAdminUsers} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
                       {t('adminUser')}
                    </Button>
                  )}
                  {onNavigateToAdmin && (
                    <Button variant="outline" onClick={onNavigateToAdmin} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
                      <Settings className="w-4 h-4 mr-2" />
                      {t('manageData')}
                    </Button>
                  )}
                </>
              )}
              
              <Button variant="outline" onClick={handleLogoutConfirm} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-gray-700 dark:text-slate-300">{t('totalLeads')}</CardTitle>
              <Users className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-gray-900 dark:text-white text-2xl font-bold">{totalLeads}</div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">{t('potentialCust')}</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-gray-700 dark:text-slate-300">{t('highPriority')}</CardTitle>
              <Target className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-gray-900 dark:text-white text-2xl font-bold">{highPriorityLeads}</div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">{t('highPriorityDesc')}</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-gray-700 dark:text-slate-300">{t('conversionRate')}</CardTitle>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-gray-900 dark:text-white text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">{converted} {t('of')} {contacted} {t('contacted').toLowerCase()}</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-gray-700 dark:text-slate-300">{t('contacted')}</CardTitle>
              <Phone className="w-5 h-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-gray-900 dark:text-white text-2xl font-bold">{contacted}</div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">{totalLeads > 0 ? ((contacted / totalLeads) * 100).toFixed(0) : 0}% {t('contactedDesc')}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                    <SelectValue placeholder={t('filterStatus')} />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                    <SelectItem value="all" className="dark:text-white dark:focus:bg-slate-700">{t('allStatus')}</SelectItem>
                    <SelectItem value="pending" className="dark:text-white dark:focus:bg-slate-700">{t('statusPending')}</SelectItem>
                    <SelectItem value="contacted" className="dark:text-white dark:focus:bg-slate-700">{t('statusContacted')}</SelectItem>
                    <SelectItem value="converted" className="dark:text-white dark:focus:bg-slate-700">{t('statusConverted')}</SelectItem>
                    <SelectItem value="rejected" className="dark:text-white dark:focus:bg-slate-700">{t('statusRejected')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => refreshLeadsWithMLScores()}
                  disabled={isLoading}
                  className="flex-1 dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {t('refreshML')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 dark:text-white">
                {t('priorityListTitle')} ({filteredLeads.length})
              </CardTitle>
              <p className="text-gray-600 dark:text-slate-400">{t('sortedByScore')}</p>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-slate-400">{t('loadingData')}</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600 dark:text-red-400"><p>{error}</p></div>
            ) : (
              <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700 dark:text-slate-300">#</th>
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => toggleSort('name')} className="flex items-center gap-2 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white">
                          {t('colName')} <SortIcon field="name" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700 dark:text-slate-300">{t('Contact')}</th>
                      <th className="px-4 py-3 text-left">
                        <button onClick={() => toggleSort('balance')} className="flex items-center gap-2 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white">
                          {t('colBalance')} <SortIcon field="balance" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-center">
                        <button onClick={() => toggleSort('score')} className="flex items-center gap-2 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white">
                          {t('colScore')} <SortIcon field="score" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-center text-gray-700 dark:text-slate-300">{t('colStatus')}</th>
                      <th className="px-4 py-3 text-center text-gray-700 dark:text-slate-300">{t('colAction')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {paginatedLeads.map((lead, index) => (
                      <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-4 text-gray-700 dark:text-slate-300">{startIndex + index + 1}</td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-gray-900 dark:text-white">{lead.name}</div>
                            <div className="text-gray-500 dark:text-slate-400 text-sm">{lead.age} {t('yearOld')} • {lead.job}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-gray-700 dark:text-slate-300">{lead.phone}</div>
                          <div className="text-gray-500 dark:text-slate-400 text-sm">{lead.email}</div>
                        </td>
                        <td className="px-4 py-4 text-gray-900 dark:text-white">{formatCurrency(lead.balance)}</td>
                        <td className="px-4 py-4 text-center">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getScoreColor(lead.predictedScore)}`}>
                            {(lead.predictedScore * 100).toFixed(0)}%
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">{getStatusBadge(lead.status)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {lead.status === 'pending' && user.role !== 'admin' && (
                              <Button size="sm" onClick={() => handleStatusChange(lead.id, 'contacted')} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Phone className="w-4 h-4 mr-1" />{t('btnCall')}
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => onViewDetail(lead.id)} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
                              <Eye className="w-4 h-4 mr-1" />{t('detail')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLeads.length === 0 && <div className="text-center py-12"><p className="text-gray-500 dark:text-slate-400">{t('noData')}</p></div>}
              </div>
              
              {filteredLeads.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-gray-600 dark:text-slate-400 text-sm">{t('showing')} {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filteredLeads.length)} {t('of')} {filteredLeads.length}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50">
                        {t('prev')}
                      </Button>
                      <span className="text-gray-700 dark:text-slate-300 text-sm">{t('page')} {currentPage} {t('of')} {totalPages}</span>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50">
                        {t('next')}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
