import React from 'react';
import { cn } from './cn';

// Semantic status pills. Maps common booking/agency/payment statuses to colors.
const TONES = {
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  primary: 'bg-gradient-chip text-primary-700 border-primary-200',
  mint: 'bg-mint-50 text-primary-700 border-mint-200',
  gold: 'bg-gold-50 text-gold-700 border-gold-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
};

const DOTS = {
  neutral: 'bg-neutral-400',
  primary: 'bg-primary',
  mint: 'bg-mint',
  gold: 'bg-gold',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

const STATUS_TONE = {
  // bookings
  sold: 'success',
  completed: 'success',
  approved: 'success',
  active: 'success',
  hold: 'warning',
  pending: 'warning',
  cancel_requested: 'warning',
  reviewed: 'primary',
  new: 'primary',
  cancelled: 'danger',
  rejected: 'danger',
  blocked: 'danger',
};

export default function Badge({ children, tone, status, dot = true, className }) {
  const resolved = tone || (status && STATUS_TONE[String(status).toLowerCase()]) || 'neutral';
  const label = children ?? (status ? String(status).replace(/_/g, ' ') : '');
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        'transition-colors duration-200',
        TONES[resolved] || TONES.neutral,
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOTS[resolved] || DOTS.neutral)} aria-hidden />}
      {label}
    </span>
  );
}
