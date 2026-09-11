import './DashboardAdmin.css';
import { useState, useEffect } from 'react';
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

export default function DashboardAdmin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [daftarKaryawan, setDaftarKaryawan] = useState<Karyawan[]>([]);
  const [daftarAbsensi, setDaftarAbsensi] = useState<any[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchKaryawan();
      fetchAbsensi();
    }
  }, [isLoggedIn]);

  const fetchKaryawan = async () => {
    const { data } = await supabase.from('karyawan').select('*').order('nama');
    if (data) setDaftarKaryawan(data);
  };

  const fetchAbsensi = async () => {
    const { data } = await supabase.from('absensi').select('*').order('created_at', { ascending: false });
    if (data) setDaftarAbsensi(data);
  };

  const handleLoginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser === 'admin' && adminPass === 'admin123') {
      setIsLoggedIn(true);
      return;
    }

    const { data: foundAdmin, error } = await supabase
      .from('karyawan')
      .select('*')
      .eq('email', adminUser)
      .eq('pin', adminPass)
      .single();

    if (foundAdmin && !error) {
      setIsLoggedIn(true);
    } else {
      alert('Login Admin gagal! Pastikan menggunakan Email Admin terdaftar dan PIN yang benar.');
    }
  };

  const handleHapusKaryawan = async (id: string, nama: string) => {
    if (window.confirm(`Yakin ingin menghapus akun "${nama}" dari database secara permanen?`)) {
      const { error } = await supabase.from('karyawan').delete().eq('id', id);
      if (error) alert('Gagal menghapus: ' + error.message);
      else {
        alert(`Akun ${nama} berhasil dihapus.`);
        fetchKaryawan();
      }
    }
  };

  const handleExportExcel = () => {
    let csv = "Nama;Jabatan;NIK KTP;Nama Ibu Kandung;No Telepon;Alamat;Nama Rekening;No Rekening;Email;Tempat/Tgl Lahir\n";
    daftarKaryawan.forEach(k => {
      csv += `"${k.nama}";"${k.jabatan}";"${k.nik_ktp || '-'}";"${k.nama_ibu_kandung || '-'}";"${k.no_telp || '-'}";"${k.alamat_rumah || '-'}";"${k.nama_rekening || '-'}";"${k.no_rekening || '-'}";"${k.email || '-'}";"${k.tempat_lahir || '-'}, ${k.tanggal_lahir || ''} ${k.bulan || ''} ${k.tahun_lahir || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Database_Lengkap_Karyawan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAbsensiExcel = () => {
    if (daftarAbsensi.length === 0) {
      alert("Belum ada data absensi untuk diexport.");
      return;
    }
    let csv = "ID Karyawan;Nama;Tanggal;Jam Masuk;Jam Pulang;Status\n";
    daftarAbsensi.forEach((a: any) => {
      csv += `"${a.id_karyawan || '-'}";"${a.nama}";"${a.tanggal}";"${a.jam_masuk || '-'}";"${a.jam_pulang || '-'}";"${a.status || 'Hadir'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Laporan_Absensi_Moonlight.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogoutAdmin = () => {
    setIsLoggedIn(false);
    setAdminUser('');
    setAdminPass('');
  };

  if (!isLoggedIn) {
    return (
  <div className="hris-app">

    {/* ================= SIDEBAR ================= */}
    <aside className="sidebar">

      <div className="logo-area">
        <div className="logo-text">Moonjustfine</div>
        <div className="logo-divider"></div>
        <span className="hris-text">HRIS</span>
      </div>

      <nav className="sidebar-menu">

        <button className="menu-item active">
          <span className="menu-icon">⌂</span>
          <span>Home</span>
        </button>

        <button className="menu-item">
          <span className="menu-icon">◎</span>
          <span>Employee profile</span>
        </button>

        <button className="menu-item">
          <span className="menu-icon">♙</span>
          <span>Employees</span>
          <span className="arrow">›</span>
        </button>

        <button className="menu-item">
          <span className="menu-icon">♧</span>
          <span>Recruitment</span>
          <span className="arrow">›</span>
        </button>

        <button className="menu-item">
          <span className="menu-icon">◷</span>
          <span>Time</span>
          <span className="arrow">›</span>
        </button>

        <button className="menu-item">
          <span className="menu-icon">▣</span>
          <span>Finance</span>
          <span className="arrow">›</span>
        </button>

        <button className="menu-item">
          <span className="menu-icon">▤</span>
          <span>Payroll</span>
          <span className="arrow">›</span>
        </button>

        <button className="menu-item">
          <span className="menu-icon">✓</span>
          <span>Productivity</span>
          <span className="arrow">›</span>
        </button>

        <button className="menu-item">
          <span className="menu-icon">▥</span>
          <span>Company</span>
          <span className="arrow">›</span>
        </button>

        <div className="sidebar-separator"></div>

        <button className="menu-item">
          <span className="menu-icon">◇</span>
          <span>Applications</span>
          <span className="arrow">›</span>
        </button>

        <button className="menu-item">
          <span className="menu-icon">♢</span>
          <span>Integrations</span>
          <span className="arrow">›</span>
        </button>

        <div className="sidebar-separator"></div>

        <button className="menu-item">
          <span className="menu-icon">⚙</span>
          <span>Settings</span>
        </button>

      </nav>

      <div className="company-id">
        <span>←</span>
        <span>Company ID : 70985</span>
      </div>

    </aside>


    {/* ================= MAIN ================= */}
    <main className="main-content">

      {/* TOPBAR */}
      <header className="topbar">

        <div className="topbar-left">
          <button className="mobile-menu">☰</button>
          <span className="top-title">HRIS</span>
          <span className="top-arrow">▼</span>
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
            <span className="notification-dot">0</span>
          </button>

          <button className="apps-button">
            •••
          </button>

          <div className="profile-area">
            <div className="profile-avatar">
              TK
            </div>

            <div className="profile-info">
              <strong>tirta kusuma</strong>
              <small>moonjustfine</small>
            </div>
          </div>

        </div>

      </header>


      {/* CONTENT */}
      <div className="dashboard-container">

        {/* ================= WELCOME ================= */}
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

              <button>
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
                <span>⌄</span>
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


        {/* ================= STATISTICS ================= */}
        <section className="stats-grid">

          {/* Employment */}
          <div className="dashboard-card">

            <div className="card-header">
              <span>Employment Status</span>
              <span className="info-icon">i</span>
              <span className="three-dot">⋮</span>
            </div>

            <div className="progress-wrapper">

              <div className="progress-bar">
                <div
                  className="progress-value"
                  style={{
                    width: daftarKaryawan.length > 0 ? '100%' : '0%'
                  }}
                />
              </div>

              <div className="progress-label">
                <span>0%</span>
                <span>100%</span>
              </div>

            </div>

            <div className="stat-total">
              <span>Total</span>
              <strong>{daftarKaryawan.length}</strong>
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
                {daftarKaryawan.length > 0 ? '100.0%' : '0%'}
              </span>
            </div>

            <div className="card-footer">
              Filter <span>⌄</span>
            </div>

          </div>


          {/* Length of Service */}
          <div className="dashboard-card">

            <div className="card-header">
              <span>Length of Service</span>
              <span className="info-icon">i</span>
              <span className="three-dot">⋮</span>
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
              Filter <span>⌄</span>
            </div>

          </div>


          {/* Job Level */}
          <div className="dashboard-card">

            <div className="card-header">
              <span>Job Level</span>
              <span className="info-icon">i</span>
              <span className="three-dot">⋮</span>
            </div>

            <div className="empty-chart">
              No matching data found
            </div>

            <div className="card-footer">
              Filter <span>⌄</span>
            </div>

          </div>


          {/* Gender */}
          <div className="dashboard-card">

            <div className="card-header">
              <span>Gender Diversity</span>
              <span className="info-icon">i</span>
              <span className="three-dot">⋮</span>
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

              <span>{daftarKaryawan.length}</span>

              <span>100.0%</span>
            </div>

            <div className="card-footer">
              Filter <span>⌄</span>
            </div>

          </div>

        </section>


        {/* ================= LOWER SECTION ================= */}
        <section className="lower-grid">

          {/* QUICK LINKS */}
          <div className="dashboard-card quick-links">

            <div className="section-title">
              Quick Links
            </div>

            <button>
              <span className="quick-icon">●</span>
              Employee profile
            </button>

            <button>
              <span className="quick-icon">♟</span>
              Add Employee
            </button>

            <button>
              <span className="quick-icon">▣</span>
              Attendance
            </button>

            <button>
              <span className="quick-icon">▤</span>
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

              {daftarKaryawan.length === 0
                ? 'No employee off today'
                : 'No employee off today'
              }

            </div>

          </div>

        </section>


        {/* ================= EMPLOYEE DATABASE ================= */}
        <section className="data-section">

          <div className="data-header">

            <div>
              <h2>
                Database Pendaftaran Pegawai
              </h2>

              <p>
                Seluruh data karyawan yang terdaftar pada sistem
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
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>NIK / No. Telp</th>
                  <th>Ibu Kandung & Alamat</th>
                  <th>Rekening Bank</th>
                  <th>Email Gmail</th>
                  <th>Aksi</th>
                </tr>

              </thead>

              <tbody>

                {daftarKaryawan.length === 0 ? (

                  <tr>
                    <td colSpan={7} className="empty-table">
                      Belum ada data pendaftar.
                    </td>
                  </tr>

                ) : (

                  daftarKaryawan.map(k => (

                    <tr key={k.id}>

                      <td>
                        <strong>{k.nama}</strong>
                      </td>

                      <td>
                        {k.jabatan}
                      </td>

                      <td>
                        NIK: {k.nik_ktp || '-'}
                        <br />
                        Telp: {k.no_telp || '-'}
                      </td>

                      <td>
                        Ibu: {k.nama_ibu_kandung || '-'}
                        <br />
                        Alamat: {k.alamat_rumah || '-'}
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
                            handleHapusKaryawan(k.id, k.nama)
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


        {/* ================= ABSENSI ================= */}
        <section className="data-section">

          <div className="data-header">

            <div>

              <h2>
                📸 Live Monitoring Absensi & Selfie
              </h2>

              <p>
                Monitoring kehadiran karyawan secara realtime
              </p>

            </div>

          </div>


          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>Foto</th>
                  <th>ID Karyawan</th>
                  <th>Nama Pegawai</th>
                  <th>Tanggal</th>
                  <th>Jam Masuk</th>
                  <th>Jam Pulang</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {daftarAbsensi.length === 0 ? (

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
                    (absen: any, idx: number) => (

                      <tr key={idx}>

                        <td>

                          {absen.foto ? (

                            <img
                              src={absen.foto}
                              alt="Selfie"
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
                            {absen.nama}
                          </strong>
                        </td>

                        <td>
                          {absen.tanggal}
                        </td>

                        <td className="time-in">
                          {absen.jam_masuk || '-'}
                        </td>

                        <td className="time-out">
                          {absen.jam_pulang || 'Belum Pulang'}
                        </td>

                        <td>

                          <span className="status-badge">
                            {absen.status || 'Hadir'}
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
