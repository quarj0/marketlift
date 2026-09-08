import { graphqlRequest } from "@/lib/api-client";

export type SupportMessage = {
  id: string;
  senderName: string | null;
  body: string;
  internal: boolean;
  attachmentUrl: string | null;
  createdAt: string;
};
export type SupportTicket = {
  id: string;
  reference: string;
  subject: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
  messagesHasMore: boolean;
};
const summary = "id reference subject category status createdAt updatedAt";
const detail = `${summary} messagesHasMore messages { id senderName body internal attachmentUrl createdAt }`;
export const supportService = {
  async list(offset = 0) {
    const data = await graphqlRequest<{ mySupportTickets: SupportTicket[] }>(
      `query($offset:Int!){ mySupportTickets(limit:25,offset:$offset){ ${summary} } }`,
      { offset },
    );
    return data.mySupportTickets;
  },
  async get(id: string, offset = 0) {
    const data = await graphqlRequest<{ supportTicket: SupportTicket | null }>(
      `query($id:ID!,$offset:Int!){supportTicket(id:$id,messageOffset:$offset){${detail}}}`,
      { id, offset },
    );
    return data.supportTicket;
  },
  async create(input: { subject: string; category: string; message: string }) {
    const data = await graphqlRequest<{ createSupportTicket: SupportTicket }>(
      `mutation($input:CreateSupportTicketInput!){createSupportTicket(input:$input){${summary}}}`,
      { input },
    );
    return data.createSupportTicket;
  },
  async reply(id: string, message: string) {
    return graphqlRequest(
      `mutation($id:ID!,$message:String!){replySupportTicket(ticketId:$id,message:$message){id}}`,
      { id, message },
    );
  },
};
