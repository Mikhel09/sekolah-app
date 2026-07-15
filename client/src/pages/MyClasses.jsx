import { useEffect, useState } from 'react';
import api from '../services/api';

function MyClasses() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  // Form absensi
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));

  // Form nilai
  const [gradeSubject, setGradeSubject] = useState('');
  const [gradeSemester, setGradeSemester] = useState('Ganjil 2025/2026');
  const [gradeType, setGradeType] = useState('TUGAS');

  useEffect(() => {
    api.get('/me/teacher/classes').then((res) => {
      setClasses(res.data.classes);
      setSubjects(res.data.subjects);
    });
  }, []);

  const handleAttendance = async (studentId, status) => {
    await api.post('/attendances', {
      studentId,
      date: attendanceDate,
      status,
    });
    alert('Absensi tersimpan');
  };

  const handleGradeSubmit = async (e, studentId) => {
    e.preventDefault();
    const form = e.target;
    const score = form.score.value;

    await api.post('/grades', {
      studentId,
      subjectId: gradeSubject,
      semester: gradeSemester,
      type: gradeType,
      score,
    });

    form.score.value = '';
    alert('Nilai tersimpan');
  };

  const inputClass = "border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Kelas Saya</h1>

      {/* Daftar kelas */}
      <div className="flex flex-wrap gap-3 mb-8">
        {classes.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedClass(c)}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              selectedClass?.id === c.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Kelas {c.name}
          </button>
        ))}
        {classes.length === 0 && (
          <p className="text-slate-400">Kamu belum terdaftar mengajar kelas manapun.</p>
        )}
      </div>

      {selectedClass && (
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            Siswa di Kelas {selectedClass.name}
          </h2>

          {/* Kontrol input nilai (berlaku untuk semua baris siswa di bawah) */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 shadow-sm flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Tanggal Absensi</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Mata Pelajaran (untuk nilai)</label>
              <select
                value={gradeSubject}
                onChange={(e) => setGradeSubject(e.target.value)}
                className={inputClass}
              >
                <option value="">Pilih mapel</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Jenis Nilai</label>
              <select
                value={gradeType}
                onChange={(e) => setGradeType(e.target.value)}
                className={inputClass}
              >
                <option value="TUGAS">Tugas</option>
                <option value="UTS">UTS</option>
                <option value="UAS">UAS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Semester</label>
              <input
                type="text"
                value={gradeSemester}
                onChange={(e) => setGradeSemester(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Daftar siswa */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Nama Siswa</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Absensi Hari Ini</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Input Nilai</th>
                </tr>
              </thead>
              <tbody>
                {selectedClass.students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 align-top">{s.user.name}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex gap-1 flex-wrap">
                        {['HADIR', 'IZIN', 'SAKIT', 'ALPA'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleAttendance(s.id, status)}
                            className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <form
                        onSubmit={(e) => handleGradeSubmit(e, s.id)}
                        className="flex gap-2 items-center"
                      >
                        <input
                          name="score"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Nilai"
                          className={`${inputClass} w-20`}
                          required
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md"
                        >
                          Simpan
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyClasses;