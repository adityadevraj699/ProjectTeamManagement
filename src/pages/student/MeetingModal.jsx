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

export default function MeetingModal({ show: showProp, meetingId: propMeetingId, onClose: onCloseProp }) {
  const params = useParams();
  const navigate = useNavigate();
  const idFromUrl = params.meetingId ?? params.id;
  const meetingId = propMeetingId ?? idFromUrl;

  const isPageMode = typeof showProp === "undefined" && !!idFromUrl;
  const show = isPageMode ? true : Boolean(showProp);

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

  // Load meeting details
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

  const Wrapper = ({ children }) => {
    if (isPageMode) {
      return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col">
          {children}
        </div>
      );
    }
    return (
      <div
        ref={overlayRef}
        onClick={onOverlayClick}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-0 md:p-4"
      >
        <div className="w-full h-full md:w-[95vw] md:h-[95vh] bg-slate-900 md:rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {children}
        </div>
      </div>
    );
  };

  return (
    <Wrapper>
      
      {/* 1. Fixed Header Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-5 border-b border-slate-700 flex justify-between items-center shrink-0">
          <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  <HiClipboardList className="text-sky-500"/>
                  Meeting Minutes
              </h1>
              <p className="text-slate-400 text-xs md:text-sm mt-1 ml-1 flex items-center gap-2">
                 {details ? (
                   <>
                     <span className="text-slate-300 font-medium">{details.title}</span>
                     <span className="opacity-50">|</span>
                     <span>{fmtDateTime(details.meetingDateTime)}</span>
                   </>
                 ) : "Loading details..."}
              </p>
          </div>
          
          <button 
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all border border-slate-700"
              title="Close"
          >
              <HiX className="text-xl"/>
          </button>
      </div>

      {/* 2. Scrollable Body Area */}
      <div className="flex-1 overflow-y-auto bg-[#0b1120] p-4 md:p-8 custom-scrollbar">
          {loading ? (
              <LoaderOverlay message="Retrieving Minutes..." />
          ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="inline-block p-4 rounded-full bg-red-500/10 text-red-500 mb-4 text-4xl">⚠️</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Error Loading Data</h3>
                  <p className="text-slate-400">{error}</p>
              </div>
          ) : details && (
              <div className="max-w-7xl mx-auto space-y-8 pb-10">
                  
                  {/* Top Row: Meta & Download */}
                  <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
                      {/* Grid of Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full flex-1">
                          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sky-400 text-sm font-bold uppercase"><HiCalendar/> Date</div>
                              <span className="text-slate-200 font-medium truncate">{new Date(details.meetingDateTime).toLocaleDateString()}</span>
                          </div>
                          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-purple-400 text-sm font-bold uppercase"><HiClock/> Duration</div>
                              <span className="text-slate-200 font-medium truncate">{details.durationMinutes ? `${details.durationMinutes} mins` : "N/A"}</span>
                          </div>
                          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold uppercase"><HiLocationMarker/> Location</div>
                              <span className="text-slate-200 font-medium truncate">{details.mode} {details.location ? `(${details.location})` : ""}</span>
                          </div>
                          
                          {/* ✅ Only show Team card if team name exists */}
                          {details.team?.teamName && (
                            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-amber-400 text-sm font-bold uppercase"><HiUserGroup/> Team</div>
                                <span className="text-slate-200 font-medium truncate">{details.team.teamName}</span>
                            </div>
                          )}
                      </div>

                      {/* Download Button */}
                      <div className="w-full lg:w-auto">
                          <button
                              onClick={downloadPdf}
                              className="w-full lg:w-auto h-full min-h-[80px] flex flex-col items-center justify-center gap-2 px-8 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-lg shadow-sky-900/20 transition-all active:scale-95"
                          >
                              <HiDownload className="text-2xl" /> 
                              <span>Download PDF</span>
                          </button>
                      </div>
                  </div>

                  <div className="w-full h-px bg-slate-800 my-6"></div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Left: Agenda & Minutes */}
                      <div className="lg:col-span-2 space-y-8">
                           {/* Agenda */}
                           <section>
                              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                  <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
                                  Meeting Agenda
                              </h3>
                              <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/60 text-slate-300 leading-relaxed text-sm md:text-base">
                                  {details.agenda || "No agenda provided."}
                              </div>
                           </section>

                           {/* Summary */}
                           <section>
                              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                  <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                                  Discussion Summary
                              </h3>
                              <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/60 text-slate-300 leading-relaxed space-y-6">
                                  <div className="prose prose-invert max-w-none">
                                    <p>{details.summary || details.meetingMinutes?.summary || "No summary available."}</p>
                                  </div>
                                  
                                  {(details.actionItems || details.meetingMinutes?.actionItems) && (
                                      <div className="bg-slate-900/60 p-5 rounded-xl border-l-4 border-emerald-500">
                                          <span className="block text-xs font-bold text-emerald-400 uppercase mb-2 tracking-wide">Action Items</span>
                                          <p className="text-sm md:text-base">{details.actionItems || details.meetingMinutes?.actionItems}</p>
                                      </div>
                                  )}
                                   {(details.nextSteps || details.meetingMinutes?.nextSteps) && (
                                      <div className="bg-slate-900/60 p-5 rounded-xl border-l-4 border-purple-500">
                                          <span className="block text-xs font-bold text-purple-400 uppercase mb-2 tracking-wide">Next Steps</span>
                                          <p className="text-sm md:text-base">{details.nextSteps || details.meetingMinutes?.nextSteps}</p>
                                      </div>
                                  )}
                              </div>
                           </section>
                      </div>

                      {/* Right: Attendance & Guide */}
                      <div className="lg:col-span-1 space-y-6">
                          {/* Attendance */}
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                                Attendance
                            </h3>
                            <div className="bg-slate-800/30 border border-slate-700/60 rounded-2xl overflow-hidden flex flex-col max-h-[500px]">
                                <div className="p-3 bg-slate-800/50 border-b border-slate-700/60 flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <span>Member</span>
                                    <span>Status</span>
                                </div>
                                <div className="overflow-y-auto flex-1 custom-scrollbar">
                                    {details.attendance && details.attendance.length > 0 ? (
                                        details.attendance.map((att, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-4 border-b border-slate-700/30 last:border-0 hover:bg-slate-700/20 transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200">{att.userName || att.name}</p>
                                                    {att.remarks && <p className="text-[10px] text-slate-400 mt-0.5 italic">"{att.remarks}"</p>}
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1.5 ${att.present ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                                    {att.present ? <><HiCheckCircle className="text-sm"/> Present</> : <><HiXCircle className="text-sm"/> Absent</>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 text-sm italic">No attendance records found.</div>
                                    )}
                                </div>
                            </div>
                          </div>

                          {/* Guide Info */}
                          <div className="bg-slate-800/30 border border-slate-700/60 rounded-xl p-5">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Project Guide</span>
                              <div className="flex items-center gap-4 mt-3">
                                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                      {details.createdBy?.name?.charAt(0) || "G"}
                                  </div>
                                  <div>
                                      <p className="text-base font-bold text-white">{details.createdBy?.name || "Unknown Guide"}</p>
                                      <p className="text-xs text-slate-400 mt-0.5">{details.createdBy?.email}</p>
                                  </div>
                              </div>
                          </div>
                      </div>

                  </div>
              </div>
          )}
      </div>
    </Wrapper>
  );
}