import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function CreateCourse() {
  const [courseName, setCourseName] = useState("");
  const [fullName, setFullName] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Axios config with Authorization header
  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // JWT token added here
    },
    withCredentials: true,
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/courses`,
        axiosConfig
      );
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      Swal.fire({
        title: "Error Loading Courses",
        text: err.response?.data?.message || "Something went wrong",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/courses`,
        { courseName, fullName },
        axiosConfig
      );
      Swal.fire({
        title: "Created!",
        text: `${response.data.courseName} added successfully.`,
        icon: "success",
        background: "#0f172a",
        color: "#fff",
      });
      setCourseName("");
      setFullName("");
      fetchCourses();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Something went wrong",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete?",
      text: "This course will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      background: "#0f172a",
      color: "#fff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#38bdf8",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/courses/${id}`,
        axiosConfig
      );
      Swal.fire({
        title: "Deleted!",
        text: "Course deleted successfully.",
        icon: "success",
        background: "#0f172a",
        color: "#fff",
      });
      fetchCourses();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Something went wrong",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  const handleUpdate = async (course) => {
    const { value: formValues } = await Swal.fire({
      title: "Update Course",
      html: `
        <input id="swal-courseName" class="swal2-input" placeholder="Course Name" value="${course.courseName || ""}">
        <input id="swal-fullName" class="swal2-input" placeholder="Full Name" value="${course.fullName || ""}">
      `,
      background: "#0f172a",
      color: "#fff",
      confirmButtonColor: "#38bdf8",
      focusConfirm: false,
      preConfirm: () => ({
        courseName: document.getElementById("swal-courseName").value,
        fullName: document.getElementById("swal-fullName").value,
      }),
    });

    if (!formValues) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/courses/${course.id}`,
        formValues,
        axiosConfig
      );
      Swal.fire({
        title: "Updated!",
        text: "Course updated successfully.",
        icon: "success",
        background: "#0f172a",
        color: "#fff",
      });
      fetchCourses();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Something went wrong",
        icon: "error",
        background: "#0f172a",
        color: "#fff",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-10">
      <h1 className="text-3xl font-bold mb-6 text-sky-400">Manage Courses</h1>

      <form
        onSubmit={handleCreateCourse}
        className="bg-slate-800 border border-sky-600 rounded-2xl p-6 mb-10 shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4 text-sky-300">
          Create New Course
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
            className="p-3 rounded-lg bg-slate-900 border border-white/20 focus:ring-2 focus:ring-sky-500"
          />
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="p-3 rounded-lg bg-slate-900 border border-white/20 focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <button
          type="submit"
          className="mt-5 px-6 py-3 bg-sky-500 hover:bg-sky-600 rounded-lg font-semibold shadow-lg transition"
        >
          Create Course
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4 text-sky-300">All Courses</h2>

      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-400">No courses available yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-slate-800 border border-sky-600 rounded-xl p-5 shadow-lg hover:shadow-sky-700/30 transition"
            >
              <h2 className="text-xl font-semibold text-sky-300 mb-2">
                {course.courseName}
              </h2>
              <p className="text-gray-400 text-sm">{course.fullName}</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleUpdate(course)}
                  className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-lg text-sm font-medium"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
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
