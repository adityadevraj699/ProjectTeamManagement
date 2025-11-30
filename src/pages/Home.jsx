import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail } from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa";

// HomePage.jsx
// TailwindCSS + Framer Motion based company home page
// Changes requested:
// - Remove nav items from being displayed over the hero/banner
// - Make Team Leader appear above other team members (leader emphasized)
// - Use icons for email & LinkedIn links instead of plain text
// - Improve parallax + autoslider behavior: background stays visually anchored when scrolling and sections scroll over it; slider auto-advances; text has motion
// - Keep banner parallax effect + stop banner background from moving away when user scrolls (use fixed background + motion for subtle parallax on load)

export default function HomePage() {
  const slides = [
    {
      id: 1,
      title: "Build. Collaborate. Deliver.",
      subtitle:
        "A unified platform to manage teams, run meetings, track progress and ship better products.",
      img: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=2000&q=80",
    },
    {
      id: 2,
      title: "Plan Smarter, Move Faster",
      subtitle:
        "Roadmaps, milestones and AI-powered insights to help teams focus on what matters.",
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80",
    },
    {
      id: 3,
      title: "Secure & Scalable",
      subtitle:
        "Enterprise-grade security, role-based access and encryption across your organization.",
      img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2000&q=80",
    },
  ];

 /* updated team data */
  const team = [
  {
    name: "ADITYA KUMAR",
    role: "Developer",
    bio: "Project lead — focuses on architecture, integration and release management.",
    email: "aditya.kumar1.cs.2022@mitmeerut.ac.in",
    linkedin: "https://www.linkedin.com/in/adityadevraj699/",
    img: "https://res.cloudinary.com/ddtcj9ks5/image/upload/v1764509135/aditya_hacgws.png",
    leader: true,
  },
  {
    name: "Anjali Shah",
    role: "Developer",
    bio: "Frontend specialist working on UI/UX and responsive components.",
    email: "anjali.shah.cs.2022@mitmeerut.ac.in",
    linkedin: "https://www.linkedin.com/in/anjalishah43/",
    img: "https://res.cloudinary.com/ddtcj9ks5/image/upload/v1764509034/anjali_ramwoc.jpg",
  },
  {
    name: "Juhi Kumari",
    role: "Developer",
    bio: "Backend engineer — API design, data models and business logic.",
    email: "juhi.kumari.cs.2022@mitmeerut.ac.in",
    linkedin: "https://www.linkedin.com/in/juhi-kumari-15537a259/",
    img: "https://res.cloudinary.com/ddtcj9ks5/image/upload/v1764509034/juhi_d610gn.jpg",
  },
  {
    name: "Amrit Kumar",
    role: "Developer",
    bio: "DevOps & QA — CI/CD pipelines, testing and deployments.",
    email: "amrit.kumar.cs.2022@mitmeerut.ac.in",
    linkedin: "https://www.linkedin.com/in/amritekumar/",
    img: "https://ui-avatars.com/api/?name=Amrit+Kumar&background=021126&color=ffffff&size=512",
  },
  ];


  const guide = {
    name: "Amol Sharma",
    title:
      "Assistant Professor, Computer Science and Engineering, MIT-Meerut",
    email: "amol.sharma@mitmeerut.edu.in",
    linkedin: "https://www.linkedin.com/in/amol-sharma-mit",
    img: "https://ui-avatars.com/api/?name=Amol+Sharma&background=022c43&color=ffffff&size=512",
  };

  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const next = () => setIndex((i) => (i + 1) % slides.length);
    timeoutRef.current = setInterval(next, 4500);
    return () => clearInterval(timeoutRef.current);
  }, []);

  const goTo = (i) => {
    clearInterval(timeoutRef.current);
    setIndex(i % slides.length);
    timeoutRef.current = setInterval(() => setIndex((p) => (p + 1) % slides.length), 4500);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">

      {/* HERO / SLIDER */}
      <header className="relative overflow-hidden"> {/* add padding-top so topbar doesn't overlap content */}
        <div className="relative h-[80vh] md:h-[70vh]">
          <AnimatePresence initial={false} mode="popLayout">
            {slides.map((s, i) =>
              i === index ? (
                <section key={s.id} className="absolute inset-0 z-0">
                  {/* Use CSS fixed background to make banner visually anchored while page scrolls. */}
                  <div
                    className="absolute inset-0 bg-fixed bg-center bg-cover will-change-transform"
                    style={{ backgroundImage: `url(${s.img})` }}
                  />

                  {/* overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/70" />

                  {/* Center content with animated text */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
                    <motion.h1
                      initial={{ y: -30, opacity: 0, scale: 0.98 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="text-4xl md:text-6xl font-extrabold text-sky-300 tracking-tight mb-4"
                    >
                      {s.title}
                    </motion.h1>

                    <motion.p
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.12, duration: 0.8 }}
                      className="max-w-3xl text-sm md:text-lg text-gray-200 mb-8 leading-relaxed"
                    >
                      {s.subtitle}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="flex gap-4"
                    >
                      <a href="/register" className="bg-sky-500 text-black px-6 py-3 rounded-md font-semibold shadow-lg">Create Account</a>
                      <a href="#features" className="border border-gray-500 px-6 py-3 rounded-md text-gray-200">Learn More</a>
                    </motion.div>
                  </div>
                </section>
              ) : null
            )}
          </AnimatePresence>

          {/* subtle parallax mouse movement for the hero text only (no background movement on scroll) */}
          <ParallaxText index={index} slides={slides} />

          {/* Slider indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button
                aria-label={`Go to slide ${i + 1}`}
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 w-8 rounded-full transition-all ${i === index ? 'bg-sky-400 scale-105' : 'bg-gray-600/60'}`}
              />
            ))}
          </div>
        </div>
      </header>

      <main>
        {/* FEATURES */}
        <section id="features" className="py-20 max-w-6xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-center text-gray-100 mb-8"
          >
            Smart Tools for Smarter Collaboration
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '👥', title: 'Team Management', desc: 'Organize people into teams, set roles and permissions with granular control.' },
              { icon: '📅', title: 'Scheduling', desc: 'Powerful recurring meetings, calendar sync and time-zone aware scheduling.' },
              { icon: '📊', title: 'Progress Tracking', desc: 'Kanban, timelines and dashboards to measure outcomes, not inputs.' },
              { icon: '🔔', title: 'Notification Center', desc: 'Custom notifications so your team sees what matters most.' },
              { icon: '🧠', title: 'AI Insights', desc: 'Anomaly detection, productivity signals and auto-generated summaries.' },
              { icon: '🔒', title: 'Security & Compliance', desc: 'Role-based access, SSO support and encryption in transit and at rest.' },
            ].map((f, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: idx * 0.08 }} className="bg-slate-900/80 border border-slate-700 rounded-2xl p-8 text-center hover:translate-y-[-6px] transition-transform duration-300 shadow-md">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="py-12 border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center text-gray-200 py-6">
            {[{ value: '500+', label: 'Teams Managed' }, { value: '2K+', label: 'Meetings Organized' }, { value: '98%', label: 'User Satisfaction' }, { value: '24/7', label: 'Support Availability' }].map((s, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} className="flex flex-col items-center">
                <div className="text-3xl font-bold text-sky-400">{s.value}</div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

{/* OUR TEAM - uniform box size, leader highlighted */}
<section id="team" className="py-20 max-w-6xl mx-auto px-6">
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7 }}
    className="text-3xl font-bold text-center mb-10"
  >
    Our Team
  </motion.h2>

  {(() => {
    const ordered = [
      ...team.filter((t) => t.leader),
      ...team.filter((t) => !t.leader),
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {ordered.map((m, idx) => {
          const isLeader = !!m.leader;

          return (
            <motion.div
              key={m.email}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className={
                "rounded-2xl border backdrop-blur-xl shadow-xl p-8 flex flex-col items-center text-center transition-all " +
                (isLeader
                  ? "border-sky-500 bg-gradient-to-br from-slate-900/80 to-sky-900/30"
                  : "border-slate-700 bg-slate-900/70")
              }
              style={{ height: "350px" }} // same height for all
            >
              {/* Leader Badge */}
              {isLeader && (
                <div className="mb-3 bg-sky-600 px-3 py-1 rounded-full text-black text-xs font-semibold shadow">
                  LEADER
                </div>
              )}

              {/* Avatar */}
              <img
                src={m.img}
                alt={m.name}
                className={
                  isLeader
                    ? "w-24 h-24 rounded-full ring-4 ring-sky-500 shadow-lg mb-4"
                    : "w-20 h-20 rounded-full shadow-inner mb-4"
                }
              />

              <h3 className={"font-bold " + (isLeader ? "text-xl" : "text-lg")}>
                {m.name}
              </h3>

              <p className="text-sm text-sky-300 font-medium">{m.role}</p>

              <p className="text-xs text-gray-400 mt-2 line-clamp-2">{m.bio}</p>

              {/* Icons */}
              <div className="flex gap-4 mt-4">
                {/* Email */}
                <a
                  href={`mailto:${m.email}`}
                  className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition flex items-center justify-center"
                  title="Email"
                  aria-label={`${m.name} email`}
                >
                  <FiMail className="h-5 w-5" />
                </a>

                {/* LinkedIn */}
                <a
                  href={m.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition flex items-center justify-center"
                  title="LinkedIn"
                  aria-label={`${m.name} LinkedIn`}
                >
                  <FaLinkedin className="h-5 w-5" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  })()}
</section>

{/* Compact Guide + Note + CTA in one row (icons only for contact) */}
<section
  id="guide"
  className="py-12 bg-slate-900/40 border-t border-gray-800"
>
  <div className="max-w-6xl mx-auto px-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
      {/* Col 1: guide avatar + name */}
      <div className="flex items-center gap-4">
        <img
          src={guide.img}
          alt={guide.name}
          className="w-20 h-20 rounded-full shadow-lg ring-4 ring-sky-600/30 object-cover"
        />
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-white">
            {guide.name}
          </h3>
          <p className="text-xs md:text-sm text-gray-300">{guide.title}</p>
        </div>
      </div>

      {/* Col 2: guide note (brief) */}
      <div>
        <p className="text-sm text-gray-200">
          <strong>Under Guidance:</strong> This project is developed under the
          supervision of <em>{guide.name}</em>, Assistant Professor,
          Department of Computer Science and Engineering, MIT-Meerut.
        </p>
      </div>

      {/* Col 3: icons only + small CTA group */}
      <div className="flex items-center justify-start md:justify-end gap-4">
        {/* icons only - no link text */}
        <a
          href={`mailto:${guide.email}`}
          aria-label={`${guide.name} email`}
          title="Email"
          className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition flex items-center justify-center"
        >
          <FiMail className="h-5 w-5 text-sky-400" />
        </a>

        <a
          href={guide.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label={`${guide.name} LinkedIn`}
          title="LinkedIn"
          className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition flex items-center justify-center"
        >
          <FaLinkedin className="h-5 w-5 text-sky-400" />
        </a>
      </div>
    </div>
  </div>
</section>

        {/* CTA */}
        <section id="contact" className="py-16 text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-4">Ready to simplify your team's workflow?</h2>
            <p className="text-gray-300 mb-6">Start a free trial, or get in touch with our team for an enterprise demo.</p>
            <div className="flex items-center justify-center gap-4">
              <a href="/register" className="bg-sky-500 text-black px-6 py-3 rounded-md font-semibold">Get Started</a>
              <a href="mailto:hello@zephronix.com" className="border border-gray-600 px-6 py-3 rounded-md text-gray-200">Contact Sales</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// IconLink component (keeps markup small for icons)
function IconLink({ href, children, external = false, title }) {
  return (
    <a href={href} title={title} target={external ? "_blank" : "_self"} rel={external ? "noreferrer" : undefined} className="inline-flex items-center justify-center rounded-md bg-slate-900/30 px-3 py-2 hover:bg-slate-900/50 transition">
      <span className="sr-only">{title}</span>
      {children}
    </a>
  );
}

// ParallaxText adds subtle cursor-based parallax to hero text (does not move background on scroll)
function ParallaxText({ index, slides }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      el.style.transform = `translate3d(${x * 12}px, ${y * 6}px, 0)`;
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // small invisible layer that sits above the background to provide text parallax
  return <div ref={ref} className="pointer-events-none absolute inset-0 z-5" />;
}
