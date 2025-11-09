import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const LoaderOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
    <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-white text-lg font-medium">{message || "Loading..."}</p>
  </div>
);

export default function Tasks() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ Filter states
  const [filters, setFilters] = useState({
    assignedTo: "",
    priority: "",
    status: "",
    deadline: "",
    showExpired: false, // ✅ Added expired filter
  });

  // ✅ New Task form state
  const [newTask, setNewTask] = useState({
    taskDescription: "",
    assignedToId: "",
    priority: "MEDIUM",
    status: "PENDING",
    type: "DEVELOPMENT",
    deadline: "",
    comments: "",
  });

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // ✅ Fetch Teams
  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/guide/teams/mine`, axiosConfig);
      setTeams(res.data || []);
    } catch {
      Swal.fire("Error", "Failed to load teams", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Tasks
  const fetchTasks = async (teamId) => {
    if (!teamId) return;
    setActionLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/guide/tasks/team/${teamId}`, axiosConfig);
      setTasks(res.data || []);
      setFilteredTasks(res.data || []);
    } catch {
      Swal.fire("Error", "Failed to load tasks", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Fetch Members
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
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchTasks(selectedTeam);
      fetchMembers(selectedTeam);
    }
  }, [selectedTeam]);

  // ✅ Filter logic
  useEffect(() => {
    let filtered = [...tasks];

    // Assigned To filter by ID
    if (filters.assignedTo) {
      if (filters.assignedTo === "TEAM") {
        filtered = filtered.filter((t) => !t.assignedToId);
      } else {
        filtered = filtered.filter(
          (t) => String(t.assignedToId) === String(filters.assignedTo)
        );
      }
    }

    if (filters.priority)
      filtered = filtered.filter((t) => t.priority === filters.priority);

    if (filters.status)
      filtered = filtered.filter((t) => t.status === filters.status);

    if (filters.deadline)
      filtered = filtered.filter((t) => t.deadline === filters.deadline);

    // ✅ Filter expired tasks (Deadline < today and not COMPLETED)
    if (filters.showExpired) {
      const today = new Date().toISOString().split("T")[0];
      filtered = filtered.filter(
        (t) =>
          t.status !== "COMPLETED" &&
          t.deadline &&
          t.deadline < today
      );
    }

    setFilteredTasks(filtered);
  }, [filters, tasks]);

  // ✅ Create Task
  const handleCreateTask = async () => {
    if (!selectedTeam) return Swal.fire("Error", "Please select a team first!", "error");
    if (!newTask.taskDescription.trim())
      return Swal.fire("Error", "Task description is required!", "error");

    setActionLoading(true);
    try {
      const payload = {
        ...newTask,
        teamId: parseInt(selectedTeam),
        assignedToId: newTask.assignedToId || null,
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/guide/tasks`, payload, axiosConfig);
      Swal.fire("Success", "Task created successfully!", "success");

      setNewTask({
        taskDescription: "",
        assignedToId: "",
        priority: "MEDIUM",
        status: "PENDING",
        type: "DEVELOPMENT",
        deadline: "",
        comments: "",
      });
      fetchTasks(selectedTeam);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to create task", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Update Status
  const handleStatusUpdate = async (taskId, newStatus) => {
    setActionLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/guide/tasks/${taskId}/status?status=${newStatus}`,
        {},
        axiosConfig
      );
      Swal.fire("Success", "Task status updated!", "success");
      fetchTasks(selectedTeam);
    } catch {
      Swal.fire("Error", "Failed to update status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Delete Task
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
      await axios.delete(`${import.meta.env.VITE_API_URL}/guide/tasks/${taskId}`, axiosConfig);
      Swal.fire("Deleted!", "Task removed successfully", "success");
      fetchTasks(selectedTeam);
    } catch {
      Swal.fire("Error", "Failed to delete task", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoaderOverlay message="Loading Teams..." />;

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-8 relative">
      {actionLoading && <LoaderOverlay message="Processing..." />}

      <h1 className="text-3xl font-bold text-sky-400 mb-6">Manage Team Tasks</h1>

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

      {/* ✅ CREATE TASK FORM */}
      {selectedTeam && (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-sky-700/30 mb-8">
          <h2 className="text-xl font-semibold text-sky-300 mb-4">Create New Task</h2>

          <textarea
            rows="3"
            placeholder="Enter task description..."
            value={newTask.taskDescription}
            onChange={(e) => setNewTask({ ...newTask, taskDescription: e.target.value })}
            className="w-full bg-slate-700 px-3 py-2 rounded text-white border border-slate-600 mb-3"
          ></textarea>

          <div className="grid md:grid-cols-3 sm:grid-cols-1 gap-3 mb-3">
            <select
              value={newTask.assignedToId}
              onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
              className="bg-slate-700 px-3 py-2 rounded border border-slate-600"
            >
              <option value="">Assign to Whole Team</option>
              {members.map((m) => (
                <option key={m.id} value={m.user.id}>
                  {m.user.name}
                </option>
              ))}
            </select>

            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="bg-slate-700 px-3 py-2 rounded border border-slate-600"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>

            <select
              value={newTask.type}
              onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
              className="bg-slate-700 px-3 py-2 rounded border border-slate-600"
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
              className="bg-slate-700 px-3 py-2 rounded border border-slate-600"
            />
            <input
              type="text"
              placeholder="Comments (optional)"
              value={newTask.comments}
              onChange={(e) => setNewTask({ ...newTask, comments: e.target.value })}
              className="flex-1 bg-slate-700 px-3 py-2 rounded border border-slate-600"
            />
          </div>

          <button
            onClick={handleCreateTask}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white font-medium"
          >
            Create Task
          </button>
        </div>
      )}

      {/* ✅ FILTER BAR */}
      {selectedTeam && (
        <div className="bg-slate-800 p-4 rounded-xl border border-sky-600/40 mb-6 flex flex-wrap gap-3 items-center">
          <h3 className="text-sky-300 font-semibold">🔍 Filter Tasks:</h3>

          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
            className="bg-slate-700 px-3 py-2 rounded border border-slate-600 text-white"
          >
            <option value="">All Members</option>
            <option value="TEAM">Whole Team</option>
            {members.map((m) => (
              <option key={m.id} value={m.user.id}>
                {m.user.name}
              </option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="bg-slate-700 px-3 py-2 rounded border border-slate-600 text-white"
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
            className="bg-slate-700 px-3 py-2 rounded border border-slate-600 text-white"
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
            className="bg-slate-700 px-3 py-2 rounded border border-slate-600 text-white"
          />

          {/* ✅ Expired Filter */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="expired"
              checked={filters.showExpired}
              onChange={(e) =>
                setFilters({ ...filters, showExpired: e.target.checked })
              }
              className="w-4 h-4 accent-sky-500"
            />
            <label htmlFor="expired" className="text-sm text-gray-300">
              Show only expired (missed deadline & not completed)
            </label>
          </div>

          <button
            onClick={() =>
              setFilters({
                assignedTo: "",
                priority: "",
                status: "",
                deadline: "",
                showExpired: false,
              })
            }
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white"
          >
            Reset
          </button>
        </div>
      )}

      {/* ✅ TASK TABLE */}
      {selectedTeam && (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-white/10">
          <h2 className="text-2xl font-semibold text-sky-400 mb-4">Team Tasks</h2>

          <table className="w-full text-sm text-left border border-slate-700 rounded-xl overflow-hidden">
            <thead className="bg-slate-700 text-gray-200">
              <tr>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3 text-red-400">Expired</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredTasks.length ? (
                filteredTasks.map((t) => {
                  const isExpired =
                    t.status !== "COMPLETED" &&
                    t.deadline &&
                    t.deadline < new Date().toISOString().split("T")[0];

                  return (
                    <tr
                      key={t.id}
                      className={`transition-colors ${
                        isExpired
                          ? "bg-red-900/30 text-red-400"
                          : "hover:bg-slate-800"
                      }`}
                    >
                      <td className="px-4 py-2">{t.taskDescription}</td>
                      <td className="px-4 py-2">
                        {t.assignedToId && t.assignedToName ? (
                          <span>{t.assignedToName}</span>
                        ) : (
                          <span className="text-yellow-400 font-semibold">
                            Whole Team
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">{t.priority}</td>
                      <td className="px-4 py-2">
                        <select
                          value={t.status}
                          onChange={(e) =>
                            handleStatusUpdate(t.id, e.target.value)
                          }
                          className="bg-slate-700 px-2 py-1 rounded border border-slate-600"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">{t.deadline || "-"}</td>
                      <td className="px-4 py-2 text-center">
                        {isExpired ? (
                          <span className="bg-red-600 text-white px-2 py-1 text-xs rounded">
                            EXPIRED
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          onClick={() =>
                            Swal.fire(
                              "Task Details",
                              t.comments || "No comments",
                              "info"
                            )
                          }
                          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="px-3 py-1 bg-red-600 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-400">
                    No matching tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
