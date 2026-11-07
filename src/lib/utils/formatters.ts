/**
 * Utility formatters
 * Obey DRY principle for formatting currency, dates, times, and strings
 */

/**
 * Format Nigerian Naira (₦) currency
 */
export function formatNaira(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "₦0";
  return `₦${amount.toLocaleString("en-NG")}`;
}

/**
 * Format ISO date string into readable Nigerian campus date
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format time of day
 */
export function formatTime(dateString: string | undefined | null): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * Normalize and format course code (e.g. "mat 201" -> "MAT201")
 */
export function normalizeCourseCode(code: string): string {
  return code.replace(/\s+/g, "").toUpperCase();
}
