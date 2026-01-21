/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

// Codespaces envs:
// - CODESPACE_NAME: e.g. "probable-cod-..."
// - GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: e.g. "app.github.dev"
const codespaceName = process.env.CODESPACE_NAME;
const portDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;

const allowedOrigins = ['localhost:3000'];

if (codespaceName && portDomain) {
  // Some setups use two host forms; we include both.
  allowedOrigins.push(`${codespaceName}-3000.${portDomain}`);
  allowedOrigins.push(`${codespaceName}.${portDomain}`);
}

const nextConfig = {
  experimental: isDev
    ? {
        trustHostHeader: true,
        serverActions: {
          allowedOrigins
        }
      }
    : undefined
};

module.exports = nextConfig;
