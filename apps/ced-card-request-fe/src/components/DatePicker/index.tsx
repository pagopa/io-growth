import {
  DatePicker,
  type DatePickerProps,
} from '@mui/x-date-pickers/DatePicker';
import { format as formatter, isValid, parse } from 'date-fns';

const REFERENCE_DATE = new Date();

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
}

export function AppDatePicker({
  value,
  onChange,
  onBlur,
  error,
  helperText,
  sx,
  format = 'dd/MM/yyyy',
  ...props
}: AppDatePickerProps) {
  const parsedValue = value ? parse(value, format, REFERENCE_DATE) : null;
  const dateValue = parsedValue && isValid(parsedValue) ? parsedValue : null;

  const handleChange = (date: Date | null) => {
    if (!date || !isValid(date)) {
      onChange('');
      return;
    }
    onChange(formatter(date, format));
  };

  return (
    <DatePicker
      value={dateValue}
      onChange={handleChange}
      format={format}
      sx={Array.isArray(sx) ? sx : [sx]}
      slotProps={{
        textField: {
          onBlur,
          error,
          helperText,
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
