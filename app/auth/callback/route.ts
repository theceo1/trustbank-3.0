// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ProfileService } from '@/lib/services/profile'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && session?.user) {
      // Create/update profile for OAuth users
      try {
        await ProfileService.createProfile(session.user.id, session.user.email!)
      } catch (error) {
        console.error('Error creating profile:', error)
      }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(requestUrl.origin + '/dashboard')
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(requestUrl.origin + '/auth/auth-error')
}
