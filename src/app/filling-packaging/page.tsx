import ServiceCategory from '@/components/ServiceCategory';

export default function FillingPackagingPage() {
  return (
    <ServiceCategory
      title="Filling & Packaging"
      tagline="Beverage & Liquid Packaging"
      intro="Turnkey filling, bottling and packaging lines — from bottled water and juices to edible oils, dairy and carbonated drinks, complete with water treatment, labelling and palletising."
      path="/filling-packaging"
      faqs={[
        {
          q: 'Do you supply bottled water filling machines in Kenya?',
          a: 'Yes — complete water, juice, carbonated drink, dairy and edible-oil filling and packaging lines, including 5-gallon/20L jar filling and PET blow moulding.',
        },
        {
          q: 'Can you set up a complete turnkey packaging line?',
          a: 'Yes. We deliver turnkey lines from water treatment through filling, labelling, packing and palletising, sized to your throughput.',
        },
        {
          q: 'Do you install, train and service the lines?',
          a: 'Yes — installation, operator training, spare parts and ongoing maintenance across Kenya.',
        },
      ]}
      groups={[
        {
          heading: 'Beverage & Liquid Packaging',
          items: [
            '💧 Bottled Water Filling',
            '🪣 5-Gallon & 20L Jar Filling',
            '🧃 Juice & Tea Filling',
            '🥤 Carbonated Drink Filling',
            '🥫 Can Filling & Seaming',
            '🍺 Beer Filling',
            '🥛 Milk & Dairy Filling',
            '🧴 Edible Oil & Sauce Filling',
            '🏭 PET Blow Moulding',
            '🚰 Water Treatment Systems',
            '📦 Labelling, Packing & Palletising',
            '🔧 Turnkey Line Solutions',
          ],
        },
      ]}
    />
  );
}
