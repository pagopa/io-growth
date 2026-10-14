const applicationDateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Rome",
  year: "numeric",
});

export const getApplicationDate = (date: Date = new Date()): string =>
  applicationDateFormatter.format(date);
