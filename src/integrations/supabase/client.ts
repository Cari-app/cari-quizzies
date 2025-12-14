import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dotizgqcmfcfuavqqmhu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGl6Z3FjbWZjZnVhdnFxbWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODc2MzQsImV4cCI6MjA4MTA2MzYzNH0.mO9AnhSvyeydM2GPU4nJxSLbUSc8o1H9NS9aTF4wDqQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
