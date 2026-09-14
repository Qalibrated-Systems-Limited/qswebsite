import ServiceCategory from '@/components/ServiceCategory';

export default function AutomationPage() {
  return (
    <ServiceCategory
      title="Automation & Control"
      tagline="Industrial, Building & Transport Systems"
      intro="Control and automation across the plant, the building and the road network — from PLC and SCADA to building management and intelligent transport systems."
      path="/automation"
      faqs={[
        {
          q: 'Do you provide industrial automation in Kenya?',
          a: 'Yes — PLC and SCADA programming, process control, motor control, industrial robotics and full system integration for plants across Kenya and East Africa.',
        },
        {
          q: 'What building management systems do you install?',
          a: 'HVAC control, lighting and energy management, access control, fire safety and building monitoring — integrated into a single building management system.',
        },
        {
          q: 'Do you offer intelligent transport and fleet systems?',
          a: 'Yes — vehicle tracking, fleet management, traffic and parking systems, and logistics integration.',
        },
      ]}
      groups={[
        {
          heading: 'Industrial Automation',
          id: 'industrial',
          badge: 'Process & Control',
          items: [
            { label: '🖥️ PLC Programming', href: '/automation/industrial' },
            { label: '📊 SCADA Systems', href: '/automation/industrial' },
            '⚙️ Process Control',
            '🤖 Industrial Robotics',
            '🧭 Robot Types & Selection',
            '⚡ Motor Control',
            '🛡️ Safety Systems',
            '🔗 System Integration',
          ],
        },
        {
          heading: 'Building Management Systems',
          id: 'building-management',
          items: [
            { label: '❄️ HVAC Control', href: '/automation/building-management' },
            '💡 Lighting Control',
            '⚡ Energy Management',
            '🔐 Access Control',
            '🔥 Fire Safety',
            '📡 Building Monitoring',
          ],
        },
        {
          heading: 'Intelligent Transport Systems',
          id: 'intelligent-transport',
          items: [
            { label: '📍 Vehicle Tracking', href: '/automation/intelligent-transport' },
            '🚛 Fleet Management',
            '🚦 Traffic Management',
            '🅿️ Parking Systems',
            '📊 Transport Optimization',
            '🚚 Logistics Integration',
          ],
        },
      ]}
    />
  );
}
