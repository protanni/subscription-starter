// utils/stripe/types.ts
// Sprint 1: Stability Core
// Purpose: Provide minimal, local Stripe-related types so UI/helpers can compile
// without depending on Database Tables<'prices'|'products'|'subscriptions'>,
// since these tables are not present in the canonical typed Supabase schema snapshot.
// utils/stripe/types.ts

export type StripeInterval = 'day' | 'week' | 'month' | 'year';

export type StripeProductLite = {
  id: string;
  name: string;
  description: string | null;
};

export type StripePriceLite = {
  id: string;
  currency: string | null;
  unit_amount: number | null;
  interval: StripeInterval | null;
  trial_period_days: number | null;
  type: 'recurring' | 'one_time';
  products?: StripeProductLite | null;
};

export type StripeSubscriptionLite = {
  id: string;
  status: string;
  prices?: StripePriceLite | null;
};
