// src/components/TeamDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../context/api";
import Swal from "sweetalert2";

function fmtDate(d) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch (e) {
    return d;
  }
}

function InitialsAvatar({ name, size = 10 }) {
  const initials = (name || "U").split(" ").map(n => n[0]).slice(0,2).join("");
  const px = size === 12 ? "w-12 h-12 text-base" : size === 10 ? "w-10 h-10 text-sm" : "w-9 h-9 text-xs";
  return (
    <div className={`rounded-full ${px} flex items-center justify-center font-semibold text-white`} 
         style={{ background: "linear-gradient(135deg,#06b6d4,#7c3aed)" }}>
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  const cls = s === "COMPLETED" ? "bg-green-600" : s === "ONGOING" ? "bg-emerald-500" : "bg-violet-600";
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls} text-white`}>{s || "N/A"}</span>;
}

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // contact form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/teams/${id}/details`);
        console.log("Team details:", res.data);
        if (!mounted) return;
        setTeam(res.data.team);
      } catch (err) {
        console.error("Failed to load team details", err);
        Swal.fire("Error", err?.response?.data?.message || err?.message, "error");
        navigate(-1);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetch();
    return () => { mounted = false; };
  }, [id, navigate]);

  const handleContact = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      Swal.fire("Validation", "Subject and message are required", "warning");
      return;
    }
    setSending(true);
    try {
      const res = await api.post(`/teams/${id}/contact`, { subject, message });
      Swal.fire("Success", res.data.message || "Message sent", "success");
      setSubject(""); setMessage("");
    } catch (err) {
      console.error("Contact error", err);
      Swal.fire("Error", err?.response?.data?.message || "Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] p-6">
        <div className="max-w-6xl mx-auto animate-pulse space-y-4">
          <div className="h-40 bg-[#0F172A] rounded-2xl" />
          <div className="h-8 bg-[#0F172A] rounded" />
          <div className="h-72 bg-[#0F172A] rounded" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0B1220] p-6 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0F172A] p-6 rounded-2xl">Team not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] p-6">
      <div className="max-w-7xl mx-auto text-gray-100">
        {/* Row 1: two cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team management card */}
          <div className="bg-[#0F172A] p-6 rounded-2xl ring-1 ring-white/10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-sky-400">{team.teamName}</h2>
                <div className="mt-2 text-sm text-gray-300">
                  Created: <span className="font-medium text-gray-200">{fmtDate(team.createdDate)}</span>
                </div>
                <div className="mt-3 text-sm text-gray-300">
                  Members: <span className="font-semibold">{team.totalMembers ?? (team.members || []).length}</span>
                </div>
                <div className="mt-2 text-sm">
                  Status: <StatusBadge status={team.projectStatus || (team.projectTitle ? "PENDING" : "")} />
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <InitialsAvatar name={team.teamName} size={12} />
                <button onClick={() => navigate(-1)} className="mt-2 px-3 py-1 rounded bg-[#162033] text-white text-sm">← Back</button>
              </div>
            </div>
          </div>

          {/* Project details card */}
          <div className="bg-[#0F172A] p-6 rounded-2xl ring-1 ring-white/10">
            <h3 className="text-2xl font-semibold text-violet-400">Project Details</h3>
            <div className="mt-4 space-y-2 text-sm text-gray-300">
              <div><strong>Title:</strong> {team.projectTitle || "-"}</div>
              <div><strong>Tech Stack:</strong> {team.technologiesUsed || "-"}</div>
              <div><strong>Start:</strong> {fmtDate(team.projectStart)} <strong className="mx-2">|</strong> <strong>End:</strong> {fmtDate(team.projectEnd)}</div>
              <div className="mt-2"><strong>Description:</strong> <span className="text-gray-300">{team.projectDescription || "-"}</span></div>
            </div>
          </div>
        </div>

        {/* Row 2: Members table (full width) */}
        <div className="mt-8 bg-[#061023] p-4 rounded-2xl ring-1 ring-white/6">
          <h3 className="text-xl font-semibold text-sky-400 mb-4">Team Members</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-xs text-gray-400">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Leader</th>
                  <th className="py-3 px-4">Profile</th>
                </tr>
              </thead>
              <tbody>
                {(team.members || []).map(m => (
                  <tr key={m.id} className="border-t border-[#0B1220]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div><InitialsAvatar name={m.name} /></div>
                        <div>
                          <div className="font-medium text-gray-100">{m.name}</div>
                          <div className="text-xs text-gray-400">{m.contactNo || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">{m.email || "-"}</td>
                    <td className="py-3 px-4 text-sm">{m.rollNumber || "-"}</td>
                    <td className="py-3 px-4 text-sm">{m.course || "-"}</td>
                    <td className="py-3 px-4 text-sm">{m.branch || "-"}</td>
                    <td className="py-3 px-4 text-sm">{m.section || "-"}</td>
                    <td className="py-3 px-4 text-sm">{m.semester || "-"}</td>
                    <td className="py-3 px-4 text-sm">{m.role || "-"}</td>
                    <td className="py-3 px-4 text-sm">
                      {m.leader ? <span className="text-yellow-400 font-semibold">Leader</span> : <span className="text-gray-400">Member</span>}
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => navigate(`/profile/${m.userId || m.id}`)} className="px-3 py-1 bg-sky-600 rounded text-white text-sm">View</button>
                    </td>
                  </tr>
                ))}
                {(!team.members || team.members.length === 0) && (
                  <tr><td colSpan={10} className="py-6 px-4 text-center text-gray-400">No members found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 3: Guide details + contact */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* guide card */}
          <div className="col-span-1 lg:col-span-1 bg-[#0F172A] p-6 rounded-2xl ring-1 ring-white/10">
            <h4 className="text-lg font-semibold text-violet-300">Guide</h4>
            {team.guide ? (
              <div className="mt-4">
                <div className="flex items-center gap-4">
                  <InitialsAvatar name={team.guide.name} size={12} />
                  <div>
                    <div className="font-medium text-gray-100">{team.guide.name}</div>
                    <div className="text-sm text-gray-400">{team.guide.email}</div>
                    <div className="text-sm text-gray-400">{team.guide.contactNo}</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-300">
                  <div><strong>Assigned Project:</strong> {team.projectTitle || "-"}</div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-gray-400 italic">No guide assigned</div>
            )}
          </div>

          {/* contact form (bigger) */}
          <div className="col-span-1 lg:col-span-2 bg-[#061023] p-6 rounded-2xl ring-1 ring-white/6">
            <h4 className="text-lg font-semibold text-sky-400">Contact Guide</h4>
            <form onSubmit={handleContact} className="mt-4 space-y-3">
              <input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0F172A] border border-white/5 text-gray-100"
              />
              <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0F172A] border border-white/5 text-gray-100"
                rows={5}
              />
              <div className="flex gap-3">
                <button type="submit" disabled={sending} className={`px-4 py-2 rounded text-white ${sending ? "bg-slate-600" : "bg-sky-600 hover:bg-sky-700"}`}>
                  {sending ? "Sending..." : "Send Message"}
                </button>
                <button type="button" onClick={() => { setSubject(""); setMessage(""); }} className="px-3 py-2 rounded bg-[#162033] text-white">Clear</button>
              </div>
              <div className="text-xs text-gray-400">Messages are saved and the guide will be notified (server-side).</div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
