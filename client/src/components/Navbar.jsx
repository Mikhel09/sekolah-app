import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const linkClass = "text-slate-200 hover:text-white transition-colors";

  return (
    <nav className="bg-slate-800 px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex gap-6 items-center">
        <span className="text-white font-bold text-lg mr-4">Sistem Sekolah</span>
        <Link to="/" className={linkClass}>Dashboard</Link>

        {user && (user.role === 'ADMIN' || user.role === 'TEACHER') && (
          <Link to="/students" className={linkClass}>Data Siswa</Link>
        )}
        {user && user.role === 'ADMIN' && (
          <Link to="/teachers" className={linkClass}>Data Guru</Link>
        )}
        {user && user.role === 'ADMIN' && (
          <Link to="/classes" className={linkClass}>Data Kelas</Link>
        )}
        {user && user.role === 'ADMIN' && (
          <Link to="/subjects" className={linkClass}>Mata Pelajaran</Link>
        )}
        {user && user.role === 'ADMIN' && (
          <Link to="/schedules" className={linkClass}>Jadwal</Link>
        )}
        {user && user.role === 'ADMIN' && (
          <Link to="/parents" className={linkClass}>Orang Tua</Link>
        )}
        {user && user.role === 'TEACHER' && (
          <Link to="/my-classes" className={linkClass}>Kelas Saya</Link>
        )}
        {user && (user.role === 'ADMIN' || user.role === 'TEACHER') && (
          <Link to="/questions" className={linkClass}>Bank Soal</Link>
        )}
        {user && (user.role === 'ADMIN' || user.role === 'TEACHER') && (
          <Link to="/exams" className={linkClass}>Ujian</Link>
        )}
        {user && (user.role === 'ADMIN' || user.role === 'TEACHER') && (
          <Link to="/reports/attendance" className={linkClass}>Laporan Absensi</Link>
        )}
        {user && user.role === 'ADMIN' && (
          <Link to="/reports/class-comparison" className={linkClass}>Perbandingan Kelas</Link>
        )}
        {user && user.role === 'STUDENT' && (
          <Link to="/my-data" className={linkClass}>Data Saya</Link>
        )}
        {user && user.role === 'STUDENT' && (
          <Link to="/my-schedule" className={linkClass}>Jadwal Saya</Link>
        )}
        {user && user.role === 'STUDENT' && (
          <Link to="/my-exams" className={linkClass}>Ujian Saya</Link>
        )}
        {user && user.role === 'PARENT' && (
          <Link to="/my-children" className={linkClass}>Anak Saya</Link>
        )}
        {user && (
          <Link to="/announcements" className={linkClass}>Pengumuman</Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-slate-600 overflow-hidden flex items-center justify-center border border-slate-500">
                {user.photo ? (
                  <img src={user.photo} alt="Foto profil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-slate-300 text-sm">
                {user.name} <span className="text-slate-400">({user.role})</span>
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className={linkClass}>Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;