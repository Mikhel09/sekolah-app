import { useEffect, useState } from 'react';
import api from '../services/api';

const MAX_SIZE_KB = 500;

function Profile() {
  const [profile, setProfile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadProfile = () => {
    api.get('/me').then((res) => setProfile(res.data));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleFileChange = (e) => {
    setError('');
    setSuccess('');
    const file = e.target.files[0];
    if (!file) return;

    // Cek ukuran file
    const sizeKB = file.size / 1024;
    if (sizeKB > MAX_SIZE_KB) {
      setError(`Ukuran file terlalu besar (maks ${MAX_SIZE_KB}KB). Pilih foto yang lebih kecil.`);
      return;
    }

    // Cek tipe file
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, dll)');
      return;
    }

    // Ubah file jadi teks base64
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;
    try {
      await api.put('/me/photo', { photo: preview });
      setSuccess('Foto profil berhasil diperbarui');
      setPreview(null);
      loadProfile();

      // Update juga data user di localStorage supaya foto ikut tampil di Navbar
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        user.photo = preview;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err) {
      setError('Gagal mengunggah foto');
    }
  };

  if (!profile) {
    return <p className="text-slate-500">Memuat profil...</p>;
  }

  const fotoDitampilkan = preview || profile.photo;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Profil Saya</h1>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col items-center gap-4">
        {/* Foto profil / placeholder */}
        <div className="w-28 h-28 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
          {fotoDitampilkan ? (
            <img src={fotoDitampilkan} alt="Foto profil" className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-400 text-3xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="text-center">
          <p className="font-semibold text-slate-800">{profile.name}</p>
          <p className="text-slate-500 text-sm">{profile.email}</p>
          <p className="text-slate-400 text-xs mt-1">{profile.role}</p>
        </div>

        <label className="w-full">
          <span className="block text-sm font-medium text-slate-700 mb-1">Ganti Foto</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm border border-slate-300 rounded-md px-3 py-2"
          />
        </label>

        {error && (
          <p className="w-full text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="w-full text-green-600 text-sm bg-green-50 border border-green-200 rounded-md px-3 py-2">
            {success}
          </p>
        )}

        {preview && (
          <button
            onClick={handleUpload}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md py-2 transition-colors"
          >
            Simpan Foto
          </button>
        )}
      </div>
    </div>
  );
}

export default Profile;