require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, allowRoles } = require('./middlewares/auth');

const app = express();
const prisma = new PrismaClient();

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
  const { name } = req.body;
  try {
    const kelas = await prisma.class.create({ data: { name } });
    res.json(kelas);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit kelas — hanya ADMIN
app.put('/api/classes/:id', verifyToken, allowRoles('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  try {
    const updated = await prisma.class.update({
      where: { id },
      data: { name },
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

// ==========================================
// JALANKAN SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});