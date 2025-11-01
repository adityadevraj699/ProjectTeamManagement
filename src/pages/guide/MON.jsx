import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function MON() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    summary: "",
    actionItems: "",
    nextSteps: "",
    remarks: "",
  });

  const [nextMeeting, setNextMeeting] = useState({
    title: "",
    agenda: "",
    meetingDateTime: "",
    durationMinutes: "",
    location: "",
    mode: "ONLINE",
  });

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
      try {
        const res = await axios.get(`${BASE_URL}/guide/meetings/${meetingId}`, axiosConfig);
        setMeeting(res.data);
      } catch (err) {
        console.error("❌ Error fetching meeting:", err);
        Swal.fire("Error", "Failed to load meeting details.", "error");
      }
    };
    fetchMeeting();
  }, [meetingId]);

  // ✅ Controlled input handler
  const handleChange = (e, setFunc) => {
    const { name, value } = e.target;
    setFunc((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit MOM + Next Meeting
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    if (!form.summary || !form.actionItems || !form.nextSteps) {
      Swal.fire("Warning", "Please fill all required MOM fields!", "warning");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        mom: form,
        nextMeeting:
          nextMeeting.title && nextMeeting.meetingDateTime
            ? nextMeeting
            : null,
      };

      // ✅ Single POST → backend handles MOM creation, status update & next meeting creation
      const momRes = await axios.post(
        `${BASE_URL}/mom/${meetingId}`,
        payload,
        axiosConfig
      );

      console.log("✅ MOM Created Successfully:", momRes.data);
      Swal.fire("Success", "MOM saved and meeting status updated!", "success");
      navigate("/guide/meetings");
    } catch (err) {
      console.error("❌ MOM creation error:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to complete meeting process.";
      Swal.fire("Error", message.toString(), "error");
    } finally {
      setLoading(false);
    }
  };

  if (!meeting)
    return (
      <div className="p-10 text-center text-gray-400">
        Loading meeting details...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-8">
      <h1 className="text-3xl font-bold text-sky-400 mb-4">
        📝 Meeting Minutes (MOM)
      </h1>

      {/* Meeting Info */}
      <div className="bg-slate-800 p-6 rounded-2xl mb-6">
        <h2 className="text-xl text-sky-300 font-semibold mb-2">
          Meeting: {meeting.title}
        </h2>
        <p><b>Team:</b> {meeting.team?.teamName}</p>
        <p>
          <b>Date:</b>{" "}
          {new Date(meeting.meetingDateTime).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        <p><b>Mode:</b> {meeting.mode}</p>
        <p><b>Status:</b> {meeting.status}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Next Meeting Section */}
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
          disabled={loading}
          className={`px-6 py-3 ${
            loading ? "bg-slate-500" : "bg-sky-600 hover:bg-sky-700"
          } text-white font-semibold rounded-lg`}
        >
          {loading ? "Processing..." : "✅ Submit & Schedule Next Meeting"}
        </button>
      </form>
    </div>
  );
}
