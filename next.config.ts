import type { NextConfig } from "next";
import type { RuleSetRule } from "webpack"; // Type import for safe rule handling

const nextConfig: NextConfig = {
  // Enable standalone output for optimized Docker builds
  output: "standalone",

  // Don't advertise the framework/version
  poweredByHeader: false,

  // Security headers applied to every response (the gateway terminates TLS and
  // forwards these to the browser).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  webpack(config) {
    // Safely find the default file-loader for SVGs
    const fileLoaderRule = config.module.rules.find((rule: RuleSetRule) => {
      return rule.test instanceof RegExp && rule.test.test(".svg");
    });

    // Exclude SVGs from the default loader
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // Add SVGR loader to import SVGs as React components
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;
