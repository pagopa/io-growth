import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';

interface EuropeanOpportunity {
  country: string;
  url: string;
}

const opportunities: EuropeanOpportunity[] = [
  {
    country: 'Belgio',
    url: 'https://google.com',
  },
  {
    country: 'Finlandia',
    url: 'https://google.com',
  },
  {
    country: 'Estonia',
    url: 'https://google.com',
  },
  {
    country: 'Cipro',
    url: 'https://google.com',
  },
  {
    country: 'Malta',
    url: 'https://google.com',
  },
  {
    country: 'Romania',
    url: 'https://google.com',
  },
  {
    country: 'Slovenia',
    url: 'https://google.com',
  },
];

export default function EuropeanOpportunitiesPage() {
  const navigate = useNavigate();

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (opportunities.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            cursor: 'pointer',
          }}
          onClick={() => navigate(-1)}
        >
          <ArrowBackIcon sx={{ mr: 1 }} />
          <Typography variant="body1">Indietro</Typography>
        </Box>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Opportunità in Europa
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Nessuna opportunità disponibile al momento.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', mb: 3, cursor: 'pointer' }}
        onClick={() => navigate(-1)}
      >
        <ArrowBackIcon sx={{ mr: 1 }} />
        <Typography variant="body1">Indietro</Typography>
      </Box>

      <Typography variant="h4" sx={{ mb: 2 }}>
        Opportunità in Europa
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Puoi accedere alle opportunità anche in questi Paesi, presentando la
        versione fisica della tua Carta Europea della Disabilità.
      </Typography>

      <List disablePadding>
        {opportunities.map((opportunity, index) => (
          <Box key={opportunity.country}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleExternalLink(opportunity.url)}
                sx={{ py: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <OpenInNewIcon color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      color="primary"
                      fontWeight="medium"
                    >
                      {opportunity.country}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
            {index < opportunities.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Box>
  );
}
