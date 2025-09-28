import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const reg = await prisma.registration.findUnique({ where:{ token: params.token }, include:{ event:true } });
  if (!reg) return new NextResponse('Not found', { status:404 });
  const base = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
  const validateUrl = `${base}/api/registrations/${reg.token}/validate`;
  const png = await QRCode.toBuffer(validateUrl, { margin:1, width:400, color:{ dark:'#000000', light:'#ffffffff' } });
  return new NextResponse(png, { headers:{ 'Content-Type':'image/png', 'Cache-Control':'no-store' } });
}
