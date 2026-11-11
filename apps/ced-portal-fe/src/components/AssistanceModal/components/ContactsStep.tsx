import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Box, Button, Stack, Typography } from '@mui/material';
import { CopyToClipboardButton } from '@pagopa/mui-italia';
import { useToast } from '../../../contexts';
import { ASSISTANCE_MODAL_COPY, PAGOPA_ASSISTANCE_EMAIL } from '../constants';

interface ContactsStepProps {
  onBack: () => void;
  onConfirm: () => void;
}

export function ContactsStep({
  onBack,
  onConfirm,
}: Readonly<ContactsStepProps>) {
  const { showToast } = useToast();

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={2}>
        <MailOutlineIcon sx={{ color: 'text.secondary' }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="p" variant="caption" color="text.secondary">
            {ASSISTANCE_MODAL_COPY.contacts.contactLabel}
          </Typography>
          <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
            {PAGOPA_ASSISTANCE_EMAIL}
          </Typography>
        </Box>
        <CopyToClipboardButton
          value={PAGOPA_ASSISTANCE_EMAIL}
          aria-label={ASSISTANCE_MODAL_COPY.contacts.copyAriaLabel}
          onClickCapture={() =>
            showToast(ASSISTANCE_MODAL_COPY.contacts.copiedToast, 'success')
          }
          sx={{ mx: 0, '& .MuiSvgIcon-root': { fontSize: 24 } }}
        />
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="text" onClick={onBack}>
          {ASSISTANCE_MODAL_COPY.contacts.back}
        </Button>
        <Button variant="contained" onClick={onConfirm}>
          {ASSISTANCE_MODAL_COPY.contacts.confirm}
        </Button>
      </Stack>
    </>
  );
}
