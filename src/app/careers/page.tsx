'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Briefcase,
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  TrendingUp,
  ShieldCheck,
  Mail,
  Loader2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Newsletter from '@/components/ContactCallToAction';
import { careersAPI } from '@/utils/apiFactory';
import heroCareers from '@/assets/portrait-engineers-work-hours-job-site.jpg';

// Roles are managed live from the Admin dashboard (Careers) and served by the
// backend API — no code change or redeploy needed to post or close a role.
type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements?: string | null;
};

const APPLY_EMAIL = 'recruitment@qalibrated.com';

const benefits = [
  {
    icon: TrendingUp,
    title: 'Growth & Development',
    text: 'Hands-on training, certifications and a clear path to grow your career with an engineering leader.',
  },
  {
    icon: HeartHandshake,
    title: 'Supportive Team',
    text: 'Work alongside experienced engineers who share knowledge and back each other up.',
  },
  {
    icon: ShieldCheck,
    title: 'Meaningful Work',
    text: 'Deliver precision systems that keep Kenyan industry, transport and trade moving.',
  },
  {
    icon: GraduationCap,
    title: 'Learn by Doing',
    text: 'Exposure to weighing, calibration (ISO/IEC 17025), automation and intelligent transport.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function applyHref(job?: Job) {
  const subject = job ? `Application: ${job.title}` : 'General application / CV submission';
  const body = job
    ? `Hello Qalibrated Systems team,%0D%0A%0D%0AI would like to apply for the ${job.title} role (${job.department}, ${job.location}).%0D%0A%0D%0APlease find my CV attached.%0D%0A%0D%0AKind regards,`
    : `Hello Qalibrated Systems team,%0D%0A%0D%0AI would like to be considered for future opportunities. Please find my CV attached.%0D%0A%0D%0AKind regards,`;
  return `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

function requirementList(req?: string | null): string[] {
  if (!req) return [];
  return req
    .split(/\r?\n|•|;/)
    .map((r) => r.trim())
    .filter(Boolean);
}

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    careersAPI
      .getAll()
      .then((res: { data: Job[] }) => {
        if (active) setJobs(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (active) setJobs([]);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero (pt-28 clears the fixed navbar so the badge/heading aren't covered) */}
      <section className="relative h-[60vh] min-h-[460px] w-full flex items-center justify-center text-center pt-28 pb-10">
        <Image src={heroCareers} alt="Careers at Qalibrated Systems Limited" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-black/65" />
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="relative z-10 px-6 max-w-3xl">
          <span className="inline-block bg-amber-400 text-black text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Careers
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Build a career in precision engineering
          </h1>
          <p className="mt-4 text-gray-200 text-base md:text-lg">
            Join Qalibrated Systems Limited — a Kenyan leader in weighing, calibration and automation — and help keep
            industry, transport and trade running accurately.
          </p>
          <a
            href="#open-roles"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-amber-400 text-black rounded-full font-bold hover:opacity-90 transition"
          >
            View open roles <ArrowRight size={18} />
          </a>
        </motion.div>
      </section>

      <main className="bg-white">
        {/* Why work with us */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-3xl font-extrabold text-center text-black"
          >
            Why work with us
          </motion.h2>
          <p className="mt-3 text-center text-gray-600 max-w-2xl mx-auto">
            We invest in our people the same way we invest in precision — with care, standards and a long-term view.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                  <b.icon size={24} />
                </div>
                <h3 className="font-bold text-black">{b.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{b.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Open roles */}
        <section id="open-roles" className="bg-gray-50 py-16 scroll-mt-24">
          <div className="max-w-5xl mx-auto px-6">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-3xl font-extrabold text-center text-black"
            >
              Open positions
            </motion.h2>

            {loading ? (
              <div className="mt-10 flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="animate-spin" size={20} /> Loading roles…
              </div>
            ) : jobs.length > 0 ? (
              <div className="mt-10 space-y-5">
                {jobs.map((job) => {
                  const reqs = requirementList(job.requirements);
                  return (
                    <motion.div
                      key={job.id}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-black">{job.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1.5">
                              <Briefcase size={15} className="text-amber-500" />
                              {job.department}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin size={15} className="text-amber-500" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={15} className="text-amber-500" />
                              {job.type}
                            </span>
                          </div>
                        </div>
                        <a
                          href={applyHref(job)}
                          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-black rounded-full font-bold hover:opacity-90 transition"
                        >
                          Apply <ArrowRight size={16} />
                        </a>
                      </div>

                      <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>

                      {reqs.length > 0 && (
                        <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2">
                          {reqs.map((r, ri) => (
                            <li key={ri} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <p className="text-gray-700">
                  We don’t have any open roles right now — but we’re always keen to meet talented people.
                </p>
              </div>
            )}

            {/* General application */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mt-10 rounded-2xl bg-black text-white p-8 md:p-10 text-center"
            >
              <h3 className="text-2xl font-extrabold">Don’t see the right role?</h3>
              <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
                We’re always happy to hear from skilled engineers, technicians and professionals. Send us your CV and
                we’ll keep you in mind for future opportunities.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <a
                  href={applyHref()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 text-black rounded-full font-bold hover:opacity-90 transition"
                >
                  <Mail size={18} /> Send your CV
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/40 text-white rounded-full font-bold hover:bg-white/10 transition"
                >
                  Contact us
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <Newsletter />
      </main>

      <Footer />
    </>
  );
}
