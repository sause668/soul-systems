export type SoulEvent =
  | { type: "process:updated"; jobId: number }
  | { type: "job:updated"; jobId: number }
  | { type: "department:updated"; departmentId: number }
  | { type: "alerts:refresh" };

type Listener = (event: SoulEvent) => void;

class SoulEventBus {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  publish(event: SoulEvent) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // ignore listener failures
      }
    }
  }
}

const globalForBus = globalThis as unknown as { soulEventBus?: SoulEventBus };

export const soulEventBus = globalForBus.soulEventBus ?? new SoulEventBus();

if (process.env.NODE_ENV !== "production") {
  globalForBus.soulEventBus = soulEventBus;
}
