import { z } from 'zod';

/** Choice data (plan §10.5). */
export const BRANCHES = [
  'Computer Science',
  'Information Science',
  'AI & ML',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical',
  'Civil',
  'Other',
] as const;

export const YEARS = ['1st', '2nd', '3rd', '4th'] as const;
export const EXPERIENCE_LEVELS = ['None yet', 'Some', 'Comfortable'] as const;
export const PROGRAMMING_LEVELS = ['Basic', 'Intermediate', 'Advanced'] as const;
export const INTERESTS = ['Engineering', 'Creative', 'Industrial', 'Educational', 'Games', 'Other'] as const;

/** Full registration schema (workshop only). Error strings are exact per plan §10.5. */
export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.').max(80, 'Enter your full name.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ''))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit mobile number.')),
  institution: z.string().trim().min(2, 'Enter your college or institution.').max(120, 'Enter your college or institution.'),
  usn: z.string().trim().regex(/^[A-Za-z0-9-]{5,20}$/, 'Enter your USN or student ID.'),
  branch: z.string().min(1, 'Select your branch.'),
  year: z.string().min(1, 'Select your year.'),
  experience: z.string().min(1, 'Select one.'),
  programming: z.string().min(1, 'Select one.'),
  interests: z.array(z.string()).default([]),
  reason: z.string().max(400, 'Keep it under 400 characters.').default(''),
  consent: z.boolean().refine((v) => v === true, { message: 'Please accept to continue.' }),
});

export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationData = z.output<typeof registrationSchema>;

/** Field names validated per step; step 4 (review) has no fields. */
export const STEP_FIELDS: string[][] = [
  ['fullName', 'email', 'phone'],
  ['institution', 'usn', 'branch', 'year'],
  ['experience', 'programming', 'interests', 'reason', 'consent'],
  [],
];

export const STEP_LABELS = ['01 YOU', '02 CAMPUS', '03 INTEREST', '04 REVIEW'] as const;

export const DEFAULT_REGISTRATION: RegistrationInput = {
  fullName: '',
  email: '',
  phone: '',
  institution: 'BMSIT&M',
  usn: '',
  branch: '',
  year: '',
  experience: '',
  programming: '',
  interests: [],
  reason: '',
  consent: false,
};

export const DRAFT_KEY = 'arvr-register-draft';

export function loadDraft(): RegistrationInput | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RegistrationInput>;
    return { ...DEFAULT_REGISTRATION, ...parsed, consent: false }; // consent is never persisted
  } catch {
    return null;
  }
}

export function saveDraft(data: RegistrationInput) {
  try {
    const { consent: _consent, ...rest } = data;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
  } catch {
    /* storage unavailable */
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function registrationJson(data: RegistrationData): string {
  return JSON.stringify(data, null, 2);
}

export function registrationSummary(data: RegistrationData): string {
  return [
    'XR Skill Lab — Registration details',
    '',
    '— You —',
    `Full name: ${data.fullName}`,
    `Email: ${data.email}`,
    `Mobile: +91 ${data.phone}`,
    '',
    '— Campus —',
    `Institution: ${data.institution}`,
    `USN / Student ID: ${data.usn}`,
    `Branch: ${data.branch}`,
    `Year of study: ${data.year}`,
    '',
    '— Interest —',
    `Experience with Unity / VR / 3D: ${data.experience}`,
    `Programming comfort: ${data.programming}`,
    `XR applications that excite you: ${data.interests.length ? data.interests.join(', ') : '—'}`,
    `Why do you want to join?: ${data.reason || '—'}`,
    `Consent given: yes`,
  ].join('\n');
}
