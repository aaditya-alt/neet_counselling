'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  Bed, 
  Activity, 
  ShieldCheck, 
  ExternalLink,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { getColleges } from '../../lib/supabase';
import { College, CollegeType } from '../../types';
import { DeemedWarningBadge } from '../../components/DeemedWarningBadge';
import { logTelemetry } from '../../lib/telemetry';

export default function CollegesDirectoryPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<CollegeType | 'ALL'>('ALL');
  const [selectedState, setSelectedState] = useState('ALL');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getColleges();
      setColleges(data);
      setLoading(false);
      logTelemetry('college_viewed', { total_colleges: data.length });
    }
    load();
  }, []);

  const filteredColleges = useMemo(() => {
    return colleges.filter(col => {
      if (selectedType !== 'ALL' && col.type !== selectedType) return false;
      if (selectedState !== 'ALL' && col.state !== selectedState) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return col.name.toLowerCase().includes(q) || col.city.toLowerCase().includes(q) || col.state.toLowerCase().includes(q);
      }
      return true;
    });
  }, [colleges, selectedType, selectedState, searchTerm]);

  const uniqueStates = useMemo(() => {
    const states = new Set(colleges.map(c => c.state));
    return Array.from(states).sort();
  }, [colleges]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Directory Header */}
      <div className="bg-gradient-to-r from-navy-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4" /> NMC Recognized Medical Colleges Master
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Medical Colleges & Hospital Clinical Stats
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Verify official hospital bed strength, average daily OPD footfall, annual tuition fees, and compulsory service bond penalty amounts before locking your choices.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search college by name, city, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as CollegeType | 'ALL')}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
            >
              <option value="ALL">All College Types</option>
              <option value="aiims">AIIMS Institutes</option>
              <option value="govt">State Government Medical Colleges</option>
              <option value="central_univ">Central Universities (JIPMER, BHU)</option>
              <option value="deemed">100% Deemed Universities</option>
              <option value="private">Open State Private Colleges</option>
            </select>
          </div>

          {/* State Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
            >
              <option value="ALL">All States ({colleges.length})</option>
              {uniqueStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Badges Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
          <span>Showing <strong>{filteredColleges.length}</strong> medical colleges</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> All Data Audited with MCC Gazettes</span>
        </div>
      </div>

      {/* College Cards Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-sm font-bold text-slate-600">Loading Medical Colleges...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map((col) => (
            <div
              key={col.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all p-6 flex flex-col justify-between space-y-4 relative group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                    col.type === 'aiims' ? 'bg-purple-100 text-purple-800' :
                    col.type === 'govt' ? 'bg-emerald-100 text-emerald-800' :
                    col.type === 'deemed' ? 'bg-amber-100 text-amber-900' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {col.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <MapPin className="w-3.5 h-3.5" /> {col.city}, {col.state}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                  {col.name}
                </h3>

                {col.type === 'deemed' && (
                  <div className="mt-2.5">
                    <DeemedWarningBadge amount={col.security_deposit || 200000} />
                  </div>
                )}

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Annual Tuition</span>
                    <span className="font-black text-emerald-700 text-sm">
                      {col.annual_tuition_fee === 0 ? 'Free' : `₹${col.annual_tuition_fee.toLocaleString('en-IN')}`}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hospital Beds</span>
                    <span className="font-black text-slate-900 text-sm">
                      {col.hospital_bed_count.toLocaleString()} Beds
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Daily OPD Flow</span>
                    <span className="font-semibold text-slate-700">
                      {col.average_daily_patient_flow.toLocaleString()} / day
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Service Bond</span>
                    <span className="font-semibold text-slate-700">
                      {col.bond_duration_years === 0 ? 'No Bond' : `${col.bond_duration_years} yr (${col.bond_penalty_amount > 0 ? `₹${col.bond_penalty_amount / 100000}L` : 'Nil'})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/college-predictor?searchTerm=${encodeURIComponent(col.name)}`}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Predict My Chances
                </Link>

                {col.website_url && (
                  <a
                    href={col.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title="Visit Official Website"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
