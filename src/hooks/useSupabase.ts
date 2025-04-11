
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

// Create a singleton instance of the Supabase client
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase URL or anonymous key. Make sure to set VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  );
}

export const supabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export function useSupabase() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (supabaseUrl && supabaseAnonKey) {
      setIsReady(true);
    }
  }, []);

  return { supabase: supabaseClient, isReady };
}
