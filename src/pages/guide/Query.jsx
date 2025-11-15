import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Query() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const BASE = import.meta.env.VITE_API_URL || "/api";
  const token = localStorage.getItem("token");
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/messages/received`, config);
      // res.data.messages expected as an array of ContactMessageDTO
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("fetchMessages err:", err);
      Swal.fire("Error", "Unable to load messages", "error");
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id) {
    setMarking(true);
    try {
      await axios.put(`${BASE}/messages/${id}/mark-read`, {}, config);
      Swal.fire("Marked", "Message marked read", "success");
      fetchMessages();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to mark read", "error");
    } finally {
      setMarking(false);
    }
  }

  function viewMessage(m) {
    const html = `
      <div style="padding:10px;">
        <p><strong>Subject:</strong> ${escapeHtml(m.subject)}</p>
        <p><strong>From:</strong> ${escapeHtml(m.senderName || "Unknown")}</p>
        <p><strong>Team:</strong> ${escapeHtml(m.teamName || "N/A")}</p>
        <p style="margin-top:8px;">${escapeHtml(m.message).replace(/\n/g,'<br/>')}</p>
        <p style="font-size:12px;color:#999;margin-top:8px">${m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}</p>
      </div>
    `;
    Swal.fire({ title: m.subject || "Message", html, width: 700, showCloseButton: true });
  }

  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;");
  }

  return (
    <div className="min-h-screen bg-[#071226] text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-sky-300 mb-4">Messages</h2>

        {loading ? (
          <div className="p-6 text-center">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-6 text-center text-slate-400">No messages found</div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`p-4 rounded-lg shadow ${m.readByGuide ? "bg-slate-800" : "bg-slate-900 ring-1 ring-amber-600/30"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-100">{m.subject}</div>
                        <div className="text-xs text-slate-400">{m.senderName || "Unknown"} • {m.teamName || "No Team"}</div>
                      </div>
                      {!m.readByGuide && <span className="ml-2 px-2 py-0.5 bg-amber-500 text-black text-xs rounded">NEW</span>}
                    </div>

                    <div className="mt-2 text-sm text-slate-300 line-clamp-3">{m.message}</div>

                    <div className="mt-2 text-xs text-slate-500">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => viewMessage(m)} className="px-3 py-1 bg-sky-600 rounded text-white text-xs">View</button>

                    {!m.readByGuide && (
                      <button onClick={() => markRead(m.id)} disabled={marking} className="px-3 py-1 bg-emerald-600 rounded text-white text-xs">
                        {marking ? "..." : "Mark read"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
