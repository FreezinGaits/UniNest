import { SignJWT, jwtVerify } from 'jose';
import { UserRole } from '@prisma/client';

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'uninest-dev-secret-change-in-production'
);

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  expires: string;
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as SessionPayload;
}
