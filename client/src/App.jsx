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
import MySchedule from './pages/MySchedule';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';
import ClassDetail from './pages/ClassDetail';
import StudentDetail from './pages/StudentDetail';
import AttendanceReport from './pages/AttendanceReport';
import ClassComparison from './pages/ClassComparison';
import Questions from './pages/Questions';
import Exams from './pages/Exams';
import ExamResults from './pages/ExamResults';
import StudentExams from './pages/StudentExams';
import TakeExam from './pages/TakeExam';
import Parents from './pages/Parents';
import MyChildren from './pages/MyChildren';
import ChildDetail from './pages/ChildDetail';
import GradeEssay from './pages/GradeEssay';

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
          <Route
            path="/my-schedule"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MySchedule />
              </ProtectedRoute>
            }
          />

          <Route
            path="/announcements"
            element={
              <ProtectedRoute>
                <Announcements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ClassDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <StudentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/attendance"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <AttendanceReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/class-comparison"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ClassComparison />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <Questions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exams"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <Exams />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exams/:id/results"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <ExamResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-exams"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentExams />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exams/:id/take"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <TakeExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parents"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Parents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-children"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <MyChildren />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-children/:studentId"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ChildDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam-results/:resultId/grade"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                <GradeEssay />
              </ProtectedRoute>
            }
          />
        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;