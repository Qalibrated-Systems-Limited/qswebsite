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
//   groups   – [{ heading, badge, items: ["🔧 Item", ...] }]
/**
 * @param {{
 *   title?: string,
 *   tagline?: string,
 *   intro?: string,
 *   groups?: Array<{ heading?: string, badge?: string, items?: string[] }>,
 * }} props
 */
export default function ServiceCategory({ title, tagline, intro, groups = [] }) {
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
            <div key={gi}>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">{group.heading}</h2>
                {group.badge && (
                  <span className="text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                    {group.badge}
                  </span>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-3 hover:shadow-md hover:border-amber-300 transition"
                  >
                    <span className="text-2xl leading-none">{item.split(' ')[0]}</span>
                    <span className="font-semibold text-gray-800">{item.split(' ').slice(1).join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

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
    </>
  );
}
