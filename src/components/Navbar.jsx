import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSignInAlt, FaBars, FaTimes, FaChevronDown, FaUserCircle, FaSignOutAlt, FaKey, FaTachometerAlt } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  // Scroll Behavior: Hide on down, show on up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    
    // Hide/Show Logic
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    // Scrolled State Logic (for transparency toggle)
    if (latest > 50) {
        setScrolled(true);
    } else {
        setScrolled(false);
    }
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Role-based links (Kept EXACTLY as provided)
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
    { name: "Query", to: "/admin/public-querry" },
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

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const navVariants = {
    visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } },
    hidden: { y: -100, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  // Dynamic Background Style
  const getNavStyle = () => {
    if (isHomePage && !scrolled) {
        return "bg-transparent shadow-none";
    }
    return "bg-gradient-to-r from-gray-900 to-gray-800 shadow-md border-b border-gray-700/50";
  };

  return (
    <motion.nav
      variants={navVariants}
      animate={hidden ? "hidden" : "visible"}
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${getNavStyle()}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center"> {/* Reduced py-3 to py-2 */}
        
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-semibold tracking-wide hover:text-sky-400 transition-colors"
        >
          <img
            src="https://res.cloudinary.com/ddtcj9ks5/image/upload/v1762627794/coordinator_o7hmxq.png"
            alt="EduProject Logo"
            className="h-8 w-8 rounded-full object-cover border border-gray-600"
          />
          <span className="hidden sm:inline font-bold">EduProject</span>
          <span className="sm:hidden font-bold">EduProject</span>
        </Link>

        {/* Center Role Links (Desktop) */}
        {user && (
          <div className="hidden md:flex items-center gap-6">
            {roleLinks.slice(0, 5).map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className={`text-sm font-medium transition-colors ${location.pathname === link.to ? "text-sky-400" : "text-gray-300 hover:text-white"}`}
              >
                {link.name}
              </Link>
            ))}
            {/* More Dropdown if needed */}
            {roleLinks.length > 5 && (
                <div className="relative group">
                    <button className="text-sm font-medium text-gray-300 hover:text-white flex items-center gap-1">More <FaChevronDown className="text-xs"/></button>
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 hidden group-hover:block">
                        {roleLinks.slice(5).map((link) => (
                            <Link key={link.name} to={link.to} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">{link.name}</Link>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}

        {/* Right User Avatar / Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1 bg-sky-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-sky-700 transition shadow-lg shadow-sky-900/20"
              >
                <FaSignInAlt /> Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 border border-sky-500 text-sky-400 rounded-full text-sm font-medium hover:bg-sky-500 hover:text-white transition"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 focus:outline-none bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all"
              >
                <img
                  src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                  alt="User Avatar"
                  className="w-7 h-7 rounded-full border border-gray-500 object-cover"
                />
                <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                <FaChevronDown className={`text-xs text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}/>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-700 mb-1">
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>

                    <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"><FaTachometerAlt/> Dashboard</Link>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"><FaUserCircle/> Profile</Link>
                    <Link to="/change-password" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"><FaKey/> Change Password</Link>
                    
                    <div className="my-1 border-t border-gray-700"></div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition flex items-center gap-3"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-xl text-sky-400 p-2 rounded hover:bg-white/10"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-gray-900 border-t border-gray-800 overflow-hidden shadow-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {!user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={handleMobileLinkClick}
                    className="block w-full py-2.5 text-center bg-sky-600 text-white font-semibold rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleMobileLinkClick}
                    className="block w-full py-2.5 text-center border border-sky-500 text-sky-400 rounded-lg"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-2 mb-4 bg-gray-800 p-3 rounded-lg">
                      <img src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="User" className="w-10 h-10 rounded-full" />
                      <div>
                          <p className="text-white font-semibold">{user.name}</p>
                          <p className="text-xs text-gray-400 uppercase">{user.role}</p>
                      </div>
                  </div>

                  <Link to={dashboardPath} onClick={handleMobileLinkClick} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white"><FaTachometerAlt/> Dashboard</Link>
                  <Link to="/profile" onClick={handleMobileLinkClick} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white"><FaUserCircle/> Profile</Link>
                  
                  <div className="h-px bg-gray-800 my-1"></div>
                  
                  {roleLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.to}
                      onClick={handleMobileLinkClick}
                      className="block px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white"
                    >
                      {link.name}
                    </Link>
                  ))}

                  <div className="h-px bg-gray-800 my-1"></div>

                  <Link to="/change-password" onClick={handleMobileLinkClick} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white"><FaKey/> Change Password</Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      handleMobileLinkClick();
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-gray-800 flex items-center gap-3"
                  >
                    <FaSignOutAlt/> Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;