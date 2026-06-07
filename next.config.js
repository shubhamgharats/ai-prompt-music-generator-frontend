/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "music-generation-bucket-shubham.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default config;