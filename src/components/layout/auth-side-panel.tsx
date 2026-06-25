import { Logomark, Wordmark } from "@/components/shared/logo";
import { ShieldCheck, Sparkles, Star } from "lucide-react";

export function AuthSidePanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-violet-950 p-10 text-white lg:flex">
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-violet-700/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-gold-500/20 blur-3xl"
      />

      <div className="relative flex items-center gap-2">
        <Logomark />
        <Wordmark className="text-white [&>span]:text-gold-400" />
      </div>

      <div className="relative max-w-sm">
        <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">
          The campus marketplace that actually knows your courses.
        </h2>
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-300" />
            </div>
            <p className="text-sm text-violet-100">Verified FUTMINNA students only, with transparent trust scores.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <Sparkles className="h-4.5 w-4.5 text-gold-300" />
            </div>
            <p className="text-sm text-violet-100">AI recommendations and a campus assistant, built in.</p>
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-1.5 text-sm text-violet-200">
        <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
        Trusted by 2,400+ students this session
      </div>
    </div>
  );
}
