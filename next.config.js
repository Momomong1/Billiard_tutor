/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 🚫 서버 빌드에서 konva, react-konva 제외
      config.externals.push({
        konva: 'konva',
        'react-konva': 'react-konva'
      });
    }
    return config;
  },
};

module.exports = nextConfig;
