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
        width: '90%',
        borderRadius: 4,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'visible',
        position: 'relative',
      }}
    >
      <CardMedia
        component="img"
        height="160"
        image={imageUrl}
        alt={title}
        sx={{ borderRadius: '16px 16px 0 0' }}
      />

      <CardContent sx={{ pt: 4, px: 3, pb: 3, position: 'relative' }}>
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
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'white',
              '& img': { objectFit: 'contain', p: 1 },
            }}
          />
        </Box>

        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: '700',
            lineHeight: 1.2,
            color: 'text.primary',
            mt: 2,
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

// // --- ESEMPIO DI UTILIZZO ---
// export const PartnerCardExample = () => {
//   return (
//     <PartnerCard
//       title="Comune di Alessandria"
//       imageUrl="https://picsum.photos/id/1018/600/400" // Placeholder foto comune
//       logoUrl="https://upload.wikimedia.org/wikipedia/commons/d/d5/Alessandria-Stemma.png" // Placeholder stemma
//       onClick={() => console.log('Card cliccata')}
//     />
//   );
// };
