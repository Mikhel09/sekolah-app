import { useEffect, useState } from 'react';
import api from '../services/api';
import ImportExcel from '../components/ImportExcel';

function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState('');
  const [nis, setNis] = useState('');
  const [classId, setClassId] = useState('');
  const [editingId, setEditingId] = useState(null);

  const loadStudents = () => {
    api.get('/students').then((res) => setStudents(res.data));
  };

  useEffect(() => {
    loadStudents();
    api.get('/classes').then((res) => setClasses(res.data));
  }, []);

  const resetForm = () => {
    setName('');
    setNis('');
    setClassId('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/students/${editingId}`, { name, nis, classId });
    } else {
      await api.post('/students', { name, nis, classId });
    }
    resetForm();
    loadStudents();
  };

  const handleEditClick = (student) => {
    setEditingId(student.id);
    setName(student.user.name);
    setNis(student.nis);
    setClassId(student.classId);
  };

  const handleDelete = async (id) => {
    const yakin = window.confirm('Yakin ingin menghapus siswa ini?');
    if (!yakin) return;
    await api.delete(`/students/${id}`);
    loadStudents();
  };

  const inputClass = "border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Data Siswa</h1>
      <ImportExcel
        endpoint="/students/import"
        onSuccess={loadStudents}
        contohKolom="name, nis, className"
      />

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <input
          placeholder="Nama siswa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          required
        />
        <input
          placeholder="NIS"
          value={nis}
          onChange={(e) => setNis(e.target.value)}
          className={inputClass}
          required
        />
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className={inputClass}
          required
        >
          <option value="">Pilih kelas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {editingId ? 'Simpan Perubahan' : 'Tambah Siswa'}
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
              <th className="text-left px-4 py-3 font-semibold text-slate-600">NIS</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Kelas</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">{s.user.name}</td>
                <td className="px-4 py-3">{s.nis}</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                    {s.class.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleEditClick(s)}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
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

export default Students;