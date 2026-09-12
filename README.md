# B-Mori — Frontend

Portal web de B-Mori: plataforma de financiamiento para PYMEs, empresas contratantes ("anclas") y el panel de administración del banco. SPA construida con React 19 + Vite, sin backend propio — consume los servicios de autenticación (Bonafide), API e identidad expuestos por el backend.

## Stack técnico

- **React 19** + **Vite** (dev server con HMR, build a `dist/`)
- **Tailwind CSS v4** vía `@tailwindcss/vite` (sin `tailwind.config.js`; los tokens de diseño viven en `src/index.css`)
- **Zustand** para el estado de sesión/autenticación (`src/stores/authStore.js`), persistido en `sessionStorage`
- **React Router** (`react-router-dom` v7) para la URL real; el `screen` de contexto es solo la clave simbólica que se traduce a una ruta
- **ESLint** como gate de CI (no hay corredor de tests configurado en este repo)

## Requisitos

- Node.js 24+ (ver `Dockerfile`)
- npm

## Puesta en marcha local

```bash
npm install
cp .env.example .env   # completar VITE_DEV_BACKEND_URL
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

## Configuración de entorno

Los backends se resuelven en runtime mediante `src/config.ts` (`loadConfig()`, lanzado sin `await` desde `main.jsx` en paralelo con la pantalla de splash), no en tiempo de build — la misma imagen Docker sirve para cualquier dominio sin recompilar.

`authUrl` e `identityUrl` son constantes de ruta relativa, iguales en todo entorno:

| Constante | Prefijo |
| --- | --- |
| `authUrl` | `/auth-service` |
| `identityUrl` (catálogo) | `/identity/api/v1` |

`apiUrl` no tiene prefijo asignado todavía: b-mori no tiene backend propio, así que queda `undefined` — los callers que lo necesiten deben chequearlo explícitamente.

En stage/producción, Traefik enruta cada prefijo al backend correspondiente según el `Host` de la petición (los labels que definen ese ruteo viven en el repo de cada backend) — el navegador nunca hace una llamada cross-origin.

En desarrollo local, `vite.config.js` declara un `server.proxy` que reenvía esos mismos prefijos, sin reescribirlos, a un único host destino (`VITE_DEV_BACKEND_URL`, ver `.env.example`) — ese host debe ser uno ya fronteado por el mismo Traefik, para que el comportamiento sea idéntico al de producción.

### Variables de entorno

La única variable que consume el repo es **`VITE_DEV_BACKEND_URL`**, y la lee `vite.config.js` con `loadEnv` — **no** `import.meta.env` (no hay ninguna referencia a `import.meta.env` en `src/`). Sirve solo para el dev server y no tiene efecto en el bundle de producción.

No existen variables de stage/producción: los prefijos de backend son constantes de `src/config.ts` y el ruteo por dominio lo resuelve Traefik. La misma imagen Docker sirve en todos los entornos, sin inyección de env vars al arrancar el contenedor.

### Parche temporal del proxy de Vite (WAF)

`vite.config.js` aplica hoy un `stripBlockedHeaders` a las dos reglas del proxy: borra `Origin` y `Referer` en las peticiones **salientes** hacia el backend.

Motivo: entre la máquina de dev y Traefik hay un WAF que descarta silenciosamente (`DROP`, no `REJECT`) las peticiones con `Origin: http://localhost:5173`, agotando los reintentos TCP (~136 s) hasta que el proxy devuelve un 502. El navegador siempre añade esa cabecera en los POST con `Content-Type: application/json` o `Authorization`, así que no se puede evitar desde el cliente. Se usa `proxyReq.removeHeader()` y no `headers: { Origin: undefined }` porque esto último no borra la cabecera en varias versiones de http-proxy.

**Condición para quitarlo** (marcada con TODO en el archivo): el WAF ya permite `http://localhost:5173`, `http://localhost:5174` y `http://127.0.0.1:5173` en su allowlist, **y** su política cambió de DROP a REJECT para orígenes no permitidos. Una vez cumplida: eliminar la constante, su comentario TODO y los spreads `...stripBlockedHeaders` de cada regla, dejándolas como `{ target: devBackendUrl, changeOrigin: true }`.

> **Nota para quien configure los labels de Traefik del backend**: el router de este frontend (`docker-compose.dev.yml`/`docker-compose.prod.yml`) usa `HostRegexp` sin restricción de path y `priority=200`. El router `PathPrefix(/identity/api/v1)` (o `/auth-service`) del backend debe declarar una `priority` explícita mayor a `200` para ganarle a ese router en el mismo dominio — de lo contrario Traefik puede seguir enviando esas peticiones al contenedor del frontend en vez del backend.

## Arquitectura

### Navegación: React Router con un mapa `screenId → path`

Sí hay librería de enrutamiento: `react-router-dom` (`BrowserRouter` en `src/main.jsx`, `<Routes>` en `src/App.jsx`). Lo que no hay es un archivo de rutas con JSX por pantalla.

`src/state/AppContext.jsx` exporta `ROUTES`, un mapa `screenId → path` (p. ej. `epHome: '/pyme'`, `empContratos: '/contratante/contratos'`, `adminDash: '/admin'`), y deriva el inverso `PATH_TO_SCREEN`. El contexto mantiene el estado `screen` (string, p. ej. `'epHome'`), `role` y `opts` libres, y los sincroniza con la URL: navegar con `const { go } = useApp(); go('claveDePantalla', optsOpcionales)` empuja el path correspondiente, y entrar por URL directa (o con atrás/adelante del navegador) resuelve el `screen` desde el path. Un `screen` sin entrada en `ROUTES` cae a `/`.

`src/App.jsx` declara un `<Route>` por pantalla, con cada componente cargado de forma perezosa (`lazy`) y envuelto en un único `<Suspense>`. Al agregar una pantalla nueva: crear el archivo de página, añadir su entrada al mapa `ROUTES` en `AppContext.jsx`, y agregar el `lazy(() => import(...))` + su `<Route>` en `App.jsx`.

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
docker run -p 8080:80 bmori-frontend
```

La imagen construye el bundle estático con Node y lo sirve con `nginx` directamente — no requiere variables de entorno al arrancar el contenedor, ya que los prefijos de backend son constantes de `src/config.ts` y el ruteo por dominio lo resuelve Traefik. Incluye healthcheck en `/health`.

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
├── state/           # AppContext (mapa ROUTES screenId → path, go())
├── stores/          # authStore (zustand)
├── styles/          # fonts.css y otros estilos globales
├── config.ts        # loadConfig() — prefijos de ruta fijos, resueltos en runtime
├── App.jsx          # <Routes> + Suspense, un lazy por pantalla
└── main.jsx         # entry point (BrowserRouter + loadConfig())
```
