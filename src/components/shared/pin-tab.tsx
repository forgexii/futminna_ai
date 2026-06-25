import { cn } from "@/lib/utils";

/** A small rotated tab in the corner of a card, evoking a pinned noticeboard note — the platform's signature visual motif, used sparingly on featured/recommended cards only. */
export function PinTab({ className, color = "gold" }: { className?: string; color?: "gold" | "emerald" | "violet" }) {
  const colors = {
    gold: "bg-gold-400",
    emerald: "bg-emerald-500",
    violet: "bg-violet-600",
  };
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute -top-1.5 left-5 h-4 w-4 rotate-[-8deg] rounded-[3px] shadow-sm",
        colors[color],
        className
      )}
    />
  );
}
