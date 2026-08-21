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

const CONVERSATION_FIELDS = `
  id
  participant { id name avatarUrl verifiedSeller isSeller }
  listing { id slug title price primaryImage status deleted }
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

export const messagingService = {
  async getConversations() {
    const data = await graphqlRequest<{ myConversations: ApiConversation[] }>(`
      query MyConversations {
        myConversations { ${CONVERSATION_FIELDS} }
      }
    `);
    return (data.myConversations || []).map(mapConversation);
  },

  async getMessages(id: string) {
    const data = await graphqlRequest<{ messages: ApiMessage[] }>(`
      query ConversationMessages($id: ID!) {
        messages(conversationId: $id, limit: 100) { ${MESSAGE_FIELDS} }
      }
    `, { id });
    return (data.messages || []).map(mapMessage);
  },

  async startConversation(listingId: string) {
    const data = await graphqlRequest<{ startConversation: ApiConversation }>(`
      mutation StartConversation($listingId: ID!) {
        startConversation(listingId: $listingId) { ${CONVERSATION_FIELDS} }
      }
    `, { listingId });
    return mapConversation(data.startConversation);
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
