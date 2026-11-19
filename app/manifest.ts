import type { MetadataRoute } from "next";

// Lets the admin install the site on a phone (needed for push on iPhone).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Doxa Naturals",
    short_name: "Doxa",
    start_url: "/admin/orders",
    scope: "/",
    display: "standalone",
    background_color: "#fbf5ec",
    theme_color: "#4e5521",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png" },
      { src: "/apple-icon.png", sizes: "any", type: "image/png" },
    ],
  };
}
