'use client';

import React, { useState, useEffect } from 'react';
import { GitCompare, Plus, Trash2, ShieldCheck, Bed, DollarSign, Award, CheckCircle } from 'lucide-react';
import { getColleges } from '../../lib/supabase';
import { College } from '../../types';
import { DeemedWarningBadge } from '../../components/DeemedWarningBadge';
import { logTelemetry } from '../../lib/telemetry';

export default function CompareCollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'b0000000-0000-0000-0000-000000000001', // AIIMS Delhi
    'b0000000-0000-0000-0000-000000000002', // MAMC Delhi
    'b0000000-0000-0000-0000-000000000005', // KMC Manipal
  ]);

  useEffect(() => {
    async function load() {
      const data = await getColleges();
      setColleges(data);
      logTelemetry('college_compared', { count: selectedIds.length });
    }
    load();
  }, []);

  const addCollege = (id: string) => {
    if (selectedIds.length < 4 && !selectedIds.includes(id)) {
      const updated = [...selectedIds, id];
      setSelectedIds(updated);
      logTelemetry('college_compared', { count: updated.length });
    }
  };

  const removeCollege = (id: string) => {
    setSelectedIds(selectedIds.filter(x => x !== id));
  };

  const selectedColleges = colleges.filter(c => selectedIds.includes(c.id));
  const availableColleges = colleges.filter(c => !selectedIds.includes(c.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <GitCompare className="w-4 h-4" /> Multi-College Comparative Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Side-by-Side Medical College Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Compare annual fees, hostel expenses, hospital bed capacity, daily clinical patient footfall, bond duration, and PG internal quota across up to 4 medical colleges.
          </p>
        </div>
      </div>

      {/* College Selector Ribbon */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-600 font-semibold">
          Comparing <strong>{selectedColleges.length} of 4</strong> colleges
        </div>

        {selectedIds.length < 4 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Add College:</span>
            <select
              onChange={(e) => {
                if (e.target.value) addCollege(e.target.value);
                e.target.value = '';
              }}
              className="text-xs font-bold px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
            >
              <option value="">Select a college to compare...</option>
              {availableColleges.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.city}, {c.state})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-5 text-slate-500 font-bold uppercase text-[11px] w-48 min-w-[180px]">
                  Comparison Metric
                </th>
                {selectedColleges.map(col => (
                  <th key={col.id} className="py-4 px-5 min-w-[240px] align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                          {col.type.toUpperCase()}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1 leading-snug">{col.name}</h4>
                        <div className="text-[11px] text-slate-500 font-normal">{col.city}, {col.state}</div>
                      </div>
                      <button
                        onClick={() => removeCollege(col.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {/* Deemed Notice */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-bold text-slate-900 bg-slate-50/50">Mandatory Security Deposit</td>
                {selectedColleges.map(col => (
                  <td key={col.id} className="py-3 px-5">
                    {col.security_deposit >= 200000 ? (
                      <DeemedWarningBadge amount={col.security_deposit} />
                    ) : (
                      <span className="text-emerald-700 font-bold">₹{col.security_deposit.toLocaleString('en-IN')} (Standard)</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Annual Tuition */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-bold text-slate-900 bg-slate-50/50">Annual Tuition Fee</td>
                {selectedColleges.map(col => (
                  <td key={col.id} className="py-3 px-5 font-extrabold text-sm text-emerald-700">
                    {col.annual_tuition_fee === 0 ? 'Free / Central Govt Funded' : `₹${col.annual_tuition_fee.toLocaleString('en-IN')} / year`}
                  </td>
                ))}
              </tr>

              {/* Hostel Fee */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-bold text-slate-900 bg-slate-50/50">Annual Hostel & Mess</td>
                {selectedColleges.map(col => (
                  <td key={col.id} className="py-3 px-5">
                    ₹{col.hostel_fee.toLocaleString('en-IN')} / year
                  </td>
                ))}
              </tr>

              {/* Total MBBS Seats */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-bold text-slate-900 bg-slate-50/50">Total MBBS Seats</td>
                {selectedColleges.map(col => (
                  <td key={col.id} className="py-3 px-5 font-bold text-slate-900">
                    {col.total_mbbs_seats} Seats
                  </td>
                ))}
              </tr>

              {/* Hospital Beds */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-bold text-slate-900 bg-slate-50/50">Hospital Bed Capacity</td>
                {selectedColleges.map(col => (
                  <td key={col.id} className="py-3 px-5 font-bold text-slate-900">
                    {col.hospital_bed_count.toLocaleString()} Operational Beds
                  </td>
                ))}
              </tr>

              {/* Daily OPD Footfall */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-bold text-slate-900 bg-slate-50/50">Daily OPD Patient Flow</td>
                {selectedColleges.map(col => (
                  <td key={col.id} className="py-3 px-5 font-bold text-indigo-700">
                    ~{col.average_daily_patient_flow.toLocaleString()} patients / day
                  </td>
                ))}
              </tr>

              {/* Service Bond Duration */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-bold text-slate-900 bg-slate-50/50">Compulsory Service Bond</td>
                {selectedColleges.map(col => (
                  <td key={col.id} className="py-3 px-5">
                    {col.bond_duration_years === 0 ? (
                      <span className="text-emerald-700 font-bold">Zero Bond Tenure</span>
                    ) : (
                      <span className="text-amber-800 font-bold">{col.bond_duration_years} Year(s) Mandatory</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Bond Penalty Amount */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-bold text-slate-900 bg-slate-50/50">Bond Penalty Forfeiture</td>
                {selectedColleges.map(col => (
                  <td key={col.id} className="py-3 px-5">
                    {col.bond_penalty_amount === 0 ? (
                      <span className="text-emerald-700 font-bold">₹0 (No Penalty)</span>
                    ) : (
                      <span className="text-rose-700 font-extrabold">₹{(col.bond_penalty_amount / 100000).toFixed(1)} Lakhs</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Internal PG Quota */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-5 font-bold text-slate-900 bg-slate-50/50">Internal 50% PG Quota</td>
                {selectedColleges.map(col => (
                  <td key={col.id} className="py-3 px-5">
                    {col.pg_quota_available ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> Yes (Institutional PG Benefit)
                      </span>
                    ) : (
                      <span className="text-slate-400">No Internal PG Quota</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
