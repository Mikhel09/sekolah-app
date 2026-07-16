import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function ExamResults() {
  const { id } = useParams();
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.get(`/exams/${id}/results`).then((res) => setResults(res.data));
  }, [id]);

  const rataRata = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  return (
    <div>
      <Link to="/exams" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
        ← Kembali ke Daftar Ujian
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">Hasil Ujian</h1>
      <p className="text-slate-500 mb-6">
        {results.length} siswa mengerjakan — rata-rata skor: <span className="font-semibold">{rataRata}</span>
      </p>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Peringkat</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Nama Siswa</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Skor</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Waktu Submit</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-4 text-center text-slate-400">
                  Belum ada siswa yang mengerjakan
                </td>
              </tr>
            )}
            {results.map((r, i) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">#{i + 1}</td>
                <td className="px-4 py-3">{r.student.user.name}</td>
                <td className="px-4 py-3 font-semibold">{r.score}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(r.submittedAt).toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExamResults;