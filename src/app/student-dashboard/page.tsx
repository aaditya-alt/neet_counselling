'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Crown, 
  Sparkles, 
  PhoneCall, 
  Video, 
  Download, 
  ExternalLink, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ShieldCheck, 
  GraduationCap, 
  FileText,
  UserCheck,
  AlertCircle,
  Layers
} from 'lucide-react';
import { 
  getStudentDeliverables, 
  getLiveChatMessages, 
  sendLiveChatMessage, 
  StudentDeliverable, 
  ChatMessage, 
  getFeatureFlags,
  getMentors
} from '../../lib/supabase';
import { logTelemetry } from '../../lib/telemetry';

export default function StudentDashboardPage() {
  const [deliverables, setDeliverables] = useState<StudentDeliverable[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentDeliverable | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPeakMode, setIsPeakMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'choice_list' | 'vip_chat' | 'consultation' | 'documents'>('choice_list');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [dels, flags] = await Promise.all([
          getStudentDeliverables().catch(() => []),
          getFeatureFlags().catch(() => ({ peak_mode: false, free_chat_enabled: true })),
        ]);

        if (Array.isArray(dels) && dels.length > 0) {
          setDeliverables(dels);
          const student = dels[0];
          setSelectedStudent(student);
          const msgs = await getLiveChatMessages(student.studentId).catch(() => []);
          setChatMessages(Array.isArray(msgs) ? msgs : []);
        }
        setIsPeakMode(Boolean(flags?.peak_mode));
      } catch (err) {
        console.error('Error loading Student VIP Dashboard:', err);
      } finally {
        setLoading(false);
      }

      try {
        logTelemetry('premium_page_viewed', { section: 'student_dashboard' });
      } catch {}
    }
    load();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !selectedStudent) return;

    const studentId = selectedStudent.studentId;
    const text = inputMsg.trim();
    setInputMsg('');

    // Optimistic UI update
    const tempMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      studentId: studentId,
      senderType: 'student',
      message: text,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, tempMsg]);

    try {
      await sendLiveChatMessage(studentId, 'student', text);
    } catch (err) {
      console.error('Failed to send live message:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* VIP Welcome Header */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> NEET UG 2026–27 VIP Student Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome, {selectedStudent?.studentName || 'VIP Aspirant'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Your personalized Choice Filling Order, 1-on-1 Senior Mentor Live Chat, and Google Meet Consultation are managed here in real-time from Supabase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:+918544637096"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" /> Mentor Hotline: +91 85446 37096
            </a>
            {selectedStudent?.meetingLink && (
              <a
                href={selectedStudent.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-navy-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
              >
                <Video className="w-4 h-4 text-rose-600" /> Join 1-on-1 Meet
              </a>
            )}
          </div>
        </div>

        {/* Student Profile Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">All India Rank</span>
            <span className="font-extrabold text-base text-emerald-400">AIR #{selectedStudent?.rank?.toLocaleString() || '7,200'}</span>
          </div>
          <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">NEET 2026 Score</span>
            <span className="font-extrabold text-base text-white">{selectedStudent?.score || 645} / 720</span>
          </div>
          <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">State Domicile</span>
            <span className="font-extrabold text-base text-teal-300">{selectedStudent?.state || 'Delhi (85% Quota)'}</span>
          </div>
          <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">Assigned Senior Mentor</span>
            <span className="font-extrabold text-base text-amber-300 truncate block">
              {selectedStudent?.assignedMentorName || 'Aaditya Ranjan (AIQ Lead)'}
            </span>
          </div>
        </div>
      </div>

      {/* Deliverable Milestones Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Counselling Deliverables Progress</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            selectedStudent?.status?.choice_list_sent
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              selectedStudent?.status?.choice_list_sent ? 'text-emerald-600' : 'text-slate-400'
            }`} />
            <div>
              <div className="font-bold text-xs">Official Choice Filling Ladder</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {selectedStudent?.status?.choice_list_sent ? 'Published by Senior Mentor' : 'In Preparation'}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            selectedStudent?.status?.video_call_done
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              selectedStudent?.status?.video_call_done ? 'text-emerald-600' : 'text-slate-400'
            }`} />
            <div>
              <div className="font-bold text-xs">1-on-1 Video Strategy Call</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {selectedStudent?.status?.video_call_done ? 'Completed with Aaditya Ranjan' : 'Scheduled on Google Meet'}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            selectedStudent?.status?.seat_allotted
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              selectedStudent?.status?.seat_allotted ? 'text-emerald-600' : 'text-slate-400'
            }`} />
            <div>
              <div className="font-bold text-xs">Seat Allotment & Upgradation</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {selectedStudent?.status?.seat_allotted ? 'Allotted in Round 1 / Round 2' : 'Active Round 1 Bidding'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'choice_list', label: 'Official Choice Filling Order', icon: Layers, badge: selectedStudent?.choiceList?.length || 0 },
          { id: 'vip_chat', label: '1-on-1 Senior Mentor Chat', icon: MessageSquare, badge: chatMessages.length },
          { id: 'consultation', label: 'Video Call & Strategy', icon: Video },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-navy-950 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CHOICE FILLING LADDER */}
      {activeTab === 'choice_list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                Senior Mentor Choice Filling Order (2026–27)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Custom-built by Senior Mentor Aaditya Ranjan strictly aligned to your rank, budget, and bond preference.
              </p>
            </div>

            {selectedStudent?.choicePdfUrl && (
              <a
                href={selectedStudent.choicePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" /> Download Official PDF
              </a>
            )}
          </div>

          <div className="space-y-3">
            {(!selectedStudent?.choiceList || selectedStudent.choiceList.length === 0) ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Choice Filling List Being Formulated</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your Senior Mentor is currently optimizing your preference list. It will appear here live once published.
                </p>
              </div>
            ) : (
              selectedStudent.choiceList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-950 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">{item.collegeName}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-emerald-700">{item.state}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{item.course}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                          {item.quota}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-900">
                          ₹{item.annualFee ? item.annualFee.toLocaleString() : 'N/A'} /yr
                        </span>
                      </div>
                      {item.mentorTip && (
                        <div className="mt-2 text-xs bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl font-medium flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span><strong className="font-bold">Senior Mentor Note:</strong> {item.mentorTip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VIP 1-ON-1 MENTOR CHAT */}
      {activeTab === 'vip_chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy-950 text-emerald-400 font-bold flex items-center justify-center text-sm">
                AR
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs">
                  {selectedStudent?.assignedMentorName || 'Aaditya Ranjan (Senior AIQ Lead)'}
                </h4>
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Dedicated Priority Hotline: +91 85446 37096
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase">
              VIP Unlimited
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs space-y-1">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p>No chat messages yet. Start your conversation with your Senior Mentor below.</p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.senderType === 'student';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-navy-950 text-white rounded-br-none shadow'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <div className="font-bold text-[10px] mb-1 opacity-75">
                        {isMe ? 'You' : 'Senior Mentor Aaditya'}
                      </div>
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.time || (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask your mentor about choice order, deemed deposits, bond rules, or fees..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: VIDEO CONSULTATION & STRATEGY */}
      {activeTab === 'consultation' && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Video className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Personalized 1-on-1 Google Meet Video Consultation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Meet directly with Senior Mentor Aaditya Ranjan. We screen-share official MCC and state portals, audit private college fee structures, and lock your top choice combinations together.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 max-w-xl mx-auto text-center space-y-4">
            <div className="text-xs font-bold text-slate-700">Dedicated Video Call Room:</div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs text-emerald-700 break-all select-all">
              {selectedStudent?.meetingLink || 'https://meet.google.com/neet-vip-live'}
            </div>
            <a
              href={selectedStudent?.meetingLink || 'https://meet.google.com/neet-vip-live'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              <Video className="w-4 h-4" /> Launch Google Meet Strategy Session
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
