// src/pages/Features.jsx
import React, { useState } from "react";

const features = [
  {
    title: "Centralized academic project lifecycle management — team formation, guide allocation, task scheduling",
    body: `A cloud-based workspace to create teams, assign guides, schedule tasks and meetings, upload documents, and store minutes. Replaces scattered tools like chat apps and spreadsheets with a structured academic workflow.`
  },
  {
    title: "Automated Minutes of Meeting (MOM) generation and PDF export",
    body: `Capture meeting notes, decisions and action items; generate printable PDF MOMs and attach them to projects for evaluation and audits.`
  },
  {
    title: "Role-based Guide–Student interactions with approvals & feedback",
    body: `Specialized roles (Admin, Guide, Student) with flows for approvals, structured feedback, milestone evaluation and grade-ready deliverables.`
  },
  {
    title: "Real-time task tracking, notifications and analytics dashboard",
    body: `Live dashboards for task progress, upcoming meetings, contribution analytics and automated notifications to keep teams on schedule.`
  },
  {
    title: "Document repository with versioning & PDF engine",
    body: `Upload reports, maintain versions, generate and archive PDFs for all important submissions and MOMs.`
  },
  {
    title: "Multi-tenant & startup-ready architecture",
    body: `Institution-level separation, custom branding, subscription plans and modular add-ons for commercial deployment.`
  }
];

const ChevronDown = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 9l6 6 6-6"></path>
  </svg>
);

const ChevronUp = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 15l-6-6-6 6"></path>
  </svg>
);

export default function Features() {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(i) {
    setOpenIndex(prev => (prev === i ? null : i));
  }

  return (
    <section className="w-full bg-gray-950 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Features — Project & Team Management System</h1>
          <p className="text-gray-400 mt-2 max-w-3xl">
            Below are the main capabilities of the system. Click any item to expand and read the details.
          </p>
        </header>

        <div className="space-y-4">
          {features.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <article key={i} className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-5 flex items-start justify-between gap-4 focus:outline-none"
                >
                  <div className="text-left">
                    <h3 className="text-white text-lg md:text-xl font-semibold leading-snug">{f.title}</h3>
                    <p className="mt-2 text-sm text-gray-400 max-w-4xl">
                      {f.body.length > 140 ? f.body.slice(0, 140).trim() + "…" : f.body}
                    </p>
                  </div>

                  <div className="ml-4 flex-shrink-0 pt-1">
                    {isOpen ? <ChevronUp className="text-sky-400" /> : <ChevronDown className="text-gray-400" />}
                  </div>
                </button>

                <div
                  className={`px-6 pb-6 transition-all duration-300 ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
                  style={{ overflow: "hidden" }}
                >
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{f.body}</p>

                  {/* Optional bullets auto-generated from sentences */}
                  <ul className="mt-4 text-sm text-gray-400 space-y-1 list-disc list-inside">
                    {f.body.split(".").map((s, si) => {
                      const text = s.trim();
                      if (!text) return null;
                      return <li key={si}>{text}.</li>;
                    })}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA / Footer strip for the features section */}
        <div className="mt-10 text-center">
          <a
            href="/contact"
            className="inline-block px-6 py-3 rounded-xl bg-sky-400 text-gray-900 font-semibold hover:scale-[1.02] transition-transform"
          >
            Contact Sales / Request Demo
          </a>
        </div>
      </div>
    </section>
  );
}
