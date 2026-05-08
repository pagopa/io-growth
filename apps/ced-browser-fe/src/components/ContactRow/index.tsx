import { Box, ButtonBase, Typography } from '@mui/material';
import { ContactRowProps } from './types';

export function ContactRow({ icon, label, href }: ContactRowProps) {
  return (
    <ButtonBase
      component="a"
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      sx={{
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 1.5,
        px: 0,
        py: 2,
        color: 'primary.main',
      }}
    >
      <Box sx={{ display: 'flex', flexShrink: 0, color: 'text.secondary' }}>
        {icon}
      </Box>
      <Typography
        component="span"
        sx={{
          fontSize: 16,
          fontWeight: 600,
          color: '#0B3EE3',
          textDecoration: 'underline',
        }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );
}
