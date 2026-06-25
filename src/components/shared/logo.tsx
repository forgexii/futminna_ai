import { cn } from "@/lib/utils";

export function Logomark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn("h-7 w-7", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="currentColor" className="text-violet-700" />
      <path
        d="M9 12.5C9 10.567 10.567 9 12.5 9H19.5C21.433 9 23 10.567 23 12.5V12.5C23 14.433 21.433 16 19.5 16H12.5C10.567 16 9 17.567 9 19.5V19.5C9 21.433 10.567 23 12.5 23H19.5"
        stroke="white"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <circle cx="23" cy="19.5" r="2" fill="#D4A24C" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display text-lg font-semibold tracking-tight text-ink", className)}>
      FUTMINNA <span className="text-violet-700">AI</span>
    </span>
  );
}
