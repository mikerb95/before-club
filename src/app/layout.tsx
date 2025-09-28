import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Before Club | Techno Bogotá',
  description: 'Eventos techno en Bogotá - Before Club'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header>
          <div style={{ fontWeight: 700 }}>BEFORE CLUB</div>
          <nav style={{ display:'flex', gap:'1rem' }}>
            <a href="/">Inicio</a>
            <a href="/admin/events">Admin</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
