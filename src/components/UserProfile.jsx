import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

export default function UserProfile() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/profile/user/email/${encodeURIComponent(
            email
          )}`,
          axiosConfig
        );
        setProfile(res.data);
      } catch (err) {
        Swal.fire("Error", err.response?.data || "Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [email]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-sky-400 text-xl">
        Loading profile...
      </div>
    );

  if (!profile)
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-gray-400 text-lg">
        Profile not found.
      </div>
    );

  // Role-based accent color
  const roleColors = {
    ADMIN: "from-red-500 to-red-700",
    GUIDE: "from-green-500 to-green-700",
    STUDENT: "from-sky-500 to-sky-700",
  };
  const accent = roleColors[profile.role] || "from-gray-500 to-gray-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 p-4 md:p-10 w-full">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-5 py-2 bg-gradient-to-r from-sky-500 to-sky-700 hover:opacity-90 rounded-lg text-white font-medium transition-all"
      >
        ← Back
      </button>

      <motion.div
        className={`w-full backdrop-blur-xl bg-slate-800/70 p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-700/50 relative overflow-hidden`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Glowing gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-20 blur-3xl`}
        ></div>

        {/* Profile Header Section */}
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar */}
          <div
            className={`w-36 h-36 flex-shrink-0 rounded-full bg-gradient-to-br ${accent} flex items-center justify-center text-5xl font-bold text-white shadow-2xl`}
          >
            {profile.name?.[0]?.toUpperCase() || "U"}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent mb-2">
              {profile.name}
            </h1>
            <p className="text-gray-400 text-lg mb-1">{profile.email}</p>
            <span
              className={`inline-block mt-3 px-4 py-1 text-sm rounded-full bg-gradient-to-r ${accent} text-white shadow-md`}
            >
              {profile.role}
            </span>

            {/* Divider */}
            <div className="mt-5 border-t border-slate-600/40 w-full"></div>

            {/* Details Section */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-300">
              <ProfileItem label="Roll No" value={profile.rollNumber || "N/A"} />
              <ProfileItem label="Course" value={profile.course || "N/A"} />
              <ProfileItem label="Branch" value={profile.branch || "N/A"} />
              <ProfileItem label="Section" value={profile.section || "N/A"} />
              <ProfileItem label="Semester" value={profile.semester || "N/A"} />
              <ProfileItem label="Contact" value={profile.contactNo || "N/A"} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const ProfileItem = ({ label, value }) => (
  <div className="bg-slate-700/40 hover:bg-slate-700/60 p-4 rounded-xl transition-all">
    <p className="text-gray-400 text-sm">{label}</p>
    <p className="text-lg font-semibold text-sky-300">{value}</p>
  </div>
);
