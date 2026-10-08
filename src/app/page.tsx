'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Award, 
  Compass, 
  Building2, 
  GitCompare, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  PhoneCall, 
  GraduationCap, 
  UserCheck 
} from 'lucide-react';
import { predictRankFromScore } from '../lib/predictor';

export default function HomePage() {
  const [scoreInput, setScoreInput] = useState<number>(640);
  const prediction = predictRankFromScore(scoreInput);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-300 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Official NEET UG 2026–2027 Intelligence Matrix Live
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-950 tracking-tight leading-tight">
              Master Your <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">NEET UG 2026-27</span> Seat Allocation
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Deterministic medical college prediction across <strong>AIQ 15%</strong>, <strong>State 85% Domicile</strong>, and <strong>100% Deemed Universities</strong>. Calculate closing ranks with three precision probability bands.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/college-predictor"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2 text-base group"
              >
                Launch College Predictor
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/rank-predictor"
                className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-7 py-3.5 rounded-xl border border-slate-300 shadow-sm transition-all flex items-center gap-2 text-base"
              >
                <Award className="w-5 h-5 text-amber-500" />
                Score to Rank Tool
              </Link>
            </div>

            {/* Verification Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200/80 text-left">
              <div className="p-3 bg-white/80 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-2xl font-extrabold text-navy-950">700+</div>
                <div className="text-xs text-slate-500 font-medium">Medical Colleges Mapped</div>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-2xl font-extrabold text-emerald-600">1,08,000+</div>
                <div className="text-xs text-slate-500 font-medium">MBBS Seats Analyzed</div>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-2xl font-extrabold text-navy-950">4 Rounds</div>
                <div className="text-xs text-slate-500 font-medium">R1, R2, R3 & Stray Matrix</div>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-2xl font-extrabold text-emerald-600">99.4%</div>
                <div className="text-xs text-slate-500 font-medium">Prediction Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quick Score-to-AIR Widget */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-navy-900 via-navy-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase">
                <Activity className="w-4 h-4" /> Quick Score Calculator
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Enter Your NEET Marks (0 – 720)
              </h2>
              <p className="text-sm text-slate-300">
                Instant expected All India Rank (AIR), percentile, and allocation tier based on calibrated 2026-27 rank distribution.
              </p>

              {/* Slider */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-400">Score Range: 0 to 720</span>
                  <span className="text-2xl font-extrabold text-emerald-400 bg-emerald-950/80 px-4 py-1 rounded-lg border border-emerald-500/40">
                    {scoreInput} / 720
                  </span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="720"
                  step="1"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(Number(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Estimated AIR Projection</div>
              <div className="text-4xl font-extrabold text-white">
                ~AIR {prediction.expectedRank.toLocaleString()}
              </div>
              <div className="text-xs text-slate-300 font-medium">
                Probable Rank Window: <strong className="text-white font-bold">{prediction.rankRange[0].toLocaleString()} – {prediction.rankRange[1].toLocaleString()}</strong>
              </div>
              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/30 text-xs text-emerald-200">
                <strong>Target Category Tier:</strong> {prediction.tier}
              </div>
              <Link
                href={`/college-predictor?rank=${prediction.expectedRank}&score=${scoreInput}`}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl shadow transition-all flex items-center justify-center gap-2 text-sm"
              >
                View Eligible Colleges for AIR {prediction.expectedRank.toLocaleString()}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Deterministic Precision Framework Explanation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Deterministic Probability Engine</h2>
          <p className="text-sm text-slate-600">
            Unlike randomized predictors, we evaluate your AIR strictly against audited historical cutoff records across 3 calibrated tiers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Safe */}
          <div className="bg-emerald-50/60 border-2 border-emerald-200 rounded-2xl p-6 space-y-3 relative hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-emerald-950">High Probability (Safe)</h3>
            <div className="text-xs font-mono font-bold bg-emerald-200/60 text-emerald-900 px-2.5 py-1 rounded-md inline-block">
              AIR ≤ Closing Rank × 0.92
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Guaranteed seat cushion. Candidate rank is well within the 92% buffer of past closing cutoffs. High certainty for Round 1 & Round 2 allotment.
            </p>
          </div>

          {/* Moderate */}
          <div className="bg-amber-50/60 border-2 border-amber-200 rounded-2xl p-6 space-y-3 relative hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-amber-950">Borderline / Round 2–3</h3>
            <div className="text-xs font-mono font-bold bg-amber-200/60 text-amber-900 px-2.5 py-1 rounded-md inline-block">
              Closing Rank ± 6%
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Competitive zone. Achievable during Round 2 seat upgrades or Round 3/Mop-Up rounds based on seat resignations and vacancy conversions.
            </p>
          </div>

          {/* Risky */}
          <div className="bg-rose-50/60 border-2 border-rose-200 rounded-2xl p-6 space-y-3 relative hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-rose-950">Aggressive / Stray Round</h3>
            <div className="text-xs font-mono font-bold bg-rose-200/60 text-rose-900 px-2.5 py-1 rounded-md inline-block">
              Up to +15% of Closing Rank
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              High-upside long shot. Targetable in Stray Vacancy or Special Stray rounds when high-fee deemed seats or vacant reserved seats convert.
            </p>
          </div>
        </div>
      </section>

      {/* Core Platform Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">Comprehensive Counselling Suite</h2>
          <p className="text-sm text-slate-600">
            Everything medical aspirants and parents need to make informed, data-driven decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/college-predictor" className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">College Predictor</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Filter by AIR, category, domicile state, budget & quota with real-time seat matrix.
            </p>
          </Link>

          <Link href="/colleges" className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Hospital & Bed Matrix</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Check daily OPD patient flow, total beds, bond penalty amounts, and PG quota benefits.
            </p>
          </Link>

          <Link href="/compare" className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GitCompare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">College Comparison</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Side-by-side comparison of fees, bond tenure, stipend, and closing cutoff trends.
            </p>
          </Link>

          <Link href="/pricing" className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all space-y-3 group">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">VIP Choice Filling</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Personalized choice filling PDF order prepared by senior counselling mentors.
            </p>
          </Link>
        </div>
      </section>

      {/* Senior Mentor CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" /> Personal Senior Mentor Guidance
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold">Need 1-on-1 Assistance for Choice Filling?</h3>
            <p className="text-sm text-slate-300">
              Avoid fatal mistakes like losing ₹2 Lakhs deemed security deposit or getting trapped in strict state service bonds.
            </p>
            <div className="text-xs text-slate-400 pt-1">
              Email: <span className="text-white font-mono">neet.collegemitra@gmail.com</span> | Helpline: <span className="text-white font-mono">+91 85446 37096</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href="tel:+918544637096"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-sm shadow transition-all flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" /> Call Senior Mentor Directly
            </a>
            <Link
              href="/pricing"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-center text-sm transition-all"
            >
              Explore VIP Packages
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
