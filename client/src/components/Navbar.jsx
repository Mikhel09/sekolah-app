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
        {user && user.role === 'TEACHER' && (
          <Link to="/my-classes" className={linkClass}>Kelas Saya</Link>
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
        {user && user.role === 'STUDENT' && (
          <Link to="/my-data" className={linkClass}>Data Saya</Link>
        )}
        {user && user.role === 'STUDENT' && (
          <Link to="/my-schedule" className={linkClass}>Jadwal Saya</Link>
        )}
        {user && (
          <Link to="/announcements" className={linkClass}>Pengumuman</Link>
        )}
      </div>
      

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/change-password" className="text-slate-300 text-sm hover:text-white">
              {user.name} <span className="text-slate-400">({user.role})</span>
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