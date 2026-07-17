import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const loadNotifications = () => {
    api.get('/notifications').then((res) => {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    });
  };

  useEffect(() => {
    loadNotifications();
    // Cek notifikasi baru setiap 30 detik
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Tutup dropdown kalau klik di luar area-nya
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await api.put(`/notifications/${notif.id}/read`);
      loadNotifications();
    }
    setOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    await api.put('/notifications/read-all');
    loadNotifications();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative text-slate-300 hover:text-white transition-colors"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center p-3 border-b border-slate-100">
            <p className="font-semibold text-slate-800 text-sm">Notifikasi</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <p className="text-slate-400 text-sm p-4 text-center">Belum ada notifikasi</p>
          )}

          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`w-full text-left p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${
                !n.isRead ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                {!n.isRead && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                )}
                <div className={!n.isRead ? '' : 'ml-4'}>
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(n.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;