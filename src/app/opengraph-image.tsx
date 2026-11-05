import { ogSize, shareImage } from "@/lib/og";

export const alt = "Standout Studio: bilingual web studio in Ottawa";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return shareImage("Bilingual web studio in Ottawa. Clear packages from $399.");
}
