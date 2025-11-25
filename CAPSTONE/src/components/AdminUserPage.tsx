import {
  ArrowLeft,
  LogOut,
  RefreshCw,
  Search,
  UserPlus,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { User } from '../App';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


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

  // form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'sales'>('sales');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/users`);
      if (!res.ok) {
        throw new Error('Gagal mengambil data user');
      }
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        role,
        password,
      }),
    });

    if (!res.ok) {
      // coba baca JSON dulu
      let msg = 'Gagal menambahkan user baru';
      try {
        const data = await res.json();
        if (data.message) msg = data.message;
      } catch {
        const txt = await res.text();
        if (txt) msg = txt;
      }

      setError(msg);
      return; // jangan lanjut reset form
    }

    // sukses
    setName('');
    setEmail('');
    setPassword('');
    setRole('sales');

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

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">Sales</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">Admin - Manajemen User</h1>
                <p className="text-gray-600">Kelola akun user aplikasi</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-gray-900">{user.name}</p>
                <p className="text-gray-500">{user.role}</p>
              </div>
              <Button variant="outline" onClick={onBackToDashboard}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </Button>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        {/* Form tambah user */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-700 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              Tambah User Baru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama
                </label>
                <Input
                  placeholder="Nama lengkap user..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <Select value={role} onValueChange={(val: 'admin' | 'sales') => setRole(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Minimum 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setName('');
                    setEmail('');
                    setPassword('');
                    setRole('sales');
                  }}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Tambah User'}
                </Button>
              </div>
            </form>

            {error && (
              <p className="text-red-600 text-sm mt-3">
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        {/* List user */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-700 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Daftar User ({users.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="Cari nama, email, atau role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchUsers}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-10">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-600">Memuat data user...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Belum ada user atau tidak ditemukan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700">#</th>
                      <th className="px-4 py-3 text-left text-gray-700">Nama</th>
                      <th className="px-4 py-3 text-left text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-gray-700">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((u, idx) => (
                      <tr key={u.user_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="text-gray-900">{u.name}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {u.email || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {getRoleBadge(u.role)}
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
    </div>
  );
}
