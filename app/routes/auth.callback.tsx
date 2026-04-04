import { useEffect } from "react"
import { useNavigate } from "react-router"
import { supabaseClient } from "~/database/supabase-client"

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/transactions", { replace: true })
      }
    })

    // Fallback: if session already exists by the time we mount
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/transactions", { replace: true })
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  )
}
