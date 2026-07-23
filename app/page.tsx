import type { Metadata } from "next";
import ProfessionalLimousinePage from "./professional-limousine-page";

export const metadata: Metadata = {
  title: "AEJKY Limousine | Premium Chauffeur Service Singapore",
  description:
    "AEJKY Limousine provides premium airport transfer, private chauffeur, hourly disposal and Singapore–Johor transport services.",
  keywords: [
    "AEJKY Limousine",
    "Singapore limousine",
    "airport transfer Singapore",
    "private chauffeur",
    "hourly disposal",
    "Singapore Johor transport",
  ],
  openGraph: {
    title: "AEJKY Limousine",
    description: "Premium, punctual and personal chauffeur services in Singapore and Malaysia.",
    type: "website",
    images: ["/aejky-limousine-logo.webp"],
  },
};

export default function LimousinePage() {
  return <ProfessionalLimousinePage />;
}
