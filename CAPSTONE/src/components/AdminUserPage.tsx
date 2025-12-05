// AdminUserPage.tsx
import {
  ArrowLeft,
  LogOut,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  Pencil,
  Trash2,
  Eye
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { User } from '../App';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ModalPortal } from './ModalPortal';

const API_URL = 'http://localhost:5000/api';

interface AdminUserPageProps {
  user: User;
  onLogout: () => void;
  onBackToDashboard: () => void;
}

interface ApiUser {
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales';
}

export function AdminUserPage({
  user,
  onLogout,
  onBackToDashboard,
}: AdminUserPageProps) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // create form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'sales'>('sales');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<ApiUser | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<ApiUser | null>(null);

  const [detailUserLeads, setDetailUserLeads] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

 
  // Pick contactedAt case-insensitive & nested
  function pickContactedAt(obj: any) {
    if (obj == null) return undefined;

   
    if (typeof obj === 'string' || typeof obj === 'number') return obj;

    const map = new Map<string, any>();
    Object.keys(obj || {}).forEach(k => map.set(String(k).toLowerCase(), obj[k]));

    if (obj.contact && typeof obj.contact === 'object') {
      Object.keys(obj.contact || {}).forEach(k => map.set(String(k).toLowerCase(), obj.contact[k]));
    }

    const candidates = [
      'contactedat', 'contacted_at', 'lastcontact', 'last_contact',
      'last_contacted', 'contactat', 'contact_at', 'contact_time',
      'contactedtime', 'updatedat', 'updated_at', 'contacted'
    ];

    for (const c of candidates) {
      if (map.has(c)) {
        const v = map.get(c);
        if (v !== undefined && v !== null && v !== '') return v;
      }
    }

    return undefined;
  }

 
  function formatContactedAt(value: any): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'string' && (value.trim() === '' || value.trim().toLowerCase() === 'null')) return '-';

    if (typeof value === 'object') {
      if (typeof value.toDate === 'function') {
        try { return value.toDate().toLocaleString('id-ID'); } catch {}
      }
      if (typeof value.seconds === 'number') {
        try { return new Date(value.seconds * 1000).toLocaleString('id-ID'); } catch {}
      }
  
      const keys = ['iso', 'date', 'datetime', 'value'];
      for (const k of keys) {
        if (typeof value[k] === 'string') {
          const ms = Date.parse(value[k]);
          if (!isNaN(ms)) return new Date(ms).toLocaleString('id-ID');
        }
      }
      return '-';
    }

    let v: any = value;
    if (typeof v === 'string' && /^\d+$/.test(v.trim())) v = Number(v.trim());

    if (typeof v === 'number') {
      const len = String(Math.abs(v)).length;
      if (len <= 10) v = v * 1000; // seconds -> ms
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d.toLocaleString('id-ID');
      return '-';
    }

    if (typeof v === 'string') {
      let ms = Date.parse(v);
      if (isNaN(ms)) ms = Date.parse(v.replace(' ', 'T'));
      if (isNaN(ms)) ms = Date.parse(v.replace(/\//g, '-'));
      if (!isNaN(ms)) return new Date(ms).toLocaleString('id-ID');
      return '-';
    }

    return '-';
  }


  useEffect(() => {
    const wasOpen = editModalOpen || detailModalOpen;
    const prev = document.body.style.overflow;
    if (wasOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [editModalOpen, detailModalOpen]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/users`);
      if (!res.ok) throw new Error('Gagal mengambil data user');
      const data: ApiUser[] = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memuat data user.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Nama, email, dan password wajib diisi.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password }),
      });
      if (!res.ok) {
        let msg = 'Gagal menambahkan user baru';
        try {
          const data = await res.json();
          if (data.message) msg = data.message;
        } catch {
          const txt = await res.text();
          if (txt) msg = txt;
        }
        setError(msg);
        return;
      }
      setName(''); setEmail(''); setPassword(''); setRole('sales');
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat menambahkan user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    return (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getRoleBadge = (r: string) =>
    r === 'admin' ? <Badge className="bg-red-100 text-red-800">Admin</Badge> : <Badge className="bg-blue-100 text-blue-800">Sales</Badge>;

  // actions
  const handleOpenEditModal = (u: ApiUser) => {
    setEditUser({ ...u }); // clone
    setEditModalOpen(true);
  };

  const handleViewDetail = async (u: ApiUser) => {
  setDetailUser({ ...u });
  setDetailLoading(true);
  setDetailUserLeads([]);
  setDetailModalOpen(true);

  try {
    
    const res = await fetch(`${API_URL}/users/${u.user_id}/leads-history`);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message || 'Gagal mengambil daftar nasabah');
    }
    const leads = await res.json();
    if (!Array.isArray(leads)) setDetailUserLeads([]);
    else setDetailUserLeads(leads);
  } catch (err: any) {
    console.error(err);
    setDetailUserLeads([]);
  } finally {
    setDetailLoading(false);
  }
};


  const handleDelete = async (userId: string) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) {
        let msg = 'Gagal menghapus user.';
        try {
          const data = await res.json();
          if (data.message) msg = data.message;
        } catch {
          const txt = await res.text();
          if (txt) msg = txt;
        }
        alert(msg);
        return;
      }
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Terjadi kesalahan saat menghapus user.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    if (!editUser.name || !editUser.email) {
      alert('Nama dan email wajib diisi.');
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/users/${editUser.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editUser.name, email: editUser.email, role: editUser.role }),
      });

      if (!res.ok) {
        let msg = 'Gagal memperbarui user.';
        try {
          const data = await res.json();
          if (data.message) msg = data.message;
        } catch {
          const txt = await res.text();
          if (txt) msg = txt;
        }
        alert(msg);
        return;
      }

      setEditModalOpen(false);
      setEditUser(null);
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Terjadi kesalahan saat memperbarui user.');
    } finally {
      setEditSubmitting(false);
    }
  };


  if (!user) {
    return <div className="p-6"><p className="text-red-600">Tidak ada data user (props `user` kosong). Silakan login ulang.</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg"><Users className="w-6 h-6 text-white" /></div>
              <div><h1 className="text-gray-900">Admin - Manajemen User</h1><p className="text-gray-600">Kelola akun user aplikasi</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right"><p className="text-gray-900">{user.name}</p><p className="text-gray-500">{user.role}</p></div>
              <Button type="button" variant="outline" onClick={onBackToDashboard}><ArrowLeft className="w-4 h-4 mr-2" />Kembali</Button>
              <Button type="button" variant="outline" onClick={onLogout}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
            </div>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-700 flex items-center gap-2"><UserPlus className="w-5 h-5 text-indigo-600" />Tambah User Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <Input placeholder="Nama lengkap user..." value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input type="email" placeholder="email@contoh.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Select value={role} onValueChange={(val: 'admin' | 'sales') => setRole(val)}>
                  <SelectTrigger><SelectValue placeholder="Pilih role" /></SelectTrigger>
                  <SelectContent><SelectItem value="sales">Sales</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input type="password" placeholder="Minimum 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => { setName(''); setEmail(''); setPassword(''); setRole('sales'); }} disabled={isSubmitting}>Reset</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Tambah User'}</Button>
              </div>
            </form>
            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-700 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" />Daftar User ({users.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input className="pl-9" placeholder="Cari nama, email, atau role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Button type="button" variant="outline" size="icon" onClick={fetchUsers} disabled={isLoading}><RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /></Button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="text-center py-10"><RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" /><p className="text-gray-600">Memuat data user...</p></div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10"><p className="text-gray-500">Belum ada user atau tidak ditemukan.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700">#</th>
                      <th className="px-4 py-3 text-left text-gray-700">Nama</th>
                      <th className="px-4 py-3 text-left text-gray-700">Email</th>
                      <th className="px-4 py-3 text-center text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((u, idx) => (
                      <tr key={u.user_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                        <td className="px-4 py-3"><div className="text-gray-900">{u.name}</div></td>
                        <td className="px-4 py-3 text-gray-700">{u.email || '-'}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button type="button" className="inline-flex items-center gap-1 px-3 py-1 border rounded bg-white hover:bg-gray-50" onClick={() => handleViewDetail(u)}>
                              <Eye className="w-3 h-3" /> Detail
                            </button>
                            <button type="button" className="inline-flex items-center gap-1 px-3 py-1 border rounded bg-white hover:bg-gray-50" onClick={() => handleOpenEditModal(u)}>
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                            <button type="button" className="inline-flex items-center gap-1 px-3 py-1 border rounded text-red-600 bg-white hover:bg-red-50" onClick={() => handleDelete(u.user_id)}>
                              <Trash2 className="w-3 h-3" /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal via Portal */}
      {editModalOpen && editUser && (
        <ModalPortal>
          <div
            onClick={() => { if (!editSubmitting) { setEditModalOpen(false); setEditUser(null); } }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 1000,
            }}
          />

          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'relative',
              zIndex: 1001,
              width: 'min(720px, 96%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '14px',
              background: '#fff',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              padding: '20px',
              margin: '0 12px',
            }}
          >
            <h3 style={{ margin: 0, marginBottom: 12, fontSize: 18, fontWeight: 600 }}>Edit User</h3>

            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <Input value={editUser?.name || ''} onChange={(e:any) => setEditUser({ ...editUser!, name: e.target.value })} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input type="email" value={editUser?.email || ''} onChange={(e:any) => setEditUser({ ...editUser!, email: e.target.value })} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Select value={editUser?.role || 'sales'} onValueChange={(val: 'admin' | 'sales') => setEditUser({ ...editUser!, role: val })}>
                  <SelectTrigger><SelectValue placeholder="Pilih role" /></SelectTrigger>
                  <SelectContent style={{ zIndex: 1002 }}><SelectItem value="sales">Sales</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                </Select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button type="button" variant="outline" onClick={() => { if (!editSubmitting) { setEditModalOpen(false); setEditUser(null); } }} disabled={editSubmitting}>Batal</Button>
                <Button type="submit" disabled={editSubmitting}>{editSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
              </div>
            </form>
          </div>
        </ModalPortal>
      )}

      {/* Detail Modal via portal */}
      {detailModalOpen && detailUser && (
        <ModalPortal>
          <div
            onClick={() => setDetailModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 2147483647,
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'relative',
              zIndex: 2147483648,
              width: 'min(800px, 96%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '14px',
              background: '#fff',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              padding: '20px',
              margin: '0 12px',
            }}
          >
            <h3 className="text-lg font-semibold mb-4">Detail User</h3>
            <div className="flex items-start justify-between gap-6 mb-4">
              <div>
                <div className="text-sm text-gray-500">Nama</div>
                <div className="text-gray-900 font-medium">{detailUser?.name}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-gray-900 font-medium">{detailUser?.email || '-'}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Role</div>
                <div className="mt-1">{getRoleBadge(detailUser?.role || 'sales')}</div>
              </div>
            </div>

            <hr className="my-3" />

            <div>
              <div className="text-sm text-gray-500 mb-2">Nasabah (sudah dihubungi / terkonversi)</div>

              {detailLoading ? (
                <div className="text-gray-600">Memuat daftar nasabah...</div>
              ) : detailUserLeads.length === 0 ? (
                <div className="text-gray-500">Belum ada nasabah yang dihubungi/terkonversi oleh user ini.</div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <div className="shadow-sm rounded border">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Nama</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Kontak</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Kampanye</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Status</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Dihubungi pada</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Catatan</th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-100 max-h-56">
                        {detailUserLeads.map((l, idx) => (
                          <tr key={l.id ?? idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 align-top text-sm text-gray-700">{idx + 1}</td>

                            <td className="px-3 py-2 align-top">
                              <div className="text-sm font-medium text-gray-900">{l.name}</div>
                            </td>

                            <td className="px-3 py-2 align-top">
                              <div className="text-sm text-gray-700">{l.email || '-'}</div>
                              <div className="text-xs text-gray-500">{l.phone || '-'}</div>
                            </td>

                            <td className="px-3 py-2 align-top">
                              <div className="text-sm text-gray-700">{l.campaign ?? '-'}</div>
                            </td>

                            <td className="px-3 py-2 text-center align-top">
                              <div className="inline-block">
                                {l.status === 'converted' ? (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                                    {l.status}
                                  </span>
                                ) : l.status === 'contacted' ? (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                                    {l.status}
                                  </span>
                                ) : l.status === 'rejected' ? (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                                    {l.status}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                                    {l.status}
                                  </span>
                                )}
                              </div>
                            </td>


                            <td className="px-3 py-2 align-top text-sm text-gray-700">
                              {formatContactedAt(pickContactedAt(l))}
                            </td>

                            <td className="px-3 py-2 align-top text-sm text-gray-700">
                              <div className="max-w-xs truncate">{l.notes || '-'}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="max-h-56 overflow-y-auto mt-2" />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="button" variant="outline" onClick={() => setDetailModalOpen(false)}>Tutup</Button>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
