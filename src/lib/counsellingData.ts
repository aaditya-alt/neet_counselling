import { CourseType } from '../types';

export interface CounsellingAuthority {
  id: string;
  state: string;
  name: string;
  short_code: string;
  type: 'central' | 'state' | 'ayush' | 'defense';
  courses: CourseType[];
  quota_handled: string;
  is_open_state: boolean;
  official_website: string;
  registration_portal_url: string;
  registration_fee: {
    general: number;
    reserved: number;
  };
  security_deposit: {
    govt: number;
    private: number;
    deemed?: number;
  };
  domicile_rules: string;
  bond_summary: string;
  procedure_steps: string[];
  documents_required: string[];
  important_notes: string[];
}

export const ALL_INDIA_COUNSELLING_AUTHORITIES: CounsellingAuthority[] = [
  // 1. Central Authorities
  {
    id: 'mcc-central',
    state: 'All India (Central)',
    name: 'Medical Counselling Committee (MCC / DGHS)',
    short_code: 'MCC AIQ',
    type: 'central',
    courses: ['MBBS', 'BDS', 'B.Sc. Nursing'],
    quota_handled: '15% All India Quota, 100% Deemed Universities, Central Universities (AIIMS, JIPMER, AMU, BHU, DU, VMMC), ESIC Quota',
    is_open_state: true,
    official_website: 'https://mcc.nic.in',
    registration_portal_url: 'https://mcc.nic.in/ug-medical-counselling/',
    registration_fee: {
      general: 1000,
      reserved: 500,
    },
    security_deposit: {
      govt: 10000,
      private: 0,
      deemed: 200000,
    },
    domicile_rules: 'Open to all Indian candidates across India with no state domicile restrictions.',
    bond_summary: 'AIIMS/JIPMER/Central Universities generally do not have service bonds; state GMCs under AIQ follow host state service bond policies.',
    procedure_steps: [
      'Step 1: Online Registration & Profile Verification on mcc.nic.in',
      'Step 2: Payment of Non-Refundable Registration Fee + Refundable Security Deposit (₹10,000 for AIQ/Govt or ₹2,00,000 for Deemed)',
      'Step 3: Choice Filling and Locking in Order of Preference',
      'Step 4: Seat Allotment Result Publication (Round 1, Round 2, Round 3, Stray Vacancy)',
      'Step 5: Physical Reporting & Document Verification at Allotted Institute with Original Credentials',
      'Step 6: Seat Upgradation Option for Round 2 and Round 3'
    ],
    documents_required: [
      'NEET UG 2026 Admit Card & Scorecard / Rank Letter',
      'Class 10th Certificate & Marksheet (for Date of Birth proof)',
      'Class 12th Certificate & Marksheet',
      'Eight (8) Passport size photographs matching NEET application',
      'Provisional Allotment Letter generated online',
      'Government Photo ID Proof (Aadhaar / PAN / Passport / Driving License)',
      'SC / ST / OBC-NCL / EWS / PwD Certificate (if applicable, in central format)'
    ],
    important_notes: [
      'Deemed Universities require mandatory ₹2,00,000 security deposit.',
      'Candidates retaining a seat in Round 3 are ineligible for subsequent stray rounds.',
      'Free Exit is permissible in Round 1 only; Round 2 exit incurs forfeiture of security deposit.'
    ]
  },
  {
    id: 'aaccc-ayush',
    state: 'All India (AYUSH)',
    name: 'Ayush Admissions Central Counseling Committee (AACCC)',
    short_code: 'AACCC AYUSH',
    type: 'ayush',
    courses: ['BAMS', 'BHMS', 'BVSc'],
    quota_handled: '15% AIQ Govt/Govt-Aided AYUSH Seats, 100% National Institutes & Deemed AYUSH Universities across India',
    is_open_state: true,
    official_website: 'https://aaccc.gov.in',
    registration_portal_url: 'https://aaccc.gov.in/aacccug/',
    registration_fee: {
      general: 1000,
      reserved: 500,
    },
    security_deposit: {
      govt: 10000,
      private: 50000,
      deemed: 50000,
    },
    domicile_rules: 'Open to all NEET qualified candidates across India without state domicile requirements.',
    bond_summary: 'National Institutes (NIA Jaipur, AIIA Delhi, NIH Kolkata) follow central service norms; State AYUSH colleges have 1-2 year rural bonds.',
    procedure_steps: [
      'Step 1: Registration on AACCC portal (aaccc.gov.in)',
      'Step 2: Payment of registration fee & security deposit',
      'Step 3: Choice Filling for National Institutes (NIA Jaipur, NIH Kolkata), Central Univs (BHU Ayurveda) & State AIQ AYUSH seats',
      'Step 4: Publication of Seat Allotment across Round 1, 2, 3 and Stray Vacancy',
      'Step 5: Verification & Physical Reporting at Allotted Institute'
    ],
    documents_required: [
      'NEET UG Scorecard & Admit Card',
      'Class 10 & 12 Marksheets and Passing Certificates',
      'Category Certificate (EWS/OBC-NCL/SC/ST in Central GOI format)',
      'Aadhaar / Identity Proof',
      'Provisional Allotment Letter from AACCC'
    ],
    important_notes: [
      'Top AYUSH institutes include National Institute of Ayurveda (NIA Jaipur), All India Institute of Ayurveda (AIIA New Delhi), and National Institute of Homoeopathy (NIH Kolkata).'
    ]
  },
  {
    id: 'afmc-pune',
    state: 'All India (Defense)',
    name: 'Armed Forces Medical College (AFMC Pune)',
    short_code: 'AFMC Pune',
    type: 'defense',
    courses: ['MBBS'],
    quota_handled: '150 Defense MBBS Seats (115 Boys + 30 Girls + 5 Sponsored from Friendly Foreign Countries)',
    is_open_state: true,
    official_website: 'https://afmc.nic.in',
    registration_portal_url: 'https://mcc.nic.in (Apply via MCC + Register on afmcdg1d.gov.in)',
    registration_fee: {
      general: 250,
      reserved: 250,
    },
    security_deposit: {
      govt: 0,
      private: 0,
    },
    domicile_rules: 'All Indian citizens with medical and physical fitness as per Armed Forces standards.',
    bond_summary: 'Mandatory service bond to serve as a commissioned Medical Officer in the Armed Forces Medical Services (AFMS) for a specified service duration or ₹65,00,000 penalty.',
    procedure_steps: [
      'Step 1: Apply for AFMC during MCC All India Quota registration',
      'Step 2: Shortlisting based on NEET UG Score cutoffs (Separate for Boys and Girls)',
      'Step 3: Screening at AFMC Pune: ToELR (Test of English Language, Comprehension & Logic Reasoning) + PAT (Psychological Assessment Test)',
      'Step 4: Personal Interview by Medical Board',
      'Step 5: Comprehensive Special Medical Board Examination (SMBE)',
      'Step 6: Final Merit List generated: (NEET Score/4) + ToELR + Interview'
    ],
    documents_required: [
      'NEET UG Admit Card & Scorecard',
      'Class 10 & 12 Marksheets & Certificate',
      'AFMC Call Letter for Screening & Interview',
      'Government ID and Character Certificate from Head of Last Attended Institution',
      'NCC Certificate / Sports Merit (if applicable)'
    ],
    important_notes: [
      'Subsidized education with monthly stipend, uniform allowance, and free hostel accommodation.'
    ]
  },

  // 2. Uttar Pradesh
  {
    id: 'up-dmet',
    state: 'Uttar Pradesh',
    name: 'Directorate of General Medical Education and Training (UP DGME)',
    short_code: 'UP NEET UG',
    type: 'state',
    courses: ['MBBS', 'BDS'],
    quota_handled: '85% State Govt Quota Seats & 100% Open Private Medical/Dental Colleges in Uttar Pradesh',
    is_open_state: true, // Open State for Private MBBS
    official_website: 'https://upneet.gov.in',
    registration_portal_url: 'https://upneet.gov.in/vaccant_result/onallotmainCStatus.aspx',
    registration_fee: {
      general: 2000,
      reserved: 2000,
    },
    security_deposit: {
      govt: 30000,
      private: 200000, // ₹2,00,000 for Private MBBS, ₹1,00,000 for Private BDS
    },
    domicile_rules: 'Govt 85% seats require UP Domicile (Passed 10th & 12th from UP or UP Domicile Certificate). Private Medical/Dental seats are 100% OPEN to all Indian candidates.',
    bond_summary: 'Govt Medical Colleges: 2 Years compulsory rural service bond or ₹10,00,000 penalty (MBBS). Private colleges do not impose government service bonds.',
    procedure_steps: [
      'Step 1: Online Registration on upneet.gov.in & payment of ₹2,000 registration fee',
      'Step 2: Online / Offline Document Verification at designated Nodal Centers',
      'Step 3: Payment of Security Deposit (₹30,000 for Govt / ₹2,00,000 for Private MBBS / ₹1,00,000 for Private BDS) via Net Banking/Debit/Credit Card',
      'Step 4: UP State Merit List Publication',
      'Step 5: Choice Filling & Locking on portal',
      'Step 6: Seat Allotment Publication & Reporting at designated Nodal Center for fee deposition'
    ],
    documents_required: [
      'NEET UG Scorecard & Admit Card',
      'UP NEET Registration Confirmation Slip & Fee Receipt',
      'High School (10th) & Intermediate (12th) Marksheets & Certificates',
      'UP Domicile Certificate (for 85% Govt quota)',
      'Caste Certificate (OBC/SC/ST in UP State Govt format, issued after April 1)',
      'Security Deposit DD / Payment Proof',
      'Affidavit for Gap Year (if applicable)'
    ],
    important_notes: [
      'UP is one of the largest OPEN States with top private institutions: Sharda, Subharti, Hind, Rohilkhand, Muzaffarnagar, Saraswathi, Rama, and Era.',
      'Security deposit of ₹2,00,000 is mandatory to participate in private choice filling.'
    ]
  },

  // 3. Delhi
  {
    id: 'delhi-du-ipu',
    state: 'Delhi (NCT)',
    name: 'Faculty of Medical Sciences (DU) & Guru Gobind Singh Indraprastha University (GGSIPU)',
    short_code: 'Delhi 85% Quota',
    type: 'state',
    courses: ['MBBS', 'BDS', 'BHMS', 'BAMS'],
    quota_handled: '85% Delhi State Domicile Quota in MAMC, LHMC, UCMS (DU) and VMMC, Dr. BSA, NDMC, ACMS (IPU) + Delhi AYUSH (Nehru Homoeopathic, Tibbia College)',
    is_open_state: false,
    official_website: 'http://fmsc.ac.in & http://ipu.ac.in',
    registration_portal_url: 'https://mcc.nic.in (Delhi 85% Quota is conducted via MCC portal for DU/IPU)',
    registration_fee: {
      general: 1000,
      reserved: 500,
    },
    security_deposit: {
      govt: 10000,
      private: 200000,
    },
    domicile_rules: 'Must have completed both 11th and 12th standard schooling from a recognized school located within the National Capital Territory (NCT) of Delhi.',
    bond_summary: 'Delhi Govt GMCs have an undertaking bond (usually ₹3,00,000 if seat is vacated after last date). No compulsory rural service bond.',
    procedure_steps: [
      'Step 1: Register on MCC portal (mcc.nic.in) under Delhi University (DU) / IP University Internal Quota (85%)',
      'Step 2: Submit 11th & 12th Delhi schooling certificate during document verification',
      'Step 3: Choice Filling for MAMC, VMMC, UCMS, LHMC, Dr. BSA, ACMS Army College',
      'Step 4: For AYUSH (BHMS/BAMS), register on DU FMSC portal (fmsc.ac.in) for Nehru Homoeopathic and A&U Tibbia College'
    ],
    documents_required: [
      'Class 11 & 12 Schooling Certificate from Delhi School confirming 2 years regular study in NCT Delhi',
      'NEET UG Admit Card & Scorecard',
      'Class 10 & 12 Marksheet',
      'Category Certificate (Delhi OBC / SC / ST / EWS)'
    ],
    important_notes: [
      'Army College of Medical Sciences (ACMS Delhi) has 100% reservation for wards of serving/retired Army personnel.',
      'Nehru Homoeopathic Medical College (Delhi Quota) offers premier BHMS with high closing ranks.'
    ]
  },

  // 4. Karnataka
  {
    id: 'karnataka-kea',
    state: 'Karnataka',
    name: 'Karnataka Examination Authority (KEA)',
    short_code: 'KEA Karnataka',
    type: 'state',
    courses: ['MBBS', 'BDS', 'BAMS', 'BHMS'],
    quota_handled: '85% Karnataka Govt Quota (G), Private Open Quota Seats (OPN - Open to all India), Private Hyderabad-Karnataka (HK), NRI & Other Quota',
    is_open_state: true, // Huge Open State
    official_website: 'https://cetonline.karnataka.gov.in/kea',
    registration_portal_url: 'https://cetonline.karnataka.gov.in/ugcet2024/',
    registration_fee: {
      general: 1000,
      reserved: 500,
    },
    security_deposit: {
      govt: 0,
      private: 100000,
    },
    domicile_rules: 'Govt quota seats require 7 years study in Karnataka / Karnataka Domicile. Private Open Seats (OPN) are OPEN to all Indian candidates regardless of domicile.',
    bond_summary: 'Karnataka Compulsory Rural Service Act: 1 year compulsory rural service for Govt quota students; Private open seat students have bank guarantee / affidavit clauses.',
    procedure_steps: [
      'Step 1: Online Registration on KEA portal & generation of Application Number',
      'Step 2: Document Verification (Online / Verification Slip generation)',
      'Step 3: Secret Key & Password creation for Option Entry',
      'Step 4: Mock Allotment Round & final option locking',
      'Step 5: Round 1, Round 2, Mop-Up Round Allotments & Choice Selection (Choice 1, 2, 3, 4)',
      'Step 6: Fee payment via Challan/RTGS & download of Admission Order'
    ],
    documents_required: [
      'KEA UG NEET Registration Printout & Verification Slip',
      'NEET UG Scorecard & Admit Card',
      'Class 10 & 12 Original Marksheets',
      'Study Certificate (7 years for Karnataka candidates)',
      'Kannada Medium / Rural Study Certificate (if applicable)',
      'Caste / Income Certificate (Categories 1, 2A, 2B, 3A, 3B for Karnataka students)'
    ],
    important_notes: [
      'Top Private Open Colleges: St. John’s Medical College Bangalore, MS Ramaiah, Kempegowda (KIMS), Vydehi, JSS Mysore, KMC Manipal/Mangalore, JJMMC Davangere.',
      'KEA conducts one of the cleanest choice filling systems with Choice 1 (Satisfied & Accept), Choice 2 (Hold & Upgrade), Choice 3 (Reject & Upgrade), Choice 4 (Exit).'
    ]
  },

  // 5. Maharashtra
  {
    id: 'maharashtra-cet',
    state: 'Maharashtra',
    name: 'State Common Entrance Test Cell, Maharashtra',
    short_code: 'MHT CET Cell',
    type: 'state',
    courses: ['MBBS', 'BDS', 'BAMS', 'BHMS', 'B.Sc. Nursing'],
    quota_handled: '85% State Govt GMC Seats & 100% Institutional / Management Quotas in Private Medical Colleges',
    is_open_state: false, // Private 85% is closed to non-domicile except 15% institutional quota
    official_website: 'https://cetcell.mahacet.org',
    registration_portal_url: 'https://medical2026.mahacet.org/NEET-UG-2026/',
    registration_fee: {
      general: 1000,
      reserved: 1000,
    },
    security_deposit: {
      govt: 0,
      private: 50000,
    },
    domicile_rules: 'Maharashtra Domicile Certificate AND 10th/12th passing from a school/junior college in Maharashtra is mandatory for 85% State & Private Quota.',
    bond_summary: 'Govt Medical Colleges: 1 Year Compulsory Social Service Bond with ₹10,00,000 penalty; BMC Mumbai colleges also require ₹10,00,000 penalty.',
    procedure_steps: [
      'Step 1: Registration on mahacet.org and document upload',
      'Step 2: Publication of Provisional State Merit List (SML)',
      'Step 3: Choice Filling (CAP Round 1, CAP Round 2, CAP Round 3, Online Stray Vacancy)',
      'Step 4: Seat Allotment Publication & Status Retention Form submission (if satisfied)',
      'Step 5: Physical reporting to allotted college with Demand Draft of tuition fees'
    ],
    documents_required: [
      'Maharashtra Domicile / Nationality Certificate',
      'NEET UG Scorecard & Admit Card',
      'SSC (10th) & HSC (12th) Marksheet & Passing Certificate',
      'Caste Certificate & Caste Validity Certificate (CVC is mandatory for reserved categories)',
      'Non-Creamy Layer (NCL) Certificate valid up to 31st March 2027',
      'Medical Fitness Certificate (Annexure-H)'
    ],
    important_notes: [
      'Caste Validity Certificate (CVC) is mandatory at the time of document verification for SC/ST/VJ/NT/OBC/SBC candidates in Maharashtra.',
      'Top Colleges: Grant Medical College (JJ Hospital), KEM Mumbai, Sion (LTMMC), Nair (TNMC), BJMC Pune, GMC Nagpur.'
    ]
  },

  // 6. Bihar
  {
    id: 'bihar-bceceb',
    state: 'Bihar',
    name: 'Bihar Combined Entrance Competitive Examination Board (BCECEB - UGMAC)',
    short_code: 'BCECEB UGMAC',
    type: 'state',
    courses: ['MBBS', 'BDS', 'BAMS', 'BHMS'],
    quota_handled: '85% State Govt Quota Seats & 100% Private Medical/Dental Seats (UGMAC)',
    is_open_state: true, // Private seats are open to other states
    official_website: 'https://bceceboard.bihar.gov.in',
    registration_portal_url: 'https://bceceboard.bihar.gov.in/UGMAC_Index.php',
    registration_fee: {
      general: 1200,
      reserved: 600,
    },
    security_deposit: {
      govt: 10000,
      private: 200000,
    },
    domicile_rules: 'Bihar Domicile / Residential Certificate is required for 85% Govt Medical/Dental seats. Private Medical College seats are open to all India students in subsequent rounds.',
    bond_summary: 'Govt Colleges: 3 years rural service bond or ₹20,00,000 penalty for leaving MBBS or failing to serve bond.',
    procedure_steps: [
      'Step 1: Registration for UGMAC (Under Graduate Medical Admission Counselling) on bceceboard.bihar.gov.in',
      'Step 2: Publication of UGMAC Merit Rank Card',
      'Step 3: Online Choice Filling & Locking',
      'Step 4: Provisional Seat Allotment Order download',
      'Step 5: Document Verification at BCECEB Office (IAS Association Building, Near Patna Airport) / Designated Center'
    ],
    documents_required: [
      'BCECEB UGMAC Rank Card & Registration Part A/B Slip',
      'NEET UG Scorecard & Admit Card',
      'Bihar Residential / Domicile Certificate issued by Circle Officer (CO/SDO)',
      'Caste Certificate (BC/EBC/SC/ST/EWS for Bihar candidates)',
      '10th & 12th Marksheets & Certificates',
      'Six passport photos matching NEET application'
    ],
    important_notes: [
      'Top Govt: PMCH Patna, NMCH Patna, DMCH Darbhanga, IGIMS Patna, JLNMC Bhagalpur, VIMS Pawapuri.',
      'Top Private: Katihar Medical College (KMC Katihar), Mata Gujri Memorial Medical College (MGMMC Kishanganj), Narayan Medical College Sasaram.'
    ]
  },

  // 7. Rajasthan
  {
    id: 'rajasthan-rajug',
    state: 'Rajasthan',
    name: 'NEET UG Medical & Dental Admission/Counseling Board, Rajasthan',
    short_code: 'Rajasthan NEET UG',
    type: 'state',
    courses: ['MBBS', 'BDS'],
    quota_handled: '85% Govt Quota, Govt Society Management Seats & Private Medical Colleges in Rajasthan',
    is_open_state: true, // Private & Society seats are open in Round 2/3
    official_website: 'https://medicaleducation.rajasthan.gov.in/home',
    registration_portal_url: 'https://rajugneet2026.com',
    registration_fee: {
      general: 2000,
      reserved: 1200,
    },
    security_deposit: {
      govt: 10000,
      private: 200000,
    },
    domicile_rules: 'Rajasthan Domicile required for 85% Govt and Management Quota in Round 1. Private college seats open to non-domicile students in Round 2 and Round 3.',
    bond_summary: 'Rajasthan Govt GMCs: 2 Years compulsory rural service bond of ₹5,00,000. Govt Society GMCs (RajMES) have distinct bond rules.',
    procedure_steps: [
      'Step 1: Application Form Part 1 & Part 2 submission on rajugneet portal',
      'Step 2: Deposit of Registration Fee & Security Deposit',
      'Step 3: Physical Document Verification at SMS Medical College, Jaipur (for PwD/Defense/NRI/Reserved categories)',
      'Step 4: Publication of State Merit List',
      'Step 5: Online Choice Filling & Locking',
      'Step 6: Seat Allotment & Reporting at Academic Block, SMS Medical College, Jaipur'
    ],
    documents_required: [
      'Rajasthan NEET UG Application Form Copy & Fee Receipt',
      'NEET UG Scorecard & Admit Card',
      'Rajasthan Domicile Certificate (Bonafide Certificate)',
      'Caste Certificate (OBC/MBC/EWS/SC/ST valid as per state norms)',
      'Class 10th & 12th Marksheets',
      'Valid Photo ID Proof'
    ],
    important_notes: [
      'Top Govt: SMS Medical College Jaipur, RUHS CMS Jaipur, SNMC Jodhpur, SPMC Bikaner, RNT Udaipur, Govt Medical College Kota.',
      'Top Private: Mahatma Gandhi Medical College Jaipur, Geetanjali Medical College Udaipur, NIMS Jaipur.'
    ]
  },

  // 8. West Bengal
  {
    id: 'wb-wbmcc',
    state: 'West Bengal',
    name: 'West Bengal Medical Counseling Committee (WBMCC)',
    short_code: 'WBMCC Bengal',
    type: 'state',
    courses: ['MBBS', 'BDS', 'BAMS', 'BHMS'],
    quota_handled: '85% State Govt Quota Seats & Private State Quota / Management Quota Seats in West Bengal',
    is_open_state: true, // Management quota in private colleges is open
    official_website: 'https://wbmcc.nic.in',
    registration_portal_url: 'https://wbmcc.nic.in/ug-counselling/',
    registration_fee: {
      general: 2000,
      reserved: 1500,
    },
    security_deposit: {
      govt: 0,
      private: 100000,
    },
    domicile_rules: 'West Bengal Proforma a1/a2/b Domicile certificate required for 85% Govt & State Quota Private seats. Management seats in private colleges are open to all India.',
    bond_summary: 'West Bengal Govt Medical Colleges: Mandatory 1-year rural service bond or ₹10,00,000 penalty.',
    procedure_steps: [
      'Step 1: Registration and Profile creation on wbmcc.nic.in',
      'Step 2: Online Fee Payment & Generation of Acknowledgement Slip',
      'Step 3: In-person Document Verification at designated Verification Centers (Medical College Kolkata, IPGMER, etc.)',
      'Step 4: Publication of Verified Candidate List & State Merit List',
      'Step 5: Choice Filling and Choice Locking',
      'Step 6: Seat Allotment Result & Physical Admission'
    ],
    documents_required: [
      'WBMCC Registration Slip & Verification Acknowledgment',
      'NEET UG Admit Card & Scorecard',
      'Domicile Certificate (Proforma a1, a2 or b from designated competent authority)',
      'Class 10 & 12 Marksheets',
      'Caste Certificate (SC/ST/OBC-A/OBC-B issued by Sub-Divisional Officer in WB)',
      'Medical Certificate of Fitness'
    ],
    important_notes: [
      'Top Govt: Medical College Kolkata (Oldest in Asia), IPGMER & SSKM Hospital, Nil Ratan Sircar (NRS), RG Kar, Calcutta National Medical College (CNMC).',
      'Top Private: KPC Medical College Jadavpur, ICARE Institute Haldia, IQ City Medical College Durgapur, Jagannath Gupta Budge Budge.'
    ]
  },

  // 9. Tamil Nadu
  {
    id: 'tn-dme',
    state: 'Tamil Nadu',
    name: 'Directorate of Medical Education and Selection Committee (TN Health)',
    short_code: 'TN DME',
    type: 'state',
    courses: ['MBBS', 'BDS'],
    quota_handled: '85% Govt Quota (Govt & Govt-aided colleges) & 100% Management Quota in Self-Financing Medical Colleges (including CMC Vellore)',
    is_open_state: true, // Management quota is open to All India
    official_website: 'https://tnmedicalselection.net',
    registration_portal_url: 'https://tnmedicalselection.net/ug_registration/',
    registration_fee: {
      general: 500,
      reserved: 0,
    },
    security_deposit: {
      govt: 0,
      private: 100000,
    },
    domicile_rules: 'Tamil Nadu Nativity Certificate required for Govt Quota seats. Management Quota seats in Private / Self-Financing colleges are open to all Indian candidates.',
    bond_summary: 'Tamil Nadu Govt Medical Colleges: 5 Years service bond in Govt Primary Health Centers/Hospitals or ₹5,00,000 penalty.',
    procedure_steps: [
      'Step 1: Online Application on tnmedicalselection.net for Govt Quota and Management Quota separately',
      'Step 2: Publication of Tamil Nadu State Rank List (Govt & Management separate)',
      'Step 3: Online Choice Filling & Locking based on Rank turns',
      'Step 4: Provisional Seat Allotment result publication',
      'Step 5: Download Provisional Allotment Order after tuition fee deposition',
      'Step 6: Reporting at allotted Medical College'
    ],
    documents_required: [
      'TN Medical Selection Application Printout',
      'NEET UG Scorecard & Admit Card',
      'Nativity Certificate (for Govt Quota candidates)',
      'Class 10th, 11th, and 12th Marksheets',
      'Community Certificate (OC, BC, BCM, MBC/DNC, SC, SCA, ST)',
      'Transfer Certificate from School last studied'
    ],
    important_notes: [
      'Top Govt: Madras Medical College (MMC Chennai), Stanley Medical College, Kilpauk Medical College, Madurai Medical College, Coimbatore Medical College.',
      'Top Private / Open: Christian Medical College (CMC Vellore - Management / Open Category), PSG Institute of Medical Sciences Coimbatore.'
    ]
  },

  // 10. Kerala
  {
    id: 'kerala-cee',
    state: 'Kerala',
    name: 'Commissioner for Entrance Examinations (CEE Kerala - KEAM)',
    short_code: 'CEE Kerala',
    type: 'state',
    courses: ['MBBS', 'BDS', 'BAMS', 'BHMS'],
    quota_handled: '85% State Govt Quota & 100% Private Self-Financing Medical Colleges in Kerala',
    is_open_state: true, // Non-Keralite Category II (NK-II) can apply for Private Open seats
    official_website: 'https://cee.kerala.gov.in',
    registration_portal_url: 'https://cee.kerala.gov.in/keamonline2026/',
    registration_fee: {
      general: 600,
      reserved: 300,
    },
    security_deposit: {
      govt: 0,
      private: 0,
    },
    domicile_rules: 'Keralite status (Category-I) required for Govt Quota seats. Non-Keralite (Category-II) can apply for Private Medical College Open Seats.',
    bond_summary: 'Kerala Govt Medical Colleges: 1 year compulsory rural service with ₹10,00,000 bond penalty.',
    procedure_steps: [
      'Step 1: Online KEAM registration & NEET score submission on cee.kerala.gov.in',
      'Step 2: Kerala State Medical Rank List generation',
      'Step 3: Centralized Allotment Process (CAP) Option Registration & Locking',
      'Step 4: Trial Allotment & Final Phase Allotments',
      'Step 5: Fee payment at designated Head Post Offices / Online & College Joining'
    ],
    documents_required: [
      'KEAM Confirmation Page & NEET UG Scorecard',
      'Nativity / Domicile Certificate',
      'Class 10 & 12 Passing Certificates & Marksheets',
      'Income & Caste Certificate (for reservation categories in Kerala)'
    ],
    important_notes: [
      'Kerala private medical colleges offer some of the most strictly regulated affordable fee structures in India.',
      'Top Colleges: Govt Medical College Thiruvananthapuram, GMC Kozhikode, GMC Kottayam, Amrita Institute of Medical Sciences (Kochi - Deemed).'
    ]
  },

  // 11. Madhya Pradesh
  {
    id: 'mp-dme',
    state: 'Madhya Pradesh',
    name: 'Directorate of Medical Education (DME MP Online)',
    short_code: 'MP DME',
    type: 'state',
    courses: ['MBBS', 'BDS'],
    quota_handled: '85% State Govt Quota & 100% Private Medical College Seats in MP',
    is_open_state: true, // Open in Round 2 / Mop-up if state seats remain vacant
    official_website: 'https://dme.mponline.gov.in',
    registration_portal_url: 'https://dme.mponline.gov.in/portal/services/dmemp/default.html',
    registration_fee: {
      general: 1100,
      reserved: 1100,
    },
    security_deposit: {
      govt: 10000,
      private: 100000,
    },
    domicile_rules: 'MP Domicile is given 100% preference in Round 1. Non-domicile candidates are eligible for Private College seats in Round 2 and Mop-up rounds.',
    bond_summary: 'MP Govt Medical Colleges: Mandatory 1-2 years rural service or ₹10,00,000 to ₹25,00,000 bond (under Medhavi Chhatra Yojana: 2 years rural bond or ₹10,00,000).',
    procedure_steps: [
      'Step 1: Profile Creation and Registration on dme.mponline.gov.in',
      'Step 2: Document Verification at Govt Medical Colleges in MP',
      'Step 3: Publication of State Merit List',
      'Step 4: Choice Filling & Locking',
      'Step 5: Real-time Seat Allotment & Admission Formalities'
    ],
    documents_required: [
      'DME MP Registration Receipt',
      'MP Domicile / Mool Niwas Praman Patra',
      'NEET UG Scorecard & Admit Card',
      'Income Certificate / Medhavi Yojana declaration',
      'Class 10 & 12 Marksheets'
    ],
    important_notes: [
      'Top Govt: MGM Medical College Indore, Gandhi Medical College Bhopal, NSCB Jabalpur, GRMC Gwalior.',
      'Top Private: Sri Aurobindo Institute (SAIMS Indore), RD Gardi Ujjain, Index Medical College Indore, LN Medical College Bhopal.'
    ]
  },

  // 12. Gujarat
  {
    id: 'gujarat-acpugmec',
    state: 'Gujarat',
    name: 'Admission Committee for Professional Undergraduate Medical Educational Courses (ACPUGMEC / MedAdmisGujarat)',
    short_code: 'MedAdmis Gujarat',
    type: 'state',
    courses: ['MBBS', 'BDS', 'BAMS', 'BHMS'],
    quota_handled: '85% State Govt GMCs, GMERS Society Medical Colleges & 100% Private SFI Colleges in Gujarat',
    is_open_state: false, // Closed state - strictly domicile
    official_website: 'https://www.medadmgujarat.org',
    registration_portal_url: 'https://www.medadmgujarat.org/ug/home.aspx',
    registration_fee: {
      general: 1000,
      reserved: 1000,
    },
    security_deposit: {
      govt: 0,
      private: 0,
    },
    domicile_rules: 'Gujarat Domicile AND must have passed Class 10 & 12 from Gujarat State Board or CBSE/ICSE schools located in Gujarat.',
    bond_summary: 'Govt Medical Colleges: 1 year rural service bond or ₹20,00,000 penalty. GMERS Society Colleges: 1 year service bond or ₹5,00,000 penalty.',
    procedure_steps: [
      'Step 1: Purchase PIN online on medadmgujarat.org (₹1,000)',
      'Step 2: Online Registration using PIN and Roll Number',
      'Step 3: In-person Document Verification at designated Help Centers (GMERS / GMCs across Gujarat)',
      'Step 4: Publication of Merit List (General, SC, ST, SEBC, EWS)',
      'Step 5: Choice Filling and Mock Round',
      'Step 6: Round 1 Allotment & Tuition fee payment at Axis Bank branches'
    ],
    documents_required: [
      'MedAdmis Gujarat Registration Slip & PIN receipt',
      'Class 10 & 12 Marksheets from Gujarat school',
      'Gujarat Domicile / Birth Certificate showing birth in Gujarat',
      'SEBC Non-Creamy Layer Certificate (issued on/after April 1)',
      'NEET UG Scorecard'
    ],
    important_notes: [
      'Top Govt: BJ Medical College Ahmedabad, Govt Medical College Baroda, GMC Surat, GMC Rajkot, GMERS Sola Ahmedabad.'
    ]
  },

  // 13. Andhra Pradesh & Telangana
  {
    id: 'ap-ntruhs',
    state: 'Andhra Pradesh',
    name: 'Dr. YSR University of Health Sciences (YSRUHS / NTRUHS)',
    short_code: 'AP YSRUHS',
    type: 'state',
    courses: ['MBBS', 'BDS', 'BAMS', 'BHMS'],
    quota_handled: 'Competent Authority Quota (CQ - 85% Local AP Domicile) & Management Quota (MQ - Category B & C Open to all India)',
    is_open_state: true, // Management Quota Cat-B is open
    official_website: 'https://drysr.uhsap.in',
    registration_portal_url: 'https://apmedadm.aptonline.in/',
    registration_fee: {
      general: 2950,
      reserved: 2360,
    },
    security_deposit: {
      govt: 0,
      private: 100000,
    },
    domicile_rules: 'Competent Authority Quota (CQ) requires AP Local Area study certificate (AU / SVU regions). Management Quota (Category B) is 100% OPEN to all Indian candidates.',
    bond_summary: 'Govt Colleges: 1 year rural service bond or ₹3,00,000 penalty. Seat discontinuation bond is ₹3,00,000.',
    procedure_steps: [
      'Step 1: Notification for Competent Authority Quota (CQ) and Management Quota (MQ) separately',
      'Step 2: Online Registration & Document Upload on aptonline portal',
      'Step 3: Verification of uploaded certificates and State Merit Order publication',
      'Step 4: Web Options entry for Colleges & Courses',
      'Step 5: Seat Allotment notification & University Fee payment'
    ],
    documents_required: [
      'NEET UG Scorecard & Admit Card',
      'AP Local Area / Study Certificate (Class 6 to 12) for CQ',
      'Class 10 & 12 Marksheets',
      'Caste Certificate (BC/SC/ST/EWS)',
      'Transfer Certificate'
    ],
    important_notes: [
      'Category B (Management Quota) private seats in Andhra Pradesh are popular nationwide for high academic standards and transparent online allotment.'
    ]
  },
  {
    id: 'telangana-knruhs',
    state: 'Telangana',
    name: 'Kaloji Narayana Rao University of Health Sciences (KNRUHS Warangal)',
    short_code: 'TS KNRUHS',
    type: 'state',
    courses: ['MBBS', 'BDS', 'BAMS', 'BHMS'],
    quota_handled: 'Competent Authority Quota (CQ - 85% Local TS Domicile) & Management Quota (MQ - Category B Open to all India)',
    is_open_state: true, // MQ Cat B is open
    official_website: 'https://knruhs.telangana.gov.in',
    registration_portal_url: 'https://tsmedadm.tsche.in/',
    registration_fee: {
      general: 3500,
      reserved: 2900,
    },
    security_deposit: {
      govt: 0,
      private: 100000,
    },
    domicile_rules: 'CQ seats require 4 continuous years study in Telangana (OU region). Management Quota Category-B seats are open to all Indian candidates.',
    bond_summary: 'Govt Colleges: 1 year compulsory rural service. Seat discontinuation bond of ₹20,00,000 if leaving seat after final phase.',
    procedure_steps: [
      'Step 1: Online Registration for CQ and MQ on knruhs portal',
      'Step 2: Certificate verification & Provisional Merit List display',
      'Step 3: Web-based Choice Filling (One-time or phase-wise option entry)',
      'Step 4: Seat Allotment Publication & University Fee Payment',
      'Step 5: Reporting at allotted Medical College'
    ],
    documents_required: [
      'NEET UG Scorecard & Hall Ticket',
      'Class 10 & Inter (12th) Memo of Marks',
      'Study Certificates (Class 6 to Intermediate)',
      'Caste Certificate (BC-A/B/C/D/E, SC, ST)',
      'Residence / Domicile Certificate'
    ],
    important_notes: [
      'Top Govt: Osmania Medical College Hyderabad, Gandhi Medical College Secunderabad, Kakatiya Medical College Warangal.',
      'Top Private (Open MQ): Apollo Institute of Medical Sciences Hyderabad, Kamineni Academy, Deccan College of Medical Sciences.'
    ]
  },

  // 14. Haryana
  {
    id: 'haryana-dmer',
    state: 'Haryana',
    name: 'Directorate of Medical Education and Research, Haryana (Pt. BD Sharma UHS Rohtak)',
    short_code: 'DMER Haryana',
    type: 'state',
    courses: ['MBBS', 'BDS'],
    quota_handled: '85% State Govt Quota Seats & 100% Private Medical College Seats in Haryana',
    is_open_state: true, // Private medical colleges are open
    official_website: 'https://dmer.haryana.gov.in',
    registration_portal_url: 'https://uhsrugcounselling.com',
    registration_fee: {
      general: 4000,
      reserved: 1000,
    },
    security_deposit: {
      govt: 10000,
      private: 100000,
    },
    domicile_rules: 'Haryana Resident Certificate (Bonafide) is required for 85% Govt seats. Private Medical Colleges (SGT Gurgaon, NC Medical College Israna, World College Jhajjar, Al Falah) are open to all Indian candidates.',
    bond_summary: 'Govt Medical Colleges: Haryana Service Incentive Bond policy (Govt pays loan incentive if candidate joins state service for 5 years after MBBS; otherwise candidate pays amortized loan).',
    procedure_steps: [
      'Step 1: Registration on uhsrugcounselling.com',
      'Step 2: Security Deposit deposition online',
      'Step 3: Choice filling for Govt GMCs, Kalpana Chawla, SHKM Nalhar, and Private colleges',
      'Step 4: Provisional Allotment publication',
      'Step 5: Physical Document Verification at Committee Room, Pt. BD Sharma PGIMS Rohtak'
    ],
    documents_required: [
      'Haryana Resident Certificate (for Govt quota)',
      'Parivar Pehchan Patra (PPP ID / Family ID for Haryana residents)',
      'NEET UG Scorecard & Admit Card',
      'Class 10 & 12 Marksheet',
      'Caste Certificate (BCA/BCB/SC/Deprived SC/EWS)'
    ],
    important_notes: [
      'Top Govt: Pt. BD Sharma PGIMS Rohtak, BPS Govt Medical College Sonepat, Kalpana Chawla GMC Karnal, SHKM GMC Nalhar Mewat.',
      'Top Private: SGT Medical College Gurugram, Maharishi Markandeshwar (MMU Mullana - Deemed), NC Medical College Panipat.'
    ]
  },

  // 15. Punjab & Himachal Pradesh
  {
    id: 'punjab-bfuhs',
    state: 'Punjab',
    name: 'Baba Farid University of Health Sciences, Faridkot (BFUHS)',
    short_code: 'BFUHS Punjab',
    type: 'state',
    courses: ['MBBS', 'BDS'],
    quota_handled: '85% State Govt Quota & 100% Private / Minority Medical Colleges in Punjab (including CMC Ludhiana & SGRD Amritsar)',
    is_open_state: true, // Open for private seats in subsequent rounds
    official_website: 'https://bfuhs.ac.in',
    registration_portal_url: 'https://bfuhs.ac.in/mbbs_bds/',
    registration_fee: {
      general: 5900,
      reserved: 2950,
    },
    security_deposit: {
      govt: 10000,
      private: 100000,
    },
    domicile_rules: 'Punjab Domicile / Resident Certificate required for Govt Quota seats. Minority & Open seats in Private colleges have distinct quota provisions.',
    bond_summary: 'Govt Medical Colleges: 1 year rural service bond or ₹15,00,000 penalty for discontinuance.',
    procedure_steps: [
      'Step 1: Online Registration on bfuhs.ac.in',
      'Step 2: Verification of Minority/Category claims at BFUHS Faridkot',
      'Step 3: State Merit List publication',
      'Step 4: Online Choice Filling & Seat Allotment',
      'Step 5: Physical reporting and medical examination at allotted institute'
    ],
    documents_required: [
      'Punjab Resident Certificate',
      'NEET UG Scorecard & Admit Card',
      'Class 10 & 12 Marksheets',
      'Minority Certificate (Sikh Minority for SGRD / Christian Minority for CMC Ludhiana)',
      'Caste Certificate (SC/BC Punjab format)'
    ],
    important_notes: [
      'Top Govt: GMC Amritsar, GMC Patiala, GGS Medical College Faridkot.',
      'Top Private: Christian Medical College (CMC Ludhiana), Sri Guru Ram Das Institute (SGRD Amritsar), Adesh Medical College Bathinda.'
    ]
  }
];
