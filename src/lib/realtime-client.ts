import { API_BASE_URL } from '@/lib/api-client';

export type RealtimeEvent = {
  type: string;
  data?: Record<string, unknown>;
};

type PendingCommand = {
  resolve: (data: Record<string, unknown>) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export class RealtimeUnavailableError extends Error {
  constructor(message = 'Realtime connection is not available.') {
    super(message);
    this.name = 'RealtimeUnavailableError';
  }
}

function websocketUrl() {
  const url = new URL(API_BASE_URL);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws/realtime/';
  url.search = '';
  url.hash = '';
  return url.toString();
}

class MarketliftRealtimeClient {
  private socket: WebSocket | null = null;
  private listeners = new Set<(event: RealtimeEvent) => void>();
  private pending = new Map<string, PendingCommand>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private reconnectEnabled = false;

  get connected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  connect() {
    if (typeof window === 'undefined') return;
    this.reconnectEnabled = true;
    if (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    this.clearReconnectTimer();
    const socket = new WebSocket(websocketUrl());
    this.socket = socket;

    socket.addEventListener('open', () => {
      this.reconnectAttempt = 0;
    });

    socket.addEventListener('message', (message) => {
      let event: RealtimeEvent;
      try {
        event = JSON.parse(String(message.data)) as RealtimeEvent;
      } catch {
        return;
      }

      const requestId = String(event.data?.requestId || '');
      if (event.type === 'command.ack' && requestId) {
        const pending = this.pending.get(requestId);
        if (pending) {
          clearTimeout(pending.timer);
          this.pending.delete(requestId);
          pending.resolve(event.data || {});
        }
      } else if (event.type === 'error' && requestId) {
        const pending = this.pending.get(requestId);
        if (pending) {
          clearTimeout(pending.timer);
          this.pending.delete(requestId);
          pending.reject(new Error(String(event.data?.message || 'Realtime action failed.')));
        }
      }

      this.listeners.forEach((listener) => listener(event));
    });

    socket.addEventListener('close', (event) => {
      if (this.socket === socket) this.socket = null;
      this.rejectPending(new RealtimeUnavailableError('Realtime connection closed.'));

      if (event.code === 4401) {
        this.reconnectEnabled = false;
        return;
      }
      this.scheduleReconnect();
    });

    socket.addEventListener('error', () => {
      // The close event drives reconnect and pending-command cleanup.
    });
  }

  disconnect() {
    this.reconnectEnabled = false;
    this.clearReconnectTimer();
    this.rejectPending(new RealtimeUnavailableError('Realtime connection closed.'));
    const socket = this.socket;
    this.socket = null;
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close(1000, 'session ended');
  }

  subscribe(listener: (event: RealtimeEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async command(type: string, data: Record<string, unknown> = {}) {
    if (!this.connected || !this.socket) throw new RealtimeUnavailableError();

    const requestId = crypto.randomUUID();
    const socket = this.socket;
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error('Realtime action confirmation timed out.'));
      }, 10000);

      this.pending.set(requestId, { resolve, reject, timer });
      try {
        socket.send(JSON.stringify({ type, requestId, ...data }));
      } catch (error) {
        clearTimeout(timer);
        this.pending.delete(requestId);
        reject(error instanceof Error ? error : new Error('Realtime action failed.'));
      }
    });
  }

  private scheduleReconnect() {
    if (!this.reconnectEnabled || this.reconnectTimer || typeof window === 'undefined') return;
    const delay = Math.min(15000, 1000 * 2 ** Math.min(this.reconnectAttempt, 4));
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearReconnectTimer() {
    if (!this.reconnectTimer) return;
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private rejectPending(error: Error) {
    this.pending.forEach((pending) => {
      clearTimeout(pending.timer);
      pending.reject(error);
    });
    this.pending.clear();
  }
}

export const realtimeClient = new MarketliftRealtimeClient();
