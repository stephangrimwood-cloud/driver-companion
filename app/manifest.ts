import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Driver Companion",
    short_name: "Driver Companion",
    description: "Taxi shift settlement and earnings companion",
    start_url: "/",
    display: "standalone",
    background_color: "#2b2b2c",
    theme_color: "#2b2b2c",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}