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

  return {
    plugins: [
      tailwindcss(),
      react(),
    ],
    server: {
      historyApiFallback: true,
      proxy: devBackendUrl
        ? {
            '/auth-service': { target: devBackendUrl, changeOrigin: true },
            '/identity/api/v1': { target: devBackendUrl, changeOrigin: true },
          }
        : undefined,
    },
  }
})
