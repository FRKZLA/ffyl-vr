/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias['three'] = 'three';
    return config;
  },
};

export default nextConfig;
