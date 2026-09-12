import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Dev-only mirror of the Traefik prefix routing used in stage/production
  // (see src/config.ts): a single backend URL (already fronted by Traefik
  // there, routing by path) is enough — what matters is the path, not the
  // host, so every prefix proxies to the same VITE_DEV_BACKEND_URL and the
  // path is forwarded as-is (no rewrite) for Traefik on the other end to
  // dispatch exactly like it does for a real domain.
  const env = loadEnv(mode, process.cwd(), '')
  const devBackendUrl = env.VITE_DEV_BACKEND_URL

  // TODO: quitar cuando infra añada localhost:5173 al WAF.
  // El WAF entre el dev local y Traefik descarta silenciosamente (DROP, no
  // REJECT) las peticiones que llevan `Origin: http://localhost:5173`,
  // dejando que el kernel agote los reintentos TCP (~136 s) hasta que el
  // proxy de Vite devuelve un 502. El navegador SIEMPRE añade Origin en los
  // POST con `Content-Type: application/json` (o con `Authorization`), así
  // que no se puede evitar desde el cliente: se elimina aquí, en las
  // peticiones SALIENTES hacia el backend. Ojo: `headers: { Origin:
  // undefined }` NO borra la cabecera en muchas versiones de http-proxy;
  // removeHeader sí. Aplicado solo a las reglas del proxy, nunca a los
  // assets que sirve Vite.
  /** @type {import('vite').ProxyOptions} */
  const stripBlockedHeaders = {
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.removeHeader('origin')
        proxyReq.removeHeader('referer')
      })
    },
  }

  return {
    plugins: [
      tailwindcss(),
      react(),
    ],
    server: {
      historyApiFallback: true,
      proxy: devBackendUrl
        ? {
            '/auth-service': {
              target: devBackendUrl,
              changeOrigin: true,
              ...stripBlockedHeaders,
            },
            '/identity/api/v1': {
              target: devBackendUrl,
              changeOrigin: true,
              ...stripBlockedHeaders,
            },
          }
        : undefined,
    },
  }
})
