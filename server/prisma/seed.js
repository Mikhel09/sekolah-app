const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const class7A = await prisma.class.create({ data: { name: '7A' } });
  const class8B = await prisma.class.create({ data: { name: '8B' } });

  const matematika = await prisma.subject.create({ data: { name: 'Matematika' } });
  const bindo = await prisma.subject.create({ data: { name: 'Bahasa Indonesia' } });

  const teacherUser = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi@sekolah.com',
      password,
      role: 'TEACHER',
      teacher: { create: { nip: '198501012010011001' } },
    },
    include: { teacher: true },
  });

  await prisma.class.update({
    where: { id: class7A.id },
    data: { homeroomTeacherId: teacherUser.teacher.id },
  });

  const siswaData = [
    { name: 'Andi Pratama', nis: '2024001', classId: class7A.id },
    { name: 'Siti Aminah', nis: '2024002', classId: class7A.id },
    { name: 'Rizky Ramadhan', nis: '2024003', classId: class8B.id },
  ];

  for (const s of siswaData) {
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: `${s.nis}@siswa.sekolah.com`,
        password,
        role: 'STUDENT',
        student: { create: { nis: s.nis, classId: s.classId } },
      },
      include: { student: true },
    });

    await prisma.attendance.createMany({
      data: [
        { studentId: user.student.id, date: new Date('2026-07-01'), status: 'HADIR' },
        { studentId: user.student.id, date: new Date('2026-07-02'), status: 'HADIR' },
        { studentId: user.student.id, date: new Date('2026-07-03'), status: 'IZIN' },
      ],
    });

    await prisma.grade.createMany({
      data: [
        { studentId: user.student.id, subjectId: matematika.id, semester: 'Ganjil 2025/2026', type: 'UTS', score: 85 },
        { studentId: user.student.id, subjectId: bindo.id, semester: 'Ganjil 2025/2026', type: 'UTS', score: 90 },
      ],
    });
  }

  await prisma.schedule.create({
    data: {
      classId: class7A.id,
      subjectId: matematika.id,
      teacherId: teacherUser.teacher.id,
      day: 'Senin',
      startTime: '07:00',
      endTime: '08:30',
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Libur Semester',
      content: 'Libur semester dimulai tanggal 20 Juli 2026.',
    },
  });

  console.log('Data dummy berhasil dibuat!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());