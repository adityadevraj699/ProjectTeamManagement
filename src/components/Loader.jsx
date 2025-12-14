import React from "react";
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen w-full bg-[#0f172a] relative overflow-hidden">
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Logo Container with Orbit Animation */}
      <div className="relative mb-10">
        {/* Outer Orbit Ring */}
        <motion.div
          className="absolute inset-[-20px] rounded-full border border-sky-500/30 border-t-sky-400 border-r-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner Orbit Ring (Reverse) */}
        <motion.div
          className="absolute inset-[-10px] rounded-full border border-indigo-500/30 border-b-indigo-400 border-l-transparent"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* The Logo */}
        <div className="relative w-32 h-32 bg-slate-900 rounded-full flex items-center justify-center shadow-2xl shadow-sky-900/50 z-10">
          <motion.img
            src="https://res.cloudinary.com/ddtcj9ks5/image/upload/v1762627794/coordinator_o7hmxq.png"
            alt="App Logo"
            className="w-20 h-20 object-contain drop-shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.9, 1.05, 0.9], opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* App Title with Fade In */}
      <motion.h1
        className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-400 bg-300% animate-gradient text-center px-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        Project & Team Management
      </motion.h1>

      {/* Subtext / Loading Indicator */}
      <motion.div
        className="mt-6 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className="h-1 w-48 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.2em] animate-pulse">
          Initializing Workspace...
        </p>
      </motion.div>

    </div>
  );
};

export default Loader;