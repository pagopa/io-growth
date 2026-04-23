import {
  DatePicker,
  type DatePickerProps,
} from '@mui/x-date-pickers/DatePicker';
import { format, isValid, parse } from 'date-fns';

const DATE_FORMAT = 'dd/MM/yyyy';
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
  ...props
}: AppDatePickerProps) {
  const parsedValue = value ? parse(value, DATE_FORMAT, REFERENCE_DATE) : null;
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
      sx={[
        {
          width: '100%',
          bgcolor: 'common.white',
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            minHeight: 56,
          },
          '& .MuiOutlinedInput-root.Mui-disabled': {
            backgroundColor: 'common.neutralGray',
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.875rem',
            fontWeight: 400,
          },
          '& .MuiFormLabel-asterisk': {
            color: 'error.main',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
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
