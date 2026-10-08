'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  LogIn,
  Copy,
  Check,
  Printer,
  Lock,
  Zap,
  ArrowRight,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { 
  getStudentDeliverableForUser,
  getStudentDeliverables,
  saveStudentDeliverable,
  upgradeStudentToVip,
  getPricingPlans,
  getLiveChatMessages, 
  sendLiveChatMessage, 
  StudentDeliverable, 
  ChatMessage, 
  getFeatureFlags,
  getActiveUserProfile,
  verifyAndLoginUser,
  sendEmailOtp,
  verifyEmailOtp,
  registerStudentAccount,
  logoutActiveUser,
  UserProfile
} from '../../lib/supabase';
import { PricingPlan } from '../../types';
import { logTelemetry } from '../../lib/telemetry';

export default function StudentDashboardPage() {
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp_verify'>('login');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Auth Form Fields
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regScore, setRegScore] = useState<number>(620);
  const [regRank, setRegRank] = useState<number>(14500);
  const [regState, setRegState] = useState('Delhi');
  const [regCategory, setRegCategory] = useState('General (UR)');

  // 6-Digit OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Dashboard Data
  const [deliverable, setDeliverable] = useState<StudentDeliverable | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'choice_list' | 'vip_chat' | 'consultation'>('choice_list');

  // Check saved session on mount
  useEffect(() => {
    async function init() {
      const [plans, user] = await Promise.all([
        getPricingPlans().catch(() => []),
        Promise.resolve(getActiveUserProfile()),
      ]);
      setPricingPlans(plans);

      if (user && user.role === 'student') {
        setActiveUser(user);
        await loadStudentData(user.id);
      } else {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Timer countdown for OTP
  useEffect(() => {
    let interval: any = null;
    if (authMode === 'otp_verify' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, resendTimer]);

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
        const user = getActiveUserProfile();
        const placeholder: StudentDeliverable = {
          id: `del_${studentId}`,
          studentId: studentId,
          studentName: user?.full_name || 'NEET Aspirant',
          phoneNumber: user?.phone_number || '+91 85446 37096',
          score: user?.neet_score || 600,
          rank: user?.air_rank || 12000,
          state: user?.domicile_state || 'All India',
          assignedMentorId: '',
          assignedMentorName: '',
          isPremium: false,
          meetingLink: '',
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

  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');

    if (!regFullName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setAuthError('Please provide your Full Name, Email Address, and Mobile Number.');
      setIsSubmitting(false);
      return;
    }

    // Send OTP to Email via Supabase
    const otpRes = await sendEmailOtp(regEmail);
    if (otpRes.success) {
      setAuthMode('otp_verify');
      setResendTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } else {
      setAuthError(otpRes.error || 'Failed to dispatch verification email. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of full 6-digit code
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      const nextDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        nextDigits[i] = pasted[i] || '';
      }
      setOtpDigits(nextDigits);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = value.replace(/\D/g, '');
    setOtpDigits(nextDigits);

    // Auto-advance
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otpDigits.join('');
    if (token.length < 6) {
      setAuthError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);
    setAuthError('');

    const res = await verifyEmailOtp(regEmail, token, {
      fullName: regFullName,
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
      setAuthError(res.error || 'Invalid OTP code. Please check your email inbox and try again.');
    }
    setIsSubmitting(false);
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsSubmitting(true);
    setAuthError('');
    await sendEmailOtp(regEmail);
    setResendTimer(60);
    setCanResend(false);
    setIsSubmitting(false);
    alert(`A fresh 6-digit verification code was sent to ${regEmail}`);
  };

  const handleUpgradeVip = async () => {
    if (!activeUser) return;
    setIsUpgrading(true);
    await upgradeStudentToVip(activeUser.id);
    
    // Update state
    setActiveUser({ ...activeUser, is_premium: true });
    if (deliverable) {
      setDeliverable({ ...deliverable, isPremium: true });
    }
    setIsUpgrading(false);
    alert('VIP Mentorship Plan Enrolled! Master Admin is reviewing your score to assign your dedicated Senior Mentor.');
  };

  const handleLogout = () => {
    logoutActiveUser();
    setActiveUser(null);
    setDeliverable(null);
    setChatMessages([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeUser || !deliverable?.assignedMentorId) return;

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
      await sendLiveChatMessage(studentId, deliverable.assignedMentorId, 'student', text);
    } catch (err) {
      console.error('Failed to send live message:', err);
    }
  };

  const handleCopyChoiceList = () => {
    if (!deliverable?.choiceList || deliverable.choiceList.length === 0) return;

    const header = `NEET UG 2026–27 CHOICE FILLING PREFERENCE ORDER\nCandidate: ${activeUser?.full_name || 'Candidate'} | Score: ${activeUser?.neet_score || deliverable.score}/720 | AIR: #${activeUser?.air_rank || deliverable.rank}\nSenior Mentor: ${deliverable.assignedMentorName}\n----------------------------------------\n`;
    const rows = deliverable.choiceList.map((item, idx) => 
      `${idx + 1}. ${item.collegeName} [${item.course} - ${item.quota}] - Annual Tuition: Rs ${item.annualFee ? item.annualFee.toLocaleString() : 'N/A'}/yr (${item.state})${item.mentorTip ? `\n   Mentor Note: ${item.mentorTip}` : ''}`
    ).join('\n\n');

    const fullText = header + rows;
    navigator.clipboard.writeText(fullText);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2500);
  };

  const handlePrintOrDownload = () => {
    window.print();
  };

  // -------------------------------------------------------------
  // STATE 1: If user is not signed in -> Render Database Sign In / Register / OTP
  // -------------------------------------------------------------
  if (!activeUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-8 text-white text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              NEET UG 2026–27 Candidate Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto">
              Sign in or register with verified email OTP to manage your medical counselling preferences.
            </p>

            {authMode !== 'otp_verify' && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                    authMode === 'login'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 inline mr-1.5" /> Sign In with Password
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                    authMode === 'register'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 inline mr-1.5" /> Register with Email OTP
                </button>
              </div>
            )}
          </div>

          <div className="p-8">
            {authError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* SCREEN A: Sign In Form */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Registered Email ID or Mobile Number
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
                  <LogIn className="w-4 h-4" /> {isSubmitting ? 'Verifying Credentials...' : 'Sign In to Student Dashboard'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthError(''); }}
                    className="text-xs text-emerald-700 hover:underline font-semibold"
                  >
                    Don't have an account? Register with Email OTP →
                  </button>
                </div>
              </form>
            )}

            {/* SCREEN B: Candidate Registration Details Form */}
            {authMode === 'register' && (
              <form onSubmit={handleInitiateRegister} className="space-y-4 max-w-lg mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Candidate Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number</label>
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

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Official Email Address (OTP will be sent here)</label>
                  <input
                    type="email"
                    required
                    placeholder="candidate@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">NEET Score (out of 720)</label>
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
                  <Mail className="w-4 h-4" /> {isSubmitting ? 'Sending Verification Code...' : 'Send 6-Digit Email OTP & Continue'}
                </button>
              </form>
            )}

            {/* SCREEN C: 6-DIGIT EMAIL OTP VERIFICATION SCREEN */}
            {authMode === 'otp_verify' && (
              <div className="max-w-md mx-auto space-y-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl font-black text-slate-900">
                    Verify Your Email Address
                  </h2>
                  <p className="text-xs text-slate-600">
                    We sent a 6-digit verification code to <span className="font-bold text-slate-900">{regEmail}</span>
                  </p>
                  <button
                    onClick={() => { setAuthMode('register'); setAuthError(''); }}
                    className="text-[11px] text-emerald-700 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Email or Candidate Details
                  </button>
                </div>

                <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
                  {/* 6-Digit Boxes */}
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-12 h-14 text-center font-black text-xl text-slate-900 border-2 border-slate-300 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-slate-50 transition-all shadow-sm"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || otpDigits.join('').length < 6}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> {isSubmitting ? 'Verifying OTP with Supabase...' : 'Verify OTP & Enter Candidate Dashboard'}
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>Didn't receive code?</span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Resend 6-Digit Code
                      </button>
                    ) : (
                      <span className="text-slate-400 font-medium">
                        Resend in <strong className="text-slate-700">{resendTimer}s</strong>
                      </span>
                    )}
                  </div>
                </form>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
              Need instant assistance? Senior Mentor Hotline: <a href="tel:+918544637096" className="text-emerald-700 font-bold hover:underline">+91 85446 37096</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isVip = Boolean(deliverable?.isPremium || activeUser.is_premium);
  const hasAssignedMentor = Boolean(deliverable?.assignedMentorId && deliverable?.assignedMentorName);

  // -------------------------------------------------------------
  // STATE 2: Authenticated Student who has NOT purchased VIP
  // -------------------------------------------------------------
  if (!isVip) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-bold uppercase tracking-wider">
              Free Candidate Account (Verified)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {activeUser.full_name}
            </h1>
            <p className="text-xs text-slate-300">
              NEET Score: <strong>{activeUser.neet_score || 600}/720</strong> • AIR: <strong>#{activeUser.air_rank ? activeUser.air_rank.toLocaleString() : 'N/A'}</strong> • Domicile: <strong>{activeUser.domicile_state}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:+918544637096"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Hotline: +91 85446 37096
            </a>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Locked VIP Upgrade Banner */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white rounded-3xl p-8 border-2 border-amber-300/80 shadow-lg space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase border border-amber-300">
                <Lock className="w-3.5 h-3.5 text-amber-700" /> VIP Counselling Access Locked
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Unlock 1-on-1 Senior Mentor Guidance & Choice Filling
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your email is verified! To unlock your customized deterministic Round 1 Choice Filling Order, 1-on-1 Google Meet strategy calls with Senior Mentor Aaditya Ranjan, and 24/7 dedicated priority desk, upgrade to VIP Mentorship below.
              </p>
            </div>

            <button
              onClick={handleUpgradeVip}
              disabled={isUpgrading}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 self-start md:self-auto flex-shrink-0"
            >
              <Crown className="w-4 h-4 text-slate-950" />
              {isUpgrading ? 'Activating VIP...' : 'Upgrade to VIP Mentorship Now'}
            </button>
          </div>

          {/* Pricing Options Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 border transition flex flex-col justify-between ${
                  plan.is_popular
                    ? 'bg-white border-2 border-amber-500 shadow-xl relative ring-2 ring-amber-400/30'
                    : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{plan.title}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-navy-950">₹{plan.offer_price.toLocaleString()}</span>
                    {plan.base_price > plan.offer_price && (
                      <span className="text-xs text-slate-400 line-through">₹{plan.base_price.toLocaleString()}</span>
                    )}
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    {plan.features.slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handleUpgradeVip}
                  disabled={isUpgrading}
                  className={`w-full py-2.5 mt-6 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${
                    plan.is_popular
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                      : 'bg-navy-950 hover:bg-slate-900 text-white'
                  }`}
                >
                  <span>Select & Enroll VIP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 3: Authenticated VIP Student, Waiting for Admin to Assign Mentor
  // -------------------------------------------------------------
  if (isVip && !hasAssignedMentor) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 w-max">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> VIP Mentorship Active
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {activeUser.full_name}
            </h1>
            <p className="text-xs text-slate-300">
              Score: <strong>{activeUser.neet_score || 600}/720</strong> • AIR: <strong>#{activeUser.air_rank ? activeUser.air_rank.toLocaleString() : 'N/A'}</strong> ({activeUser.domicile_state})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:+918544637096"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Helpline: +91 85446 37096
            </a>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Mentor Allocation in Progress Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto animate-pulse">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Senior Mentor Allocation in Progress
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your VIP plan is active! The Master Administrator is reviewing your AIR <strong>#{activeUser.air_rank?.toLocaleString()}</strong> ({activeUser.domicile_state}) and assigning your dedicated Senior Counselling Mentor within 15–30 minutes.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-xs text-slate-700 space-y-1">
            <div><strong>Assigned Support Desk:</strong> Senior Mentor Aaditya Ranjan & Team</div>
            <div><strong>Urgent Mentor Direct Line:</strong> <a href="tel:+918544637096" className="text-emerald-700 font-bold hover:underline">+91 85446 37096</a></div>
          </div>

          <p className="text-[11px] text-slate-400">
            Once assigned, your 1-on-1 Live Chat, Choice Filling Preference Ladder, and Google Meet Consultation will unlock immediately on this page.
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 4: Full VIP Dashboard (VIP Purchased + Mentor Assigned by Admin)
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
              {deliverable?.assignedMentorName}
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
                {deliverable?.status?.video_call_done ? `Completed with ${deliverable.assignedMentorName}` : 'Scheduled on Google Meet'}
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
                Custom-built by Senior Mentor {deliverable?.assignedMentorName} strictly aligned to your rank, budget, and bond preference.
              </p>
            </div>

            {deliverable?.choiceList && deliverable.choiceList.length > 0 && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleCopyChoiceList}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  {copiedOrder ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" /> Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-300" /> Copy Choice Order
                    </>
                  )}
                </button>
                <button
                  onClick={handlePrintOrDownload}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {(!deliverable?.choiceList || deliverable.choiceList.length === 0) ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Choice Filling List In Progress</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Senior Mentor {deliverable?.assignedMentorName} is currently optimizing your preference list. It will appear here live once published.
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
                  {deliverable?.assignedMentorName}
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
                <p>No chat messages yet. Start your conversation with Senior Mentor {deliverable?.assignedMentorName} below.</p>
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
                        {isMe ? 'You' : deliverable?.assignedMentorName}
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
              Meet directly with Senior Mentor {deliverable?.assignedMentorName}. We screen-share official MCC and state portals, audit private college fee structures, and lock your top choice combinations together.
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
