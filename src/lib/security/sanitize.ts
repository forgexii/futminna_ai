/**
 * Input Sanitization & URL Security Utilities
 * Implements SEC-04 (Cross-site scripting protection) & SEC-06 (Upload/URL scheme validation).
 */

/**
 * Whitelist of safe URI protocols permitted in href and img src attributes.
 * Explicitly rejects dangerous schemas like javascript:, vbscript:, data:text/html, and file:.
 */
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Validates whether a URL is safe to render in an <img> or <a> href attribute.
 *
 * @param url - The input URL to evaluate
 * @returns true if the URL matches an allowed protocol or safe relative root path
 */
export function isSafeUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();

  // Allow relative paths starting with / (e.g., internal assets or routes)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return ALLOWED_PROTOCOLS.has(parsed.protocol.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Returns a sanitized URL if safe, or a fallback URL if invalid or potentially malicious.
 *
 * @param url - The candidate URL
 * @param fallback - Safe default image or link URL
 * @returns The sanitized safe URL string
 */
export function getSafeUrl(url: string | undefined | null, fallback: string = ""): string {
  if (isSafeUrl(url)) {
    return url!.trim();
  }
  return fallback;
}

/**
 * Strips dangerous HTML tags, inline script handlers (onerror, onclick), and
 * javascript: pseudo-protocols from user-submitted text inputs.
 *
 * @param input - Untrusted user input text
 * @param maxLength - Maximum permitted character length (prevents memory payload abuse)
 * @returns Sanitized clean text string
 */
export function sanitizeText(input: string | undefined | null, maxLength: number = 2000): string {
  if (!input || typeof input !== "string") return "";

  return input
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "") // strip all HTML tags
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "") // strip event handlers (onerror=, onload=, etc.)
    .trim();
}

/**
 * Sanitizes and normalizes university course code inputs (e.g. "mat 201" -> "MAT201").
 * Removes special characters and limits length to 10 alphanumeric characters.
 *
 * @param code - Raw course code input string
 * @returns Normalized alphanumeric uppercase course code
 */
export function sanitizeCourseCode(code: string): string {
  return code
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 10);
}
