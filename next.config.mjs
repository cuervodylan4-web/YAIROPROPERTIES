/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Previously `hostname: "**"`, which let anyone proxy arbitrary images
    // through /_next/image and bill the transformations to this project.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.photos.sparkplatform.com" },
      { protocol: "https", hostname: "*.sparkplatform.com" },
      { protocol: "https", hostname: "s3.amazonaws.com", pathname: "/flexmls-apidc-media/**" },
    ],
    // Next generates one transformation per candidate width. The defaults emit
    // ~8 per photo (97 requests for a 12-photo listing); this cuts it to 4.
    deviceSizes: [640, 1080, 1920],
    imageSizes: [256, 384],
    qualities: [75],
    formats: ["image/webp"],
    // Default TTL re-writes the cache entry on every expiry, which is what
    // pushed Image Optimization cache writes over quota. MLS photo URLs are
    // immutable, so cache them for 31 days.
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
