import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) setUser(JSON.parse(storedUser));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-gray-100">
      {/* Navbar */}
      <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img
              src="data:image/jpeg;base64,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"
              alt="Team Manager Logo"
              className="w-10 h-10 object-cover rounded-md shadow-md"
            />
            <span className="text-lg font-semibold tracking-wide">
              Team Manager
            </span>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-3 relative">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 border border-white/20 hover:bg-white/10 rounded-lg transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold rounded-lg hover:opacity-90 shadow-md shadow-blue-800/40 transition-all"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
                >
                  <img
                    src={user?.avatar || "https://i.pravatar.cc/40"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-white/20"
                  />
                  <span className="font-medium">{user.name}</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl text-gray-200 text-sm overflow-hidden z-50">
                     <Link
  to={
    user.role === "ADMIN"
      ? "/admin/dashboard"
      : "/student/dashboard"
  }
  onClick={() => setMenuOpen(false)}
  className="block px-4 py-2 hover:bg-white/10 transition-colors"
>
  Dashboard
</Link>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-white/10 transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="focus:outline-none p-2 rounded-md bg-white/10 hover:bg-white/20 transition-all"
            >
              <svg
                className="h-6 w-6 text-gray-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/90 backdrop-blur-xl border-t border-white/10">
            {!user ? (
              <div className="flex flex-col gap-2 p-4">
                <Link
                  to="/login"
                  className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-4">
                <Link
  to={
    user.role === "ADMIN"
      ? "/admin/dashboard"
      : "/student/dashboard"
  }
  onClick={() => setMenuOpen(false)}
  className="block px-4 py-2 hover:bg-white/10 transition-colors"
>
  Dashboard
</Link>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-white/10 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 text-center py-32">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Manage Teams & Meetings Seamlessly
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
          A collaborative workspace for guides and students to plan, track,
          and deliver better results — faster and smarter.
        </p>
       <Link
  to={
    user
      ? user.role === "ADMIN"
        ? "/admin/dashboard"
        : "/student/dashboard"
      : "/register"
  }
  className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all"
>
  Get Started
</Link>

      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14 text-gray-100">
          Empower Your Team with Smart Tools
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: "👥",
              title: "Team Management",
              desc: "Organize and lead your teams efficiently with real-time collaboration.",
            },
            {
              icon: "📅",
              title: "Meeting Scheduler",
              desc: "Plan meetings, share notes, and set reminders seamlessly.",
            },
            {
              icon: "📊",
              title: "Progress Tracking",
              desc: "Visualize project performance and task completion insights.",
            },
            {
              icon: "🔔",
              title: "Smart Notifications",
              desc: "Never miss an update — get instant alerts for meetings and deadlines.",
            },
            {
              icon: "🧠",
              title: "AI Insights",
              desc: "Analyze performance and get smart suggestions using AI analytics.",
            },
            {
              icon: "🔒",
              title: "Secure Access",
              desc: "Advanced authentication keeps your data safe and private.",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-slate-900/70 border border-white/10 rounded-2xl p-8 text-center hover:bg-slate-800/80 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-black/40"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-100">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/10 py-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Team Manager — Built with ❤️ by Aditya Devraj
      </footer>
    </div>
  );
}
