// Edit this file to re-label the entire site. Header, Footer, the homepage
// and SEO defaults all read from here instead of hardcoding copy.
export const SITE = {
  name: 'Suryansh',
  role: 'Wanderer',
  email: 'suryansh.endless@gmail.com',
  tagline: 'Just finding my calling.',
  description:
    'Portfolio of Suryansh — ',
  status: 'Currently a student at KIIT, BBSR. Open to Work.',
  social: [
    { label: 'GitHub', href: 'https://github.com/thatboringcoder' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/suryansh5494/' },
    { label: 'X', href: 'https://x.com/your-username' },
    { label: 'Bluesky', href: 'https://bsky.app/profile/suryansh.life'}
  ],
  locale: 'en',
} as const;

export const NAV_LINKS = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog'}
] as const;
