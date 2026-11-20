// Light, dark or automatic (follows the device) for the client and admin areas.
// Light by default: the brand is light. Remembered in a cookie.

import "server-only";
import { cookies } from "next/headers";

export type Theme = "light" | "dark" | "auto";
export const THEME_COOKIE = "pt_theme";

export async function getTheme(): Promise<Theme> {
  const v = (await cookies()).get(THEME_COOKIE)?.value;
  return v === "dark" || v === "auto" ? v : "light";
}

/** The data-theme attribute for the .pt wrapper ("auto" leaves the device's choice). */
export const themeAttr = (t: Theme) => (t === "auto" ? undefined : t);
