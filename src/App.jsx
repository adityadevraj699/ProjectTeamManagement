import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import TeamManagement from "./pages/guide/TeamManagement";
import "./App.css"
import Course from "./pages/admin/Course";
import Batch from "./pages/admin/Batch";
import Semester from "./pages/admin/Semester";
import Section from "./pages/admin/section";
import Teacher from "./pages/admin/Teacher";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

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

           

            {/* Add student routes similarly */}
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
