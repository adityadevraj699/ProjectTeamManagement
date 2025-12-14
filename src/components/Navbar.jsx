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
  const [hidden, setHidden] = useState(false);
  
  const { scrollY } = useScroll();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  // Scroll Behavior logic
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    
    // Determine scroll direction for hiding/showing
    if (latest > previous && latest > 100) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    // Determine if scrolled enough to show background
    if (latest > 20) {
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

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const navVariants = {
    visible: { y: 0, transition: { duration: 0.35, ease: "easeInOut" } },
    hidden: { y: -100, transition: { duration: 0.35, ease: "easeInOut" } },
  };

  // Dynamic Background Classes
  const getNavBackground = () => {
    if (isHomePage && !scrolled) return "bg-transparent border-transparent shadow-none"; // Transparent on Home Top
    return "bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/5"; // Glassmorphism otherwise
  };

  return (
    <motion.nav
      variants={navVariants}
      animate={hidden ? "hidden" : "visible"}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${getNavBackground()}`}
    >
      {/* Subtle bottom gradient border (visible only when scrolled or not home) */}
      {(scrolled || !isHomePage) && (
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16"> {/* Reduced height to h-16 (64px) */}
          
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
                <img
                  src="https://res.cloudinary.com/ddtcj9ks5/image/upload/v1762627794/coordinator_o7hmxq.png"
                  alt="EduProject Logo"
                  className="relative h-8 w-8 rounded-full object-cover border-2 border-white/10"
                />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 tracking-tight">EduProject</span>
          </Link>

          {/* Desktop Menu */}
          {user && (
            <div className="hidden lg:flex items-center gap-1">
              {roleLinks.slice(0, 5).map((link) => (
                <NavLink key={link.name} to={link.to} active={location.pathname === link.to}>
                  {link.name}
                </NavLink>
              ))}
              {roleLinks.length > 5 && (
                  <div className="relative group/more ml-2">
                       <button className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1">
                           More <FaChevronDown className="text-[10px]"/>
                       </button>
                       <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 opacity-0 group-hover/more:opacity-100 invisible group-hover/more:visible transition-all duration-200 transform origin-top-right scale-95 group-hover/more:scale-100">
                           {roleLinks.slice(5).map((link) => (
                               <Link
                                 key={link.name}
                                 to={link.to}
                                 className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                               >
                                 {link.name}
                               </Link>
                           ))}
                       </div>
                  </div>
              )}
            </div>
          )}

          {/* Right Section (Auth / Profile) */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <FaSignInAlt /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-3 focus:outline-none bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5 transition-all"
                >
                  <img
                    src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    alt="User"
                    className="w-7 h-7 rounded-full border border-white/20 object-cover"
                  />
                  <div className="text-left hidden lg:block">
                      <span className="block text-xs font-bold text-white">{user.name}</span>
                  </div>
                  <FaChevronDown className={`text-[10px] text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}/>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-800 mb-1">
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          <p className="text-[10px] text-cyan-500 uppercase tracking-wider font-bold mt-1">{user.role}</p>
                      </div>

                      <DropdownItem to={dashboardPath} icon={<FaTachometerAlt/>} onClick={() => setMenuOpen(false)}>Dashboard</DropdownItem>
                      <DropdownItem to="/profile" icon={<FaUserCircle/>} onClick={() => setMenuOpen(false)}>Profile</DropdownItem>
                      <DropdownItem to="/change-password" icon={<FaKey/>} onClick={() => setMenuOpen(false)}>Change Password</DropdownItem>
                      
                      <div className="my-1 border-t border-slate-800"></div>
                      
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
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#0f172a]/95 backdrop-blur-xl border-b border-slate-700 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-3">
              {!user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={handleMobileLinkClick}
                    className="block w-full py-3 text-center bg-slate-800 text-white font-semibold rounded-xl border border-slate-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleMobileLinkClick}
                    className="block w-full py-3 text-center bg-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-2 mb-6 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                      <img src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="User" className="w-10 h-10 rounded-full border-2 border-white/10" />
                      <div>
                          <p className="text-white font-semibold">{user.name}</p>
                          <p className="text-xs text-slate-400 uppercase tracking-wide">{user.role}</p>
                      </div>
                  </div>

                  <div className="space-y-1">
                      <Link to={dashboardPath} onClick={handleMobileLinkClick} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white font-medium transition-colors">
                         <FaTachometerAlt className="text-slate-500"/> Dashboard
                      </Link>
                      <Link to="/profile" onClick={handleMobileLinkClick} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white font-medium transition-colors">
                         <FaUserCircle className="text-slate-500"/> Profile
                      </Link>
                  </div>
                  
                  <div className="h-px bg-slate-800 my-2 mx-4"></div>
                  
                  <div className="space-y-1">
                      {roleLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.to}
                          onClick={handleMobileLinkClick}
                          className="block px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white font-medium transition-colors"
                        >
                          {link.name}
                        </Link>
                      ))}
                  </div>

                  <div className="h-px bg-slate-800 my-2 mx-4"></div>

                  <Link to="/change-password" onClick={handleMobileLinkClick} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white font-medium transition-colors">
                      <FaKey className="text-slate-500"/> Change Password
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      handleMobileLinkClick();
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold flex items-center gap-3 mt-4"
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

// Helper: Desktop Nav Link
const NavLink = ({ to, children, active }) => (
    <Link
      to={to}
      className={`relative px-3 py-2 text-xs font-medium transition-colors ${
        active ? "text-cyan-400" : "text-slate-300 hover:text-white"
      }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="navbar-underline"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 rounded-full"
        />
      )}
    </Link>
);

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