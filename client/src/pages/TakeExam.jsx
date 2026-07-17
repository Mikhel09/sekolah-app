import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasilAkhir, setHasilAkhir] = useState(null);
  const tabSwitchCount = useRef(0);

  useEffect(() => {
    api.get(`/exams/${id}/take`)
      .then((res) => {
        const soalDiacak = shuffleArray(res.data.soal).map((q) => ({
          ...q,
          opsiDiacak: q.type === 'MULTIPLE_CHOICE'
            ? shuffleArray([
                { letter: 'A', text: q.optionA },
                { letter: 'B', text: q.optionB },
                { letter: 'C', text: q.optionC },
                { letter: 'D', text: q.optionD },
              ])
            : null,
        }));
        setExam({ ...res.data, soal: soalDiacak });
        setTimeLeft(res.data.duration * 60);
      })
      .catch((err) => {
        alert(err.response?.data?.error || 'Gagal memuat ujian');
        navigate('/my-exams');
      });
  }, [id]);

  // BARU: Deteksi kalau siswa pindah tab/aplikasi lain
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !hasilAkhir) {
        tabSwitchCount.current += 1;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasilAkhir]);

  const handleSubmit = useCallback(async () => {
    if (submitting || hasilAkhir) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/exams/${id}/submit`, {
        answers,
        tabSwitchCount: tabSwitchCount.current,
      });
      setHasilAkhir(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal submit ujian');
    } finally {
      setSubmitting(false);
    }
  }, [id, answers, submitting, hasilAkhir]);

  useEffect(() => {
    if (timeLeft === null || hasilAkhir) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, hasilAkhir, handleSubmit]);

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  if (!exam) {
    return <p className="text-slate-500">Memuat ujian...</p>;
  }

  if (hasilAkhir) {
    return (
      <div className="max-w-md mx-auto text-center bg-white border border-slate-200 rounded-lg p-8 shadow-sm mt-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Ujian Selesai!</h1>
        <p className="text-slate-500 mb-4">{exam.title}</p>

        {hasilAkhir.adaEssayBelumDinilai ? (
          <>
            <p className="text-lg font-semibold text-yellow-600 mb-2">Menunggu Penilaian Guru</p>
            <p className="text-slate-500 mb-6 text-sm">
              Ujian ini mengandung soal essay. Skor akhir akan muncul setelah guru menilai jawabanmu.
              Skor sementara (dari soal pilihan ganda): <span className="font-semibold">{hasilAkhir.score}</span>
            </p>
          </>
        ) : (
          <>
            <p className="text-5xl font-bold text-blue-600 mb-2">{hasilAkhir.score}</p>
            <p className="text-slate-500 mb-6">
              Benar {hasilAkhir.jumlahBenar} dari {hasilAkhir.totalSoal} soal
            </p>
          </>
        )}

        <button
          onClick={() => navigate('/my-exams')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-colors"
        >
          Kembali ke Daftar Ujian
        </button>
      </div>
    );
  }

  const menit = Math.floor(timeLeft / 60);
  const detik = timeLeft % 60;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6 bg-white border border-slate-200 rounded-lg p-4 shadow-sm sticky top-0">
        <div>
          <h1 className="font-bold text-slate-800">{exam.title}</h1>
          <p className="text-sm text-slate-500">{exam.subject.name}</p>
        </div>
        <div className={`text-lg font-bold px-4 py-2 rounded-md ${timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
          {menit}:{detik.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {exam.soal.map((q, index) => (
          <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <p className="font-medium text-slate-800 mb-3">
              {index + 1}. {q.questionText}
            </p>

            {q.type === 'MULTIPLE_CHOICE' ? (
              <div className="flex flex-col gap-2">
                {q.opsiDiacak.map((opsi) => (
                  <label
                    key={opsi.letter}
                    className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md border cursor-pointer ${
                      answers[q.id] === opsi.letter
                        ? 'bg-blue-50 border-blue-400'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      checked={answers[q.id] === opsi.letter}
                      onChange={() => handleAnswer(q.id, opsi.letter)}
                    />
                    {opsi.text}
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                placeholder="Tulis jawabanmu di sini..."
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswer(q.id, e.target.value)}
                rows={4}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-md transition-colors"
      >
        {submitting ? 'Mengirim...' : 'Kumpulkan Jawaban'}
      </button>
    </div>
  );
}

export default TakeExam;