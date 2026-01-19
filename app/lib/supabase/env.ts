// lib/supabase/env.ts
export function getSupabaseEnv() {
  // Padrão Supabase
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    // fallback caso seu template tenha nomes diferentes
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  if (!url || !anonKey) {
    throw new Error(
      'Supabase env vars missing. Expected NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (or fallbacks).'
    );
  }

  return { url, anonKey };
}
