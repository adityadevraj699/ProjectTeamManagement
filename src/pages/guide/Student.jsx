import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  HiUserGroup, 
  HiUserAdd, 
  HiTrash, 
  HiPencil, 
  HiStar, 
  HiSearch, 
  HiChevronDown, 
  HiX,
  HiOutlineUser
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

// ✅ Improved Searchable Dropdown Component
const SearchableSelect = ({ options, value, onChange, placeholder, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus input when opened & Reset search
  useEffect(() => {
    if (isOpen) {
        setSearchTerm(""); 
        if(inputRef.current) {
            inputRef.current.focus();
        }
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isLoading) setIsOpen(!isOpen);
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  
  // Filter options based on search term
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full md:w-1/2 z-50" ref={wrapperRef}>
      {/* Trigger Area */}
      <div
        onClick={toggleDropdown}
        className={`bg-slate-900 border ${
          isOpen ? "border-sky-500 ring-1 ring-sky-500" : "border-slate-700"
        } rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-slate-600`}
      >
        <span className={`truncate ${!selectedOption ? "text-slate-500" : "text-slate-200"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <HiChevronDown className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-100 w-full">
          
          {/* Search Input Sticky Header */}
          <div className="p-2 border-b border-slate-700 bg-slate-800 sticky top-0 z-10">
            <div className="flex items-center bg-slate-900 rounded-lg px-3 border border-slate-700 focus-within:border-sky-500 transition-colors">
              <HiSearch className="text-slate-500 mr-2 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent py-2 text-sm text-white focus:outline-none placeholder-slate-500"
                onClick={(e) => e.stopPropagation()} 
              />
              {searchTerm && (
                <HiX
                  className="text-slate-500 cursor-pointer hover:text-white shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                    inputRef.current?.focus();
                  }}
                />
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-600">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-4 py-2.5 cursor-pointer hover:bg-slate-700/50 transition-colors text-sm ${
                    String(value) === String(opt.value) ? "bg-sky-500/10 text-sky-400 font-medium" : "text-slate-300"
                  }`}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-500 text-sm">No teams found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [actionLoading, setActionLoading] = useState(false);
  const [editMember, setEditMember] = useState(null);

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

  const handleUpdateDetails = async (m) => {
    setActionLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/guide/teams/${selectedTeam}/team/update`,
        null,
        {
          ...axiosConfig,
          params: {
            memberId: m.id,
            role: m.role,
            name: m.user.name,
            rollNumber: m.user.rollNumber,
            branchId: m.user.branchId,
            semesterId: m.user.semesterId,
            sectionId: m.user.sectionId,
          },
        }
      );

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Member details updated successfully',
        timer: 1500,
        showConfirmButton: false
      });
      setEditMember(null);
      fetchMembers(selectedTeam);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Update failed",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Fetch members for selected team
  const fetchMembers = async (teamId) => {
    if (!teamId) return;
    setActionLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/guide/teams/${teamId}/members`, axiosConfig);
      const data = res.data || [];
      // Sort: Leader first, then alphabetically by name
      const sortedData = data.sort((a, b) => {
        if (a.leader === b.leader) {
          return a.user.name.localeCompare(b.user.name);
        }
        return a.leader ? -1 : 1;
      });
      setMembers(sortedData);
    } catch {
      Swal.fire("Error", "Failed to load team members", "error");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchBaseData();
  }, []);

  useEffect(() => {
    if (selectedTeam) fetchMembers(selectedTeam);
    else setMembers([]);
  }, [selectedTeam]);

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
          text: `Autofill details for ${data.name}?`,
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#0ea5e9",
          cancelButtonColor: "#64748b",
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
      // Silent fail or minimal toast
    }
  };

  const handleAddMember = async () => {
    const { email, role } = newMember;
    if (!selectedTeam) return Swal.fire("Error", "Select a team first", "error");
    if (!email || !role) return Swal.fire("Error", "Email and Role required", "error");

    setActionLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/guide/teams/${selectedTeam}/members`,
        { ...newMember, leader: false },
        axiosConfig
      );
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Member added successfully',
        timer: 1500,
        showConfirmButton: false
      });
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
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    const confirm = await Swal.fire({
      title: "Remove Member?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, remove",
    });

    if (confirm.isConfirmed) {
      setActionLoading(true);
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/guide/teams/members/${memberId}`, axiosConfig);
        Swal.fire({
            icon: 'success',
            title: 'Removed',
            text: 'Member removed successfully',
            timer: 1500,
            showConfirmButton: false
        });
        fetchMembers(selectedTeam);
      } catch {
        Swal.fire("Error", "Failed to delete member", "error");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleUpdate = async (memberId, role, leader) => {
    setActionLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/guide/teams/members/${memberId}`,
        null,
        { ...axiosConfig, params: { role, leader } }
      );

      const message = leader ? "Promoted to Leader!" : "Removed from Leader role.";
      
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: message,
        timer: 1500,
        showConfirmButton: false,
      });

      fetchMembers(selectedTeam);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update member";
      Swal.fire("Error", msg, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const teamOptions = teams.map(t => ({
    value: t.teamId,
    label: t.teamName
  }));

  if (loading) return <LoaderOverlay message="Loading Data..." />;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-10 font-sans selection:bg-sky-500/30">
      {actionLoading && <LoaderOverlay message="Processing..." />}

      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Team Members</h1>
        <p className="text-slate-400 text-sm">Manage student roles, details, and leadership within your teams.</p>
      </div>

      {/* Select Team Section - Added z-index relative to ensure it stays on top */}
      <div className="max-w-7xl mx-auto mb-8 bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm relative z-30">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <label className="text-slate-300 font-medium whitespace-nowrap">Select Team:</label>
          <SearchableSelect 
            options={teamOptions} 
            value={selectedTeam} 
            onChange={setSelectedTeam} 
            placeholder="-- Search & Select Team --"
            isLoading={loading}
          />
        </div>
      </div>

      {selectedTeam && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
          
          {/* Add New Member Form */}
          <div className="xl:col-span-1 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 h-fit backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
              <div className="p-2 bg-sky-500/10 rounded-lg">
                <HiUserAdd className="text-sky-400 text-xl" />
              </div>
              <h2 className="text-lg font-bold text-white">Add Member</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Student Info</label>
                <input
                  type="email"
                  placeholder="Student Email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  onBlur={(e) => handleEmailBlur(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all mb-3"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all mb-3"
                />
                <input
                  type="text"
                  placeholder="Roll Number"
                  value={newMember.rollNumber}
                  onChange={(e) => setNewMember({ ...newMember, rollNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Academic Details</label>
                <div className="grid grid-cols-1 gap-3">
                  <select
                    value={newMember.branchId}
                    onChange={(e) => setNewMember({ ...newMember, branchId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.branchName}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={newMember.semesterId}
                      onChange={(e) => setNewMember({ ...newMember, semesterId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    >
                      <option value="">Semester</option>
                      {semesters.map((s) => <option key={s.id} value={s.id}>{s.semesterName}</option>)}
                    </select>
                    <select
                      value={newMember.sectionId}
                      onChange={(e) => setNewMember({ ...newMember, sectionId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                    >
                      <option value="">Section</option>
                      {sections.map((s) => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Role</label>
                <input
                  type="text"
                  placeholder="e.g., Backend Developer"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>

              <button
                onClick={handleAddMember}
                className="w-full mt-2 bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-sky-900/20 active:scale-95"
              >
                Add Member
              </button>
            </div>
          </div>

          {/* Members List Table */}
          <div className="xl:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <HiUserGroup className="text-emerald-400 text-xl" />
              </div>
              <h2 className="text-lg font-bold text-white">Team Roster <span className="text-slate-500 font-normal text-sm ml-2">({members.length} Members)</span></h2>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700/80 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Student</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Academic</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold text-center">Leader</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {members.length > 0 ? (
                    members.map((m) => (
                      <tr key={m.id} className={`group hover:bg-slate-700/30 transition-colors ${m.leader ? "bg-amber-500/5 hover:bg-amber-500/10" : ""}`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${m.leader ? "bg-amber-500 text-black" : "bg-slate-700 text-slate-300"}`}>
                              {m.user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-white">{m.user.name}</div>
                              <div className="text-xs text-slate-500">{m.user.rollNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-400 text-xs font-mono">{m.user.email}</td>
                        <td className="px-4 py-4 text-slate-300 text-xs">
                          {m.user.branch || "-"} <br/>
                          <span className="text-slate-500">{m.user.semester} • {m.user.section}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="bg-slate-700/50 border border-slate-600 px-2.5 py-1 rounded-lg text-xs text-slate-300">
                            {m.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button 
                            onClick={() => handleUpdate(m.id, m.role, !m.leader)}
                            className={`p-1.5 rounded-lg transition-all ${m.leader ? "text-amber-400 bg-amber-400/10 hover:bg-amber-400/20" : "text-slate-600 hover:text-slate-400 hover:bg-slate-700"}`}
                            title={m.leader ? "Demote Leader" : "Promote to Leader"}
                          >
                            <HiStar className={`text-lg ${m.leader ? "fill-current" : ""}`} />
                          </button>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditMember(m)}
                              className="p-2 rounded-lg bg-slate-700/50 text-sky-400 hover:bg-sky-500 hover:text-white transition-all"
                              title="Edit Details"
                            >
                              <HiPencil />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(m.id)}
                              className="p-2 rounded-lg bg-slate-700/50 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                              title="Remove Member"
                            >
                              <HiTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-500">
                        <div className="flex flex-col items-center">
                          <HiOutlineUser className="text-4xl mb-2 opacity-20" />
                          <p>No members added yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editMember && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
          <div className="bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-in fade-in zoom-in duration-200 relative z-[101]">
            <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HiPencil className="text-sky-400" /> Update Member
              </h2>
              <button onClick={() => setEditMember(null)} className="text-slate-400 hover:text-white transition-colors">
                <HiX className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Name</label>
                  <input
                    value={editMember.user.name || ""}
                    onChange={(e) => setEditMember({ ...editMember, user: { ...editMember.user, name: e.target.value } })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Roll No</label>
                  <input
                    value={editMember.user.rollNumber || ""}
                    onChange={(e) => setEditMember({ ...editMember, user: { ...editMember.user, rollNumber: e.target.value } })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                <input
                  value={editMember.user.email || ""}
                  disabled
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Academic Info</label>
                <div className="grid grid-cols-1 gap-3">
                  <select
                    value={editMember.user.branchId}
                    onChange={(e) => setEditMember({ ...editMember, user: { ...editMember.user, branchId: e.target.value } })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="">Branch</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.branchName}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={editMember.user.semesterId}
                      onChange={(e) => setEditMember({ ...editMember, user: { ...editMember.user, semesterId: e.target.value } })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                    >
                      <option value="">Semester</option>
                      {semesters.map((s) => <option key={s.id} value={s.id}>{s.semesterName}</option>)}
                    </select>
                    <select
                      value={editMember.user.sectionId}
                      onChange={(e) => setEditMember({ ...editMember, user: { ...editMember.user, sectionId: e.target.value } })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                    >
                      <option value="">Section</option>
                      {sections.map((s) => <option key={s.id} value={s.id}>{s.sectionName}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Role</label>
                <input
                  value={editMember.role || ""}
                  onChange={(e) => setEditMember({ ...editMember, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setEditMember(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateDetails(editMember)}
                className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-sky-900/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}