import React from "react";
import { motion } from "framer-motion";

const Home = () => {
  const bgColor = "bg-gray-950"; // uniform dark background

  return (
    <>
      {/* Hero Section */}
      <section
        className={`${bgColor} relative flex flex-col items-center justify-center h-[85vh] text-center text-white px-6 overflow-hidden`}
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,15,15,0.85), rgba(10,10,10,0.85)), url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
        }}
      >
        <motion.h1
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-bold mb-6 text-sky-400 tracking-tight"
        >
          Manage Teams Effortlessly
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl leading-relaxed"
        >
          Collaborate, organize, and track your team’s progress in a single
          intuitive platform built for modern productivity.
        </motion.p>

        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/register"
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-lg shadow-sky-900/40"
        >
          Get Started Free
        </motion.a>
      </section>

      {/* Features Section */}
      <section className={`${bgColor} py-20`}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-14 text-gray-100"
          >
            Smart Tools for Smarter Collaboration
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "👥",
                title: "Team Management",
                desc: "Build structured teams and assign clear roles for transparent collaboration.",
              },
              {
                icon: "📅",
                title: "Meeting Scheduler",
                desc: "Set up meetings effortlessly and never miss important discussions.",
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                desc: "Visualize milestones and keep your team aligned with real-time updates.",
              },
              {
                icon: "🔔",
                title: "Smart Notifications",
                desc: "Get timely alerts about tasks, meetings, and project changes.",
              },
              {
                icon: "🧠",
                title: "AI Insights",
                desc: "Leverage AI to analyze team performance and productivity trends.",
              },
              {
                icon: "🔒",
                title: "Secure Access",
                desc: "Your data stays encrypted and safe with advanced authentication.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-900/80 border border-slate-700 rounded-2xl p-8 text-center hover:translate-y-[-4px] transition-all duration-300 shadow-md hover:shadow-sky-800/40"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-100">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className={`${bgColor} py-16 border-t border-gray-800`}
      >
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 text-center gap-10 text-gray-200">
          {[
            { value: "500+", label: "Teams Managed" },
            { value: "2K+", label: "Meetings Organized" },
            { value: "98%", label: "User Satisfaction" },
            { value: "24/7", label: "Support Availability" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center"
            >
              <h3 className="text-3xl font-bold text-sky-400 drop-shadow-md">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className={`${bgColor} py-24 text-center text-white shadow-inner`}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
          Ready to Simplify Your Team Workflow?
        </h2>
        <p className="text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
          Empower your team with a smarter, faster, and more efficient
          management platform trusted by hundreds of professionals.
        </p>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/register"
          className="bg-sky-500 text-white font-semibold px-10 py-4 rounded-lg hover:bg-sky-600 transition-all shadow-lg shadow-sky-900/40"
        >
          Create Free Account
        </motion.a>
      </motion.section>
    </>
  );
};

export default Home;
