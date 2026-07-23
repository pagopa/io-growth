import {
  DatePicker,
  type DatePickerProps,
} from '@mui/x-date-pickers/DatePicker';
import { format, isValid, parse } from 'date-fns';

const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';
const ISO_DATE_FORMAT = 'yyyy-MM-dd';
const REFERENCE_DATE = new Date();
type DateValueFormat = 'display' | 'iso';

export interface AppDatePickerProps extends Omit<
  DatePickerProps<Date>,
  'value' | 'onChange'
> {
  /** String date value in the selected valueFormat — empty string = no date */
  value: string;
  onChange: (value: string) => void;
  valueFormat?: DateValueFormat;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
}

export function AppDatePicker({
  value,
  onChange,
  valueFormat = 'display',
  onBlur,
  error,
  helperText,
  sx,
  ...props
}: AppDatePickerProps) {
  const parserFormat =
    valueFormat === 'iso' ? ISO_DATE_FORMAT : DISPLAY_DATE_FORMAT;
  const parsedValue = value ? parse(value, parserFormat, REFERENCE_DATE) : null;
  const dateValue = parsedValue && isValid(parsedValue) ? parsedValue : null;

  const handleChange = (date: Date | null) => {
    if (!date || !isValid(date)) {
      onChange('');
      return;
    }
    const outputFormat =
      valueFormat === 'iso' ? ISO_DATE_FORMAT : DISPLAY_DATE_FORMAT;
    onChange(format(date, outputFormat));
  };

  return (
    <DatePicker
      value={dateValue}
      onChange={handleChange}
      format={DISPLAY_DATE_FORMAT}
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
