export interface OpportunityApprovedTemplateInput {
  readonly availabilityDate: Date;
  readonly opportunityName: string;
}

const formatAvailabilityDate = (date: Date): string =>
  new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Rome",
    year: "numeric",
  }).format(date);

export const apply = ({
  availabilityDate,
  opportunityName,
}: OpportunityApprovedTemplateInput): string =>
  `{{TEMPLATE}}`
    .replaceAll("{{opportunityName}}", opportunityName)
    .replaceAll(
      "{{availabilityDate}}",
      formatAvailabilityDate(availabilityDate),
    );
