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
  Layers,
  LogOut,
  Mail,
  KeyRound,
  UserPlus,
  LogIn
} from 'lucide-react';
import { 
  getStudentDeliverableForUser,
  getStudentDeliverables,
  saveStudentDeliverable,
  getLiveChatMessages, 
  sendLiveChatMessage, 
  StudentDeliverable, 
  ChatMessage, 
  getFeatureFlags,
  getActiveUserProfile,
  verifyAndLoginUser,
  registerStudentAccount,
  logoutActiveUser,
  UserProfile
} from '../../lib/supabase';
import { logTelemetry } from '../../lib/telemetry';

export default function StudentDashboardPage() {
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth Form Fields
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regScore, setRegScore] = useState<number>(620);
  const [regRank, setRegRank] = useState<number>(14500);
  const [regState, setRegState] = useState('Delhi');
  const [regCategory, setRegCategory] = useState('General (UR)');

  // Dashboard Data
  const [deliverable, setDeliverable] = useState<StudentDeliverable | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'choice_list' | 'vip_chat' | 'consultation'>('choice_list');

  // Check saved session on mount
  useEffect(() => {
    const user = getActiveUserProfile();
    if (user && user.role === 'student') {
      setActiveUser(user);
      loadStudentData(user.id);
    } else {
      setLoading(false);
    }
  }, []);

  const loadStudentData = async (studentId: string) => {
    try {
      setLoading(true);
      const [del, msgs] = await Promise.all([
        getStudentDeliverableForUser(studentId).catch(() => null),
        getLiveChatMessages(studentId).catch(() => []),
      ]);

      if (del) {
        setDeliverable(del);
      } else {
        // Create initial placeholder deliverable if none exists
        const user = getActiveUserProfile();
        const placeholder: StudentDeliverable = {
          id: `del_${studentId}`,
          studentId: studentId,
          studentName: user?.full_name || 'NEET Aspirant',
          phoneNumber: user?.phone_number || '+91 85446 37096',
          score: user?.neet_score || 600,
          rank: user?.air_rank || 12000,
          state: user?.domicile_state || 'All India',
          assignedMentorId: 'a0000000-0000-0000-0000-000000000001',
          assignedMentorName: 'Aaditya Ranjan (Senior AIQ Lead)',
          isPremium: true,
          meetingLink: 'https://meet.google.com/neet-vip-live',
          choicePdfUrl: '',
          choiceList: [],
          status: {
            choice_list_sent: false,
            video_call_done: false,
            seat_allotted: false,
          },
          round: 1,
          updatedAt: new Date().toISOString(),
        };
        setDeliverable(placeholder);
      }

      setChatMessages(Array.isArray(msgs) ? msgs : []);
    } catch (err) {
      console.error('Error loading student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');

    const res = await verifyAndLoginUser(loginEmailOrPhone, loginPassword, 'student');
    if (res.success && res.profile) {
      setActiveUser(res.profile);
      await loadStudentData(res.profile.id);
    } else {
      setAuthError(res.error || 'Invalid credentials. Please register or verify details.');
    }
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');

    if (!regFullName || !regEmail || !regPhone) {
      setAuthError('Please fill in your name, email, and phone number.');
      setIsSubmitting(false);
      return;
    }

    const res = await registerStudentAccount({
      fullName: regFullName,
      email: regEmail,
      password: regPassword || 'NeetStudent@2026',
      phone: regPhone,
      neetScore: Number(regScore) || 600,
      airRank: Number(regRank) || 12000,
      state: regState,
      category: regCategory,
    });

    if (res.success && res.profile) {
      setActiveUser(res.profile);
      await loadStudentData(res.profile.id);
    } else {
      setAuthError(res.error || 'Failed to create student account. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleLogout = () => {
    logoutActiveUser();
    setActiveUser(null);
    setDeliverable(null);
    setChatMessages([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeUser) return;

    const studentId = activeUser.id;
    const text = inputMsg.trim();
    setInputMsg('');

    // Optimistic UI update
    const tempMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      studentId: studentId,
      senderType: 'student',
      message: text,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, tempMsg]);

    try {
      await sendLiveChatMessage(studentId, 'student', text);
    } catch (err) {
      console.error('Failed to send live message:', err);
    }
  };

  // -------------------------------------------------------------
  // If user is not signed in -> Render Database Sign In / Register
  // -------------------------------------------------------------
  if (!activeUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-8 text-white text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              NEET UG 2026–27 Student Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto">
              Access your personalized Choice Filling sequence, 1-on-1 Senior Mentor Live Chat, and Google Meet strategy calls.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                  authMode === 'login'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 inline mr-1.5" /> Sign In to Account
              </button>
              <button
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                  authMode === 'register'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 inline mr-1.5" /> New Student Registration
              </button>
            </div>
          </div>

          <div className="p-8">
            {authError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email ID or Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. student@gmail.com or 8544637096"
                    value={loginEmailOrPhone}
                    onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                    className="w-full px-4 py-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> {isSubmitting ? 'Verifying Account...' : 'Sign In to Student Dashboard'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 max-w-lg mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Candidate's Full Name"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 85446 37096"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Create Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">NEET Score (Out of 720)</label>
                    <input
                      type="number"
                      min={100}
                      max={720}
                      required
                      value={regScore}
                      onChange={(e) => setRegScore(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">All India Rank (AIR)</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={regRank}
                      onChange={(e) => setRegRank(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Domicile State</label>
                    <select
                      value={regState}
                      onChange={(e) => setRegState(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold bg-white"
                    >
                      {['Delhi', 'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Bihar', 'West Bengal', 'Kerala', 'Madhya Pradesh', 'Gujarat', 'All India'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2 mt-4"
                >
                  <UserPlus className="w-4 h-4" /> {isSubmitting ? 'Creating Profile...' : 'Register & Enter Student Dashboard'}
                </button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
              Need immediate assistance? Call Senior Mentor Hotline: <a href="tel:+918544637096" className="text-emerald-700 font-bold hover:underline">+91 85446 37096</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Logged-in Student VIP Dashboard View (Live Database Synced)
  // -------------------------------------------------------------
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
              Welcome, {activeUser.full_name}
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
            {deliverable?.meetingLink && (
              <a
                href={deliverable.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-navy-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
              >
                <Video className="w-4 h-4 text-rose-600" /> Join 1-on-1 Meet
              </a>
            )}
            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Student Profile Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">All India Rank</span>
            <span className="font-extrabold text-base text-emerald-400">
              AIR #{activeUser.air_rank ? activeUser.air_rank.toLocaleString() : (deliverable?.rank.toLocaleString() || '14,500')}
            </span>
          </div>
          <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">NEET 2026 Score</span>
            <span className="font-extrabold text-base text-white">
              {activeUser.neet_score || deliverable?.score || 620} / 720
            </span>
          </div>
          <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">State Domicile</span>
            <span className="font-extrabold text-base text-teal-300">
              {activeUser.domicile_state || deliverable?.state || 'Delhi (85% Quota)'}
            </span>
          </div>
          <div className="bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">Assigned Senior Mentor</span>
            <span className="font-extrabold text-base text-amber-300 truncate block">
              {deliverable?.assignedMentorName || 'Aaditya Ranjan (AIQ Lead)'}
            </span>
          </div>
        </div>
      </div>

      {/* Deliverable Milestones Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Counselling Deliverables Progress</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            deliverable?.status?.choice_list_sent
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              deliverable?.status?.choice_list_sent ? 'text-emerald-600' : 'text-slate-400'
            }`} />
            <div>
              <div className="font-bold text-xs">Official Choice Filling Ladder</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {deliverable?.status?.choice_list_sent ? 'Published by Senior Mentor' : 'In Preparation by Senior Mentor'}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            deliverable?.status?.video_call_done
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              deliverable?.status?.video_call_done ? 'text-emerald-600' : 'text-slate-400'
            }`} />
            <div>
              <div className="font-bold text-xs">1-on-1 Video Strategy Call</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {deliverable?.status?.video_call_done ? 'Completed with Aaditya Ranjan' : 'Scheduled on Google Meet'}
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            deliverable?.status?.seat_allotted
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              deliverable?.status?.seat_allotted ? 'text-emerald-600' : 'text-slate-400'
            }`} />
            <div>
              <div className="font-bold text-xs">Seat Allotment & Upgradation</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {deliverable?.status?.seat_allotted ? 'Allotted in Round 1 / Round 2' : 'Active Round 1 Bidding'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'choice_list', label: 'Official Choice Filling Order', icon: Layers, badge: deliverable?.choiceList?.length || 0 },
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

            {deliverable?.choicePdfUrl && (
              <a
                href={deliverable.choicePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" /> Download Official PDF
              </a>
            )}
          </div>

          <div className="space-y-3">
            {(!deliverable?.choiceList || deliverable.choiceList.length === 0) ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Choice Filling List In Progress</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Senior Mentor Aaditya Ranjan is currently optimizing your preference list. It will appear here live once published from the Mentor Portal.
                </p>
              </div>
            ) : (
              deliverable.choiceList.map((item, idx) => (
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
                  {deliverable?.assignedMentorName || 'Aaditya Ranjan (Senior AIQ Lead)'}
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
                const isMe = msg.senderType === 'student' || msg.sender === 'student';
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
                      {msg.message || msg.text}
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
              {deliverable?.meetingLink || 'https://meet.google.com/neet-vip-live'}
            </div>
            <a
              href={deliverable?.meetingLink || 'https://meet.google.com/neet-vip-live'}
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
