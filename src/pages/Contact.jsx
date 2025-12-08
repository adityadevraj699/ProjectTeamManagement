import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL; // http://localhost:8080/api

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // basic front-end validation
    if (!form.name || !form.email || !form.message) {
      setStatus({
        type: "error",
        msg: "Please fill name, email and message.",
      });
      return;
    }

    try {
      // API call to backend -> POST /api/public-queries
      await axios.post(`${API_BASE_URL}/public-queries`, form);

      setStatus({
        type: "success",
        msg: "Thanks! Your message has been sent.",
      });

      // clear form after submit
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Error while sending contact form:", err);
      setStatus({
        type: "error",
        msg: "Something went wrong while sending your message.",
      });
    }

    // hide status after 5 sec
    setTimeout(() => setStatus(null), 5000);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 flex flex-col">
      <main className="max-w-6xl mx-auto px-6 py-16 w-full flex-1">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Get in touch
        </h1>
        <p className="text-gray-400 mb-8">
          Have a question, feedback or want to work together? Send us a message
          and we'll reply shortly.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Contact info + map */}
          <div className="space-y-6">
            <div className="p-6 border border-gray-800 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950">
              <h2 className="text-xl font-semibold text-white mb-3">
                Contact Information
              </h2>

              <div className="space-y-3 text-sm text-gray-400">
                <div>
                  <p className="font-medium text-gray-300">Email</p>
                  <a
                    href="mailto:aditya@zephronix.in"
                    className="block hover:text-sky-400 transition-colors"
                  >
                    aditya@zephronix.in
                  </a>
                </div>

                <div>
                  <p className="font-medium text-gray-300">Phone</p>
                  <p className="text-gray-400">+91 911-016-9560</p>
                </div>

                <div>
                  <p className="font-medium text-gray-300">Location</p>
                  <p className="text-gray-400">
                    Meerut Institute of Technology, Meerut, Uttar Pradesh, India
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-300">Portfolio</p>
                  <a
                    href="https://aditya-portfolio-org.vercel.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-sky-400 transition-colors"
                  >
                    aditya-portfolio-org.vercel.app
                  </a>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-gray-400">
                <div className="p-3 rounded bg-gray-900 border border-gray-800 text-center">
                  Support
                </div>
                <div className="p-3 rounded bg-gray-900 border border-gray-800 text-center">
                  Sales
                </div>
                <div className="p-3 rounded bg-gray-900 border border-gray-800 text-center">
                  Careers
                </div>
                <div className="p-3 rounded bg-gray-900 border border-gray-800 text-center">
                  Partnerships
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-800">
              <iframe
                title="location-map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3492.0093582493178!2d77.63679241116795!3d28.927772370509942!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390c614f846e713f%3A0xdf29c5d5329144f0!2sMeerut%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1764530635728!5m2!1sen!2sin"
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right - Contact form */}
          <div>
            <div className="p-6 rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950">
              <h2 className="text-xl font-semibold text-white mb-4">
                Send a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs text-gray-400">Your name *</span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="mt-1 w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      placeholder="John Doe"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs text-gray-400">
                      Email address *
                    </span>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="mt-1 w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      placeholder="you@example.com"
                      required
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-xs text-gray-400">Phone</span>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="mt-1 w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      placeholder="+91 98765 43210"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-xs text-gray-400">Subject</span>
                    <input
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="mt-1 w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      placeholder="Project inquiry, support, etc."
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-xs text-gray-400">Message *</span>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={6}
                      className="mt-1 w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      placeholder="Tell us about your project or question..."
                      required
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-400 text-gray-900 font-semibold hover:scale-[1.02] transition-transform shadow-md"
                  >
                    Send message
                  </button>

                  <div className="text-sm text-gray-400">
                    We typically reply within 1–2 business days
                  </div>
                </div>

                {status && (
                  <div
                    className={`p-3 rounded ${
                      status.type === "success"
                        ? "bg-green-900 text-green-300"
                        : "bg-red-900 text-red-300"
                    }`}
                  >
                    {status.msg}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
