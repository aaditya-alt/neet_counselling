'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Check, PhoneCall, ShieldCheck, Zap, UserCheck, Clock, FileText, GraduationCap } from 'lucide-react';
import { getPricingPlans } from '../../lib/supabase';
import { PricingPlan } from '../../types';
import { logTelemetry } from '../../lib/telemetry';

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getPricingPlans();
      setPlans(data);
      setLoading(false);
      logTelemetry('premium_page_viewed', { source: 'pricing_page' });
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> College Mitra VIP Counselling Mentorship
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-navy-950 tracking-tight">
          Personalized Choice Filling & Counselling VIP Plans (2026-27)
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Avoid fatal mistakes like losing ₹2 Lakhs deemed security deposit or getting trapped in strict state service bonds. Connect directly with senior counselling mentors.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => {
          const isFeatured = plan.id === 'pvt_budget' || idx === 1;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                isFeatured
                  ? 'bg-gradient-to-b from-navy-950 to-slate-900 text-white shadow-2xl border-2 border-emerald-400 transform md:-translate-y-2'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-md hover:shadow-xl'
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-navy-950 font-black text-xs uppercase px-4 py-1 rounded-full shadow">
                  Most Popular Choice
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className={`text-xl font-bold ${isFeatured ? 'text-white' : 'text-slate-900'}`}>
                    {plan.title}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-3xl sm:text-4xl font-black">
                      ₹{plan.offer_price.toLocaleString('en-IN')}
                    </span>
                    <span className={`text-sm line-through ${isFeatured ? 'text-slate-400' : 'text-slate-400'}`}>
                      ₹{plan.base_price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {plan.discount_pct}% OFF
                    </span>
                  </div>
                  <div className={`text-xs mt-1 ${isFeatured ? 'text-slate-300' : 'text-slate-500'}`}>
                    One-time fee • Complete Round 1 to Stray Vacancy support
                  </div>
                </div>

                <div className={`border-t ${isFeatured ? 'border-slate-800' : 'border-slate-100'} pt-4`}>
                  <ul className="space-y-3 text-xs">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2.5">
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isFeatured ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={isFeatured ? 'text-slate-200' : 'text-slate-700'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 space-y-3">
                <a
                  href="tel:+918544637096"
                  onClick={() => logTelemetry('premium_page_viewed', { plan_id: plan.id, action: 'call_to_enroll' })}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow ${
                    isFeatured
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-black'
                      : 'bg-navy-900 hover:bg-navy-800 text-white'
                  }`}
                >
                  <PhoneCall className="w-4 h-4" /> Enroll & Call Senior Mentor: +91 85446 37096
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ & Trust Section */}
      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 space-y-6">
        <h3 className="text-xl font-bold text-slate-900 text-center">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900">How is the choice filling order generated?</h4>
            <p>Our senior counselling mentors customize your PDF priority list strictly according to your AIR, state domicile, financial budget, bond preferences, and college clinical exposure.</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900">How do you protect my ₹2,00,000 Deemed security deposit?</h4>
            <p>We advise you precisely when to upgrade and when not to report so you never forfeit the ₹2 Lakh MCC deposit during Round 2 / Round 3 transitions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
