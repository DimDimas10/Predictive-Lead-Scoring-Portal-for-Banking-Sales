import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  LogOut,
  Phone,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { Lead, User } from '../App';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
  onViewDetail: (leadId: string) => void;
}

const API_URL = 'http://localhost:5000/api';

export function DashboardPage({ user, onLogout, onViewDetail }: DashboardPageProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'balance'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(''); // State untuk error fetching

  useEffect(() => {
    fetchLeadsWithMLScores();
  }, []);

  const fetchLeadsWithMLScores = async () => {
    setIsLoading(true);
    setError(''); // Reset error

    try {
      const response = await fetch(`${API_URL}/leads`);
      if (!response.ok) {
        throw new Error('Gagal mengambil data leads');
      }
      const data: Lead[] = await response.json();
      setLeads(data);
      setFilteredLeads(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    let result = [...leads];

    if (searchTerm) {
      result = result.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.phone.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((lead) => lead.status === statusFilter);
    }

    
    result.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'score':
          compareValue = a.predictedScore - b.predictedScore;
          break;
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'balance':
          compareValue = a.balance - b.balance;
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredLeads(result);
  }, [leads, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
  
    const oldLeads = [...leads];
    const newLeads = leads.map((lead) => 
      (lead.id === leadId ? { ...lead, status: newStatus, contactedAt: new Date() } : lead)
    );
    setLeads(newLeads);

    try {
      await fetch(`${API_URL}/leads/${leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
    
    } catch (err) {
      console.error('Gagal update status:', err);
      // Rollback jika gagal
      setLeads(oldLeads);
      alert('Gagal memperbarui status. Silakan coba lagi.');
    }
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
    if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 0.6) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 0.4) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getStatusBadge = (status: Lead['status']) => {
    const configs = {
      pending: { label: 'Belum Dihubungi', className: 'bg-gray-100 text-gray-800' },
      contacted: { label: 'Sudah Dihubungi', className: 'bg-blue-100 text-blue-800' },
      converted: { label: 'Terkonversi', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800' }
    };
    return <Badge className={configs[status].className}>{configs[status].label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };


  const totalLeads = leads.length;
  const highPriorityLeads = leads.filter((l) => l.predictedScore >= 0.7 && l.status === 'pending').length;
  const contacted = leads.filter(
    (l) => l.status === 'contacted' || l.status === 'converted' || l.status === 'rejected'
  ).length;
  const converted = leads.filter((l) => l.status === 'converted').length;
  const conversionRate = contacted > 0 ? (converted / contacted) * 100 : 0;

  const SortIcon = ({ field }: { field: 'score' | 'name' | 'balance' }) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">Sales Dashboard</h1>
                <p className="text-gray-600">Predictive Lead Scoring System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-gray-900">{user.name}</p>
                <p className="text-gray-500">{user.role}</p>
              </div>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-gray-700">Total Prospek</CardTitle>
              <Users className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{totalLeads}</div>
              <p className="text-gray-500">Nasabah potensial</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-gray-700">Prioritas Tinggi</CardTitle>
              <Target className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{highPriorityLeads}</div>
              <p className="text-gray-500">Skor ML ≥ 70%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-gray-700">Tingkat Konversi</CardTitle>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{conversionRate.toFixed(1)}%</div>
              <p className="text-gray-500">
                {converted} dari {contacted} kontak
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-gray-700">Sudah Dihubungi</CardTitle>
              <Phone className="w-5 h-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{contacted}</div>
              <p className="text-gray-500">{totalLeads > 0 ? ((contacted / totalLeads) * 100).toFixed(0) : 0}% dari total</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Cari nama, email, atau telepon..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Belum Dihubungi</SelectItem>
                    <SelectItem value="contacted">Sudah Dihubungi</SelectItem>
                    <SelectItem value="converted">Terkonversi</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchLeadsWithMLScores} className="flex-1" disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Memuat...' : 'Refresh Skor ML'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Daftar Nasabah Potensial ({filteredLeads.length})</CardTitle>
              <p className="text-gray-600">
                {sortBy === 'score' ? 'Diurutkan berdasarkan skor ML' : 
                 sortBy === 'name' ? 'Diurutkan berdasarkan nama' : 'Diurutkan berdasarkan saldo'}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Memuat data dari API tim ML...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                <p>{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700">#</th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => toggleSort('name')}
                          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                        >
                          Nama Nasabah
                          <SortIcon field="name" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700">Kontak</th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => toggleSort('balance')}
                          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                        >
                          Saldo
                          <SortIcon field="balance" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleSort('score')}
                          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                        >
                          Skor ML
                          <SortIcon field="score" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-center text-gray-700">Status</th>
                      <th className="px-4 py-3 text-center text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLeads.map((lead, index) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-gray-700">{index + 1}</td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-gray-900">{lead.name}</div>
                            <div className="text-gray-500">
                              {lead.age} tahun • {lead.job}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-gray-700">{lead.phone}</div>
                          <div className="text-gray-500">{lead.email}</div>
                        </td>
                        <td className="px-4 py-4 text-gray-900">{formatCurrency(lead.balance)}</td>
                        <td className="px-4 py-4 text-center">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full border ${getScoreColor(
                              lead.predictedScore
                            )}`}
                          >
                            {(lead.predictedScore * 100).toFixed(0)}%
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">{getStatusBadge(lead.status)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {lead.status === 'pending' && (
                              <Button size="sm" onClick={() => handleStatusChange(lead.id, 'contacted')}>
                                <Phone className="w-4 h-4 mr-1" />
                                Hubungi
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => onViewDetail(lead.id)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Detail
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredLeads.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Tidak ada data yang sesuai dengan filter</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
