import { createMetadata } from '@/utils/seo';

export const metadata = createMetadata({
  title: 'Construction & Engineering - Qalibrated Systems Limited',
  description:
    'Civil, structural and electrical construction and engineering by Qalibrated Systems — buildings and general contracting, structural engineering, roads and drainage, and electrical installation.',
  keywords:
    'construction Kenya, civil engineering, structural engineering, electrical installation, roads drainage, general contracting Nairobi',
  path: '/construction-engineering',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
