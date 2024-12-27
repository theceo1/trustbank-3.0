// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { authRateLimiter } from '@/app/lib/middleware/authRateLimiter'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const rateLimitPass = await authRateLimiter(request)
  if (!rateLimitPass) {
    return NextResponse.json(
      { error: "Too many auth attempts. Please try again later." },
      { status: 429 }
    )
  }

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const { data: { session }, error: exchangeError } = 
      await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError || !session) {
      throw exchangeError || new Error('No session')
    }

    const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))

    // Set both tokens with secure settings
    response.cookies.set({
      name: 'sb-access-token',
      value: session.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    })

    response.cookies.set({
      name: 'sb-refresh-token',
      value: session.refresh_token!,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
  }
}
