import { Box } from '@mui/material';
import { MIButton } from '@pagopa/mui-italia';
import { ContactRowProps } from './types';

const isExternalLink = (href: string) => href.startsWith('http');

export function ContactRow({ icon, label, href }: ContactRowProps) {
  const externalLinkProps = isExternalLink(href)
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <MIButton
      variant="text"
      href={href}
      {...(externalLinkProps as { target?: string; rel?: string })}
      sx={{
        width: '100%',
        textAlign: 'left',
        justifyContent: 'flex-start',
        gap: 1.5,
        px: 3,
        py: 2,
        color: 'primary.main',
        fontWeight: 600,
      }}
    >
      <Box sx={{ display: 'flex', flexShrink: 0, color: 'text.secondary' }}>
        {icon}
      </Box>
      {label}
    </MIButton>
  );
}
