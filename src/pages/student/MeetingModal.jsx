import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../context/api";
import { 
  HiX, 
  HiDownload, 
  HiCalendar, 
  HiClock, 
  HiLocationMarker, 
  HiUserGroup, 
  HiClipboardList, 
  HiCheckCircle, 
  HiXCircle 
} from "react-icons/hi";

// 🔄 Reusable High-End Loader Overlay
const LoaderOverlay = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <div className="relative w-20 h-20">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-sky-400 text-lg font-bold tracking-widest uppercase animate-pulse">{message || "Loading..."}</p>
  </div>
);

function fmtDateTime(iso) {
  if (!iso) return "-";
  try { return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); } catch { return iso; }
}

/**
 * Usage:
 * - Modal mode: <MeetingModal show={true|false} meetingId={id} onClose={...} />
 * - Page mode (route): Mount at /student/meeting/:id (no props needed)
 */
export default function MeetingModal({ show: showProp, meetingId: propMeetingId, onClose: onCloseProp }) {
  const params = useParams(); // supports :id or :meetingId depending on your route
  const navigate = useNavigate();
  const idFromUrl = params.meetingId ?? params.id;
  const meetingId = propMeetingId ?? idFromUrl; // prefer explicit prop, otherwise route param

  // Determine whether component is used as a page (route) or as an inline modal
  const isPageMode = typeof showProp === "undefined" && !!idFromUrl;

  // when used as page, always show
  const show = isPageMode ? true : Boolean(showProp);

  // onClose: prefer provided prop; for page mode fall back to navigate(-1)
  const onClose = onCloseProp ?? (() => { if (isPageMode) navigate(-1); });

  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const overlayRef = useRef(null);

  // Escape key handler
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (show) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, onClose]);

  // load meeting details
  useEffect(() => {
    if (!show) return;
    if (!meetingId) {
      setError("No meeting id provided");
      setDetails(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/student/meetings/${meetingId}/full`);
        if (!cancelled) setDetails(res.data);
      } catch (err) {
        console.error("Failed to load meeting full details:", err);
        if (!cancelled) {
          setError("Unable to load meeting details");
          setDetails(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [show, meetingId]);

  if (!show) return null;

  const onOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Download PDF
  const downloadPdf = async () => {
    if (!meetingId) return;
    const url = `/student/meetings/${meetingId}/download`;
    try {
      const res = await api.get(url, { responseType: "blob" });
      const blob = new Blob([res.data], { type: res.data.type || "application/pdf" });
      const link = document.createElement("a");
      const href = URL.createObjectURL(blob);
      link.href = href;
      const safeTitle = (details?.title || "meeting").replaceAll(/[^a-zA-Z0-9\-_. ]/g, "");
      link.download = `${safeTitle}_MOM_${meetingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (err) {
      console.warn("Blob download failed — falling back to open:", err);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Wrapper Component (Modal vs Page)
  const Wrapper = ({ children }) => {
    if (isPageMode) {
      return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 py-10 px-4 flex justify-center">
          <div className="w-full max-w-5xl">{children}</div>
        </div>
      );
    }
    return (
      <div
        ref={overlayRef}
        onClick={onOverlayClick}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      >
        <div className="w-full max-w-5xl my-8 animate-in zoom-in-95 duration-200">{children}</div>
      </div>
    );
  };

  return (
    <Wrapper>
      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 border-b border-slate-700 flex justify-between items-start md:items-center">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <HiClipboardList className="text-sky-500"/>
                    Meeting Minutes
                </h1>
                <p className="text-slate-400 text-sm mt-1 ml-1">
                   {details ? `${details.title} • ${fmtDateTime(details.meetingDateTime)}` : "Loading details..."}
                </p>
            </div>
            
            <button 
                onClick={onClose}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
            >
                <HiX className="text-xl"/>
            </button>
        </div>

        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {loading ? (
                <LoaderOverlay message="Retrieving Minutes..." />
            ) : error ? (
                <div className="text-center py-12">
                    <div className="inline-block p-4 rounded-full bg-red-500/10 text-red-500 mb-4 text-3xl">⚠️</div>
                    <h3 className="text-xl font-bold text-white mb-2">Error Loading Data</h3>
                    <p className="text-slate-400">{error}</p>
                </div>
            ) : details && (
                <div className="space-y-8">
                    
                    {/* Top Row: Info & Actions */}
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                        {/* Meta Data */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center gap-3">
                                <div className="p-2.5 bg-sky-500/10 rounded-lg text-sky-400"><HiCalendar className="text-xl"/></div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-500 uppercase">Date</span>
                                    <span className="text-slate-200 font-medium">{new Date(details.meetingDateTime).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center gap-3">
                                <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400"><HiClock className="text-xl"/></div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-500 uppercase">Duration</span>
                                    <span className="text-slate-200 font-medium">{details.durationMinutes ? `${details.durationMinutes} mins` : "N/A"}</span>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400"><HiLocationMarker className="text-xl"/></div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-500 uppercase">Location</span>
                                    <span className="text-slate-200 font-medium">{details.mode} {details.location ? `(${details.location})` : ""}</span>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center gap-3">
                                <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400"><HiUserGroup className="text-xl"/></div>
                                <div>
                                    <span className="block text-xs font-bold text-slate-500 uppercase">Team</span>
                                    <span className="text-slate-200 font-medium">{details.team?.teamName || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="w-full md:w-auto">
                            <button
                                onClick={downloadPdf}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-900/20 transition-all active:scale-95"
                            >
                                <HiDownload className="text-xl" /> Download PDF
                            </button>
                        </div>
                    </div>

                    <hr className="border-slate-800" />

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Left Column: Agenda & MOM */}
                        <div className="lg:col-span-2 space-y-8">
                             {/* Agenda */}
                             <section>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-sky-500 rounded-full"></span>
                                    Meeting Agenda
                                </h3>
                                <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 text-slate-300 leading-relaxed">
                                    {details.agenda || "No agenda provided."}
                                </div>
                             </section>

                             {/* MOM Summary */}
                             <section>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                                    Discussion Summary
                                </h3>
                                <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 text-slate-300 leading-relaxed space-y-4">
                                    <p>{details.summary || details.meetingMinutes?.summary || "No summary available."}</p>
                                    
                                    {(details.actionItems || details.meetingMinutes?.actionItems) && (
                                        <div className="bg-slate-900/50 p-4 rounded-xl border-l-4 border-emerald-500">
                                            <span className="block text-xs font-bold text-emerald-400 uppercase mb-1">Action Items</span>
                                            {details.actionItems || details.meetingMinutes?.actionItems}
                                        </div>
                                    )}
                                     {(details.nextSteps || details.meetingMinutes?.nextSteps) && (
                                        <div className="bg-slate-900/50 p-4 rounded-xl border-l-4 border-purple-500">
                                            <span className="block text-xs font-bold text-purple-400 uppercase mb-1">Next Steps</span>
                                            {details.nextSteps || details.meetingMinutes?.nextSteps}
                                        </div>
                                    )}
                                </div>
                             </section>
                        </div>

                        {/* Right Column: Attendance */}
                        <div className="lg:col-span-1">
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                Attendance
                            </h3>
                            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden">
                                <div className="p-4 bg-slate-800/60 border-b border-slate-700/60 flex justify-between text-xs font-bold text-slate-400 uppercase">
                                    <span>Member</span>
                                    <span>Status</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {details.attendance && details.attendance.length > 0 ? (
                                        details.attendance.map((att, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-4 border-b border-slate-700/40 last:border-0 hover:bg-slate-700/20 transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200">{att.userName || att.name}</p>
                                                    {att.remarks && <p className="text-[10px] text-slate-400 mt-0.5 italic">"{att.remarks}"</p>}
                                                </div>
                                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${att.present ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                    {att.present ? <><HiCheckCircle/> Present</> : <><HiXCircle/> Absent</>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-slate-500 text-sm italic">No attendance records found.</div>
                                    )}
                                </div>
                            </div>

                            {/* Guide Info */}
                            <div className="mt-6 bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                                <span className="text-xs font-bold text-slate-500 uppercase">Guide</span>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                        {details.createdBy?.name?.charAt(0) || "G"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{details.createdBy?.name || "Unknown Guide"}</p>
                                        <p className="text-xs text-slate-400">{details.createdBy?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
      </div>
    </Wrapper>
  );
}