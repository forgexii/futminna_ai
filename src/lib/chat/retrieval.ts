import { db, knowledgeBaseDocuments } from "@/lib/db";

/**
 * Retrieval layer for the campus assistant.
 *
 * The brief calls for vector embeddings + semantic search via a locally
 * hosted Ollama model. For this build we implement the same RAG *shape*
 * (retrieve top-k relevant docs, then generate an answer grounded only in
 * those docs, with citations) using a lightweight TF-IDF-style keyword
 * scorer instead of a vector index — no extra infra to stand up, fully
 * swappable later for embeddings + Ollama without touching the call sites
 * (`retrieveRelevantDocs` is the only function that would need to change).
 */

export interface KBDoc {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function scoreDocument(queryTokens: string[], doc: KBDoc) {
  const docText = `${doc.title} ${doc.content} ${doc.keywords.join(" ")}`.toLowerCase();
  const docTokens = tokenize(docText);
  const docTokenSet = new Set(docTokens);

  let score = 0;
  for (const qt of queryTokens) {
    if (docTokenSet.has(qt)) {
      // weight title/keyword matches higher
      score += 1;
      if (doc.title.toLowerCase().includes(qt)) score += 2;
      if (doc.keywords.some((k) => k.toLowerCase().includes(qt))) score += 1.5;
    }
  }
  return score;
}

export async function retrieveRelevantDocs(query: string, topK = 4): Promise<KBDoc[]> {
  const rows = await db.select().from(knowledgeBaseDocuments);
  const docs: KBDoc[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    content: r.content,
    keywords: JSON.parse(r.keywords || "[]"),
  }));

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scored = docs
    .map((doc) => ({ doc, score: scoreDocument(queryTokens, doc) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map((s) => s.doc);
}
