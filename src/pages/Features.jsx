import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiChevronDown, HiTemplate, HiDocumentText, HiUserGroup, 
  HiChartPie, HiFolderOpen, HiOfficeBuilding, HiArrowRight 
} from "react-icons/hi";

// --- DATA ---
const features = [
  {
    id: 1,
    title: "Centralized Project Lifecycle",
    icon: <HiTemplate />,
    summary: "Team formation, guide allocation, and task scheduling in one cloud workspace.",
    body: `A complete cloud-based workspace to create teams, assign guides, schedule tasks, and manage meetings. 
    
    It replaces scattered tools like WhatsApp groups and spreadsheets with a structured academic workflow, ensuring everyone stays on the same page from day one.`
  },
  {
    id: 2,
    title: "Automated MOM Generation",
    icon: <HiDocumentText />,
    summary: "Capture meeting notes and export official PDFs instantly.",
    body: `Forget manual typing. Capture meeting notes, decisions, and action items directly in the dashboard. 
    
    The system automatically generates professional, printable PDF Minutes of Meeting (MOMs) attached to specific project milestones for external audits and grading.`
  },
  {
    id: 3,
    title: "Role-Based Workflows",
    icon: <HiUserGroup />,
    summary: "Distinct flows for Admins, Guides, and Students.",
    body: `Specialized dashboards for every stakeholder:
    • **Students**: Submit updates, view tasks, request meetings.
    • **Guides**: Approve deliverables, provide structured feedback, and grade milestones.
    • **Admins**: Oversee all projects, manage timelines, and export college-level reports.`
  },
  {
    id: 4,
    title: "Real-Time Tracking & Analytics",
    icon: <HiChartPie />,
    summary: "Live dashboards for progress, deadlines, and contribution stats.",
    body: `Visualize project health with live charts. Track individual student contributions, upcoming deadlines, and pending tasks. 
    
    Automated email and in-app notifications ensure no deadline is ever missed.`
  },
  {
    id: 5,
    title: "Versioned Document Repository",
    icon: <HiFolderOpen />,
    summary: "Secure storage for reports, code, and diagrams.",
    body: `A central hub for all project assets. Upload project reports, source code zips, and architectural diagrams. 
    
    The system maintains version history, allowing guides to review previous iterations and track the evolution of the project.`
  },
  {
    id: 6,
    title: "Enterprise-Ready Architecture",
    icon: <HiOfficeBuilding />,
    summary: "Multi-tenant setup for colleges and startups.",
    body: `Built for scale. The platform supports institution-level data separation (Multi-tenancy), custom branding (White-labeling), and modular add-ons. 
    
    Perfect for colleges managing hundreds of projects simultaneously.`
  }
];

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(0); // Open first one by default

  const toggle = (index) => {
    setActiveFeature(activeFeature === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 relative overflow-hidden font-sans selection:bg-sky-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-5xl mx-auto px-6 py-20 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16 space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-white tracking-tight"
          >
            Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">Features</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Everything you need to manage academic projects, from team formation to final submission.
          </motion.p>
        </div>

        {/* --- FEATURE LIST (ACCORDION) --- */}
        <div className="space-y-4">
          {features.map((feature, index) => {
            const isOpen = activeFeature === index;
            return (
              <motion.div 
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? "bg-slate-800/60 border-sky-500/50 shadow-lg shadow-sky-500/10" 
                    : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600"
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <div className="flex items-center gap-5">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors ${
                      isOpen ? "bg-sky-500 text-white shadow-md" : "bg-slate-700/50 text-slate-400"
                    }`}>
                      {feature.icon}
                    </div>
                    
                    {/* Title & Summary */}
                    <div>
                      <h3 className={`text-lg font-bold transition-colors ${isOpen ? "text-white" : "text-slate-200"}`}>
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1 hidden sm:block">
                        {feature.summary}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className={`p-2 rounded-full transition-transform duration-300 ${isOpen ? "rotate-180 bg-slate-700 text-white" : "text-slate-500"}`}>
                    <HiChevronDown className="text-xl" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-8 pl-[5.5rem] pr-8 text-slate-300 text-sm leading-relaxed border-t border-slate-700/30 pt-6">
                        <p className="whitespace-pre-line">{feature.body}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* --- BOTTOM CTA --- */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col items-center bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
             
             <h3 className="text-2xl font-bold text-white mb-2">Ready to streamline your workflow?</h3>
             <p className="text-slate-400 mb-6">Join thousands of students and guides managing projects efficiently.</p>
             
             <a
              href="/contact"
              className="px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold shadow-lg shadow-sky-500/25 transition-all hover:scale-105 flex items-center gap-2"
            >
              Request a Demo <HiArrowRight />
            </a>
          </div>
        </div>

      </main>
    </div>
  );
}