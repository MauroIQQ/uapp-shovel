"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Send, Loader2, MessageCircle, X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageGroup, MessageContent } from "@/components/ui/message";

interface ConversationItem {
  id: string;
  paciente_nombre: string;
  paciente_email: string | null;
  status: string;
  unread_messages: number;
  last_message: string | null;
  last_message_at: string;
  created_at: string;
}

interface MessageItem {
  id: string;
  sender: string;
  content: string;
  created_at: string;
}

export default function MensajesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMsgTimeRef = useRef<string>(new Date().toISOString());

  const activeConv = conversations.find((c) => c.id === activeId);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    pollRef.current = interval;
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/chat/conversations?status=open");
      const json = await res.json();
      if (json.data) {
        setConversations(json.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`);
      const json = await res.json();
      if (json.data) {
        setMessages(json.data);
        const last = json.data[json.data.length - 1];
        if (last) lastMsgTimeRef.current = last.created_at;
      }
    } catch {
      // silent
    }
  };

  const selectConversation = (id: string) => {
    setActiveId(id);
    setShowMobileList(false);
    loadMessages(id);
    markRead(id);
  };

  const markRead = async (convId: string) => {
    try {
      await fetch(`/api/chat/conversations/${convId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_read: true }),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread_messages: 0 } : c)),
      );
    } catch {
      // silent
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !activeId || sending) return;
    setSending(true);
    const text = inputText.trim();
    setInputText("");
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: activeId,
          content: text,
          sender: "staff",
        }),
      });
      const json = await res.json();
      if (res.ok) {
        const msg = { ...json, sender: "staff" as const };
        setMessages((prev) => [...prev, msg]);
        lastMsgTimeRef.current = json.created_at;
        loadConversations();
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!activeId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/conversations/${activeId}/messages?since=${lastMsgTimeRef.current}`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setMessages((prev) => [...prev, ...json.data]);
          lastMsgTimeRef.current = json.data[json.data.length - 1].created_at;
          loadConversations();
          scrollToBottom();
        }
      } catch {
        // silent
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeId, scrollToBottom]);

  const handleCloseConv = async () => {
    if (!activeId) return;
    try {
      await fetch(`/api/chat/conversations/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      setActiveId(null);
      setMessages([]);
      loadConversations();
    } catch {
      // silent
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border bg-card">
      {loading ? (
        <div className="flex items-center justify-center w-full">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className={`${showMobileList ? "flex" : "hidden"} md:flex w-full md:w-80 shrink-0 flex-col border-r`}>
            <div className="border-b px-4 py-3 font-semibold text-sm flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Conversaciones
              <Badge variant="secondary" className="ml-auto text-xs">
                {conversations.length}
              </Badge>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No hay conversaciones activas</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors cursor-pointer ${activeId === conv.id ? "bg-muted" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate">{conv.paciente_nombre}</span>
                      {conv.unread_messages > 0 && (
                        <Badge className="text-xs h-5 min-w-5 flex items-center justify-center">
                          {conv.unread_messages}
                        </Badge>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {new Date(conv.last_message_at).toLocaleString("es-CL")}
                    </p>
                  </button>
                ))
              )}
            </div>
            <div className="border-t p-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  fetch("/api/chat/conversations?status=closed").then(async (r) => {
                    const json = await r.json();
                    if (json.data) {
                      setConversations((prev) => {
                        const openIds = new Set(prev.map((c) => c.id));
                        const closed = json.data.filter((c: ConversationItem) => !openIds.has(c.id));
                        return [...prev, ...closed];
                      });
                    }
                  });
                }}
              >
                Ver conversaciones cerradas
              </Button>
            </div>
          </div>

          <div className={`${!showMobileList ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0`}>
            {!activeConv ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <MessageCircle className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-sm text-muted-foreground">Selecciona una conversación</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden shrink-0"
                      onClick={() => { setShowMobileList(true); setActiveId(null); }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{activeConv.paciente_nombre}</p>
                      {activeConv.paciente_email && (
                        <p className="text-xs text-muted-foreground truncate">{activeConv.paciente_email}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs shrink-0"
                    onClick={handleCloseConv}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cerrar
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">Esperando mensaje del paciente...</p>
                    </div>
                  ) : (
                    <MessageGroup>
                      {messages.map((msg) => (
                        <Message key={msg.id} align={msg.sender === "staff" ? "end" : "start"}>
                          <MessageContent>
                            <Bubble variant={msg.sender === "staff" ? "default" : "secondary"}>
                              <BubbleContent>{msg.content}</BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      ))}
                    </MessageGroup>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t px-4 py-3 flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder="Escribe tu respuesta..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={sending}
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!inputText.trim() || sending}
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
