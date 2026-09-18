import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Placeholder photography for the marketing surface. Replace with art-directed
    // assets before launch; the seed strings describe the intended shot.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
