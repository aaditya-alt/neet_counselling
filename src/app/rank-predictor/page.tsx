'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, TrendingUp, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, PhoneCall } from 'lucide-react';
import { predictRankFromScore } from '../../lib/predictor';
import { logTelemetry } from '../../lib/telemetry';

export default function RankPredictorPage() {
  const [score, setScore] = useState<number>(635);
  const prediction = predictRankFromScore(score);

  const handleScoreChange = (val: number) => {
    setScore(val);
    logTelemetry('predictor_run', { type: 'rank_predictor', score: val });
  };

  const benchmarks = [
    { scoreRange: '710 – 720', rankRange: 'AIR 1 – 150', category: 'AIIMS New Delhi, JIPMER Puducherry, MAMC' },
    { scoreRange: '680 – 709', rankRange: 'AIR 151 – 2,500', category: 'Top AIQ Central & State Govt Medical Colleges' },
    { scoreRange: '640 – 679', rankRange: 'AIR 2,501 – 12,000', category: 'Premier State Govt MBBS Seats (Delhi, UP, KEA)' },
    { scoreRange: '600 – 639', rankRange: 'AIR 12,001 – 28,000', category: 'State Govt MBBS / Low-Budget Open State Private' },
    { scoreRange: '520 – 599', rankRange: 'AIR 28,001 – 85,000', category: 'KMC Manipal, HIMSR, Top Deemed & Private BDS/MBBS' },
    { scoreRange: '350 – 519', rankRange: 'AIR 85,001 – 3,50,000', category: 'Deemed Management MBBS, Govt BAMS / BHMS / BVSc' },
    { scoreRange: '160 – 349', rankRange: 'AIR 3,50,001 – 7,50,000', category: 'Deemed MBBS Stray Vacancy, Private BDS & AYUSH' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" /> NEET UG 2024–2025 Mark-to-Rank Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            NEET Score vs Expected All India Rank (AIR)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Calibrated against 24.06 lakh candidate results and official NTA normalization percentiles. Estimate your exact All India Rank and probable college cutoff tier.
          </p>
        </div>
      </div>

      {/* Main Interactive Calculator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Enter Your Expected NEET Marks
            </h2>
            <div className="text-2xl font-black text-emerald-600 bg-emerald-50 px-4 py-1 rounded-xl border border-emerald-200">
              {score} / 720
            </div>
          </div>

          {/* Slider & Input */}
          <div className="space-y-4">
            <input
              type="range"
              min="100"
              max="720"
              step="1"
              value={score}
              onChange={(e) => handleScoreChange(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>100 Marks (Qualifying)</span>
              <span>400 (Deemed/BDS)</span>
              <span>600 (Govt MBBS)</span>
              <span>720 (AIIMS Delhi)</span>
            </div>
          </div>

          {/* Quick Click Badges */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Quick Presets:</label>
            <div className="flex flex-wrap gap-2">
              {[715, 685, 650, 620, 580, 520, 450, 350].map((s) => (
                <button
                  key={s}
                  onClick={() => handleScoreChange(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    score === s
                      ? 'bg-navy-950 text-white border-navy-950 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s} Marks
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prediction Results Box */}
        <div className="lg:col-span-5 bg-gradient-to-br from-navy-900 to-navy-950 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-5">
          <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Real-Time AIR Estimation
          </div>

          <div>
            <div className="text-slate-400 text-xs font-semibold uppercase">Expected All India Rank</div>
            <div className="text-4xl sm:text-5xl font-black text-white mt-1">
              ~AIR {prediction.expectedRank.toLocaleString()}
            </div>
          </div>

          <div className="p-3 bg-white/10 rounded-xl space-y-1 text-xs">
            <div className="text-slate-300">Statistical Rank Window:</div>
            <div className="font-extrabold text-emerald-300 text-sm">
              AIR {prediction.rankRange[0].toLocaleString()} – {prediction.rankRange[1].toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Percentile</span>
              <span className="font-bold text-white text-base">{prediction.percentile}%</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Counselling Tier</span>
              <span className="font-bold text-emerald-400 text-xs">{prediction.tier}</span>
            </div>
          </div>

          <Link
            href={`/college-predictor?rank=${prediction.expectedRank}&score=${score}`}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl shadow transition-all flex items-center justify-center gap-2 text-sm"
          >
            Predict Colleges for AIR {prediction.expectedRank.toLocaleString()}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Historical Marks vs Rank Benchmarks Table */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">NEET Marks vs AIR Historical Matrix (Audited)</h3>
          <p className="text-xs text-slate-500">Official reference table reflecting post-inflation mark cutoffs.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">NEET Score Range</th>
                <th className="py-3 px-4">Expected AIR Range</th>
                <th className="py-3 px-4">Likely College Allotments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchmarks.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-emerald-700">{b.scoreRange}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{b.rankRange}</td>
                  <td className="py-3 px-4 text-slate-600">{b.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
