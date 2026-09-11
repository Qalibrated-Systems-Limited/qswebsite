import ServiceCategory from '@/components/ServiceCategory';

export default function AutomationPage() {
  return (
    <ServiceCategory
      title="Automation & Control"
      tagline="Industrial, Building & Transport Systems"
      intro="Control and automation across the plant, the building and the road network — from PLC and SCADA to building management and intelligent transport systems."
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
