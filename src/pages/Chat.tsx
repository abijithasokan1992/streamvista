import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Menu,
  MessageSquarePlus,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

const STORAGE_KEY = "streamvista-ai-chat-history-v1";
const starterPrompts = [
  "I have content to distribute",
  "I need content to license",
  "I need studio services",
  "I want to partner with StreamVista",
];

function newThread(): ChatThread {
  return {
    id: crypto.randomUUID(),
    title: "New conversation",
    createdAt: Date.now(),
    messages: [],
  };
}

function loadThreads(): ChatThread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [newThread()];
    const parsed = JSON.parse(raw) as ChatThread[];
    return Array.isArray(parsed) && parsed.length ? parsed : [newThread()];
  } catch {
    return [newThread()];
  }
}

export default function Chat() {
  const [threads, setThreads] = useState<ChatThread[]>(() => loadThreads());
  const [activeId, setActiveId] = useState(() => threads[0]?.id ?? "");
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeId) ?? threads[0],
    [activeId, threads],
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length, isSending]);

  function replaceThread(nextThread: ChatThread) {
    setThreads((current) => current.map((thread) => (thread.id === nextThread.id ? nextThread : thread)));
  }

  function createConversation() {
    const thread = newThread();
    setThreads((current) => [thread, ...current]);
    setActiveId(thread.id);
    setInput("");
    setError(null);
    setSidebarOpen(false);
  }

  function deleteConversation(id: string) {
    setThreads((current) => {
      const remaining = current.filter((thread) => thread.id !== id);
      if (remaining.length) {
        if (activeId === id) setActiveId(remaining[0].id);
        return remaining;
      }
      const replacement = newThread();
      setActiveId(replacement.id);
      return [replacement];
    });
  }

  async function sendMessage(override?: string) {
    const text = (override ?? input).trim();
    if (!text || !activeThread || isSending) return;

    setError(null);
    setInput("");

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const nextMessages = [...activeThread.messages, userMessage];
    const nextThread: ChatThread = {
      ...activeThread,
      title: activeThread.messages.length === 0 ? text.slice(0, 44) : activeThread.title,
      messages: nextMessages,
    };
    replaceThread(nextThread);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const payload = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !payload.reply) {
        throw new Error(payload.error || "StreamVista AI could not answer right now.");
      }

      replaceThread({
        ...nextThread,
        messages: [
          ...nextMessages,
          { id: crypto.randomUUID(), role: "assistant", content: payload.reply },
        ],
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "StreamVista AI could not answer right now.");
    } finally {
      setIsSending(false);
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendMessage();
  }

  const messages = activeThread?.messages ?? [];

  return (
    <main className="flex h-[100dvh] overflow-hidden bg-[#09090b] text-zinc-100">
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/65 md:hidden"
          aria-label="Close conversation history"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[286px] flex-col border-r border-white/10 bg-[#111113] transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <a href="https://www.streamvista.in" className="flex items-center gap-2.5 font-black tracking-[-0.04em]">
            <span className="h-7 w-7 rounded-full bg-[radial-gradient(circle_at_30%_25%,#ff8b49,#8757e7_46%,#25103e_78%)]" />
            STREAMVISTA AI
          </a>
          <button className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={createConversation}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm font-semibold transition hover:bg-white/[0.08]"
          >
            <MessageSquarePlus size={17} /> New chat
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Recent</p>
          <div className="space-y-1">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`group flex items-center rounded-xl ${thread.id === activeId ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"}`}
              >
                <button
                  className="min-w-0 flex-1 truncate px-3 py-2.5 text-left text-sm text-zinc-300"
                  onClick={() => {
                    setActiveId(thread.id);
                    setSidebarOpen(false);
                  }}
                >
                  {thread.title}
                </button>
                <button
                  aria-label="Delete conversation"
                  className="mr-1 rounded-lg p-2 text-zinc-600 opacity-0 transition hover:text-zinc-300 group-hover:opacity-100"
                  onClick={() => deleteConversation(thread.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 p-4 text-xs leading-5 text-zinc-600">
          Public guidance. Verify important business, legal and commercial decisions before acting.
        </div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_50%_-20%,rgba(124,58,237,.16),transparent_34%),#09090b]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.07] px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <p className="text-sm font-semibold">StreamVista AI</p>
              <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online
              </p>
            </div>
          </div>
          <a
            href="https://www.streamvista.in"
            className="rounded-full border border-white/10 px-3.5 py-2 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            Main site
          </a>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 pb-36 pt-8 sm:px-6">
            {messages.length === 0 ? (
              <div className="my-auto flex flex-col items-center py-12 text-center">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300 shadow-[0_0_45px_rgba(139,92,246,.14)]">
                  <Sparkles size={26} />
                </div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Start here</p>
                <h1 className="max-w-xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">What can we move for you?</h1>
                <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-500 sm:text-base">
                  Tell StreamVista AI what you need. Get clear guidance for content, licensing, studio services and partnerships.
                </p>
                <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-left text-sm text-zinc-300 transition hover:border-violet-400/30 hover:bg-violet-500/[0.08] hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-7 py-3">
                {messages.map((message) => (
                  <article key={message.id} className={`flex gap-3.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-300">
                        <Bot size={16} />
                      </div>
                    )}
                    <div
                      className={`max-w-[86%] whitespace-pre-wrap text-[15px] leading-7 sm:max-w-[78%] ${
                        message.role === "user"
                          ? "rounded-3xl rounded-br-lg bg-[#25252a] px-4 py-2.5 text-zinc-100"
                          : "py-1 text-zinc-200"
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.role === "user" && (
                      <div className="mt-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-zinc-400 sm:flex">
                        <UserRound size={15} />
                      </div>
                    )}
                  </article>
                ))}
                {isSending && (
                  <div className="flex items-center gap-3.5 text-zinc-500">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/15 text-violet-300">
                      <Bot size={16} />
                    </div>
                    <div className="flex gap-1 py-2" aria-label="StreamVista AI is typing">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500"
                          style={{ animationDelay: `${dot * 120}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent px-4 pb-4 pt-12 sm:px-6">
          <div className="pointer-events-auto mx-auto max-w-3xl">
            {error && (
              <div className="mb-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3.5 py-2 text-xs text-red-300">{error}</div>
            )}
            <form
              onSubmit={onSubmit}
              className="flex items-end gap-2 rounded-[26px] border border-white/10 bg-[#18181b] p-2 shadow-2xl shadow-black/30 transition focus-within:border-violet-400/35"
            >
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                rows={1}
                maxLength={4000}
                placeholder="Message StreamVista AI…"
                className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 text-white outline-none placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-zinc-700">AI can make mistakes. Verify important information.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
