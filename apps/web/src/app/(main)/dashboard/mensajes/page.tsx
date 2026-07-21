"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AlarmClock,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  Ellipsis,
  FileText,
  Info,
  Link,
  Loader2,
  Mail,
  MessageCircle,
  Paperclip,
  Phone,
  PhoneCall,
  Search,
  Send,
  Smile,
  Sparkles,
  Tag,
  Type,
  User,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/lib/auth-context";
import {
  formatDateSeparator,
  formatMessageTime,
  formatRelativeTime,
  getInitials,
  shouldShowDateSeparator,
} from "./format-time";

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
  type?: string;
  created_at: string;
}

function getTimeGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return "Hoy";
  if (msgDate.getTime() === yesterday.getTime()) return "Ayer";
  return date.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}

export default function MensajesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [inputTab, setInputTab] = useState<"reply" | "note">("reply");

  const { user } = useAuth();
  const staffName = user ? `${user.nombre} ${user.paterno}` : "Staff";
  const staffInitials = user ? getInitials(`${user.nombre} ${user.paterno}`) : "OP";

  const lastMsgTimeRef = useRef<string>(new Date().toISOString());
  const loadMsgAbortRef = useRef<AbortController | null>(null);
  const loadMsgIdRef = useRef<string | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const activeConv = conversations.find((c) => c.id === activeId);

  const timeGroups = useMemo(() => {
    const groups: Record<string, ConversationItem[]> = {};
    for (const conv of conversations) {
      const group = getTimeGroup(conv.last_message_at);
      if (!groups[group]) groups[group] = [];
      groups[group].push(conv);
    }
    const ordered: { label: string; items: ConversationItem[] }[] = [];
    const priority = ["Hoy", "Ayer"];
    for (const p of priority) {
      if (groups[p]) {
        ordered.push({ label: p, items: groups[p] });
        delete groups[p];
      }
    }
    for (const [label, items] of Object.entries(groups)) {
      ordered.push({ label, items });
    }
    return ordered;
  }, [conversations]);

  const _scrollToEnd = useCallback(() => {
    const btn = document.querySelector<HTMLButtonElement>("[data-slot='message-scroller-button']");
    btn?.click();
  }, []);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/chat/conversations?status=open");
      const json = await res.json();
      if (!json.data) return;
      const currentActive = activeIdRef.current;
      setConversations((prev) => {
        const openIds = new Set(json.data.map((c: ConversationItem) => c.id));
        const keptClosed = prev.filter((c) => !openIds.has(c.id) && c.status === "closed");
        const merged = [...json.data, ...keptClosed];
        if (currentActive && !merged.some((c) => c.id === currentActive)) {
          const active = prev.find((c) => c.id === currentActive);
          if (active) merged.push(active);
        }
        const seen = new Set<string>();
        return merged.filter((c) => {
          if (seen.has(c.id)) return false;
          seen.add(c.id);
          return true;
        });
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async (convId: string) => {
    if (loadMsgAbortRef.current) loadMsgAbortRef.current.abort();
    const controller = new AbortController();
    loadMsgAbortRef.current = controller;
    loadMsgIdRef.current = convId;
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`, { signal: controller.signal });
      if (!res.ok) return;
      const json = await res.json();
      if (loadMsgIdRef.current !== convId) return;
      if (json.data) {
        setMessages(json.data);
        const last = json.data[json.data.length - 1];
        if (last) lastMsgTimeRef.current = last.created_at;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
  };

  const loadClosed = async () => {
    try {
      const res = await fetch("/api/chat/conversations?status=closed");
      const json = await res.json();
      if (json.data) {
        setConversations((prev) => {
          const ids = new Set(prev.map((c) => c.id));
          const merged = [...prev, ...json.data.filter((c: ConversationItem) => !ids.has(c.id))];
          const seen = new Set<string>();
          return merged.filter((c) => {
            if (seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
          });
        });
      }
    } catch {
      // silent
    }
  };

  const selectConversation = (id: string) => {
    if (activeId === id) return;
    setActiveId(id);
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
      setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, unread_messages: 0 } : c)));
    } catch {
      // silent
    }
  };

  const handleSend = async (msgType = "message") => {
    if (!inputText.trim() || !activeId || sending) return;
    setSending(true);
    const text = inputText.trim();
    setInputText("");
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: activeId, content: text, sender: "staff", type: msgType, sender_name: staffName }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { ...json, sender: "staff" }]);
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
        }
      } catch {
        // silent
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeId]);

  const handleClose = async () => {
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
      handleSend(inputTab === "note" ? "internal_note" : "message");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-xl border bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border bg-card">
      <div className="hidden w-56 shrink-0 flex-col border-r md:flex">
        <div className="flex items-center gap-2 border-b px-3 py-3">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold text-sm">Mensajes</span>
        </div>
        <ScrollArea className="flex-1 px-2 py-2">
          <div className="space-y-4">
            <div className="space-y-0.5">
              <NavItem
                icon={MessageCircle}
                label="Bandeja de entrada"
                badge={conversations.filter((c) => c.status === "open").length.toString()}
                active
              />
              <NavItem icon={User} label="Menciones" badge="0" />
              <NavItem icon={Send} label="Enviados" />
              <NavItem icon={MessageCircle} label="Todas" />
              <NavItem icon={User} label="Sin asignar" badge="0" />
            </div>
            <Separator />
            <div>
              <p className="mb-1 px-2 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                Canales
              </p>
              <div className="space-y-0.5">
                <NavItem
                  icon={Mail}
                  label="Email"
                  badge={conversations.filter((c) => c.status === "open").length.toString()}
                />
                <NavItem
                  icon={MessageCircle}
                  label="Chat"
                  badge={conversations.filter((c) => c.status === "open").length.toString()}
                  active
                />
              </div>
            </div>
            <Separator />
            <div>
              <p className="mb-1 px-2 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Vistas</p>
              <div className="space-y-0.5">
                <NavItem icon={FileText} label="Historial" />
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={loadClosed}>
              Cargar cerradas
            </Button>
          </div>
        </ScrollArea>
        <div className="border-t p-3">
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarFallback className="font-medium text-[10px]">{staffInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-xs">{staffName}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user?.correo ?? ""}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col border-r md:w-80 lg:w-96">
        <div className="border-b px-3 py-2.5">
          <h2 className="font-semibold text-sm">Bandeja de entrada</h2>
          <div className="relative mt-2">
            <Search className="absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 w-full rounded-md border border-input bg-background pr-2 pl-7 text-xs outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {timeGroups.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
              <MessageCircle className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">No hay conversaciones</p>
            </div>
          ) : (
            timeGroups.map((group) => (
              <Collapsible key={group.label} defaultOpen className="px-2">
                <CollapsibleTrigger className="flex w-full items-center gap-1 px-2 py-2 font-medium text-[10px] text-muted-foreground uppercase tracking-wider hover:text-foreground [&[data-state=open]>svg]:rotate-0">
                  <ChevronDown className="h-3 w-3 -rotate-90 transition-transform" />
                  {group.label}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {group.items.map((conv) => {
                    const isActive = activeId === conv.id;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv.id)}
                        className={`w-full rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-muted/75 ${
                          isActive ? "bg-muted ring-1 ring-border" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <Avatar size="default" className="mt-0.5 shrink-0">
                            <AvatarFallback className="font-medium text-[10px]">
                              {getInitials(conv.paciente_nombre)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate font-medium text-sm leading-5">{conv.paciente_nombre}</span>
                              <span className="shrink-0 text-[10px] text-muted-foreground leading-5">
                                {formatRelativeTime(conv.last_message_at)}
                              </span>
                            </div>
                            <div className="flex items-end gap-2">
                              <div className="min-w-0 flex-1 overflow-hidden">
                                <p className="truncate font-medium text-[11px] text-foreground/90 leading-4">
                                  {conv.last_message || "Sin mensajes"}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-1">
                                {conv.unread_messages > 0 && (
                                  <div className="grid size-5 place-items-center rounded-full bg-primary/90 text-[10px] text-primary-foreground">
                                    {conv.unread_messages}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </ScrollArea>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {!activeConv ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground/20" />
            <p className="text-muted-foreground text-sm">Selecciona una conversación</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 border-b px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={() => setActiveId(null)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Avatar size="default" className="shrink-0">
                  <AvatarFallback className="font-medium text-xs">
                    {getInitials(activeConv.paciente_nombre)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{activeConv.paciente_nombre}</p>
                  {activeConv.paciente_email && (
                    <p className="truncate text-[10px] text-muted-foreground leading-3">{activeConv.paciente_email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Llamar"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Etiquetar"
                >
                  <Tag className="h-4 w-4" />
                </button>
                <button
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Posponer"
                >
                  <AlarmClock className="h-4 w-4" />
                </button>
                <button
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setShowProfile(!showProfile)}
                  aria-label="Información"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </div>

            <MessageScrollerProvider>
              <MessageScroller className="min-h-0 flex-1">
                <MessageScrollerViewport>
                  <MessageScrollerContent>
                    <div className="flex flex-col justify-end gap-6 px-2 py-8">
                      {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-muted-foreground text-sm">Esperando mensaje del paciente...</p>
                        </div>
                      ) : (
                        messages.map((msg, idx) => {
                          const prevMsg = idx > 0 ? messages[idx - 1] : undefined;
                          const showDateSep = shouldShowDateSeparator(msg.created_at, prevMsg?.created_at);
                          const isStaff = msg.sender === "staff";
                          const isNote = msg.type === "internal_note";
                          return (
                            <div key={msg.id}>
                              {showDateSep && (
                                <div
                                  data-slot="marker"
                                  data-variant="separator"
                                  className="group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-muted-foreground text-sm before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-border"
                                >
                                  <span className="min-w-0 flex-none text-center text-xs">
                                    {formatDateSeparator(msg.created_at)}
                                  </span>
                                </div>
                              )}
                              <MessageScrollerItem scrollAnchor={idx === messages.length - 1}>
                                <div
                                  data-slot="message"
                                  data-align={isStaff ? "end" : "start"}
                                  className={`group/message relative flex w-full min-w-0 gap-2 text-sm ${isStaff ? "flex-row-reverse" : ""}`}
                                >
                                  <div
                                    data-slot="message-avatar"
                                    className="flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted"
                                  >
                                    {isStaff ? (
                                      <Avatar size="default">
                                        <AvatarFallback className={`font-medium text-[10px] text-primary-foreground ${isNote ? "bg-amber-600 dark:bg-amber-700" : "bg-primary"}`}>
                                          {isNote ? <FileText className="h-3.5 w-3.5" /> : staffInitials}
                                        </AvatarFallback>
                                      </Avatar>
                                    ) : (
                                      <Avatar size="default">
                                        <AvatarFallback className="font-medium text-[10px]">
                                          {getInitials(activeConv.paciente_nombre)}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                  </div>
                                  <div
                                    data-slot="message-content"
                                    className="wrap-break-word flex w-full min-w-0 flex-col gap-2.5 group-data-[align=end]/message:*:data-slot:self-end"
                                  >
                                    <div data-slot="bubble-group" className="flex min-w-0 flex-col gap-2">
                                      <div
                                        data-slot="bubble"
                                        data-variant={isStaff ? "default" : "secondary"}
                                        data-align={isStaff ? "end" : "start"}
                                        className={`group/bubble relative flex w-fit min-w-0 max-w-[80%] flex-col gap-1 data-[align=end]:self-end group-data-[align=end]/message:self-end ${
                                          isNote
                                            ? "*:data-[slot=bubble-content]:bg-amber-50 dark:*:data-[slot=bubble-content]:bg-amber-950 *:data-[slot=bubble-content]:text-amber-900 dark:*:data-[slot=bubble-content]:text-amber-100 *:data-[slot=bubble-content]:border-amber-200 dark:*:data-[slot=bubble-content]:border-amber-800"
                                            : isStaff
                                              ? "*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground"
                                              : "*:data-[slot=bubble-content]:bg-secondary *:data-[slot=bubble-content]:text-secondary-foreground"
                                        }`}
                                      >
                                        <div
                                          data-slot="bubble-content"
                                          className="w-fit min-w-0 max-w-full overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed"
                                        >
                                          {isNote && (
                                            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                              <FileText className="h-3 w-3" />
                                              Nota interna
                                            </div>
                                          )}
                                          {msg.content}
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      data-slot="message-footer"
                                      className={`flex min-w-0 max-w-full items-center px-3 font-medium text-[10px] text-muted-foreground ${
                                        isStaff ? "justify-end" : ""
                                      }`}
                                    >
                                      {formatMessageTime(msg.created_at)}
                                      {isStaff && !isNote && <CheckCheck className="ml-1 h-3 w-3" />}
                                    </div>
                                  </div>
                                </div>
                              </MessageScrollerItem>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>

            <div className="px-2 pb-2">
              <Tabs
                value={inputTab}
                onValueChange={(v) => setInputTab(v as "reply" | "note")}
                className="rounded-md border"
              >
                <TabsList className="h-9 w-full justify-start gap-2 border-b bg-transparent px-3">
                  <TabsTrigger
                    value="reply"
                    className="px-1 text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Responder
                  </TabsTrigger>
                  <TabsTrigger
                    value="note"
                    className="px-1 text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Nota interna
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="reply" className="m-0">
                  <div className="flex flex-col gap-2 px-2 pb-2">
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {["Para continuar, necesito su RUT. ¿Me lo puede indicar?", "Gracias por confirmar", "Te contactaremos pronto"].map(
                        (text) => (
                          <button
                            key={text}
                            type="button"
                            onClick={() => setInputText(text)}
                            className="rounded-full border border-border bg-background px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {text}
                          </button>
                        ),
                      )}
                    </div>
                    <div className="relative flex min-h-10 items-start rounded-lg border border-input bg-background p-1 transition-colors focus-within:ring-2 focus-within:ring-ring">
                      <textarea
                        placeholder="Escribe tu mensaje..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="max-h-32 min-h-9 flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm outline-none"
                        rows={1}
                        disabled={sending || activeConv.status === "closed"}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        <button
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Formato"
                        >
                          <Type className="h-4 w-4" />
                        </button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label="Emoji"
                            >
                              <Smile className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="top" align="start" className="w-64 p-2">
                            <div className="grid grid-cols-5 gap-1">
                              {["😀","😂","😊","😍","🥳","👍","👏","🙏","❤️","🔥","✅","👋","🎉","💯","🤔","😅","🙌","💪","✨","🚀"].map((e) => (
                                <button
                                  key={e}
                                  type="button"
                                  onClick={() => setInputText((prev) => prev + e)}
                                  className="rounded-md p-2 text-lg transition-colors hover:bg-muted"
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <button
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Adjuntar"
                        >
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <button
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Link"
                        >
                          <Link className="h-4 w-4" />
                        </button>
                        <button
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="AI"
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>
                      </div>
                      <Button
                        size="icon"
                        onClick={() => handleSend(inputTab === "note" ? "internal_note" : "message")}
                        disabled={!inputText.trim() || sending || activeConv.status === "closed"}
                        className="size-7"
                      >
                        {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="note" className="m-0">
                  <div className="flex flex-col gap-2 px-2 pb-2">
                    <div className="relative flex min-h-10 items-start rounded-lg border border-input bg-background p-1 transition-colors focus-within:ring-2 focus-within:ring-ring">
                      <textarea
                        placeholder="Escribe una nota interna..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="max-h-32 min-h-9 flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-sm outline-none"
                        rows={1}
                        disabled={sending || activeConv.status === "closed"}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        <button
                          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Formato"
                        >
                          <Type className="h-4 w-4" />
                        </button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label="Emoji"
                            >
                              <Smile className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent side="top" align="start" className="w-64 p-2">
                            <div className="grid grid-cols-5 gap-1">
                              {["😀","😂","😊","😍","🥳","👍","👏","🙏","❤️","🔥","✅","👋","🎉","💯","🤔","😅","🙌","💪","✨","🚀"].map((e) => (
                                <button
                                  key={e}
                                  type="button"
                                  onClick={() => setInputText((prev) => prev + e)}
                                  className="rounded-md p-2 text-lg transition-colors hover:bg-muted"
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Button
                        size="icon"
                        onClick={() => handleSend("internal_note")}
                        disabled={!inputText.trim() || sending || activeConv.status === "closed"}
                        className="size-7"
                      >
                        {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>

      {showProfile && activeConv && (
        <div className="hidden w-72 shrink-0 flex-col border-l bg-card lg:flex">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="font-medium text-sm">Detalles</span>
            <Button variant="ghost" size="icon" onClick={() => setShowProfile(false)} className="size-7">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Tabs defaultValue="details" className="flex flex-1 flex-col">
            <TabsList className="h-8 w-full justify-between border-b bg-transparent px-3">
              <TabsTrigger value="details" className="px-1 text-xs">
                Detalles
              </TabsTrigger>
              <TabsTrigger value="files" className="px-1 text-xs">
                Archivos
              </TabsTrigger>
              <TabsTrigger value="activity" className="px-1 text-xs">
                Actividad
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="m-0 flex-1 overflow-y-auto">
              <div className="space-y-6 p-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Avatar size="lg">
                    <AvatarFallback className="font-medium text-lg">
                      {getInitials(activeConv.paciente_nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{activeConv.paciente_nombre}</p>
                    {activeConv.paciente_email && (
                      <p className="text-muted-foreground text-xs">{activeConv.paciente_email}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  <button
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Email"
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Llamar"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Calendario"
                  >
                    <AlarmClock className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Link"
                  >
                    <Link className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Más"
                  >
                    <Ellipsis className="h-3.5 w-3.5" />
                  </button>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={activeConv.status === "open" ? "default" : "secondary"} className="text-[10px]">
                      {activeConv.status === "open" ? "Activo" : "Cerrado"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">Email</span>
                    <span className="ml-auto truncate text-xs">{activeConv.paciente_email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">Teléfono</span>
                    <span className="ml-auto truncate text-xs">—</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">Mensajes</span>
                    <span className="ml-auto truncate text-xs">{messages.length}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">Iniciado</span>
                    <span className="ml-auto truncate text-xs">
                      {new Date(activeConv.created_at).toLocaleDateString("es-CL")}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={activeConv.status === "open" ? handleClose : undefined}
                  >
                    {activeConv.status === "open" ? "Cerrar Conversación" : "Reabrir Conversación"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="files" className="m-0 flex-1 overflow-y-auto p-4">
              <p className="py-8 text-center text-muted-foreground text-xs">Sin archivos adjuntos</p>
            </TabsContent>
            <TabsContent value="activity" className="m-0 flex-1 overflow-y-auto p-4">
              <p className="py-8 text-center text-muted-foreground text-xs">Sin actividad reciente</p>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  badge,
  active,
}: {
  icon: React.ElementType;
  label: string;
  badge?: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 truncate text-left">{label}</span>
      {badge && badge !== "0" && <span className="font-medium text-sidebar-foreground">{badge}</span>}
    </button>
  );
}
