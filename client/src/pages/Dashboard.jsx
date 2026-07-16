import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

const WARNA_STATUS = {
  HADIR: '#22c55e',
  IZIN: '#eab308',
  SAKIT: '#3b82f6',
  ALPA: '#ef4444',
};

function Dashboard() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      api.get('/dashboard/stats').then((res) => setStats(res.data));
    }
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Dashboard</h1>
      <p className="text-slate-500 mb-6">
        Selamat datang, <span className="font-medium text-slate-700">{user?.name}</span>.
      </p>

      {user?.role !== 'ADMIN' && (
        <p className="text-slate-400">Statistik hanya tersedia untuk Admin.</p>
      )}

      {user?.role === 'ADMIN' && !stats && (
        <p className="text-slate-400">Memuat statistik...</p>
      )}

      {user?.role === 'ADMIN' && stats && (
        <div>
          {/* Kartu ringkasan */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <p className="text-slate-500 text-sm">Total Siswa</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalStudents}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <p className="text-slate-500 text-sm">Total Guru</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalTeachers}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <p className="text-slate-500 text-sm">Total Kelas</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalClasses}</p>
            </div>
          </div>

          {/* Grafik */}
          <div className="grid grid-cols-2 gap-6">
            {/* Grafik batang: siswa per kelas */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-4">Jumlah Siswa per Kelas</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.studentsPerClass}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="jumlah" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Grafik lingkaran: distribusi absensi */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-4">Distribusi Status Absensi</h3>
              {stats.attendanceDistribution.length === 0 ? (
                <p className="text-slate-400 text-sm">Belum ada data absensi</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.attendanceDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {stats.attendanceDistribution.map((entry, index) => (
                        <Cell key={index} fill={WARNA_STATUS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;