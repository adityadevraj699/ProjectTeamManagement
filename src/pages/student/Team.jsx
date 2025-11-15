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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#071226] to-[#07192b]">
        <div className="text-slate-300">Loading teams...</div>
      </div>
    );

  if (!teams.length)
    return (
      <div className="min-h-screen p-6 bg-gradient-to-b from-[#071226] to-[#07192b]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-sky-300">Your Teams</h2>
          <p className="mt-4 text-slate-400">You are not a member of any team yet.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071226] to-[#07192b] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-sky-300">My Teams</h1>
          <div className="text-sm text-slate-400">Projects & team details</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="group relative overflow-hidden rounded-2xl p-5 shadow-lg ring-1 ring-white/5
                         bg-gradient-to-tr from-[#0B1220] via-[#0F1626] to-[#071228] hover:scale-[1.01] transition-transform"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-sky-300 truncate">{team.teamName}</h3>

                  <div className="mt-2 text-sm text-slate-300 truncate">
                    {team.projectTitle ? (
                      <span className="inline-block text-sky-200/90">{team.projectTitle}</span>
                    ) : (
                      <span className="italic text-slate-500">No linked project</span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 mt-2">
                    {team.createdDate ? `Created: ${team.createdDate}` : ""}
                  </div>
                </div>

                {/* Avatars */}
                <div className="flex -space-x-2 ml-4">
                  {(team.members || []).slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      title={m.name}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium
                                 bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-2 border-[#071226] shadow-sm"
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

              {/* Member list */}
              <div className="mt-4">
                <div className="text-slate-300 text-sm">Members: {(team.members || []).length}</div>
                <div className="mt-2 space-y-1">
                  {(team.members || []).map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                                        bg-slate-700/40 text-white border border-[#071226]">
                          {m.name ? m.name.split(" ").map(x => x[0]).slice(0,2).join("") : "U"}
                        </div>
                        <span className="text-slate-200 text-sm">{m.name}</span>
                      </div>
                      <div className="ml-auto">
                        {m.leader && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-black font-semibold">
                            Leader
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => navigate(`/student/teams/${team.id}`)}
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-black font-medium shadow"
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
                  className="px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-100"
                >
                  More
                </button>
              </div>

              {/* subtle footer showing project & badge */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l9-5-9-5-9 5 9 5z" opacity="0.2" />
                  </svg>
                  <span>{team.projectTitle ? "Linked project" : "No project"}</span>
                </div>
                <div className="text-slate-300">{team.members ? `${team.members.length} members` : "0 members"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
