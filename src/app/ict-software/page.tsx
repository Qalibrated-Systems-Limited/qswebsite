import ServiceCategory from '@/components/ServiceCategory';

export default function IctSoftwarePage() {
  return (
    <ServiceCategory
      title="ICT & Software"
      tagline="Software & Systems"
      intro="Purpose-built software and cloud systems for industry — from our QaliTrack ERP and Profleet fleet platform to custom development, cloud deployment, and hands-on support and training."
      path="/ict-software"
      faqs={[
        {
          q: 'What software does Qalibrated Systems develop?',
          a: 'Our QaliTrack ERP and Profleet fleet-management platforms, plus custom software development, cloud deployment and support.',
        },
        {
          q: 'Do you offer fleet management software in Kenya?',
          a: 'Yes — Profleet provides vehicle tracking, fleet and logistics management for Kenyan operators.',
        },
        {
          q: 'Can you build custom software for my business?',
          a: 'Yes — custom development, cloud solutions and hands-on support and training tailored to your operations.',
        },
      ]}
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
