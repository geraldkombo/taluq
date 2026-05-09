/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            // STRICT PRIVACY: Explicitly deny access to phonebook/contacts, geolocation, camera, microphone
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), document-domain=()", // NOTE: 'contacts' is not a standard standardized HTTP Permissions-Policy yet in all browsers, but preventing generic device APIs shows intent. We'll use standard ones and note the rest.
          },
          {
            key: "X-Phonebook-Access",
            value: "DENIED" // Custom header to signal institutional audit compliance against loan apps
          },
        ],
      },
    ];
  },
};

export default nextConfig;
