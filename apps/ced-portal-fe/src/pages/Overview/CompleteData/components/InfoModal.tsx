import { Box, Button, Stack, Typography } from '@mui/material';
import { AppModal } from '../../../../components';
import { MODAL_CONTENT } from '../../constants';

interface InfoModalProps {
  open: boolean;
  type: 'logo' | 'cover' | null;
  onClose: () => void;
}

export const InfoModal = ({ open, type, onClose }: InfoModalProps) => {
  const content = type ? MODAL_CONTENT[type] : null;

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={content?.title || ''}
      description={content?.subtitle}
    >
      <Stack>
        {content && (
          <Stack>
            <Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {content.body}
              </Typography>
            </Stack>
            <Stack mb={3}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Indicazioni utili:
              </Typography>
              <Box
                component="ul"
                sx={{
                  m: 0,
                  pl: 3,
                  color: 'text.secondary',
                  listStyleType: 'disc',
                  listStylePosition: 'outside',
                }}
              >
                {content.details.map((detail, index) => (
                  <Typography
                    key={index}
                    component="li"
                    variant="body2"
                    color="text.secondary"
                  >
                    {detail}
                  </Typography>
                ))}
              </Box>
            </Stack>
          </Stack>
        )}
        <Button variant="contained" onClick={onClose} sx={{ width: '100%' }}>
          Ho capito
        </Button>
      </Stack>
    </AppModal>
  );
};
