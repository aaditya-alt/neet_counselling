'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ALL_INDIA_COUNSELLING_AUTHORITIES, CounsellingAuthority } from '@/lib/counsellingData';

export default function CounsellingGuidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [openStateOnly, setOpenStateOnly] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState<CounsellingAuthority | null>(null);

  const filteredAuthorities = useMemo(() => {
    return ALL_INDIA_COUNSELLING_AUTHORITIES.filter((item) => {
      const matchesSearch =
        item.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.short_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.courses.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        selectedType === 'all' ? true : item.type === selectedType;

      const matchesOpen = openStateOnly ? item.is_open_state : true;

      return matchesSearch && matchesType && matchesOpen;
    });
  }, [searchQuery, selectedType, openStateOnly]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Official Portals & Procedure Matrix 2026
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            NEET UG State & Central Counselling Directory
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            Direct access to all 36+ state and central counselling authorities, official registration portals, security deposit structures, domicile eligibility rules, service bond terms, and step-by-step allotment procedures.
          </p>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-700/60">
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
              <div className="text-2xl font-bold text-emerald-400">100%</div>
              <div className="text-xs text-slate-300">Verified Official Portals</div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
              <div className="text-2xl font-bold text-teal-400">36+</div>
              <div className="text-xs text-slate-300">States & Central Bodies</div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
              <div className="text-2xl font-bold text-amber-400">₹0 - ₹2L</div>
              <div className="text-xs text-slate-300">Security Deposit Guide</div>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
              <div className="text-2xl font-bold text-rose-400">MBBS/BDS/AYUSH</div>
              <div className="text-xs text-slate-300">Multi-Course Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-1/2">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search state (e.g. Uttar Pradesh, Delhi, Karnataka, AYUSH)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-slate-50/50"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedType === 'all'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Authorities
              </button>
              <button
                onClick={() => setSelectedType('central')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedType === 'central'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                MCC / Central
              </button>
              <button
                onClick={() => setSelectedType('state')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedType === 'state'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                State 85%
              </button>
              <button
                onClick={() => setSelectedType('ayush')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedType === 'ayush'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                AYUSH / AACCC
              </button>
              <button
                onClick={() => setOpenStateOnly(!openStateOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  openStateOnly
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                }`}
              >
                🌟 Open Private States Only
              </button>
            </div>
          </div>
        </div>

        {/* Authorities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthorities.map((auth) => (
            <div
              key={auth.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    {auth.state}
                  </span>
                  {auth.is_open_state && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                      Open State
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                  {auth.name}
                </h3>
                <p className="text-xs font-semibold text-emerald-700 mt-1">
                  {auth.short_code}
                </p>

                <div className="flex flex-wrap gap-1.5 my-3">
                  {auth.courses.map((course) => (
                    <span
                      key={course}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {course}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                  {auth.quota_handled}
                </p>

                {/* Key Metrics Matrix */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reg. Fee (Gen/Res):</span>
                    <span className="font-semibold text-slate-800">
                      ₹{auth.registration_fee.general.toLocaleString()} / ₹{auth.registration_fee.reserved.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Deposit (Govt):</span>
                    <span className="font-semibold text-slate-800">
                      ₹{auth.security_deposit.govt.toLocaleString()}
                    </span>
                  </div>
                  {auth.security_deposit.private > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Security Deposit (Private):</span>
                      <span className="font-semibold text-amber-700">
                        ₹{auth.security_deposit.private.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {auth.security_deposit.deemed && auth.security_deposit.deemed > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Security Deposit (Deemed):</span>
                      <span className="font-bold text-rose-600">
                        ₹{auth.security_deposit.deemed.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedAuthority(auth)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition text-center"
                >
                  View Details & Procedure
                </button>
                <a
                  href={auth.registration_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition inline-flex items-center gap-1"
                >
                  Apply <span>↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredAuthorities.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">
              No counselling authorities match your search query. Try broadening your keywords.
            </p>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {selectedAuthority && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white sticky top-0 z-10 flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  {selectedAuthority.state} • {selectedAuthority.short_code}
                </span>
                <h2 className="text-xl font-bold mt-2">{selectedAuthority.name}</h2>
              </div>
              <button
                onClick={() => setSelectedAuthority(null)}
                className="text-slate-400 hover:text-white text-2xl font-bold leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-sm text-slate-800">
              {/* Quick Links & Open State */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div>
                  <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Official Portal</div>
                  <a
                    href={selectedAuthority.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 underline font-semibold text-sm hover:text-emerald-900"
                  >
                    {selectedAuthority.official_website}
                  </a>
                </div>
                <a
                  href={selectedAuthority.registration_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-sm"
                >
                  Direct Registration Link ↗
                </a>
              </div>

              {/* Domicile Rules */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Domicile & Eligibility Criteria</h4>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedAuthority.domicile_rules}
                </p>
              </div>

              {/* Service Bond Policy */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Compulsory Service Bond & Penalty</h4>
                <p className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 text-rose-950 leading-relaxed">
                  {selectedAuthority.bond_summary}
                </p>
              </div>

              {/* Step-by-Step Procedure */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Step-by-Step Allotment Procedure</h4>
                <div className="space-y-2">
                  {selectedAuthority.procedure_steps.map((step, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mandatory Documents Checklist</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedAuthority.documents_required.map((doc, idx) => (
                    <li key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                      <span className="text-emerald-600">✓</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Important Notes */}
              {selectedAuthority.important_notes.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">Important Guidelines</h4>
                  <ul className="space-y-1 text-xs text-amber-900">
                    {selectedAuthority.important_notes.map((note, idx) => (
                      <li key={idx}>• {note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <Link
                href="/college-predictor"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Predict chances for {selectedAuthority.short_code} →
              </Link>
              <button
                onClick={() => setSelectedAuthority(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
