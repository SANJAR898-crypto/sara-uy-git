"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, ChevronRight, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  properties?: Array<{
    id: string;
    title: string;
    price: number;
    currency: string;
    formatted: string;
  }>;
}

export function AiChatButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-[var(--shadow-lift)]"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Bot className="h-6 w-6" />
      <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
      </span>
    </motion.button>
  );
}

export function AiChatSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load help text on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetch("/api/ai/chat")
        .then((r) => r.json())
        .then((data) => {
          setSuggestions(data.suggestions || []);
          // Add welcome message
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content:
                "Assalomu alaykum! 👋 Men Sara Uylar AI yordamchisiman. Sizga uy qidirish, narx tahlili yoki investitsiya bo'yicha yordam beraman.\n\nNimani izlayapsiz?",
              timestamp: new Date().toISOString(),
            },
          ]);
        })
        .catch(console.error);
    }
  }, [isOpen, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10),
        }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: data.message?.id || `assistant_${Date.now()}`,
        role: "assistant",
        content: data.message?.content || "Kechirasiz, javob bera olmadim.",
        timestamp: new Date().toISOString(),
        properties: data.properties,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Chat Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-[24px] bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-heading text-[15px] text-ink-900">AI Yordamchi</h3>
                  <p className="text-[12px] text-ink-500">Onlayn • O'zbekcha</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100"
              >
                <X className="h-4 w-4 text-ink-600" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5",
                      msg.role === "user"
                        ? "bg-brand-500 text-white"
                        : "bg-ink-100 text-ink-900"
                    )}
                  >
                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>

                    {/* Property cards */}
                    {msg.properties && msg.properties.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.properties.map((p) => (
                          <Link
                            key={p.id}
                            href={`/property/${p.id}`}
                            onClick={onClose}
                            className="block rounded-xl bg-white p-3 shadow-sm"
                          >
                            <p className="text-[13px] font-medium text-ink-900 line-clamp-1">
                              {p.title}
                            </p>
                            <p className="mt-1 text-[12px] text-brand-600 font-semibold">
                              {p.currency === "UZS"
                                ? `${(p.price / 1_000_000).toFixed(0)} mln so'm`
                                : `$${p.price.toLocaleString()}`}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-ink-100 px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                    <span className="text-[13px] text-ink-600">Yozilmoqda...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && !loading && (
              <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[12px] font-medium text-brand-700"
                  >
                    <Sparkles className="h-3 w-3" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Xabar yozing..."
                  className="flex-1 rounded-full border border-border bg-ink-50 px-4 py-2.5 text-[14px] placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                    input.trim() && !loading
                      ? "bg-brand-500 text-white"
                      : "bg-ink-100 text-ink-400"
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
