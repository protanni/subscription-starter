import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types_db';

export type UserTimezone = string; // IANA timezone id

const FALLBACK_TZ: UserTimezone = 'UTC';

export async function getUserTimezone(
  supabase: SupabaseClient<Database>
): Promise<UserTimezone> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.id) return FALLBACK_TZ;

  const { data, error } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', user.id)
    .single();

  if (error) return FALLBACK_TZ;

  const tz = (data?.timezone ?? '').trim();
  return tz.length > 0 ? tz : FALLBACK_TZ;
}
