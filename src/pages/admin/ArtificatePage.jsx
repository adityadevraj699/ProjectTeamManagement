import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiOutlinePlus, 
  HiOutlineTrash, 
  HiOutlinePencilAlt, 
  HiChevronRight, 
  HiChevronDown,
  HiOutlineFingerPrint,
  HiOutlineChip,
  HiOutlineLightningBolt,
  HiOutlineServer,
  HiOutlineDatabase
} from "react-icons/hi";

function ArtificatePage() {
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const axiosConfig = useMemo(() => ({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
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
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateTreeState = (nodes, action, data) => {
    if (action === "ADD") {
      if (!data.parentId) return [...nodes, data];
      return nodes.map(node => {
        if (node.id === data.parentId) {
          return { ...node, children: [...(node.children || []), data] };
        }
        if (node.children) {
          return { ...node, children: updateTreeState(node.children, "ADD", data) };
        }
        return node;
      });
    }

    if (action === "UPDATE") {
      return nodes.map(node => {
        if (node.id === data.id) return { ...node, name: data.name, description: data.description };
        if (node.children) {
          return { ...node, children: updateTreeState(node.children, "UPDATE", data) };
        }
        return node;
      });
    }

    if (action === "DELETE") {
      return nodes
        .filter(node => node.id !== data.id)
        .map(node => ({
          ...node,
          children: node.children ? updateTreeState(node.children, "DELETE", data) : []
        }));
    }
    return nodes;
  };

  const createArtifact = async (parentId = null) => {
    const { value: formValues } = await Swal.fire({
      title: `<span class="text-emerald-400 font-mono text-sm uppercase italic">Initialize_Component</span>`,
      html: `
        <div class="flex flex-col gap-3 mt-4 text-left">
          <label class="text-[10px] font-bold text-slate-500 uppercase ml-1">Component Name</label>
          <input id="swal-name" class="swal2-input !m-0 bg-slate-900 border-slate-700 text-white rounded-xl text-sm w-full" placeholder="e.g. Analysis Phase">
          
          <label class="text-[10px] font-bold text-slate-500 uppercase ml-1 mt-2">Description (Optional)</label>
          <textarea id="swal-desc" class="swal2-textarea !m-0 bg-slate-900 border-slate-700 text-white rounded-xl text-sm h-24 w-full" placeholder="Enter details..."></textarea>
        </div>
      `,
      background: "#020617",
      color: "#f8fafc",
      confirmButtonText: "Deploy",
      confirmButtonColor: "#10b981",
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('swal-name').value;
        const description = document.getElementById('swal-desc').value;
        if (!name) {
          Swal.showValidationMessage('Name is required');
          return false;
        }
        return { name, description };
      }
    });

    if (!formValues) return;

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/artifacts`, { 
        name: formValues.name, 
        description: formValues.description,
        parentId 
      }, axiosConfig);
      
      const newNode = { ...res.data, children: [] };
      setArtifacts(prev => updateTreeState(prev, "ADD", newNode));
      Swal.fire({ icon: 'success', title: 'Deployed', toast: true, position: 'top-end', timer: 1500, showConfirmButton: false, background: '#1e293b', color: '#fff' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', background: '#020617', color: '#fff' });
    }
  };

  const handleAction = async (type, node) => {
    if (type === 'DELETE') {
      const res = await Swal.fire({
        title: "Purge Node?",
        text: "Nested structures will be deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        background: "#020617",
        color: "#fff",
      });

      if (res.isConfirmed) {
        try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/artifacts/${node.id}`, axiosConfig);
          setArtifacts(prev => updateTreeState(prev, "DELETE", { id: node.id }));
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Error', background: '#020617', color: '#fff' });
        }
      }
    } else if (type === 'EDIT') {
      const { value: formValues } = await Swal.fire({
        title: `<span class="text-sky-400 font-mono text-sm uppercase italic">Update_Component</span>`,
        html: `
          <div class="flex flex-col gap-3 mt-4 text-left">
            <label class="text-[10px] font-bold text-slate-500 uppercase ml-1">Component Name</label>
            <input id="swal-name" class="swal2-input !m-0 bg-slate-900 border-slate-700 text-white rounded-xl text-sm w-full" value="${node.name}">
            
            <label class="text-[10px] font-bold text-slate-500 uppercase ml-1 mt-2">Description</label>
            <textarea id="swal-desc" class="swal2-textarea !m-0 bg-slate-900 border-slate-700 text-white rounded-xl text-sm h-24 w-full">${node.description || ""}</textarea>
          </div>
        `,
        background: "#020617",
        color: "#f8fafc",
        confirmButtonText: "Commit Changes",
        confirmButtonColor: "#38bdf8",
        showCancelButton: true,
        preConfirm: () => ({
          name: document.getElementById('swal-name').value,
          description: document.getElementById('swal-desc').value
        })
      });

      if (formValues?.name) {
        try {
          await axios.put(`${import.meta.env.VITE_API_URL}/artifacts/${node.id}`, { 
            name: formValues.name, 
            description: formValues.description,
            parentId: node.parentId 
          }, axiosConfig);
          setArtifacts(prev => updateTreeState(prev, "UPDATE", { id: node.id, name: formValues.name, description: formValues.description }));
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Update Failed', background: '#020617', color: '#fff' });
        }
      }
    } else if (type === 'READ') {
      Swal.fire({
        title: `<span class="text-sky-400 font-mono text-sm tracking-widest uppercase italic">Component_Insights</span>`,
        html: `
          <div class="text-left space-y-4 mt-4">
            <div class="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <p class="text-[9px] text-slate-500 font-black uppercase mb-1 tracking-widest">Label</p>
              <p class="text-white font-bold text-lg italic tracking-tight uppercase">${node.name}</p>
            </div>
            <div class="p-4 bg-slate-900 border border-slate-800 rounded-2xl min-h-[100px]">
              <p class="text-[9px] text-slate-500 font-black uppercase mb-1 tracking-widest">System Description</p>
              <p class="text-slate-400 text-sm leading-relaxed">${node.description || "<span class='text-slate-600 italic'>N/A (No description provided)</span>"}</p>
            </div>
            <p class="text-[9px] text-slate-600 font-mono uppercase tracking-tighter ml-2 italic">Architecture_ID: ${node.id}</p>
          </div>
        `,
        background: "#020617",
        confirmButtonColor: "#38bdf8",
        customClass: { popup: 'rounded-[2.5rem] border border-slate-800 shadow-2xl' }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:px-12">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6 border-b border-slate-800/60 pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <p className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] uppercase">Core Architecture</p>
            </div>
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Artifact <span className="text-slate-500 font-light">Vault</span></h1>
          </div>
          <button onClick={() => createArtifact(null)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-emerald-400 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-white/5">
            <HiOutlinePlus /> INITIALIZE
          </button>
        </header>

        <main className="bg-slate-900/10 border border-slate-800/40 rounded-[2rem] p-6 lg:p-10 backdrop-blur-3xl shadow-xl min-h-[60vh]">
          {loading ? (
             <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-slate-800/10 rounded-xl animate-pulse border border-slate-800/20" style={{ width: `${95 - (i * 4)}%`, marginLeft: i * 32 }} />
                ))}
             </div>
          ) : artifacts.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center opacity-40">
               <HiOutlineServer className="text-6xl mb-4" />
               <p className="text-sm font-mono tracking-widest uppercase">System Void</p>
            </div>
          ) : (
            <div className="w-full max-w-5xl mx-auto relative">
              {renderTree(artifacts, createArtifact, handleAction)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const renderTree = (nodes, onCreate, onAction) => {
  return nodes.map(node => (
    <TreeNode key={node.id} node={node} onCreate={onCreate} onAction={onAction} />
  ));
};

function TreeNode({ node, onCreate, onAction, level = 0 }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative w-full mb-3 group/node">
      {node.parentId && (
        <div className="absolute -left-8 top-6 w-8 h-[1px] bg-slate-800 group-hover/node:bg-emerald-500/30 transition-colors" />
      )}

      <motion.div layout className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsOpen(!isOpen)} className={`p-1.5 rounded-lg bg-slate-800/40 hover:text-emerald-400 transition-all ${!hasChildren && 'opacity-0 scale-0'}`}>
            {isOpen ? <HiChevronDown size={16} /> : <HiChevronRight size={16} />}
          </button>

          <div className="flex items-center gap-4 cursor-pointer" onClick={() => onAction('READ', node)}>
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all ${hasChildren ? 'bg-sky-500/5 text-sky-400 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]' : 'bg-slate-800 text-slate-500 border-slate-700/50'}`}>
              {hasChildren ? <HiOutlineDatabase size={20} /> : <HiOutlineTerminal size={20} />}
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight group-hover/node:text-sky-400 transition-colors italic">{node.name}</h3>
              <span className="text-[9px] text-slate-600 font-mono uppercase tracking-tighter">NODE_0{level + 1} // PID_{node.id.substring(0, 6)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => onCreate(node.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/40 hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400 rounded-lg transition-all font-mono text-[10px] uppercase border border-transparent hover:border-emerald-500/20">
            <HiOutlinePlus size={14} /> <span>Child</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-800 mx-1" />
          <button onClick={() => onAction('EDIT', node)} className="p-2 text-slate-500 hover:text-blue-400 rounded-lg transition-all"><HiOutlinePencilAlt size={16} /></button>
          <button onClick={() => onAction('DELETE', node)} className="p-2 text-slate-500 hover:text-rose-400 rounded-lg transition-all"><HiOutlineTrash size={16} /></button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="ml-5 border-l border-slate-800/50 pl-8 mt-2 space-y-3 relative">
            {renderTree(node.children, onCreate, onAction)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const HiOutlineTerminal = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" height="1em" width="1em" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
  </svg>
);

export default ArtificatePage; // ✅ Fix: Added default export