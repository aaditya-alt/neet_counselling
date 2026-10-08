'use client';

import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  MessageSquare, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  Video, 
  FileText, 
  Crown, 
  Sparkles, 
  GraduationCap, 
  Layers, 
  Send, 
  Download, 
  ExternalLink 
} from 'lucide-react';
import { 
  getMentors, 
  getStudentDeliverables, 
  getLiveChatMessages, 
  sendLiveChatMessage, 
  StudentDeliverable, 
  ChatMessage, 
  getFeatureFlags 
} from '../../lib/supabase';
import { Mentor } from '../../types';
import { logTelemetry } from '../../lib/telemetry';

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVipMode, setIsVipMode] = useState(false);
  const [deliverable, setDeliverable] = useState<StudentDeliverable | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isPeakMode, setIsPeakMode] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [data, dels, flags] = await Promise.all([
          getMentors().catch(() => []),
          getStudentDeliverables().catch(() => []),
          getFeatureFlags().catch(() => ({ peak_mode: false, free_chat_enabled: true })),
        ]);
        setMentors(Array.isArray(data) && data.length > 0 ? data : []);
        if (Array.isArray(dels) && dels.length > 0) {
          setDeliverable(dels[0]);
          const msgs = await getLiveChatMessages(dels[0].studentId).catch(() => []);
          setChatMessages(Array.isArray(msgs) ? msgs : []);
        }
        setIsPeakMode(Boolean(flags?.peak_mode));
      } catch (err) {
        console.error('Error loading mentors page data:', err);
      } finally {
        setLoading(false);
      }
      try {
        logTelemetry('premium_page_viewed', { section: 'mentors' });
      } catch {}
    }
    load();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setInputMsg('');

    const studentId = deliverable?.studentId || 'st_1';
    const mentorId = deliverable?.assignedMentorId || 'a0000000-0000-0000-0000-000000000001';

    const sent = await sendLiveChatMessage(studentId, mentorId, 'student', userText);
    setChatMessages(prev => [...prev, sent]);

    setTimeout(async () => {
      const replyText = isVipMode
        ? `VIP Mentor Response: I have updated your Round 1 choices based on recent 2026-27 cutoff trends. Check your choice ladder below or join the video call at ${deliverable?.meetingLink || '+91 85446 37096'}.`
        : `Got your score details! Based on 2026-27 cutoffs, we recommend locking your AIQ Round 1 order. Call me directly at +91 85446 37096 to get your full choice filling sequence!`;

      const reply = await sendLiveChatMessage(studentId, mentorId, 'mentor', replyText);
      setChatMessages(prev => [...prev, reply]);
    }, 1200);
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
              <Crown className="w-4 h-4" /> {isVipMode ? 'VIP Deliverables View Active' : 'Switch to VIP Dashboard View'}
            </button>
          </div>
        </div>
      </div>

      {/* Peak Mode Banner (If peak mode active & not VIP) */}
      {isPeakMode && !isVipMode && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span><strong>Peak Counselling Mode Active:</strong> Free mentor chat is currently high-volume. Upgrade to VIP or call our senior hotline for instant assistance.</span>
          </div>
          <a
            href="tel:+918544637096"
            className="px-3.5 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition"
          >
            Call +91 85446 37096
          </a>
        </div>
      )}

      {/* VIP Deliverables Dashboard (Live Synced from Mentor Portal) */}
      {isVipMode && deliverable && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" />
              <div>
                <h2 className="text-lg font-black text-slate-900">Your VIP Deliverables Dashboard</h2>
                <p className="text-xs text-slate-500">Live synced from Mentor: <strong>{deliverable.assignedMentorName}</strong></p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 self-start sm:self-auto">
              Round {deliverable.round} Strategy Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Google Meet Link */}
            <a
              href={deliverable.meetingLink || 'https://meet.google.com/neet-vip-consult'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">1-on-1 Video Consultation</div>
                <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                  Join Google Meet <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </a>

            {/* Choice Filling PDF */}
            <a
              href={deliverable.choicePdfUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Choice Sequence PDF</div>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  Download PDF Order <Download className="w-3 h-3" />
                </div>
              </div>
            </a>

            {/* Direct Mentor Line */}
            <a
              href="tel:+918544637096"
              className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Senior Mentor Direct Line</div>
                <div className="text-[11px] text-rose-700 font-semibold">+91 85446 37096 📞</div>
              </div>
            </a>
          </div>

          {/* Dynamic Choice Filling Ladder View */}
          {deliverable.choiceList && deliverable.choiceList.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Your Customized Priority Choice List ({deliverable.choiceList.length} Colleges)
                </h3>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Locked by {deliverable.assignedMentorName}
                </span>
              </div>

              <div className="space-y-2">
                {deliverable.choiceList.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-navy-950 text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                        #{c.priorityOrder}
                      </span>
                      <div>
                        <div className="font-extrabold text-slate-900">{c.collegeName}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {c.course} • {c.quota} • ₹{c.annualFee.toLocaleString()}/yr ({c.state})
                        </div>
                        {c.mentorTip && (
                          <div className="mt-1 text-[11px] text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-medium">
                            💡 {c.mentorTip}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Mentor Consultation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Mentors Roster */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Senior Mentors Roster (Live Synced)</h3>
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
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'student'
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
