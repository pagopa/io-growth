import { Box } from '@mui/material';
import { AppTextField } from '../../../../components';
import {
  selectWebsiteForm,
  selectWebsiteUrlError,
  setWebsiteName,
  setWebsiteUrl,
  validateWebsiteUrl,
} from '../../../../features/website/websiteSlice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';

export function WebsiteFields() {
  const dispatch = useAppDispatch();
  const { name, url } = useAppSelector(selectWebsiteForm);
  const urlError = useAppSelector(selectWebsiteUrlError);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <AppTextField
        label="Nome"
        required
        value={name}
        onChange={(e) => dispatch(setWebsiteName(e.target.value))}
      />
      <AppTextField
        label="URL"
        required
        value={url}
        onChange={(e) => dispatch(setWebsiteUrl(e.target.value))}
        onBlur={() => dispatch(validateWebsiteUrl())}
        error={!!urlError}
        helperText={urlError || undefined}
      />
    </Box>
  );
}
