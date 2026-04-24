export const STATUS_COLORS = {
  pending:     { bg: 'rgba(245,158,11,0.15)',  text: '#F59E0B' },
  paid:        { bg: 'rgba(59,130,246,0.15)',   text: '#60A5FA' },
  in_progress: { bg: 'rgba(6,182,212,0.15)',    text: '#06B6D4' },
  review:      { bg: 'rgba(124,58,237,0.15)',   text: '#A78BFA' },
  completed:   { bg: 'rgba(34,197,94,0.15)',    text: '#22C55E' },
  cancelled:   { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
}

export const OFFER_COLORS = {
  starter: '#6B7280',
  pro:     '#7C3AED',
  premium: '#F59E0B',
}

export const PAID_STATUSES = ['paid', 'in_progress', 'review', 'completed']
