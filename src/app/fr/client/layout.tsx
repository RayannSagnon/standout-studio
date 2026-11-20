import type { Metadata } from "next";
import "../../portal.css";

export const metadata: Metadata = {
  title: "Espace client",
  robots: { index: false, follow: false },
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return children;
}
