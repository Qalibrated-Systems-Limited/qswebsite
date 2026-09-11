import ServiceCategory from '@/components/ServiceCategory';

export default function ConstructionEngineeringPage() {
  return (
    <ServiceCategory
      title="Construction & Engineering"
      tagline="Civil, Structural & Electrical"
      intro="Design-and-build civil works, structural engineering, roads and drainage, and certified electrical installation — delivered end-to-end by our in-house projects team."
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
