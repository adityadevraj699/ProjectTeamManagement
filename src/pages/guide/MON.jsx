import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  HiCalendar, 
  HiClock, 
  HiUserGroup, 
  HiAnnotation,
  HiArrowRight,
  HiLocationMarker,
  HiClipboardList
} from "react-icons/hi";

// 🔄 Reusable Loader Overlay (For PDF/Submit Process)
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] backdrop-blur-xl transition-all duration-300">
    <div className="relative w-24 h-24">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-sky-400 text-lg font-bold tracking-widest uppercase animate-pulse">{message || "Processing..."}</p>
  </div>
);

// 💀 MOM Page Skeleton Loader
const MOMSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0b1120] p-6 md:p-10 font-sans relative animate-pulse">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-800 rounded"></div>
          <div className="h-4 w-96 bg-slate-800/50 rounded"></div>
        </div>

        {/* Meeting Info Card Skeleton */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 h-40 space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-700 rounded"></div>
              <div className="h-4 w-32 bg-slate-700/50 rounded"></div>
            </div>
            <div className="h-6 w-20 bg-slate-700 rounded-full"></div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
          </div>
        </div>

        {/* Attendance Skeleton */}
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-4">
          <div className="h-6 w-40 bg-slate-700 rounded"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full bg-slate-700/30 rounded-xl"></div>
          ))}
        </div>

        {/* MOM Form Skeleton */}
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-6">
          <div className="h-6 w-40 bg-slate-700 rounded"></div>
          <div className="h-24 w-full bg-slate-700/30 rounded-xl"></div>
          <div className="h-24 w-full bg-slate-700/30 rounded-xl"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 w-full bg-slate-700/30 rounded-xl"></div>
            <div className="h-24 w-full bg-slate-700/30 rounded-xl"></div>
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="flex justify-end">
          <div className="h-12 w-48 bg-slate-700 rounded-xl"></div>
        </div>

      </div>
    </div>
  );
};

export default function MON() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [pageLoading, setPageLoading] = useState(true); // ✅ Controls Skeleton
  const [actionLoading, setActionLoading] = useState(false); // ✅ Controls Spinner Overlay

  // MOM form
  const [form, setForm] = useState({
    summary: "",
    actionItems: "",
    nextSteps: "",
    remarks: "",
  });

  // Next meeting
  const [nextMeeting, setNextMeeting] = useState({
    title: "",
    agenda: "",
    meetingDateTime: "",
    durationMinutes: "",
    location: "",
    mode: "ONLINE",
  });

  // Attendance
  const [attendance, setAttendance] = useState([]);

  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8800/api";

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // ✅ Fetch meeting details
  useEffect(() => {
    const fetchMeeting = async () => {
      setPageLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/guide/meetings/${meetingId}`,
          axiosConfig
        );
        setMeeting(res.data);

        // ✅ create attendance list
        if (res.data.team?.teamMembers) {
          const list = res.data.team.teamMembers.map((m) => ({
            userId: m.user.id,
            present: true,
            remarks: "",
            name: m.user.name,
            email: m.user.email,
            role: m.role
          }));
          setAttendance(list);
        }
      } catch (err) {
        console.error("❌ Error fetching meeting:", err);
        Swal.fire("Error", "Failed to load meeting details.", "error");
      } finally {
        setPageLoading(false);
      }
    };

    fetchMeeting();
  }, [meetingId]);

  // ✅ Controlled input handler
  const handleChange = (e, setFunc) => {
    const { name, value } = e.target;
    setFunc((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit MOM + Attendance + Next Meeting
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (actionLoading) return;
    
    if (!form.summary || !form.actionItems || !form.nextSteps) {
      Swal.fire("Warning", "Please fill all required MOM fields!", "warning");
      return;
    }

    setActionLoading(true); // START SPINNER

    try {
      const payload = {
        mom: form,
        attendance: attendance.map((a) => ({
          userId: a.userId,
          present: a.present,
          remarks: a.remarks,
        })),
        nextMeeting:
          nextMeeting.title && nextMeeting.meetingDateTime
            ? nextMeeting
            : null,
      };

      await axios.post(`${BASE_URL}/mom/${meetingId}`, payload, axiosConfig);

      Swal.fire({
        icon: 'success',
        title: 'Complete!',
        text: "MOM saved, attendance recorded & next meeting scheduled!",
        background: '#1e293b',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false
      });
      navigate("/guide/meetings");
    } catch (err) {
      console.error("❌ MOM submit error:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to complete MOM process!",
        "error"
      );
    } finally {
      setActionLoading(false); // STOP SPINNER
    }
  };

  // ✅ Show SKELETON while loading data
  if (pageLoading) return <MOMSkeleton />;

  if (!meeting)
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-slate-400">
        Meeting not found or failed to load.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 p-6 md:p-10 font-sans selection:bg-sky-500/30 relative">
      
      {/* Show Overlay Loader ONLY when submitting/generating PDF */}
      {actionLoading && <LoaderOverlay message="Generating PDF & Saving..." />}

      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <HiClipboardList className="text-emerald-500" /> Minutes of Meeting (MOM)
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Record attendance, summary, and schedule follow-ups.</p>
        </div>

        {/* Meeting Info Card */}
        <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-md p-6 rounded-2xl mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-700/50 pb-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{meeting.title}</h2>
              <div className="flex items-center gap-2 text-sm text-sky-400 font-medium">
                <HiUserGroup /> {meeting.team?.teamName}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide w-fit ${
              meeting.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {meeting.status}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</span>
              <div className="flex items-center gap-2 text-slate-300">
                <HiCalendar className="text-slate-500"/>
                {new Date(meeting.meetingDateTime).toLocaleDateString()}
              </div>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</span>
              <div className="flex items-center gap-2 text-slate-300">
                <HiClock className="text-slate-500"/>
                {new Date(meeting.meetingDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Mode</span>
              <div className="text-slate-300 font-medium">{meeting.mode}</div>
            </div>
            {meeting.location && (
               <div>
               <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</span>
               <div className="flex items-center gap-2 text-slate-300">
                 <HiLocationMarker className="text-slate-500"/> {meeting.location}
               </div>
             </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ✅ Attendance UI */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <HiUserGroup className="text-sky-400"/> Attendance Check
            </h3>
            
            <div className="grid gap-3">
              {attendance.map((m, i) => (
                <div
                  key={m.userId}
                  className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl gap-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.role} • {m.email}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      className={`p-2 rounded-lg text-sm font-medium outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-slate-900 transition-all cursor-pointer ${
                        m.present 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 focus:ring-emerald-500" 
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30 focus:ring-rose-500"
                      }`}
                      value={m.present ? "1" : "0"}
                      onChange={(e) =>
                        setAttendance((prev) => {
                          const copy = [...prev];
                          copy[i].present = e.target.value === "1";
                          return copy;
                        })
                      }
                    >
                      <option value="1">Present</option>
                      <option value="0">Absent</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Remarks (optional)"
                      className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white placeholder-slate-600 w-full md:w-48 focus:border-sky-500 focus:outline-none transition-colors"
                      onChange={(e) =>
                        setAttendance((prev) => {
                          const copy = [...prev];
                          copy[i].remarks = e.target.value;
                          return copy;
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MOM Section */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <HiAnnotation className="text-amber-400"/> Discussion Points
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Meeting Summary</label>
                <textarea
                  name="summary"
                  value={form.summary}
                  onChange={(e) => handleChange(e, setForm)}
                  placeholder="Key discussion points..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-sky-500 focus:outline-none transition-all placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Action Items</label>
                <textarea
                  name="actionItems"
                  value={form.actionItems}
                  onChange={(e) => handleChange(e, setForm)}
                  placeholder="Tasks assigned..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-sky-500 focus:outline-none transition-all placeholder-slate-600"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Next Steps</label>
                  <textarea
                    name="nextSteps"
                    value={form.nextSteps}
                    onChange={(e) => handleChange(e, setForm)}
                    placeholder="Plan for next iteration..."
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-sky-500 focus:outline-none transition-all placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">General Remarks</label>
                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={(e) => handleChange(e, setForm)}
                    placeholder="Additional notes..."
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-sky-500 focus:outline-none transition-all placeholder-slate-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Next Meeting */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <HiCalendar className="text-purple-400"/> Schedule Next Meeting <span className="text-xs text-slate-500 font-normal ml-1">(Optional)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="title"
                value={nextMeeting.title}
                onChange={(e) => handleChange(e, setNextMeeting)}
                placeholder="Meeting Title"
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-sky-500 focus:outline-none"
              />
              <input
                type="text"
                name="agenda"
                value={nextMeeting.agenda}
                onChange={(e) => handleChange(e, setNextMeeting)}
                placeholder="Agenda"
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-sky-500 focus:outline-none"
              />
              <input
                type="datetime-local"
                name="meetingDateTime"
                value={nextMeeting.meetingDateTime}
                onChange={(e) => handleChange(e, setNextMeeting)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-sky-500 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="durationMinutes"
                  value={nextMeeting.durationMinutes}
                  onChange={(e) => handleChange(e, setNextMeeting)}
                  placeholder="Duration (min)"
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
                <select
                  name="mode"
                  value={nextMeeting.mode}
                  onChange={(e) => handleChange(e, setNextMeeting)}
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </div>
              <input
                type="text"
                name="location"
                value={nextMeeting.location}
                onChange={(e) => handleChange(e, setNextMeeting)}
                placeholder="Location (Link or Room)"
                className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-sky-500 focus:outline-none md:col-span-2"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={actionLoading}
              className={`px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-900/20 active:scale-95 transition-all flex items-center gap-2 ${
                actionLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {actionLoading ? "Finalizing..." : <>Finalize & Submit <HiArrowRight/></>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}