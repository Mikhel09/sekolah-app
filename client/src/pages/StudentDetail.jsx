import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendances, setAttendances] = useState([]);

  useEffect(() => {
    api.get('/students').then((res) => {
      const found = res.data.find((s) => s.id === Number(id));
      setStudent(found);
    });
    api.get(`/students/${id}/grades`).then((res) => setGrades(res.data));
    api.get(`/students/${id}/attendances`).then((res) => setAttendances(res.data));
  }, [id]);

  if (!student) {
    return <p className="text-slate-500">Memuat data siswa...</p>;
  }

  const statusColor = {
    HADIR: 'bg-green-50 text-green-700',
    IZIN: 'bg-yellow-50 text-yellow-700',
    SAKIT: 'bg-blue-50 text-blue-700',
    ALPA: 'bg-red-50 text-red-700',
  };

  return (
    <div>
      <Link to="/students" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        ← Kembali ke Data Siswa
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">{student.user.name}</h1>
      <p className="text-slate-500 mb-6">
        NIS {student.nis} — Kelas {student.class.name}
      </p>

      <div className="grid grid-cols-2 gap-6">
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
                {grades.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-4 text-center text-slate-400">
                      Belum ada nilai
                    </td>
                  </tr>
                )}
                {grades.map((g) => (
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
                {attendances.length === 0 && (
                  <tr>
                    <td colSpan="2" className="px-4 py-4 text-center text-slate-400">
                      Belum ada absensi
                    </td>
                  </tr>
                )}
                {attendances.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      {new Date(a.date).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
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
      </div>
    </div>
  );
}

export default StudentDetail;