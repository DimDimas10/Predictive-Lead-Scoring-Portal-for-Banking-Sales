import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Language = 'id' | 'en';

interface ThemeLanguageContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

const translations: Record<string, Record<string, string>> = {
  id: {
    // GLOBAL
    loading: "Memuat...",
    error: "Terjadi kesalahan",
    fetchError: "Gagal mengambil data dari server",
    updateError: "Gagal memperbarui data",
    saveError: "Gagal menyimpan data",
    loadingError: "Terjadi kesalahan saat memuat data",
    success: "Berhasil",
    yes: "Ya",
    no: "Tidak",
    backButton: "Kembali",
    cancel: "Batal",
    saveData: "Simpan Data",
    saving: "Menyimpan...",
    reset: "Reset",
    close: "Tutup",
    detail: "Detail",
    edit: "Edit",
    delete: "Hapus",
    actions: "Aksi",
    processing: "Memproses...",
    footerRights: "© 2024 Bank Sales Dashboard. All rights reserved.",
    
    // LOGIN 
    loginTitle: "Login ke Dashboard",
    loginDesc: "Masukkan kredensial Anda untuk mengakses sistem",
    loginBtn: "Masuk",
    loginSuccess: "Login Berhasil",
    loginFail: "Login Gagal",
    welcomeBack: "Selamat Datang Kembali",
    demoCreds: "Akun Demo:",
    
    // DASHBOARD & METRICS
    dashTitle: "Dashboard Penjualan",
    dashSubtitle: "Sistem Skor Prospek Prediktif",
    logout: "Keluar",
    myPerformance: "Performa Saya",
    adminUser: "Admin User",
    manageData: "Kelola Data",
    totalLeads: "Total Nasabah",
    potentialCust: "Nasabah potensial",
    highPriority: "Prioritas Tinggi",
    highPriorityDesc: "Skor > 70% (Belum dihubungi)",
    conversionRate: "Tingkat Konversi",
    of: "dari",
    contacted: "Dihubungi",
    contactedDesc: "dari total nasabah",
    
    // FILTERS & TABLES
    searchPlaceholder: "Cari...",
    filterStatus: "Filter Status",
    allStatus: "Semua Status",
    refreshML: "Refresh Skor ML",
    processML: "Memproses AI...",
    wait: "Mohon tunggu sebentar",
    mlSuccess: "Skor ML berhasil diperbarui!",
    mlFail: "Gagal memperbarui skor ML",
    priorityListTitle: "Daftar Prioritas",
    sortedByScore: "Diurutkan berdasarkan skor prediksi tertinggi",
    noData: "Tidak ada data ditemukan",
    showing: "Menampilkan",
    page: "Halaman",
    prev: "Sebel.",
    next: "Lanjut",
    btnCall: "Hubungi",
    
    // DETAIL PAGE SPECIFIC
    detailCustomer: "Detail Nasabah",
    detailSubtitle: "Informasi lengkap dan skor prediksi ML",
    customerProfile: "Profil Nasabah",
    additionalInfo: "Informasi Tambahan",
    salesNotes: "Catatan Sales",
    saveNotes: "Simpan Catatan",
    loadingCustomerDetail: "Memuat detail nasabah...",
    customerNotFound: "Data nasabah tidak ditemukan",
    backToDash: "Kembali ke Dashboard",
    lastContact: "Terakhir Dihubungi",
    campaignHash: "Kampanye Ke-",
    contactedBy: "Dihubungi Oleh",
    neverContacted: "Belum pernah",
    markAsContacted: "Tandai Sudah Dihubungi",
    markAsConverted: "Tandai Terkonversi (Sukses)",
    markAsRejected: "Tandai Ditolak (Gagal)",
    convertedSuccess: "Nasabah Terkonversi",
    rejectedFail: "Nasabah Menolak",
    
    // ADMIN PAGES
    managementPageTitle: "Manajemen Data Nasabah",
    managementPageDesc: "Kelola data profil, finansial, dan riwayat kampanye.",
    customerList: "Daftar Nasabah",
    addCustomerBtn: "Tambah Nasabah",
    dataCount: "data",
    formInstruction: "Lengkapi informasi berikut ini.",
    searchCustomer: "Cari nasabah...",
    loadingData: "Memuat data...",
    noDataFound: "Tidak ada data yang sesuai",
    noCustomerYet: "Belum ada data",
    editCustomerData: "Edit Data Nasabah",
    addNewCustomer: "Tambah Nasabah Baru",
    adminUserPageTitle: "Admin - Manajemen User",
    adminUserPageDesc: "Kelola akun user aplikasi",
    addUserTitle: "Tambah User Baru",
    userList: "Daftar User",
    searchUserPlaceholder: "Cari nama, email, atau role...",
    editUserTitle: "Edit User",
    saveChanges: "Simpan Perubahan",
    detailUserTitle: "Detail User",
    leadsHistory: "Riwayat Nasabah",
    noLeadsHistory: "Belum ada riwayat.",

    // ALERTS
    confirmChange: "Ubah Status?",
    confirmChangeDesc: "Yakin ubah status ke",
    yesChange: "Ya, Ubah",
    statusUpdated: "Status diperbarui",
    confirmLogout: "Konfirmasi Keluar",
    confirmLogoutDesc: "Yakin ingin keluar?",
    yesLogout: "Ya, Keluar",
    deleteConfirm: "Hapus Data?",
    deleteCustomerConfirm: "Yakin hapus data ini?",
    deleteUserConfirm: "User akan dihapus permanen.",
    yesDelete: "Ya, Hapus",
    deleteError: "Gagal menghapus",
    dataDeleteSuccess: "Data dihapus",
    dataAddSuccess: "Data ditambahkan",
    dataUpdateSuccess: "Data diperbarui",
    dataSaveError: "Gagal menyimpan",
    validationError: "Validasi Gagal",
    fillAllFields: "Semua field wajib diisi",
    userCreated: "User berhasil dibuat",
    userUpdated: "User berhasil diupdate",
    userDeleted: "User berhasil dihapus",

    // LABELS & COLUMNS
    colName: "Nama Lengkap",
    fullName: "Nama Lengkap",
    colEmail: "Email",
    phoneNumber: "Nomor Telepon",
    colAge: "Umur",
    colJob: "Pekerjaan",
    maritalStatus: "Status Pernikahan",
    education: "Pendidikan",
    colBalance: "Saldo",
    annualBalance: "Saldo Tahunan (IDR)",
    hasMortgage: "KPR",
    hasLoan: "Pinjaman Pribadi",
    contactCount: "Jumlah Kontak",
    contactCountThisCampaign: "Jumlah Kontak (Kampanye Ini)",
    previousCampaignResult: "Hasil Kampanye Lalu",
    contactType: "Jenis Kontak",
    additionalNotes: "Catatan Tambahan",
    additionalNotesPlaceholder: "Tulis catatan di sini...",
    colAction: "Aksi",
    colStatus: "Status",
    colScore: "Skor",
    yearOld: "Tahun",
    
    // VALUES & OPTIONS
    single: "Lajang",
    married: "Menikah",
    divorced: "Cerai",
    primaryEdu: "SD",
    secondaryEdu: "SMP/SMA",
    tertiaryEdu: "Perguruan Tinggi",
    unknownEdu: "Tidak Diketahui",
    cellular: "Seluler",
    telephone: "Telepon Rumah",
    
    // ML & Outcome
    mlPredictionScore: "Skor Prediksi ML",
    mlDescription: "Probabilitas konversi model ML",
    veryHigh: "Sangat Tinggi",
    high: "Tinggi",
    medium: "Sedang",
    low: "Rendah",
    
    successResult: "Sukses",
    failureResult: "Gagal",
    otherResult: "Lainnya",
    nonExistentResult: "Tidak Ada",

    // Status
    statusPending: "Belum Dihubungi",
    statusContacted: "Sudah Dihubungi",
    statusConverted: "Terkonversi",
    statusRejected: "Ditolak",
    
    // Validation
    nameRequired: "Nama wajib",
    emailRequired: "Email wajib",
    phoneRequired: "Telepon wajib",
    ageMinimum: "Min 17 tahun",
    balanceInvalid: "Saldo angka",
  },
  
  en: {
    // GLOBAL
    loading: "Loading...",
    error: "Error occurred",
    fetchError: "Failed to fetch data",
    updateError: "Failed to update data",
    saveError: "Failed to save data",
    loadingError: "Error loading data",
    success: "Success",
    yes: "Yes",
    no: "No",
    backButton: "Back",
    cancel: "Cancel",
    saveData: "Save Data",
    saving: "Saving...",
    reset: "Reset",
    close: "Close",
    detail: "Detail",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    processing: "Processing...",
    footerRights: "© 2024 Bank Sales Dashboard. All rights reserved.",
    
    // LOGIN
    loginTitle: "Login to Dashboard",
    loginDesc: "Enter credentials to access",
    loginBtn: "Login",
    loginSuccess: "Login Successful",
    loginFail: "Login Failed",
    welcomeBack: "Welcome Back",
    demoCreds: "Demo Account:",
    
    // DASHBOARD & METRICS
    dashTitle: "Sales Dashboard",
    dashSubtitle: "Predictive Lead Scoring System",
    logout: "Logout",
    myPerformance: "My Performance",
    adminUser: "Admin User",
    manageData: "Manage Data",
    totalLeads: "Total Leads",
    potentialCust: "Potential customers",
    highPriority: "High Priority",
    highPriorityDesc: "Score > 70% (Pending)",
    conversionRate: "Conversion Rate",
    of: "of",
    contacted: "Contacted",
    contactedDesc: "of total leads",
    
    // FILTERS & TABLES
    searchPlaceholder: "Search...",
    filterStatus: "Filter Status",
    allStatus: "All Status",
    refreshML: "Refresh ML Score",
    processML: "Processing AI...",
    wait: "Please wait",
    mlSuccess: "ML Scores updated!",
    mlFail: "Failed to update ML",
    priorityListTitle: "Priority List",
    sortedByScore: "Sorted by highest prediction score",
    noData: "No data found",
    showing: "Showing",
    page: "Page",
    prev: "Prev",
    next: "Next",
    btnCall: "Call",
    
    // DETAIL PAGE SPECIFIC
    detailCustomer: "Customer Detail",
    detailSubtitle: "Complete info & ML score",
    customerProfile: "Customer Profile",
    additionalInfo: "Additional Info",
    salesNotes: "Sales Notes",
    saveNotes: "Save Notes",
    loadingCustomerDetail: "Loading customer details...",
    customerNotFound: "Customer not found",
    backToDash: "Back to Dashboard",
    lastContact: "Last Contacted",
    campaignHash: "Campaign #",
    contactedBy: "Contacted By",
    neverContacted: "Never",
    markAsContacted: "Mark as Contacted",
    markAsConverted: "Mark as Converted",
    markAsRejected: "Mark as Rejected",
    convertedSuccess: "Customer Converted",
    rejectedFail: "Customer Rejected",
    
    // ADMIN PAGES
    managementPageTitle: "Customer Management",
    managementPageDesc: "Manage profiles, finance, and history.",
    customerList: "Customer List",
    addCustomerBtn: "Add Customer",
    dataCount: "records",
    formInstruction: "Complete information below.",
    searchCustomer: "Search customer...",
    loadingData: "Loading data...",
    noDataFound: "No data matches",
    noCustomerYet: "No data yet",
    editCustomerData: "Edit Customer",
    addNewCustomer: "Add New Customer",
    adminUserPageTitle: "Admin - User Management",
    adminUserPageDesc: "Manage user accounts",
    addUserTitle: "Add New User",
    userList: "User List",
    searchUserPlaceholder: "Search name, email, role...",
    editUserTitle: "Edit User",
    saveChanges: "Save Changes",
    detailUserTitle: "User Detail",
    leadsHistory: "Leads History",
    noLeadsHistory: "No history yet.",

    // ALERTS
    confirmChange: "Change Status?",
    confirmChangeDesc: "Sure to change status to",
    yesChange: "Yes, Change",
    statusUpdated: "Status updated",
    confirmLogout: "Confirm Logout",
    confirmLogoutDesc: "Sure to logout?",
    yesLogout: "Yes, Logout",
    deleteConfirm: "Delete Data?",
    deleteCustomerConfirm: "Sure to delete this?",
    deleteUserConfirm: "User deleted permanently.",
    yesDelete: "Yes, Delete",
    deleteError: "Delete failed",
    dataDeleteSuccess: "Data deleted",
    dataAddSuccess: "Data added",
    dataUpdateSuccess: "Data updated",
    dataSaveError: "Save failed",
    validationError: "Validation Failed",
    fillAllFields: "All fields required",
    userCreated: "User created",
    userUpdated: "User updated",
    userDeleted: "User deleted",

    // LABELS & COLUMNS
    colName: "Full Name",
    fullName: "Full Name",
    colEmail: "Email",
    phoneNumber: "Phone Number",
    colAge: "Age",
    colJob: "Job",
    maritalStatus: "Marital Status",
    education: "Education",
    colBalance: "Balance",
    annualBalance: "Annual Balance (IDR)",
    hasMortgage: "Housing Loan",
    hasLoan: "Personal Loan",
    contactCount: "Contact Count",
    contactCountThisCampaign: "Contact Count (This Campaign)",
    previousCampaignResult: "Prev Campaign Result",
    contactType: "Contact Type",
    additionalNotes: "Additional Notes",
    additionalNotesPlaceholder: "Write notes here...",
    colAction: "Action",
    colStatus: "Status",
    colScore: "Score",
    yearOld: "Years",
    
    // VALUES & OPTIONS
    single: "Single",
    married: "Married",
    divorced: "Divorced",
    primaryEdu: "Primary",
    secondaryEdu: "Secondary",
    tertiaryEdu: "Tertiary",
    unknownEdu: "Unknown",
    cellular: "Cellular",
    telephone: "Telephone",
    
    // ML & Outcome
    mlPredictionScore: "ML Prediction Score",
    mlDescription: "Conversion probability by ML",
    veryHigh: "Very High",
    high: "High",
    medium: "Medium",
    low: "Low",
    
    successResult: "Success",
    failureResult: "Failure",
    otherResult: "Other",
    nonExistentResult: "Non-existent",

    // Status
    statusPending: "Pending",
    statusContacted: "Contacted",
    statusConverted: "Converted",
    statusRejected: "Rejected",
    
    // Validation
    nameRequired: "Name required",
    emailRequired: "Email required",
    phoneRequired: "Phone required",
    ageMinimum: "Min age 17",
    balanceInvalid: "Balance number",
  }
};

export function ThemeLanguageProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return savedTheme === 'dark' ? 'dark' : 'light';
    } catch { return 'light'; }
  });
  
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const savedLanguage = localStorage.getItem('language') as Language;
      return (savedLanguage === 'id' || savedLanguage === 'en') ? savedLanguage : 'id';
    } catch { return 'id'; }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const currentLang = translations[language] ? language : 'id';
    return translations[currentLang][key] || key;
  };

  return (
    <ThemeLanguageContext.Provider value={{ theme, toggleTheme, language, setLanguage, t }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (context === undefined) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;

};

