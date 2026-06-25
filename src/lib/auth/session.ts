import { auth } from "@/lib/auth/config";

/** Returns the current session or null. Use in API routes that allow anonymous access. */
export async function getSession() {
  return auth();
}

/** Throws-as-response pattern: returns either { session } or a NextResponse to return immediately. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: { status: 401 as const, body: { error: "Sign in required" } } };
  }
  return { session, error: null };
}

export async function requireRole(roles: Array<"student" | "tutor" | "admin">) {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: { status: 401 as const, body: { error: "Sign in required" } } };
  }
  if (!roles.includes(session.user.role)) {
    return { session: null, error: { status: 403 as const, body: { error: "Not authorized for this action" } } };
  }
  return { session, error: null };
}
