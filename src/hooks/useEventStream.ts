"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export type SSEStatus = "connecting" | "connected" | "disconnected" | "error";

export interface SSEEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

interface UseEventStreamOptions {
  onEvent?: (event: SSEEvent) => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

export function useEventStream(options: UseEventStreamOptions = {}) {
  const { onEvent, autoReconnect = true, maxReconnectAttempts = 10 } = options;

  const [status, setStatus] = useState<SSEStatus>("disconnected");
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus("connecting");
    const es = new EventSource("/api/events");

    es.onopen = () => {
      setStatus("connected");
      reconnectAttempts.current = 0;
    };

    es.addEventListener("connected", (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      const event: SSEEvent = { type: "connected", data, timestamp: data.timestamp };
      setLastEvent(event);
      onEvent?.(event);
    });

    es.onmessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        const event: SSEEvent = { type: e.type || "message", data, timestamp: data.timestamp || new Date().toISOString() };
        setLastEvent(event);
        onEvent?.(event);
      } catch {
        // Ignore parse errors for keepalive comments
      }
    };

    es.onerror = () => {
      es.close();
      setStatus("error");

      if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectTimer.current = setTimeout(() => {
          connect();
        }, delay);
      } else {
        setStatus("disconnected");
      }
    };

    eventSourceRef.current = es;
  }, [onEvent, autoReconnect, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { status, lastEvent, reconnect: connect, disconnect };
}
