import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
  useMotionValue,
  animate,
} from 'framer-motion';
import {
  FiMenu,
  FiX,
  FiSend,
  FiCreditCard,
  FiClipboard,
  FiBarChart2,
  FiTag,
  FiMessageSquare,
  FiShield,
  FiGlobe,
  FiZap,
  FiUsers,
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiChevronRight,
  FiArrowUpRight,
  FiArrowRight,
} from 'react-icons/fi';
import { cn } from '../components/ui/cn';

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const STATS = [
  { value: 500, suffix: '+', label: 'Partner agencies', hint: 'Booking through the portal' },
  { value: 1224, prefix: 'No. ', label: 'Licensed operator', hint: 'Registered & verified' },
  { value: 60, suffix: 's', label: 'E-ticket issue', hint: 'PDF with QR, on confirm' },
  { value: 24, suffix: '/6', label: 'Partner support', hint: 'Mon-Sat business hours' },
];

const BOARD_ROWS = [
  { code: 'SV 728', from: 'BKT', to: 'JED', gate: 'Umrah', status: 'On sale' },
  { code: 'EK 613', from: 'ISB', to: 'DXB', gate: 'Group', status: 'Holding' },
  { code: 'TK 711', from: 'ISB', to: 'IST', gate: 'Economy', status: 'On sale' },
  { code: 'PK 309', from: 'ISB', to: 'LHR', gate: 'Business', status: 'On sale' },
];

const SERVICES = [
  { icon: FiSend, no: '01', title: 'Flight Bookings', body: 'Easy and reliable flight booking system for travel agencies with competitive pricing' },
  { icon: FiCreditCard, no: '02', title: 'Payment Solutions', body: 'Secure and flexible payment methods with multiple bank options' },
  { icon: FiClipboard, no: '03', title: 'Booking Management', body: 'Complete booking management system with real-time status updates' },
  { icon: FiBarChart2, no: '04', title: 'Analytics & Reports', body: 'Detailed ledger and financial reports for better business insights' },
  { icon: FiTag, no: '05', title: 'E-Tickets', body: 'Professional PDF e-tickets with QR codes for passenger convenience' },
  { icon: FiMessageSquare, no: '06', title: 'Support & Feedback', body: '24/7 customer support and feedback system for continuous improvement' },
];

// Rotates through the three brand accents so the services grid isn't mint-on-mint.
const SERVICE_TONES = [
  { chip: 'border-primary-200 bg-gradient-chip text-primary-700', bar: 'bg-gradient-brand', border: 'border-neutral-200 hover:border-primary-200' },
  { chip: 'border-gold-200 bg-gold-50 text-gold-700', bar: 'bg-gradient-gold', border: 'border-neutral-200 hover:border-gold-200' },
  { chip: 'border-mint-200 bg-mint-50 text-primary-700', bar: 'bg-gradient-mint', border: 'border-neutral-200 hover:border-mint-300' },
];

const DESTINATIONS = [
  { city: 'Dubai', country: 'United Arab Emirates', code: 'DXB', img: '/images/destinations/dubai.jpg', alt: 'Dubai, UAE' },
  { city: 'Saudi Arabia', country: 'Kingdom of Saudi Arabia', code: 'JED', img: '/images/destinations/ksa.jpg', alt: 'Saudi Arabia' },
  { city: 'Tokyo', country: 'Japan', code: 'HND', img: '/images/destinations/tokyo.jpg', alt: 'Tokyo, Japan' },
  { city: 'New York', country: 'United States', code: 'JFK', img: '/images/destinations/newyork.jpg', alt: 'New York, USA' },
  { city: 'London', country: 'United Kingdom', code: 'LHR', img: '/images/destinations/london.jpg', alt: 'London, UK' },
  { city: 'Paris', country: 'France', code: 'CDG', img: '/images/destinations/paris.jpg', alt: 'Paris, France' },
];

const FEATURES = [
  { icon: FiShield, title: 'Licensed & Trusted', body: 'Officially licensed travel agency with proven track record' },
  { icon: FiGlobe, title: 'Global Network', body: 'Connected with airlines worldwide for best deals' },
  { icon: FiZap, title: 'Fast Processing', body: 'Quick booking confirmations and instant e-ticket generation' },
  { icon: FiUsers, title: 'Partner Support', body: 'Dedicated support team for all partner agencies' },
];

const LEADERSHIP = [
  { name: 'Yasir Khan', role: 'CEO', img: '/images/ceo.jpg', alt: 'Yasir Khan - CEO', bio: 'Visionary leader with extensive experience in travel industry operations and B2B partnerships' },
  { name: 'Sudais Ahmad', role: 'Managing Director', img: '/images/md.jpg', alt: 'Sudais Ahmad - MD', bio: 'Strategic thinker dedicated to delivering innovative solutions and exceptional customer service' },
];

const NAV_LINKS = [
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

/* ------------------------------------------------------------------ */
/* Animated counter                                                    */
/* ------------------------------------------------------------------ */

function Counter({ value, prefix = '', suffix = '', reduce }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) {
      setDisplay(value);
      return undefined;
    }
    const controls = animate(mv, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduce, mv]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section eyebrow                                                     */
/* ------------------------------------------------------------------ */

function Eyebrow({ children, tone = 'dark' }) {
  const color = tone === 'light' ? 'text-mint' : 'text-primary';
  const line = tone === 'light' ? 'bg-mint/40' : 'bg-primary/30';
  return (
    <span className={`inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] ${color}`}>
      <span className={`h-px w-8 ${line}`} />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const LandingPage = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleMenu = () => setMenuOpen((v) => !v);
  const closeMenu = () => setMenuOpen(false);
  const goTo = (sectionId) => {
    closeMenu();
    setTimeout(() => scrollToSection(sectionId), 0);
  };

  /* Motion presets */
  const ease = [0.16, 1, 0.3, 1];
  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 28 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.7, ease } },
  };
  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: reduce ? 0 : 0.5, ease } },
  };
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: reduce ? 0 : 0.04 } },
  };
  const viewport = { once: true, amount: 0.2 };

  /* Reusable atoms */
  const PrimaryBtn = ({ children, onClick, className = '' }) => (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm bg-mint px-7 py-3.5 text-sm font-semibold text-forest transition-all duration-300 ease-premium hover:shadow-glow-mint ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-sheen transition-transform duration-700 ease-premium group-hover:translate-x-full" />
      <span className="relative">{children}</span>
      <FiArrowRight className="relative transition-transform duration-300 group-hover:translate-x-1" size={16} />
    </button>
  );

  const GhostBtn = ({ children, onClick, className = '' }) => (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-sm border border-white/20 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 ease-premium hover:border-mint/50 hover:bg-white/[0.06] ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#02150D] text-neutral-700 antialiased">
      {/* ============================== NAV ============================== */}
      <motion.nav
        initial={{ y: reduce ? 0 : -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.7, ease }}
        className={[
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-premium',
          scrolled
            ? 'border-b border-white/10 bg-forest/80 shadow-pop backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8 lg:h-[76px]">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex shrink-0 items-center gap-3 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-sm border border-white/15 bg-white/[0.06] backdrop-blur-sm">
              <img src="/assets/logo2.png" alt="" className="h-6 w-6 object-contain" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tightish text-white sm:text-[15px]">
                Shuraim Air Travel &amp; Tours
              </span>
              <span className="block text-[10px] uppercase tracking-[0.24em] text-mint/80">B2B Flight Desk</span>
            </span>
          </button>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(l.id);
                  }}
                  className="relative rounded-sm px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-200 after:absolute after:inset-x-4 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-mint after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2.5 lg:flex">
            <button
              onClick={() => {
                navigate('/agency/login');
                closeMenu();
              }}
              className="rounded-sm border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition-all duration-300 hover:border-mint/50 hover:text-white"
            >
              Agency Login
            </button>
            <button
              onClick={() => {
                navigate('/agency/register');
                closeMenu();
              }}
              className="group relative overflow-hidden rounded-sm bg-mint px-5 py-2 text-sm font-semibold text-forest transition-all duration-300 hover:shadow-glow-mint"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-sheen transition-transform duration-700 ease-premium group-hover:translate-x-full" />
              <span className="relative">Register Agency</span>
            </button>
          </div>

          <button
            onClick={toggleMenu}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="rounded-sm border border-white/20 p-2 text-white transition-colors duration-200 hover:bg-white/10 lg:hidden"
          >
            <FiMenu size={20} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              variants={fadeIn}
              initial="hidden"
              animate="show"
              exit="hidden"
              onClick={closeMenu}
              aria-hidden="true"
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: reduce ? 0 : 0.4, ease }}
              className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col border-l border-white/10 bg-gradient-forest text-white shadow-pop lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-mint">Menu</span>
                <button
                  onClick={closeMenu}
                  aria-label="Close menu"
                  className="rounded-sm p-1.5 text-white/70 transition-all duration-200 hover:rotate-90 hover:bg-white/10 hover:text-white"
                >
                  <FiX size={20} />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.id}
                    href={`#${l.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(l.id);
                    }}
                    className="flex items-center justify-between rounded-sm px-4 py-4 text-base font-medium text-white/85 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                  >
                    {l.label}
                    <FiChevronRight size={16} className="text-mint" />
                  </a>
                ))}
              </nav>
              <div className="space-y-3 border-t border-white/10 p-6">
                <button
                  onClick={() => {
                    navigate('/agency/login');
                    closeMenu();
                  }}
                  className="w-full rounded-sm border border-white/20 px-4 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10"
                >
                  Agency Login
                </button>
                <button
                  onClick={() => {
                    navigate('/agency/register');
                    closeMenu();
                  }}
                  className="w-full rounded-sm bg-mint px-4 py-3 text-sm font-semibold text-forest shadow-glow-mint"
                >
                  Register Agency
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ============================== HERO ============================== */}
      <section className="relative isolate overflow-hidden bg-gradient-hero-glow">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[620px] w-[620px] rounded-full bg-primary/30 blur-[150px]" />
        <div aria-hidden className="pointer-events-none absolute -left-40 top-1/3 -z-10 h-[460px] w-[460px] rounded-full bg-gold/10 blur-[150px]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #34D498 1px, transparent 1px), linear-gradient(to bottom, #34D498 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
          }}
        />

        <div className="mx-auto max-w-[1240px] px-5 pb-24 pt-32 sm:px-8 lg:pb-32 lg:pt-44">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            {/* Left: copy */}
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 rounded-sm border border-mint/25 bg-mint/[0.07] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-mint backdrop-blur-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
                  </span>
                  Licensed consolidator - No. 1224
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-7 text-[clamp(2.5rem,5.5vw,4.25rem)] font-semibold leading-[1.02] tracking-tightish text-white"
              >
                The booking desk
                <br />
                built for{' '}
                <span className="relative whitespace-nowrap">
                  <span className="bg-gradient-to-r from-mint via-mint-300 to-white bg-clip-text text-transparent">
                    travel agencies
                  </span>
                  <svg
                    aria-hidden
                    viewBox="0 0 300 12"
                    preserveAspectRatio="none"
                    className="absolute -bottom-2 left-0 h-2.5 w-full"
                  >
                    <motion.path
                      d="M2 8 C 80 2, 220 2, 298 6"
                      fill="none"
                      stroke="#34D498"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: reduce ? 0 : 1.1, ease, delay: 0.6 }}
                    />
                  </svg>
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-7 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
                Search live inventory, hold seats without overbooking, issue PDF e-tickets on confirmation, and settle
                every agency ledger - all in one professional portal.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <PrimaryBtn onClick={() => navigate('/agency/register')}>Register as Agency</PrimaryBtn>
                <GhostBtn onClick={() => navigate('/agency/login')}>Agency Login</GhostBtn>
                <button
                  onClick={() => navigate('/admin/login')}
                  className="inline-flex items-center justify-center px-3 py-3.5 text-sm font-medium text-white/50 underline-offset-4 transition-colors duration-200 hover:text-mint hover:underline"
                >
                  Admin Login
                </button>
              </motion.div>
            </motion.div>

            {/* Right: glass departure board (signature) */}
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 40, rotateX: reduce ? 0 : 6 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: reduce ? 0 : 0.9, ease, delay: 0.25 }}
              className="relative"
              style={{ perspective: 1200 }}
            >
              <div className="relative overflow-hidden rounded-md border border-white/10 bg-white/[0.04] shadow-pop backdrop-blur-xl">
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-hairline" />
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <FiSend className="text-mint" size={16} />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                      Live inventory
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-mint">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
                    Updating
                  </span>
                </div>

                <div className="grid grid-cols-[1.1fr_1.4fr_0.9fr_0.9fr] gap-2 px-6 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                  <span>Flight</span>
                  <span>Route</span>
                  <span>Class</span>
                  <span className="text-right">Status</span>
                </div>

                <motion.ul
                  variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.12, delayChildren: 0.5 } } }}
                  initial="hidden"
                  animate="show"
                  className="px-3 pb-3"
                >
                  {BOARD_ROWS.map((r) => (
                    <motion.li
                      key={r.code}
                      variants={{
                        hidden: { opacity: 0, x: reduce ? 0 : 20 },
                        show: { opacity: 1, x: 0, transition: { duration: reduce ? 0 : 0.5, ease } },
                      }}
                      className="group grid grid-cols-[1.1fr_1.4fr_0.9fr_0.9fr] items-center gap-2 rounded-sm px-3 py-3.5 transition-colors duration-200 hover:bg-white/[0.04]"
                    >
                      <span className="font-mono text-sm font-medium text-white">{r.code}</span>
                      <span className="flex items-center gap-2 text-sm text-white/70">
                        <span className="font-mono font-semibold text-white">{r.from}</span>
                        <FiArrowRight size={12} className="text-mint" />
                        <span className="font-mono font-semibold text-white">{r.to}</span>
                      </span>
                      <span className="text-xs text-white/50">{r.gate}</span>
                      <span className="text-right">
                        <span
                          className={[
                            'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-medium',
                            r.status === 'Holding'
                              ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                              : 'border-mint/30 bg-mint/10 text-mint',
                          ].join(' ')}
                        >
                          <span
                            className={`h-1 w-1 rounded-full ${r.status === 'Holding' ? 'bg-amber-300' : 'bg-mint'}`}
                          />
                          {r.status}
                        </span>
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>

                <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-6 py-3.5">
                  <span className="text-[11px] text-white/40">Seats reserved atomically - no overbooking</span>
                  <FiShield size={14} className="text-mint/70" />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.7, ease, delay: 1.1 }}
                className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-sm border border-white/10 bg-forest/90 px-4 py-3 shadow-pop backdrop-blur-xl sm:flex"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-mint/15 text-mint">
                  <FiTag size={16} />
                </div>
                <div className="leading-tight">
                  <p className="font-mono text-sm font-semibold text-white">E-TICKET - QR</p>
                  <p className="text-[11px] text-white/50">Issued on confirmation</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Animated statistics strip */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/10 bg-white/[0.04] backdrop-blur-md lg:grid-cols-4"
          >
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="bg-forest/30 px-6 py-7 sm:px-8">
                <p className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-tightish text-white">
                  <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} reduce={reduce} />
                </p>
                <p className="mt-2 text-sm font-medium text-white/80">{s.label}</p>
                <p className="mt-0.5 text-xs text-white/40">{s.hint}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================== SERVICES ============================== */}
      <section id="services" className="relative overflow-hidden bg-gradient-sand py-24 lg:py-32">
        <div aria-hidden className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-primary/[0.06] blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-gold/[0.10] blur-[130px]" />
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport} className="max-w-2xl">
            <motion.div variants={fadeUp}>
              <Eyebrow tone="dark">What we do</Eyebrow>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="mt-5 text-[clamp(1.875rem,3.8vw,2.75rem)] font-semibold leading-tight tracking-tightish text-ink"
            >
              Comprehensive solutions for your travel booking needs
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              const tone = SERVICE_TONES[i % SERVICE_TONES.length];
              return (
                <motion.article
                  key={s.title}
                  variants={fadeUp}
                  className={cn(
                    'group relative overflow-hidden rounded-xl border bg-white p-8 shadow-card transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-premium',
                    tone.border
                  )}
                >
                  <span className={cn('absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 ease-premium group-hover:scale-x-100', tone.bar)} />
                  <div className="flex items-start justify-between">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg border transition-all duration-300 ease-premium group-hover:scale-105', tone.chip)}>
                      <Icon size={22} />
                    </div>
                    <span className="font-mono text-xs font-medium text-neutral-300 transition-colors duration-300 group-hover:text-neutral-400">
                      {s.no}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-ink">{s.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">{s.body}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================== DESTINATIONS ============================== */}
      <section id="destinations" className="relative overflow-hidden bg-gradient-dusk py-24 lg:py-32">
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-mint/5 blur-[130px]" />
        <div aria-hidden className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-gold/[0.07] blur-[130px]" />
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="max-w-2xl">
              <motion.div variants={fadeUp}>
                <Eyebrow tone="light">Where we fly</Eyebrow>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="mt-5 text-[clamp(1.875rem,3.8vw,2.75rem)] font-semibold leading-tight tracking-tightish text-white"
              >
                Featured destinations we serve
              </motion.h2>
            </div>
            <motion.button
              variants={fadeUp}
              onClick={() => navigate('/agency/register')}
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-mint transition-colors hover:text-mint-300"
            >
              Book through the portal
              <FiArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.button>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {DESTINATIONS.map((d) => (
              <motion.div
                key={d.city}
                variants={fadeUp}
                className="group relative aspect-[3/4] overflow-hidden rounded-md border border-white/10"
              >
                <img
                  src={d.img}
                  alt={d.alt}
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = '/images/placeholder-destination.svg')}
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-premium group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02150D] via-[#02150D]/30 to-transparent" />
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'linear-gradient(to top, rgba(16,96,67,0.55), transparent 60%)' }} />

                <span className="absolute right-4 top-4 rounded-sm border border-white/20 bg-black/30 px-2.5 py-1 font-mono text-xs font-semibold text-white backdrop-blur-md">
                  {d.code}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="h-px w-8 bg-mint transition-all duration-500 ease-premium group-hover:w-16" />
                  <h3 className="mt-4 text-2xl font-semibold tracking-tightish text-white">{d.city}</h3>
                  <p className="mt-1 text-sm text-white/60">{d.country}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================== ABOUT ============================== */}
      <section id="about" className="relative overflow-hidden bg-gradient-sand py-24 lg:py-32">
        <div aria-hidden className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-primary/[0.06] blur-[130px]" />
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport}>
              <motion.div variants={fadeUp}>
                <Eyebrow tone="dark">About Shuraim</Eyebrow>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="mt-5 text-[clamp(1.875rem,3.8vw,2.75rem)] font-semibold leading-tight tracking-tightish text-ink"
              >
                A licensed partner built around agency workflows
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-6 text-base leading-relaxed text-neutral-600">
                Shuraim Air Travel &amp; Tours is a licensed travel agency providing professional B2B flight booking
                solutions. With years of experience in the travel industry, we are committed to delivering exceptional
                service to our partner agencies.
              </motion.p>

              <motion.dl variants={fadeUp} className="mt-10 divide-y divide-sand-200 border-y border-sand-200">
                {[
                  ['Company', 'Shuraim Air Travel & Tours'],
                  ['License No.', '1224'],
                  ['Location', 'Batkhela, Pakistan'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{k}</dt>
                    <dd className="text-right text-sm font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </motion.dl>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2"
            >
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                const tone = SERVICE_TONES[i % SERVICE_TONES.length];
                return (
                  <motion.div
                    key={f.title}
                    variants={fadeUp}
                    className={cn('group rounded-xl border bg-white p-7 shadow-card transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-premium', tone.border)}
                  >
                    <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg border transition-transform duration-300 ease-premium group-hover:scale-110', tone.chip)}>
                      <Icon size={20} />
                    </div>
                    <h4 className="mt-5 text-base font-semibold text-ink">{f.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">{f.body}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Leadership */}
          <div className="mt-28">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              className="mx-auto max-w-2xl text-center"
            >
              <motion.div variants={fadeUp} className="flex justify-center">
                <Eyebrow tone="dark">Leadership</Eyebrow>
              </motion.div>
              <motion.h3
                variants={fadeUp}
                className="mt-5 text-[clamp(1.625rem,3.2vw,2.25rem)] font-semibold leading-tight tracking-tightish text-ink"
              >
                Meet our leadership
              </motion.h3>
              <motion.p variants={fadeUp} className="mt-4 text-sm text-neutral-500">
                Trusted professionals guiding Shuraim Air Travel &amp; Tours
              </motion.p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2"
            >
              {LEADERSHIP.map((p) => (
                <motion.div
                  key={p.name}
                  variants={fadeUp}
                  className="group overflow-hidden rounded-xl border border-sand-200 bg-white shadow-card transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-premium"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={p.img}
                      alt={p.alt}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-profile.svg';
                      }}
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-premium group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-5 rounded-full border border-mint/30 bg-forest/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-mint backdrop-blur-md">
                      {p.role}
                    </span>
                  </div>
                  <div className="p-7">
                    <p className="text-lg font-semibold text-ink">{p.name}</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">{p.bio}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================== CONTACT ============================== */}
      <section id="contact" className="relative bg-gradient-dusk py-24 lg:py-32">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div variants={fadeUp} className="flex justify-center">
              <Eyebrow tone="light">Contact us</Eyebrow>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="mt-5 text-[clamp(1.875rem,3.8vw,2.75rem)] font-semibold leading-tight tracking-tightish text-white"
            >
              Get in touch
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-base leading-relaxed text-white/55">
              Ready to partner with us? Our team is here to assist you with all your travel booking needs. Reach out
              through any channel below.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            {/* Phone card */}
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-md border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10"
            >
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-hairline" />
              <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-mint/25 bg-mint/[0.08] text-mint">
                <FiPhone size={22} />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Call us directly</h3>
              <p className="mt-1.5 text-sm text-white/50">Speak with our team for immediate assistance</p>

              <div className="mt-8 space-y-7">
                {[
                  { role: 'CEO - Yasir Khan', numbers: [['0346-9317338', 'tel:03469317338'], ['0318-9317342', 'tel:03189317342']] },
                  { role: 'MD - Sudais Ahmad', numbers: [['0343-3173386', 'tel:03433173386'], ['0312-1673386', 'tel:03121673386']] },
                ].map((person) => (
                  <div key={person.role}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">{person.role}</p>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      {person.numbers.map(([label, href]) => (
                        <a
                          key={href}
                          href={href}
                          className="group inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/[0.03] px-3.5 py-2 font-mono text-sm text-white transition-all duration-300 ease-premium hover:border-mint/40 hover:bg-mint/[0.08]"
                        >
                          <FiPhone size={13} className="text-mint" />
                          {label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="h-px w-full bg-white/10" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Landline</span>
                  <a href="tel:09324115061" className="font-mono text-sm text-mint transition-colors hover:text-mint-300">
                    (0932) 411506
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Email & location card */}
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-md border border-gold/20 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10"
            >
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-hairline-gold" />
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/10 blur-[80px]" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-gold/25 bg-gold/[0.10] text-gold-200">
                  <FiMail size={22} />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">Email &amp; location</h3>
                <p className="mt-1.5 text-sm text-white/50">Send us a message or visit our office</p>

                <div className="mt-8 space-y-4">
                  <a
                    href="mailto:shuraimintl@gmail.com"
                    className="flex items-start gap-4 rounded-sm border border-white/10 bg-white/[0.02] p-4 transition-colors duration-300 hover:border-gold/30 hover:bg-gold/[0.05]"
                  >
                    <FiMail size={18} className="mt-0.5 shrink-0 text-gold-200" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Email address</p>
                      <p className="mt-0.5 truncate text-sm font-medium text-white">shuraimintl@gmail.com</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 rounded-sm border border-white/10 bg-white/[0.02] p-4">
                    <FiMapPin size={18} className="mt-0.5 shrink-0 text-gold-200" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Office address</p>
                      <p className="mt-0.5 text-sm font-medium text-white">1st Floor, Hayat Khan Plaza</p>
                      <p className="text-sm font-medium text-white">Batkhela, Pakistan</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-sm border border-white/10 bg-white/[0.02] p-4">
                    <FiClock size={18} className="mt-0.5 shrink-0 text-gold-200" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Business hours</p>
                      <p className="mt-0.5 text-sm font-medium text-white">Mon - Sat: 9:00 AM - 6:00 PM</p>
                      <p className="text-sm font-medium text-white/45">Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Quick contact bar */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="mt-6 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-md border border-white/10 bg-white/[0.04] px-8 py-7 backdrop-blur-xl sm:flex-row sm:items-center"
          >
            <div>
              <h4 className="text-lg font-semibold text-white">Need immediate assistance?</h4>
              <p className="mt-1.5 text-sm text-white/55">Our support team is available during business hours to help you</p>
            </div>
            <a
              href="mailto:shuraimintl@gmail.com"
              className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-sm bg-mint px-6 py-3.5 text-sm font-semibold text-forest transition-all duration-300 ease-premium hover:shadow-glow-mint"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-sheen transition-transform duration-700 ease-premium group-hover:translate-x-full" />
              <FiMail size={16} className="relative" />
              <span className="relative">Send Email</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section className="relative isolate overflow-hidden bg-[#02150D] py-24 lg:py-28">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/30 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-gold/10 blur-[130px]" />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="relative mx-auto max-w-3xl px-5 text-center sm:px-8"
        >
          <motion.h2
            variants={fadeUp}
            className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-tightish text-white"
          >
            Ready to partner with us?
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/60">
            Join hundreds of agencies using Shuraim Air Travel &amp; Tours for their flight booking needs
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryBtn onClick={() => navigate('/agency/register')}>Register as Agency</PrimaryBtn>
            <GhostBtn onClick={() => scrollToSection('contact')}>Contact Us</GhostBtn>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer className="border-t border-white/10 bg-forest text-white/60">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-sm border border-white/15 bg-white/[0.06]">
                  <img src="/assets/logo2.png" alt="" className="h-6 w-6 object-contain" />
                </span>
                <span className="leading-tight">
                  <span className="block text-base font-semibold text-white">Shuraim</span>
                  <span className="block text-[11px] uppercase tracking-[0.16em] text-mint">Air Travel &amp; Tours</span>
                </span>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-white/50">
                Professional B2B flight booking solutions for travel agencies. Licensed and trusted partner for your
                aviation needs.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-sm border border-mint/25 bg-mint/[0.08] px-3 py-1.5 text-xs font-semibold text-mint">
                <FiShield size={14} />
                License No: 1224
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">Quick Links</h4>
              <ul className="mt-6 space-y-3.5">
                {[
                  { id: 'services', label: 'Our Services' },
                  { id: 'destinations', label: 'Destinations' },
                  { id: 'about', label: 'About Us' },
                  { id: 'contact', label: 'Contact' },
                ].map((l) => (
                  <li key={l.id}>
                    <a
                      href={`#${l.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(l.id);
                      }}
                      className="group inline-flex items-center gap-2 text-sm text-white/50 transition-colors duration-200 hover:text-mint"
                    >
                      <FiChevronRight size={13} className="text-mint/50 transition-transform duration-200 group-hover:translate-x-1" />
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">For Agencies</h4>
              <ul className="mt-6 space-y-3.5">
                {[
                  { href: '/agency/register', label: 'Agency Registration' },
                  { href: '/agency/login', label: 'Agency Login' },
                ].map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="group inline-flex items-center gap-2 text-sm text-white/50 transition-colors duration-200 hover:text-mint"
                    >
                      <FiChevronRight size={13} className="text-mint/50 transition-transform duration-200 group-hover:translate-x-1" />
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">Get In Touch</h4>
              <ul className="mt-6 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <FiPhone size={15} className="mt-0.5 shrink-0 text-mint" />
                  <div className="flex flex-col font-mono">
                    <a href="tel:03469317338" className="text-white/50 transition-colors hover:text-mint">0346-9317338</a>
                    <a href="tel:03189317342" className="text-white/50 transition-colors hover:text-mint">0318-9317342</a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FiMail size={15} className="mt-0.5 shrink-0 text-mint" />
                  <a href="mailto:shuraimintl@gmail.com" className="break-all text-white/50 transition-colors hover:text-mint">
                    shuraimintl@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <FiMapPin size={15} className="mt-0.5 shrink-0 text-mint" />
                  <div className="flex flex-col text-white/50">
                    <span>1st Floor, Hayat Khan Plaza</span>
                    <span>Batkhela, Pakistan</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 px-5 py-6 sm:flex-row sm:px-8">
            <p className="text-xs text-white/40">&copy; 2026 Shuraim Air Travel &amp; Tours. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs">
              <a href="#privacy" className="text-white/40 transition-colors hover:text-mint">Privacy Policy</a>
              <span className="text-white/20">•</span>
              <a href="#terms" className="text-white/40 transition-colors hover:text-mint">Terms of Service</a>
              <span className="text-white/20">•</span>
              <a href="#cookies" className="text-white/40 transition-colors hover:text-mint">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;