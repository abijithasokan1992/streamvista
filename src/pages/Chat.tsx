import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Clapperboard,
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
  "I have a film ready to license",
  "I need content for my OTT platform",
  "How does StreamVista QC and legal work?",
  "I want to partner as a creator or studio",
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
    <main className="flex h-[100dvh] overflow-hidden bg-[#05050a] text-zinc-100">
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/70 md:hidden"
          aria-label="Close conversation history"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[300px] flex-col border-r border-white/10 bg-[#0c0c12] transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <a href="https://www.streamvista.in" className="flex items-center gap-2.5 font-black tracking-[-0.04em]">
            <span className="h-7 w-7 rounded-full bg-[radial-gradient(circle_at_30%_25%,#ff8b49,#8757e7_46%,#25103e_78%)] shadow-[0_0_24px_rgba(135,87,231,.35)]" />
            STREAMVISTA
          </a>
          <button className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={createConversation}
            className="flex w-full items-center gap-3 rounded-xl border border-violet-400/20 bg-violet-500/10 px-3.5 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/20"
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
          Media guidance only. Rights, deals and approvals stay human-verified in StreamVista workspaces.
        </div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col bg-[radial-gradient(ellipse_at_50%_-10%,rgba(124,58,237,.22),transparent_42%),radial-gradient(ellipse_at_90%_10%,rgba(255,122,60,.08),transparent_28%),#05050a]">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.07] px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                <Clapperboard size={15} className="text-violet-300" />
                StreamVista · Media OS
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]" /> Online guidance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="rounded-full border border-white/10 px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Sign in
            </a>
            <a
              href="https://www.streamvista.in"
              className="hidden rounded-full border border-white/10 px-3.5 py-2 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white sm:inline-flex"
            >
              Main site
            </a>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 pb-36 pt-8 sm:px-6">
            {messages.length === 0 ? (
              <div className="my-auto flex flex-col items-center py-12 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-500/10 text-violet-200 shadow-[0_0_60px_rgba(139,92,246,.25)]">
                  <Sparkles size={28} />
                </div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">Content · Rights · Reach</p>
                <h1 className="max-w-xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">What should we move next?</h1>
                <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-500 sm:text-base">
                  Licensing, distribution, studio services and partnerships — clear guidance for creators, buyers and platforms.
                </p>
                <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-left text-sm text-zinc-300 transition hover:border-violet-400/35 hover:bg-violet-500/[0.1] hover:text-white"
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
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20">
                        <Bot size={16} />
                      </div>
                    )}
                    <div
                      className={`max-w-[86%] whitespace-pre-wrap text-[15px] leading-7 sm:max-w-[78%] ${
                        message.role === "user"
                          ? "rounded-3xl rounded-br-lg bg-[#1c1c24] px-4 py-2.5 text-zinc-100 ring-1 ring-white/5"
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

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/90 to-transparent px-4 pb-4 pt-12 sm:px-6">
          <div className="pointer-events-auto mx-auto max-w-3xl">
            {error && (
              <div className="mb-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3.5 py-2 text-xs text-red-300">{error}</div>
            )}
            <form
              onSubmit={onSubmit}
              className="flex items-end gap-2 rounded-[26px] border border-white/10 bg-[#12121a] p-2 shadow-2xl shadow-black/40 ring-1 ring-violet-500/10 transition focus-within:border-violet-400/40 focus-within:ring-violet-400/20"
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
                placeholder="Message StreamVista Media OS…"
                className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-6 text-white outline-none placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-orange-400 text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500"
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-zinc-600">
              AI can make mistakes. Verify rights, contracts and commercial terms in your workspace.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
