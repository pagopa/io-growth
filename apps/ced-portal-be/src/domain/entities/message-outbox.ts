import { z } from "zod";

export const MESSAGE_OUTBOX_MAX_ATTEMPTS = 3;

export const MESSAGE_OUTBOX_STATUS = {
  FAILED: "failed",
  PENDING: "pending",
  SENDING: "sending",
  SENT: "sent",
} as const;

export const ADMIN_NEW_OPPORTUNITY_TEMPLATE_ID = "ced_admin-new-opportunity_v1";
export const ADMIN_OPPORTUNITY_DELETED_TEMPLATE_ID =
  "ced_admin-opportunity-deleted_v1";
export const ADMIN_OPPORTUNITY_REPUBLISH_REQUEST_TEMPLATE_ID =
  "ced_admin-opportunity-republish-request_v1";
export const ADMIN_OPPORTUNITY_REPUBLISHED_TEMPLATE_ID =
  "ced_admin-opportunity-republished_v1";
export const ADMIN_OPPORTUNITY_SUSPENDED_TEMPLATE_ID =
  "ced_admin-opportunity-suspended_v1";
export const ADMIN_OPPORTUNITY_SUSPENSION_CANCELLED_TEMPLATE_ID =
  "ced_admin-opportunity-suspension-cancelled_v1";
export const ADMIN_REVISE_OPPORTUNITY_TEMPLATE_ID =
  "ced_admin-revise-opportunity_v1";
export const OPERATOR_OPPORTUNITY_APPROVED_TEMPLATE_ID =
  "ced_operator-opportunity-approved_v1";
export const OPERATOR_OPPORTUNITY_DELETED_TEMPLATE_ID =
  "ced_operator-opportunity-deleted_v1";
export const OPERATOR_OPPORTUNITY_PUBLISHED_TEMPLATE_ID =
  "ced_operator-opportunity-published_v1";
export const OPERATOR_OPPORTUNITY_REJECTED_TEMPLATE_ID =
  "ced_operator-opportunity-rejected_v1";
export const OPERATOR_OPPORTUNITY_REPUBLISHED_TEMPLATE_ID =
  "ced_operator-opportunity-republished_v1";

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

export interface AdminContacts {
  readonly emailAddress: string;
}

export interface EmailLinks {
  readonly runbookUrl: string;
  readonly selfcareUrl: string;
  readonly supportUrl: string;
}

export type HtmlMessagePayload = z.infer<typeof HtmlMessagePayloadSchema>;

// `adminContacts` is environment-routed per request: read it during execution, never at composition time.
export interface MailingConfig {
  readonly adminContacts: AdminContacts;
  readonly emailLinks: EmailLinks;
}

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

export const buildAdminNewOpportunityMessage = (input: {
  links: EmailLinks;
  operatorName: string;
  opportunityName: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: {
    operatorName: input.operatorName,
    opportunityName: input.opportunityName,
    ...input.links,
  },
  templateId: ADMIN_NEW_OPPORTUNITY_TEMPLATE_ID,
  to: input.to,
  type: "template",
});

export const buildAdminOpportunityDeletedMessage = (input: {
  deletionDate: string;
  deletionMessage: string;
  links: EmailLinks;
  operatorName: string;
  opportunityName: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: {
    deletionDate: input.deletionDate,
    deletionMessage: input.deletionMessage,
    operatorName: input.operatorName,
    opportunityName: input.opportunityName,
    ...input.links,
  },
  templateId: ADMIN_OPPORTUNITY_DELETED_TEMPLATE_ID,
  to: input.to,
  type: "template",
});

export const buildAdminOpportunityRepublishedMessage = (input: {
  links: EmailLinks;
  operatorName: string;
  opportunityName: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: {
    operatorName: input.operatorName,
    opportunityName: input.opportunityName,
    ...input.links,
  },
  templateId: ADMIN_OPPORTUNITY_REPUBLISHED_TEMPLATE_ID,
  to: input.to,
  type: "template",
});

export const buildAdminOpportunityRepublishRequestMessage = (input: {
  links: EmailLinks;
  operatorName: string;
  opportunityName: string;
  republishMessage: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: {
    operatorName: input.operatorName,
    opportunityName: input.opportunityName,
    republishMessage: input.republishMessage,
    ...input.links,
  },
  templateId: ADMIN_OPPORTUNITY_REPUBLISH_REQUEST_TEMPLATE_ID,
  to: input.to,
  type: "template",
});

export const buildAdminOpportunitySuspensionCancelledMessage = (input: {
  links: EmailLinks;
  operatorName: string;
  opportunityName: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: {
    operatorName: input.operatorName,
    opportunityName: input.opportunityName,
    ...input.links,
  },
  templateId: ADMIN_OPPORTUNITY_SUSPENSION_CANCELLED_TEMPLATE_ID,
  to: input.to,
  type: "template",
});

export const buildAdminOpportunitySuspendedMessage = (input: {
  links: EmailLinks;
  operatorName: string;
  opportunityName: string;
  suspensionDate: string;
  suspensionMessage: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: {
    operatorName: input.operatorName,
    opportunityName: input.opportunityName,
    suspensionDate: input.suspensionDate,
    suspensionMessage: input.suspensionMessage,
    ...input.links,
  },
  templateId: ADMIN_OPPORTUNITY_SUSPENDED_TEMPLATE_ID,
  to: input.to,
  type: "template",
});

export const buildAdminReviseOpportunityMessage = (input: {
  links: EmailLinks;
  operatorName: string;
  opportunityName: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: {
    operatorName: input.operatorName,
    opportunityName: input.opportunityName,
    ...input.links,
  },
  templateId: ADMIN_REVISE_OPPORTUNITY_TEMPLATE_ID,
  to: input.to,
  type: "template",
});

export const buildOperatorOpportunityApprovedMessage = (input: {
  availabilityDate: string;
  links: EmailLinks;
  opportunityName: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: {
    availabilityDate: input.availabilityDate,
    opportunityName: input.opportunityName,
    ...input.links,
  },
  templateId: OPERATOR_OPPORTUNITY_APPROVED_TEMPLATE_ID,
  to: input.to,
  type: "template",
});

export const buildOperatorOpportunityDeletedMessage = (input: {
  links: EmailLinks;
  opportunityName: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: {
    opportunityName: input.opportunityName,
    ...input.links,
  },
  templateId: OPERATOR_OPPORTUNITY_DELETED_TEMPLATE_ID,
  to: input.to,
  type: "template",
});

export const buildOperatorOpportunityPublishedMessage = (input: {
  links: EmailLinks;
  opportunityName: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: {
    opportunityName: input.opportunityName,
    ...input.links,
  },
  templateId: OPERATOR_OPPORTUNITY_PUBLISHED_TEMPLATE_ID,
  to: input.to,
  type: "template",
});

export const buildOperatorOpportunityRejectedMessage = (input: {
  links: EmailLinks;
  opportunityName: string;
  rejectionMessage: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: {
    opportunityName: input.opportunityName,
    rejectionMessage: input.rejectionMessage,
    ...input.links,
  },
  templateId: OPERATOR_OPPORTUNITY_REJECTED_TEMPLATE_ID,
  to: input.to,
  type: "template",
});

export const buildOperatorOpportunityRepublishedMessage = (input: {
  links: EmailLinks;
  opportunityName: string;
  to: string;
}): TemplateMessagePayload => ({
  templateAttributes: {
    opportunityName: input.opportunityName,
    ...input.links,
  },
  templateId: OPERATOR_OPPORTUNITY_REPUBLISHED_TEMPLATE_ID,
  to: input.to,
  type: "template",
});
