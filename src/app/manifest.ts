import type { MetadataRoute } from "next";
import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APP_ICON_MANIFEST_PATH,
  APP_SHORT_NAME,
  APP_START_URL,
} from "@/config/appInfo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_DISPLAY_NAME,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    start_url: APP_START_URL,
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#06070b",
    theme_color: "#06070b",
    icons: [
      {
        src: APP_ICON_MANIFEST_PATH,
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: APP_ICON_MANIFEST_PATH,
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
