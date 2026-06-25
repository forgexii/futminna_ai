import { NextRequest, NextResponse } from "next/server";
import { chatMessageSchema } from "@/lib/validations";
import { answerCampusQuestion } from "@/lib/chat/assistant";
import { getSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await getSession();

  // Rate limit by user id if signed in, otherwise by IP, to keep the
  // (potentially paid) LLM call from being hammered anonymously.
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const limitKey = `chat:${session?.user?.id ?? ip}`;
  const { allowed } = rateLimit(limitKey, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many messages — please slow down a little." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const result = await answerCampusQuestion(parsed.data.message, parsed.data.conversationHistory);

  return NextResponse.json(result);
}
