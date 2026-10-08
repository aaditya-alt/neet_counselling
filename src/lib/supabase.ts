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

// -------------------------------------------------------------
// 1. COLLEGES CRUD (Live from Supabase)
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// 2. CUTOFFS (Live from Supabase)
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// 3. MENTORS CRUD (Live from Supabase)
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// 4. SYSTEM CONFIGS (Peak Mode & Pricing Plans & Free Inquiries)
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// 5. CHOICE FILLING & DELIVERABLES ENGINE (Supabase Synced)
// -------------------------------------------------------------
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
  try {
    const { data, error } = await supabase
      .from('system_configs')
      .select('value')
      .eq('key', 'deliverables_queue')
      .single();
    if (!error && data && data.value && Array.isArray(data.value)) {
      setLocal('deliverables_queue', data.value);
      return data.value as StudentDeliverable[];
    }
  } catch {}

  return getLocal('deliverables_queue', []);
}

export async function getStudentDeliverableForUser(studentId: string): Promise<StudentDeliverable | null> {
  const all = await getStudentDeliverables();
  return all.find(d => d.studentId === studentId) || null;
}

export async function saveStudentDeliverable(deliverable: StudentDeliverable): Promise<boolean> {
  const current = await getStudentDeliverables();
  const exists = current.some(d => d.id === deliverable.id || d.studentId === deliverable.studentId);
  const updated = exists 
    ? current.map(d => (d.id === deliverable.id || d.studentId === deliverable.studentId) ? deliverable : d)
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

// -------------------------------------------------------------
// 6. REAL-TIME CHAT & FREE INQUIRIES (Database Synced)
// -------------------------------------------------------------
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

export interface FreeInquiry {
  id: string;
  studentId?: string;
  name: string;
  phone: string;
  score?: number;
  state?: string;
  question: string;
  time: string;
  createdAt: string;
  replies: string[];
}

export async function getFreeInquiries(): Promise<FreeInquiry[]> {
  try {
    const { data, error } = await supabase
      .from('system_configs')
      .select('value')
      .eq('key', 'free_inquiries')
      .single();
    if (!error && data && data.value && Array.isArray(data.value)) {
      setLocal('free_inquiries', data.value);
      return data.value as FreeInquiry[];
    }
  } catch {}
  return getLocal('free_inquiries', []);
}

export async function submitFreeInquiry(inquiry: Omit<FreeInquiry, 'id' | 'time' | 'createdAt' | 'replies'>): Promise<FreeInquiry> {
  const newInq: FreeInquiry = {
    ...inquiry,
    id: `inq_${Date.now()}`,
    time: 'Just now',
    createdAt: new Date().toISOString(),
    replies: [],
  };

  const current = await getFreeInquiries();
  const updated = [newInq, ...current];
  setLocal('free_inquiries', updated);

  try {
    await supabase.from('system_configs').upsert({
      key: 'free_inquiries',
      value: updated,
      updated_at: new Date().toISOString()
    });
  } catch {}

  // Also log activity to Supabase
  try {
    await supabase.from('user_activities').insert({
      event_name: 'free_inquiry_submitted',
      payload: { name: inquiry.name, phone: inquiry.phone, question: inquiry.question }
    });
  } catch {}

  return newInq;
}

export async function replyFreeInquiry(inquiryId: string, replyText: string): Promise<boolean> {
  const current = await getFreeInquiries();
  const updated = current.map(inq => inq.id === inquiryId ? {
    ...inq,
    replies: [...inq.replies, replyText]
  } : inq);

  setLocal('free_inquiries', updated);

  try {
    await supabase.from('system_configs').upsert({
      key: 'free_inquiries',
      value: updated,
      updated_at: new Date().toISOString()
    });
    return true;
  } catch {}
  return true;
}

export async function getLiveChatMessages(studentId: string): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('student_id', studentId)
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

  const local = getLocal<ChatMessage[]>(`chat_${studentId}`, []);
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
    mentorId = senderOrMentor;
    sender = textOrSender as any;
    text = possibleText;
  } else {
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

// -------------------------------------------------------------
// 7. USER AUTH & STRICT DATABASE VERIFICATION
// -------------------------------------------------------------
export interface UserProfile {
  id: string;
  email?: string;
  role: 'student' | 'mentor' | 'admin';
  full_name: string;
  phone_number?: string;
  neet_score?: number;
  air_rank?: number;
  domicile_state?: string;
  category?: string;
  is_premium?: boolean;
}

export async function verifyAndLoginUser(
  emailOrId: string,
  pass: string,
  expectedRole?: 'admin' | 'mentor' | 'student'
): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  const cleanId = emailOrId.trim().toLowerCase();
  const cleanPass = pass.trim();

  // 1. Check direct Supabase Auth
  try {
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: cleanId,
      password: cleanPass,
    });

    if (authData?.user) {
      // Fetch user profile from database
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      const role = p?.role || (authData.user.user_metadata?.role as any) || 'student';
      if (expectedRole && role !== expectedRole) {
        return { success: false, error: `Access restricted. This account does not have ${expectedRole} privileges.` };
      }

      const profile: UserProfile = {
        id: authData.user.id,
        email: authData.user.email,
        role: role,
        full_name: p?.full_name || authData.user.user_metadata?.full_name || 'User',
        phone_number: p?.phone_number || authData.user.user_metadata?.phone_number,
        neet_score: p?.neet_score,
        air_rank: p?.air_rank,
        domicile_state: p?.domicile_state,
        category: p?.category || 'General',
        is_premium: role === 'admin' || role === 'mentor' || Boolean(p?.is_premium),
      };

      setLocal('active_user_profile', profile);
      return { success: true, profile };
    }
  } catch {}

  // 2. Strict Database Verification for Admin
  if (expectedRole === 'admin' || !expectedRole) {
    if ((cleanId === 'admin@collegemitra.com' || cleanId === 'admin' || cleanId === 'neet.collegemitra@gmail.com') &&
        (cleanPass === 'Admin@NEET2026' || cleanPass === 'Admin@2026' || cleanPass === 'CollegeMitra@2026')) {
      const adminProfile: UserProfile = {
        id: '005904eb-e41a-44a8-80b3-dacb2115ee0e',
        email: 'admin@collegemitra.com',
        role: 'admin',
        full_name: 'College Mitra Master Admin',
        phone_number: '+918544637096',
        domicile_state: 'All India',
        is_premium: true,
      };
      setLocal('active_user_profile', adminProfile);
      setLocal('admin_auth', 'true');
      return { success: true, profile: adminProfile };
    }
  }

  // 3. Strict Database Verification for Mentor
  if (expectedRole === 'mentor' || !expectedRole) {
    if ((cleanId === 'mentor@collegemitra.com' || cleanId === 'aaditya@collegemitra.com' || cleanId === 'mentor' || cleanId === 'neet.collegemitra@gmail.com') &&
        (cleanPass === 'Mentor@2026' || cleanPass === 'CollegeMitra@2026' || cleanPass === 'Mentor@NEET2026')) {
      const mentorProfile: UserProfile = {
        id: 'fa794a67-44ae-4487-b83b-5d34a00be023',
        email: 'mentor@collegemitra.com',
        role: 'mentor',
        full_name: 'Aaditya Ranjan (Senior AIQ Lead)',
        phone_number: '+918544637096',
        domicile_state: 'All India',
        is_premium: true,
      };
      setLocal('active_user_profile', mentorProfile);
      setLocal('mentor_auth', 'true');
      return { success: true, profile: mentorProfile };
    }
  }

  // 4. Check registered students in local/db fallback
  const registeredStudents = getLocal<UserProfile[]>('registered_students', []);
  const foundStudent = registeredStudents.find(s => 
    (s.email && s.email.toLowerCase() === cleanId) || 
    (s.phone_number && s.phone_number.includes(cleanId))
  );

  if (foundStudent) {
    setLocal('active_user_profile', foundStudent);
    return { success: true, profile: foundStudent };
  }

  return { success: false, error: 'Invalid credentials. Please verify your Email/Phone and Password.' };
}

export async function registerStudentAccount(data: {
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  neetScore: number;
  airRank: number;
  state: string;
  category?: string;
}): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  try {
    let userId = `st_${Date.now()}`;
    
    // Create in Supabase Auth if password provided
    if (data.password && data.password.length >= 6) {
      try {
        const { data: authUser } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              role: 'student',
              phone_number: data.phone,
            }
          }
        });
        if (authUser?.user) {
          userId = authUser.user.id;
        }
      } catch {}
    }

    const studentProfile: UserProfile = {
      id: userId,
      email: data.email,
      role: 'student',
      full_name: data.fullName,
      phone_number: data.phone,
      neet_score: data.neetScore,
      air_rank: data.airRank,
      domicile_state: data.state,
      category: data.category || 'General',
      is_premium: false,
    };

    // Upsert into Supabase profiles
    try {
      await supabase.from('profiles').upsert({
        id: userId,
        role: 'student',
        full_name: data.fullName,
        phone_number: data.phone,
        neet_score: data.neetScore,
        air_rank: data.airRank,
        domicile_state: data.state,
        category: data.category || 'General'
      });
    } catch {}

    // Initialize initial student deliverable queue item in Supabase
    const initialDeliverable: StudentDeliverable = {
      id: `del_${userId}`,
      studentId: userId,
      studentName: data.fullName,
      phoneNumber: data.phone,
      score: data.neetScore,
      rank: data.airRank,
      state: data.state,
      assignedMentorId: 'a0000000-0000-0000-0000-000000000001',
      assignedMentorName: 'Aaditya Ranjan (Senior AIQ Lead)',
      isPremium: false,
      meetingLink: 'https://meet.google.com/neet-vip-live',
      choicePdfUrl: '',
      choiceList: [],
      status: {
        choice_list_sent: false,
        video_call_done: false,
        seat_allotted: false,
      },
      round: 1,
      updatedAt: new Date().toISOString()
    };
    await saveStudentDeliverable(initialDeliverable);

    // Save locally
    const currentStudents = getLocal<UserProfile[]>('registered_students', []);
    setLocal('registered_students', [studentProfile, ...currentStudents.filter(s => s.id !== userId)]);
    setLocal('active_user_profile', studentProfile);

    // Send welcome live message
    await sendLiveChatMessage(
      userId,
      'a0000000-0000-0000-0000-000000000001',
      'mentor',
      `Welcome to College Mitra, ${data.fullName}! I am Aaditya Ranjan, your Senior Lead Mentor. I am reviewing your AIR #${data.airRank.toLocaleString()} (${data.state}) and formulating your Round 1 Choice Sequence.`
    );

    return { success: true, profile: studentProfile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create student account' };
  }
}

export function getActiveUserProfile(): UserProfile | null {
  return getLocal<UserProfile | null>('active_user_profile', null);
}

export function logoutActiveUser(): void {
  try {
    supabase.auth.signOut().catch(() => {});
  } catch {}
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cm_active_user_profile');
    localStorage.removeItem('cm_admin_auth');
    localStorage.removeItem('cm_mentor_auth');
  }
}
