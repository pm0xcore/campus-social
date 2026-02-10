/** @type {import('next').NextConfig} */
const nextConfig = {
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
