import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../services/api';
import ImportExcel from '../components/ImportExcel';
import Pagination from '../components/Pagination';

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const handleExportExcel = () => {
    const dataForExcel = filteredSubjects.map((s) => ({
      'Nama Mata Pelajaran': s.name,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mata Pelajaran');
    XLSX.writeFile(workbook, 'Mata-Pelajaran.xlsx');
  };

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Mata Pelajaran</h1>
        <button
          onClick={handleExportExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          Export ke Excel
        </button>
      </div>

      <ImportExcel
        endpoint="/subjects/import"
        onSuccess={loadSubjects}
        contohKolom="name"
      />

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

      <input
        type="text"
        placeholder="Cari mata pelajaran..."
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
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Nama Mata Pelajaran</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSubjects.length === 0 && (
              <tr>
                <td colSpan="2" className="px-4 py-4 text-center text-slate-400">
                  Tidak ada data ditemukan
                </td>
              </tr>
            )}
            {paginatedSubjects.map((s) => (
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

      <Pagination
        currentPage={currentPage}
        totalItems={filteredSubjects.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default Subjects;