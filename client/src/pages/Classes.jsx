import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../services/api';
import ImportExcel from '../components/ImportExcel';
import Pagination from '../components/Pagination';

function Classes() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState('');
  const [homeroomTeacherId, setHomeroomTeacherId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadClasses = () => {
    api.get('/classes').then((res) => setClasses(res.data));
  };

  useEffect(() => {
    loadClasses();
    api.get('/teachers').then((res) => setTeachers(res.data));
  }, []);

  const resetForm = () => {
    setName('');
    setHomeroomTeacherId('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/classes/${editingId}`, { name, homeroomTeacherId });
    } else {
      await api.post('/classes', { name, homeroomTeacherId });
    }
    resetForm();
    loadClasses();
  };

  const handleEditClick = (kelas) => {
    setEditingId(kelas.id);
    setName(kelas.name);
    setHomeroomTeacherId(kelas.homeroomTeacherId || '');
  };

  const handleDelete = async (id) => {
    const yakin = window.confirm('Yakin ingin menghapus kelas ini?');
    if (!yakin) return;
    await api.delete(`/classes/${id}`);
    loadClasses();
  };

  const handleExportExcel = () => {
    const dataForExcel = filteredClasses.map((c) => ({
      'Nama Kelas': c.name,
      'Wali Kelas': c.homeroomTeacher ? c.homeroomTeacher.user.name : '-',
      'Jumlah Siswa': c.students.length,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kelas');
    XLSX.writeFile(workbook, 'Data-Kelas.xlsx');
  };

  const filteredClasses = classes.filter((c) => {
    const keyword = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(keyword) ||
      (c.homeroomTeacher && c.homeroomTeacher.user.name.toLowerCase().includes(keyword))
    );
  });

  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const inputClass = "border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Data Kelas</h1>
        <button
          onClick={handleExportExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          Export ke Excel
        </button>
      </div>

      <ImportExcel
        endpoint="/classes/import"
        onSuccess={loadClasses}
        contohKolom="name"
      />

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <input
          placeholder="Nama kelas (contoh: 7A)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          required
        />
        <select
          value={homeroomTeacherId}
          onChange={(e) => setHomeroomTeacherId(e.target.value)}
          className={inputClass}
        >
          <option value="">Tanpa wali kelas</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.user.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {editingId ? 'Simpan Perubahan' : 'Tambah Kelas'}
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

      <input
        type="text"
        placeholder="Cari nama kelas atau wali kelas..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Nama Kelas</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Wali Kelas</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Jumlah Siswa</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClasses.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-4 text-center text-slate-400">
                  Tidak ada data ditemukan
                </td>
              </tr>
            )}
            {paginatedClasses.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    to={`/classes/${c.id}`}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-0.5 rounded text-xs font-medium"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {c.homeroomTeacher ? c.homeroomTeacher.user.name : '-'}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.students.length} siswa</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleEditClick(c)}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
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

      <Pagination
        currentPage={currentPage}
        totalItems={filteredClasses.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default Classes;