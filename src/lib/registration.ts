import { z } from 'zod';

/** Branch choices per requirement */
export const BRANCHES = [
  'CSE',
  'AIML',
  'ECE',
  'EEE',
  'MECHANICAL',
  'CIVIL',
  'ISE',
] as const;

/** Semester choices (only from 3-8 sems) */
export const SEMESTERS = ['3', '4', '5', '6', '7', '8'] as const;

/** Prior experience question options */
export const PRIOR_EXPERIENCE_OPTIONS = [
  'No experience, but interested',
  'Worked on small projects',
  'Basic knowledge',
  'Substantial experience',
] as const;

/** Areas of interest options */
export const EXPLORATION_INTERESTS = [
  'Augmented Reality (AR)',
  'Extended Reality (XR)',
  'Unity / Unreal Engine',
  'Virtual Reality (VR)',
  '3D Modelling and Design',
  'Game Development',
  "I'm exploring Everything",
] as const;

/** Laptop specification options */
export const LAPTOP_SPECS_OPTIONS = [
  'Yes, I have a laptop with the required specs',
  'No, I do not have a laptop with the required specs',
] as const;

/** Count words in text helper */
export function countWords(str: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/** URL cleanup helper */
function normalizeUrl(val: string): string {
  const trimmed = val.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Full registration schema */
export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter your full name.')
    .max(80, 'Full name is too long.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address.'),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ''))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.')),
  githubUrl: z
    .string()
    .trim()
    .min(3, 'Enter your GitHub profile link.')
    .transform(normalizeUrl)
    .refine(
      (u) => {
        try {
          const url = new URL(u);
          return url.hostname.includes('github.com');
        } catch {
          return false;
        }
      },
      { message: 'Enter a valid GitHub URL (e.g. https://github.com/your-username).' }
    ),
  linkedinUrl: z
    .string()
    .trim()
    .min(3, 'Enter your LinkedIn profile link.')
    .transform(normalizeUrl)
    .refine(
      (u) => {
        try {
          const url = new URL(u);
          return url.hostname.includes('linkedin.com');
        } catch {
          return false;
        }
      },
      { message: 'Enter a valid LinkedIn URL (e.g. https://linkedin.com/in/your-profile).' }
    ),
  usn: z
    .string()
    .trim()
    .min(4, 'Enter your USN.')
    .max(20, 'USN is too long.')
    .regex(/^[A-Za-z0-9-]{4,20}$/, 'Enter a valid USN (e.g. 1BY21CS001).'),
  branch: z.enum(BRANCHES, {
    errorMap: () => ({ message: 'Select your branch from the list.' }),
  }),
  semester: z.enum(SEMESTERS, {
    errorMap: () => ({ message: 'Select your semester (3 to 8).' }),
  }),
  section: z
    .string()
    .trim()
    .min(1, 'Enter your section (e.g. A, B, C).')
    .max(10, 'Section is too long.'),
  priorExperience: z
    .string()
    .min(1, 'Please select your prior experience level.'),
  whyAttend: z
    .string()
    .trim()
    .min(10, 'Please write at least a sentence explaining why you want to attend.')
    .refine(
      (text) => countWords(text) <= 100,
      { message: 'Your answer must be maximum 100 words.' }
    ),
  interests: z
    .array(z.string())
    .min(1, 'Select at least one area you want to explore.'),
  laptopSpecs: z
    .string()
    .min(1, 'Please confirm your laptop specifications.'),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Please confirm your details to continue.',
  }),
});

export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationData = z.output<typeof registrationSchema>;

/** Field names validated per step */
export const STEP_FIELDS: (keyof RegistrationInput)[][] = [
  ['fullName', 'email', 'phone', 'githubUrl', 'linkedinUrl'],
  ['usn', 'branch', 'semester', 'section'],
  ['priorExperience', 'whyAttend', 'interests', 'laptopSpecs', 'consent'],
  [],
];

export const STEP_LABELS = ['01 YOU', '02 CAMPUS', '03 QUESTIONS', '04 REVIEW'] as const;

export const DEFAULT_REGISTRATION: RegistrationInput = {
  fullName: '',
  email: '',
  phone: '',
  githubUrl: '',
  linkedinUrl: '',
  usn: '',
  branch: 'CSE',
  semester: '3',
  section: '',
  priorExperience: '',
  whyAttend: '',
  interests: [],
  laptopSpecs: '',
  consent: false,
};

export const DRAFT_KEY = 'arvr-register-draft-v2';

export function loadDraft(): RegistrationInput | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RegistrationInput>;
    return { ...DEFAULT_REGISTRATION, ...parsed, consent: false };
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
    'AR/VR Hub — Registration Details',
    '================================',
    'Full Name: ' + data.fullName,
    'USN: ' + data.usn,
    'Email: ' + data.email,
    'Mobile: +91 ' + data.phone,
    'Section: ' + data.section,
    'Semester: ' + data.semester,
    'Branch: ' + data.branch,
    'GitHub: ' + data.githubUrl,
    'LinkedIn: ' + data.linkedinUrl,
    '',
    'Questions:',
    '- Prior Experience: ' + data.priorExperience,
    '- Reason to Attend: ' + data.whyAttend,
    '- Interested In: ' + (data.interests.join(', ') || '—'),
    '- Laptop Specs: ' + data.laptopSpecs,
  ].join('\n');
}
