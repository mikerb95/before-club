import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props { params: { token: string } }

export const dynamic = 'force-dynamic';

export default async function RegistrationPage({ params }: Props) {
  const reg = await prisma.registration.findUnique({ where:{ token: params.token }, include:{ event:true } });
  if (!reg) notFound();
  const base = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
  const validateUrl = `${base}/api/registrations/${reg.token}/validate`;
  return (
    <div className="grid" style={{ gap:'1.5rem', maxWidth:520, margin:'0 auto' }}>
      <div className="card">
        <h1 style={{ marginTop:0 }}>Acceso Evento</h1>
        <p style={{ fontSize:'.85rem', opacity:.8 }}>Evento: <strong>{reg.event.title}</strong></p>
        <p style={{ fontSize:'.75rem', opacity:.7 }}>{format(reg.event.date, "d MMM yyyy HH:mm", { locale: es })}</p>
        <p>Nombre: <strong>{reg.name}</strong></p>
        <p>Email: {reg.email}</p>
        <p>Estado: {reg.validated ? <span style={{ color:'#36d36d' }}>VALIDADO</span> : <span style={{ color:'#ffcf3a' }}>Pendiente</span>}</p>
        <p style={{ fontSize:'.65rem', opacity:.6 }}>El staff puede validar escaneando un lector QR apuntando a este código.</p>
        <div style={{ background:'#fff', padding:12, width:'fit-content', borderRadius:8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/registrations/${reg.token}/qr`} alt="QR" width={200} height={200} style={{ display:'block' }} />
        </div>
        <p style={{ fontSize:'.6rem', opacity:.5, marginTop:'1rem' }}>URL validación: {validateUrl}</p>
        <Link href={`/events/${reg.event.slug}`} style={{ fontSize:'.75rem' }}>Volver al evento</Link>
      </div>
    </div>
  );
}
