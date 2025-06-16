import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuration minimale pour des performances optimales en développement
  swcMinify: true,
  poweredByHeader: false,
  
  // Optimisations expérimentales simplifiées
  experimental: {
    optimizePackageImports: [
      '@supabase/supabase-js',
      '@heroicons/react',
      'lucide-react'
    ],
    // Désactiver turbo pour éviter les conflits
  },
  
  // Images optimisées simplifiées
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ekpximtmuwwxdkhrepna.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Ignorer les erreurs en développement pour la vitesse
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;