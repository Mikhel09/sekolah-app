import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function GradeEssay() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [essayAnswers, setEssayAnswers] = useState([]);
  const [grades, setGrades] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/exam-results/${resultId}/essay-answers`).then((res) => {
      setEssayAnswers(res.data);
      // Isi nilai awal kalau sudah pernah dinilai sebelumnya
      const initialGrades = {};
      res.data.forEach((e) => {
        if (e.score !== null) initialGrades[e.questionId] = e.score;
      });
      setGrades(initialGrades);
    });
  }, [resultId]);

  const handleGradeChange = (questionId, value) => {
    setGrades((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/exam-results/${resultId}/grade-essay`, { grades });
      alert('Nilai berhasil disimpan');
      navigate(-1); // kembali ke halaman sebelumnya
    } catch (err) {
      alert('Gagal menyimpan nilai');
    } finally {
      setSubmitting(false);
    }
  };

  const semuaSudahDiisi = essayAnswers.every((e) => grades[e.questionId] !== undefined && grades[e.questionId] !== '');

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline text-sm mb-4">
        ← Kembali
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">Nilai Jawaban Essay</h1>

      <div className="flex flex-col gap-4 mb-6">
        {essayAnswers.length === 0 && (
          <p className="text-slate-400">Tidak ada jawaban essay untuk dinilai.</p>
        )}
        {essayAnswers.map((e) => (
          <div key={e.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <p className="font-medium text-slate-800 mb-2">{e.question.questionText}</p>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm text-slate-700 mb-3 whitespace-pre-wrap">
              {e.answerText || <span className="text-slate-400 italic">Tidak dijawab</span>}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Nilai (0-100):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={grades[e.questionId] ?? ''}
                onChange={(ev) => handleGradeChange(e.questionId, ev.target.value)}
                className="border border-slate-300 rounded-md px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ))}
      </div>

      {essayAnswers.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={!semuaSudahDiisi || submitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium px-6 py-2 rounded-md transition-colors"
        >
          {submitting ? 'Menyimpan...' : 'Simpan Nilai & Finalisasi Skor'}
        </button>
      )}
    </div>
  );
}

export default GradeEssay;