// src/pages/Pricing.jsx
import React, { useState } from "react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For small student teams & trial use",
    monthly: 2500,      // ₹ per month
    annual: 15000,      // ₹ per year (special college price you gave)
    bullets: [
      "Up to 50 users",
      "Basic project & task management",
      "MOM generation (limited)",
      "File uploads (5 GB)",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For active departments & labs",
    monthly: 5000,
    annual: 45000,
    bullets: [
      "Up to 300 users",
      "Advanced task workflows & timelines",
      "Full MOM + versioned document repository",
      "Analytics dashboard & exports",
      "Priority email & chat support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise (College)",
    tagline: "Full college rollout — custom SLA",
    monthly: 0, // shown as \"Contact sales\" — pricing by quote
    annual: 0,
    bullets: [
      "Multi-department multi-tenant setup",
      "Custom branding & SIS/ERP integration",
      "SAML / LDAP & advanced security",
      "Dedicated support & onboarding",
      "Optional on-prem / private cloud deployment",
    ],
  },
];

const addons = [
  { id: "storage", title: "Extra Storage (per 50GB)", monthly: 1000, annual: 10000 },
  { id: "ai", title: "AI Analytics Module", monthly: 3000, annual: 30000 },
  { id: "priority", title: "Priority Support (24/7)", monthly: 5000, annual: 45000 },
];

export default function Pricing() {
  const [billing, setBilling] = useState("annual"); // 'monthly' or 'annual'
  const [faqOpen, setFaqOpen] = useState(null);

  const format = (n) =>
    n === 0 ? "Contact us" : `₹ ${n.toLocaleString("en-IN")}${billing === "monthly" ? "/mo" : "/yr"}`;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 flex flex-col">
      <main className="max-w-6xl mx-auto px-6 py-16 w-full flex-1">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Pricing — Project & Team Management</h1>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
            Simple, transparent pricing for colleges, departments and teams. Choose monthly or save with an annual plan.
          </p>

          <div className="inline-flex items-center gap-3 mt-6 bg-gray-900 border border-gray-800 rounded-full p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                billing === "monthly"
                  ? "bg-sky-400 text-gray-900 shadow"
                  : "text-gray-300 hover:text-sky-400"
              }`}
            >
              Monthly
            </button>

            <button
              onClick={() => setBilling("annual")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                billing === "annual"
                  ? "bg-sky-400 text-gray-900 shadow"
                  : "text-gray-300 hover:text-sky-400"
              }`}
            >
              Annual (Save more)
            </button>
          </div>
        </header>

        {/* Plans grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.id} className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6 flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{p.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{p.tagline}</p>
                </div>
                {p.id === "starter" && (
                  <div className="text-xs text-sky-400 font-semibold px-2 py-1 rounded bg-gray-900/50">Popular</div>
                )}
              </div>

              <div className="mt-6">
                <div className="text-3xl font-bold text-white">
                  {p.id === "enterprise"
                    ? p.monthly === 0 && p.annual === 0
                      ? "Custom"
                      : format(billing === "monthly" ? p.monthly : p.annual)
                    : format(billing === "monthly" ? p.monthly : p.annual)}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {p.id === "enterprise" ? "Per institution / contact sales" : billing === "monthly" ? "billed monthly" : "billed yearly"}
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-gray-300 flex-1">
                {p.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 text-sky-400">●</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {p.id === "enterprise" ? (
                  <a
                    href="/contact"
                    className="block text-center px-4 py-3 rounded-xl bg-transparent border border-sky-400 text-sky-400 hover:bg-sky-400 hover:text-gray-900 transition"
                  >
                    Contact Sales
                  </a>
                ) : (
                  <button
                    onClick={() => alert(`${p.name} plan selected - ${billing === "monthly" ? "Monthly" : "Annual"}`)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-400 text-gray-900 font-semibold hover:scale-[1.02] transition-transform shadow"
                  >
                    Get started
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Add-ons */}
        <section className="mt-12 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white">Optional Add-ons</h3>
          <p className="text-sm text-gray-400 mt-2">Pick add-ons to extend storage, analytics and support.</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {addons.map((a) => (
              <div key={a.id} className="p-4 border border-gray-800 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{a.title}</div>
                  <div className="text-sm text-gray-400 mt-1">{billing === "monthly" ? `₹ ${a.monthly.toLocaleString("en-IN")}/mo` : `₹ ${a.annual.toLocaleString("en-IN")}/yr`}</div>
                </div>

                <button
                  onClick={() => alert(`Add-on selected: ${a.title} (${billing})`)}
                  className="mt-4 inline-block px-3 py-2 rounded-md bg-transparent border border-sky-400 text-sky-400 hover:bg-sky-400 hover:text-gray-900 transition"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing notes */}
        <div className="mt-8 text-sm text-gray-400">
          <p>Notes:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Starter Annual: <strong>₹ 15,000 / year</strong> (special institutional starter price).</li>
            <li>Monthly plans are month-to-month cancellable. Annual plans are billed yearly.</li>
            <li>Enterprise pricing is customized per college — includes onboarding, integration & SLA.</li>
          </ul>
        </div>

        {/* Small FAQ accordion */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-3">Frequently asked questions</h3>
          <div className="space-y-3">
            {[
              { q: "Do you offer discounts for multiple departments?", a: "Yes — for multi-department rollouts we offer custom pricing and volume discounts. Contact Sales for a quote." },
              { q: "Can we trial before buying?", a: "Yes — we provide a 14-day trial on the Starter plan for new institutions." },
              { q: "How does onboarding work?", a: "Enterprise customers get a dedicated onboarding manager, data migration assistance and a training workshop for faculty and admins." }
            ].map((f, idx) => {
              const open = faqOpen === idx;
              return (
                <div key={idx} className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setFaqOpen(open ? null : idx)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between focus:outline-none"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{f.q}</div>
                    </div>
                    <div className="text-gray-400">{open ? "−" : "+"}</div>
                  </button>
                  <div className={`px-4 pb-4 transition-all duration-300 ${open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`} style={{ overflow: "hidden" }}>
                    <p className="text-sm text-gray-400">{f.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Optional bottom CTA bar */}
      <div className="border-t border-gray-800 py-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-300">Still unsure which plan fits your college?</div>
            <div className="text-xs text-gray-500">Talk to our sales team — we’ll recommend the best fit.</div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/contact" className="inline-block px-4 py-2 rounded-md bg-sky-400 text-gray-900 font-semibold">Request a Demo</a>
            <a href="/features" className="text-sm text-gray-400 hover:text-sky-400">See features</a>
          </div>
        </div>
      </div>
    </div>
  );
}
