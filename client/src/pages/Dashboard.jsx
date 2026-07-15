function Dashboard() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Dashboard</h1>
      <p className="text-slate-500">
        Selamat datang, <span className="font-medium text-slate-700">{user?.name}</span>.
      </p>
    </div>
  );
}

export default Dashboard;