import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {FaSignInAlt, FaBars, FaTimes } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Role-based links
  const guideLinks = [
    { name: "Team Management", to: "/guide/teams" },
    { name: "Meeting Records", to: "/guide/meetings" },
    { name: "Task Tracking", to: "/guide/tasks" },
    { name: "Team", to: "/guide/team" },
    { name: "Add Student", to: "/guide/add-student" },
    { name: "Query", to: "/guide/query" },
    { name: "All Reports", to: "/guide/reports" },
  ];

  const studentLinks = [
    { name: "Team", to: "/student/team" },
    { name: "My Tasks", to: "/student/tasks" },
    { name: "Upcoming Meetings", to: "/student/meetings" },
  ];

  const adminLinks = [
    { name: "Create Course", to: "/admin/create-course" },
    { name: "Add Branch", to: "/admin/add-branch" },
    { name: "Add Semester", to: "/admin/add-semester" },
    { name: "Add Section", to: "/admin/add-section" },
    { name: "Add Teacher", to: "/admin/add-teacher" },
    { name: "Student", to: "/admin/user-detail" },
    { name: "All Reports", to: "/admin/reports" },
     { name: "Querry", to: "/admin/public-querry" },
  ];

  const roleLinks = user
    ? user.role?.toUpperCase() === "ADMIN"
      ? adminLinks
      : user.role?.toUpperCase() === "GUIDE"
      ? guideLinks
      : studentLinks
    : [];

  const dashboardPath = user
    ? user.role?.toUpperCase() === "ADMIN"
      ? "/admin/dashboard"
      : user.role?.toUpperCase() === "GUIDE"
      ? "/guide/dashboard"
      : "/student/dashboard"
    : "/";

  // Close menus if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when a link is clicked
  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
       <Link
          to="/"
          className="flex items-center gap-2 text-xl font-semibold tracking-wide hover:text-sky-400 transition-colors"
        >
          <img
            src="https://res.cloudinary.com/ddtcj9ks5/image/upload/v1762627794/coordinator_o7hmxq.png"
            alt="EduProject Logo"
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="hidden sm:inline">EduProject</span>
          <span className="sm:hidden">EduProject</span>
        </Link>
        {/* Center Role Links */}
        {user && (
          <div className="hidden md:flex items-center gap-6">
            {roleLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className="hover:text-sky-400 transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}

        {/* Right User Avatar / Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1 bg-sky-600 px-3 py-1.5 rounded-lg hover:bg-sky-700 transition"
              >
                <FaSignInAlt /> Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 border border-sky-500 text-sky-400 rounded-lg hover:bg-sky-500 hover:text-white transition"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img
                  src={
                    user.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt="User Avatar"
                  className="w-9 h-9 rounded-full border-2 border-sky-500"
                />
                <span className="hidden md:inline">{user.name}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-lg py-2">
                  <Link
                    to={dashboardPath}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-700 transition"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-700 transition"
                  >
                    Profile
                  </Link>

                  {/* Common Change Password Link */}
                  <Link
                    to="/change-password"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-700 transition"
                  >
                    Change Password
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-2xl text-sky-400"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden bg-gray-800 py-3 space-y-2">
          {!user ? (
            <>
              <Link
                to="/login"
                onClick={handleMobileLinkClick}
                className="block text-center py-2 bg-sky-600 rounded-md mx-4"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={handleMobileLinkClick}
                className="block text-center py-2 border border-sky-500 text-sky-400 rounded-md mx-4"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              {roleLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  onClick={handleMobileLinkClick}
                  className="block px-4 py-2 hover:bg-gray-700 transition"
                >
                  {link.name}
                </Link>
              ))}

              <Link
                to={dashboardPath}
                onClick={handleMobileLinkClick}
                className="block px-4 py-2 hover:bg-gray-700 transition"
              >
                Dashboard
              </Link>

              <Link
                to="/profile"
                onClick={handleMobileLinkClick}
                className="block px-4 py-2 hover:bg-gray-700 transition"
              >
                Profile
              </Link>

              {/* Common Change Password Link (MOBILE) */}
              <Link
                to="/change-password"
                onClick={handleMobileLinkClick}
                className="block px-4 py-2 hover:bg-gray-700 transition"
              >
                Change Password
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  handleMobileLinkClick();
                }}
                className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
