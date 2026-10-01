export interface OpportunityRejectedTemplateInput {
  readonly opportunityName: string;
  readonly rejectionMessage: string;
}

export const apply = ({
  opportunityName,
  rejectionMessage,
}: OpportunityRejectedTemplateInput): string =>
  `{{TEMPLATE}}`
    .replaceAll("{{opportunityName}}", opportunityName)
    .replaceAll("{{rejectionMessage}}", rejectionMessage);
