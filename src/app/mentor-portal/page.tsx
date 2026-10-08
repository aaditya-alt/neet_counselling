'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  MessageSquare, 
  Video, 
  FileText, 
  PhoneCall, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  LogOut, 
  Mail, 
  KeyRound, 
  GraduationCap, 
  Send, 
  Clock, 
  Crown,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Search,
  Check,
  Building2,
  ExternalLink,
  Download
} from 'lucide-react';
import { 
  getColleges, 
  getStudentDeliverables, 
  saveStudentDeliverable, 
  StudentDeliverable, 
  ChoiceFillingItem,
  getLiveChatMessages,
  sendLiveChatMessage,
  ChatMessage,
  getFeatureFlags
} from '../../lib/supabase';
import { College } from '../../types';

interface FreeInquiry {
  id: string;
  name: string;
  phone: string;
  question: string;
  time: string;
  replies: string[];
}

export default function MentorPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mentorEmail, setMentorEmail] = useState<string>('');
  const [mentorPassword, setMentorPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [colleges, setColleges] = useState<College[]>([]);
  const [deliverables, setDeliverables] = useState<StudentDeliverable[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentDeliverable | null>(null);
  const [freeChatEnabled, setFreeChatEnabled] = useState<boolean>(true);

  // Active Tab in Workspace
  const [mentorTab, setMentorTab] = useState<'choice_builder' | 'chat' | 'free_inquiries' | 'deliverables'>('choice_builder');

  // Choice Filling Builder State
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('MBBS');
  const [selectedQuota, setSelectedQuota] = useState('AIQ_15');
  const [customTip, setCustomTip] = useState('');
  const [workingChoices, setWorkingChoices] = useState<ChoiceFillingItem[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Free Inquiries State
  const [freeInquiries, setFreeInquiries] = useState<FreeInquiry[]>([
    {
      id: 'inq_1',
      name: 'Sahil Tanwar',
      phone: '+91 98112 34567',
      question: 'With 612 marks in UP state quota, will I get GMC Gorakhpur or GMC Basti in Round 2?',
      time: '15m ago',
      replies: ['GMC Gorakhpur closing was 621 in R1, but GMC Basti is very safe for your rank in R2. Recommend filling Basti right after Ayodhya.'],
    },
    {
      id: 'inq_2',
      name: 'Riya Sen',
      phone: '+91 97321 88990',
      question: 'Is ₹2 Lakh deemed deposit refundable if I do not report to allotted college in Round 2?',
      time: '45m ago',
      replies: ['No! In Round 2 of MCC, if you are allotted a seat and do not report, your ₹2,00,000 security deposit is forfeited! Be extremely cautious.'],
    }
  ]);
  const [freeReplyInput, setFreeReplyInput] = useState<{ [key: string]: string }>({});

  // Video Meeting Link
  const [meetLinkInput, setMeetLinkInput] = useState('');
  const [pdfLinkInput, setPdfLinkInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('cm_mentor_auth');
    if (saved === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const loadMentorWorkspace = async () => {
    try {
      const [colls, dels, flags] = await Promise.all([
        getColleges().catch(() => []),
        getStudentDeliverables().catch(() => []),
        getFeatureFlags().catch(() => ({ peak_mode: false, free_chat_enabled: true })),
      ]);
      setColleges(Array.isArray(colls) ? colls : []);
      setDeliverables(Array.isArray(dels) ? dels : []);
      setFreeChatEnabled(flags.free_chat_enabled && !flags.peak_mode);

      if (Array.isArray(colls) && colls.length > 0) {
        setSelectedCollegeId(colls[0].id);
      }

      if (Array.isArray(dels) && dels.length > 0) {
        const first = dels[0];
        setSelectedStudent(first);
        setWorkingChoices(first.choiceList || []);
        setMeetLinkInput(first.meetingLink || '');
        setPdfLinkInput(first.choicePdfUrl || '');
        const msgs = await getLiveChatMessages(first.studentId).catch(() => []);
        setChatMessages(Array.isArray(msgs) ? msgs : []);
      }
    } catch (err) {
      console.error('Error loading mentor workspace:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadMentorWorkspace();
  }, [isAuthenticated]);

  const handleMentorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const id = mentorEmail.trim().toLowerCase();
    const pass = mentorPassword.trim();

    if ((id === 'mentor@collegemitra.com' || id === 'aaditya@collegemitra.com' || id === 'mentor' || id === 'neet.collegemitra@gmail.com') && 
        (pass === 'Mentor@2026' || pass === 'CollegeMitra@2026' || pass === 'Mentor@NEET2026')) {
      setIsAuthenticated(true);
      localStorage.setItem('cm_mentor_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid Mentor ID or Password. Restricted access.');
    }
  };

  const handleMentorLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cm_mentor_auth');
    setMentorPassword('');
  };

  const handleSelectStudent = async (student: StudentDeliverable) => {
    setSelectedStudent(student);
    setWorkingChoices(student.choiceList || []);
    setMeetLinkInput(student.meetingLink || '');
    setPdfLinkInput(student.choicePdfUrl || '');
    const msgs = await getLiveChatMessages(student.studentId);
    setChatMessages(msgs);
  };

  // Choice Filling Ladder Operations
  const handleAddChoice = (college: College) => {
    const newItem: ChoiceFillingItem = {
      id: `choice_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      collegeId: college.id,
      collegeName: college.name,
      state: college.state,
      course: selectedCourse,
      quota: selectedQuota,
      priorityOrder: workingChoices.length + 1,
      annualFee: college.annual_tuition_fee,
      mentorTip: customTip || `Recommended preference #${workingChoices.length + 1} for ${selectedQuota}`,
    };
    setWorkingChoices([...workingChoices, newItem]);
    setCustomTip('');
  };

  const handleMoveChoice = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === workingChoices.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...workingChoices];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    // Recalculate priority order numbers
    const updated = reordered.map((item, idx) => ({ ...item, priorityOrder: idx + 1 }));
    setWorkingChoices(updated);
  };

  const handleDeleteChoice = (id: string) => {
    const filtered = workingChoices.filter(c => c.id !== id);
    const updated = filtered.map((item, idx) => ({ ...item, priorityOrder: idx + 1 }));
    setWorkingChoices(updated);
  };

  // Publish Choice Filling List to Supabase
  const handlePublishChoiceList = async () => {
    if (!selectedStudent) return;
    setIsPublishing(true);

    const updatedDeliverable: StudentDeliverable = {
      ...selectedStudent,
      choiceList: workingChoices,
      choicePdfUrl: pdfLinkInput || `https://collegemitra.com/docs/choices_${selectedStudent.studentId}_r1.pdf`,
      meetingLink: meetLinkInput || selectedStudent.meetingLink,
      status: {
        ...selectedStudent.status,
        choice_list_sent: workingChoices.length > 0,
      },
      updatedAt: new Date().toISOString(),
    };

    await saveStudentDeliverable(updatedDeliverable);
    setSelectedStudent(updatedDeliverable);
    setDeliverables(prev => prev.map(d => d.id === updatedDeliverable.id ? updatedDeliverable : d));

    setIsPublishing(false);
    alert(`Choice Filling sequence with ${workingChoices.length} colleges published & synced to ${selectedStudent.studentName}'s dashboard!`);
  };

  // Real-time Chat
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedStudent) return;

    const text = chatInput.trim();
    setChatInput('');

    const newMsg = await sendLiveChatMessage(
      selectedStudent.studentId,
      'mentor',
      text
    );

    setChatMessages(prev => [...prev, newMsg]);
  };

  const handleSendFreeReply = (inquiryId: string) => {
    const text = freeReplyInput[inquiryId];
    if (!text || !text.trim()) return;

    setFreeInquiries(prev => prev.map(inq => inq.id === inquiryId ? {
      ...inq,
      replies: [...inq.replies, text.trim()]
    } : inq));

    setFreeReplyInput({ ...freeReplyInput, [inquiryId]: '' });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-navy-950 via-teal-950 to-slate-900 p-8 text-white text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Mentor Access Portal</h2>
            <p className="text-xs text-slate-300 mt-1">
              College Mitra Counselling Desk • NEET UG 2026-27
            </p>
          </div>

          <form onSubmit={handleMentorLogin} className="p-8 space-y-5">
            {authError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Mentor Email / User ID
              </label>
              <input
                type="text"
                required
                placeholder="mentor@collegemitra.com"
                value={mentorEmail}
                onChange={(e) => setMentorEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={mentorPassword}
                onChange={(e) => setMentorPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Sign In to Mentor Workspace
            </button>

            <div className="pt-2 text-center text-[11px] text-slate-400">
              Support: <span className="font-semibold text-slate-600">+91 85446 37096</span> • <span className="font-semibold text-slate-600">neet.collegemitra@gmail.com</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Mentor Header */}
      <div className="bg-gradient-to-r from-navy-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> Senior Counselling Mentor
            </span>
            <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-xs font-mono rounded-md">
              Aaditya Ranjan • Active Live
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Choice Filling Funnel & Student Consultation Hub
          </h1>
          <p className="text-xs text-slate-300">
            Design deterministic choice filling sequences, schedule 1-on-1 Google Meet calls, and guide your assigned students dynamically.
          </p>
        </div>

        <button
          onClick={handleMentorLogout}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <LogOut className="w-4 h-4" /> Mentor Logout
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Assigned Students (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between mb-3">
              <span>Assigned Students ({deliverables.length})</span>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                {deliverables.filter(d => d.isPremium).length} VIP Paid
              </span>
            </h3>

            <div className="space-y-2.5">
              {deliverables.map((st) => {
                const isSelected = selectedStudent?.id === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => handleSelectStudent(st)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-sm">{st.studentName}</div>
                      {st.isPremium && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-600" /> VIP
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Score: <strong>{st.score}/720</strong> • AIR <strong>#{st.rank.toLocaleString()}</strong> ({st.state})
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-emerald-700 font-semibold">{st.choiceList?.length || 0} Choices Stored</span>
                      <a href={`tel:${st.phoneNumber}`} onClick={(e) => e.stopPropagation()} className="text-emerald-700 font-bold hover:underline">
                        Call Student ↗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Workspace Center (8 Cols) */}
        {selectedStudent && (
          <div className="lg:col-span-8 space-y-6">
            {/* Student Overview Pill */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">{selectedStudent.studentName}</h2>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase">
                    Round {selectedStudent.round} Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  AIR #{selectedStudent.rank.toLocaleString()} • Domicile: {selectedStudent.state} • Contact: {selectedStudent.phoneNumber}
                </p>
              </div>

              {/* Workspace Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setMentorTab('choice_builder')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    mentorTab === 'choice_builder' ? 'bg-navy-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Choice Funnel ({workingChoices.length})
                </button>
                <button
                  onClick={() => setMentorTab('chat')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    mentorTab === 'chat' ? 'bg-navy-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> VIP 1-on-1 Chat ({chatMessages.length})
                </button>
                <button
                  onClick={() => setMentorTab('free_inquiries')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    mentorTab === 'free_inquiries' ? 'bg-navy-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Free Inquiries ({freeInquiries.length})
                  {freeChatEnabled ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  ) : (
                    <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">LOCKED</span>
                  )}
                </button>
              </div>
            </div>

            {/* TAB 1: INTERACTIVE CHOICE FILLING BUILDER FUNNEL */}
            {mentorTab === 'choice_builder' && (
              <div className="space-y-6">
                {/* Choice Builder Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Add Colleges to {selectedStudent.studentName}'s Sequence
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">
                      Dropdown / Search • Reorder in priority order
                    </span>
                  </div>

                  {/* College Dropdown & Parameters */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        Select Medical College (Dropdown Selection)
                      </label>
                      <select
                        value={selectedCollegeId}
                        onChange={(e) => setSelectedCollegeId(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        {colleges.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.city}, {c.state}) — Fee: ₹{c.annual_tuition_fee.toLocaleString()}/yr [{c.type.toUpperCase()}]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Quota Category</label>
                        <select
                          value={selectedQuota}
                          onChange={(e) => setSelectedQuota(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                        >
                          <option value="AIQ_15">All India 15% Quota (AIQ)</option>
                          <option value="STATE_85">State 85% Domicile Quota</option>
                          <option value="DEEMED_100">100% Deemed Universities</option>
                          <option value="MANAGEMENT">Management / Private Open Quota</option>
                          <option value="NRI">NRI / Foreign Ward Quota</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Course</label>
                        <select
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                        >
                          <option value="MBBS">MBBS (Medicine & Surgery)</option>
                          <option value="BDS">BDS (Dental Surgery)</option>
                          <option value="BAMS">BAMS (Ayurvedic Medicine)</option>
                          <option value="BHMS">BHMS (Homeopathy)</option>
                        </select>
                      </div>
                    </div>

                    {/* Custom Tip Input */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        Senior Mentor Advice for this College
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Excellent clinical exposure, internal PG quota advantage, ₹0 bond penalty..."
                        value={customTip}
                        onChange={(e) => setCustomTip(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>

                    <button
                      onClick={() => {
                        const targetCollege = colleges.find(c => c.id === selectedCollegeId) || colleges[0];
                        if (targetCollege) {
                          handleAddChoice(targetCollege);
                        }
                      }}
                      className="w-full py-2.5 bg-navy-950 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" /> Add Selected College to Priority Ladder
                    </button>
                  </div>
                </div>

                {/* Live Sequence Ladder View */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-black text-slate-900 text-base">
                      Customized Choice Filling Ladder ({workingChoices.length} Colleges)
                    </h3>
                    <button
                      disabled={isPublishing || workingChoices.length === 0}
                      onClick={handlePublishChoiceList}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Publish & Sync to Student Dashboard
                    </button>
                  </div>

                  {workingChoices.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No colleges added yet. Use the dropdown above to add colleges to this student's choice filling order.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {workingChoices.map((choice, idx) => (
                        <div
                          key={choice.id}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 transition"
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-xl bg-navy-950 text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                              #{choice.priorityOrder}
                            </span>
                            <div>
                              <div className="font-extrabold text-slate-900 text-sm">{choice.collegeName}</div>
                              <div className="text-xs text-slate-500 font-semibold mt-0.5">
                                {choice.course} • {choice.quota} • ₹{choice.annualFee.toLocaleString()}/yr ({choice.state})
                              </div>
                              {choice.mentorTip && (
                                <div className="mt-1.5 text-xs text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded-lg font-medium border border-emerald-200">
                                  💡 <strong>Mentor Strategy:</strong> {choice.mentorTip}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 self-end sm:self-center">
                            <button
                              onClick={() => handleMoveChoice(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveChoice(idx, 'down')}
                              disabled={idx === workingChoices.length - 1}
                              className="p-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteChoice(choice.id)}
                              className="p-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: REAL-TIME VIP CHAT */}
            {mentorTab === 'chat' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[480px]">
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>VIP 1-on-1 Chat with {selectedStudent.studentName}</span>
                  </div>
                  <a href={`tel:${selectedStudent.phoneNumber}`} className="text-emerald-400 hover:underline">
                    Call: {selectedStudent.phoneNumber}
                  </a>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No chat messages yet. Start your conversation below.
                    </div>
                  ) : (
                    chatMessages.map((m) => (
                      <div key={m.id} className={`flex flex-col ${m.senderType === 'mentor' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3.5 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                          m.senderType === 'mentor'
                            ? 'bg-emerald-700 text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                        }`}>
                          {m.message}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 px-1">
                          {m.time || (m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    placeholder={`Type VIP advice to ${selectedStudent.studentName}...`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Send VIP
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: FREE INQUIRIES CHAT (ADMIN CONTROLLED) */}
            {mentorTab === 'free_inquiries' && (
              <div className="space-y-4">
                {!freeChatEnabled ? (
                  <div className="p-6 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 space-y-2">
                    <div className="font-extrabold text-sm flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      Free Chat Locked by Master Admin (Peak Mode Active)
                    </div>
                    <p className="text-xs text-amber-800">
                      The Master Admin has disabled free chat or turned on Peak Counselling Mode. Free users are instructed to call the Senior Mentor Hotline (+91 85446 37096) or upgrade to VIP Mentorship packages.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-950 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        Free User Inquiries Enabled by Admin
                      </div>
                      <span className="text-[11px] text-emerald-800 font-medium">Respond to convert hot leads</span>
                    </div>

                    <div className="space-y-3">
                      {freeInquiries.map((inq) => (
                        <div key={inq.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-extrabold text-slate-900 text-xs">{inq.name}</span>
                              <span className="text-[11px] text-slate-400 ml-2 font-mono">{inq.phone}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{inq.time}</span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 border border-slate-200 font-medium">
                            "{inq.question}"
                          </div>

                          {inq.replies.length > 0 && (
                            <div className="space-y-1.5 pl-3 border-l-2 border-emerald-500 text-xs">
                              {inq.replies.map((rep, rIdx) => (
                                <div key={rIdx} className="text-slate-700 bg-emerald-50/50 p-2 rounded-lg">
                                  <strong className="text-emerald-800">Your Mentor Answer:</strong> {rep}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2">
                            <input
                              type="text"
                              placeholder="Type mentor reply to this student..."
                              value={freeReplyInput[inq.id] || ''}
                              onChange={(e) => setFreeReplyInput({ ...freeReplyInput, [inq.id]: e.target.value })}
                              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                              onClick={() => handleSendFreeReply(inq.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" /> Reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
