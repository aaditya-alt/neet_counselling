import { createClient } from '@supabase/supabase-js';
import { OFFICIAL_MCC_2026_COLLEGES, OFFICIAL_MCC_2026_CUTOFFS } from './mccData';
import { MOCK_MENTORS, MOCK_PRICING } from './mockData';
import { ALL_INDIA_COUNSELLING_AUTHORITIES, CounsellingAuthority } from './counsellingData';
import { College, Cutoff, Mentor, PricingPlan, LeadTier } from '../types';

export const SUPABASE_URL = 'https://ersltbjphlrefxqidbcr.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyc2x0YmpwaGxyZWZ4cWlkYmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NDU1ODUsImV4cCI6MjEwNzAyMTU4NX0.U7GwXfEwHW_QZltQuITMcTRkCg-yO17nNz-5FaXDwEA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper for local caching fallback
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`cm_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`cm_${key}`, JSON.stringify(value));
  } catch {}
}

// 1. COLLEGES CRUD
export async function getColleges(): Promise<College[]> {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .order('name');
    if (!error && data && data.length > 0) {
      setLocal('colleges', data);
      return data as College[];
    }
  } catch {}
  return getLocal('colleges', OFFICIAL_MCC_2026_COLLEGES);
}

export async function updateCollege(id: string, updates: Partial<College>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('colleges')
      .update(updates)
      .eq('id', id);
    if (!error) {
      const current = getLocal<College[]>('colleges', OFFICIAL_MCC_2026_COLLEGES);
      setLocal('colleges', current.map(c => c.id === id ? { ...c, ...updates } : c));
      return true;
    }
  } catch {}
  const current = getLocal<College[]>('colleges', OFFICIAL_MCC_2026_COLLEGES);
  setLocal('colleges', current.map(c => c.id === id ? { ...c, ...updates } : c));
  return true;
}

// 2. CUTOFFS
export async function getCutoffs(round?: number, course?: string): Promise<Cutoff[]> {
  try {
    let query = supabase.from('cutoffs').select('*, college:colleges(*)');
    if (round) query = query.eq('round', round);
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as Cutoff[];
    }
  } catch {}
  
  let list = OFFICIAL_MCC_2026_CUTOFFS.map(c => ({
    ...c,
    college: OFFICIAL_MCC_2026_COLLEGES.find(col => col.id === c.college_id)
  }));
  if (round) list = list.filter(c => c.round === round);
  if (course && course !== 'ALL') {
    list = list.filter(c => c.college?.courses_offered.includes(course as any));
  }
  return list as Cutoff[];
}

// 3. MENTORS CRUD
export async function getMentors(): Promise<Mentor[]> {
  try {
    const { data, error } = await supabase
      .from('mentors')
      .select('*')
      .order('full_name');
    if (!error && data && data.length > 0) {
      setLocal('mentors', data);
      return data as Mentor[];
    }
  } catch {}
  return getLocal('mentors', MOCK_MENTORS);
}

export async function addMentor(mentor: Omit<Mentor, 'id'>): Promise<Mentor> {
  const newMentor: Mentor = {
    ...mentor,
    id: `mentor_${Date.now()}`,
  };

  try {
    const { data, error } = await supabase
      .from('mentors')
      .insert({
        full_name: mentor.full_name,
        specialization: mentor.specialization,
        phone_number: mentor.phone_number,
        is_active: mentor.is_active ?? true,
        max_capacity: mentor.max_capacity ?? 30,
        assigned_count: mentor.assigned_count ?? 0,
      })
      .select()
      .single();

    if (!error && data) {
      const current = getLocal<Mentor[]>('mentors', MOCK_MENTORS);
      setLocal('mentors', [data, ...current]);
      return data as Mentor;
    }
  } catch {}

  const current = getLocal<Mentor[]>('mentors', MOCK_MENTORS);
  const updated = [newMentor, ...current];
  setLocal('mentors', updated);
  return newMentor;
}

export async function deleteMentor(id: string): Promise<boolean> {
  try {
    await supabase.from('mentors').delete().eq('id', id);
  } catch {}
  const current = getLocal<Mentor[]>('mentors', MOCK_MENTORS);
  setLocal('mentors', current.filter(m => m.id !== id));
  return true;
}

export async function updateMentor(id: string, updates: Partial<Mentor>): Promise<boolean> {
  try {
    await supabase.from('mentors').update(updates).eq('id', id);
  } catch {}
  const current = getLocal<Mentor[]>('mentors', MOCK_MENTORS);
  setLocal('mentors', current.map(m => m.id === id ? { ...m, ...updates } : m));
  return true;
}

// 4. SYSTEM CONFIGS (Peak Mode & Pricing Plans)
export async function getSystemConfig<T>(key: string, fallback: T): Promise<T> {
  try {
    const { data, error } = await supabase
      .from('system_configs')
      .select('value')
      .eq('key', key)
      .single();
    if (!error && data && data.value !== undefined && data.value !== null) {
      let parsed = data.value;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {}
      }
      setLocal(`config_${key}`, parsed);
      return parsed as T;
    }
  } catch {}
  return getLocal(`config_${key}`, fallback);
}

export async function setSystemConfig<T>(key: string, value: T): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('system_configs')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (!error) {
      setLocal(`config_${key}`, value);
      return true;
    }
  } catch {}
  setLocal(`config_${key}`, value);
  return true;
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const plans = await getSystemConfig<PricingPlan[]>('pricing_matrix', MOCK_PRICING);
  if (Array.isArray(plans) && plans.length > 0) {
    return plans;
  }
  return MOCK_PRICING;
}

export async function updatePricingPlans(plans: PricingPlan[]): Promise<boolean> {
  return setSystemConfig('pricing_matrix', plans);
}

export async function updatePricingPlan(id: string, updates: Partial<PricingPlan>): Promise<boolean> {
  const current = await getPricingPlans();
  const updated = current.map(p => p.id === id ? { ...p, ...updates } : p);
  return updatePricingPlans(updated);
}

// Dynamic Counselling Directory (36+ State & Central Authorities)
export async function getCounsellingAuthorities(): Promise<CounsellingAuthority[]> {
  const list = await getSystemConfig<CounsellingAuthority[]>('counselling_directory', ALL_INDIA_COUNSELLING_AUTHORITIES);
  if (Array.isArray(list) && list.length > 0) {
    return list;
  }
  return ALL_INDIA_COUNSELLING_AUTHORITIES;
}

export async function updateCounsellingAuthority(id: string, updates: Partial<CounsellingAuthority>): Promise<boolean> {
  const current = await getCounsellingAuthorities();
  const updated = current.map(a => a.id === id ? { ...a, ...updates } : a);
  return setSystemConfig('counselling_directory', updated);
}

export async function getFeatureFlags(): Promise<{ peak_mode: boolean; free_chat_enabled: boolean }> {
  const flags = await getSystemConfig<{ peak_mode: boolean; free_chat_enabled: boolean }>(
    'feature_flags',
    { peak_mode: false, free_chat_enabled: true }
  );
  return {
    peak_mode: Boolean(flags?.peak_mode),
    free_chat_enabled: flags?.free_chat_enabled ?? true,
  };
}

export async function updateFeatureFlags(flags: { peak_mode: boolean; free_chat_enabled: boolean }): Promise<boolean> {
  return setSystemConfig('feature_flags', flags);
}

// 5. CHOICE FILLING & DELIVERABLES ENGINE
export interface ChoiceFillingItem {
  id: string;
  collegeId: string;
  collegeName: string;
  state: string;
  course: string;
  quota: string;
  priorityOrder: number;
  annualFee: number;
  mentorTip: string;
}

export interface StudentDeliverable {
  id: string;
  studentId: string;
  studentName: string;
  phoneNumber: string;
  score: number;
  rank: number;
  state: string;
  assignedMentorId: string;
  assignedMentorName: string;
  isPremium: boolean;
  meetingLink?: string;
  choicePdfUrl?: string;
  choiceList: ChoiceFillingItem[];
  status: {
    choice_list_sent: boolean;
    video_call_done: boolean;
    seat_allotted: boolean;
  };
  round: number;
  updatedAt: string;
}

export async function getStudentDeliverables(): Promise<StudentDeliverable[]> {
  const defaultDeliverables: StudentDeliverable[] = [
    {
      id: 'del_1',
      studentId: '00000000-0000-0000-0000-000000000011',
      studentName: 'Aarav Mehra',
      phoneNumber: '+91 85446 37096',
      score: 645,
      rank: 7200,
      state: 'Delhi',
      assignedMentorId: 'a0000000-0000-0000-0000-000000000001',
      assignedMentorName: 'Aaditya Ranjan (Senior AIQ Lead)',
      isPremium: true,
      meetingLink: 'https://meet.google.com/neet-vip-aarav',
      choicePdfUrl: 'https://collegemitra.com/docs/aarav_choice_2026.pdf',
      choiceList: [
        {
          id: 'ch_1',
          collegeId: 'e53b4cd0-eed8-42d9-9983-e7a744478ccd',
          collegeName: 'Maulana Azad Medical College (MAMC New Delhi)',
          state: 'Delhi',
          course: 'MBBS',
          quota: 'AIQ_15',
          priorityOrder: 1,
          annualFee: 4500,
          mentorTip: 'Top AIQ choice with massive clinical OPD and internal PG quota advantage'
        },
        {
          id: 'ch_2',
          collegeId: '8bb8161f-eaaf-4ab7-aa40-86c5af393c1d',
          collegeName: 'Vardhman Mahavir Medical College & Safdarjung Hospital (VMMC Delhi)',
          state: 'Delhi',
          course: 'MBBS',
          quota: 'AIQ_15',
          priorityOrder: 2,
          annualFee: 38000,
          mentorTip: '2900 hospital beds, high volume emergency exposure, IPU reservation'
        }
      ],
      status: {
        choice_list_sent: true,
        video_call_done: true,
        seat_allotted: false
      },
      round: 1,
      updatedAt: new Date().toISOString()
    }
  ];

  try {
    const { data, error } = await supabase
      .from('student_deliverables')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data && data.length > 0) {
      const mapped = data.map((d: any) => ({
        id: d.id,
        studentId: d.student_id,
        studentName: d.student_name,
        phoneNumber: d.phone_number || '+91 85446 37096',
        score: d.score || 600,
        rank: d.rank || 10000,
        state: d.state || 'Delhi',
        assignedMentorId: d.assigned_mentor_id || 'a0000000-0000-0000-0000-000000000001',
        assignedMentorName: d.assigned_mentor_name || 'Aaditya Ranjan (Senior AIQ Lead)',
        isPremium: d.is_premium ?? true,
        meetingLink: d.meeting_link || '',
        choicePdfUrl: d.choice_pdf_url || '',
        choiceList: Array.isArray(d.choice_list) ? d.choice_list : [],
        status: d.status || { choice_list_sent: false, video_call_done: false, seat_allotted: false },
        round: d.round || 1,
        updatedAt: d.updated_at || new Date().toISOString()
      }));
      setLocal('deliverables_queue', mapped);
      return mapped;
    }
  } catch {}

  try {
    const { data, error } = await supabase
      .from('system_configs')
      .select('value')
      .eq('key', 'deliverables_queue')
      .single();
    if (!error && data && data.value) {
      setLocal('deliverables_queue', data.value);
      return data.value as StudentDeliverable[];
    }
  } catch {}

  return getLocal('deliverables_queue', defaultDeliverables);
}

export async function saveStudentDeliverable(deliverable: StudentDeliverable): Promise<boolean> {
  const current = await getStudentDeliverables();
  const exists = current.some(d => d.id === deliverable.id);
  const updated = exists 
    ? current.map(d => d.id === deliverable.id ? deliverable : d)
    : [deliverable, ...current];

  setLocal('deliverables_queue', updated);

  try {
    await supabase.from('student_deliverables').upsert({
      id: deliverable.id,
      student_id: deliverable.studentId,
      student_name: deliverable.studentName,
      phone_number: deliverable.phoneNumber,
      score: deliverable.score,
      rank: deliverable.rank,
      state: deliverable.state,
      assigned_mentor_id: deliverable.assignedMentorId,
      assigned_mentor_name: deliverable.assignedMentorName,
      is_premium: deliverable.isPremium,
      meeting_link: deliverable.meetingLink,
      choice_pdf_url: deliverable.choicePdfUrl,
      choice_list: deliverable.choiceList,
      status: deliverable.status,
      round: deliverable.round,
      updated_at: new Date().toISOString()
    });
  } catch {}

  try {
    await supabase.from('system_configs').upsert({
      key: 'deliverables_queue',
      value: updated,
      updated_at: new Date().toISOString(),
    });
  } catch {}
  return true;
}

// 5b. CRM STUDENT LEADS
export interface StudentLeadCRM {
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

export async function getStudentLeads(): Promise<StudentLeadCRM[]> {
  try {
    const { data, error } = await supabase
      .from('student_leads_crm')
      .select('*, profile:profiles(*), mentor:mentors(*)');
    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        student_name: d.profile?.full_name || 'NEET Aspirant',
        phone_number: d.profile?.phone_number || '+91 85446 37096',
        neet_score: d.profile?.neet_score || 600,
        air_rank: d.profile?.air_rank || 10000,
        domicile_state: d.profile?.domicile_state || 'Delhi',
        lead_score: d.lead_score || 50,
        lead_tier: (d.lead_tier || 'warm') as LeadTier,
        assigned_mentor_id: d.assigned_mentor_id,
        assigned_mentor_name: d.mentor?.full_name,
        is_premium: d.is_premium ?? false,
        predictor_runs: d.predictor_runs || 1,
        comparisons_run: d.comparisons_run || 0,
        viewed_premium_times: d.viewed_premium_times || 0,
        admin_notes: d.admin_notes,
        created_at: d.created_at || 'Just now'
      }));
    }
  } catch {}
  return [];
}

// 6. REAL-TIME CHAT MESSAGES
export interface ChatMessage {
  id: string;
  studentId: string;
  mentorId?: string;
  sender?: 'student' | 'mentor';
  senderType?: 'student' | 'mentor';
  text?: string;
  message?: string;
  time?: string;
  timestamp?: string;
  createdAt?: string;
}

export async function getLiveChatMessages(studentId: string): Promise<ChatMessage[]> {
  const defaultMessages: ChatMessage[] = [
    {
      id: 'm1',
      studentId: 'st_1',
      mentorId: 'a0000000-0000-0000-0000-000000000001',
      sender: 'mentor',
      senderType: 'mentor',
      text: 'Hello Aarav! I have generated your customized Round 1 AIQ & Delhi state choice sequence. Let me know if you want to swap KGMU or VMMC.',
      message: 'Hello Aarav! I have generated your customized Round 1 AIQ & Delhi state choice sequence. Let me know if you want to swap KGMU or VMMC.',
      time: '10:30 AM',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'm2',
      studentId: 'st_1',
      mentorId: 'a0000000-0000-0000-0000-000000000001',
      sender: 'student',
      senderType: 'student',
      text: 'Thank you Sir! What should be my #1 priority between MAMC and VMMC?',
      message: 'Thank you Sir! What should be my #1 priority between MAMC and VMMC?',
      time: '10:35 AM',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'm3',
      studentId: 'st_1',
      mentorId: 'a0000000-0000-0000-0000-000000000001',
      sender: 'mentor',
      senderType: 'mentor',
      text: 'Keep MAMC as Choice 1 for its massive clinical bed volume and internal PG quota.',
      message: 'Keep MAMC as Choice 1 for its massive clinical bed volume and internal PG quota.',
      time: '10:40 AM',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      return data.map(d => {
        const sType = d.sender_type || (d.sender_id === studentId ? 'student' : 'mentor');
        const txt = d.message || d.text || '';
        const tStr = new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          id: d.id,
          studentId: d.student_id || studentId,
          mentorId: d.mentor_id || 'a0000000-0000-0000-0000-000000000001',
          sender: sType,
          senderType: sType,
          text: txt,
          message: txt,
          time: tStr,
          timestamp: d.created_at,
          createdAt: d.created_at
        };
      });
    }
  } catch {}

  const local = getLocal<ChatMessage[]>(`chat_${studentId}`, defaultMessages);
  return local;
}

export async function sendLiveChatMessage(
  studentId: string, 
  senderOrMentor: string, 
  textOrSender: string, 
  possibleText?: string
): Promise<ChatMessage> {
  let sender: 'student' | 'mentor' = 'student';
  let text = '';
  let mentorId = 'a0000000-0000-0000-0000-000000000001';

  if (possibleText !== undefined) {
    // Called as: (studentId, mentorId, sender, text)
    mentorId = senderOrMentor;
    sender = textOrSender as any;
    text = possibleText;
  } else {
    // Called as: (studentId, sender, text)
    sender = senderOrMentor as any;
    text = textOrSender;
  }

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}`,
    studentId,
    mentorId,
    sender,
    senderType: sender,
    text,
    message: text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  const current = getLocal<ChatMessage[]>(`chat_${studentId}`, []);
  const updated = [...current, newMsg];
  setLocal(`chat_${studentId}`, updated);

  try {
    await supabase.from('chat_messages').insert({
      student_id: studentId,
      mentor_id: mentorId,
      message: text,
      created_at: newMsg.createdAt,
      sender_type: sender,
    });
  } catch {}

  return newMsg;
}
