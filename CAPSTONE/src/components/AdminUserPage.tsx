import { ArrowLeft, LogOut, RefreshCw, Search, UserPlus, Users, Pencil, Trash2, Eye } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { User } from '../App';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ModalPortal } from './ModalPortal';
import Swal from 'sweetalert2';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

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

export function AdminUserPage({ user, onLogout, onBackToDashboard }: AdminUserPageProps) {
  const { t, theme, language } = useThemeLanguage();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'sales'>('sales');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<ApiUser | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<ApiUser | null>(null);
  const [detailUserLeads, setDetailUserLeads] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  function pickContactedAt(obj: any) {
    if (obj == null) return undefined;
    if (typeof obj === 'string' || typeof obj === 'number') return obj;
    const map = new Map<string, any>();
    Object.keys(obj || {}).forEach(k => map.set(String(k).toLowerCase(), obj[k]));
    if (obj.contact && typeof obj.contact === 'object') {
      Object.keys(obj.contact || {}).forEach(k => map.set(String(k).toLowerCase(), obj.contact[k]));
    }
    const candidates = ['contactedat', 'contacted_at', 'lastcontact', 'last_contact', 'last_contacted', 'contactat', 'contact_at'];
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
    const locale = language === 'id' ? 'id-ID' : 'en-US'; 
    if (typeof value === 'object' && typeof value.toDate === 'function') return value.toDate().toLocaleString(locale);
    let v: any = value;
    if (typeof v === 'string' && /^\d+$/.test(v.trim())) v = Number(v.trim());
    if (typeof v === 'number') {
      if (String(Math.abs(v)).length <= 10) v = v * 1000;
      return new Date(v).toLocaleString(locale);
    }
    if (typeof v === 'string') {
      let ms = Date.parse(v);
      if (!isNaN(ms)) return new Date(ms).toLocaleString(locale);
    }
    return '-';
  }

  useEffect(() => {
    const wasOpen = editModalOpen || detailModalOpen;
    const prev = document.body.style.overflow;
    if (wasOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [editModalOpen, detailModalOpen]);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/users`);
      if (!res.ok) throw new Error(t('error'));
      const data: ApiUser[] = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      Swal.fire({ title: t('error'), text: t('fillAllFields'), icon: 'warning', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000' });
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
      if (!res.ok) throw new Error(t('error'));
      Swal.fire({ icon: 'success', title: t('success'), text: t('userCreated'), timer: 1500, showConfirmButton: false, background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000' });
      setName(''); setEmail(''); setPassword(''); setRole('sales');
      await fetchUsers();
    } catch (err: any) {
      Swal.fire({ title: t('error'), text: err.message, icon: 'error', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    return (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || u.role.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const getRoleBadge = (r: string) => r === 'admin' 
    ? <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">Admin</Badge> 
    : <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">Sales</Badge>;

  const handleOpenEditModal = (u: ApiUser) => { setEditUser({ ...u }); setEditModalOpen(true); };

  const handleViewDetail = async (u: ApiUser) => {
    setDetailUser({ ...u });
    setDetailLoading(true);
    setDetailUserLeads([]);
    setDetailModalOpen(true);
    try {
      const res = await fetch(`${API_URL}/users/${u.user_id}/leads-history`);
      if (!res.ok) throw new Error(t('error'));
      const leads = await res.json();
      setDetailUserLeads(Array.isArray(leads) ? leads : []);
    } catch (err) { setDetailUserLeads([]); } finally { setDetailLoading(false); }
  };

  const handleDelete = async (userId: string) => {
    const result = await Swal.fire({
      title: t('deleteConfirm'), text: t('deleteUserConfirm'), icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: t('yesDelete'), cancelButtonText: t('cancel'), background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000'
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(t('error'));
      Swal.fire({ icon: 'success', title: t('success'), text: t('userDeleted'), background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000' });
      await fetchUsers();
    } catch (err: any) {
      Swal.fire({ title: t('error'), text: err.message, icon: 'error', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000' });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser || !editUser.name || !editUser.email) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/users/${editUser.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editUser.name, email: editUser.email, role: editUser.role }),
      });
      if (!res.ok) throw new Error(t('error'));
      Swal.fire({ icon: 'success', title: t('success'), text: t('userUpdated'), timer: 1500, showConfirmButton: false, background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000' });
      setEditModalOpen(false);
      setEditUser(null);
      await fetchUsers();
    } catch (err: any) {
      Swal.fire({ title: t('error'), text: err.message, icon: 'error', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000' });
    } finally { setEditSubmitting(false); }
  };

  if (!user) return <div className="p-6"><p className="text-red-600 dark:text-red-400">Error: User not found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg"><Users className="w-6 h-6 text-white" /></div>
              <div><h1 className="text-gray-900 dark:text-white font-bold">{t('adminUserPageTitle')}</h1><p className="text-gray-600 dark:text-slate-400">{t('adminUserPageDesc')}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right"><p className="text-gray-900 dark:text-white font-medium">{user.name}</p><p className="text-gray-500 dark:text-slate-400 text-sm">{user.role}</p></div>
              <Button type="button" variant="outline" onClick={onBackToDashboard} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700"><ArrowLeft className="w-4 h-4 mr-2" />{t('backButton')}</Button>
              <Button type="button" variant="outline" onClick={onLogout} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700"><LogOut className="w-4 h-4 mr-2" />{t('logout')}</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-700 dark:text-slate-300 flex items-center gap-2"><UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />{t('addUserTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('nameLabel')}</label><Input placeholder={t('nameLabel')} value={name} onChange={(e) => setName(e.target.value)} className="dark:bg-slate-900 dark:border-slate-600 dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('emailLabel')}</label><Input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="dark:bg-slate-900 dark:border-slate-600 dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('role')}</label><Select value={role} onValueChange={(val: 'admin' | 'sales') => setRole(val)}><SelectTrigger className="dark:bg-slate-900 dark:border-slate-600 dark:text-white"><SelectValue placeholder="Pilih role" /></SelectTrigger><SelectContent className="dark:bg-slate-800 dark:border-slate-700"><SelectItem value="sales" className="dark:text-white dark:focus:bg-slate-700">Sales</SelectItem><SelectItem value="admin" className="dark:text-white dark:focus:bg-slate-700">Admin</SelectItem></SelectContent></Select></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{t('password')}</label><Input type="password" placeholder={t('passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} className="dark:bg-slate-900 dark:border-slate-600 dark:text-white" /></div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => { setName(''); setEmail(''); setPassword(''); setRole('sales'); }} disabled={isSubmitting} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">{t('reset')}</Button>
                <Button type="submit" disabled={isSubmitting} className="dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:text-white">{isSubmitting ? t('saving') : t('addCustomerBtn')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-700 dark:text-slate-300 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />{t('userList')} ({users.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" /><Input className="pl-9 dark:bg-slate-900 dark:border-slate-600 dark:text-white" placeholder={t('searchUserPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
              <Button type="button" variant="outline" size="icon" onClick={fetchUsers} disabled={isLoading} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700"><RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="text-center py-10"><RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" /><p className="text-gray-600 dark:text-slate-400">{t('loadingData')}</p></div> : filteredUsers.length === 0 ? <div className="text-center py-10"><p className="text-gray-500 dark:text-slate-400">{t('noDataFound')}</p></div> : (
              <div className="overflow-x-auto rounded-md border dark:border-slate-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                    <tr><th className="px-4 py-3 font-medium text-gray-700 dark:text-slate-300">#</th><th className="px-4 py-3 font-medium text-gray-700 dark:text-slate-300">{t('nameLabel')}</th><th className="px-4 py-3 font-medium text-gray-700 dark:text-slate-300">{t('emailLabel')}</th><th className="px-4 py-3 font-medium text-center text-gray-700 dark:text-slate-300">{t('colAction')}</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {filteredUsers.map((u, idx) => (
                      <tr key={u.user_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{idx + 1}</td>
                        <td className="px-4 py-3"><div className="text-gray-900 dark:text-white font-medium">{u.name}</div></td>
                        <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{u.email || '-'}</td>
                        <td className="px-4 py-4"><div className="flex items-center justify-center gap-2">
                            <button type="button" className="inline-flex items-center gap-1 px-3 py-1 border rounded bg-white hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors" onClick={() => handleViewDetail(u)}><Eye className="w-3 h-3" /> {t('detail')}</button>
                            <button type="button" className="inline-flex items-center gap-1 px-3 py-1 border rounded bg-white hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors" onClick={() => handleOpenEditModal(u)}><Pencil className="w-3 h-3" /> {t('edit')}</button>
                            <button type="button" className="inline-flex items-center gap-1 px-3 py-1 border rounded text-red-600 bg-white hover:bg-red-50 dark:bg-slate-700 dark:border-slate-600 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors" onClick={() => handleDelete(u.user_id)}><Trash2 className="w-3 h-3" /> {t('delete')}</button>
                          </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editModalOpen && editUser && (
        <ModalPortal>
          <div onClick={() => { if (!editSubmitting) { setEditModalOpen(false); setEditUser(null); } }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000 }} />
          <div role="dialog" aria-modal="true" style={{ position: 'relative', zIndex: 1001, width: 'min(720px, 96%)', maxHeight: '90vh', overflowY: 'auto', borderRadius: '14px', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', padding: '20px', margin: '0 12px' }}>
            <h3 style={{ margin: 0, marginBottom: 12, fontSize: 18, fontWeight: 600 }}>{t('editUserTitle')}</h3>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: 12 }}><label className="block text-sm font-medium mb-1" style={{ color: theme === 'dark' ? '#cbd5e1' : '#374151' }}>{t('nameLabel')}</label><Input value={editUser?.name || ''} onChange={(e:any) => setEditUser({ ...editUser!, name: e.target.value })} className="dark:bg-slate-900 dark:border-slate-600 dark:text-white" /></div>
              <div style={{ marginBottom: 12 }}><label className="block text-sm font-medium mb-1" style={{ color: theme === 'dark' ? '#cbd5e1' : '#374151' }}>{t('emailLabel')}</label><Input type="email" value={editUser?.email || ''} onChange={(e:any) => setEditUser({ ...editUser!, email: e.target.value })} className="dark:bg-slate-900 dark:border-slate-600 dark:text-white"/></div>
              <div style={{ marginBottom: 16 }}><label className="block text-sm font-medium mb-1" style={{ color: theme === 'dark' ? '#cbd5e1' : '#374151' }}>{t('role')}</label><Select value={editUser?.role || 'sales'} onValueChange={(val: 'admin' | 'sales') => setEditUser({ ...editUser!, role: val })}><SelectTrigger className="dark:bg-slate-900 dark:border-slate-600 dark:text-white"><SelectValue placeholder="Pilih role" /></SelectTrigger><SelectContent style={{ zIndex: 1002 }} className="dark:bg-slate-800 dark:border-slate-700"><SelectItem value="sales" className="dark:text-white dark:focus:bg-slate-700">Sales</SelectItem><SelectItem value="admin" className="dark:text-white dark:focus:bg-slate-700">Admin</SelectItem></SelectContent></Select></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}><Button type="button" variant="outline" onClick={() => { if (!editSubmitting) { setEditModalOpen(false); setEditUser(null); } }} disabled={editSubmitting} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">{t('cancel')}</Button><Button type="submit" disabled={editSubmitting} className="dark:bg-indigo-600 dark:text-white">{editSubmitting ? t('saving') : t('saveChanges')}</Button></div>
            </form>
          </div>
        </ModalPortal>
      )}

      {detailModalOpen && detailUser && (
        <ModalPortal>
          <div onClick={() => setDetailModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2147483647 }} />
          <div role="dialog" aria-modal="true" style={{ position: 'relative', zIndex: 2147483648, width: 'min(800px, 96%)', maxHeight: '90vh', overflowY: 'auto', borderRadius: '14px', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', padding: '20px', margin: '0 12px' }}>
            <h3 className="text-lg font-semibold mb-4">{t('detailUserTitle')}</h3>
            <div className="flex items-start justify-between gap-6 mb-4">
              <div><div className="text-sm text-gray-500 dark:text-slate-400">{t('nameLabel')}</div><div className="text-gray-900 dark:text-white font-medium">{detailUser?.name}</div></div>
              <div><div className="text-sm text-gray-500 dark:text-slate-400">{t('emailLabel')}</div><div className="text-gray-900 dark:text-white font-medium">{detailUser?.email || '-'}</div></div>
              <div><div className="text-sm text-gray-500 dark:text-slate-400">{t('role')}</div><div className="mt-1">{getRoleBadge(detailUser?.role || 'sales')}</div></div>
            </div>
            <hr className="my-3 border-gray-200 dark:border-slate-700" />
            <div>
              <div className="text-sm text-gray-500 dark:text-slate-400 mb-2">{t('leadsHistory')}</div>
              {detailLoading ? <div className="text-gray-600 dark:text-slate-400">{t('loadingData')}</div> : detailUserLeads.length === 0 ? <div className="text-gray-500 dark:text-slate-500">{t('noLeadsHistory')}</div> : (
                <div className="w-full overflow-x-auto"><div className="shadow-sm rounded border dark:border-slate-700"><table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700"><thead className="bg-gray-50 dark:bg-slate-700"><tr><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-300">#</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-300">{t('colName')}</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-300">{t('contact')}</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-300">{t('campaign')}</th><th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-slate-300">{t('colStatus')}</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-300">{t('contactedAt')}</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-300">{t('note')}</th></tr></thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700 max-h-56">
                        {detailUserLeads.map((l, idx) => (
                          <tr key={l.id ?? idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                            <td className="px-3 py-2 align-top text-sm text-gray-700 dark:text-slate-300">{idx + 1}</td>
                            <td className="px-3 py-2 align-top"><div className="text-sm font-medium text-gray-900 dark:text-white">{l.name}</div></td>
                            <td className="px-3 py-2 align-top"><div className="text-sm text-gray-700 dark:text-slate-300">{l.email || '-'}</div><div className="text-xs text-gray-500 dark:text-slate-400">{l.phone || '-'}</div></td>
                            <td className="px-3 py-2 align-top"><div className="text-sm text-gray-700 dark:text-slate-300">{l.campaign ?? '-'}</div></td>
                            <td className="px-3 py-2 text-center align-top"><div className="inline-block">
                                {l.status === 'converted' ? <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">{t('statusConverted')}</span>
                                : l.status === 'contacted' ? <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">{t('statusContacted')}</span>
                                : l.status === 'rejected' ? <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">{t('statusRejected')}</span>
                                : <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300">{t('statusPending')}</span>}
                              </div></td>
                            <td className="px-3 py-2 align-top text-sm text-gray-700 dark:text-slate-300">{formatContactedAt(pickContactedAt(l))}</td>
                            <td className="px-3 py-2 align-top text-sm text-gray-700 dark:text-slate-300"><div className="max-w-xs truncate">{l.notes || '-'}</div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table></div><div className="max-h-56 overflow-y-auto mt-2" /></div>
              )}
            </div>
            <div className="mt-6 flex justify-end"><Button type="button" variant="outline" onClick={() => setDetailModalOpen(false)} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">{t('close')}</Button></div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
