import { createClient } from '@supabase/supabase-js';

// Determine if this code is running in the Node/Bun server or the browser
const isServer = typeof window === 'undefined';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Only enforce environment variables on the server side
if (isServer && (!supabaseUrl || !supabaseServiceKey)) {
  throw new Error('Missing Supabase environment variables on the server.');
}

// Export the real admin client on the server, and a safe dummy object on the client.
// TanStack Start's createServerFn ensures the client never actually calls this object directly.
export const supabaseAdmin = isServer
  ? createClient(supabaseUrl, supabaseServiceKey)
  : ({} as any);