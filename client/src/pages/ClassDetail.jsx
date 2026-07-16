import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function ClassDetail() {
  const { id } = useParams();
  const [kelas, setKelas] = useState(null);

  useEffect(() => {
    api.get(`/classes/${id}`).then((res) => setKelas(res.data));
  }, [id]);

  if (!kelas) {
    return <p className="text-slate-500">Memuat data kelas...</p>;
  }

  return (
    <div>
      <Link to="/classes" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        ← Kembali ke Data Kelas
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">Kelas {kelas.name}</h1>
      <p className="text-slate-500 mb-6">
        Wali Kelas: {kelas.homeroomTeacher ? kelas.homeroomTeacher.user.name : 'Belum ditentukan'}
        {' — '}
        {kelas.students.length} siswa
      </p>

      <div className="grid grid-cols-2 gap-6">
        {/* Daftar Siswa */}
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Daftar Siswa</h2>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Nama</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">NIS</th>
                </tr>
              </thead>
              <tbody>
                {kelas.students.length === 0 && (
                  <tr>
                    <td colSpan="2" className="px-4 py-4 text-center text-slate-400">
                      Belum ada siswa di kelas ini
                    </td>
                  </tr>
                )}
                {kelas.students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">{s.user.name}</td>
                    <td className="px-4 py-3 text-slate-500">{s.nis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Jadwal Pelajaran */}
        <div>
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
                {kelas.schedules.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-center text-slate-400">
                      Belum ada jadwal untuk kelas ini
                    </td>
                  </tr>
                )}
                {kelas.schedules.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">{s.day}</td>
                    <td className="px-4 py-3 text-slate-500">{s.startTime}-{s.endTime}</td>
                    <td className="px-4 py-3">{s.subject.name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.teacher.user.name}</td>
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

export default ClassDetail;