import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  FiMail, 
  FiChevronLeft, 
  FiChevronRight, 
  FiMessageSquare, 
  FiFileText, 
  FiUserCheck,
  FiLayout,
  FiZap,
  FiShield,
  FiTrendingUp
} from "react-icons/fi";
import { 
  FaLinkedin, 
  FaRocket, 
  FaRobot, 
  FaGithub,
  FaCheckCircle 
} from "react-icons/fa";

// ==========================================
// DATA CONSTANTS
// ==========================================

const slides = [
  {
    id: 1,
    title: "EduProject Manager",
    subtitle: "A centralized, smart academic project management platform to streamline workflows, automate documentation, and enhance collaboration for students and guides.",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80",
    cta: "Get Started",
  },
  {
    id: 2,
    title: "Automate Your Success",
    subtitle: "Say goodbye to manual MOMs and lost emails. Automate reporting, track real-time progress, and focus on innovation.",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2000&q=80",
    cta: "View Features",
  },
  {
    id: 3,
    title: "Data-Driven Insights",
    subtitle: "Empower faculty with dashboards to monitor performance, identify risks early, and provide timely mentorship.",
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2000&q=80",
    cta: "See Analytics",
  },
];

const features = [
  {
    icon: <FiLayout className="w-8 h-8 text-cyan-400" />,
    title: "Centralized Workflow",
    desc: "Unified platform replacing fragmented tools like WhatsApp and spreadsheets. Manage assignments, teams, and approvals in one place.",
    color: "bg-cyan-500/10 border-cyan-500/20",
    glow: "bg-cyan-500/20"
  },
  {
    icon: <FiFileText className="w-8 h-8 text-purple-400" />,
    title: "Automated MOMs",
    desc: "Auto-generate Minutes of Meeting (MOM) PDFs. Ensure accurate record-keeping and version control for all academic decisions.",
    color: "bg-purple-500/10 border-purple-500/20",
    glow: "bg-purple-500/20"
  },
  {
    icon: <FiMessageSquare className="w-8 h-8 text-emerald-400" />,
    title: "Structured Communication",
    desc: "Real-time notifications and structured messaging channels between students and guides to reduce miscommunication.",
    color: "bg-emerald-500/10 border-emerald-500/20",
    glow: "bg-emerald-500/20"
  },
  {
    icon: <FiTrendingUp className="w-8 h-8 text-rose-400" />,
    title: "Performance Analytics",
    desc: "Live dashboards for faculty to track student performance, task completion rates, and attendance in real-time.",
    color: "bg-rose-500/10 border-rose-500/20",
    glow: "bg-rose-500/20"
  },
  {
    icon: <FaRobot className="w-8 h-8 text-sky-400" />,
    title: "AI Future Ready",
    desc: "Built with a scalable architecture ready for AI integration to predict project risks and performance outcomes.",
    color: "bg-sky-500/10 border-sky-500/20",
    glow: "bg-sky-500/20"
  },
  {
    icon: <FiUserCheck className="w-8 h-8 text-amber-400" />,
    title: "Student Portfolio",
    desc: "Public profiles showcasing project contributions and skills, aiding in placements and career opportunities.",
    color: "bg-amber-500/10 border-amber-500/20",
    glow: "bg-amber-500/20"
  },
  {
    icon: <FiShield className="w-8 h-8 text-indigo-400" />,
    title: "Secure & Scalable",
    desc: "JWT authentication and cloud-based architecture ensuring data privacy and high availability for institutions.",
    color: "bg-indigo-500/10 border-indigo-500/20",
    glow: "bg-indigo-500/20"
  },
  {
    icon: <FiZap className="w-8 h-8 text-yellow-400" />,
    title: "SaaS Ready",
    desc: "Designed as a subscription-based product for colleges, supporting multi-tenancy and global adoption.",
    color: "bg-yellow-500/10 border-yellow-500/20",
    glow: "bg-yellow-500/20"
  },
];

const team = [
  {
    name: "ADITYA KUMAR",
    role: "Team Lead & Architect",
    bio: "Project lead focusing on architecture, system integration, and release management. Driving the technical vision.",
    email: "aditya.kumar1.cs.2022@mitmeerut.ac.in",
    linkedin: "https://www.linkedin.com/in/adityadevraj699/",
    img: "https://res.cloudinary.com/ddtcj9ks5/image/upload/v1764509135/aditya_hacgws.png",
    leader: true,
  },
  {
    name: "Anjali Shah",
    role: "Frontend Specialist",
    bio: "Expert in UI/UX design, crafting responsive components and ensuring a seamless user experience across devices.",
    email: "anjali.shah.cs.2022@mitmeerut.ac.in",
    linkedin: "https://www.linkedin.com/in/anjalishah43/",
    img: "https://res.cloudinary.com/ddtcj9ks5/image/upload/v1764509034/anjali_ramwoc.jpg",
  },
  {
    name: "Juhi Kumari",
    role: "Backend Engineer",
    bio: "Specializing in API design, database modeling, and implementing complex business logic for robust performance.",
    email: "juhi.kumari.cs.2022@mitmeerut.ac.in",
    linkedin: "https://www.linkedin.com/in/juhi-kumari-15537a259/",
    img: "https://res.cloudinary.com/ddtcj9ks5/image/upload/v1764509034/juhi_d610gn.jpg",
  },
  {
    name: "Amrit Kumar",
    role: "DevOps & QA",
    bio: "Managing CI/CD pipelines, automated testing, and cloud deployments to ensure stability and reliability.",
    email: "amrit.kumar.cs.2022@mitmeerut.ac.in",
    linkedin: "https://www.linkedin.com/in/amritekumar/",
    img: "https://res.cloudinary.com/ddtcj9ks5/image/upload/v1765215270/WhatsApp_Image_2025-12-08_at_23.03.10_d4de079b_i7dlpu.jpg",
  },
];

const guide = {
  name: "Amol Sharma",
  title: "Assistant Professor, CSE Dept, MIT-Meerut",
  email: "amol.sharma@mitmeerut.edu.in",
  linkedin: "https://www.linkedin.com/in/amol-sharma-mit",
  img: "https://res.cloudinary.com/ddtcj9ks5/image/upload/v1765207144/amol_sharma_w6hqdk.webp",
};

const statsData = [
  { value: 'Cloud', label: 'Architecture' },
  { value: 'SaaS', label: 'Business Model' },
  { value: 'Secure', label: 'JWT Auth' },
  { value: 'Live', label: 'Real-time Tracking' }
];

// ==========================================
// COMPONENT
// ==========================================

export default function HomePage() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); 
  const timeoutRef = useRef(null);

  // Auto-play Slider Logic
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      paginate(1); // Auto slide to next
    }, 6000); 
    return () => clearTimeout(timeoutRef.current);
  }, [index]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setIndex((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  const nextSlide = () => paginate(1);
  const prevSlide = () => paginate(-1);

  const goTo = (i) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  return (
    <div className="min-h-screen bg-[#050a14] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">

{/* --- HERO SECTION --- */}
      <section className="relative h-[100dvh] md:h-[95vh] w-full overflow-hidden flex items-center bg-[#02040a]">
        
        {/* ✅ Decorative White Frame (Hidden on Mobile for cleanliness) */}
        <div className="hidden md:block absolute top-20 bottom-3 left-3 right-3 z-40 border-2 border-white pointer-events-none rounded-[2.5rem]"></div>

        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
           {/* WRAPPER FOR SLIDE CONTENT */}
           <motion.div
             key={index}
             custom={direction}
             className="absolute inset-0 w-full h-full flex items-center justify-center"
             initial={(dir) => ({ x: dir > 0 ? "100%" : "-100%" })}
             animate={{ x: 0 }}
             exit={(dir) => ({ x: dir > 0 ? "-100%" : "100%" })}
             transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} 
           >
              {/* BACKGROUND IMAGE */}
              <div 
                  className="absolute inset-0 bg-cover bg-center z-0"
                  style={{ backgroundImage: `url(${slides[index % slides.length].img})` }}
              >
                   <div className="absolute inset-0 bg-black/50 md:bg-black/40"></div>
                   {/* Gradient for text readability */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-transparent to-black/60"></div>
              </div>

              {/* TEXT CONTENT CONTAINER */}
              {/* Mobile: px-6, Desktop: px-24 */}
              <div className="relative z-10 w-full h-full px-6 md:px-24 pt-24 md:pt-36 pb-20 md:pb-16 flex flex-col justify-between">
                  
                  {/* TOP RIGHT: TITLE ONLY */}
                  <motion.div
                     className="w-full text-left md:text-right ml-auto mt-10 md:mt-0"
                     initial={{ x: 100, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  >
                      {/* Mobile: text-3xl, Desktop: text-7xl */}
                      <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight drop-shadow-2xl md:whitespace-nowrap break-words">
                          {slides[index % slides.length].title}
                      </h1>
                  </motion.div>

                  {/* BOTTOM LEFT: BADGE, DESCRIPTION & BUTTONS */}
                  <motion.div
                     className="w-full text-left max-w-2xl mt-auto mb-4 md:mb-8"
                     initial={{ x: -100, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }} 
                  >
                      {/* Badge - Hidden on very small mobiles if needed, or scale down */}
                      <span className="inline-block py-1 px-3 md:py-1.5 md:px-5 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase shadow-lg shadow-cyan-500/20 mb-4 md:mb-6 backdrop-blur-md">
                          Next Gen Management
                      </span>

                      {/* Description - Smaller on mobile and limited to 3 lines */}
                      <p className="text-sm md:text-xl text-slate-200 font-medium leading-relaxed drop-shadow-lg mb-6 md:mb-10 border-l-2 md:border-l-4 border-cyan-500 pl-4 md:pl-6 line-clamp-3 md:line-clamp-none">
                          {slides[index % slides.length].subtitle}
                      </p>
                      
                      {/* Buttons - Adjusted padding for mobile */}
                      <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                          <a href="/register" className="px-6 py-3 md:px-10 md:py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold text-sm md:text-lg shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2 md:gap-3">
                             Get Started <FaRocket/>
                          </a>
                          {/* Hide 'Learn More' on Mobile to save space (Optional, removed 'hidden' if you want it back) */}
                          <a href="#features" className="hidden sm:flex px-10 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-full font-bold text-lg backdrop-blur-md transition-all hover:bg-white hover:text-black items-center justify-center">
                             Learn More
                          </a>
                      </div>
                  </motion.div>

              </div>
           </motion.div>
        </AnimatePresence>

        {/* --- NAVIGATION CONTROLS (ARROWS ONLY) --- */}
        {/* ✅ Hidden on Mobile (hidden md:flex) */}
        <div className="hidden md:flex absolute bottom-20 right-16 z-50 items-center gap-8">
            <div className="flex gap-4">
                <button 
                    className="p-4 rounded-full border border-white/20 bg-black/40 backdrop-blur-xl text-white hover:bg-white hover:text-black transition-all duration-300 group"
                    onClick={prevSlide}
                >
                    <FiChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform"/>
                </button>
                <button 
                    className="p-4 rounded-full border border-white/20 bg-black/40 backdrop-blur-xl text-white hover:bg-white hover:text-black transition-all duration-300 group"
                    onClick={nextSlide}
                >
                    <FiChevronRight size={24} className="group-hover:translate-x-1 transition-transform"/>
                </button>
            </div>
        </div>

        {/* --- PAGINATION DOTS (CENTERED) --- */}
        {/* Adjusted bottom spacing for mobile */}
        <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-50 flex gap-2 md:gap-3">
             {slides.map((_, i) => (
                 <button
                   key={i}
                   onClick={() => goTo(i)}
                   className={`h-1 md:h-1.5 rounded-full transition-all duration-500 ${i === (index % slides.length) ? 'w-10 md:w-16 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'w-3 md:w-4 bg-white/20 hover:bg-white/50'}`}
                 />
             ))}
        </div>

        {/* Translucent Top Fade */}
        <div className="absolute top-0 left-0 w-full h-20 md:h-32 bg-gradient-to-b from-black/80 to-transparent z-30 pointer-events-none"></div>

        {/* Seamless Bottom Transition Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-32 md:h-64 bg-gradient-to-t from-[#050a14] via-[#050a14]/80 to-transparent z-40 pointer-events-none"></div>

      </section>



      <main className="relative z-10 bg-[#050a14]">
        
   {/* --- PROBLEM & SOLUTION (Blue/Black Theme, Clean Cards) --- */}
        <section className="py-32 px-6 relative overflow-hidden bg-[#02040a]">
            
            {/* Background Ambient Glows (Blue/Cyan) */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-stretch relative z-10">
                 
                 {/* --- THE PROBLEM CARD (The "Old Way" - Slate/Dark Blue) --- */}
                 <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative p-8 md:p-10 rounded-[2.5rem] border border-slate-800 bg-[#0b1120] hover:border-slate-700 transition-colors duration-300"
                 >
                     {/* Decorative Icon BG */}
                     <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                        <span className="text-9xl font-black text-slate-700">?</span>
                     </div>

                     <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                            The Challenge
                        </div>
                        
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                            Broken <br/><span className="text-slate-500">Workflows</span>
                        </h2>
                        
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                           Academic projects suffer from chaotic communication on WhatsApp, lost emails, and manual tracking via spreadsheets. This leads to confusion and missed deadlines.
                        </p>

                        <ul className="space-y-4">
                           {[
                             "Fragmented Communication Channels",
                             "Manual & Lost MOM Documentation",
                             "Zero Real-time Progress Tracking"
                           ].map((item, i) => (
                             <li 
                               key={i}
                               className="flex items-center gap-4 text-slate-400 bg-slate-900/50 p-4 rounded-xl border border-slate-800"
                             >
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">✕</div>
                                <span className="text-sm font-medium">{item}</span>
                             </li>
                           ))}
                        </ul>
                     </div>
                 </motion.div>

                 {/* --- THE SOLUTION CARD (The "New Way" - SkyBlue/Cyan) --- */}
                 <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative p-8 md:p-10 rounded-[2.5rem] border border-cyan-500/30 bg-gradient-to-b from-cyan-950/30 to-[#050a14] shadow-[0_0_60px_rgba(34,211,238,0.1)]"
                 >
                     {/* Glowing Background Effect */}
                     <div className="absolute -inset-[1px] bg-gradient-to-b from-cyan-500/50 to-transparent rounded-[2.5rem] opacity-20 pointer-events-none"></div>

                     <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6 shadow-lg shadow-cyan-500/20">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            The Solution
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                            Unified <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Intelligence</span>
                        </h2>

                        <p className="text-slate-300 text-lg leading-relaxed mb-8">
                           A unified cloud-based platform that centralizes every aspect of your academic project. We automate the boring stuff so you can focus on building the future.
                        </p>

                        <ul className="space-y-4">
                           {[
                             "Centralized Dashboard & Chats",
                             "Automated AI-Generated Reports",
                             "Industry-Standard Analytics"
                           ].map((item, i) => (
                             <motion.li 
                               key={i}
                               initial={{ opacity: 0, y: 10 }}
                               whileInView={{ opacity: 1, y: 0 }}
                               transition={{ delay: 0.2 + (i * 0.1) }}
                               className="flex items-center gap-4 text-white bg-cyan-950/30 p-4 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-900/20"
                             >
                                <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-black shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.6)]">
                                    <FaCheckCircle className="text-lg"/>
                                </div>
                                <span className="text-sm font-bold tracking-wide">{item}</span>
                             </motion.li>
                           ))}
                        </ul>
                     </div>
                 </motion.div>
            </div>
        </section>

       {/* --- FEATURES GRID (Seamless Flow & Modern Glass) --- */}
        <section id="features" className="py-24 px-6 relative bg-[#02040a]">
             
             {/* Seamless Top Gradient Blend */}
             <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#02040a] via-[#02040a]/80 to-transparent z-10 pointer-events-none"></div>

             {/* Background Effects */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>
             <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none"></div>

             <div className="max-w-7xl mx-auto relative z-20">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-xs font-mono uppercase tracking-widest mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        System Capabilities
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
                        Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Innovation</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                      A comprehensive suite of enterprise-grade tools designed to elevate academic project management.
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {features.map((f, i) => (
                          <motion.div 
                             key={i}
                             initial={{ opacity: 0, y: 20 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             viewport={{ once: true }}
                             transition={{ delay: i * 0.05, duration: 0.5 }}
                             whileHover={{ y: -8 }}
                             className="group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-sm transition-all duration-300"
                          >
                              {/* Hover Glow Effect */}
                              <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b ${f.glow} to-transparent pointer-events-none`}></div>
                              
                              <div className="relative z-10">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-white/10 bg-white/5 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300`}>
                                      <div className="text-2xl group-hover:animate-pulse">
                                        {f.icon}
                                      </div>
                                  </div>
                                  
                                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                    {f.title}
                                  </h3>
                                  
                                  <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                                    {f.desc}
                                  </p>
                              </div>
                          </motion.div>
                      ))}
                  </div>
             </div>
        </section>

    {/* --- STATS SECTION (3D Glass Cards & Glows) --- */}
        <section className="py-24 relative bg-[#02040a]">
           
           {/* Background Texture & Blend */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
           <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#02040a] to-transparent z-10 pointer-events-none"></div>

           <div className="max-w-7xl mx-auto px-6 relative z-20">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
               {statsData.map((s, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                   whileHover={{ y: -10, scale: 1.05 }}
                   className="group relative p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] hover:border-cyan-500/20 transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden"
                 >
                   
                   {/* Background Glow on Hover */}
                   <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                   
                   {/* Value (Number) */}
                   <h3 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-600 mb-3 relative z-10 group-hover:from-cyan-300 group-hover:to-blue-500 transition-all duration-500">
                     {s.value}
                   </h3>
                   
                   {/* Label */}
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] group-hover:text-cyan-400 transition-colors relative z-10">
                     {s.label}
                   </p>
                 </motion.div>
               ))}
             </div>
           </div>
        </section>

    {/* =========================================
            TEAM & GUIDE SECTIONS (Combined for tighter layout)
           ========================================= */}
        
        {/* --- TEAM SECTION --- */}
        <section id="team" className="pt-32 pb-10 bg-[#02040a] relative perspective-1000 overflow-hidden">
             
             {/* Shared Background Effects */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
             <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>

             <div className="max-w-7xl mx-auto px-6 relative z-10">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24" 
                  >
                      <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">The <span className="text-cyan-500">Architects</span></h2>
                      <p className="text-slate-400 text-lg">Engineering the future of EdTech.</p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-24 gap-x-8">
                       {team.sort((a,b) => (b.leader===true) - (a.leader===true)).map((member, i) => (
                           <motion.div 
                             key={i} 
                             initial={{ opacity: 0, y: 50 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             viewport={{ once: true }}
                             transition={{ delay: i * 0.1 }}
                             className="relative group h-full"
                           >
                               {/* Card Container */}
                               <div className={`h-[400px] w-full rounded-[2.5rem] p-[2px] relative transition-all duration-500 group-hover:scale-[1.02] 
                                 ${member.leader 
                                   ? 'bg-gradient-to-b from-cyan-400 via-blue-600 to-purple-600 shadow-2xl shadow-cyan-500/20' 
                                   : 'bg-gradient-to-b from-slate-800 to-slate-900 group-hover:from-cyan-500/50 group-hover:to-blue-500/50 shadow-xl'
                                 }
                               `}>
                                   
                                   {/* Inner Card Content */}
                                   <div className="h-full w-full bg-[#080f1e] rounded-[2.4rem] px-6 pb-8 pt-20 flex flex-col items-center text-center relative z-10 overflow-visible">
                                        
                                        {/* Leader Badge */}
                                        {member.leader && (
                                            <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg z-20 border border-white/10">
                                                Lead
                                            </div>
                                        )}

                                        {/* Avatar Container */}
                                        <div className="absolute -top-16 w-32 h-32 z-30 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-y-24 group-hover:scale-110">
                                            <img 
                                              src={member.img} 
                                              alt={member.name} 
                                              className={`w-full h-full rounded-full object-cover shadow-2xl bg-slate-900 
                                                border-[4px] ${member.leader ? "border-cyan-500 group-hover:border-white" : "border-slate-700 group-hover:border-slate-500"} 
                                                transition-colors duration-300`} 
                                            />
                                        </div>

                                        {/* Spacer */}
                                        <div className="h-0 w-full transition-all duration-500 group-hover:h-24"></div>

                                        <h3 className={`font-bold mb-1 tracking-tight transition-colors duration-300 group-hover:text-cyan-400 ${member.leader ? "text-2xl text-white" : "text-xl text-slate-200"}`}>
                                           {member.name}
                                        </h3>
                                        <p className={`text-xs font-bold uppercase tracking-widest mb-4 transition-colors duration-300 ${member.leader ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500" : "text-slate-500 group-hover:text-slate-300"}`}>
                                           {member.role}
                                        </p>
                                        
                                        {/* Bio */}
                                        <div className="h-20 overflow-hidden transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:h-0">
                                            <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-3">
                                                {member.bio}
                                            </p>
                                        </div>

                                        {/* Social Icons */}
                                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 opacity-0 translate-y-8 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 delay-100">
                                            <SocialLink href={`mailto:${member.email}`} icon={<FiMail/>}/>
                                            <SocialLink href={member.linkedin} icon={<FaLinkedin/>}/>
                                            {member.leader && <SocialLink href="#" icon={<FaGithub/>}/>}
                                        </div>
                                   </div>
                               </div>
                           </motion.div>
                       ))}
                  </div>
             </div>
        </section>

        {/* --- GUIDE SECTION (Reduced Top Padding to bring closer) --- */}
        <section className="pb-32 pt-10 relative overflow-hidden bg-[#02040a]">

          {/* Tech Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

          <div className="max-w-[90%] mx-auto relative z-10">

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl"
            >

              <div className="flex flex-col md:flex-row items-center gap-10 p-8 md:p-12">

                {/* ===== Profile Avatar ===== */}
                <div className="relative group shrink-0">

                  {/* Static Gradient Border */}
                  <div className="absolute inset-[-3px] rounded-full bg-gradient-to-tr from-emerald-500 via-cyan-400 to-blue-500 opacity-80" />

                  {/* Hover Glow */}
                  <div className="absolute inset-[-6px] rounded-full bg-emerald-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Image */}
                  <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full bg-slate-950 p-[3px]">
                    <img
                      src={guide.img}
                      alt={guide.name}
                      className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>

                {/* ===== Content ===== */}
                <div className="flex-1 text-center md:text-left">

                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3 justify-center md:justify-start">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                      {guide.name}
                    </h2>
                    <span className="hidden md:block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-emerald-400 font-mono text-xs tracking-widest uppercase">
                      Project Guide
                    </span>
                  </div>

                  <h3 className="text-slate-400 text-base mb-4">
                    {guide.title}
                  </h3>

                  <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mb-6">
                    Expertly guiding the project's technical architecture and execution.
                    Ensuring scalable, secure, and industry-ready solutions with strong
                    engineering discipline.
                  </p>

                  {/* ===== Actions ===== */}
                  <div className="flex gap-4 justify-center md:justify-start">

                    <a
                      href={`mailto:${guide.email}`}
                      className="px-5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm font-semibold text-white
                                 hover:border-emerald-500 hover:text-emerald-400 transition-all duration-300 flex items-center gap-2"
                    >
                      <FiMail /> Connect
                    </a>

                    <a
                      href={guide.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 rounded-lg border border-blue-500/40 text-sm font-semibold text-blue-400
                                 hover:bg-blue-500/10 transition-all duration-300 flex items-center gap-2"
                    >
                      <FaLinkedin className="text-lg" /> LinkedIn
                    </a>

                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </section>


{/* --- FOOTER CTA (Seamless, No Top Border/Glow) --- */}
        <section className="py-20 relative overflow-hidden bg-[#02040a]">
            
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#02040a] to-[#02040a] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
                
                <motion.div
                   initial={{ opacity: 0, y: 40 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* removed: Top Energy Beam Glow & Border */}

                    <h2 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter">
                        Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Deploy?</span>
                    </h2>
                    
                    <p className="text-slate-400 mb-10 text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto font-light">
                        Join hundreds of students and guides managing projects effortlessly. Streamline your academic journey today.
                    </p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
                    >
                        <a href="/register" className="group relative px-12 py-5 bg-white text-black font-black rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(34,211,238,0.5)] transition-all hover:-translate-y-1">
                            <span className="relative z-10 group-hover:text-cyan-900 transition-colors">Get Started Free</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </a>
                        
                        <a href="/login" className="px-12 py-5 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/5 hover:border-white/50 transition-all backdrop-blur-md hover:-translate-y-1">
                            Login to Dashboard
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </section>

      </main>
    </div>
  );
}

// Helper: Stylish Social Button
const SocialLink = ({ href, icon }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noreferrer"
    className="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-slate-800 hover:border-cyan-500/50 hover:-translate-y-2 hover:shadow-lg shadow-cyan-500/20"
  >
    <span className="text-xl">{icon}</span>
  </a>
);