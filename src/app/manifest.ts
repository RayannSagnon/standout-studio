import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Standout Studio",
    short_name: "Standout",
    description: "Bilingual web studio in Ottawa",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F8F9",
    theme_color: "#0B3D3D",
    lang: "en",
  };
}
