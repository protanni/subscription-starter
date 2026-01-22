import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

type AnySupabaseClient = SupabaseClient<any, any, any, any, any>;

export const getUser = cache(async (supabase: AnySupabaseClient) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export async function getProfile(supabase: any) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, is_paid, onboarding_completed, locale, full_name, avatar_url')
    .single();

  if (error) return null;
  return data;
}

export const getSubscription = cache(async (supabase: AnySupabaseClient) => {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  return subscription;
});

export const getProducts = cache(async (supabase: AnySupabaseClient) => {
  const { data: products } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  return products;
});

export const getUserDetails = cache(async (supabase: AnySupabaseClient) => {
  const { data: userDetails } = await supabase.from('users').select('*').single();
  return userDetails;
});
