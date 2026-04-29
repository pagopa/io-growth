import { Box } from '@mui/material';
import { AppTextField, FormField } from '../../../../components';
import {
  selectWebsiteForm,
  selectWebsiteUrlError,
  setWebsiteName,
  setWebsiteUrl,
  validateWebsiteUrl,
} from '../../../../features/website/websiteSlice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';
import { useCheckRequiredField } from '../hooks/useCheckRequiredField';

interface WebsiteFieldsProps {
  attempted?: boolean;
}

export function WebsiteFields({ attempted }: WebsiteFieldsProps) {
  const dispatch = useAppDispatch();
  const { name, url } = useAppSelector(selectWebsiteForm);
  const urlFormatError = useAppSelector(selectWebsiteUrlError);

  const nameField = useCheckRequiredField({
    value: name,
    required: true,
    attempted,
  });
  const urlRequired = useCheckRequiredField({
    value: url,
    required: true,
    attempted,
  });
  const urlField = {
    error: urlRequired.error || !!urlFormatError,
    helperText: urlRequired.helperText ?? urlFormatError ?? undefined,
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormField
        value={name ?? ''}
        label="Nome"
        required
        onChange={(e) => dispatch(setWebsiteName(e.target.value))}
        {...nameField}
      >
        <AppTextField />
      </FormField>
      <FormField
        value={url ?? ''}
        label="URL"
        required
        onChange={(e) => dispatch(setWebsiteUrl(e.target.value))}
        {...urlField}
      >
        <AppTextField onBlur={() => dispatch(validateWebsiteUrl())} />
      </FormField>
    </Box>
  );
}
