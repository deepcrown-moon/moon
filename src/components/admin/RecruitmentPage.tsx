import './RecruitmentPage.css';
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../supabaseClient';

interface Candidate {
  id: string;
  nama_kandidat: string;
  email?: string;
  no_telp?: string;
  posisi: string;
  departemen?: string;
  status: 'Applied' | 'Interview' | 'Hired' | 'Screening' | 'Passed' | 'Rejected';
  tanggal_daftar?: string;
  tanggal_interview?: string;
  cv_url?: string;
  catatan?: string;
  created_at?: string;
}

interface CandidateForm {
  nama_kandidat: string;
  email: string;
  no_telp: string;
  posisi: string;
  departemen: string;
  status: 'Applied' | 'Interview' | 'Hired';
  tanggal_interview: string;
  catatan: string;
}

const initialForm: CandidateForm = {
  nama_kandidat: '',
  email: '',
  no_telp: '',
  posisi: '',
  departemen: '',
  status: 'Applied',
  tanggal_interview: '',
  catatan: '',
};

export default function RecruitmentPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<CandidateForm>(initialForm);

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] = useState('All');

  const [saving, setSaving] = useState(false);

  /*
   * =====================================================
   * LOAD DATA
   * =====================================================
   */

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('recruitment')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      console.error('Gagal mengambil data recruitment:', error);
      alert('Gagal mengambil data kandidat.');
    }

    if (data) {
      setCandidates(data as Candidate[]);
    }

    setLoading(false);
  };

  /*
   * =====================================================
   * OPEN ADD MODAL
   * =====================================================
   */

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  /*
   * =====================================================
   * OPEN EDIT MODAL
   * =====================================================
   */

  const handleOpenEdit = (candidate: Candidate) => {
    setEditingId(candidate.id);

    setForm({
      nama_kandidat: candidate.nama_kandidat || '',
      email: candidate.email || '',
      no_telp: candidate.no_telp || '',
      posisi: candidate.posisi || '',
      departemen: candidate.departemen || '',
      status:
        candidate.status === 'Interview' ||
        candidate.status === 'Hired'
          ? candidate.status
          : 'Applied',
      tanggal_interview: candidate.tanggal_interview || '',
      catatan: candidate.catatan || '',
    });

    setShowModal(true);
  };

  /*
   * =====================================================
   * CLOSE MODAL
   * =====================================================
   */

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
  };

  /*
   * =====================================================
   * FORM CHANGE
   * =====================================================
   */

  const handleChange = (
    field: keyof CandidateForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
   * =====================================================
   * SAVE CANDIDATE
   * =====================================================
   */

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.nama_kandidat.trim()) {
      alert('Nama kandidat wajib diisi.');
      return;
    }

    if (!form.posisi.trim()) {
      alert('Posisi yang dilamar wajib diisi.');
      return;
    }

    setSaving(true);

    const payload = {
      nama_kandidat: form.nama_kandidat.trim(),
      email: form.email.trim() || null,
      no_telp: form.no_telp.trim() || null,
      posisi: form.posisi.trim(),
      departemen: form.departemen.trim() || null,
      status: form.status,
      tanggal_interview:
        form.tanggal_interview || null,
      catatan: form.catatan.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await supabase
        .from('recruitment')
        .update(payload)
        .eq('id', editingId);

      if (error) {
        console.error(error);
        alert('Gagal mengedit kandidat.');
        setSaving(false);
        return;
      }

      alert('Data kandidat berhasil diperbarui.');
    } else {
      const { error } = await supabase
        .from('recruitment')
        .insert({
          ...payload,
          tanggal_daftar: new Date()
            .toISOString()
            .split('T')[0],
        });

      if (error) {
        console.error(error);
        alert('Gagal menambahkan kandidat.');
        setSaving(false);
        return;
      }

      alert('Kandidat berhasil ditambahkan.');
    }

    setSaving(false);
    handleCloseModal();
    fetchCandidates();
  };

  /*
   * =====================================================
   * DELETE
   * =====================================================
   */

  const handleDelete = async (
    id: string,
    nama: string
  ) => {
    const yakin = window.confirm(
      `Yakin ingin menghapus kandidat "${nama}"?`
    );

    if (!yakin) return;

    const { error } = await supabase
      .from('recruitment')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      alert('Gagal menghapus kandidat.');
      return;
    }

    alert('Kandidat berhasil dihapus.');

    fetchCandidates();
  };

  /*
   * =====================================================
   * QUICK STATUS UPDATE
   * =====================================================
   */

  const handleStatusChange = async (
    id: string,
    status: 'Applied' | 'Interview' | 'Hired'
  ) => {
    const { error } = await supabase
      .from('recruitment')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error(error);
      alert('Gagal mengubah status.');
      return;
    }

    fetchCandidates();
  };

  /*
   * =====================================================
   * FILTER DATA
   * =====================================================
   */

  const filteredCandidates = candidates.filter((candidate) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      candidate.nama_kandidat
        ?.toLowerCase()
        .includes(keyword) ||
      candidate.email
        ?.toLowerCase()
        .includes(keyword) ||
      candidate.posisi
        ?.toLowerCase()
        .includes(keyword);

    const matchesStatus =
      statusFilter === 'All' ||
      candidate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /*
   * =====================================================
   * STATISTICS
   * =====================================================
   */

  const totalCandidates = candidates.length;

  const totalApplied = candidates.filter(
    (c) => c.status === 'Applied'
  ).length;

  const totalInterview = candidates.filter(
    (c) => c.status === 'Interview'
  ).length;

  const totalHired = candidates.filter(
    (c) => c.status === 'Hired'
  ).length;

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div className="recruitment-page">

      {/* HEADER */}

      <div className="recruitment-header">

        <div>
          <h1>Recruitment</h1>

          <p>
            Kelola kandidat dan proses perekrutan
            karyawan Moonjustfine.
          </p>
        </div>

        <button
          className="add-candidate-button"
          onClick={handleOpenAdd}
        >
          + Tambah Kandidat
        </button>

      </div>


      {/* STATISTICS */}

      <div className="recruitment-stats">

        <div className="recruitment-stat-card">
          <span>Total Kandidat</span>
          <strong>{totalCandidates}</strong>
        </div>

        <div className="recruitment-stat-card">
          <span>Applied</span>
          <strong>{totalApplied}</strong>
        </div>

        <div className="recruitment-stat-card">
          <span>Interview</span>
          <strong>{totalInterview}</strong>
        </div>

        <div className="recruitment-stat-card">
          <span>Hired</span>
          <strong>{totalHired}</strong>
        </div>

      </div>


      {/* FILTER */}

      <div className="recruitment-toolbar">

        <input
          type="text"
          placeholder="Cari nama, email, atau posisi..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">Semua Status</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Hired">Hired</option>
        </select>

        <button
          className="refresh-recruitment-button"
          onClick={fetchCandidates}
        >
          ↻ Refresh
        </button>

      </div>


      {/* TABLE */}

      <div className="recruitment-table-card">

        <div className="recruitment-table-wrapper">

          <table className="recruitment-table">

            <thead>
              <tr>
                <th>Nama Kandidat</th>
                <th>Email / Telepon</th>
                <th>Posisi</th>
                <th>Departemen</th>
                <th>Tanggal Daftar</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan={7}
                    className="recruitment-empty"
                  >
                    Memuat data kandidat...
                  </td>
                </tr>

              ) : filteredCandidates.length === 0 ? (

                <tr>
                  <td
                    colSpan={7}
                    className="recruitment-empty"
                  >
                    Belum ada kandidat recruitment.
                  </td>
                </tr>

              ) : (

                filteredCandidates.map((candidate) => (

                  <tr key={candidate.id}>

                    <td>
                      <strong>
                        {candidate.nama_kandidat}
                      </strong>

                      {candidate.catatan && (
                        <small className="candidate-note">
                          {candidate.catatan}
                        </small>
                      )}
                    </td>

                    <td>
                      <div>
                        {candidate.email || '-'}
                      </div>

                      <small>
                        {candidate.no_telp || '-'}
                      </small>
                    </td>

                    <td>
                      {candidate.posisi}
                    </td>

                    <td>
                      {candidate.departemen || '-'}
                    </td>

                    <td>
                      {candidate.tanggal_daftar || '-'}
                    </td>

                    <td>

                      <select
                        className={`status-select status-${candidate.status.toLowerCase()}`}
                        value={
                          candidate.status === 'Applied' ||
                          candidate.status === 'Interview' ||
                          candidate.status === 'Hired'
                            ? candidate.status
                            : 'Applied'
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            candidate.id,
                            e.target.value as
                              | 'Applied'
                              | 'Interview'
                              | 'Hired'
                          )
                        }
                      >
                        <option value="Applied">
                          Applied
                        </option>

                        <option value="Interview">
                          Interview
                        </option>

                        <option value="Hired">
                          Hired
                        </option>
                      </select>

                    </td>

                    <td>

                      <div className="candidate-actions">

                        <button
                          className="edit-candidate-button"
                          onClick={() =>
                            handleOpenEdit(candidate)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-candidate-button"
                          onClick={() =>
                            handleDelete(
                              candidate.id,
                              candidate.nama_kandidat
                            )
                          }
                        >
                          Hapus
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* MODAL */}

      {showModal && (

        <div
          className="recruitment-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >

          <div className="recruitment-modal">

            <div className="recruitment-modal-header">

              <div>
                <h2>
                  {editingId
                    ? 'Edit Kandidat'
                    : 'Tambah Kandidat'}
                </h2>

                <p>
                  Isi informasi kandidat recruitment.
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={handleCloseModal}
              >
                ×
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="recruitment-form"
            >

              <label>
                Nama Kandidat *
              </label>

              <input
                type="text"
                value={form.nama_kandidat}
                onChange={(e) =>
                  handleChange(
                    'nama_kandidat',
                    e.target.value
                  )
                }
                placeholder="Contoh: Budi Santoso"
              />


              <div className="form-two-column">

                <div>
                  <label>Email</label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      handleChange(
                        'email',
                        e.target.value
                      )
                    }
                    placeholder="email@gmail.com"
                  />
                </div>

                <div>
                  <label>No. Telepon</label>

                  <input
                    type="text"
                    value={form.no_telp}
                    onChange={(e) =>
                      handleChange(
                        'no_telp',
                        e.target.value
                      )
                    }
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

              </div>


              <div className="form-two-column">

                <div>
                  <label>Posisi *</label>

                  <input
                    type="text"
                    value={form.posisi}
                    onChange={(e) =>
                      handleChange(
                        'posisi',
                        e.target.value
                      )
                    }
                    placeholder="Contoh: Marketing"
                  />
                </div>

                <div>
                  <label>Departemen</label>

                  <input
                    type="text"
                    value={form.departemen}
                    onChange={(e) =>
                      handleChange(
                        'departemen',
                        e.target.value
                      )
                    }
                    placeholder="Contoh: Marketing"
                  />
                </div>

              </div>


              <div className="form-two-column">

                <div>
                  <label>Status</label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      handleChange(
                        'status',
                        e.target.value
                      )
                    }
                  >
                    <option value="Applied">
                      Applied
                    </option>

                    <option value="Interview">
                      Interview
                    </option>

                    <option value="Hired">
                      Hired
                    </option>
                  </select>
                </div>

                <div>
                  <label>Tanggal Interview</label>

                  <input
                    type="date"
                    value={form.tanggal_interview}
                    onChange={(e) =>
                      handleChange(
                        'tanggal_interview',
                        e.target.value
                      )
                    }
                  />
                </div>

              </div>


              <label>Catatan</label>

              <textarea
                value={form.catatan}
                onChange={(e) =>
                  handleChange(
                    'catatan',
                    e.target.value
                  )
                }
                placeholder="Catatan kandidat..."
              />


              <div className="recruitment-modal-actions">

                <button
                  type="button"
                  className="cancel-modal-button"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="save-candidate-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Menyimpan...'
                    : editingId
                    ? 'Simpan Perubahan'
                    : 'Tambah Kandidat'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}
