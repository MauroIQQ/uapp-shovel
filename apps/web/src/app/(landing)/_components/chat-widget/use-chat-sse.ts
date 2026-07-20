"use client";

import { useEffect, useRef, useCallback } from "react";

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  created_at: string;
}

export function useChatSSE(
  conversationId: string | null,
  token: string | null,
  onMessage: (msg: ChatMessage) => void,
  onClosed?: () => void,
) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const onMessageRef = useRef(onMessage);
  const onClosedRef = useRef(onClosed);

  onMessageRef.current = onMessage;
  onClosedRef.current = onClosed;

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!conversationId || !token) return;

    const es = new EventSource(`/api/chat/conversations/${conversationId}/stream?token=${token}`);
    eventSourceRef.current = es;

    es.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data) as ChatMessage;
        onMessageRef.current(data);
      } catch {
        // ignore malformed
      }
    });

    es.addEventListener("closed", () => {
      onClosedRef.current?.();
      es.close();
    });

    es.addEventListener("error", () => {
      es.close();
    });

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [conversationId, token]);

  return { disconnect };
}
