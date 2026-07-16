import ImportExcel from '../components/ImportExcel';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../services/api';

import Pagination from '../components/Pagination';

function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState('');
  const [nis, setNis] = useState('');
  const [classId, setClassId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Download rapor PDF satu siswa
  const handleDownloadRapor = async (student) => {
    const [gradesRes, attendancesRes] = await Promise.all([
      api.get(`/students/${student.id}/grades`),
      api.get(`/students/${student.id}/attendances`),
    ]);

    const grades = gradesRes.data;
    const attendances = attendancesRes.data;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Rapor Siswa', 14, 18);

    doc.setFontSize(11);
    doc.text(`Nama   : ${student.user.name}`, 14, 28);
    doc.text(`NIS    : ${student.nis}`, 14, 34);
    doc.text(`Kelas  : ${student.class.name}`, 14, 40);

    doc.setFontSize(13);
    doc.text('Nilai', 14, 52);
    autoTable(doc, {
      startY: 56,
      head: [['Mata Pelajaran', 'Jenis', 'Semester', 'Nilai']],
      body: grades.map((g) => [g.subject.name, g.type, g.semester, g.score]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });

    const finalYNilai = doc.lastAutoTable.finalY || 60;
    doc.setFontSize(13);
    doc.text('Riwayat Absensi', 14, finalYNilai + 10);
    autoTable(doc, {
      startY: finalYNilai + 14,
      head: [['Tanggal', 'Status']],
      body: attendances.map((a) => [
        new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        a.status,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`Rapor-${student.user.name}-${student.nis}.pdf`);
  };

  // Export tabel ke Excel
  const handleExportExcel = () => {
    const dataForExcel = filteredStudents.map((s) => ({
      Nama: s.user.name,
      NIS: s.nis,
      Kelas: s.class.name,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
    XLSX.writeFile(workbook, 'Data-Siswa.xlsx');
  };

  // Filter pencarian
  const filteredStudents = students.filter((s) => {
    const keyword = searchTerm.toLowerCase();
    return (
      s.user.name.toLowerCase().includes(keyword) ||
      s.nis.toLowerCase().includes(keyword) ||
      s.class.name.toLowerCase().includes(keyword)
    );
  });

  // Potong data sesuai halaman aktif
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const inputClass = "border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      {/* Judul + Tombol Export */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Data Siswa</h1>
        <button
          onClick={handleExportExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          Export ke Excel
        </button>
      </div>

      {/* Import dari Excel */}
      <ImportExcel
        endpoint="/students/import"
        onSuccess={loadStudents}
        contohKolom="name, nis, className"
      />

      {/* Form Tambah/Edit */}
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

      {/* Kotak Pencarian */}
      <input
        type="text"
        placeholder="Cari nama, NIS, atau kelas..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Tabel Siswa */}
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
            {paginatedStudents.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-4 text-center text-slate-400">
                  Tidak ada data ditemukan
                </td>
              </tr>
            )}
            {paginatedStudents.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/students/${s.id}`} className="text-slate-700 hover:text-blue-600 hover:underline">
                    {s.user.name}
                  </Link>
                </td>
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
                    className="text-red-600 hover:underline mr-3"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={() => handleDownloadRapor(s)}
                    className="text-green-600 hover:underline"
                  >
                    Rapor
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredStudents.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default Students;