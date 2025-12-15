import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  HiChatAlt2, HiMail, HiPhone, HiBookOpen, 
  HiQuestionMarkCircle, HiLightningBolt, HiUsers, HiSearch 
} from "react-icons/hi";

// 🔄 FAQ Data
const faqs = [
  {
    question: "How do I reset my password?",
    answer: "You can reset your password by clicking on 'Forgot Password' on the login page. Follow the instructions sent to your registered email."
  },
  {
    question: "Can I change my subscription plan?",
    answer: "Yes, you can upgrade or downgrade your plan at any time from the 'Billing' section in your account settings."
  },
  {
    question: "Where can I find the API documentation?",
    answer: "Our comprehensive API documentation is available at /docs. You'll find guides, references, and examples there."
  },
  {
    question: "How do I invite team members?",
    answer: "Go to 'Team Settings' and click 'Invite Member'. Enter their email address and select their role to send an invitation."
  }
];

export default function Support() {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 relative overflow-hidden font-sans selection:bg-sky-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <div className="text-center mb-20 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-sky-400 text-sm font-medium mb-4"
          >
            <HiLightningBolt /> 24/7 Support Center
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white tracking-tight"
          >
            How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">help you?</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Search our knowledge base, browse FAQs, or get in touch with our support team. We're here to ensure your success.
          </motion.p>

          {/* Search Bar (Visual Only) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto relative group"
          >
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <HiSearch className="text-slate-500 text-xl group-focus-within:text-sky-400 transition-colors" />
             </div>
             <input 
               type="text" 
               placeholder="Search for articles, guides, and more..." 
               className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-lg placeholder-slate-500"
             />
          </motion.div>
        </div>

        {/* --- SUPPORT CHANNELS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
           <SupportCard 
             icon={<HiBookOpen />} 
             title="Documentation" 
             desc="Detailed guides and API references." 
             link="/docs" 
             linkText="Browse Docs"
             color="sky"
           />
           <SupportCard 
             icon={<HiChatAlt2 />} 
             title="Live Chat" 
             desc="Chat with our support team in real-time." 
             action={() => alert("Live Chat Widget Opening...")}
             linkText="Start Chat"
             color="emerald"
           />
           <SupportCard 
             icon={<HiUsers />} 
             title="Community" 
             desc="Join discussions and get help from peers." 
             link="/community" 
             linkText="Join Community"
             color="purple"
           />
        </div>

        {/* --- FAQ SECTION --- */}
        <div className="max-w-3xl mx-auto mb-20">
           <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-slate-400">Quick answers to common questions about our platform.</p>
           </div>
           
           <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                   <button 
                     onClick={() => toggleAccordion(index)}
                     className="w-full flex items-center justify-between p-5 text-left focus:outline-none hover:bg-slate-800/50 transition-colors"
                   >
                      <span className="font-semibold text-slate-200">{faq.question}</span>
                      <span className={`text-sky-400 transform transition-transform duration-300 ${activeAccordion === index ? 'rotate-180' : ''}`}>
                        <HiQuestionMarkCircle className="text-xl" />
                      </span>
                   </button>
                   <motion.div 
                     initial={false}
                     animate={{ height: activeAccordion === index ? 'auto' : 0, opacity: activeAccordion === index ? 1 : 0 }}
                     className="overflow-hidden"
                   >
                      <div className="p-5 pt-0 text-slate-400 text-sm leading-relaxed border-t border-slate-700/30 mt-2">
                        {faq.answer}
                      </div>
                   </motion.div>
                </div>
              ))}
           </div>
        </div>

        {/* --- DIRECT CONTACT & STATUS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
           {/* Contact Card */}
           <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-[40px] group-hover:bg-sky-500/20 transition-all" />
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                 <HiMail className="text-sky-400" /> Need more help?
              </h3>
              <p className="text-slate-400 text-sm mb-6">Our support team is available Mon-Fri, 9am - 6pm IST.</p>
              
              <div className="space-y-3">
                 <div className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400"><HiMail/></span>
                    <a href="mailto:support@zephronix.in" className="hover:text-white transition-colors">support@zephronix.in</a>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400"><HiPhone/></span>
                    <a href="tel:+919110169560" className="hover:text-white transition-colors">+91 911-016-9560</a>
                 </div>
              </div>
           </div>

           {/* Status Card */}
           <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-all" />
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                 System Status
              </h3>
              <p className="text-slate-400 text-sm mb-6">All systems are currently operational.</p>
              
              <div className="grid grid-cols-2 gap-4">
                 <StatusIndicator label="API" status="Operational" />
                 <StatusIndicator label="Dashboard" status="Operational" />
                 <StatusIndicator label="Database" status="Operational" />
                 <StatusIndicator label="Payments" status="Operational" />
              </div>
           </div>

        </div>

      </main>
    </div>
  );
}

/* --- REUSABLE COMPONENTS --- */

const SupportCard = ({ icon, title, desc, link, linkText, action, color }) => {
  const colorClasses = {
    sky: "text-sky-400 group-hover:text-sky-300 bg-sky-500/10 group-hover:bg-sky-500/20 border-sky-500/20",
    emerald: "text-emerald-400 group-hover:text-emerald-300 bg-emerald-500/10 group-hover:bg-emerald-500/20 border-emerald-500/20",
    purple: "text-purple-400 group-hover:text-purple-300 bg-purple-500/10 group-hover:bg-purple-500/20 border-purple-500/20",
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all group hover:-translate-y-1 duration-300">
       <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 border ${colorClasses[color]} transition-colors`}>
          {icon}
       </div>
       <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
       <p className="text-slate-400 text-sm mb-6 h-10">{desc}</p>
       
       {link ? (
         <a href={link} className={`text-sm font-semibold flex items-center gap-2 ${colorClasses[color].split(' ')[0]}`}>
            {linkText} <span className="group-hover:translate-x-1 transition-transform">→</span>
         </a>
       ) : (
         <button onClick={action} className={`text-sm font-semibold flex items-center gap-2 ${colorClasses[color].split(' ')[0]}`}>
            {linkText} <span className="group-hover:translate-x-1 transition-transform">→</span>
         </button>
       )}
    </div>
  );
};

const StatusIndicator = ({ label, status }) => (
  <div className="flex justify-between items-center text-sm p-2 rounded bg-slate-800/50 border border-slate-700/30">
     <span className="text-slate-300 font-medium">{label}</span>
     <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">{status}</span>
  </div>
);