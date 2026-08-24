import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiSend, FiLayers, FiBriefcase, FiCreditCard, FiMessageSquare,
  FiBook, FiSearch, FiMenu, FiLogOut, FiList, FiPlus, FiHelpCircle, FiBell, FiClock, FiX,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { cn } from './ui/cn';

// WhatsApp support (agencies only) — +92 343 3173386
const WHATSAPP_SUPPORT = 'https://wa.me/923433173386?text=Hello%2C%20I%20need%20support%20with%20the%20Shuraim%20Air%20agency%20portal.';

// Menu definitions — correct labels + destinations.
const ADMIN_MENU = [
  { label: 'Dashboard', icon: FiGrid, path: '/admin/dashboard' },
  { label: 'All Bookings', icon: FiList, path: '/admin/bookings' },
  { label: 'Flights', icon: FiSend, path: '/admin/flights' },
  { label: 'Agencies', icon: FiUsers, path: '/admin/agencies' },
  { label: 'Payments', icon: FiCreditCard, path: '/admin/payments' },
  { label: 'Feedback', icon: FiMessageSquare, path: '/admin/feedback' },
  { section: 'Setup' },
  { label: 'Airlines', icon: FiSend, path: '/admin/airlines' },
  { label: 'Groups', icon: FiLayers, path: '/admin/groups' },
  { label: 'Banks', icon: FiBriefcase, path: '/admin/banks' },
];

const AGENCY_MENU = [
  { label: 'Dashboard', icon: FiGrid, path: '/agency/dashboard' },
  { label: 'Flight Search', icon: FiSearch, path: '/agency/search-flights' },
  { label: 'My Bookings', icon: FiList, path: '/agency/my-bookings' },
  { label: 'My Ledger', icon: FiBook, path: '/agency/ledger' },
  { label: 'Payments', icon: FiCreditCard, path: '/agency/payments' },
  { label: 'Banks', icon: FiBriefcase, path: '/agency/banks' },
  { label: 'Feedback', icon: FiMessageSquare, path: '/agency/feedback' },
];

function SidebarContent({ menu, user, cta, onLogout, onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-white py-5">
      {/* Brand */}
      <div className="mb-6 px-5">
        <div className="flex items-center gap-2.5">
          <img src="/assets/shuraim-favicon.png" alt="Shuraim Air" className="h-9 w-9 shrink-0 object-contain" />
          <div className="leading-tight">
            <h1 className="text-[15px] font-bold text-ink">Shuraim Air</h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Travel &amp; Tours</p>
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="mb-5 px-4">
        <NavLink
          to={cta.path}
          onClick={onNavigate}
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-gradient-brand py-2.5 text-[13px] font-semibold text-white shadow-glow transition-all duration-200 hover:shadow-premium active:scale-95"
        >
          <FiPlus size={15} /> {cta.label}
        </NavLink>
      </div>

      {/* Links */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {menu.map((item, i) =>
          item.section ? (
            <p key={`s-${i}`} className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              {item.section}
            </p>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-sm px-3 py-2 text-[13px] font-medium transition-all duration-200',
                  isActive
                    ? 'border-l-4 border-primary bg-primary-50 pl-2 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-ink'
                )
              }
            >
              <item.icon size={17} className="shrink-0" />
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-0.5 border-t border-neutral-200 px-3 pt-3">
        <div className="truncate px-3 pb-1 text-[11px] text-neutral-500" title={user?.email}>
          {user?.email}
        </div>
        {user?.role === 'agency' && (
          <a
            href={WHATSAPP_SUPPORT}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-[13px] font-medium text-neutral-600 transition-colors hover:bg-green-50 hover:text-green-700"
          >
            <FaWhatsapp size={17} className="text-green-600" /> WhatsApp Support
          </a>
        )}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-[13px] font-medium text-neutral-600 transition-colors hover:bg-danger hover:text-white"
        >
          <FiLogOut size={17} /> Logout
        </button>
      </div>
    </div>
  );
}

export default function AppShell({ user, setUser, children }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const menu = isAdmin ? ADMIN_MENU : AGENCY_MENU;
  const cta = isAdmin ? { label: 'Add Flight', path: '/admin/flights' } : { label: 'New Booking', path: '/agency/search-flights' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate(isAdmin ? '/admin/login' : '/agency/login');
  };

  const displayName = user?.agencyName || user?.name || user?.email || '?';

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Desktop sidebar */}
      <aside className="z-50 hidden w-[224px] shrink-0 border-r border-neutral-200 lg:block">
        <SidebarContent menu={menu} user={user} cta={cta} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setDrawerOpen(false)} aria-hidden />
          <aside className="fixed inset-y-0 left-0 z-50 w-[240px] border-r border-neutral-200 lg:hidden">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-sm p-1.5 text-neutral-500 hover:bg-neutral-100"
              aria-label="Close menu"
            >
              <FiX size={20} />
            </button>
            <SidebarContent menu={menu} user={user} cta={cta} onLogout={handleLogout} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </>
      )}

      {/* Main column */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 shadow-sm lg:px-6">
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-sm p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </button>

          {/* Search */}
          <div className="relative hidden w-full max-w-md md:block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={17} />
            <input
              placeholder={isAdmin ? 'Search flights, agencies, bookings…' : 'Search booking ID or passenger…'}
              className="w-full rounded-sm border border-neutral-300 bg-neutral-100 py-2 pl-10 pr-4 text-sm transition-colors placeholder:text-neutral-500/70 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            {[FiBell, FiClock, FiHelpCircle].map((Icon, i) => (
              <button
                key={i}
                className="hidden h-9 w-9 items-center justify-center rounded-sm text-neutral-600 transition-colors hover:bg-neutral-100 active:scale-95 sm:flex"
              >
                <Icon size={18} />
              </button>
            ))}
            <NavLink
              to={cta.path}
              className="hidden rounded-sm bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 active:scale-95 sm:block"
            >
              {cta.label}
            </NavLink>
            <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
