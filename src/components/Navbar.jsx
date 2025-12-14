import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSignInAlt, FaBars, FaTimes, FaChevronDown, FaUserCircle, FaSignOutAlt, FaKey, FaTachometerAlt } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { scrollY } = useScroll();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  // Scroll Behavior Logic (Only for transparency toggle)
  useMotionValueEvent(scrollY, "change", (latest) => {
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

  // Close mobile menu when a link is clicked
  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  // Dynamic Background Style
  const getNavStyle = () => {
    if (isHomePage && !scrolled) {
        return "bg-transparent border-b border-transparent shadow-none";
    }
    // Solid background for other pages OR scrolled home page
    return "bg-gradient-to-r from-gray-900 to-gray-800 shadow-md border-b border-gray-700/50 backdrop-blur-md";
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${getNavStyle()}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16"> {/* Compact Height: 64px */}
          
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-semibold tracking-wide hover:text-sky-400 transition-colors"
          >
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <img
                  src="https://res.cloudinary.com/ddtcj9ks5/image/upload/v1762627794/coordinator_o7hmxq.png"
                  alt="EduProject Logo"
                  className="relative h-8 w-8 rounded-full object-cover border border-gray-500"
                />
            </div>
            <span className="hidden sm:inline font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">EduProject</span>
            <span className="sm:hidden font-bold text-white">EduProject</span>
          </Link>

          {/* Center Role Links (Desktop) */}
          {user && (
            <div className="hidden lg:flex items-center gap-1">
              {roleLinks.slice(0, 5).map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-white/5 ${location.pathname === link.to ? "text-sky-400 bg-white/5" : "text-gray-300 hover:text-white"}`}
                >
                  {link.name}
                </Link>
              ))}
              {/* More Dropdown */}
              {roleLinks.length > 5 && (
                  <div className="relative group/more ml-2">
                       <button className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1 rounded-md hover:bg-white/5">
                           More <FaChevronDown className="text-[10px]"/>
                       </button>
                       <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 opacity-0 group-hover/more:opacity-100 invisible group-hover/more:visible transition-all duration-200 transform origin-top-right scale-95 group-hover/more:scale-100">
                           {roleLinks.slice(5).map((link) => (
                               <Link
                                 key={link.name}
                                 to={link.to}
                                 className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                               >
                                 {link.name}
                               </Link>
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
                  className="px-4 py-1.5 rounded-full text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <FaSignInAlt /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 focus:outline-none bg-white/5 hover:bg-white/10 px-2 py-1 rounded-full border border-white/10 transition-all"
                >
                  <img
                    src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    alt="User Avatar"
                    className="w-7 h-7 rounded-full border border-gray-500 object-cover"
                  />
                  <span className="hidden lg:inline text-xs font-semibold text-white ml-1">{user.name}</span>
                  <FaChevronDown className={`text-[10px] text-gray-400 transition-transform duration-200 ml-1 ${menuOpen ? 'rotate-180' : ''}`}/>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-700 mb-1">
                          <p className="text-sm font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          <p className="text-[10px] text-cyan-500 uppercase tracking-wider font-bold mt-1">{user.role}</p>
                      </div>

                      <DropdownItem to={dashboardPath} icon={<FaTachometerAlt/>} onClick={() => setMenuOpen(false)}>Dashboard</DropdownItem>
                      <DropdownItem to="/profile" icon={<FaUserCircle/>} onClick={() => setMenuOpen(false)}>Profile</DropdownItem>
                      <DropdownItem to="/change-password" icon={<FaKey/>} onClick={() => setMenuOpen(false)}>Change Password</DropdownItem>
                      
                      <div className="my-1 border-t border-gray-700"></div>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3"
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
                  <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-800 rounded-lg border border-gray-700">
                      <img src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="User" className="w-10 h-10 rounded-full border border-gray-600" />
                      <div>
                          <p className="text-white font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">{user.role}</p>
                      </div>
                  </div>

                  <Link to={dashboardPath} onClick={handleMobileLinkClick} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white font-medium transition-colors"><FaTachometerAlt/> Dashboard</Link>
                  <Link to="/profile" onClick={handleMobileLinkClick} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white font-medium transition-colors"><FaUserCircle/> Profile</Link>
                  
                  <div className="h-px bg-gray-800 my-1"></div>
                  
                  {roleLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.to}
                      onClick={handleMobileLinkClick}
                      className="block px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white font-medium transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}

                  <div className="h-px bg-gray-800 my-1"></div>

                  <Link to="/change-password" onClick={handleMobileLinkClick} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white font-medium transition-colors"><FaKey/> Change Password</Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      handleMobileLinkClick();
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold flex items-center gap-3 mt-2 transition-colors"
                  >
                    <FaSignOutAlt/> Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Helper: Dropdown Item
const DropdownItem = ({ to, children, icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors group"
    >
      <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">{icon}</span>
      {children}
    </Link>
);

export default Navbar;