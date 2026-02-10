/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during production builds (fix pre-existing errors separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Allow embedding in OCHub iframe
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://ochub.educhain.xyz',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://ochub.educhain.xyz https://*.educhain.xyz",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
