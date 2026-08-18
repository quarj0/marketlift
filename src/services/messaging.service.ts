import { listings, sellers } from "@/mocks/data";
import type { Conversation, Message, SendMessagePayload } from "@/types";
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const conversations: Conversation[] = [
  {
    id: "c1",
    participant: sellers[0],
    listing: listings[0],
    lastMessage: "Yes, it is still available. You can inspect it tomorrow.",
    lastMessageAt: "10:42",
    unread: 2,
  },
  {
    id: "c2",
    participant: sellers[1],
    listing: listings[1],
    lastMessage: "I can send more photos of the device.",
    lastMessageAt: "Yesterday",
    unread: 0,
  },
  {
    id: "c3",
    participant: sellers[2],
    listing: listings[2],
    lastMessage: "The documents are all up to date.",
    lastMessageAt: "Mon",
    unread: 0,
  },
];
const messages: Record<string, Message[]> = {
  c1: [
    {
      id: "m1",
      conversationId: "c1",
      sender: "me",
      text: "Hi, is the Honda Civic still available?",
      createdAt: "10:38",
      read: true,
    },
    {
      id: "m2",
      conversationId: "c1",
      sender: "seller",
      text: "Yes, it is still available. You can inspect it tomorrow.",
      createdAt: "10:42",
      read: true,
    },
  ],
  c2: [
    {
      id: "m3",
      conversationId: "c2",
      sender: "seller",
      text: "I can send more photos of the device.",
      createdAt: "Yesterday",
      read: true,
    },
  ],
  c3: [
    {
      id: "m4",
      conversationId: "c3",
      sender: "seller",
      text: "The documents are all up to date.",
      createdAt: "Mon",
      read: true,
    },
  ],
};
export const messagingService = {
  async getConversations() {
    await delay();

    return conversations;
  },

  async getMessages(id: string) {
    await delay();

    return messages[id] ?? [];
  },

  async sendMessage(id: string, payload: SendMessagePayload) {
    await delay(180);

    const text = payload.text?.trim() ?? "";

    if (!text && !payload.image) {
      throw new Error("A message or image is required.");
    }

    const attachment = payload.image
      ? {
          type: "image" as const,
          url: URL.createObjectURL(payload.image),
          name: payload.image.name,
          mimeType: payload.image.type,
          size: payload.image.size,
        }
      : undefined;

    const message: Message = {
      id: `m-${Date.now()}`,
      conversationId: id,
      sender: "me",
      text,
      createdAt: "Now",
      read: false,
      attachment,
    };

    (messages[id] ??= []).push(message);

    const conversation = conversations.find((item) => item.id === id);

    if (conversation) {
      conversation.lastMessage = text || (payload.image ? "📷 Photo" : "");

      conversation.lastMessageAt = "Now";
    }

    return message;
  },

  async markRead(id: string) {
    const conversation = conversations.find((item) => item.id === id);

    if (conversation) {
      conversation.unread = 0;
    }

    return true;
  },
};
