import {
  DatePicker,
  type DatePickerProps,
} from '@mui/x-date-pickers/DatePicker';
import { format, isValid, parse, parseISO } from 'date-fns';

const DATE_FORMAT = 'dd/MM/yyyy';

export interface AppDatePickerProps extends Omit<
  DatePickerProps<Date>,
  'value' | 'onChange'
> {
  /** String in dd/MM/yyyy format — empty string = no date */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

export function AppDatePicker({
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required,
  sx,
  ...props
}: AppDatePickerProps) {
  const parsedValue = value
    ? value.includes('/')
      ? parse(value, DATE_FORMAT, new Date())
      : parseISO(value)
    : null;
  const dateValue = parsedValue && isValid(parsedValue) ? parsedValue : null;

  const handleChange = (date: Date | null) => {
    if (!date || !isValid(date)) {
      onChange('');
      return;
    }
    onChange(format(date, DATE_FORMAT));
  };

  return (
    <DatePicker
      value={dateValue}
      onChange={handleChange}
      format={DATE_FORMAT}
      sx={Array.isArray(sx) ? sx : [sx]}
      slotProps={{
        textField: {
          onBlur,
          error,
          helperText,
          required,
          fullWidth: true,
        },
        inputAdornment: {
          position: 'start',
          sx: { ml: 1, mr: 1 },
        },
        openPickerButton: {
          sx: {
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: '3px',
          },
        },
        openPickerIcon: {
          sx: { fontSize: 24, color: 'common.decorativeIcon' },
        },
      }}
      {...props}
    />
  );
}
