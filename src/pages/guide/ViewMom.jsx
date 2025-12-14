import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  HiCalendar, 
  HiClock, 
  HiUserGroup, 
  HiCheckCircle, 
  HiXCircle,
  HiClipboardList,
  HiAnnotation,
  HiArrowRight,
  HiLocationMarker
} from "react-icons/hi";

// 🔄 Reusable High-End Loader Overlay
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] backdrop-blur-xl transition-all duration-300">
    <div className="relative w-24 h-24">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-sky-400 text-lg font-bold tracking-widest uppercase animate-pulse">{message || "Loading..."}</p>
  </div>
);

export default function ViewMom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ Page loader
  const [actionLoading, setActionLoading] = useState(false); // ✅ Action loader
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
    setActionLoading(true);
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
      setActionLoading(false);
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
        setActionLoading(true);
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
          setActionLoading(false);
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
        setActionLoading(true);
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
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  // ✅ Page loading
  if (loading) return <LoaderOverlay message="Loading MOM Details..." />;

  const mom = meeting.meetingMinutes || {};
  const team = meeting.team || {};
  const project = team.project || {};
  const members = team.members || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 py-10 px-4 relative">
      {actionLoading && <LoaderOverlay message="Processing Request..." />}

      <div className="max-w-7xl mx-auto relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute -top-2 left-0 bg-sky-600 text-white px-3 py-1 rounded-md hover:bg-sky-700 transition"
        >
          ← Back
        </button>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-sky-400 mb-1">
            📋 Minutes of Meeting (MOM)
          </h1>
          <p className="text-gray-400 text-sm">
            <b>{team.teamName}</b> |{" "}
            {new Date(meeting.meetingDateTime).toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => handleDownloadPDF(meetingId)}
          className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 absolute top-0 right-0"
        >
          📄 Download PDF
        </button>

        {/* 🟩 Row 1: Meeting + MOM Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Meeting Details */}
          <section className="bg-slate-900/60 border border-sky-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-sky-400 mb-3">
              🗓️ Meeting Details
            </h2>
            <div className="grid gap-3 text-gray-300">
              <p><strong>Title:</strong> {meeting.title}</p>
              <p><strong>Agenda:</strong> {meeting.agenda}</p>
              <p><strong>Mode:</strong> {meeting.mode}</p>
              <p><strong>Location:</strong> {meeting.location}</p>
              <p><strong>Status:</strong> {meeting.status}</p>
            </div>
          </section>

          {/* MOM Summary */}
          <section className="bg-slate-900/60 border border-indigo-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-indigo-400">
                📝 MOM Summary
              </h2>
              <button
                onClick={() => setEditable(!editable)}
                className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
              >
                {editable ? "Cancel Edit" : "Edit"}
              </button>
            </div>

            {editable ? (
              <div className="space-y-4">
                {["summary", "actionItems", "nextSteps", "remarks"].map((field) => (
                  <textarea
                    key={field}
                    className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 text-gray-100 focus:outline-none focus:border-indigo-500"
                    rows="2"
                    value={updatedMom[field]}
                    onChange={(e) =>
                      setUpdatedMom({ ...updatedMom, [field]: e.target.value })
                    }
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  ></textarea>
                ))}
                <button
                  onClick={handleUpdate}
                  className="bg-emerald-600 text-white px-5 py-2 rounded-md hover:bg-emerald-700 w-full"
                >
                  💾 Save Changes
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-300 mb-3">
                  <strong>Summary:</strong> {mom.summary || "—"}
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-slate-800/80 p-3 border border-slate-700 rounded-lg">
                    <h4 className="font-semibold text-sky-300 mb-2">✅ Action Items</h4>
                    <p>{mom.actionItems || "—"}</p>
                  </div>
                  <div className="bg-slate-800/80 p-3 border border-slate-700 rounded-lg">
                    <h4 className="font-semibold text-sky-300 mb-2">🚀 Next Steps</h4>
                    <p>{mom.nextSteps || "—"}</p>
                  </div>
                </div>
                <div className="mt-4 bg-slate-800/80 p-3 border border-slate-700 rounded-lg">
                  <h4 className="font-semibold text-sky-300 mb-2">💬 Remarks</h4>
                  <p>{mom.remarks || "—"}</p>
                </div>
              </>
            )}
          </section>
        </div>

        {/* 🟦 Row 2: Team + Project */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Attendance */}
          <section className="bg-slate-900/60 border border-emerald-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-emerald-400 mb-3">
              👥 Attendance
            </h2>
            {meeting.attendance && meeting.attendance.length > 0 ? (
              <table className="w-full text-gray-300">
                <thead>
                  <tr className="border-b border-slate-600 text-left">
                    <th className="py-2">Member</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {meeting.attendance.map((a, idx) => (
                    <tr key={idx} className="border-b border-slate-700">
                      <td className="py-2">{a.name}</td>
                      <td className="py-2">
                        {a.present ? (
                          <span className="text-green-400">✅ Present</span>
                        ) : (
                          <span className="text-red-400">❌ Absent</span>
                        )}
                      </td>
                      <td className="py-2">{a.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-400">No attendance recorded for this meeting.</p>
            )}
          </section>

          {/* Project Details */}
          <section className="bg-slate-900/60 border border-amber-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-amber-400 mb-3">
              💻 Project Details
            </h2>
            <p><strong>Title:</strong> {project.projectTitle}</p>
            <p><strong>Description:</strong> {project.description}</p>
            <p><strong>Technologies:</strong> {project.technologiesUsed}</p>
          </section>
        </div>

        {/* Guide Section */}
        <div className="flex justify-center mb-10">
          <section className="w-full md:w-2/3 bg-slate-900/60 border border-slate-600 rounded-xl p-6 text-center">
            <h2 className="text-xl font-semibold text-slate-300 mb-3">👨‍🏫 Guide</h2>
            <p><strong>Name:</strong> {meeting.createdBy?.name}</p>
            <p><strong>Email:</strong> {meeting.createdBy?.email}</p>
          </section>
        </div>

        <div className="text-center">
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors shadow-lg shadow-red-900/20"
          >
            🗑️ Delete MOM
          </button>
        </div>
      </div>
    </div>
  );
}