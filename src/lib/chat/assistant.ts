import { retrieveRelevantDocs, type KBDoc } from "@/lib/chat/retrieval";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export function isLLMConfigured() {
  const key = process.env.ANTHROPIC_API_KEY;
  return Boolean(key && !key.includes("replace_me"));
}

const SYSTEM_PROMPT = `You are the FUTMINNA AI campus assistant — a friendly, concise helper for students at the Federal University of Technology, Minna.

Rules:
- Answer ONLY using the "Knowledge base context" provided below. If the context doesn't contain the answer, say you don't have that information yet and suggest the student check with the relevant office, rather than guessing.
- Never invent academic calendar dates, course details, fees, or contact information that isn't in the context.
- Keep answers short — 2 to 5 sentences, plain language, no markdown headers.
- When you use a fact from a specific source document, mention its title naturally (e.g. "According to the Academic Calendar...").
- You can also explain how to use the FUTMINNA AI platform itself (marketplace, tutoring, payments, trust scores) using the context provided.
- Be warm but efficient — students are often on slow mobile data and want a direct answer.`;

function buildContextBlock(docs: KBDoc[]) {
  if (docs.length === 0) {
    return "No matching knowledge base documents were found for this question.";
  }
  return docs
    .map((d, i) => `[Source ${i + 1}: ${d.title} | category: ${d.category}]\n${d.content}`)
    .join("\n\n---\n\n");
}

function offlineFallbackAnswer(docs: KBDoc[], message: string) {
  if (docs.length === 0) {
    return {
      answer:
        "I don't have a configured AI model right now, and I couldn't find anything matching that in the knowledge base. Try rephrasing, or check with the relevant campus office directly.",
      sources: [] as { title: string; category: string }[],
    };
  }
  const top = docs[0];
  return {
    answer: `I don't have a live AI model connected right now, so here's the most relevant thing I found for "${message.slice(0, 80)}": ${top.content.slice(0, 320)}${top.content.length > 320 ? "…" : ""}`,
    sources: docs.map((d) => ({ title: d.title, category: d.category })),
  };
}

export async function answerCampusQuestion(message: string, history: ChatTurn[] = []) {
  const docs = await retrieveRelevantDocs(message, 4);

  if (!isLLMConfigured()) {
    return offlineFallbackAnswer(docs, message);
  }

  const contextBlock = buildContextBlock(docs);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [
          ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
          {
            role: "user",
            content: `Knowledge base context:\n\n${contextBlock}\n\nStudent question: ${message}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("LLM call failed", res.status, errText);
      return offlineFallbackAnswer(docs, message);
    }

    const data = await res.json();
    const text =
      data.content?.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n") ??
      "";

    return {
      answer: text || "I couldn't generate a response just now — please try again.",
      sources: docs.map((d) => ({ title: d.title, category: d.category })),
    };
  } catch (err) {
    console.error("Chat assistant error", err);
    return offlineFallbackAnswer(docs, message);
  }
}
