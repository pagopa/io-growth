import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import {
  Box,
  Divider,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
} from '@mui/material';
import {
  makeSelectConfirmationField,
  setField,
} from '../../../../features/confirmation/reducer';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { useEffect, useRef } from 'react';

const YES_NO_OPTIONS = [
  {
    label: 'Sì',
    value: 'yes',
    subtitle:
      "Dichiaro, sotto la mia responsabilità, di avere diritto all'accompagnatore.",
  },
  { label: 'No', value: 'no', subtitle: '' },
] as const;

const COMPANION_AVAILABILITY_ERROR_ID = 'companion-availability-error';

type CompanionAvailabilityRadioGroupProps = {
  error?: boolean;
  helperText?: string;
};

export const CompanionAvailabilityRadioGroup = ({
  error,
  helperText,
}: CompanionAvailabilityRadioGroupProps) => {
  const dispatch = useAppDispatch();
  const firstRadioRef = useRef<HTMLInputElement>(null);
  const selectedValue = useAppSelector(makeSelectConfirmationField)(
    'dirittoAccompagnatore',
  );
  const currentValue =
    selectedValue === true ? 'yes' : selectedValue === false ? 'no' : '';

  useEffect(() => {
    if (error) {
      firstRadioRef.current?.focus();
    }
  }, [error]);

  return (
    <Box>
      <RadioGroup
        aria-label="Hai diritto all'accompagnatore?"
        aria-describedby={error ? COMPANION_AVAILABILITY_ERROR_ID : undefined}
        aria-invalid={error || undefined}
        aria-required="true"
        name="dirittoAccompagnatore"
        value={currentValue}
        onChange={(_, value) => {
          dispatch(
            setField({
              field: 'dirittoAccompagnatore',
              value: value === 'yes',
            }),
          );
        }}
      >
        {YES_NO_OPTIONS.map((option, index) => (
          <Box key={option.value}>
            {index > 0 && <Divider sx={{ my: 1.5 }} />}
            <FormControlLabel
              value={option.value}
              control={
                <Radio
                  disableRipple
                  inputRef={index === 0 ? firstRadioRef : undefined}
                  icon={
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: 'common.neutral600',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  }
                  checkedIcon={
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        backgroundColor: 'common.primaryButton',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <CheckRoundedIcon
                        sx={{
                          color: 'common.white',
                          fontSize: 14,
                          stroke: 'white',
                          strokeWidth: 1.5,
                        }}
                      />
                    </Box>
                  }
                  sx={{
                    '& .MuiSvgIcon-root': { fontSize: 18 },
                    mr: 1.5,
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Box component="span" sx={{ fontSize: 20, fontWeight: 600 }}>
                    {option.label}
                  </Box>
                  {option.subtitle && (
                    <Box
                      component="span"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        color: 'common.neutral500',
                        fontSize: 16,
                        lineHeight: 1.4,
                      }}
                    >
                      {option.subtitle}
                    </Box>
                  )}
                </Box>
              }
              sx={{
                width: '100%',
                m: 0,
                alignItems: 'flex-start',
                '& .MuiFormControlLabel-label': { width: '100%' },
              }}
            />
          </Box>
        ))}
      </RadioGroup>
      {error && helperText && (
        <FormHelperText
          id={COMPANION_AVAILABILITY_ERROR_ID}
          error
          sx={{ mt: 1.5 }}
        >
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};
