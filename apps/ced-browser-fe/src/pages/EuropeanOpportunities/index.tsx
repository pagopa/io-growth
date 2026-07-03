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
    url: 'https://eudisabilitycard.be/en',
  },
  {
    country: 'Finlandia',
    url: 'https://vammaiskortti.fi/en/frontpage/',
  },
  {
    country: 'Estonia',
    url: 'https://www.eesti.ee/eraisik/en/artikkel/disabled-people/determination-of-disability/disability-card',
  },
  {
    country: 'Cipro',
    url: 'https://www.eudisabilitycard.gov.cy/en/home',
  },
  {
    country: 'Malta',
    url: 'https://www.eudisabilitycard.org.mt/',
  },
  {
    country: 'Romania',
    url: 'http://www.dizab.eurocard.gov.ro/?lang=en',
  },
  {
    country: 'Slovenia',
    url: 'https://invalidska-kartica.si/en/',
  },
];

export default function EuropeanOpportunitiesPage() {
  // TODO: after backed implementation, handle loading and error states, and fetch the opportunities from the backend instead of using a static list.

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
