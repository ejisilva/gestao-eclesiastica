import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jbtnnqqicgkjoqhtezul.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidG5ucXFpY2dram9xaHRlenVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTMyODAsImV4cCI6MjA4MDE2OTI4MH0.isCF2k65kRmx80nvhz_PbV2-1OEqcNUk6Ki3kvtjX4g';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});