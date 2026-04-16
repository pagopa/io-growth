import {
  FormControlLabel,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from '@mui/material';

export type AppRadioGroupProps = {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  options: { label: string; value: string }[];
} & RadioGroupProps;

export const AppRadioGroup = ({
  value,
  onChange,
  options,
}: AppRadioGroupProps) => {
  return (
    <RadioGroup row value={value} onChange={onChange}>
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          control={<Radio />}
          label={option.label}
        />
      ))}
    </RadioGroup>
  );
};
