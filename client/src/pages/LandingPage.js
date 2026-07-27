import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSend, FiCreditCard, FiClipboard, FiBarChart2, FiFileText, FiMessageSquare,
  FiCheckCircle, FiGlobe, FiZap, FiUsers, FiPhone, FiMail, FiMapPin, FiClock,
  FiMenu, FiX, FiSearch, FiArrowRight, FiAward,
} from 'react-icons/fi';

/* ── Scroll reveal ───────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -80px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Content ─────────────────────────────────────────────────────────────── */
const SERVICES = [
  { icon: FiSend, title: 'Flight Bookings', text: 'Reliable booking for partner agencies with competitive group and series fares.' },
  { icon: FiCreditCard, title: 'Payment Solutions', text: 'Secure, flexible settlement with multiple bank options and verified receipts.' },
  { icon: FiClipboard, title: 'Booking Management', text: 'Manage every PNR with real-time seat and status updates.' },
  { icon: FiBarChart2, title: 'Ledger & Reports', text: 'A running account ledger with debits, credits and outstanding balance.' },
  { icon: FiFileText, title: 'Instant E-Tickets', text: 'Professional PDF e-tickets with QR verification, issued automatically.' },
  { icon: FiMessageSquare, title: 'Partner Support', text: 'Direct line to our team plus an in-portal feedback channel.' },
];

const DESTINATIONS = [
  { img: 'dubai.jpg', city: 'Dubai', country: 'United Arab Emirates' },
  { img: 'ksa.jpg', city: 'Saudi Arabia', country: 'Kingdom of Saudi Arabia' },
  { img: 'tokyo.jpg', city: 'Tokyo', country: 'Japan' },
  { img: 'newyork.jpg', city: 'New York', country: 'United States' },
  { img: 'london.jpg', city: 'London', country: 'United Kingdom' },
  { img: 'paris.jpg', city: 'Paris', country: 'France' },
];

const FEATURES = [
  { icon: FiCheckCircle, title: 'Licensed & Trusted', text: 'Officially licensed travel agency with a proven track record.' },
  { icon: FiGlobe, title: 'Global Network', text: 'Connected with airlines worldwide for the best available fares.' },
  { icon: FiZap, title: 'Fast Processing', text: 'Quick confirmations and instant e-ticket generation.' },
  { icon: FiUsers, title: 'Dedicated Support', text: 'A dedicated support team for all partner agencies.' },
];

const TEAM = [
  {
    photo: '/images/ceo.jpg',
    role: 'Chief Executive Officer',
    name: 'Yasir Khan',
    bio: 'Visionary leader with extensive experience in travel industry operations and B2B partnerships.',
    phones: ['0346-9317338', '0318-9317342'],
  },
  {
    photo: '/images/md.jpg',
    role: 'Managing Director',
    name: 'Sudais Ahmad',
    bio: 'Strategic thinker dedicated to delivering innovative solutions and exceptional customer service.',
    phones: ['0343-3173386', '0312-1673386'],
  },
];

const NAV_LINKS = [
  { label: 'Services', id: 'services' },
  { label: 'Destinations', id: 'destinations' },
  { label: 'About', id: 'about' },
  { label: 'Team', id: 'team' },
  { label: 'Contact', id: 'contact' },
];

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* ── Navbar ── */}
      <nav
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? 'border-neutral-200 bg-white/95 shadow-sm backdrop-blur' : 'border-transparent bg-white'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-ink text-white">
              <FiSend size={17} />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-sm font-semibold text-ink">Shuraim Air</span>
              <span className="block text-xs text-neutral-500">Travel &amp; Tours</span>
            </span>
          </button>

          <div className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => goTo(l.id)}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-primary"
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={() => navigate('/agency/login')}
              className="rounded-sm border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              Agency Login
            </button>
            <button
              onClick={() => navigate('/agency/register')}
              className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-600 active:scale-95"
            >
              Register Agency
            </button>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-sm p-2 text-neutral-700 lg:hidden" aria-label="Menu">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-neutral-200 bg-white px-5 py-4 lg:hidden">
            {NAV_LINKS.map((l) => (
              <button key={l.id} onClick={() => goTo(l.id)} className="block w-full py-2.5 text-left text-sm font-medium text-neutral-700">
                {l.label}
              </button>
            ))}
            <div className="mt-3 flex gap-2">
              <button onClick={() => navigate('/agency/login')} className="flex-1 rounded-sm border border-neutral-300 px-4 py-2 text-sm font-medium">
                Login
              </button>
              <button onClick={() => navigate('/agency/register')} className="flex-1 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-white">
                Register
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-ink px-5 pb-36 pt-20 lg:px-8 lg:pt-28">
        {/* Ambient texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(60% 55% at 15% 10%, rgba(52,212,152,0.16) 0%, transparent 60%), radial-gradient(50% 50% at 85% 25%, rgba(16,96,67,0.55) 0%, transparent 65%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          <Reveal>
            <span className="mb-6 inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-accent-light">
              <FiAward size={14} /> Licensed Travel Agency · Lic. No. 1224
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-white lg:text-4xl">
              Wholesale airfares, built for travel agencies
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-2xl text-base text-primary-200 lg:text-lg">
              Search group and series fares, book seats in seconds, issue e-tickets instantly, and settle on a
              transparent running ledger — all from one portal.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/agency/register')}
                className="group inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-8 py-3 font-medium text-ink transition-all hover:bg-accent-light active:scale-95"
              >
                Become a Partner Agency
                <FiArrowRight className="transition-transform group-hover:translate-x-1" size={17} />
              </button>
              <button
                onClick={() => navigate('/agency/login')}
                className="rounded-sm border border-white/25 px-8 py-3 font-medium text-white transition-colors hover:bg-white/10"
              >
                Agency Login
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Search teaser (overlaps hero) ── */}
      <section className="relative z-20 mx-auto -mt-24 max-w-5xl px-5 lg:px-8">
        <Reveal delay={120}>
          <div className="rounded-sm border border-neutral-300 bg-white/95 p-6 shadow-lift backdrop-blur">
            <div className="mb-5 flex items-center gap-2 border-b border-neutral-200 pb-3">
              <FiSend className="text-primary" size={18} />
              <span className="text-sm font-semibold text-primary">Flight Search</span>
              <span className="ml-auto text-xs text-neutral-500">Preview — sign in to search live inventory</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                { label: 'Origin', placeholder: 'ISB — Islamabad' },
                { label: 'Destination', placeholder: 'DXB — Dubai Intl' },
                { label: 'Departure', placeholder: 'Select date' },
              ].map((f) => (
                <div key={f.label} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-neutral-500">{f.label}</label>
                  <input
                    readOnly
                    onClick={() => navigate('/agency/login')}
                    placeholder={f.placeholder}
                    className="w-full cursor-pointer rounded-sm border border-neutral-300 bg-white px-3 py-2.5 text-sm placeholder-neutral-400 transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ))}
              <div className="flex flex-col justify-end">
                <button
                  onClick={() => navigate('/agency/login')}
                  className="flex h-[42px] w-full items-center justify-center gap-2 rounded-sm bg-primary text-sm font-medium text-white transition-colors hover:bg-primary-600"
                >
                  <FiSearch size={16} /> Search Flights
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Services ── */}
      <section id="services" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal className="mb-14 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">What we do</p>
          <h2 className="text-xl font-semibold text-ink lg:text-2xl">Everything your agency needs</h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-600">
            A complete booking workflow — from searching fares to issuing tickets and reconciling accounts.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 70}>
              <div className="group h-full rounded-sm border border-neutral-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lift">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm bg-primary-100 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <s.icon size={22} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Destinations ── */}
      <section id="destinations" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Where we fly</p>
            <h2 className="text-xl font-semibold text-ink lg:text-2xl">Featured destinations</h2>
          </Reveal>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
            {DESTINATIONS.map((d, i) => (
              <Reveal key={d.city} delay={i * 60}>
                <div className="group relative aspect-[4/3] overflow-hidden rounded-sm border border-neutral-200">
                  <img
                    src={`/images/destinations/${d.img}`}
                    alt={d.city}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = '/images/placeholder-destination.svg'; }}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent opacity-90" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="text-base font-semibold text-white">{d.city}</h3>
                    <p className="text-xs text-primary-200">{d.country}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">About us</p>
            <h2 className="mb-5 text-xl font-semibold text-ink lg:text-2xl">A licensed partner you can rely on</h2>
            <p className="mb-8 leading-relaxed text-neutral-600">
              Shuraim Air Travel &amp; Tours is a licensed travel agency providing professional B2B flight booking
              solutions. With years of experience in the travel industry, we are committed to delivering exceptional
              service to our partner agencies.
            </p>
            <dl className="divide-y divide-neutral-200 rounded-sm border border-neutral-200 bg-white">
              {[
                ['Company', 'Shuraim Air Travel & Tours'],
                ['License No.', '1224'],
                ['Location', 'Batkhela, Pakistan'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-5 py-3.5">
                  <dt className="text-sm text-neutral-500">{k}</dt>
                  <dd className="text-sm font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="h-full rounded-sm border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-card">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-sm bg-accent/15 text-primary">
                    <f.icon size={20} />
                  </div>
                  <h4 className="mb-1.5 font-semibold text-ink">{f.title}</h4>
                  <p className="text-sm leading-relaxed text-neutral-600">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leadership / Team ── */}
      <section id="team" className="relative overflow-hidden bg-ink py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: 'radial-gradient(55% 50% at 50% 0%, rgba(52,212,152,0.14) 0%, transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-5xl px-5 lg:px-8">
          <Reveal className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">Leadership</p>
            <h2 className="text-xl font-semibold text-white lg:text-2xl">Meet our leadership</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-200">
              Trusted professionals guiding Shuraim Air Travel &amp; Tours.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i * 120}>
                <article className="group h-full overflow-hidden rounded-sm border border-white/10 bg-white/5 backdrop-blur transition-all duration-500 hover:border-accent/40 hover:bg-white/[0.08]">
                  {/* Portrait */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-ink-deep sm:aspect-[3/3.2]">
                    <img
                      src={m.photo}
                      alt={`${m.name} — ${m.role}`}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = '/images/placeholder-profile.svg'; }}
                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-sm bg-accent px-2.5 py-1 text-xs font-semibold text-ink">
                      {m.role}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white">{m.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-primary-200">{m.bio}</p>
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                      {m.phones.map((p) => (
                        <a
                          key={p}
                          href={`tel:${p.replace(/-/g, '')}`}
                          className="inline-flex items-center gap-1.5 rounded-sm border border-white/15 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:border-accent hover:text-accent"
                        >
                          <FiPhone size={12} /> {p}
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal className="mb-14 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Contact us</p>
          <h2 className="text-xl font-semibold text-ink lg:text-2xl">Get in touch</h2>
          <p className="mx-auto mt-3 max-w-xl text-neutral-600">
            Ready to partner with us? Reach out through any channel below.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-sm border border-neutral-200 bg-white p-7">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-sm bg-primary-100 text-primary">
                <FiPhone size={20} />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-ink">Call us directly</h3>
              <p className="mb-6 text-sm text-neutral-500">Speak with our team for immediate assistance.</p>

              {TEAM.map((m) => (
                <div key={m.name} className="mb-5 border-b border-neutral-100 pb-5 last:mb-0 last:border-0 last:pb-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {m.role === 'Chief Executive Officer' ? 'CEO' : 'MD'} — {m.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {m.phones.map((p) => (
                      <a
                        key={p}
                        href={`tel:${p.replace(/-/g, '')}`}
                        className="inline-flex items-center gap-1.5 rounded-sm border border-neutral-200 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary-50"
                      >
                        <FiPhone size={13} /> {p}
                      </a>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-5 flex items-center justify-between border-t border-neutral-200 pt-4">
                <span className="text-sm text-neutral-500">Landline</span>
                <a href="tel:0932411506" className="text-sm font-medium text-ink hover:text-primary">(0932) 411506</a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="h-full rounded-sm border border-neutral-200 bg-white p-7">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-sm bg-primary-100 text-primary">
                <FiMail size={20} />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-ink">Email &amp; location</h3>
              <p className="mb-6 text-sm text-neutral-500">Send us a message or visit our office.</p>

              <ul className="space-y-5">
                <li className="flex gap-3">
                  <FiMail className="mt-0.5 shrink-0 text-primary" size={18} />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">Email address</p>
                    <a href="mailto:shuraimintl@gmail.com" className="text-sm font-medium text-ink hover:text-primary">
                      shuraimintl@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex gap-3 border-t border-neutral-100 pt-5">
                  <FiMapPin className="mt-0.5 shrink-0 text-primary" size={18} />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">Office address</p>
                    <p className="text-sm font-medium text-ink">1st Floor, Hayat Khan Plaza</p>
                    <p className="text-sm text-neutral-600">Batkhela, Pakistan</p>
                  </div>
                </li>
                <li className="flex gap-3 border-t border-neutral-100 pt-5">
                  <FiClock className="mt-0.5 shrink-0 text-primary" size={18} />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">Business hours</p>
                    <p className="text-sm font-medium text-ink">Mon – Sat: 9:00 AM – 6:00 PM</p>
                    <p className="text-sm text-danger">Sunday: Closed</p>
                  </div>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-primary-900 px-5 py-20 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-semibold text-white lg:text-2xl">Ready to partner with us?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-200">
            Register your agency today and start booking wholesale fares with instant e-ticketing.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/agency/register')}
              className="group inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-8 py-3 font-medium text-ink transition-all hover:bg-accent-light active:scale-95"
            >
              Register Agency
              <FiArrowRight className="transition-transform group-hover:translate-x-1" size={17} />
            </button>
            <a
              href="mailto:shuraimintl@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/25 px-8 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              <FiMail size={16} /> Contact Sales
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-200 bg-white px-5 py-12 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-ink text-white">
              <FiSend size={17} />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-ink">Shuraim Air Travel &amp; Tours</span>
              <span className="block text-xs text-neutral-500">Licensed travel agency · Lic. No. 1224</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {NAV_LINKS.map((l) => (
              <button key={l.id} onClick={() => goTo(l.id)} className="text-sm text-neutral-600 transition-colors hover:text-primary">
                {l.label}
              </button>
            ))}
            <button onClick={() => navigate('/admin/login')} className="text-sm text-neutral-400 transition-colors hover:text-primary">
              Admin
            </button>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Shuraim Air Travel &amp; Tours. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
