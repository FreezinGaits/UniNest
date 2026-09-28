import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const roleParam = searchParams.get('role') === 'LANDLORD' ? 'LANDLORD' : 'STUDENT';
  const modeParam = searchParams.get('mode') || 'SIGN_IN';

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Check endpoint used by the client UI to know whether live OAuth credentials are set
  if (searchParams.get('check') === '1') {
    return NextResponse.json({
      oauthConfigured: Boolean(clientId && process.env.GOOGLE_CLIENT_SECRET),
    });
  }

  // If GOOGLE_CLIENT_ID is configured in .env / Vercel, redirect to official Google OAuth 2.0 screen
  if (clientId && process.env.GOOGLE_CLIENT_SECRET) {
    const redirectUri = `${origin}/api/auth/google/callback`;
    const state = Buffer.from(
      JSON.stringify({ role: roleParam, mode: modeParam })
    ).toString('base64url');

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('prompt', 'select_account');
    googleAuthUrl.searchParams.set('access_type', 'online');
    googleAuthUrl.searchParams.set('state', state);

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // Fallback when GOOGLE_CLIENT_ID is not yet pasted into .env: open interactive Google Account Chooser
  const fallbackUrl = new URL('/login', origin);
  fallbackUrl.searchParams.set('google_chooser', '1');
  fallbackUrl.searchParams.set('role', roleParam);
  fallbackUrl.searchParams.set('mode', modeParam);
  return NextResponse.redirect(fallbackUrl.toString());
}
