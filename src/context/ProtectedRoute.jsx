import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Checking authentication...</p>
      </div>
    );
  }

  // If user not logged in, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // 🔥 Handle single or multiple allowed roles
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role)) {
      // Redirect unauthorized roles to a dedicated page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
