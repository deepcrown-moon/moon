import './DashboardAdmin.css';
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../supabaseClient';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);

  const [daftarKaryawan, setDaftarKaryawan] = useState<Karyawan[]>([]);
  const [daftarAbsensi, setDaftarAbsensi] = useState<Absensi[]>([]);

  const [loadingKaryawan, setLoadingKaryawan] = useState(false);
  const [loadingAbsensi, setLoadingAbsensi] = useState(false);

  const [activeMenu, setActiveMenu] = useState('Home');

  /*
   * ============================================================
   * LOAD DATA
   * ============================================================
   */

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

    if (error) {
      console.error('Gagal mengambil data karyawan:', error);
    }

    if (data) {
      setDaftarKaryawan(data as Karyawan[]);
    }

    setLoadingKaryawan(false);
  };

  const fetchAbsensi = async () => {
    setLoadingAbsensi(true);

    const { data, error } = await supabase
      .from('absensi')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data absensi:', error);
    }

    if (data) {
      setDaftarAbsensi(data as Absensi[]);
    }

    setLoadingAbsensi(false);
  };

  /*
   * ============================================================
   * LOGIN ADMIN
   * ============================================================
   */

  const handleLoginAdmin = async (e: FormEvent) => {
    e.preventDefault();

    if (!adminUser || !adminPass) {
      alert('Email / username dan PIN wajib diisi.');
      return;
    }

    setIsLoadingLogin(true);

    /*
     * LOGIN ADMIN DEFAULT
     *
     * Catatan:
     * Untuk produksi sebaiknya diganti Supabase Auth.
     */
    if (adminUser === 'admin' && adminPass === 'admin123') {
      setIsLoggedIn(true);
      setIsLoadingLogin(false);
      return;
    }

    /*
     * LOGIN MENGGUNAKAN DATA KARYAWAN
     */

    const { data: foundAdmin, error } = await supabase
      .from('karyawan')
      .select('*')
      .eq('email', adminUser)
      .eq('pin', adminPass)
      .maybeSingle();

    if (foundAdmin && !error) {
      setIsLoggedIn(true);
    } else {
      alert(
        'Login Admin gagal.\n\n' +
        'Pastikan Email dan PIN benar.'
      );
    }

    setIsLoadingLogin(false);
  };

  /*
   * ============================================================
   * DELETE KARYAWAN
   * ============================================================
   */

  const handleHapusKaryawan = async (
    id: string,
    nama: string
  ) => {
    const yakin = window.confirm(
      `Yakin ingin menghapus akun "${nama}" dari database secara permanen?`
    );

    if (!yakin) return;

    const { error } = await supabase
      .from('karyawan')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Gagal menghapus data: ' + error.message);
      return;
    }

    alert(`Akun ${nama} berhasil dihapus.`);

    fetchKaryawan();
  };

  /*
   * ============================================================
   * EXPORT DATABASE KARYAWAN
   * ============================================================
   */

  const handleExportExcel = () => {
    if (daftarKaryawan.length === 0) {
      alert('Belum ada data karyawan untuk diexport.');
      return;
    }

    let csv =
      'Nama;Jabatan;NIK KTP;Nama Ibu Kandung;No Telepon;Alamat;Nama Rekening;No Rekening;Email;Tempat/Tgl Lahir\n';

    daftarKaryawan.forEach((k) => {
      const tempatTanggalLahir =
        `${k.tempat_lahir || '-'}, ` +
        `${k.tanggal_lahir || ''} ` +
        `${k.bulan || ''} ` +
        `${k.tahun_lahir || ''}`;

      csv +=
        `"${k.nama || '-'}";` +
        `"${k.jabatan || '-'}";` +
        `"${k.nik_ktp || '-'}";` +
        `"${k.nama_ibu_kandung || '-'}";` +
        `"${k.no_telp || '-'}";` +
        `"${k.alamat_rumah || '-'}";` +
        `"${k.nama_rekening || '-'}";` +
        `"${k.no_rekening || '-'}";` +
        `"${k.email || '-'}";` +
        `"${tempatTanggalLahir}"\n`;
    });

    downloadCSV(
      csv,
      'Database_Lengkap_Karyawan.csv'
    );
  };

  /*
   * ============================================================
   * EXPORT ABSENSI
   * ============================================================
   */

  const handleExportAbsensiExcel = () => {
    if (daftarAbsensi.length === 0) {
      alert('Belum ada data absensi untuk diexport.');
      return;
    }

    let csv =
      'ID Karyawan;Nama;Tanggal;Jam Masuk;Jam Pulang;Status\n';

    daftarAbsensi.forEach((a) => {
      csv +=
        `"${a.id_karyawan || '-'}";` +
        `"${a.nama || '-'}";` +
        `"${a.tanggal || '-'}";` +
        `"${a.jam_masuk || '-'}";` +
        `"${a.jam_pulang || '-'}";` +
        `"${a.status || 'Hadir'}"\n`;
    });

    downloadCSV(
      csv,
      'Laporan_Absensi_Moonlight.csv'
    );
  };

  /*
   * ============================================================
   * DOWNLOAD CSV
   * ============================================================
   */

  const downloadCSV = (
    csv: string,
    filename: string
  ) => {
    const blob = new Blob(
      ['\uFEFF' + csv],
      {
        type: 'text/csv;charset=utf-8;'
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const handleLogoutAdmin = () => {
    setIsLoggedIn(false);
    setAdminUser('');
    setAdminPass('');
    setDaftarKaryawan([]);
    setDaftarAbsensi([]);
  };

  /*
   * ============================================================
   * SIDEBAR MENU
   * ============================================================
   */

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);

    if (menu === 'Employees') {
      document
        .getElementById('database-karyawan')
        ?.scrollIntoView({
          behavior: 'smooth'
        });
    }

    if (menu === 'Time') {
      document
        .getElementById('monitoring-absensi')
        ?.scrollIntoView({
          behavior: 'smooth'
        });
    }
  };

  /*
   * ============================================================
   * LOGIN PAGE
   * ============================================================
   */

  if (!isLoggedIn) {
    return (
      <div className="admin-login-page">

        <div className="admin-login-card">

          <div className="admin-login-logo">
            Moonjustfine
          </div>

          <div className="admin-login-icon">
            🔐
          </div>

          <h1>
            Login Admin
          </h1>

          <p>
            Masuk ke Dashboard HRIS
          </p>

          <form
            onSubmit={handleLoginAdmin}
            className="admin-login-form"
          >

            <label>
              Email / Username
            </label>

            <input
              type="text"
              value={adminUser}
              onChange={(e) =>
                setAdminUser(e.target.value)
              }
              placeholder="Email admin..."
              autoComplete="username"
            />

            <label>
              PIN / Password
            </label>

            <input
              type="password"
              value={adminPass}
              onChange={(e) =>
                setAdminPass(e.target.value)
              }
              placeholder="PIN / Password..."
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={isLoadingLogin}
            >
              {isLoadingLogin
                ? 'Memproses...'
                : 'Masuk Dashboard Admin'}
            </button>

          </form>

          <div className="admin-login-hint">
            <strong>Demo Admin</strong>
            <br />
            Username: admin
            <br />
            Password: admin123
          </div>

        </div>

      </div>
    );
  }

  /*
   * ============================================================
   * DASHBOARD
   * ============================================================
   */

  return (
    <div className="hris-app">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className="sidebar">

        <div className="logo-area">

          <div className="logo-text">
            Moonjustfine
          </div>

          <div className="logo-divider"></div>

          <span className="hris-text">
            HRIS
          </span>

        </div>

        <nav className="sidebar-menu">

          <button
            className={`menu-item ${
              activeMenu === 'Home'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              handleMenuClick('Home')
            }
          >
            <span className="menu-icon">
              ⌂
            </span>

            <span>
              Home
            </span>
          </button>

          <button
            className={`menu-item ${
              activeMenu === 'Employee profile'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              handleMenuClick(
                'Employee profile'
              )
            }
          >
            <span className="menu-icon">
              ◎
            </span>

            <span>
              Employee profile
            </span>
          </button>

          <button
            className={`menu-item ${
              activeMenu === 'Employees'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              handleMenuClick('Employees')
            }
          >
            <span className="menu-icon">
              ♙
            </span>

            <span>
              Employees
            </span>

            <span className="arrow">
              ›
            </span>
          </button>

          <button
            className="menu-item"
            onClick={() =>
              handleMenuClick('Recruitment')
            }
          >
            <span className="menu-icon">
              ♧
            </span>

            <span>
              Recruitment
            </span>

            <span className="arrow">
              ›
            </span>
          </button>

          <button
            className={`menu-item ${
              activeMenu === 'Time'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              handleMenuClick('Time')
            }
          >
            <span className="menu-icon">
              ◷
            </span>

            <span>
              Time
            </span>

            <span className="arrow">
              ›
            </span>
          </button>

          <button
            className="menu-item"
            onClick={() =>
              handleMenuClick('Finance')
            }
          >
            <span className="menu-icon">
              ▣
            </span>

            <span>
              Finance
            </span>

            <span className="arrow">
              ›
            </span>
          </button>

          <button
            className="menu-item"
            onClick={() =>
              handleMenuClick('Payroll')
            }
          >
            <span className="menu-icon">
              ▤
            </span>

            <span>
              Payroll
            </span>

            <span className="arrow">
              ›
            </span>
          </button>

          <button
            className="menu-item"
            onClick={() =>
              handleMenuClick('Productivity')
            }
          >
            <span className="menu-icon">
              ✓
            </span>

            <span>
              Productivity
            </span>

            <span className="arrow">
              ›
            </span>
          </button>

          <button
            className="menu-item"
            onClick={() =>
              handleMenuClick('Company')
            }
          >
            <span className="menu-icon">
              ▥
            </span>

            <span>
              Company
            </span>

            <span className="arrow">
              ›
            </span>
          </button>

          <div className="sidebar-separator"></div>

          <button
            className="menu-item"
            onClick={() =>
              handleMenuClick('Applications')
            }
          >
            <span className="menu-icon">
              ◇
            </span>

            <span>
              Applications
            </span>

            <span className="arrow">
              ›
            </span>
          </button>

          <button
            className="menu-item"
            onClick={() =>
              handleMenuClick('Integrations')
            }
          >
            <span className="menu-icon">
              ♢
            </span>

            <span>
              Integrations
            </span>

            <span className="arrow">
              ›
            </span>
          </button>

          <div className="sidebar-separator"></div>

          <button
            className="menu-item"
            onClick={() =>
              handleMenuClick('Settings')
            }
          >
            <span className="menu-icon">
              ⚙
            </span>

            <span>
              Settings
            </span>
          </button>

        </nav>

        <div className="company-id">

          <span>
            ←
          </span>

          <span>
            Company ID : 70985
          </span>

        </div>

      </aside>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="main-content">

        {/* TOPBAR */}

        <header className="topbar">

          <div className="topbar-left">

            <button className="mobile-menu">
              ☰
            </button>

            <span className="top-title">
              HRIS
            </span>

            <span className="top-arrow">
              ▼
            </span>

          </div>

          <div className="topbar-right">

            <button className="summary-button">
              ✨ Summarize data
            </button>

            <button className="top-icon">
              ＋
            </button>

            <button className="top-icon">
              ⌕
            </button>

            <button className="top-icon notification">
              ♧
              <span className="notification-dot">
                {daftarAbsensi.length}
              </span>
            </button>

            <button className="apps-button">
              •••
            </button>

            <div className="profile-area">

              <div className="profile-avatar">
                TK
              </div>

              <div className="profile-info">

                <strong>
                  tirta kusuma
                </strong>

                <small>
                  moonjustfine
                </small>

              </div>

            </div>

          </div>

        </header>


        {/* ==================================================
            DASHBOARD CONTENT
        ================================================== */}

        <div className="dashboard-container">

          {/* ==================================================
              WELCOME CARD
          ================================================== */}

          <section className="welcome-card">

            <div className="welcome-content">

              <h1>
                Good morning, tirta kusuma!
              </h1>

              <p className="date-text">
                It's Saturday, 12 September
              </p>

              <div className="shortcut-title">
                Shortcut
              </div>

              <div className="shortcut-buttons">

                <button
                  onClick={() =>
                    document
                      .getElementById(
                        'monitoring-absensi'
                      )
                      ?.scrollIntoView({
                        behavior: 'smooth'
                      })
                  }
                >
                  Live attendance
                </button>

                <button>
                  Request time off
                </button>

                <button>
                  Request overtime
                </button>

                <button>
                  More request
                  <span>
                    ⌄
                  </span>
                </button>

              </div>

            </div>

            <div className="welcome-illustration">

              <div className="check-bubble">
                ✓
              </div>

              <div className="person-icon">
                👩🏻‍💼
              </div>

            </div>

          </section>


          {/* ==================================================
              STATISTICS
          ================================================== */}

          <section className="stats-grid">

            {/* EMPLOYMENT */}

            <div className="dashboard-card">

              <div className="card-header">

                <span>
                  Employment Status
                </span>

                <span className="info-icon">
                  i
                </span>

                <span className="three-dot">
                  ⋮
                </span>

              </div>

              <div className="progress-wrapper">

                <div className="progress-bar">

                  <div
                    className="progress-value"
                    style={{
                      width:
                        daftarKaryawan.length > 0
                          ? '100%'
                          : '0%'
                    }}
                  />

                </div>

                <div className="progress-label">

                  <span>
                    0%
                  </span>

                  <span>
                    100%
                  </span>

                </div>

              </div>

              <div className="stat-total">

                <span>
                  Total
                </span>

                <strong>
                  {daftarKaryawan.length}
                </strong>

              </div>

              <div className="stat-row">

                <span>

                  <i className="blue-dot"></i>

                  Permanent

                </span>

                <span>
                  {daftarKaryawan.length}
                </span>

                <span>
                  {daftarKaryawan.length > 0
                    ? '100.0%'
                    : '0%'}
                </span>

              </div>

              <div className="card-footer">
                Filter
                <span>
                  ⌄
                </span>
              </div>

            </div>


            {/* LENGTH OF SERVICE */}

            <div className="dashboard-card">

              <div className="card-header">

                <span>
                  Length of Service
                </span>

                <span className="info-icon">
                  i
                </span>

                <span className="three-dot">
                  ⋮
                </span>

              </div>

              <div className="service-chart">

                <div className="chart-line line-1"></div>

                <div className="chart-line line-2"></div>

                <div className="chart-line line-3"></div>

                <div className="chart-bar"></div>

                <div className="chart-label">
                  &gt; 10 yr
                </div>

              </div>

              <div className="card-footer">

                Filter

                <span>
                  ⌄
                </span>

              </div>

            </div>


            {/* JOB LEVEL */}

            <div className="dashboard-card">

              <div className="card-header">

                <span>
                  Job Level
                </span>

                <span className="info-icon">
                  i
                </span>

                <span className="three-dot">
                  ⋮
                </span>

              </div>

              <div className="empty-chart">
                No matching data found
              </div>

              <div className="card-footer">

                Filter

                <span>
                  ⌄
                </span>

              </div>

            </div>


            {/* GENDER */}

            <div className="dashboard-card">

              <div className="card-header">

                <span>
                  Gender Diversity
                </span>

                <span className="info-icon">
                  i
                </span>

                <span className="three-dot">
                  ⋮
                </span>

              </div>

              <div className="donut-container">

                <div className="donut">

                  <div className="donut-inner">

                    {daftarKaryawan.length}

                  </div>

                </div>

              </div>

              <div className="gender-label">

                <span>

                  <i className="blue-dot"></i>

                  Not Filled

                </span>

                <span>
                  {daftarKaryawan.length}
                </span>

                <span>
                  {daftarKaryawan.length > 0
                    ? '100.0%'
                    : '0%'}
                </span>

              </div>

              <div className="card-footer">

                Filter

                <span>
                  ⌄
                </span>

              </div>

            </div>

          </section>


          {/* ==================================================
              LOWER GRID
          ================================================== */}

          <section className="lower-grid">

            {/* QUICK LINKS */}

            <div className="dashboard-card quick-links">

              <div className="section-title">
                Quick Links
              </div>

              <button
                onClick={() =>
                  handleMenuClick(
                    'Employee profile'
                  )
                }
              >
                <span className="quick-icon">
                  ●
                </span>

                Employee profile
              </button>

              <button
                onClick={() =>
                  handleMenuClick(
                    'Employees'
                  )
                }
              >
                <span className="quick-icon">
                  ♟
                </span>

                Add Employee
              </button>

              <button
                onClick={() =>
                  handleMenuClick('Time')
                }
              >
                <span className="quick-icon">
                  ▣
                </span>

                Attendance
              </button>

              <button
                onClick={() =>
                  handleMenuClick('Payroll')
                }
              >
                <span className="quick-icon">
                  ▤
                </span>

                Payroll
              </button>

            </div>


            {/* PROMO */}

            <div className="promo-card">

              <div className="promo-icon">
                📣
              </div>

              <div>

                <h2>
                  Yuk jadi bagian dari
                  <br />
                  Moonjustfine
                </h2>

                <p>
                  Berikan feedback agar Moonjustfine
                  <br />
                  selalu menghadirkan berbagai fitur
                  <br />
                  terbaik!
                </p>

                <button>
                  Berikan feedback
                </button>

              </div>

            </div>


            {/* WHO'S OFF */}

            <div className="dashboard-card whos-off">

              <div className="section-title">

                Who's Off

                <span className="today">
                  Today ⌄
                </span>

              </div>

              <div className="off-empty">
                No employee off today
              </div>

            </div>

          </section>


          {/* ==================================================
              DATABASE KARYAWAN
          ================================================== */}

          <section
            className="data-section"
            id="database-karyawan"
          >

            <div className="data-header">

              <div>

                <h2>
                  Database Pendaftaran Pegawai
                </h2>

                <p>
                  Seluruh data karyawan yang
                  terdaftar pada sistem
                </p>

              </div>

              <div className="data-actions">

                <button
                  className="export-green"
                  onClick={handleExportExcel}
                >
                  ↓ Export Database
                </button>

                <button
                  className="export-blue"
                  onClick={handleExportAbsensiExcel}
                >
                  ↓ Export Absensi
                </button>

                <button
                  className="logout-button"
                  onClick={handleLogoutAdmin}
                >
                  Logout
                </button>

              </div>

            </div>


            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      Nama
                    </th>

                    <th>
                      Jabatan
                    </th>

                    <th>
                      NIK / No. Telp
                    </th>

                    <th>
                      Ibu Kandung & Alamat
                    </th>

                    <th>
                      Rekening Bank
                    </th>

                    <th>
                      Email Gmail
                    </th>

                    <th>
                      Aksi
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loadingKaryawan ? (

                    <tr>

                      <td
                        colSpan={7}
                        className="empty-table"
                      >
                        Memuat data karyawan...
                      </td>

                    </tr>

                  ) : daftarKaryawan.length === 0 ? (

                    <tr>

                      <td
                        colSpan={7}
                        className="empty-table"
                      >
                        Belum ada data pendaftar.
                      </td>

                    </tr>

                  ) : (

                    daftarKaryawan.map((k) => (

                      <tr key={k.id}>

                        <td>
                          <strong>
                            {k.nama}
                          </strong>
                        </td>

                        <td>
                          {k.jabatan || '-'}
                        </td>

                        <td>
                          NIK:
                          {' '}
                          {k.nik_ktp || '-'}
                          <br />
                          Telp:
                          {' '}
                          {k.no_telp || '-'}
                        </td>

                        <td>
                          Ibu:
                          {' '}
                          {k.nama_ibu_kandung || '-'}
                          <br />
                          Alamat:
                          {' '}
                          {k.alamat_rumah || '-'}
                        </td>

                        <td>
                          {k.nama_rekening || '-'}
                          <br />
                          {k.no_rekening || '-'}
                        </td>

                        <td className="email-cell">
                          {k.email || '-'}
                        </td>

                        <td>

                          <button
                            className="delete-button"
                            onClick={() =>
                              handleHapusKaryawan(
                                k.id,
                                k.nama
                              )
                            }
                          >
                            Hapus
                          </button>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </section>


          {/* ==================================================
              MONITORING ABSENSI
          ================================================== */}

          <section
            className="data-section"
            id="monitoring-absensi"
          >

            <div className="data-header">

              <div>

                <h2>
                  📸 Live Monitoring Absensi & Selfie
                </h2>

                <p>
                  Monitoring kehadiran karyawan
                  secara realtime
                </p>

              </div>

              <button
                className="refresh-button"
                onClick={fetchAbsensi}
              >
                ↻ Refresh
              </button>

            </div>


            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      Foto
                    </th>

                    <th>
                      ID Karyawan
                    </th>

                    <th>
                      Nama Pegawai
                    </th>

                    <th>
                      Tanggal
                    </th>

                    <th>
                      Jam Masuk
                    </th>

                    <th>
                      Jam Pulang
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loadingAbsensi ? (

                    <tr>

                      <td
                        colSpan={7}
                        className="empty-table"
                      >
                        Memuat data absensi...
                      </td>

                    </tr>

                  ) : daftarAbsensi.length === 0 ? (

                    <tr>

                      <td
                        colSpan={7}
                        className="empty-table"
                      >
                        Belum ada data absensi hari ini.
                      </td>

                    </tr>

                  ) : (

                    daftarAbsensi.map(
                      (absen, idx) => (

                        <tr
                          key={
                            absen.id || idx
                          }
                        >

                          <td>

                            {absen.foto ? (

                              <img
                                src={absen.foto}
                                alt="Selfie karyawan"
                                className="selfie"
                              />

                            ) : (

                              <span className="no-photo">
                                Tanpa Foto
                              </span>

                            )}

                          </td>

                          <td>
                            {absen.id_karyawan || '-'}
                          </td>

                          <td>

                            <strong>
                              {absen.nama || '-'}
                            </strong>

                          </td>

                          <td>
                            {absen.tanggal || '-'}
                          </td>

                          <td className="time-in">
                            {absen.jam_masuk || '-'}
                          </td>

                          <td className="time-out">
                            {absen.jam_pulang ||
                              'Belum Pulang'}
                          </td>

                          <td>

                            <span className="status-badge">

                              {absen.status ||
                                'Hadir'}

                            </span>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}
