import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { HiMail, HiMailOpen, HiCheckCircle } from "react-icons/hi";

/* --- Icons --- */
const Icons = {
  Pdf: () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l3 3 3-3"/><path d="M12 18v-6"/></svg>),
  Excel: () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M10 9h4"/></svg>),
  Upload: () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>),
  Search: () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
  Spinner: () => (<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>),
  Edit: () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  View: () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>)
};

// 🔄 Reusable Action Loader Overlay (Used for ephemeral actions like markRead)
const ActionLoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm transition-all duration-300">
    <div className="bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3">
      <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-sky-400">{message || "Updating..."}</p>
    </div>
  </div>
);

// 💀 Message List Skeleton (Initial Load - Dark Mode Ready)
const MessageListSkeleton = () => (
    <div className="max-w-5xl mx-auto min-h-screen p-4 md:p-8 font-sans">
        
        {/* Header and Tabs Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 animate-pulse">
            {/* Header Title */}
            <div className="h-8 w-40 bg-slate-800 rounded"></div> 
            
            {/* Filter Tabs Placeholder */}
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                <div className="h-10 w-24 bg-emerald-600/50 rounded-md mr-1"></div>
                <div className="h-10 w-28 bg-slate-800 rounded-md"></div>
            </div>
        </div>

        {/* Messages List Container Skeleton */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[400px] divide-y divide-slate-800 animate-pulse">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 flex items-start gap-4">
                    {/* Avatar Placeholder - Slightly darker for contrast */}
                    <div className="w-12 h-12 rounded-full flex-shrink-0 bg-slate-700"></div>

                    {/* Content Placeholder */}
                    <div className="flex-1 min-w-0 space-y-2 pt-1">
                        <div className="flex justify-between items-start">
                            {/* Sender Name */}
                            <div className="h-4 w-3/5 bg-slate-700 rounded"></div>
                            {/* Time */}
                            <div className="h-3 w-1/6 bg-slate-700 rounded"></div>
                        </div>
                        {/* Team Name */}
                        <div className="h-3 w-1/4 bg-slate-800 rounded"></div>
                        {/* Subject/Message Preview */}
                        <div className="h-4 w-full bg-slate-700 rounded"></div>
                    </div>
                    
                    {/* Action Placeholder */}
                    <div className="flex flex-col items-end justify-center self-center pl-2">
                         {/* Read/Unread Icon placeholder */}
                         <div className="w-6 h-6 bg-emerald-500/10 rounded-full"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


export default function Query() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [filterType, setFilterType] = useState("UNREAD"); // "UNREAD" (default) or "ALL"
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const BASE = import.meta.env.VITE_API_URL || "/api";
  const token = localStorage.getItem("token");
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  // --- 1. Fetch Messages ---
  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/messages/received`, config);
      const data = res.data.messages || [];
      // Sort: Latest first
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setMessages(sorted);
    } catch (err) {
      console.error("fetchMessages err:", err);
      Swal.fire("Error", "Unable to load messages", "error");
    } finally {
      setLoading(false);
    }
  }

  // --- 2. Filter Logic (Runs when messages or filterType changes) ---
  useEffect(() => {
    if (filterType === "UNREAD") {
      setFilteredMessages(messages.filter((m) => !m.readByGuide));
    } else {
      setFilteredMessages(messages);
    }
  }, [filterType, messages]);

  // --- 3. Mark as Read ---
  async function markRead(e, id) {
    e.stopPropagation(); // Prevent opening modal
    setActionLoading(true);
    try {
      await axios.put(`${BASE}/messages/${id}/mark-read`, {}, config);
      // Optimistic Update: Update local state immediately
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, readByGuide: true } : m))
      );
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Marked as read',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to mark read", "error");
    } finally {
      setActionLoading(false);
    }
  }

  // --- 4. View Message Modal ---
  function viewMessage(m) {
    // Automatically mark as read when viewed if unread
    if (!m.readByGuide) {
        axios.put(`${BASE}/messages/${m.id}/mark-read`, {}, config)
              .then(() => {
                  setMessages((prev) => prev.map((msg) => (msg.id === m.id ? { ...msg, readByGuide: true } : msg)));
              })
              .catch(console.error);
    }

    Swal.fire({
      title: `<span class="text-xl font-bold text-gray-800">${m.subject || "Message"}</span>`,
      html: `
        <div class="text-left bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg">
                ${(m.senderName || "U").charAt(0).toUpperCase()}
            </div>
            <div>
                <p class="text-sm font-bold text-gray-800">${m.senderName || "Unknown"}</p>
                <p class="text-xs text-gray-500">${m.teamName || "No Team"}</p>
            </div>
          </div>
          <div class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            ${m.message || "No content"}
          </div>
          <p class="text-xs text-gray-400 mt-4 text-right">
            Sent: ${m.createdAt ? new Date(m.createdAt).toLocaleString() : "Unknown"}
          </p>
        </div>
      `,
      width: 600,
      showCloseButton: true,
      showConfirmButton: false,
      background: '#fff',
      customClass: {
        popup: 'rounded-xl shadow-2xl'
      }
    });
  }

  // --- 5. Helper: Format Time ---
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString();
    }
  };

  // --- RENDER ---
  if (loading) return <MessageListSkeleton />;

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 p-4 md:p-8 font-sans">
      {actionLoading && <ActionLoaderOverlay message="Updating..." />}

      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <HiMail className="text-emerald-500" /> Inbox
          </h2>

          {/* Filter Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setFilterType("UNREAD")}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                filterType === "UNREAD"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Unread
              {messages.filter(m => !m.readByGuide).length > 0 && (
                <span className="ml-2 bg-white text-emerald-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {messages.filter(m => !m.readByGuide).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                filterType === "ALL"
                  ? "bg-sky-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              All Messages
            </button>
          </div>
        </div>

        {/* Messages List Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
          
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
              <HiMailOpen className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">No {filterType.toLowerCase()} messages found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredMessages.map((m) => (
                <div
                  key={m.id}
                  onClick={() => viewMessage(m)}
                  className={`group relative p-4 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:bg-slate-800/50 
                    ${!m.readByGuide ? "bg-slate-800/30 border-l-4 border-emerald-500" : "border-l-4 border-transparent"}
                  `}
                >
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold shadow-md
                    ${!m.readByGuide ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400"}
                  `}>
                    {(m.senderName || "U").charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-base truncate ${!m.readByGuide ? "font-bold text-white" : "font-medium text-slate-300"}`}>
                        {m.senderName || "Unknown Sender"}
                      </h4>
                      <span className={`text-xs whitespace-nowrap ${!m.readByGuide ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                        {formatTime(m.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-400 mb-1 truncate">{m.teamName || "No Team Associated"}</p>
                    
                    <p className={`text-sm line-clamp-1 ${!m.readByGuide ? "text-slate-200" : "text-slate-500"}`}>
                      <span className="font-semibold text-slate-400">{m.subject} — </span>
                      {m.message}
                    </p>
                  </div>

                  {/* Actions (Visible if Unread) */}
                  <div className="flex flex-col items-end justify-center self-center pl-2">
                    {!m.readByGuide && (
                      <button
                        onClick={(e) => markRead(e, m.id)}
                        className="p-2 rounded-full text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                        title="Mark as Read"
                      >
                        <HiCheckCircle className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}