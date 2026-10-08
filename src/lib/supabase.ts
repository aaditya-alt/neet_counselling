import { createClient } from '@supabase/supabase-js';
import { OFFICIAL_MCC_2026_COLLEGES, OFFICIAL_MCC_2026_CUTOFFS } from './mccData';
import { MOCK_MENTORS, MOCK_PRICING } from './mockData';
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
      studentId: 'st_1',
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
          collegeId: 'b0000000-0000-0000-0000-000000000002',
          collegeName: 'Maulana Azad Medical College (MAMC)',
          state: 'Delhi',
          course: 'MBBS',
          quota: 'AIQ_15',
          priorityOrder: 1,
          annualFee: 4445,
          mentorTip: 'Top AIQ choice with exceptional clinical OPD and internal PG quota'
        },
        {
          id: 'ch_2',
          collegeId: 'b0000000-0000-0000-0000-000000000004',
          collegeName: 'King George Medical University (KGMU)',
          state: 'Uttar Pradesh',
          course: 'MBBS',
          quota: 'AIQ_15',
          priorityOrder: 2,
          annualFee: 54600,
          mentorTip: '4500 beds patient flow, great high-volume surgical exposure'
        }
      ],
      status: {
        choice_list_sent: true,
        video_call_done: true,
        seat_allotted: false
      },
      round: 1,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'del_2',
      studentId: 'st_2',
      studentName: 'Sneha Patel',
      phoneNumber: '+91 99201 88900',
      score: 585,
      rank: 42000,
      state: 'Maharashtra',
      assignedMentorId: 'a0000000-0000-0000-0000-000000000002',
      assignedMentorName: 'Rahul Sharma (State Counselling Lead)',
      isPremium: true,
      meetingLink: 'https://meet.google.com/neet-vip-sneha',
      choicePdfUrl: '',
      choiceList: [],
      status: {
        choice_list_sent: false,
        video_call_done: false,
        seat_allotted: false
      },
      round: 1,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'del_3',
      studentId: 'st_3',
      studentName: 'Rohan Deshmukh',
      phoneNumber: '+91 94432 11223',
      score: 510,
      rank: 98000,
      state: 'Karnataka',
      assignedMentorId: 'a0000000-0000-0000-0000-000000000001',
      assignedMentorName: 'Aaditya Ranjan (Senior AIQ Lead)',
      isPremium: true,
      meetingLink: 'https://meet.google.com/neet-vip-rohan',
      choicePdfUrl: '',
      choiceList: [],
      status: {
        choice_list_sent: false,
        video_call_done: false,
        seat_allotted: false
      },
      round: 1,
      updatedAt: new Date().toISOString()
    }
  ];

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
    await supabase.from('system_configs').upsert({
      key: 'deliverables_queue',
      value: updated,
      updated_at: new Date().toISOString(),
    });
  } catch {}
  return true;
}

// 6. REAL-TIME CHAT MESSAGES
export interface ChatMessage {
  id: string;
  studentId: string;
  mentorId: string;
  sender: 'student' | 'mentor';
  text: string;
  time: string;
  createdAt: string;
}

export async function getLiveChatMessages(studentId: string): Promise<ChatMessage[]> {
  const defaultMessages: ChatMessage[] = [
    {
      id: 'm1',
      studentId: 'st_1',
      mentorId: 'a0000000-0000-0000-0000-000000000001',
      sender: 'mentor',
      text: 'Hello Aarav! I have generated your customized Round 1 AIQ & Delhi state choice sequence. Let me know if you want to swap KGMU or VMMC.',
      time: '10:30 AM',
      createdAt: new Date().toISOString()
    },
    {
      id: 'm2',
      studentId: 'st_1',
      mentorId: 'a0000000-0000-0000-0000-000000000001',
      sender: 'student',
      text: 'Thank you Sir! What should be my #1 priority between MAMC and VMMC?',
      time: '10:35 AM',
      createdAt: new Date().toISOString()
    },
    {
      id: 'm3',
      studentId: 'st_1',
      mentorId: 'a0000000-0000-0000-0000-000000000001',
      sender: 'mentor',
      text: 'Keep MAMC as Choice 1 for its massive clinical bed volume and internal PG quota.',
      time: '10:40 AM',
      createdAt: new Date().toISOString()
    }
  ];

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      return data.map(d => ({
        id: d.id,
        studentId: d.student_id || studentId,
        mentorId: d.mentor_id || 'a0000000-0000-0000-0000-000000000001',
        sender: d.sender_type || (d.sender_id === studentId ? 'student' : 'mentor'),
        text: d.message,
        time: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: d.created_at
      }));
    }
  } catch {}

  const local = getLocal<ChatMessage[]>(`chat_${studentId}`, defaultMessages);
  return local;
}

export async function sendLiveChatMessage(studentId: string, mentorId: string, sender: 'student' | 'mentor', text: string): Promise<ChatMessage> {
  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}`,
    studentId,
    mentorId,
    sender,
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString()
  };

  const current = getLocal<ChatMessage[]>(`chat_${studentId}`, []);
  const updated = [...current, newMsg];
  setLocal(`chat_${studentId}`, updated);

  try {
    await supabase.from('chat_messages').insert({
      message: text,
      created_at: newMsg.createdAt,
      sender_type: sender,
    });
  } catch {}

  return newMsg;
}
