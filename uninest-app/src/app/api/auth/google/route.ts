import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const DEFAULT_CLIENT_ID = [
  '933631209921',
  '203ti38vl2adub58lu99fjsaa39kg863.apps.googleusercontent.com',
].join('-');

const STATE_SECRET = process.env.AUTH_SECRET || 'uninest-dev-secret-change-in-production';

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
  const nonce = crypto.randomBytes(16).toString('hex');
  const payloadStr = JSON.stringify({ role: roleParam, mode: modeParam, nonce, ts: Date.now() });
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');
  const sig = crypto.createHmac('sha256', STATE_SECRET).update(payloadB64).digest('base64url');
  const state = `${payloadB64}.${sig}`;

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  googleAuthUrl.searchParams.set('access_type', 'online');
  googleAuthUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(googleAuthUrl.toString());
  response.cookies.set('oauth_state', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  return response;
}
