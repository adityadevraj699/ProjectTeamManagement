import React, { useEffect, useState, useCallback } from "react";
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
  HiOutlineClipboardCopy, HiOutlineTable, HiOutlineCollection, HiOutlineExclamationCircle
} from "react-icons/hi";

/**
 * 🧠 UNIVERSAL DATA DNA EXTRACTOR
 * Pehchanta hai ki data Nested JSON hai, Table hai, ya Diagram.
 * Vercel par aane wali "Raw JSON keys display" wali problem ko jadd se khatam karta hai.
 */
const extractOmniContent = (input) => {
  if (!input) return { type: "EMPTY", content: "No data detected." };

  let workingData = input;
  let umlData = null;
  let isTabular = false;

  // 🔄 RECURSIVE UNWRAPPER (Max 5 layers)
  // Yeh loop tab tak chalega jab tak humein asli Markdown string na mil jaye
  for (let i = 0; i < 5; i++) {
    try {
      // 1. Kachra saaf karo (Remove Markdown code blocks around JSON)
      let cleanStr = typeof workingData === 'string' 
        ? workingData.replace(/```json|```markdown|```/g, "").trim() 
        : workingData;

      if (typeof cleanStr === 'string' && (cleanStr.startsWith("{") || cleanStr.startsWith("["))) {
        const parsed = JSON.parse(cleanStr);
        // Agar object ke andar 'data' key hai (Jaise NFR/TCS cases), toh usey nikaalo
        if (parsed.data && typeof parsed.data === 'string') {
          workingData = parsed.data;
          if (parsed.format === "TABLE") isTabular = true;
        } else {
          workingData = parsed; // Pure object mil gaya
          break;
        }
      } else {
        workingData = cleanStr; // Final text level mil gayi
        break;
      }
    } catch (e) { break; }
  }

  // 🛡️ NORMALIZE OUTPUT FOR RENDERER
  let finalContent = typeof workingData === 'object' 
    ? JSON.stringify(workingData, null, 2) 
    : String(workingData);

  // 🛠️ UML EXTRACTION (Finds @startuml anywhere in the text)
  const plantUmlRegex = /(@startuml[\s\S]*?@enduml)/g;
  const umlMatch = finalContent.match(plantUmlRegex);
  if (umlMatch) {
    umlData = umlMatch[0];
    // Main documentation se UML code hata rahe hain taaki double na dikhe
    finalContent = finalContent.replace(plantUmlRegex, "").trim();
  }

  // 📊 SMART TABLE SENSING
  if (finalContent.includes("|---|") || finalContent.includes("| :") || isTabular) {
    isTabular = true;
  }

  return { content: finalContent, uml: umlData, isTabular };
};

export default function AiDetailProject() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [artifact, setArtifact] = useState(null);

  const API_URL = `${import.meta.env.VITE_AI_API_CALL}/generate`;

  const syncSequence = useCallback(async () => {
    if (!state) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(API_URL, { ...state }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (res.data?.success) {
        // Deep decode backend content specifically targeting aiOutputContent.data
        const rawContent = res.data.data.aiOutputContent?.data || res.data.data.aiOutputContent || "";
        setArtifact(extractOmniContent(rawContent));
      } else {
        throw new Error("Failed to synchronize with Neural Oracle.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Sync Protocol Failure.");
    } finally {
      setLoading(false);
    }
  }, [state, API_URL]);

  useEffect(() => {
    if (!state) { navigate(-1); return; }
    syncSequence();
  }, [syncSequence]);

  const getUmlUrl = (code) => {
    try {
      const encoded = plantumlEncoder.encode(code);
      return `https://www.plantuml.com/plantuml/svg/${encoded}`;
    } catch (e) { return null; }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* 🌌 Cinematic Aura */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-blue-600/30 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-emerald-600/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-10 py-10">
        
        {/* 📟 Terminal Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
          <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-all text-[10px] font-black tracking-[0.3em] uppercase">
              <HiOutlineChevronLeft className="group-hover:-translate-x-1" /> Terminate_Session
            </button>
            <div className="flex items-center gap-3">
              <HiOutlineLightningBolt className="text-emerald-400 animate-bounce" />
              <span className="text-emerald-500 font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">Oracle_Verified_2026</span>
            </div>
            <h1 className="text-4xl md:text-8xl font-black text-white leading-[0.8] uppercase italic tracking-tighter drop-shadow-2xl">
              {state?.artifactName || "Decoding..."}
            </h1>
          </div>

          <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl">
            {['overview', 'source'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <main className="min-h-[600px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[500px] bg-slate-950/40 border border-slate-800/50 rounded-[4rem] border-dashed">
              <HiOutlineCube size={60} className="text-emerald-500 animate-spin mb-6" />
              <span className="text-[10px] font-mono uppercase tracking-[0.6em] text-slate-500 animate-pulse">Decrypting_Neural_Matrix...</span>
            </div>
          ) : error ? (
            <div className="p-20 bg-red-500/5 border border-red-500/20 rounded-[4rem] text-center backdrop-blur-3xl shadow-2xl">
              <HiOutlineExclamationCircle className="mx-auto text-red-500 mb-6" size={48} />
              <h2 className="text-white font-bold uppercase tracking-widest mb-2">Neural Synchronization Failed</h2>
              <p className="text-red-400/60 font-mono text-xs uppercase mb-10">{error}</p>
              <button onClick={syncSequence} className="px-12 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-red-500/20">Re-Synchronize</button>
            </div>
          ) : (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-1000">
              
              {activeTab === "overview" && (
                <>
                  {/* 🖼️ ARCHITECTURE VISUAL (Class Diagrams/UCD) */}
                  {artifact?.uml && (
                    <section className="group animate-in zoom-in-95 duration-700">
                      <div className="flex items-center gap-3 text-blue-400 mb-6 px-4">
                        <HiOutlineEye size={22} className="animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">Visual_Architecture_Mapping</span>
                      </div>

                      <div className="bg-white p-6 md:p-16 rounded-[4rem] border-[16px] border-slate-950 shadow-[0_0_100px_-20px_rgba(59,130,246,0.25)] overflow-hidden relative group-hover:scale-[1.005] transition-transform duration-700">
                         <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-all flex gap-3">
                            <button onClick={() => window.open(getUmlUrl(artifact.uml))} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-emerald-500 transition-all shadow-2xl">
                              <HiOutlineDownload size={20} />
                            </button>
                         </div>
                         <img src={getUmlUrl(artifact.uml)} alt="Architecture_Render" className="mx-auto max-w-full h-auto drop-shadow-2xl" />
                         <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center md:text-left">
                            <span>Format: .SVG_VECTOR</span>
                            <span className="hidden md:block text-emerald-500 uppercase tracking-[0.3em]">Oracle_Render_OK</span>
                            <span>Scale: 1:1_DYNAMIC</span>
                         </div>
                      </div>
                    </section>
                  )}

                  {/* 📑 INTEL DOCUMENTATION (Functional/TCS/NFR) */}
                  <section className="bg-slate-900/60 border border-slate-800 p-8 md:p-24 rounded-[5rem] backdrop-blur-3xl shadow-inner relative overflow-hidden group border-b-emerald-500/10">
                    <div className="absolute -top-20 -right-20 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-all duration-1000 rotate-12 group-hover:rotate-0">
                      <HiOutlineTable size={400} />
                    </div>

                    <div className="flex items-center gap-5 text-emerald-400 mb-16 border-b border-slate-800/50 pb-10 relative">
                       {artifact?.isTabular ? <HiOutlineTable size={32}/> : <HiOutlineCollection size={32}/>}
                       <div className="flex flex-col gap-1">
                          <span className="text-[12px] font-black uppercase tracking-[0.6em]">Neural_Intel_Sequence</span>
                          <span className="text-[10px] text-slate-500 font-mono italic tracking-wider">Validated Logic // High Integrity</span>
                       </div>
                    </div>

                    <article className="prose prose-invert prose-emerald max-w-none relative
                      prose-h2:text-4xl prose-h2:font-black prose-h2:italic prose-h2:text-white prose-h2:mb-12
                      prose-h3:text-emerald-400 prose-h3:uppercase prose-h3:text-sm prose-h3:tracking-[0.4em] prose-h3:mt-20 prose-h3:mb-8
                      prose-h4:text-slate-200 prose-h4:italic prose-h4:text-2xl prose-h4:mt-16
                      prose-p:text-slate-400 prose-p:text-xl prose-p:leading-relaxed prose-p:mb-10
                      prose-li:text-slate-300 prose-li:text-lg prose-li:mb-4 prose-li:marker:text-emerald-500
                      prose-table:border-collapse prose-table:w-full prose-table:my-10 prose-table:bg-slate-950/20 prose-table:rounded-3xl prose-table:overflow-hidden
                      prose-th:bg-slate-950 prose-th:p-8 prose-th:text-emerald-400 prose-th:text-[11px] prose-th:uppercase prose-th:tracking-widest prose-th:border prose-th:border-slate-800 prose-th:text-left
                      prose-td:p-8 prose-td:border prose-td:border-slate-800 prose-td:text-slate-300 prose-td:text-sm prose-td:align-top prose-tr:hover:bg-emerald-500/5 transition-all">
                      
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {artifact.content}
                      </ReactMarkdown>
                    </article>
                  </section>
                </>
              )}

              {activeTab === "source" && (
                <div className="bg-[#010409] rounded-[4rem] border border-slate-800 overflow-hidden shadow-2xl ring-1 ring-white/5 animate-in zoom-in-95 duration-500">
                  <div className="flex items-center justify-between px-10 py-8 bg-slate-900/60 border-b border-slate-800">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.5em] flex items-center gap-3"><HiOutlineTerminal className="animate-pulse" /> Raw_Logical_Source</span>
                    <button 
                      onClick={() => {navigator.clipboard.writeText(artifact.uml || artifact.content); alert("Encoded Logic Copied!");}}
                      className="flex items-center gap-3 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800"
                    >
                      <HiOutlineClipboardCopy size={20}/> Copy_Stream
                    </button>
                  </div>
                  <div className="p-12 h-[750px] overflow-auto scrollbar-hide">
                    <SyntaxHighlighter 
                      language={artifact.uml ? "java" : "markdown"} 
                      style={vscDarkPlus} 
                      customStyle={{background: 'transparent', padding: '0', fontSize: '16px', lineHeight: '2.0'}}
                    >
                      {artifact.uml || artifact.content}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 🏁 Industry-Grade Status Footer */}
        <footer className="mt-48 pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-12 opacity-30 hover:opacity-100 transition-all duration-1000 grayscale hover:grayscale-0">
           <div className="font-mono text-[11px] uppercase tracking-[0.2em] space-y-3 text-left">
              <p>Project_Node: <span className="text-white font-bold">{state?.projectTitle}</span></p>
              <p>Network_Sync_ID: <span className="text-emerald-500 font-bold">{state?.projectId} // {state?.artifactId}</span></p>
           </div>
           
           <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex gap-5">
                 {[1,2,3].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" style={{animationDelay: `${i*0.3}s`}} />)}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-600">Secure_Oracle_Data_Link_Active</span>
           </div>

           <div className="text-right font-mono text-[11px] uppercase tracking-[0.2em] space-y-3">
              <p>Auth_Status: <span className="text-emerald-500">ADMIN_VERIFIED</span></p>
              <p>Session_Cycle: <span className="text-blue-500 font-bold">{new Date().toLocaleTimeString()}</span></p>
           </div>
        </footer>
      </div>
    </div>
  );
}