import React from "react";
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-white transition-all duration-500">
      {/* Animated Logo Circle */}
      <div className="relative mb-8">
        <div className="w-28 h-28 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin-slow shadow-[0_0_25px_rgba(16,185,129,0.5)]"></div>
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-emerald-400"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
        >
          🧩
        </motion.div>
      </div>

      {/* App Title */}
      <motion.h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide text-gray-100 dark:text-gray-900 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        Project Management & Team Management
      </motion.h1>

      {/* Loading Line Animation */}
      <motion.div
        className="w-40 h-1 mt-6 bg-emerald-400 rounded-full overflow-hidden relative"
        initial={{ width: 0 }}
        animate={{ width: "10rem" }}
        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
      ></motion.div>

      {/* Subtext */}
      <p className="mt-6 text-sm text-gray-400 dark:text-gray-700 tracking-widest uppercase animate-pulse">
        Loading your workspace...
      </p>
    </div>
  );
};

export default Loader;
