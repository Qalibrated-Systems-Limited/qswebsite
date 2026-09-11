import ServiceCategory from '@/components/ServiceCategory';

export default function FillingPackagingPage() {
  return (
    <ServiceCategory
      title="Filling & Packaging"
      tagline="Beverage & Liquid Packaging"
      intro="Turnkey filling, bottling and packaging lines — from bottled water and juices to edible oils, dairy and carbonated drinks, complete with water treatment, labelling and palletising."
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
