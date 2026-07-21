"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageGroup, MessageContent } from "@/components/ui/message";
import { useChatSSE } from "./use-chat-sse";

interface StoredChat {
  conversationId: string;
  token: string;
  patientName: string;
  patientEmail?: string;
}

interface ChatWidgetProps {
  slug: string;
  rutEmpresa: string;
  brandPrimary: string;
  brandPrimaryLight: string;
}

interface MessageItem {
  id: string;
  sender: string;
  content: string;
  sender_name?: string;
  created_at: string;
}

const LS_KEY = "uapp_chat_session";

function getStored(): StoredChat | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as StoredChat) : null;
  } catch {
    return null;
  }
}

function setStored(data: StoredChat) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function clearStored() {
  localStorage.removeItem(LS_KEY);
}

export function ChatWidget({ slug, rutEmpresa, brandPrimary, brandPrimaryLight }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"start" | "chat">("start");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatToken, setChatToken] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [closed, setClosed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    const stored = getStored();
    if (stored) {
      setConversationId(stored.conversationId);
      setChatToken(stored.token);
      setPatientName(stored.patientName);
      setStep("chat");
      loadMessages(stored.conversationId, stored.token);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadMessages = async (convId: string, tok: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages?token=${tok}`);
      const json = await res.json();
      if (json.data) {
        setMessages(json.data);
      }
    } catch {
      // silent
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (!getStored()) {
      setStep("start");
    }
  };

  const handleStart = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: name.trim(), email: email.trim() || undefined, rut_empresa: rutEmpresa }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Error al iniciar chat");
        return;
      }
      setConversationId(json.id);
      setChatToken(json.token);
      setPatientName(name.trim());
      setStored({ conversationId: json.id, token: json.token, patientName: name.trim(), patientEmail: email.trim() || undefined });
      setStep("chat");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useChatSSE(
    conversationId,
    chatToken,
    useCallback((msg) => {
      setMessages((prev) => [...prev, msg]);
    }, []),
    useCallback(() => {
      setClosed(true);
    }, []),
  );

  const handleSend = async () => {
    if (!inputText.trim() || !conversationId || !chatToken || sending) return;
    setSending(true);
    const text = inputText.trim();
    setInputText("");
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          content: text,
          sender: "patient",
          token: chatToken,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { ...json, sender: "patient" }]);
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCloseChat = () => {
    setOpen(false);
  };

  const handleEndConversation = () => {
    clearStored();
    setConversationId(null);
    setChatToken(null);
    setMessages([]);
    setClosed(false);
    setStep("start");
    setName("");
    setEmail("");
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
        style={{ backgroundColor: brandPrimary }}
        aria-label="Abrir chat"
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
      style={{ width: "360px", height: "520px", backgroundColor: "white" }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 text-white shrink-0"
        style={{ backgroundColor: brandPrimary }}
      >
        <span className="font-semibold text-sm">Chat {slug === "renacimiento" ? "Renacimiento" : slug}</span>
        <button onClick={handleCloseChat} className="text-white/80 hover:text-white cursor-pointer">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {step === "start" && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: brandPrimaryLight }}
            >
              <MessageCircle className="h-6 w-6" style={{ color: brandPrimary }} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">¡Hola! ¿En qué podemos ayudarte?</h3>
            <p className="text-sm text-gray-500 mb-4">Déjanos tus datos para iniciar la conversación</p>
            <input
              type="text"
              placeholder="Tu nombre *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
            />
            <input
              type="email"
              placeholder="Tu correo (opcional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
            />
            {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
            <Button
              onClick={handleStart}
              disabled={loading || !name.trim()}
              className="w-full text-white"
              style={{ backgroundColor: brandPrimary }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Iniciar Conversación"}
            </Button>
          </div>
        )}

        {step === "chat" && (
          <>
            {closed && (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-3">Esta conversación ha sido cerrada.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEndConversation}
                >
                  Nueva Conversación
                </Button>
              </div>
            )}

            {!closed && messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-400">Conectando con un agente...</p>
              </div>
            )}

            <MessageGroup>
              {messages.map((msg) => (
                <Message key={msg.id} align={msg.sender === "patient" ? "end" : "start"}>
                  <MessageContent>
                    {msg.sender === "staff" && msg.sender_name && (
                      <p className="text-[10px] text-gray-500 font-medium px-1 mb-0.5">{msg.sender_name}</p>
                    )}
                    <Bubble variant={msg.sender === "patient" ? "default" : "secondary"}>
                      <BubbleContent>{msg.content}</BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              ))}
            </MessageGroup>
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {step === "chat" && !closed && (
        <div className="border-t px-4 py-3 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Escribe tu mensaje..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
            disabled={sending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="text-white shrink-0"
            style={{ backgroundColor: brandPrimary }}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
