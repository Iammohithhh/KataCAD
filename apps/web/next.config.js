/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // The replicad-opencascadejs glue is an Emscripten module that statically
    // references Node built-ins inside dead (Node-only) branches. In the
    // browser bundle those branches never run, so we resolve them to nothing.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      os: false,
      stream: false,
      perf_hooks: false,
      worker_threads: false,
      module: false,
    };
    return config;
  },
};

module.exports = nextConfig;
