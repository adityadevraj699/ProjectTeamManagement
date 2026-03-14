import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiOutlineChevronLeft,
  HiOutlineDatabase,
  HiOutlineLightningBolt,
  HiOutlineEye,
  HiChevronRight,
  HiChevronDown,
  HiOutlineTerminal,
  HiOutlineInformationCircle,
  HiOutlineFingerPrint,
  HiOutlineUserGroup,
  HiOutlineDocumentText
} from "react-icons/hi";

export default function ArtifactViewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  
  const projectData = location.state || {};
  const { projectTitle, techStack, description: projectDesc, teamName } = projectData;

  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const axiosConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/artifacts/tree`, axiosConfig);
      setArtifacts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecution = (node, type) => {
    if (type === 'READ') {
      Swal.fire({
        width: '60%',
        background: "#0f172a", 
        color: "#f1f5f9",
        confirmButtonText: "DONE",
        confirmButtonColor: "#334155",
        customClass: {
          popup: 'border border-slate-700 rounded-[2rem] shadow-2xl p-0 overflow-hidden',
        },
        html: `
          <div class="text-left font-sans">
            <div class="p-6 bg-slate-900/50 border-b border-slate-800 flex items-center gap-4">
               <div class="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                 <HiOutlineDocumentText size={20} />
               </div>
               <div>
                 <p class="text-[9px] text-slate-500 font-mono uppercase tracking-widest leading-none mb-1">Component_Insight</p>
                 <h2 class="text-lg font-bold text-white uppercase italic tracking-tight">${node.name}</h2>
               </div>
            </div>
            <div class="p-8">
              <div class="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 shadow-inner">
                <p class="text-slate-300 text-sm leading-relaxed font-light italic">
                  ${node.description || "System metadata indicates no description available for this node."}
                </p>
              </div>
            </div>
          </div>
        `
      });
    } else {
      Swal.fire({
        width: '75%',
        background: "#0f172a",
        color: "#f8fafc",
        showCancelButton: true,
        confirmButtonText: "GENERATE",
        cancelButtonText: "CANCEL",
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#334155",
        customClass: {
          popup: 'border border-emerald-500/20 rounded-[2.5rem] shadow-2xl p-0 overflow-hidden',
        },
        html: `
          <div class="text-left font-sans flex flex-col max-h-[80vh]">
            <div class="p-5 bg-emerald-500/5 border-b border-emerald-500/10 flex justify-between items-center text-center">
              <p class="text-emerald-500 font-mono text-[9px] tracking-widest uppercase font-bold italic w-full">Initialize_AI_Compute_Protocol</p>
            </div>
            
            <div class="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar">
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <p class="text-[8px] text-slate-500 font-black uppercase mb-1">Project Identifier</p>
                  <p class="text-sky-400 font-mono text-[10px] truncate uppercase">${projectId}</p>
                </div>
                <div class="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <p class="text-[8px] text-slate-500 font-black uppercase mb-1 tracking-widest">Stack Blueprint</p>
                   <p class="text-slate-200 font-bold text-[9px] uppercase truncate">${techStack || 'Standard_Stack'}</p>
                </div>
              </div>

              <div class="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                <p class="text-[8px] text-slate-500 font-black uppercase mb-1 tracking-widest">Project Title</p>
                <p class="text-sm font-bold text-white italic tracking-tight">${projectTitle}</p>
              </div>

              <div class="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                <p class="text-[8px] text-slate-500 font-black uppercase mb-2 tracking-widest">Global Logic Context</p>
                <p class="text-slate-400 text-xs leading-relaxed italic line-clamp-4">"${projectDesc || "Awaiting telemetry description..."}"</p>
              </div>

              <div class="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl shadow-inner">
                <p class="text-[8px] text-emerald-500 font-black uppercase mb-2 tracking-widest">Target Node & Component Metadata</p>
                <p class="text-slate-100 text-sm font-bold uppercase underline italic decoration-emerald-500/30 mb-2">${node.name}</p>
                <p class="text-slate-400 text-xs leading-relaxed font-light italic">
                  ${node.description || "Component logic is currently undefined. AI will extrapolate details from global context."}
                </p>
              </div>
            </div>
            <div class="p-3 bg-slate-950/50 text-center border-t border-slate-800">
               <p class="text-[8px] font-mono text-slate-600 uppercase tracking-[0.4em]">Ready for Generation Sequence</p>
            </div>
          </div>
        `
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-sky-500/30 overflow-x-hidden pb-12">
      <div className="fixed inset-0 pointer-events-none opacity-30">
         <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-sky-500/10 blur-[100px] rounded-full" />
         <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-sky-400 transition-all group mb-8">
          <HiOutlineChevronLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Project_Return</span>
        </button>

        <header className="flex flex-col lg:flex-row gap-6 mb-12 items-stretch">
          <div className="flex-[2] bg-slate-900/30 border border-slate-800/60 p-8 rounded-[2.5rem] backdrop-blur-3xl relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-6">
              <HiOutlineTerminal size={20} className="text-sky-400" />
              <span className="text-sky-500 font-mono text-[10px] tracking-[0.4em] uppercase font-black">Archive_Registry</span>
            </div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">{projectTitle}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl">
                <HiOutlineUserGroup className="text-slate-500" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{teamName}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack?.split(',').map((tech, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{tech.trim()}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/30 border border-slate-800/60 p-8 rounded-[2.5rem] backdrop-blur-3xl flex flex-col group relative">
            <div className="flex items-center gap-2 text-slate-500 mb-4">
              <HiOutlineInformationCircle size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Logic_Summary</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic font-light overflow-y-auto custom-scrollbar pr-2 max-h-[100px]">"${projectDesc || "No overview provided."}"</p>
            <div className="mt-auto pt-4 border-t border-slate-800/50">
              <p className="text-[9px] font-mono text-slate-600 truncate uppercase">PID: ${projectId}</p>
            </div>
          </div>
        </header>

        <main className="bg-slate-900/10 border border-slate-800/40 rounded-[3rem] p-6 lg:p-12 shadow-2xl relative min-h-[50vh]">
           <div className="max-w-4xl mx-auto space-y-4">
              {loading ? (
                <div className="space-y-4">
                   {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-slate-800/10 rounded-2xl animate-pulse" />)}
                </div>
              ) : (
                artifacts.map(node => <TreeNode key={node.id} node={node} onAction={handleExecution} />)
              )}
           </div>
        </main>
      </div>
    </div>
  );
}

function TreeNode({ node, onAction, level = 0 }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative w-full group/node mb-3">
      {level > 0 && <div className="absolute -left-8 top-8 w-8 h-[1px] bg-slate-800 group-hover/node:bg-sky-500/50 transition-all duration-500" />}
      <motion.div layout className={`flex items-center justify-between p-4 rounded-[1.8rem] border transition-all duration-500 backdrop-blur-sm ${hasChildren ? "bg-slate-900/40 border-slate-800/80 shadow-lg" : "bg-slate-800/10 border-slate-800/40 group-hover/node:border-sky-500/30 group-hover/node:bg-slate-800/20"}`}>
        <div className="flex items-center gap-5">
          <button onClick={() => setIsOpen(!isOpen)} className={`p-1.5 rounded-lg bg-slate-800/60 hover:text-sky-400 transition-all ${!hasChildren && 'opacity-0 scale-0'}`}>
            {isOpen ? <HiChevronDown size={14} /> : <HiChevronRight size={14} />}
          </button>
          <div className="flex items-center gap-5">
            <div className={`h-10 w-10 rounded-[1rem] flex items-center justify-center border transition-all duration-700 ${hasChildren ? 'bg-sky-500/5 text-sky-400 border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]' : 'bg-slate-900/80 text-slate-500 border-slate-800 group-hover/node:text-sky-300'}`}>
              {hasChildren ? <HiOutlineDatabase size={20} /> : <HiOutlineFingerPrint size={20} />}
            </div>
            <div className="flex flex-col">
              <h3 className="text-[13px] font-black text-slate-100 uppercase tracking-widest italic group-hover/node:text-sky-400 transition-colors">{node.name}</h3>
              <span className="text-[8px] text-slate-600 font-mono tracking-tighter uppercase mt-1">LVL_0{level + 1}</span>
            </div>
          </div>
        </div>
        {!hasChildren && (
          <div className="flex items-center gap-2 pr-2">
            <button onClick={() => onAction(node, 'READ')} className="px-5 py-2 bg-slate-900/80 hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 rounded-xl transition-all font-black text-[9px] uppercase border border-slate-800 tracking-widest">READ</button>
            <button onClick={() => onAction(node, 'GENERATE')} className="px-5 py-2 bg-emerald-500 text-black hover:bg-white hover:text-emerald-600 rounded-xl transition-all font-black text-[9px] uppercase shadow-[0_15px_30px_-10px_#10b981] tracking-widest">GENERATE</button>
          </div>
        )}
      </motion.div>
      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="ml-6 border-l border-slate-800/60 pl-10 mt-1 space-y-2 relative">
            {node.children.map(child => (
               <TreeNode key={child.id} node={child} onAction={onAction} level={level + 1} /> 
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}