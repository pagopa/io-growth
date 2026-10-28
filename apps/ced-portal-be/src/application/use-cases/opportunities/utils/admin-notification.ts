import type {
  AdminContacts,
  MessagePayload,
} from "../../../../domain/entities/message-outbox.js";

export const buildAdminMessages = (
  adminContacts: AdminContacts,
  buildMessage: (to: string) => MessagePayload,
): readonly MessagePayload[] => [buildMessage(adminContacts.emailAddress)];
