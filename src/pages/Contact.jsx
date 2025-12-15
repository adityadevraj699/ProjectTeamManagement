import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  HiMail, HiPhone, HiLocationMarker, HiGlobeAlt, 
  HiPaperAirplane, HiChatAlt2, HiCheckCircle, HiExclamationCircle 
} from "react-icons/hi";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// 🔄 Button Loader
const ButtonLoader = () => (
  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
);

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', msg: '' }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus({ type: "error", msg: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/public-queries`, form);
      setStatus({ type: "success", msg: "Message sent! We'll get back to you soon." });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error("Contact Error:", err);
      setStatus({ type: "error", msg: "Failed to send message. Please try again later." });
    } finally {
      setLoading(false);
      // Auto-dismiss success message
      setTimeout(() => {
        if(status?.type === 'success') setStatus(null);
      }, 6000);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 relative overflow-hidden font-sans selection:bg-sky-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        
        {/* Page Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
          >
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">Touch</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Have a question about our platform? Need support or want to discuss a partnership? We're here to help.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* --- LEFT COLUMN: Contact Info & Map --- */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard 
                icon={<HiMail />} 
                label="Email Us" 
                value="aditya@zephronix.in" 
                link="mailto:aditya@zephronix.in"
              />
              <InfoCard 
                icon={<HiPhone />} 
                label="Call Us" 
                value="+91 911-016-9560" 
                link="tel:+919110169560"
              />
              <InfoCard 
                icon={<HiGlobeAlt />} 
                label="Portfolio" 
                value="View Projects" 
                link="https://aditya-portfolio-org.vercel.app/"
              />
              <InfoCard 
                icon={<HiLocationMarker />} 
                label="Visit Us" 
                value="MIT, Meerut, India" 
                link="#"
              />
            </div>

            {/* HD Color Map Container */}
            <div className="relative group rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-800">
               {/* Map Header */}
               <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-lg shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Location</span>
                  </div>
               </div>

               {/* ✨ HD COLOR MAP ✨ 
                  - Removed 'grayscale' and 'invert' filters.
                  - Removed opacity-80.
                  - Added real Google Maps Embed link for MIT Meerut.
               */}
               <iframe
                title="Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3490.724734863864!2d77.64092231508253!3d28.96374998228678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390c668fde4a024b%3A0xe547ad9b407481!2sMeerut%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1649839284721!5m2!1sen!2sin"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-[350px] object-cover shadow-inner"
              />
            </div>
            
            <div className="flex gap-4 text-sm text-slate-500 justify-center lg:justify-start">
               <span>• Support</span>
               <span>• Sales</span>
               <span>• General Inquiry</span>
            </div>

          </motion.div>


          {/* --- RIGHT COLUMN: Modern Form --- */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              
              {/* Form Decorative Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-[50px] pointer-events-none" />

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <HiChatAlt2 className="text-sky-400" /> Send a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputGroup 
                    label="Your Name" 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    placeholder="John Doe" 
                    required 
                  />
                  <InputGroup 
                    label="Email Address" 
                    name="email" 
                    type="email"
                    value={form.email} 
                    onChange={handleChange} 
                    placeholder="john@example.com" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <InputGroup 
                      label="Phone (Optional)" 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange} 
                      placeholder="+91..." 
                    />
                    <InputGroup 
                      label="Subject" 
                      name="subject" 
                      value={form.subject} 
                      onChange={handleChange} 
                      placeholder="Project Inquiry..." 
                    />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none text-sm"
                    placeholder="Tell us how we can help..."
                    required
                  ></textarea>
                </div>

                {/* Status Message */}
                {status && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                      status.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {status.type === 'success' ? <HiCheckCircle className="text-lg"/> : <HiExclamationCircle className="text-lg"/>}
                    {status.msg}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>Sending... <ButtonLoader /></>
                  ) : (
                    <>Send Message <HiPaperAirplane className="rotate-90" /></>
                  )}
                </button>

              </form>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}

/* --- REUSABLE COMPONENTS --- */

const InfoCard = ({ icon, label, value, link }) => (
  <a 
    href={link} 
    target={link.startsWith('http') ? '_blank' : '_self'}
    rel="noreferrer"
    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-sky-500/30 transition-all group"
  >
    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-sky-400 text-xl group-hover:scale-110 transition-transform shadow-inner">
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{label}</p>
      <p className="text-slate-200 font-medium text-sm group-hover:text-sky-300 transition-colors truncate max-w-[140px]">{value}</p>
    </div>
  </a>
);

const InputGroup = ({ label, name, type = "text", value, onChange, placeholder, required = false }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
      placeholder={placeholder}
      required={required}
    />
  </div>
);