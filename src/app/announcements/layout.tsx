import { createMetadata } from '@/utils/seo';

export const metadata = createMetadata({
  title: 'Announcements - Qalibrated Systems Limited | News & Updates',
  description:
    'The latest announcements, news and updates from Qalibrated Systems Limited — new products, services, events and company milestones.',
  keywords:
    'Qalibrated announcements, QSL news, weighing news Kenya, calibration updates, company announcements',
  path: '/announcements',
});

export default function AnnouncementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
