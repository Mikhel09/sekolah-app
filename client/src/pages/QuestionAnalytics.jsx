import { useEffect, useState } from 'react';
import api from '../services/api';

function QuestionAnalytics() {
  const [data, setData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    const params = filterSubject ? { subjectId: filterSubject } : {};
    api.get('/questions/analytics', { params }).then((res) => {
      setData(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [filterSubject]);

  useEffect(() => {
    api.get('/subjects').then((res) => setSubjects(res.data));
  }, []);

  // Pisahkan soal PG (diurutkan dari paling banyak salah) dan essay
  const soalPG = data
    .filter((d) => d.type === 'MULTIPLE_CHOICE')
    .sort((a, b) => a.persentaseBenar - b.persentaseBenar);

  const soalEssay = data.filter((d) => d.type === 'ESSAY');

  const getWarnaPersentase = (persen) => {
    if (persen < 50) return 'text-red-600 bg-red-50';
    if (persen < 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const inputClass = "border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Analisis Soal</h1>
      <p className="text-slate-500 mb-6">
        Lihat soal mana yang paling sering dijawab salah oleh siswa, untuk evaluasi pengajaran.
      </p>

      <select
        value={filterSubject}
        onChange={(e) => setFilterSubject(e.target.value)}
        className={inputClass + ' mb-6'}
      >
        <option value="">Semua mata pelajaran</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      {loading && <p className="text-slate-400">Memuat data...</p>}

      {!loading && (
        <>
          {/* Soal Pilihan Ganda */}
          <h2 className="text-lg font-semibold text-slate-700 mb-3">
            Soal Pilihan Ganda (diurutkan dari yang paling sering salah)
          </h2>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm mb-8">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Pertanyaan</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Mapel</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Kali Dijawab</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Benar</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">Salah</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600">% Benar</th>
                </tr>
              </thead>
              <tbody>
                {soalPG.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-center text-slate-400">
                      Belum ada data soal pilihan ganda yang sudah dikerjakan siswa
                    </td>
                  </tr>
                )}
                {soalPG.map((q) => (
                  <tr key={q.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">{q.questionText}</td>
                    <td className="px-4 py-3 text-slate-500">{q.subjectName}</td>
                    <td className="px-4 py-3 text-center">{q.totalDijawab}</td>
                    <td className="px-4 py-3 text-center text-green-600">{q.jumlahBenar}</td>
                    <td className="px-4 py-3 text-center text-red-600">{q.jumlahSalah}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getWarnaPersentase(q.persentaseBenar)}`}>
                        {q.persentaseBenar}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Soal Essay */}
          {soalEssay.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-slate-700 mb-3">Soal Essay (rata-rata nilai)</h2>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Pertanyaan</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Mapel</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Sudah Dinilai</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Rata-rata Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soalEssay.map((q) => (
                      <tr key={q.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">{q.questionText}</td>
                        <td className="px-4 py-3 text-slate-500">{q.subjectName}</td>
                        <td className="px-4 py-3 text-center">{q.totalDijawab}</td>
                        <td className="px-4 py-3 text-center font-semibold">{q.rataRataNilai}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default QuestionAnalytics;