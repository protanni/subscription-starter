// lib/supabase/server.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { getSupabaseEnv } from './env';

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Next.js App Router: cookies() é mutável em Server Actions / Route Handlers,
        // e geralmente também funciona em RSC durante a renderização quando necessário.
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Se cair aqui, normalmente é porque você chamou em um contexto onde cookies são read-only.
          // Não explode o app — auth ainda costuma funcionar para reads.
        }
      },
    },
  });
}
