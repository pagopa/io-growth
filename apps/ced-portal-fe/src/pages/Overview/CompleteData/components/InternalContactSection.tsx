import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { Paper, Stack, Typography } from '@mui/material';
import { memo } from 'react';
import { AppSelect, AppTextField } from '../../../../components';
import { CONTACT_TYPE_OPTIONS } from './constants';

interface InternalContactSectionProps {
  submitted: boolean;
  email: string;
  emailError: string;
  onEmailChange: (value: string) => void;
}

export const InternalContactSection = memo(
  ({
    submitted,
    email,
    emailError,
    onEmailChange,
  }: InternalContactSectionProps) => (
    <Paper sx={{ p: 3, width: '100%', borderRadius: 2 }}>
      <Stack spacing={2}>
        <Typography fontWeight={600} fontSize={22} sx={{ lineHeight: 1.25 }}>
          Informazioni ad uso interno
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Sarà utilizzata per inviarti comunicazioni di servizio. Non sarà
          visibile su IO.
        </Typography>

        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 2.5 }}
          >
            <ForumOutlinedIcon
              sx={{ color: 'common.decorativeIcon', fontSize: 20 }}
            />
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ lineHeight: 1.25 }}
            >
              Contatti interni
            </Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <AppSelect
              required
              disabled
              label="Tipo di contatto"
              options={CONTACT_TYPE_OPTIONS}
              value="email"
              sx={{
                minWidth: { sm: 190 },
                '& .MuiOutlinedInput-root': { borderRadius: '8px' },
              }}
            />
            <AppTextField
              required
              label="Inserisci contatto"
              type="email"
              value={email}
              error={submitted && Boolean(emailError)}
              helperText={submitted ? emailError : ''}
              onChange={(event) => onEmailChange(event.target.value)}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': { borderRadius: '8px' },
              }}
            />
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  ),
);

InternalContactSection.displayName = 'InternalContactSection';
