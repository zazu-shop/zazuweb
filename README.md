# Zazu — Taller de Objetos Arcanos

Sitio web de marca para Zazu: fantasía, esoterismo y oficio medieval.
Frontend en React (Vite), backend en Node/Express, base de datos en
Supabase Postgres.

## Estructura del proyecto

```
zazuweb/
├── frontend/          React + Vite (SPA)
│   ├── src/
│   │   ├── components/   Navbar, Footer, Sigil, RoughDivider, SvgDefs
│   │   ├── pages/         Home, Grimorio (about), Bazar (tienda), Contacto
│   │   ├── styles/        variables.css (paleta y tipografía)
│   │   └── lib/           cliente de Supabase (uso opcional en el navegador)
│   └── .env.example
├── backend/           Node + Express (API)
│   ├── routes/         products.js, contact.js
│   ├── lib/             cliente de Supabase (service_role key)
│   └── .env.example
├── supabase/
│   └── schema.sql      Tablas + datos de ejemplo para pegar en Supabase
└── .gitignore
```

## Identidad visual

- **Colores:** negro/vacío (`#0B0710`), pergamino (`#ECE3CE`), dorado
  (`#C9A227` / `#E8C468`), púrpura (`#4B2170` / `#7C4DBE`).
- **Tipografía:** Cinzel (títulos), Cormorant Garamond (subtítulos/citas),
  EB Garamond (cuerpo), JetBrains Mono (etiquetas).
- **Firma:** un sigilo circular (`Sigil.jsx`) dibujado con un filtro SVG de
  "temblor de tinta" (`SvgDefs.jsx`) que le da el acabado de boceto brusco
  a bordes, tarjetas y divisores, manteniendo el layout limpio y profesional.

---

## 1. Instalación local (VS Code)

Abre la carpeta `zazuweb` en VS Code y en la terminal integrada:

```bash
# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev        # http://localhost:5173

# Backend (en otra terminal)
cd backend
npm install
cp .env.example .env
npm run dev         # http://localhost:4000
```

Extensiones útiles en VS Code: **ES7+ React/Redux snippets**, **ESLint**,
**Prettier**.

---

## 2. Supabase (base de datos)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** y pega el contenido de `supabase/schema.sql`. Esto
   crea las tablas `products` y `contact_messages`, más 3 piezas de
   ejemplo.
3. Ve a **Project Settings > API** y copia:
   - `Project URL` → `SUPABASE_URL` (backend) y `VITE_SUPABASE_URL`
     (frontend, opcional)
   - `anon public key` → `VITE_SUPABASE_ANON_KEY` (frontend, opcional)
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (backend, **nunca
     la subas al repo ni la uses en el frontend**)
4. Pega esos valores en `backend/.env`.

---

## 3. GitHub

Desde la raíz `zazuweb`:

```bash
git init
git add .
git commit -m "Zazu: estructura inicial del sitio"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/zazuweb.git
git push -u origin main
```

> El `.gitignore` ya excluye `node_modules` y los archivos `.env`
> con tus claves reales.

---

## 4. Vercel (frontend)

1. En [vercel.com](https://vercel.com), **New Project** → importa el repo
   `zazuweb` de GitHub.
2. **Root Directory:** `frontend`
3. Framework preset: **Vite** (Vercel lo detecta solo).
4. En **Environment Variables** agrega:
   - `VITE_API_URL` → la URL pública de tu backend (paso 5)
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (si usarás Supabase
     también desde el navegador)
5. Deploy. Cada `git push` a `main` vuelve a desplegar automáticamente.

---

## 5. Backend (Node/Express)

Express con servidor persistente **no corre igual que el frontend** en el
plan gratuito estándar de Vercel (que es serverless). Dos rutas simples:

**Opción A — recomendada: Render o Railway**
1. Crea un servicio nuevo apuntando al repo, con **Root Directory:
   `backend`**, build command `npm install`, start command `npm start`.
2. Agrega las variables de `backend/.env.example` en el panel del
   servicio (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`
   con tu dominio de Vercel).
3. Copia la URL pública que te da el servicio y úsala como `VITE_API_URL`
   en Vercel.

**Opción B — todo en Vercel:** convertir `backend/routes/*.js` en
funciones serverless dentro de `frontend/api/` (Vercel Functions). Es más
trabajo de adaptación; si quieres, te ayudo a migrarlo cuando el sitio
base esté validado.

---

## 6. Flujo de trabajo

```
GitHub (main) ──push──▶ Vercel (frontend, auto-deploy)
                    └──▶ Render/Railway (backend, auto-deploy)
                              │
                              ▼
                     Supabase Postgres
```

## Próximos pasos sugeridos

- Reemplazar el copy de ejemplo (piezas, historia) por contenido real.
- Añadir imágenes de producto reales en `frontend/src/assets/`.
- Panel de administración simple para gestionar `products` sin entrar a
  Supabase directamente.
- Autenticación de usuarios con Supabase Auth si planeas cuentas/clientes.
