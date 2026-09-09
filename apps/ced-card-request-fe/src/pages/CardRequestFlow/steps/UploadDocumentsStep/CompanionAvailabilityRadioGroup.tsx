import { Box } from '@mui/system';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import {
  makeSelectConfirmationField,
  setField,
} from '../../../../features/confirmation/reducer';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { Divider, FormHelperText } from '@mui/material';

const YES_NO_OPTIONS = [
  {
    label: 'Sì',
    value: 'yes',
    subtitle:
      "Dichiaro, sotto la mia responsabilità, di avere diritto all'accompagnatore.",
  },
  { label: 'No', value: 'no', subtitle: '' },
] as const;

type CompanionAvailabilityRadioGroupProps = {
  error?: boolean;
  helperText?: string;
};

export const CompanionAvailabilityRadioGroup = ({
  error,
  helperText,
}: CompanionAvailabilityRadioGroupProps) => {
  const dispatch = useAppDispatch();
  const selectedValue = useAppSelector(makeSelectConfirmationField)(
    'dirittoAccompagnatore',
  );
  return (
    <Box>
      {YES_NO_OPTIONS.map((option, index) => {
        const value =
          selectedValue === true
            ? 'yes'
            : selectedValue === false
              ? 'no'
              : null;
        const isChecked = !!value && value === option.value;

        return (
          <Box key={option.value}>
            {index > 0 && <Divider sx={{ my: 1.5 }} />}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1.5,
                cursor: 'pointer',
                width: '100%',
                userSelect: 'none',
              }}
              onClick={() => {
                dispatch(
                  setField({
                    field: 'dirittoAccompagnatore',
                    value: option.value === 'yes',
                  }),
                );
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  lineHeight: 1.2,
                  flex: 1,
                }}
              >
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

              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: isChecked ? '2px solid transparent' : '2px solid',
                  borderColor: isChecked ? 'transparent' : 'common.neutral600',
                  backgroundColor: isChecked ? 'common.primaryButton' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: '2px',
                  transition: 'all 0.2s ease',
                }}
              >
                {isChecked && (
                  <CheckRoundedIcon
                    sx={{
                      color: 'common.white',
                      fontSize: 14,
                      stroke: 'white',
                      strokeWidth: 1.5,
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
      {error && helperText && (
        <FormHelperText error sx={{ mt: 1.5 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};
