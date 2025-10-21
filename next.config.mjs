/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: ['lh3.googleusercontent.com']
    },
    // experimental: {
    //     serverComponentsExternalPackages: ["pdf-parse"],
    // },
    webpack: (config) => {
        config.externals.push({
            canvas: "commonjs canvas",
        });
        return config;
    },
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
            port: '',
            pathname: '/**',
        },
    ],
};

export default nextConfig;
