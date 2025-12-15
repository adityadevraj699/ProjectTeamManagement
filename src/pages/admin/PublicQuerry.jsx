import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiSearch, HiTrash, HiOutlineMail, HiPhone, 
  HiCalendar, HiChatAlt2, HiFilter, HiX, HiInbox 
} from "react-icons/hi";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// 🎨 Helper to generate consistent avatar colors
const getAvatarColor = (name) => {
  const colors = ["bg-rose-500", "bg-sky-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-pink-500"];
  const index = name ? name.length % colors.length : 0;
  return colors[index];
};

export default function PublicQuerry() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null); // ID of currently open message
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateSort, setDateSort] = useState("newest"); // 'newest' | 'oldest'

  // --- API CALLS ---
  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/public-queries`);
      setQueries(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load messages', background: '#1e293b', color: '#fff' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Message?',
      text: "This cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Delete',
      background: '#1e293b',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/public-queries/${id}`);
        setQueries((prev) => prev.filter((q) => q.id !== id));
        if (selectedId === id) setSelectedId(null); // Deselect if deleted
        
        // Small toast notification
        const Toast = Swal.mixin({
          toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
          background: '#1e293b', color: '#fff', iconColor: '#10b981'
        });
        Toast.fire({ icon: 'success', title: 'Message deleted' });

      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete', background: '#1e293b', color: '#fff' });
      }
    }
  };

  // --- FILTER LOGIC ---
  const filteredList = useMemo(() => {
    let result = [...queries];

    // 1. Search (Checks Name, Email, Subject)
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(q => 
        (q.name || "").toLowerCase().includes(lower) ||
        (q.email || "").toLowerCase().includes(lower) ||
        (q.subject || "").toLowerCase().includes(lower)
      );
    }

    // 2. Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateSort === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [queries, searchTerm, dateSort]);

  // Selected Query Object
  const activeMessage = queries.find(q => q.id === selectedId);

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 flex flex-col font-sans overflow-hidden">
      
      <main className="flex-1 flex max-w-[1600px] mx-auto w-full h-[calc(100vh-60px)] mt-4 mb-4 px-4 gap-6">
        
        {/* === LEFT SIDEBAR (List View) === */}
        <div className="w-full md:w-[400px] flex flex-col bg-slate-900/50 border border-slate-700/50 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl">
          
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-700/50 bg-slate-900/80 sticky top-0 z-10">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <HiInbox className="text-sky-400" /> Inbox 
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{filteredList.length}</span>
              </h1>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                <HiFilter />
              </button>
            </div>

            <div className="relative">
              <HiSearch className="absolute left-3 top-3 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder-slate-500"
              />
            </div>

            {/* Filter Dropdown */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 flex gap-2">
                    <button 
                      onClick={() => setDateSort("newest")}
                      className={`text-xs px-3 py-1.5 rounded-lg border ${dateSort === 'newest' ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'border-slate-700 text-slate-400'}`}
                    >
                      Newest First
                    </button>
                    <button 
                      onClick={() => setDateSort("oldest")}
                      className={`text-xs px-3 py-1.5 rounded-lg border ${dateSort === 'oldest' ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'border-slate-700 text-slate-400'}`}
                    >
                      Oldest First
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm animate-pulse">Loading inbox...</div>
            ) : filteredList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <HiChatAlt2 className="text-4xl mb-2 opacity-20" />
                <p>No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredList.map((q) => (
                  <div 
                    key={q.id}
                    onClick={() => setSelectedId(q.id)}
                    className={`p-4 cursor-pointer transition-all hover:bg-slate-800/50 ${selectedId === q.id ? 'bg-slate-800/80 border-l-4 border-sky-500' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-semibold text-sm truncate pr-2 ${selectedId === q.id ? 'text-white' : 'text-slate-200'}`}>
                        {q.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-sky-400 truncate mb-1">
                      {q.subject || "No Subject"}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {q.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* === RIGHT SIDEBAR (Detail View) === */}
        <div className="hidden md:flex flex-1 bg-slate-900/50 border border-slate-700/50 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl flex-col relative">
          
          {/* Decorative BG */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

          {activeMessage ? (
            <>
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-700/50 flex justify-between items-start bg-slate-900/30">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${getAvatarColor(activeMessage.name)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                    {activeMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{activeMessage.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                      <span className="flex items-center gap-1 hover:text-sky-400 transition-colors cursor-pointer" onClick={() => window.open(`mailto:${activeMessage.email}`)}>
                        <HiOutlineMail /> {activeMessage.email}
                      </span>
                      {activeMessage.phone && (
                        <span className="flex items-center gap-1">
                          <HiPhone /> {activeMessage.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1">
                    <HiCalendar /> {new Date(activeMessage.createdAt).toLocaleString()}
                  </span>
                  <button 
                    onClick={() => handleDelete(activeMessage.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete Message"
                  >
                    <HiTrash className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="mb-6">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</span>
                  <h3 className="text-lg font-semibold text-white mt-1">{activeMessage.subject || "No Subject"}</h3>
                </div>
                
                <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl rounded-tl-none relative">
                   <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                     {activeMessage.message}
                   </p>
                </div>
              </div>

              {/* Action Footer (Reply Placeholder) */}
              <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
                 <button 
                   onClick={() => window.open(`mailto:${activeMessage.email}?subject=Re: ${activeMessage.subject}`)}
                   className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                 >
                   <HiOutlineMail className="text-lg" /> Reply via Email
                 </button>
              </div>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                <HiChatAlt2 className="text-4xl text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300">Select a message</h3>
              <p className="text-sm">Choose a query from the list to view details.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}