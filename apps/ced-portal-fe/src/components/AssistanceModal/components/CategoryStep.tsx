import { Button, FormControl, FormHelperText, Stack } from '@mui/material';
import { type ChangeEvent, useId, useState } from 'react';
import { AppRadioGroup } from '../../RadioGroup';
import {
  ASSISTANCE_MODAL_COPY,
  ASSISTANCE_CATEGORY_OPTIONS,
  ASSISTANCE_CATEGORIES,
  type AssistanceCategory,
} from '../constants';

interface CategoryStepProps {
  labelledBy: string;
  category: AssistanceCategory | null;
  onCategoryChange: (category: AssistanceCategory) => void;
  onCancel: () => void;
  onContinue: (category: AssistanceCategory) => void;
}

export function CategoryStep({
  labelledBy,
  category,
  onCategoryChange,
  onCancel,
  onContinue,
}: Readonly<CategoryStepProps>) {
  const errorId = useId();
  const [showError, setShowError] = useState(false);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const isValidCategory = (
      ASSISTANCE_CATEGORIES as readonly string[]
    ).includes(value);

    if (isValidCategory) {
      onCategoryChange(value as AssistanceCategory);
      setShowError(false);
    }
  };

  return (
    <>
      <FormControl error={showError}>
        <AppRadioGroup
          row={false}
          name="assistance-category"
          aria-labelledby={labelledBy}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          value={category ?? ''}
          onChange={onChange}
          options={ASSISTANCE_CATEGORY_OPTIONS}
          sx={{
            gap: 3,
            flexWrap: 'nowrap',
            '& .MuiFormControlLabel-root': { alignItems: 'flex-start' },
            '& .MuiRadio-root': { mt: '-11px' },
          }}
        />
        {showError && (
          <FormHelperText id={errorId} role="alert" sx={{ mx: 0, mt: 2 }}>
            {ASSISTANCE_MODAL_COPY.category.selectionError}
          </FormHelperText>
        )}
      </FormControl>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="text" onClick={onCancel}>
          {ASSISTANCE_MODAL_COPY.category.cancel}
        </Button>
        <Button
          variant="contained"
          onClick={() =>
            category === null ? setShowError(true) : onContinue(category)
          }
        >
          {ASSISTANCE_MODAL_COPY.category.continue}
        </Button>
      </Stack>
    </>
  );
}
