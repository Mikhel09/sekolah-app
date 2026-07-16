import { useEffect, useState } from 'react';
import api from '../services/api';

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');

  const loadSubjects = () => {
    api.get('/subjects').then((res) => setSubjects(res.data));
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/subjects', { name });
    setName('');
    loadSubjects();
  };

  const handleDelete = async (id) => {
    const yakin = window.confirm('Yakin ingin menghapus mata pelajaran ini?');
    if (!yakin) return;
    await api.delete(`/subjects/${id}`);
    loadSubjects();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Mata Pelajaran</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 flex gap-3 items-center shadow-sm">
        <input
          placeholder="Nama mata pelajaran"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          Tambah
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Nama Mata Pelajaran</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">
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

export default Subjects;