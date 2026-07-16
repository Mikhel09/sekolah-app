import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

function ClassComparison() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/reports/class-comparison').then((res) => setData(res.data));
  }, []);

  if (!data) {
    return <p className="text-slate-500">Memuat data...</p>;
  }

  // Urutkan dari rata-rata tertinggi ke terendah
  const sortedData = [...data].sort((a, b) => b.rataRata - a.rataRata);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Perbandingan Performa Antar Kelas</h1>

      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm mb-6">
        <h3 className="font-semibold text-slate-700 mb-4">Rata-rata Nilai per Kelas</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="rataRata" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Peringkat</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Kelas</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Jumlah Siswa</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Rata-rata Nilai</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((c, i) => (
              <tr key={c.name} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-500">#{i + 1}</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                    {c.name}
                  </span>
                </td>
                <td className="px-4 py-3">{c.jumlahSiswa} siswa</td>
                <td className="px-4 py-3 font-semibold">{c.rataRata || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClassComparison;