export const STATE_OPTIONS = [
  { value: 'Da_gestire', label: 'Da gestire' },
  { value: 'In_attesa_di_modifiche', label: 'In attesa di modifiche' },
  { value: 'Approvata', label: 'Approvata' },
  { value: 'Non_attiva', label: 'Non attiva' },
];

export const STATE_COLORS: Record<
  string,
  'default' | 'warning' | 'success' | 'info' | 'error'
> = {
  Da_gestire: 'warning',
  In_attesa_di_modifiche: 'info',
  Approvata: 'success',
  Non_attiva: 'default',
};
