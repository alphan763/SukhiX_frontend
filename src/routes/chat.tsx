import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Camera, Mic, Send, Stethoscope } from "lucide-react";
import { PhoneShell } from "@/components/nirogx/phone-shell";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/services/api";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Assistant | NirogX" },
      {
        name: "description",
        content:
          "Chat with the NirogX AI assistant to understand blood reports, lab values and next clinical steps.",
      },
      { property: "og:title", content: "AI Assistant | NirogX" },
      {
        property: "og:description",
        content: "Ask the NirogX clinical AI assistant about your reports, symptoms and vitals.",
      },
    ],
  }),
  component: ChatScreen,
});

type Msg = { id: number; role: "ai" | "user"; text: string; time: string };

const initial: Msg[] = [
  {
    id: 1,
    role: "ai",
    text: "I've finished reading your blood report from 14 Aug. Overall it looks reassuring — 9 of 11 markers are inside reference range.",
    time: "19:42",
  },
];

const STORAGE_KEY = "nirogx_chat_history";

function ChatScreen() {
  // FIX: Safely check for 'window' before reading from localStorage
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    }
    return initial;
  });

  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // FIX: Safely check for 'window' before writing to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error("Failed to save chat history", e);
      }
    }
  }, [messages]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const send = async () => {
    const text = draft.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = {
      id: Date.now(),
      role: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    setIsLoading(true);

    try {
      // Load real health data from localStorage
      let storedSymptoms: string[] = [];
      let storedVitals: Record<string, any> = {};
      if (typeof window !== "undefined") {
        try {
          const symptomsRaw = localStorage.getItem("nirogx_logged_symptoms");
          storedSymptoms = symptomsRaw ? JSON.parse(symptomsRaw) : [];
        } catch {}
        try {
          const vitalsRaw = localStorage.getItem("nirogx_user_vitals");
          storedVitals = vitalsRaw ? JSON.parse(vitalsRaw) : {};
        } catch {}
      }

      const currentHealthData = {
        heart_rate: storedVitals.heart_rate ?? null,
        blood_pressure_systolic: storedVitals.blood_pressure_systolic ?? null,
        blood_pressure_diastolic: storedVitals.blood_pressure_diastolic ?? null,
        daily_steps: storedVitals.daily_steps ?? null,
        symptoms: storedSymptoms,
      };

      const response = await sendChatMessage({
        message: text,
        health_context: currentHealthData,
      });

      const aiMsg: Msg = {
        id: Date.now() + 1,
        role: "ai",
        text: response.response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((m) => [...m, aiMsg]);

    } catch (error) {
      const errorMsg: Msg = {
        id: Date.now() + 1,
        role: "ai",
        text: "I'm having trouble connecting to the server. Please check your connection and try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PhoneShell>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-border bg-card px-5 pb-4 pt-8">
          <div className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <Stethoscope className="size-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">NirogX AI Assistant</h1>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Clinical model online
            </p>
          </div>
        </header>

        <div 
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto no-scrollbar px-4 py-5 scroll-smooth"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-accent text-foreground",
                )}
              >
                <p>{m.text}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    m.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {m.time}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-accent px-4 py-3.5 text-sm flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" />
                <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }} />
                <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card px-4 py-3">
          <div className="flex items-end gap-2">
            <button
              className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-primary"
              aria-label="Upload a report"
            >
              <Camera className="size-4.5" />
            </button>
            <button
              className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-primary"
              aria-label="Record a voice note"
            >
              <Mic className="size-4.5" />
            </button>
            <textarea
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about your report..."
              aria-label="Message"
              disabled={isLoading}
              className="max-h-24 min-h-10 flex-1 resize-none rounded-2xl border border-input bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={!draft.trim() || isLoading}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="size-4.5" />
            </button>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}