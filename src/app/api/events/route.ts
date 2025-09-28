import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const events = await prisma.event.findMany({ orderBy:{ date:'asc' } });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const json = await req.json();
  const { title, date, description, capacity } = json;
  if (!title || !date) return NextResponse.json({ error:'Missing fields' }, { status:400 });
  const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  let slug = slugBase; let i=1;
  while (await prisma.event.findUnique({ where:{ slug } })) slug = `${slugBase}-${i++}`;
  const event = await prisma.event.create({ data:{ title, date:new Date(date), description, capacity } });
  return NextResponse.json(event, { status:201 });
}
