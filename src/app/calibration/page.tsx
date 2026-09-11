import ServiceCategory from '@/components/ServiceCategory';

export default function CalibrationPage() {
  return (
    <ServiceCategory
      title="Calibration Services"
      tagline="KENAS Accredited · ISO/IEC 17025:2017"
      intro="Accredited calibration across mass, pressure, temperature and electrical parameters — in our laboratory (CL/059) or on-site at your plant, with full traceability."
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
