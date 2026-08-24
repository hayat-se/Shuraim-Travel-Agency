import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiCheck } from 'react-icons/fi';

const FEATURES = [
  'Real-time fares & instant seat holds',
  'Issue e-tickets the moment you book',
  'Bookings, ledger & payments in one place',
];

// Split-screen auth shell: sky-blue brand panel + form card. Used by all auth pages.
export default function AuthLayout({ badge, title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* ── Brand panel (desktop only) ───────────────────────────── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-ink via-primary-800 to-primary p-10 text-white lg:flex">
        {/* soft radial glow */}
        <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-accent/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-primary-400/20 blur-3xl" aria-hidden />

        {/* drifting clouds */}
        <img src="/images/cloud-img.png" alt="" aria-hidden className="pointer-events-none absolute left-6 top-24 w-56 animate-cloud-drift opacity-25" />
        <img src="/images/cloud-img1.png" alt="" aria-hidden className="pointer-events-none absolute right-4 top-1/2 w-64 animate-cloud-drift-slow opacity-20" />
        <img src="/images/cloud-img.png" alt="" aria-hidden className="pointer-events-none absolute bottom-16 left-1/3 w-44 animate-cloud-drift-slow opacity-15" />

        {/* floating plane */}
        <img
          src="/images/shuraim-plane.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-6 top-16 w-52 animate-plane-float drop-shadow-2xl"
        />

        {/* logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/15 ring-1 ring-white/20 backdrop-blur">
            <img src="/assets/shuraim-favicon.png" alt="Shuraim Air" className="h-7 w-7 object-contain" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-semibold">Shuraim Air</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Travel &amp; Tours</p>
          </div>
        </div>

        {/* headline + features */}
        <div className="relative">
          <h2 className="max-w-md font-display text-[2rem] font-extrabold leading-tight">
            B2B flight booking, made simple for travel agencies.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
            Search fares, issue e-tickets instantly, and manage bookings and ledger — all from one portal.
          </p>
          <ul className="mt-7 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/90">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <FiCheck size={13} className="text-accent-200" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">© {new Date().getFullYear()} Shuraim Air Travel &amp; Tours</p>
      </div>

      {/* ── Form side ────────────────────────────────────────────── */}
      <div className="relative flex w-full items-center justify-center px-5 py-10 lg:w-1/2">
        <Link
          to="/"
          className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-sm border border-neutral-300 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 hover:text-primary"
        >
          <FiHome size={14} /> Home
        </Link>

        <div className="w-full max-w-sm animate-fade-in-up">
          {/* mobile logo (brand panel is hidden on small screens) */}
          <div className="mb-6 flex items-center justify-center gap-2.5 lg:hidden">
            <img src="/assets/shuraim-favicon.png" alt="Shuraim Air" className="h-9 w-9 object-contain" />
            <div className="leading-tight">
              <p className="text-[15px] font-bold text-ink">Shuraim Air</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Travel &amp; Tours</p>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-7 shadow-card sm:p-8">
            <div className="mb-6 text-center">
              {badge && (
                <span className="mb-3 inline-block rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  {badge}
                </span>
              )}
              <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
              {subtitle && <p className="mt-1.5 text-sm text-neutral-500">{subtitle}</p>}
            </div>

            {children}
          </div>

          {footer && <div className="mt-6 text-center text-sm text-neutral-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
