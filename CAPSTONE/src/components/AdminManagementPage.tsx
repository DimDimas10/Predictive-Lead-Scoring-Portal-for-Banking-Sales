import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import Swal from 'sweetalert2';
import type { User, Lead } from '../App';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface AdminManagementPageProps {
  user: User;
  onBack: () => void;
}

const API_URL = 'http://localhost:5000/api';

export function AdminManagementPage({ user, onBack }: AdminManagementPageProps) {
  const { t, theme } = useThemeLanguage(); 
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
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
    campaign: 1,
    pdays: -1,
    previous: 0,
    poutcome: 'nonexistent',
    contact: 'cellular',
    notes: ''
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/leads?role=admin`);
      if (!response.ok) throw new Error(t('fetchError'));
      const data = await response.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setLeads([]);
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('loadingError'),
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
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
      campaign: 1,
      pdays: -1,
      previous: 0,
      poutcome: 'nonexistent',
      contact: 'cellular',
      notes: ''
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (lead: Lead) => {
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      age: lead.age?.toString() || '',
      job: lead.job,
      marital: lead.marital || 'single',
      education: lead.education || 'secondary',
      balance: lead.balance?.toString() || '0',
      housing: lead.housing || 'no',
      loan: lead.loan || 'no',
      campaign: lead.campaign || 1,
      pdays: -1,
      previous: 0,
      poutcome: lead.previousOutcome || 'nonexistent',
      contact: lead.contact || 'cellular',
      notes: lead.notes || ''
    });
    setIsEditing(true);
    setCurrentId(lead.id);
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    if (!formData.name) return t('nameRequired');
    if (!formData.email) return t('emailRequired');
    if (!formData.phone) return t('phoneRequired');
    if (!formData.age || parseInt(formData.age) < 17) return t('ageMinimum');
    if (!formData.balance) return t('balanceInvalid');
    return null;
  };

  const handleSubmit = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      Swal.fire({
        icon: 'warning',
        title: t('validationError'),
        text: errorMsg,
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        balance: parseInt(formData.balance),
        campaign: Number(formData.campaign),
        userId: user.id
      };

      const url = isEditing ? `${API_URL}/leads/${currentId}` : `${API_URL}/leads`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(t('dataSaveError'));

      await fetchLeads();
      setIsDialogOpen(false);
      
      Swal.fire({
        icon: 'success',
        title: t('success'),
        text: isEditing ? t('dataUpdateSuccess') : t('dataAddSuccess'),
        timer: 1500,
        showConfirmButton: false,
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
      });

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('dataSaveError'),
        background: theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: t('deleteConfirm'),
      text: t('deleteCustomerConfirm'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('yesDelete'),
      cancelButtonText: t('cancel'),
      background: theme === 'dark' ? '#1e293b' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#000000',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/leads/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error(t('deleteError'));

        await fetchLeads();
        Swal.fire({
          icon: 'success',
          title: t('success'),
          text: t('dataDeleteSuccess'),
          timer: 1500,
          showConfirmButton: false,
          background: theme === 'dark' ? '#1e293b' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#000000',
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: t('error'),
          text: t('deleteError'),
          background: theme === 'dark' ? '#1e293b' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#000000',
        });
      }
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={onBack} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('managementPageTitle')}</h1>
              <p className="text-gray-500 dark:text-slate-400">{t('managementPageDesc')}</p>
            </div>
          </div>
          <Button onClick={openAddDialog} className="dark:bg-blue-600 dark:hover:bg-blue-500 dark:text-white">
            <Plus className="w-4 h-4 mr-2" />
            {t('addCustomerBtn')}
          </Button>
        </div>

        {/* Filters & Table Card */}
        <Card className="dark:bg-slate-800 dark:border-slate-700 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="dark:text-white">{t('customerList')}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={fetchLeads} disabled={isLoading} className="dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700">
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Badge variant="secondary" className="dark:bg-slate-700 dark:text-slate-200">
                  {filteredLeads.length} {t('dataCount')}
                </Badge>
              </div>
            </div>
            <CardDescription className="dark:text-slate-400">
              {t('formInstruction')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder={t('searchCustomer')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 dark:bg-slate-900 dark:border-slate-600 dark:text-white"
              />
            </div>

            {/* Table */}
            <div className="rounded-md border dark:border-slate-700 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-slate-700">
                  <TableRow>
                    <TableHead className="dark:text-slate-300">{t('colName')}</TableHead>
                    <TableHead className="hidden md:table-cell dark:text-slate-300">{t('colEmail')}</TableHead>
                    <TableHead className="hidden md:table-cell dark:text-slate-300">{t('phoneNumber')}</TableHead>
                    <TableHead className="dark:text-slate-300">{t('colBalance')}</TableHead>
                    <TableHead className="text-right dark:text-slate-300">{t('colAction')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white dark:bg-slate-800">
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center dark:text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('loadingData')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-gray-500 dark:text-slate-500">
                        {searchTerm ? t('noDataFound') : t('noCustomerYet')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id} className="dark:hover:bg-slate-700/50">
                        <TableCell className="font-medium dark:text-white">
                          {lead.name}
                          <div className="md:hidden text-xs text-gray-500 dark:text-slate-400">{lead.email}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell dark:text-slate-300">{lead.email}</TableCell>
                        <TableCell className="hidden md:table-cell dark:text-slate-300">{lead.phone}</TableCell>
                        <TableCell className="dark:text-slate-300">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(lead.balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditDialog(lead)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(lead.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-800 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                {isEditing ? t('editCustomerData') : t('addNewCustomer')}
              </DialogTitle>
              <DialogDescription className="dark:text-slate-400">
                {t('formInstruction')}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('personalInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-slate-200">{t('fullName')} *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-slate-200">{t('colEmail')} *</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="dark:text-slate-200">{t('phoneNumber')} *</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="dark:text-slate-200">{t('colAge')} *</Label>
                    <Input id="age" name="age" type="number" value={formData.age} onChange={handleInputChange} className="dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job" className="dark:text-slate-200">{t('colJob')}</Label>
                    <Input id="job" name="job" value={formData.job} onChange={handleInputChange} className="dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marital" className="dark:text-slate-200">{t('maritalStatus')}</Label>
                    <Select value={formData.marital} onValueChange={(val) => handleSelectChange('marital', val)}>
                      <SelectTrigger className="dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="single" className="dark:text-white dark:focus:bg-slate-700">{t('single')}</SelectItem>
                        <SelectItem value="married" className="dark:text-white dark:focus:bg-slate-700">{t('married')}</SelectItem>
                        <SelectItem value="divorced" className="dark:text-white dark:focus:bg-slate-700">{t('divorced')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education" className="dark:text-slate-200">{t('education')}</Label>
                    <Select value={formData.education} onValueChange={(val) => handleSelectChange('education', val)}>
                      <SelectTrigger className="dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="primary" className="dark:text-white dark:focus:bg-slate-700">{t('primaryEdu')}</SelectItem>
                        <SelectItem value="secondary" className="dark:text-white dark:focus:bg-slate-700">{t('secondaryEdu')}</SelectItem>
                        <SelectItem value="tertiary" className="dark:text-white dark:focus:bg-slate-700">{t('tertiaryEdu')}</SelectItem>
                        <SelectItem value="unknown" className="dark:text-white dark:focus:bg-slate-700">{t('unknownEdu')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('financialInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="balance" className="dark:text-slate-200">{t('annualBalance')}</Label>
                    <Input id="balance" name="balance" type="number" value={formData.balance} onChange={handleInputChange} className="dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="housing" className="dark:text-slate-200">{t('hasMortgage')}</Label>
                    <Select value={formData.housing} onValueChange={(val) => handleSelectChange('housing', val)}>
                      <SelectTrigger className="dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="yes" className="dark:text-white dark:focus:bg-slate-700">{t('yes')}</SelectItem>
                        <SelectItem value="no" className="dark:text-white dark:focus:bg-slate-700">{t('no')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loan" className="dark:text-slate-200">{t('hasLoan')}</Label>
                    <Select value={formData.loan} onValueChange={(val) => handleSelectChange('loan', val)}>
                      <SelectTrigger className="dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="yes" className="dark:text-white dark:focus:bg-slate-700">{t('yes')}</SelectItem>
                        <SelectItem value="no" className="dark:text-white dark:focus:bg-slate-700">{t('no')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Campaign Info */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('campaignHistory')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign" className="dark:text-slate-200">{t('contactCountThisCampaign')}</Label>
                    <Input id="campaign" name="campaign" type="number" min="1" value={formData.campaign} onChange={handleInputChange} className="dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="poutcome" className="dark:text-slate-200">{t('previousCampaignResult')}</Label>
                    <Select value={formData.poutcome} onValueChange={(val) => handleSelectChange('poutcome', val)}>
                      <SelectTrigger className="dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="nonexistent" className="dark:text-white dark:focus:bg-slate-700">{t('notExist')}</SelectItem>
                        <SelectItem value="failure" className="dark:text-white dark:focus:bg-slate-700">{t('failure')}</SelectItem>
                        <SelectItem value="success" className="dark:text-white dark:focus:bg-slate-700">{t('success')}</SelectItem>
                        <SelectItem value="other" className="dark:text-white dark:focus:bg-slate-700">{t('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contact" className="dark:text-slate-200">{t('contactType')}</Label>
                    <Select value={formData.contact} onValueChange={(val) => handleSelectChange('contact', val)}>
                      <SelectTrigger className="dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="cellular" className="dark:text-white dark:focus:bg-slate-700">{t('cellular')}</SelectItem>
                        <SelectItem value="telephone" className="dark:text-white dark:focus:bg-slate-700">{t('telephone')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes" className="dark:text-slate-200">{t('additionalNotes')}</Label>
                    <Textarea 
                      id="notes" 
                      name="notes" 
                      value={formData.notes} 
                      onChange={handleInputChange} 
                      placeholder={t('additionalNotesPlaceholder')}
                      className="dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
                {t('cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving} className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500">
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('saveData')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}