import { useEffect, useState } from 'react';
import api from '../services/api';

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nip, setNip] = useState('');
  const [editingId, setEditingId] = useState(null);

  const loadTeachers = () => {
    api.get('/teachers').then((res) => setTeachers(res.data));
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setNip('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/teachers/${editingId}`, { name, email, nip });
    } else {
      await api.post('/teachers', { name, email, nip });
    }
    resetForm();
    loadTeachers();
  };

  const handleEditClick = (teacher) => {
    setEditingId(teacher.id);
    setName(teacher.user.name);
    setEmail(teacher.user.email);
    setNip(teacher.nip);
  };

  const handleDelete = async (id) => {
    const yakin = window.confirm('Yakin ingin menghapus guru ini?');
    if (!yakin) return;
    await api.delete(`/teachers/${id}`);
    loadTeachers();
  };

  const inputClass = "border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Data Guru</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <input
          placeholder="Nama guru"
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
        <input
          placeholder="NIP"
          value={nip}
          onChange={(e) => setNip(e.target.value)}
          className={inputClass}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {editingId ? 'Simpan Perubahan' : 'Tambah Guru'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            Batal
          </button>
        )}
      </form>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Nama</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">NIP</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">{t.user.name}</td>
                <td className="px-4 py-3">{t.nip}</td>
                <td className="px-4 py-3 text-slate-500">{t.user.email}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleEditClick(t)}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Teachers;