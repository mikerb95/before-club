import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  if (!requireAdmin(req)) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  const reg = await prisma.registration.findUnique({ where:{ token: params.token } });
  if (!reg) return NextResponse.json({ error:'Not found' }, { status:404 });
  if (reg.validated) return NextResponse.json({ status:'already_validated', validatedAt: reg.validatedAt });
  const updated = await prisma.registration.update({ where:{ id: reg.id }, data:{ validated:true, validatedAt: new Date() } });
  return NextResponse.json({ status:'validated', validatedAt: updated.validatedAt });
}

export async function GET(req: NextRequest, ctx: { params: { token: string } }) {
  // Permite consultar estado (sin validar) - no requiere admin
  const reg = await prisma.registration.findUnique({ where:{ token: ctx.params.token } });
  if (!reg) return NextResponse.json({ error:'Not found' }, { status:404 });
  return NextResponse.json({ validated: reg.validated, validatedAt: reg.validatedAt });
}
