import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
        console.error('Supabase credentials missing in browser. Ensure NEXT_PUBLIC_ variables are set.');
    } else {
        console.warn('Supabase credentials missing on server. Check your .env.local file.');
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
