/**
 * @file assistant/page.tsx
 * @description FUTMINNA Campus Knowledge Assistant UI.
 * 
 * MVP Specification Compliance:
 * - Section 6.6 & 13: Strict evidence-grounded responses citing verified university sources.
 * - Anti-hallucination guardrail: Answers questions only if matched against approved institutional knowledge items;
 *   refuses out-of-domain or unverified queries safely with direct escalation links.
 * - Non-Goal: Not a general-purpose ungrounded chatbot.
 * - UX: Displays citation badges, source review drawer, and helpful/unhelpful feedback collectors.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { useApp } from "@/lib/context/app-context";
import { isSafeUrl } from "@/lib/security/sanitize";
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  Award,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  ShieldAlert,
  Info,
} from "lucide-react";

/**
 * Campus Knowledge Assistant page providing an interactive dialogue console,
 * verified citations display, and knowledge base sources sidebar.
 */
export default function AssistantPage() {
  const {
    assistantMessages,
    sendAssistantMessage,
    feedbackAssistantMessage,
    knowledgeSources,
  } = useApp();

  const [inputQuery, setInputQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [assistantMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    sendAssistantMessage(inputQuery.trim());
    setInputQuery("");
  };

  const samplePrompts = [
    "When do lectures resume for the 2026/2027 academic session?",
    "What is the maximum credit load and penalty for late course registration?",
    "Can I use an electric hotplate in the university hostel?",
    "How do I pay school fees via Remita and verify my bursary receipt?",
    "Who is teaching GST110 this semester?", // Will trigger safe refusal guardrail!
  ];

  return (
    <div className="flex min-h-screen flex-col bg-warmgray-50">
      <PublicNavbar />

      <main className="flex-1 flex flex-col">
        {/* Assistant Header */}
        <div className="border-b border-warmgray-200 bg-white py-6">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-violet-700">
                  <Bot className="h-4 w-4" />
                  <span>Evidence-Grounded Knowledge Assistant</span>
                </div>
                <h1 className="mt-1 font-display text-2xl font-bold text-ink">
                  FUTMINNA Campus Assistant
                </h1>
                <p className="mt-0.5 text-xs text-warmgray-500">
                  Answers to academic calendar, e-registration, and campus guidelines grounded in verified university circulars.
                </p>
              </div>

              {/* Source count badge */}
              <div className="flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-200 px-3 py-1.5 text-xs text-violet-800">
                <BookOpen className="h-3.5 w-3.5 text-violet-600" />
                <span>
                  <strong>{knowledgeSources.filter((ks) => ks.isActive).length}</strong> Active Grounded Sources
                </span>
              </div>
            </div>

            {/* Official Announcement Disclaimer (Section 6.6.2) */}
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Notice:</strong> Answers are strictly generated from approved Senate circulars and portal memos. Official university announcements directly published by the Registrar or Dean of Student Affairs take precedence.
              </span>
            </div>
          </div>
        </div>

        {/* Chat Stream & Knowledge Base Sidebar Layout */}
        <div className="mx-auto max-w-5xl w-full px-4 py-6 sm:px-6 lg:px-8 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Column (3 cols) */}
          <div className="lg:col-span-3 flex flex-col h-[650px] rounded-2xl border border-warmgray-200 bg-white shadow-sm overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {assistantMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "assistant" && (
                    <div className="h-8 w-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-violet-600 text-white font-medium rounded-tr-none"
                        : msg.isRefusal
                        ? "bg-amber-50/80 border border-amber-200 text-amber-950 rounded-tl-none"
                        : "bg-warmgray-50 border border-warmgray-200 text-ink rounded-tl-none"
                    }`}
                  >
                    {/* Content */}
                    <div className="whitespace-pre-line">{msg.content}</div>

                    {/* Citations block if present */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-warmgray-200/80 space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                          <Award className="h-3 w-3 text-emerald-600" />
                          Verified Source Citations:
                        </p>
                        {msg.citations.map((cite, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-white p-2 border border-warmgray-200 text-[11px] text-warmgray-700 shadow-2xl"
                          >
                            <p className="font-semibold text-ink">{cite.title}</p>
                            <p className="text-[10px] text-warmgray-500">
                              Ref: {cite.documentRef} • Effective: {cite.effectiveDate}
                            </p>
                            {cite.url && isSafeUrl(cite.url) && (
                              <a
                                href={cite.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 hover:underline"
                              >
                                View official document <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Safe Refusal Tag if triggered */}
                    {msg.isRefusal && (
                      <div className="mt-2 text-[10px] text-amber-700 font-medium flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        <span>Refusal triggered: Claim cannot be substantiated by active knowledge base.</span>
                      </div>
                    )}

                    {/* Feedback thumbs for assistant messages */}
                    {msg.sender === "assistant" && (
                      <div className="mt-2 pt-2 border-t border-warmgray-200 flex items-center justify-between text-[10px] text-warmgray-400">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <div className="flex items-center gap-2">
                          <span>Was this helpful?</span>
                          <button
                            onClick={() => feedbackAssistantMessage(msg.id, true)}
                            className={`p-1 rounded hover:bg-warmgray-200 transition ${
                              msg.helpfulFeedback === true ? "text-emerald-600 font-bold" : ""
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => feedbackAssistantMessage(msg.id, false)}
                            className={`p-1 rounded hover:bg-warmgray-200 transition ${
                              msg.helpfulFeedback === false ? "text-red-600 font-bold" : ""
                            }`}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Sample Prompts */}
            <div className="border-t border-warmgray-100 bg-warmgray-50 p-2.5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
              <span className="text-[11px] font-medium text-warmgray-400 self-center">Try asking:</span>
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputQuery(p);
                    sendAssistantMessage(p);
                  }}
                  className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-warmgray-700 border border-warmgray-200 hover:border-violet-300 hover:text-violet-700 transition shrink-0"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="border-t border-warmgray-200 bg-white p-3 flex gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about academic calendar, course registration, hostel rules, bursary fees..."
                className="flex-1 rounded-xl border border-warmgray-200 px-4 py-2.5 text-xs text-ink outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition disabled:opacity-40"
              >
                <span>Ask</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Right Column: Approved Sources Register (Section 13) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-warmgray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <BookOpen className="h-4 w-4 text-violet-600" />
                <span>Active Knowledge Base</span>
              </div>
              <p className="mt-1 text-[11px] text-warmgray-500">
                Registered university documents currently powering the assistant:
              </p>

              <div className="mt-3 space-y-2">
                {knowledgeSources.map((ks) => (
                  <div
                    key={ks.id}
                    className="rounded-xl border border-warmgray-100 bg-warmgray-50 p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-violet-700 uppercase">
                        {ks.category}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Active source" />
                    </div>
                    <p className="mt-1 font-semibold text-ink line-clamp-2 text-[11px]">{ks.title}</p>
                    <p className="mt-0.5 text-[10px] text-warmgray-400">
                      Effective: {ks.effectiveDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality & Safety Card */}
            <div className="rounded-2xl border border-warmgray-200 bg-white p-4 shadow-sm text-xs text-warmgray-600 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <ShieldAlert className="h-4 w-4 text-emerald-600" />
                <span>Anti-Hallucination Guardrails</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                The assistant uses strict threshold retrieval. If an answer cannot be grounded directly in these four verified circulars, it declines to guess sensitive dates or fees.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
