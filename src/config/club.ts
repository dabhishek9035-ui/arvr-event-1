export const CLUB = {
  name: 'AR/VR Hub',
  shortName: 'AR/VR HUB',
  logo: '/brand/arvrhub-logo.png?v=2',
  institution: 'BMSIT&M',
  city: 'Bangalore',
  tagline: 'Build worlds. Step inside them.',
  nav: [
    { label: 'About', id: 'xr', href: '/#xr' },
    { label: 'Skill Lab', id: 'skill-lab', href: '/#skill-lab' },
    { label: 'Curriculum', id: 'curriculum', href: '/#curriculum' },
    { label: 'Labs', id: 'labs', href: '/#labs' },
  ],
  // Club social links — footer icons go live automatically from these.
  social: {
    instagram: 'https://www.instagram.com/arvr_hub_bmsit',
    linkedin: 'https://www.linkedin.com/in/arvr-hub-bmsit',
  },
  // WhatsApp group invite for registered students (shown after registration)
  whatsappGroup: 'https://chat.whatsapp.com/EIkNHN8OQtj5WurMxMhHhm?s=cl&p=a&mlu=4&ilr=4&iam=2',
} as const;
