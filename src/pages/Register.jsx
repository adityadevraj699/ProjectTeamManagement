import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

export default function Register() {
  const navigate = useNavigate();

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  // dropdowns
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // If user is logged in -> redirect or show message
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      Swal.fire({
        icon: "info",
        title: "Already logged in",
        text: "You are already logged in. Redirecting to dashboard...",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/dashboard");
      });
    }
  }, [navigate]);

  // fetch branches/semesters/sections
  useEffect(() => {
    const token = localStorage.getItem("token");
    const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    const fetchData = async () => {
      try {
        const [bRes, sRes, secRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/branches`, axiosConfig),
          axios.get(`${import.meta.env.VITE_API_URL}/semesters`, axiosConfig),
          axios.get(`${import.meta.env.VITE_API_URL}/sections`, axiosConfig),
        ]);

        setBranches(bRes.data || []);
        setSemesters(sRes.data || []);
        setSections(secRes.data || []);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load branches/semesters/sections", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // basic validation
  const validate = () => {
    if (!name.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email";
    if (!password || password.length < 6) return "Password must be at least 6 characters";
    if (!selectedBranch) return "Select a branch";
    if (!selectedSemester) return "Select a semester";
    if (!selectedSection) return "Select a section";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      Swal.fire("Validation error", err, "warning");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name,
        email,
        password,
        contactNo,
        rollNumber,
        role: "STUDENT", // fixed
        branchId: selectedBranch,
        semesterId: selectedSemester,
        sectionId: selectedSection,
      };

      // update endpoint if different in backend  
      await axios.post(`${import.meta.env.VITE_API_URL}/register`, payload);

      Swal.fire("Success", "Account created. Please login.", "success").then(() => {
        navigate("/login");
      });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to register. Email might already be used.";
      Swal.fire("Error", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-3xl bg-slate-800/80 backdrop-blur p-8 rounded-2xl shadow-xl border border-slate-700"
      >
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          Student Registration
        </h2>
        <p className="text-sm text-slate-300 mb-6 text-center">
          Fill details and select branch / semester / section
        </p>

        {loading ? (
          <div className="text-center text-slate-300">Loading options...</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Full Name</label>
              <input
                className="w-full p-3 rounded-lg bg-slate-700 text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Email</label>
              <input
                type="email"
                className="w-full p-3 rounded-lg bg-slate-700 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Password</label>
              <input
                type="password"
                className="w-full p-3 rounded-lg bg-slate-700 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 chars"
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Contact No</label>
              <input
                className="w-full p-3 rounded-lg bg-slate-700 text-white"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                placeholder="Optional"
              />
            </div>

            {/* Roll number */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Roll No</label>
              <input
                className="w-full p-3 rounded-lg bg-slate-700 text-white"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter roll number"
              />
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Branch</label>
              <select
                className="w-full p-3 rounded-lg bg-slate-700 text-white"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="">-- Select Branch --</option>
                {branches.map((b) => (
                  <option key={b.id ?? b.branchId} value={b.id ?? b.branchId}>
                    {b.name ?? b.branchName}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Semester</label>
              <select
                className="w-full p-3 rounded-lg bg-slate-700 text-white"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="">-- Select Semester --</option>
                {semesters.map((s) => (
                  <option key={s.id ?? s.semesterId} value={s.id ?? s.semesterId}>
                    {s.name ?? s.semesterName ?? s.number}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Section</label>
              <select
                className="w-full p-3 rounded-lg bg-slate-700 text-white"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">-- Select Section --</option>
                {sections.map((sec) => (
                  <option key={sec.id ?? sec.sectionId} value={sec.id ?? sec.sectionId}>
                    {sec.name ?? sec.sectionName}
                  </option>
                ))}
              </select>
            </div>

            {/* Hidden role */}
            <input type="hidden" value="STUDENT" name="role" />

            {/* Buttons */}
            <div className="md:col-span-2 flex gap-3 items-center">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-lg bg-emerald-500 hover:opacity-90 font-semibold text-slate-900 disabled:opacity-60"
              >
                {submitting ? "Creating account..." : "Register as Student"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600"
              >
                Already have an account?
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
