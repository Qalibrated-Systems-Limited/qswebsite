'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Megaphone, Calendar, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Newsletter from '@/components/ContactCallToAction';
import { announcementsAPI, imageUrl } from '@/utils/apiFactory';
import heroNews from '@/assets/hero/RnD.jpg';

// Announcements are created and published live from the Admin dashboard and
// served by the backend API — updating them needs no code change or redeploy.
type Announcement = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  publishedAt: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    announcementsAPI
      .getAll()
      .then((res: { data: Announcement[] }) => {
        if (active) setItems(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero (pt-28 clears the fixed navbar so the heading isn't covered) */}
      <section className="relative h-[52vh] min-h-[420px] w-full flex items-center justify-center text-center pt-28 pb-10">
        <Image src={heroNews} alt="Qalibrated Systems announcements" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/65" />
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="relative z-10 px-6 max-w-3xl">
          <span className="inline-flex items-center gap-2 bg-amber-400 text-black text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            <Megaphone size={14} /> Announcements
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">News &amp; updates</h1>
          <p className="mt-4 text-gray-200 text-base md:text-lg">
            The latest from Qalibrated Systems Limited — new products, services, events and company milestones.
          </p>
        </motion.div>
      </section>

      <main className="bg-gray-50">
        <section className="max-w-4xl mx-auto px-6 py-16">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" size={20} /> Loading announcements…
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-8">
              {items.map((a) => {
                const img = imageUrl(a.imageUrl);
                return (
                  <motion.article
                    key={a.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    {img && (
                      // API-served image (dynamic origin) — plain img avoids next/image remote config.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={a.title} className="w-full max-h-80 object-cover" />
                    )}
                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
                        <Calendar size={14} />
                        {formatDate(a.publishedAt)}
                      </div>
                      <h2 className="mt-2 text-2xl font-extrabold text-black">{a.title}</h2>
                      <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">{a.content}</p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Megaphone className="mx-auto text-amber-400" size={36} />
              <p className="mt-4 text-gray-700">No announcements yet — please check back soon.</p>
            </div>
          )}
        </section>

        <Newsletter />
      </main>

      <Footer />
    </>
  );
}
