import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { HiChevronDown, HiSearch, HiX } from "react-icons/hi"; 

// 🔄 Reusable High-End Loader Overlay (Still used for 'Processing Request...')
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] backdrop-blur-xl transition-all duration-300">
    <div className="relative w-24 h-24">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-sky-400 text-lg font-bold tracking-widest uppercase animate-pulse">{message || "Loading..."}</p>
  </div>
);

// 💀 Sophisticated Skeleton Loader for Meetings Page
const MeetingsSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-900 p-8 relative animate-pulse">
      {/* Title Skeleton */}
      <div className="h-8 w-64 bg-slate-800 rounded mb-6"></div>

      {/* Team Selector Skeleton */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center">
        <div className="h-4 w-24 bg-slate-800 rounded mb-2 md:mb-0 mr-3"></div>
        <div className="h-10 w-full md:w-1/2 bg-slate-800 rounded-lg"></div>
      </div>

      {/* Form Skeleton */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-10 w-full bg-slate-700 rounded-lg"></div>
          <div className="h-10 w-full bg-slate-700 rounded-lg"></div>
          <div className="h-10 w-full bg-slate-700 rounded-lg"></div>
          <div className="h-10 w-full bg-slate-700 rounded-lg"></div>
          <div className="h-10 w-full bg-slate-700 rounded-lg"></div>
        </div>
        <div className="h-24 w-full bg-slate-700 rounded-lg mt-4"></div>
        <div className="h-10 w-40 bg-slate-700 rounded-lg mt-5"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
        <div className="h-6 w-48 bg-slate-700 rounded mb-4"></div>
        <div className="w-full border border-slate-700 rounded-xl overflow-hidden">
          <div className="h-10 bg-slate-700 w-full"></div> {/* Table Header */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-800 border-b border-slate-700 w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Custom Searchable Dropdown Component
const SearchableSelect = ({ options, value, onChange, placeholder, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus input when opened & Reset search
  useEffect(() => {
    if (isOpen) {
        setSearchTerm(""); 
        if(inputRef.current) {
            inputRef.current.focus();
        }
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isLoading) setIsOpen(!isOpen);
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  
  // Filter options based on search term
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full md:w-1/2 z-50" ref={wrapperRef}>
      <div
        onClick={toggleDropdown}
        className={`bg-slate-700 text-white border ${
          isOpen ? "border-sky-400 ring-1 ring-sky-400" : "border-slate-600"
        } rounded-lg p-3 flex items-center justify-between cursor-pointer transition-all hover:border-slate-500`}
      >
        <span className={`truncate ${!selectedOption ? "text-gray-400" : ""}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <HiChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl z-50 max-h-64 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-100 w-full">
          
          <div className="p-2 border-b border-slate-700 bg-slate-800 sticky top-0 z-10">
            <div className="flex items-center bg-slate-900 rounded px-2 border border-slate-600 focus-within:border-sky-500 transition-colors">
              <HiSearch className="text-gray-400 mr-2 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent py-2 text-sm text-white focus:outline-none"
                onClick={(e) => e.stopPropagation()} 
              />
              {searchTerm && (
                <HiX
                  className="text-gray-400 cursor-pointer hover:text-white shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                    inputRef.current?.focus();
                  }}
                />
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-600">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-4 py-2 cursor-pointer hover:bg-sky-900/50 transition-colors text-sm ${
                    String(value) === String(opt.value) ? "bg-sky-900 text-sky-300" : "text-gray-200"
                  }`}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">No teams found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function GuideMeetings() {
  const navigate = useNavigate();

  // 🌀 State
  const [teams, setTeams] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [loading, setLoading] = useState(true); // Page loader (Skeleton)
  const [actionLoading, setActionLoading] = useState(false); // Action loader (Overlay)

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
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  };

  // ➤ Navigation handlers
  const handleMarkDone = (meetingId) => navigate(`/guide/meeting/${meetingId}`);
  const handleViewMom = (meetingId) => navigate(`/guide/viewmom/${meetingId}`);

  // ✅ Fetch Teams
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/guide/teams/mine`, axiosConfig);
      setTeams(res.data || []);
    } catch (err) {
      console.error("Fetch Teams Error:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to load teams",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Meetings by Team (with Sorting)
  const fetchMeetings = async (teamId) => {
    if (!teamId) return;
    setActionLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/guide/meetings/team/${Number(teamId)}`,
        axiosConfig
      );
      // Sort: Latest/Upcoming meetings first
      const sortedMeetings = (res.data || []).sort(
        (a, b) => new Date(b.meetingDateTime) - new Date(a.meetingDateTime)
      );
      setMeetings(sortedMeetings);
    } catch (err) {
      console.error("Fetch Meetings Error:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to load meetings",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeamId) fetchMeetings(selectedTeamId);
    else setMeetings([]); 
  }, [selectedTeamId]);

  // ✅ Input handler
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

    setActionLoading(true);
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
        err.response?.data?.message || "Failed to create meeting",
        "error"
      );
    } finally {
      setActionLoading(false);
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

    if (!confirm.isConfirmed) return;

    setActionLoading(true);
    try {
      await axios.delete(`${BASE_URL}/guide/meetings/${id}`, axiosConfig);
      Swal.fire("Deleted!", "Meeting deleted successfully.", "success");
      fetchMeetings(selectedTeamId);
    } catch (err) {
      console.error("Delete Meeting Error:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to delete meeting",
        "error"
      );
    } finally {
      setActionLoading(false);
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
        <input id="title" class="swal2-input" placeholder="Title" value="${String(meeting.title || "")}">
        <input id="agenda" class="swal2-input" placeholder="Agenda" value="${String(meeting.agenda || "")}">
        <input id="datetime" type="datetime-local" class="swal2-input" value="${String(meeting.meetingDateTime?.slice(0, 16) || "")}">
        <input id="duration" type="number" class="swal2-input" placeholder="Duration (min)" value="${String(meeting.durationMinutes || "")}">
        <input id="location" class="swal2-input" placeholder="Location" value="${String(meeting.location || "")}">
        <select id="mode" class="swal2-select">
          <option value="ONLINE" ${meeting.mode === "ONLINE" ? "selected" : ""}>Online</option>
          <option value="OFFLINE" ${meeting.mode === "OFFLINE" ? "selected" : ""}>Offline</option>
        </select>
        <select id="status" class="swal2-select">
          <option value="SCHEDULED" ${meeting.status === "SCHEDULED" ? "selected" : ""}>Scheduled</option>
          <option value="COMPLETED" ${meeting.status === "COMPLETED" ? "selected" : ""}>Completed</option>
          <option value="CANCELLED" ${meeting.status === "CANCELLED" ? "selected" : ""}>Cancelled</option>
        </select>
      `,
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

    if (!formValues) return;

    setActionLoading(true);
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
        err.response?.data?.message || "Failed to update meeting",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Prepare options for Searchable Select
  const teamOptions = teams.map(t => ({
    value: t.teamId,
    label: t.teamName
  }));

  // ✅ Use Skeleton Loader instead of Overlay Loader for initial fetch
  if (loading) return <MeetingsSkeleton />;

  // ✅ JSX
  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-8 relative">
      {actionLoading && <LoaderOverlay message="Processing Request..." />}

      <h1 className="text-3xl font-bold text-sky-400 mb-6">📅 Meeting Scheduler</h1>

      {/* ✅ Team Selector with Search */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center">
        <label className="block mb-2 md:mb-0 mr-3 font-semibold text-sky-300">Select Team:</label>
        
        <SearchableSelect 
          options={teamOptions} 
          value={selectedTeamId} 
          onChange={setSelectedTeamId} 
          placeholder="-- Search & Select Team --"
          isLoading={loading}
        />
      </div>

      {/* ✅ Create Meeting Form */}
      {selectedTeamId && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-sky-700/30 mb-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Meeting Title *"
              value={form.title}
              onChange={handleChange}
              className="bg-slate-700 text-white p-3 rounded-lg w-full focus:outline-none focus:border-sky-500 border border-slate-600"
            />
            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              className="bg-slate-700 text-white p-3 rounded-lg w-full focus:outline-none focus:border-sky-500 border border-slate-600"
            >
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
            <input
              type="datetime-local"
              name="meetingDateTime"
              value={form.meetingDateTime}
              onChange={handleChange}
              className="bg-slate-700 text-white p-3 rounded-lg w-full focus:outline-none focus:border-sky-500 border border-slate-600"
            />
            <input
              type="number"
              name="durationMinutes"
              placeholder="Duration (minutes)"
              value={form.durationMinutes}
              onChange={handleChange}
              className="bg-slate-700 text-white p-3 rounded-lg w-full focus:outline-none focus:border-sky-500 border border-slate-600"
            />
            <input
              type="text"
              name="location"
              placeholder="Location (for OFFLINE)"
              value={form.location}
              onChange={handleChange}
              className="bg-slate-700 text-white p-3 rounded-lg w-full focus:outline-none focus:border-sky-500 border border-slate-600"
            />
          </div>
          <textarea
            name="agenda"
            placeholder="Agenda / Description"
            value={form.agenda}
            onChange={handleChange}
            rows={3}
            className="bg-slate-700 text-white p-3 rounded-lg w-full mt-4 focus:outline-none focus:border-sky-500 border border-slate-600"
          />
          <button
            type="submit"
            className="mt-5 px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-white font-semibold transition-colors"
          >
            Create Meeting
          </button>
        </form>
      )}

      {/* ✅ Meetings Table */}
      {selectedTeamId && (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-sky-700/30">
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
                    <tr key={m.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-2 font-semibold text-sky-300">{m.title}</td>
                      <td className="px-4 py-2">{m.team?.teamName || "—"}</td>
                      <td className="px-4 py-2">
                        {new Date(m.meetingDateTime).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${m.mode === 'ONLINE' ? 'bg-emerald-900 text-emerald-300' : 'bg-orange-900 text-orange-300'}`}>
                          {m.mode}
                        </span>
                      </td>
                      <td className="px-4 py-2">{m.durationMinutes || "N/A"} min</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          m.status === 'COMPLETED' ? 'bg-blue-900 text-blue-300' : 
                          m.status === 'CANCELLED' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => handleView(m)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-xs transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(m)}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-xs transition-colors"
                        >
                          Edit
                        </button>
                        {m.meetingMinutes ? (
                          <button
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs transition-colors"
                            onClick={() => handleViewMom(m.id)}
                          >
                            MOM
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkDone(m.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-xs transition-colors"
                          >
                            Mark Done
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs transition-colors"
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
      )}
    </div>
  );
}