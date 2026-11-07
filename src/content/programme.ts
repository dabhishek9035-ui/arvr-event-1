/**
 * Canonical content for the XR workshop.
 * Single source of truth: Annexure A Version 2 (XR Technology Training
 * Programme for Engineering Students of BMSIT&M). Copy strings exactly.
 * Commercial details (CIN, GST, vendor contacts, prices) are intentionally
 * excluded — see plan §0.1 D9.
 */

export const PROGRAMME = {
  title: 'XR Technology Training Programme',
  subtitle: 'A Hands-on Extended Reality Workshop',
  institution: 'BMSIT&M, Bangalore',
  durationDays: 2,
  hours: 12,
  courseType: 'Workshop',
  primaryPlatform: 'Unity',
  programming: 'C#',
  xrPlatform: 'Meta Quest 3S / Meta Quest 2 / Meta Quest 3',
  xrPlatformShort: 'Meta Quest 3S / 3 / 2',
  xrFramework: 'OpenXR · XR Interaction Toolkit',
  delivery: 'In person · hands-on · project based',
  assessment: 'Practical exercises and mini-project demonstration',
  dates: '19 & 20 November 2026',
  trainingPartner: 'Bodyclone Innovations Private Limited',
} as const;

export interface Module {
  index: number;
  roman: string;
  title: string;
  hours: number;
  cumulative: number;
  blurb: string;
}

export const MODULES: Module[] = [
  {
    index: 1, roman: 'I', title: 'Introduction to XR', hours: 1, cumulative: 1,
    blurb: 'Explore a standalone VR headset: immersion, presence, 6-DoF tracking, controllers, hand interaction and spatial audio.',
  },
  {
    index: 2, roman: 'II', title: 'Unity Fundamentals', hours: 2, cumulative: 3,
    blurb: 'GameObjects, Transforms, Components, Materials, Lighting, Prefabs and Scenes.',
  },
  {
    index: 3, roman: 'III', title: '3D Environment Development', hours: 2, cumulative: 5,
    blurb: 'Build a complete Virtual Room, with basic 3D asset preparation in Blender.',
  },
  {
    index: 4, roman: 'IV', title: 'XR Setup & OpenXR', hours: 1.5, cumulative: 6.5,
    blurb: 'Configure the Unity XR project, OpenXR, XR Origin, XR Camera and input, then deploy to Quest.',
  },
  {
    index: 5, roman: 'V', title: 'VR Interaction & Locomotion', hours: 1.5, cumulative: 8,
    blurb: 'Teleportation, continuous movement, snap turning and room-scale; grab, throw, ray and direct interaction.',
  },
  {
    index: 6, roman: 'VI', title: 'Physics & Interactive Objects', hours: 1, cumulative: 9,
    blurb: 'Rigidbody, Colliders, Gravity, Mass, Force and Collision.',
  },
  {
    index: 7, roman: 'VII', title: 'XR UI & Spatial Interaction', hours: 1, cumulative: 10,
    blurb: 'World-space UI: buttons, sliders, text, information panels and interactive controls.',
  },
  {
    index: 8, roman: 'VIII', title: 'XR Input & Hand Interaction', hours: 0.5, cumulative: 10.5,
    blurb: 'Controller input, hand tracking, pointing, pinching, grabbing and gestures.',
  },
  {
    index: 9, roman: 'IX', title: 'Optimization, Deployment & Mini-Project Demonstration', hours: 1.5, cumulative: 12,
    blurb: 'Profile frame rate, draw calls, polygons, textures, lighting and memory, then demonstrate your project.',
  },
];

// Dev-style check (plan §1.2): module hours MUST sum to 12.
const HOUR_SUM = MODULES.reduce((acc, m) => acc + m.hours, 0);
if (process.env.NODE_ENV !== 'production' && Math.abs(HOUR_SUM - 12) > 1e-9) {
  throw new Error(`Module hours must sum to 12, got ${HOUR_SUM}`);
}

export type LabTag = 'OUTPUT' | 'MINI PROJECT' | 'FOCUS';

export interface Lab {
  index: number;
  title: string;
  body: string;
  tag: LabTag;
  result: string;
}

export const LABS: Lab[] = [
  {
    index: 1, title: 'Exploring Extended Reality', tag: 'OUTPUT',
    body: 'Explore a standalone VR environment: immersion, presence, 3D spatial interaction, 6-DoF tracking, controllers, hand interaction and spatial audio.',
    result: 'XR exploration report',
  },
  {
    index: 2, title: 'Unity Environment Creation', tag: 'MINI PROJECT',
    body: 'Create a basic 3D environment using GameObjects, Transform, Components, Materials, Lighting, Prefabs and Scenes.',
    result: 'Virtual Room',
  },
  {
    index: 3, title: 'Creating a VR Scene', tag: 'OUTPUT',
    body: 'Configure Unity XR, OpenXR, XR Origin, XR Camera and input; deploy to Quest.',
    result: 'Working VR application on Meta Quest',
  },
  {
    index: 4, title: 'VR Locomotion', tag: 'MINI PROJECT',
    body: 'Implement teleportation, continuous movement, snap turning and room-scale interaction.',
    result: 'Virtual Exploration Environment',
  },
  {
    index: 5, title: 'Object Interaction', tag: 'MINI PROJECT',
    body: 'Implement grab, release, move, rotate, throw, ray interaction and direct interaction.',
    result: 'Interactive Object Environment',
  },
  {
    index: 6, title: 'Physics-Based Interaction', tag: 'MINI PROJECT',
    body: 'Work with Rigidbody, Colliders, Gravity, Mass, Force and Collision.',
    result: 'Physics Interaction Challenge',
  },
  {
    index: 7, title: 'Spatial UI', tag: 'MINI PROJECT',
    body: 'Create world-space UI, buttons, sliders, text, information panels and interactive controls.',
    result: 'Virtual Control Interface',
  },
  {
    index: 8, title: 'XR Input and Hand Interaction', tag: 'OUTPUT',
    body: 'Explore controller input, hand tracking, pointing, pinching, grabbing and gesture-based interaction.',
    result: 'Interactive hand/controller prototype',
  },
  {
    index: 9, title: 'XR Performance', tag: 'FOCUS',
    body: 'Identify and improve frame rate, draw calls, polygon count, texture size, lighting, memory and CPU/GPU load using Unity profiling tools.',
    result: 'Tool · Unity Profiler',
  },
];

export interface MethodStep {
  label: string;
  caption: string;
}

export const METHOD_STEPS: MethodStep[] = [
  { label: 'LEARN', caption: 'Instructor-led demonstrations.' },
  { label: 'BUILD', caption: 'Intensive, in-person hands-on exercises.' },
  { label: 'TEST', caption: 'Run it on a real Meta Quest headset.' },
  { label: 'EXPERIENCE', caption: 'Feel the scene at human scale.' },
  { label: 'IMPROVE', caption: 'Profile, optimise, iterate.' },
  { label: 'DEMONSTRATE', caption: 'Present your mini-project.' },
];

export const XR_DESIGN = {
  principleLead: 'XR should offer ',
  principleHighlight: 'meaningful spatial interaction',
  principleTail: ', not just a 2D app reproduced in 3D.',
  chips: ['OBSERVE', 'INTERACT', 'EXPERIMENT', 'RECEIVE FEEDBACK', 'UNDERSTAND'],
} as const;

export const SKILLS_PATH: string[] = [
  'CREATE UNITY PROJECT',
  'BUILD 3D ENVIRONMENT',
  'CONFIGURE XR',
  'IMPLEMENT INTERACTION',
  'DEPLOY TO META QUEST',
  'TEST',
  'OPTIMIZE',
  'DEMONSTRATE',
];

export interface Outcome {
  id: string;
  text: string;
}

export const OUTCOMES: Outcome[] = [
  { id: 'CO1', text: 'Explain fundamental concepts and characteristics of Extended Reality technologies.' },
  { id: 'CO2', text: 'Create and configure interactive 3D environments using Unity.' },
  { id: 'CO3', text: 'Implement spatial interaction, locomotion, object manipulation and immersive user interfaces in XR applications.' },
  { id: 'CO4', text: 'Build, deploy, test and optimize Unity-based XR applications on standalone VR devices.' },
  { id: 'CO5', text: 'Design and demonstrate an innovative XR application addressing a defined problem, experience or use case.' },
];

export const PREREQS: string[] = [
  'Basic computer programming',
  'Basic understanding of 3D concepts',
  'Basic familiarity with computers',
];

export const PREREQ_NOTE = 'Prior VR, Unity or 3D modelling experience is not mandatory.';

export interface TechItem {
  name: string;
  role: string;
}

export const TECH_STACK: TechItem[] = [
  { name: 'Unity', role: 'Engine' },
  { name: 'C#', role: 'Scripting' },
  { name: 'OpenXR', role: 'Standard' },
  { name: 'XR Interaction Toolkit', role: 'Interaction' },
  { name: 'Meta Quest 3S / 2 / 3', role: 'Hardware' },
  { name: 'Visual Studio / VS Code', role: 'Editor' },
  { name: 'Blender', role: 'Basic 3D asset prep' },
  { name: 'Unity Profiler', role: 'Performance' },
  { name: 'Git / GitHub', role: 'Introductory use' },
];

/** Row split for the two marquee rows (§9.7). Row B repeats Row A items to balance width. */
export const MARQUEE_A: TechItem[] = TECH_STACK.slice(0, 5);
export const MARQUEE_B: TechItem[] = [...TECH_STACK.slice(5), TECH_STACK[0], TECH_STACK[1]];

export const POSITIONING =
  'Transferable across engineering, creative, industrial, educational and other innovative XR applications.';
