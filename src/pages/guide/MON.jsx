import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

// 🔄 Reusable loader overlay component
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
    <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-white text-lg font-medium">{message || "Loading..."}</p>
  </div>
);

export default function MON() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [pageLoading, setPageLoading] = useState(true); // ✅ Page Loader
  const [actionLoading, setActionLoading] = useState(false); // ✅ Action Loader

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
    setActionLoading(true);

    if (!form.summary || !form.actionItems || !form.nextSteps) {
      Swal.fire("Warning", "Please fill all required MOM fields!", "warning");
      setActionLoading(false);
      return;
    }

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

      Swal.fire(
        "✅ Success",
        "MOM saved, attendance recorded & next meeting scheduled!",
        "success"
      );
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
      setActionLoading(false);
    }
  };

  // ✅ Show page loader
  if (pageLoading) return <LoaderOverlay message="Loading Meeting Details..." />;

  if (!meeting)
    return (
      <div className="p-10 text-center text-gray-400">
        Meeting not found or failed to load.
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-8 relative">
      {actionLoading && <LoaderOverlay message="Processing MOM Submission..." />}

      <h1 className="text-3xl font-bold text-sky-400 mb-4">
        📝 Meeting Minutes (MOM)
      </h1>

      {/* Meeting Info */}
      <div className="bg-slate-800 p-6 rounded-2xl mb-6">
        <h2 className="text-xl text-sky-300 font-semibold mb-2">
          Meeting: {meeting.title}
        </h2>
        <p>
          <b>Team:</b> {meeting.team?.teamName}
        </p>
        <p>
          <b>Date:</b>{" "}
          {new Date(meeting.meetingDateTime).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        <p>
          <b>Mode:</b> {meeting.mode}
        </p>
        <p>
          <b>Status:</b> {meeting.status}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ✅ Attendance UI */}
        <div className="bg-slate-800 p-6 rounded-2xl">
          <h2 className="text-xl text-sky-400 mb-4">✅ Attendance</h2>

          {attendance.map((m, i) => (
            <div
              key={m.userId}
              className="flex justify-between items-center bg-slate-700 p-3 rounded mb-2"
            >
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-gray-300">{m.email}</p>
              </div>

              <select
                className="bg-slate-600 p-2 rounded text-white"
                value={m.present ? "1" : "0"}
                onChange={(e) =>
                  setAttendance((prev) => {
                    const copy = [...prev];
                    copy[i].present = e.target.value === "1";
                    return copy;
                  })
                }
              >
                <option value="1">✅ Present</option>
                <option value="0">❌ Absent</option>
              </select>

              <input
                type="text"
                placeholder="Remarks"
                className="bg-slate-600 p-2 rounded text-white"
                onChange={(e) =>
                  setAttendance((prev) => {
                    const copy = [...prev];
                    copy[i].remarks = e.target.value;
                    return copy;
                  })
                }
              />
            </div>
          ))}
        </div>

        {/* MOM Section */}
        <div className="bg-slate-800 p-6 rounded-2xl">
          <h2 className="text-xl text-sky-400 mb-4">🗒️ MOM Details</h2>
          <textarea
            name="summary"
            value={form.summary}
            onChange={(e) => handleChange(e, setForm)}
            placeholder="Meeting Summary"
            rows={3}
            className="w-full p-3 rounded bg-slate-700 text-white mb-3"
          />
          <textarea
            name="actionItems"
            value={form.actionItems}
            onChange={(e) => handleChange(e, setForm)}
            placeholder="Action Items"
            rows={3}
            className="w-full p-3 rounded bg-slate-700 text-white mb-3"
          />
          <textarea
            name="nextSteps"
            value={form.nextSteps}
            onChange={(e) => handleChange(e, setForm)}
            placeholder="Next Steps"
            rows={3}
            className="w-full p-3 rounded bg-slate-700 text-white mb-3"
          />
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={(e) => handleChange(e, setForm)}
            placeholder="Remarks"
            rows={2}
            className="w-full p-3 rounded bg-slate-700 text-white"
          />
        </div>

        {/* Next Meeting */}
        <div className="bg-slate-800 p-6 rounded-2xl">
          <h2 className="text-xl text-sky-400 mb-4">📅 Next Meeting</h2>
          <input
            type="text"
            name="title"
            value={nextMeeting.title}
            onChange={(e) => handleChange(e, setNextMeeting)}
            placeholder="Next Meeting Title"
            className="w-full p-3 mb-3 rounded bg-slate-700 text-white"
          />
          <input
            type="text"
            name="agenda"
            value={nextMeeting.agenda}
            onChange={(e) => handleChange(e, setNextMeeting)}
            placeholder="Agenda"
            className="w-full p-3 mb-3 rounded bg-slate-700 text-white"
          />
          <input
            type="datetime-local"
            name="meetingDateTime"
            value={nextMeeting.meetingDateTime}
            onChange={(e) => handleChange(e, setNextMeeting)}
            className="w-full p-3 mb-3 rounded bg-slate-700 text-white"
          />
          <input
            type="number"
            name="durationMinutes"
            value={nextMeeting.durationMinutes}
            onChange={(e) => handleChange(e, setNextMeeting)}
            placeholder="Duration (minutes)"
            className="w-full p-3 mb-3 rounded bg-slate-700 text-white"
          />
          <input
            type="text"
            name="location"
            value={nextMeeting.location}
            onChange={(e) => handleChange(e, setNextMeeting)}
            placeholder="Location"
            className="w-full p-3 mb-3 rounded bg-slate-700 text-white"
          />
          <select
            name="mode"
            value={nextMeeting.mode}
            onChange={(e) => handleChange(e, setNextMeeting)}
            className="w-full p-3 rounded bg-slate-700 text-white"
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={actionLoading}
          className={`px-6 py-3 ${
            actionLoading ? "bg-slate-500" : "bg-sky-600 hover:bg-sky-700"
          } text-white font-semibold rounded-lg`}
        >
          {actionLoading ? "Processing..." : "✅ Submit & Schedule Next Meeting"}
        </button>
      </form>
    </div>
  );
}
