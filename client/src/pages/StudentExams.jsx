import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function StudentExams() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    api.get('/me/exams').then((res) => setExams(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Ujian Saya</h1>

      <div className="flex flex-col gap-3">
        {exams.length === 0 && (
          <p className="text-slate-400">Belum ada ujian untuk kelasmu.</p>
        )}
        {exams.map((e) => (
          <div key={e.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-800">{e.title}</p>
              <p className="text-sm text-slate-500">{e.subject.name} — {e.duration} menit</p>
            </div>
            {e.sudahDikerjakan ? (
              <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-md text-sm font-medium">
                Selesai — Skor: {e.skor}
              </span>
            ) : (
              <Link
                to={`/exams/${e.id}/take`}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
              >
                Kerjakan
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentExams;