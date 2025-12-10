
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// VALIDATION: Check if specific placeholders are still present
const isConfigured = supabaseUrl && supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' &&
    supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_KEY_HERE';

if (!isConfigured) {
    console.error('🛑 CRITICAL: Supabase credentials are not configured in .env');
}

// SAFE INITIALIZATION: Use a fallback if config is missing to prevent crash
const validUrl = isConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const validKey = isConfigured ? supabaseAnonKey : 'placeholder';

export const supabase = createClient(validUrl, validKey);
