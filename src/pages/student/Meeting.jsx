// src/components/Meeting/Meeting.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../context/api";

function fmtDateTime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}

const MODE_STYLES = {
  ONLINE: "bg-indigo-600 text-white",
  OFFLINE: "bg-emerald-600 text-white",
  DEFAULT: "bg-gray-500 text-white"
};

const STATUS_STYLES = {
  SCHEDULED: "bg-yellow-500 text-black",
  COMPLETED: "bg-green-600 text-white",
  CANCELLED: "bg-red-600 text-white",
  DEFAULT: "bg-gray-500 text-white"
};

function classMode(m) { return MODE_STYLES[m] || MODE_STYLES.DEFAULT; }
function classStatus(s) { return STATUS_STYLES[s] || STATUS_STYLES.DEFAULT; }

export default function Meeting() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get("/student/meetings");
        if (!cancelled) setMeetings(res.data || []);
      } catch (err) {
        console.error("Error fetching meetings:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-5 bg-[#071226] min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-sky-300 mb-4">My Meetings</h2>

        {/* Loading */}
        {loading && (
          <div className="text-center text-slate-300 py-6">Loading meetings…</div>
        )}

        {/* No meetings */}
        {!loading && meetings.length === 0 && (
          <div className="text-center py-6 text-slate-400">No meetings found</div>
        )}

        {/* Meetings table */}
        {!loading && meetings.length > 0 && (
          <div className="bg-[#0b1220] rounded-lg shadow ring-1 ring-white/5 overflow-auto">
            <table className="min-w-full">
              <thead className="bg-[#071226]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-slate-300">Title</th>
                  <th className="px-4 py-3 text-left text-sm text-slate-300">Team</th>
                  <th className="px-4 py-3 text-left text-sm text-slate-300">Date & Time</th>
                  <th className="px-4 py-3 text-left text-sm text-slate-300">Mode</th>
                  <th className="px-4 py-3 text-left text-sm text-slate-300">Duration</th>
                  <th className="px-4 py-3 text-left text-sm text-slate-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm text-slate-300">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800">
                {meetings.map(m => (
                  <tr key={m.id} className="hover:bg-[#0f1724]">
                    <td className="px-4 py-3 text-sm">{m.title}</td>
                    <td className="px-4 py-3 text-sm">{m.teamName}</td>
                    <td className="px-4 py-3 text-sm">{fmtDateTime(m.meetingDateTime)}</td>

                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${classMode(m.mode)}`}>
                        {m.mode}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {m.durationMinutes ? `${m.durationMinutes} min` : "-"}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${classStatus(m.status)}`}>
                        {m.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {/* NOTE: route path must match App.jsx -> /student/meeting/:id */}
                      <button
                        onClick={() => navigate(`/student/meeting/${m.id}`)}
                        className="bg-sky-600 hover:bg-sky-700 px-3 py-1 rounded text-white text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
