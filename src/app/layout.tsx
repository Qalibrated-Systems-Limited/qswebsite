import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { createMetadata } from "@/utils/seo";
import AIChatWidget from "@/components/AIChatWidget"; // make sure this path is correct

// ✅ Define fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = 'https://qalibrated.com';

export const metadata: Metadata = {
  ...createMetadata({
    title: 'Qalibrated Systems Limited - Weighing, Calibration & Automation in Kenya',
    description:
      'Qalibrated Systems Limited is a KENAS-accredited (ISO/IEC 17025:2017) provider of precision weighing, calibration, industrial automation and software in Kenya — weighbridges, axle weighers, industrial scales, building management and intelligent transport systems. Nairobi-based, serving East Africa since 2009.',
    keywords:
      'weighbridge Kenya, truck scale, axle weigher, weighing scales Nairobi, industrial scales, KENAS accredited calibration, ISO/IEC 17025 calibration laboratory, calibration services Kenya, flow meter calibration, pressure calibration, temperature calibration, load cells, weighbridge software, industrial automation, PLC SCADA, building management systems, intelligent transport systems, QaliTrack ERP, Profleet fleet management, filling and packaging machines, Qalibrated Systems Limited',
    path: '/',
  }),
  title: {
    default: 'Qalibrated Systems Limited - Weighing, Calibration & Automation in Kenya',
    template: '%s | Qalibrated Systems Limited',
  },
  authors: [{ name: 'Qalibrated Systems Limited' }],
  creator: 'Qalibrated Systems Limited',
  publisher: 'Qalibrated Systems Limited',
  icons: {
    icon: '/favicon-32x32.png',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Load runtime config BEFORE the app JS so window.ENV (the API base URL)
          is set before any code reads it. beforeInteractive avoids the async race
          that otherwise falls back to the localhost default in production. */}
      <Script src="/config.js" strategy="beforeInteractive" />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Structured data (JSON-LD) for rich results and local/organization search.
            Emitted in the App Router body so crawlers actually receive it. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${SITE_URL}/#organization`,
                  name: 'Qalibrated Systems Limited',
                  alternateName: 'QSL',
                  url: SITE_URL,
                  logo: `${SITE_URL}/logo-social.png`,
                  image: `${SITE_URL}/og-image.png`,
                  description:
                    'KENAS-accredited (ISO/IEC 17025:2017) precision weighing, calibration, industrial automation and software in Kenya.',
                  foundingDate: '2009',
                  email: 'info@qalibrated.com',
                  telephone: '+254714999996',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'QSL Centre, Birdi Complex, 1st Floor, off Mombasa Road',
                    addressLocality: 'Nairobi',
                    postalCode: '00100',
                    addressCountry: 'KE',
                  },
                  sameAs: [
                    'https://www.linkedin.com/company/qalibrated-systems',
                    'https://facebook.com/qalibrated',
                    'https://twitter.com/qalibrated',
                  ],
                },
                {
                  '@type': ['LocalBusiness', 'ProfessionalService'],
                  '@id': `${SITE_URL}/#localbusiness`,
                  name: 'Qalibrated Systems Limited',
                  url: SITE_URL,
                  image: `${SITE_URL}/og-image.png`,
                  logo: `${SITE_URL}/logo-social.png`,
                  telephone: '+254714999996',
                  email: 'info@qalibrated.com',
                  priceRange: '$$',
                  areaServed: ['Kenya', 'East Africa'],
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'QSL Centre, Birdi Complex, 1st Floor, off Mombasa Road',
                    addressLocality: 'Nairobi',
                    postalCode: '00100',
                    addressCountry: 'KE',
                  },
                  geo: {
                    '@type': 'GeoCoordinates',
                    latitude: -1.3745112,
                    longitude: 36.9208099,
                  },
                  openingHoursSpecification: [
                    {
                      '@type': 'OpeningHoursSpecification',
                      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                      opens: '08:00',
                      closes: '17:00',
                    },
                    {
                      '@type': 'OpeningHoursSpecification',
                      dayOfWeek: 'Saturday',
                      opens: '09:00',
                      closes: '13:00',
                    },
                  ],
                  hasCredential: 'KENAS Accredited — ISO/IEC 17025:2017 Calibration Laboratory (CL/059)',
                },
                {
                  '@type': 'WebSite',
                  '@id': `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: 'Qalibrated Systems Limited',
                  publisher: { '@id': `${SITE_URL}/#organization` },
                  inLanguage: 'en',
                },
              ],
            }),
          }}
        />
        {children}
        <AIChatWidget /> {/* ✅ Global chatbot */}
      </body>
    </html>
  );
}
