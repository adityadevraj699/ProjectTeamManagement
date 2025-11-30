// src/pages/Support.jsx
import React, { useState } from "react";

export default function Support() {
  const [ticket, setTicket] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setTicket(prev => ({ ...prev, [name]: value }));
  }

  function submitTicket(e) {
    e.preventDefault();
    if (!ticket.name || !ticket.email || !ticket.subject || !ticket.message) {
      setStatus({ type: "error", msg: "Please fill all fields before submitting a ticket." });
      window.setTimeout(() => setStatus(null), 4000);
      return;
    }

    // TODO: send `ticket` to your backend / ticketing system here (fetch / axios)
    console.log("Ticket created:", ticket);
    setStatus({ type: "success", msg: "Ticket submitted — our team will contact you shortly." });
    setTicket({ name: "", email: "", subject: "", message: "" });

    window.setTimeout(() => setStatus(null), 3500);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 flex flex-col">
      <main className="max-w-6xl mx-auto px-6 py-14 w-full flex-1">
        {/* Hero */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Support</h1>
          <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
            Need help? Browse our knowledge base, open a support ticket, or contact our team — we are here to help.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <a href="/faq" className="px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-sm text-gray-300 hover:text-sky-400">Browse FAQs</a>
            <a href="/docs" className="px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-sm text-gray-300 hover:text-sky-400">Read docs</a>
            <button
              onClick={() => alert("Live chat integration placeholder — add Intercom/Crisp script.")}
              className="px-4 py-2 rounded-full bg-sky-400 text-gray-900 text-sm font-semibold"
            >
              Start live chat
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Support tiers & quick contacts */}
          <aside className="space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800">
              <h2 className="text-lg font-semibold text-white">Support & SLA Plans</h2>
              <p className="text-sm text-gray-400 mt-2">Choose the support level that fits your institution.</p>

              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-lg border border-gray-800 bg-gray-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">Email & Chat</div>
                      <div className="text-xs text-gray-400">Standard response via email & chat.</div>
                    </div>
                    <div className="text-xs text-sky-400 font-semibold">Included</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-gray-800 bg-gray-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">Priority Support</div>
                      <div className="text-xs text-gray-400">Faster response times, priority queue.</div>
                    </div>
                    <div className="text-xs text-gray-400">Add-on</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-gray-800 bg-gray-900">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">Enterprise SLA</div>
                      <div className="text-xs text-gray-400">Dedicated manager, phone support, custom SLA.</div>
                    </div>
                    <div className="text-xs text-gray-400">Custom</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800">
              <h3 className="text-sm font-semibold text-white">Contact</h3>
              <div className="mt-3 text-sm text-gray-400 space-y-2">
                <div>
                  <div className="text-xs text-gray-300 font-medium">Email</div>
                  <a href="mailto:aditya@zephrinix.in" className="text-sm hover:text-sky-400">aditya@zephrinix.in</a>
                </div>

                <div>
                  <div className="text-xs text-gray-300 font-medium">Phone</div>
                  <div className="text-sm text-gray-400">+91 911-016-9560</div>
                </div>

                <div>
                  <div className="text-xs text-gray-300 font-medium">Support hours</div>
                  <div className="text-sm text-gray-400">Mon–Fri, 9:00 — 18:00 IST</div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800">
              <h3 className="text-sm font-semibold text-white">Resources</h3>
              <ul className="mt-3 text-sm text-gray-400 space-y-2">
                <li><a href="/docs" className="hover:text-sky-400">Documentation</a></li>
                <li><a href="/faq" className="hover:text-sky-400">Frequently asked questions</a></li>
                <li><a href="/contact" className="hover:text-sky-400">Contact & demo</a></li>
                <li><a href="/features" className="hover:text-sky-400">Features</a></li>
              </ul>
            </div>
          </aside>

          {/* Middle: Knowledge base / popular guides */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800">
              <h3 className="text-lg font-semibold text-white">Knowledge base — Popular guides</h3>
              <p className="text-sm text-gray-400 mt-2">Quick-starts and common troubleshooting articles.</p>

              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="text-sky-400 mt-1">•</div>
                  <a href="/docs/getting-started" className="hover:text-sky-400">Getting started: Create your first project & team</a>
                </li>
                <li className="flex items-start gap-3">
                  <div className="text-sky-400 mt-1">•</div>
                  <a href="/docs/mom-generation" className="hover:text-sky-400">Generate Minutes of Meeting (MOM) and export PDF</a>
                </li>
                <li className="flex items-start gap-3">
                  <div className="text-sky-400 mt-1">•</div>
                  <a href="/docs/integrations" className="hover:text-sky-400">Integrate with your LMS / ERP</a>
                </li>
                <li className="flex items-start gap-3">
                  <div className="text-sky-400 mt-1">•</div>
                  <a href="/docs/troubleshooting" className="hover:text-sky-400">Troubleshooting common issues</a>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800">
              <h3 className="text-lg font-semibold text-white">Service Status</h3>
              <p className="text-sm text-gray-400 mt-2">Check system health and uptime.</p>
              <div className="mt-4">
                <a href="/status" className="inline-block px-3 py-2 rounded-md bg-gray-900 border border-gray-800 text-sm text-gray-300 hover:text-sky-400">View status page</a>
              </div>
            </div>
          </div>

          {/* Right: Ticket form */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800">
              <h3 className="text-lg font-semibold text-white">Open a support ticket</h3>
              <p className="text-sm text-gray-400 mt-2">Describe your issue or request and our team will get back to you.</p>

              <form onSubmit={submitTicket} className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-xs text-gray-400">Your name</span>
                  <input name="name" value={ticket.name} onChange={handleChange}
                    className="mt-1 w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </label>

                <label className="block">
                  <span className="text-xs text-gray-400">Email</span>
                  <input name="email" value={ticket.email} onChange={handleChange} type="email"
                    className="mt-1 w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </label>

                <label className="block">
                  <span className="text-xs text-gray-400">Subject</span>
                  <input name="subject" value={ticket.subject} onChange={handleChange}
                    className="mt-1 w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </label>

                <label className="block">
                  <span className="text-xs text-gray-400">Message</span>
                  <textarea name="message" value={ticket.message} onChange={handleChange} rows={5}
                    className="mt-1 w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </label>

                <div className="flex items-center gap-3">
                  <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-400 text-gray-900 font-semibold hover:scale-[1.02] transition-transform">Submit ticket</button>
                  <button type="button" onClick={() => { setTicket({ name: "", email: "", subject: "", message: "" }); setStatus(null); }} className="px-3 py-2 rounded-md bg-gray-900 border border-gray-800 text-sm text-gray-300 hover:text-sky-400">Clear</button>
                </div>

                {status && (
                  <div className={`mt-3 p-3 rounded ${status.type === "success" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>{status.msg}</div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Bottom help strip */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-300 font-medium">Need urgent assistance?</div>
            <div className="text-xs text-gray-400">Call our support line: +91 911-016-9560 — available Mon–Fri 9:00–18:00 IST</div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/contact" className="px-4 py-2 rounded-md bg-sky-400 text-gray-900 font-semibold">Request a demo</a>
            <a href="/docs" className="px-4 py-2 rounded-md bg-transparent border border-gray-800 text-gray-300 hover:text-sky-400">Documentation</a>
          </div>
        </div>
      </main>
    </div>
  );
}
