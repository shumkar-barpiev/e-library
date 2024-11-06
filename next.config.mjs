
const prod = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: prod ? "export" : undefined,
  assetPrefix: prod ? "/foms/front/" : undefined,
  reactStrictMode: false,
};

export default nextConfig;
