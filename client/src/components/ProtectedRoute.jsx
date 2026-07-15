import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  // Belum login sama sekali
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userString);

  // Kalau halaman ini dibatasi role tertentu, cek apakah role user cocok
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div>
        <h2>Akses Ditolak</h2>
        <p>Kamu tidak punya izin untuk mengakses halaman ini.</p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;