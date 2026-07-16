import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Exams() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [duration, setDuration] = useState(30);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  const loadExams = () => {
    api.get('/exams').then((res) => setExams(res.data));
  };

  useEffect(() => {
    loadExams();
    api.get('/subjects').then((res) => setSubjects(res.data));
    api.get('/classes').then((res) => setClasses(res.data));
  }, []);

  useEffect(() => {
    if (subjectId) {
      api.get('/questions', { params: { subjectId } }).then((res) => setQuestions(res.data));
      setSelectedQuestionIds([]);
    } else {
      setQuestions([]);
    }
  }, [subjectId]);

  const toggleQuestion = (id) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) {
      alert('Pilih minimal 1 soal untuk ujian ini');
      return;
    }
    await api.post('/exams', {
      title, subjectId, classId, duration, questionIds: selectedQuestionIds, startTime, endTime,
    });
    setTitle('');
    setSubjectId('');
    setClassId('');
    setDuration(30);
    setSelectedQuestionIds([]);
    setStartTime('');
    setEndTime('');
    loadExams();
    };

  const handleDelete = async (id) => {
    const yakin = window.confirm('Yakin ingin menghapus ujian ini? Semua hasil siswa juga akan terhapus.');
    if (!yakin) return;
    await api.delete(`/exams/${id}`);
    loadExams();
  };

  const inputClass = "border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Ujian</h1>

      {/* Form Buat Ujian */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Judul ujian (contoh: Ulangan Harian Bab 1)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass + ' flex-1'}
            required
          />
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={inputClass} required>
            <option value="">Pilih mapel</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className={inputClass} required>
            <option value="">Pilih kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={inputClass + ' w-28'}
            placeholder="Durasi (menit)"
            min="1"
            required
          />
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={inputClass}
            title="Waktu mulai (opsional)"
          />
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={inputClass}
            title="Waktu berakhir (opsional)"
          />
        </div>

        {/* Pilih soal dari bank soal, sesuai mapel yang dipilih */}
        {subjectId && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Pilih soal ({selectedQuestionIds.length} dipilih):
            </p>
            {questions.length === 0 && (
              <p className="text-slate-400 text-sm">Belum ada soal untuk mapel ini. Tambah dulu di halaman Bank Soal.</p>
            )}
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto border border-slate-200 rounded-md p-3">
              {questions.map((q) => (
                <label key={q.id} className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedQuestionIds.includes(q.id)}
                    onChange={() => toggleQuestion(q.id)}
                    className="mt-1"
                  />
                  <span>{q.questionText}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="self-start bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          Buat Ujian
        </button>
      </form>

      {/* Daftar Ujian */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Judul</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Mapel</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Kelas</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Durasi</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Soal</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-slate-400">
                  Belum ada ujian
                </td>
              </tr>
            )}
            {exams.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">{e.title}</td>
                <td className="px-4 py-3">{e.subject.name}</td>
                <td className="px-4 py-3">{e.class.name}</td>
                <td className="px-4 py-3 text-slate-500">{e.duration} menit</td>
                <td className="px-4 py-3 text-slate-500">{e.examQuestions.length} soal</td>
                <td className="px-4 py-3">
                  <Link to={`/exams/${e.id}/results`} className="text-blue-600 hover:underline mr-3">
                    Lihat Hasil
                  </Link>
                  <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:underline">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Exams;