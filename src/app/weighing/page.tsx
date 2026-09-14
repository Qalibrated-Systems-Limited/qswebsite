import ServiceCategory from '@/components/ServiceCategory';

export default function WeighingPage() {
  return (
    <ServiceCategory
      title="Weighing Systems"
      tagline="Precision Weighing"
      intro="From truck weighbridges and axle weighers to laboratory balances and hazardous-area scales — a complete weighing range, verified and supported across Kenya and East Africa."
      path="/weighing"
      faqs={[
        {
          q: 'Where can I buy a weighbridge in Kenya?',
          a: 'Qalibrated Systems Limited supplies, installs and maintains truck weighbridges, axle weighers and industrial scales across Kenya from our Nairobi base (QSL Centre, off Mombasa Road), with service teams reaching Mombasa and Kisumu.',
        },
        {
          q: 'Are your weighbridges legal for trade?',
          a: 'Yes. We supply legal-for-trade weighing systems and provide KENAS-accredited (ISO/IEC 17025:2017) calibration and verification so your weighbridge meets Kenyan legal-metrology requirements.',
        },
        {
          q: 'Do you offer weighbridge software and automation?',
          a: 'Yes — unmanned/automated weighbridge software with RFID, cameras, barriers and reporting that integrate with your operations.',
        },
        {
          q: 'How much does a weighbridge cost in Kenya?',
          a: 'Cost depends on capacity, platform length and level of automation. Contact us for a free site assessment and a detailed quotation.',
        },
      ]}
      groups={[
        {
          heading: 'Vehicle & Bulk Weighing',
          id: 'vehicle-bulk',
          items: [
            '🚛 Truck Scales / Weighbridges',
            '🚂 Rail Weighbridge',
            { label: '🚚 Portable Weighbridge', href: '/weighing/portable-axle' },
            { label: '⚙️ Portable Axle Weigher', href: '/weighing/portable-axle' },
            '🔧 Fixed Axle Weigher',
            '🚗 Medium Speed WIM Systems',
            '🚚 High Speed WIM Systems',
            { label: '🤖 Unmanned / Automated Weighbridges', href: '/weighing/unmanned-automated' },
            { label: '🚜 Onboard Weighing', href: '/weighing/onboard-weighing' },
            '🔩 Weigh Modules (Hopper / Silo)',
          ],
        },
        {
          heading: 'Industrial & Platform Scales',
          id: 'industrial-platform',
          items: [
            '⚖️ Platform Scales',
            '📦 Floor Scales',
            '📋 Pallet Scales',
            '🏗️ Crane Scales',
            '🎣 Hanging Scales',
            '🔢 Counting Scales',
            '✅ Check Weighers',
            '💼 Bagging Scales',
            '⚗️ Dosing / Batching Scales',
          ],
        },
        {
          heading: 'Retail & Commercial Scales',
          id: 'retail-commercial',
          items: [
            { label: '🛍️ Retail Scales', href: '/weighing/retail-scales' },
            '💳 Price-Computing Scales',
            '🛒 Bench Scales',
            '📮 Parcel / Postal Scales',
            '📱 Compact / Portable Scales',
            '🔄 Spring Scales',
            '🎯 Dial Scales',
          ],
        },
        {
          heading: 'Laboratory & Precision',
          id: 'laboratory-precision',
          items: [
            '🔬 Analytical Balances',
            '📊 Precision Balances',
            '🎯 High-Precision Scales',
            '💧 Moisture Analyzers',
            '📈 Density Scales',
            '⚕️ Medical / Health Scales',
          ],
        },
        {
          heading: 'Specialised & Hazardous Area',
          id: 'specialised-hazardous',
          items: [
            '🐄 Livestock & Specialized Scales',
            '⚡ ATEX Scales (LPG & Flammable Areas)',
            '💦 Environmental / Washdown Scales',
            '🔌 Tension / Load Measurement Systems',
            '🛠️ Custom Weighing Solutions',
          ],
        },
        {
          heading: 'Components, Software & Standards',
          id: 'components-software',
          items: [
            '⚙️ Load Cells',
            '📊 Weight Indicators & Displays',
            { label: '🖥️ Weighing Software & Systems', href: '/weighing/software' },
            { label: '💻 Weighbridge Software', href: '/weighing/software' },
            '📐 Calibration Standards (E2, F1, F2, M1)',
            { label: '🔧 Weighbridge Accessories', href: '/weighing/accessories' },
          ],
        },
      ]}
    />
  );
}
