import React from 'react';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, HeartHandshake, PhoneCall, Mail, MapPin, Crown, UserCheck, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-14 pb-24 lg:pb-14 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Vision */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xl text-white">College</span>
                <span className="font-extrabold text-xl text-emerald-400">Mitra</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              India's premier deterministic NEET UG medical seat allocation intelligence engine. Empowering MBBS aspirants across AIQ 15%, State 85%, and Deemed quota matrices for 2026–2027.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Official MCC Historical Cutoff Records
            </div>
          </div>

          {/* Quick Links & Tools */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Predictors & Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/college-predictor" className="hover:text-emerald-400 transition-colors">NEET UG College Predictor (2026-27)</Link></li>
              <li><Link href="/counselling" className="hover:text-emerald-400 transition-colors">State & Central Counselling Guide (36+ States)</Link></li>
              <li><Link href="/rank-predictor" className="hover:text-emerald-400 transition-colors">Marks vs Expected AIR Predictor</Link></li>
              <li><Link href="/colleges" className="hover:text-emerald-400 transition-colors">Government & AIIMS Directory</Link></li>
              <li><Link href="/compare" className="hover:text-emerald-400 transition-colors">Side-by-Side College Comparison</Link></li>
              <li><Link href="/pricing" className="hover:text-emerald-400 transition-colors">VIP Choice Filling Packages</Link></li>
            </ul>
          </div>

          {/* Portals & Gateways */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Portals & Gateways</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/student-dashboard" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                  <Crown className="w-3.5 h-3.5" /> Student VIP Dashboard
                </Link>
              </li>
              <li>
                <Link href="/mentor-portal" className="flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                  <UserCheck className="w-3.5 h-3.5" /> Senior Mentor Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="flex items-center gap-2 text-rose-400 hover:text-rose-300 font-semibold transition-colors">
                  <Lock className="w-3.5 h-3.5" /> Master Admin Panel
                </Link>
              </li>
              <li>
                <Link href="/mentors" className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Senior Mentors Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Senior Mentor Helpline */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Senior Mentor Helpline</h4>
            <div className="space-y-3 text-xs">
              <a href="tel:+918544637096" className="flex items-center gap-2 text-emerald-400 font-bold hover:underline">
                <PhoneCall className="w-4 h-4" /> +91 85446 37096 (Direct Line)
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4" /> neet.collegemitra@gmail.com
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4" /> National Medical Counselling Desk, India
              </div>
              <div className="pt-2">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-[11px] text-slate-400">
                  <HeartHandshake className="w-4 h-4 text-amber-400 mb-1" />
                  Senior Mentor Aaditya Ranjan & Team • 2026–27 Dedicated Desk
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026–2027 College Mitra. All rights reserved. Database verified with MCC, DGME & State Gazettes.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/admin" className="hover:text-slate-400">Admin</Link>
            <span>•</span>
            <Link href="/mentor-portal" className="hover:text-slate-400">Mentor</Link>
            <span>•</span>
            <Link href="/student-dashboard" className="hover:text-slate-400">Student Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
