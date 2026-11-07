/**
 * Campus Safety & Anti-Scam Guidance Banner (Section 6.2.2 & 6.7.1)
 * Warns students against blind advance payments, recommends public campus meetup zones,
 * and links to detailed safety and reporting instructions.
 */

import React from "react";
import { AlertTriangle, ShieldCheck, MapPin } from "lucide-react";
import Link from "next/link";

export function SafetyBanner() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-amber-950">Campus Safety & Anti-Scam Guidance (FUTMINNA Policy)</p>
          <p className="text-amber-800 leading-relaxed">
            Never make upfront bank transfers for off-campus accommodation or electronic items before meeting the seller in person. Always arrange meetups in broad daylight within public campus locations (such as the <strong>SEET Building</strong>, <strong>University Library</strong>, or <strong>Senate Complex Car Park</strong>).
          </p>
          <div className="pt-1">
            <Link href="/safety" className="font-semibold underline hover:text-amber-950">
              Read complete student safety guidelines & reporting instructions &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
