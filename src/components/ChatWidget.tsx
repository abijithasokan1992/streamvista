import { FormEvent, useMemo, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sendChatMessages, type AIMessage } from "../services/ai";

const NAVIGATION_PATTERN = /\[NAVIGATE:(\/[^\]]*)\]/;

export function ChatWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: "assistant", content: "StreamVista Founder OS ready. Ask me to open titles, drafts, screenings, finance, analytics or another workspace area." },
  ]);

  const visibleMessages = useMemo(
    () => messages.map((message) => ({ ...message, content: message.content.replace(NAVIGATION_PATTERN, "").trim() })),
    [messages],
  );

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const userMessage: AIMessage = { role: "user", content: text };
    const nextMessages: AIMessage[] = [...messages, userMessage].slice(-6);
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const reply = await sendChatMessages(nextMessages);
      const assistantMessage: AIMessage = { role: "assistant", content: reply };
      setMessages((current) => [...current, assistantMessage].slice(-6));
      const match = reply.match(NAVIGATION_PATTERN);
      if (match?.[1]) {
        navigate(match[1]);
        setOpen(false);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "StreamVista AI could not answer right now.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white shadow-2xl transition hover:-translate-y-0.5"
      >
        <Bot size={17} /> Ask StreamVista AI
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/25" onClick={() => setOpen(false)}>
          <aside
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[#0A0A0A] text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-sm font-bold">StreamVista Founder OS</p>
                <p className="text-xs text-zinc-500">21 Titles · 139 Drafts · 34 Screenings</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-white/5" aria-label="Close AI chat">
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {visibleMessages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-[85%] rounded-2xl bg-white px-4 py-3 text-sm text-black" : "max-w-[92%] text-sm leading-6 text-zinc-200"}>
                  {message.content}
                </div>
              ))}
              {sending && <p className="text-sm text-zinc-500">Thinking…</p>}
              {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
            </div>

            <form onSubmit={submit} className="border-t border-white/10 p-4">
              <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void submit();
                    }
                  }}
                  rows={1}
                  placeholder="Ask StreamVista AI…"
                  className="min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-zinc-600"
                />
                <button type="submit" disabled={!input.trim() || sending} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black disabled:bg-zinc-800 disabled:text-zinc-600" aria-label="Send message">
                  <Send size={16} />
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}
