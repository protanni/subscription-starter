import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types_db';
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
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Next pode bloquear set durante render
        }
      },
    },
  });
}

// ✅ só UM alias (não crie outro createClient em nenhum lugar desse arquivo)
export const createClient = createSupabaseServerClient;
