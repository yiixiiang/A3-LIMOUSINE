import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      service: "A3 Group SG Limousine",
      status: "online",
      ratesUrl: "https://finance.a3group.sg",
      services: [
        "Airport Transfer",
        "Hourly Chauffeur",
        "Point-to-Point",
        "Singapore to Johor Bahru",
      ],
    },
    { status: 200 }
  );
}
