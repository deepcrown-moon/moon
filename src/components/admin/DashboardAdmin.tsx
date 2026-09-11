import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Users, 
  Clock, 
  DollarSign, 
  FileText, 
  Settings, 
  LayoutDashboard, 
  Briefcase, 
  Bell, 
  Search, 
  TrendingUp, 
  ShieldCheck,
  LogOut
} from 'lucide-react';

export default function DashboardAdmin() {
  const [totalKaryawan, setTotalKaryawan] = useState(0);
  const [totalAbsensiHariIni, setTotalAbsensiHariIni] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('Home');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const { count: countKaryawan, error: errKaryawan } = await supabase
        .from('karyawan')
        .select('*', { count: 'exact', head: true });

      if (errKaryawan) throw errKaryawan;
      setTotalKaryawan(countKaryawan || 0);

      const today = new Date().toISOString().split('T')[0];
      const { count: countAbsensi, error: errAbsensi } = await supabase
        .from('absensi')
        .select('*', { count: 'exact', head: true })
        .eq('tanggal', today);

      if (errAbsensi) throw errAbsensi;
      setTotalAbsensiHariIni(countAbsensi || 0);

    } catch (error) {
      console.error('Gagal memuat data dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* SIDEBAR MENU SAMPING KIRI */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="p-5 flex items-center space-x-3 border-b border-slate-800">
          <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold text-lg shadow-md">M</div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-wider">MOONLIGHT HRIS</h1>
            <p className="text-xs text-slate-400">Enterprise Edition</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { name: 'Home', icon: LayoutDashboard },
            { name: 'Employee Profile', icon: Users },
            { name: 'Employees', icon: Briefcase },
            { name: 'Time & Attendance', icon: Clock },
            { name: 'Finance & Payroll', icon: DollarSign },
            { name: 'Productivity', icon: TrendingUp },
            { name: 'Company Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveMenu(item.name)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={18} />
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA KANAN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md font-bold border border-indigo-100 uppercase tracking-wide">
              PRODUKSI ACTIVE
            </span>
            <span className="text-sm font-medium text-slate-600">PT. Moonlight Indonesia</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari data karyawan..." 
                className="pl-9 pr-4 py-1.5 text-sm bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center font-bold text-sm justify-center shadow-sm">
                AD
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800">Administrator</p>
                <p className="text-[10px] text-slate-500">HR Department</p>
              </div>
            </div>
          </div>
        </header>

        {/* BODY UTAMA DASHBOARD */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* BANNER UTAMA */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-center">
            <div className="space-y-2 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold tracking-tight">Selamat Datang Kembali, Admin!</h2>
              <p className="text-indigo-100 text-sm max-w-xl">
                Sistem HRIS berjalan normal. Kelola kehadiran, rekapitulasi gaji, dan profil pegawai PT. Moonlight Indonesia dalam satu kendali terpusat.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20 text-center shadow-inner">
              <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">Total Karyawan Aktif</p>
              <p className="text-3xl font-extrabold mt-1">{loading ? '...' : totalKaryawan}</p>
            </div>
          </div>

          {/* KARTU STATISTIK */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kehadiran Hari Ini</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{loading ? '...' : totalAbsensiHariIni} Orang</p>
                <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">● Real-time Sync</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Clock size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Database</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">Connected</p>
                <span className="text-xs text-indigo-600 font-medium mt-1 inline-block">Supabase Cloud</span>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck size={24} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aplikasi Android</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">PWA Ready</p>
                <span className="text-xs text-amber-600 font-medium mt-1 inline-block">Installable Mode</span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <FileText size={24} />
              </div>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
