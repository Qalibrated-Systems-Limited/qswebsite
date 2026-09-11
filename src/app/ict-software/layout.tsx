import { createMetadata } from '@/utils/seo';

export const metadata = createMetadata({
  title: 'ICT & Software - Qalibrated Systems Limited',
  description:
    'ICT and software solutions from Qalibrated Systems — QaliTrack ERP, Profleet fleet management, custom software development, cloud solutions, and support and training.',
  keywords:
    'ERP Kenya, fleet management software, custom software development, cloud solutions, QaliTrack, Profleet, IT support Nairobi',
  path: '/ict-software',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
