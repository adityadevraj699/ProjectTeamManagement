import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import plantumlEncoder from "plantuml-encoder";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  HiOutlineChevronLeft, HiOutlineLightningBolt, HiOutlineCube, 
  HiOutlineTerminal, HiOutlineRefresh, HiOutlineEye, HiOutlineDownload,
  HiOutlineClipboardCopy, HiOutlineTable, HiOutlineCollection
} from "react-icons/hi";

/**
 * 🧠 ARCHITECT'S DNA ENGINE v2.0
 * Handles nested JSON, Markdown Tables, and Extracts UML from Text
 */
const analyzeArtifactDNA = (rawText) => {
  if (!rawText) return { type: "EMPTY", content: "" };

  let workingText = rawText.replace(/```json|```/g, "").trim();
  const results = {
    type: "MARKDOWN",
    content: workingText,
    uml: null,
    structuredData: null,
    isTabular: false
  };

  // 1. NESTED JSON DETECTION (For TCS/NFR artifacts)
  try {
    if (workingText.startsWith("{") || workingText.startsWith("[")) {
      const parsed = JSON.parse(workingText);
      if (parsed.data) workingText = parsed.data; // Extract data string if wrapped
      if (parsed.format === "TABLE") results.type = "MARKDOWN_TABLE";
      results.structuredData = parsed;
    }
  } catch (e) { /* Not a JSON object, proceed as string */ }

  // 2. UML EXTRACTION (Finds @startuml anywhere in the text)
  const plantUmlRegex = /(@startuml[\s\S]*?@enduml)/g;
  const umlMatch = workingText.match(plantUmlRegex);
  
  if (umlMatch) {
    results.uml = umlMatch[0];
    results.type = "DIAGRAM_WITH_DOCS";
    // Remove UML code from content so it doesn't show as raw text in docs
    results.content = workingText.replace(plantUmlRegex, "").trim();
  }

  // 3. TABLE DETECTION
  if (results.content.includes("|---|") || results.content.includes("| :")) {
    results.isTabular = true;
  }

  return results;
};

export default function AiDetailProject() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [artifact, setArtifact] = useState(null);

  const API_URL = `${import.meta.env.VITE_AI_API_CALL}/generate`;

  useEffect(() => {
    if (!state) { navigate(-1); return; }
    fetchSequence();
  }, []);

  const fetchSequence = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(API_URL, { ...state }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.success) {
        const dna = analyzeArtifactDNA(res.data.data.aiOutputContent.data);
        setArtifact(dna);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Neural Link Failed.");
    } finally {
      setLoading(false);
    }
  };

  const getUmlImage = (code) => {
    const encoded = plantumlEncoder.encode(code);
    return `https://www.plantuml.com/plantuml/svg/${encoded}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Logic sequence copied!");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* 🌌 Cinematic Aura */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 py-10">
        
        {/* 📟 Navigation & Tabs */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-all text-[10px] font-black tracking-[0.3em] uppercase">
              <HiOutlineChevronLeft className="group-hover:-translate-x-1" /> Return_To_Core
            </button>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none uppercase italic tracking-tighter">
              {state?.artifactName || "Artifact"}
            </h1>
          </div>

          <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl">
            {['overview','source'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <main className="min-h-[600px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[500px] bg-slate-950/50 border border-slate-800/50 rounded-[4rem] border-dashed animate-pulse">
              <HiOutlineCube size={50} className="text-emerald-500 animate-spin mb-6" />
              <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-slate-500">Decrypting_Neural_Stream...</span>
            </div>
          ) : error ? (
            <div className="p-20 bg-red-500/5 border border-red-500/20 rounded-[4rem] text-center backdrop-blur-md">
              <HiOutlineRefresh className="mx-auto text-red-500 mb-6 animate-spin-slow" size={40} />
              <p className="text-red-400 font-mono text-sm uppercase tracking-widest mb-8">{error}</p>
              <button onClick={fetchSequence} className="px-12 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Retry_Sequence</button>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
              
              {activeTab === "overview" && (
                <>
                  {/* 🖼️ DIAGRAM VISUALIZER (Top Priority) */}
                  {artifact?.uml && (
                    <section className="group relative">
                      <div className="flex items-center gap-3 text-sky-400 mb-6 px-4">
                        <HiOutlineEye size={22} className="animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">Architecture_Visualization</span>
                      </div>

                      <div className="bg-white p-6 md:p-16 rounded-[3rem] border-[12px] border-slate-950 shadow-[0_0_80px_-20px_rgba(16,185,129,0.2)] overflow-hidden relative">
                         {/* Download Action */}
                         <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => window.open(getUmlImage(artifact.uml))}
                              className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-emerald-500 transition-all shadow-2xl"
                            >
                              <HiOutlineDownload size={22} />
                            </button>
                         </div>

                         {/* Actual PlantUML Render */}
                         <img 
                            src={getUmlImage(artifact.uml)} 
                            alt="UML Diagram" 
                            className="mx-auto max-w-full h-auto transition-transform duration-700 group-hover:scale-[1.01]" 
                         />

                         <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-2">Format: SVG_Vector</span>
                            <span>Engine: PlantUML_v1.2026</span>
                         </div>
                      </div>
                    </section>
                  )}

                  {/* 📑 INTEL DOCUMENTATION (The Prose Area) */}
                  <section className="bg-slate-900/40 border border-slate-800 p-8 md:p-20 rounded-[4rem] backdrop-blur-3xl shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                      <HiOutlineTable size={200} />
                    </div>

                    <div className="flex items-center gap-4 text-emerald-400 mb-12 border-b border-slate-800 pb-8 relative">
                       {artifact?.isTabular ? <HiOutlineTable size={28}/> : <HiOutlineCollection size={28}/>}
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Intel_Documentation_Stream</span>
                          <span className="text-[9px] text-slate-500 font-mono mt-1 italic italic">Structure Verified by AI Oracle</span>
                       </div>
                    </div>

                    <article className="prose prose-invert prose-emerald max-w-none relative
                      prose-h2:text-4xl prose-h2:font-black prose-h2:italic prose-h2:text-white prose-h2:mb-12
                      prose-h3:text-emerald-400 prose-h3:uppercase prose-h3:text-sm prose-h3:tracking-[0.3em] prose-h3:mt-16
                      prose-p:text-slate-400 prose-p:text-xl prose-p:leading-relaxed
                      prose-li:text-slate-300 prose-li:text-lg prose-li:my-3
                      prose-table:border prose-table:border-slate-800 prose-th:bg-slate-950 prose-th:p-6 prose-th:text-emerald-500 prose-th:text-xs prose-th:uppercase
                      prose-td:p-6 prose-td:border prose-td:border-slate-800 prose-td:text-slate-300 prose-tr:hover:bg-emerald-500/5 transition-all">
                      
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {artifact.content}
                      </ReactMarkdown>

                      {/* Fallback for Custom JSON structured data */}
                      {artifact.type === "JSON_OBJECT" && !artifact.content && (
                        <div className="mt-10">
                          <SyntaxHighlighter language="json" style={vscDarkPlus} className="rounded-[2rem] border border-slate-800 p-8 text-sm shadow-2xl">
                            {JSON.stringify(artifact.structuredData, null, 2)}
                          </SyntaxHighlighter>
                        </div>
                      )}
                    </article>
                  </section>
                </>
              )}

              {activeTab === "source" && (
                <div className="bg-slate-950 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-10 py-6 bg-slate-900/80 border-b border-slate-800">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-2"><HiOutlineTerminal /> Raw_Logic_Sequence</span>
                    <button 
                      onClick={() => copyToClipboard(artifact.uml || artifact.content)}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-emerald-400 transition-all uppercase tracking-widest"
                    >
                      <HiOutlineClipboardCopy size={18}/> Copy_Logic
                    </button>
                  </div>
                  <div className="p-10 overflow-x-auto h-[650px] scrollbar-hide">
                    <SyntaxHighlighter language={artifact.uml ? "java" : "markdown"} style={vscDarkPlus} customStyle={{background: 'transparent', padding: '0', fontSize: '14px', lineHeight: '1.8'}}>
                      {artifact.uml || artifact.content}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 🏁 Advance Footer Status Bar */}
        <footer className="mt-32 pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8 opacity-30 hover:opacity-100 transition-opacity duration-1000">
           <div className="font-mono text-[10px] uppercase tracking-widest space-y-2">
              <p>Project_Node: <span className="text-white">{state?.projectTitle}</span></p>
              <p>Neural_Stack: <span className="text-emerald-500">{state?.projectTechStack}</span></p>
           </div>
           
           <div className="flex flex-col items-center gap-3">
              <div className="flex gap-4">
                 {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" style={{animationDelay: `${i*0.3}s`}} />)}
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-500">Neural_Synchronization_Active</span>
           </div>

           <div className="text-right font-mono text-[10px] uppercase tracking-widest space-y-2">
              <p>Security_Clearance: <span className="text-emerald-400">Level_Alpha</span></p>
              <p>Timestamp: <span className="text-blue-500 font-bold">{new Date().toLocaleDateString()} // {new Date().toLocaleTimeString()}</span></p>
           </div>
        </footer>
      </div>
    </div>
  );
}