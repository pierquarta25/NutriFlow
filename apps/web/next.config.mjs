/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpilo i pacchetti locali del monorepo per permettere a Next.js di compilarli al volo
  transpilePackages: ['@nutriflow/types', '@nutriflow/utils', '@nutriflow/ui'],
};

export default nextConfig;
