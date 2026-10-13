import { Box, Skeleton } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { EntityLogo } from '../EntityLogo';

type PageCoverProps = {
  coverUrl?: string;
  coverPlaceholder: string;
  logoUrl?: string;
  hasLogoError?: boolean;
  logoPlaceholder?: ReactNode;
  rounded?: boolean;
};

export function PageCover({
  coverUrl,
  coverPlaceholder,
  logoUrl,
  hasLogoError,
  logoPlaceholder,
  rounded = false,
}: PageCoverProps) {
  const [hasCoverError, setHasCoverError] = useState(false);
  const [isCoverLoaded, setIsCoverLoaded] = useState(false);

  const showCover = !!coverUrl && !hasCoverError;
  const coverSrc = showCover ? coverUrl : coverPlaceholder;
  const showLogo = !!logoUrl || !!logoPlaceholder;

  return (
    <Box
      sx={{
        position: 'relative',
        mx: rounded ? 0 : -3,
        mb: showLogo ? 6 : 3,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          borderRadius: rounded ? 2 : 0,
          overflow: 'hidden',
          aspectRatio: '16 / 9',
          bgcolor: 'common.neutralGray',
        }}
      >
        {!isCoverLoaded && (
          <Skeleton
            variant="rectangular"
            animation="wave"
            aria-hidden="true"
            sx={{ position: 'absolute', inset: 0, height: '100%' }}
          />
        )}
        <Box
          component="img"
          src={coverSrc}
          alt=""
          aria-hidden="true"
          onLoad={() => setIsCoverLoaded(true)}
          // falls back to the placeholder, which fires its own onLoad
          onError={() => setHasCoverError(true)}
          sx={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isCoverLoaded ? 1 : 0,
            transition: 'opacity 300ms ease-in',
          }}
        />
        {showCover && isCoverLoaded && (
          <Box
            aria-hidden="true"
            sx={({ palette }) => ({
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `linear-gradient(transparent, ${palette.common.neutralBlack})`,
              opacity: 0.4,
            })}
          />
        )}
      </Box>

      {showLogo && (
        <Box
          sx={{
            position: 'absolute',
            left: 24,
            bottom: -33,
            display: 'flex',
          }}
        >
          <EntityLogo
            logoUrl={logoUrl}
            hasError={hasLogoError}
            fallback={logoPlaceholder}
            size={66}
          />
        </Box>
      )}
    </Box>
  );
}
