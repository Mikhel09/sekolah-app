import { useEffect, useState } from 'react';
import api from '../services/api';

const LABEL_ENTITAS = {
  STUDENT: 'Data Siswa',
  TEACHER: 'Data Guru',
  CLASS: 'Data Kelas',
  SUBJECT: 'Mata Pelajaran',
  SCHEDULE: 'Jadwal',
  QUESTION: 'Bank Soal',
};

function ImportHistory() {
  const [logs, setLogs] = useState([]);
  const [undoingId, setUndoingId] = useState(null);

  const loadLogs = () => {
    api.get('/import-logs').then((res) => setLogs(res.data));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleUndo = async (batchId) => {
    const yakin = window.confirm('Yakin ingin membatalkan import ini? Data terkait akan dihapus.');
    if (!yakin) return;

    setUndoingId(batchId);
    try {
      const res = await api.post(`/import-logs/${batchId}/undo`);
      alert(
        `${res.data.berhasilDihapus} data berhasil dihapus.` +
        (res.data.gagalDihapus.length > 0
          ? ` ${res.data.gagalDihapus.length} data tidak bisa dihapus karena sudah dipakai di tempat lain.`
          : '')
      );
      loadLogs();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal membatalkan import');
    } finally {
      setUndoingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Riwayat Import</h1>
      <p className="text-slate-500 mb-6">
        Daftar import Excel yang pernah dilakukan. Kamu bisa membatalkan import yang salah di sini.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Jenis Data</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Jumlah</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Diimpor Oleh</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Waktu</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-slate-400">
                  Belum ada riwayat import
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">{LABEL_ENTITAS[log.entityType] || log.entityType}</td>
                <td className="px-4 py-3">{log.totalRecords} data</td>
                <td className="px-4 py-3 text-slate-500">{log.importedByUser.name}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(log.createdAt).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3">
                  {log.undone ? (
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs font-medium">
                      Sudah dibatalkan
                    </span>
                  ) : (
                    <button
                      onClick={() => handleUndo(log.batchId)}
                      disabled={undoingId === log.batchId}
                      className="text-red-600 hover:underline text-xs font-medium disabled:opacity-50"
                    >
                      {undoingId === log.batchId ? 'Membatalkan...' : 'Batalkan'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ImportHistory;