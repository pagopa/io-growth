import { Avatar, Skeleton } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';

type EntityLogoProps = {
  logoUrl?: string;
  hasError?: boolean;
  fallback: ReactNode;
  size?: number;
};

export function EntityLogo({
  logoUrl,
  hasError = false,
  fallback,
  size = 44,
}: EntityLogoProps) {
  const [hasLogoError, setHasLogoError] = useState(false);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);

  if (hasError || hasLogoError) {
    return <>{fallback}</>;
  }

  if (!logoUrl) {
    return (
      <Skeleton
        variant="rounded"
        animation="wave"
        aria-hidden="true"
        width={size}
        height={size}
        sx={{
          background: 'white',
        }}
      />
    );
  }

  return (
    <Avatar
      src={logoUrl}
      variant="rounded"
      slotProps={{
        img: {
          alt: '',
          'aria-hidden': true,
          onLoad: () => setIsLogoLoaded(true),
          onError: () => setHasLogoError(true),
        },
      }}
      sx={{
        width: size,
        height: size,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        background: 'white',
        '& img': {
          objectFit: 'contain',
          opacity: isLogoLoaded ? 1 : 0,
          transition: 'opacity 300ms ease-in',
        },
      }}
    />
  );
}
