// src/components/Tasks.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { HiChevronDown, HiSearch, HiX } from "react-icons/hi";

// 🔄 Reusable High-End Loader Overlay (Still used for Actions)
const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] backdrop-blur-xl transition-all duration-300">
    <div className="relative w-24 h-24">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-t-4 border-sky-500 rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-sky-400 text-lg font-bold tracking-widest uppercase animate-pulse">{message || "Processing..."}</p>
  </div>
);

// 💀 Sophisticated Skeleton Loader for Tasks Page
const TasksSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-900 p-8 relative animate-pulse">
      {/* Title Skeleton */}
      <div className="h-8 w-64 bg-slate-800 rounded mb-6"></div>

      {/* Team Selector Skeleton */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center">
        <div className="h-4 w-24 bg-slate-800 rounded mb-2 md:mb-0 mr-3"></div>
        <div className="h-10 w-full md:w-1/3 bg-slate-800 rounded-lg"></div>
      </div>

      {/* Create Task Form Skeleton */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 mb-8">
        <div className="h-6 w-48 bg-slate-700 rounded mb-4"></div>
        <div className="h-24 w-full bg-slate-700 rounded-lg mb-3"></div>
        <div className="grid md:grid-cols-3 sm:grid-cols-1 gap-3 mb-3">
          <div className="h-10 w-full bg-slate-700 rounded-lg"></div>
          <div className="h-10 w-full bg-slate-700 rounded-lg"></div>
          <div className="h-10 w-full bg-slate-700 rounded-lg"></div>
        </div>
        <div className="flex gap-3 mb-3">
          <div className="h-10 w-1/3 bg-slate-700 rounded-lg"></div>
          <div className="h-10 w-2/3 bg-slate-700 rounded-lg"></div>
        </div>
        <div className="h-10 w-32 bg-slate-700 rounded-lg"></div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 flex flex-wrap gap-3 items-center">
        <div className="h-6 w-24 bg-slate-700 rounded"></div>
        <div className="h-10 w-32 bg-slate-700 rounded-lg"></div>
        <div className="h-10 w-32 bg-slate-700 rounded-lg"></div>
        <div className="h-10 w-32 bg-slate-700 rounded-lg"></div>
        <div className="h-10 w-32 bg-slate-700 rounded-lg"></div>
      </div>

      {/* Task Table Skeleton */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
        <div className="h-6 w-40 bg-slate-700 rounded mb-4"></div>
        <div className="w-full border border-slate-700 rounded-xl overflow-hidden">
          <div className="h-10 bg-slate-700 w-full"></div> {/* Header */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-800 border-b border-slate-700 w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Custom Searchable Dropdown Component
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
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full md:w-1/3 z-50" ref={wrapperRef}>
      <div
        onClick={toggleDropdown}
        className={`bg-slate-800 text-white border ${
          isOpen ? "border-sky-400 ring-1 ring-sky-400" : "border-sky-600"
        } rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all`}
      >
        <span className={`truncate ${!selectedOption ? "text-gray-400" : ""}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <HiChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl z-50 max-h-64 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-100 w-full">
          <div className="p-2 border-b border-slate-700 bg-slate-800 sticky top-0 z-10">
            <div className="flex items-center bg-slate-900 rounded px-2 border border-slate-600 focus-within:border-sky-500 transition-colors">
              <HiSearch className="text-gray-400 mr-2 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent py-2 text-sm text-white focus:outline-none"
                onClick={(e) => e.stopPropagation()} 
              />
              {searchTerm && (
                <HiX
                  className="text-gray-400 cursor-pointer hover:text-white shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                    inputRef.current?.focus();
                  }}
                />
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-600">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-4 py-2 cursor-pointer hover:bg-sky-900/50 transition-colors text-sm ${
                    String(value) === String(opt.value) ? "bg-sky-900 text-sky-300" : "text-gray-200"
                  }`}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">No teams found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

export default function Tasks() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true); // Controls Skeleton
  const [actionLoading, setActionLoading] = useState(false); // Controls Overlay

  // Filter states
  const [filters, setFilters] = useState({
    assignedTo: "",
    priority: "",
    status: "",
    deadline: "",
    showExpired: false,
  });

  // New Task form
  const [newTask, setNewTask] = useState({
    taskDescription: "",
    assignedToId: "",
    priority: "MEDIUM",
    status: "PENDING",
    type: "DEVELOPMENT",
    deadline: "",
    comments: "",
  });

  const BASE = import.meta.env.VITE_API_URL || "/api";
  const token = localStorage.getItem("token");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  // Fetch Teams
  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${BASE}/guide/teams/mine`, axiosConfig);
      setTeams(res.data || []);
    } catch (err) {
      console.error("fetchTeams error:", err);
      Swal.fire("Error", "Failed to load teams", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Tasks for selected team
  const fetchTasks = async (teamId) => {
    if (!teamId) return;
    setActionLoading(true);
    try {
      const res = await axios.get(`${BASE}/guide/tasks/team/${teamId}`, axiosConfig);
      setTasks(res.data || []);
      setFilteredTasks(res.data || []);
    } catch (err) {
      console.error("fetchTasks error:", err);
      Swal.fire("Error", "Failed to load tasks", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch team members for assignment dropdown
  const fetchMembers = async (teamId) => {
    if (!teamId) return;
    try {
      const res = await axios.get(`${BASE}/guide/teams/${teamId}/members`, axiosConfig);
      setMembers(res.data || []);
    } catch (err) {
      console.error("fetchMembers error:", err);
      Swal.fire("Error", "Failed to load team members", "error");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchTasks(selectedTeam);
      fetchMembers(selectedTeam);
    } else {
      setTasks([]);
      setFilteredTasks([]);
      setMembers([]);
    }
  }, [selectedTeam]);

  // Filtering & Sorting logic
  useEffect(() => {
    let filtered = [...tasks];

    if (filters.assignedTo) {
      if (filters.assignedTo === "TEAM") {
        filtered = filtered.filter((t) => !t.assignedToId);
      } else {
        filtered = filtered.filter((t) => String(t.assignedToId) === String(filters.assignedTo));
      }
    }

    if (filters.priority) filtered = filtered.filter((t) => t.priority === filters.priority);
    if (filters.status) filtered = filtered.filter((t) => t.status === filters.status);
    if (filters.deadline) filtered = filtered.filter((t) => t.deadline === filters.deadline);

    if (filters.showExpired) {
      const today = new Date().toISOString().split("T")[0];
      filtered = filtered.filter((t) => t.status !== "COMPLETED" && t.deadline && t.deadline < today);
    }

    filtered.sort((a, b) => b.id - a.id);
    setFilteredTasks(filtered);
  }, [filters, tasks]);

  // Create task (guide)
  const handleCreateTask = async () => {
    if (!selectedTeam) return Swal.fire("Error", "Please select a team first!", "error");
    if (!newTask.taskDescription.trim()) return Swal.fire("Error", "Task description is required!", "error");

    setActionLoading(true);
    try {
      const payload = { ...newTask, teamId: parseInt(selectedTeam), assignedToId: newTask.assignedToId || null };
      await axios.post(`${BASE}/guide/tasks`, payload, axiosConfig);
      Swal.fire("Success", "Task created successfully!", "success");
      setNewTask({ taskDescription: "", assignedToId: "", priority: "MEDIUM", status: "PENDING", type: "DEVELOPMENT", deadline: "", comments: "" });
      fetchTasks(selectedTeam);
    } catch (err) {
      console.error("createTask error:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to create task", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Update status (guide)
  const handleStatusUpdate = async (taskId, newStatus) => {
    setActionLoading(true);
    try {
      await axios.put(`${BASE}/guide/tasks/${taskId}/status?status=${newStatus}`, {}, axiosConfig);
      Swal.fire("Success", "Task status updated!", "success");
      fetchTasks(selectedTeam);
    } catch (err) {
      console.error("status update error:", err);
      Swal.fire("Error", "Failed to update status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete task (guide)
  const handleDeleteTask = async (taskId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This task will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    setActionLoading(true);
    try {
      await axios.delete(`${BASE}/guide/tasks/${taskId}`, axiosConfig);
      Swal.fire("Deleted!", "Task removed successfully", "success");
      fetchTasks(selectedTeam);
    } catch (err) {
      console.error("deleteTask error:", err);
      Swal.fire("Error", "Failed to delete task", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const teamOptions = teams.map(t => ({
    value: t.id ?? t.teamId,
    label: t.teamName ?? t.teamName
  }));

  // ✅ Use Skeleton Loader instead of Overlay Loader for initial fetch
  if (loading) return <TasksSkeleton />;

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-8 relative">
      {actionLoading && <LoaderOverlay message="Processing..." />}

      <h1 className="text-3xl font-bold text-sky-400 mb-6">Manage Team Tasks</h1>

      <div className="mb-6 flex flex-col md:flex-row md:items-center">
        <label className="text-sky-300 font-semibold mr-3 mb-2 md:mb-0">Select Team:</label>
        
        <SearchableSelect 
          options={teamOptions} 
          value={selectedTeam} 
          onChange={setSelectedTeam} 
          placeholder="-- Search & Choose a Team --"
          isLoading={loading}
        />
      </div>

      {/* Create Task Form */}
      {selectedTeam && (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-sky-700/30 mb-8">
          <h2 className="text-xl font-semibold text-sky-300 mb-4">Create New Task</h2>

          <textarea
            rows="3"
            placeholder="Enter task description..."
            value={newTask.taskDescription}
            onChange={(e) => setNewTask({ ...newTask, taskDescription: e.target.value })}
            className="w-full bg-slate-700 px-3 py-2 rounded text-white border border-slate-600 mb-3 focus:outline-none focus:border-sky-500"
          />

          <div className="grid md:grid-cols-3 sm:grid-cols-1 gap-3 mb-3">
            <select
              value={newTask.assignedToId}
              onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
              className="bg-slate-700 px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-sky-500"
            >
              <option value="">Assign to Whole Team</option>
              {members.map((m) => (
                <option key={m.id} value={m.user?.id ?? m.userId}>
                  {m.user?.name ?? m.name}
                </option>
              ))}
            </select>

            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="bg-slate-700 px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-sky-500"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>

            <select
              value={newTask.type}
              onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
              className="bg-slate-700 px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-sky-500"
            >
              <option value="DEVELOPMENT">DEVELOPMENT</option>
              <option value="TESTING">TESTING</option>
              <option value="DOCUMENTATION">DOCUMENTATION</option>
              <option value="DEPLOYMENT">DEPLOYMENT</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3 mb-3">
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              className="bg-slate-700 px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-sky-500 text-white"
            />
            <input
              type="text"
              placeholder="Comments (optional)"
              value={newTask.comments}
              onChange={(e) => setNewTask({ ...newTask, comments: e.target.value })}
              className="flex-1 bg-slate-700 px-3 py-2 rounded border border-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button onClick={handleCreateTask} className="px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white font-medium transition-colors">
            Create Task
          </button>
        </div>
      )}

      {/* FILTER BAR */}
      {selectedTeam && (
        <div className="bg-slate-800 p-4 rounded-xl border border-sky-600/40 mb-6 flex flex-wrap gap-3 items-center">
          <h3 className="text-sky-300 font-semibold">🔍 Filter Tasks:</h3>

          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
            className="bg-slate-700 px-3 py-2 rounded border border-slate-600 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">All Members</option>
            <option value="TEAM">Whole Team</option>
            {members.map((m) => (
              <option key={m.id} value={m.user?.id ?? m.userId}>
                {m.user?.name ?? m.name}
              </option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="bg-slate-700 px-3 py-2 rounded border border-slate-600 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-slate-700 px-3 py-2 rounded border border-slate-600 text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          <input
            type="date"
            value={filters.deadline}
            onChange={(e) => setFilters({ ...filters, deadline: e.target.value })}
            className="bg-slate-700 px-3 py-2 rounded border border-slate-600 text-white focus:outline-none focus:border-sky-500"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="expired"
              checked={filters.showExpired}
              onChange={(e) => setFilters({ ...filters, showExpired: e.target.checked })}
              className="w-4 h-4 accent-sky-500"
            />
            <label htmlFor="expired" className="text-sm text-gray-300">
              Show only expired
            </label>
          </div>

          <button
            onClick={() =>
              setFilters({ assignedTo: "", priority: "", status: "", deadline: "", showExpired: false })
            }
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {/* TASK TABLE */}
      {selectedTeam && (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-white/10">
          <h2 className="text-2xl font-semibold text-sky-400 mb-4">Team Tasks</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-slate-700 rounded-xl overflow-hidden">
              <thead className="bg-slate-700 text-gray-200">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3 text-red-400">Expired</th>
                  <th className="px-4 py-3">Submission</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700">
                {filteredTasks.length ? (
                  filteredTasks.map((t) => {
                    const isExpired = t.status !== "COMPLETED" && t.deadline && t.deadline < new Date().toISOString().split("T")[0];

                    return (
                      <tr key={t.id} className={`transition-colors ${isExpired ? "bg-red-900/30 text-red-400" : "hover:bg-slate-800"}`}>
                        <td className="px-4 py-2">{t.taskDescription}</td>

                        <td className="px-4 py-2">
                          {t.assignedToId && t.assignedToName ? (
                            <span>{t.assignedToName}</span>
                          ) : (
                            <span className="text-yellow-400 font-semibold">Whole Team</span>
                          )}
                        </td>

                        <td className="px-4 py-2">{t.priority}</td>

                        <td className="px-4 py-2">
                          <select
                            value={t.status}
                            onChange={(e) => handleStatusUpdate(t.id, e.target.value)}
                            className="bg-slate-700 px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-sky-500"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>
                        </td>

                        <td className="px-4 py-2">{t.deadline || "-"}</td>

                        <td className="px-4 py-2 text-center">
                          {isExpired ? <span className="bg-red-600 text-white px-2 py-1 text-xs rounded">EXPIRED</span> : "-"}
                        </td>

                        <td className="px-4 py-2">
                          {t.attachmentUrl ? (
                            <button
                              onClick={() => window.open(t.attachmentUrl, "_blank")}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-xs"
                            >
                              View File
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">Not submitted</span>
                          )}
                        </td>

                        <td className="px-4 py-2 space-x-2">
                          <button
                            onClick={() => Swal.fire("Task Details", t.comments || "No comments", "info")}
                            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
                          >
                            View
                          </button>

                          <button onClick={() => handleDeleteTask(t.id)} className="px-3 py-1 bg-red-600 rounded hover:bg-red-700">
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-400">
                      No matching tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}