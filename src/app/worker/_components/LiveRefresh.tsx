"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Subscribes to the in-process SSE bus and refreshes server-rendered data when workflow events fire. */
export function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const source = new EventSource("/api/events");
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as { type?: string };
        if (data.type === "heartbeat" || data.type === "connected") return;
        router.refresh();
      } catch {
        router.refresh();
      }
    };
    source.onerror = () => {
      source.close();
    };
    return () => source.close();
  }, [router]);

  return null;
}
