import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEJKY Limousine | Premium Chauffeur Service Singapore",
  description: "Premium airport transfer, private chauffeur, hourly disposal and Singapore–Johor transport services.",
  metadataBase: new URL("https://limousine.a3group.sg"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
