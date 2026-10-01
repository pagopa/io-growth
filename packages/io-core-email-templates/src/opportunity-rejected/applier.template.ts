export interface OpportunityRejectedTemplateInput {
  readonly rejectionMessage: string;
  readonly opportunityName: string;
}

export const apply = ({
  rejectionMessage,
  opportunityName,
}: OpportunityRejectedTemplateInput): string =>
  `{{TEMPLATE}}`
    .replaceAll("{{opportunityName}}", opportunityName)
    .replaceAll(
      "{{rejectionMessage}}",
      rejectionMessage,
    );
