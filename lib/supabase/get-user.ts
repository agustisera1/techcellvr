import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Returns the authenticated Supabase user for the current request.
 *
 * Wrapped in React.cache() so multiple Server Components on the same
 * page share a single Supabase call (see CLAUDE.md → Estrategia de caché).
 *
 * Redirects to /auth/login if there is no active session.
 * Only use in Server Components and Server Actions under /admin/*.
 */
export const getAuthenticatedUser = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    redirect('/auth/login')
  }

  return data.user
})
