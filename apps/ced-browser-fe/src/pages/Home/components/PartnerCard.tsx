import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Avatar,
} from '@mui/material';
import { PartnerCardProps } from './types';

export const PartnerCard = ({
  title,
  imageUrl,
  logoUrl,
  onClick,
  isInert = false,
}: PartnerCardProps) => {
  const cardContent = (
    <>
      <CardMedia
        component="img"
        height="115"
        image={imageUrl}
        alt=""
        aria-hidden="true"
        loading="eager"
        sx={{ borderRadius: '16px 16px 0 0' }}
      />

      <CardContent
        sx={{
          pt: 2,
          px: 3,
          pb: 2,
          position: 'relative',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            left: 24,
            p: 0.5,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Avatar
            src={logoUrl}
            variant="rounded"
            slotProps={{
              img: {
                loading: 'eager',
                decoding: 'async',
                alt: '',
                'aria-hidden': true,
              },
            }}
            sx={{
              width: 44,
              height: 44,
              bgcolor: 'white',
              '& img': { objectFit: 'contain' },
            }}
          />
        </Box>

        <Typography
          variant="body2"
          component="div"
          aria-hidden="true"
          sx={{
            fontWeight: '700',
            lineHeight: 1.3,
            color: 'text.primary',
            mt: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </>
  );

  return (
    <Card
      role="group"
      aria-label={title}
      tabIndex={!onClick && !isInert ? 0 : undefined}
      sx={(theme) => ({
        width: 210,
        height: 196,
        borderRadius: 4,
        overflow: 'visible',
        position: 'relative',
        border: '1px solid',
        borderColor: theme.palette.common.cardBorder,
        '&:focus-visible': {
          outline: 'none',
          boxShadow: `inset 0 0 0 1px ${theme.palette.common.focusRing}`,
        },
      })}
    >
      {onClick ? (
        <CardActionArea
          onClick={onClick}
          aria-label={title}
          tabIndex={isInert ? -1 : undefined}
          sx={(theme) => ({
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            borderRadius: 4,
            '&.Mui-focusVisible': {
              outline: 'none',
              boxShadow: `inset 0 0 0 1px ${theme.palette.common.focusRing}`,
            },
          })}
        >
          {cardContent}
        </CardActionArea>
      ) : (
        cardContent
      )}
    </Card>
  );
};
