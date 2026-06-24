import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { Paper, Stack, TextField, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { getAgreementCopy } from '../../../../constants';
import {
  selectActiveFormLanguage,
  selectUrl,
} from '../../../../features/opportunityCreation/selectors';
import { setField } from '../../../../features/opportunityCreation/opportunityCreationSlice';
import { isValidHttpsUrl } from '../../../../utils';

export function AgreementLinkSection({
  attempted,
}: Readonly<{ attempted: boolean }>) {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveFormLanguage);
  const benefitUrl = useAppSelector(selectUrl);
  const copy = getAgreementCopy(activeLanguage).additionalSections.link;

  const error = isValidHttpsUrl(benefitUrl);

  return (
    <Paper elevation={0} sx={{ borderRadius: 2.5, p: { xs: 2, md: 3 } }}>
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LinkRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography sx={{ fontWeight: 600 }}>{copy.title}</Typography>
        </Stack>

        <TextField
          disabled={activeLanguage !== 'it'}
          label={copy.benefitUrlLabel}
          helperText={
            attempted && error && 'Inserisci un URL valido (es. https://...)'
          }
          value={benefitUrl}
          error={attempted && error}
          onChange={(event) =>
            dispatch(
              setField({
                field: 'url',
                value: event.target.value,
              }),
            )
          }
          fullWidth
        />
      </Stack>
    </Paper>
  );
}
