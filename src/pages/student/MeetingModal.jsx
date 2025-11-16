// src/components/Meeting/MeetingModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../context/api";

function fmtDateTime(iso) {
  if (!iso) return "-";
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
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

  // Download PDF - tries blob download first, falls back to opening the URL.
  const downloadPdf = async () => {
    if (!meetingId) return;
    const url = `/student/meetings/${meetingId}/download`;
    try {
      const res = await api.get(url, { responseType: "blob" });
      const blob = new Blob([res.data], { type: res.data.type || "application/pdf" });
      const link = document.createElement("a");
      const href = URL.createObjectURL(blob);
      link.href = href;
      // safe filename
      const safeTitle = (details?.title || "meeting").replaceAll(/[^a-zA-Z0-9\-_. ]/g, "");
      link.download = `${safeTitle}_MOM_${meetingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
    } catch (err) {
      console.warn("Blob download failed — falling back to open:", err);
      // fallback: open in new tab (server should set Content-Disposition to attachment)
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // choose wrapper: overlay for modal, simple container for page
  const Wrapper = ({ children }) => {
    if (isPageMode) {
      // full-page layout (no dark overlay)
      return (
        <div className="min-h-screen bg-[#071226] text-slate-200 py-8 px-4">
          <div className="max-w-[1200px] mx-auto">{children}</div>
        </div>
      );
    }
    return (
      <div
        ref={overlayRef}
        onClick={onOverlayClick}
        className="fixed inset-0 z-50 bg-gradient-to-b from-[#071226]/95 to-[#0b1220]/95 text-slate-200 overflow-auto"
        aria-modal="true"
        role="dialog"
      >
        <div className="max-w-[1200px] mx-auto px-6 py-8 min-h-screen">{children}</div>
      </div>
    );
  };

  return (
    <Wrapper>
      {/* topbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="bg-sky-600 hover:bg-sky-700 px-3 py-2 rounded text-white text-sm shadow"
            aria-label="Back"
          >
            ← Back
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-sky-400 leading-tight">
            <span className="inline-block mr-2">📋</span>
            Minutes of Meeting (MOM)
          </h1>
          <div className="text-sm text-slate-400 mt-1">
            {details ? `${details.title || ""} | ${fmtDateTime(details.meetingDateTime)}` : (loading ? "Loading…" : "")}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadPdf}
            className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded text-white text-sm shadow"
            aria-label="Download PDF"
          >
            📄 Download PDF
          </button>
        </div>
      </div>

      {/* state */}
      {loading && <div className="text-center py-8 text-slate-300">Loading meeting…</div>}
      {!loading && error && <div className="text-center py-6 text-red-400">{error}</div>}

      {/* content */}
      {!loading && details && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meeting Details */}
            <div className="rounded-xl border border-slate-700 p-6 bg-[#071a2a] shadow-inner">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-sky-300 text-xl">📅</div>
                <h2 className="text-xl font-semibold text-sky-300">Meeting Details</h2>
              </div>

              <div className="mt-3 text-sm text-slate-300 space-y-2">
                <p><span className="font-semibold text-slate-100">Title:</span> {details.title || "-"}</p>
                <p><span className="font-semibold text-slate-100">Agenda:</span> {details.agenda || "-"}</p>
                <p><span className="font-semibold text-slate-100">Mode:</span> {details.mode || "-"}</p>
                <p><span className="font-semibold text-slate-100">Date & Time:</span> {fmtDateTime(details.meetingDateTime)}</p>
                <p><span className="font-semibold text-slate-100">Duration:</span> {details.durationMinutes ? `${details.durationMinutes} min` : "-"}</p>
                <p><span className="font-semibold text-slate-100">Location:</span> {details.location || "-"}</p>
                <p><span className="font-semibold text-slate-100">Status:</span> {details.status || "-"}</p>
              </div>

              <div className="mt-4 text-sm text-slate-300">
                <p className="font-semibold text-slate-100">Created By:</p>
                {details.createdBy ? (
                  <div className="text-slate-300">
                    <p>{details.createdBy.name || "-"}</p>
                    <p className="text-xs text-slate-400">{details.createdBy.email || "-"}</p>
                  </div>
                ) : <p className="text-slate-400">-</p>}
              </div>
            </div>

            {/* MOM Summary */}
            <div className="rounded-xl border border-slate-700 p-6 bg-[#071a2a] shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-amber-400 text-xl">📝</div>
                  <h2 className="text-xl font-semibold text-amber-300">MOM Summary</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-sm text-slate-300"><strong>Summary:</strong></p>
                  <p className="mt-1 text-slate-400">{details.summary || "-"}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded border border-slate-800 bg-[#0a1726]">
                    <p className="text-sky-300 font-semibold">✅ Action Items</p>
                    <p className="text-slate-400 mt-2">{details.actionItems || "-"}</p>
                  </div>
                  <div className="p-3 rounded border border-slate-800 bg-[#0a1726]">
                    <p className="text-pink-300 font-semibold">🚀 Next Steps</p>
                    <p className="text-slate-400 mt-2">{details.nextSteps || "-"}</p>
                  </div>
                </div>

                <div className="p-3 rounded border border-slate-800 bg-[#0a1726]">
                  <p className="text-sky-300 font-semibold">💬 Remarks</p>
                  <p className="text-slate-400 mt-2">{details.remarks || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance + Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="rounded-xl border border-slate-800 p-5 bg-[#071a2a]">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-emerald-400 text-xl">👥</div>
                <h3 className="text-lg font-semibold text-emerald-300">Attendance</h3>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-300 mb-3">
                <div>
                  <p><strong>Total:</strong> {details.totalCount ?? (details.attendance ? details.attendance.length : 0)}</p>
                  <p><strong>Present:</strong> {details.presentCount ?? "-"}</p>
                  <p><strong>Absent:</strong> {details.absentCount ?? "-"}</p>
                </div>
                <div className="text-xs text-slate-400">Updated: {fmtDateTime(details.meetingDateTime)}</div>
              </div>

              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-300">
                      <th className="py-2">Member</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {Array.isArray(details.attendance) && details.attendance.length > 0 ? (
                      details.attendance.map((a, idx) => (
                        <tr key={a.id || idx} className="hover:bg-[#0f1724]">
                          <td className="py-3">{a.userName || "-"}</td>
                          <td className="py-3">
                            {a.present ? (
                              <span className="inline-flex items-center gap-2 px-2 py-1 rounded text-xs bg-green-600 text-white">✅ Present</span>
                            ) : (
                              <span className="inline-flex items-center gap-2 px-2 py-1 rounded text-xs bg-red-600 text-white">❌ Absent</span>
                            )}
                          </td>
                          <td className="py-3 text-slate-400">{a.remarks || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-4 text-slate-400" colSpan={3}>No attendance records</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-slate-300">
                <p className="font-semibold text-slate-100">Team Members ({(details.teamMembers || []).length})</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.isArray(details.teamMembers) && details.teamMembers.length > 0 ? (
                    details.teamMembers.map(tm => (
                      <div key={tm.id} className="px-3 py-1 rounded bg-[#0a1726] text-slate-300 text-xs">
                        {tm.name || tm.email}
                      </div>
                    ))
                  ) : <div className="text-slate-400 text-xs">No members</div>}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-700 p-5 bg-[#071a2a]">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-amber-300 text-xl">💻</div>
                <h3 className="text-lg font-semibold text-amber-300">Project Details</h3>
              </div>

              <div className="text-sm text-slate-300 space-y-2">
                <p><strong>Title:</strong> {details.projectTitle || details.project?.projectTitle || "-"}</p>
                <p><strong>Description:</strong> {details.projectDescription || details.project?.description || "-"}</p>
                <p><strong>Technologies:</strong> {details.projectTechnologies || details.project?.technologiesUsed || "-"}</p>
              </div>
            </div>
          </div>

          {/* Guide card */}
          <div className="rounded-xl border border-slate-700 p-6 bg-[#06121b] mt-6">
            <div className="flex items-center gap-4">
              <div className="text-2xl">🧑‍🏫</div>
              <div>
                <h4 className="text-lg font-semibold text-sky-300">Guide</h4>
                {details.guide ? (
                  <div className="text-sm text-slate-300 mt-1">
                    <p className="font-medium text-slate-100">{details.guide.name}</p>
                    <p className="text-xs text-slate-400">{details.guide.email}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 mt-1">No guide information</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Wrapper>
  );
}
