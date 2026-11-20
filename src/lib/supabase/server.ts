import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requireSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

/**
 * Server Supabase client for Server Components, Route Handlers, and Server Actions.
 * Creates a fresh client per request — do not cache across requests.
 */
export async function createClient() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

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
          // Ignored in Server Components; proxy refreshes the session.
        }
      },
    },
  });
}
