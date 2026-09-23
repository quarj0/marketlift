import { apiRequest } from '@/lib/api-client';
import {
  mapConversation,
  mapMessage,
  type ApiConversation,
  type ApiMessage,
} from '@/lib/api-mappers';
import { uploadFile } from '@/services/upload.service';
import type { SendMessagePayload } from '@/types';

type MessagingApiConversation = ApiConversation & {
  participant: ApiConversation['participant'] & {
    phone?: string | null;
    online?: boolean;
  };
};

const CONVERSATION_FIELDS = `
  id
  participant { id name avatarUrl verifiedSeller isSeller phone online }
  listing { id slug title price primaryImage status deleted countryCode state stateCode city district }
  lastMessage
  lastMessageAt
  unread
  archived
  blocked
`;

const MESSAGE_FIELDS = `
  id
  conversationId
  senderId
  sender
  text
  createdAt
  read
  attachment { type url name mimeType size }
`;

function mapMessagingConversation(raw: MessagingApiConversation) {
  const mapped = mapConversation(raw);
  return {
    ...mapped,
    participant: {
      ...mapped.participant,
      phone: raw.participant.phone?.trim() || undefined,
      online: Boolean(raw.participant.online),
    },
  };
}

export const messagingService = {
  async getConversation(id: string) {
    const data = await apiRequest<MessagingApiConversation>(
      `/api/v1/messaging/conversations/${id}/`,
    );
    return mapMessagingConversation(data);
  },

  unreadCounts: () =>
    apiRequest<{ unreadMessageCount: number; unreadNotificationCount: number }>(
      '/api/v1/messaging/counts/',
    ),

  async getConversations(offset = 0) {
    const data = await apiRequest<{ results: MessagingApiConversation[] }>(
      `/api/v1/messaging/conversations/?limit=50&offset=${offset}`,
    );
    return (data.results || []).map(mapMessagingConversation);
  },

  async getMessages(id: string, before?: { createdAt: string; id: string }) {
    const params = new URLSearchParams({ limit: '50' });
    if (before?.createdAt) params.set('before', before.createdAt);
    if (before?.id) params.set('beforeId', before.id);
    const data = await apiRequest<{ results: ApiMessage[] }>(
      `/api/v1/messaging/conversations/${id}/messages/?${params.toString()}`,
    );
    return (data.results || []).map(mapMessage);
  },

  async startConversation(listingId: string) {
    const data = await apiRequest<MessagingApiConversation>(
      '/api/v1/messaging/conversations/',
      {
        method: 'POST',
        json: { listingId },
      },
    );
    return mapMessagingConversation(data);
  },

  async sendMessage(id: string, payload: SendMessagePayload) {
    const text = payload.text?.trim() || '';
    if (!text && !payload.image) throw new Error('A message or image is required.');

    const uploadId = payload.image
      ? await uploadFile(payload.image, 'message_image')
      : undefined;

    const data = await apiRequest<ApiMessage>(
      `/api/v1/messaging/conversations/${id}/messages/`,
      {
        method: 'POST',
        json: {
          text: text || '',
          uploadId: uploadId || null,
        },
      },
    );
    return mapMessage(data);
  },

  async markRead(id: string) {
    const data = await apiRequest<{ read: boolean }>(
      `/api/v1/messaging/conversations/${id}/read/`,
      { method: 'POST', json: {} },
    );
    return Boolean(data.read);
  },
};
