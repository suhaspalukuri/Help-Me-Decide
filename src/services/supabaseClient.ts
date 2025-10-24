// Fix: Augment Vite's ImportMetaEnv interface to include custom environment variables.
// This avoids conflicts with the default `ImportMetaEnv` provided by Vite.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

import { createClient } from '@supabase/supabase-js';

// These variables will be provided by Vercel during the build process.
// VITE_ is a special prefix that Vite uses to expose variables to the frontend.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Throw an error if the variables are not set, making it clear configuration is needed.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase URL or Anon Key is missing. Make sure you have set them in your Vercel project's environment variables.");
}

// Create and export the Supabase client.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);