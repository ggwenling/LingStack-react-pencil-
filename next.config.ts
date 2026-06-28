import type { NextConfig } from "next";
import path from "node:path";

const codemirrorPackages = [
  "@codemirror/state",
  "@codemirror/view",
  "@codemirror/language",
  "@codemirror/lang-markdown",
  "@codemirror/autocomplete",
  "@codemirror/commands",
];

const codemirrorResolveAlias = Object.fromEntries(
  codemirrorPackages.map((pkg) => [pkg, `./node_modules/${pkg}`]),
);

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  turbopack: {
    resolveAlias: codemirrorResolveAlias,
  },
  webpack: (config) => {
    const absoluteAliases = Object.fromEntries(
      codemirrorPackages.map((pkg) => [
        pkg,
        path.join(process.cwd(), "node_modules", pkg),
      ]),
    );

    config.resolve.alias = {
      ...config.resolve.alias,
      ...absoluteAliases,
    };
    return config;
  },
};

export default nextConfig;
