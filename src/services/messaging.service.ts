import { graphqlRequest } from '@/lib/api-client';
import { realtimeClient, RealtimeUnavailableError } from '@/lib/realtime-client';
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
    const data = await graphqlRequest<{ conversation: MessagingApiConversation }>(`query Conversation($id: ID!) { conversation(id: $id) { ${CONVERSATION_FIELDS} } }`, { id });
    return mapMessagingConversation(data.conversation);
  },
  unreadCounts: () => graphqlRequest<{ unreadMessageCount: number; unreadNotificationCount: number }>(`query UnreadCounts { unreadMessageCount unreadNotificationCount }`),

  async getConversations(offset = 0) {
    const data = await graphqlRequest<{ myConversations: MessagingApiConversation[] }>(`
      query MyConversations($offset: Int!) {
        myConversations(limit: 50, offset: $offset) { ${CONVERSATION_FIELDS} }
      }
    `, { offset });
    return (data.myConversations || []).map(mapMessagingConversation);
  },

  async getMessages(id: string, before?: { createdAt: string; id: string }) {
    const data = await graphqlRequest<{ messages: ApiMessage[] }>(`
      query ConversationMessages($id: ID!, $before: DateTime, $beforeId: ID) {
        messages(conversationId: $id, limit: 50, before: $before, beforeId: $beforeId) { ${MESSAGE_FIELDS} }
      }
    `, { id, before: before?.createdAt ?? null, beforeId: before?.id ?? null });
    return (data.messages || []).map(mapMessage);
  },

  async startConversation(listingId: string) {
    const data = await graphqlRequest<{ startConversation: MessagingApiConversation }>(`
      mutation StartConversation($listingId: ID!) {
        startConversation(listingId: $listingId) { ${CONVERSATION_FIELDS} }
      }
    `, { listingId });
    return mapMessagingConversation(data.startConversation);
  },

  async sendMessage(id: string, payload: SendMessagePayload) {
    const text = payload.text?.trim() || '';
    if (!text && !payload.image) throw new Error('A message or image is required.');

    const uploadId = payload.image
      ? await uploadFile(payload.image, 'message_image')
      : undefined;

    try {
      await realtimeClient.command('message.send', {
        conversationId: id,
        text,
        ...(uploadId ? { uploadId } : {}),
      });
      return null;
    } catch (error) {
      if (!(error instanceof RealtimeUnavailableError)) throw error;
    }

    const data = await graphqlRequest<{ sendMessage: ApiMessage }>(`
      mutation SendMessage($input: SendMessageInput!) {
        sendMessage(input: $input) { ${MESSAGE_FIELDS} }
      }
    `, {
      input: {
        conversationId: id,
        text: text || null,
        uploadId: uploadId || null,
      },
    });
    return mapMessage(data.sendMessage);
  },

  async markRead(id: string) {
    try {
      await realtimeClient.command('conversation.read', { conversationId: id });
      return true;
    } catch (error) {
      if (!(error instanceof RealtimeUnavailableError)) throw error;
    }

    const data = await graphqlRequest<{ markConversationRead: boolean }>(`
      mutation MarkConversationRead($id: ID!) {
        markConversationRead(conversationId: $id)
      }
    `, { id });
    return data.markConversationRead;
  },
};
