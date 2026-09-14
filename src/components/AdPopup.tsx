'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { adsAPI, imageUrl } from '@/utils/apiFactory';

// Active ads are created from the Admin dashboard (Ad Management) and served
// by the backend (/api/ads returns only active, in-window ads to the public).
type Ad = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
};

// Frequency rules (per visitor, remembered across page loads):
//   • Close an ad  → snooze THAT ad for 48h, then it can show again.
//   • Click an ad  → retire it; never shown again (unless it's a new advert).
//   • A new advert (new id) has no saved state, so it always shows.
const SNOOZE_MS = 48 * 60 * 60 * 1000; // 48 hours
const REOPEN_MS = 45000; // rotate to the next eligible ad
const FIRST_DELAY_MS = 1500;
const STORE_KEY = 'qsl-ad-state-v1';

type AdState = Record<string, { clicked?: boolean; snoozeUntil?: number }>;

function readStore(): AdState {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}
function writeStore(s: AdState) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch {
    /* private mode — non-fatal */
  }
}
function isEligible(id: string, store: AdState): boolean {
  const st = store[id];
  if (!st) return true; // new advert
  if (st.clicked) return false; // retired after a click
  if (st.snoozeUntil && Date.now() < st.snoozeUntil) return false; // snoozed
  return true;
}

export default function AdPopup() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [current, setCurrent] = useState<Ad | null>(null);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycle = useRef(0);

  useEffect(() => {
    let active = true;
    adsAPI
      .getAll()
      .then((res: { data: Ad[] }) => active && setAds(Array.isArray(res.data) ? res.data : []))
      .catch(() => active && setAds([]));
    return () => {
      active = false;
    };
  }, []);

  // Show the next ad that is still eligible; if none, stay closed.
  const openNext = useCallback(() => {
    const store = readStore();
    const eligible = ads.filter((a) => isEligible(a.id, store));
    if (eligible.length === 0) {
      setOpen(false);
      setCurrent(null);
      return;
    }
    const ad = eligible[cycle.current % eligible.length];
    cycle.current += 1;
    setCurrent(ad);
    setOpen(true);
  }, [ads]);

  const arm = useCallback(
    (delay: number) => {
      if (timer.current) clearTimeout(timer.current);
      const store = readStore();
      if (!ads.some((a) => isEligible(a.id, store))) return; // nothing left to show
      timer.current = setTimeout(openNext, delay);
    },
    [ads, openNext]
  );

  // First show once ads are loaded.
  useEffect(() => {
    if (ads.length > 0) arm(FIRST_DELAY_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [ads, arm]);

  // Mark the current ad and move on.
  const settle = useCallback(
    (mark: 'snooze' | 'clicked') => {
      if (current) {
        const store = readStore();
        const st = store[current.id] || {};
        if (mark === 'clicked') st.clicked = true;
        else st.snoozeUntil = Date.now() + SNOOZE_MS;
        store[current.id] = st;
        writeStore(store);
      }
      setOpen(false);
      arm(REOPEN_MS);
    },
    [current, arm]
  );

  const dismiss = useCallback(() => settle('snooze'), [settle]);
  const clickThrough = useCallback(() => settle('clicked'), [settle]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismiss]);

  if (!open || !current) return null;

  const img = imageUrl(current.imageUrl);
  const hasLink = !!current.linkUrl;
  const external = hasLink && /^https?:\/\//i.test(current.linkUrl || '');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-[adpop_.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          aria-label="Close ad"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white hover:bg-black/70 transition"
        >
          <X size={18} />
        </button>

        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={current.title} className="w-full max-h-72 object-cover" />
        )}

        <div className="p-6 text-center">
          <span className="inline-block bg-amber-400 text-black text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
            Qalibrated Systems
          </span>
          <h3 className="mt-3 text-2xl font-extrabold text-gray-900 leading-tight">{current.title}</h3>
          {current.description && (
            <p className="mt-2 text-gray-600 leading-relaxed">{current.description}</p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {hasLink && (
              <a
                href={current.linkUrl || '#'}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                onClick={clickThrough}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold transition"
              >
                Learn more
              </a>
            )}
            <button
              onClick={dismiss}
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
