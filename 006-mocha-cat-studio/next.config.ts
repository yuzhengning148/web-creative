import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/home.html",
        },
        {
          source: "/contact",
          destination: "/contact.html",
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/home.html",
        headers: [
          {
            key: "Content-Type",
            value: "text/html; charset=utf-8",
          },
        ],
      },
      {
        source: "/contact.html",
        headers: [
          {
            key: "Content-Type",
            value: "text/html; charset=utf-8",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
