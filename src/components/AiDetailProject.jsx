import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import plantumlEncoder from "plantuml-encoder";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  HiOutlineChevronLeft, HiOutlineLightningBolt, HiOutlineCube, 
  HiOutlineTerminal, HiOutlineEye, HiOutlineDownload,
  HiOutlineClipboardCopy, HiOutlineTable, HiOutlineCollection, HiOutlineExclamationCircle
} from "react-icons/hi";

/**
 * 🧠 UNIVERSAL DATA DNA EXTRACTOR
 * Har tarah ke format (HTML, Markdown, JSON, UML) ko normalize karta hai.
 */
const extractOmniContent = (input) => {
  if (!input) return { content: "No data detected.", uml: null, isTabular: false };

  let workingData = input;
  let umlData = null;
  let isTabular = false;

  // 🔄 Deep Extraction (Recursively handles nested JSON strings from AI)
  for (let i = 0; i < 5; i++) {
    try {
      let cleanStr = typeof workingData === 'string' 
        ? workingData.replace(/```json|```markdown|```/g, "").trim() 
        : workingData;

      if (typeof cleanStr === 'string' && (cleanStr.startsWith("{") || cleanStr.startsWith("["))) {
        const parsed = JSON.parse(cleanStr);
        if (parsed.data) {
          workingData = parsed.data;
          if (parsed.format === "TABLE") isTabular = true;
        } else {
          workingData = parsed;
          break;
        }
      } else {
        workingData = cleanStr;
        break;
      }
    } catch (e) { break; }
  }

  let finalContent = typeof workingData === 'object' 
    ? JSON.stringify(workingData, null, 2) 
    : String(workingData);

  // 🛠️ UML Extraction
  const plantUmlRegex = /(@startuml[\s\S]*?@enduml)/g;
  const umlMatch = finalContent.match(plantUmlRegex);
  if (umlMatch) {
    umlData = umlMatch[0];
    finalContent = finalContent.replace(plantUmlRegex, "").trim();
  }

  // 📊 Smart Table/List Sensing
  if (finalContent.includes("|---|") || finalContent.includes("<table") || finalContent.includes("<tr>")) {
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

  const syncSequence = useCallback(async () => {
    if (!state) return;
    try {
      setLoading(true);
      const API_URL = `${import.meta.env.VITE_AI_API_CALL}/generate`;
      const res = await axios.post(API_URL, { ...state }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (res.data?.success) {
        const raw = res.data.data.aiOutputContent?.data || res.data.data.aiOutputContent || "";
        setArtifact(extractOmniContent(raw));
      } else {
        throw new Error("Neural Link Failure");
      }
    } catch (err) {
      setError(err.message || "Protocol Error");
    } finally {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    if (!state) { navigate(-1); return; }
    syncSequence();
  }, [syncSequence, state, navigate]);

  const getUmlUrl = (code) => {
    const encoded = plantumlEncoder.encode(code);
    return `https://www.plantuml.com/plantuml/svg/${encoded}`;
  };

  const downloadDiagram = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Project_Architecture_${Date.now()}.svg`;
      link.click();
    } catch (e) { window.open(url, '_blank'); }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* 🌌 Background FX */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6 py-10">
        
        {/* 📟 Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 text-[10px] font-bold uppercase tracking-widest transition-all">
              <HiOutlineChevronLeft /> Back_to_Terminal
            </button>
            <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter">
              {state?.artifactName || "Data_Stream"}
            </h1>
          </div>

          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 backdrop-blur-md">
            {['overview', 'source'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-emerald-500 text-black' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <main className="min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <HiOutlineCube size={50} className="text-emerald-500 animate-spin mb-4" />
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-500 animate-pulse">Decrypting_Neural_Matrix...</p>
            </div>
          ) : error ? (
            <div className="p-10 bg-red-500/5 border border-red-500/20 rounded-3xl text-center">
              <HiOutlineExclamationCircle className="mx-auto text-red-500 mb-4" size={40} />
              <p className="text-red-400 font-mono text-xs uppercase">{error}</p>
              <button onClick={syncSequence} className="mt-6 px-8 py-3 bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest">Retry_Sync</button>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {activeTab === "overview" && (
                <>
                  {/* 🖼️ UML Visualization */}
                  {artifact?.uml && (
                    <section className="group">
                      <div className="flex items-center gap-2 text-blue-400 mb-4 px-2">
                        <HiOutlineEye size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Architecture_Render</span>
                      </div>
                      <div className="bg-white p-8 rounded-[2.5rem] border-[12px] border-slate-950 shadow-2xl relative overflow-hidden transition-transform hover:scale-[1.01]">
                        <button 
                          onClick={() => downloadDiagram(getUmlUrl(artifact.uml))}
                          className="absolute top-6 right-6 p-4 bg-slate-900 text-white rounded-2xl hover:bg-emerald-500 hover:text-black transition-all shadow-xl"
                        >
                          <HiOutlineDownload size={20} />
                        </button>
                        <img src={getUmlUrl(artifact.uml)} alt="UML_Diagram" className="mx-auto max-w-full" />
                      </div>
                    </section>
                  )}

                  {/* 📑 Document Content (Markdown + HTML + Lists) */}
                  <section className="bg-slate-900/40 border border-slate-800/60 p-8 md:p-16 rounded-[3rem] backdrop-blur-sm relative overflow-hidden">
                    <div className="flex items-center gap-4 text-emerald-400 mb-10 pb-6 border-b border-slate-800/50">
                       {artifact?.isTabular ? <HiOutlineTable size={24}/> : <HiOutlineCollection size={24}/>}
                       <span className="text-[11px] font-black uppercase tracking-[0.3em]">Verified_Intel_Report</span>
                    </div>

                    <article className="prose prose-invert prose-emerald max-w-none 
                      prose-h2:text-3xl prose-h2:font-black prose-h2:text-white prose-h2:mb-8
                      prose-h3:text-emerald-400 prose-h3:text-lg prose-h3:uppercase prose-h3:tracking-widest
                      prose-p:text-slate-400 prose-p:text-lg prose-p:leading-relaxed
                      prose-li:text-slate-300 prose-li:my-2
                      prose-table:w-full prose-table:border-collapse prose-table:my-8
                      prose-th:bg-slate-950 prose-th:text-emerald-400 prose-th:p-4 prose-th:border prose-th:border-slate-800 prose-th:text-xs prose-th:uppercase
                      prose-td:p-4 prose-td:border prose-td:border-slate-800 prose-td:text-sm prose-td:text-slate-300">
                      
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        rehypePlugins={[rehypeRaw]} // 👈 This fixes Vercel HTML problem
                      >
                        {artifact.content}
                      </ReactMarkdown>
                    </article>
                  </section>
                </>
              )}

              {activeTab === "source" && (
                <div className="bg-[#010409] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-slate-800">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <HiOutlineTerminal /> Raw_Source_Protocol
                    </span>
                    <button 
                      onClick={() => {navigator.clipboard.writeText(artifact.content); alert("Copied!");}}
                      className="text-[10px] font-bold text-slate-500 hover:text-white uppercase transition-all flex items-center gap-2"
                    >
                      <HiOutlineClipboardCopy size={16}/> Copy_Code
                    </button>
                  </div>
                  <div className="p-6 max-h-[600px] overflow-auto">
                    <SyntaxHighlighter 
                      language={artifact.uml ? "java" : "markdown"} 
                      style={vscDarkPlus} 
                      customStyle={{background: 'transparent', fontSize: '14px'}}
                    >
                      {artifact.uml || artifact.content}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 🏁 Footer */}
        <footer className="mt-24 pt-8 border-t border-slate-900/50 flex flex-col md:flex-row justify-between text-[10px] font-mono uppercase tracking-widest text-slate-600">
           <p>Node_Status: <span className="text-emerald-500">Active</span></p>
           <p>© {new Date().getFullYear()} Neural_Oracle // {state?.projectTitle}</p>
        </footer>
      </div>
    </div>
  );
}