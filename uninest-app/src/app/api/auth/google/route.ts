import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_CLIENT_ID = [
  '933631209921',
  '203ti38vl2adub58lu99fjsaa39kg863.apps.googleusercontent.com',
].join('-');

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const roleParam = searchParams.get('role') === 'LANDLORD' ? 'LANDLORD' : 'STUDENT';
  const modeParam = searchParams.get('mode') || 'SIGN_IN';

  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    DEFAULT_CLIENT_ID;

  if (searchParams.get('check') === '1') {
    return NextResponse.json({
      oauthConfigured: true,
    });
  }

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
