import {
  Card,
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
}: PartnerCardProps) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        width: 210,
        height: 196,
        borderRadius: 4,
        // boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'visible',
        position: 'relative',
        border: '1px solid #E8EBF1',
      }}
    >
      <CardMedia
        component="img"
        height="130"
        image={imageUrl}
        alt={title}
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
            imgProps={{ loading: 'eager', decoding: 'async' }}
            sx={{
              width: 44,
              height: 44,
              bgcolor: 'white',
              '& img': { objectFit: 'contain', p: 1 },
            }}
          />
        </Box>

        <Typography
          variant="body2"
          component="div"
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
    </Card>
  );
};
