import ServiceCategory from '@/components/ServiceCategory';

export default function CalibrationPage() {
  return (
    <ServiceCategory
      title="Calibration Services"
      tagline="KENAS Accredited · ISO/IEC 17025:2017"
      intro="Accredited calibration across mass, pressure, temperature and electrical parameters — in our laboratory (CL/059) or on-site at your plant, with full traceability."
      path="/calibration"
      faqs={[
        {
          q: 'Are you a KENAS-accredited calibration laboratory?',
          a: 'Yes. Qalibrated Systems Limited operates a KENAS-accredited ISO/IEC 17025:2017 calibration laboratory (CL/059), providing internationally traceable calibration in Kenya.',
        },
        {
          q: 'What equipment can you calibrate?',
          a: 'Weighing instruments, mass and weights (E2, F1, F2, M1), pressure, temperature and electrical parameters — in our laboratory or on-site.',
        },
        {
          q: 'Do you provide on-site calibration in Kenya?',
          a: 'Yes. Our team calibrates on-site across Kenya and issues traceable calibration certificates for your quality and regulatory records.',
        },
        {
          q: 'How often should equipment be calibrated?',
          a: 'Typically once a year, or as required by your quality system or regulator. We can advise on intervals and schedule calibration reminders for you.',
        },
      ]}
      groups={[
        {
          heading: 'Calibration & Metrology',
          id: 'calibration',
          items: [
            { label: '⚖️ Weighing Instrument Calibration', href: '/calibration/multideck-singledeck' },
            '📏 Pressure Calibration',
            '🌡️ Temperature Calibration',
            '⚡ Electrical Calibration',
            { label: '🛢️ Volumetric Tank Calibration', href: '/calibration/volumetric-tank' },
            { label: '🌊 Flow Meter & Pressure Calibration', href: '/calibration/flow-pressure' },
            '🔧 On-Site Calibration',
            '🛠️ Service & Maintenance',
            '📐 Calibration Standards (E2, F1, F2, M1)',
          ],
        },
      ]}
    />
  );
}
