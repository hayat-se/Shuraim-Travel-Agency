import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiSend, FiLayers, FiBriefcase, FiCreditCard, FiMessageSquare,
  FiBook, FiSearch, FiMenu, FiLogOut, FiList,
} from 'react-icons/fi';
import { cn } from './ui/cn';

// Menu definitions — correct labels + destinations (fixes the old mislabeled/duplicate nav).
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
  { label: 'Search Flights', icon: FiSearch, path: '/agency/search-flights' },
  { label: 'My Bookings', icon: FiList, path: '/agency/my-bookings' },
  { label: 'My Ledger', icon: FiBook, path: '/agency/ledger' },
  { label: 'Payments', icon: FiCreditCard, path: '/agency/payments' },
  { label: 'Banks', icon: FiBriefcase, path: '/agency/banks' },
  { label: 'Feedback', icon: FiMessageSquare, path: '/agency/feedback' },
];

function SidebarContent({ menu, user, onLogout, onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-ink text-neutral-200">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary font-bold text-white">SA</div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Shuraim Air</p>
          <p className="text-xs text-neutral-400">{user?.role === 'admin' ? 'Admin Portal' : 'Agency Portal'}</p>
        </div>
      </div>

      {/* Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menu.map((item, i) =>
          item.section ? (
            <p key={`s-${i}`} className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {item.section}
            </p>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-white' : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <item.icon size={18} className="shrink-0" />
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/10 p-3">
        <div className="mb-2 truncate px-2 text-xs text-neutral-400" title={user?.email}>
          {user?.email}
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-sm px-3 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-danger hover:text-white"
        >
          <FiLogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}

export default function AppShell({ user, setUser, children }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menu = user?.role === 'admin' ? ADMIN_MENU : AGENCY_MENU;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Role-aware: send agencies to the agency login, admins to admin login.
    navigate(user?.role === 'admin' ? '/admin/login' : '/agency/login');
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent menu={menu} user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-ink/50 lg:hidden" onClick={() => setDrawerOpen(false)} aria-hidden />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
            <SidebarContent menu={menu} user={user} onLogout={handleLogout} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white px-4 lg:px-6">
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-sm p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
            aria-label="Open menu"
          >
            <FiMenu size={20} />
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-xs font-bold text-white">SA</div>
            <span className="text-sm font-semibold text-ink">Shuraim Air</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-neutral-500 sm:block">{user?.agencyName || user?.name || user?.email}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary">
              {(user?.agencyName || user?.name || user?.email || '?').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
