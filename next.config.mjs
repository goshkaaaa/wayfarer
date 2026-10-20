const basePath = process.env.GITHUB_ACTIONS ? "/wayfarer" : "";
const nextConfig = {
  output: "export",
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1"],
  basePath,
  images: { unoptimized: true },
};
export default nextConfig;
