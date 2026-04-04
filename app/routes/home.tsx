import { Navigate } from "react-router"
import { configureSyncedSupabase } from "@legendapp/state/sync-plugins/supabase"
import { generateId } from "~/lib/utils"

configureSyncedSupabase({ generateId })

export default function Home() {
  return <Navigate to="/transactions" replace />
}
