import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/admin/Dashboard";
import TeamManagement from "./pages/guide/TeamManagement";
import "./App.css"
import Course from "./pages/admin/Course";
import Batch from "./pages/admin/Batch";
import Semester from "./pages/admin/Semester";
import Section from "./pages/admin/Section";
import Teacher from "./pages/admin/Teacher";
import Team from "./pages/guide/Team";
import Student from "./pages/guide/Student";
import TeamDetail from "./pages/guide/TeamDetail";
import EditTeamDetail from "./pages/guide/EditTeamDetail";
import UserProfile from "./components/UserProfile";
import Unauthorized from "./context/Unauthorized";
import GuideMeetings from "./pages/guide/GuideMeetings";
import MON from "./pages/guide/MON";
import ViewMom from "./pages/guide/ViewMom";
import Tasks from "./pages/guide/Tasks";
import Profile from "./components/Profile";
import ForgotPassword from "./components/ForgotPassword";
import Task from "./pages/student/Task";
import Meeting from "./pages/student/Meeting";
import StudentTeam from "./pages/student/Team";
import TeamDetails from "./pages/student/TeamDetails";
import Query from "./pages/guide/Query";
import MeetingModal from "./pages/student/MeetingModal";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import GuideDashboard from "./pages/guide/GuideDashboard";
import AdminTeamDetail from "./pages/admin/AdminTeamDetail";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import ChangePassword from "./components/ChangePassoword";
import AllTeamReports from "./pages/admin/AllTeamReports";
import TeamReports from "./pages/guide/TeamReports";
import StudentDashboard from "./pages/student/StudentDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/support" element={<Support />} />

            {/* Protected admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="ADMIN">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
            path="/admin/reports"
             element={
                <ProtectedRoute role="ADMIN">
                  <AllTeamReports/>
                </ProtectedRoute>
              }
            />
            

                        <Route
  path="/admin/TeamDetail/:id"
  element={
    <ProtectedRoute role="ADMIN">
      <AdminTeamDetail/>
    </ProtectedRoute>
  }
/>

 <Route
  path="/admin/user-detail"
  element={
    <ProtectedRoute role="ADMIN">
      <AdminUserDetail/>
    </ProtectedRoute>
  }
/>


             <Route
              path="/admin/create-course"
              element={
                <ProtectedRoute role="ADMIN">
                  <Course />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/add-branch"
              element={
                <ProtectedRoute role="ADMIN">
                  <Batch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-semester"
              element={
                <ProtectedRoute role="ADMIN">
                  <Semester />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-section"
              element={
                <ProtectedRoute role="ADMIN">
                  <Section />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-teacher"
              element={
                <ProtectedRoute role="ADMIN">
                  <Teacher />
                </ProtectedRoute>
              }
            />

            <Route
              path="/guide/teams"
              element={
                <ProtectedRoute role="GUIDE">
                  <TeamManagement />
                </ProtectedRoute>
              }
            />

<Route
path="/guide/reports"
element ={
<ProtectedRoute role="GUIDE">
                  <TeamReports />
                </ProtectedRoute>
}
/>
            <Route
              path="/guide/add-student"
              element={
                <ProtectedRoute role="GUIDE">
                  <Student />
                </ProtectedRoute>
              }
            />

            <Route
              path="/guide/team"
              element={
                <ProtectedRoute role="GUIDE">
                  <Team />
                </ProtectedRoute>
              }
            />

              <Route
              path="/guide/dashboard"
              element={
                <ProtectedRoute role="GUIDE">
                  <GuideDashboard />
                </ProtectedRoute>
              }
            />


            <Route
  path="/guide/TeamDetail/:id"
  element={
    <ProtectedRoute role="GUIDE">
      <TeamDetail />
    </ProtectedRoute>
  }
/>
            <Route
              path="/guide/EditTeamDetail/:id"
              element={
                <ProtectedRoute role="GUIDE">
                  <EditTeamDetail />
                </ProtectedRoute>
              }
            />
            <Route
  path="/profile/:email"
  element={
    <ProtectedRoute role={["ADMIN", "GUIDE", "STUDENT"]}>
      <UserProfile />
    </ProtectedRoute>
  }
/>





<Route
  path="/guide/meetings"
  element={
    <ProtectedRoute role="GUIDE">
      <GuideMeetings />
    </ProtectedRoute>
  }
/>

<Route path="/guide/meeting/:meetingId" element={<ProtectedRoute role="GUIDE"><MON /></ProtectedRoute>} />
<Route path="/guide/viewmom/:meetingId" element={<ProtectedRoute role="GUIDE"><ViewMom /></ProtectedRoute>} />
<Route path="/guide/tasks" element={<ProtectedRoute role="GUIDE"><Tasks /></ProtectedRoute>} />
<Route path="/guide/query" element={<ProtectedRoute role="GUIDE"><Query /></ProtectedRoute>} />

            {/* Add student routes similarly */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/profile" element={<ProtectedRoute role={["ADMIN", "GUIDE", "STUDENT"]}><Profile /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/student/tasks" element={<ProtectedRoute role="STUDENT"><Task /></ProtectedRoute>} />
            <Route path="/student/meetings" element={<ProtectedRoute role="STUDENT"><Meeting /></ProtectedRoute>} />
            <Route path="/student/team" element={<ProtectedRoute role="STUDENT"><StudentTeam /></ProtectedRoute>} />
            <Route path="/student/teams/:id" element={<ProtectedRoute role="STUDENT"><TeamDetails /></ProtectedRoute>} />
            <Route path="/student/meeting/:id" element={<ProtectedRoute role="STUDENT"><MeetingModal /></ProtectedRoute>} />
            <Route path="/student/dashboard" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />

          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
