import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Body } from '@pagopa/io-core-ui';
import { PageHeader } from '../../components';

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
  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (opportunities.length === 0) {
    return (
      <Box>
        <PageHeader
          title="Opportunità in Europa"
          subtitle="Nessuna opportunità disponibile al momento."
        />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Opportunità in Europa"
        subtitle="Puoi accedere alle opportunità anche in questi Paesi, presentando la versione fisica della tua Carta Europea della Disabilità."
      />
      <Box sx={{ px: 2 }}>
        <List disablePadding>
          {opportunities.map((opportunity, index) => (
            <Box key={opportunity.country}>
              <ListItem disablePadding>
                <ListItemButton sx={{ py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <OpenInNewIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Body
                        onClick={() => handleExternalLink(opportunity.url)}
                        fontWeight="Semibold"
                        asLink
                      >
                        {opportunity.country}
                      </Body>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {index < opportunities.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Box>
    </Box>
  );
}
