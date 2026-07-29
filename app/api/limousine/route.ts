import { NextResponse } from "next/server";

export const revalidate = 300;

const FINANCE_BASE_URL = (
  process.env.NEXT_PUBLIC_A3_FINANCE_URL || "https://finance.a3group.sg"
).replace(/\/+$/, "");

const RATE_ORIGIN = (
  process.env.A3_FINANCE_RATE_API_URL || `${FINANCE_BASE_URL}/api/public/rate-matrix`
).replace(/\/+$/, "");

const BOOKING_ORIGIN = (
  process.env.A3_FINANCE_API_URL || `${FINANCE_BASE_URL}/api/public/limousine`
).replace(/\/+$/, "");

function publicError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

async function readJson(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function upstreamFetch(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    return await fetch(url, {
      ...init,
      next: { revalidate: 300 },
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  try {
    const response = await upstreamFetch(RATE_ORIGIN);
    const payload = await readJson(response);
    if (!response.ok) {
      return publicError("Unable to load live A3 Finance rates.", 502);
    }
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" },
    });
  } catch {
    return publicError("Unable to load live A3 Finance rates.", 502);
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return publicError("Invalid quotation request.", 400);
  }

  const honeypot = String(body.company || "").trim();
  const startedAt = Number(body.started_at || 0);
  if (honeypot || !Number.isFinite(startedAt) || Date.now() - startedAt < 1500) {
    return publicError("Unable to submit this request.", 400);
  }

  delete body.company;
  delete body.started_at;

  try {
    const response = await upstreamFetch(BOOKING_ORIGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await readJson(response);

    if (!response.ok) {
      const safeMessage =
        response.status >= 500
          ? "A3 Finance is temporarily unavailable. Please send the request through WhatsApp."
          : String(payload.error || "Unable to save the quotation request.");
      return publicError(safeMessage, response.status >= 500 ? 502 : response.status);
    }

    return NextResponse.json(payload, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" },
    });
  } catch {
    return publicError(
      "A3 Finance is temporarily unavailable. Please send the request through WhatsApp.",
      502,
    );
  }
}
