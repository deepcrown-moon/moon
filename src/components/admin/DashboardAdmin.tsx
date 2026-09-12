import './DashboardAdmin.css';
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../supabaseClient';
import RecruitmentPage from './RecruitmentPage';

interface Karyawan {
  id: string;
  nama: string;
  jabatan: string;
  email?: string;
  pin?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  bulan?: string;
  tahun_lahir?: string;
  nik_ktp?: string;
  nama_ibu_kandung?: string;
  no_telp?: string;
  alamat_rumah?: string;
  nama_rekening?: string;
  no_rekening?: string;
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
  created_at?: string;
}

export default function DashboardAdmin() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activePage, setActivePage] = useState('home');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);

  const [daftarKaryawan, setDaftarKaryawan] = useState<Karyawan[]>([]);
  const [daftarAbsensi, setDaftarAbsensi] = useState<Absensi[]>([]);
  const [loadingKaryawan, setLoadingKaryawan] = useState(false);
  const [loadingAbsensi, setLoadingAbsensi] = useState(false);

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showLeaveRequest, setShowLeaveRequest] = useState(false);
  const [showOvertimeRequest, setShowOvertimeRequest] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    nama: '',
    jabatan: '',
    email: '',
    no_telp: '',
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

    const { data: foundAdmin, error } = await supabase
      .from('karyawan')
      .select('*')
      .eq('email', adminUser)
      .eq('pin', adminPass)
      .maybeSingle();

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
    setCurrentPage('dashboard');
  };

  const handleMenuClick = (page: string) => {
    setActivePage(page);
    setCurrentPage('dashboard');
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
    setNewEmployee({ nama: '', jabatan: '', email: '', no_telp: '' });
    setShowAddEmployee(false);
    fetchKaryawan();
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-login-logo">Moonjustfine</div>
          <div className="admin-login-icon">🔐</div>
          <h1>Login Admin</h1>
          <p>Masuk ke Dashboard HRIS</p>
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

  const HomePage = () => (
    <section className="welcome-card">
      <div className="welcome-content">
        <h1>Good morning, tirta kusuma!</h1>
        <p className="date-text">It's Saturday, 12 September</p>
        <div className="shortcut-title">Shortcut</div>
        <div className="shortcut-buttons">
          <button onClick={() => handleMenuClick('time')}>Live attendance</button>
          <button onClick={() => setShowLeaveRequest(true)}>Request time off</button>
          <button onClick={() => setShowOvertimeRequest(true)}>Request overtime</button>
        </div>
      </div>
    </section>
  );

  const EmployeesPage = () => (
    <section className="data-section">
      <div className="data-header">
        <div>
          <h2>Employees</h2>
          <p>Kelola seluruh data karyawan</p>
        </div>
        <div className="data-actions">
          <button className="export-green" onClick={() => setShowAddEmployee(true)}>+ Add Employee</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Jabatan</th>
              <th>Email</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loadingKaryawan ? (
              <tr><td colSpan={4} className="empty-table">Memuat data...</td></tr>
            ) : daftarKaryawan.length === 0 ? (
              <tr><td colSpan={4} className="empty-table">Belum ada karyawan.</td></tr>
            ) : (
              daftarKaryawan.map((k) => (
                <tr key={k.id}>
                  <td><strong>{k.nama}</strong></td>
                  <td>{k.jabatan || '-'}</td>
                  <td className="email-cell">{k.email || '-'}</td>
                  <td>
                    <button className="delete-button" onClick={() => handleHapusKaryawan(k.id, k.nama)}>Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const TimePage = () => (
    <section className="data-section">
      <div className="data-header">
        <div>
          <h2>Attendance & Live Monitoring</h2>
          <p>Monitoring kehadiran karyawan</p>
        </div>
        <button className="refresh-button" onClick={fetchAbsensi}>↻ Refresh</button>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Tanggal</th>
              <th>Jam Masuk</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loadingAbsensi ? (
              <tr><td colSpan={4} className="empty-table">Memuat absensi...</td></tr>
            ) : daftarAbsensi.length === 0 ? (
              <tr><td colSpan={4} className="empty-table">Belum ada absensi.</td></tr>
            ) : (
              daftarAbsensi.map((a, i) => (
                <tr key={a.id || i}>
                  <td><strong>{a.nama || '-'}</strong></td>
                  <td>{a.tanggal || '-'}</td>
                  <td className="time-in">{a.jam_masuk || '-'}</td>
                  <td><span className="status-badge">{a.status || 'Hadir'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const SettingsPage = () => (
    <section className="data-section">
      <div className="data-header">
        <div>
          <h2>Settings & Daftar Admin</h2>
          <p>Pengaturan sistem dan manajemen administrator</p>
        </div>
      </div>
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Daftar Administrator</h3>
        <ul>
          <li><strong>admin</strong> (Super Admin) - Active</li>
          {daftarKaryawan.filter(k => k.email).map(k => (
            <li key={k.id}>{k.email} (HR Staff) - Active</li>
          ))}
        </ul>
        <br />
        <button className="delete-button" onClick={handleLogoutAdmin}>Logout Account</button>
      </div>
    </section>
  );

  const renderPage = () => {
    switch (activePage) {
      case 'home': return <HomePage />;
      case 'employees': return <EmployeesPage />;
      case 'recruitment': return <RecruitmentPage />;
      case 'time': return <TimePage />;
      case 'settings': return <SettingsPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="hris-app">
      <aside className="sidebar">
        <div className="logo-area">
          <span className="logo-text">Moonjustfine</span>
        </div>
        <nav className="sidebar-menu">
          <button className={`menu-item ${activePage === 'home' ? 'active' : ''}`} onClick={() => handleMenuClick('home')}>
            <span>Home</span>
          </button>
          <button className={`menu-item ${activePage === 'employees' ? 'active' : ''}`} onClick={() => handleMenuClick('employees')}>
            <span>Employees</span>
          </button>
          <button className={`menu-item ${currentPage === 'recruitment' ? 'active' : ''}`} onClick={() => { setCurrentPage('recruitment'); }}>
            <span>Recruitment</span>
          </button>
          <button className={`menu-item ${activePage === 'time' ? 'active' : ''}`} onClick={() => handleMenuClick('time')}>
            <span>Attendance</span>
          </button>
          <button className={`menu-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => handleMenuClick('settings')}>
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span className="top-title">HRIS Dashboard</span>
          <div className="profile-info">
            <strong>tirta kusuma</strong>
            <small>moonjustfine</small>
          </div>
        </header>

        <div className="dashboard-container">
          {currentPage === 'recruitment' ? <RecruitmentPage /> : renderPage()}
        </div>
      </main>

      {showAddEmployee && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Tambah Karyawan</h2>
            <form onSubmit={handleAddEmployee}>
              <label>Nama</label>
              <input type="text" value={newEmployee.nama} onChange={(e) => setNewEmployee({...newEmployee, nama: e.target.value})} placeholder="Nama" required />
              <label>Jabatan</label>
              <input type="text" value={newEmployee.jabatan} onChange={(e) => setNewEmployee({...newEmployee, jabatan: e.target.value})} placeholder="Jabatan" required />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddEmployee(false)}>Batal</button>
                <button type="submit">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
