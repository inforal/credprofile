# CredProfile

Fichas públicas de certificaciones. Next.js (App Router), TypeScript y Supabase.

## Rutas

- `/` presentación
- `/entrar` acceso con correo o usuario
- `/registro` alta de cuenta
- `/panel` perfil y credenciales
- `/{username}` perfil público
- `/{username}/{slug}` ficha pública

## Entorno local

Copia `.env.example` a `.env.local` y rellena:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (por defecto en el código, `https://credprofile.com`)

El alta envía el enlace de confirmación a `/auth/confirm`.

`.env.local` no se sube al repositorio.

```bash
npm install
npm run dev
npm run build
```
