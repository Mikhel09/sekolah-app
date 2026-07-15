import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import MyData from './pages/MyData';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import MyClasses from './pages/MyClasses';
import Subjects from './pages/Subjects';
import Schedules from './pages/Schedules';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <Students />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teachers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Teachers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/classes"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Classes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-data"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyData />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-classes"
            element={
              <ProtectedRoute allowedRoles={['TEACHER']}>
                <MyClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Subjects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedules"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Schedules />
              </ProtectedRoute>
            }
          />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;