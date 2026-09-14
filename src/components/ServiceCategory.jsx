'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Newsletter from '@/components/ContactCallToAction';

// Reusable, on-theme service-category page. Data-driven so new sections stay
// consistent with the site's amber/black theme.
//   title    – category name
//   tagline  – short line under the title
//   intro    – 1–2 sentence paragraph
//   groups   – [{ heading, badge, id, items: ["🔧 Item", ...]
//                 | [{ label: "🔧 Item", href: "/weighing/portable-axle" }] }]
//     id   – optional anchor so navbar dropdowns can deep-link to a group
//     item – a plain "emoji Name" string, or { label, href } to make the card
//            a link to an existing detail page
/**
 * @param {{
 *   title?: string,
 *   tagline?: string,
 *   intro?: string,
 *   path?: string,
 *   faqs?: Array<{ q: string, a: string }>,
 *   groups?: Array<{
 *     heading?: string,
 *     badge?: string,
 *     id?: string,
 *     items?: Array<string | { label: string, href?: string }>,
 *   }>,
 * }} props
 */
export default function ServiceCategory({ title, tagline, intro, path = '', faqs = [], groups = [] }) {
  const cardClass =
    'bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-3 hover:shadow-md hover:border-amber-300 transition';
  const renderCardInner = (label) => (
    <>
      <span className="text-2xl leading-none">{label.split(' ')[0]}</span>
      <span className="font-semibold text-gray-800">{label.split(' ').slice(1).join(' ')}</span>
    </>
  );

  // Structured data (production domain is fixed, so hardcoding avoids any
  // server/client hydration mismatch on env-derived URLs). Emitted in the
  // SSR'd HTML so crawlers read Service, Breadcrumb and FAQ schema directly.
  const SITE = 'https://qalibrated.com';
  const pageUrl = `${SITE}${path || ''}`;
  const graph = [
    {
      '@type': 'Service',
      name: title,
      serviceType: title,
      description: intro || undefined,
      url: pageUrl,
      areaServed: ['Kenya', 'East Africa'],
      provider: { '@type': 'Organization', name: 'Qalibrated Systems Limited', url: SITE },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: title, item: pageUrl },
      ],
    },
  ];
  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  const jsonLd = { '@context': 'https://schema.org', '@graph': graph };
  return (
    <>
      <Navbar />

      {/* Hero — branded gradient (no external image dependency), clears the fixed navbar */}
      <section className="relative pt-40 pb-16 bg-gradient-to-br from-black via-gray-900 to-amber-950 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(600px 300px at 50% 0%, rgba(245,168,0,.25), transparent 70%)' }}
          aria-hidden
        />
        <div className="relative max-w-3xl mx-auto px-6">
          {tagline && (
            <span className="inline-block bg-amber-400 text-black text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              {tagline}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">{title}</h1>
          {intro && <p className="mt-4 text-gray-300 text-base md:text-lg">{intro}</p>}
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition"
          >
            Talk to our team <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <main className="bg-gray-50">
        <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
          {groups.map((group, gi) => (
            <div key={gi} id={group.id} className="scroll-mt-32">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">{group.heading}</h2>
                {group.badge && (
                  <span className="text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                    {group.badge}
                  </span>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item, ii) => {
                  const label = typeof item === 'string' ? item : item.label;
                  const href = typeof item === 'string' ? null : item.href;
                  return href ? (
                    <Link key={ii} href={href} className={cardClass}>
                      {renderCardInner(label)}
                    </Link>
                  ) : (
                    <div key={ii} className={cardClass}>
                      {renderCardInner(label)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* FAQ — visible content that also backs the FAQ rich-result schema */}
          {faqs.length > 0 && (
            <div className="border-t border-gray-200 pt-12">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
                Frequently asked questions
              </h2>
              <div className="max-w-3xl mx-auto divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
                {faqs.map((f, fi) => (
                  <details key={fi} className="group px-5 py-4">
                    <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold text-gray-900 list-none">
                      {f.q}
                      <span className="text-amber-500 transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                    </summary>
                    <p className="mt-3 text-gray-700 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Accreditation trust line */}
          <div className="text-center border-t border-gray-200 pt-10">
            <p className="text-sm font-semibold text-gray-500">
              KENAS Accredited · ISO/IEC 17025:2017 Calibration Laboratory (CL/059) · ISO 9001:2015
            </p>
            <p className="mt-2 text-gray-600">
              Kenya&apos;s precision measurement partner — engineered under one roof since 2009.
            </p>
          </div>
        </section>

        <Newsletter />
      </main>

      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
