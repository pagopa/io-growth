export interface OpportunityPublishedTemplateInput {
  readonly opportunityName: string;
}

export const apply = ({
  opportunityName,
}: OpportunityPublishedTemplateInput): string =>
  `{{TEMPLATE}}`.replaceAll("{{opportunityName}}", opportunityName);
