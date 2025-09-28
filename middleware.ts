import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidAdminToken } from '@/lib/auth';

const ADMIN_PATHS = ['/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get('before_admin')?.value;
    if (!token || !isValidAdminToken(token)) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
