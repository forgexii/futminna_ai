import { db, notifications } from "@/lib/db";

export async function notify(input: { userId: string; type: string; title: string; body: string; link?: string }) {
  await db.insert(notifications).values({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link,
  });
}
