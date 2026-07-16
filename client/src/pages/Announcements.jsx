import { useEffect, useState } from 'react';
import api from '../services/api';

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role === 'ADMIN';

  const loadAnnouncements = () => {
    api.get('/announcements').then((res) => setAnnouncements(res.data));
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/announcements', { title, content });
    setTitle('');
    setContent('');
    loadAnnouncements();
  };

  const handleDelete = async (id) => {
    const yakin = window.confirm('Yakin ingin menghapus pengumuman ini?');
    if (!yakin) return;
    await api.delete(`/announcements/${id}`);
    loadAnnouncements();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Pengumuman</h1>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm flex flex-col gap-3">
          <input
            placeholder="Judul pengumuman"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Isi pengumuman"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="self-start bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            Publikasikan
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {announcements.length === 0 && (
          <p className="text-slate-400">Belum ada pengumuman.</p>
        )}
        {announcements.map((a) => (
          <div key={a.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-slate-800">{a.title}</h3>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-red-600 hover:underline text-xs"
                >
                  Hapus
                </button>
              )}
            </div>
            <p className="text-slate-600 text-sm mt-1">{a.content}</p>
            <p className="text-slate-400 text-xs mt-2">
              {new Date(a.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Announcements;