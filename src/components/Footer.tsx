import React from 'react';
import Link from 'next/link';
import { Stethoscope, ShieldCheck, HeartHandshake, PhoneCall, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-14 pb-24 lg:pb-14 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Vision */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white">NEET Counsellor</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              India's premier deterministic NEET UG medical seat allocation intelligence engine. Empowering MBBS aspirants across AIQ 15%, State 85%, and Deemed quota matrices.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Official MCC Historical Cutoff Records
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Predictors & Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/college-predictor" className="hover:text-emerald-400 transition-colors">NEET UG College Predictor</Link></li>
              <li><Link href="/counselling" className="hover:text-emerald-400 transition-colors">State & Central Counselling Guide (36+ States)</Link></li>
              <li><Link href="/rank-predictor" className="hover:text-emerald-400 transition-colors">Marks vs Expected AIR Predictor</Link></li>
              <li><Link href="/colleges" className="hover:text-emerald-400 transition-colors">Government & AIIMS Directory</Link></li>
              <li><Link href="/compare" className="hover:text-emerald-400 transition-colors">Side-by-Side College Comparison</Link></li>
              <li><Link href="/pricing" className="hover:text-emerald-400 transition-colors">VIP Choice Filling Packages</Link></li>
            </ul>
          </div>

          {/* Domicile States */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">State Counselling 85%</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/colleges?state=Delhi" className="hover:text-emerald-400 transition-colors">Delhi DU / IPU Counselling</Link></li>
              <li><Link href="/colleges?state=Uttar Pradesh" className="hover:text-emerald-400 transition-colors">UP DGME Medical Seats</Link></li>
              <li><Link href="/colleges?state=Maharashtra" className="hover:text-emerald-400 transition-colors">Maharashtra State CET Cell</Link></li>
              <li><Link href="/colleges?state=Karnataka" className="hover:text-emerald-400 transition-colors">Karnataka KEA Medical Quota</Link></li>
              <li><Link href="/colleges?state=Tamil Nadu" className="hover:text-emerald-400 transition-colors">Tamil Nadu DME Selection</Link></li>
            </ul>
          </div>

          {/* Senior Doctor Helpline */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Urgent Doctor Helpline</h4>
            <div className="space-y-3 text-xs">
              <a href="tel:+918882153322" className="flex items-center gap-2 text-emerald-400 font-bold hover:underline">
                <PhoneCall className="w-4 h-4" /> +91 88821 53322 (Toll Free)
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4" /> counselling@neetcounsellor.in
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4" /> Medical Council Hub, New Delhi, India
              </div>
              <div className="pt-2">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-[11px] text-slate-400">
                  <HeartHandshake className="w-4 h-4 text-amber-400 mb-1" />
                  Over 14,800+ MBBS seats guided in 2024 counselling sessions.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500">
          <p>© 2025–2026 NEET UG Counselling Platform. Built for Indian Medical Aspirants. All data sourced from MCC, DGME, KEA, and NMC official gazettes.</p>
        </div>
      </div>
    </footer>
  );
};
