import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
  animate,
} from 'framer-motion';
import {
  FiMenu,
  FiX,
  FiShield,
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiChevronRight,
  FiArrowUpRight,
  FiArrowRight,
} from 'react-icons/fi';
import {
  HiPaperAirplane,
  HiCreditCard,
  HiClipboardDocumentList,
  HiChartBarSquare,
  HiTicket,
  HiChatBubbleLeftRight,
  HiUserPlus,
  HiMagnifyingGlass,
  HiClipboardDocumentCheck,
  HiShieldCheck,
  HiGlobeAlt,
  HiBolt,
  HiUsers,
} from 'react-icons/hi2';
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

const SERVICES = [
  { icon: HiPaperAirplane, no: '01', title: 'Flight Bookings', body: 'Easy and reliable flight booking system for travel agencies with competitive pricing' },
  { icon: HiCreditCard, no: '02', title: 'Payment Solutions', body: 'Secure and flexible payment methods with multiple bank options' },
  { icon: HiClipboardDocumentList, no: '03', title: 'Booking Management', body: 'Complete booking management system with real-time status updates' },
  { icon: HiChartBarSquare, no: '04', title: 'Analytics & Reports', body: 'Detailed ledger and financial reports for better business insights' },
  { icon: HiTicket, no: '05', title: 'E-Tickets', body: 'Professional PDF e-tickets with QR codes for passenger convenience' },
  { icon: HiChatBubbleLeftRight, no: '06', title: 'Support & Feedback', body: '24/7 customer support and feedback system for continuous improvement' },
];

// Icon tiles all use the same brand blue; cards keep a subtle hover accent.
const SERVICE_TONES = [
  { tile: 'bg-gradient-brand shadow-glow', bar: 'bg-gradient-brand', border: 'hover:border-primary-200', ghost: 'group-hover:text-primary-100' },
  { tile: 'bg-gradient-brand shadow-glow', bar: 'bg-gradient-brand', border: 'hover:border-primary-200', ghost: 'group-hover:text-primary-100' },
  { tile: 'bg-gradient-brand shadow-glow', bar: 'bg-gradient-brand', border: 'hover:border-primary-200', ghost: 'group-hover:text-primary-100' },
];

const DESTINATIONS = [
  { city: 'Dubai', country: 'United Arab Emirates', code: 'DXB', img: '/images/destinations/dubai.jpg', alt: 'Dubai, UAE' },
  { city: 'Saudi Arabia', country: 'Kingdom of Saudi Arabia', code: 'JED', img: '/images/destinations/ksa.jpg', alt: 'Saudi Arabia' },
  { city: 'Tokyo', country: 'Japan', code: 'HND', img: '/images/destinations/tokyo.jpg', alt: 'Tokyo, Japan' },
  { city: 'New York', country: 'United States', code: 'JFK', img: '/images/destinations/newyork.jpg', alt: 'New York, USA' },
  { city: 'London', country: 'United Kingdom', code: 'LHR', img: '/images/destinations/london.jpg', alt: 'London, UK' },
  { city: 'Paris', country: 'France', code: 'CDG', img: '/images/destinations/paris.jpg', alt: 'Paris, France' },
];

const HOW_STEPS = [
  { icon: HiUserPlus, no: '01', title: 'Register your agency', body: 'Submit your agency details. We verify and approve licensed partners so the network stays trusted.' },
  { icon: HiMagnifyingGlass, no: '02', title: 'Search live inventory', body: 'Browse group, Umrah and international fares with real-time seat availability and pricing.' },
  { icon: HiClipboardDocumentCheck, no: '03', title: 'Book & hold seats', body: 'Reserve seats atomically with no overbooking, add passenger details, and hold or confirm.' },
  { icon: HiTicket, no: '04', title: 'Issue e-tickets', body: 'Get a PDF e-ticket with QR the moment a booking is confirmed, and settle on your ledger.' },
];

const FEATURES = [
  { icon: HiShieldCheck, title: 'Licensed & Trusted', body: 'Officially licensed travel agency with proven track record' },
  { icon: HiGlobeAlt, title: 'Global Network', body: 'Connected with airlines worldwide for best deals' },
  { icon: HiBolt, title: 'Fast Processing', body: 'Quick booking confirmations and instant e-ticket generation' },
  { icon: HiUsers, title: 'Partner Support', body: 'Dedicated support team for all partner agencies' },
];

const LEADERSHIP = [
  { name: 'Yasir Khan', role: 'CEO', img: '/images/ceo.jpg', alt: 'Yasir Khan - CEO', bio: 'Visionary leader with extensive experience in travel industry operations and B2B partnerships' },
  { name: 'Sudais Ahmad', role: 'Managing Director', img: '/images/md.jpg', alt: 'Sudais Ahmad - MD', bio: 'Strategic thinker dedicated to delivering innovative solutions and exceptional customer service' },
];

const NAV_LINKS = [
  { id: 'services', label: 'Services' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'destinations', label: 'Destinations' },
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
  const [active, setActive] = useState('home');

  useEffect(() => {
    const ids = ['services', 'how-it-works', 'destinations', 'about', 'contact'];
    const onScroll = () => {
      const probe = window.scrollY + 140;
      let current = 'home';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= probe) current = id;
      }
      setActive(current);
    };
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

  /* Stronger, clearly-visible hero entrance (staggered) */
  const heroContainer = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.14, delayChildren: reduce ? 0 : 0.15 } },
  };
  const heroItem = {
    hidden: { opacity: 0, y: reduce ? 0 : 42, filter: reduce ? 'none' : 'blur(6px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: reduce ? 0 : 0.85, ease },
    },
  };

  /* Hero plane — scroll-linked diagonal drift (bottom-left → top-right) */
  const { scrollY } = useScroll();
  const planeX = useTransform(scrollY, [0, 900], [0, 560]);
  const planeY = useTransform(scrollY, [0, 900], [0, -660]);
  const planeRotate = useTransform(scrollY, [0, 900], [0, -7]);
  const planeScale = useTransform(scrollY, [0, 900], [1, 0.78]);
  const planeOpacity = useTransform(scrollY, [0, 650, 950], [1, 1, 0]);
  // Behind the hero text on load (readable); rises above it once scrolling starts.
  const planeZ = useTransform(scrollY, [0, 30, 31], [0, 0, 40]);

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
    <div className="min-h-screen overflow-x-hidden bg-[#071A36] text-neutral-700 antialiased">
      {/* ============================== NAV ============================== */}
      <motion.nav
        initial={{ y: reduce ? 0 : -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.7, ease }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className="mx-auto flex max-w-[1340px] items-center justify-between gap-5 px-5 pt-5 sm:px-8">
          {/* Brand */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex shrink-0 items-center gap-2.5 text-left"
          >
            <img src="/assets/shuraim-favicon.png" alt="Shuraim Air" className="h-12 w-12 shrink-0 object-contain" />
            <span className="hidden leading-tight sm:block">
              <span className="block text-base font-bold tracking-tight text-ink">Shuraim Air</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Travel &amp; Tours</span>
            </span>
          </button>

          {/* Center menu — transparent, with a minimal underline hover */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-1">
              {[{ id: 'home', label: 'Home' }, ...NAV_LINKS].map((l) => {
                const isActive = active === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => (l.id === 'home' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : goTo(l.id))}
                    className={cn(
                      'group relative whitespace-nowrap px-3.5 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors duration-300',
                      isActive ? 'text-primary' : 'text-ink/60 hover:text-ink'
                    )}
                  >
                    {l.label}
                    {/* Minimal underline: grows from the center on hover, persists when active */}
                    <span
                      className={cn(
                        'pointer-events-none absolute -bottom-0.5 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 ease-premium',
                        isActive ? 'w-6 opacity-100' : 'w-0 opacity-0 group-hover:w-6 group-hover:opacity-100'
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right actions */}
          <div className="hidden items-center gap-2.5 lg:flex">
            <button
              onClick={() => navigate('/agency/login')}
              className="whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:text-primary"
            >
              Agency Login
            </button>
            <button
              onClick={() => navigate('/agency/register')}
              className="group relative overflow-hidden whitespace-nowrap rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition-all duration-300 ease-premium hover:shadow-premium"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-sheen transition-transform duration-700 ease-premium group-hover:translate-x-full" />
              <span className="relative">Register Agency</span>
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={toggleMenu}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="rounded-full border border-neutral-200 bg-white p-3 text-ink shadow-card transition-colors duration-200 hover:bg-neutral-100 lg:hidden"
          >
            <FiMenu size={24} />
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
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#8CC6F5] via-[#B7DEFB] to-[#EAF4FE]">
        {/* Soft sun glow */}
        <div aria-hidden className="pointer-events-none absolute -top-24 right-[10%] -z-10 h-[440px] w-[440px] rounded-full bg-white/70 blur-[130px]" />
        <div aria-hidden className="pointer-events-none absolute -left-32 top-1/3 -z-10 h-[380px] w-[380px] rounded-full bg-mint/15 blur-[150px]" />

        {/* Clouds stuck to the TOP edge — pushed up so only their lower ~30-35%
            peeks down (like the underside of clouds overhead). Overlapping mix of
            both images, kept at natural aspect, with a soft lower edge. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%] overflow-hidden">
          {[
            { left: '-16%', w: 56, op: 0.6, dur: 88, dx: 14, ty: -42 },
            { left: '-5%', w: 50, op: 0.5, dur: 118, dx: -10, ty: -48 },
            { left: '6%', w: 58, op: 0.62, dur: 96, dx: 18, ty: -40 },
            { left: '18%', w: 52, op: 0.52, dur: 108, dx: -14, ty: -47 },
            { left: '30%', w: 58, op: 0.62, dur: 92, dx: 16, ty: -41 },
            { left: '42%', w: 52, op: 0.5, dur: 122, dx: -12, ty: -49 },
            { left: '54%', w: 56, op: 0.6, dur: 98, dx: 18, ty: -42 },
            { left: '65%', w: 52, op: 0.52, dur: 112, dx: -14, ty: -47 },
            { left: '76%', w: 58, op: 0.62, dur: 90, dx: 16, ty: -40 },
            { left: '87%', w: 52, op: 0.5, dur: 116, dx: -12, ty: -48 },
            { left: '96%', w: 56, op: 0.6, dur: 100, dx: 14, ty: -43 },
          ].map((c, i) => (
            <motion.img
              key={i}
              src="/images/cloud-img.png"
              alt=""
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="absolute max-w-none select-none"
              style={{
                left: c.left,
                top: 0,
                width: `${c.w}%`,
                opacity: c.op,
                y: `${c.ty}%`,
                maskImage: 'linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%)',
              }}
              animate={reduce ? undefined : { x: [0, c.dx, 0] }}
              transition={{ duration: c.dur, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Signature branded plane: flies in from the left on load, then drifts
            diagonally up-right as you scroll. Rests ~20% off the left edge.
            Drop the PNG at /public/images/shuraim-plane.png (falls back to hidden). */}
        <motion.div
          aria-hidden
          style={reduce ? undefined : { x: planeX, y: planeY, rotate: planeRotate, scale: planeScale, opacity: planeOpacity, zIndex: planeZ }}
          className="pointer-events-none absolute left-[-8%] top-[54vh] z-0 hidden w-[clamp(300px,38vw,600px)] lg:block"
        >
          {/* Soft cast shadow that travels with the plane (behind it) */}
          <span
            aria-hidden
            className="absolute left-[10%] top-[58%] h-[16%] w-[66%] -rotate-6 rounded-[50%] bg-forest/35 blur-2xl"
          />
          <motion.img
            src="/images/shuraim-plane.png"
            alt=""
            initial={{ x: reduce ? 0 : -380, y: reduce ? 0 : 40, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: reduce ? 0 : 1.6, ease, delay: 0.2 }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="relative w-full drop-shadow-[0_26px_40px_rgba(11,36,71,0.30)]"
          />
        </motion.div>

        <div className="relative z-10 mx-auto max-w-[1080px] px-5 pb-20 pt-32 text-center sm:px-8 lg:pb-24 lg:pt-40">
          <motion.div variants={heroContainer} initial="hidden" animate="show">
            {/* Badge */}
            <motion.div variants={heroItem} className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
                </span>
                Licensed consolidator - No. 1224
              </span>
            </motion.div>

            {/* Big gradient headline */}
            <motion.h1
              variants={heroItem}
              className="mx-auto mt-8 max-w-[16ch] text-[clamp(2.75rem,8vw,5.75rem)] font-extrabold leading-[0.98] tracking-[-0.03em]"
            >
              <span className="bg-gradient-to-br from-ink via-primary to-mint bg-clip-text text-transparent">
                The booking desk built for travel agencies
              </span>
            </motion.h1>

            <motion.p variants={heroItem} className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              Search live inventory, hold seats without overbooking, issue PDF e-tickets on confirmation, and settle
              every agency ledger — all in one professional portal.
            </motion.p>

            <motion.div variants={heroItem} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/agency/register')}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-sm bg-gradient-brand px-8 py-4 text-sm font-semibold text-white shadow-glow transition-all duration-300 ease-premium hover:shadow-premium"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-sheen transition-transform duration-700 ease-premium group-hover:translate-x-full" />
                <span className="relative">Register as Agency</span>
                <FiArrowRight className="relative transition-transform duration-300 group-hover:translate-x-1" size={16} />
              </button>
              <button
                onClick={() => navigate('/agency/login')}
                className="inline-flex items-center justify-center rounded-sm border border-neutral-300 bg-white px-8 py-4 text-sm font-semibold text-ink transition-colors duration-300 hover:border-primary-300 hover:bg-primary-50"
              >
                Agency Login
              </button>
              <button
                onClick={() => navigate('/admin/login')}
                className="inline-flex items-center justify-center px-3 py-4 text-sm font-medium text-neutral-400 underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
              >
                Admin Login
              </button>
            </motion.div>
          </motion.div>

          {/* Animated statistics strip (light) */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 lg:grid-cols-4"
          >
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="bg-white px-6 py-7 text-left sm:px-8">
                <p className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-tightish">
                  <span className="bg-gradient-to-br from-ink via-primary to-mint bg-clip-text text-transparent">
                    <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} reduce={reduce} />
                  </span>
                </p>
                <p className="mt-2 text-sm font-medium text-ink">{s.label}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{s.hint}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================== SERVICES ============================== */}
      <section id="services" className="relative overflow-hidden bg-white py-24 lg:py-32">
        <div aria-hidden className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-primary/[0.05] blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-mint/[0.08] blur-[130px]" />
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
                    'group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-7 shadow-card transition-all duration-300 ease-premium hover:-translate-y-1.5 hover:shadow-premium',
                    tone.border
                  )}
                >
                  {/* Hover wash */}
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-primary-50/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  {/* Big ghost number */}
                  <span className={cn('pointer-events-none absolute right-5 top-5 font-display text-[54px] font-extrabold leading-none tracking-tight text-neutral-100 transition-colors duration-300', tone.ghost)}>
                    {s.no}
                  </span>
                  <div className="relative">
                    <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl text-white transition-all duration-300 ease-premium group-hover:-translate-y-0.5 group-hover:scale-105', tone.tile)}>
                      <Icon size={26} />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-ink">{s.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">{s.body}</p>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================== HOW IT WORKS ============================== */}
      <section id="how-it-works" className="relative overflow-hidden bg-neutral-50 py-24 lg:py-32">
        <div aria-hidden className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-mint/[0.08] blur-[120px]" />
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={viewport} className="max-w-2xl">
            <motion.div variants={fadeUp}>
              <Eyebrow tone="dark">Getting started</Eyebrow>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="mt-5 text-[clamp(1.875rem,3.8vw,2.75rem)] font-semibold leading-tight tracking-tightish text-ink"
            >
              From sign-up to issued ticket in four steps
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 text-base leading-relaxed text-neutral-600">
              No integrations, no waiting on the phone. Get approved once, then book and issue tickets on your own time.
            </motion.p>
          </motion.div>

          <motion.ol
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="relative mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {/* Connecting rail (desktop) with a plane flying the route */}
            <span aria-hidden className="absolute left-0 right-0 top-7 hidden h-px bg-[repeating-linear-gradient(to_right,theme(colors.primary.200)_0_10px,transparent_10px_18px)] lg:block" />
            {!reduce && (
              <motion.span
                aria-hidden
                className="absolute top-7 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
                initial={{ left: '2%' }}
                animate={{ left: '98%' }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }}
              >
                <span className="block h-4 w-4 rounded-full bg-gradient-brand shadow-glow ring-4 ring-primary/20" />
              </motion.span>
            )}

            {HOW_STEPS.map((s, i) => {
              const Icon = s.icon;
              const tone = SERVICE_TONES[i % SERVICE_TONES.length];
              return (
                <motion.li key={s.no} variants={fadeUp} className="group relative">
                  <div className="flex items-center gap-4">
                    <div className={cn('relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white transition-transform duration-300 ease-premium group-hover:-translate-y-0.5 group-hover:scale-105', tone.tile)}>
                      <Icon size={24} />
                    </div>
                    <span className="font-display text-4xl font-extrabold text-neutral-200">{s.no}</span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-ink">{s.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">{s.body}</p>
                </motion.li>
              );
            })}
          </motion.ol>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="mt-14"
          >
            <button
              onClick={() => navigate('/agency/register')}
              className="group inline-flex items-center gap-2 rounded-sm bg-gradient-brand px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-all duration-300 ease-premium hover:shadow-premium"
            >
              Register your agency
              <FiArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ============================== DESTINATIONS ============================== */}
      <section id="destinations" className="relative overflow-hidden bg-white py-24 lg:py-32">
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/[0.05] blur-[130px]" />
        <div aria-hidden className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-mint/[0.07] blur-[130px]" />
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
                <Eyebrow tone="dark">Where we fly</Eyebrow>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="mt-5 text-[clamp(1.875rem,3.8vw,2.75rem)] font-semibold leading-tight tracking-tightish text-ink"
              >
                Featured destinations we serve
              </motion.h2>
            </div>
            <motion.button
              variants={fadeUp}
              onClick={() => navigate('/agency/register')}
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-700"
            >
              Book through the portal
              <FiArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.button>
          </motion.div>

        </div>

        {/* Full-width auto-scrolling marquee — drifts right → left, pauses on hover */}
        <div className="group relative mt-14 overflow-hidden">
          <div className="flex w-max animate-marquee gap-5 px-5 [animation-direction:reverse] group-hover:[animation-play-state:paused] motion-reduce:animate-none sm:px-8">
            {[...DESTINATIONS, ...DESTINATIONS].map((d, i) => (
              <div
                key={`${d.city}-${i}`}
                className="group/card relative aspect-[3/4] w-64 shrink-0 overflow-hidden rounded-3xl border border-neutral-200 shadow-card sm:w-80"
              >
                <img
                  src={d.img}
                  alt={d.alt}
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = '/images/placeholder-destination.svg')}
                  className="h-full w-full object-cover transition-transform duration-700 ease-premium group-hover/card:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071A36] via-[#071A36]/25 to-transparent" />
                <span className="absolute right-4 top-4 rounded-md border border-white/20 bg-black/30 px-2.5 py-1 font-mono text-xs font-semibold text-white backdrop-blur-md">
                  {d.code}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="h-px w-8 bg-mint transition-all duration-500 ease-premium group-hover/card:w-16" />
                  <h3 className="mt-4 text-2xl font-semibold tracking-tightish text-white">{d.city}</h3>
                  <p className="mt-1 text-sm text-white/60">{d.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== ABOUT ============================== */}
      <section id="about" className="relative overflow-hidden bg-white py-24 lg:py-32">
        <div aria-hidden className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-primary/[0.05] blur-[130px]" />
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

              <motion.dl variants={fadeUp} className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200">
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
                    className={cn('group rounded-2xl border border-neutral-200 bg-white p-7 shadow-card transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-premium', tone.border)}
                  >
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl text-white transition-transform duration-300 ease-premium group-hover:-translate-y-0.5 group-hover:scale-110', tone.tile)}>
                      <Icon size={22} />
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
              className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2"
            >
              {LEADERSHIP.map((p) => (
                <motion.div
                  key={p.name}
                  variants={fadeUp}
                  className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-card transition-all duration-300 ease-premium hover:-translate-y-1.5 hover:border-primary-200 hover:shadow-premium"
                >
                  {/* Hover wash */}
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-50/0 to-primary-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Circular photo with a gradient ring */}
                  <div className="relative rounded-full bg-gradient-brand p-[3px] shadow-glow transition-transform duration-300 ease-premium group-hover:scale-105">
                    <div className="rounded-full bg-white p-1">
                      <img
                        src={p.img}
                        alt={p.alt}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-profile.svg';
                        }}
                        className="block h-36 w-36 rounded-full object-cover object-center sm:h-44 sm:w-44"
                      />
                    </div>
                  </div>

                  <span className="relative mt-5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-700">
                    {p.role}
                  </span>
                  <p className="relative mt-3 text-lg font-semibold text-ink">{p.name}</p>
                  <p className="relative mt-2.5 max-w-xs text-sm leading-relaxed text-neutral-600">{p.bio}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================== CONTACT ============================== */}
      <section id="contact" className="relative overflow-hidden bg-neutral-50 py-24 lg:py-32">
        <div aria-hidden className="pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-primary/[0.05] blur-[130px]" />
        <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-mint/[0.07] blur-[130px]" />
        <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div variants={fadeUp} className="flex justify-center">
              <Eyebrow tone="dark">Contact us</Eyebrow>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="mt-5 text-[clamp(1.875rem,3.8vw,2.75rem)] font-semibold leading-tight tracking-tightish text-ink"
            >
              Get in touch
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-base leading-relaxed text-neutral-600">
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
              className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-8 shadow-card transition-shadow duration-300 hover:shadow-premium sm:p-10"
            >
              <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-brand" />
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary-200 bg-gradient-chip text-primary-700">
                <FiPhone size={22} />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-ink">Call us directly</h3>
              <p className="mt-1.5 text-sm text-neutral-500">Speak with our team for immediate assistance</p>

              <div className="mt-8 space-y-7">
                {[
                  { role: 'CEO - Yasir Khan', numbers: [['0346-9317338', 'tel:03469317338'], ['0318-9317342', 'tel:03189317342']] },
                  { role: 'MD - Sudais Ahmad', numbers: [['0343-3173386', 'tel:03433173386'], ['0312-1673386', 'tel:03121673386']] },
                ].map((person) => (
                  <div key={person.role}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">{person.role}</p>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      {person.numbers.map(([label, href]) => (
                        <a
                          key={href}
                          href={href}
                          className="group inline-flex items-center gap-2 rounded-sm border border-neutral-200 bg-neutral-50 px-3.5 py-2 font-mono text-sm text-ink transition-all duration-300 ease-premium hover:border-primary-300 hover:bg-primary-50"
                        >
                          <FiPhone size={13} className="text-primary" />
                          {label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="h-px w-full bg-neutral-200" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Landline</span>
                  <a href="tel:09324115061" className="font-mono text-sm font-medium text-primary transition-colors hover:text-primary-700">
                    (0932) 411506
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Email & location card */}
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-8 shadow-card transition-shadow duration-300 hover:shadow-premium sm:p-10"
            >
              <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-mint" />
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-mint-200 bg-mint-50 text-primary-700">
                <FiMail size={22} />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-ink">Email &amp; location</h3>
              <p className="mt-1.5 text-sm text-neutral-500">Send us a message or visit our office</p>

              <div className="mt-8 space-y-4">
                <a
                  href="mailto:shuraimintl@gmail.com"
                  className="flex items-start gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition-colors duration-300 hover:border-mint-300 hover:bg-mint-50"
                >
                  <FiMail size={18} className="mt-0.5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Email address</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-ink">shuraimintl@gmail.com</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                  <FiMapPin size={18} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Office address</p>
                    <p className="mt-0.5 text-sm font-medium text-ink">1st Floor, Hayat Khan Plaza</p>
                    <p className="text-sm font-medium text-neutral-600">Batkhela, Pakistan</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                  <FiClock size={18} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Business hours</p>
                    <p className="mt-0.5 text-sm font-medium text-ink">Mon - Sat: 9:00 AM - 6:00 PM</p>
                    <p className="text-sm font-medium text-neutral-400">Sunday: Closed</p>
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
            className="relative mt-6 flex flex-col items-start justify-between gap-5 overflow-hidden rounded-xl border border-primary-200 bg-gradient-brand px-8 py-7 sm:flex-row sm:items-center"
          >
            <div className="relative">
              <h4 className="text-lg font-semibold text-white">Need immediate assistance?</h4>
              <p className="mt-1.5 text-sm text-white/70">Our support team is available during business hours to help you</p>
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
      <section className="relative isolate overflow-hidden bg-[#071A36] py-24 lg:py-28">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/30 blur-[140px]" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-mint/10 blur-[130px]" />
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
                  <img src="/assets/shuraim-favicon.png" alt="" className="h-6 w-6 object-contain" />
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

      {/* Persistent progressive blur along the bottom of the viewport — many thin
          layers so the blur ramps up smoothly toward the edge (content emerges from
          the frosted fade as you scroll). Visual only, sits below the nav. */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-[80px] sm:h-[111px]">
        {[
          { blur: 0.6, from: 0 },
          { blur: 1.5, from: 16 },
          { blur: 3, from: 30 },
          { blur: 6, from: 44 },
          { blur: 12, from: 58 },
          { blur: 22, from: 72 },
          { blur: 40, from: 86 },
        ].map((l, i) => {
          const mask = `linear-gradient(to bottom, transparent ${l.from}%, #000 ${Math.min(l.from + 20, 100)}%)`;
          return (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                backdropFilter: `blur(${l.blur}px)`,
                WebkitBackdropFilter: `blur(${l.blur}px)`,
                maskImage: mask,
                WebkitMaskImage: mask,
              }}
            />
          );
        })}
        {/* Whisper-soft light lift at the very bottom for extra smoothness */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/25 to-transparent" />
      </div>
    </div>
  );
};

export default LandingPage;