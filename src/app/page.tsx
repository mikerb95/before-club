import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function Home() {
  const events = await prisma.event.findMany({ orderBy: { date: 'asc' }, where: { date: { gte: new Date(Date.now() - 24*60*60*1000) } } });
  return (
    <div className="grid" style={{ gap:'2rem' }}>
      <section>
        <h1 style={{ fontSize:'2.5rem', margin:'0 0 .5rem' }}>Before Club</h1>
        <p>Escena underground techno en Bogotá. Regístrate en la lista free y asegura tu entrada anticipada.</p>
      </section>
      <section>
        <h2>Próximos eventos</h2>
        {events.length === 0 && <p>No hay eventos publicados todavía.</p>}
        <div className="grid events-grid">
          {events.map(ev => (
            <div key={ev.id} className="card">
              <h3 style={{ marginTop:0 }}>{ev.title}</h3>
              <p style={{ fontSize:'.85rem', opacity:.8 }}>{format(ev.date, "EEEE d 'de' MMMM yyyy HH:mm", { locale: es })}</p>
              {ev.description && <p style={{ fontSize:'.85rem' }}>{ev.description.slice(0,120)}{ev.description.length>120?'…':''}</p>}
              <Link href={`/events/${ev.slug}`}>Ver & Registrarme →</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
