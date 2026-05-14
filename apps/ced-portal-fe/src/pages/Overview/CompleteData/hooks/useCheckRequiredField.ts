type Params = {
  value: string | null | undefined;
  required?: boolean;
  attempted?: boolean;
};

export const useCheckRequiredField = ({
  value,
  required,
  attempted,
}: Params) => {
  if (!required || !attempted) return { error: false, helperText: undefined };
  const isEmpty = !value?.trim();
  return {
    error: isEmpty,
    helperText: isEmpty ? 'Campo obbligatorio' : undefined,
  };
};
