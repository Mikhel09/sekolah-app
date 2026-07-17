import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';

function Topbar({ onToggleMobileSidebar }) {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <button
        onClick={onToggleMobileSidebar}
        className="text-slate-500 hover:text-slate-800 lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <NotificationBell />

        <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300">
            {user.photo ? (
              <img src={user.photo} alt="Foto profil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-600 text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-slate-700 text-sm hidden sm:inline">
            {user.name} <span className="text-slate-400">({user.role})</span>
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;