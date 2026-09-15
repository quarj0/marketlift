'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { messagingService } from '@/services/messaging.service';
import { accountService } from '@/services/account.service';
import { resolveApiUrl } from '@/lib/api-client';
import { mapNotification, type ApiNotification } from '@/lib/api-mappers';
import { realtimeClient, type RealtimeEvent } from '@/lib/realtime-client';
import { useAuth } from '@/providers/auth-provider';
import type { AccountSettings, Conversation, Message, NotificationItem } from '@/types';

type RealtimeContextValue = {
  connected: boolean;
  unreadMessageCount: number;
  unreadNotificationCount: number;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  connected: false,
  unreadMessageCount: 0,
  unreadNotificationCount: 0,
});

type RealtimeMessagePayload = {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string | null;
  createdAt: string;
  attachment?: {
    url: string;
    name?: string | null;
    mimeType?: string | null;
    size?: number | null;
  } | null;
};

function mapRealtimeMessage(raw: RealtimeMessagePayload, userId: string): Message {
  return {
    id: String(raw.id),
    conversationId: String(raw.conversationId),
    sender: String(raw.senderId) === userId ? 'me' : 'seller',
    text: raw.text || '',
    createdAt: raw.createdAt,
    read: false,
    attachment: raw.attachment
      ? {
          type: 'image',
          url: resolveApiUrl(raw.attachment.url),
          name: raw.attachment.name || '',
          mimeType: raw.attachment.mimeType || '',
          size: Number(raw.attachment.size || 0),
        }
      : undefined,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRealtimeMessage(value: unknown): value is RealtimeMessagePayload {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.conversationId === 'string'
    && typeof value.senderId === 'string'
    && typeof value.createdAt === 'string';
}

function isNotification(value: unknown): value is ApiNotification {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.type === 'string'
    && typeof value.title === 'string'
    && typeof value.body === 'string'
    && typeof value.createdAt === 'string';
}

async function showBrowserNotification(notification: NotificationItem) {
  if (
    typeof window === 'undefined'
    || !('Notification' in window)
    || Notification.permission !== 'granted'
    || document.visibilityState === 'visible'
  ) {
    return;
  }

  const href = notification.href || '/notifications';
  const options: NotificationOptions = {
    body: notification.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { href },
  };

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(notification.title, options);
      return;
    } catch {
      // Fall back to the page Notification API below.
    }
  }

  try {
    const item = new Notification(notification.title, {
      body: notification.body,
      icon: '/icons/icon-192.png',
    });
    item.onclick = () => {
      window.focus();
      window.location.assign(href);
      item.close();
    };
  } catch {
    // Browser notification support is best effort; in-app notifications remain.
  }
}

function browserNotificationAllowed(
  notification: NotificationItem,
  settings: AccountSettings | undefined,
) {
  if (!settings) return false;
  const type = String(notification.type);
  if (type === 'message') return settings.pushMessages;
  if (['listing', 'moderation', 'seller'].includes(type)) {
    return settings.pushListingUpdates;
  }
  return false;
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth();
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    if (!hydrated || !user) {
      realtimeClient.disconnect();
      const frame = window.requestAnimationFrame(() => {
        setConnected(false);
        setUnreadMessageCount(0);
        setUnreadNotificationCount(0);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    // Keep notification/privacy preferences in the shared query cache so
    // realtime delivery can honor them without a separate source of truth.
    void queryClient.ensureQueryData({
      queryKey: ['account', 'settings'],
      queryFn: accountService.getSettings,
    }).catch(() => undefined);

    const handleEvent = (event: RealtimeEvent) => {
      const data = event.data || {};

      if (['realtime.ready', 'message.created', 'conversation.read'].includes(event.type)) {
        void queryClient.invalidateQueries({ queryKey: ['messages'] });
        void queryClient.invalidateQueries({ queryKey: ['conversations'] });
        void queryClient.invalidateQueries({ queryKey: ['conversation'] });
      }
      if (event.type === 'realtime.ready') {
        void queryClient.invalidateQueries({ queryKey: ['notifications'] });
        setConnected(true);
        setUnreadMessageCount(Number(data.unreadMessageCount || 0));
        setUnreadNotificationCount(Number(data.unreadNotificationCount || 0));
        return;
      }

      if (event.type === 'message.created' && isRealtimeMessage(data.message)) {
        const next = mapRealtimeMessage(data.message, user.id);
        queryClient.setQueryData<Message[]>(['messages', next.conversationId], (current) => {
          if (!current) return current;
          return current.some((message) => message.id === next.id) ? current : [...current, next];
        });
        setUnreadMessageCount(Number(data.unreadMessageCount || 0));
        void queryClient.invalidateQueries({ queryKey: ['conversations'] });
        return;
      }

      if (event.type === 'conversation.read') {
        const conversationId = String(data.conversationId || '');
        const readerId = String(data.readerId || '');
        setUnreadMessageCount(Number(data.unreadMessageCount || 0));
        if (conversationId && readerId && readerId !== user.id) {
          queryClient.setQueryData<Message[]>(['messages', conversationId], (current) =>
            current?.map((message) =>
              message.sender === 'me' ? { ...message, read: true } : message,
            ),
          );
        }
        if (conversationId && readerId === user.id) {
          queryClient.setQueryData<Conversation[]>(['conversations'], (current) =>
            current?.map((conversation) =>
              conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation,
            ),
          );
        }
        return;
      }

      if (event.type === 'notification.created' && isNotification(data.notification)) {
        const notification = mapNotification(data.notification);
        queryClient.setQueryData<NotificationItem[]>(['notifications'], (current) => {
          if (!current) return current;
          return current.some((item) => item.id === notification.id)
            ? current
            : [notification, ...current];
        });
        setUnreadNotificationCount(Number(data.unreadNotificationCount || 0));

        const accountSettings = queryClient.getQueryData<AccountSettings>([
          'account',
          'settings',
        ]);
        if (browserNotificationAllowed(notification, accountSettings)) {
          void showBrowserNotification(notification);
        }
        return;
      }

      if (event.type === 'notification.read') {
        const notificationId = String(data.notificationId || '');
        queryClient.setQueryData<NotificationItem[]>(['notifications'], (current) =>
          current?.map((item) =>
            item.id === notificationId ? { ...item, read: true } : item,
          ),
        );
        setUnreadNotificationCount(Number(data.unreadNotificationCount || 0));
        return;
      }

      if (event.type === 'notification.read_all') {
        queryClient.setQueryData<NotificationItem[]>(['notifications'], (current) =>
          current?.map((item) => ({ ...item, read: true })),
        );
        setUnreadNotificationCount(Number(data.unreadNotificationCount || 0));
        return;
      }

      if (event.type === 'error') {
        // Command-specific errors are surfaced to the caller by realtimeClient.
        return;
      }
    };

    const unsubscribe = realtimeClient.subscribe(handleEvent);
    realtimeClient.connect();
    let disposed = false;
    const reconcile = async () => {
      if (realtimeClient.connected || document.visibilityState === 'hidden') return;
      try {
        const counts = await messagingService.unreadCounts();
        if (disposed) return;
        setUnreadMessageCount(counts.unreadMessageCount);
        setUnreadNotificationCount(counts.unreadNotificationCount);
        for (const key of ['messages', 'conversations', 'conversation', 'notifications']) {
          void queryClient.invalidateQueries({ queryKey: [key] });
        }
      } catch { /* Visible queries retain their retry state during outages. */ }
    };
    void reconcile();
    const fallbackPoll = window.setInterval(() => void reconcile(), 30_000);
    document.addEventListener('visibilitychange', reconcile);
    const connectionPoll = window.setInterval(() => setConnected(realtimeClient.connected), 1500);

    return () => {
      disposed = true;
      realtimeClient.disconnect();
      window.clearInterval(fallbackPoll);
      document.removeEventListener('visibilitychange', reconcile);
      unsubscribe();
      window.clearInterval(connectionPoll);
    };
  }, [hydrated, queryClient, user]);

  const value = useMemo(
    () => ({ connected, unreadMessageCount, unreadNotificationCount }),
    [connected, unreadMessageCount, unreadNotificationCount],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
