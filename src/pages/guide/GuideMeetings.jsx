import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";


export default function GuideMeetings() {

  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [form, setForm] = useState({
    title: "",
    agenda: "",
    meetingDateTime: "",
    durationMinutes: "",
    location: "",
    mode: "ONLINE",
  });

  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // ✅ Fetch Teams
  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/guide/teams/mine`, axiosConfig);
      console.log("Teams fetched:", res.data);
      setTeams(res.data || []);
    } catch (err) {
      console.error("Fetch Teams Error:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message ||
          String(err.response?.data) ||
          "Failed to load teams",
        "error"
      );
    }
  };

  // ✅ Fetch Meetings by Team
  const fetchMeetings = async (teamId) => {
    if (!teamId) return;
    try {
      const res = await axios.get(
        `${BASE_URL}/guide/meetings/team/${Number(teamId)}`,
        axiosConfig
      );
      console.log("Meetings fetched:", res.data);
      setMeetings(res.data || []);
    } catch (err) {
      console.error("Fetch Meetings Error:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message ||
          String(err.response?.data) ||
          "Failed to load meetings",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeamId) fetchMeetings(selectedTeamId);
  }, [selectedTeamId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Create Meeting
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeamId || !form.title || !form.meetingDateTime) {
      Swal.fire("Warning", "Please fill all required fields", "warning");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/guide/meetings/create/${Number(selectedTeamId)}`,
        form,
        axiosConfig
      );
      Swal.fire("Success", "Meeting created successfully", "success");
      setForm({
        title: "",
        agenda: "",
        meetingDateTime: "",
        durationMinutes: "",
        location: "",
        mode: "ONLINE",
      });
      fetchMeetings(selectedTeamId);
    } catch (err) {
      console.error("Create Meeting Error:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message ||
          String(err.response?.data) ||
          "Failed to create meeting",
        "error"
      );
    }
  };

  // ✅ Delete Meeting
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This meeting will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/guide/meetings/${id}`, axiosConfig);
        Swal.fire("Deleted!", "Meeting deleted successfully.", "success");
        fetchMeetings(selectedTeamId);
      } catch (err) {
        console.error("Delete Meeting Error:", err);
        Swal.fire(
          "Error",
          err.response?.data?.message ||
            String(err.response?.data) ||
            "Failed to delete meeting",
          "error"
        );
      }
    }
  };

  // ✅ View Meeting
  const handleView = (meeting) => {
    Swal.fire({
      title: String(meeting.title || "Meeting Details"),
      html: `
        <div style="text-align:left;line-height:1.6;">
          <b>Team:</b> ${String(meeting.team?.teamName || "N/A")}<br>
          <b>Agenda:</b> ${String(meeting.agenda || "—")}<br>
          <b>Date:</b> ${new Date(meeting.meetingDateTime).toLocaleString()}<br>
          <b>Mode:</b> ${String(meeting.mode)}<br>
          <b>Duration:</b> ${String(meeting.durationMinutes || "N/A")} min<br>
          <b>Status:</b> ${String(meeting.status || "—")}
        </div>
      `,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  // ✅ Edit Meeting
  const handleEdit = async (meeting) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Meeting",
      html: `
        <input id="title" class="swal2-input" placeholder="Title" value="${String(
          meeting.title || ""
        )}">
        <input id="agenda" class="swal2-input" placeholder="Agenda" value="${String(
          meeting.agenda || ""
        )}">
        <input id="datetime" type="datetime-local" class="swal2-input" value="${String(
          meeting.meetingDateTime?.slice(0, 16) || ""
        )}">
        <input id="duration" type="number" class="swal2-input" placeholder="Duration (min)" value="${String(
          meeting.durationMinutes || ""
        )}">
        <input id="location" class="swal2-input" placeholder="Location" value="${String(
          meeting.location || ""
        )}">
        <select id="mode" class="swal2-select">
          <option value="ONLINE" ${
            meeting.mode === "ONLINE" ? "selected" : ""
          }>Online</option>
          <option value="OFFLINE" ${
            meeting.mode === "OFFLINE" ? "selected" : ""
          }>Offline</option>
        </select>
        <select id="status" class="swal2-select">
          <option value="SCHEDULED" ${
            meeting.status === "SCHEDULED" ? "selected" : ""
          }>Scheduled</option>
          <option value="COMPLETED" ${
            meeting.status === "COMPLETED" ? "selected" : ""
          }>Completed</option>
          <option value="CANCELLED" ${
            meeting.status === "CANCELLED" ? "selected" : ""
          }>Cancelled</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => ({
        title: document.getElementById("title").value,
        agenda: document.getElementById("agenda").value,
        meetingDateTime: document.getElementById("datetime").value,
        durationMinutes: document.getElementById("duration").value,
        location: document.getElementById("location").value,
        mode: document.getElementById("mode").value,
        status: document.getElementById("status").value,
      }),
    });

    if (formValues) {
      try {
        await axios.put(
          `${BASE_URL}/guide/meetings/${meeting.id}`,
          formValues,
          axiosConfig
        );
        Swal.fire("Updated!", "Meeting updated successfully.", "success");
        fetchMeetings(selectedTeamId);
      } catch (err) {
        console.error("Edit Meeting Error:", err);
        Swal.fire(
          "Error",
          err.response?.data?.message ||
            String(err.response?.data) ||
            "Failed to update meeting",
          "error"
        );
      }
    }
  };

 // ✅ Mark Done + MOM + Next Meeting
const handleStatusUpdate = async (meeting) => {
  const { value: formValues } = await Swal.fire({
    title: "Meeting Completed - Add MOM & Schedule Next Meeting",
    html: `
      <h3 style="text-align:left;">📝 Meeting Minutes (MOM)</h3>
      <textarea id="summary" class="swal2-textarea" placeholder="Summary"></textarea>
      <textarea id="actionItems" class="swal2-textarea" placeholder="Action Items"></textarea>
      <textarea id="nextSteps" class="swal2-textarea" placeholder="Next Steps"></textarea>
      <textarea id="remarks" class="swal2-textarea" placeholder="Remarks"></textarea>
      <hr/>
      <h3 style="text-align:left;">📅 Next Meeting Details</h3>
      <input id="nextTitle" class="swal2-input" placeholder="Next Meeting Title">
      <input id="nextAgenda" class="swal2-input" placeholder="Agenda">
      <input id="nextDateTime" type="datetime-local" class="swal2-input">
      <input id="nextDuration" type="number" class="swal2-input" placeholder="Duration (minutes)">
      <input id="nextLocation" class="swal2-input" placeholder="Location (optional)">
      <select id="nextMode" class="swal2-select">
        <option value="ONLINE">Online</option>
        <option value="OFFLINE">Offline</option>
      </select>
    `,
    focusConfirm: false,
    showCancelButton: true,
    width: "800px",
    preConfirm: () => ({
      summary: document.getElementById("summary").value,
      actionItems: document.getElementById("actionItems").value,
      nextSteps: document.getElementById("nextSteps").value,
      remarks: document.getElementById("remarks").value,
      nextTitle: document.getElementById("nextTitle").value,
      nextAgenda: document.getElementById("nextAgenda").value,
      nextDateTime: document.getElementById("nextDateTime").value,
      nextDuration: document.getElementById("nextDuration").value,
      nextLocation: document.getElementById("nextLocation").value,
      nextMode: document.getElementById("nextMode").value,
    }),
  });

  if (!formValues) return;

  try {
    // 1️⃣ Create MOM
    await axios.post(
      `${BASE_URL}/guide/minutes/${meeting.id}`,
      {
        summary: formValues.summary,
        actionItems: formValues.actionItems,
        nextSteps: formValues.nextSteps,
        remarks: formValues.remarks,
      },
      axiosConfig
    );

    // 2️⃣ Mark current meeting as completed
    await axios.patch(
      `${BASE_URL}/guide/meetings/${meeting.id}/status?status=COMPLETED`,
      {},
      axiosConfig
    );

    // 3️⃣ Create Next Meeting
    await axios.post(
      `${BASE_URL}/guide/meetings/create/${meeting.team.teamId}`,
      {
        title: formValues.nextTitle,
        agenda: formValues.nextAgenda,
        meetingDateTime: formValues.nextDateTime,
        durationMinutes: formValues.nextDuration,
        location: formValues.nextLocation,
        mode: formValues.nextMode,
      },
      axiosConfig
    );

    Swal.fire("Success", "MOM saved & next meeting scheduled!", "success");
    fetchMeetings(selectedTeamId);
  } catch (err) {
    console.error("Mark Done Error:", err);
    Swal.fire(
      "Error",
      err.response?.data?.message || "Failed to complete the meeting process",
      "error"
    );
  }
};


  // ✅ JSX
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 p-8">
      <h1 className="text-3xl font-bold text-sky-400 mb-6">📅 Meeting Scheduler</h1>

      {/* ✅ Team Selector */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-sky-300">Select Team:</label>
        <select
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="bg-slate-700 text-white p-3 rounded-lg w-full md:w-1/2"
        >
          <option value="">-- Select Team --</option>
          {teams.map((team) => (
            <option key={team.teamId} value={team.teamId}>
              {team.teamName}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Create Meeting Form */}
      {selectedTeamId && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 mb-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Meeting Title *"
              value={form.title}
              onChange={handleChange}
              className="bg-slate-700 text-white p-3 rounded-lg w-full focus:ring-2 focus:ring-sky-500"
            />
            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              className="bg-slate-700 text-white p-3 rounded-lg w-full"
            >
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
            <input
              type="datetime-local"
              name="meetingDateTime"
              value={form.meetingDateTime}
              onChange={handleChange}
              className="bg-slate-700 text-white p-3 rounded-lg w-full"
            />
            <input
              type="number"
              name="durationMinutes"
              placeholder="Duration (minutes)"
              value={form.durationMinutes}
              onChange={handleChange}
              className="bg-slate-700 text-white p-3 rounded-lg w-full"
            />
            <input
              type="text"
              name="location"
              placeholder="Location (for OFFLINE)"
              value={form.location}
              onChange={handleChange}
              className="bg-slate-700 text-white p-3 rounded-lg w-full"
            />
          </div>
          <textarea
            name="agenda"
            placeholder="Agenda / Description"
            value={form.agenda}
            onChange={handleChange}
            rows={3}
            className="bg-slate-700 text-white p-3 rounded-lg w-full mt-4 focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            className="mt-5 px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-white font-semibold"
          >
            Create Meeting
          </button>
        </form>
      )}

      {/* ✅ Meetings Table */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
        <h2 className="text-2xl font-semibold text-sky-400 mb-4">Scheduled Meetings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-slate-700 rounded-xl overflow-hidden">
            <thead className="bg-slate-700 text-gray-200">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {meetings.length > 0 ? (
                meetings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/70 transition-all">
                    <td className="px-4 py-2 font-semibold text-sky-300">{m.title}</td>
                    <td className="px-4 py-2">{m.team?.teamName || "—"}</td>
                    <td className="px-4 py-2">
                      {new Date(m.meetingDateTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{m.mode}</td>
                    <td className="px-4 py-2">{m.durationMinutes || "N/A"} min</td>
                    <td className="px-4 py-2">{m.status}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleView(m)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(m)}
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded text-white"
                      >
                        Edit
                      </button>
                   {m.meetingMinutes ? (
  <button
    onClick={() =>
      Swal.fire({
        title: "📋 Meeting Minutes",
        html: `
          <div style="text-align:left;line-height:1.6;">
            <b>Summary:</b> ${m.meetingMinutes.summary || "—"}<br>
            <b>Action Items:</b> ${m.meetingMinutes.actionItems || "—"}<br>
            <b>Next Steps:</b> ${m.meetingMinutes.nextSteps || "—"}<br>
            <b>Remarks:</b> ${m.meetingMinutes.remarks || "—"}
          </div>
        `,
        icon: "info",
        confirmButtonText: "Close",
      })
    }
    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
  >
    View MOM
  </button>
) : (
  <button
    onClick={() => handleStatusUpdate(m)}
    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white"
  >
    Mark Done
  </button>
)}

                      <button
                        onClick={() => handleDelete(m.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-400">
                    No meetings scheduled for this team.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
