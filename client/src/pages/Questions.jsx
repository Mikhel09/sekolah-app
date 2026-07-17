import { useEffect, useState } from 'react';
import api from '../services/api';
import ImportExcel from '../components/ImportExcel';

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterSubject, setFilterSubject] = useState('');

  const [subjectId, setSubjectId] = useState('');
  const [type, setType] = useState('MULTIPLE_CHOICE');
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');

  const loadQuestions = () => {
    const params = filterSubject ? { subjectId: filterSubject } : {};
    api.get('/questions', { params }).then((res) => setQuestions(res.data));
  };

  useEffect(() => {
    loadQuestions();
  }, [filterSubject]);

  useEffect(() => {
    api.get('/subjects').then((res) => setSubjects(res.data));
  }, []);

  const resetForm = () => {
    setSubjectId('');
    setType('MULTIPLE_CHOICE');
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('A');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/questions', {
      subjectId, type, questionText, optionA, optionB, optionC, optionD, correctAnswer,
    });
    resetForm();
    loadQuestions();
  };

  const handleDelete = async (id) => {
    const yakin = window.confirm('Yakin ingin menghapus soal ini?');
    if (!yakin) return;
    await api.delete(`/questions/${id}`);
    loadQuestions();
  };

  const inputClass = "w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Bank Soal</h1>

      <ImportExcel
        endpoint="/questions/import"
        onSuccess={loadQuestions}
        contohKolom="subjectName, questionText, optionA, optionB, optionC, optionD, correctAnswer"
      />

      {/* Form Tambah Soal */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm flex flex-col gap-3">
        <div className="flex gap-3">
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className={inputClass} required>
            <option value="">Pilih mata pelajaran</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Pilih tipe soal */}
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
            <option value="ESSAY">Essay</option>
          </select>
        </div>

        <textarea
          placeholder="Tulis pertanyaan..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className={inputClass}
          rows={2}
          required
        />

        {/* Pilihan jawaban HANYA muncul kalau tipe Pilihan Ganda */}
        {type === 'MULTIPLE_CHOICE' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-slate-500 w-6">A</span>
                <input value={optionA} onChange={(e) => setOptionA(e.target.value)} className={inputClass} required />
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-slate-500 w-6">B</span>
                <input value={optionB} onChange={(e) => setOptionB(e.target.value)} className={inputClass} required />
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-slate-500 w-6">C</span>
                <input value={optionC} onChange={(e) => setOptionC(e.target.value)} className={inputClass} required />
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-slate-500 w-6">D</span>
                <input value={optionD} onChange={(e) => setOptionD(e.target.value)} className={inputClass} required />
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <label className="text-sm font-medium text-slate-700">Jawaban Benar:</label>
              <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} className={inputClass + ' w-24'}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          </>
        )}

        {type === 'ESSAY' && (
          <p className="text-xs text-slate-400">
            Soal essay akan dinilai manual oleh guru setelah siswa submit jawaban.
          </p>
        )}

        <button
          type="submit"
          className="self-start bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          Tambah Soal
        </button>
      </form>

      <select
        value={filterSubject}
        onChange={(e) => setFilterSubject(e.target.value)}
        className={inputClass + ' mb-4'}
      >
        <option value="">Semua mata pelajaran</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <div className="flex flex-col gap-3">
        {questions.length === 0 && (
          <p className="text-slate-400">Belum ada soal.</p>
        )}
        {questions.map((q) => (
          <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex gap-2">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                    {q.subject.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    q.type === 'ESSAY' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {q.type === 'ESSAY' ? 'Essay' : 'Pilihan Ganda'}
                  </span>
                </div>
                <p className="font-medium text-slate-800 mt-2">{q.questionText}</p>
                {q.type === 'MULTIPLE_CHOICE' && (
                  <ul className="text-sm text-slate-600 mt-2 space-y-1">
                    <li className={q.correctAnswer === 'A' ? 'text-green-600 font-medium' : ''}>A. {q.optionA}</li>
                    <li className={q.correctAnswer === 'B' ? 'text-green-600 font-medium' : ''}>B. {q.optionB}</li>
                    <li className={q.correctAnswer === 'C' ? 'text-green-600 font-medium' : ''}>C. {q.optionC}</li>
                    <li className={q.correctAnswer === 'D' ? 'text-green-600 font-medium' : ''}>D. {q.optionD}</li>
                  </ul>
                )}
              </div>
              <button
                onClick={() => handleDelete(q.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Questions;