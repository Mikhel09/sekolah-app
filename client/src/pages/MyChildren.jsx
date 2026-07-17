import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function MyChildren() {
  const [children, setChildren] = useState([]);

  useEffect(() => {
    api.get('/me/children').then((res) => setChildren(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Anak Saya</h1>

      <div className="flex flex-col gap-3">
        {children.length === 0 && (
          <p className="text-slate-400">
            Belum ada data anak yang terhubung ke akun kamu. Hubungi admin sekolah untuk menghubungkan akun ini ke data anak kamu.
          </p>
        )}
        {children.map((c) => (
          <Link
            key={c.id}
            to={`/my-children/${c.id}`}
            className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex justify-between items-center hover:bg-slate-50 transition-colors"
          >
            <div>
              <p className="font-semibold text-slate-800">{c.name}</p>
              <p className="text-sm text-slate-500">NIS {c.nis} — Kelas {c.className}</p>
            </div>
            <span className="text-blue-600 text-sm">Lihat Detail →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MyChildren;