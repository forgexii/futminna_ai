import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TIERS = [
  { min: 85, label: "Highly trusted", variant: "emerald" as const },
  { min: 65, label: "Trusted", variant: "violet" as const },
  { min: 40, label: "Building trust", variant: "gold" as const },
  { min: 0, label: "New member", variant: "neutral" as const },
];

export function TrustBadge({ score, showLabel = true }: { score: number; showLabel?: boolean }) {
  const tier = TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
  return (
    <Badge variant={tier.variant}>
      <ShieldCheck className="h-3 w-3" />
      {score} {showLabel && `· ${tier.label}`}
    </Badge>
  );
}
