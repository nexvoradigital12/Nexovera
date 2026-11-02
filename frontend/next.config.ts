import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  transpilePackages: [
    "@uiw/react-md-editor",
    "@uiw/react-markdown-preview",
    "@uiw/codemirror-extensions-basic-setup",
    "@uiw/react-codemirror",
  ],
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
