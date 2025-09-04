/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize images
  images: {
    domains: ['localhost'],
  },
  
  // Environment variables that are safe to expose to the browser
  env: {
    NEXT_PUBLIC_AGENTIC_API_URL: process.env.AGENTIC_API_URL || 'http://localhost:8901/api',
    NEXT_PUBLIC_BRAND_PACK_ID: process.env.AGENTIC_BRAND_PACK_ID || 'western-companies',
  },
  
  // Custom webpack configuration for CSS enhancement
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom loader for CSS enhancement in production builds
    if (!dev && !isServer) {
      config.module.rules.push({
        test: /\.css$/,
        use: [
          ...config.module.rules.find(rule => 
            rule.test && rule.test.toString() === '/\\.css$/'
          )?.use || [],
          {
            loader: require.resolve('./lib/webpack/agentic-css-loader.js'),
            options: {
              brandPackId: process.env.AGENTIC_BRAND_PACK_ID,
              enableEnhancement: true
            }
          }
        ]
      });
    }
    
    return config;
  },
  
  // Experimental features
  experimental: {
    // Enable server components
    serverComponents: true,
    // Optimize CSS
    optimizeCss: true,
  },
  
  // Headers for API CORS if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  
  // Redirects for common patterns
  async redirects() {
    return [
      {
        source: '/design-system',
        destination: '/api/health',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;