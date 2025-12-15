import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  HiCalendar, 
  HiClock, 
  HiUserGroup, 
  HiAnnotation,
  HiArrowRight,
  HiLocationMarker,
  HiClipboardList,
  HiDocumentDownload,
  HiTrash,
  HiPencil,
  HiSave,
  HiX
} from "react-icons/hi";

// 🔄 Reusable Spinner Icon
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// 💀 View MOM Skeleton Loader
const ViewMomSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 relative animate-pulse">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Title Skeleton */}
        <div className="flex flex-col items-center mb-10 space-y-3">
          <div className="h-10 w-96 bg-slate-800 rounded"></div>
          <div className="h-4 w-64 bg-slate-800/50 rounded"></div>
        </div>

        {/* Meeting & MOM Cards Skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-800 rounded-2xl border border-slate-700/50"></div>
          <div className="h-64 bg-slate-800 rounded-2xl border border-slate-700/50"></div>
        </div>

        {/* Attendance & Project Skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-800 rounded-2xl border border-slate-700/50"></div>
          <div className="h-64 bg-slate-800 rounded-2xl border border-slate-700/50"></div>
        </div>
      </div>
    </div>
  );
};

export default function ViewMom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ Page Skeleton
  const [downloading, setDownloading] = useState(false); // ✅ PDF Spinner
  const [saving, setSaving] = useState(false); // ✅ Update Spinner
  
  const [updatedMom, setUpdatedMom] = useState({
    summary: "",
    actionItems: "",
    nextSteps: "",
    remarks: "",
  });

  // ✅ Fetch MOM details
  useEffect(() => {
    const fetchMom = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/mom/${meetingId}`);
        setMeeting(res.data);
        setUpdatedMom({
          summary: res.data.meetingMinutes?.summary || "",
          actionItems: res.data.meetingMinutes?.actionItems || "",
          nextSteps: res.data.meetingMinutes?.nextSteps || "",
          remarks: res.data.meetingMinutes?.remarks || "",
        });
      } catch (err) {
        console.error("Error fetching MOM:", err);
        Swal.fire("Error", "Failed to load MOM details.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMom();
  }, [meetingId]);

  // ✅ Download MOM as PDF
  const handleDownloadPDF = async (meetingId) => {
    setDownloading(true); // Start Spinner
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/mom/${meetingId}/download`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `MOM_${meetingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
      Swal.fire("Error", "Failed to download MOM PDF.", "error");
    } finally {
      setDownloading(false); // Stop Spinner
    }
  };

  // ✅ Update MOM
  const handleUpdate = () => {
    Swal.fire({
      title: "Update MOM?",
      text: "Are you sure you want to update this MOM record?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Update",
      background: '#1e293b',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setSaving(true);
        try {
          await axios.put(`${import.meta.env.VITE_API_URL}/mom/${meetingId}`, updatedMom);
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: "MOM updated successfully.",
            timer: 1500,
            showConfirmButton: false,
            background: '#1e293b',
            color: '#fff'
          });
          setEditable(false);
        } catch {
          Swal.fire("Error", "Failed to update MOM.", "error");
        } finally {
          setSaving(false);
        }
      }
    });
  };

  // ✅ Delete MOM
  const handleDelete = () => {
    Swal.fire({
      title: "Delete MOM?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Delete it!",
      background: '#1e293b',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/mom/${meetingId}`);
          Swal.fire({
             icon: 'success',
             title: 'Deleted!',
             text: "MOM deleted successfully.",
             timer: 1500,
             showConfirmButton: false,
             background: '#1e293b',
             color: '#fff'
          });
          navigate(-1);
        } catch {
          Swal.fire("Error", "Failed to delete MOM.", "error");
        }
      }
    });
  };

  // ✅ Show SKELETON while loading data
  if (loading) return <ViewMomSkeleton />;

  const mom = meeting.meetingMinutes || {};
  const team = meeting.team || {};
  const project = team.project || {};

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 py-10 px-4 relative">
      <div className="max-w-7xl mx-auto relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute -top-2 left-0 bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 transition flex items-center gap-1 text-sm font-medium"
        >
          ← Back
        </button>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-sky-400 mb-1 flex items-center justify-center gap-2">
            <HiClipboardList /> Minutes of Meeting (MOM)
          </h1>
          <p className="text-gray-400 text-sm">
            <b>{team.teamName}</b> | {new Date(meeting.meetingDateTime).toLocaleString()}
          </p>
        </div>

        {/* PDF Download Button with Spinner */}
        <button
          onClick={() => handleDownloadPDF(meetingId)}
          disabled={downloading}
          className={`absolute top-0 right-0 flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-lg active:scale-95 ${
            downloading 
            ? "bg-purple-900/50 text-purple-300 cursor-not-allowed border border-purple-700" 
            : "bg-purple-600 hover:bg-purple-500 text-white"
          }`}
        >
          {downloading ? <Spinner /> : <HiDocumentDownload className="text-xl" />}
          {downloading ? "Downloading..." : "Download PDF"}
        </button>

        {/* 🟩 Row 1: Meeting + MOM Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Meeting Details */}
          <section className="bg-slate-800 border border-sky-900/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-sky-400 mb-4 flex items-center gap-2">
              <HiCalendar /> Meeting Details
            </h2>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-500 font-medium">Title</span>
                <span className="font-semibold text-white">{meeting.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-500 font-medium">Agenda</span>
                <span>{meeting.agenda}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-500 font-medium">Mode</span>
                <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">{meeting.mode}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-500 font-medium">Location</span>
                <span className="flex items-center gap-1"><HiLocationMarker /> {meeting.location}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${meeting.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{meeting.status}</span>
              </div>
            </div>
          </section>

          {/* MOM Summary */}
          <section className="bg-slate-800 border border-indigo-900/50 rounded-2xl p-6 shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-indigo-400 flex items-center gap-2">
                <HiAnnotation /> MOM Summary
              </h2>
              <button
                onClick={() => setEditable(!editable)}
                className="flex items-center gap-1 bg-indigo-600/20 text-indigo-300 border border-indigo-600/40 px-3 py-1.5 rounded-lg text-xs hover:bg-indigo-600 hover:text-white transition-colors"
              >
                {editable ? <><HiX /> Cancel</> : <><HiPencil /> Edit</>}
              </button>
            </div>

            {editable ? (
              <div className="space-y-4 flex-1">
                {["summary", "actionItems", "nextSteps", "remarks"].map((field) => (
                  <div key={field}>
                    <label className="text-xs uppercase font-bold text-slate-500 mb-1 block">{field.replace(/([A-Z])/g, ' $1')}</label>
                    <textarea
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-gray-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      rows="2"
                      value={updatedMom[field]}
                      onChange={(e) =>
                        setUpdatedMom({ ...updatedMom, [field]: e.target.value })
                      }
                    ></textarea>
                  </div>
                ))}
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className={`flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium w-full transition-all active:scale-95 ${saving ? "opacity-70 cursor-not-allowed" : "hover:bg-emerald-500"}`}
                >
                  {saving ? <Spinner /> : <HiSave className="text-lg" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              <div className="flex-1 space-y-4 text-sm">
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                  <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Summary</span>
                  <p className="text-slate-300">{mom.summary || "—"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                    <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Action Items</span>
                    <p className="text-slate-300">{mom.actionItems || "—"}</p>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                    <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Next Steps</span>
                    <p className="text-slate-300">{mom.nextSteps || "—"}</p>
                  </div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                  <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Remarks</span>
                  <p className="text-slate-300">{mom.remarks || "—"}</p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* 🟦 Row 2: Team + Project */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Attendance */}
          <section className="bg-slate-800 border border-emerald-900/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <HiUserGroup /> Attendance
            </h2>
            {meeting.attendance && meeting.attendance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="bg-slate-900/50 text-xs uppercase text-slate-500 font-bold">
                    <tr>
                      <th className="py-2 px-3 rounded-l-lg">Member</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 rounded-r-lg">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {meeting.attendance.map((a, idx) => (
                      <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                        <td className="py-2 px-3 font-medium text-white">{a.name}</td>
                        <td className="py-2 px-3">
                          {a.present ? (
                            <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs border border-emerald-400/20">Present</span>
                          ) : (
                            <span className="text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded text-xs border border-rose-400/20">Absent</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-400 italic">{a.remarks || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">No attendance recorded.</p>
            )}
          </section>

          {/* Project Details */}
          <section className="bg-slate-800 border border-amber-900/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <HiClipboardList /> Project Details
            </h2>
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase">Title</span>
                <p className="font-medium text-white text-lg">{project.projectTitle}</p>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase">Description</span>
                <p className="leading-relaxed bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">{project.description}</p>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-500 uppercase">Technologies</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {project.technologiesUsed?.split(',').map((tech, i) => (
                    <span key={i} className="bg-slate-700 text-slate-200 px-2 py-1 rounded text-xs border border-slate-600">{tech.trim()}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Delete Action */}
        <div className="flex justify-center pt-6 border-t border-slate-800">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 px-6 py-2.5 rounded-xl transition-all border border-red-900/50 hover:border-red-500"
          >
            <HiTrash className="text-lg" /> Delete this MOM Record
          </button>
        </div>
      </div>
    </div>
  );
}