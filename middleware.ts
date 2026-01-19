import { NextResponse, type NextRequest } from 'next/server';
import { createClient, updateSession } from '@/utils/supabase/middleware';

const PUBLIC_PATHS = new Set<string>([
  '/',
  '/pricing',
  '/signin',
  '/signup'
]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/signin')) return true;
  if (pathname.startsWith('/auth')) return true; // if your template uses /auth routes
  return false;
}

function isAllowedApiPath(pathname: string) {
  // Stripe must be able to hit this without any auth/paywall.
  if (pathname === '/api/webhooks') return true;

  // Optional: allow other API routes through middleware checks,
  // because most templates rely on server-side auth inside the handler anyway.
  if (pathname.startsWith('/api/')) return true;

  return false;
}

function isProtectedDashboardPath(pathname: string) {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}

function isActiveSubscriptionStatus(status: string | null | undefined) {
  // Keep it strict for “paid access”.
  // You can add 'past_due' if you want a grace period.
  return status === 'active' || status === 'trialing';
}

export async function middleware(request: NextRequest) {
  // 1) Always refresh session cookies (important for server components)
  const sessionResponse = await updateSession(request);

  const { supabase } = createClient(request);

  const { pathname } = request.nextUrl;

  // Always allow Next internals/static
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts')
  ) {
    return sessionResponse;
  }

  // Allow webhook + api to run freely (or handle their own auth)
  if (isAllowedApiPath(pathname)) {
    return sessionResponse;
  }

  // If it's not a protected dashboard route, do nothing special
  if (!isProtectedDashboardPath(pathname)) {
    return sessionResponse;
  }

  // 2) Must be signed in to access dashboard
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // 3) Must have an active/trialing subscription to access dashboard
  // This assumes your template has a `subscriptions` table synced via webhooks.
  // Common shape: subscriptions.status, subscriptions.user_id
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .maybeSingle();

  // If subscription row doesn't exist or isn't active/trialing -> redirect to pricing
  if (subError || !subscription || !isActiveSubscriptionStatus(subscription.status)) {
    const url = request.nextUrl.clone();
    url.pathname = '/pricing';
    url.searchParams.set('paywall', '1');
    return NextResponse.redirect(url);
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    /*
      Run middleware on all routes except:
      - static files
      - _next
      - favicon
    */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
