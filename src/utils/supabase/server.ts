import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function sanitizeUrl(url: string | undefined): string {
  if (!url) return '';
  let cleaned = url.trim().replace(/^['"]|['"]$/g, '');
  
  // Fix cases where a colon is missing after http/https at the start
  cleaned = cleaned.replace(/^(https?)\/\/+/i, '$1://');
  cleaned = cleaned.replace(/^(https?):?\/\/+/i, '$1://');
  
  // If concatenated multiple times (e.g. https://...https://... or https://...https//...)
  if ((cleaned.match(/https?:\/\//gi) || []).length > 1 || cleaned.includes('https//') || cleaned.includes('http//')) {
    const parts = cleaned.split(/(?=https?:?\/\/)/i);
    for (const part of parts) {
      let trimmed = part.trim();
      trimmed = trimmed.replace(/^(https?):?\/\/+/i, '$1://');
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        cleaned = trimmed;
        break;
      }
    }
  }

  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

export async function createClient() {
  const cookieStore = await cookies()
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sanitizedUrl = sanitizeUrl(originalUrl);
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isValidUrl = sanitizedUrl.startsWith('http://') || sanitizedUrl.startsWith('https://');

  if (!sanitizedUrl || !anonKey || !isValidUrl) {
    console.warn('[Supabase Server] Missing or invalid URL or Anon Key. Returning dummy server client for build-time.');
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({ data: {}, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      }
    } as any;
  }

  return createServerClient(
    sanitizedUrl,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

