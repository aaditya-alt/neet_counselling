'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Award, Building2, GitCompare, Sparkles, Menu, X, PhoneCall, GraduationCap, ShieldCheck, UserCheck, Crown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: 'Student Dashboard', href: '/student-dashboard', icon: Crown, highlight: true, badge: 'VIP' },
    { name: 'College Predictor', href: '/college-predictor', icon: Compass, badge: '2026-27' },
    { name: 'Counselling Guide', href: '/counselling', icon: GraduationCap, badge: '36+ States' },
    { name: 'Rank Predictor', href: '/rank-predictor', icon: Award },
    { name: 'Colleges & Cutoffs', href: '/colleges', icon: Building2 },
    { name: 'Compare', href: '/compare', icon: GitCompare },
    { name: 'VIP Mentorship', href: '/pricing', icon: Sparkles },
    { name: 'Mentor Portal', href: '/mentor-portal', icon: ShieldCheck },
    { name: 'Admin', href: '/admin', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-200">
      {/* Live Announcement Bar */}
      <div className="bg-navy-950 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>NEET UG 2026–2027 Cutoff Predictions & Counselling Guide Live</span>
        <span className="hidden md:inline text-slate-400">|</span>
        <a href="tel:+918544637096" className="hidden md:flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold">
          <PhoneCall className="w-3 h-3" /> Helpline: +91 85446 37096
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">College</span>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Mitra</span>
              </div>
              <div className="text-[10px] tracking-wider uppercase font-semibold text-slate-500">NEET UG 2026-27 Portal</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : link.highlight
                      ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${link.highlight ? 'text-amber-600' : isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {link.name}
                  {link.badge && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full ml-0.5">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="tel:+918544637096"
              className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              +91 85446 37096
            </a>
            <Link
              href="/pricing"
              className="bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> VIP Mentorship
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="xl:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-emerald-600" />
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="tel:+918544637096"
              className="w-full text-center py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" /> Call Senior Mentor: +91 85446 37096
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
