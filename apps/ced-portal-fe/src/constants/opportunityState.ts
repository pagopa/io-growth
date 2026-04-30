export const STATE_OPTIONS = [
  'Da_gestire',
  'In_attesa_di_modifiche',
  'Approvata',
  'Non_attiva',
];

export const STATE_LABELS: Record<string, string> = {
  Da_gestire: 'Da gestire',
  In_attesa_di_modifiche: 'In attesa di modifiche',
  Approvata: 'Approvata',
  Non_attiva: 'Non attiva',
};

export const STATE_COLORS: Record<
  string,
  'default' | 'warning' | 'success' | 'info' | 'error'
> = {
  Da_gestire: 'warning',
  In_attesa_di_modifiche: 'info',
  Approvata: 'success',
  Non_attiva: 'default',
};
