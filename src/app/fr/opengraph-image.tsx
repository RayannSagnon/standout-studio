import { ogSize, shareImage } from "@/lib/og";

export const alt = "Standout Studio : studio web bilingue à Ottawa";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return shareImage("Studio web bilingue à Ottawa. Forfaits clairs dès 399 $.");
}
