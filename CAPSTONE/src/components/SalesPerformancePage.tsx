import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { RefreshCw, ArrowLeft, Eye } from 'lucide-react';
import type { User, Lead } from '../App';

const API_URL = 'http://localhost:5000/api';
const PAGE_SIZE = 20;

interface SalesPerformancePageProps {
  user: User;
  onBack: () => void;
  onViewDetail: (leadId: string) => void;
}

export function SalesPerformancePage({ user, onBack, onViewDetail }: SalesPerformancePageProps) {
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
      // endpoint history
      const res = await fetch(
        `${API_URL}/users/${encodeURIComponent(String(user.id))}/leads-history`
      );
      if (!res.ok) throw new Error('Gagal memuat data');
      const data: Lead[] = await res.json();

      setLeads(data);
      setFiltered(data);
      setCurrentPage(1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  // derived metrics
  const totalHandled = leads.length;
  const converted = leads.filter(l => l.status === 'converted').length;
  // semua yang ada di history = pernah dihandle (contacted/converted/rejected)
  const contacted = leads.length;
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
    iso ? new Date(iso).toLocaleString('id-ID') : '-';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Kinerja Sales</h1>
            <p className="text-gray-600">
              Riwayat nasabah yang pernah Anda tangani
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <Button variant="outline" onClick={fetchMyLeads}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Ditangani</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{totalHandled}</div>
              <p className="text-sm text-gray-500">
                Total riwayat nasabah yang Anda kerjakan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sudah Dihubungi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{contacted}</div>
              <p className="text-sm text-gray-500">
                Termasuk yang dikonversi & ditolak
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Konversi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{converted}</div>
              <p className="text-sm text-gray-500">
                Tingkat konversi: {conversionRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* TABLE */}
        <div className="mx-auto w-full max-w-7xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Riwayat Nasabah</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Cari nama / email / telepon"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as any)
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="all">Semua</option>
                    <option value="contacted">Sudah Dihubungi</option>
                    <option value="converted">Terkonversi</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
                  <div className="text-gray-600">Memuat...</div>
                </div>
              ) : error ? (
                <div className="py-6 text-center text-red-600">
                  {error}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  Belum ada data
                </div>
              ) : (
                <div className="w-full overflow-x-auto bg-white">
                  <div className="mx-auto w-full max-w-7xl">
                    <table className="w-full min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 w-12 text-left text-xs font-medium text-gray-500">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                            Nama
                          </th>
                          <th className="px-4 py-3 w-56 text-left text-xs font-medium text-gray-500">
                            Kontak
                          </th>
                          <th className="px-4 py-3 w-28 text-left text-xs font-medium text-gray-500">
                            Kampanye
                          </th>
                          <th className="px-4 py-3 w-32 text-left text-xs font-medium text-gray-500">
                            Status
                          </th>
                          <th className="px-4 py-3 w-48 text-left text-xs font-medium text-gray-500">
                            Tanggal
                          </th>
                          <th className="px-4 py-3 w-28 text-left text-xs font-medium text-gray-500">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-100">
                        {pageItems.map((l, idx) => (
                          <tr
                            key={`${l.id}-${startIndex + idx}`}
                            className={
                              idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }
                          >
                            <td className="px-4 py-3 text-gray-700">
                              {startIndex + idx + 1}
                            </td>

                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900 truncate">
                                {l.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                {l.age ?? '-'} tahun • {l.job ?? '-'}
                              </div>
                            </td>

                            <td className="px-4 py-3 w-56">
                              <div className="truncate text-gray-700">
                                {l.email ?? '-'}
                              </div>
                              <div className="text-xs text-gray-400 mt-1 truncate">
                                {l.phone ?? '-'}
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              {l.campaign ?? '-'}
                            </td>

                            <td className="px-4 py-3">
                              <Badge
                                className={
                                  l.status === 'converted'
                                    ? 'bg-green-100 text-green-800'
                                    : l.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }
                              >
                                <span className="text-xs font-medium">
                                  {l.status}
                                </span>
                              </Badge>
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-700 truncate">
                              {formatDate(l.contactedAt as any)}
                            </td>

                            <td className="px-4 py-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onViewDetail(l.id)}
                                aria-label={`Lihat detail ${l.name}`}
                              >
                                <Eye className="w-4 h-4 mr-1" /> Detail
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* PAGINATION */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <p className="text-gray-600 text-sm">
                        Menampilkan {startIndex + 1}–
                        {Math.min(startIndex + PAGE_SIZE, filtered.length)} dari{' '}
                        {filtered.length} riwayat
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(p => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          Sebelumnya
                        </Button>
                        <span className="text-gray-700 text-sm">
                          Halaman {currentPage} dari {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(p =>
                              Math.min(totalPages, p + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          Selanjutnya
                        </Button>
                      </div>
                    </div>
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
