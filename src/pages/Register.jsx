import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { 
  HiUser, HiMail, HiLockClosed, HiPhone, 
  HiAcademicCap, HiIdentification, HiArrowRight, HiOfficeBuilding 
} from "react-icons/hi";

// 🔄 Elegant Loader Component
const LoaderOverlay = () => (
  <div className="flex flex-col items-center justify-center py-10 space-y-4">
    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
    <p className="text-slate-400 text-sm animate-pulse">Loading academic data...</p>
  </div>
);

export default function Register() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contactNo: "",
    rollNumber: "",
  });

  // Dropdown Data
  const [dropdowns, setDropdowns] = useState({
    branches: [],
    semesters: [],
    sections: []
  });

  // Selections
  const [selections, setSelections] = useState({
    branch: "",
    semester: "",
    section: ""
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 1️⃣ Auth & Role Based Redirect Check
  useEffect(() => {
    const token = localStorage.getItem("token");
    // Ensure you store 'role' in localStorage during Login
    const role = localStorage.getItem("role"); 

    if (token) {
      let redirectPath = "/";

      // 🔀 Role Based Navigation Logic
      if (role === "STUDENT") {
        redirectPath = "/student/dashboard";
      } else if (role === "GUIDE") {
        redirectPath = "/guide/dashboard";
      } else if (role === "ADMIN") {
        redirectPath = "/admin/dashboard";
      } else {
        // Fallback if role is missing or unknown
        redirectPath = "/login"; 
      }

      Swal.fire({
        icon: 'info',
        title: 'Already Logged In',
        text: `Redirecting to ${role ? role.toLowerCase() : 'your'} dashboard...`,
        timer: 1500,
        showConfirmButton: false,
        background: '#1e293b',
        color: '#fff'
      }).then(() => {
        navigate(redirectPath);
      });
    }
  }, [navigate]);

  // 2️⃣ Fetch Dropdown Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoints = [
          axios.get(`${import.meta.env.VITE_API_URL}/branches`),
          axios.get(`${import.meta.env.VITE_API_URL}/semesters`),
          axios.get(`${import.meta.env.VITE_API_URL}/sections`)
        ];

        const [bRes, sRes, secRes] = await Promise.all(endpoints);

        setDropdowns({
          branches: bRes.data || [],
          semesters: sRes.data || [],
          sections: secRes.data || []
        });
      } catch (err) {
        console.error("Data Fetch Error:", err);
        Swal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: 'Could not load academic options. Please check your internet or server.',
          background: '#1e293b',
          color: '#fff'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 3️⃣ Validation Logic
  const validate = () => {
    const { name, email, password, rollNumber } = formData;
    const { branch, semester, section } = selections;

    if (!name.trim()) return "Full Name is required";
    
    // Email Validation
    const emailParts = email.trim().toLowerCase().split("@");
    if (emailParts.length !== 2 || emailParts[1] !== "mitmeerut.ac.in") {
      return "Please use your official college email (@mitmeerut.ac.in)";
    }

    if (password.length < 6) return "Password must be at least 6 characters";
    if (!rollNumber.trim()) return "Roll Number is required";
    if (!branch) return "Please select your Branch";
    if (!semester) return "Please select your Semester";
    if (!section) return "Please select your Section";

    return null;
  };

  // 4️⃣ Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) return Swal.fire({ icon: 'warning', title: 'Invalid Input', text: error, background: '#1e293b', color: '#fff' });

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        role: "STUDENT",
        branchId: selections.branch,
        semesterId: selections.semester,
        sectionId: selections.section,
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/register`, payload);

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Your account has been created. Please login now.',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#10b981'
      }).then(() => navigate("/login"));

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.response?.data?.message || "Something went wrong. Try again.",
        background: '#1e293b',
        color: '#fff'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for Input Change
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-sky-500/20 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        
        {/* Left Side: Branding / Info */}
        <div className="md:w-1/3 bg-gradient-to-br from-emerald-600 to-teal-800 p-8 flex flex-col justify-between text-white relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           <div className="relative z-10">
             <h1 className="text-3xl font-extrabold tracking-tight mb-2">Join Us!</h1>
             <p className="text-emerald-100 text-sm">Create your student account to access the dashboard, track tasks, and view your performance.</p>
           </div>
           
           <div className="relative z-10 mt-10 md:mt-0">
             <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
               <p className="text-xs font-mono text-emerald-200 mb-1">Official Domain Required</p>
               <p className="font-bold text-white">@mitmeerut.ac.in</p>
             </div>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-2/3 p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            Create Account <span className="text-emerald-500">.</span>
          </h2>

          {loading ? (
            <LoaderOverlay />
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* --- Full Name --- */}
              <div className="relative group">
                <HiUser className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-500 text-sm"
                />
              </div>

              {/* --- Email --- */}
              <div className="relative group">
                <HiMail className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
                <input
                  name="email"
                  type="email"
                  placeholder="Official Email ID"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-500 text-sm"
                />
              </div>

              {/* --- Password --- */}
              <div className="relative group">
                <HiLockClosed className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-500 text-sm"
                />
              </div>

              {/* --- Contact --- */}
              <div className="relative group">
                <HiPhone className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
                <input
                  name="contactNo"
                  type="text"
                  placeholder="Phone Number"
                  value={formData.contactNo}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-500 text-sm"
                />
              </div>

              {/* --- Roll Number --- */}
              <div className="relative group md:col-span-2">
                <HiIdentification className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
                <input
                  name="rollNumber"
                  type="text"
                  placeholder="University Roll Number"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-500 text-sm"
                />
              </div>

              {/* --- SEPARATIOR --- */}
              <div className="md:col-span-2 border-t border-slate-700/50 my-1"></div>

              {/* --- Branch Dropdown --- */}
              <div className="relative group md:col-span-2">
                <HiAcademicCap className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
                <select
                  value={selections.branch}
                  onChange={(e) => setSelections({...selections, branch: e.target.value})}
                  className="w-full bg-slate-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none appearance-none cursor-pointer text-sm"
                >
                  <option value="">Select Branch</option>
                  {dropdowns.branches.map((b) => (
                    <option key={b.id || b._id || b.branchId} value={b.id || b._id || b.branchId}>
                      {b.name || b.branchName}
                    </option>
                  ))}
                </select>
              </div>

              {/* --- Semester Dropdown --- */}
              <div className="relative group">
                 <div className="absolute left-3 top-3.5 text-slate-500 z-10 pointer-events-none">
                    <span className="text-xs font-bold border border-slate-500 px-1 rounded">Sem</span>
                 </div>
                <select
                  value={selections.semester}
                  onChange={(e) => setSelections({...selections, semester: e.target.value})}
                  className="w-full bg-slate-800/50 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none appearance-none cursor-pointer text-sm"
                >
                  <option value="">Select Semester</option>
                  {dropdowns.semesters.map((s) => (
                    <option key={s.id || s._id || s.semesterId} value={s.id || s._id || s.semesterId}>
                      {s.name || s.semesterName || `Semester ${s.number}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* --- Section Dropdown --- */}
              <div className="relative group">
                <HiOfficeBuilding className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors text-lg" />
                <select
                  value={selections.section}
                  onChange={(e) => setSelections({...selections, section: e.target.value})}
                  className="w-full bg-slate-800/50 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none appearance-none cursor-pointer text-sm"
                >
                  <option value="">Select Section</option>
                  {dropdowns.sections.map((sec) => (
                    <option key={sec.id || sec._id || sec.sectionId} value={sec.id || sec._id || sec.sectionId}>
                      {sec.name || sec.sectionName}
                    </option>
                  ))}
                </select>
              </div>

              {/* --- Submit Button --- */}
              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    "Creating Account..."
                  ) : (
                    <>Register Now <HiArrowRight/></>
                  )}
                </button>
              </div>

              {/* --- Login Link --- */}
              <div className="md:col-span-2 text-center mt-2">
                <p className="text-slate-400 text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline">
                    Login here
                  </Link>
                </p>
              </div>

            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}