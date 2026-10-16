import { SESSION_BROADCAST_CHANNEL } from '../shared/constants/authentication.constants';

export type SessionEvent = 'signed-in' | 'signed-out';

type SessionEventHandler = (event: SessionEvent) => void;

/**
 * One channel per tab for both sending and receiving: a BroadcastChannel never receives
 * its own messages, so a tab only reacts to events from other tabs.
 */
let channel: BroadcastChannel | null | undefined;
const handlers = new Set<SessionEventHandler>();

function isSessionEvent(value: unknown): value is SessionEvent {
  return value === 'signed-in' || value === 'signed-out';
}

function getChannel(): BroadcastChannel | null {
  if (channel !== undefined) {
    return channel;
  }
  try {
    channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(SESSION_BROADCAST_CHANNEL);
  } catch {
    channel = null;
  }
  if (channel) {
    channel.onmessage = (message: MessageEvent<unknown>) => {
      const { data } = message;
      if (isSessionEvent(data)) {
        handlers.forEach((handler) => handler(data));
      }
    };
  }
  return channel;
}

/** Tells other open tabs that this tab signed in or out, so they can resynchronise. */
export function broadcastSessionEvent(event: SessionEvent): void {
  getChannel()?.postMessage(event);
}

export function subscribeToSessionEvents(handler: SessionEventHandler): () => void {
  getChannel();
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}
