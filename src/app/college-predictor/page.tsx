'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Compass, 
  Search, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle, 
  Building2, 
  Filter, 
  Layers, 
  PhoneCall, 
  RefreshCw,
  Info
} from 'lucide-react';
import { getColleges, getCutoffs } from '../../lib/supabase';
import { runCollegePrediction, PredictorFilters } from '../../lib/predictor';
import { College, Cutoff, QuotaType, CourseType, ProbabilityBand } from '../../types';
import { DeemedWarningBadge } from '../../components/DeemedWarningBadge';
import { logTelemetry } from '../../lib/telemetry';

function PredictorContent() {
  const searchParams = useSearchParams();
  const initialRank = Number(searchParams.get('rank')) || 14500;
  const initialScore = Number(searchParams.get('score')) || 620;

  const [colleges, setColleges] = useState<College[]>([]);
  const [cutoffs, setCutoffs] = useState<Cutoff[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [airRank, setAirRank] = useState<number>(initialRank);
  const [category, setCategory] = useState<string>('General');
  const [domicileState, setDomicileState] = useState<string>('ALL');
  const [quota, setQuota] = useState<QuotaType | 'ALL'>('ALL');
  const [course, setCourse] = useState<CourseType | 'ALL'>('MBBS');
  const [selectedRound, setSelectedRound] = useState<number | 0>(0); // 0 = All Rounds
  const [maxBudget, setMaxBudget] = useState<number>(3000000); // 30 Lakhs
  const [probabilityFilter, setProbabilityFilter] = useState<ProbabilityBand | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected for custom choice list export
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [colls, cuts] = await Promise.all([getColleges(), getCutoffs()]);
      setColleges(colls);
      setCutoffs(cuts);
      setLoading(false);
      logTelemetry('predictor_run', { airRank, category, domicileState, quota });
    }
    loadData();
  }, []);

  const handlePredict = () => {
    logTelemetry('predictor_run', { airRank, category, domicileState, quota, maxBudget });
  };

  const results = useMemo(() => {
    if (loading || colleges.length === 0 || cutoffs.length === 0) return [];
    
    let filteredCutoffs = cutoffs;
    if (selectedRound > 0) {
      filteredCutoffs = cutoffs.filter(c => c.round === selectedRound);
    }

    const filters: PredictorFilters = {
      airRank,
      category,
      domicileState: domicileState === 'ALL' ? undefined : domicileState,
      quota: quota,
      course: course,
      maxBudget,
      probability: probabilityFilter,
    };

    let list = runCollegePrediction(colleges, filteredCutoffs, filters);

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(r => 
        r.college.name.toLowerCase().includes(q) ||
        r.college.city.toLowerCase().includes(q) ||
        r.college.state.toLowerCase().includes(q)
      );
    }

    return list;
  }, [colleges, cutoffs, airRank, category, domicileState, quota, course, selectedRound, maxBudget, probabilityFilter, searchTerm, loading]);

  const toggleChoice = (id: string) => {
    if (selectedChoices.includes(id)) {
      setSelectedChoices(selectedChoices.filter(x => x !== id));
    } else {
      setSelectedChoices([...selectedChoices, id]);
    }
  };

  const counts = useMemo(() => {
    const safe = results.filter(r => r.probability === 'safe').length;
    const moderate = results.filter(r => r.probability === 'moderate').length;
    const risky = results.filter(r => r.probability === 'risky').length;
    return { safe, moderate, risky, total: results.length };
  }, [results]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4" /> Official 2024–2025 Prediction Model
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              NEET UG Medical College Predictor
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Friction-free guest access. Enter your All India Rank (AIR) and category to view 100% deterministic allotment probabilities across AIQ 15%, State 85%, and Deemed quotas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:+918882153322"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <PhoneCall className="w-4 h-4" /> Call Senior Mentor
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Control Panel + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filter Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-navy-950 font-bold text-base">
                <Filter className="w-5 h-5 text-emerald-600" />
                Candidate Parameters
              </div>
              <button
                onClick={() => {
                  setAirRank(14500);
                  setCategory('General');
                  setDomicileState('ALL');
                  setQuota('ALL');
                  setCourse('MBBS');
                  setMaxBudget(3000000);
                  setProbabilityFilter('ALL');
                }}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* AIR Rank */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>All India Rank (AIR)</span>
                <span className="text-emerald-700 font-extrabold text-sm">#{airRank.toLocaleString()}</span>
              </label>
              <input
                type="number"
                min="1"
                max="1500000"
                value={airRank}
                onChange={(e) => {
                  setAirRank(Number(e.target.value));
                  handlePredict();
                }}
                className="w-full px-3.5 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="text-[11px] text-slate-400">Enter actual NEET rank or expected AIR</div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Reservation Category</label>
              <div className="grid grid-cols-3 gap-2">
                {['General', 'OBC', 'EWS', 'SC', 'ST'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      category === cat
                        ? 'bg-navy-950 text-white border-navy-950 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Domicile State */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Domicile State (For 85% Quota)</label>
              <select
                value={domicileState}
                onChange={(e) => setDomicileState(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              >
                <option value="ALL">All States (All India Open)</option>
                <option value="Delhi">Delhi (DU / IPU)</option>
                <option value="Karnataka">Karnataka (KEA)</option>
                <option value="Uttar Pradesh">Uttar Pradesh (UP DGME)</option>
                <option value="Maharashtra">Maharashtra (State CET)</option>
                <option value="Tamil Nadu">Tamil Nadu (TN DME)</option>
                <option value="Puducherry">Puducherry</option>
              </select>
            </div>

            {/* Quota Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Counselling Quota</label>
              <select
                value={quota}
                onChange={(e) => setQuota(e.target.value as QuotaType | 'ALL')}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              >
                <option value="ALL">All Quotas (AIQ + State + Deemed)</option>
                <option value="AIQ_15">MCC AIQ 15% (All India Open)</option>
                <option value="STATE_85">State 85% Domicile Quota</option>
                <option value="DEEMED_100">100% Deemed Universities</option>
                <option value="MANAGEMENT">Open State Management Quota</option>
              </select>
            </div>

            {/* Round Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">MCC Allotment Round</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'All', val: 0 },
                  { label: 'R-1', val: 1 },
                  { label: 'R-2', val: 2 },
                  { label: 'R-3', val: 3 },
                ].map((rnd) => (
                  <button
                    key={rnd.val}
                    onClick={() => setSelectedRound(rnd.val)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      selectedRound === rnd.val
                        ? 'bg-navy-950 text-white border-navy-950 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {rnd.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Course */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Medical Course</label>
              <div className="grid grid-cols-3 gap-2">
                {(['MBBS', 'BDS', 'BAMS'] as CourseType[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCourse(c)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      course === c
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Annual Tuition Fee */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Max Annual Tuition Fee</span>
                <span className="text-emerald-700 font-extrabold">
                  {maxBudget >= 3000000 ? 'No Limit (₹30L+)' : `₹${(maxBudget / 100000).toFixed(1)} Lakhs/yr`}
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="3000000"
                step="50000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Right Results Pane (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Probability Band Filter Tabs */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setProbabilityFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  probabilityFilter === 'ALL'
                    ? 'bg-navy-950 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Eligible ({counts.total})
              </button>
              <button
                onClick={() => setProbabilityFilter('safe')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  probabilityFilter === 'safe'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> High Probability ({counts.safe})
              </button>
              <button
                onClick={() => setProbabilityFilter('moderate')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  probabilityFilter === 'moderate'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Borderline R2–3 ({counts.moderate})
              </button>
              <button
                onClick={() => setProbabilityFilter('risky')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  probabilityFilter === 'risky'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Aggressive Stray ({counts.risky})
              </button>
            </div>

            {/* Search filter */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search college / city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Results List */}
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <div className="font-bold text-slate-700">Loading verified cutoffs from MCC database...</div>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No College Matches Found for AIR #{airRank.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try switching the Quota to "100% Deemed Universities" or "All Quotas", or increase your annual tuition budget slider.
              </p>
              <a
                href="tel:+918882153322"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
              >
                <PhoneCall className="w-4 h-4" /> Discuss Options With Senior Doctor
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((res, index) => {
                const { college, cutoff, probability, notes, isDeemedDepositWarning } = res;
                const isSelected = selectedChoices.includes(college.id);

                return (
                  <div
                    key={`${cutoff.id}-${index}`}
                    className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-md ${
                      probability === 'safe'
                        ? 'border-emerald-200/80 hover:border-emerald-400'
                        : probability === 'moderate'
                        ? 'border-amber-200/80 hover:border-amber-400'
                        : 'border-rose-200/80 hover:border-rose-400'
                    }`}
                  >
                    {/* Header: Title + Probability Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {college.type.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                            Quota: {cutoff.quota}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800">
                            Category: {cutoff.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                          {college.name}
                        </h3>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {college.city}, {college.state}
                        </div>
                      </div>

                      {/* Probability Band Indicator */}
                      <div className="flex-shrink-0">
                        {probability === 'safe' && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            High Probability (Safe)
                          </div>
                        )}
                        {probability === 'moderate' && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                            Borderline (Round 2–3)
                          </div>
                        )}
                        {probability === 'risky' && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-extrabold border border-rose-300">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            Aggressive (Stray Vacancy)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Deemed Security Deposit Warning Banner */}
                    {isDeemedDepositWarning && (
                      <div className="my-3">
                        <DeemedWarningBadge amount={college.security_deposit || 200000} />
                      </div>
                    )}

                    {/* Stats Matrix Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Closing Rank</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          AIR #{cutoff.closing_rank.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Round {cutoff.round} (2024)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Annual Tuition</span>
                        <span className="font-extrabold text-emerald-700 text-sm">
                          {college.annual_tuition_fee === 0 ? 'Free / Stipend' : `₹${college.annual_tuition_fee.toLocaleString('en-IN')}`}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Hostel: ₹{college.hostel_fee.toLocaleString('en-IN')}/yr</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hospital Stats</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {college.hospital_bed_count.toLocaleString()} Beds
                        </span>
                        <span className="text-[10px] text-slate-500 block">OPD: {college.average_daily_patient_flow.toLocaleString()}/day</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Service Bond</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {college.bond_duration_years === 0 ? 'No Bond' : `${college.bond_duration_years} Year(s)`}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {college.bond_penalty_amount > 0 ? `Penalty: ₹${(college.bond_penalty_amount / 100000).toFixed(0)}L` : 'Zero Penalty'}
                        </span>
                      </div>
                    </div>

                    {/* Strategic Advice Notes */}
                    <div className="text-xs text-slate-600 bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100 flex items-start gap-2">
                      <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                      <span>{notes}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleChoice(college.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isSelected ? '✓ Added to Choice List' : '+ Add to Choice Order'}
                        </button>
                      </div>

                      <a
                        href="tel:+918882153322"
                        className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Discuss this Seat
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CollegePredictorPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <div className="text-sm font-bold text-slate-600">Loading NEET UG College Predictor...</div>
      </div>
    }>
      <PredictorContent />
    </Suspense>
  );
}
