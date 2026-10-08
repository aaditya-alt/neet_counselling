'use client';

import React, { useState } from 'react';
import { PhoneCall, ShieldCheck, UserCheck, X, CheckCircle, Clock } from 'lucide-react';
import { logTelemetry } from '../lib/telemetry';

export const PersistentDialer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    rank: '',
    state: '',
    course: 'MBBS'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logTelemetry('premium_page_viewed', { source: 'dialer_modal', ...formData });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
    }, 3000);
  };

  return (
    <>
      {/* Floating Action Button / Dock */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={() => {
            logTelemetry('premium_page_viewed', { action: 'clicked_call_senior_mentor' });
            setIsOpen(true);
          }}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-emerald-300/40"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <PhoneCall className="w-5 h-5 text-white animate-bounce" />
          <div className="text-left leading-tight hidden sm:block">
            <span className="block text-xs font-semibold uppercase tracking-wider text-emerald-100">Live Support</span>
            <span className="font-bold text-sm">Call Senior Mentor Directly</span>
          </div>
          <span className="sm:hidden font-bold text-sm">Call Mentor</span>
        </button>
      </div>

      {/* Instant Callback & Direct Call Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-navy-950 to-slate-900 p-6 text-white relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" /> Official College Mitra Mentor Panel
              </div>
              <h3 className="text-xl font-bold">1-on-1 Senior Counselling Mentor Hotline</h3>
              <p className="text-xs text-slate-300 mt-1">
                Direct strategic guidance for NEET UG 2026-27 AIQ 15%, State 85%, and Deemed Seats.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-3 animate-pulse" />
                  <h4 className="text-lg font-bold text-slate-900">Priority Request Logged!</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Senior Mentor Aaditya Ranjan is reviewing your profile and will call you in <strong>under 7 minutes</strong>.
                  </p>
                </div>
              ) : (
                <>
                  {/* Direct Dial Banner */}
                  <a
                    href="tel:+918544637096"
                    className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors mb-5 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">Tap to Call Right Now</div>
                        <div className="text-base font-extrabold text-emerald-950">+91 85446 37096</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg group-hover:bg-emerald-700">
                      Direct Call
                    </span>
                  </a>

                  <div className="relative flex items-center justify-center mb-5">
                    <div className="border-t border-slate-200 w-full"></div>
                    <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase">Or Request Instant Callback</span>
                    <div className="border-t border-slate-200 w-full"></div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Student / Parent Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aaditya / Aarav Kumar"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 8544637096"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">NEET AIR Rank (or Score)</label>
                        <input
                          type="text"
                          placeholder="e.g. AIR 14,200 or 625"
                          value={formData.rank}
                          onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Domicile State</label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                        >
                          <option value="">Select State</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Bihar">Bihar</option>
                          <option value="West Bengal">West Bengal</option>
                          <option value="Other">Other State</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Target Course</label>
                        <select
                          value={formData.course}
                          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                        >
                          <option value="MBBS">MBBS (All India / State)</option>
                          <option value="BDS">BDS Dental</option>
                          <option value="BAMS">BAMS / Ayurvedic</option>
                          <option value="BHMS">BHMS Homeopathy</option>
                          <option value="DEEMED">Deemed University Special</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-3 bg-navy-950 hover:bg-navy-900 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Clock className="w-4 h-4 text-emerald-400" />
                      Request Urgent Callback (Avg 7 Mins)
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Trust Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-3 px-6 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Counselling Mentors</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> NEET UG 2026-27 Cutoff Intelligence</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
