/** @type {import('next').NextConfig} */

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.googleadservices.com https://googleads.g.doubleclick.net https://connect.facebook.net https://*.facebook.net https://www.google.com https://www.gstatic.com https://apis.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: blob: https: https://www.facebook.com https://*.facebook.com https://www.google.com https://*.google.com;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://www.google-analytics.com https://*.google-analytics.com https://*.googletagmanager.com https://*.googleadservices.com https://googleads.g.doubleclick.net https://*.facebook.com https://*.facebook.net https://connect.facebook.net wss://*.firebaseio.com https://api.resend.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;
  frame-src 'self' https://www.google.com https://www.facebook.com https://*.firebaseapp.com;
  media-src 'self' https:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim()

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
        ],
      },
    ]
  },
}

export default nextConfig
