import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Box, Button, Stack, Typography } from '@mui/material';
import { CopyToClipboardButton } from '@pagopa/mui-italia';
import { useToast } from '../../../contexts';
import { ASSISTANCE_MODAL_COPY, type AssistanceContact } from '../constants';

interface ContactsStepProps {
  contact: AssistanceContact;
  backLabel: string;
  onBack: () => void;
  onConfirm: () => void;
}

export function ContactsStep({
  contact,
  backLabel,
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
            {contact.label}
          </Typography>
          <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
            {contact.email}
          </Typography>
        </Box>
        <CopyToClipboardButton
          value={contact.email}
          aria-label="Copia indirizzo email"
          onClickCapture={() => showToast('Copiato!', 'success')}
          sx={{ mx: 0, '& .MuiSvgIcon-root': { fontSize: 24 } }}
        />
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="text" onClick={onBack}>
          {backLabel}
        </Button>
        <Button variant="contained" onClick={onConfirm}>
          {ASSISTANCE_MODAL_COPY.contacts.confirm}
        </Button>
      </Stack>
    </>
  );
}
