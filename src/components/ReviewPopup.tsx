'use client';

import React, { useEffect, useState } from 'react';
import { Star, X } from 'lucide-react';

// ── Set this to your Google "write a review" link ──────────────────────────
// BEST: open your Google Business Profile → "Ask for reviews" → copy the
// short g.page/r/… link and paste it here. That opens the write-a-review box
// directly. Until you set it, the fallback below opens your Google MAPS
// listing (with your reviews + the "Write a review" button).
//
//   const GOOGLE_REVIEW_URL = 'https://g.page/r/XXXXXXXXXXXX/review';
//
const GOOGLE_REVIEW_URL = 'REPLACE_WITH_G_PAGE_LINK';

// Fallback: your listing on Google Maps (reviews are shown there).
const FALLBACK_REVIEW_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('Qalibrated Systems Limited, Mombasa Road, Nairobi');

const reviewUrl =
  GOOGLE_REVIEW_URL && !GOOGLE_REVIEW_URL.startsWith('REPLACE_')
    ? GOOGLE_REVIEW_URL
    : FALLBACK_REVIEW_URL;

// Shown once per browser session, after the visitor has spent a little time on
// the site — a gentle nudge, not a nag.
const SHOW_AFTER_MS = 22000;
const SESSION_KEY = 'qsl-review-nudge';

export default function ReviewPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(SESSION_KEY) === 'done';
    } catch {
      /* private mode — just show once this load */
    }
    if (dismissed) return;
    const t = setTimeout(() => setShow(true), SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      sessionStorage.setItem(SESSION_KEY, 'done');
    } catch {
      /* ignore */
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[90] w-[calc(100vw-2rem)] max-w-sm animate-[reviewin_.3s_ease-out]">
      <div className="relative rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 border border-gray-100 p-5">
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-1 text-amber-400" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={18} fill="currentColor" strokeWidth={0} />
          ))}
        </div>

        <h3 className="mt-2 text-lg font-extrabold text-gray-900 leading-snug">
          Enjoying working with Qalibrated Systems?
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          A quick Google review helps other Kenyan businesses find us. It only takes 30 seconds.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition"
          >
            <Star size={16} fill="currentColor" strokeWidth={0} /> Leave a review
          </a>
          <button
            onClick={dismiss}
            className="px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-800 transition"
          >
            Maybe later
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes reviewin {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
