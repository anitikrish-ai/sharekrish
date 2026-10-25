/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ponytail: no next-pwa dependency — manifest + a hand-written sw.js
  // (registered in app/layout.tsx) covers app-shell caching without
  // pulling in a build plugin for a few lines of cache logic.
  headers: async () => [
    {
      source: '/sw.js',
      headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
    },
  ],
}

export default nextConfig
