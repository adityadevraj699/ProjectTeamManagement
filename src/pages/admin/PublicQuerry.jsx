import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = import.meta.env.VITE_API_URL; // http://localhost:8080/api

export default function PublicQuerry() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
    fromDate: "",
    toDate: "",
    sort: "latest", // latest | oldest
  });

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/public-queries`);
      setQueries(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load public queries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      name: "",
      email: "",
      phone: "",
      fromDate: "",
      toDate: "",
      sort: "latest",
    });
  };

  const filteredQueries = useMemo(() => {
    const { name, email, phone, fromDate, toDate, sort } = filters;

    let result = [...queries];

    // FILTERS
    result = result.filter((q) => {
      const n = (q.name || "").toLowerCase();
      const e = (q.email || "").toLowerCase();
      const p = (q.phone || "").toLowerCase();
      const cAt = q.createdAt ? new Date(q.createdAt) : null;

      if (name && !n.includes(name.toLowerCase())) return false;
      if (email && !e.includes(email.toLowerCase())) return false;
      if (phone && !p.includes(phone.toLowerCase())) return false;

      if (fromDate && cAt) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (cAt < from) return false;
      }

      if (toDate && cAt) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (cAt > to) return false;
      }

      return true;
    });

    // SORT (latest first by default)
    result.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      if (sort === "latest") {
        return db - da; // latest top
      } else {
        return da - db; // oldest top
      }
    });

    return result;
  }, [queries, filters]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this message?",
      text: "This action cannot be undone.",
      icon: "warning",
      background: "#020617", // slate-950
      color: "#e5e7eb", // gray-200
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // red-500
      cancelButtonColor: "#6b7280", // gray-500
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/public-queries/${id}`);
      setQueries((prev) => prev.filter((q) => q.id !== id));
      Swal.fire({
        title: "Deleted",
        text: "Message has been deleted.",
        icon: "success",
        background: "#020617",
        color: "#e5e7eb",
        confirmButtonColor: "#0ea5e9", // sky-500
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Failed to delete message.",
        icon: "error",
        background: "#020617",
        color: "#e5e7eb",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleView = (q) => {
    Swal.fire({
      title: q.subject || "Public Query",
      html: `
        <div style="text-align:left; font-size:14px; color:#e5e7eb;">
          <p><strong>Name:</strong> ${q.name || "-"}</p>
          <p><strong>Email:</strong> ${q.email || "-"}</p>
          <p><strong>Phone:</strong> ${q.phone || "-"}</p>
          <p><strong>Created At:</strong> ${
            q.createdAt ? new Date(q.createdAt).toLocaleString() : "-"
          }</p>
          <hr style="margin:10px 0; border-color:#374151;" />
          <p style="white-space:pre-wrap; font-size:13px;">
            <strong>Message:</strong><br/>${q.message || "-"}
          </p>
        </div>
      `,
      icon: "info",
      background: "#020617", // dark background
      color: "#e5e7eb", // text color
      confirmButtonText: "Close",
      confirmButtonColor: "#0ea5e9", // sky-500
      width: 650,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="px-4 py-2 rounded-lg border border-gray-800 bg-gray-900/70 shadow-lg shadow-sky-500/10">
          <span className="text-gray-300 text-sm">Loading queries...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="px-4 py-2 rounded-lg border border-red-800 bg-red-950/70 shadow-lg shadow-red-500/20">
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900 text-gray-100">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Public Queries
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-1">
              All messages submitted from the public contact form. Latest
              messages appear at the top.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-gray-800 bg-gray-900/70 px-3 py-1 text-xs text-gray-400">
              Total Messages:
              <span className="ml-2 text-sky-400 font-semibold">
                {filteredQueries.length}
              </span>
            </span>
          </div>
        </div>

        {/* Layout: Filters (left) + Table (right) */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar Filters */}
          <aside className="w-full md:w-64 lg:w-72 bg-gray-950/80 border border-gray-800 rounded-2xl shadow-xl shadow-sky-500/5 p-4 md:p-5">
            <h2 className="text-sm font-semibold text-gray-200 mb-3 tracking-wide">
              Filters
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  placeholder="Search by name"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Email</label>
                <input
                  type="text"
                  name="email"
                  value={filters.email}
                  onChange={handleFilterChange}
                  placeholder="Search by email"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={filters.phone}
                  onChange={handleFilterChange}
                  placeholder="Search by number"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-gray-400 mb-1">From</label>
                  <input
                    type="date"
                    name="fromDate"
                    value={filters.fromDate}
                    onChange={handleFilterChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">To</label>
                  <input
                    type="date"
                    name="toDate"
                    value={filters.toDate}
                    onChange={handleFilterChange}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="block text-gray-400 mb-1">Sort by time</label>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/70"
                >
                  <option value="latest">Latest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleResetFilters}
              className="mt-4 w-full inline-flex items-center justify-center rounded-lg border border-gray-700 bg-gray-900/80 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-600 transition"
            >
              Reset filters
            </button>
          </aside>

          {/* Right Table */}
          <section className="flex-1 bg-gray-950/80 border border-gray-800 rounded-2xl shadow-xl shadow-sky-500/5 p-3 md:p-4">
            {filteredQueries.length === 0 ? (
              <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/60 text-gray-400 text-sm text-center">
                No messages found with current filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs md:text-sm">
                  <thead className="bg-gray-900/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">
                        Message
                      </th>
                      <th className="px-4 py-3 text-left text-gray-400 font-medium">
                        Created At
                      </th>
                      <th className="px-4 py-3 text-right text-gray-400 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQueries.map((q) => (
                      <tr
                        key={q.id}
                        className="border-t border-gray-800 hover:bg-gray-900/70 transition-colors"
                      >
                        <td className="px-4 py-3">{q.name}</td>
                        <td className="px-4 py-3">{q.email}</td>
                        <td className="px-4 py-3">{q.phone || "-"}</td>
                        <td className="px-4 py-3">{q.subject || "-"}</td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="line-clamp-2 text-gray-300">
                            {q.message}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                          {q.createdAt
                            ? new Date(q.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleView(q)}
                            className="inline-flex items-center px-3 py-1 rounded-lg bg-sky-500/90 text-[11px] font-semibold text-white hover:bg-sky-600 transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="inline-flex items-center px-3 py-1 rounded-lg bg-red-500/90 text-[11px] font-semibold text-white hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
