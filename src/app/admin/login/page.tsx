import { redirect } from 'next/navigation';
import { setAdminCookie, requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function loginAction(formData: FormData) {
  'use server';
  const pass = formData.get('password');
  if (typeof pass !== 'string') return;
  if (pass === process.env.ADMIN_PASSWORD) {
    setAdminCookie();
    revalidatePath('/admin/events');
    redirect('/admin/events');
  }
}

export default function AdminLoginPage() {
  if (requireAdmin()) redirect('/admin/events');
  return (
    <div style={{ maxWidth:400, margin:'2rem auto' }}>
      <h1>Login Admin</h1>
      <form action={loginAction} className="card">
        <label style={{ display:'grid', gap:4 }}>
          <span>Password</span>
          <input name="password" type="password" required />
        </label>
        <button className="btn" type="submit">Entrar</button>
      </form>
      <p style={{ fontSize:'.75rem', opacity:.6, marginTop:'1rem' }}>Protege bien el password en variables de entorno.</p>
    </div>
  );
}
