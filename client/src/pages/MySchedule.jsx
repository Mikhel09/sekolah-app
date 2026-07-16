import { useEffect, useState } from 'react';
import api from '../services/api';

function MySchedule() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    api.get('/me/student/schedule').then((res) => setSchedules(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Jadwal Pelajaran Saya</h1>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Hari</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Jam</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Mata Pelajaran</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Guru</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-4 text-center text-slate-400">
                  Belum ada jadwal untuk kelasmu
                </td>
              </tr>
            )}
            {schedules.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{s.day}</td>
                <td className="px-4 py-3 text-slate-500">{s.startTime} - {s.endTime}</td>
                <td className="px-4 py-3">{s.subject.name}</td>
                <td className="px-4 py-3 text-slate-600">{s.teacher.user.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MySchedule;