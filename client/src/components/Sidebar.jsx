import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, School, BookOpen, CalendarDays,
  UserRoundCog, FileQuestion, ClipboardList, BarChart3, CalendarCheck,
  TrendingUp, Megaphone, ClipboardCheck, Baby, ChevronsLeft, ChevronsRight,
  History as HistoryIcon,
} from 'lucide-react';

// Konfigurasi menu: dikelompokkan per bagian, tiap item punya daftar role yang boleh lihat
const MENU_SECTIONS = [
  {
    label: 'Utama',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
      { to: '/announcements', label: 'Pengumuman', icon: Megaphone, roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] },
    ],
  },
  {
    label: 'Data Master',
    items: [
      { to: '/students', label: 'Data Siswa', icon: Users, roles: ['ADMIN', 'TEACHER'] },
      { to: '/teachers', label: 'Data Guru', icon: GraduationCap, roles: ['ADMIN'] },
      { to: '/classes', label: 'Data Kelas', icon: School, roles: ['ADMIN'] },
      { to: '/subjects', label: 'Mata Pelajaran', icon: BookOpen, roles: ['ADMIN'] },
      { to: '/schedules', label: 'Jadwal', icon: CalendarDays, roles: ['ADMIN'] },
      { to: '/parents', label: 'Orang Tua', icon: UserRoundCog, roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Ujian',
    items: [
      { to: '/questions', label: 'Bank Soal', icon: FileQuestion, roles: ['ADMIN', 'TEACHER'] },
      { to: '/exams', label: 'Ujian', icon: ClipboardList, roles: ['ADMIN', 'TEACHER'] },
      { to: '/question-analytics', label: 'Analisis Soal', icon: BarChart3, roles: ['ADMIN', 'TEACHER'] },
    ],
  },
  {
    label: 'Laporan',
    items: [
      { to: '/reports/attendance', label: 'Laporan Absensi', icon: CalendarCheck, roles: ['ADMIN', 'TEACHER'] },
      { to: '/reports/class-comparison', label: 'Perbandingan Kelas', icon: TrendingUp, roles: ['ADMIN'] },
      { to: '/import-history', label: 'Riwayat Import', icon: HistoryIcon, roles: ['ADMIN', 'TEACHER'] },
    ],
  },
  {
    label: 'Kelas Saya',
    items: [
      { to: '/my-classes', label: 'Kelas Saya', icon: School, roles: ['TEACHER'] },
    ],
  },
  {
    label: 'Untuk Saya',
    items: [
      { to: '/my-data', label: 'Data Saya', icon: Users, roles: ['STUDENT'] },
      { to: '/my-schedule', label: 'Jadwal Saya', icon: CalendarDays, roles: ['STUDENT'] },
      { to: '/my-exams', label: 'Ujian Saya', icon: ClipboardCheck, roles: ['STUDENT'] },
      { to: '/my-children', label: 'Anak Saya', icon: Baby, roles: ['PARENT'] },
    ],
  },
];

function Sidebar({ open, onToggle, mobileOpen, onCloseMobile }) {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  if (!user) return null;

  const linkBaseClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors";
  const linkInactiveClass = "text-slate-300 hover:bg-slate-700/50 hover:text-white";
  const linkActiveClass = "bg-blue-600 text-white font-medium";

  return (
    <>
      {/* Backdrop untuk mobile, klik di luar sidebar untuk menutup */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 h-screen bg-slate-800 flex flex-col z-40
          transition-all duration-200 ease-in-out
          ${open ? 'w-64' : 'w-[72px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header sidebar: logo + tombol collapse */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-700 flex-shrink-0">
          {open && (
            <span className="text-white font-bold text-lg whitespace-nowrap overflow-hidden">
              Sistem Sekolah
            </span>
          )}
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white hidden lg:block flex-shrink-0"
            title={open ? 'Sembunyikan menu' : 'Tampilkan menu'}
          >
            {open ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
          </button>
        </div>

        {/* Menu, bisa di-scroll kalau kepanjangan */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-5">
          {MENU_SECTIONS.map((section) => {
            const visibleItems = section.items.filter((item) => item.roles.includes(user.role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.label}>
                {open && (
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                    {section.label}
                  </p>
                )}
                <div className="flex flex-col gap-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          `${linkBaseClass} ${isActive ? linkActiveClass : linkInactiveClass} ${!open ? 'justify-center' : ''}`
                        }
                        title={!open ? item.label : ''}
                      >
                        <Icon size={18} className="flex-shrink-0" />
                        {open && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;