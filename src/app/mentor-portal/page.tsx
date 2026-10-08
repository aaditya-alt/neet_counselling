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
  Sparkles
} from 'lucide-react';
import { getMentors } from '../../lib/supabase';
import { Mentor } from '../../types';

interface MentorStudent {
  id: string;
  name: string;
  phone: string;
  score: number;
  rank: number;
  state: string;
  is_premium: boolean;
  meeting_link?: string;
  choice_filling_pdf?: string;
  status: {
    choice_list_sent: boolean;
    video_call_done: boolean;
    seat_allotted: boolean;
  };
  messages: { sender: 'student' | 'mentor'; text: string; time: string }[];
}

export default function MentorPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mentorEmail, setMentorEmail] = useState<string>('');
  const [mentorPassword, setMentorPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [activeMentor, setActiveMentor] = useState<string>('Aaditya Ranjan');

  const [students, setStudents] = useState<MentorStudent[]>([
    {
      id: 's1',
      name: 'Aarav Mehra',
      phone: '+91 85446 37096',
      score: 645,
      rank: 7200,
      state: 'Delhi',
      is_premium: true,
      meeting_link: 'https://meet.google.com/neet-vip-aarav',
      choice_filling_pdf: 'https://collegemitra.com/docs/aarav_choice_filling_2026.pdf',
      status: { choice_list_sent: true, video_call_done: true, seat_allotted: false },
      messages: [
        { sender: 'student', text: 'Sir, what is the best order between VMMC and MAMC for Round 1 AIQ?', time: '10:30 AM' },
        { sender: 'mentor', text: 'MAMC Delhi first for internal PG quota and high patient bed strength, then VMMC Safdarjung.', time: '10:35 AM' }
      ]
    },
    {
      id: 's2',
      name: 'Sneha Patel',
      phone: '+91 99201 88900',
      score: 585,
      rank: 42000,
      state: 'Maharashtra',
      is_premium: false,
      status: { choice_list_sent: false, video_call_done: false, seat_allotted: false },
      messages: [
        { sender: 'student', text: 'Can I get KMC Manipal or DY Patil Pune in Round 2?', time: '11:15 AM' },
        { sender: 'mentor', text: 'With AIR 42,000, KMC Manipal is borderline safe in Round 2. Keep DY Patil as safe backup.', time: '11:20 AM' }
      ]
    },
    {
      id: 's3',
      name: 'Rohan Deshmukh',
      phone: '+91 94432 11223',
      score: 510,
      rank: 98000,
      state: 'Karnataka',
      is_premium: true,
      meeting_link: 'https://meet.google.com/neet-vip-rohan',
      choice_filling_pdf: '',
      status: { choice_list_sent: false, video_call_done: false, seat_allotted: false },
      messages: [
        { sender: 'student', text: 'Sir, please generate my choice list for Karnataka Open private & Deemed universities.', time: '01:00 PM' }
      ]
    }
  ]);

  const [selectedStudent, setSelectedStudent] = useState<MentorStudent>(students[0]);
  const [chatInput, setChatInput] = useState<string>('');
  const [newMeetLink, setNewMeetLink] = useState<string>('');
  const [newPdfLink, setNewPdfLink] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('cm_mentor_auth');
    if (saved === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

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
      setAuthError('Invalid Mentor ID or Password. Only authorized College Mitra mentors can access this portal.');
    }
  };

  const handleMentorLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cm_mentor_auth');
    setMentorPassword('');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = students.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          messages: [...s.messages, { sender: 'mentor' as const, text: chatInput, time }]
        };
      }
      return s;
    });

    setStudents(updated);
    setSelectedStudent(updated.find(s => s.id === selectedStudent.id)!);
    setChatInput('');
  };

  const handleSaveDeliverables = () => {
    const updated = students.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          meeting_link: newMeetLink || s.meeting_link,
          choice_filling_pdf: newPdfLink || s.choice_filling_pdf,
          status: {
            ...s.status,
            choice_list_sent: !!(newPdfLink || s.choice_filling_pdf)
          }
        };
      }
      return s;
    });
    setStudents(updated);
    setSelectedStudent(updated.find(s => s.id === selectedStudent.id)!);
    alert('Deliverable links saved successfully!');
  };

  const handleToggleStatus = (field: 'choice_list_sent' | 'video_call_done' | 'seat_allotted') => {
    const updated = students.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          status: {
            ...s.status,
            [field]: !s.status[field]
          }
        };
      }
      return s;
    });
    setStudents(updated);
    setSelectedStudent(updated.find(s => s.id === selectedStudent.id)!);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
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
              Aaditya Ranjan
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Mentor Student Deliverables & Direct Chat Workspace
          </h1>
          <p className="text-xs text-slate-300">
            Fulfill 1-on-1 Meet calls, publish custom Choice Filling PDF orders, and handle live student queries for NEET 2026-27.
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
        {/* Left: Assigned Students List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            <span>Assigned Students ({students.length})</span>
            <span className="text-xs text-emerald-700 font-semibold">{students.filter(s => s.is_premium).length} VIP Paid</span>
          </h3>

          <div className="space-y-3">
            {students.map((st) => {
              const isSelected = st.id === selectedStudent.id;
              return (
                <div
                  key={st.id}
                  onClick={() => {
                    setSelectedStudent(st);
                    setNewMeetLink(st.meeting_link || '');
                    setNewPdfLink(st.choice_filling_pdf || '');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 text-sm">{st.name}</div>
                    {st.is_premium && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-600" /> VIP
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Score: <strong>{st.score}/720</strong> • AIR <strong>#{st.rank.toLocaleString()}</strong> ({st.state})
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px]">
                    <a href={`tel:${st.phone}`} onClick={(e) => e.stopPropagation()} className="text-emerald-700 font-bold flex items-center gap-1">
                      <PhoneCall className="w-3 h-3" /> Call Student
                    </a>
                    <span className="text-slate-400">{st.messages.length} messages</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Student Deliverables Management & Chat Window (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Deliverables Action Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>Deliverables Fulfillment for {selectedStudent.name}</span>
                  {selectedStudent.is_premium && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded">
                      VIP Student
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">AIR #{selectedStudent.rank.toLocaleString()} • Domicile: {selectedStudent.state}</p>
              </div>
              <a
                href={`tel:${selectedStudent.phone}`}
                className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call +91 85446 37096
              </a>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleToggleStatus('choice_list_sent')}
                className={`p-2.5 rounded-xl text-center text-xs font-bold border transition ${
                  selectedStudent.status.choice_list_sent
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {selectedStudent.status.choice_list_sent ? '✓ Choice List PDF Attached' : '○ Attach Choice PDF'}
              </button>

              <button
                onClick={() => handleToggleStatus('video_call_done')}
                className={`p-2.5 rounded-xl text-center text-xs font-bold border transition ${
                  selectedStudent.status.video_call_done
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {selectedStudent.status.video_call_done ? '✓ 1-on-1 Video Meet Done' : '○ Schedule Video Meet'}
              </button>

              <button
                onClick={() => handleToggleStatus('seat_allotted')}
                className={`p-2.5 rounded-xl text-center text-xs font-bold border transition ${
                  selectedStudent.status.seat_allotted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {selectedStudent.status.seat_allotted ? '✓ Seat Allotted & Confirmed' : '○ In Allotment'}
              </button>
            </div>

            {/* Input Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-amber-600" /> Google Meet / Video Link
                </label>
                <input
                  type="text"
                  placeholder="https://meet.google.com/..."
                  value={newMeetLink}
                  onChange={(e) => setNewMeetLink(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" /> Choice List PDF URL
                </label>
                <input
                  type="text"
                  placeholder="https://collegemitra.com/docs/..."
                  value={newPdfLink}
                  onChange={(e) => setNewPdfLink(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={handleSaveDeliverables}
              className="px-5 py-2.5 bg-navy-950 hover:bg-navy-900 text-white rounded-xl text-xs font-bold transition shadow"
            >
              Update Deliverable Links
            </button>
          </div>

          {/* Direct Chat With Student */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-bold">
              <span>Direct Conversation with {selectedStudent.name}</span>
              <span className="text-emerald-400">Live Active Session</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              {selectedStudent.messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.sender === 'mentor' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                    m.sender === 'mentor'
                      ? 'bg-emerald-700 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                placeholder={`Type guidance reply to ${selectedStudent.name}...`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-800 transition flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
