import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

// Split-screen auth shell: brand panel + form card. Used by all auth pages.
export default function AuthLayout({ badge, title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Brand panel (hidden on small screens) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-ink-deep via-ink to-primary p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/15 text-lg font-bold">SA</div>
          <div className="leading-tight">
            <p className="text-lg font-semibold">Shuraim Air</p>
            <p className="text-sm text-white/70">Travel &amp; Tours</p>
          </div>
        </div>
        <div>
          <h2 className="max-w-md text-3xl font-semibold leading-tight">
            B2B flight booking, made simple for travel agencies.
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Search fares, issue e-tickets instantly, and manage your bookings and ledger — all in one portal.
          </p>
        </div>
        <p className="text-sm text-white/50">© {new Date().getFullYear()} Shuraim Air Travel &amp; Tours</p>
      </div>

      {/* Form side */}
      <div className="relative flex w-full items-center justify-center p-6 lg:w-1/2">
        <Link
          to="/"
          className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-sm border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          <FiHome size={15} /> Home
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            {badge && (
              <span className="mb-3 inline-block rounded-sm bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                {badge}
              </span>
            )}
            <h1 className="text-2xl font-semibold text-ink">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
          </div>

          {children}

          {footer && <div className="mt-6 text-center text-sm text-neutral-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
