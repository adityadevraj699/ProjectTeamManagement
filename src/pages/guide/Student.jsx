import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Student() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [members, setMembers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [newMember, setNewMember] = useState({
    email: "",
    name: "",
    rollNumber: "",
    branchId: "",
    semesterId: "",
    sectionId: "",
    role: "",
    leader: false,
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // ✅ Fetch guide's teams
  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/guide/teams/mine`, axiosConfig);
      setTeams(res.data || []);
    } catch {
      Swal.fire("Error", "Failed to load teams", "error");
    }
  };


 


  // ✅ Fetch base academic data
  const fetchBaseData = async () => {
    try {
      const [b, s, sec] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/branches`, axiosConfig),
        axios.get(`${import.meta.env.VITE_API_URL}/semesters`, axiosConfig),
        axios.get(`${import.meta.env.VITE_API_URL}/sections`, axiosConfig),
      ]);
      setBranches(b.data);
      setSemesters(s.data);
      setSections(sec.data);
    } catch {
      Swal.fire("Error", "Failed to load academic data", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch members for selected team
  const fetchMembers = async (teamId) => {
    if (!teamId) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/guide/teams/${teamId}/members`, axiosConfig);
      setMembers(res.data || []);
    } catch {
      Swal.fire("Error", "Failed to load team members", "error");
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchBaseData();
  }, []);

  useEffect(() => {
    if (selectedTeam) fetchMembers(selectedTeam);
  }, [selectedTeam]);

  // ✅ Email check (autofill)
  const handleEmailBlur = async (email) => {
    if (!email) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/check-email`, {
        params: { email },
        headers: { Authorization: `Bearer ${token}` },
      });
      const { exists, isStudent, data } = res.data;
      if (exists && isStudent && data) {
        const confirm = await Swal.fire({
          title: "Student Found",
          text: "Autofill student details?",
          icon: "question",
          showCancelButton: true,
        });
        if (confirm.isConfirmed) {
          setNewMember({
            ...newMember,
            name: data.name,
            rollNumber: data.rollNumber,
            branchId: data.branchId,
            semesterId: data.semesterId,
            sectionId: data.sectionId,
          });
        }
      }
    } catch {
      Swal.fire("Error", "Failed to check email", "error");
    }
  };

  // ✅ Add member (leader is always false)
  const handleAddMember = async () => {
    const { email, role } = newMember;
    if (!selectedTeam) return Swal.fire("Error", "Select a team first", "error");
    if (!email || !role) return Swal.fire("Error", "Email and Role required", "error");

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/guide/teams/${selectedTeam}/members`,
        {
          ...newMember,
          leader: false, // Always false on add
        },
        axiosConfig
      );
      Swal.fire("Success", "Member added successfully", "success");
      setNewMember({
        email: "",
        name: "",
        rollNumber: "",
        branchId: "",
        semesterId: "",
        sectionId: "",
        role: "",
        leader: false,
      });
      fetchMembers(selectedTeam);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add member";
      Swal.fire("Error", msg, "error");
    }
  };

  // ✅ Delete member
  const handleDeleteMember = async (memberId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This member will be removed!",
      icon: "warning",
      showCancelButton: true,
    });
    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/guide/teams/members/${memberId}`, axiosConfig);
        Swal.fire("Deleted!", "Member removed successfully", "success");
        fetchMembers(selectedTeam);
      } catch {
        Swal.fire("Error", "Failed to delete member", "error");
      }
    }
  };

 // ✅ Update role/leader dynamically
const handleUpdate = async (memberId, role, leader) => {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/guide/teams/members/${memberId}`,
      null,
      { ...axiosConfig, params: { role, leader } }
    );

    // ✅ Smart message logic
    let message = "Member updated successfully!";
    if (leader === true) {
      message = "Member promoted to Leader!";
    } else if (leader === false) {
      message = "Member removed from Leader role.";
    }

    Swal.fire({
      icon: "success",
      title: "Updated",
      text: message,
      timer: 2000,
      showConfirmButton: false,
    });

    fetchMembers(selectedTeam);
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      err.response?.data ||
      "Failed to update member";
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
    });
  }
};


  // ✅ Save updated role to backend
const handleSaveRole = async (memberId, role) => {
  if (!role || role.trim() === "")
    return Swal.fire("Error", "Role cannot be empty", "error");

  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/guide/teams/members/${memberId}`,
      null,
      { ...axiosConfig, params: { role } }
    );

    Swal.fire({
      icon: "success",
      title: "Updated",
      text: "Member role updated successfully!",
      timer: 1800,
      showConfirmButton: false,
    });

    fetchMembers(selectedTeam);
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      err.response?.data ||
      "Failed to update member role";
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
    });
  }
};


  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-8">
      <h1 className="text-3xl font-bold text-sky-400 mb-6">Manage Team Members</h1>

      {/* Select Team */}
      <div className="mb-6">
        <label className="text-sky-300 font-semibold mr-3">Select Team:</label>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="bg-slate-800 text-white border border-sky-600 rounded-lg p-2"
        >
          <option value="">-- Choose a Team --</option>
          {teams.map((t) => (
            <option key={t.teamId} value={t.teamId}>
              {t.teamName}
            </option>
          ))}
        </select>
      </div>

      {selectedTeam && (
        <>
          {/* Add New Member */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-sky-700/30 mb-6">
            <h2 className="text-xl font-semibold text-sky-300 mb-4">Add New Member</h2>

            {/* Email, Name, Roll */}
            <div className="flex flex-wrap gap-3 mb-3">
              <input
                type="email"
                placeholder="Student Email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                onBlur={(e) => handleEmailBlur(e.target.value)}
                className="flex-1 bg-slate-700 px-3 py-2 rounded text-white border border-slate-600"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="flex-1 bg-slate-700 px-3 py-2 rounded text-white border border-slate-600"
              />
              <input
                type="text"
                placeholder="Roll Number"
                value={newMember.rollNumber}
                onChange={(e) => setNewMember({ ...newMember, rollNumber: e.target.value })}
                className="flex-1 bg-slate-700 px-3 py-2 rounded text-white border border-slate-600"
              />
            </div>

            {/* Branch, Semester, Section */}
            <div className="flex flex-wrap gap-3 mb-3">
              <select
                value={newMember.branchId}
                onChange={(e) => setNewMember({ ...newMember, branchId: e.target.value })}
                className="flex-1 bg-slate-700 px-3 py-2 rounded text-white border border-slate-600"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.branchName}</option>
                ))}
              </select>

              <select
                value={newMember.semesterId}
                onChange={(e) => setNewMember({ ...newMember, semesterId: e.target.value })}
                className="flex-1 bg-slate-700 px-3 py-2 rounded text-white border border-slate-600"
              >
                <option value="">Select Semester</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>{s.semesterName}</option>
                ))}
              </select>

              <select
                value={newMember.sectionId}
                onChange={(e) => setNewMember({ ...newMember, sectionId: e.target.value })}
                className="flex-1 bg-slate-700 px-3 py-2 rounded text-white border border-slate-600"
              >
                <option value="">Select Section</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.sectionName}</option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Role (e.g., Backend Developer)"
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                className="flex-1 bg-slate-700 px-3 py-2 rounded text-white border border-slate-600"
              />
              <button
                onClick={handleAddMember}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white"
              >
                Add Member
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-white/10">
            <h2 className="text-2xl font-semibold text-sky-400 mb-4">Team Members</h2>
            <table className="w-full text-sm text-left border border-slate-700 rounded-xl overflow-hidden">
              <thead className="bg-slate-700 text-gray-200">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Leader</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
  {members.length ? (
    members.map((m) => (
      <tr key={m.id}>
        <td className="px-4 py-2">{m.user.name}</td>
        <td className="px-4 py-2 text-sky-400">{m.user.email}</td>
        <td className="px-4 py-2">{m.user.branch || "N/A"}</td>
        <td className="px-4 py-2">{m.user.semester || "N/A"}</td>
        <td className="px-4 py-2">{m.user.section || "N/A"}</td>

        {/* Editable Role Column */}
        <td className="px-4 py-2">
          {m.editing ? (
            <input
              type="text"
              value={m.role}
              onChange={(e) =>
                setMembers((prev) =>
                  prev.map((mem) =>
                    mem.id === m.id ? { ...mem, role: e.target.value } : mem
                  )
                )
              }
              className="bg-slate-700 text-white px-2 py-1 rounded border border-slate-600"
            />
          ) : (
            m.role
          )}
        </td>

        {/* ✅ Stylish Toggle Switch for Leader */}
        <td className="px-4 py-2 text-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={m.leader}
              onChange={() => handleUpdate(m.id, m.role, !m.leader)}
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
          </label>
        </td>

        {/* Action Buttons */}
        <td className="px-4 py-2 space-x-2">
          {m.editing ? (
            <>
              <button
                onClick={() => handleSaveRole(m.id, m.role)}
                className="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() =>
                  setMembers((prev) =>
                    prev.map((mem) =>
                      mem.id === m.id ? { ...mem, editing: false } : mem
                    )
                  )
                }
                className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  setMembers((prev) =>
                    prev.map((mem) =>
                      mem.id === m.id ? { ...mem, editing: true } : mem
                    )
                  )
                }
                className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
              >
                Edit Role
              </button>

              <button
                onClick={() => handleDeleteMember(m.id)}
                className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </>
          )}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="8" className="text-center py-4 text-gray-400">
        No members in this team yet.
      </td>
    </tr>
  )}
</tbody>


            </table>
          </div>
        </>
      )}
    </div>
  );
}
