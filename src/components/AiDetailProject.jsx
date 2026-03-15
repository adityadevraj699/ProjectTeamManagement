import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import plantumlEncoder from "plantuml-encoder";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  HiOutlineChevronLeft, HiOutlineLightningBolt, HiOutlineCube, 
  HiOutlineCode, HiOutlineClipboardCheck, HiOutlineDocumentText, 
  HiOutlineTerminal, HiOutlineRefresh, HiOutlineEye, HiOutlineVariable
} from "react-icons/hi";

export default function AiDetailProject() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, diagram, source
  
  // Refined Data Structure
  const [parsedArtifact, setParsedArtifact] = useState({
    name: "",
    description: "",
    rawContent: "",
    documentation: "",
    umlCode: "",
    hasDiagram: false
  });

  const API_URL = `${import.meta.env.VITE_AI_API_CALL}/generate`;

  useEffect(() => {
    if (!state) { navigate(-1); return; }
    generateArtifact();
  }, []);

  const generateArtifact = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(API_URL, {
        artifactId: state.artifactId,
        projectId: state.projectId,
        artifactName: state.artifactName,
        artifactDescription: state.artifactDescription,
        projectTitle: state.projectTitle,
        projectTechStack: state.projectTechStack,
        projectDescription: state.projectDescription
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (res.data.success) {
        processContent(res.data.data.aiOutputContent.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Neural link failure.");
    } finally {
      setLoading(false);
    }
  };

  // The Magic Parser: Splits Documentation and UML
  const processContent = (rawText) => {
    let cleanText = rawText;
    
    // Handle cases where AI wraps everything in a JSON code block (like TCS)
    if (rawText.includes("```json")) {
      const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          cleanText = parsed.data || rawText;
        } catch (e) { console.error("JSON Parse Error"); }
      }
    }

    const umlRegex = /(@startuml[\s\S]*?@enduml)/g;
    const umlMatch = cleanText.match(umlRegex);
    const umlCode = umlMatch ? umlMatch[0] : "";
    const documentation = cleanText.replace(umlRegex, "").trim();

    setParsedArtifact({
      name: state.artifactName,
      description: state.artifactDescription,
      rawContent: rawText,
      documentation: documentation,
      umlCode: umlCode,
      hasDiagram: !!umlCode
    });
  };

  const getDiagramUrl = (code) => {
    try {
      const encoded = plantumlEncoder.encode(code);
      return `https://www.plantuml.com/plantuml/svg/${encoded}`;
    } catch (e) { return null; }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(parsedArtifact.umlCode || parsedArtifact.rawContent);
    alert("Source logic copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Cinematic Aura */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-600/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-10 py-6 sm:py-10">
        
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between mb-12">
          <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-all">
            <HiOutlineChevronLeft className="group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exit_Engine</span>
          </button>
          
          <div className="flex p-1 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-inner">
            <button onClick={() => setActiveTab("overview")} className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-emerald-500 text-black' : 'text-slate-500 hover:text-slate-300'}`}>Overview</button>
            {parsedArtifact.hasDiagram && (
              <>
                <button onClick={() => setActiveTab("diagram")} className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'diagram' ? 'bg-sky-500 text-black' : 'text-slate-500 hover:text-slate-300'}`}>Visual</button>
                <button onClick={() => setActiveTab("code")} className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'code' ? 'bg-indigo-500 text-black' : 'text-slate-500 hover:text-slate-300'}`}>Logic</button>
              </>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <header className="mb-16 relative">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
            <HiOutlineLightningBolt className="text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-[0.3em]">Neural Compute v3.2</span>
          </div>
          <h1 className="text-6xl sm:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.85] mb-8">
            {parsedArtifact.name || "Loading..."}
          </h1>
          <p className="text-slate-400 text-lg font-light border-l-2 border-slate-800 pl-8 max-w-3xl italic">
            {parsedArtifact.description}
          </p>
        </header>

        {/* Workbench Area */}
        <main className="relative min-h-[600px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/20 border border-slate-800/50 rounded-[4rem] backdrop-blur-3xl">
              <HiOutlineCube className="text-emerald-500 animate-spin mb-6" size={50} />
              <div className="h-1 w-48 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-progress origin-left" />
              </div>
            </div>
          ) : error ? (
            <div className="p-20 bg-red-500/5 border border-red-500/20 rounded-[4rem] text-center">
              <HiOutlineRefresh className="mx-auto text-red-400 mb-6 animate-spin-slow" size={40} />
              <p className="text-red-400 font-mono text-sm uppercase tracking-widest mb-8">{error}</p>
              <button onClick={generateArtifact} className="px-12 py-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 hover:bg-red-400 hover:text-black transition-all font-black text-xs uppercase">Re-Sync_Sequence</button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              
              <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] sm:rounded-[5rem] overflow-hidden backdrop-blur-3xl shadow-[0_0_100px_-50px_rgba(16,185,129,0.3)] ring-1 ring-white/5">
                
                {/* Tab: Overview (Combines Documentation + Diagram) */}
                {activeTab === "overview" && (
                  <div className="p-8 sm:p-20 space-y-20">
                    
                    {/* Documentation Area (Handled all: Functional, CD, TCS) */}
                    {parsedArtifact.documentation && (
                      <section className="max-w-5xl mx-auto">
                        <div className="flex items-center gap-3 text-emerald-400 mb-10">
                          <HiOutlineDocumentText size={24} />
                          <span className="text-xs font-black uppercase tracking-[0.5em]">Project_Intel_Report</span>
                        </div>
                        <div className="prose prose-invert prose-emerald max-w-none 
                          prose-table:border prose-table:border-slate-800 prose-th:bg-slate-950 prose-th:p-5 prose-th:text-emerald-400 prose-th:uppercase prose-th:text-[11px]
                          prose-td:p-5 prose-td:border prose-td:border-slate-800 prose-td:text-slate-300
                          prose-h3:text-white prose-h3:italic prose-h3:font-black prose-h3:text-3xl
                          prose-p:text-slate-400 prose-p:text-lg prose-p:leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsedArtifact.documentation}</ReactMarkdown>
                        </div>
                      </section>
                    )}

                    {/* Integrated Visual (If available) */}
                    {parsedArtifact.hasDiagram && (
                      <section className="space-y-10 pt-20 border-t border-slate-800/50">
                        <div className="flex items-center justify-between max-w-5xl mx-auto">
                           <div className="flex items-center gap-3 text-sky-400">
                             <HiOutlineEye size={24} />
                             <span className="text-xs font-black uppercase tracking-[0.5em]">Architecture_Mapping</span>
                           </div>
                           <button onClick={handleCopy} className="text-[9px] font-mono text-slate-500 hover:text-white uppercase tracking-widest border border-slate-800 px-3 py-1 rounded-lg transition-all">Copy_UML</button>
                        </div>
                        <div className="bg-white p-6 sm:p-16 rounded-[3rem] border-[12px] border-slate-950 shadow-2xl flex justify-center overflow-x-auto mx-auto max-w-[1100px]">
                           <img 
                            src={getDiagramUrl(parsedArtifact.umlCode)} 
                            alt="UML Logic" 
                            className="max-w-full h-auto transition-transform duration-700 hover:scale-[1.02]"
                           />
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {/* Tab: Visual Focus */}
                {activeTab === "diagram" && (
                  <div className="p-8 sm:p-24 flex flex-col items-center">
                    <div className="bg-white p-10 sm:p-24 rounded-[4rem] border-[20px] border-slate-950 shadow-inner-2xl w-full flex justify-center overflow-x-auto ring-1 ring-slate-800">
                       <img src={getDiagramUrl(parsedArtifact.umlCode)} alt="Diagram Full" className="max-w-none sm:max-w-full h-auto scale-110 sm:scale-100" />
                    </div>
                    <div className="mt-12 flex gap-4">
                        <span className="px-4 py-1.5 bg-slate-950 rounded-full text-[10px] font-mono text-slate-500 tracking-widest uppercase">Format: SVG Vector</span>
                    </div>
                  </div>
                )}

                {/* Tab: Logic / Source */}
                {activeTab === "code" && (
                  <div className="bg-[#010409]">
                    <div className="flex items-center justify-between px-10 py-5 border-b border-slate-800 bg-slate-950/80">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-800" />
                        <div className="w-3 h-3 rounded-full bg-slate-800" />
                        <div className="w-3 h-3 rounded-full bg-slate-800" />
                      </div>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-2"><HiOutlineTerminal /> UML_Logic_Source</span>
                      <button onClick={() => handleCopy()} className="text-[10px] font-black text-slate-500 hover:text-emerald-400 transition-colors uppercase tracking-widest">Copy_Block</button>
                    </div>
                    <div className="p-10 sm:p-16 overflow-x-auto">
                      <pre className="text-emerald-400/80 font-mono text-sm leading-[2.2] selection:bg-emerald-500 selection:text-black">
                        {parsedArtifact.umlCode}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Status Footer */}
              <footer className="grid grid-cols-1 sm:grid-cols-3 items-center gap-8 py-16 px-6 opacity-60">
                 <div className="flex flex-col gap-2">
                   <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Logic_Hash</span>
                   <span className="text-xs text-slate-400 truncate font-mono">0x{Math.random().toString(16).slice(2, 18).toUpperCase()}</span>
                 </div>
                 <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-4">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                       <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                       <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    </div>
                    <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.5em]">Synchronized_with_Gemini_AI</span>
                 </div>
                 <div className="flex flex-col sm:items-end gap-2 text-right">
                   <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Sequence_Version</span>
                   <span className="text-xs text-slate-400 font-mono">2026.03.FINAL.STABLE</span>
                 </div>
              </footer>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}