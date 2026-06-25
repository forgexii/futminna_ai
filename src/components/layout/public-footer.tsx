import Link from "next/link";
import { Logomark, Wordmark } from "@/components/shared/logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-warmgray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <Logomark />
              <Wordmark />
            </div>
            <p className="mt-3 max-w-xs text-sm text-warmgray-500">
              The campus marketplace, tutoring board and AI assistant for FUTMINNA students — replacing scattered
              WhatsApp groups and noticeboards with one trusted place.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-warmgray-400">Platform</p>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm text-warmgray-600">
              <li><Link href="/marketplace" className="hover:text-violet-700">Marketplace</Link></li>
              <li><Link href="/tutors" className="hover:text-violet-700">Find a tutor</Link></li>
              <li><Link href="/features" className="hover:text-violet-700">Features</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-warmgray-400">Company</p>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm text-warmgray-600">
              <li><Link href="/about" className="hover:text-violet-700">About</Link></li>
              <li><Link href="/faq" className="hover:text-violet-700">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-violet-700">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-warmgray-400">Account</p>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm text-warmgray-600">
              <li><Link href="/login" className="hover:text-violet-700">Sign in</Link></li>
              <li><Link href="/register" className="hover:text-violet-700">Create account</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-warmgray-100 pt-6 text-xs text-warmgray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FUTMINNA AI. Built for students, by students.</p>
          <p>Not officially affiliated with the Federal University of Technology, Minna.</p>
        </div>
      </div>
    </footer>
  );
}
