import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import {
  Box,
  FormControlLabel,
  RadioGroup,
  type RadioGroupProps,
} from '@mui/material';
import Radio from '@mui/material/Radio';

export interface RadioListOption {
  value: string;
  label: string;
}

export interface AppRadioListProps extends Omit<
  RadioGroupProps,
  'children' | 'onChange'
> {
  options: readonly RadioListOption[];
  onChange?: (value: string) => void;
  itemMaxWidth?: number | string;
}

const uncheckedIcon = (
  <Box
    sx={{
      width: 20,
      height: 20,
      flexShrink: 0,
      borderRadius: '50%',
      border: '2px solid #636B82',
    }}
  />
);

const checkedIcon = (
  <Box
    sx={{
      width: 20,
      height: 20,
      flexShrink: 0,
      borderRadius: '50%',
      bgcolor: 'common.primaryButton',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <CheckRoundedIcon
      sx={{
        color: 'common.white',
        fontSize: 14,
        stroke: 'white',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }}
    />
  </Box>
);

export const AppRadioList = ({
  options,
  onChange,
  itemMaxWidth = 320,
  ...props
}: AppRadioListProps) => (
  <RadioGroup
    {...props}
    onChange={onChange ? (_, value) => onChange(value) : undefined}
  >
    {options.map((option) => (
      <FormControlLabel
        key={option.value}
        value={option.value}
        label={option.label}
        sx={{
          ml: 0,
          width: '100%',
          maxWidth: itemMaxWidth,
          '& .MuiFormControlLabel-label': { fontSize: 16, fontWeight: 600 },
        }}
        control={
          <Radio
            disableRipple
            sx={{ p: 0, mr: 1 }}
            icon={uncheckedIcon}
            checkedIcon={checkedIcon}
          />
        }
      />
    ))}
  </RadioGroup>
);
