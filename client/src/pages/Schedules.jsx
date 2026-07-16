import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../services/api';
import ImportExcel from '../components/ImportExcel';
import Pagination from '../components/Pagination';

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [day, setDay] = useState('Senin');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadSchedules = () => {
    api.get('/schedules').then((res) => setSchedules(res.data));
  };

  useEffect(() => {
    loadSchedules();
    api.get('/classes').then((res) => setClasses(res.data));
    api.get('/subjects').then((res) => setSubjects(res.data));
    api.get('/teachers').then((res) => setTeachers(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/schedules', { classId, subjectId, teacherId, day, startTime, endTime });
    setClassId('');
    setSubjectId('');
    setTeacherId('');
    setStartTime('');
    setEndTime('');
    loadSchedules();
  };

  const handleDelete = async (id) => {
    const yakin = window.confirm('Yakin ingin menghapus jadwal ini?');
    if (!yakin) return;
    await api.delete(`/schedules/${id}`);
    loadSchedules();
  };

  const handleExportExcel = () => {
    const dataForExcel = filteredSchedules.map((s) => ({
      Hari: s.day,
      Jam: `${s.startTime} - ${s.endTime}`,
      Kelas: s.class.name,
      'Mata Pelajaran': s.subject.name,
      Guru: s.teacher.user.name,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadwal');
    XLSX.writeFile(workbook, 'Jadwal-Pelajaran.xlsx');
  };

  const filteredSchedules = schedules.filter((s) => {
    const keyword = searchTerm.toLowerCase();
    return (
      s.class.name.toLowerCase().includes(keyword) ||
      s.subject.name.toLowerCase().includes(keyword) ||
      s.teacher.user.name.toLowerCase().includes(keyword) ||
      s.day.toLowerCase().includes(keyword)
    );
  });

  const paginatedSchedules = filteredSchedules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const inputClass = "border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Jadwal Pelajaran</h1>
        <button
          onClick={handleExportExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          Export ke Excel
        </button>
      </div>

      <ImportExcel
        endpoint="/schedules/import"
        onSuccess={loadSchedules}
        contohKolom="className, subjectName, teacherEmail, day, startTime, endTime"
      />

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <select value={classId} onChange={(e) => setClassId(e.target.value)} className={inputClass} required>
          <option value="">Pilih kelas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={inputClass} required>
          <option value="">Pilih mapel</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={inputClass} required>
          <option value="">Pilih guru</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.user.name}</option>
          ))}
        </select>

        <select value={day} onChange={(e) => setDay(e.target.value)} className={inputClass}>
          {HARI.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className={inputClass}
          required
        />
        <span className="text-slate-400">-</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className={inputClass}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          Tambah Jadwal
        </button>
      </form>

      <input
        type="text"
        placeholder="Cari kelas, mapel, guru, atau hari..."
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
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Hari</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Jam</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Kelas</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Mapel</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Guru</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSchedules.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-slate-400">
                  Tidak ada data ditemukan
                </td>
              </tr>
            )}
            {paginatedSchedules.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">{s.day}</td>
                <td className="px-4 py-3 text-slate-500">{s.startTime} - {s.endTime}</td>
                <td className="px-4 py-3">{s.class.name}</td>
                <td className="px-4 py-3">{s.subject.name}</td>
                <td className="px-4 py-3">{s.teacher.user.name}</td>
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
        totalItems={filteredSchedules.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default Schedules;