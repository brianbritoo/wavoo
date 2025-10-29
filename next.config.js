/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' }, // tus imágenes de Supabase
    ],
  },
  // quita experimental.appDir si aún está
};

module.exports = nextConfig;
