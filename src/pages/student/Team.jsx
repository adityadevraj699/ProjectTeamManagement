// src/components/Teams.jsx
import React, { useEffect, useState } from "react";
import api from "../../context/api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get("/teams/mine");
        if (!mounted) return;
        setTeams(res.data.teams || []);
      } catch (err) {
        console.error("Failed to load teams", err);
        const msg = err?.response?.data?.message || err?.message;
        Swal.fire("Error", `Could not load teams: ${msg}`, "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  if (loading)
    return (
      <div className="w-full flex justify-center items-center p-10 text-white">
        <div>Loading teams...</div>
      </div>
    );

  if (!teams.length)
    return (
      <div className="p-6 text-white">
        <h2 className="text-xl font-semibold">Your Teams</h2>
        <p className="mt-4 text-gray-400">You are not a member of any team yet.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0B1220] p-6">
      <h1 className="text-3xl font-bold text-sky-400 mb-6">My Teams</h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-[#0F172A] rounded-2xl p-5 shadow-lg ring-1 ring-white/10"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-sky-300">{team.teamName}</h3>

                <div className="text-sm text-gray-400 mt-1">
                  {team.projectTitle ? (
                    <span>{team.projectTitle}</span>
                  ) : (
                    <span className="italic text-gray-500">No linked project</span>
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {team.createdDate ? `Created: ${team.createdDate}` : ""}
                </div>
              </div>

              {/* Member Avatars */}
              <div className="flex -space-x-2">
                {(team.members || [])
                  .slice(0, 4)
                  .map((m) => (
                    <div
                      key={m.id}
                      className="w-10 h-10 rounded-full bg-gradient-to-r 
                      from-sky-500 to-indigo-600 text-white text-xs flex 
                      items-center justify-center border-2 border-[#0B1220]"
                    >
                      {m.name
                        ? m.name
                            .split(" ")
                            .map((x) => x[0])
                            .slice(0, 2)
                            .join("")
                        : "U"}
                    </div>
                  ))}
              </div>
            </div>

            {/* Member List */}
            <div className="mt-4">
              <div className="text-gray-300 text-sm">
                Members: {(team.members || []).length}
              </div>

              <div className="mt-2 space-y-1">
                {(team.members || []).map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <span className="text-gray-200">{m.name}</span>
                    {m.leader && (
                      <span className="text-xs bg-yellow-400 px-2 py-0.5 rounded text-black">
                        Leader
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => navigate(`/student/teams/${team.id}`)}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 
                text-white font-medium shadow"
              >
                View Details
              </button>

              <button
                onClick={() =>
                  Swal.fire(
                    "Info",
                    "Feature: message or invite can be added here",
                    "info"
                  )
                }
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
              >
                More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
