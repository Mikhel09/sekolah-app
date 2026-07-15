import { useState } from 'react';
import api from '../services/api';

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi tidak sama');
      return;
    }

    try {
      await api.put('/me/password', { oldPassword, newPassword });
      setSuccess('Password berhasil diganti');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan');
    }
  };

  const inputClass = "w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Ganti Password</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password Lama</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password Baru</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-md px-3 py-2">
            {success}
          </p>
        )}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md py-2 transition-colors"
        >
          Simpan Password Baru
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;