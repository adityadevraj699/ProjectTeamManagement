import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiChevronDown, HiSearch, HiQuestionMarkCircle, 
  HiMail, HiChatAlt2, HiOfficeBuilding, HiPhone 
} from "react-icons/hi";

// --- DATA ---
const CATEGORIZED_FAQS = [
  // Pricing & Billing
  {
    category: "Pricing & Billing",
    q: "What billing options do you offer?",
    a: "We offer both monthly and annual billing. Monthly plans provide flexibility with pay-as-you-go billing, while annual plans reduce the effective monthly cost (~20% off) and are billed once per year.",
  },
  {
    category: "Pricing & Billing",
    q: "What is the institutional pricing?",
    a: "The institutional starter plan is priced at ₹15,000 per year. There is also a monthly option available at ₹2,500 per month. Enterprise deployments are priced via custom quotes depending on scale and integration needs.",
  },
  {
    category: "Pricing & Billing",
    q: "Are there volume discounts for multiple departments?",
    a: "Yes. We provide volume discounts and customized pricing for multi-department or multi-campus rollouts. Contact our sales team for a tailored proposal.",
  },
  
  // Onboarding & Setup
  {
    category: "Onboarding & Setup",
    q: "How long does implementation take?",
    a: "Implementation time depends on scope: basic setups can be completed within a few hours, while enterprise deployments that require data migration and integrations typically take 1–3 weeks.",
  },
  {
    category: "Onboarding & Setup",
    q: "Do you assist with data migration?",
    a: "Yes. For enterprise customers we offer data migration services including student, course and project data import, validations and verifications to ensure a smooth transition.",
  },

  // Security & Compliance
  {
    category: "Security & Compliance",
    q: "How is data secured in transit and at rest?",
    a: "Data is encrypted both in transit (TLS) and at rest. We follow industry-standard encryption practices and enforce strict access controls across all environments.",
  },
  {
    category: "Security & Compliance",
    q: "Do you provide role-based access control (RBAC)?",
    a: "Yes. The platform supports RBAC with configurable roles such as Admin, Guide, and Student, ensuring users only access the data and functions necessary for their role.",
  },

  // Support
  {
    category: "Support & SLA",
    q: "What support channels do you provide?",
    a: "Support is provided via email and chat for Starter and Pro customers. Enterprise customers receive priority support, a dedicated onboarding manager and access to phone support as per the SLA.",
  },
  {
    category: "Support & SLA",
    q: "Can I request a demo or trial?",
    a: "Yes. We offer a 14-day trial for new institutions on the Starter plan and can schedule personalized demos for interested departments or enterprise customers.",
  },
];

export default function FAQ() {
  const [query, setQuery] = useState("");
  const [activeAccordion, setActiveAccordion] = useState(null); // Single open for cleaner UI
  const [category, setCategory] = useState("Pricing & Billing");

  // Derive categories
  const categories = useMemo(() => {
    const setCat = new Set(CATEGORIZED_FAQS.map((f) => f.category));
    return Array.from(setCat);
  }, []);

  // Filter Logic
  const filtered = CATEGORIZED_FAQS.filter((f) => {
    if (category && f.category !== category) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
  });

  const toggle = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const selectCategory = (c) => {
    setCategory(c);
    setQuery("");
    setActiveAccordion(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 relative overflow-hidden font-sans selection:bg-sky-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2"
          >
            <HiQuestionMarkCircle className="text-lg" /> Help Center
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white tracking-tight"
          >
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">Questions</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Find answers to common questions about product capabilities, pricing, onboarding, security and support.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto relative group mt-8"
          >
             <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <HiSearch className="text-slate-500 text-xl group-focus-within:text-sky-400 transition-colors" />
             </div>
             <input 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               type="text" 
               placeholder="Search FAQs (e.g., billing, API, security)..." 
               className="w-full bg-slate-800/50 border border-slate-700 rounded-full pl-12 pr-16 py-4 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-lg placeholder-slate-500 backdrop-blur-md"
             />
             <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                <span className="text-xs font-mono text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded">⌘K</span>
             </div>
          </motion.div>
        </div>

        {/* --- CATEGORY TABS --- */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((c, i) => (
            <motion.button
              key={c}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (i * 0.05) }}
              onClick={() => selectCategory(c)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                category === c 
                  ? "bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/25" 
                  : "bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* --- LEFT: MAIN FAQS (Span 8) --- */}
          <div className="lg:col-span-8 space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                <p className="text-slate-400">No results found for "<span className="text-white font-bold">{query}</span>"</p>
                <button onClick={() => setQuery("")} className="mt-4 text-sky-400 hover:underline">Clear search</button>
              </div>
            ) : (
              filtered.map((f, index) => {
                const isOpen = activeAccordion === index;
                return (
                  <motion.div 
                    key={`${f.category}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isOpen 
                        ? "bg-slate-800/60 border-sky-500/50 shadow-lg shadow-sky-500/10" 
                        : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                    }`}
                  >
                    <button
                      onClick={() => toggle(index)}
                      className="w-full px-6 py-5 flex items-center justify-between gap-4 focus:outline-none group"
                    >
                      <span className={`text-left font-medium text-lg transition-colors ${isOpen ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                        {f.q}
                      </span>
                      <span className={`p-2 rounded-full transition-transform duration-300 ${isOpen ? "rotate-180 bg-slate-700 text-white" : "text-slate-500 bg-slate-800/50"}`}>
                        <HiChevronDown className="text-xl" />
                      </span>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-slate-700/30 pt-4">
                            {f.a}
                            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
                              <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                              {f.category}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* --- RIGHT: STICKY SIDEBAR (Span 4) --- */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Contact Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-[40px] group-hover:bg-sky-500/20 transition-all" />
               
               <h3 className="text-xl font-bold text-white mb-4">Still have questions?</h3>
               <p className="text-slate-400 text-sm mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
               
               <div className="space-y-4">
                 <a href="/contact" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 transition-colors border border-slate-700/50 group/item">
                    <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 text-xl group-hover/item:scale-110 transition-transform">
                      <HiChatAlt2 />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Get in touch</p>
                      <p className="text-xs text-slate-400">Speak to our team</p>
                    </div>
                 </a>

                 <a href="mailto:support@zephronix.in" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 transition-colors border border-slate-700/50 group/item">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl group-hover/item:scale-110 transition-transform">
                      <HiMail />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Email Support</p>
                      <p className="text-xs text-slate-400">support@zephronix.in</p>
                    </div>
                 </a>
               </div>
            </div>

            {/* Office Card */}
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
               <div className="flex items-start gap-3">
                  <HiOfficeBuilding className="text-slate-500 text-xl mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-300">Corporate Office</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Meerut Institute of Technology,<br/>
                      NH-58, Baral Partapur, Meerut,<br/>
                      Uttar Pradesh, India (250103)
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                       <HiPhone /> +91 911-016-9560
                    </div>
                  </div>
               </div>
            </div>

          </aside>

        </div>
      </main>
    </div>
  );
}