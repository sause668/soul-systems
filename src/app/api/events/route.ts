import { soulEventBus } from "@/lib/sse/event-bus";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | undefined;
  let heartbeat: NodeJS.Timeout | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: "connected", at: Date.now() });
      unsubscribe = soulEventBus.subscribe((event) => send(event));
      heartbeat = setInterval(() => {
        send({ type: "heartbeat", at: Date.now() });
      }, 25000);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
