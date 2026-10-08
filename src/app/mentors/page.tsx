'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ExternalLink,
  Lock,
  UserPlus,
  LogIn,
  AlertTriangle,
  X
} from 'lucide-react';
import { 
  getMentors, 
  getStudentDeliverables, 
  getLiveChatMessages, 
  sendLiveChatMessage, 
  submitFreeInquiry,
  StudentDeliverable, 
  ChatMessage, 
  getFeatureFlags,
  getActiveUserProfile,
  registerStudentAccount,
  UserProfile
} from '../../lib/supabase';
import { Mentor } from '../../types';
import { logTelemetry } from '../../lib/telemetry';

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isPeakMode, setIsPeakMode] = useState(false);
  const [freeChatEnabled, setFreeChatEnabled] = useState(true);

  // Account creation modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalName, setModalName] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalScore, setModalScore] = useState<number>(615);
  const [modalRank, setModalRank] = useState<number>(18500);
  const [modalState, setModalState] = useState('Delhi');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [data, flags] = await Promise.all([
          getMentors().catch(() => []),
          getFeatureFlags().catch(() => ({ peak_mode: false, free_chat_enabled: true })),
        ]);
        setMentors(Array.isArray(data) && data.length > 0 ? data : []);
        setIsPeakMode(Boolean(flags?.peak_mode));
        setFreeChatEnabled(flags?.free_chat_enabled ?? true);

        const user = getActiveUserProfile();
        if (user) {
          setCurrentUser(user);
          const msgs = await getLiveChatMessages(user.id).catch(() => []);
          setChatMessages(Array.isArray(msgs) ? msgs : []);
        }
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

    // Strict account check
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (isPeakMode || !freeChatEnabled) {
      alert('Free chat is currently paused by admin due to peak counselling volume. Please call our Senior Mentor Hotline at +91 85446 37096.');
      return;
    }

    const userText = inputMsg.trim();
    setInputMsg('');

    const studentId = currentUser.id;
    const mentorId = 'a0000000-0000-0000-0000-000000000001';

    // 1. Send live chat message
    const sent = await sendLiveChatMessage(studentId, mentorId, 'student', userText);
    setChatMessages(prev => [...prev, sent]);

    // 2. Also register as a free inquiry in database
    await submitFreeInquiry({
      studentId: currentUser.id,
      name: currentUser.full_name,
      phone: currentUser.phone_number || '+91 85446 37096',
      score: currentUser.neet_score || 600,
      state: currentUser.domicile_state || 'All India',
      question: userText,
    });

    // Simulated mentor acknowledgment
    setTimeout(async () => {
      const replyText = `Hello ${currentUser.full_name}! Senior Mentor Aaditya Ranjan has received your inquiry: "${userText}". Our senior desk will review your score (${currentUser.neet_score || 600}/720) and update your choice ladder in the Student VIP Dashboard.`;
      const reply = await sendLiveChatMessage(studentId, mentorId, 'mentor', replyText);
      setChatMessages(prev => [...prev, reply]);
    }, 1200);
  };

  const handleModalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setAuthError('');

    if (!modalName || !modalEmail || !modalPhone) {
      setAuthError('Please fill in your name, email, and phone number.');
      setIsSubmittingAuth(false);
      return;
    }

    const res = await registerStudentAccount({
      fullName: modalName,
      email: modalEmail,
      phone: modalPhone,
      neetScore: Number(modalScore) || 600,
      airRank: Number(modalRank) || 15000,
      state: modalState,
    });

    if (res.success && res.profile) {
      setCurrentUser(res.profile);
      setShowAuthModal(false);

      if (inputMsg.trim()) {
        const studentId = res.profile.id;
        const sent = await sendLiveChatMessage(studentId, 'a0000000-0000-0000-0000-000000000001', 'student', inputMsg.trim());
        setChatMessages(prev => [...prev, sent]);

        await submitFreeInquiry({
          studentId: res.profile.id,
          name: res.profile.full_name,
          phone: res.profile.phone_number || modalPhone,
          score: res.profile.neet_score,
          state: res.profile.domicile_state,
          question: inputMsg.trim(),
        });

        setInputMsg('');
      }
    } else {
      setAuthError(res.error || 'Failed to create student account. Please try again.');
    }
    setIsSubmittingAuth(false);
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
            <Link
              href="/student-dashboard"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Crown className="w-4 h-4" /> Open VIP Student Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Peak Mode Banner (If peak mode active) */}
      {isPeakMode && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span><strong>Peak Counselling Mode Active:</strong> High volume on live chat. Call Senior Mentor Hotline for priority allocation.</span>
          </div>
          <a
            href="tel:+918544637096"
            className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition"
          >
            Call +91 85446 37096
          </a>
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
                <span>Senior Helpline</span>
                <a href={`tel:${m.phone_number || '+918544637096'}`} className="text-emerald-700 font-bold hover:underline">+91 85446 37096 ↗</a>
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
              <PhoneCall className="w-3.5 h-3.5" /> Helpline: +91 85446 37096
            </a>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {!currentUser ? (
              <div className="text-center py-16 text-slate-500 text-xs space-y-3 max-w-sm mx-auto">
                <Lock className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Create an Account to Access Live Chat</h4>
                <p className="text-[11px] text-slate-500">
                  To ask questions to Senior Mentor Aaditya Ranjan and get choice filling advice, please register or sign in.
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition inline-flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" /> Register Student Account
                </button>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs space-y-1">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p>Start your conversation with Senior Mentor Aaditya Ranjan below.</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'student' || msg.senderType === 'student' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'student' || msg.senderType === 'student'
                        ? 'bg-slate-900 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
                    }`}
                  >
                    {msg.message || msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.time || (msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder={currentUser ? "Ask mentor about your rank, safe colleges, or choice filling..." : "Create an account or sign in to start chatting..."}
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

      {/* Account Creation Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-navy-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm">Register Candidate Profile</h3>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalRegister} className="p-6 space-y-3.5">
              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  {authError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Candidate Name"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 85446 37096"
                    value={modalPhone}
                    onChange={(e) => setModalPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={modalEmail}
                    onChange={(e) => setModalEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">NEET Score</label>
                  <input
                    type="number"
                    required
                    value={modalScore}
                    onChange={(e) => setModalScore(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">AIR Rank</label>
                  <input
                    type="number"
                    required
                    value={modalRank}
                    onChange={(e) => setModalRank(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                  <select
                    value={modalState}
                    onChange={(e) => setModalState(e.target.value)}
                    className="w-full px-2 py-2 text-xs border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    {['Delhi', 'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Bihar', 'West Bengal', 'All India'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg transition mt-3 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> {isSubmittingAuth ? 'Creating Account...' : 'Create Account & Start Chat'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
