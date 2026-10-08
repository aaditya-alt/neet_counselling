import { createClient } from '@supabase/supabase-js';
import { OFFICIAL_MCC_2026_COLLEGES, OFFICIAL_MCC_2026_CUTOFFS } from './mccData';
import { MOCK_MENTORS, MOCK_PRICING } from './mockData';
import { College, Cutoff, Mentor, PricingPlan } from '../types';

export const SUPABASE_URL = 'https://ersltbjphlrefxqidbcr.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyc2x0YmpwaGxyZWZ4cWlkYmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NDU1ODUsImV4cCI6MjEwNzAyMTU4NX0.U7GwXfEwHW_QZltQuITMcTRkCg-yO17nNz-5FaXDwEA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Resilient API wrappers with official MCC 2026 cutoff records
export async function getColleges(): Promise<College[]> {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .order('name');
    if (error || !data || data.length === 0) {
      return OFFICIAL_MCC_2026_COLLEGES;
    }
    return data as College[];
  } catch {
    return OFFICIAL_MCC_2026_COLLEGES;
  }
}

export async function getCutoffs(round?: number, course?: string): Promise<Cutoff[]> {
  try {
    let query = supabase.from('cutoffs').select('*, college:colleges(*)');
    if (round) query = query.eq('round', round);
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
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
    return data as Cutoff[];
  } catch {
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
}

export async function getMentors(): Promise<Mentor[]> {
  try {
    const { data, error } = await supabase
      .from('mentors')
      .select('*')
      .eq('is_active', true);
    if (error || !data || data.length === 0) {
      return MOCK_MENTORS;
    }
    return data as Mentor[];
  } catch {
    return MOCK_MENTORS;
  }
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
  try {
    const { data, error } = await supabase
      .from('system_configs')
      .select('value')
      .eq('key', 'pricing_matrix')
      .single();
    if (error || !data || !data.value) {
      return MOCK_PRICING;
    }
    return data.value as PricingPlan[];
  } catch {
    return MOCK_PRICING;
  }
}
