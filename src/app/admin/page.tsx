'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Sliders, 
  Zap, 
  Activity, 
  PhoneCall, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  DollarSign,
  Search,
  UserCheck,
  RefreshCw,
  Video,
  ExternalLink,
  Crown,
  Sparkles,
  Lock,
  LogOut,
  Mail,
  KeyRound,
  GraduationCap,
  Globe,
  Tag
} from 'lucide-react';
import { 
  getColleges, 
  updateCollege, 
  getMentors, 
  addMentor, 
  deleteMentor, 
  getPricingPlans, 
  updatePricingPlans,
  updatePricingPlan,
  getCounsellingAuthorities,
  updateCounsellingAuthority,
  getFeatureFlags,
  updateFeatureFlags,
  getStudentDeliverables,
  saveStudentDeliverable,
  StudentDeliverable,
  supabase 
} from '../../lib/supabase';
import { getTelemetryHistory, TelemetryRecord } from '../../lib/telemetry';
import { College, Mentor, PricingPlan, LeadTier } from '../../types';
import { CounsellingAuthority } from '../../lib/counsellingData';

interface StudentLead {
  id: string;
  student_name: string;
  phone_number: string;
  neet_score: number;
  air_rank: number;
  domicile_state: string;
  lead_score: number;
  lead_tier: LeadTier;
  assigned_mentor_name?: string;
  assigned_mentor_id?: string;
  is_premium: boolean;
  predictor_runs: number;
  comparisons_run: number;
  viewed_premium_times: number;
  meeting_link?: string;
  choice_filling_pdf_url?: string;
  deliverables_status?: {
    choice_list_sent: boolean;
    video_call_done: boolean;
    seat_allotted: boolean;
  };
  created_at: string;
}

export default function AdminPanelPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUserId, setAdminUserId] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Admin Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'crm' | 'deliverables' | 'colleges' | 'counselling' | 'switches' | 'mentors'>('crm');
  const [colleges, setColleges] = useState<College[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [authorities, setAuthorities] = useState<CounsellingAuthority[]>([]);
  const [deliverables, setDeliverables] = useState<StudentDeliverable[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryRecord[]>([]);
  
  // Feature Switches
  const [peakMode, setPeakMode] = useState<boolean>(false);
  const [freeChatEnabled, setFreeChatEnabled] = useState<boolean>(true);
  const [isSwitchUpdating, setIsSwitchUpdating] = useState<boolean>(false);

  // Search & Filters
  const [collegeSearch, setCollegeSearch] = useState('');
  const [counsellingSearch, setCounsellingSearch] = useState('');
  const [leadFilter, setLeadFilter] = useState<'all' | 'hot' | 'vip_ready' | 'premium'>('all');

  // Leads State
  const [leads, setLeads] = useState<StudentLead[]>([
    {
      id: 'l1',
      student_name: 'Aarav Mehra',
      phone_number: '+91 85446 37096',
      neet_score: 645,
      air_rank: 7200,
      domicile_state: 'Delhi',
      lead_score: 95,
      lead_tier: 'vip_ready',
      assigned_mentor_name: 'Aaditya Ranjan (Senior AIQ Lead)',
      assigned_mentor_id: 'a0000000-0000-0000-0000-000000000001',
      is_premium: true,
      predictor_runs: 7,
      comparisons_run: 4,
      viewed_premium_times: 5,
      meeting_link: 'https://meet.google.com/neet-vip-aarav',
      choice_filling_pdf_url: 'https://collegemitra.com/docs/aarav_choice_filling_2026.pdf',
      deliverables_status: {
        choice_list_sent: true,
        video_call_done: true,
        seat_allotted: false,
      },
      created_at: '10 mins ago',
    },
    {
      id: 'l2',
      student_name: 'Sneha Patel',
      phone_number: '+91 99201 88900',
      neet_score: 585,
      air_rank: 42000,
      domicile_state: 'Maharashtra',
      lead_score: 88,
      lead_tier: 'hot',
      assigned_mentor_name: 'Rahul Sharma (State Counselling Lead)',
      assigned_mentor_id: 'a0000000-0000-0000-0000-000000000002',
      is_premium: false,
      predictor_runs: 12,
      comparisons_run: 6,
      viewed_premium_times: 3,
      created_at: '25 mins ago',
    },
    {
      id: 'l3',
      student_name: 'Rohan Deshmukh',
      phone_number: '+91 94432 11223',
      neet_score: 510,
      air_rank: 98000,
      domicile_state: 'Karnataka',
      lead_score: 92,
      lead_tier: 'vip_ready',
      assigned_mentor_name: 'Aaditya Ranjan (Senior AIQ Lead)',
      assigned_mentor_id: 'a0000000-0000-0000-0000-000000000001',
      is_premium: true,
      predictor_runs: 15,
      comparisons_run: 9,
      viewed_premium_times: 6,
      meeting_link: 'https://meet.google.com/neet-vip-rohan',
      choice_filling_pdf_url: '',
      deliverables_status: {
        choice_list_sent: false,
        video_call_done: false,
        seat_allotted: false,
      },
      created_at: '1 hour ago',
    },
    {
      id: 'l4',
      student_name: 'Ananya Gupta',
      phone_number: '+91 97110 55443',
      neet_score: 615,
      air_rank: 18500,
      domicile_state: 'Uttar Pradesh',
      lead_score: 74,
      lead_tier: 'warm',
      is_premium: false,
      predictor_runs: 5,
      comparisons_run: 2,
      viewed_premium_times: 1,
      created_at: '2 hours ago',
    }
  ]);

  // Modal / Form States
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [editingAuthority, setEditingAuthority] = useState<CounsellingAuthority | null>(null);
  const [newMentor, setNewMentor] = useState({ name: '', specialization: '', phone: '+91 85446 37096' });
  const [selectedLeadForDeliverable, setSelectedLeadForDeliverable] = useState<StudentLead | null>(null);
  const [tempMeetingLink, setTempMeetingLink] = useState('');
  const [tempPdfUrl, setTempPdfUrl] = useState('');

  // Check persisted admin session on load
  useEffect(() => {
    const saved = localStorage.getItem('cm_admin_auth');
    if (saved === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load live data from Supabase
  const loadAllData = async () => {
    try {
      const [colls, ments, plans, auths, flags, dels] = await Promise.all([
        getColleges().catch(() => []),
        getMentors().catch(() => []),
        getPricingPlans().catch(() => []),
        getCounsellingAuthorities().catch(() => []),
        getFeatureFlags().catch(() => ({ peak_mode: false, free_chat_enabled: true })),
        getStudentDeliverables().catch(() => []),
      ]);
      setColleges(Array.isArray(colls) ? colls : []);
      setMentors(Array.isArray(ments) ? ments : []);
      setPricingPlans(Array.isArray(plans) ? plans : []);
      setAuthorities(Array.isArray(auths) ? auths : []);
      setPeakMode(Boolean(flags?.peak_mode));
      setFreeChatEnabled(flags?.free_chat_enabled ?? true);
      setDeliverables(Array.isArray(dels) ? dels : []);

      // Load Telemetry Activity
      const tele = getTelemetryHistory();
      setTelemetryLogs(tele);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadAllData();
  }, [isAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');

    const id = adminUserId.trim().toLowerCase();
    const pass = adminPassword.trim();

    if ((id === 'admin@collegemitra.com' || id === 'admin' || id === 'neet.collegemitra@gmail.com') && 
        (pass === 'Admin@NEET2026' || pass === 'Admin@2026' || pass === 'CollegeMitra@2026')) {
      setIsAuthenticated(true);
      localStorage.setItem('cm_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid Admin ID or Password. Restricted access.');
    }
    setIsLoggingIn(false);
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cm_admin_auth');
    setAdminPassword('');
  };

  // 1. Dynamic Feature Switches
  const handleTogglePeakMode = async () => {
    setIsSwitchUpdating(true);
    const nextVal = !peakMode;
    setPeakMode(nextVal);
    await updateFeatureFlags({ peak_mode: nextVal, free_chat_enabled: freeChatEnabled });
    setIsSwitchUpdating(false);
  };

  const handleToggleFreeChat = async () => {
    setIsSwitchUpdating(true);
    const nextVal = !freeChatEnabled;
    setFreeChatEnabled(nextVal);
    await updateFeatureFlags({ peak_mode: peakMode, free_chat_enabled: nextVal });
    setIsSwitchUpdating(false);
  };

  // 2. Dynamic Mentor Operations
  const handleAddMentor = async () => {
    if (!newMentor.name || !newMentor.phone) return;
    const added = await addMentor({
      full_name: newMentor.name,
      specialization: newMentor.specialization || 'Counselling Specialist',
      phone_number: newMentor.phone,
      is_active: true,
      max_capacity: 30,
      assigned_count: 0,
    });
    setMentors(prev => [added, ...prev.filter(m => m.id !== added.id)]);
    setNewMentor({ name: '', specialization: '', phone: '+91 85446 37096' });
  };

  const handleDeleteMentor = async (id: string) => {
    setMentors(prev => prev.filter(m => m.id !== id));
    await deleteMentor(id);
  };

  // 3. Dynamic Lead Assignment
  const handleAssignMentor = (leadId: string, mentorId: string) => {
    const mentor = mentors.find(m => m.id === mentorId);
    if (!mentor) return;
    setLeads(prev => prev.map(l => l.id === leadId ? {
      ...l,
      assigned_mentor_id: mentor.id,
      assigned_mentor_name: mentor.full_name,
    } : l));
  };

  // 4. Dynamic Deliverables Update
  const handleSaveDeliverables = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const updatedDeliverable: StudentDeliverable = {
      id: `del_${lead.id}`,
      studentId: lead.id,
      studentName: lead.student_name,
      phoneNumber: lead.phone_number,
      score: lead.neet_score,
      rank: lead.air_rank,
      state: lead.domicile_state,
      assignedMentorId: lead.assigned_mentor_id || mentors[0]?.id || 'a0000000-0000-0000-0000-000000000001',
      assignedMentorName: lead.assigned_mentor_name || mentors[0]?.full_name || 'Aaditya Ranjan',
      isPremium: true,
      meetingLink: tempMeetingLink,
      choicePdfUrl: tempPdfUrl,
      choiceList: [],
      status: {
        choice_list_sent: !!tempPdfUrl,
        video_call_done: lead.deliverables_status?.video_call_done || false,
        seat_allotted: lead.deliverables_status?.seat_allotted || false,
      },
      round: 1,
      updatedAt: new Date().toISOString(),
    };

    await saveStudentDeliverable(updatedDeliverable);

    setLeads(prev => prev.map(l => l.id === leadId ? {
      ...l,
      meeting_link: tempMeetingLink,
      choice_filling_pdf_url: tempPdfUrl,
      deliverables_status: updatedDeliverable.status,
    } : l));

    setSelectedLeadForDeliverable(null);
  };

  const handleToggleDeliverableStatus = async (leadId: string, field: 'choice_list_sent' | 'video_call_done' | 'seat_allotted') => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const current = lead.deliverables_status || { choice_list_sent: false, video_call_done: false, seat_allotted: false };
    const nextStatus = { ...current, [field]: !current[field] };

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, deliverables_status: nextStatus } : l));

    await saveStudentDeliverable({
      id: `del_${lead.id}`,
      studentId: lead.id,
      studentName: lead.student_name,
      phoneNumber: lead.phone_number,
      score: lead.neet_score,
      rank: lead.air_rank,
      state: lead.domicile_state,
      assignedMentorId: lead.assigned_mentor_id || 'a0000000-0000-0000-0000-000000000001',
      assignedMentorName: lead.assigned_mentor_name || 'Aaditya Ranjan',
      isPremium: true,
      meetingLink: lead.meeting_link,
      choicePdfUrl: lead.choice_filling_pdf_url,
      choiceList: [],
      status: nextStatus,
      round: 1,
      updatedAt: new Date().toISOString(),
    });
  };

  // 5. Dynamic College Fee Editor
  const handleSaveCollegeFee = async () => {
    if (!editingCollege) return;
    await updateCollege(editingCollege.id, {
      annual_tuition_fee: editingCollege.annual_tuition_fee,
      security_deposit: editingCollege.security_deposit,
      bond_penalty_amount: editingCollege.bond_penalty_amount,
    });
    setColleges(prev => prev.map(c => c.id === editingCollege.id ? editingCollege : c));
    setEditingCollege(null);
  };

  // 6. Dynamic Pricing Plan Editor
  const handleSavePlanPricing = async () => {
    if (!editingPlan) return;
    await updatePricingPlan(editingPlan.id, {
      title: editingPlan.title,
      offer_price: Number(editingPlan.offer_price),
      base_price: Number(editingPlan.base_price),
      discount_pct: Number(editingPlan.discount_pct),
      features: editingPlan.features,
    });
    setPricingPlans(prev => prev.map(p => p.id === editingPlan.id ? editingPlan : p));
    setEditingPlan(null);
  };

  // 7. Dynamic Counselling Authority Editor
  const handleSaveAuthority = async () => {
    if (!editingAuthority) return;
    await updateCounsellingAuthority(editingAuthority.id, {
      official_website: editingAuthority.official_website,
      registration_portal_url: editingAuthority.registration_portal_url,
      registration_fee: editingAuthority.registration_fee,
      security_deposit: editingAuthority.security_deposit,
      domicile_rules: editingAuthority.domicile_rules,
      bond_summary: editingAuthority.bond_summary,
    });
    setAuthorities(prev => prev.map(a => a.id === editingAuthority.id ? editingAuthority : a));
    setEditingAuthority(null);
  };

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    if (leadFilter === 'hot') return lead.lead_tier === 'hot' || lead.lead_tier === 'vip_ready';
    if (leadFilter === 'vip_ready') return lead.lead_tier === 'vip_ready';
    if (leadFilter === 'premium') return lead.is_premium;
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-8 text-white text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">College Mitra Master Admin</h2>
            <p className="text-xs text-slate-300 mt-1">
              Restricted Gateway • NEET UG 2026-27 CRM & System Controls
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="p-8 space-y-5">
            {authError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Admin User ID / Email
              </label>
              <input
                type="text"
                required
                placeholder="admin@collegemitra.com"
                value={adminUserId}
                onChange={(e) => setAdminUserId(e.target.value)}
                className="w-full px-4 py-3 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Master Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Secure Admin Sign In
            </button>

            <div className="pt-2 text-center text-[11px] text-slate-400">
              Helpline: <span className="font-semibold text-slate-600">+91 85446 37096</span> • Email: <span className="font-semibold text-slate-600">neet.collegemitra@gmail.com</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header with Logout */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Authenticated Administrator
            </span>
            <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-xs font-mono rounded-md">
              NEET 2026-27 • Live Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            College Mitra Admin & Deliverables Center
          </h1>
          <p className="text-xs text-slate-300">
            Real-time Supabase telemetry, lead assignment, VIP deliverables dispatch, and master controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" /> Refresh Live
          </button>
          <button
            onClick={handleAdminLogout}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> Admin Logout
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Leads</div>
          <div className="text-2xl font-black text-navy-950 mt-1">{leads.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">↑ 100% live pipeline</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">VIP / Hot Leads</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {leads.filter(l => l.lead_tier === 'vip_ready' || l.lead_tier === 'hot').length}
          </div>
          <div className="text-[11px] text-slate-400 font-semibold mt-0.5">High purchase intent</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paid VIP Students</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {leads.filter(l => l.is_premium).length}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Deliverables queue active</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Mentors</div>
          <div className="text-2xl font-black text-navy-950 mt-1">{mentors.length}</div>
          <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Live roster synced</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peak Switch</div>
          <div className="text-base font-extrabold mt-1 flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${peakMode ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className={peakMode ? 'text-rose-600' : 'text-emerald-700'}>
              {peakMode ? 'Peak Active' : 'Normal Flow'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{peakMode ? 'Free chat locked' : 'Free chat allowed'}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'crm', label: 'CRM & Lead Telemetry', icon: Users, badge: leads.length },
          { id: 'deliverables', label: 'VIP Deliverables Queue', icon: Crown, badge: deliverables.length },
          { id: 'mentors', label: 'Mentors Management', icon: UserCheck, badge: mentors.length },
          { id: 'colleges', label: 'College Fee & Bond Editor', icon: Building2, badge: colleges.length },
          { id: 'counselling', label: 'Counselling Authorities Directory', icon: Globe, badge: authorities.length },
          { id: 'switches', label: 'Master Switches & Pricing Matrix', icon: Sliders },
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
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CRM & LEADS PIPELINE */}
      {activeTab === 'crm' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Intent:</span>
              {(['all', 'vip_ready', 'hot', 'premium'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setLeadFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                    leadFilter === f
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              Showing {filteredLeads.length} student leads • Live Telemetry Events ({telemetryLogs.length})
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Student & Contact</th>
                    <th className="p-4">NEET Score & AIR</th>
                    <th className="p-4">State</th>
                    <th className="p-4">Telemetry Activity</th>
                    <th className="p-4">Intent Tier</th>
                    <th className="p-4">Assigned Mentor</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{lead.student_name}</div>
                        <a href={`tel:${lead.phone_number}`} className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold mt-0.5">
                          <PhoneCall className="w-3 h-3" /> {lead.phone_number}
                        </a>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{lead.neet_score} / 720</div>
                        <div className="text-slate-500 text-[11px]">AIR #{lead.air_rank.toLocaleString()}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{lead.domicile_state}</td>
                      <td className="p-4 space-y-0.5">
                        <div className="text-slate-600">Predictor Runs: <strong>{lead.predictor_runs}</strong></div>
                        <div className="text-slate-600">VIP Views: <strong>{lead.viewed_premium_times}</strong></div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          lead.lead_tier === 'vip_ready' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          lead.lead_tier === 'hot' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {lead.lead_tier} ({lead.lead_score}%)
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={lead.assigned_mentor_id || ''}
                          onChange={(e) => handleAssignMentor(lead.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="">Unassigned</option>
                          {mentors.map(m => (
                            <option key={m.id} value={m.id}>{m.full_name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={`tel:${lead.phone_number}`}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                        >
                          <PhoneCall className="w-3 h-3" /> Call Lead
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VIP DELIVERABLES QUEUE */}
      {activeTab === 'deliverables' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-600" />
              <span>Live Deliverables Synced: 1-on-1 Google Meet Links & Custom Choice Filling PDFs.</span>
            </div>
            <span className="font-bold bg-amber-200 px-3 py-1 rounded-full">
              {deliverables.length} Paid Enrolled Students
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deliverables.map((del) => (
              <div key={del.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{del.studentName}</h3>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        VIP Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">AIR #{del.rank.toLocaleString()} • {del.state} • Mentor: {del.assignedMentorName}</p>
                  </div>
                  <a href={`tel:${del.phoneNumber}`} className="p-2 bg-emerald-50 rounded-lg text-emerald-700 hover:bg-emerald-100">
                    <PhoneCall className="w-4 h-4" />
                  </a>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="text-xs font-bold text-slate-700">Deliverables Status Checklist:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleToggleDeliverableStatus(del.studentId, 'choice_list_sent')}
                      className={`p-2 rounded-lg text-center text-xs font-bold border transition ${
                        del.status?.choice_list_sent
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {del.status?.choice_list_sent ? '✓ Choice PDF Sent' : '○ Send PDF'}
                    </button>

                    <button
                      onClick={() => handleToggleDeliverableStatus(del.studentId, 'video_call_done')}
                      className={`p-2 rounded-lg text-center text-xs font-bold border transition ${
                        del.status?.video_call_done
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {del.status?.video_call_done ? '✓ Meet Done' : '○ Video Meet'}
                    </button>

                    <button
                      onClick={() => handleToggleDeliverableStatus(del.studentId, 'seat_allotted')}
                      className={`p-2 rounded-lg text-center text-xs font-bold border transition ${
                        del.status?.seat_allotted
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {del.status?.seat_allotted ? '✓ Seat Allotted' : '○ In Allotment'}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Google Meet Link:</span>
                    {del.meetingLink ? (
                      <a href={del.meetingLink} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" /> Launch Meet
                      </a>
                    ) : (
                      <span className="text-slate-400">Not configured</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Choice Filling PDF:</span>
                    {del.choicePdfUrl ? (
                      <a href={del.choicePdfUrl} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> View PDF
                      </a>
                    ) : (
                      <span className="text-slate-400">Not uploaded</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedLeadForDeliverable({
                      id: del.studentId,
                      student_name: del.studentName,
                      phone_number: del.phoneNumber,
                      neet_score: del.score,
                      air_rank: del.rank,
                      domicile_state: del.state,
                      lead_score: 95,
                      lead_tier: 'vip_ready',
                      assigned_mentor_name: del.assignedMentorName,
                      assigned_mentor_id: del.assignedMentorId,
                      is_premium: true,
                      predictor_runs: 5,
                      comparisons_run: 2,
                      viewed_premium_times: 3,
                      meeting_link: del.meetingLink,
                      choice_filling_pdf_url: del.choicePdfUrl,
                      created_at: 'now',
                    });
                    setTempMeetingLink(del.meetingLink || '');
                    setTempPdfUrl(del.choicePdfUrl || '');
                  }}
                  className="w-full py-2.5 bg-navy-950 hover:bg-navy-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Configure Links & Deliverables
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MENTORS MANAGEMENT */}
      {activeTab === 'mentors' && (
        <div className="space-y-6">
          {/* Add Mentor Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" /> Add New Senior Counselling Mentor (Supabase Synced)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Mentor Full Name (e.g. Aaditya Ranjan)"
                value={newMentor.name}
                onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                className="px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Specialization (e.g. AIQ 15% & Deemed Specialist)"
                value={newMentor.specialization}
                onChange={(e) => setNewMentor({ ...newMentor, specialization: e.target.value })}
                className="px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                placeholder="Phone (e.g. +91 85446 37096)"
                value={newMentor.phone}
                onChange={(e) => setNewMentor({ ...newMentor, phone: e.target.value })}
                className="px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={handleAddMentor}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Save Mentor to Database
            </button>
          </div>

          {/* Mentors Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Mentor Name</th>
                  <th className="p-4">Specialization</th>
                  <th className="p-4">Phone Hotline</th>
                  <th className="p-4">Current Active Leads</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mentors.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{m.full_name}</td>
                    <td className="p-4 text-slate-600 font-semibold">{m.specialization}</td>
                    <td className="p-4 text-emerald-700 font-semibold">{m.phone_number}</td>
                    <td className="p-4 font-semibold">{m.assigned_count} / {m.max_capacity}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteMentor(m.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Mentor from Supabase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COLLEGE FEES & CUTOFFS EDITOR */}
      {activeTab === 'colleges' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search college name, state or city..."
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="p-4">College</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Annual Tuition Fee</th>
                    <th className="p-4">Security Deposit</th>
                    <th className="p-4">Bond (Yrs / Amount)</th>
                    <th className="p-4 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {colleges
                    .filter(c => c.name.toLowerCase().includes(collegeSearch.toLowerCase()) || c.state.toLowerCase().includes(collegeSearch.toLowerCase()))
                    .slice(0, 50)
                    .map((college) => (
                      <tr key={college.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{college.name}</div>
                          <div className="text-[11px] text-slate-400">{college.city}, {college.state}</div>
                        </td>
                        <td className="p-4 font-semibold uppercase text-slate-600">{college.type}</td>
                        <td className="p-4 font-bold text-slate-900">₹{college.annual_tuition_fee.toLocaleString()}</td>
                        <td className="p-4 text-slate-600">₹{college.security_deposit.toLocaleString()}</td>
                        <td className="p-4 text-slate-600">{college.bond_duration_years} Yrs • ₹{college.bond_penalty_amount.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setEditingCollege(college)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs"
                          >
                            Edit Fee
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COUNSELLING AUTHORITIES MATRIX */}
      {activeTab === 'counselling' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search state counselling authority, portal, or short code (e.g. UP, KEA, MCC, AYUSH)..."
                value={counsellingSearch}
                onChange={(e) => setCounsellingSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[550px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="p-4">State / Authority</th>
                    <th className="p-4">Quota & Type</th>
                    <th className="p-4">Official Portal URL</th>
                    <th className="p-4">Security Deposit (Govt / Pvt / Deemed)</th>
                    <th className="p-4">Reg Fee</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {authorities
                    .filter(a => 
                      a.state.toLowerCase().includes(counsellingSearch.toLowerCase()) ||
                      a.name.toLowerCase().includes(counsellingSearch.toLowerCase()) ||
                      a.short_code.toLowerCase().includes(counsellingSearch.toLowerCase())
                    )
                    .map((auth) => (
                      <tr key={auth.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{auth.state}</div>
                          <div className="text-[11px] text-emerald-700 font-semibold">{auth.name} ({auth.short_code})</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            auth.type === 'central' ? 'bg-purple-100 text-purple-800' :
                            auth.type === 'ayush' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {auth.type}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">{auth.is_open_state ? 'Open State (All India eligible)' : 'Closed / Domicile restricted'}</div>
                        </td>
                        <td className="p-4">
                          <a 
                            href={auth.registration_portal_url || auth.official_website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 max-w-[200px] truncate"
                          >
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{auth.registration_portal_url || auth.official_website}</span>
                          </a>
                        </td>
                        <td className="p-4 font-semibold text-slate-700">
                          ₹{auth.security_deposit?.govt?.toLocaleString() || '0'} / ₹{auth.security_deposit?.private?.toLocaleString() || '0'} {auth.security_deposit?.deemed ? `/ ₹${auth.security_deposit.deemed.toLocaleString()}` : ''}
                        </td>
                        <td className="p-4 text-slate-600 font-semibold">
                          ₹{auth.registration_fee?.general?.toLocaleString() || '0'}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setEditingAuthority(auth)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1 ml-auto"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MASTER SWITCHES & PRICING MATRIX */}
      {activeTab === 'switches' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Peak Mode Switch */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Peak Counselling Mode</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    When enabled, free mentor chat is paused, prompting users to buy VIP packages or call senior mentors.
                  </p>
                </div>
                <button
                  disabled={isSwitchUpdating}
                  onClick={handleTogglePeakMode}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
                    peakMode ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {peakMode ? 'PEAK ON' : 'PEAK OFF'}
                </button>
              </div>
            </div>

            {/* Free Chat Switch */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Free Chat Availability</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Toggle free chatbot vs human mentor consultation availability in real-time.
                  </p>
                </div>
                <button
                  disabled={isSwitchUpdating}
                  onClick={handleToggleFreeChat}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
                    freeChatEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {freeChatEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Plans Summary & Direct Live Editor */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Active VIP Packages (Supabase Dynamic Matrix)</h3>
                <p className="text-xs text-slate-500">Edit prices, discounts, and deliverables. Syncs live with Supabase database and VIP checkout.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricingPlans.map((plan) => (
                <div key={plan.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-slate-900 text-sm">{plan.title}</div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {plan.discount_pct}% OFF
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-xl font-black text-emerald-700">₹{plan.offer_price.toLocaleString()}</div>
                      <div className="text-xs text-slate-400 line-through">₹{plan.base_price.toLocaleString()}</div>
                    </div>
                    <ul className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-200/60">
                      {plan.features?.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Package Price & Offers
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Pricing Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Edit Package: {editingPlan.title}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Package Title</label>
                <input
                  type="text"
                  value={editingPlan.title}
                  onChange={(e) => setEditingPlan({ ...editingPlan, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={editingPlan.offer_price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, offer_price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Base Price (₹)</label>
                  <input
                    type="number"
                    value={editingPlan.base_price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, base_price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Discount (%)</label>
                  <input
                    type="number"
                    value={editingPlan.discount_pct}
                    onChange={(e) => setEditingPlan({ ...editingPlan, discount_pct: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlanPricing}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow"
              >
                Save & Update Supabase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Counselling Authority Modal */}
      {editingAuthority && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base">
              Edit Authority Matrix: {editingAuthority.name} ({editingAuthority.state})
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Official Portal Website URL</label>
                <input
                  type="text"
                  value={editingAuthority.official_website}
                  onChange={(e) => setEditingAuthority({ ...editingAuthority, official_website: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Online Registration Portal URL</label>
                <input
                  type="text"
                  value={editingAuthority.registration_portal_url}
                  onChange={(e) => setEditingAuthority({ ...editingAuthority, registration_portal_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Govt Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={editingAuthority.security_deposit?.govt || 0}
                    onChange={(e) => setEditingAuthority({
                      ...editingAuthority,
                      security_deposit: { ...editingAuthority.security_deposit, govt: Number(e.target.value) }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Private Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={editingAuthority.security_deposit?.private || 0}
                    onChange={(e) => setEditingAuthority({
                      ...editingAuthority,
                      security_deposit: { ...editingAuthority.security_deposit, private: Number(e.target.value) }
                    })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700">Domicile Eligibility Rules Summary</label>
                <textarea
                  rows={2}
                  value={editingAuthority.domicile_rules}
                  onChange={(e) => setEditingAuthority({ ...editingAuthority, domicile_rules: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Service Bond Policy Summary</label>
                <textarea
                  rows={2}
                  value={editingAuthority.bond_summary}
                  onChange={(e) => setEditingAuthority({ ...editingAuthority, bond_summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingAuthority(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAuthority}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow"
              >
                Save & Update Supabase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deliverables Modal */}
      {selectedLeadForDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Dispatch Deliverables for {selectedLeadForDeliverable.student_name}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Google Meet Video Consultation Link</label>
                <input
                  type="text"
                  placeholder="https://meet.google.com/xyz-neet"
                  value={tempMeetingLink}
                  onChange={(e) => setTempMeetingLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Choice Filling Order PDF Link</label>
                <input
                  type="text"
                  placeholder="https://collegemitra.com/docs/student_choices_2026.pdf"
                  value={tempPdfUrl}
                  onChange={(e) => setTempPdfUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedLeadForDeliverable(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveDeliverables(selectedLeadForDeliverable.id)}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow"
              >
                Save & Sync with Supabase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit College Modal */}
      {editingCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Edit Fee & Parameters: {editingCollege.name}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Annual Tuition Fee (₹)</label>
                <input
                  type="number"
                  value={editingCollege.annual_tuition_fee}
                  onChange={(e) => setEditingCollege({ ...editingCollege, annual_tuition_fee: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Security Deposit (₹)</label>
                <input
                  type="number"
                  value={editingCollege.security_deposit}
                  onChange={(e) => setEditingCollege({ ...editingCollege, security_deposit: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Bond Penalty Amount (₹)</label>
                <input
                  type="number"
                  value={editingCollege.bond_penalty_amount}
                  onChange={(e) => setEditingCollege({ ...editingCollege, bond_penalty_amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl mt-1 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingCollege(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCollegeFee}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow"
              >
                Save & Update Supabase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
