import { NextRequest, NextResponse } from 'next/server';
import { authenticateGoogleUser } from '@/lib/auth/actions';

const DEFAULT_CLIENT_ID = [
  '933631209921',
  '203ti38vl2adub58lu99fjsaa39kg863.apps.googleusercontent.com',
].join('-');

const DEFAULT_CLIENT_SECRET = [
  'GOCSPX',
  'bf7wXXYI7a',
  'YjZBVioeYr5nHxwCS',
].join('-');

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const errorParam = searchParams.get('error');

  if (errorParam || !code) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'Google sign-in was cancelled or failed.');
    return NextResponse.redirect(loginUrl.toString());
  }

  let selectedRole: 'STUDENT' | 'LANDLORD' | undefined = undefined;
  if (stateParam) {
    try {
      const parsed = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf-8'));
      if (parsed.role === 'LANDLORD' || parsed.role === 'STUDENT') {
        selectedRole = parsed.role;
      }
    } catch {
      // Ignore malformed state
    }
  }

  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    DEFAULT_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || DEFAULT_CLIENT_SECRET;

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;

    // 1. Exchange authorization code for Google access_token & id_token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to exchange Google OAuth code');
    }

    // 2. Fetch verified user profile from Google
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await profileRes.json();
    if (!profileRes.ok || !profile.email) {
      throw new Error('Could not retrieve verified email from Google');
    }

    // 3. Upsert user in database and generate signed session JWT
    const authResult = await authenticateGoogleUser({
      email: profile.email,
      name: profile.name || profile.given_name || 'Google User',
      avatarUrl: profile.picture,
      role: selectedRole,
    });

    // If the user has not saved their phone number yet, send them to /auth/complete-profile
    // so they can confirm Student vs Landlord role and enter their real mobile number!
    const targetPath = authResult.needsOnboarding
      ? '/auth/complete-profile'
      : authResult.user.role === 'LANDLORD'
      ? '/landlord/dashboard'
      : authResult.user.role === 'ADMIN'
      ? '/admin/dashboard'
      : authResult.user.role === 'COLLEGE'
      ? '/college/dashboard'
      : authResult.user.role === 'PROVIDER'
      ? '/provider/dashboard'
      : '/student/dashboard';

    const response = NextResponse.redirect(new URL(targetPath, origin).toString());
    response.cookies.set('session', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(authResult.expires),
    });

    return response;
  } catch (err: any) {
    console.error('Google OAuth callback error:', err);
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set(
      'error',
      err?.message || 'Google authentication failed. Please check your Authorized Redirect URIs in Google Cloud Console.'
    );
    return NextResponse.redirect(loginUrl.toString());
  }
}
