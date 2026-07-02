export const getRequiredError = (
  attempted: boolean,
  required?: boolean,
  value?: string,
): string | undefined => {
  if (required && !value && attempted) {
    return 'Campo obbligatorio';
  }

  return undefined;
};
