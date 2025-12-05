import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import type { User, Lead } from '../App';

interface AdminManagementPageProps {
  user: User;
  onBack: () => void;
}

const API_URL = 'http://localhost:5000/api';

export function AdminManagementPage({ user, onBack }: AdminManagementPageProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    job: '',
    marital: 'single',
    education: 'secondary',
    balance: '',
    housing: 'no',
    loan: 'no',
    campaign: '1',
    previousOutcome: 'nonexistent',
    contact: 'cellular',
    notes: ''
  });

  // --- FETCH DATA DARI DATABASE ---
  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      // PERBAIKAN: Menggunakan backtick (`) untuk template literal
      const response = await fetch(`${API_URL}/leads?role=${user.role}&userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      } else {
        console.error('Gagal mengambil data leads');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getJobLabel = (job: string) => {
    return job ? job.charAt(0).toUpperCase() + job.slice(1) : '-';
  };

  const getOutcomeBadge = (outcome: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      'success': { label: 'Sukses', className: 'bg-green-100 text-green-800' },
      'failure': { label: 'Gagal', className: 'bg-red-100 text-red-800' },
      'nonexistent': { label: 'Belum Ada', className: 'bg-gray-100 text-gray-800' },
      'other': { label: 'Lainnya', className: 'bg-gray-100 text-gray-800' }
    };
    const config = configs[outcome] || configs['nonexistent'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setCurrentLeadId(null);
    setFormData({
      name: '', email: '', phone: '', age: '', job: '',
      marital: 'single', education: 'secondary', balance: '', 
      housing: 'no', loan: 'no',
      campaign: '1', previousOutcome: 'nonexistent', contact: 'cellular', notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    setModalMode('edit');
    setCurrentLeadId(lead.id);
    setFormData({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone,
      age: lead.age.toString(),
      job: lead.job,
      marital: lead.marital,
      education: lead.education,
      balance: lead.balance.toString(),
      housing: lead.housing,
      loan: lead.loan,
      campaign: lead.campaign.toString(),
      previousOutcome: lead.previousOutcome || 'nonexistent',
      contact: lead.contact || 'cellular',
      notes: lead.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (leadId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data nasabah ini?')) return;

    try {
      // PERBAIKAN: Menggunakan backtick (`)
      const response = await fetch(`${API_URL}/leads/${leadId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchLeads(); // Refresh data
      } else {
        alert('Gagal menghapus data');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleSubmit = async () => {
    // 1. Validasi Input Kosong
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Mohon lengkapi data yang wajib diisi (Nama, Email, Telepon)');
      return;
    }

    // 2. Validasi Umur (Backend minta minimal 17)
    const ageValue = parseInt(formData.age);
    if (isNaN(ageValue) || ageValue < 17) {
      alert('Umur tidak valid. Minimal 17 tahun.');
      return;
    }

    const payload = {
      ...formData,
      age: ageValue,
      balance: parseInt(formData.balance) || 0,
      campaign: parseInt(formData.campaign) || 1,
      // Mapping previousOutcome ke poutcome (sesuai backend)
      poutcome: formData.previousOutcome
    };

    try {
      let url = `${API_URL}/leads`;
      let method = 'POST';

      if (modalMode === 'edit' && currentLeadId) {
        // PERBAIKAN: Menggunakan backtick (`)
        url = `${API_URL}/leads/${currentLeadId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchLeads(); // Refresh tabel
        alert(modalMode === 'add' ? 'Data berhasil ditambahkan' : 'Data berhasil diupdate');
      } else {
        const err = await response.json();
        // PERBAIKAN: Menggunakan backtick (`)
        alert(`Gagal menyimpan: ${err.message}`);
      }
    } catch (error) {
      console.error('Error submit:', error);
      alert('Terjadi kesalahan koneksi');
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(leads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = leads.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button 
                  variant="outline" 
                  onClick={onBack}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </Button>
              </div>
              <h1 className="text-gray-900 mb-1">Manajemen Data Nasabah</h1>
              <p className="text-gray-600">
                Kelola data profil, finansial, dan riwayat kampanye nasabah secara lengkap.
              </p>
            </div>
            <Button 
              onClick={handleOpenAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Nasabah
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 flex justify-between items-center">
              <span>Daftar Nasabah ({leads.length})</span>
              <Button variant="ghost" size="sm" onClick={fetchLeads} disabled={isLoading}>
                {/* PERBAIKAN: className harus string */}
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700">Nama</th>
                    <th className="px-4 py-3 text-left text-gray-700">Pekerjaan</th>
                    <th className="px-4 py-3 text-left text-gray-700">Umur</th>
                    <th className="px-4 py-3 text-left text-gray-700">Saldo</th>
                    <th className="px-4 py-3 text-left text-gray-700">Campaign Info</th>
                    <th className="px-4 py-3 text-left text-gray-700">Prev Outcome</th>
                    <th className="px-4 py-3 text-center text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr><td colSpan={7} className="text-center py-8">Memuat data...</td></tr>
                  ) : currentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="text-gray-900 font-medium">{lead.name}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {getJobLabel(lead.job)}
                      </td>
                      <td className="px-4 py-4 text-gray-700">{lead.age}</td>
                      <td className="px-4 py-4 text-gray-900">
                        {formatCurrency(lead.balance)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge className="bg-blue-100 text-blue-800">
                          Campaign #{lead.campaign}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        {getOutcomeBadge(lead.previousOutcome)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditModal(lead)}
                            className="gap-1"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(lead.id)}
                            className="gap-1 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!isLoading && leads.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Belum ada data nasabah</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <p className="text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
          onClick={handleOpenAddModal}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Modal Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'add' ? 'Tambah Nasabah Baru' : 'Edit Data Nasabah'}
            </DialogTitle>
            <DialogDescription>
              {modalMode === 'add' 
                ? 'Lengkapi form di bawah untuk menambahkan nasabah baru ke dalam sistem.' 
                : 'Perbarui informasi nasabah sesuai kebutuhan.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Section 1: Data Pribadi */}
            <div>
              <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">Data Pribadi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Lengkap *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nama Lengkap"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Nomor Telepon *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+62..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Umur (Min 17) *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="job">Pekerjaan</Label>
                  <Input 
                    id="job"
                    value={formData.job}
                    onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                    placeholder="Contoh: technician"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="marital">Status Pernikahan</Label>
                  <Select value={formData.marital} onValueChange={(value) => setFormData({ ...formData, marital: value })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Lajang (Single)</SelectItem>
                      <SelectItem value="married">Menikah (Married)</SelectItem>
                      <SelectItem value="divorced">Cerai (Divorced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="education">Pendidikan</Label>
                  <Select value={formData.education} onValueChange={(value) => setFormData({ ...formData, education: value })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">SD</SelectItem>
                      <SelectItem value="secondary">SMP/SMA</SelectItem>
                      <SelectItem value="tertiary">Perguruan Tinggi</SelectItem>
                      <SelectItem value="unknown">Tidak Diketahui</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Data Finansial */}
            <div>
              <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">Data Finansial</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="balance">Saldo (Rp)</Label>
                  <Input
                    id="balance"
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="housing">Kredit Rumah</Label>
                  <Select value={formData.housing} onValueChange={(value) => setFormData({ ...formData, housing: value })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Ya</SelectItem>
                      <SelectItem value="no">Tidak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="loan">Pinjaman Pribadi</Label>
                  <Select value={formData.loan} onValueChange={(value) => setFormData({ ...formData, loan: value })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Ya</SelectItem>
                      <SelectItem value="no">Tidak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 3: Campaign & Teknis */}
            <div>
              <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">Campaign & Teknis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign">Jumlah Campaign</Label>
                  <Input
                    id="campaign"
                    type="number"
                    value={formData.campaign}
                    onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                   <Label htmlFor="contact">Metode Kontak</Label>
                   <Select value={formData.contact} onValueChange={(value) => setFormData({ ...formData, contact: value })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cellular">Seluler (HP)</SelectItem>
                      <SelectItem value="telephone">Telepon Rumah</SelectItem>
                    </SelectContent>
                   </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="previousOutcome">Hasil Campaign Sebelumnya</Label>
                  <Select value={formData.previousOutcome} onValueChange={(value) => setFormData({ ...formData, previousOutcome: value })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="success">Sukses</SelectItem>
                      <SelectItem value="failure">Gagal</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                      <SelectItem value="nonexistent">Belum Ada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 4: Notes */}
            <div>
              <h3 className="text-gray-900 mb-4 pb-2 border-b border-gray-200">Catatan Tambahan</h3>
              <div>
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tambahkan catatan penting..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Simpan Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}