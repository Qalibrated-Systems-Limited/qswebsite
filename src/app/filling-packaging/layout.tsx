import { createMetadata } from '@/utils/seo';

export const metadata = createMetadata({
  title: 'Filling & Packaging - Qalibrated Systems Limited',
  description:
    'Turnkey filling, bottling and packaging lines from Qalibrated Systems — bottled water, jar filling, juice, carbonated drinks, dairy, edible oils, PET blow moulding, labelling and palletising.',
  keywords:
    'filling machines Kenya, bottling line, packaging line, water filling, PET blow moulding, labelling palletising, turnkey packaging',
  path: '/filling-packaging',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
