import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_PUBLICSUPABASE_URL,
  import.meta.env.VITE_PUBLICSUPABASE_ANON_KEY
)
