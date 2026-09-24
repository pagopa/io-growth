import { Avatar, Box, Skeleton } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';

const LOGO_SIZE = 66;

type PageCoverProps = {
  imageUrl?: string;
  placeholderUrl: string;
  logoUrl?: string;
  logoFallback?: ReactNode;
  rounded?: boolean;
};

// decorative: the page title already names what the cover shows
export function PageCover({
  imageUrl,
  placeholderUrl,
  logoUrl,
  logoFallback,
  rounded = false,
}: PageCoverProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasLogoError, setHasLogoError] = useState(false);

  const imageSrc = imageUrl && !hasImageError ? imageUrl : placeholderUrl;
  const showLogo = !!logoUrl && !hasLogoError;
  const hasLogoArea = showLogo || !!logoFallback;

  return (
    <Box
      sx={{
        position: 'relative',
        mx: rounded ? 0 : -3,
        mb: hasLogoArea ? `${LOGO_SIZE / 2 + 16}px` : 3,
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
        {!isImageLoaded && (
          <Skeleton
            variant="rectangular"
            animation="wave"
            aria-hidden="true"
            sx={{ position: 'absolute', inset: 0, height: '100%' }}
          />
        )}
        <Box
          component="img"
          src={imageSrc}
          alt=""
          aria-hidden="true"
          onLoad={() => setIsImageLoaded(true)}
          // falls back to the placeholder, which fires its own onLoad
          onError={() => setHasImageError(true)}
          sx={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isImageLoaded ? 1 : 0,
            transition: 'opacity 300ms ease-in',
          }}
        />
      </Box>

      {hasLogoArea && (
        <Box
          sx={{
            position: 'absolute',
            left: 24,
            bottom: -LOGO_SIZE / 2,
            display: 'flex',
          }}
        >
          {showLogo ? (
            <Avatar
              src={logoUrl}
              variant="rounded"
              slotProps={{
                img: {
                  alt: '',
                  'aria-hidden': true,
                  onError: () => setHasLogoError(true),
                },
              }}
              sx={{
                width: LOGO_SIZE,
                height: LOGO_SIZE,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                '& img': { objectFit: 'contain' },
              }}
            />
          ) : (
            logoFallback
          )}
        </Box>
      )}
    </Box>
  );
}
