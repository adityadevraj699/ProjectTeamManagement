import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HiCheck, HiX, HiLightningBolt, HiDatabase, 
  HiChip, HiSupport, HiArrowRight, HiQuestionMarkCircle 
} from "react-icons/hi";

// --- DATA ---
const plans = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For small student teams",
    monthly: 2500,
    annual: 15000,
    features: [
      { name: "Up to 50 users", included: true },
      { name: "Basic project management", included: true },
      { name: "MOM generation (Limited)", included: true },
      { name: "File uploads (5 GB)", included: true },
      { name: "Email support", included: true },
      { name: "Analytics Dashboard", included: false },
    ],
    color: "sky"
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For active departments",
    monthly: 5000,
    annual: 45000,
    popular: true,
    features: [
      { name: "Up to 300 users", included: true },
      { name: "Advanced workflows", included: true },
      { name: "Full MOM + Repository", included: true },
      { name: "File uploads (50 GB)", included: true },
      { name: "Analytics & Exports", included: true },
      { name: "Priority Support", included: true },
    ],
    color: "emerald"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Full college rollout",
    monthly: 0, 
    annual: 0,
    features: [
      { name: "Unlimited users", included: true },
      { name: "Multi-tenant setup", included: true },
      { name: "Custom Branding", included: true },
      { name: "SIS/ERP Integration", included: true },
      { name: "SAML / LDAP Security", included: true },
      { name: "Dedicated Success Manager", included: true },
    ],
    color: "purple"
  },
];

const addons = [
  { id: "storage", title: "Extra Storage", desc: "50GB Block", monthly: 1000, annual: 10000, icon: <HiDatabase/> },
  { id: "ai", title: "AI Analytics", desc: "Advanced Insights", monthly: 3000, annual: 30000, icon: <HiChip/> },
  { id: "priority", title: "24/7 Support", desc: "1hr Response Time", monthly: 5000, annual: 45000, icon: <HiSupport/> },
];

const faqs = [
  { q: "Do you offer discounts for multiple departments?", a: "Yes — for multi-department rollouts we offer custom pricing and volume discounts. Contact Sales for a quote." },
  { q: "Can we trial before buying?", a: "Yes — we provide a 14-day trial on the Starter plan for new institutions so you can test features." },
  { q: "How does onboarding work?", a: "Enterprise customers get a dedicated onboarding manager, data migration assistance and a training workshop for faculty." },
  { q: "Is my data secure?", a: "Absolutely. We use banking-grade encryption (AES-256) and perform regular security audits." }
];

export default function Pricing() {
  const [billing, setBilling] = useState("annual"); // 'monthly' or 'annual'
  const [activeFaq, setActiveFaq] = useState(null);

  const formatPrice = (amount) => {
    if (amount === 0) return "Custom";
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 relative overflow-hidden font-sans selection:bg-sky-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16 space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold text-white tracking-tight"
          >
            Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">Pricing</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Choose the plan that fits your team size. No hidden fees.
          </motion.p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8">
            <div className="bg-slate-800/50 p-1 rounded-xl border border-slate-700 inline-flex relative">
              <button 
                onClick={() => setBilling("monthly")}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all relative z-10 ${billing === "monthly" ? "text-white" : "text-slate-400"}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBilling("annual")}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all relative z-10 ${billing === "annual" ? "text-white" : "text-slate-400"}`}
              >
                Yearly
              </button>
              
              {/* Sliding Background */}
              <motion.div 
                className="absolute top-1 bottom-1 bg-slate-700 rounded-lg shadow-sm"
                initial={false}
                animate={{ 
                  left: billing === "monthly" ? "4px" : "50%", 
                  width: "calc(50% - 4px)" 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
            {billing === "annual" && (
               <motion.span 
                 initial={{ opacity: 0, x: -10 }} 
                 animate={{ opacity: 1, x: 0 }}
                 className="ml-4 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full"
               >
                 Save ~20%
               </motion.span>
            )}
          </div>
        </div>

        {/* --- PRICING CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-start">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-3xl border backdrop-blur-xl flex flex-col h-full ${
                plan.popular 
                  ? "bg-slate-800/60 border-sky-500/50 shadow-2xl shadow-sky-500/10 md:-mt-4 md:mb-4" 
                  : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-sky-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{plan.tagline}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">
                  {formatPrice(billing === "monthly" ? plan.monthly : plan.annual)}
                </span>
                <span className="text-slate-500 text-sm ml-2">
                  {plan.monthly === 0 ? "" : billing === "monthly" ? "/mo" : "/yr"}
                </span>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    {feature.included ? (
                      <HiCheck className={`text-lg shrink-0 ${plan.popular ? "text-emerald-400" : "text-sky-400"}`} />
                    ) : (
                      <HiX className="text-lg shrink-0 text-slate-600" />
                    )}
                    <span className={feature.included ? "text-slate-300" : "text-slate-600"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                plan.popular 
                  ? "bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:shadow-sky-500/25" 
                  : plan.id === 'enterprise' 
                    ? "bg-slate-700 text-white hover:bg-slate-600"
                    : "bg-slate-700 text-white hover:bg-slate-600"
              }`}>
                {plan.monthly === 0 ? "Contact Sales" : "Get Started"}
              </button>

            </motion.div>
          ))}
        </div>

        {/* --- ADD-ONS SECTION --- */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white">Power-Up Add-ons</h2>
            <p className="text-slate-400 text-sm mt-2">Enhance your workspace with extra capabilities.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {addons.map((addon) => (
              <div key={addon.id} className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl flex items-center gap-4 hover:border-slate-600 transition-colors group">
                 <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 text-2xl group-hover:scale-110 transition-transform">
                    {addon.icon}
                 </div>
                 <div className="flex-1">
                    <h4 className="text-white font-bold text-sm">{addon.title}</h4>
                    <p className="text-xs text-slate-500">{addon.desc}</p>
                 </div>
                 <div className="text-right">
                    <div className="text-white font-bold text-sm">
                      {formatPrice(billing === "monthly" ? addon.monthly : addon.annual)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {billing === "monthly" ? "/mo" : "/yr"}
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- FAQ SECTION --- */}
        <div className="max-w-3xl mx-auto mb-20">
           <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
           <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                   <button 
                     onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                     className="w-full flex items-center justify-between p-5 text-left focus:outline-none hover:bg-slate-800/50 transition-colors"
                   >
                      <span className="font-semibold text-slate-200 text-sm">{faq.q}</span>
                      <span className={`text-sky-400 transform transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`}>
                        <HiQuestionMarkCircle className="text-xl" />
                      </span>
                   </button>
                   <AnimatePresence>
                     {activeFaq === idx && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden"
                       >
                          <div className="p-5 pt-0 text-slate-400 text-sm leading-relaxed border-t border-slate-700/30 mt-2">
                            {faq.a}
                          </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              ))}
           </div>
        </div>

      </main>
    </div>
  );
}