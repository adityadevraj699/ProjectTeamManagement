import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function Teacher() {
  const [teachers, setTeachers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  // ✅ Fetch all teachers
  const fetchTeachers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/teachers`,
        axiosConfig
      );
      setTeachers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to load teachers",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new teacher
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      Swal.fire("Error", "Please enter name and email", "error");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/teachers`,
        { name, email },
        axiosConfig
      );
      Swal.fire("Created!", "Teacher added successfully", "success");
      setName("");
      setEmail("");
      fetchTeachers();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to add teacher",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  // ✅ Update teacher
  const handleUpdateTeacher = async (teacher) => {
    const { value: formValues } = await Swal.fire({
      title: "Update Teacher",
      html:
        `<input id="swal-name" class="swal2-input" placeholder="Name" value="${teacher.name}">` +
        `<input id="swal-email" class="swal2-input" placeholder="Email" value="${teacher.email}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update",
      confirmButtonColor: "#38bdf8",
      cancelButtonColor: "#ef4444",
      background: "#0f172a",
      color: "#fff",
      preConfirm: () => ({
        name: document.getElementById("swal-name").value,
        email: document.getElementById("swal-email").value,
      }),
    });

    if (!formValues) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/teachers/${teacher.id}`,
        formValues,
        axiosConfig
      );
      Swal.fire("Updated!", "Teacher updated successfully", "success");
      fetchTeachers();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || err.response?.data || "Failed to update teacher",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  // ✅ Delete teacher
  const handleDeleteTeacher = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete?",
      text: "This teacher will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#38bdf8",
      background: "#0f172a",
      color: "#fff",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/teachers/${id}`,
        axiosConfig
      );
      Swal.fire("Deleted!", "Teacher deleted successfully", "success");
      fetchTeachers();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to delete teacher",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // ✅ Search filter
  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-10">
      <h1 className="text-3xl font-bold mb-6 text-sky-400">Manage Teachers</h1>

      {/* Add Teacher Form */}
      <form
        onSubmit={handleAddTeacher}
        className="bg-slate-800 border border-sky-600 rounded-2xl p-6 mb-10 shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4 text-sky-300">Add New Teacher</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter Teacher Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 rounded-lg bg-slate-900 border border-white/20 focus:ring-2 focus:ring-sky-500 flex-1"
            required
          />
          <input
            type="email"
            placeholder="Enter Teacher Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg bg-slate-900 border border-white/20 focus:ring-2 focus:ring-sky-500 flex-1"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg font-semibold shadow-lg"
          >
            Add Teacher
          </button>
        </div>
      </form>

      {/* Search Teacher */}
      <div className="mb-10">
        <input
          type="text"
          placeholder="Search by Name or Email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-3 rounded-lg bg-slate-800 border border-white/20 focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* All Teachers */}
      <h2 className="text-2xl font-semibold mb-4 text-sky-300">All Teachers</h2>

      {loading ? (
        <p>Loading teachers...</p>
      ) : filteredTeachers.length === 0 ? (
        <p className="text-gray-400">No teachers available yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-slate-800 border border-sky-600 rounded-xl p-5 shadow-lg hover:shadow-sky-700/30 transition"
            >
              <h2 className="text-xl font-semibold text-sky-300 mb-2">
                {teacher.name}
              </h2>
              <p className="text-gray-300 text-sm mb-3">{teacher.email}</p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handleUpdateTeacher(teacher)}
                  className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg text-sm font-medium"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeleteTeacher(teacher.id)}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
