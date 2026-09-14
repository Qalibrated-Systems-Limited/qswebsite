import ServiceCategory from '@/components/ServiceCategory';

export default function ConstructionEngineeringPage() {
  return (
    <ServiceCategory
      title="Construction & Engineering"
      tagline="Civil, Structural & Electrical"
      intro="Design-and-build civil works, structural engineering, roads and drainage, and certified electrical installation — delivered end-to-end by our in-house projects team."
      path="/construction-engineering"
      faqs={[
        {
          q: 'What construction and engineering services do you offer?',
          a: 'Buildings and general contracting, structural engineering, roads, drainage and external works, and certified electrical installation — delivered end-to-end.',
        },
        {
          q: 'Are you a registered contractor in Kenya?',
          a: 'Yes. Qalibrated Systems Limited is a Kenyan-registered company delivering civil, structural and electrical projects with an in-house projects team.',
        },
        {
          q: 'Do you handle electrical installation and project delivery?',
          a: 'Yes — certified electrical installation plus full project management and delivery.',
        },
      ]}
      groups={[
        {
          heading: 'Civil, Structural & Electrical',
          items: [
            '🏗️ Buildings & General Contracting',
            '📐 Structural Engineering',
            '🛣️ Roads, Drainage & External Works',
            '⚡ Electrical Installation',
            '📋 Project Management & Delivery',
          ],
        },
      ]}
    />
  );
}
