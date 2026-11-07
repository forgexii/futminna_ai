/**
 * @file pin-tab.tsx
 * @description Decorative bookmark/pinned badge component used across feature cards.
 */

import React from "react";

/**
 * Props for PinTab.
 */
interface PinTabProps {
  /** Accent color variant */
  color?: "gold" | "violet" | "emerald";
}

/**
 * Pinned ribbon tab for UI cards.
 */
export function PinTab({ color = "gold" }: PinTabProps) {
  const colorStyles = {
    gold: "bg-amber-400 text-amber-950",
    violet: "bg-violet-500 text-white",
    emerald: "bg-emerald-500 text-white",
  };

  return (
    <div
      className={`absolute -top-3 right-6 h-6 w-12 rounded-b-md shadow-sm flex items-center justify-center font-bold text-[10px] tracking-widest uppercase ${colorStyles[color]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
    </div>
  );
}
