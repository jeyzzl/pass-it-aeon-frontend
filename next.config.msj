/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // --- 1. MODO PERMISIVO ---
  // Next.js permite estas opciones aunque TypeScript se queje a veces
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // -------------------------

  // --- 2. CONEXIÓN AL BACKEND ---
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`, 
      },
      {
        source: '/c/:path*',
        destination: `${apiUrl}/c/:path*`,
      },
    ];
  },
};

export default nextConfig;