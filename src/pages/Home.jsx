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

  {/* --- HERO SECTION (Sequential Slide Animation - Clean Text) --- */}
      <section className="relative h-[80vh] w-full overflow-hidden flex items-center bg-[#02040a]">
        
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
           {/* WRAPPER FOR SLIDE CONTENT */}
           <motion.div
             key={index}
             custom={direction}
             className="absolute inset-0 w-full h-full flex items-center"
             initial={(dir) => ({ x: dir > 0 ? "100%" : "-100%" })}
             animate={{ x: 0 }}
             exit={(dir) => ({ x: dir > 0 ? "-100%" : "100%" })}
             transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} 
           >
              {/* 1. BACKGROUND IMAGE (Full Cover) */}
              <div 
                  className="absolute inset-0 bg-cover bg-center z-0"
                  style={{ backgroundImage: `url(${slides[index % slides.length].img})` }}
              >
                   <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
                   <div className="absolute inset-0 bg-gradient-to-r from-[#050a14] via-[#050a14]/60 to-transparent"></div>
              </div>

              {/* 2. TEXT CONTENT (Left Aligned, Delayed Entrance, No Border) */}
              <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2">
                  <motion.div
                     initial={{ x: 100, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }} 
                     className="text-left"
                  >
                      <span className="inline-block py-1 px-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-[0.2em] uppercase mb-4 backdrop-blur-md">
                          Next Gen Management
                      </span>
                      
                      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-6 drop-shadow-2xl whitespace-nowrap overflow-visible">
                          {slides[index % slides.length].title}
                      </h1>
                      
                      <p className="text-lg md:text-xl text-slate-300 max-w-xl mb-10 font-light leading-relaxed border-l-4 border-cyan-500 pl-6 drop-shadow-lg">
                          {slides[index % slides.length].subtitle}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                          <a href="/register" className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-full font-bold text-base shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2">
                             Get Started <FaRocket/>
                          </a>
                          <a href="#features" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-full font-bold text-base backdrop-blur-md transition-all hover:border-cyan-400/50 hover:text-cyan-300 flex items-center justify-center">
                             Learn More
                          </a>
                      </div>
                  </motion.div>
              </div>
           </motion.div>
        </AnimatePresence>

        {/* Floating Navigation Controls (Bottom Right) */}
        <div className="absolute bottom-8 right-6 md:bottom-12 md:right-12 z-20 flex items-center gap-4 md:gap-6">
            <div className="flex gap-2 md:gap-3">
                 {slides.map((_, i) => (
                     <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${i === (index % slides.length) ? 'w-12 md:w-16 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]' : 'w-3 md:w-4 bg-slate-600 hover:bg-slate-400'}`}
                     />
                 ))}
            </div>

            <div className="flex gap-2 md:gap-3 ml-2 md:ml-4">
                <button 
                    className="p-3 md:p-4 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-white hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all duration-300 group"
                    onClick={prevSlide}
                >
                    <FiChevronLeft size={20} className="md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform"/>
                </button>
                <button 
                    className="p-3 md:p-4 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-white hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all duration-300 group"
                    onClick={nextSlide}
                >
                    <FiChevronRight size={20} className="md:w-6 md:h-6 group-hover:translate-x-1 transition-transform"/>
                </button>
            </div>
        </div>

        {/* Bottom Fade Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-24 md:h-32 bg-gradient-to-t from-[#050a14] to-transparent z-10 pointer-events-none"></div>
      </section>

      <main className="relative z-10 bg-[#050a14]">
        
        {/* --- PROBLEM & SOLUTION --- */}
        <section className="py-32 px-6 relative">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                 <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                 >
                     <h2 className="text-4xl font-bold text-white mb-6 leading-tight">The <span className="text-rose-500">Problem</span> with Traditional Methods</h2>
                     <p className="text-slate-400 text-lg leading-relaxed mb-6">
                        Academic projects suffer from chaotic communication on WhatsApp, lost emails, and manual tracking via spreadsheets. This leads to confusion, missed deadlines, and a lack of accountability between students and guides.
                     </p>
                     <ul className="space-y-3 text-slate-300">
                        <li className="flex items-center gap-3"><span className="text-rose-500">✕</span> Fragmented Communication</li>
                        <li className="flex items-center gap-3"><span className="text-rose-500">✕</span> Manual MOM Documentation</li>
                        <li className="flex items-center gap-3"><span className="text-rose-500">✕</span> No Real-time Progress Tracking</li>
                     </ul>
                 </motion.div>
                 <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 relative"
                 >
                     <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[80px]"></div>
                     <h2 className="text-4xl font-bold text-white mb-6 leading-tight">The <span className="text-emerald-400">EduProject</span> Solution</h2>
                     <p className="text-slate-400 text-lg leading-relaxed mb-6">
                        A unified cloud-based platform that centralizes every aspect of your academic project. From team formation to final submission, we automate the boring stuff so you can focus on building.
                     </p>
                     <ul className="space-y-3 text-slate-300">
                        <li className="flex items-center gap-3"><FaCheckCircle className="text-emerald-400"/> Unified Dashboard</li>
                        <li className="flex items-center gap-3"><FaCheckCircle className="text-emerald-400"/> Automated PDF Reports</li>
                        <li className="flex items-center gap-3"><FaCheckCircle className="text-emerald-400"/> Industry-Standard Analytics</li>
                     </ul>
                 </motion.div>
            </div>
        </section>

        {/* --- FEATURES GRID (Hacker/Bento Style) --- */}
        <section id="features" className="py-32 px-6 relative bg-[#0b1120]">
             {/* Tech Lines */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
             <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
             
             <div className="max-w-7xl mx-auto relative z-10">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-24"
                  >
                    <span className="text-cyan-400 font-mono text-sm tracking-widest uppercase mb-2 block">System Capabilities</span>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Innovation</span></h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-xl">
                      Enterprise-grade features scaled for academic excellence.
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {features.map((f, i) => (
                          <motion.div 
                             key={i}
                             initial={{ opacity: 0, y: 20 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             viewport={{ once: true }}
                             transition={{ delay: i * 0.05 }}
                             whileHover={{ y: -10, scale: 1.02 }}
                             className={`p-8 rounded-[2rem] border border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:bg-slate-800 transition-all duration-300 relative overflow-hidden group`}
                          >
                              {/* Animated Border Glow */}
                              <div className={`absolute inset-0 border-2 border-transparent group-hover:border-cyan-500/20 rounded-[2rem] transition-all`}></div>
                              <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${f.glow}`}></div>
                              
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border ${f.color} bg-[#050a14] shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                  {f.icon}
                              </div>
                              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">{f.title}</h3>
                              <p className="text-slate-400 leading-relaxed text-sm font-medium">{f.desc}</p>
                          </motion.div>
                      ))}
                  </div>
             </div>
        </section>

        {/* --- STATS SECTION --- */}
        <section className="py-20 border-y border-slate-800 bg-gradient-to-r from-slate-900 to-[#050a14]">
           <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
             {statsData.map((s, i) => (
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, scale: 0.5 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1, type: "spring" }}
                 className="flex flex-col items-center"
               >
                 <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-600 mb-2">{s.value}</div>
                 <div className="text-xs font-bold text-cyan-500 uppercase tracking-[0.2em]">{s.label}</div>
               </motion.div>
             ))}
           </div>
        </section>

        {/* --- TEAM SECTION (Fixed Avatar Clipping & Simplified Hover) --- */}
        <section id="team" className="py-32 bg-[#050a14] relative perspective-1000">
             <div className="max-w-7xl mx-auto px-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-32" 
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
                                   ? 'bg-gradient-to-b from-cyan-400 via-blue-600 to-purple-600 shadow-2xl shadow-indigo-500/20' 
                                   : 'bg-slate-800 hover:bg-slate-700 shadow-xl'
                                 }
                               `}>
                                   
                                   {/* Inner Card Content - Note: overflow-visible ensures avatar shows at top */}
                                   <div className="h-full w-full bg-[#080f1e] rounded-[2.4rem] px-6 pb-8 pt-20 flex flex-col items-center text-center relative z-10 overflow-visible">
                                        
                                        {/* Leader Badge */}
                                        {member.leader && (
                                            <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg z-20 border border-white/10">
                                                Lead
                                            </div>
                                        )}

                                        {/* Avatar Container - Absolute positioned relative to the CARD, completely outside flow initially */}
                                        <div className="absolute -top-16 w-32 h-32 z-30 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-y-24 group-hover:scale-110">
                                            {/* Simple Avatar Image with Static Border */}
                                            <img 
                                              src={member.img} 
                                              alt={member.name} 
                                              className={`w-full h-full rounded-full object-cover shadow-2xl bg-slate-900 
                                                border-[4px] ${member.leader ? "border-cyan-500 group-hover:border-white" : "border-slate-700 group-hover:border-slate-500"} 
                                                transition-colors duration-300`} 
                                            />
                                        </div>

                                        {/* Spacer to push text down when avatar slides in */}
                                        <div className="h-0 w-full transition-all duration-500 group-hover:h-24"></div>

                                        <h3 className={`font-bold mb-1 tracking-tight transition-colors duration-300 group-hover:text-cyan-400 ${member.leader ? "text-2xl text-white" : "text-xl text-slate-200"}`}>
                                           {member.name}
                                        </h3>
                                        <p className={`text-xs font-bold uppercase tracking-widest mb-4 transition-colors duration-300 ${member.leader ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500" : "text-slate-500 group-hover:text-slate-300"}`}>
                                           {member.role}
                                        </p>
                                        
                                        {/* Bio - Fades out on hover */}
                                        <div className="h-20 overflow-hidden transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:h-0">
                                            <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-3">
                                                {member.bio}
                                            </p>
                                        </div>

                                        {/* Social Icons - Fades in on hover */}
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

    {/* --- GUIDE SECTION (Clean Hacker Style, Premium) --- */}
<section className="py-20 relative overflow-hidden bg-[#02040a]">

  {/* Tech Grid Background */}
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

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


        {/* --- FOOTER CTA --- */}
        <section className="py-32 bg-[#02040a] border-t border-slate-900 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
             
             <div className="max-w-4xl mx-auto px-6 relative z-10">
                 <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">Ready to <span className="text-cyan-500">Deploy?</span></h2>
                 <p className="text-slate-400 mb-12 text-xl leading-relaxed max-w-2xl mx-auto">Join hundreds of students and guides managing projects effortlessly. Start your journey today.</p>
                 
                 <div className="flex flex-col sm:flex-row justify-center gap-6">
                     <a href="/register" className="px-12 py-5 bg-white text-black font-black rounded-full hover:bg-cyan-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(34,211,238,0.5)] transform hover:-translate-y-1 text-lg">
                        Get Started Free
                     </a>
                     <a href="/login" className="px-12 py-5 bg-transparent border-2 border-slate-700 text-white font-bold rounded-full hover:bg-slate-900 hover:border-white transition-all transform hover:-translate-y-1 text-lg">
                        Login to Dashboard
                     </a>
                 </div>

                
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