import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

interface Props { params: { slug: string } }

async function registerAction(eventId: string, formData: FormData) {
  'use server';
  const name = String(formData.get('name')||'').trim();
  const email = String(formData.get('email')||'').trim().toLowerCase();
  if (!name || !email) return;
  const event = await prisma.event.findUnique({ where:{ id: eventId }, include:{ _count:{ select:{ registrations:true } } } });
  if (!event) return;
  if (event.capacity && event._count.registrations >= event.capacity) {
    // capacidad completa
    return;
  }
  // Reutilizar si ya existe registro
  let reg = await prisma.registration.findFirst({ where:{ eventId, email } });
  if (!reg) {
    const token = crypto.randomBytes(16).toString('hex');
    reg = await prisma.registration.create({ data:{ eventId, name, email, token } });
  }
  revalidatePath(`/events/${event.slug}`);
  redirect(`/r/${reg.token}`);
}

export default async function EventPage({ params }: Props) {
  const ev = await prisma.event.findUnique({ where:{ slug: params.slug }, include:{ _count:{ select:{ registrations:true } } } });
  if (!ev) notFound();
  const full = !!(ev.capacity && ev._count.registrations >= ev.capacity);
  return (
    <div className="grid" style={{ gap:'1.5rem' }}>
      <div className="card">
        <h1 style={{ marginTop:0 }}>{ev.title}</h1>
        <p style={{ fontSize:'.85rem', opacity:.8 }}>{format(ev.date, "EEEE d 'de' MMMM yyyy HH:mm", { locale: es })}</p>
        {ev.description && <p>{ev.description}</p>}
        {ev.capacity && <p style={{ fontSize:'.75rem', opacity:.7 }}>Capacidad: {ev._count.registrations} / {ev.capacity}</p>}
      </div>
      <div className="card" style={{ maxWidth:480 }}>
        <h2 style={{ marginTop:0 }}>Lista Free</h2>
        {full && <p style={{ color:'#ff4d4d' }}>Lista completa.</p>}
        {!full && (
          <form action={registerAction.bind(null, ev.id)} className="grid" style={{ gap:'.75rem' }}>
            <label style={{ display:'grid', gap:4 }}>
              <span>Nombre</span>
              <input name="name" required />
            </label>
            <label style={{ display:'grid', gap:4 }}>
              <span>Email</span>
              <input name="email" type="email" required />
            </label>
            <button className="btn" type="submit">Registrarme</button>
          </form>
        )}
        <p style={{ fontSize:'.65rem', opacity:.6 }}>Recibirás un QR de acceso. Presenta el QR en la entrada para validar tu inscripción.</p>
      </div>
    </div>
  );
}
