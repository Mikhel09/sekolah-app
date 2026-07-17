import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function ChildDetail() {
  const { studentId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/me/children/${studentId}`).then((res) => setData(res.data));
  }, [studentId]);

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
      <Link to="/my-children" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        ← Kembali ke Anak Saya
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">{data.user.name}</h1>
      <p className="text-slate-500 mb-6">
        NIS {data.nis} — Kelas {data.class.name}
      </p>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Nilai */}
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Nilai</h2>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Mapel</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Jenis</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {data.grades.length === 0 && (
                  <tr><td colSpan="3" className="px-4 py-4 text-center text-slate-400">Belum ada nilai</td></tr>
                )}
                {data.grades.map((g) => (
                  <tr key={g.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">{g.subject.name}</td>
                    <td className="px-4 py-3">{g.type}</td>
                    <td className="px-4 py-3 font-medium">{g.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Absensi */}
        <div>
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
                  <tr><td colSpan="2" className="px-4 py-4 text-center text-slate-400">Belum ada absensi</td></tr>
                )}
                {data.attendances.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      {new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
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
      </div>

      {/* Jadwal */}
      <h2 className="text-lg font-semibold text-slate-700 mb-3">Jadwal Pelajaran</h2>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Hari</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Jam</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Mapel</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Guru</th>
            </tr>
          </thead>
          <tbody>
            {data.schedules.length === 0 && (
              <tr><td colSpan="4" className="px-4 py-4 text-center text-slate-400">Belum ada jadwal</td></tr>
            )}
            {data.schedules.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">{s.day}</td>
                <td className="px-4 py-3 text-slate-500">{s.startTime} - {s.endTime}</td>
                <td className="px-4 py-3">{s.subject.name}</td>
                <td className="px-4 py-3">{s.teacher.user.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ChildDetail;