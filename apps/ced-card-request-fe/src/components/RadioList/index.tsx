import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import {
  Box,
  Divider,
  FormControlLabel,
  type FormControlLabelProps,
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
  itemSx?: FormControlLabelProps['sx'];
  labelPlacement?: FormControlLabelProps['labelPlacement'];
  divider?: boolean;
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
  itemSx,
  labelPlacement,
  divider,
  ...props
}: AppRadioListProps) => (
  <RadioGroup
    {...props}
    onChange={onChange ? (_, value) => onChange(value) : undefined}
  >
    {options.map((option, idx) => (
      <Box key={option.value}>
        {divider && idx > 0 && <Divider />}
        <FormControlLabel
          value={option.value}
          label={option.label}
          labelPlacement={labelPlacement}
          control={<Radio icon={uncheckedIcon} checkedIcon={checkedIcon} />}
          sx={itemSx}
        />
      </Box>
    ))}
  </RadioGroup>
);
