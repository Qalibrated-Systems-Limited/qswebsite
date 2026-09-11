import ServiceCategory from '@/components/ServiceCategory';

export default function IctSoftwarePage() {
  return (
    <ServiceCategory
      title="ICT & Software"
      tagline="Software & Systems"
      intro="Purpose-built software and cloud systems for industry — from our QaliTrack ERP and Profleet fleet platform to custom development, cloud deployment, and hands-on support and training."
      groups={[
        {
          heading: 'Software & Systems',
          items: [
            '🔧 QaliTrack ERP',
            '🚛 Profleet Fleet Management',
            '💻 Custom Software Development',
            '☁️ Cloud Solutions & Hosting',
            '🛠️ Support & Training',
          ],
        },
      ]}
    />
  );
}
