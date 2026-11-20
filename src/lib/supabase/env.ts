export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Prefer the new publishable key; fall back to legacy anon key.
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    url: url?.trim() || null,
    anonKey: anonKey?.trim() || null,
  };
}

export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) return false;
  if (url.includes("your-project-ref")) return false;
  if (
    anonKey.includes("your-anon-key") ||
    anonKey.includes("your-publishable-key")
  ) {
    return false;
  }
  return true;
}

export function requireSupabaseEnv() {
  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or ANON_KEY). Copy .env.example to .env.local and add your Supabase credentials.",
    );
  }

  return { url, anonKey };
}
