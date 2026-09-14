import type { MetadataRoute } from 'next';

// Absolute base for canonical sitemap URLs. In the container this env var is
// set to https://qalibrated.com; falls back for local dev.
const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://qalibrated.com').replace(/\/$/, '');

type Freq = MetadataRoute.Sitemap[number]['changeFrequency'];

const routes: { path: string; priority: number; freq: Freq }[] = [
  { path: '/', priority: 1.0, freq: 'weekly' },
  { path: '/about', priority: 0.8, freq: 'monthly' },
  { path: '/services', priority: 0.9, freq: 'monthly' },

  // Weighing
  { path: '/weighing', priority: 0.9, freq: 'monthly' },
  { path: '/weighing/portable-axle', priority: 0.7, freq: 'monthly' },
  { path: '/weighing/software', priority: 0.7, freq: 'monthly' },
  { path: '/weighing/unmanned-automated', priority: 0.7, freq: 'monthly' },
  { path: '/weighing/retail-scales', priority: 0.7, freq: 'monthly' },
  { path: '/weighing/onboard-weighing', priority: 0.7, freq: 'monthly' },
  { path: '/weighing/accessories', priority: 0.6, freq: 'monthly' },
  { path: '/weighing/multideck-singledeck', priority: 0.6, freq: 'monthly' },

  // Calibration
  { path: '/calibration', priority: 0.9, freq: 'monthly' },
  { path: '/calibration/volumetric-tank', priority: 0.7, freq: 'monthly' },
  { path: '/calibration/multideck-singledeck', priority: 0.7, freq: 'monthly' },
  { path: '/calibration/flow-pressure', priority: 0.7, freq: 'monthly' },

  // Automation
  { path: '/automation', priority: 0.9, freq: 'monthly' },
  { path: '/automation/industrial', priority: 0.7, freq: 'monthly' },
  { path: '/automation/building-management', priority: 0.7, freq: 'monthly' },
  { path: '/automation/intelligent-transport', priority: 0.7, freq: 'monthly' },

  // Solutions
  { path: '/filling-packaging', priority: 0.8, freq: 'monthly' },
  { path: '/construction-engineering', priority: 0.8, freq: 'monthly' },
  { path: '/ict-software', priority: 0.8, freq: 'monthly' },

  // Company / content
  { path: '/catalogue', priority: 0.8, freq: 'monthly' },
  { path: '/announcements', priority: 0.7, freq: 'weekly' },
  { path: '/careers', priority: 0.7, freq: 'weekly' },
  { path: '/contact', priority: 0.8, freq: 'monthly' },
  { path: '/support/faq', priority: 0.5, freq: 'monthly' },
  { path: '/support/disclaimer', priority: 0.3, freq: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
