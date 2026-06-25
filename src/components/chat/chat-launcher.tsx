"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; category: string }[];
}

const SUGGESTIONS = [
  "When does first semester registration close?",
  "How does escrow work on the marketplace?",
  "How are trust scores calculated?",
];

export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatTurn[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversationHistory: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error ?? "Something went wrong. Please try again." }]);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer, sources: data.sources }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close campus assistant" : "Open campus assistant"}
        className={cn(
          "fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full",
          "bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-[var(--shadow-lift)]",
          "transition-transform hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-24 right-5 z-40 flex w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[var(--radius-card)] border border-warmgray-200 bg-white shadow-[var(--shadow-lift)] transition-all duration-200",
          open ? "h-[min(560px,70vh)] opacity-100" : "pointer-events-none h-0 opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-warmgray-100 bg-gradient-to-r from-violet-700 to-violet-600 px-4 py-3.5 text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-display text-sm font-semibold leading-tight">Campus Assistant</p>
            <p className="text-[11px] text-violet-100">Academic calendar, policies & platform help</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-warmgray-500">
                Ask me about registration deadlines, marketplace policies, trust scores, or how to use FUTMINNA AI.
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-violet-100 bg-violet-50/60 px-3 py-2 text-left text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user" ? "bg-violet-700 text-white" : "bg-warmgray-100 text-ink"
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 border-t border-warmgray-200/70 pt-2">
                      {m.sources.map((s, si) => (
                        <span
                          key={si}
                          className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-warmgray-500"
                        >
                          <BookOpen className="h-2.5 w-2.5" />
                          {s.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-warmgray-100 px-3.5 py-2.5 text-sm text-warmgray-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Thinking…
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 border-t border-warmgray-100 p-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about registration, policies, anything…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-warmgray-200 bg-warmgray-50 px-3 py-2.5 text-sm text-ink placeholder:text-warmgray-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} className="h-10 w-10 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
