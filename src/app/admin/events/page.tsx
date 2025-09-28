import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import slugify from 'slugify';

async function createEventAction(formData: FormData) {
  'use server';
  if (!requireAdmin()) redirect('/admin/login');
  const title = String(formData.get('title')||'').trim();
  const date = String(formData.get('date')||'').trim();
  const time = String(formData.get('time')||'').trim();
  const description = String(formData.get('description')||'').trim() || null;
  const capacityRaw = formData.get('capacity');
  const capacity = capacityRaw ? Number(capacityRaw) : null;
  if (!title || !date) return;
  const dt = new Date(`${date}T${time||'21:00'}:00`);
  const baseSlug = slugify(title, { lower:true, strict:true });
  let slug = baseSlug;
  let i = 1;
  while (await prisma.event.findUnique({ where:{ slug } })) {
    slug = `${baseSlug}-${i++}`;
  }
  await prisma.event.create({ data:{ title, date: dt, description, capacity: capacity||undefined, slug } });
  revalidatePath('/');
  revalidatePath('/admin/events');
}

export default async function AdminEventsPage() {
  if (!requireAdmin()) redirect('/admin/login');
  const events = await prisma.event.findMany({ orderBy:{ date:'desc' }, include:{ _count: { select: { registrations: true } } } });
  return (
    <div className="grid" style={{ gap:'2rem' }}>
      <section>
        <h1>Eventos</h1>
        <form action={createEventAction} className="card" style={{ maxWidth:640 }}>
          <h2 style={{ marginTop:0 }}>Crear nuevo evento</h2>
          <div className="grid" style={{ gridTemplateColumns:'1fr 140px 100px', gap:'1rem' }}>
            <label style={{ display:'grid', gap:4 }}>
              <span>Título</span>
              <input name="title" required />
            </label>
            <label style={{ display:'grid', gap:4 }}>
              <span>Fecha</span>
              <input name="date" type="date" required />
            </label>
            <label style={{ display:'grid', gap:4 }}>
              <span>Hora</span>
              <input name="time" type="time" defaultValue="21:00" />
            </label>
          </div>
          <label style={{ display:'grid', gap:4 }}>
            <span>Capacidad (opcional)</span>
            <input name="capacity" type="number" min={1} />
          </label>
          <label style={{ display:'grid', gap:4 }}>
            <span>Descripción</span>
            <textarea name="description" rows={4} />
          </label>
          <button className="btn" type="submit">Publicar</button>
        </form>
      </section>
      <section>
        <h2>Listado</h2>
        <div className="grid events-grid">
          {events.map(ev => (
            <div key={ev.id} className="card">
              <h3 style={{ marginTop:0 }}>{ev.title}</h3>
              <p style={{ fontSize:'.75rem', opacity:.7 }}>{format(ev.date, "d MMM yyyy HH:mm", { locale: es })}</p>
              <p style={{ fontSize:'.75rem', opacity:.8 }}>Registros: {ev._count.registrations}{ev.capacity?` / ${ev.capacity}`:''}</p>
              <a href={`/events/${ev.slug}`}>Ver página pública →</a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
