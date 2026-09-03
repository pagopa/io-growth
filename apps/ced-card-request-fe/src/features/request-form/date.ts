export const toApiDateTime = (formDate: string | undefined): string => {
  if (!formDate) return '';
  const [day, month, year] = formDate.split('/');

  if (!day || !month || !year) return '';

  return new Date(Date.UTC(+year, +month - 1, +day)).toISOString();
};

export const toFormDate = (dateTime: string): string => {
  const [date] = dateTime.split('T');
  const [year, month, day] = date.split('-');

  return day && month && year ? `${day}/${month}/${year}` : dateTime;
};
