import { useEffect, useState } from 'react';
import api from '../services/api';

function Parents() {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [linkingParentId, setLinkingParentId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const loadParents = () => {
    api.get('/parents').then((res) => setParents(res.data));
  };

  useEffect(() => {
    loadParents();
    api.get('/students').then((res) => setStudents(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/parents', { name, email });
    setName('');
    setEmail('');
    loadParents();
  };

  const handleDelete = async (id) => {
    const yakin = window.confirm('Yakin ingin menghapus akun orang tua ini?');
    if (!yakin) return;
    await api.delete(`/parents/${id}`);
    loadParents();
  };

  const handleLink = async (parentId) => {
    if (!selectedStudentId) return;
    await api.post(`/parents/${parentId}/link-student`, { studentId: selectedStudentId });
    setLinkingParentId(null);
    setSelectedStudentId('');
    loadParents();
  };

  const handleUnlink = async (parentId, studentId) => {
    const yakin = window.confirm('Putuskan hubungan orang tua ini dari siswa tersebut?');
    if (!yakin) return;
    await api.delete(`/parents/${parentId}/link-student/${studentId}`);
    loadParents();
  };

  const inputClass = "border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Data Orang Tua</h1>

      {/* Form Tambah Akun Orang Tua */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <input
          placeholder="Nama orang tua"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          Tambah Akun Orang Tua
        </button>
      </form>
      <p className="text-xs text-slate-400 mb-6">
        Password default untuk akun baru: <span className="font-mono">ganti123</span>
      </p>

      {/* Daftar Orang Tua */}
      <div className="flex flex-col gap-4">
        {parents.length === 0 && (
          <p className="text-slate-400">Belum ada akun orang tua.</p>
        )}
        {parents.map((p) => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-slate-800">{p.user.name}</p>
                <p className="text-sm text-slate-500">{p.user.email}</p>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Hapus Akun
              </button>
            </div>

            {/* Daftar anak yang terhubung */}
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-500 mb-2">Anak yang terhubung:</p>
              {p.children.length === 0 && (
                <p className="text-sm text-slate-400">Belum ada anak yang dihubungkan.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {p.children.map((c) => (
                  <span
                    key={c.student.id}
                    className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md flex items-center gap-2"
                  >
                    {c.student.user.name} ({c.student.class.name})
                    <button
                      onClick={() => handleUnlink(p.id, c.student.id)}
                      className="text-blue-400 hover:text-red-600"
                      title="Putuskan hubungan"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Form hubungkan anak baru */}
            <div className="mt-3">
              {linkingParentId === p.id ? (
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Pilih siswa...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.user.name} — {s.class.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleLink(p.id)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-md"
                  >
                    Hubungkan
                  </button>
                  <button
                    onClick={() => { setLinkingParentId(null); setSelectedStudentId(''); }}
                    className="text-slate-500 text-sm hover:underline"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setLinkingParentId(p.id)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  + Hubungkan ke siswa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Parents;