import { z } from "zod";

export const MESSAGE_OUTBOX_MAX_ATTEMPTS = 3;

export const MESSAGE_OUTBOX_STATUS = {
  FAILED: "failed",
  PENDING: "pending",
  SENDING: "sending",
  SENT: "sent",
} as const;

export const OPPORTUNITY_APPROVED_TEMPLATE_ID = "ced_opportunity-approved";
export const OPPORTUNITY_PUBLISHED_TEMPLATE_ID = "ced_opportunity-published";

export const HtmlMessagePayloadSchema = z.object({
  html: z.string().min(1),
  subject: z.string().min(1),
  text: z.string().min(1).optional(),
  to: z.email(),
  type: z.literal("html"),
});

export const TemplateMessagePayloadSchema = z.object({
  templateAttributes: z.record(z.string(), z.string()),
  templateId: z.string().min(1),
  to: z.email(),
  type: z.literal("template"),
});

export const MessagePayloadSchema = z.discriminatedUnion("type", [
  HtmlMessagePayloadSchema,
  TemplateMessagePayloadSchema,
]);

export type HtmlMessagePayload = z.infer<typeof HtmlMessagePayloadSchema>;

export type MessageOutboxStatus =
  (typeof MESSAGE_OUTBOX_STATUS)[keyof typeof MESSAGE_OUTBOX_STATUS];

export type MessagePayload = z.infer<typeof MessagePayloadSchema>;

export interface OutboxMessage {
  readonly attemptCount: number;
  readonly id: string;
  // Unvalidated: the sender parses it with `MessagePayloadSchema`.
  readonly payload: unknown;
}

export type TemplateMessagePayload = z.infer<
  typeof TemplateMessagePayloadSchema
>;

export const buildOpportunityApprovedMessage = (input: {
  availabilityDate: string;
  opportunityName: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: {
    availabilityDate: input.availabilityDate,
    opportunityName: input.opportunityName,
  },
  templateId: OPPORTUNITY_APPROVED_TEMPLATE_ID,
  to: input.to,
  type: "template",
});

export const buildOpportunityPublishedMessage = (input: {
  opportunityName: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: { opportunityName: input.opportunityName },
  templateId: OPPORTUNITY_PUBLISHED_TEMPLATE_ID,
  to: input.to,
  type: "template",
});
