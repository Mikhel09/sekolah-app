
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, allowRoles } = require('./middlewares/auth');

const app = express();
const prisma = new PrismaClient();
const multer = require('multer');
const XLSX = require('xlsx');

// Multer akan menyimpan file sementara di memory (tidak ditulis ke disk), lalu kita baca langsung
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({
  origin: ['http://localhost:5173', 'https://sekolah-app-eta.vercel.app'],
}));
app.use(express.json({ limit: '5mb' }));

// ==========================================
// ENDPOINT TES
// ==========================================
app.get('/', (req, res) => {
  res.send('Server berjalan!');
});

// ==========================================
// ENDPOINT AUTH (LOGIN)
// TIDAK pakai verifyToken, karena ini untuk MENDAPATKAN token
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  const passwordCocok = await bcrypt.compare(password, user.password);
  if (!passwordCocok) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

// Ganti password milik user yang sedang login
app.put('/api/me/password', verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    // Ambil data user yang login (dari token, bukan dari input manual)
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

    // Cek dulu apakah password lama yang diketik benar
    const cocok = await bcrypt.compare(oldPassword, user.password);
    if (!cocok) {
      return res.status(400).json({ error: 'Password lama salah' });
    }

    // Validasi sederhana panjang password baru
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
    }

    // Enkripsi password baru, lalu simpan
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashed },
    });

    res.json({ message: 'Password berhasil diganti' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ambil profil lengkap user yang sedang login (termasuk foto)
app.get('/api/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true, photo: true },
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update foto profil milik user yang sedang login
app.put('/api/me/photo', verifyToken, async (req, res) => {
  const { photo } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: { photo },
      select: { id: true, name: true, email: true, role: true, photo: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// ==========================================
// ENDPOINT SISWA
// ==========================================

// Ambil semua siswa — semua yang login boleh lihat
app.get('/api/students', verifyToken, async (req, res) => {
  const students = await prisma.student.findMany({
    include: { user: true, class: true },
  });
  res.json(students);
});

// Ambil nilai siswa tertentu
app.get('/api/students/:id/grades', verifyToken, async (req, res) => {
  const grades = await prisma.grade.findMany({
    where: { studentId: Number(req.params.id) },
    include: { subject: true },
  });
  res.json(grades);
});

// Ambil absensi siswa tertentu
app.get('/api/students/:id/attendances', verifyToken, async (req, res) => {
  const data = await prisma.attendance.findMany({
    where: { studentId: Number(req.params.id) },
    orderBy: { date: 'desc' },
  });
  res.json(data);
});

// Tambah siswa baru — hanya ADMIN
app.post('/api/students', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const { name, nis, classId } = req.body;
  try {
    const password = await bcrypt.hash('password123', 10);
    const student = await prisma.user.create({
      data: {
        name,
        email: `${nis}@siswa.sekolah.com`,
        password,
        role: 'STUDENT',
        student: { create: { nis, classId: Number(classId) } },
      },
      include: { student: true },
    });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit siswa — hanya ADMIN
app.put('/api/students/:id', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);
  const { name, nis, classId } = req.body;
  try {
    const student = await prisma.student.findUnique({ where: { id } });

    await prisma.user.update({
      where: { id: student.userId },
      data: { name },
    });

    const updated = await prisma.student.update({
      where: { id },
      data: { nis, classId: Number(classId) },
      include: { user: true, class: true },
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==== ENDPOINT UJIAN (SISWA) ====

// Ambil daftar ujian yang tersedia untuk kelas siswa yang login
app.get('/api/me/exams', verifyToken, allowRoles('STUDENT'), async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (!student) {
      return res.status(404).json({ error: 'Data siswa tidak ditemukan' });
    }

    const exams = await prisma.exam.findMany({
      where: { classId: student.classId },
      include: {
        subject: true,
        results: { where: { studentId: student.id } }, // cek apakah siswa ini sudah pernah submit
      },
      orderBy: { createdAt: 'desc' },
    });

    // Tandai mana yang sudah dikerjakan
    const examsWithStatus = exams.map((e) => ({
      id: e.id,
      title: e.title,
      subject: e.subject,
      duration: e.duration,
      sudahDikerjakan: e.results.length > 0,
      skor: e.results.length > 0 ? e.results[0].score : null,
    }));

    res.json(examsWithStatus);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ambil soal-soal untuk mengerjakan ujian tertentu (TANPA kunci jawaban)
app.get('/api/exams/:id/take', verifyToken, allowRoles('STUDENT'), async (req, res) => {
  const id = Number(req.params.id);
  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        subject: true,
        examQuestions: { include: { question: true } },
      },
    });

    if (!exam) {
      return res.status(404).json({ error: 'Ujian tidak ditemukan' });
    }

    // BARU: Cek apakah sekarang masih dalam rentang waktu ujian
    const sekarang = new Date();
    if (exam.startTime && sekarang < exam.startTime) {
      return res.status(403).json({ error: 'Ujian belum dimulai' });
    }
    if (exam.endTime && sekarang > exam.endTime) {
      return res.status(403).json({ error: 'Waktu ujian sudah berakhir' });
    }

    const soal = exam.examQuestions.map((eq) => ({
      id: eq.question.id,
      questionText: eq.question.questionText,
      optionA: eq.question.optionA,
      optionB: eq.question.optionB,
      optionC: eq.question.optionC,
      optionD: eq.question.optionD,
    }));

    res.json({
      id: exam.id,
      title: exam.title,
      subject: exam.subject,
      duration: exam.duration,
      soal,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/exams', verifyToken, allowRoles('ADMIN', 'TEACHER'), async (req, res) => {
  const { title, subjectId, classId, duration, questionIds, startTime, endTime } = req.body;

  try {
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.userId } });
    if (!teacher) {
      return res.status(400).json({ error: 'Hanya guru yang bisa membuat ujian' });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        subjectId: Number(subjectId),
        classId: Number(classId),
        teacherId: teacher.id,
        duration: Number(duration),
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        examQuestions: {
          create: questionIds.map((qId) => ({ questionId: Number(qId) })),
        },
      },
    });

    res.json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Submit jawaban ujian, nilai otomatis dihitung
app.post('/api/exams/:id/submit', verifyToken, allowRoles('STUDENT'), async (req, res) => {
  const examId = Number(req.params.id);
  const { answers } = req.body; // format: { "1": "A", "2": "C", "5": "B" }

  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (!student) {
      return res.status(404).json({ error: 'Data siswa tidak ditemukan' });
    }

    const examCheck = await prisma.exam.findUnique({ where: { id: examId } });
    const sekarang = new Date();
    if (examCheck.endTime && sekarang > examCheck.endTime) {
      return res.status(403).json({ error: 'Waktu ujian sudah berakhir, jawaban tidak bisa dikirim' });
    }

    // Cek apakah siswa ini sudah pernah submit ujian ini
    const sudahAda = await prisma.examResult.findUnique({
      where: { examId_studentId: { examId, studentId: student.id } },
    });
    if (sudahAda) {
      return res.status(400).json({ error: 'Kamu sudah mengerjakan ujian ini sebelumnya' });
    }

    // Ambil soal-soal ujian ini beserta kunci jawabannya (di server, aman)
    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId },
      include: { question: true },
    });

    // Hitung skor: jumlah benar / total soal * 100
    let jumlahBenar = 0;
    examQuestions.forEach((eq) => {
      const jawabanSiswa = answers[eq.question.id];
      if (jawabanSiswa === eq.question.correctAnswer) {
        jumlahBenar++;
      }
    });
    const score = examQuestions.length > 0
      ? Math.round((jumlahBenar / examQuestions.length) * 100)
      : 0;

    const result = await prisma.examResult.create({
      data: {
        examId,
        studentId: student.id,
        score,
        answers: JSON.stringify(answers),
      },
    });

    res.json({ score, jumlahBenar, totalSoal: examQuestions.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Hapus siswa — hanya ADMIN
app.delete('/api/students/:id', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);
  try {
    const student = await prisma.student.findUnique({ where: { id } });

    await prisma.attendance.deleteMany({ where: { studentId: id } });
    await prisma.grade.deleteMany({ where: { studentId: id } });
    await prisma.student.delete({ where: { id } });
    await prisma.user.delete({ where: { id: student.userId } });

    res.json({ message: 'Siswa berhasil dihapus' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Ambil profil + nilai + absensi milik siswa yang sedang login
app.get('/api/me/student', verifyToken, allowRoles('STUDENT'), async (req, res) => {
  try {
    // req.user.userId didapat otomatis dari token, BUKAN dari input manual
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: true,
        class: true,
        grades: { include: { subject: true } },
        attendances: { orderBy: { date: 'desc' } },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Data siswa tidak ditemukan' });
    }

    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ambil jadwal pelajaran milik kelas siswa yang sedang login
app.get('/api/me/student/schedule', verifyToken, allowRoles('STUDENT'), async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
    });

    if (!student) {
      return res.status(404).json({ error: 'Data siswa tidak ditemukan' });
    }

    const schedules = await prisma.schedule.findMany({
      where: { classId: student.classId },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
      orderBy: { day: 'asc' },
    });

    res.json(schedules);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/students/import', verifyToken, allowRoles('ADMIN'), upload.single('file'), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet); // ubah jadi array of object

    const hasil = { berhasil: 0, gagal: [] };

    for (const row of rows) {
      try {
        const { name, nis, className } = row;

        const kelas = await prisma.class.findFirst({ where: { name: String(className) } });
        if (!kelas) {
          hasil.gagal.push({ row, alasan: `Kelas "${className}" tidak ditemukan` });
          continue;
        }

        const password = await bcrypt.hash('password123', 10);
        await prisma.user.create({
          data: {
            name: String(name),
            email: `${nis}@siswa.sekolah.com`,
            password,
            role: 'STUDENT',
            student: { create: { nis: String(nis), classId: kelas.id } },
          },
        });

        hasil.berhasil++;
      } catch (err) {
        hasil.gagal.push({ row, alasan: err.message });
      }
    }

    res.json(hasil);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ambil daftar kelas yang diajar oleh guru yang sedang login
app.get('/api/me/teacher/classes', verifyToken, allowRoles('TEACHER'), async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: req.user.userId },
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Data guru tidak ditemukan' });
    }

    // Cari semua jadwal milik guru ini, untuk tahu kelas apa saja yang diajar
    const schedules = await prisma.schedule.findMany({
      where: { teacherId: teacher.id },
      include: {
        class: { include: { students: { include: { user: true } } } },
        subject: true,
      },
    });

    // Hilangkan kelas yang duplikat (kalau guru mengajar >1 mapel di kelas yang sama)
    const classesMap = {};
    schedules.forEach((s) => {
      classesMap[s.class.id] = s.class;
    });

    res.json({
      teacherId: teacher.id,
      classes: Object.values(classesMap),
      subjects: schedules.map((s) => s.subject).filter(
        (subj, index, arr) => arr.findIndex((x) => x.id === subj.id) === index
      ),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/teachers/import', verifyToken, allowRoles('ADMIN'), upload.single('file'), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const hasil = { berhasil: 0, gagal: [] };

    for (const row of rows) {
      try {
        const { name, email, nip } = row;
        const password = await bcrypt.hash('ganti123', 10);

        await prisma.user.create({
          data: {
            name: String(name),
            email: String(email),
            password,
            role: 'TEACHER',
            teacher: { create: { nip: String(nip) } },
          },
        });

        hasil.berhasil++;
      } catch (err) {
        hasil.gagal.push({ row, alasan: err.message });
      }
    }

    res.json(hasil);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Tambah nilai baru — ADMIN dan TEACHER
app.post('/api/grades', verifyToken, allowRoles('ADMIN', 'TEACHER'), async (req, res) => {
  const { studentId, subjectId, semester, type, score } = req.body;
  try {
    const grade = await prisma.grade.create({
      data: {
        studentId: Number(studentId),
        subjectId: Number(subjectId),
        semester,
        type,
        score: Number(score),
      },
    });
    res.json(grade);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// ==========================================
// ENDPOINT GURU
// ==========================================

// Ambil semua guru
app.get('/api/teachers', verifyToken, async (req, res) => {
  const teachers = await prisma.teacher.findMany({
    include: { user: true },
  });
  res.json(teachers);
});

// Tambah guru baru — hanya ADMIN
app.post('/api/teachers', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const { name, email, nip } = req.body;
  try {
    const password = await bcrypt.hash('ganti123', 10);
    const teacher = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: 'TEACHER',
        teacher: { create: { nip } },
      },
      include: { teacher: true },
    });
    res.json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit guru — hanya ADMIN
app.put('/api/teachers/:id', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, nip } = req.body;
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    await prisma.user.update({
      where: { id: teacher.userId },
      data: { name, email },
    });
    const updated = await prisma.teacher.update({
      where: { id },
      data: { nip },
      include: { user: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Hapus guru — hanya ADMIN
app.delete('/api/teachers/:id', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);
  await prisma.teacher.delete({ where: { id } });
  res.json({ message: 'Guru dihapus' });
});

// ==========================================
// ENDPOINT KELAS
// ==========================================

// Ambil semua kelas
app.get('/api/classes', verifyToken, async (req, res) => {
  const classes = await prisma.class.findMany({
    include: { students: true, homeroomTeacher: { include: { user: true } } },
  });
  res.json(classes);
});

// Tambah kelas baru — hanya ADMIN
app.post('/api/classes', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const { name, homeroomTeacherId } = req.body;
  try {
    const kelas = await prisma.class.create({
      data: {
        name,
        homeroomTeacherId: homeroomTeacherId ? Number(homeroomTeacherId) : null,
      },
    });
    res.json(kelas);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit kelas — hanya ADMIN
app.put('/api/classes/:id', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);
  const { name, homeroomTeacherId } = req.body;
  try {
    const updated = await prisma.class.update({
      where: { id },
      data: {
        name,
        homeroomTeacherId: homeroomTeacherId ? Number(homeroomTeacherId) : null,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Hapus kelas — hanya ADMIN
app.delete('/api/classes/:id', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.class.delete({ where: { id } });
    res.json({ message: 'Kelas berhasil dihapus' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ambil detail lengkap satu kelas: info, siswa, dan jadwal
app.get('/api/classes/:id', verifyToken, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const kelas = await prisma.class.findUnique({
      where: { id },
      include: {
        students: { include: { user: true } },
        homeroomTeacher: { include: { user: true } },
      },
    });

    if (!kelas) {
      return res.status(404).json({ error: 'Kelas tidak ditemukan' });
    }

    const schedules = await prisma.schedule.findMany({
      where: { classId: id },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
      orderBy: { day: 'asc' },
    });

    res.json({ ...kelas, schedules });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/classes/import', verifyToken, allowRoles('ADMIN'), upload.single('file'), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const hasil = { berhasil: 0, gagal: [] };

    for (const row of rows) {
      try {
        await prisma.class.create({ data: { name: String(row.name) } });
        hasil.berhasil++;
      } catch (err) {
        hasil.gagal.push({ row, alasan: err.message });
      }
    }

    res.json(hasil);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==== ENDPOINT MATA PELAJARAN ====

app.get('/api/subjects', verifyToken, async (req, res) => {
  const subjects = await prisma.subject.findMany();
  res.json(subjects);
});

app.post('/api/subjects', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const { name } = req.body;
  try {
    const subject = await prisma.subject.create({ data: { name } });
    res.json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/subjects/:id', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.subject.delete({ where: { id } });
    res.json({ message: 'Mata pelajaran dihapus' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/subjects/import', verifyToken, allowRoles('ADMIN'), upload.single('file'), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const hasil = { berhasil: 0, gagal: [] };

    for (const row of rows) {
      try {
        await prisma.subject.create({ data: { name: String(row.name) } });
        hasil.berhasil++;
      } catch (err) {
        hasil.gagal.push({ row, alasan: err.message });
      }
    }

    res.json(hasil);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==== ENDPOINT JADWAL ====

app.get('/api/schedules', verifyToken, async (req, res) => {
  const schedules = await prisma.schedule.findMany({
    include: {
      class: true,
      subject: true,
      teacher: { include: { user: true } },
    },
    orderBy: { day: 'asc' },
  });
  res.json(schedules);
});

app.post('/api/schedules', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const { classId, subjectId, teacherId, day, startTime, endTime } = req.body;
  try {
    const schedule = await prisma.schedule.create({
      data: {
        classId: Number(classId),
        subjectId: Number(subjectId),
        teacherId: Number(teacherId),
        day,
        startTime,
        endTime,
      },
    });
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/schedules/:id', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.schedule.delete({ where: { id } });
    res.json({ message: 'Jadwal dihapus' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/schedules/import', verifyToken, allowRoles('ADMIN'), upload.single('file'), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const hasil = { berhasil: 0, gagal: [] };

    for (const row of rows) {
      try {
        const { className, subjectName, teacherEmail, day, startTime, endTime } = row;

        const kelas = await prisma.class.findFirst({ where: { name: String(className) } });
        if (!kelas) {
          hasil.gagal.push({ row, alasan: `Kelas "${className}" tidak ditemukan` });
          continue;
        }

        const subject = await prisma.subject.findFirst({ where: { name: String(subjectName) } });
        if (!subject) {
          hasil.gagal.push({ row, alasan: `Mapel "${subjectName}" tidak ditemukan` });
          continue;
        }

        const teacherUser = await prisma.user.findUnique({
          where: { email: String(teacherEmail) },
          include: { teacher: true },
        });
        if (!teacherUser || !teacherUser.teacher) {
          hasil.gagal.push({ row, alasan: `Guru dengan email "${teacherEmail}" tidak ditemukan` });
          continue;
        }

        await prisma.schedule.create({
          data: {
            classId: kelas.id,
            subjectId: subject.id,
            teacherId: teacherUser.teacher.id,
            day: String(day),
            startTime: String(startTime),
            endTime: String(endTime),
          },
        });

        hasil.berhasil++;
      } catch (err) {
        hasil.gagal.push({ row, alasan: err.message });
      }
    }

    res.json(hasil);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==== ENDPOINT UJIAN (GURU/ADMIN) ====

// Ambil semua ujian
app.get('/api/exams', verifyToken, allowRoles('ADMIN', 'TEACHER'), async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        subject: true,
        class: true,
        teacher: { include: { user: true } },
        examQuestions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(exams);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Buat ujian baru (sekaligus pilih soal-soalnya)
app.post('/api/exams', verifyToken, allowRoles('ADMIN', 'TEACHER'), async (req, res) => {
  const { title, subjectId, classId, duration, questionIds } = req.body;
  // questionIds = array angka, contoh: [1, 2, 5, 8]

  try {
    // Cari data guru dari user yang sedang login
    const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.userId } });
    if (!teacher) {
      return res.status(400).json({ error: 'Hanya guru yang bisa membuat ujian' });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        subjectId: Number(subjectId),
        classId: Number(classId),
        teacherId: teacher.id,
        duration: Number(duration),
        examQuestions: {
          create: questionIds.map((qId) => ({ questionId: Number(qId) })),
        },
      },
    });

    res.json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Hapus ujian
app.delete('/api/exams/:id', verifyToken, allowRoles('ADMIN', 'TEACHER'), async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.examResult.deleteMany({ where: { examId: id } });
    await prisma.examQuestion.deleteMany({ where: { examId: id } });
    await prisma.exam.delete({ where: { id } });
    res.json({ message: 'Ujian dihapus' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Lihat hasil semua siswa untuk satu ujian
app.get('/api/exams/:id/results', verifyToken, allowRoles('ADMIN', 'TEACHER'), async (req, res) => {
  const id = Number(req.params.id);
  try {
    const results = await prisma.examResult.findMany({
      where: { examId: id },
      include: { student: { include: { user: true } } },
      orderBy: { score: 'desc' },
    });
    res.json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// ENDPOINT ABSENSI
// ==========================================

// Tambah absensi baru — ADMIN dan TEACHER
app.post('/api/attendances', verifyToken, allowRoles('ADMIN', 'TEACHER'), async (req, res) => {
  const { studentId, date, status } = req.body;
  try {
    const attendance = await prisma.attendance.create({
      data: { studentId: Number(studentId), date: new Date(date), status },
    });
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// ENDPOINT PENGUMUMAN
// ==========================================
// Tambah pengumuman baru — hanya ADMIN
app.post('/api/announcements', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const { title, content } = req.body;
  try {
    const announcement = await prisma.announcement.create({
      data: { title, content },
    });
    res.json(announcement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Hapus pengumuman — hanya ADMIN
app.delete('/api/announcements/:id', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.announcement.delete({ where: { id } });
    res.json({ message: 'Pengumuman dihapus' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ambil data ringkasan untuk dashboard — hanya ADMIN
app.get('/api/dashboard/stats', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  try {
    // Hitung total masing-masing
    const totalStudents = await prisma.student.count();
    const totalTeachers = await prisma.teacher.count();
    const totalClasses = await prisma.class.count();

    // Jumlah siswa per kelas (untuk grafik batang)
    const classes = await prisma.class.findMany({
      include: { students: true },
    });
    const studentsPerClass = classes.map((c) => ({
      name: c.name,
      jumlah: c.students.length,
    }));

    // Distribusi status absensi (untuk grafik lingkaran)
    const attendanceGrouped = await prisma.attendance.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const attendanceDistribution = attendanceGrouped.map((a) => ({
      name: a.status,
      value: a._count.status,
    }));

    // Rata-rata nilai per mata pelajaran (untuk grafik batang baru)
    const gradesGrouped = await prisma.grade.groupBy({
      by: ['subjectId'],
      _avg: { score: true },
    });

    // groupBy cuma kasih subjectId (angka), jadi kita perlu "tempelkan" nama mapelnya
    const allSubjects = await prisma.subject.findMany();
    const averageScorePerSubject = gradesGrouped.map((g) => {
      const subject = allSubjects.find((s) => s.id === g.subjectId);
      return {
        name: subject ? subject.name : 'Tidak diketahui',
        rataRata: Math.round((g._avg.score || 0) * 10) / 10, // dibulatkan 1 angka desimal
      };
    });

    // ==== ENDPOINT BANK SOAL ====

// Ambil soal, bisa difilter berdasarkan mapel
app.get('/api/questions', verifyToken, allowRoles('ADMIN', 'TEACHER'), async (req, res) => {
  const { subjectId } = req.query;
  try {
    const where = subjectId ? { subjectId: Number(subjectId) } : {};
    const questions = await prisma.question.findMany({
      where,
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(questions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Tambah soal baru
app.post('/api/questions', verifyToken, allowRoles('ADMIN', 'TEACHER'), async (req, res) => {
  const { subjectId, questionText, optionA, optionB, optionC, optionD, correctAnswer } = req.body;
  try {
    const question = await prisma.question.create({
      data: {
        subjectId: Number(subjectId),
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
      },
    });
    res.json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/questions/import', verifyToken, allowRoles('ADMIN', 'TEACHER'), upload.single('file'), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const hasil = { berhasil: 0, gagal: [] };

    for (const row of rows) {
      try {
        const { subjectName, questionText, optionA, optionB, optionC, optionD, correctAnswer } = row;

        const subject = await prisma.subject.findFirst({ where: { name: String(subjectName) } });
        if (!subject) {
          hasil.gagal.push({ row, alasan: `Mapel "${subjectName}" tidak ditemukan` });
          continue;
        }

        await prisma.question.create({
          data: {
            subjectId: subject.id,
            questionText: String(questionText),
            optionA: String(optionA),
            optionB: String(optionB),
            optionC: String(optionC),
            optionD: String(optionD),
            correctAnswer: String(correctAnswer).toUpperCase(),
          },
        });

        hasil.berhasil++;
      } catch (err) {
        hasil.gagal.push({ row, alasan: err.message });
      }
    }

    res.json(hasil);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Hapus soal
app.delete('/api/questions/:id', verifyToken, allowRoles('ADMIN', 'TEACHER'), async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.question.delete({ where: { id } });
    res.json({ message: 'Soal dihapus' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

    res.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      studentsPerClass,
      attendanceDistribution,
      averageScorePerSubject,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Laporan absensi bulanan per kelas — ADMIN dan TEACHER
app.get('/api/reports/attendance', verifyToken, allowRoles('ADMIN', 'TEACHER'), async (req, res) => {
  const { classId, month, year } = req.query;

  if (!classId || !month || !year) {
    return res.status(400).json({ error: 'classId, month, dan year wajib diisi' });
  }

  try {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const students = await prisma.student.findMany({
      where: { classId: Number(classId) },
      include: {
        user: true,
        attendances: {
          where: { date: { gte: startDate, lte: endDate } },
        },
      },
    });

    const laporan = students.map((s) => {
      const hitung = { HADIR: 0, IZIN: 0, SAKIT: 0, ALPA: 0 };
      s.attendances.forEach((a) => {
        hitung[a.status] = (hitung[a.status] || 0) + 1;
      });
      const totalTercatat = s.attendances.length;
      const persentaseHadir = totalTercatat > 0
        ? Math.round((hitung.HADIR / totalTercatat) * 100)
        : 0;

      return {
        nama: s.user.name,
        nis: s.nis,
        hadir: hitung.HADIR,
        izin: hitung.IZIN,
        sakit: hitung.SAKIT,
        alpa: hitung.ALPA,
        persentaseHadir,
      };
    });

    res.json(laporan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Perbandingan rata-rata nilai antar kelas — hanya ADMIN
app.get('/api/reports/class-comparison', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        students: {
          include: { grades: true },
        },
      },
    });

    const comparison = classes.map((c) => {
      const allScores = c.students.flatMap((s) => s.grades.map((g) => g.score));
      const rataRata = allScores.length > 0
        ? Math.round((allScores.reduce((sum, s) => sum + s, 0) / allScores.length) * 10) / 10
        : 0;

      return {
        name: c.name,
        rataRata,
        jumlahSiswa: c.students.length,
      };
    });

    res.json(comparison);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// JALANKAN SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});