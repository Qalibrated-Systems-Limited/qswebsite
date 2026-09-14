'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { adsAPI, imageUrl } from '@/utils/apiFactory';

// Active ads are created from the Admin dashboard (Ad Management) and served
// by the backend (/api/ads returns only active, in-window ads to the public).
// This popup surfaces them to every visitor and re-appears frequently.
type Ad = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  position?: string | null;
};

// How often the popup re-appears after being closed (ms). Kept short so ads
// get maximum exposure, but not so short it blocks the page.
const REOPEN_MS = 40000;
const FIRST_DELAY_MS = 1500;

export default function AdPopup() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load active ads once.
  useEffect(() => {
    let active = true;
    adsAPI
      .getAll()
      .then((res: { data: Ad[] }) => {
        if (!active) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setAds(list);
      })
      .catch(() => active && setAds([]));
    return () => {
      active = false;
    };
  }, []);

  const schedule = useCallback(
    (delay: number) => {
      if (timer.current) clearTimeout(timer.current);
      if (ads.length === 0) return;
      timer.current = setTimeout(() => setOpen(true), delay);
    },
    [ads.length]
  );

  // Kick off the first show once ads are loaded.
  useEffect(() => {
    if (ads.length > 0) schedule(FIRST_DELAY_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [ads.length, schedule]);

  const close = useCallback(() => {
    setOpen(false);
    // Rotate to the next ad and re-arm so a different ad shows next time.
    setIndex((i) => (ads.length ? (i + 1) % ads.length : 0));
    schedule(REOPEN_MS);
  }, [ads.length, schedule]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open || ads.length === 0) return null;
  const ad = ads[index % ads.length];
  if (!ad) return null;

  const img = imageUrl(ad.imageUrl);
  const hasLink = !!ad.linkUrl;
  const external = hasLink && /^https?:\/\//i.test(ad.linkUrl || '');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={ad.title}
      onClick={close}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-[adpop_.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close ad"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white hover:bg-black/70 transition"
        >
          <X size={18} />
        </button>

        {img && (
          // API-served image (dynamic origin) — plain img avoids next/image remote config.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={ad.title} className="w-full max-h-72 object-cover" />
        )}

        <div className="p-6 text-center">
          <span className="inline-block bg-amber-400 text-black text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
            Qalibrated Systems
          </span>
          <h3 className="mt-3 text-2xl font-extrabold text-gray-900 leading-tight">{ad.title}</h3>
          {ad.description && (
            <p className="mt-2 text-gray-600 leading-relaxed">{ad.description}</p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {hasLink && (
              <a
                href={ad.linkUrl || '#'}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                onClick={close}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition"
              >
                Learn more
              </a>
            )}
            <button
              onClick={close}
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
            >
              Not now
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes adpop {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
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
