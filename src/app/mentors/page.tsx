'use client';

import React, { useState, useEffect } from 'react';
import { PhoneCall, MessageSquare, Clock, UserCheck, CheckCircle2, Video, FileText, Crown, Sparkles, GraduationCap } from 'lucide-react';
import { getMentors } from '../../lib/supabase';
import { Mentor } from '../../types';
import { logTelemetry } from '../../lib/telemetry';

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVipMode, setIsVipMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'mentor'; text: string; time: string }[]>([
    { sender: 'mentor', text: 'Hello NEET Aspirant! I am Aaditya Ranjan, Senior Counselling Mentor at College Mitra. Share your NEET score, AIR rank, and domicile state to get your strategic Round 1 choice filling guidance.', time: 'Just now' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getMentors();
      setMentors(data);
      setLoading(false);
      logTelemetry('premium_page_viewed', { section: 'mentors' });
    }
    load();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: userText, time }]);
    setInputMsg('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'mentor',
          text: isVipMode
            ? `VIP Mentor Response: We have mapped your priority order against official MCC AIQ 2026-27 cutoffs. You can access your 1-on-1 video call link below or reach out directly at +91 85446 37096.`
            : `Based on 2026-27 closing cutoffs, you have strong possibilities! To lock your custom choice filling order and schedule a 1-on-1 Google Meet session with me, tap "Call Senior Mentor" (+91 85446 37096) or upgrade to VIP!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" /> College Mitra Senior Mentors
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Consult Senior Counselling Mentors Directly
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Get your choice filling sequence audited by veteran admission strategists and counselling specialists for NEET UG 2026-27 (AIQ 15%, State 85%, and Deemed 100%).
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setIsVipMode(!isVipMode)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition ${
                isVipMode
                  ? 'bg-amber-500 text-white border-amber-400 shadow-lg'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <Crown className="w-4 h-4" /> {isVipMode ? 'VIP Mentorship View Active' : 'Switch to VIP View'}
            </button>
          </div>
        </div>
      </div>

      {/* VIP Deliverables Card (If VIP mode is active) */}
      {isVipMode && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Your VIP Deliverables Dashboard</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
              Assigned: Aaditya Ranjan (Senior AIQ Lead)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <a
              href="https://meet.google.com/xyz-neet-consult"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">1-on-1 Video Consultation</div>
                <div className="text-[11px] text-amber-700 font-semibold">Join Google Meet 🎥</div>
              </div>
            </a>

            <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Choice Filling Sequence</div>
                <div className="text-[11px] text-emerald-700 font-semibold">PDF Download Ready 📄</div>
              </div>
            </div>

            <a
              href="tel:+918544637096"
              className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Direct Senior Mentor Line</div>
                <div className="text-[11px] text-rose-700 font-semibold">+91 85446 37096 📞</div>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Main Mentor Chat Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Mentors Roster */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Senior Mentors Roster</h3>
          {mentors.map((m) => (
            <div key={m.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">{m.full_name}</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-xs text-emerald-700 font-medium">{m.specialization}</p>
              <div className="text-[11px] text-slate-500 flex justify-between pt-2 border-t border-slate-100">
                <span>Active Students: {m.assigned_count}/{m.max_capacity}</span>
                <a href={`tel:${m.phone_number || '+918544637096'}`} className="text-emerald-700 font-bold hover:underline">Direct Call ↗</a>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Live Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">Aaditya Ranjan (Senior AIQ Lead)</div>
                <div className="text-[10px] text-emerald-400">Senior Counselling Mentor • Online</div>
              </div>
            </div>
            <a
              href="tel:+918544637096"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call Mentor: +91 85446 37096
            </a>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder="Ask mentor about your rank, safe colleges, or choice filling..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
