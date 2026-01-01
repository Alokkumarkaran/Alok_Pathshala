import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import CreateTest from "./pages/admin/CreateTest";
import AddQuestions from "./pages/admin/AddQuestions";
import Exam from "./pages/student/Exam";
import Register from "./pages/auth/Register";
import Results from "./pages/student/Results";
import AdminResults from "./pages/admin/AdminResults";
import Leaderboard from "./pages/admin/Leaderboard";
import ManageTests from "./pages/admin/ManageTests";
import StudentsList from "./pages/admin/StudentsList";
import BulkUpload from "./pages/admin/BulkUpload";
import ResultAnalysis from "./pages/student/ResultAnalysis";
import SLeaderboard from "./pages/student/SLeaderboard";
import AvailableTests from "./pages/student/AvailableTests"; // Import the new page


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* DEFAULT ROUTE */}
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
  path="/admin/create-test"
  element={
    <ProtectedRoute role="admin">
      <CreateTest />
    </ProtectedRoute>
  }
/>



<Route
  path="/admin/add-question"
  element={
    <ProtectedRoute role="admin">
      <AddQuestions />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/exam/:testId"
  element={
    <ProtectedRoute role="student">
      <Exam />
    </ProtectedRoute>
  }
/>
<Route path="/register" element={<Register />} />

<Route
  path="/student"
  element={
    <ProtectedRoute role="student">
      <StudentDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/results"
  element={
    <ProtectedRoute role="student">
      <Results />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/results"
  element={
    <ProtectedRoute role="admin">
      <AdminResults />
    </ProtectedRoute>
  }
/>

<Route
            path="/admin/manage-tests"
            element={
              <ProtectedRoute role="admin">
                <ManageTests />
              </ProtectedRoute>
            }
          />

<Route
  path="/admin/leaderboard"
  element={
    <ProtectedRoute role="admin">
      <Leaderboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/students"
  element={
    <ProtectedRoute role="admin">
      <StudentsList />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/bulk-upload"
  element={
    <ProtectedRoute role="admin">
      <BulkUpload />
    </ProtectedRoute>
  }
/>
{/* Student Routes */}
<Route 
  path="/student/result/:resultId" 
  element={
    <ProtectedRoute role="student">
      <ResultAnalysis />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/student/sleaderboard" 
  element={
    <ProtectedRoute role="student">
      <SLeaderboard />
    </ProtectedRoute>
  } 
/>
{/* Student Routes */}
<Route 
  path="/student/all-tests" 
  element={
    <ProtectedRoute role="student">
      <AvailableTests />
    </ProtectedRoute>
  } 
/>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
