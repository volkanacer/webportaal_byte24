const withImages = require("next-images");

module.exports = withImages({
  images: {
    disableStaticImages: true,
  },
  eslint: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
});
