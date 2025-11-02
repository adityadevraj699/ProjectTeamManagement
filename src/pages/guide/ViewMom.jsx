import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function ViewMom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [editable, setEditable] = useState(false);
  const [updatedMom, setUpdatedMom] = useState({
    summary: "",
    actionItems: "",
    nextSteps: "",
    remarks: "",
  });

  useEffect(() => {
    axios
      .get(`http://localhost:8800/api/mom/${meetingId}`)
      .then((res) => {
        setMeeting(res.data);
        setUpdatedMom({
          summary: res.data.meetingMinutes?.summary || "",
          actionItems: res.data.meetingMinutes?.actionItems || "",
          nextSteps: res.data.meetingMinutes?.nextSteps || "",
          remarks: res.data.meetingMinutes?.remarks || "",
        });
      })
      .catch((err) => console.error("Error fetching MOM:", err));
  }, [meetingId]);

  if (!meeting)
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-900 text-sky-300">
        Loading MOM...
      </div>
    );

  const mom = meeting.meetingMinutes || {};
  const team = meeting.team || {};
  const project = team.project || {};
  const members = team.members || [];

  const handleUpdate = () => {
    Swal.fire({
      title: "Update MOM?",
      text: "Are you sure you want to update this MOM record?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Update",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(`http://localhost:8800/api/mom/${meetingId}`, updatedMom)
          .then(() => {
            Swal.fire("Updated!", "MOM updated successfully.", "success");
            setEditable(false);
          })
          .catch(() => {
            Swal.fire("Error", "Failed to update MOM.", "error");
          });
      }
    });
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Delete MOM?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:8800/api/mom/${meetingId}`)
          .then(() => {
            Swal.fire("Deleted!", "MOM deleted successfully.", "success");
            navigate(-1);
          })
          .catch(() => {
            Swal.fire("Error", "Failed to delete MOM.", "error");
          });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 py-10 px-4">
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
                    className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 text-gray-100"
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
                  className="bg-emerald-600 text-white px-5 py-2 rounded-md hover:bg-emerald-700"
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
          {/* Team Members */}
          <section className="bg-slate-900/60 border border-emerald-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-emerald-400 mb-3">
              👥 Team Members
            </h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {members.map((m, idx) => (
                <li key={idx}>
                  {m.name} — {m.role} {m.leader ? "(Leader)" : ""}
                </li>
              ))}
            </ul>
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

        {/* 🟨 Row 3: Guide (Full Width) */}
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
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md"
          >
            🗑️ Delete MOM
          </button>
        </div>
      </div>
    </div>
  );
}
