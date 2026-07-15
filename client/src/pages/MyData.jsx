import { useEffect, useState } from 'react';
import api from '../services/api';

function MyData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/me/student').then((res) => setData(res.data));
  }, []);

  if (!data) {
    return <p className="text-slate-500">Memuat data...</p>;
  }

  const statusColor = {
    HADIR: 'bg-green-50 text-green-700',
    IZIN: 'bg-yellow-50 text-yellow-700',
    SAKIT: 'bg-blue-50 text-blue-700',
    ALPA: 'bg-red-50 text-red-700',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Data Saya</h1>
      <p className="text-slate-500 mb-6">
        {data.user.name} — NIS {data.nis} — Kelas {data.class.name}
      </p>

      {/* ==== NILAI ==== */}
      <h2 className="text-lg font-semibold text-slate-700 mb-3">Nilai</h2>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Mata Pelajaran</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Jenis</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Semester</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Nilai</th>
            </tr>
          </thead>
          <tbody>
            {data.grades.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-4 text-center text-slate-400">
                  Belum ada data nilai
                </td>
              </tr>
            )}
            {data.grades.map((g) => (
              <tr key={g.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">{g.subject.name}</td>
                <td className="px-4 py-3">{g.type}</td>
                <td className="px-4 py-3 text-slate-500">{g.semester}</td>
                <td className="px-4 py-3 font-medium">{g.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==== ABSENSI ==== */}
      <h2 className="text-lg font-semibold text-slate-700 mb-3">Riwayat Absensi</h2>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Tanggal</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.attendances.length === 0 && (
              <tr>
                <td colSpan="2" className="px-4 py-4 text-center text-slate-400">
                  Belum ada data absensi
                </td>
              </tr>
            )}
            {data.attendances.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  {new Date(a.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[a.status]}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MyData;