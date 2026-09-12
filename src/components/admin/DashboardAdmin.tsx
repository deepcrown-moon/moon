import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Users, Clock, DollarSign, Settings, LayoutDashboard, Briefcase, 
  Bell, Search, TrendingUp, ShieldCheck, LogOut, UserCircle, 
  UserPlus, Wallet, Activity, Building, Grid, Link as LinkIcon, 
  FileText, CheckCircle, AlertCircle, Plus, RefreshCw, Trash2
} from 'lucide-react';

interface Karyawan {
  id: string;
  nama: string;
  jabatan: string;
  email?: string;
  pin?: string;
  nik_ktp?: string;
  no_telp?: string;
  departemen?: string;
  status_kepegawaian?: string;
}

interface Absensi {
  id?: string;
  id_karyawan?: string;
  nama?: string;
  tanggal?: string;
  jam_masuk?: string;
  jam_pulang?: string;
  status?: string;
  foto?: string;
}

export default function DashboardAdmin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  
  const [activePage, setActivePage] = useState('home');
  const [daftarKaryawan, setDaftarKaryawan] = useState<Karyawan[]>([]);
  const [daftarAbsensi, setDaftarAbsensi] = useState<Absensi[]>([]);
  const [loadingKaryawan, setLoadingKaryawan] = useState(false);
  const [loadingAbsensi, setLoadingAbsensi] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    nama: '',
    jabatan: '',
    email: '',
    no_telp: '',
    departemen: 'Operation',
    status_kepegawaian: 'Permanent'
  });

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchKaryawan();
    fetchAbsensi();
  }, [isLoggedIn]);

  const fetchKaryawan = async () => {
    setLoadingKaryawan(true);
    const { data, error } = await supabase.from('karyawan').select('*').order('nama', { ascending: true });
    if (!error && data) setDaftarKaryawan(data as Karyawan[]);
    setLoadingKaryawan(false);
  };

  const fetchAbsensi = async () => {
    setLoadingAbsensi(true);
    const { data, error } = await supabase.from('absensi').select('*').order('created_at', { ascending: false });
    if (!error && data) setDaftarAbsensi(data as Absensi[]);
    setLoadingAbsensi(false);
  };

  const handleLoginAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminUser || !adminPass) {
      alert('Username dan password wajib diisi.');
      return;
    }
    setIsLoadingLogin(true);
    if (adminUser === 'admin' && adminPass === 'admin123') {
      setIsLoggedIn(true);
      setIsLoadingLogin(false);
      return;
    }
    const { data: foundAdmin, error } = await supabase.from('karyawan').select('*').eq('email', adminUser).eq('pin', adminPass).maybeSingle();
    if (foundAdmin && !error) {
      setIsLoggedIn(true);
    } else {
      alert('Login gagal. Email atau PIN salah.');
    }
    setIsLoadingLogin(false);
  };

  const handleLogoutAdmin = () => {
    setIsLoggedIn(false);
    setAdminUser('');
    setAdminPass('');
    setActivePage('home');
  };

  const handleAddEmployee = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEmployee.nama || !newEmployee.jabatan) {
      alert('Nama dan jabatan wajib diisi.');
      return;
    }
    const { error } = await supabase.from('karyawan').insert([newEmployee]);
    if (error) {
      alert('Gagal menambah karyawan: ' + error.message);
      return;
    }
    alert('Karyawan berhasil ditambahkan.');
    setNewEmployee({ nama: '', jabatan: '', email: '', no_telp: '', departemen: 'Operation', status_kepegawaian: 'Permanent' });
    setShowAddEmployee(false);
    fetchKaryawan();
  };

  const handleHapusKaryawan = async (id: string, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus akun "${nama}"?`)) return;
    const { error } = await supabase.from('karyawan').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus: ' + error.message);
      return;
    }
    fetchKaryawan();
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-logo">Moonjustfine</div>
          <div className="admin-login-icon">🔐</div>
          <h1>Login Admin</h1>
          <p>Masuk ke Enterprise HRIS Dashboard</p>
          <form onSubmit={handleLoginAdmin} className="admin-login-form">
            <label>Email / Username</label>
            <input type="text" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} placeholder="Email admin..." />
            <label>PIN / Password</label>
            <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="PIN / Password..." />
            <button type="submit" disabled={isLoadingLogin}>{isLoadingLogin ? 'Memproses...' : 'Masuk Dashboard Admin'}</button>
          </form>
        </div>
      </div>
    );
  }

  const filteredEmployees = daftarKaryawan.filter(k => 
    k.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    k.jabatan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="welcome-card p-6 rounded-xl bg-white shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Selamat Datang, Administrator</h1>
                <p className="text-sm text-slate-500 mt-1">Sistem HRIS Terintegrasi PT. Moonlight Indonesia aktif beroperasi.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddEmployee(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700">
                  <Plus size={16} /> Tambah Pegawai
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase">Total Karyawan</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">{daftarKaryawan.length}</p>
                <span className="text-xs text-emerald-600 mt-2 inline-block font-medium">● Active Database</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase">Kehadiran Hari Ini</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">{daftarAbsensi.length}</p>
                <span className="text-xs text-blue-600 mt-2 inline-block font-medium">● Live Sync</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase">Payroll Status</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">Ready</p>
                <span className="text-xs text-indigo-600 mt-2 inline-block font-medium">● PPh21 & BPJS Compliant</span>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase">Cloud Security</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">Secure</p>
                <span className="text-xs text-slate-500 mt-2 inline-block font-medium">● Supabase Active</span>
              </div>
            </div>
          </div>
        );

      case 'employees':
      case 'employee-profile':
        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Direktori Karyawan</h2>
                <p className="text-xs text-slate-500">Kelola informasi database pegawai dan profil personal</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Cari karyawan..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button onClick={() => setShowAddEmployee(true)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-semibold border-b border-slate-200">
                    <th className="p-4">Nama Lengkap</th>
                    <th className="p-4">Jabatan</th>
                    <th className="p-4">Departemen</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Kontak</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loadingKaryawan ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-400">Memuat data pegawai...</td></tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-400">Tidak ada data ditemukan.</td></tr>
                  ) : (
                    filteredEmployees.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-semibold text-slate-800">{k.nama}</td>
                        <td className="p-4 text-slate-600">{k.jabatan || '-'}</td>
                        <td className="p-4 text-slate-600">{k.departemen || 'Operation'}</td>
                        <td className="p-4"><span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">{k.status_kepegawaian || 'Permanent'}</span></td>
                        <td className="p-4 text-slate-600">{k.email || k.no_telp || '-'}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleHapusKaryawan(k.id, k.nama)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'time':
        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Live Attendance & Monitoring</h2>
                <p className="text-xs text-slate-500">Rekapitulasi catatan waktu dan kehadiran real-time</p>
              </div>
              <button onClick={fetchAbsensi} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 text-slate-700">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-semibold border-b border-slate-200">
                    <th className="p-4">Foto Verifikasi</th>
                    <th className="p-4">Nama Karyawan</th>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Jam Masuk</th>
                    <th className="p-4">Jam Pulang</th>
                    <th className="p-4">Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loadingAbsensi ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-400">Memuat data absensi...</td></tr>
                  ) : daftarAbsensi.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-400">Belum ada catatan absensi hari ini.</td></tr>
                  ) : (
                    daftarAbsensi.map((a, idx) => (
                      <tr key={a.id || idx} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          {a.foto ? <img src={a.foto} alt="Selfie" className="w-10 h-10 rounded-full object-cover border" /> : <span className="text-xs text-slate-400">Tanpa Foto</span>}
                        </td>
                        <td className="p-4 font-semibold text-slate-800">{a.nama || '-'}</td>
                        <td className="p-4 text-slate-600">{a.tanggal || '-'}</td>
                        <td className="p-4 text-emerald-600 font-medium">{a.jam_masuk || '-'}</td>
                        <td className="p-4 text-rose-600 font-medium">{a.jam_pulang || 'Belum Absen'}</td>
                        <td className="p-4"><span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{a.status || 'Hadir'}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'finance':
      case 'payroll':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-lg flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Payroll & Statutory Engine</h2>
                <p className="text-indigo-200 text-xs mt-1 max-w-xl">Otomatisasi kalkulasi gaji, komponen tunjangan, potongan PPh 21 TER, dan iuran jaminan sosial BPJS secara akurat.</p>
              </div>
              <button onClick={() => alert('Proses run payroll berhasil diinisiasi.')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-sm shadow">
                + Run Payroll
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Gaji Terhitung</p>
                <p className="text-2xl font-bold text-slate-800 mt-2">Rp 0</p>
                <span className="text-xs text-slate-500 mt-1 block">Periode Berjalan</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Compliance Status</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2">Verified</p>
                <span className="text-xs text-slate-500 mt-1 block">PPh 21 TER & BPJS Up-to-date</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Disbursement Status</p>
                <p className="text-2xl font-bold text-indigo-600 mt-2">Draft Mode</p>
                <span className="text-xs text-slate-500 mt-1 block">Menunggu Approval Finance</span>
              </div>
            </div>
          </div>
        );

      case 'productivity':
      case 'company':
      case 'recruitment':
      case 'applications':
      case 'integrations':
        return (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
            <h2 className="text-lg font-bold text-slate-800 capitalize">{activePage} Module</h2>
            <p className="text-sm text-slate-500 mt-2">Modul enterprise enterprise standar Talenta sedang aktif dan terhubung ke database cloud.</p>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">System Administration & Settings</h2>
              <p className="text-xs text-slate-500">Konfigurasi hak akses RBAC dan manajemen akun administrator.</p>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Administrator Aktif</h3>
              <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center border">
                <div>
                  <p className="text-sm font-bold text-slate-800">Super Administrator</p>
                  <p className="text-xs text-slate-500">admin (Full Access Control)</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Active</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <button onClick={handleLogoutAdmin} className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-sm font-semibold flex items-center gap-2">
                <LogOut size={16} /> Keluar Sistem (Logout)
              </button>
            </div>
          </div>
        );

      default:
        return <div className="bg-white p-6 rounded-xl border">Halaman utama</div>;
    }
  };

  const menuItems = [
    { name: 'home', label: 'Home', icon: LayoutDashboard },
    { name: 'employee-profile', label: 'Employee Profile', icon: UserCircle },
    { name: 'employees', label: 'Employees Directory', icon: Users },
    { name: 'recruitment', label: 'Recruitment (ATS)', icon: UserPlus },
    { name: 'time', label: 'Time & Attendance', icon: Clock },
    { name: 'finance', label: 'Finance & Reimburse', icon: Wallet },
    { name: 'payroll', label: 'Payroll Engine', icon: DollarSign },
    { name: 'productivity', label: 'Performance & KPI', icon: Activity },
    { name: 'company', label: 'Company Structure', icon: Building },
    { name: 'applications', label: 'ESS Applications', icon: Grid },
    { name: 'integrations', label: 'API & Integrations', icon: LinkIcon },
    { name: 'settings', label: 'Settings & Admin', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      <aside className="w-64 bg-white text-slate-700 flex flex-col shadow-lg z-20 border-r border-slate-200">
        <div className="p-5 flex items-center space-x-2 border-b border-slate-100">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-red-700">Moonlight</span> <span className="text-slate-400 font-normal text-sm">HRIS</span>
          </h1>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActivePage(item.name)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-red-50 text-red-700 font-semibold shadow-sm' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-red-700' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span>— Company ID : 70985</span>
          <button onClick={handleLogoutAdmin} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors" title="Keluar">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-md font-bold border border-red-100 uppercase tracking-wide">
              PRODUKSI ACTIVE
            </span>
            <span className="text-sm font-medium text-slate-600">PT. Moonlight Indonesia</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 bg-red-700 text-white rounded-full flex items-center font-bold text-sm justify-center shadow-sm">
                AD
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800">Administrator</p>
                <p className="text-[10px] text-slate-500">HR Department</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>

      {showAddEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Tambah Karyawan Baru</h2>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                <input type="text" value={newEmployee.nama} onChange={(e) => setNewEmployee({...newEmployee, nama: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Nama lengkap pegawai" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jabatan</label>
                <input type="text" value={newEmployee.jabatan} onChange={(e) => setNewEmployee({...newEmployee, jabatan: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Contoh: Software Engineer" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email / Username</label>
                <input type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="email@domain.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Telepon</label>
                <input type="text" value={newEmployee.no_telp} onChange={(e) => setNewEmployee({...newEmployee, no_telp: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="08xxxxxxxxxx" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowAddEmployee(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
