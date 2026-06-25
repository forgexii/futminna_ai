import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const SENSITIVE_PREFIXES = ["/api/auth/register", "/api/auth/callback", "/api/payments", "/api/chat"];

export function proxy(req: NextRequest) {
  const res = NextResponse.next();

  // --- Security headers ---
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api.paystack.co https://api.anthropic.com",
      "frame-src 'self' https://checkout.paystack.com",
    ].join("; ")
  );

  // --- Rate limiting on sensitive endpoints ---
  const path = req.nextUrl.pathname;
  if (SENSITIVE_PREFIXES.some((p) => path.startsWith(p))) {
    const ip = getClientIp(req);
    const { allowed, retryAfterMs } = rateLimit(`${path}:${ip}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((retryAfterMs ?? 1000) / 1000)) } }
      );
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
