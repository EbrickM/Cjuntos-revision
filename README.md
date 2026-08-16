# B-Mori — Frontend

Portal web de B-Mori: plataforma de financiamiento para PYMEs, empresas contratantes ("anclas") y el panel de administración del banco. SPA construida con React 19 + Vite, sin backend propio — consume los servicios de autenticación (Bonafide), API e identidad expuestos por el backend.

## Stack técnico

- **React 19** + **Vite** (dev server con HMR, build a `dist/`)
- **Tailwind CSS v4** vía `@tailwindcss/vite` (sin `tailwind.config.js`; los tokens de diseño viven en `src/index.css`)
- **Zustand** para el estado de sesión/autenticación (`src/stores/authStore.js`), persistido en `sessionStorage`
- **ESLint** como gate de CI (no hay corredor de tests configurado en este repo)
- Navegación **sin react-router**: un único string `screen` en contexto (`src/state/AppContext.jsx`) decide qué pantalla se renderiza

## Requisitos

- Node.js 24+ (ver `Dockerfile`)
- npm

## Puesta en marcha local

```bash
npm install
cp .env.example .env   # completar VITE_AUTH_URL, VITE_API_URL, VITE_IDENTITY_API_URL
npm run dev             # http://localhost:5173 con HMR
```

## Scripts disponibles

| Comando          | Descripción                                                        |
|-------------------|---------------------------------------------------------------------|
| `npm run dev`     | Levanta el servidor de desarrollo de Vite con HMR                   |
| `npm run build`   | Compila la aplicación de producción en `dist/`                      |
| `npm run preview` | Sirve localmente el build de producción                             |
| `npm run lint`    | Corre ESLint sobre todo el proyecto — es el gate previo al build/deploy en CI |

No hay corredor de tests configurado (no existe script `test`, ni Vitest/Jest) — no asumir que existe uno.

## Configuración: variables de entorno en runtime, no en build

Este proyecto **no** hornea las URLs de backend en el bundle en tiempo de build. `src/config.ts` (`loadConfig()`) hace fetch a `/config.json` al arrancar la app (lanzado sin `await` desde `main.jsx`, en paralelo con la pantalla de splash) para obtener `AUTH_URL`, `API_URL` e `IDENTITY_API_URL`.

- **Desarrollo local**: si `/config.json` no está disponible, se usan las variables `VITE_*` de `.env` (ver `.env.example`).
- **Stage/producción (Docker)**: `docker-entrypoint.sh` genera `public/config.json` a partir de las variables de entorno del contenedor (`AUTH_URL`, `API_URL`, `IDENTITY_API_URL`) al iniciar `nginx`. Esto permite reutilizar **una misma imagen Docker** en distintos entornos sin reconstruirla.

Si se añade una nueva URL de backend, debe propagarse por los tres lugares: `config.json` / `docker-entrypoint.sh` / `.env.example` — no alcanza con `import.meta.env`.

## Arquitectura

### Navegación por `screen`, no por rutas

No hay librería de enrutamiento. `src/state/AppContext.jsx` mantiene un único estado `screen` (string, p. ej. `'epHome'`, `'empContratos'`, `'adminDash'`), junto con `role` y `opts` libres. La navegación se hace con `const { go } = useApp(); go('claveDePantalla', optsOpcionales)`.

`src/App.jsx` mapea cada clave de pantalla a un componente cargado de forma perezosa (`lazy`) dentro de un objeto `screens`, envuelto en un único `<Suspense>`. Al agregar una pantalla nueva: crear el archivo de página, agregar el `lazy(() => import(...))` en `App.jsx` y añadir la entrada `claveDePantalla: <Componente />` al mapa `screens` — no existe un archivo de rutas separado.

El prefijo de la clave indica el rol/sección:

- `splash`, `login`, `roleSelect`, `solicitarContrato`, `kyc*` — pre-autenticación / onboarding (`src/pages/auth/`)
- `admin*` — panel de administración del banco (`src/pages/admin/`)
- `ep*` — portal "Empresa Pequeña" / PYME (`src/pages/empresa-pequena/`)
- `emp*` — portal "Empresa Contratante" / ancla (`src/pages/contratante/`)

`AppShell` (`src/components/layout/AppShell.jsx`) es el chrome persistente (Topbar + Sidebar) sobre el que se renderiza cada pantalla autenticada.

### Un archivo por pantalla

Cada pantalla es un archivo independiente con **export default**, para que cada una genere su propio chunk lazy-loaded. Cuando varias pantallas de una misma carpeta necesitan compartir datos mock, constantes de marca o helpers de presentación, se agrupan en un archivo hermano `*Shared.jsx` (solo componentes) y, si hace falta compartir constantes/datos/funciones no-componente, en un archivo `*Data.js` separado — mezclar ambos en el mismo archivo `.jsx` rompe la regla de ESLint `react-refresh/only-export-components`.

### Autenticación: OTP real contra backend, sesión en Zustand

`src/stores/authStore.js` (zustand + `persist` en `sessionStorage`) guarda `authorized` / `isAdmin` / `session` / `adminSession`. Los flujos de autenticación de cliente (PYME/Contratante) y de administrador son **completamente independientes** (tokens, endpoints OTP y refresh/logout separados).

`src/lib/authApi.js` envuelve los endpoints `/auth/*` y `/auth/admin/*` del servicio de autenticación (Bonafide). `ensureValidAccessToken()` / `ensureValidAdminAccessToken()` refrescan proactivamente (deduplicando llamadas concurrentes) y deben esperarse (`await`) antes de cualquier request autenticado — no hay interceptor tipo axios que lo haga automáticamente.

### Estilos

Tailwind v4 vía `@tailwindcss/vite`. Los tokens de diseño se definen en `src/index.css` bajo `:root` (variables CSS usadas inline en JS, p. ej. colores de marca) y `@theme` (genera clases utilitarias como `text-orange`, `bg-page-bg`). Las fuentes (Poppins) están auto-hospedadas como woff2 en `src/assets/fonts/`.

### Imágenes

Todos los assets rasterizados en `src/assets/` están en formato **WebP** para reducir el peso del bundle. Única excepción: el favicon (`public/isotipo-color.png`), que se mantiene en PNG por compatibilidad con navegadores.

## Docker y despliegue

```bash
docker build -t bmori-frontend .
docker run -p 8080:80 \
  -e AUTH_URL=https://auth.example.com \
  -e API_URL=https://api.b-mori.example.com \
  -e IDENTITY_API_URL=https://identity.example.com \
  bmori-frontend
```

La imagen construye el bundle estático con Node y lo sirve con `nginx`. Al arrancar el contenedor, `docker-entrypoint.sh` regenera `config.json` a partir de las variables de entorno antes de levantar `nginx`. Incluye healthcheck en `/health`.

`docker-compose.yml` (imagen, `.env`, red `traefik-public`) es la base común; `docker-compose.dev.yml` y `docker-compose.prod.yml` la extienden con `container_name`, labels de Traefik (routing por host, TLS) y, en dev, el mapeo de puerto. Se combinan con `docker compose -f docker-compose.yml -f docker-compose.<env>.yml ...`.

### CI

- `.gitea/workflows/dev.yml` corre en cada push a `develop`:
  1. **lint** (`npm run lint`) — debe pasar antes de continuar
  2. **build** — construye y publica la imagen Docker en el registry
  3. **deploy** — `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d` en el runner de Gitea (mismo host)

- `.gitea/workflows/prod.yml` corre en cada push a `main`:
  1. **lint** / **build** — igual que dev, pero contra las vars/secrets de `PROD_*`
  2. **deploy** — sincroniza `docker-compose.yml` + `docker-compose.prod.yml` + `.env` por SSH/rsync a un host remoto (`PROD_DEPLOY_HOST`/`PROD_DEPLOY_DIR`/`PROD_DEPLOY_USER` + secret `PROD_DEPLOY_SSH_PRIVATE_KEY`) y ahí ejecuta `docker compose up -d`

## Estructura del proyecto

```
src/
├── assets/          # imágenes (WebP) y fuentes (woff2)
├── components/      # UI y layout compartidos (AppShell, Topbar, Sidebar, etc.)
├── lib/             # clientes de API (authApi, etc.)
├── pages/
│   ├── auth/                # splash, login, roleSelect, KYC, solicitarContrato
│   ├── admin/                # panel de administración del banco
│   ├── empresa-pequena/      # portal PYME (prefijo ep*)
│   └── contratante/          # portal empresa contratante / ancla (prefijo emp*)
├── state/           # AppContext (navegación por screen)
├── stores/          # authStore (zustand)
├── styles/          # fonts.css y otros estilos globales
├── config.ts        # loadConfig() — runtime config vía /config.json
├── App.jsx          # mapa de screens y Suspense
└── main.jsx         # entry point
```
