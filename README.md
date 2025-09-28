# Before Club

- Next.js 14 (App Router, Server Actions)
- Registro a lista free por evento
- Generación de QR único por registro
- Validación de entradas (marcar como "validado")
- Panel admin sencillo (una sola cuenta con password en variable de entorno)
- Prisma ORM (SQLite local / Postgres en producción)

## Requisitos iniciales

1. Node.js 18+ (Vercel usa >=18)
2. Copiar `.env.example` a `.env` y ajustar variables
3. Instalar dependencias:

```bash
npm install
```

4. Generar cliente Prisma y crear/migrar db (modo desarrollo SQLite):

```bash
npx prisma migrate dev --name init
```

5. Ejecutar en local:

```bash
npm run dev
```

Visita `http://localhost:3000`.

## Variables de entorno

| Variable        | Descripción                                              |
| --------------- | -------------------------------------------------------- |
| DATABASE_URL    | SQLite local (file:./dev.db) o URL de Vercel Postgres    |
| ADMIN_PASSWORD  | Password del panel admin                                 |
| AUTH_SECRET     | Secreto HMAC para la cookie de sesión admin              |
| PUBLIC_BASE_URL | URL absoluta pública (ej: https://beforeclub.vercel.app) |

## Flujo de uso

1. Admin entra a `/admin/login` y se autentica.
2. Crea eventos en `/admin/events` con título, fecha/hora y capacidad opcional.
3. Usuarios visitan la home y abren el evento para registrarse en la lista free.
4. Al registrarse se genera (o reutiliza) un token y redirige a `/r/[token]` donde está su QR.
5. En la puerta el staff (logueado como admin) escanea el QR que apunta a `/api/registrations/[token]/validate` y puede lanzar un POST (por ejemplo con un lector que haga fetch) para validar. También se podría crear una UI dedicada de validación si se requiere.

## Validación de QR

El QR codifica la URL de validación. Se hace un POST autenticado (cookie admin) para marcar `validated=true`.

## Despliegue en Vercel

1. Crear proyecto nuevo apuntando a este repositorio.
2. Configurar variables de entorno en Vercel (`DATABASE_URL` de Vercel Postgres, `ADMIN_PASSWORD`, `AUTH_SECRET`, `PUBLIC_BASE_URL`).
3. Si cambias a Postgres, edita `schema.prisma` provider a `postgresql`, ajusta `DATABASE_URL` y corre migraciones (puedes usar `npx prisma migrate deploy` en build command o script postinstall).

Ejemplo provider Postgres:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Próximas mejoras sugeridas

- UI dedicada de escaneo y validación (página protegida que use cámara + librería de lectura QR).
- Exportar lista de registros (CSV).
- Envío de email de confirmación con link al QR.
- ReCaptcha / rate limiting para evitar spam.
- Multi-admin / roles.
- Dark visual design más elaborado (Tailwind + tipografía específica).

## Seguridad básica

Este setup es intencionalmente minimalista. Siguientes pasos en consrtuccion:

- Mover a NextAuth / auth robusta si se añaden más roles.
- Registrar logs de validaciones.
- Firmar tokens con datos adicionales (eventId) y quizá expirar tokens tras evento.

---

Hecho con ❤️ para la escena techno de Bogotá.
