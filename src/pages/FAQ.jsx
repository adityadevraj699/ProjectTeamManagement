// src/pages/FAQ.jsx
import React, { useState, useMemo } from "react";

/* Inline chevron icons (no deps) */
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

/* Categorized FAQ list — professional English answers */
const CATEGORIZED_FAQS = [
  // Pricing & Billing
  {
    category: "Pricing & Billing",
    q: "What billing options do you offer?",
    a: "We offer both monthly and annual billing. Monthly plans provide flexibility with pay-as-you-go billing, while annual plans reduce the effective monthly cost and are billed once per year.",
  },
  {
    category: "Pricing & Billing",
    q: "What is the institutional pricing?",
    a: "The institutional starter plan is priced at ₹15,000 per year. There is also a monthly option available at ₹2,500 per month. Enterprise deployments are priced via custom quotes depending on scale and integration needs.",
  },
  {
    category: "Pricing & Billing",
    q: "Are there volume discounts for multiple departments?",
    a: "Yes. We provide volume discounts and customized pricing for multi-department or multi-campus rollouts. Contact our sales team for a tailored proposal.",
  },
  {
    category: "Pricing & Billing",
    q: "How are taxes and invoicing handled?",
    a: "Invoices include applicable taxes as per regional regulations. For enterprise customers we can provide customized invoice formats and tax handling based on contractual terms.",
  },

  // Onboarding & Setup
  {
    category: "Onboarding & Setup",
    q: "How long does implementation take?",
    a: "Implementation time depends on scope: basic setups can be completed within a few hours, while enterprise deployments that require data migration and integrations typically take 1–3 weeks.",
  },
  {
    category: "Onboarding & Setup",
    q: "Do you assist with data migration?",
    a: "Yes. For enterprise customers we offer data migration services including student, course and project data import, validations and verifications to ensure a smooth transition.",
  },
  {
    category: "Onboarding & Setup",
    q: "Is training available for faculty and administrators?",
    a: "We provide comprehensive onboarding training sessions, including live workshops, recorded tutorials and documentation tailored for faculty, administrators and student representatives.",
  },

  // Security & Compliance
  {
    category: "Security & Compliance",
    q: "How is data secured in transit and at rest?",
    a: "Data is encrypted both in transit (TLS) and at rest. We follow industry-standard encryption practices and enforce strict access controls across all environments.",
  },
  {
    category: "Security & Compliance",
    q: "Do you provide role-based access control (RBAC)?",
    a: "Yes. The platform supports RBAC with configurable roles such as Admin, Guide, and Student, ensuring users only access the data and functions necessary for their role.",
  },
  {
    category: "Security & Compliance",
    q: "What compliance and audit features are available?",
    a: "Audit logs, activity trails and versioned document storage are available. Enterprise plans can include additional compliance features and audit support on request.",
  },

  // Integrations & API
  {
    category: "Integrations & API",
    q: "What systems can you integrate with?",
    a: "We support integrations with common systems such as college ERPs, LMS platforms, Google Workspace, and email providers. Custom integrations via APIs and webhooks are available for enterprise customers.",
  },
  {
    category: "Integrations & API",
    q: "Is there a public API for automation?",
    a: "Yes. We offer RESTful APIs and webhook support to automate workflows, synchronize user data, and connect with external systems. API access and scopes are provisioned per contract.",
  },

  // Support & SLA
  {
    category: "Support & SLA",
    q: "What support channels do you provide?",
    a: "Support is provided via email and chat for Starter and Pro customers. Enterprise customers receive priority support, a dedicated onboarding manager and access to phone support as per the SLA.",
  },
  {
    category: "Support & SLA",
    q: "What are your response time commitments?",
    a: "Response times vary by plan. Starter and Pro plans receive timely email/chat responses, while Enterprise plans have contractual SLAs with guaranteed response and resolution windows.",
  },
  {
    category: "Support & SLA",
    q: "Can I request a demo or trial?",
    a: "Yes. We offer a 14-day trial for new institutions on the Starter plan and can schedule personalized demos for interested departments or enterprise customers.",
  },
];

export default function FAQ() {
  const [query, setQuery] = useState("");
  const [openIndexes, setOpenIndexes] = useState([]); // multi-open
  // default to the first category (Pricing & Billing)
  const [category, setCategory] = useState("Pricing & Billing");

  // derive categories dynamically (no 'All')
  const categories = useMemo(() => {
    const setCat = new Set(CATEGORIZED_FAQS.map((f) => f.category));
    return Array.from(setCat);
  }, []);

  // filter by category + search query
  const filtered = CATEGORIZED_FAQS.filter((f) => {
    if (category && f.category !== category) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
  });

  function toggle(id) {
    setOpenIndexes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  // clicking a category: clear query, close all accordions
  function selectCategory(c) {
    setCategory(c);
    setQuery("");
    setOpenIndexes([]);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 flex flex-col py-12">
      <main className="max-w-6xl mx-auto px-6 w-full">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Frequently Asked Questions</h1>
          <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
            Find answers to common questions about product capabilities, pricing, onboarding, security and support.
          </p>

          {/* category chips (no 'All') */}
          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => selectCategory(c)}
                className={`px-4 py-2 text-sm rounded-full border ${
                  category === c ? "bg-sky-400 text-gray-900 border-sky-400" : "bg-gray-900 text-gray-300 border-gray-800 hover:text-sky-400"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-6 w-full max-w-xl mx-auto">
            <label className="relative block">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search FAQs (e.g., billing, security, integrations)..."
                className="w-full bg-gray-900 border border-gray-800 rounded-full px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <span className="absolute right-3 top-3 text-gray-500 text-sm">⌘K</span>
            </label>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: contact / help / office (Quick topics removed) */}
          <aside className="space-y-4">
            <div className="p-4 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-lg">
              <h3 className="text-sm font-semibold text-white">Need more help?</h3>
              <p className="text-sm text-gray-400 mt-2">If you cannot find an answer here, request a demo or contact support.</p>
              <div className="mt-3 flex flex-col gap-2">
                <a href="/contact" className="inline-block text-sm px-3 py-2 rounded-md bg-sky-400 text-gray-900 text-center">Request demo</a>
                <a href="mailto:aditya@zephrinix.in" className="inline-block text-sm px-3 py-2 rounded-md border border-gray-800 text-gray-300 text-center hover:text-sky-400">Email support</a>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-lg text-sm text-gray-400">
              <div><strong>Office</strong></div>
              <div className="mt-1">Meerut Institute of Technology, Meerut</div>
              <div className="mt-2">Phone: +91 911-016-9560</div>
            </div>
          </aside>

          {/* Main FAQs */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.length === 0 && (
              <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-lg text-gray-400">
                No results for "<span className="text-white">{query}</span>". Try different keywords or select a different category.
              </div>
            )}

            {filtered.map((f, index) => {
              // unique id per item based on category + index
              const id = `${f.category}-${index}`;
              const isOpen = openIndexes.includes(id);
              return (
                <article key={id} className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    className="w-full px-5 py-4 flex items-start justify-between gap-4 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="text-left">
                      <h4 className="text-white text-lg font-medium">{f.q}</h4>
                      <p className="text-sm text-gray-400 mt-1">{isOpen ? "" : f.a.slice(0, 120) + (f.a.length > 120 ? "…" : "")}</p>
                    </div>

                    <div className="ml-4 flex-shrink-0 pt-1">
                      {isOpen ? <ChevronUp className="text-sky-400" /> : <ChevronDown className="text-gray-400" />}
                    </div>
                  </button>

                  <div className={`px-5 pb-5 transition-all duration-300 ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`} style={{ overflow: "hidden" }}>
                    <p className="text-sm text-gray-300 leading-relaxed">{f.a}</p>
                    <div className="text-xs text-gray-500 mt-3">Category: {f.category}</div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
