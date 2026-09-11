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
  const [, setActiveMenu] = useState('Home');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);

  const [activePage, setActivePage] = useState('home');

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
    const { data, error } = await supabase
      .from('karyawan')
      .select('*')
      .order('nama', { ascending: true });

    if (error) console.error('Gagal mengambil karyawan:', error);
    if (data) setDaftarKaryawan(data as Karyawan[]);
    setLoadingKaryawan(false);
  };

  const fetchAbsensi = async () => {
    setLoadingAbsensi(true);
    const { data, error } = await supabase
      .from('absensi')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Gagal mengambil absensi:', error);
    if (data) setDaftarAbsensi(data as Absensi[]);
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

  const handleMenuClick = (page: string) => {
    setActivePage(page);
    setCurrentPage('dashboard');
  };

  const handleLogoutAdmin = () => {
    setIsLoggedIn(false);
    setAdminUser('');
    setAdminPass('');
    setDaftarKaryawan([]);
    setDaftarAbsensi([]);
    setActivePage('home');
    setCurrentPage('dashboard');
  };

  const handleHapusKaryawan = async (id: string, nama: string) => {
    const yakin = window.confirm(`Yakin ingin menghapus akun "${nama}"?`);
    if (!yakin) return;

    const { error } = await supabase.from('karyawan').delete().eq('id', id);
    if (error) {
      alert('Gagal menghapus: ' + error.message);
      return;
    }

    alert('Data berhasil dihapus.');
    fetchKaryawan();
  };

  const handleAddEmployee = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEmployee.nama || !newEmployee.jabatan) {
      alert('Nama dan jabatan wajib diisi.');
      return;
    }

    const { error } = await supabase.from('karyawan').insert([
      {
        nama: newEmployee.nama,
        jabatan: newEmployee.jabatan,
        email: newEmployee.email,
        no_telp: newEmployee.no_telp,
      },
    ]);

    if (error) {
      alert('Gagal menambah karyawan: ' + error.message);
      return;
    }

    alert('Karyawan berhasil ditambahkan.');
    setNewEmployee({ nama: '', jabatan: '', email: '', no_telp: '' });
    setShowAddEmployee(false);
    fetchKaryawan();
  };

  const handleExportExcel = () => {
    if (daftarKaryawan.length === 0) {
      alert('Belum ada data karyawan.');
      return;
    }

    let csv = 'Nama;Jabatan;NIK KTP;Nama Ibu Kandung;No Telepon;Alamat;Nama Rekening;No Rekening;Email;Tempat/Tgl Lahir\n';
    daftarKaryawan.forEach((k) => {
      const tempatTanggalLahir = `${k.tempat_lahir || '-'}, ${k.tanggal_lahir || ''} ${k.bulan || ''} ${k.tahun_lahir || ''}`;
      csv += `"${k.nama || '-'}";"${k.jabatan || '-'}";"${k.nik_ktp || '-'}";"${k.nama_ibu_kandung || '-'}";"${k.no_telp || '-'}";"${k.alamat_rumah || '-'}";"${k.nama_rekening || '-'}";"${k.no_rekening || '-'}";"${k.email || '-'}";"${tempatTanggalLahir}"\n`;
    });

    downloadCSV(csv, 'Database_Lengkap_Karyawan.csv');
  };

  const handleExportAbsensiExcel = () => {
    if (daftarAbsensi.length === 0) {
      alert('Belum ada data absensi.');
      return;
    }

    let csv = 'ID Karyawan;Nama;Tanggal;Jam Masuk;Jam Pulang;Status\n';
    daftarAbsensi.forEach((a) => {
      csv += `"${a.id_karyawan || '-'}";"${a.nama || '-'}";"${a.tanggal || '-'}";"${a.jam_masuk || '-'}";"${a.jam_pulang || '-'}";"${a.status || 'Hadir'}"\n`;
    });

    downloadCSV(csv, 'Laporan_Absensi_Moonlight.csv');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <input
              type="text"
              value={adminUser}
              onChange={(e) => setAdminUser(e.target.value)}
              placeholder="Email admin..."
            />

            <label>PIN / Password</label>
            <input
              type="password"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              placeholder="PIN / Password..."
            />

            <button type="submit" disabled={isLoadingLogin}>
              {isLoadingLogin ? 'Memproses...' : 'Masuk Dashboard Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const HomePage = () => (
    <>
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
        <div className="welcome-illustration">
          <div className="check-bubble">✓</div>
          <div className="person-icon">👩🏻‍💼</div>
        </div>
      </section>

      <section className="stats-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <span>Employment Status</span>
            <span>⋮</span>
          </div>
          <div className="progress-wrapper">
            <div className="progress-bar">
              <div className="progress-value" style={{ width: daftarKaryawan.length > 0 ? '100%' : '0%' }} />
            </div>
          </div>
          <div className="stat-total">
            <span>Total</span>
            <strong>{daftarKaryawan.length}</strong>
          </div>
          <div className="stat-row">
            <span><i className="blue-dot"></i>Permanent</span>
            <span>{daftarKaryawan.length}</span>
            <span>{daftarKaryawan.length > 0 ? '100%' : '0%'}</span>
          </div>
          <div className="card-footer">Filter ⌄</div>
        </div>
      </section>
    </>
  );

  const EmployeeProfilePage = () => (
    <section className="data-section">
      <div className="data-header">
        <div>
          <h2>Employee Profile</h2>
          <p>Informasi profil seluruh karyawan</p>
        </div>
        <button className="export-green" onClick={() => handleMenuClick('employees')}>
          Lihat Semua Karyawan
        </button>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Jabatan</th>
              <th>Email</th>
              <th>No. Telepon</th>
            </tr>
          </thead>
          <tbody>
            {daftarKaryawan.map((k) => (
              <tr key={k.id}>
                <td>{k.nama}</td>
                <td>{k.jabatan}</td>
                <td>{k.email || '-'}</td>
                <td>{k.no_telp || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
          <button className="export-blue" onClick={handleExportExcel}>↓ Export Database</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Jabatan</th>
              <th>NIK / No. Telp</th>
              <th>Email</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loadingKaryawan ? (
              <tr><td colSpan={5} className="empty-table">Memuat data...</td></tr>
            ) : daftarKaryawan.length === 0 ? (
              <tr><td colSpan={5} className="empty-table">Belum ada karyawan.</td></tr>
            ) : (
              daftarKaryawan.map((k) => (
                <tr key={k.id}>
                  <td><strong>{k.nama}</strong></td>
                  <td>{k.jabatan || '-'}</td>
                  <td>NIK: {k.nik_ktp || '-'}<br />Telp: {k.no_telp || '-'}</td>
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
          <h2>📸 Attendance & Live Monitoring</h2>
          <p>Monitoring kehadiran karyawan</p>
        </div>
        <div className="data-actions">
          <button className="refresh-button" onClick={fetchAbsensi}>↻ Refresh</button>
          <button className="export-blue" onClick={handleExportAbsensiExcel}>↓ Export Absensi</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Foto</th>
              <th>ID Karyawan</th>
              <th>Nama</th>
              <th>Tanggal</th>
              <th>Jam Masuk</th>
              <th>Jam Pulang</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loadingAbsensi ? (
              <tr><td colSpan={7} className="empty-table">Memuat absensi...</td></tr>
            ) : daftarAbsensi.length === 0 ? (
              <tr><td colSpan={7} className="empty-table">Belum ada absensi.</td></tr>
            ) : (
              daftarAbsensi.map((a, index) => (
                <tr key={a.id || index}>
                  <td>
                    {a.foto ? <img src={a.foto} alt="Selfie" className="selfie" /> : <span className="no-photo">Tanpa Foto</span>}
                  </td>
                  <td>{a.id_karyawan || '-'}</td>
                  <td><strong>{a.nama || '-'}</strong></td>
                  <td>{a.tanggal || '-'}</td>
                  <td className="time-in">{a.jam_masuk || '-'}</td>
                  <td className="time-out">{a.jam_pulang || 'Belum Pulang'}</td>
                  <td><span className="status-badge">{a.status || 'Hadir'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const FinancePage = () => (
    <section className="data-section">
      <div className="data-header">
        <div>
          <h2>Finance</h2>
          <p>Kelola pengeluaran dan reimbursement</p>
        </div>
      </div>
    </section>
  );

  const PayrollPage = () => (
    <section className="data-section">
      <div className="data-header">
        <div>
          <h2>Payroll</h2>
          <p>Kelola penggajian karyawan</p>
        </div>
      </div>
    </section>
  );

  const ProductivityPage = () => (
    <section className="data-section">
      <div className="data-header">
        <div>
          <h2>Productivity</h2>
          <p>Monitoring produktivitas karyawan</p>
        </div>
      </div>
    </section>
  );

  const CompanyPage = () => (
    <section className="data-section">
      <div className="data-header">
        <div>
          <h2>Company</h2>
          <p>Informasi dan struktur perusahaan</p>
        </div>
      </div>
    </section>
  );

  const ApplicationsPage = () => (
    <section className="data-section">
      <div className="data-header">
        <div>
          <h2>Applications</h2>
          <p>Kelola aplikasi dan pengajuan karyawan</p>
        </div>
      </div>
    </section>
  );

  const IntegrationsPage = () => (
    <section className="data-section">
      <div className="data-header">
        <div>
          <h2>Integrations</h2>
          <p>Integrasi sistem dan layanan eksternal</p>
        </div>
      </div>
    </section>
  );

  // DASHBOARD SETTINGS TERMASUK DAFTAR ADMIN YANG DIPINDAHKAN KESINI
  const SettingsPage = () => (
    <section className="data-section">
      <div className="data-header">
        <div>
          <h2>Settings & Daftar Admin</h2>
          <p>Pengaturan sistem HRIS dan manajemen administrator</p>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#273243' }}>Daftar Administrator Aktif</h3>
        <p style={{ fontSize: '11px', color: '#7b8592', marginBottom: '15px' }}>
          Akun administrator yang memiliki hak akses penuh ke Dashboard HRIS.
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Username / Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>admin</strong> (Demo / Super Admin)</td>
                <td>Administrator Utama</td>
                <td><span className="status-badge">Active</span></td>
              </tr>
              {daftarKaryawan.filter(k => k.email).map((k) => (
                <tr key={k.id}>
                  <td>{k.email}</td>
                  <td>HR Manager / Staff</td>
                  <td><span className="status-badge">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#273243' }}>Aksi Akun</h3>
          <button className="delete-button" onClick={handleLogoutAdmin}>
            Logout Account
          </button>
        </div>
      </div>
    </section>
  );

  const renderPage = () => {
    switch (activePage) {
      case 'home': return <HomePage />;
      case 'employee-profile': return <EmployeeProfilePage />;
      case 'employees': return <EmployeesPage />;
      case 'recruitment': return <RecruitmentPage />;
      case 'time': return <TimePage />;
      case 'finance': return <FinancePage />;
      case 'payroll': return <PayrollPage />;
      case 'productivity': return <ProductivityPage />;
      case 'company': return <CompanyPage />;
      case 'applications': return <ApplicationsPage />;
      case 'integrations': return <IntegrationsPage />;
      case 'settings': return <SettingsPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="hris-app">
      <aside className="sidebar">
        <div className="logo-area">
          <span className="logo-text">Moonjustfine</span>
          <div className="logo-divider"></div>
          <span className="hris-text">HRIS</span>
        </div>

        <nav className="sidebar-menu">
          <button className={`menu-item ${activePage === 'home' ? 'active' : ''}`} onClick={() => handleMenuClick('home')}>
            <span className="menu-icon">⌂</span><span>Home</span>
          </button>
          <button className={`menu-item ${activePage === 'employee-profile' ? 'active' : ''}`} onClick={() => handleMenuClick('employee-profile')}>
            <span className="menu-icon">◎</span><span>Employee profile</span>
          </button>
          <button className={`menu-item ${activePage === 'employees' ? 'active' : ''}`} onClick={() => handleMenuClick('employees')}>
            <span className="menu-icon">♙</span><span>Employees</span><span className="arrow">›</span>
          </button>
          <button className={`menu-item ${currentPage === 'recruitment' ? 'active' : ''}`} onClick={() => { setCurrentPage('recruitment'); setActiveMenu('Recruitment'); }}>
            <span className="menu-icon">♧</span><span>Recruitment</span><span className="arrow">›</span>
          </button>
          <button className={`menu-item ${activePage === 'finance' ? 'active' : ''}`} onClick={() => handleMenuClick('finance')}>
            <span className="menu-icon">▣</span><span>Finance</span><span className="arrow">›</span>
          </button>
          <button className={`menu-item ${activePage === 'payroll' ? 'active' : ''}`} onClick={() => handleMenuClick('payroll')}>
            <span className="menu-icon">▤</span><span>Payroll</span><span className="arrow">›</span>
          </button>
          <button className={`menu-item ${activePage === 'productivity' ? 'active' : ''}`} onClick={() => handleMenuClick('productivity')}>
            <span className="menu-icon">✓</span><span>Productivity</span><span className="arrow">›</span>
          </button>
          <button className={`menu-item ${activePage === 'company' ? 'active' : ''}`} onClick={() => handleMenuClick('company')}>
            <span className="menu-icon">▥</span><span>Company</span><span className="arrow">›</span>
          </button>

          <div className="sidebar-separator"></div>

          <button className={`menu-item ${activePage === 'applications' ? 'active' : ''}`} onClick={() => handleMenuClick('applications')}>
            <span className="menu-icon">◇</span><span>Applications</span><span className="arrow">›</span>
          </button>
          <button className={`menu-item ${activePage === 'integrations' ? 'active' : ''}`} onClick={() => handleMenuClick('integrations')}>
            <span className="menu-icon">♢</span><span>Integrations</span><span className="arrow">›</span>
          </button>

          <div className="sidebar-separator"></div>

          <button className={`menu-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => handleMenuClick('settings')}>
            <span className="menu-icon">⚙</span><span>Settings</span>
          </button>
        </nav>

        <div className="company-id">
          <span>←</span>
          <span>Company ID : 70985</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu">☰</button>
            <span className="top-title">HRIS</span>
            <span className="top-arrow">▼</span>
          </div>

          <div className="topbar-right">
            <button className="summary-button" onClick={() => alert(`Total Karyawan: ${daftarKaryawan.length}\nTotal Absensi: ${daftarAbsensi.length}`)}>
              ✨ Summarize data
            </button>
            <button className="top-icon">＋</button>
            <button className="top-icon">⌕</button>
            <button className="top-icon notification">
              ♧<span className="notification-dot">{daftarAbsensi.length}</span>
            </button>
            <button className="apps-button">•••</button>

            <div className="profile-area">
              <div className="profile-avatar">TK</div>
              <div className="profile-info">
                <strong>tirta kusuma</strong>
                <small>moonjustfine</small>
              </div>
            </div>
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
              <label>Nama Lengkap</label>
              <input type="text" value={newEmployee.nama} onChange={(e) => setNewEmployee({ ...newEmployee, nama: e.target.value })} placeholder="Nama karyawan" />

              <label>Jabatan</label>
              <input type="text" value={newEmployee.jabatan} onChange={(e) => setNewEmployee({ ...newEmployee, jabatan: e.target.value })} placeholder="Contoh: Staff" />

              <label>Email</label>
              <input type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} placeholder="Email Gmail" />

              <label>No. Telepon</label>
              <input type="text" value={newEmployee.no_telp} onChange={(e) => setNewEmployee({ ...newEmployee, no_telp: e.target.value })} placeholder="08xxxxxxxx" />

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddEmployee(false)}>Batal</button>
                <button type="submit">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLeaveRequest && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Request Time Off</h2>
            <p>Form pengajuan cuti karyawan.</p>
            <input type="text" placeholder="Jenis cuti" />
            <input type="date" />
            <textarea placeholder="Alasan cuti" />
            <div className="modal-actions">
              <button onClick={() => setShowLeaveRequest(false)}>Batal</button>
              <button onClick={() => { alert('Pengajuan cuti berhasil dibuat.'); setShowLeaveRequest(false); }}>Ajukan</button>
            </div>
          </div>
        </div>
      )}

      {showOvertimeRequest && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Request Overtime</h2>
            <p>Form pengajuan lembur karyawan.</p>
            <input type="date" />
            <input type="time" />
            <input type="time" />
            <textarea placeholder="Alasan lembur" />
            <div className="modal-actions">
              <button onClick={() => setShowOvertimeRequest(false)}>Batal</button>
              <button onClick={() => { alert('Pengajuan lembur berhasil dibuat.'); setShowOvertimeRequest(false); }}>Ajukan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
