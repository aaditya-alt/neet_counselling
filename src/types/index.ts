export type UserRole = 'student' | 'mentor' | 'admin';
export type CollegeType = 'govt' | 'private' | 'deemed' | 'central_univ' | 'aiims';
export type CourseType = 'MBBS' | 'BDS' | 'BAMS' | 'BHMS' | 'BVSc' | 'B.Sc. Nursing';
export type QuotaType = 'AIQ_15' | 'STATE_85' | 'DEEMED_100' | 'MANAGEMENT' | 'NRI' | 'ESIC';
export type LeadTier = 'cold' | 'warm' | 'hot' | 'vip_ready';
export type ProbabilityBand = 'safe' | 'moderate' | 'risky';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone_number?: string;
  neet_score?: number;
  air_rank?: number;
  domicile_state?: string;
  category?: string;
  created_at?: string;
}

export interface College {
  id: string;
  name: string;
  slug: string;
  state: string;
  city: string;
  type: CollegeType;
  courses_offered: CourseType[];
  total_mbbs_seats: number;
  annual_tuition_fee: number;
  hostel_fee: number;
  security_deposit: number;
  hospital_bed_count: number;
  average_daily_patient_flow: number;
  bond_duration_years: number;
  bond_penalty_amount: number;
  pg_quota_available: boolean;
  website_url?: string;
  is_verified?: boolean;
}

export interface Cutoff {
  id: string;
  college_id: string;
  year: number;
  round: number;
  quota: QuotaType;
  category: string;
  opening_rank?: number;
  closing_rank: number;
  closing_score?: number;
  college?: College;
}

export interface PredictionResult {
  college: College;
  cutoff: Cutoff;
  probability: ProbabilityBand;
  matchScore: number;
  isDeemedDepositWarning: boolean;
  notes: string;
}

export interface Mentor {
  id: string;
  full_name: string;
  specialization: string;
  phone_number: string;
  is_active: boolean;
  max_capacity: number;
  assigned_count: number;
}

export interface PricingPlan {
  id: string;
  title: string;
  base_price: number;
  offer_price: number;
  discount_pct: number;
  features: string[];
  is_active: boolean;
}

export interface SystemConfigs {
  feature_flags: {
    free_chat_enabled: boolean;
    peak_mode: boolean;
    state_counselling_live?: boolean;
  };
  pricing_matrix: PricingPlan[];
}
