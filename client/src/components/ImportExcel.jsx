import { useState } from 'react';
import api from '../services/api';

function ImportExcel({ endpoint, onSuccess, contohKolom }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState(null);
  const [error, setError] = useState('');
  const [undoing, setUndoing] = useState(false);
  const [sudahDibatalkan, setSudahDibatalkan] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setHasil(null);
    setSudahDibatalkan(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setHasil(res.data);
      setFile(null);
      onSuccess();
    } catch (err) {
      setError('Gagal mengimpor file. Pastikan format kolom sudah benar.');
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    if (!hasil?.batchId) return;
    const yakin = window.confirm(
      `Yakin ingin membatalkan import ini? ${hasil.berhasil} data yang baru saja masuk akan dihapus.`
    );
    if (!yakin) return;

    setUndoing(true);
    try {
      const res = await api.post(`/import-logs/${hasil.batchId}/undo`);
      setSudahDibatalkan(true);
      onSuccess(); // refresh daftar data di halaman
      alert(
        `${res.data.berhasilDihapus} data berhasil dihapus.` +
        (res.data.gagalDihapus.length > 0
          ? ` ${res.data.gagalDihapus.length} data tidak bisa dihapus karena sudah dipakai di tempat lain.`
          : '')
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal membatalkan import');
    } finally {
      setUndoing(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm">
      <p className="text-sm font-medium text-slate-700 mb-1">Import dari Excel</p>
      <p className="text-xs text-slate-400 mb-3">Kolom yang dibutuhkan: {contohKolom}</p>

      <div className="flex gap-3 items-center">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm border border-slate-300 rounded-md px-3 py-2"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {loading ? 'Mengunggah...' : 'Upload'}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-3">{error}</p>
      )}

      {hasil && !sudahDibatalkan && (
        <div className="mt-3 text-sm">
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
            <p className="text-green-700">✓ {hasil.berhasil} data berhasil ditambahkan</p>
            {hasil.batchId && (
              <button
                onClick={handleUndo}
                disabled={undoing}
                className="text-red-600 hover:underline text-xs font-medium disabled:opacity-50 flex-shrink-0 ml-3"
              >
                {undoing ? 'Membatalkan...' : 'Batalkan Import Ini'}
              </button>
            )}
          </div>
          {hasil.gagal.length > 0 && (
            <div className="mt-2">
              <p className="text-red-600">✗ {hasil.gagal.length} data gagal:</p>
              <ul className="list-disc list-inside text-slate-500 text-xs mt-1">
                {hasil.gagal.map((g, i) => (
                  <li key={i}>Baris dengan data "{JSON.stringify(g.row)}" — {g.alasan}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {sudahDibatalkan && (
        <p className="text-slate-500 text-sm mt-3 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
          Import ini sudah dibatalkan.
        </p>
      )}
    </div>
  );
}

export default ImportExcel;