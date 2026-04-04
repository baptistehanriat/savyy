import { createClient } from "@supabase/supabase-js"
import type { Database } from "~/database/database.types"

export const supabaseClient = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)
