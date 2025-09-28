import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const COOKIE_NAME = 'before_admin';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('Falta AUTH_SECRET');
  return secret;
}

export function createAdminSessionCookie() {
  const secret = getSecret();
  const now = Date.now().toString();
  const signature = crypto.createHmac('sha256', secret).update(now).digest('hex');
  return `${now}.${signature}`;
}

export function isValidAdminToken(token: string): boolean {
  const [timestamp, signature] = token.split('.');
  if (!timestamp || !signature) return false;
  const secret = getSecret();
  const expected = crypto.createHmac('sha256', secret).update(timestamp).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  const age = Date.now() - Number(timestamp);
  return age >= 0 && age < MAX_AGE_MS;
}

export function requireAdmin(req?: NextRequest): boolean {
  // Preferimos usar cookies() en server components
  let token: string | undefined;
  try {
    token = cookies().get(COOKIE_NAME)?.value;
  } catch {
    token = req?.cookies.get(COOKIE_NAME)?.value;
  }
  return !!(token && isValidAdminToken(token));
}

export function setAdminCookie() {
  const value = createAdminSessionCookie();
  cookies().set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  });
}

export function clearAdminCookie() {
  cookies().delete(COOKIE_NAME);
}
