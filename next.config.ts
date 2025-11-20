/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Todo lo que empiece con /api/ en el front, se manda al back
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*', 
      },
      {
        // Para el endpoint corto de validación /c/:token
        source: '/c/:path*',
        destination: 'http://localhost:4000/c/:path*',
      },
    ];
  },
};

export default nextConfig;