import { createMetadata } from '@/utils/seo';

export const metadata = createMetadata({
  title: 'Careers - Qalibrated Systems Limited | Join Our Team in Kenya',
  description:
    'Explore careers at Qalibrated Systems Limited. Join a Kenyan leader in weighing systems, calibration and industrial automation. See our open roles and how to apply.',
  keywords:
    'Qalibrated careers, jobs Kenya, weighing engineer jobs, calibration technician jobs, automation engineer Nairobi, QSL careers',
  path: '/careers',
});

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
