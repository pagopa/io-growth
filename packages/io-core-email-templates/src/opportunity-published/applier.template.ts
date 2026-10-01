export interface OpportunityApprovedTemplateInput {
  readonly opportunityName: string;
}

export const apply = ({
  opportunityName,
}: OpportunityApprovedTemplateInput): string =>
  `{{TEMPLATE}}`.replaceAll("{{opportunityName}}", opportunityName);
