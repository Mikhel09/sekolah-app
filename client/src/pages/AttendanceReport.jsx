import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../services/api';

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function AttendanceReport() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/classes').then((res) => setClasses(res.data));
  }, []);

  const handleGenerate = async () => {
    if (!classId) return;
    setLoading(true);
    const res = await api.get('/reports/attendance', {
      params: { classId, month, year },
    });
    setLaporan(res.data);
    setLoading(false);
  };

  const handleExportExcel = () => {
    if (!laporan) return;
    const dataForExcel = laporan.map((l) => ({
      Nama: l.nama,
      NIS: l.nis,
      Hadir: l.hadir,
      Izin: l.izin,
      Sakit: l.sakit,
      Alpa: l.alpa,
      'Persentase Hadir': `${l.persentaseHadir}%`,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Absensi');
    const namaKelas = classes.find((c) => c.id === Number(classId))?.name || 'Kelas';
    XLSX.writeFile(workbook, `Laporan-Absensi-${namaKelas}-${BULAN[month - 1]}-${year}.xlsx`);
  };

  const inputClass = "border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Laporan Absensi Bulanan</h1>

      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Kelas</label>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className={inputClass}>
            <option value="">Pilih kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Bulan</label>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={inputClass}>
            {BULAN.map((b, i) => (
              <option key={i} value={i + 1}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Tahun</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={`${inputClass} w-24`}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!classId || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {loading ? 'Memuat...' : 'Tampilkan Laporan'}
        </button>

        {laporan && (
          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            Export ke Excel
          </button>
        )}
      </div>

      {laporan && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Nama</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">NIS</th>
                <th className="text-center px-4 py-3 font-semibold text-green-600">Hadir</th>
                <th className="text-center px-4 py-3 font-semibold text-yellow-600">Izin</th>
                <th className="text-center px-4 py-3 font-semibold text-blue-600">Sakit</th>
                <th className="text-center px-4 py-3 font-semibold text-red-600">Alpa</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">% Hadir</th>
              </tr>
            </thead>
            <tbody>
              {laporan.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-4 text-center text-slate-400">
                    Tidak ada siswa di kelas ini
                  </td>
                </tr>
              )}
              {laporan.map((l, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">{l.nama}</td>
                  <td className="px-4 py-3 text-slate-500">{l.nis}</td>
                  <td className="px-4 py-3 text-center">{l.hadir}</td>
                  <td className="px-4 py-3 text-center">{l.izin}</td>
                  <td className="px-4 py-3 text-center">{l.sakit}</td>
                  <td className="px-4 py-3 text-center">{l.alpa}</td>
                  <td className="px-4 py-3 text-center font-medium">
                    <span className={l.persentaseHadir >= 80 ? 'text-green-600' : 'text-red-600'}>
                      {l.persentaseHadir}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttendanceReport;