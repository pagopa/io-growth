import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { Paper, Stack, TextField, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  selectActiveAgreementLanguage,
  selectActiveAgreementLanguageForm,
  setBenefitUrl,
} from '../../../features/agreementDetailCreation/agreementDetailCreationSlice';
import { getAgreementAdditionalSectionsCopy } from './agreementAdditionalSections.config';

export function AgreementLinkSection() {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);
  const { benefitUrl } = useAppSelector(selectActiveAgreementLanguageForm);
  const copy = getAgreementAdditionalSectionsCopy(activeLanguage).link;

  return (
    <Paper elevation={0} sx={{ borderRadius: 2.5, p: { xs: 2, md: 3 } }}>
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LinkRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography sx={{ fontWeight: 600 }}>{copy.title}</Typography>
        </Stack>

        <TextField
          label={copy.benefitUrlLabel}
          value={benefitUrl}
          onChange={(event) =>
            dispatch(
              setBenefitUrl({
                languageId: activeLanguage,
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
