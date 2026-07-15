const jwt = require('jsonwebtoken');

// Middleware untuk cek apakah user sudah login (token valid)
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization; // formatnya: "Bearer xxxxx"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Kamu belum login' });
  }

  const token = authHeader.split(' ')[1]; // ambil bagian setelah "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // simpan data user (id, role, name) supaya bisa dipakai endpoint selanjutnya
    next(); // lanjut ke endpoint tujuan
  } catch (err) {
    return res.status(401).json({ error: 'Token tidak valid atau sudah kedaluwarsa' });
  }
}

// Middleware untuk cek role tertentu (dipakai SETELAH verifyToken)
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Kamu tidak punya izin untuk aksi ini' });
    }
    next();
  };
}

module.exports = { verifyToken, allowRoles };